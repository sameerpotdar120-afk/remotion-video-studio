import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { clamp, pop, wobble } from './theme';

// h16_coronation (line 9, "Reims में Charles VII का राजतिलक करवाया"; the reference's 68.4–71.0 s): Charles VII pops in,
// bare-headed and a little nervous; a golden crown drops from above onto his head (`crown` frame) with a squash, a ring of
// sparkles bursts, and he beams. Transparent, 900×1200, 60 fps, 180 frames.
export const H16Coronation: React.FC<{ crown?: number }> = ({ crown = 50 }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 2);
  const c = interpolate(f, [crown, crown + 14], [0, 1], clamp);
  const sq = 1 - wobble(f, crown + 14, 3, 6) * 0.1;
  const crowned = f >= crown + 14;
  return (
    <AbsoluteFill>
      <svg width={900} height={1200}>
        <g transform={`translate(450 1160) scale(${(0.85 * s) / Math.sqrt(sq)} ${0.85 * s * sq})`}>
          <Plush who="charles" seed="ch" f={f} crown={c} pose={{ ...PP0, mouth: crowned ? 'grin' : 'worried', brow: crowned ? 0.2 : 0.7, lookY: crowned ? 0 : -0.7, arms: crowned ? 1 : 0, rx: 220, ry: -200, lx: -220, ly: -200 }} />
        </g>
        {crowned && f < crown + 60 && Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2, t = (f - crown - 14) / 46, r = 120 + t * 260;
          return <path key={i} transform={`translate(${450 + Math.cos(a) * r} ${420 + Math.sin(a) * r * 0.7}) rotate(${random(`r${i}`) * 90}) scale(${1 - t})`}
            d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill="#FFE98A" stroke="#7A5A10" strokeWidth={3} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
