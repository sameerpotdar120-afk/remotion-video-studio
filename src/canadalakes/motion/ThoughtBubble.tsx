import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Reference 29.6–33.3 s: a cartoon thought bubble grows out of two small circles (each pops 4 frames apart), then
 *  three dots pulse in turn ("they ran out of ideas"). Drawn as SVG; size is the bubble's width in px. */
export const ThoughtBubble: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 860 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: f - d, fps, config: { damping: 10, stiffness: 200 } });
  const lobes = [[150, 92, 70], [95, 110, 52], [205, 108, 55], [120, 70, 50], [185, 66, 52], [150, 128, 48]];
  return (
    <svg style={{ position: 'absolute', left: x - size / 2, top: y - size * 0.62, overflow: 'visible', filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.45))' }} width={size} height={size * 0.75} viewBox="0 0 300 225">
      <circle cx={70} cy={215} r={9 * p(0)} fill="#fff" stroke="#111" strokeWidth={4} />
      <circle cx={92} cy={190} r={16 * p(4)} fill="#fff" stroke="#111" strokeWidth={4} />
      <g transform={`translate(150 100) scale(${p(8)}) translate(-150 -100)`}>
        {lobes.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" stroke="#111" strokeWidth={5} />)}
        {lobes.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r - 3} fill="#fff" />)}
        {[0, 1, 2].map((i) => {
          const b = Math.max(0, Math.sin(((f - 14 - i * 6) / fps) * Math.PI * 2.2));
          return <circle key={`d${i}`} cx={118 + i * 32} cy={98 - b * 8 * (f > 14 ? 1 : 0)} r={13 * interpolate(f, [12 + i * 3, 18 + i * 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} fill="#111" />;
        })}
      </g>
    </svg>
  );
};
