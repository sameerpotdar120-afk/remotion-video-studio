import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { clamp, idle, pop, wobble } from './theme';

// p16_calendar (line 5, "इस साल September के एक slot के लिए…"; the reference's 47.4–49 s "SEPTEMBER 2026"): a small
// tear-off calendar tile pops in tilted, its red header with the month, then the big year flips down onto the white
// page (rotateX 90° → 0 in 10 frames, with a bounce), and the tile floats and sways. Transparent, 400×400, 60 fps.
export const P16Calendar: React.FC<{ month?: string; year?: string }> = ({ month = 'SEPTEMBER', year = '2026' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 10, 2.2);
  const flip = interpolate(f, [8, 18], [90, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const [ix, iy, ir] = idle(f, 6, 0.6);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 280, borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 16px 30px rgba(0,0,0,0.45)', border: '5px solid #fff',
        transform: `translate(${ix}px, ${iy}px) rotate(${6 + ir + wobble(f, 18, 3, 5) * 4}deg) scale(${s})` }}>
        <div style={{ background: 'linear-gradient(180deg, #F0373C, #C8161D)', textAlign: 'center', padding: '10px 0 4px', fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: 2 }}>{month}</div>
        <div style={{ perspective: 600 }}>
          <div style={{ transformOrigin: '50% 0%', transform: `rotateX(${flip}deg)`, textAlign: 'center', fontFamily: NUM, fontSize: 120, color: '#14161C', lineHeight: 1.2 }}>{year}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
