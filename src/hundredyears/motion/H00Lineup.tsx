import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BannerPin } from './Heraldry';
import { Horse, PP0, Plush, Who } from './Plush';

// h00_lineup: a test card with every character, the horse and the banner pins. Not used in the edit.
export const H00Lineup: React.FC = () => {
  const f = useCurrentFrame();
  const W: Who[] = ['knightEN', 'knightFR', 'edward', 'philip', 'charles', 'joan', 'joanArmor', 'judge', 'archer'];
  return (
    <AbsoluteFill style={{ background: '#6E8C9A' }}>
      <svg width={1080} height={1920}>
        {W.map((w, i) => (
          <g key={w} transform={`translate(${180 + (i % 3) * 360} ${560 + Math.floor(i / 3) * 520}) scale(0.4)`}>
            <Plush who={w} f={f} pose={{ ...PP0, arms: i % 2 ? 1 : 0, rx: 170, ry: -160, mouth: i % 3 ? 'smile' : 'oh' }} shield={w.startsWith('knight')} banner={w === 'joanArmor' ? 1 : 0}
              bow={w === 'archer' ? 0.8 : 0} scroll={w === 'judge'} seed={w} />
          </g>
        ))}
        <g transform="translate(540 1830) scale(0.35)"><Horse f={f} run={1} /></g>
        <g transform="translate(160 1800)"><BannerPin id="england" w={110} uid="a" wave={0} /></g>
        <g transform="translate(920 1800)"><BannerPin id="france" w={110} uid="b" wave={0} /></g>
        <g transform="translate(920 1660)"><BannerPin id="burgundy" w={110} uid="c" wave={0} /></g>
      </svg>
    </AbsoluteFill>
  );
};
