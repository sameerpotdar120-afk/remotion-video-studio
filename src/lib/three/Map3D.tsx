import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import type { Feature, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import { C, T } from '../constants';
import { ease } from '../easing';
import { colonies, land, COLONY_IDS } from '../map/data';

/**
 * REAL 3D map (Three.js inside Remotion). Same lon/lat data as the 2D map, so it lines up 1:1.
 * World units: 1 unit = 1 degree of latitude; longitude is scaled by cos(lat0) so shapes are not stretched.
 *
 *  - land: thin extruded slab (parchment colour), receives shadows
 *  - colonies: extruded blocks that RISE one by one (N→S stagger) with a spring overshoot,
 *    flash white → colony blue, cast soft shadows on the land
 *  - ocean: large plane, slightly glossy
 *  - camera: keyframes in lon/lat + distance + tilt + yaw, eased; never fully stops (drift)
 *
 * Render with:  --gl=angle   (GPU)   or   --gl=swangle   (CPU-only machines / cloud)
 */

export type Cam3DKey = {
  frame: number;
  lon: number;
  lat: number;
  dist: number; // distance from target in world units (≈ degrees). 40 = eastern NA, 8 = New England
  tilt: number; // degrees from straight-down (0 = top view, 55 = dramatic oblique)
  yaw?: number; // degrees around the vertical axis
};

const ORIGIN = { lon: -77, lat: 38 };
const KX = Math.cos((ORIGIN.lat * Math.PI) / 180);
const toXY = (lon: number, lat: number): [number, number] => [(lon - ORIGIN.lon) * KX, lat - ORIGIN.lat];

const ringToPath = (ring: Position[], path: THREE.Path) => {
  ring.forEach(([lon, lat], i) => {
    const [x, y] = toXY(lon, lat);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
};

const polygonsOf = (g: Geometry): Position[][][] =>
  g.type === 'Polygon' ? [(g as Polygon).coordinates] : g.type === 'MultiPolygon' ? (g as MultiPolygon).coordinates : [];

const shapesFrom = (g: Geometry, bbox?: [number, number, number, number]) => {
  const shapes: THREE.Shape[] = [];
  for (const poly of polygonsOf(g)) {
    const [lon0, lat0] = poly[0][0];
    if (bbox && (lon0 < bbox[0] - 30 || lon0 > bbox[2] + 30 || lat0 < bbox[1] - 20 || lat0 > bbox[3] + 20)) continue;
    const s = new THREE.Shape();
    ringToPath(poly[0], s);
    for (const hole of poly.slice(1)) {
      const h = new THREE.Path();
      ringToPath(hole, h);
      s.holes.push(h);
    }
    shapes.push(s);
  }
  return shapes;
};

const camAt = (keys: Cam3DKey[], frame: number) => {
  if (frame <= keys[0].frame) return { yaw: 0, ...keys[0] };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.frame) {
      const t = ease.inOut((frame - a.frame) / Math.max(1, b.frame - a.frame));
      const l = (x: number, y: number) => x + (y - x) * t;
      return {
        lon: l(a.lon, b.lon),
        lat: l(a.lat, b.lat),
        dist: Math.exp(l(Math.log(a.dist), Math.log(b.dist))),
        tilt: l(a.tilt, b.tilt),
        yaw: l(a.yaw ?? 0, b.yaw ?? 0),
      };
    }
  }
  const last = keys[keys.length - 1];
  const held = (frame - last.frame) / 60;
  return { yaw: 0, ...last, dist: last.dist / (1 + T.driftPerSec * held) }; // the camera never stops
};

const CameraRig: React.FC<{ keys: Cam3DKey[] }> = ({ keys }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const c = camAt(keys, frame);
  const [tx, ty] = toXY(c.lon, c.lat);
  const tilt = (c.tilt * Math.PI) / 180;
  const yaw = ((c.yaw ?? 0) * Math.PI) / 180;
  // orbit: start above the target, lean back by `tilt` toward the south, rotate by `yaw`
  const back = Math.sin(tilt) * c.dist;
  camera.position.set(tx + Math.sin(yaw) * back, ty - Math.cos(yaw) * back, Math.cos(tilt) * c.dist);
  camera.up.set(0, 0, 1);
  camera.lookAt(tx, ty, 0);
  camera.updateProjectionMatrix();
  return null;
};

const Colony: React.FC<{ feature: Feature<Geometry>; index: number; start: number; height: number; color: string }> = ({
  feature,
  index,
  start,
  height,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shapesFrom(feature.geometry), {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 1,
    });
    return g;
  }, [feature]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 40), [geom]);
  const s = start + index * T.fillPerState;
  const rise = spring({ frame: frame - s, fps, config: { damping: 10, stiffness: 160, mass: 0.7 } }); // overshoot
  const flash = Math.min(1, Math.max(0, (frame - s - 6) / (T.fillPerState * 1.4)));
  // ±4% lightness per colony so neighbours read as separate states (like the reference's borders)
  const tint = new THREE.Color(color).offsetHSL(0, 0, (index % 3) * 0.04 - 0.04);
  const col = new THREE.Color('#F2F7FF').lerp(tint, flash);
  if (frame < s) return null;
  return (
    <mesh geometry={geom} scale={[1, 1, Math.max(0.001, rise * height)]} castShadow receiveShadow>
      <meshStandardMaterial color={col} roughness={0.55} metalness={0.05} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.75} />
      </lineSegments>
    </mesh>
  );
};

export const Map3D: React.FC<{
  camera: Cam3DKey[];
  riseStart?: number;
  height?: number; // extrude height of colonies in world units (0.35 ≈ subtle, 0.8 = bold)
  colonyColor?: string;
  landColor?: string;
  seaColor?: string;
  width: number;
  heightPx: number;
}> = ({
  camera,
  riseStart = 20,
  height = 0.45,
  colonyColor = C.colonyBlue,
  landColor = C.parchLand,
  seaColor = C.parchSea,
  width,
  heightPx,
}) => {
  const landGeom = useMemo(() => {
    const feats = (land.features as Feature<Geometry>[]).flatMap((f) => shapesFrom(f.geometry, [-100, 20, -55, 55]));
    return new THREE.ExtrudeGeometry(feats, { depth: 0.06, bevelEnabled: false, curveSegments: 1 });
  }, []);
  const ordered = useMemo(
    () => COLONY_IDS.map((id) => colonies.features.find((f) => f.properties?.id === id) as Feature<Geometry>),
    [],
  );
  return (
    <ThreeCanvas
      width={width}
      height={heightPx}
      shadows
      camera={{ fov: 32, near: 0.1, far: 1000, position: [0, -20, 40] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ backgroundColor: seaColor }}
    >
      <CameraRig keys={camera} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#fff6e6', '#3d5a5c', 0.35]} />
      <directionalLight
        position={[-25, 30, 45]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
      />
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <planeGeometry args={[400, 300]} />
        <meshStandardMaterial color={seaColor} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh geometry={landGeom} receiveShadow>
        <meshStandardMaterial color={landColor} roughness={0.9} />
      </mesh>
      <group position={[0, 0, 0.06]}>
        {ordered.map((f, i) => (
          <Colony key={f.properties?.id} feature={f} index={i} start={riseStart} height={height} color={colonyColor} />
        ))}
      </group>
    </ThreeCanvas>
  );
};
