import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { clamp, pop } from './theme';

// h05_philip_no (line 4, "France ने मना कर दिया"; the reference's 18.6–19.8 s): the French king (Philip VI) pops in,
// crosses his stick arms in an X, shakes his head three times and frowns. Transparent, 900×1100, 60 fps, 120 frames.
export const H05PhilipNo: React.FC = () => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 2);
  const x = interpolate(f, [10, 22], [0, 1], clamp);
  const shake = f > 22 && f < 76 ? Math.sin(((f - 22) / 18) * Math.PI * 2) * 10 : 0;
  return (
    <AbsoluteFill>
      <svg width={900} height={1100}>
        <g transform={`translate(450 1060) scale(${0.85 * s}) rotate(${shake * 0.4})`}>
          <Plush who="philip" f={f} seed="ph" pose={{ ...PP0, arms: x, rx: -180, ry: -40, lx: 180, ly: -40, mouth: f > 18 ? 'frown' : 'oh', brow: -0.7, tilt: shake, look: shake / 12 }} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
