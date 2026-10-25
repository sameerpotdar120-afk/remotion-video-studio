import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, pop, wobble } from './theme';

// g13_alert (line 7, "दुनिया का सबसे बड़ा island, लगभग पूरा बर्फ़ से ढका हुआ"; the reference's red "!"): a red "!"
// in a white-rimmed disc pops up (back-ease from 0 in 9 frames), shakes like an alarm for half a second, then pulses
// with rings going out. Transparent, 400×400, 60 fps; centred.
export const G13Alert: React.FC<{ mark?: string; color?: string }> = ({ mark = '!', color = C.red }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 9, 3);
  const shake = wobble(f, 6, 7, 5) * 12;
  const pulse = (f % 40) / 40;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {f > 10 && <div style={{ position: 'absolute', width: 200 + 160 * pulse, height: 200 + 160 * pulse, borderRadius: '50%', border: `6px solid ${color}`, opacity: 1 - pulse }} />}
      <div style={{ width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #FF6A6E, ${color} 55%, ${C.redDeep})`, border: '10px solid #fff',
        boxShadow: `0 0 30px ${color}, 0 12px 18px rgba(0,0,0,0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${s * (1 + 0.04 * Math.sin(f / 6))}) rotate(${shake}deg)` }}>
        <div style={{ fontFamily: NUM, fontSize: 170, lineHeight: 1, color: '#fff', marginTop: 8, textShadow: '0 4px 6px rgba(0,0,0,0.35)' }}>{mark}</div>
      </div>
    </AbsoluteFill>
  );
};
