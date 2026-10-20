import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { PoleFlag } from './Flags';
import { clamp, wobble } from './theme';

// w14_flag_swap (lines 6, 7, 9; the reference's 30.5–31.3 and 45.6–47.3 s): the flag on the beach is yanked out and
// flung away to the top-right with a spin, then the other country's flag is thrown in from the top-left, spins and
// stabs into the ground with a wobble, and waves. With `old` = null the first throw lands on bare ground. Transparent,
// 1080×1920, 60 fps; the pole's foot is at `at`. `yank` = frame the old flag goes, `plant` = frame the new one lands.
export const W14FlagSwap: React.FC<{ old?: 'canada' | 'denmark' | null; next?: 'canada' | 'denmark'; at?: [number, number]; yank?: number; plant?: number; h?: number }> = ({
  old = 'denmark', next = 'canada', at = [540, 1330], yank = 10, plant = 40, h = 760,
}) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [yank, yank + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const inn = interpolate(f, [plant - 16, plant], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const wob = wobble(f, plant, 2.4, 3.5) * 10;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {old && out < 1 && (
          <g transform={`translate(${at[0] + out * 700} ${at[1] - out * 1500 - Math.sin(out * Math.PI) * 200}) rotate(${out * 220})`}>
            <PoleFlag kind={old} f={f} h={h} />
          </g>
        )}
        {f >= plant - 16 && (
          <g transform={`translate(${at[0] - (1 - inn) * 800} ${at[1] - (1 - inn) * 1400}) rotate(${-200 * (1 - inn) + wob})`}>
            <PoleFlag kind={next} f={f} h={h} />
          </g>
        )}
        {f >= plant && f < plant + 20 && Array.from({ length: 6 }, (_, i) => {
          const t = (f - plant) / 20, a = Math.PI + (i / 5) * Math.PI;
          return <circle key={i} cx={at[0] + Math.cos(a) * 80 * t} cy={at[1] + Math.sin(a) * 30 * t} r={10 * (1 - t) + 2} fill="#8C7B66" opacity={1 - t} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
