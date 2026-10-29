import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c08_diagonal_wipe (line 5, the reference's 0:32: from the dark red glitter to white paper; and the loop's way back
// to the satellite): the next shot (`next`) sweeps in over `children` behind a soft diagonal edge travelling from the
// top-left to the bottom-right (or `reverse`) in `dur` frames from `at`, with a faint light band on the edge.
export const C08DiagonalWipe: React.FC<{ children: React.ReactNode; next: React.ReactNode; at?: number; dur?: number; reverse?: boolean; soft?: number }> = ({ children, next, at = 0, dur = 18, reverse, soft = 10 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [-soft, 100 + soft], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const dir = reverse ? 315 : 135;
  const m = `linear-gradient(${dir}deg, #000 ${p - soft}%, transparent ${p + soft}%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      {p > -soft && (
        <AbsoluteFill style={{ WebkitMaskImage: m, maskImage: m }}>
          {next}
          <AbsoluteFill style={{ background: `linear-gradient(${dir}deg, transparent ${p - 2}%, rgba(255,255,255,0.35) ${p + 2}%, transparent ${p + 6}%)` }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
