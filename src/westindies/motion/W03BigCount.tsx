import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, idle, pop, ramp, TypeOn, wobble } from './theme';

// w03_big_count (line 3, "कुल मिलाकर 13 आज़ाद देश"; and "4 साल" in line 8): a big glowing number that counts up from
// `from` to `to` with the digits flicking (each tick a small vertical bump and a blur while it runs), lands with a scale
// bump, a teal flash ring and a light sweep, then the caption types on underneath. A slow float after. Transparent,
// 900×420, 60 fps; centred.
export const W03BigCount: React.FC<{ from?: number; to?: number; dur?: number; caption?: string; color?: string; size?: number }> = ({
  from = 0, to = 13, dur = 36, caption = 'आज़ाद देश', color = '#FFFFFF', size = 230,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const p = ramp(f, 2, 2 + dur, Easing.out(Easing.cubic));
  const v = Math.round(from + (to - from) * p);
  const done = f >= 2 + dur;
  const tick = !done && Math.round(from + (to - from) * ramp(f - 1, 2, 2 + dur, Easing.out(Easing.cubic))) !== v;
  const land = done ? wobble(f, 2 + dur, 3, 7) : 0;
  const s = pop(f, 0, 10, 2) * (1 + 0.08 * land);
  const flash = done ? ramp(f, 2 + dur, 2 + dur + 20) : 0;
  const sweep = done ? ramp(f, 2 + dur + 4, 2 + dur + 30) : -1;
  const [ix, iy, ir] = idle(f, 3, 0.6);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {done && flash < 1 && <div style={{ position: 'absolute', top: 60, width: 200 + 380 * flash, height: 200 + 380 * flash, borderRadius: '50%', border: `${10 * (1 - flash)}px solid ${C.teal}`, opacity: 1 - flash }} />}
      <div style={{ transform: `translate(${ix}px, ${iy}px) rotate(${ir}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', overflow: 'hidden', fontFamily: NUM, fontSize: size, lineHeight: 1, color, transform: `scale(${s}) translateY(${tick ? -6 : 0}px)`, filter: `${tick ? 'blur(1.5px) ' : ''}drop-shadow(0 0 ${18 + 30 * (1 - flash)}px ${C.teal}cc) drop-shadow(0 8px 0 rgba(0,0,0,0.35))`, padding: '0 10px' }}>
          {v}
          {sweep >= 0 && sweep < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 130 - 30}%`, width: 60, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))', transform: 'skewX(-20deg)', mixBlendMode: 'overlay' }} />}
        </div>
        {caption && <div style={{ marginTop: 6, fontFamily: UI, fontWeight: 800, fontSize: size * 0.3, color: C.teal, textShadow: '0 4px 14px rgba(0,0,0,0.7)', whiteSpace: 'pre' }}><TypeOn text={caption} f={f} at={2 + dur} step={2} /></div>}
      </div>
    </AbsoluteFill>
  );
};
