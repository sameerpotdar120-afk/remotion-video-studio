import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import { INK } from './chars';
import { PAL, plankTex, rep } from './tex';
import { Sprite, mats } from './world';

type V3 = [number, number, number];
const lam = (o: THREE.MeshLambertMaterialParameters) => new THREE.MeshLambertMaterial(o);
const mc = new Map<string, THREE.Material>();
const M = (k: string, mk: () => THREE.Material) => { let m = mc.get(k); if (!m) { m = mk(); mc.set(k, m); } return m; };
const Box: React.FC<{ s: V3; p: V3; m: THREE.Material | THREE.Material[]; r?: V3; shadow?: boolean }> = ({ s, p, m, r = [0, 0, 0], shadow = true }) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow><boxGeometry args={s} /></mesh>
);

/** Low table with bowls of dumplings, plates and wine jars. Long side along x. */
export const Table: React.FC<{ p: V3; w?: number; ry?: number }> = ({ p, w = 2.4, ry = 0 }) => (
  <group position={p} rotation-y={ry}>
    <Box s={[w, 0.1, 0.9]} p={[0, 0.78, 0]} m={M('tableTop', () => lam({ color: '#8a4426' }))} />
    {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} s={[0.1, 0.78, 0.1]} p={[sx * (w / 2 - 0.12), 0.39, sz * 0.36]} m={mats.post()} />))}
    {[-0.8, -0.2, 0.45].map((x, i) => (
      <group key={i} position={[x, 0.83, (i % 2) * 0.15 - 0.05]}>
        <mesh material={M('plate', () => lam({ color: '#f4efe3' }))} castShadow><cylinderGeometry args={[0.22, 0.18, 0.05, 20]} /></mesh>
        {[0, 1, 2].map((k) => <mesh key={k} position={[Math.cos(k * 2.1) * 0.08, 0.07, Math.sin(k * 2.1) * 0.08]} material={M('dump', () => lam({ color: '#fbf8f0' }))} castShadow><sphereGeometry args={[0.065, 12, 8]} /></mesh>)}
      </group>
    ))}
    {[[0.95, 0.12], [-1.05, -0.15], [0.15, 0.25]].map(([x, z], i) => (
      <group key={`j${i}`} position={[x, 0.83, z]}>
        <mesh position={[0, 0.18, 0]} material={M('jar', () => lam({ color: '#7a4a2c' }))} castShadow><sphereGeometry args={[0.17, 16, 12]} /></mesh>
        <mesh position={[0, 0.38, 0]} material={M('jarTop', () => lam({ color: '#5a3420' }))} castShadow><cylinderGeometry args={[0.06, 0.08, 0.1, 12]} /></mesh>
        <mesh position={[0, 0.45, 0]} material={mats.red()}><sphereGeometry args={[0.05, 8, 6]} /></mesh>
      </group>
    ))}
  </group>
);

