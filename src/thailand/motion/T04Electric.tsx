import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { C, ramp } from './theme';

// t04_electric_border (line 7, "उसकी सरहद सीधे दूसरे से जा मिलती"): the shared British–French border as a live electric line.
// It draws on along `pts` in 24 frames, then crackles: a cyan glow, a white core and a thinner second bolt, re-jittered
// every 3 frames, with sparks hopping along it. Transparent; `pts` are frame pixels (the edit passes the projected border).
// 1080x1920, 60 fps, 180 frames.

type Pt = [number, number];
const DEF: Pt[] = [[560, 420], [520, 600], [580, 760], [540, 930], [600, 1100], [560, 1280], [610, 1460]];

const bolt = (pts: Pt[], upto: number, seed: string, amp: number) => {
  const segs: Pt[] = [];
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  segs.push(pts[0]);
  for (let i = 0; i < lens.length; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(2, Math.round(lens[i] / 26));
    for (let j = 1; j <= n; j++) {
      const t = j / n;
      if ((acc + lens[i] * t) / total > upto) return segs;
      const nx = -(b[1] - a[1]) / lens[i], ny = (b[0] - a[0]) / lens[i];
      const o = j === n ? 0 : (random(`${seed}-${i}-${j}`) - 0.5) * 2 * amp;
      segs.push([a[0] + (b[0] - a[0]) * t + nx * o, a[1] + (b[1] - a[1]) * t + ny * o]);
    }
    acc += lens[i];
  }
  return segs;
};

export const T04Electric: React.FC<{ pts?: Pt[] }> = ({ pts = DEF }) => {
  const f = useCurrentFrame();
  const draw = ramp(f, 0, 24);
  const tick = Math.floor(f / 3);
  const main = bolt(pts, draw, `m${tick}`, 16);
  const thin = bolt(pts, draw, `t${tick}`, 30);
  const d = (s: Pt[]) => 'M' + s.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L');
  const flick = 0.85 + random(`fl${tick}`) * 0.15;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="eg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
        </defs>
        <g opacity={flick}>
          <path d={d(main)} stroke={C.cyan} strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" filter="url(#eg)" opacity={0.9} />
          <path d={d(main)} stroke={C.cyan} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={d(thin)} stroke="#B9F6FF" strokeWidth={4} fill="none" strokeLinejoin="round" opacity={0.8} />
          <path d={d(main)} stroke="#fff" strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </g>
        {/* sparks: short bright dashes jumping off random points of the bolt */}
        {main.length > 3 && Array.from({ length: 10 }).map((_, i) => {
          const p = main[Math.floor(random(`sp${tick}-${i}`) * main.length)];
          const a = random(`sa${tick}-${i}`) * Math.PI * 2, l = 14 + random(`sl${tick}-${i}`) * 30;
          return <path key={i} d={`M ${p[0]} ${p[1]} l ${Math.cos(a) * l} ${Math.sin(a) * l}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.9} />;
        })}
        {draw < 1 && main.length > 0 && <circle cx={main[main.length - 1][0]} cy={main[main.length - 1][1]} r={22} fill="#fff" filter="url(#eg)" />}
      </svg>
    </AbsoluteFill>
  );
};
