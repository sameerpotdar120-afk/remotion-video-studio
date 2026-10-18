import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m16_sparkle: a landing hit: a quick white flash ring plus a burst of four-point sparkles and small dots that fly out,
// twinkle and fade. Colour by prop. 640x640, 60 fps, 72 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const star = (r: number) => `M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`;

export const M16Sparkle: React.FC<{ color?: string }> = ({ color = '#FFE11A' }) => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [0, 22], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={640} height={640} viewBox="0 0 640 640">
        <circle cx={320} cy={320} r={40 + ring * 230} fill="none" stroke="#ffffff" strokeWidth={18 * (1 - ring) + 1} opacity={1 - ring} />
        <circle cx={320} cy={320} r={90} fill={color} opacity={interpolate(f, [0, 4, 16], [0, 0.6, 0], c)} style={{ filter: 'blur(20px)' }} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.3;
          const d = 80 + random(`d${i}`) * 200;
          const k = interpolate(f, [0, 34 + random(`t${i}`) * 20], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
          const tw = 0.6 + 0.4 * Math.sin(f / 3 + i);
          const r = (i % 3 ? 14 : 26) * (1 - k * 0.6);
          return (
            <g key={i} transform={`translate(${320 + Math.cos(a) * d * k} ${320 + Math.sin(a) * d * k}) rotate(${k * 90})`} opacity={(1 - k) * tw}>
              {i % 2 ? <path d={star(r)} fill={i % 4 === 1 ? '#ffffff' : color} /> : <circle r={r * 0.35} fill="#ffffff" />}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
