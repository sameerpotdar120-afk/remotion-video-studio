import React, { createContext, useContext, useLayoutEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { CAST, drawChar, drawFx, type Look, type Pose } from './chars';
import { HORSES, drawHorse, type HorsePose } from './horse';
import { PAL, brickTex, earthTex, plankTex, rep, roofTex, sandTex } from './tex';

/* ───────────── camera ───────────── */
export type CamKey = [frame: number, pos: [number, number, number], target: [number, number, number], fov?: number];
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const camAt = (keys: CamKey[], f: number, e: (t: number) => number = easeIO) => {
  let i = 0;
  while (i < keys.length - 1 && f > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const t = b[0] === a[0] ? 0 : e(Math.max(0, Math.min(1, (f - a[0]) / (b[0] - a[0]))));
  const L = (u: number[], v: number[]) => u.map((x, k) => x + (v[k] - x) * t) as [number, number, number];
  return { pos: L(a[1], b[1]), target: L(a[2], b[2]), fov: (a[3] ?? 32) + ((b[3] ?? 32) - (a[3] ?? 32)) * t };
};
type CamState = ReturnType<typeof camAt>;
const CamCtx = createContext<CamState>({ pos: [0, 1.6, 10], target: [0, 1.2, 0], fov: 32 });
export const useCam = () => useContext(CamCtx);

const CameraRig: React.FC = () => {
  const c = useCam();
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...c.pos); cam.fov = c.fov; cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
};

/* ───────────── stage: canvas, sky, light ───────────── */
export type Light = { sun: [number, number, number]; sunColor?: string; sunI?: number; hemiSky?: string; hemiGround?: string; hemiI?: number; ambient?: number; sky: [string, string]; fog?: string; fogNear?: number; fogFar?: number };
export const DAY: Light = { sun: [-18, 15, 12], sunColor: '#fff0d8', sunI: 2.6, hemiSky: '#e6f0ff', hemiGround: '#d9c49a', hemiI: 1.05, sky: ['#8fc0e4', '#eaf3f4'], fog: '#e9eee8', fogNear: 40, fogFar: 140 };
export const DUSK: Light = { sun: [-22, 8, 10], sunColor: '#ffb98a', sunI: 1.6, hemiSky: '#f6c9b4', hemiGround: '#a88a74', hemiI: 1.0, sky: ['#d9a7a8', '#f4d7b8'], fog: '#efcdb6', fogNear: 40, fogFar: 140 };
export const NIGHT: Light = { sun: [10, 20, 12], sunColor: '#9fb4e8', sunI: 0.55, hemiSky: '#4b5d93', hemiGround: '#2c2f45', hemiI: 0.75, sky: ['#0d1430', '#2b3a66'], fog: '#28345a', fogNear: 30, fogFar: 120 };
export const SUNSET: Light = { sun: [-20, 9, -8], sunColor: '#ffb070', sunI: 2.3, hemiSky: '#ffc49a', hemiGround: '#a7604a', hemiI: 1.05, sky: ['#c4655a', '#f6b47a'], fog: '#f0a77c', fogNear: 35, fogFar: 130 };
export const OVERCAST: Light = { sun: [-8, 20, 14], sunColor: '#ffffff', sunI: 1.5, hemiSky: '#f0f4f8', hemiGround: '#b9bcc0', hemiI: 1.45, sky: ['#d8e3ec', '#f4f6f8'], fog: '#eef1f4', fogNear: 30, fogFar: 120 };
const lc = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
/** Blend two lighting setups (sky, sun, fill) - drives the day/night time-lapses and the dissolves between grades. */
export const lerpLight = (A: Light, B: Light, t: number): Light => ({
  sun: A.sun.map((v, i) => v + (B.sun[i] - v) * t) as [number, number, number], sunColor: lc(A.sunColor ?? '#ffffff', B.sunColor ?? '#ffffff', t), sunI: (A.sunI ?? 2) + ((B.sunI ?? 2) - (A.sunI ?? 2)) * t,
  hemiSky: lc(A.hemiSky ?? '#ffffff', B.hemiSky ?? '#ffffff', t), hemiGround: lc(A.hemiGround ?? '#c8b48a', B.hemiGround ?? '#c8b48a', t), hemiI: (A.hemiI ?? 1.2) + ((B.hemiI ?? 1.2) - (A.hemiI ?? 1.2)) * t,
  sky: [lc(A.sky[0], B.sky[0], t), lc(A.sky[1], B.sky[1], t)], fog: lc(A.fog ?? '#ffffff', B.fog ?? '#ffffff', t), fogNear: A.fogNear, fogFar: A.fogFar,
});

const SkyBg: React.FC<{ sky: [string, string] }> = ({ sky }) => {
  const { scene } = useThree();
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 512; const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [sky[0], sky[1]]);
  scene.background = tex;
  return null;
};

