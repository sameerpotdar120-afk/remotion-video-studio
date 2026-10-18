import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, pop, wobble } from './theme';

// t08_padlock (line 15, "Chao Phraya नदी की घाटी को कोई नहीं छुएगा"): a gold padlock pops in open, its shackle drops shut with
// a click squash, and cyan glow rings pulse out (the protected core). Transparent, 600x700, 60 fps, 150 frames.
export const T08Padlock: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 14, 2);
  const shut = interpolate(f, [22, 30], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sq = 1 - wobble(f, 30, 3, 7) * 0.12;
  const ring = (i: number) => {
    const t = ((f - 30 - i * 25) % 75) / 75;
    return f < 30 + i * 25 ? null : <circle key={i} cx={300} cy={420} r={150 + t * 170} fill="none" stroke={C.cyan} strokeWidth={10 * (1 - t)} opacity={1 - t} />;
  };
  return (
    <AbsoluteFill>
      <svg width={600} height={700}>
        <defs>
          <filter id="pg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={18} /></filter>
          <linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD86A" /><stop offset="1" stopColor="#C98A1E" /></linearGradient>
        </defs>
        {[0, 1, 2].map(ring)}
        <g transform={`translate(300 560) scale(${k / Math.sqrt(sq)} ${k * sq}) translate(-300 -560)`}>
          <circle cx={300} cy={420} r={160} fill={C.cyan} opacity={f > 30 ? 0.35 : 0} filter="url(#pg)" />
          <path d={`M 205 ${330 - (1 - shut) * 70} V ${250 - (1 - shut) * 70} A 95 95 0 0 1 395 ${250 - (1 - shut) * 70} V ${290 - (1 - shut) * 30}`}
            fill="none" stroke={C.ink} strokeWidth={62} strokeLinecap="round" />
          <path d={`M 205 ${330 - (1 - shut) * 70} V ${250 - (1 - shut) * 70} A 95 95 0 0 1 395 ${250 - (1 - shut) * 70} V ${290 - (1 - shut) * 30}`}
            fill="none" stroke="#B9C2CC" strokeWidth={40} strokeLinecap="round" />
          <rect x={150} y={310} width={300} height={250} rx={46} fill="url(#pb)" stroke={C.ink} strokeWidth={14} />
          <path d="M 185 340 H 415" stroke="#FFF1B8" strokeWidth={12} strokeLinecap="round" opacity={0.7} />
          <circle cx={300} cy={420} r={34} fill={C.ink} />
          <path d="M 288 430 L 278 500 H 322 L 312 430 Z" fill={C.ink} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
