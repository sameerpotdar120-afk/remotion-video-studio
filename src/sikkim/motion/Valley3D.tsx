import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, random, staticFile } from 'remotion';
import * as THREE from 'three';
import raw from '../geo.json';

/** The Teesta valley from Sevoke up to Rangpo in 3D: AWS Terrain Tiles (SRTM; open data) as the height field, draped
 *  with EOX Sentinel-2 cloudless (CC BY 4.0), the reference's drone shots rebuilt from real terrain. Scene units are
 *  kilometres (x east, z south, y up); heights are exaggerated a little so the gorge reads on a phone.
 *  Props drive everything per frame: the camera, how much of the route is drawn, an x-ray that turns the hills
 *  translucent so the line shows running inside them (the line sits in the hillside beside the river, as the real one
 *  does, 86% in tunnels), a train along it, the station at Rangpo, rain, mist and a dusk grade. */
type Terrain = { ll: [number, number, number, number]; hmin: number; hmax: number; w_m: number; h_m: number; size: [number, number] };
const G = raw as unknown as { terrain: Terrain; route_ll: number[][]; stations: Record<string, number[]> };
const T = G.terrain;
export const VEX = 1.7;
const W = T.w_m / 1000, H = T.h_m / 1000;
export const ll3 = (lon: number, lat: number): [number, number] => [((lon - T.ll[0]) / (T.ll[2] - T.ll[0]) - 0.5) * W, ((T.ll[3] - lat) / (T.ll[3] - T.ll[1]) - 0.5) * H];
export type Cam3 = { pos: [number, number, number]; look: [number, number, number]; fov?: number };

let heights: Promise<Float32Array> | null = null;
const loadHeights = () => (heights ??= new Promise<Float32Array>((res, rej) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const out = new Float32Array(c.width * c.height);
    for (let i = 0; i < out.length; i++) out[i] = T.hmin + ((d[i * 4] * 256 + d[i * 4 + 1]) / 65535) * (T.hmax - T.hmin);
    res(out);
  };
  img.onerror = rej;
  img.src = staticFile('sikkim/maps/valley_hrg.png');
}));
/** Height (km, exaggerated) at a scene point, bilinear. */
const sampler = (h: Float32Array) => (x: number, z: number) => {
  const [nx, nz] = T.size;
  const u = Math.min(nx - 1.001, Math.max(0, (x / W + 0.5) * (nx - 1))), v = Math.min(nz - 1.001, Math.max(0, (z / H + 0.5) * (nz - 1)));
  const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
  const at = (a: number, b: number) => h[b * nx + a];
  const m = at(i, j) * (1 - fu) * (1 - fv) + at(i + 1, j) * fu * (1 - fv) + at(i, j + 1) * (1 - fu) * fv + at(i + 1, j + 1) * fu * fv;
  return (m / 1000) * VEX;
};

/** The route: the Teesta's line pushed 0.35 km into the west hillside, 70 m above the river bed. */
const useRoute = (h: Float32Array | null) => useMemo(() => {
  if (!h) return null;
  const hs = sampler(h);
  const pts = G.route_ll.map(([lon, lat]) => ll3(lon, lat));
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], tz = b[1] - a[1], n = Math.hypot(tx, tz) || 1;
    const x = pts[i][0] - (tz / n) * 0.35, z = pts[i][1] + (tx / n) * 0.35;
    out.push(new THREE.Vector3(x, hs(pts[i][0], pts[i][1]) + 0.07 * VEX, z));
  }
  return new THREE.CatmullRomCurve3(out, false, 'centripetal');
}, [h]);

const cloudTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d')!;
    for (let k = 0; k < 26; k++) {
      const cx = 128 + (random(`c${k}`) - 0.5) * 120, cy = 128 + (random(`d${k}`) - 0.5) * 60, r = 40 + random(`r${k}`) * 50;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.22)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 256);
    }
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

