import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { cancelRender, continueRender, delayRender, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import type { Feature, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import { C, T } from '../constants';
import { ease } from '../easing';
import { colonies, land, COLONY_IDS } from '../map/data';
import { region, type MapLook, type RasterRegion } from '../map/rasters';

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

/** Place a three.js camera exactly as the map camera sits at `frame`. */
const poseCamera = (camera: THREE.Camera, keys: Cam3DKey[], frame: number) => {
  const c = camAt(keys, frame);
  const [tx, ty] = toXY(c.lon, c.lat);
  const tilt = (c.tilt * Math.PI) / 180;
  const yaw = ((c.yaw ?? 0) * Math.PI) / 180;
  // orbit: start above the target, lean back by `tilt` toward the south, rotate by `yaw`
  const back = Math.sin(tilt) * c.dist;
  camera.position.set(tx + Math.sin(yaw) * back, ty - Math.cos(yaw) * back, Math.cos(tilt) * c.dist);
  camera.up.set(0, 0, 1);
  camera.lookAt(tx, ty, 0);
};

const CameraRig: React.FC<{ keys: Cam3DKey[] }> = ({ keys }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  poseCamera(camera, keys, frame);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const FOV3D = 32;
const probe = new THREE.PerspectiveCamera(FOV3D, 16 / 9, 0.1, 1000);
/**
 * lon/lat (+ height above the land in world units) → screen px for the SAME camera keys.
 * Lets 2D overlays (eyes, hearts, muskets, labels) sit exactly on the 3D colonies.
 */
export const screenOf3D = (keys: Cam3DKey[], frame: number, lon: number, lat: number, z: number, w: number, h: number): [number, number] => {
  probe.aspect = w / h;
  poseCamera(probe, keys, frame);
  probe.updateMatrixWorld();
  probe.updateProjectionMatrix();
  const [x, y] = toXY(lon, lat);
  const v = new THREE.Vector3(x, y, z).project(probe);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
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

/**
 * Map looks (docs/PROMPTS_REMOTION_MISSING.md R4). Colours are the reference's measured on-screen colours;
 * the land/sea texture is baked from real terrain by scripts/maps/bake_looks.py.
 */
// light levels calibrated by measuring renders against the reference (out/ k-means): screen values are
// gamma-encoded, so a 1.28× brighter result needs ≈1.7× light
const LOOKS: Record<MapLook, { colony: string; sea: string; haze: string; ambient: number; hemi: number; key: number }> = {
  // colony input '#467C9A' renders as the measured target C.lookParchColony (#49738A): the warm sky light greys it
  parchment: { colony: '#467C9A', sea: C.lookParchSea, haze: C.hazeParch, ambient: 1.05, hemi: 0.6, key: 2.1 },
  relief: { colony: '#467C9A', sea: C.lookParchSea, haze: C.hazeParch, ambient: 0.98, hemi: 0.6, key: 2.3 },
  flat: { colony: '#3A8CD0', sea: C.lookFlatSea, haze: C.hazeFlat, ambient: 1.1, hemi: 0.6, key: 1.95 },
};

/** Load a texture once. The caller holds the render until three.js has actually drawn with it. */
const useTexture = (src: string, color: boolean) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 8;
        setTex(t);
      },
      undefined,
      (e) => cancelRender(e),
    );
  }, [src, color]);
  return tex;
};