export const Stage: React.FC<{ cam: CamState; light?: Light; children: React.ReactNode; shadowSize?: number }> = ({ cam, light = DAY, children, shadowSize = 2048 }) => {
  const { width, height } = useVideoConfig();
  const L = light;
  return (
    <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ fov: cam.fov, near: 0.1, far: 500, position: cam.pos }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <CamCtx.Provider value={cam}>
        <CameraRig />
        <SkyBg sky={L.sky} />
        {L.fog && <fog attach="fog" args={[L.fog, L.fogNear ?? 40, L.fogFar ?? 140]} />}
        <hemisphereLight args={[L.hemiSky ?? '#ffffff', L.hemiGround ?? '#c8b48a', L.hemiI ?? 1.2]} />
        {L.ambient ? <ambientLight intensity={L.ambient} /> : null}
        <directionalLight position={[cam.target[0] + L.sun[0], L.sun[1], cam.target[2] + L.sun[2]]} target-position={[cam.target[0], 0, cam.target[2]]} color={L.sunColor ?? '#ffffff'} intensity={L.sunI ?? 2}
          castShadow shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0006} shadow-normalBias={0.02} shadow-radius={5}
          shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={1} shadow-camera-far={90} />
        {children}
      </CamCtx.Provider>
    </ThreeCanvas>
  );
};

/* ───────────── materials ───────────── */
const lam = (o: THREE.MeshLambertMaterialParameters) => new THREE.MeshLambertMaterial(o);
const matCache = new Map<string, THREE.Material>();
const M = (key: string, mk: () => THREE.Material) => { let m = matCache.get(key); if (!m) { m = mk(); matCache.set(key, m); } return m; };
export const mats = {
  ink: () => M('ink', () => new THREE.MeshBasicMaterial({ color: PAL.ink })),
  post: () => M('post', () => lam({ color: PAL.post })),
  wood: () => M('wood', () => lam({ color: PAL.wood })),
  woodLight: () => M('woodL', () => lam({ color: PAL.woodLight })),
  roofEdge: () => M('roofE', () => lam({ color: PAL.roofDark })),
  leaf: () => M('leaf', () => lam({ color: PAL.leaf })),
  trunk: () => M('trunk', () => lam({ color: '#7a5030' })),
  hay: () => M('hay', () => lam({ color: '#e9cf86' })),
  red: () => M('red', () => lam({ color: '#c8352d', side: THREE.DoubleSide })),
};

/* ───────────── ground, path, backdrop ───────────── */
export const Ground: React.FC<{ tint?: string; size?: number; tiles?: number }> = ({ tint, size = 260, tiles = 52 }) => {
  const map = useMemo(() => rep(sandTex(tint), tiles, tiles), [tint, tiles]);
  return <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[size, size]} /><meshLambertMaterial map={map} /></mesh>;
};

