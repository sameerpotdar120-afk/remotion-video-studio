import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, pop, ramp } from './theme';

// c07_red_x ("पर ये ग़लत है।"; the reference's 28.4–30.2 s): a small red disc with a white X pops on a point, grows big
// with an overshoot, the whole frame washes red (a hot vignette that pulses once), then the X shrinks back to a dot and
// the red drains. Transparent, 1080×1920, 60 fps; (x, y) = where it pops.
export const C07RedX: React.FC<{ x?: number; y?: number; out?: number }> = ({ x = 540, y = 900, out = 66 }) => {
  const f = useCurrentFrame();
  const small = pop(f, 0, 10, 2);
  const big = pop(f, 14, 26, 1.8);
  const back = ramp(f, out, out + 14, Easing.in(Easing.cubic));
  const r = (40 * small + 120 * big) * (1 - back * 0.85);
  const wash = interpolate(f, [12, 22, out, out + 16], [0, 1, 0.85, 0], { ...clamp });
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - 22) / 4) * (1 - back);
  if (f < 0) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}px ${y}px, rgba(232,38,43,${0.25 * wash}) 0%, rgba(200,20,25,${0.75 * wash}) 75%)`, mixBlendMode: 'normal' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <g transform={`translate(${x} ${y}) scale(${pulse})`}>
          <circle r={r + 8} fill="#000" opacity={0.25} transform="translate(0 10)" />
          <circle r={r} fill={C.red} stroke="#fff" strokeWidth={Math.max(3, r * 0.07)} />
          <path d={`M ${-r * 0.42} ${-r * 0.42} L ${r * 0.42} ${r * 0.42} M ${r * 0.42} ${-r * 0.42} L ${-r * 0.42} ${r * 0.42}`} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
