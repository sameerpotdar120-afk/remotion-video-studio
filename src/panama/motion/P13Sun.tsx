import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { pop } from './theme';

// p13_sun (line 5, "2023 में बारिश नहीं आई"; the reference's 34.5–40 s): a hot cartoon sun that pops in, its disc
// pulsing and its two rings of rays turning in opposite directions (the outer slowly, the inner faster) and pulsing
// in length, with a wide warm glow and a heat shimmer ring. Transparent, 600×600, 60 fps.
export const P13Sun: React.FC = () => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 1.8);
  const pulse = 1 + 0.04 * Math.sin(f / 9);
  const ray = (n: number, r0: number, len: number, w: number, rot: number, col: string) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 360 + rot;
    const l = len * (1 + 0.12 * Math.sin(f / 7 + i));
    return <rect key={`${r0}${i}`} x={-w / 2} y={-r0 - l} width={w} height={l} rx={w / 2} fill={col} transform={`rotate(${a})`} />;
  });
  return (
    <AbsoluteFill>
      <svg width={600} height={600}>
        <defs>
          <radialGradient id="sunGlow"><stop offset="0" stopColor="rgba(255,220,90,0.75)" /><stop offset="1" stopColor="rgba(255,180,40,0)" /></radialGradient>
          <radialGradient id="sunDisc" cx="0.4" cy="0.35"><stop offset="0" stopColor="#FFF6B0" /><stop offset="0.6" stopColor="#FFD23D" /><stop offset="1" stopColor="#F5A91E" /></radialGradient>
        </defs>
        <g transform={`translate(300 300) scale(${s})`}>
          <circle r={290} fill="url(#sunGlow)" opacity={0.8 + 0.2 * Math.sin(f / 13)} />
          <g>{ray(16, 120, 70, 18, f * 0.25, '#FFC93C')}</g>
          <g>{ray(16, 112, 40, 12, -f * 0.6 + 11, '#FFE27A')}</g>
          <circle r={110 * pulse} fill="url(#sunDisc)" stroke="#F09A16" strokeWidth={6} />
          <circle r={140 + ((f % 40) / 40) * 120} fill="none" stroke="#FFE9A0" strokeWidth={3} opacity={(1 - (f % 40) / 40) * 0.6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