/** A string of paper lanterns hanging between two points (catenary sag), gently swaying. */
export const Lanterns: React.FC<{ a: V3; b: V3; n?: number; sag?: number; colors?: string[] }> = ({ a, b, n = 6, sag = 0.6, colors = ['#f2c96b', '#f0a24a', '#f2d892'] }) => {
  const f = useCurrentFrame();
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t] as V3;
  });
  const line = useMemo(() => {
    const ps: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; ps.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ps), 24, 0.012, 4, false);
  }, [a.join(), b.join(), sag]);
  return (
    <group>
      <mesh geometry={line} material={mats.ink()} />
      {pts.map((p, i) => {
        const sw = Math.sin(f * 0.05 + i) * 0.06;
        return (
          <group key={i} position={p} rotation-z={sw}>
            <mesh position={[0, -0.12, 0]} material={mats.ink()}><cylinderGeometry args={[0.006, 0.006, 0.24, 4]} /></mesh>
            <mesh position={[0, -0.42, 0]} scale={[1, 1.25, 1]} castShadow material={M(`lan${colors[i % colors.length]}`, () => new THREE.MeshLambertMaterial({ color: colors[i % colors.length], emissive: colors[i % colors.length], emissiveIntensity: 0.35 }))}><sphereGeometry args={[0.2, 16, 12]} /></mesh>
            <mesh position={[0, -0.18, 0]} material={M('lanCap', () => lam({ color: '#3a2618' }))}><cylinderGeometry args={[0.08, 0.1, 0.06, 12]} /></mesh>
            <mesh position={[0, -0.68, 0]} material={M('lanCap', () => lam({ color: '#3a2618' }))}><cylinderGeometry args={[0.1, 0.08, 0.06, 12]} /></mesh>
            <mesh position={[0, -0.8, 0]} material={M('tassel', () => lam({ color: '#c8352d' }))}><cylinderGeometry args={[0.02, 0.035, 0.18, 6]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Bench: React.FC<{ p: V3; w?: number; ry?: number }> = ({ p, w = 1.8, ry = 0 }) => (
  <group position={p} rotation-y={ry}>
    <Box s={[w, 0.08, 0.4]} p={[0, 0.48, 0]} m={mats.wood()} />
    {[-1, 1].map((s) => <Box key={s} s={[0.08, 0.48, 0.36]} p={[s * (w / 2 - 0.15), 0.24, 0]} m={mats.post()} />)}
  </group>
);

export const Trough: React.FC<{ p: V3; w?: number; ry?: number }> = ({ p, w = 1.6, ry = 0 }) => {
  const m = useMemo(() => lam({ map: rep(plankTex('#7a4224'), 1, 0.3) }), []);
  return (
    <group position={p} rotation-y={ry}>
      <Box s={[w, 0.5, 0.55]} p={[0, 0.55, 0]} m={m} />
      <Box s={[w - 0.1, 0.05, 0.45]} p={[0, 0.78, 0]} m={M('troughIn', () => lam({ color: '#3a2214' }))} />
      {[-1, 1].map((s) => <Box key={s} s={[0.12, 0.35, 0.5]} p={[s * (w / 2 - 0.2), 0.17, 0]} m={mats.post()} />)}
    </group>
  );
};

export const Flag: React.FC<{ p: V3; h?: number; color?: string }> = ({ p, h = 3, color = '#d0302a' }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => new THREE.PlaneGeometry(1.1, 0.75, 10, 1), []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) { const x = (i % 11) / 10; pos.setZ(i, Math.sin(x * 4 - f * 0.12) * 0.08 * x); }
  pos.needsUpdate = true;
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]} material={mats.post()} castShadow><cylinderGeometry args={[0.04, 0.05, h, 8]} /></mesh>
      <mesh geometry={geo} position={[0.58, h - 0.42, 0]} material={M(`flag${color}`, () => lam({ color, side: THREE.DoubleSide }))} castShadow />
    </group>
  );
};

/** A dropped straw hat (conical) lying on the ground. */
export const StrawHat: React.FC<{ p: V3; r?: number }> = ({ p, r = 0.38 }) => (
  <mesh position={p} rotation={[0.15, 0, 0.08]} castShadow receiveShadow material={M('straw', () => lam({ color: '#d9b45a' }))}><coneGeometry args={[r, r * 0.45, 24]} /></mesh>
);

/* ───────────── drawn fx as sprites ───────────── */
const FX_BOX = { x0: -50, x1: 50, y0: 0, y1: 100 };
/** Dust puffs that burst and fade; born at frame `at`. */
export const Dust: React.FC<{ at: number; x: number; z: number; s?: number; n?: number; dur?: number }> = ({ at, x, z, s = 1, n = 5, dur = 36 }) => {
  const f = useCurrentFrame(); const k = (f - at) / dur;
  if (k < 0 || k > 1) return null;
  return (
    <Sprite x={x} z={z} s={s} res={6} shadow={false} box={FX_BOX} dep={`dust${Math.round(k * 60)}`} draw={(g) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (0.1 + (0.8 * i) / (n - 1)), d = 12 + 30 * Math.sqrt(k);
        const x0 = Math.cos(a) * d * (i % 2 ? 1 : -1) * 1.1, y0 = 96 - Math.sin(a) * d * 0.35 - 8 * k, r = (7 + 6 * ((i * 7) % 3)) * (0.6 + 0.6 * k);
        g.globalAlpha = Math.max(0, 1 - k * 1.05);
        g.beginPath(); g.arc(x0, y0, r, 0, Math.PI * 2); g.fillStyle = '#efe6d2'; g.fill(); g.strokeStyle = 'rgba(150,130,100,0.9)'; g.lineWidth = 1.4; g.stroke();
      }
      g.globalAlpha = 1;
    }} />
  );
};

