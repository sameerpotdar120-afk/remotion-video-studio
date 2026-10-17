import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m06_space_bg: teal-green nebula with twinkling stars and slow drift, behind the globe. Opaque, seamless loop.
// 1080x1920, 60 fps, 480 frames. Render as MP4 (no alpha needed).

const LOOP = 480;

export const M06SpaceBg: React.FC = () => {
  const f = useCurrentFrame();
  const ph = (f / LOOP) * Math.PI * 2;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 75% at 50% 20%, #12614f 0%, #0b3b3c 40%, #071d27 75%, #03080f 100%)' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <defs>
          <filter id="neb" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0035" numOctaves={4} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.95  0 0 0 0 0.75  0 0 0 1.6 -0.75" />
            <feGaussianBlur stdDeviation={6} />
          </filter>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
        </defs>
        <g transform={`translate(${Math.sin(ph) * 30},${Math.cos(ph) * 20}) scale(1.08)`} opacity={0.5}>
          <rect x={-60} y={-60} width={1200} height={2040} filter="url(#neb)" />
        </g>
        {Array.from({ length: 380 }, (_, i) => {
          const depth = random(`z${i}`);
          const x = random(`x${i}`) * 1080 + Math.sin(ph) * depth * 14;
          const y = random(`y${i}`) * 1920 + Math.cos(ph) * depth * 10;
          const tw = 0.55 + 0.45 * Math.sin(ph * (1 + Math.floor(random(`k${i}`) * 4)) + i);
          const r = 0.6 + depth * depth * 2.2;
          return <circle key={i} cx={x} cy={y} r={r} fill={random(`c${i}`) > 0.85 ? '#bff6ff' : '#ffffff'} opacity={(0.25 + depth * 0.75) * tw} />;
        })}
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};
