import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { idle, pop, ramp } from './theme';

// p04_sticker (frame 0 and the loop: "PANAMA CANAL / सूख रही है"; the reference's 0–3.4 s "PANAMA CANAL / RUNNING
// DRY"): white bold title over a red tilted sticker with a white rim and a drop shadow. Both are already in place on
// frame 0 (so the loop's last frame matches), the sticker breathes 1–2% and floats, a light sweep crosses it every
// ~1.5 s; at `out` both fade and shrink over 6 frames. Transparent, 1080×500, 60 fps.
export const P04Sticker: React.FC<{ top?: string; sticker?: string; out?: number; intro?: boolean }> = ({ top = 'PANAMA CANAL', sticker = 'सूख रही है', out = 9999, intro = false }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = intro ? pop(f, 0, 12, 2) : 1;
  const a = 1 - ramp(f, out, out + 6);
  const breathe = 1 + 0.015 * Math.sin(f / 14);
  const [ix, iy, ir] = idle(f, 4, 0.6);
  const sweep = ((f % 90) / 90) * 1.6 - 0.3;
  return (
    <AbsoluteFill style={{ alignItems: 'center', opacity: a, transform: `scale(${s * (1 - 0.1 * (1 - a))}) translate(${ix}px, ${iy}px)` }}>
      <div style={{ marginTop: 60, fontFamily: NUM, fontSize: 112, color: '#fff', letterSpacing: 3, WebkitTextStroke: '10px #0B1A24', paintOrder: 'stroke fill', textShadow: '0 8px 18px rgba(0,0,0,0.45)', transform: `rotate(${ir * 0.4}deg)` }}>{top}</div>
      <div style={{ position: 'relative', marginTop: 6, padding: '6px 40px 0', background: 'linear-gradient(180deg, #F0373C, #C8161D)', border: '7px solid #fff', borderRadius: 18,
        transform: `rotate(${-3 + ir}deg) scale(${breathe})`, boxShadow: '0 12px 24px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#fff', lineHeight: 1.25, textShadow: '0 4px 0 rgba(0,0,0,0.25)' }}>{sticker}</div>
        <div style={{ position: 'absolute', top: -40, bottom: -40, left: `${sweep * 100}%`, width: 90, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))', transform: 'skewX(-20deg)' }} />
      </div>
    </AbsoluteFill>
  );
};
