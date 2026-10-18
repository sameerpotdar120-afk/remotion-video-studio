import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { FlagBall } from './Flags';
import { clamp, ramp } from './theme';

// t05_clash (line 7, "और फिर जंग लगभग तय थी"): the British and French flag-balls back off a little, then each fires a glowing
// bullet with a light trail; the bullets meet and a big orange-white fireball bursts, with a shockwave ring, sparks under
// gravity, smoke and a short white flash. Transparent; `a`, `b` and `hit` are frame pixels. 1080x1920, 60 fps, 150 frames.

type Pt = [number, number];
const FIRE = 60, HIT = 80;

const blob = (r: number, seed: string, n = 22) => {
  const pts = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (0.82 + random(`${seed}${i}`) * 0.3);
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return 'M' + pts.join('L') + 'Z';
};

export const T05Clash: React.FC<{ a?: Pt; b?: Pt; hit?: Pt }> = ({ a = [250, 900], b = [830, 900], hit = [540, 900] }) => {
  const f = useCurrentFrame();
  const back = ramp(f, 0, 50, Easing.inOut(Easing.cubic)) * 40;
  const dir = (p: Pt) => { const dx = p[0] - hit[0], dy = p[1] - hit[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const [ax, ay] = dir(a), [bx, by] = dir(b);
  const recoil = (k: number) => Math.exp(-Math.max(0, f - FIRE) / 6) * (f >= FIRE ? 22 : 0) * k;
  const A: Pt = [a[0] + ax * (back + recoil(1)), a[1] + ay * (back + recoil(1))];
  const Bp: Pt = [b[0] + bx * (back + recoil(1)), b[1] + by * (back + recoil(1))];
  const t = interpolate(f, [FIRE, HIT], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const bullet = (from: Pt, col: string, key: string) => {
    if (f < FIRE || f >= HIT) return null;
    const x = from[0] + (hit[0] - from[0]) * t, y = from[1] + (hit[1] - from[1]) * t;
    const tx = from[0] + (hit[0] - from[0]) * Math.max(0, t - 0.35), ty = from[1] + (hit[1] - from[1]) * Math.max(0, t - 0.35);
    return (
      <g key={key}>
        <path d={`M ${tx} ${ty} L ${x} ${y}`} stroke={col} strokeWidth={26} strokeLinecap="round" opacity={0.55} filter="url(#cg)" />
        <path d={`M ${tx} ${ty} L ${x} ${y}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
        <circle cx={x} cy={y} r={18} fill="#fff" />
        <circle cx={x} cy={y} r={34} fill={col} opacity={0.6} filter="url(#cg)" />
      </g>
    );
  };
  const muzzle = (p: Pt, d: number[], key: string) => {
    const k = interpolate(f, [FIRE, FIRE + 3, FIRE + 9], [0, 1, 0], clamp);
    return k > 0 ? <circle key={key} cx={p[0] - d[0] * 70} cy={p[1] - d[1] * 70} r={40 * k + 10} fill="#FFF3B0" opacity={k} filter="url(#cg)" /> : null;
  };
  const e = f - HIT;
  const R = e < 0 ? 0 : interpolate(e, [0, 14, 60], [20, 230, 280], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(e, [30, 70], [1, 0], clamp);
  const flash = interpolate(e, [0, 2, 12], [0, 0.6, 0], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs><filter id="cg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={10} /></filter></defs>
        {e >= 0 && (
          <g transform={`translate(${hit[0]} ${hit[1]})`}>
            {/* smoke, then the fireball layers, then the ring */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const ang = (i / 6) * Math.PI * 2 + 0.4, dd = R * 0.7 + e * 1.2;
              return <circle key={i} cx={Math.cos(ang) * dd} cy={Math.sin(ang) * dd - e * 1.5} r={R * 0.45} fill="#5A5048" opacity={0.5 * interpolate(e, [8, 20, 90], [0, 1, 0], clamp)} />;
            })}
            <g opacity={fade}>
              <path d={blob(R, `o${Math.floor(e / 3)}`)} fill="#E8401C" />
              <path d={blob(R * 0.78, `y${Math.floor(e / 3)}`)} fill="#FF9A1F" />
              <path d={blob(R * 0.52, `w${Math.floor(e / 3)}`)} fill="#FFE27A" />
              <circle r={R * 0.3} fill="#fff" filter="url(#cg)" />
            </g>
            <circle r={interpolate(e, [0, 24], [30, 460], clamp)} fill="none" stroke="#FFE9B0" strokeWidth={interpolate(e, [0, 24], [24, 2], clamp)} opacity={interpolate(e, [0, 24], [0.9, 0], clamp)} />
            {Array.from({ length: 28 }).map((_, i) => {
              const ang = random(`ang${i}`) * Math.PI * 2, sp = 9 + random(`spd${i}`) * 13, tt = e;
              const x = Math.cos(ang) * sp * tt, y = Math.sin(ang) * sp * tt + 0.12 * tt * tt;
              const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp + 0.24 * tt;
              const o = interpolate(tt, [0, 45], [1, 0], clamp);
              return <path key={i} d={`M ${x} ${y} l ${-vx * 1.6} ${-vy * 1.6}`} stroke={i % 3 ? '#FFD45A' : '#fff'} strokeWidth={5} strokeLinecap="round" opacity={o} />;
            })}
          </g>
        )}
        {bullet(A, '#D35BFF', 'ba')}
        {bullet(Bp, '#FF7A3A', 'bb')}
        {muzzle(A, [ax, ay], 'ma')}
        {muzzle(Bp, [bx, by], 'mb')}
        <g transform={`translate(${A[0]} ${A[1]})`}><FlagBall id="britain" r={62} uid="ca" /></g>
        <g transform={`translate(${Bp[0]} ${Bp[1]})`}><FlagBall id="france" r={62} uid="cb" /></g>
        {flash > 0 && <rect width={1080} height={1920} fill="#fff" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