const Ground: React.FC<{ h: Float32Array; tex: THREE.Texture; xray: number }> = ({ h, tex, xray }) => {
  const geom = useMemo(() => {
    const [nx, nz] = T.size;
    const g = new THREE.PlaneGeometry(W, H, nx - 1, nz - 1);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, (h[i] / 1000) * VEX);
    g.computeVertexNormals();
    return g;
  }, [h]);
  return (
    <mesh geometry={geom} renderOrder={1}>
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} transparent={xray > 0.01} opacity={1 - 0.62 * xray} depthWrite={xray < 0.5} />
    </mesh>
  );
};

const Route: React.FC<{ curve: THREE.CatmullRomCurve3; draw: number; color: string; xray: number }> = ({ curve, draw, color, xray }) => {
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 800, 0.022, 8, false), [curve]);
  const glow = useMemo(() => new THREE.TubeGeometry(curve, 800, 0.07, 8, false), [curve]);
  const n = Math.round(tube.index!.count * Math.max(0, Math.min(1, draw)) / 6) * 6;
  tube.setDrawRange(0, n);
  glow.setDrawRange(0, n);
  return (
    <group renderOrder={2}>
      <mesh geometry={glow}><meshBasicMaterial color={color} transparent opacity={0.28 + 0.2 * xray} depthTest={xray < 0.5} depthWrite={false} /></mesh>
      <mesh geometry={tube}><meshBasicMaterial color="#ffffff" depthTest={xray < 0.5} /></mesh>
    </group>
  );
};

/** A small passenger train: a yellow locomotive and grey coaches, following the curve. */
const Train: React.FC<{ curve: THREE.CatmullRomCurve3; at: number; cars?: number }> = ({ curve, at, cars = 5 }) => {
  const len = curve.getLength();
  return (
    <group>
      {Array.from({ length: cars }, (_, i) => {
        const u = Math.max(0, Math.min(1, at - (i * 0.17) / len));
        const p = curve.getPointAt(u), t = curve.getTangentAt(u);
        const yaw = Math.atan2(t.x, t.z);
        return (
          <group key={i} position={[p.x, p.y + 0.05, p.z]} rotation={[0, yaw, 0]}>
            <mesh><boxGeometry args={[0.06, 0.06, 0.15]} /><meshBasicMaterial color={i === 0 ? '#ffc72e' : '#e9eef2'} /></mesh>
            <mesh position={[0, 0.031, 0]}><boxGeometry args={[0.062, 0.006, 0.14]} /><meshBasicMaterial color={i === 0 ? '#3a2a10' : '#2c6f8a'} /></mesh>
            {i === 0 && <pointLight position={[0, 0, 0.12]} intensity={0.6} distance={1.2} color="#fff3c4" />}
          </group>
        );
      })}
    </group>
  );
};

/** Rangpo station: a low building with a pagoda-style roof and two lit platforms. */
const Station: React.FC<{ at: THREE.Vector3; yaw: number; lights: number }> = ({ at, yaw, lights }) => (
  <group position={[at.x, at.y, at.z]} rotation={[0, yaw, 0]} scale={1.6}>
    <mesh position={[0.12, 0.03, 0]}><boxGeometry args={[0.1, 0.06, 0.3]} /><meshStandardMaterial color="#ece6da" /></mesh>
    <mesh position={[0.12, 0.08, 0]} rotation={[0, 0, 0]}><coneGeometry args={[0.13, 0.06, 4]} /><meshStandardMaterial color="#8c2f2a" /></mesh>
    {[-0.04, 0.04].map((x) => <mesh key={x} position={[x, 0.012, 0]}><boxGeometry args={[0.03, 0.01, 0.36]} /><meshStandardMaterial color="#9a9a9a" emissive="#ffcf7a" emissiveIntensity={lights * 0.9} /></mesh>)}
    <pointLight position={[0, 0.12, 0]} intensity={lights * 1.4} distance={1.5} color="#ffd38a" />
  </group>
);

