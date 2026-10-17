import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';

// m07_steam: white geothermal steam rising from a vent at the bottom centre. Seamless loop.
// 600x900, 60 fps, 240 frames. Transparent.

const LOOP = 240, N = 26;

export const M07Steam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={600} height={900}>
        <defs>
          <filter id="st" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={40} />
            <feGaussianBlur stdDeviation={9} />
          </filter>
        </defs>
        <g filter="url(#st)">
          {Array.from({ length: N }, (_, i) => {
            const t = (f / LOOP + i / N) % 1;
            const lean = (random(`l${i}`) - 0.3) * 120;
            const x = 300 + lean * t * t + Math.sin(t * 5 + i * 1.7) * 60 * t;
            const y = 860 - t * 820;
            const r = 22 + t * 150 * (0.6 + random(`r${i}`) * 0.6);
            const o = interpolate(t, [0, 0.12, 0.6, 1], [0, 0.42, 0.2, 0]);
            return <circle key={i} cx={x} cy={y} r={r} fill="#f4f7f8" opacity={o} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
