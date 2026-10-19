import React from 'react';
import { AbsoluteFill, interpolateColors, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, pop, ramp, wobble } from './theme';

// c02_glow_word ("सुनने में easy लगता है, पर है नहीं"; the reference's 4.0–6.8 s): a word slams in from the top-left with
// an overshoot, glowing green ("seems right"); at `flip` it turns red with a red bloom, a "?" pops on, it wobbles, and
// at `punch` it scales up as the scene cuts. Transparent, 1080×700, 60 fps. `text` is the word (Hindi or English).
export const C02GlowWord: React.FC<{ text?: string; flip?: number; punch?: number; tilt?: number }> = ({ text = 'EASY', flip = 84, punch = 160, tilt = -8 }) => {
  useFonts();
  const f = useCurrentFrame();
  const inn = pop(f, 0, 20, 1.6);
  const fl = ramp(f, flip, flip + 8);
  const col = interpolateColors(fl, [0, 1], [C.green, C.red]);
  const glow = interpolateColors(fl, [0, 1], ['rgba(71,227,107,0.85)', 'rgba(232,38,43,0.9)']);
  const q = pop(f, flip + 4, flip + 18, 2.6);
  const wob = wobble(f, flip, 3.2, 5) * 6;
  const pu = 1 + 0.25 * ramp(f, punch, punch + 10);
  const x = (1 - inn) * -700, y = (1 - inn) * -500;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `translate(${x}px, ${y}px) rotate(${tilt + wob}deg) scale(${(0.6 + 0.4 * inn) * pu})`, display: 'flex', alignItems: 'center',
        fontFamily: UI, fontWeight: 800, fontSize: 210, lineHeight: 1, color: '#fff', WebkitTextStroke: `10px ${col}`, paintOrder: 'stroke fill',
        textShadow: `0 0 30px ${glow}, 0 0 80px ${glow}, 0 0 140px ${glow}` }}>
        <span style={{ color: '#fff' }}>{text}</span>
        <span style={{ display: 'inline-block', marginLeft: 12, transform: `scale(${q}) rotate(${(1 - q) * 40}deg)`, opacity: q > 0 ? 1 : 0, color: '#fff' }}>?</span>
      </div>
    </AbsoluteFill>
  );
};