/** A packed-earth path: a ribbon following points on the ground, lighter with two cart tracks. */
export const Path: React.FC<{ pts: [number, number][]; width?: number; tint?: string }> = ({ pts, width = 3.2, tint = '#f0dfb7' }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const N = 120, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const len = curve.getLength();
    for (let i = 0; i <= N; i++) {
      const p = curve.getPoint(i / N), tg = curve.getTangent(i / N); const nx = -tg.z, nz = tg.x;
      for (const s of [-1, 1]) { pos.push(p.x + nx * s * width / 2, 0.012, p.z + nz * s * width / 2); uv.push((s + 1) / 2, (i / N) * len / 4); }
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }, [JSON.stringify(pts), width]);
  const map = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, 'rgba(240,223,183,0)'); gr.addColorStop(0.18, tint); gr.addColorStop(0.82, tint); gr.addColorStop(1, 'rgba(240,223,183,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(150,115,70,0.38)'; g.lineWidth = 3;
    for (const x0 of [92, 164]) { g.beginPath(); for (let y = 0; y <= 512; y += 8) g.lineTo(x0 + Math.sin(y * 0.02) * 3, y); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; return t;
  }, [tint]);
  return <mesh geometry={geo} receiveShadow><meshLambertMaterial map={map} transparent depthWrite={false} /></mesh>;
};

/** Distant dunes: a painted cylinder band around the set (layers of hills with dark ridge strokes). */
export const Backdrop: React.FC<{ radius?: number; height?: number; y?: number; colors?: [string, string, string]; band?: string; seed?: number }> = ({ radius = 110, height = 30, y = -2, colors = [PAL.hillFar, '#d8b88a', PAL.hill], band = PAL.hillBand, seed = 1 }) => {
  const map = useMemo(() => {
    const W = 4096, H = 512; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
    g.clearRect(0, 0, W, H);
    const layer = (base: number, amp: number, col: string, k: number, line: boolean) => {
      g.beginPath(); g.moveTo(0, H);
      const pts: [number, number][] = [];
      for (let x = 0; x <= W; x += 16) { const y = base - amp * (0.55 * Math.sin((x / W) * Math.PI * 2 * (3 + k) + seed + k) + 0.45 * Math.sin((x / W) * Math.PI * 2 * (7 + k * 2) + seed * 2)); pts.push([x, y]); g.lineTo(x, y); }
      g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill();
      if (line) { g.beginPath(); pts.forEach(([x, yy], i) => (i ? g.lineTo(x, yy + 6) : g.moveTo(x, yy + 6))); g.strokeStyle = band; g.lineWidth = 9; g.stroke(); }
    };
    layer(H * 0.42, 40, colors[0], 0, true);
    layer(H * 0.58, 46, colors[1], 1, true);
    layer(H * 0.74, 30, colors[2], 2, false);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
  }, [colors.join(), band, seed]);
  return (
    <mesh position={[0, y + height / 2, 0]}>
      <cylinderGeometry args={[radius, radius, height, 96, 1, true]} />
      <meshBasicMaterial map={map} transparent side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
};

/* ───────────── buildings ───────────── */
type V3 = [number, number, number];
const Box: React.FC<{ s: V3; p: V3; m: THREE.Material | THREE.Material[]; r?: V3; shadow?: boolean }> = ({ s, p, m, r = [0, 0, 0], shadow = true }) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow><boxGeometry args={s} /></mesh>
);

/** Gable roof of clay tiles: two sloped slabs, a ridge and dark eave edges. Ridge along x. */
export const Roof: React.FC<{ w: number; d: number; y: number; pitch?: number; over?: number; p?: V3; ry?: number; single?: boolean }> = ({ w, d, y, pitch = 0.42, over = 0.5, p = [0, 0, 0], ry = 0, single }) => {
  const tex = useMemo(() => rep(roofTex(), Math.max(1, Math.round(w / 2)), 1.6), [w]);
  const mat = useMemo(() => lam({ map: tex }), [tex]);
  const half = single ? d + over * 2 : d / 2 + over, slope = half / Math.cos(pitch), rise = Math.sin(pitch) * slope;
  const W = w + over * 2;
  return (
    <group position={[p[0], p[1] + y, p[2]]} rotation-y={ry}>
      {single ? (
        <Box s={[W, 0.16, slope]} p={[0, rise / 2, 0]} r={[pitch, 0, 0]} m={[mats.roofEdge(), mats.roofEdge(), mat, mats.roofEdge(), mats.roofEdge(), mats.roofEdge()]} />
      ) : (
        <>
          <Box s={[W, 0.16, slope]} p={[0, rise / 2, half / 2]} r={[pitch, 0, 0]} m={[mats.roofEdge(), mats.roofEdge(), mat, mats.roofEdge(), mats.roofEdge(), mats.roofEdge()]} />
          <Box s={[W, 0.16, slope]} p={[0, rise / 2, -half / 2]} r={[-pitch, 0, 0]} m={[mats.roofEdge(), mats.roofEdge(), mat, mats.roofEdge(), mats.roofEdge(), mats.roofEdge()]} />
          <Box s={[W + 0.2, 0.26, 0.3]} p={[0, rise + 0.06, 0]} m={mats.roofEdge()} />
          {[-1, 1].map((s) => <Box key={s} s={[0.5, 0.2, 0.24]} p={[s * (W / 2 + 0.05), rise + 0.2, 0]} r={[0, 0, s * 0.5]} m={mats.roofEdge()} />)}
        </>
      )}
    </group>
  );
};

