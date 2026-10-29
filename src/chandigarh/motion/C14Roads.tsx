import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c14_roads (line 2, the veins; line 9, the reference's 1:04–1:17 roads V1 to V7; line 10, the Leisure Valley):
// lines (`roads`: d, colour, width, optional dashed) draw on one after another, `step` frames apart, 22 frames each,
// from their start (the map's edge) inward. `walkers` sends small dots along the dashed footpaths (the V7s). `out`
// fades them. `veins(at, n, len)` builds red branching paths running out from a point (line 2). Transparent.
export type Road = { d: string; color: string; width?: number; dashed?: boolean };
export const veins = (at: [number, number], n = 9, len = 520): Road[] => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 + random(`a${i}`) * 0.5;
  let x = at[0], y = at[1], d = `M${x},${y}`;
  for (let k = 1; k <= 5; k++) { const r = (len / 5) * (0.8 + random(`r${i}${k}`) * 0.4), b = a + (random(`b${i}${k}`) - 0.5) * 0.9; x += Math.cos(b) * r; y += Math.sin(b) * r; d += ` L${x.toFixed(0)},${y.toFixed(0)}`; }
  return { d, color: i % 2 ? '#C8102E' : '#8E1B2E', width: 5 + random(`w${i}`) * 3 };
});
export const C14Roads: React.FC<{ roads: Road[]; step?: number; out?: number; walkers?: number; glow?: boolean }> = ({ roads, step = 3, out, walkers = 0, glow }) => {
  const f = useCurrentFrame();
  const o = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {roads.map((r, i) => {
          const t = interpolate(f, [i * step, i * step + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          if (t <= 0) return null;
          const w = r.width ?? 6;
          return (
            <g key={i}>
              {glow && <path d={r.d} pathLength={1} fill="none" stroke={r.color} strokeWidth={w * 3} opacity={0.35} strokeDasharray={`${t} 2`} style={{ filter: 'blur(4px)' }} />}
              {r.dashed ? (
                <>
                  <mask id={`c14m${i}`}><path d={r.d} pathLength={1} fill="none" stroke="#fff" strokeWidth={w * 3} strokeDasharray={`${t} 2`} /></mask>
                  <path d={r.d} fill="none" stroke={r.color} strokeWidth={w} strokeDasharray={`${w * 2.2} ${w * 1.6}`} mask={`url(#c14m${i})`} />
                </>
              ) : <path d={r.d} pathLength={1} fill="none" stroke={r.color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${t} 2`} />}
              {r.dashed && walkers > 0 && t >= 1 && Array.from({ length: walkers }, (_, k) => {
                const u = ((f / 240 + k / walkers + i * 0.17) % 1);
                return <path key={k} d={r.d} pathLength={1} fill="none" stroke="#1E1E1E" strokeWidth={w * 2.6} strokeLinecap="round" strokeDasharray="0.001 2" strokeDashoffset={-u} />;
              })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
