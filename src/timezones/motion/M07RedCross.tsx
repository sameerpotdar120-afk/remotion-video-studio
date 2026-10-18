import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m07_red_cross: a big brush-stroke red ✕ slashes on (two strokes), punches from 1.35× to 1×, shakes, and glows. Holds.
// 520x520, 60 fps, 90 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M07RedCross: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 7], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const b = interpolate(f, [5, 12], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const s = interpolate(f, [10, 22], [1.35, 1], { ...c, easing: Easing.out(Easing.back(3)) });
  const shake = f > 10 && f < 34 ? Math.sin(f * 2.3) * 8 * interpolate(f, [10, 34], [1, 0], c) : 0;
  const stroke = (d: string, k: number) => k < 0.01 ? null : (
    <>
      <path d={d} fill="none" stroke="#5a0008" strokeWidth={78} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} transform="translate(0 8)" />
      <path d={d} fill="none" stroke="#FF2A3A" strokeWidth={64} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`}
        style={{ filter: 'drop-shadow(0 0 18px rgba(255,42,58,0.75))' }} />
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.9} 1`} transform="translate(-6 -10)" />
    </>
  );
  return (
    <AbsoluteFill>
      <svg width={520} height={520} viewBox="0 0 520 520">
        <g transform={`translate(${260 + shake} 260) scale(${s}) translate(-260 -260)`}>
          {stroke('M 110 105 Q 260 250 410 415', a)}
          {stroke('M 415 110 Q 255 265 105 410', b)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
