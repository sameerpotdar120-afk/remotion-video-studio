import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, idle, ramp } from './theme';

// w11_title_card (frame 0 and the loop): "WEST INDIES" in big white letters over a maroon tilted sticker "कहाँ है?",
// the bat and ball (wi01) leaning beside it. Everything is already in place on frame 0 (so the loop's last frame
// matches); the sticker breathes 1–2%, the whole card floats, a light sweep crosses the sticker every 1.5 s, and the
// "?" swings like a pendulum. At `out` it fades and shrinks over 6 frames. `fo` offsets the clock for the loop's
// closing instance. Transparent, 1080×640, 60 fps.
export const W11TitleCard: React.FC<{ title?: string; sticker?: string; bat?: string; out?: number; fo?: number }> = ({ title = 'WEST INDIES', sticker = 'कहाँ है?', bat, out = 9999, fo = 0 }) => {
  useFonts();
  const f = useCurrentFrame() + fo;
  const a = 1 - ramp(f, out, out + 6);
  const [ix, iy, ir] = idle(f, 4, 0.6);
  const breathe = 1 + 0.015 * Math.sin(f / 14);
  const sweep = ((((f % 90) + 90) % 90) / 90) * 1.6 - 0.3;
  return (
    <AbsoluteFill style={{ alignItems: 'center', opacity: a, transform: `scale(${1 - 0.1 * (1 - a)}) translate(${ix}px, ${iy}px)` }}>
      <div style={{ marginTop: 70, fontFamily: NUM, fontSize: 150, color: '#fff', letterSpacing: 4, WebkitTextStroke: `10px ${C.ink}`, paintOrder: 'stroke fill', textShadow: `0 0 30px ${C.teal}66, 0 8px 18px rgba(0,0,0,0.5)`, transform: `rotate(${ir * 0.4}deg)` }}>{title}</div>
      <div style={{ position: 'relative', marginTop: 2, padding: '8px 46px 0', background: `linear-gradient(180deg, ${C.maroonHi}, ${C.maroon})`, border: '7px solid #fff', borderRadius: 20,
        transform: `rotate(${-3 + ir}deg) scale(${breathe})`, boxShadow: '0 12px 26px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 112, color: '#fff', lineHeight: 1.25 }}>{sticker}</div>
        <div style={{ position: 'absolute', top: -40, bottom: -40, left: `${sweep * 100}%`, width: 90, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))', transform: 'skewX(-20deg)' }} />
      </div>
      {bat && <Img src={bat} style={{ position: 'absolute', right: 20, top: 260, width: 300, height: 300, objectFit: 'contain', transform: `rotate(${12 + Math.sin(f / 25) * 3}deg)`, filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.5))' }} />}
    </AbsoluteFill>
  );
};
