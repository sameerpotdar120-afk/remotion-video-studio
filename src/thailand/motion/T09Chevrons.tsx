import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// t09_chevrons (line 6, "इन दोनों के बीच में फँसा था Siam"): cyan neon chevrons pulse in from both edges toward the middle,
// three per side on a 0.5 s loop, squeezing; `gap` is how close to the centre they reach. Transparent, 1080x1920, 60 fps,
// 120 frames (loops cleanly every 30).
export const T09Chevrons: React.FC<{ y?: number; gap?: number }> = ({ y = 960, gap = 240 }) => {
  const f = useCurrentFrame();
  const intro = interpolate(f, [0, 12], [0, 1], clamp);
  const chev = (side: 1 | -1, i: number) => {
    const t = (((f + i * 10) % 30) / 30);
    const x0 = side < 0 ? -60 : 1140, x1 = side < 0 ? 540 - gap : 540 + gap;
    const x = x0 + (x1 - x0) * t;
    const o = Math.sin(t * Math.PI) * intro;
    const d = side < 0 ? 'M -40 -90 L 40 0 L -40 90' : 'M 40 -90 L -40 0 L 40 90';
    return (
      <g key={`${side}${i}`} transform={`translate(${x} ${y}) scale(${0.8 + t * 0.4})`} opacity={o}>
        <path d={d} stroke={C.cyan} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#ng)" />
        <path d={d} stroke={C.cyan} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke="#E8FDFF" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs><filter id="ng" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={12} /></filter></defs>
        {[0, 1, 2].map((i) => chev(-1, i))}
        {[0, 1, 2].map((i) => chev(1, i))}
      </svg>
    </AbsoluteFill>
  );
};
