import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m06_crack: a jagged vertical crack tears down from top to bottom with a white-hot core and an orange glow, chips and
// dust fly off both sides, then the glow cools to a thin dark seam. 360x1600, 60 fps, 90 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const PTS = Array.from({ length: 33 }, (_, i) => [180 + (i === 0 || i === 32 ? 0 : (random(`x${i}`) - 0.5) * 70), i * 50] as const);
const D = PTS.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y}`).join(' ');

export const M06Crack: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 18], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
  const heat = interpolate(f, [16, 60], [1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={360} height={1600} viewBox="0 0 360 1600" opacity={draw > 0.01 ? 1 : 0}>
        <path d={D} fill="none" stroke="#ff8a1f" strokeOpacity={0.7 * heat} strokeWidth={46} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}
          style={{ filter: 'blur(14px)' }} />
        <path d={D} fill="none" stroke="#1a1208" strokeWidth={14} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={D} fill="none" stroke="#fff6d8" strokeOpacity={heat} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        {Array.from({ length: 40 }, (_, i) => {
          const t0 = (i / 40) * 18;
          const k = interpolate(f, [t0, t0 + 40], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
          if (k <= 0 || k >= 1) return null;
          const side = i % 2 ? 1 : -1;
          const y0 = (i / 40) * 1600;
          const vx = side * (60 + random(`v${i}`) * 110), vy = -40 - random(`u${i}`) * 80;
          const x = 180 + vx * k, y = y0 + vy * k + 260 * k * k;
          const s = 4 + random(`s${i}`) * 9;
          return <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={i % 3 ? '#d9c7a3' : '#ffb24a'} opacity={1 - k} transform={`rotate(${k * 300 * side} ${x} ${y})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
