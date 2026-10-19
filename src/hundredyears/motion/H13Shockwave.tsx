import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// h13_shockwave (line 8, the rally; the reference's 58.5–60.4 s): a thick white and cyan ring of light expands from the
// centre over 1.6 s with an ease-out, fading as it grows, plus a second, thinner echo ring and a soft inner glow.
// Transparent, 1080×1080, 60 fps, 120 frames.
export const H13Shockwave: React.FC = () => {
  const f = useCurrentFrame();
  const ring = (d: number, w: number) => {
    const t = interpolate(f, [d, d + 96], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    if (f < d) return null;
    return (
      <g opacity={1 - t}>
        <circle cx={540} cy={540} r={60 + t * 470} fill="none" stroke="#BFF6FF" strokeWidth={w * (1 - t * 0.6)} filter="url(#swg)" />
        <circle cx={540} cy={540} r={60 + t * 470} fill="none" stroke="#fff" strokeWidth={w * 0.35 * (1 - t * 0.6)} />
      </g>
    );
  };
  const glow = interpolate(f, [0, 8, 60], [0, 0.8, 0], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs><filter id="swg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={12} /></filter></defs>
        <circle cx={540} cy={540} r={200} fill="#FFF8E0" opacity={glow} filter="url(#swg)" />
        {ring(0, 60)}{ring(14, 26)}
      </svg>
    </AbsoluteFill>
  );
};
