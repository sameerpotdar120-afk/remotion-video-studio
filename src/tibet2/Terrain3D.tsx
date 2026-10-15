import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import raw from './geo.json';

/** Two height fields, both from AWS Terrain Tiles (SRTM; open data) draped with EOX Sentinel-2 cloudless (CC BY 4.0):
 *  - 'hima':  a 2.2° × 1.6° box around Everest (about 30 m data, resampled to 1024 wide), for the low fly-over;
 *  - 'range': the whole Himalayan arc and the southern plateau, 78–97°E × 25.6–36°N (about 1 km data), for the wide shot.
 *  Scene units are kilometres; heights are exaggerated a little (more on the wide shot) so the peaks read on a phone. */
type Field = { w: number; h: number; lonlat: [number, number, number, number]; max: number };
const G = raw as unknown as { hima: Field; range: Field };
export type SetName = 'hima' | 'range';
export const VEX: Record<SetName, number> = { hima: 1.35, range: 4.5 };
const KM = (f: Field, lat: number) => ({
  w: (f.lonlat[1] - f.lonlat[0]) * 111.32 * Math.cos((lat * Math.PI) / 180),
  h: (f.lonlat[3] - f.lonlat[2]) * 110.57,
});
export const SIZE: Record<SetName, { w: number; h: number }> = { hima: KM(G.hima, 28.1), range: KM(G.range, 30.8) };
export const VEXAG = VEX.hima;

const dems: Partial<Record<SetName, Promise<number[]>>> = {};
const loadDem = (s: SetName) => (dems[s] ??= fetch(staticFile(`tibet2/maps/${s}_dem.json`)).then((r) => r.json()));

/** A lon/lat in a set's scene units (x east, z south). */
export const lonlatTo = (s: SetName, lon: number, lat: number): [number, number] => {
  const f = G[s], z = SIZE[s];
  return [((lon - f.lonlat[0]) / (f.lonlat[1] - f.lonlat[0]) - 0.5) * z.w, ((f.lonlat[3] - lat) / (f.lonlat[3] - f.lonlat[2]) - 0.5) * z.h];
};
export const lonlatToScene = (lon: number, lat: number) => lonlatTo('hima', lon, lat);

export type Cam3 = { pos: [number, number, number]; look: [number, number, number]; fov?: number };

const Terrain: React.FC<{ s: SetName; dem: number[]; tex: THREE.Texture }> = ({ s, dem, tex }) => {
  const geom = useMemo(() => {
    const f = G[s], z = SIZE[s];
    const g = new THREE.PlaneGeometry(z.w, z.h, f.w - 1, f.h - 1);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, (dem[i] / 1000) * VEX[s]);
    g.computeVertexNormals();
    return g;
  }, [s, dem]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
};

const SKY = 'linear-gradient(180deg, #2f6fc4 0%, #6fa6e6 38%, #c9def2 52%, #e6eef6 60%)';
/** The camera follows the props each frame (Remotion renders frame by frame). */
const CamRig: React.FC<{ cam: Cam3 }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 55;
  camera.lookAt(...cam.look);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const Terrain3D: React.FC<{ cam: Cam3; width: number; height: number; haze?: number; set?: SetName }> = ({ cam, width, height, haze = 1, set = 'hima' }) => {
  const [dem, setDem] = useState<number[] | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(`tibet2 terrain ${set}`));
  useEffect(() => {
    Promise.all([
      loadDem(set),
      new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile(`tibet2/maps/${set}_sat.jpg`), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, rej)),
    ]).then(([d, t]) => { setDem(d); setTex(t); }).catch(() => continueRender(handle));
  }, [handle, set]);
  // the canvas is created only once the data is in, so its first draw already has the mountains; then give it a few frames
  useEffect(() => {
    if (dem && tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))));
  }, [dem, tex, handle]);
  if (!dem || !tex) return <div style={{ width, height, background: SKY }} />;
  const far = set === 'range' ? 9000 : 2000;
  const fog: [number, number] = set === 'range' ? [700 * haze, 3600 * haze] : [70 * haze, 330 * haze];
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov ?? 55, near: 0.5, far, position: cam.pos }} gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      style={{ background: SKY }} onCreated={({ camera }) => camera.lookAt(...cam.look)}>
      <CamRig cam={cam} />
      <fog attach="fog" args={['#d3e3f3', fog[0], fog[1]]} />
      <hemisphereLight args={['#dfeeff', '#4a3a2a', 0.9]} />
      <directionalLight position={set === 'range' ? [-900, 700, -500] : [-120, 90, -60]} intensity={2.2} />
      <Terrain s={set} dem={dem} tex={tex} />
    </ThreeCanvas>
  );
};
