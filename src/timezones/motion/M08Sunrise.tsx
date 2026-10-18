import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m08_sunrise: a warm sun rises over a soft horizon glow with slowly turning rays and a light bloom. With peek on (for
// Kashgar), the sun stays below the horizon: only a faint cold glow pulses at the edge. 1000x1000, 60 fps, 240 frames.
// Transparent (the horizon itself is only light, no ground), so it sits on the map.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08Sunrise: React.FC<{ peek?: boolean }> = ({ peek = false }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 120], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const sunY = peek ? 640 + Math.sin(f / 60 * Math.PI) * 6 : 760 - rise * 300;
  const glow = peek ? 0.35 + Math.sin(f / 60 * Math.PI * 2 * 0.5) * 0.08 : interpolate(f, [0, 60, 240], [0.2, 0.9, 1], c);
  const rot = f * 0.25;
  const warm = peek ? '#9fb7ff' : '#FFB23E';
  return (
    <AbsoluteFill>
      <svg width={1000} height={1000} viewBox="0 0 1000 1000">
        <defs>
          <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={peek ? '#cfe0ff' : '#FFF4C2'} stopOpacity={0.95} />
            <stop offset="0.35" stopColor={warm} stopOpacity={0.55} />
            <stop offset="1" stopColor={warm} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={warm} stopOpacity={0} />
            <stop offset="0.5" stopColor={warm} stopOpacity={0.55} />
            <stop offset="1" stopColor={warm} stopOpacity={0} />
          </linearGradient>
          <clipPath id="sky"><rect x={0} y={0} width={1000} height={640} /></clipPath>
        </defs>
        <rect x={0} y={560} width={1000} height={160} fill="url(#hz)" opacity={glow} />
        <g clipPath="url(#sky)">
          <circle cx={500} cy={sunY} r={430} fill="url(#bloom)" opacity={glow} />
          {!peek && (
            <g transform={`translate(500 ${sunY}) rotate(${rot})`} opacity={0.55 * rise}>
              {Array.from({ length: 16 }, (_, i) => (
                <path key={i} d="M -18 -150 L 0 -470 L 18 -150 Z" fill="#FFE7A0" transform={`rotate(${i * 22.5})`} style={{ filter: 'blur(3px)' }} />
              ))}
            </g>
          )}
          {!peek && (
            <>
              <circle cx={500} cy={sunY} r={120} fill="#FFD24A" />
              <circle cx={500} cy={sunY} r={120} fill="none" stroke="#FFF6D0" strokeWidth={10} opacity={0.8} />
              <circle cx={470} cy={sunY - 30} r={60} fill="#FFF3B8" opacity={0.6} style={{ filter: 'blur(14px)' }} />
            </>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