/** Leaves drifting through the frame (sunset street). */
export const Leaves: React.FC<{ x: number; z: number; n?: number; seed?: number; span?: number }> = ({ x, z, n = 6, seed = 1, span = 6 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => { const v = Math.sin((i + 1) * 91.7 * k + seed * 13.1) * 43758.5; return v - Math.floor(v); };
        const period = 160 + r(1) * 120, t = ((f + r(2) * period) % period) / period;
        const lx = x - span / 2 + span * t, ly = 0.1 + 2.2 * r(3) * (1 - t) + Math.sin(t * 9 + i) * 0.3, lz = z + (r(4) - 0.5) * 3;
        return (
          <Sprite key={i} x={lx} z={lz} y={ly} s={0.25} res={4} shadow={false} box={{ x0: -12, x1: 12, y0: 76, y1: 100 }} dep={`leaf${i}${Math.round(f / 2)}`} rot={f * 0.08 + i} draw={(g) => {
            g.beginPath(); g.ellipse(0, 88, 8, 4, 0.4, 0, Math.PI * 2); g.fillStyle = i % 2 ? '#c99a3a' : '#a8742c'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke();
            g.beginPath(); g.moveTo(-7, 90); g.lineTo(7, 86); g.stroke();
          }} />
        );
      })}
    </>
  );
};

/** Cartoon clouds: flat puffy shapes with ink outline, as big billboards in the sky. */
export const Cloud: React.FC<{ x: number; y: number; z: number; s?: number; tint?: string }> = ({ x, y, z, s = 6, tint = '#f7f5ef' }) => (
  <Sprite x={x} z={z} y={y} s={s} res={3} shadow={false} box={{ x0: -50, x1: 50, y0: 60, y1: 100 }} dep={`cloud${tint}`} draw={(g) => {
    g.beginPath(); g.moveTo(-40, 96);
    [[-30, 80, 14], [-12, 72, 17], [8, 74, 15], [26, 82, 13]].forEach(([cx, cy, r]) => g.arc(cx, cy, r, Math.PI * 0.9, Math.PI * 2.1));
    g.lineTo(40, 96); g.closePath(); g.fillStyle = tint; g.fill(); g.strokeStyle = 'rgba(80,70,60,0.8)'; g.lineWidth = 2; g.stroke();
  }} />
);

/** Straw broom leaning against something (tilt about z). */
export const Broom: React.FC<{ p: V3; tilt?: number; ry?: number }> = ({ p, tilt = 0.18, ry = 0 }) => (
  <group position={p} rotation={[0, ry, tilt]}>
    <mesh position={[0, 0.95, 0]} material={mats.wood()} castShadow><cylinderGeometry args={[0.025, 0.03, 1.5, 8]} /></mesh>
    <mesh position={[0, 0.18, 0]} material={M('broomStraw', () => lam({ color: '#d8b763' }))} castShadow><coneGeometry args={[0.16, 0.42, 14]} /></mesh>
    <mesh position={[0, 0.33, 0]} material={mats.red()}><torusGeometry args={[0.05, 0.012, 6, 16]} /></mesh>
  </group>
);

/** Small white wine jar with a blue band. */
export const Jar: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.16, 0]} material={M('jarW', () => lam({ color: '#f1efe8' }))} castShadow><cylinderGeometry args={[0.08, 0.1, 0.3, 14]} /></mesh>
    <mesh position={[0, 0.34, 0]} material={M('jarW', () => lam({ color: '#f1efe8' }))} castShadow><cylinderGeometry args={[0.035, 0.06, 0.08, 12]} /></mesh>
    <mesh position={[0, 0.2, 0]} material={M('jarB', () => lam({ color: '#c8352d' }))}><cylinderGeometry args={[0.101, 0.101, 0.035, 14]} /></mesh>
  </group>
);

export const _p = PAL;
