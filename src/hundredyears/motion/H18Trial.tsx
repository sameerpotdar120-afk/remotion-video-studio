import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { C, clamp, pop } from './theme';

// h18_trial (line 11, "Rouen में अदालत बैठी, और इल्ज़ाम लगा…"; the reference's 79.3–87.0 s): the hooded judge stands on his
// platform holding the scroll, reading (mouth talks in `talk`) and leaning in sternly. A big parchment slides up beside
// him and a red tick stamps onto it for each charge (`ticks` frames): men's clothes (a tunic icon), misleading the people
// (a crowd icon). Text-free. Transparent (over the town square), 1080×1500, 60 fps, 300 frames.
export const H18Trial: React.FC<{ talk?: [number, number]; ticks?: number[] }> = ({ talk = [20, 260], ticks = [80, 170] }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 1.8);
  const tk = f > talk[0] && f < talk[1] ? Math.max(0, Math.sin(f * 0.45) * 0.6 + 0.25) : 0;
  const card = interpolate(f, [30, 50], [0, 1], clamp);
  const icons = [
    <path key="t" d="M -40 -40 L -16 -50 Q 0 -40 16 -50 L 40 -40 L 54 -10 L 34 0 L 30 50 L -30 50 L -34 0 L -54 -10 Z" fill="#7A8DBA" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />,
    <g key="c" fill="#C9B48E" stroke={C.ink} strokeWidth={5}>{[-36, 0, 36].map((x) => <g key={x}><circle cx={x} cy={-20} r={16} /><path d={`M ${x - 20} 40 Q ${x - 20} 0 ${x} 0 Q ${x + 20} 0 ${x + 20} 40 Z`} /></g>)}</g>,
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1500}>
        <g transform={`translate(760 1450) scale(${0.95 * s})`}>
          <Plush who="judge" seed="jd" f={f} scroll pose={{ ...PP0, arms: 1, rx: -110, ry: -130, lx: -150, ly: 100, mouth: 'frown', talk: tk, brow: -0.8, look: -0.7, lean: -3 + Math.sin(f / 30) * 2 }} />
        </g>
        <g transform={`translate(260 ${1400 - card * 760})`} opacity={card}>
          <rect x={-200} y={-260} width={400} height={520} rx={16} fill="#F6EBCF" stroke="#8A6A3A" strokeWidth={8} />
          {icons.map((ic, i) => {
            const k = pop(f, ticks[i] ?? 9999, (ticks[i] ?? 9999) + 12, 2.6);
            return (
              <g key={i} transform={`translate(-60 ${-130 + i * 220})`}>
                {ic}
                <g transform={`translate(150 0) scale(${k}) rotate(-8)`}><path d="M -46 0 L -14 34 L 50 -40" stroke="#C8102E" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
