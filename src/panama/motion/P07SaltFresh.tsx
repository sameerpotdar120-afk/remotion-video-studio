import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { pop, ramp, wobble } from './theme';

// p07_salt_fresh (line 2, "ये नहर समुंदर के पानी से चलती ही नहीं… मीठे पानी की झील से"; the reference's 9.6–12.0 s):
// a curved "salt water" arrow draws in from each sea toward the canal, a red ⊗ slams onto each arrow head with a
// shake, then a green ✓ "मीठा पानी" badge pops in the middle with a ring burst and a soft pulse. Transparent,
// 1080×1080, 60 fps. `a` / `b` are the two sea points, `c` the lake (in this box).
type P = [number, number];
export const P07SaltFresh: React.FC<{ a?: P; b?: P; c?: P; salt?: string; fresh?: string; check?: number }> = ({
  a = [300, 140], b = [800, 940], c = [520, 520], salt = 'खारा पानी', fresh = 'मीठा पानी', check = 46,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const arrow = (from: P, to: P, at: number, key: string) => {
    const k = ramp(f, at, at + 14);
    const mx = (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.2, my = (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.2;
    const ex = from[0] + (to[0] - from[0]) * 0.72, ey = from[1] + (to[1] - from[1]) * 0.72;
    const len = 600;
    const x = pop(f, at + 14, at + 22, 2.6), sh = wobble(f, at + 18, 4, 8) * 6;
    return (
      <g key={key}>
        <path d={`M ${from[0]} ${from[1]} Q ${mx} ${my} ${ex} ${ey}`} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray={`${len * k} ${len}`} strokeLinecap="round" opacity={0.9} />
        <text x={from[0]} y={from[1] - 22} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={34} fill="#fff" stroke="#0E1620" strokeWidth={8} paintOrder="stroke" opacity={k}>{salt}</text>
        {x > 0 && (
          <g transform={`translate(${ex + sh} ${ey}) scale(${x})`}>
            <circle r={34} fill="#E5262B" stroke="#fff" strokeWidth={6} />
            <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };
  const cs = pop(f, check, check + 10, 2.4);
  const burst = ramp(f, check, check + 24);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {arrow(a, c, 0, 'a')}
        {arrow(b, c, 10, 'b')}
        {cs > 0 && (
          <g transform={`translate(${c[0]} ${c[1]}) scale(${cs * (1 + 0.04 * Math.sin(f / 10))})`}>
            <circle r={60 + 90 * burst} fill="none" stroke="#35C46A" strokeWidth={6} opacity={1 - burst} />
            <circle r={46} fill="#35C46A" stroke="#fff" strokeWidth={7} />
            <path d="M -20 0 L -6 16 L 22 -16" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text y={98} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={48} fill="#fff" stroke="#0E1620" strokeWidth={10} paintOrder="stroke">{fresh}</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
