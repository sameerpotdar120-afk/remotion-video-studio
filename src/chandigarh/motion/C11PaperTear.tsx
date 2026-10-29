import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c11_paper_tear (line 6, the reference's 0:41.2, back from the photos to the plan; line 12): the current shot
// (`children`) tears away in four jagged strips that peel off to the left one after another (each a ragged-edged
// band with a white torn paper edge and a shadow), revealing `next` underneath, over `dur` frames from `at`.
export const C11PaperTear: React.FC<{ children: React.ReactNode; next: React.ReactNode; at?: number; dur?: number }> = ({ children, next, at = 0, dur = 24 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (p >= 1) return <AbsoluteFill>{next}</AbsoluteFill>;
  const n = 4;
  const jag = (x: number, k: number) => Array.from({ length: 41 }, (_, i) => `${x + (random(`j${k}${i}`) - 0.5) * 50 + Math.sin(i * 1.7 + k) * 14}px ${(i / 40) * 1920}px`);
  return (
    <AbsoluteFill>
      <AbsoluteFill>{next}</AbsoluteFill>
      {Array.from({ length: n }, (_, k) => {
        const t = interpolate(p, [k / n * 0.5, k / n * 0.5 + 0.55], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        const xL = (k / n) * 1080, xR = ((k + 1) / n) * 1080;
        const left = jag(xL, k), right = jag(xR, k + 1).reverse();
        const poly = `polygon(${[...(k === 0 ? ['-60px 0px', '-60px 1920px'] : left), ...(k === n - 1 ? ['1140px 1920px', '1140px 0px'] : right)].join(',')})`;
        const dx = -t * (1400 + k * 200), rot = -t * 12;
        return (
          <AbsoluteFill key={k} style={{ transform: `translateX(${dx}px) rotate(${rot}deg)`, transformOrigin: '0% 0%', filter: `drop-shadow(8px 0 10px rgba(0,0,0,${0.5 * Math.min(1, t * 4)}))` }}>
            <AbsoluteFill style={{ clipPath: poly, background: '#fff' }} />
            <AbsoluteFill style={{ clipPath: poly, transform: 'scale(0.985)', transformOrigin: '50% 50%' }}>{children}</AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
