import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { pop, ramp } from './theme';

// w08_pin_pulse (line 4–5, the island pinned; the reference's 14.1–15.6 s): a red dot pops on the point, a thick red ring
// bursts out of it and contracts back onto the dot, then thin rings keep pulsing out. Transparent, 600×600, 60 fps;
// the point is (300, 300).
export const W08PinPulse: React.FC = () => {
  const f = useCurrentFrame();
  const d = pop(f, 0, 8, 2.4);
  const ring = f < 34 ? (ramp(f, 4, 14) * 90 - ramp(f, 16, 34, Easing.in(Easing.cubic)) * 55) : 35;
  const ringW = 26 * (1 - ramp(f, 16, 34)) + 6;
  return (
    <AbsoluteFill>
      <svg width={600} height={600}>
        {f > 34 && [0, 1].map((k) => {
          const t = ((f - 34 + k * 30) % 60) / 60;
          return <circle key={k} cx={300} cy={300} r={20 + 120 * t} fill="none" stroke="#E8262B" strokeWidth={5} opacity={1 - t} />;
        })}
        <circle cx={300} cy={300} r={Math.max(0, ring)} fill="none" stroke="#E8262B" strokeWidth={ringW} opacity={0.9} />
        <circle cx={300} cy={300} r={16 * d} fill="#E8262B" stroke="#fff" strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};
