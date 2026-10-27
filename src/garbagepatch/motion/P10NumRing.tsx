import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, clamp } from './theme';

// p10_num_ring (line 5, the five gyres; the reference's numbered rings): a glowing cyan ring with its number pops in
// (0 → 1.15 → 1, 10 frames), an inner disc of deep blue glass, a thin outer ring rotating, and ripple rings pulsing
// out every 50 frames. Centred in its box; `size` its diameter.
export const P10NumRing: React.FC<{ n?: number; size?: number }> = ({ n = 1, size = 120 }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
  if (s <= 0) return null;
  const r = size / 2;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 3} height={size * 3} viewBox={`${-size * 1.5} ${-size * 1.5} ${size * 3} ${size * 3}`} style={{ overflow: 'visible', transform: `scale(${s})` }}>
        {[0, 1].map((k) => { const p = ((f + k * 25) % 50) / 50; return <circle key={k} r={r * (1 + p * 0.9)} fill="none" stroke={C.cyan} strokeWidth={3} opacity={(1 - p) * 0.7} />; })}
        <circle r={r} fill="rgba(10,60,140,0.55)" stroke={C.cyan} strokeWidth={size / 18} style={{ filter: `drop-shadow(0 0 ${size / 8}px ${C.cyan})` }} />
        <circle r={r * 1.18} fill="none" stroke={C.cyanGlow} strokeWidth={2} strokeDasharray={`${r * 0.5} ${r * 0.25}`} transform={`rotate(${f * 1.5})`} opacity={0.8} />
        <text y={r * 0.36} textAnchor="middle" fontFamily={NUM} fontSize={size * 0.62} fill="#fff" style={{ filter: `drop-shadow(0 0 6px ${C.cyan})` }}>{n}</text>
      </svg>
    </AbsoluteFill>
  );
};
