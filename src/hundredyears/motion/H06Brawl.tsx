import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { BannerPin } from './Heraldry';
import { clamp, pop } from './theme';
import { interpolate } from 'remotion';

// h06_brawl (line 4, "इसी एक ज़िद से शुरू हुई Hundred Years' War"; the reference's 20.5–22.2 s): a cartoon brawl cloud.
// Grey dust puffs boil in place while the St George and fleur-de-lis banners dart around it, jumping to new spots every
// 2–3 frames with speed lines, as if the two sides were scrapping inside. Transparent, 900×900, 60 fps, 150 frames.
export const H06Brawl: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 12, 1.6) * (1 - interpolate(f, [130, 150], [0, 1], clamp));
  const tick = Math.floor(f / 3);
  const puff = (i: number) => {
    const a = (i / 9) * Math.PI * 2 + Math.sin(f / 10 + i) * 0.3;
    const r = 150 + Math.sin(f / 5 + i * 2) * 25;
    return <circle key={i} cx={450 + Math.cos(a) * r} cy={450 + Math.sin(a) * r * 0.7} r={95 + Math.sin(f / 4 + i) * 14} fill={i % 2 ? '#D9D6CF' : '#C4C0B7'} stroke="#8E8A82" strokeWidth={6} />;
  };
  const flag = (id: 'england' | 'france', j: number) => {
    const x = 250 + random(`${id}x${tick}${j}`) * 400, y = 280 + random(`${id}y${tick}${j}`) * 320;
    const px = 250 + random(`${id}x${tick - 1}${j}`) * 400, py = 280 + random(`${id}y${tick - 1}${j}`) * 320;
    return (
      <g key={`${id}${j}`}>
        <path d={`M ${px} ${py} L ${x} ${y}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
        <g transform={`translate(${x} ${y}) rotate(${(random(`${id}r${tick}${j}`) - 0.5) * 40})`}><BannerPin id={id} w={110} uid={`${id}${j}`} wave={Math.sin(f) * 6} /></g>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <svg width={900} height={900}>
        <g transform={`translate(450 450) scale(${k}) translate(-450 -450)`}>
          {Array.from({ length: 9 }).map((_, i) => puff(i))}
          <circle cx={450} cy={450} r={150} fill="#D9D6CF" />
          {flag('england', 0)}{flag('france', 0)}{flag('england', 1)}{flag('france', 1)}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = random(`l${tick}${i}`) * Math.PI * 2;
            return <path key={i} d={`M ${450 + Math.cos(a) * 230} ${450 + Math.sin(a) * 170} l ${Math.cos(a) * 70} ${Math.sin(a) * 50}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
