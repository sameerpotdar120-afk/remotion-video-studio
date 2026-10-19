import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// h20_burn (line 12, "पर आग उसके जिस्म को जला पाई, उसकी उम्मीद को नहीं"; the reference's 88.9–90.8 s, its signature move): the
// picture burns away like paper. Blotchy holes open from a noise field and spread until nothing is left; every hole has
// a glowing orange-yellow rim and a dark charred band just inside it, with embers drifting up. Wrap the layer to burn as
// `children` (the stake scene in the edit); whatever is underneath (the map) shows through the holes.
// 1080×1920, 60 fps, 150 frames; the burn runs from `start` for `dur` frames.
export const H20Burn: React.FC<{ start?: number; dur?: number; children?: React.ReactNode }> = ({ start = 10, dur = 110, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + dur], [0.08, 1.05], { ...clamp, easing: Easing.in(Easing.quad) });
  // a hard threshold of the noise at level t: white where the paper remains
  const filt = (id: string, t: number) => {
    const s = 14;
    return (
      <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.008" numOctaves={4} seed={7} result="n" />
        <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={s} intercept={-s * (0.18 + t * 0.62)} />
          <feFuncG type="linear" slope={s} intercept={-s * (0.18 + t * 0.62)} />
          <feFuncB type="linear" slope={s} intercept={-s * (0.18 + t * 0.62)} />
        </feComponentTransfer>
      </filter>
    );
  };
  const content = children ?? (
    <div style={{ width: 1080, height: 1920, background: 'linear-gradient(160deg, #C9A57A, #6A4A2A)' }} />
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          {filt('bfC', p)}{filt('bfH', p - 0.035)}{filt('bfG', p - 0.075)}
          <mask id="bmC" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#bfC)" /></mask>
          <mask id="bmH" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#bfH)" /></mask>
          <mask id="bmG" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width={1080} height={1920} fill="#fff" filter="url(#bfG)" /></mask>
          <filter id="bglow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={6} /></filter>
        </defs>
        <g mask="url(#bmG)"><rect width={1080} height={1920} fill="#FFB02E" filter="url(#bglow)" /></g>
        <g mask="url(#bmH)"><rect width={1080} height={1920} fill="#3A1C0A" /></g>
        <g mask="url(#bmC)"><foreignObject width={1080} height={1920}>{content}</foreignObject></g>
        {Array.from({ length: 30 }).map((_, i) => {
          const t0 = start + (i / 30) * dur;
          const k = (f - t0) / 70;
          if (k < 0 || k > 1) return null;
          const x = (i * 397) % 1080, y = 1920 - ((i * 613) % 1600) - k * 300;
          return <circle key={i} cx={x + Math.sin(k * 6 + i) * 30} cy={y} r={5 * (1 - k) + 2} fill="#FFC040" opacity={1 - k} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
