import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { Flag } from './Flags';
import { C } from './theme';

// t10_gunboat (line 17, "French जंगी जहाज़ Bangkok तक चढ़ आए", the 1893 Paknam crisis): a French steam gunboat of the 1890s,
// side view, bow to the right. Black hull with a red boot-top, white upperworks, one buff funnel puffing smoke, two masts,
// a bow gun, and the tricolour flapping at the stern. It bobs and pitches on scrolling cartoon waves with a bow splash and a
// foam wake. Transparent, 1200x700, 60 fps, 240 frames (it sails in place; the edit moves it).

const W = 1200, WL = 470;

export const T10Gunboat: React.FC<{ water?: boolean }> = ({ water = true }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 26) * 8, pitch = Math.sin(f / 34) * 1.6;
  const wave = (y: number, amp: number, len: number, speed: number, col: string, k: number) => {
    let d = `M -40 ${y}`;
    for (let x = -40; x <= W + 40; x += 20) d += ` L ${x} ${y + Math.sin((x + f * speed + k) / len) * amp}`;
    return <path d={`${d} L ${W + 40} 760 L -40 760 Z`} fill={col} />;
  };
  const puffs = Array.from({ length: 7 }).map((_, i) => {
    const t = ((f + i * 18) % 126) / 126;
    const x = 560 - t * 330 + Math.sin(t * 6 + i) * 10, y = 175 - t * 150;
    return <circle key={i} cx={x} cy={y} r={26 + t * 60} fill={i % 2 ? '#6A6A72' : '#8A8A92'} opacity={(1 - t) * 0.75} />;
  });
  const foam = Array.from({ length: 14 }).map((_, i) => {
    const t = ((f * 1.5 + i * 40) % 560) / 560;
    return <ellipse key={i} cx={260 - t * 320} cy={WL + 18 + random(`fy${i}`) * 20} rx={30 + t * 30} ry={8} fill="#fff" opacity={(1 - t) * 0.85} />;
  });
  const flap = (i: number) => Math.sin(f / 5 + i) * 4;
  return (
    <AbsoluteFill>
      <svg width={W} height={700}>
        {puffs}
        <g transform={`translate(0 ${bob}) rotate(${pitch} 600 ${WL})`}>
          {/* masts and rigging */}
          <path d={`M 380 ${WL - 60} V 70 M 820 ${WL - 60} V 110 M 380 70 L 150 ${WL - 30} M 380 70 L 820 110 M 820 110 L 1060 ${WL - 40}`}
            stroke={C.ink} strokeWidth={8} fill="none" />
          <path d={`M 340 120 H 420 M 790 150 H 850`} stroke={C.ink} strokeWidth={10} />
          {/* funnel */}
          <path d={`M 520 ${WL - 120} L 530 180 H 600 L 610 ${WL - 120} Z`} fill="#D8B26A" stroke={C.ink} strokeWidth={9} />
          <rect x={526} y={172} width={78} height={30} fill="#1D1430" />
          {/* superstructure */}
          <rect x={430} y={WL - 150} width={330} height={100} rx={10} fill="#F4F1EA" stroke={C.ink} strokeWidth={9} />
          {[460, 520, 580, 640, 700].map((x) => <circle key={x} cx={x} cy={WL - 105} r={13} fill="#3A4A6A" stroke={C.ink} strokeWidth={5} />)}
          <rect x={660} y={WL - 205} width={110} height={60} rx={8} fill="#F4F1EA" stroke={C.ink} strokeWidth={8} />
          {/* bow gun */}
          <rect x={870} y={WL - 110} width={70} height={46} rx={10} fill="#3A3F48" stroke={C.ink} strokeWidth={7} />
          <path d={`M 935 ${WL - 92} L 1035 ${WL - 102}`} stroke={C.ink} strokeWidth={20} strokeLinecap="round" />
          <path d={`M 935 ${WL - 92} L 1035 ${WL - 102}`} stroke="#555B66" strokeWidth={9} strokeLinecap="round" />
          {/* hull: black above, red boot-top at the waterline */}
          <path d={`M 120 ${WL - 70} L 1110 ${WL - 80} Q 1090 ${WL - 10} 1040 ${WL + 40} L 220 ${WL + 40} Q 150 ${WL} 120 ${WL - 70} Z`} fill="#22232A" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
          <path d={`M 150 ${WL + 5} L 1075 ${WL + 5} Q 1060 ${WL + 25} 1040 ${WL + 40} L 220 ${WL + 40} Q 180 ${WL + 25} 150 ${WL + 5} Z`} fill="#B5232B" />
          <path d={`M 130 ${WL - 62} L 1105 ${WL - 72}`} stroke="#F2C24B" strokeWidth={6} />
          {/* stern flag on its staff */}
          <path d={`M 140 ${WL - 70} L 120 ${WL - 230}`} stroke={C.ink} strokeWidth={8} />
          <g transform={`translate(122 ${WL - 230}) scale(2.2)`}>
            <g transform={`skewY(${flap(0)})`}><Flag id="france" /></g>
          </g>
        </g>
        {water && (
          <g>
            {wave(WL + 10, 10, 60, 3, '#3C7FB5', 0)}
            {foam}
            <path d={`M 1080 ${WL + 10 + bob} q 50 -40 70 -10 q -30 0 -40 30 Z`} fill="#fff" opacity={0.9} />
            {wave(WL + 34, 12, 48, 5, '#2F6A9C', 40)}
            {wave(WL + 70, 9, 70, 7, '#255A87', 90)}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
