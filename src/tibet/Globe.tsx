import React, { useEffect, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';

/** Camera on a unit globe looking at lon/lat from `dist` radii (three.js SphereGeometry UVs: u = 0 at 180°W). */
const camAt = (lon: number, lat: number, dist: number): [number, number, number] => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const b = (lat * Math.PI) / 180;
  return [-Math.cos(phi) * Math.cos(b) * dist, Math.sin(b) * dist, Math.sin(phi) * Math.cos(b) * dist];
};

const Rig: React.FC<{ lon: number; lat: number; dist: number }> = ({ lon, lat, dist }) => {
  const { camera } = useThree();
  camera.position.set(...camAt(lon, lat, dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  return null;
};

/** The opening: a real satellite globe (EOX Sentinel-2) spinning toward Tibet. */
export const Globe: React.FC<{ lon: number; lat: number; dist: number }> = ({ lon, lat, dist }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('globe texture'));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('tibet/maps/globe_equirect.jpg'), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t); }, undefined, () => continueRender(h));
  }, [h]);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
  }, [tex, h]);
  if (!tex) return null;
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.01, far: 100, position: camAt(lon, lat, dist) }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <Rig lon={lon} lat={lat} dist={dist} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[...camAt(lon - 35, lat + 25, 6)]} intensity={2.1} />
      {(
        <mesh>
          <sphereGeometry args={[1, 128, 96]} />
          <meshStandardMaterial map={tex} roughness={1} metalness={0} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[1.025, 96, 64]} />
        <meshBasicMaterial color="#7fb8ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </ThreeCanvas>
  );
};
