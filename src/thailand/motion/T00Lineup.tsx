import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CountryChar, Mood } from './Char';
import { FlagBall } from './Flags';
import { C } from './theme';

// t00_lineup: a test card, every character and mood, the three flag-balls. Not used in the edit.
export const T00Lineup: React.FC = () => {
  const f = useCurrentFrame();
  const moods: Mood[] = ['happy', 'sad', 'angry', 'shifty', 'scared', 'smug'];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={1080} height={1920}>
        {(['britain', 'france', 'siam'] as const).map((who, r) => moods.map((m, i) => (
          <g key={`${who}${m}`} transform={`translate(${100 + (i % 3) * 330} ${330 + r * 560 + Math.floor(i / 3) * 280})`}>
            <g transform="scale(0.5)">
              <CountryChar who={who} size={420} f={f} mood={m} look={i % 2 ? 0.6 : -0.4} talk={i === 0 ? 0.6 : 0}
                armL={{ x: -150, y: i === 2 ? -200 : 120, flex: i === 2 ? 1 : 0, bend: -1 }} armR={{ x: 160, y: i === 2 ? -200 : 100, flex: i === 2 ? 1 : 0 }} blinkSeed={m} />
            </g>
          </g>
        )))}
        <g transform="translate(200 1820)"><FlagBall id="britain" r={60} uid="a" /></g>
        <g transform="translate(540 1820)"><FlagBall id="france" r={60} uid="b" /></g>
        <g transform="translate(880 1820)"><FlagBall id="siam" r={60} uid="c" /></g>
      </svg>
    </AbsoluteFill>
  );
};