/** Rammed-earth house with timber posts, plank door, dark lattice window and a tiled gable roof. Front faces +z. */
export const House: React.FC<{ p: V3; w?: number; d?: number; h?: number; ry?: number; door?: number | null; win?: number | null; roofY?: number }> = ({ p, w = 6, d = 4, h = 2.8, ry = 0, door = 0, win = 1.7, roofY }) => {
  const wallTex = useMemo(() => rep(earthTex(), w / 2.5, h / 2.5), [w, h]);
  const sideTex = useMemo(() => rep(earthTex(), d / 2.5, h / 2.5), [d, h]);
  const wm = useMemo(() => lam({ map: wallTex }), [wallTex]);
  const sm = useMemo(() => lam({ map: sideTex }), [sideTex]);
  const doorTex = useMemo(() => plankTex('#a8643a'), []);  // door boards
  return (
    <group position={p} rotation-y={ry}>
      <Box s={[w, h, d]} p={[0, h / 2, 0]} m={[sm, sm, wm, wm, wm, wm]} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} s={[0.24, h + 0.05, 0.24]} p={[sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02)]} m={mats.post()} />))}
      <Box s={[w + 0.1, 0.2, 0.2]} p={[0, h - 0.1, d / 2 + 0.04]} m={mats.post()} />
      {door !== null && (
        <group position={[door ?? 0, 0, d / 2 + 0.03]}>
          <Box s={[1.15, 1.9, 0.06]} p={[0, 0.95, 0]} m={lam({ map: doorTex })} />
          <Box s={[1.35, 0.14, 0.1]} p={[0, 1.95, 0]} m={mats.post()} />
          {[-1, 1].map((s) => <Box key={s} s={[0.12, 1.95, 0.1]} p={[s * 0.62, 0.97, 0]} m={mats.post()} />)}
        </group>
      )}
      {win !== null && (
        <group position={[win ?? 1.7, 1.55, d / 2 + 0.03]}>
          <Box s={[0.95, 0.75, 0.05]} p={[0, 0, 0]} m={M('winDark', () => lam({ color: '#2b2018' }))} shadow={false} />
          {[-0.3, 0, 0.3].map((x) => <Box key={x} s={[0.05, 0.75, 0.08]} p={[x, 0, 0.02]} m={mats.post()} shadow={false} />)}
          {[-0.2, 0.2].map((y) => <Box key={y} s={[0.95, 0.05, 0.08]} p={[0, y, 0.02]} m={mats.post()} shadow={false} />)}
          <Box s={[1.1, 0.1, 0.1]} p={[0, 0.42, 0.02]} m={mats.post()} />
          <Box s={[1.1, 0.1, 0.1]} p={[0, -0.42, 0.02]} m={mats.post()} />
        </group>
      )}
      <Roof w={w} d={d} y={h} />
    </group>
  );
};

