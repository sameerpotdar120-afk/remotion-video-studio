import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m04_war_splat: black spiky burst that pops onto a country and keeps smoking, rotating slowly.
// 420x420, 60 fps, 240 frames. Transparent. The smoke loops after frame 60.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M04WarSplat: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 8, 14], [0, 1.18, 1], { ...c, easing: Easing.out(Easing.quad) });
  const spikes = 30;
  let d = '';
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 70 + random(`s${i}`) * 55 : 26 + random(`s${i}`) * 10;
    d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1);
  }
  d += 'Z';
  const smoke = Array.from({ length: 14 }, (_, i) => {
    const period = 90;
    const t = ((f + i * (period / 14)) % period) / period;
    const on = f > 4 ? 1 : 0;
    return {
      x: (random(`px${i}`) - 0.5) * 60 + t * 40 * (random(`pd${i}`) - 0.3),
      y: -t * 170,
      r: 18 + t * 46,
      o: on * interpolate(t, [0, 0.15, 1], [0, 0.55, 0]),
    };
  });
  const flash = interpolate(f, [0, 3, 12], [0, 1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={420} height={420} viewBox="-210 -230 420 420">
        <defs>
          <filter id="soft"><feGaussianBlur stdDeviation={7} /></filter>
          <radialGradient id="ember">
            <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ff3d00" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={110} fill="url(#ember)" opacity={flash} />
        <g transform={`rotate(${f * 0.25}) scale(${pop})`}>
          <path d={d} fill="#0d0b0b" stroke="#2a201c" strokeWidth={3} />
          <circle r={30} fill="#1a1412" />
          <circle r={14} fill="#ff5a1f" opacity={0.35 + 0.25 * Math.sin(f / 6)} filter="url(#soft)" />
        </g>
        <g filter="url(#soft)">
          {smoke.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#6d6a68" opacity={s.o} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