/** Real terrain: the look texture draped on a mesh displaced by the heightmap (same lon/lat grid as everything else). */
const Terrain: React.FC<{ area: RasterRegion; look: MapLook; relief: number }> = ({ area, look, relief }) => {
  const r = region(area);
  // hold the frame until the textured mesh has been rendered once — releasing on load alone let
  // Remotion capture the frame before React/three had drawn the terrain
  const [handle] = useState(() => delayRender(`terrain ${area} ${look}`));
  const released = useRef(false);
  const map = useTexture(r.look(look), true);
  const disp = useTexture(r.height, false);
  const { gl, scene, camera } = useThree();
  // Remotion drives three frame by frame, so nothing redraws on its own after the textures arrive:
  // once the textured mesh is committed to the scene, draw it explicitly, then release the frame.
  useEffect(() => {
    if (!map || !disp || released.current) return;
    released.current = true;
    gl.render(scene, camera);
    requestAnimationFrame(() => continueRender(handle));
  }, [map, disp, gl, scene, camera, handle]);
  const geom = useMemo(() => {
    const [x0, y0] = toXY(r.west, r.south);
    const [x1, y1] = toXY(r.east, r.north);
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0, 640, 430);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, 0);
    return g;
  }, [r.west, r.south, r.east, r.north]);
  if (!map || !disp) return null;
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial map={map} displacementMap={disp} displacementScale={relief} roughness={0.95} metalness={0} />
    </mesh>
  );
};

/** Distance haze, scaled to the current camera distance so it reads the same at every zoom. */
const Haze: React.FC<{ keys: Cam3DKey[]; color: string }> = ({ keys, color }) => {
  const frame = useCurrentFrame();
  const { dist } = camAt(keys, frame);
  return <fog attach="fog" args={[color, dist * 0.95, dist * 3.2]} />;
};

export const Map3D: React.FC<{
  camera: Cam3DKey[];
  riseStart?: number;
  height?: number; // extrude height of colonies in world units (0.35 ≈ subtle, 0.8 = bold)
  colonyColor?: string;
  landColor?: string;
  seaColor?: string;
  /** 'classic' = the original flat-colour slab (S01). Other looks drape real terrain. */
  look?: MapLook | 'classic';
  terrain?: RasterRegion;
  /** terrain displacement in world units at the highest point (1 unit = 1° of latitude) */
  relief?: number;
  width: number;
  heightPx: number;
}> = ({
  camera,
  riseStart = 20,
  height = 0.45,
  colonyColor,
  landColor = C.parchLand,
  seaColor,
  look = 'classic',
  terrain = 'na3d',
  relief = 0.22,
  width,
  heightPx,
}) => {
  const L = look === 'classic' ? null : LOOKS[look];
  const sea = seaColor ?? L?.sea ?? C.parchSea;
  const colony = colonyColor ?? L?.colony ?? C.colonyBlue;
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
      flat={L !== null} // no tone mapping on the new looks: the baked colours reach the screen as measured
      camera={{ fov: FOV3D, near: 0.1, far: 1000, position: [0, -20, 40] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ backgroundColor: sea }}
    >
      <CameraRig keys={camera} />
      {L && <Haze keys={camera} color={L.haze} />}
      <ambientLight intensity={L?.ambient ?? 0.55} />
      <hemisphereLight args={['#fff6e6', '#3d5a5c', L?.hemi ?? 0.35]} />
      <directionalLight
        position={[-25, 30, 45]}
        intensity={L?.key ?? 1.6}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
      />
      {L ? (
        <>
          {/* matte sea beyond the terrain raster (a glossy sea caused the hotspot over the Gulf) */}
          <mesh position={[0, 0, -0.03]} receiveShadow>
            <planeGeometry args={[400, 300]} />
            <meshStandardMaterial color={sea} roughness={1} metalness={0} />
          </mesh>
          <Terrain area={terrain} look={look as MapLook} relief={relief} />
        </>
      ) : (
        <>
          <mesh position={[0, 0, -0.02]} receiveShadow>
            <planeGeometry args={[400, 300]} />
            <meshStandardMaterial color={sea} roughness={0.35} metalness={0.1} />
          </mesh>
          <mesh geometry={landGeom} receiveShadow>
            <meshStandardMaterial color={landColor} roughness={0.9} />
          </mesh>
        </>
      )}
      <group position={[0, 0, 0.06]}>
        {ordered.map((f, i) => (
          <Colony key={f.properties?.id} feature={f} index={i} start={riseStart} height={height} color={colony} />
        ))}
      </group>
    </ThreeCanvas>
  );
};
