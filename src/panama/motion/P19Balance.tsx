import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { pop } from './theme';

// p19_balance (line 6, "मतलब एक ही झील पर ships का business भी है, और पीने का पानी भी"): a weighing scale pops in over
// the lake: a bright beam on a post, a pan hanging from each end. A small ship drops into the left pan, a water drop
// into the right, each landing with a bounce; the beam keeps seesawing gently between them (never settling), the
// pans swinging on their strings. Tags "ships का business" and "पीने का पानी" under the pans. Transparent, 900×700.
export const P19Balance: React.FC<{ left?: string; right?: string }> = ({ left = 'ships का business', right = 'पीने का पानी' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 12, 2);
  const tilt = 8 * Math.sin(f / 22) + (f < 40 ? 0 : 0);
  const pan = (side: -1 | 1, label: string, icon: React.ReactNode, at: number) => {
    const ex = 450 + side * 255 * Math.cos((tilt * Math.PI) / 180), ey = 220 + side * 255 * Math.sin((tilt * Math.PI) / 180);
    const sw = Math.sin(f / 14 + side) * 4;
    const drop = pop(f, at, at + 14, 2.6);
    return (
      <g key={side}>
        <path d={`M ${ex} ${ey} L ${ex - 80 + sw} ${ey + 160} M ${ex} ${ey} L ${ex + 80 + sw} ${ey + 160}`} stroke="#fff" strokeWidth={4} />
        <path d={`M ${ex - 110 + sw} ${ey + 160} Q ${ex + sw} ${ey + 230} ${ex + 110 + sw} ${ey + 160} Z`} fill="#FFD53D" stroke="#C99A16" strokeWidth={5} />
        <g transform={`translate(${ex + sw} ${ey + 150 - (1 - drop) * 300}) scale(${drop})`}>{icon}</g>
        <text x={ex + sw} y={ey + 280} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={40} fill="#fff" stroke="#0E1620" strokeWidth={10} paintOrder="stroke">{label}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ transform: `scale(${s})` }}>
      <svg width={900} height={700}>
        <rect x={440} y={220} width={20} height={380} rx={10} fill="#E9EDF0" stroke="#7D8389" strokeWidth={4} />
        <path d="M 360 610 L 540 610 L 500 580 L 400 580 Z" fill="#E9EDF0" stroke="#7D8389" strokeWidth={4} />
        <g transform={`rotate(${tilt} 450 220)`}><rect x={185} y={210} width={530} height={20} rx={10} fill="#FFD53D" stroke="#C99A16" strokeWidth={4} /></g>
        <circle cx={450} cy={220} r={18} fill="#fff" stroke="#7D8389" strokeWidth={4} />
        {pan(-1, left, <g><path d="M -60 0 L 60 0 L 74 -18 L 74 10 Q 0 22 -56 14 Z" fill="#8E1E22" /><rect x={-40} y={-26} width={60} height={22} fill="#2F6DB5" /><rect x={-58} y={-34} width={16} height={34} fill="#F2F2EE" /></g>, 14)}
        {pan(1, right, <path d="M 0 -60 C 24 -24 34 0 0 22 C -34 0 -24 -24 0 -60 Z" fill="#6ED3FF" stroke="#fff" strokeWidth={5} />, 30)}
      </svg>
    </AbsoluteFill>
  );
};