/** Open timber shelter / stable front: posts, a beam and a single-pitch tiled roof; plank back wall optional. */
export const Shelter: React.FC<{ p: V3; w?: number; d?: number; h?: number; ry?: number; back?: boolean; sides?: boolean }> = ({ p, w = 5, d = 3, h = 2.7, ry = 0, back = true, sides = false }) => {
  const pt = useMemo(() => lam({ map: rep(plankTex(), w / 2.2, h / 2.2) }), [w, h]);
  const st = useMemo(() => lam({ map: rep(plankTex(), d / 2.2, h / 2.2) }), [d, h]);
  return (
    <group position={p} rotation-y={ry}>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} s={[0.26, h, 0.26]} p={[sx * w / 2, h / 2, sz * d / 2]} m={mats.post()} />))}
      <Box s={[w + 0.6, 0.3, 0.3]} p={[0, h, d / 2]} m={mats.post()} />
      <Box s={[w + 0.6, 0.3, 0.3]} p={[0, h, -d / 2]} m={mats.post()} />
      {back && <Box s={[w, h, 0.12]} p={[0, h / 2, -d / 2 + 0.1]} m={pt} />}
      {sides && [-1, 1].map((s) => <Box key={s} s={[0.12, h, d]} p={[s * w / 2, h / 2, 0]} m={st} />)}
      <Roof w={w} d={d} y={h + 0.1} pitch={0.18} over={0.45} single />
    </group>
  );
};

/** Courtyard wall: low rammed earth with a tiled cap. Runs along x. */
export const Wall: React.FC<{ p: V3; len: number; h?: number; ry?: number }> = ({ p, len, h = 1.9, ry = 0 }) => {
  const m = useMemo(() => lam({ map: rep(earthTex(), len / 2.5, h / 2.5) }), [len, h]);
  return (
    <group position={p} rotation-y={ry}>
      <Box s={[len, h, 0.5]} p={[0, h / 2, 0]} m={m} />
      <Roof w={len} d={0.6} y={h} pitch={0.5} over={0.18} />
    </group>
  );
};

export const Fence: React.FC<{ p: V3; len: number; ry?: number; h?: number; gap?: number }> = ({ p, len, ry = 0, h = 1.25, gap = 1.6 }) => {
  const n = Math.max(1, Math.round(len / gap));
  return (
    <group position={p} rotation-y={ry}>
      {Array.from({ length: n + 1 }, (_, i) => <Box key={i} s={[0.16, h + 0.15, 0.16]} p={[-len / 2 + (i * len) / n, (h + 0.15) / 2, 0]} m={mats.post()} />)}
      {[0.45, 0.95].map((y) => <Box key={y} s={[len + 0.2, 0.12, 0.08]} p={[0, y * h, 0.05]} m={mats.wood()} />)}
    </group>
  );
};

export const Tower: React.FC<{ p: V3; h?: number }> = ({ p, h = 11 }) => {
  const m = useMemo(() => lam({ map: rep(brickTex(), 1.5, h / 3) }), [h]);
  const geo = useMemo(() => new THREE.CylinderGeometry(1.2, 1.55, h, 4, 1), [h]);
  return (
    <group position={p}>
      <mesh geometry={geo} material={m} position={[0, h / 2, 0]} rotation-y={Math.PI / 4} castShadow receiveShadow />
      <Box s={[2.3, 0.25, 2.3]} p={[0, h + 0.1, 0]} m={mats.post()} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} s={[0.16, 1.1, 0.16]} p={[sx * 1.0, h + 0.7, sz * 1.0]} m={mats.post()} />))}
      <Roof w={2.4} d={2.4} y={h + 1.25} pitch={0.5} over={0.25} />
    </group>
  );
};

export const Tree: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.9, 0]} castShadow material={mats.trunk()}><cylinderGeometry args={[0.12, 0.17, 1.8, 8]} /></mesh>
    {[[0, 2.4, 0, 1.05], [0.55, 2.0, 0.2, 0.75], [-0.5, 2.05, -0.1, 0.7]].map(([x, y, z, r], i) => (
      <group key={i}>
        <mesh position={[x, y, z]} castShadow material={mats.leaf()}><sphereGeometry args={[r, 20, 14]} /></mesh>
        <mesh position={[x, y, z]} material={M('leafInk', () => new THREE.MeshBasicMaterial({ color: '#3d5a22', side: THREE.BackSide }))}><sphereGeometry args={[r * 1.045, 20, 14]} /></mesh>
      </group>
    ))}
  </group>
);

