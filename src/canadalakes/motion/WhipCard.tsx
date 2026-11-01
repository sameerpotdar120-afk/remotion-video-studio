import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

/** Reference 27.43 s and 28.63 s: the next picture whips in from the right as a tilted card with a white border; the move
 *  takes 5 frames with heavy horizontal motion blur (the old card leaves left the same way), then settles with a
 *  2-degree tilt and a slow push. `at` is the frame the whip starts. */
export const WhipCard: React.FC<{ at?: number; dur?: number; tilt?: number; children: React.ReactNode; out?: number }> = ({ at = 0, dur = 5, tilt = 2, children, out }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  const outP = out == null ? 0 : interpolate(f, [out, out + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * t });
  if (f < at) return null;
  const x = (1 - inP) * 1300 - outP * 1300;
  const blur = (inP < 1 ? (1 - inP) * 38 : 0) + outP * 38;
  const push = 1 + (f - at) * 0.0009;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '104%', height: '62%', transform: `translateX(${x}px) rotate(${-tilt * inP}deg) scale(${push})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        border: '14px solid #fff', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', overflow: 'hidden', background: '#222' }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
