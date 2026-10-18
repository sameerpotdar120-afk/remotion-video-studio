import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, pop } from './theme';

// t15_heart (line 19, "किनारे दे दिए, पर दिल बचा लिया"): a glowing gold heart with a small crown pops in over Siam's core and
// beats (a double beat every 0.9 s), sending soft rings out on each beat. Transparent, 600x600, 60 fps, 180 frames.
const H = 'M 0 90 C -150 -10 -140 -130 -60 -130 C -20 -130 0 -100 0 -80 C 0 -100 20 -130 60 -130 C 140 -130 150 -10 0 90 Z';

export const T15Heart: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 16, 2);
  const ph = (f % 54) / 54;
  const beat = 1 + Math.max(0, Math.sin(ph * Math.PI * 2 * 2) * (ph < 0.5 ? 1 : 0)) * 0.1;
  const rings = [0, 1].map((i) => {
    const t = ((f + 54 - i * 27) % 54) / 54;
    return f < 16 ? null : <path key={i} d={H} fill="none" stroke={C.siam} strokeWidth={10 * (1 - t)} opacity={(1 - t) * 0.8} transform={`scale(${1.05 + t * 0.9})`} />;
  });
  return (
    <AbsoluteFill>
      <svg width={600} height={600}>
        <defs>
          <filter id="hg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={22} /></filter>
          <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF1A0" /><stop offset="0.5" stopColor="#F2D80A" /><stop offset="1" stopColor="#E2A11E" /></linearGradient>
        </defs>
        <g transform={`translate(300 330) scale(${k * 1.25})`}>
          {rings}
          <g transform={`scale(${beat})`}>
            <path d={H} fill={C.siam} opacity={0.7} filter="url(#hg)" />
            <path d={H} fill="url(#hf)" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
            <path d="M -80 -100 Q -110 -60 -90 -30" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
            <g transform="translate(0 -150)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
              <path d="M -46 20 L -54 -24 L -26 -2 L 0 -36 L 26 -2 L 54 -24 L 46 20 Z" fill="#F2B632" />
              <circle cy={4} r={8} fill="#D2232A" />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
