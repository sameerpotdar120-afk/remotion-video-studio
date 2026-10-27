import React, { useEffect, useState } from 'react';
import { useAudioOnly } from '../kit/audioMode';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { H, W } from '../../lib/constants';

/**
 * Sputnik 1 in real 3D: a polished 58 cm sphere with four swept-back antennas, orbiting a textured Earth
 * (the same baked satellite texture as the globe), lit by a hard "sun" so the metal glints every turn.
 */
export const SputnikOrbit: React.FC<{ start?: number }> = ({ start = 0 }) => {
  if (useAudioOnly()) return null;
  const frame = useCurrentFrame() - start;
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('sputnik earth'));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('russia/maps/world_eq_sat.jpg'), (t) => { t.colorSpace = THREE.SRGBColorSpace; setTex(t); continueRender(h); });
  }, [h]);
  const a = frame / 60 * 0.9;
  const orbitR = 1.55;
  const sx = Math.cos(a) * orbitR, sz = Math.sin(a) * orbitR * 0.55, sy = Math.sin(a) * 0.35;
  return (
    <ThreeCanvas width={W} height={H} camera={{ fov: 32, position: [0, 0.4, 5.2], near: 0.05, far: 100 }} style={{ background: '#02040A' }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-5, 2, 4]} intensity={2.6} />
      {tex && (
        <mesh rotation={[0.35, -1.2 + frame / 600, 0]}>
          <sphereGeometry args={[1, 128, 96]} />
          <meshStandardMaterial map={tex} roughness={0.85} />
        </mesh>
      )}
      <group position={[sx, sy, sz]} rotation={[0.3, -a * 2, 0.2]} scale={0.34}>
        <mesh>
          <sphereGeometry args={[0.5, 48, 32]} />
          <meshStandardMaterial color="#D8DCE2" metalness={1} roughness={0.18} />
        </mesh>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([u, v], i) => (
          <mesh key={i} position={[-0.9, u * 0.18, v * 0.18]} rotation={[0, 0, Math.PI / 2 + u * 0.12]}>
            <cylinderGeometry args={[0.012, 0.012, 1.9, 8]} />
            <meshStandardMaterial color="#C9CDD3" metalness={1} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </ThreeCanvas>
  );
};
