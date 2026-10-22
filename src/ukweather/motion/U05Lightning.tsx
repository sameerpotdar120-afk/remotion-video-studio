import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// u05_lightning (line 1; the reference's 3.6–4.2 s): a forked white-blue bolt strikes from the top (bright for 3 frames,
// a flicker off and on, then fading), with a full-screen flash on the strike and a blue glow round the bolt.
// Transparent, 1080×1920, 60 fps; the bolt lands at (`x`, `y`). Random but deterministic forks (`seed`).
const bolt = (x0: number, y0: number, x1: number, y1: number, seed: string, n = 14) => {
  const pts: [number, number][] = [[x0, y0]];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    pts.push([x0 + (x1 - x0) * t + (random(`${seed}x${i}`) - 0.5) * 120, y0 + (y1 - y0) * t + (random(`${seed}y${i}`) - 0.5) * 30]);
  }
  pts.push([x1, y1]);
  return pts;
};
export const U05Lightning: React.FC<{ x?: number; y?: number; seed?: string }> = ({ x = 560, y = 1200, seed = 'lb' }) => {
  const f = useCurrentFrame();
  const on = [1, 1, 1, 0, 1, 0.8, 0.6, 0.4, 0.25, 0.1, 0][Math.min(10, f)] ?? 0;
  const main = bolt(x - 120, -40, x, y, seed);
  const forks = [4, 7, 10].map((k, j) => bolt(main[k][0], main[k][1], main[k][0] + (j % 2 ? 1 : -1) * (160 + j * 40), main[k][1] + 260, `${seed}f${j}`, 6));
  const d = (p: [number, number][]) => p.map(([a, b], i) => `${i ? 'L' : 'M'} ${a} ${b}`).join(' ');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#E8F2FF', opacity: on * 0.55, mixBlendMode: 'screen' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: on }}>
        <defs><filter id="lgl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter></defs>
        <path d={d(main)} stroke="#8FC8FF" strokeWidth={34} fill="none" filter="url(#lgl)" />
        <path d={d(main)} stroke="#fff" strokeWidth={9} fill="none" strokeLinejoin="round" />
        {forks.map((p, i) => <path key={i} d={d(p)} stroke="#E8F4FF" strokeWidth={4} fill="none" strokeLinejoin="round" />)}
      </svg>
    </AbsoluteFill>
  );
};
