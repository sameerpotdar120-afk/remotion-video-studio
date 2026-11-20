import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';

/**
 * The spinning Earth for "Dharti zyada tez ghoomti hai": a sphere with the EOX world plate (reprojected to
 * equirectangular in tools/build_baikonur_maps.py), lit from the upper left, with three latitude rings drawn on it:
 * the equator (gold), Baikonur 46° N (red) and Plesetsk 63° N (white). `spin` is the rotation in radians.
 */
const ring = (lat: number, r: number) => {
  const pts: THREE.Vector3[] = [];
  const y = Math.sin((lat * Math.PI) / 180) * r, rr = Math.cos((lat * Math.PI) / 180) * r;
  for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr)); }
  return new THREE.BufferGeometry().setFromPoints(pts);
};
let texP: Promise<THREE.Texture> | null = null;
export const Globe: React.FC<{ spin: number; size: number; tilt?: number }> = ({ spin, size, tilt = 0.32 }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('bk globe'));
  useEffect(() => {
    texP ??= new Promise((res) => new THREE.TextureLoader().load(staticFile('baikonur/maps/globe_eq.jpg'), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }));
    texP.then((t) => { setTex(t); requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); });
  }, [h]);
  const rings = useMemo(() => [[0, '#FFC21A'], [45.9, '#FF3B3B'], [62.9, '#FFFFFF']].map(([lat, c]) => ({ g: ring(lat as number, 1.004), c: c as string })), []);
  if (!tex) return null;
  return (
    <ThreeCanvas width={size} height={size} camera={{ fov: 30, position: [0, 0, 4.1] }} gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={1.0} />
      <directionalLight position={[-3, 2, 3]} intensity={2.2} />
      <group rotation={[tilt, 0, 0]}>
        <group rotation={[0, spin, 0]}>
          <mesh><sphereGeometry args={[1, 128, 96]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.45} roughness={0.85} metalness={0} /></mesh>
          {rings.map((r, i) => <lineLoop key={i} geometry={r.g}><lineBasicMaterial color={r.c} linewidth={2} /></lineLoop>)}
        </group>
      </group>
      <mesh><sphereGeometry args={[1.035, 64, 48]} /><meshBasicMaterial color="#7FC4FF" transparent opacity={0.08} side={THREE.BackSide} /></mesh>
    </ThreeCanvas>
  );
};