const CamRig: React.FC<{ cam: Cam3 }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 50;
  camera.lookAt(...cam.look);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export type ValleyProps = {
  cam: Cam3; width: number; height: number; t: number;
  draw?: number; color?: string; xray?: number; train?: number | null; station?: number; rain?: number; mist?: number; dusk?: number;
};
export const Valley3D: React.FC<ValleyProps> = ({ cam, width, height, t, draw = 0, color = '#ff4fd8', xray = 0, train = null, station = 0, rain = 0, mist = 0.6, dusk = 0 }) => {
  const [h, setH] = useState<Float32Array | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('sikkim valley'));
  useEffect(() => {
    Promise.all([
      loadHeights(),
      new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile('sikkim/maps/valley_tex.jpg'), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; res(x); }, undefined, rej)),
    ]).then(([a, b]) => { setH(a); setTex(b); }).catch(() => continueRender(handle));
  }, [handle]);
  useEffect(() => {
    if (h && tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))));
  }, [h, tex, handle]);
  const curve = useRoute(h);
  const end = curve ? curve.getPointAt(1) : null;
  const yawEnd = curve ? (() => { const tt = curve.getTangentAt(1); return Math.atan2(tt.x, tt.z); })() : 0;
  const sky = `linear-gradient(180deg, ${dusk > 0.5 ? '#1c2440' : '#7e8ea0'} 0%, ${dusk > 0.5 ? '#c7704a' : '#c3ccd4'} 55%, #dfe3e6 100%)`;
  if (!h || !tex || !curve || !end) return <div style={{ width, height, background: sky }} />;
  const fogCol = new THREE.Color('#c9d1d8').lerp(new THREE.Color('#5a4a5e'), dusk);
  const sun = new THREE.Color('#ffffff').lerp(new THREE.Color('#ffb070'), dusk);
  // mist puffs drifting through the gorge, around the route
  const puffs = Array.from({ length: 34 }, (_, i) => {
    const u = random(`pu${i}`), p = curve.getPointAt(u);
    const drift = ((t * 0.08 + random(`pd${i}`)) % 1) - 0.5;
    return { x: p.x + (random(`px${i}`) - 0.5) * 6 + drift * 2, y: p.y + 0.3 + random(`py${i}`) * 1.4, z: p.z + (random(`pz${i}`) - 0.5) * 5, s: 2.5 + random(`ps${i}`) * 4 };
  });
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov ?? 50, near: 0.05, far: 200, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      style={{ background: sky }} onCreated={({ camera }) => camera.lookAt(...cam.look)}>
      <CamRig cam={cam} />
      <fog attach="fog" args={[fogCol, 6, 60 - 25 * mist]} />
      <hemisphereLight args={[new THREE.Color('#dfe8f2').lerp(new THREE.Color('#ffb48a'), dusk), '#3a3226', 0.85 - 0.35 * dusk]} />
      <directionalLight position={[-20, 18, -14]} intensity={2.0 - 1.1 * dusk} color={sun} />
      <Ground h={h} tex={tex} xray={xray} />
      {draw > 0 && <Route curve={curve} draw={draw} color={color} xray={xray} />}
      {train !== null && <Train curve={curve} at={train} />}
      {station > 0 && <Station at={end} yaw={yawEnd} lights={station} />}
      {mist > 0 && puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.s * 2.2, p.s, 1]}>
          <spriteMaterial map={cloudTex()} transparent opacity={0.55 * mist} depthWrite={false} color={fogCol} />
        </sprite>
      ))}
      {rain > 0 && Array.from({ length: 260 }, (_, i) => {
        const x = cam.look[0] + (random(`rx${i}`) - 0.5) * 14, z = cam.look[2] + (random(`rz${i}`) - 0.5) * 14;
        const y = 6 - ((t * 9 + random(`ry${i}`) * 6) % 6);
        return <mesh key={`r${i}`} position={[x, cam.look[1] + y, z]}><boxGeometry args={[0.006, 0.22, 0.006]} /><meshBasicMaterial color="#cfd9e4" transparent opacity={0.45 * rain} /></mesh>;
      })}
    </ThreeCanvas>
  );
};

/** Route points in scene space (for camera paths that follow the line). */
export const useRouteCurve = () => {
  const [h, setH] = useState<Float32Array | null>(null);
  useEffect(() => { loadHeights().then(setH); }, []);
  return useRoute(h);
};
export const routeLL = G.route_ll;
