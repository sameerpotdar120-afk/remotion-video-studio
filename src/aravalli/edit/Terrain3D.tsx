import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import meta from '../../../public/aravalli/3d/meta.json';

/**
 * The Aravalli in 3D (tools/build_aravalli_3d.py): AWS Terrain Tiles (SRTM; open data) heights under an EOX Sentinel-2
 * (CC BY 4.0) texture in the documentary "charcoal" look, the range itself in colour. Scene units are km (x east,
 * z south, y up); heights are exaggerated in the build (up to 25x on the range, 3x elsewhere).
 */
const M = meta as unknown as { box: [number, number, number, number]; bounds: [number, number, number, number]; grid: [number, number]; size_km: [number, number]; scale: number };
const R = 6378137;
const mx = (lon: number) => R * (lon * Math.PI) / 180;
const my = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
export type V3 = [number, number, number];

const cache: Record<string, Promise<Float32Array>> = {};
const loadBin = (n: string) => (cache[n] ??= fetch(staticFile(`aravalli/3d/${n}.bin`)).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b)));
const loadHeights = () => loadBin('height');

/** lon/lat → scene x, z (km). */
export const xz = (lon: number, lat: number): [number, number] => {
  const [b0, b1, b2, b3] = M.bounds;
  return [(mx(lon) - (b0 + b2) / 2) * M.scale, -(my(lat) - (b1 + b3) / 2) * M.scale];
};
/** Ground height (scene km) at lon/lat, bilinear. */
export const groundAt = (h: Float32Array, lon: number, lat: number) => {
  const [b0, b1, b2, b3] = M.bounds, [GW, GH] = M.grid;
  const fx = Math.min(GW - 1.001, Math.max(0, ((mx(lon) - b0) / (b2 - b0)) * (GW - 1)));
  const fy = Math.min(GH - 1.001, Math.max(0, ((b3 - my(lat)) / (b3 - b1)) * (GH - 1)));
  const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
  const g = (x: number, y: number) => h[y * GW + x];
  return (g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx) * (1 - ty) + (g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx) * ty;
};
/** A lon/lat/height(km above ground) point in scene coordinates. */
export const P3 = (h: Float32Array, lon: number, lat: number, up = 0): V3 => { const [x, z] = xz(lon, lat); return [x, groundAt(h, lon, lat) + up, z]; };

export const useHeights = () => {
  const [h, setH] = useState<Float32Array | null>(null);
  const [handle] = useState(() => delayRender('aravalli heights'));
  useEffect(() => { loadHeights().then((x) => { setH(x); continueRender(handle); }); }, [handle]);
  return h;
};

/** Screen position (px) of a scene point for the same camera the canvas uses. */
export const project = (cam: { pos: V3; look: V3; fov: number }, w: number, hgt: number, p: V3): [number, number, boolean] => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / hgt, 0.5, 6000);
  c.position.set(...cam.pos); c.lookAt(...cam.look); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * hgt, v.z < 1];
};

/** The ground: the flat charcoal map, the green highlight fading in over it (hl), and the range rising (rise 0..1). */
const Ground: React.FC<{ full: Float32Array; flat: Float32Array; bw: THREE.Texture; tex: THREE.Texture; rise: number; hl: number }> = ({ full, flat, bw, tex, rise, hl }) => {
  const geom = useMemo(() => {
    const [GW, GH] = M.grid, [W, H] = M.size_km;
    const g = new THREE.PlaneGeometry(W, H, GW - 1, GH - 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  // rebuild the heights only when the rise changes (a render tab draws many frames in a row)
  const last = useRef(-1);
  if (Math.abs(last.current - rise) > 1e-4) {
    const p = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, flat[i] + (full[i] - flat[i]) * rise);
    p.needsUpdate = true;
    geom.computeVertexNormals();
    last.current = rise;
  }
  return (
    <>
      <mesh geometry={geom}><meshStandardMaterial map={bw} roughness={0.92} metalness={0} /></mesh>
      {hl > 0.001 && <mesh geometry={geom} renderOrder={1}>
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} transparent opacity={hl} depthFunc={THREE.LessEqualDepth} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>}
    </>
  );
};

const CamRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree();
  camera.position.set(...pos);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.lookAt(...look);
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const FOG = '#16181b';
const loadTex = (n: string) => new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(`aravalli/3d/${n}.jpg`), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; res(t); }));
export const Aravalli3D: React.FC<{ h: Float32Array; pos: V3; look: V3; fov: number; width: number; height: number; rise?: number; hl?: number }> = ({ h, pos, look, fov, width, height, rise = 1, hl = 1 }) => {
  const dist = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  const [d, setD] = useState<{ flat: Float32Array; bw: THREE.Texture; tex: THREE.Texture } | null>(null);
  const [handle] = useState(() => delayRender('aravalli 3d'));
  useEffect(() => { Promise.all([loadBin('height_flat'), loadTex('tex_bw'), loadTex('tex')]).then(([flat, bw, tex]) => setD({ flat, bw, tex })); }, []);
  useEffect(() => { if (d) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)))); }, [d, handle]);
  if (!d) return <div style={{ width, height, background: FOG }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov, near: 0.5, far: 6000, position: pos }} gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: FOG }}>
      <CamRig pos={pos} look={look} fov={fov} />
      <fog attach="fog" args={[FOG, dist * 0.8, dist * 1.85]} />
      <hemisphereLight args={['#e8eef5', '#2a2622', 1.1]} />
      <directionalLight position={[-900, 520, -700]} intensity={2.4} color="#fff4e6" />
      <Ground full={h} flat={d.flat} bw={d.bw} tex={d.tex} rise={rise} hl={hl} />
    </ThreeCanvas>
  );
};
