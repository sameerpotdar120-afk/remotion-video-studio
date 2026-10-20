import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { pop } from './theme';

// w09_year_type (lines 4, 6, 10: "1953", "1984", "2022"; the reference's 16.2, 26.0 and 55.0 s): a big year types in one
// digit at a time, each digit popping from small, slightly tilted; at `out` the digits wipe off left to right. Colour per
// era (the reference: dark grey on parchment, yellow on satellite). Transparent, 1080×500, 60 fps.
export const W09YearType: React.FC<{ year?: string; color?: string; out?: number; tilt?: number; size?: number }> = ({ year = '1984', color = '#F5F23A', out = 90, tilt = -4, size = 250 }) => {
  useFonts();
  const f = useCurrentFrame();
  const ch = Array.from(year);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `rotate(${tilt}deg)`, display: 'flex', fontFamily: NUM, fontSize: size, lineHeight: 1, color, textShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
        {ch.map((c, i) => {
          const s = pop(f, i * 4, i * 4 + 10, 2.4) * (1 - pop(f, out + i * 3, out + i * 3 + 8, 1.2));
          return <span key={i} style={{ display: 'inline-block', transform: `scale(${Math.max(0, s)})`, opacity: s > 0.02 ? 1 : 0 }}>{c}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
