import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p20_smear (the reference's liquid "pull down" wipe from the map into the cartoon ocean at 0:53): from `at` the
// picture is cut into 18 vertical strips that each stretch and slide downward by a different amount (a wave across the
// frame, centre strips leading), smearing and blurring over `dur` frames until it has drained off the bottom; the next
// shot (`next`) shows underneath. Opaque.
export const P20Smear: React.FC<{ children: React.ReactNode; next?: React.ReactNode; at?: number; dur?: number }> = ({ children, next, at = 0, dur = 14 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  if (t <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const n = 18, W = 1080 / n;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {next && <AbsoluteFill>{next}</AbsoluteFill>}
      {t < 1 && Array.from({ length: n }, (_, i) => {
        const k = 0.6 + 0.4 * Math.cos(((i + 0.5) / n - 0.5) * Math.PI * 1.6) + 0.15 * Math.sin(i * 1.7);
        const p = Math.min(1, t * (0.8 + k * 0.7));
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(0 ${1080 - (i + 1) * W - 0.5}px 0 ${i * W - 0.5}px)`, transformOrigin: '50% 0%',
            transform: `translateY(${p * p * 1920}px) scaleY(${1 + p * 2.5})`, filter: `blur(${p * 6}px)`, opacity: 1 - p * 0.3 }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
