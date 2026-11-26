import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { CC, GEO, L, LETTERS, threeCam } from './cam';

/**
 * The campus in 3D (metres; x east, y north, z up; origin at the ring's centre). The ground is the black-and-white
 * Sentinel-2 plate with OpenStreetMap roads (tools/tamilnadu/build_maps.py); the five letter buildings are extruded from
 * their OpenStreetMap footprints. Each building has a rise (0..1, its height) and a glow (0..1, grey -> gold).
 */
export type BState = Record<L, { rise: number; glow: number }>;
const HEIGHT = 22; // metres, slightly exaggerated so the rise reads from the air

const CamRig: React.FC<{ c: CC }> = ({ c }) => {
  const { camera } = useThree();
  const ref = threeCam(c);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = ref.fov; cam.near = ref.near; cam.far = ref.far; cam.aspect = ref.aspect;
  cam.position.copy(ref.position); cam.up.copy(ref.up); cam.quaternion.copy(ref.quaternion);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
};

const shapes = (parts: number[][][]) => parts.map((ring) => {
  const s = new THREE.Shape();
  ring.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  return s;
});

const Building: React.FC<{ k: L; rise: number; glow: number }> = ({ k, rise, glow }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shapes(GEO.letters[k].parts), { depth: 1, bevelEnabled: false }), [k]);
  const grey = new THREE.Color('#8d9096'), gold = new THREE.Color('#FFC23A');
  const col = grey.clone().lerp(gold, glow);
  const h = Math.max(0.15, rise * HEIGHT);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, h]} castShadow receiveShadow>
      <meshStandardMaterial color={col} emissive={gold} emissiveIntensity={glow * 0.85} roughness={0.75} metalness={0.05} />
    </mesh>
  );
};

let texP: Promise<THREE.Texture> | null = null;
export const Campus: React.FC<{ c: CC; b: BState; dark: number; width: number; height: number; ring: number }> = ({ c, b, dark, width, height, ring }) => {
  const [tx, setTx] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('tn campus'));
  useEffect(() => {
    texP ??= new THREE.TextureLoader().loadAsync(staticFile(`tamilnadu/maps/${GEO.campus.ground}`)).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
    texP.then(setTx);
  }, []);
  useEffect(() => { if (tx) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))); }, [tx, handle]);
  if (!tx) return <div style={{ width, height, background: '#0b0d10' }} />;
  const S = GEO.campus.half * 2;
  const k = 1 - dark * 0.75;
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, preserveDrawingBuffer: true }} shadows style={{ background: '#0b0d10' }}>
      <CamRig c={c} />
      <color attach="background" args={['#0b0d10']} />
      <hemisphereLight args={['#e8ecf2', '#20242a', 0.9]} />
      <directionalLight position={[-600, 900, 400]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-700} shadow-camera-right={700} shadow-camera-top={700} shadow-camera-bottom={-700} shadow-camera-near={10} shadow-camera-far={3000} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[S, S]} />
        <meshStandardMaterial map={tx} color={new THREE.Color(k, k, k)} roughness={1} metalness={0} />
      </mesh>
      {/* the ring's centre: where the library stands (not mapped in OSM, so a marker, not a building) */}
      {ring > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 0]}>
          <ringGeometry args={[34, 42, 64]} />
          <meshBasicMaterial color="#FFC23A" transparent opacity={ring} />
        </mesh>
      )}
      {LETTERS.map((L) => <Building key={L} k={L} rise={b[L].rise} glow={b[L].glow} />)}
    </ThreeCanvas>
  );
};
