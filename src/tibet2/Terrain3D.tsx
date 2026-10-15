import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import raw from './geo.json';

type Hima = { w: number; h: number; lonlat: [number, number, number, number]; max: number };
const H = (raw as unknown as { hima: Hima }).hima;
// the terrain block in scene units: 1 unit ≈ 1 km east-west; heights exaggerated a little so the peaks read on a phone
const KM_W = (H.lonlat[1] - H.lonlat[0]) * 111.32 * Math.cos((28.1 * Math.PI) / 180);
const KM_H = (H.lonlat[3] - H.lonlat[2]) * 110.57;
export const VEXAG = 1.35;

let demPromise: Promise<number[]> | null = null;
const loadDem = () => (demPromise ??= fetch(staticFile('tibet2/maps/hima_dem.json')).then((r) => r.json()));

/** Everest's position in scene units (x east, z south, y up). */
export const lonlatToScene = (lon: number, lat: number): [number, number] => [
  ((lon - H.lonlat[0]) / (H.lonlat[1] - H.lonlat[0]) - 0.5) * KM_W,
  ((H.lonlat[3] - lat) / (H.lonlat[3] - H.lonlat[2]) - 0.5) * KM_H,
];

export type Cam3 = { pos: [number, number, number]; look: [number, number, number]; fov?: number };

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

/** Height of the ground (scene units) under a scene x/z, for placing pins and props. */
export const groundAt = (dem: number[], x: number, z: number) => {
  const u = Math.min(1, Math.max(0, x / KM_W + 0.5)), v = Math.min(1, Math.max(0, z / KM_H + 0.5));
  const i = Math.round(v * (H.h - 1)) * H.w + Math.round(u * (H.w - 1));
  return (dem[i] / 1000) * VEXAG;
};

export const Terrain3D: React.FC<{ cam: Cam3; width: number; height: number; haze?: number }> = ({ cam, width, height, haze = 1 }) => {
  const [dem, setDem] = useState<number[] | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('tibet2 terrain'));
  useEffect(() => {
    Promise.all([
      loadDem(),
      new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile('tibet2/maps/hima_sat.jpg'), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, rej)),
    ]).then(([d, t]) => { setDem(d); setTex(t); }).catch(() => continueRender(handle));
  }, [handle]);
  // the canvas is created only once the data is in, so its first draw already has the mountains; then give it a few frames
  useEffect(() => {
    if (dem && tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))));
  }, [dem, tex, handle]);
  if (!dem || !tex) return <div style={{ width, height, background: 'linear-gradient(180deg, #2f6fc4 0%, #6fa6e6 38%, #c9def2 52%, #e6eef6 60%)' }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov ?? 55, near: 0.1, far: 2000, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      style={{ background: 'linear-gradient(180deg, #2f6fc4 0%, #6fa6e6 38%, #c9def2 52%, #e6eef6 60%)' }}
      onCreated={({ camera }) => camera.lookAt(...cam.look)}>
      <CamRig cam={cam} />
      <fog attach="fog" args={['#d3e3f3', 70 * haze, 330 * haze]} />
      <hemisphereLight args={['#dfeeff', '#4a3a2a', 0.9]} />
      <directionalLight position={[-120, 90, -60]} intensity={2.2} />
      <Terrain dem={dem} tex={tex} />
    </ThreeCanvas>
  );
};

import { useThree } from '@react-three/fiber';
const CamRig: React.FC<{ cam: Cam3 }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 55;
  camera.lookAt(...cam.look);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};
