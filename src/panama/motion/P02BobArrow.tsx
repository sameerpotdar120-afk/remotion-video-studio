import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { pop, ramp } from './theme';

// p02_bob_arrow (line 1; the reference's 0–0.9 s): a thick red arrow with a white outline pops in (overshoot), points
// down-left at the gold ship and bobs along its own axis (±10 px, ~0.33 s period) with a slight squash on each push,
// then fades out over 4 frames at `out`. Transparent, 300×300, 60 fps; the tip is at (70, 230).
export const P02BobArrow: React.FC<{ out?: number }> = ({ out = 52 }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 10, 2.2);
  const b = Math.sin(f / 3.2);
  const d = 10 * b;
  const a = 1 - ramp(f, out, out + 4);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={300} height={300}>
        <g transform={`translate(70 230) rotate(-45) translate(${-d * 0.2} ${d}) scale(${s * (1 + 0.04 * b)} ${s * (1 - 0.04 * b)})`}>
          <path d="M 0 0 L -38 46 L -16 46 L -16 170 L 16 170 L 16 46 L 38 46 Z" transform="rotate(180)" fill="#E5262B" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
          <path d="M 0 0 L -38 46 L -16 46 L -16 170 L 16 170 L 16 46 L 38 46 Z" transform="rotate(180)" fill="#E5262B" />
          <path d="M -8 -60 L -8 -150" stroke="#fff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