export const Hay: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <mesh position={p} scale={[s * 1.3, s * 0.75, s]} castShadow receiveShadow material={mats.hay()}><sphereGeometry args={[0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
);

/* ───────────── drawn things in 3D: flat billboards (characters, horses, fx) ───────────── */
export const PX_UNIT = 1.7 / 100; // 100 drawing units = 1.7 m (a character's height)
type DrawBox = { x0: number; x1: number; y0: number; y1: number };
/** A canvas-drawn flat sprite standing at (x, y, z), facing the camera (yaw only). The drawing's ground line is y = 100
 *  (units); `draw` paints in drawing units. res = canvas pixels per unit. */
export const Sprite: React.FC<{ draw: (g: CanvasRenderingContext2D) => void; dep: string; box: DrawBox; x: number; z: number; y?: number; s?: number; res?: number; flip?: boolean; rot?: number; shadow?: boolean; yawOff?: number; renderOrder?: number }> = ({ draw, dep, box, x, z, y = 0, s = 1, res = 10, flip, rot = 0, shadow = true, yawOff = 0, renderOrder }) => {
  const cam = useCam();
  const W = Math.min(4096, Math.round((box.x1 - box.x0) * res)), H = Math.min(4096, Math.round((box.y1 - box.y0) * res));
  const r = Math.min(W / (box.x1 - box.x0), H / (box.y1 - box.y0));
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return { canvas: c, tex: t };
  }, [W, H]);
  useLayoutEffect(() => {
    const g = canvas.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    g.setTransform(r * (flip ? -1 : 1), 0, 0, r, flip ? W + box.x0 * r : -box.x0 * r, -box.y0 * r);
    draw(g);
    tex.needsUpdate = true;
  }, [dep, W, H, flip]);
  const yaw = Math.atan2(cam.pos[0] - x, cam.pos[2] - z) + yawOff;
  const w = (box.x1 - box.x0) * PX_UNIT * s, h = (box.y1 - box.y0) * PX_UNIT * s;
  const cx = ((flip ? -1 : 1) * (box.x0 + box.x1) / 2) * PX_UNIT * s, cy = (100 - (box.y0 + box.y1) / 2) * PX_UNIT * s;
  return (
    <group position={[x, y, z]} rotation-y={yaw}>
      <group rotation-z={rot} position={[0, 0, 0]}>
        <mesh position={[cx, cy, 0]} castShadow={shadow} renderOrder={renderOrder}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.45} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const CHAR_BOX = { x0: -42, x1: 42, y0: -42, y1: 104 };
/** A drawn character standing at (x, z). pose is evaluated per frame by the caller. */
export const Figure: React.FC<{ look: Look | keyof typeof CAST; pose: Pose; x: number; z: number; y?: number; s?: number; res?: number; flip?: boolean; fx?: boolean; rot?: number; box?: DrawBox; shadow?: boolean }> = ({ look, pose, x, z, y, s, res = 10, flip, fx = true, rot, box = CHAR_BOX, shadow }) => {
  const f = useCurrentFrame();
  const L = typeof look === 'string' ? CAST[look] : look;
  return <Sprite draw={(g) => { drawChar(g, L, pose); if (fx) drawFx(g, pose, f); }} dep={JSON.stringify(pose) + (fx ? f : '') + JSON.stringify(L)} box={box} x={x} z={z} y={y} s={s} res={res} flip={flip} rot={rot} shadow={shadow} />;
};

const HORSE_BOX = { x0: -62, x1: 62, y0: -20, y1: 104 };
/** A drawn horse; facing +x on screen unless flip. Scale 1 = a horse ~1.6 m at the withers. */
export const HorseFig: React.FC<{ look: keyof typeof HORSES; pose: HorsePose; x: number; z: number; y?: number; s?: number; res?: number; flip?: boolean; rot?: number }> = ({ look, pose, x, z, y, s = 1.35, res = 8, flip, rot }) => (
  <Sprite draw={(g) => { g.translate(0, 0); drawHorse(g, HORSES[look], pose); }} dep={JSON.stringify(pose) + look} box={HORSE_BOX} x={x} z={z} y={y} s={s} res={res} flip={flip} rot={rot} />
);
