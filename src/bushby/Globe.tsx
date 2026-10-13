import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { GEO } from './cam';

/** A point on the unit globe (three.js SphereGeometry UVs: u = 0 at 180°W). Unwrapped longitudes work as-is. */
const onSphere = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const b = (lat * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(phi) * Math.cos(b) * r);
};

const Rig: React.FC<{ lon: number; lat: number; dist: number }> = ({ lon, lat, dist }) => {
  const { camera } = useThree();
  camera.position.copy(onSphere(lon, lat, dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  return null;
};

/** The walk as a glowing tube on the globe: each leg follows the great circle between stage points. */
const useRouteCurve = () => useMemo(() => {
  const pts: THREE.Vector3[] = [];
  const ll = GEO.route_ll;
  for (let i = 0; i < ll.length - 1; i++) {
    const a = onSphere(ll[i][0], ll[i][1], 1.004), b = onSphere(ll[i + 1][0], ll[i + 1][1], 1.004);
    for (let k = 0; k < 16; k++) {
      const q = new THREE.Vector3().copy(a).lerp(b, k / 16).normalize().multiplyScalar(1.004);
      pts.push(q);
    }
  }
  const last = ll[ll.length - 1];
  pts.push(onSphere(last[0], last[1], 1.004));
  return new THREE.CatmullRomCurve3(pts);
}, []);

export const Globe: React.FC<{ lon: number; lat: number; dist: number; route?: number; pin?: [number, number] | null }> = ({ lon, lat, dist, route = 1, pin = null }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('bushby globe texture'));
  const curve = useRouteCurve();
  const core = useMemo(() => new THREE.TubeGeometry(curve, 1600, 0.0055, 8, false), [curve]);
  const glow = useMemo(() => new THREE.TubeGeometry(curve, 1600, 0.016, 8, false), [curve]);
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('bushby/maps/globe_equirect.jpg'), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t); }, undefined, () => continueRender(h));
  }, [h]);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
  }, [tex, h]);
  if (!tex) return null;
  const n = core.index ? core.index.count : 0;
  core.setDrawRange(0, Math.floor(n * route));
  glow.setDrawRange(0, Math.floor((glow.index ? glow.index.count : 0) * route));
  const light = onSphere(lon - 35, lat + 25, 6);
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, near: 0.01, far: 100, position: onSphere(lon, lat, dist).toArray() as [number, number, number] }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <Rig lon={lon} lat={lat} dist={dist} />
      <ambientLight intensity={0.6} />
      <directionalLight position={light.toArray() as [number, number, number]} intensity={2.0} />
      <mesh>
        <sphereGeometry args={[1, 128, 96]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={glow}>
        <meshBasicMaterial color="#FFD84A" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh geometry={core}>
        <meshBasicMaterial color="#FFE98A" />
      </mesh>
      {pin && (
        <mesh position={onSphere(pin[0], pin[1], 1.01).toArray() as [number, number, number]}>
          <sphereGeometry args={[0.018, 24, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[1.03, 96, 64]} />
        <meshBasicMaterial color="#7fb8ff" transparent opacity={0.13} side={THREE.BackSide} />
      </mesh>
    </ThreeCanvas>
  );
};
