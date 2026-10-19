import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { clamp01, inOut, lerp } from './anim';
import { C, GEO, SC } from './cam';

// The 3D Everest fly-over: AWS Terrain Tiles (SRTM, open data) draped with EOX Sentinel-2 over a 40 × 32 km block round
// the summit. Scene units are km (x east, z south, y up); heights are exaggerated a little so the peaks read on a phone.
const H = GEO.ev3d;
const KM_W = (H.lonlat[1] - H.lonlat[0]) * 111.32 * Math.cos((28.0 * Math.PI) / 180);
const KM_H = (H.lonlat[3] - H.lonlat[2]) * 110.57;
export const VEXAG = 1.25;
let demPromise: Promise<number[]> | null = null;
const loadDem = () => (demPromise ??= fetch(staticFile('closestspace/maps/ev3d_dem.json')).then((r) => r.json()));

export const lonlatToScene = (lon: number, lat: number): [number, number] => [
  ((lon - H.lonlat[0]) / (H.lonlat[1] - H.lonlat[0]) - 0.5) * KM_W,
  ((H.lonlat[3] - lat) / (H.lonlat[3] - H.lonlat[2]) - 0.5) * KM_H,
];
const [EX, EZ] = lonlatToScene(86.925, 27.988);
export const EY = (H.max / 1000) * VEXAG;

export type Cam3 = { pos: [number, number, number]; look: [number, number, number]; fov: number };
type K = { t: number } & Cam3;
const keys = (): K[] => [
  // out of the lens: straight down onto the summit, then gliding south and tilting up toward the horizon
  { t: SC.ev3d[0], pos: [EX + 0.5, 34, EZ + 3], look: [EX, 0, EZ], fov: 56 },
  { t: C.n8849_2 + 0.5, pos: [EX - 2.5, 15, EZ + 12.5], look: [EX, EY - 1.2, EZ], fov: 50 },
  { t: C.chhat2 + 0.2, pos: [EX - 4.5, 12.2, EZ + 10.5], look: [EX, EY - 0.4, EZ - 1], fov: 46 },
  { t: SC.ev3d[1] - 0.45, pos: [EX - 3.5, 12.5, EZ + 8.5], look: [EX, EY - 0.6, EZ], fov: 46 },
  // the plunge: straight down onto the summit (the zoom blur takes it to the top-down map)
  { t: SC.ev3d[1], pos: [EX, EY + 2.2, EZ + 0.6], look: [EX, EY - 2, EZ], fov: 60 },
];
export const cam3At = (t: number): Cam3 => {
  const KK = keys();
  if (t <= KK[0].t) return KK[0];
  for (let i = 1; i < KK.length; i++) {
    if (t <= KK[i].t) {
      const a = KK[i - 1], b = KK[i];
      const q = inOut(clamp01((t - a.t) / (b.t - a.t)));
      const l = (u: number[], v: number[]) => u.map((x, k) => lerp(x, v[k], q)) as [number, number, number];
      return { pos: l(a.pos, b.pos), look: l(a.look, b.look), fov: lerp(a.fov, b.fov, q) };
    }
  }
  return KK[KK.length - 1];
};
/** Screen position of a 3D point for this camera (for labels drawn in HTML). */
export const toScreen3 = (cam: Cam3, p: [number, number, number]): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 2000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};
export const SUMMIT: [number, number, number] = [EX, EY, EZ];

const Terrain: React.FC<{ dem: number[]; tex: THREE.Texture }> = ({ dem, tex }) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(KM_W, KM_H, H.w - 1, H.h - 1);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, (dem[i] / 1000) * VEXAG);
    g.computeVertexNormals();
    return g;
  }, [dem]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
};
const CamRig: React.FC<{ cam: Cam3 }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov;
  camera.lookAt(...cam.look);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};
const SKY = 'linear-gradient(180deg, #2f6fc4 0%, #6fa6e6 30%, #c9def2 46%, #e6eef6 56%)';

export const Ev3D: React.FC<{ t: number }> = ({ t }) => {
  const cam = cam3At(t);
  const [dem, setDem] = useState<number[] | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('cs terrain'));
  useEffect(() => {
    Promise.all([
      loadDem(),
      new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile('closestspace/maps/ev3d_sat.jpg'), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; res(x); }, undefined, rej)),
    ]).then(([d, x]) => { setDem(d); setTex(x); }).catch(() => continueRender(handle));
  }, [handle]);
  useEffect(() => {
    if (dem && tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))));
  }, [dem, tex, handle]);
  if (!dem || !tex) return <div style={{ position: 'absolute', inset: 0, background: SKY }} />;
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: cam.fov, near: 0.1, far: 2000, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      style={{ background: SKY }} onCreated={({ camera }) => camera.lookAt(...cam.look)}>
      <CamRig cam={cam} />
      <fog attach="fog" args={['#d3e3f3', 22, 70]} />
      <hemisphereLight args={['#dfeeff', '#4a3a2a', 0.85]} />
      <directionalLight position={[-60, 45, 30]} intensity={2.3} />
      <Terrain dem={dem} tex={tex} />
    </ThreeCanvas>
  );
};
