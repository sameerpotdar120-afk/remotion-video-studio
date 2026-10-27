import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, graphemes, idle } from './theme';

// p02_accent (the reference's big glowing words above the island: "Missing from any map", "No one lives there",
// "TRASH", "Microplastics"; here "किसी नक्शे पर नहीं", "कोई नहीं रहता", "कचरा", "माइक्रोप्लास्टिक"). Modes:
// `type`: letters pop in one by one (3 frames apart, each 1.4× → 1 with a back-ease). `fly`: the whole line flies in
// big from the left edge (2× and blurred → 1× and sharp in 14 frames) and settles with a small overshoot.
// Exits at `out`: `dots` (the letters shrink to dots and slide off up-left, like the reference) or `spread` (the
// letters spread apart and fade). `arc` bends the line on a curve (the reference's "Microplastics"). White with a
// soft glow (`color`). Centred; transparent.
export const P02Accent: React.FC<{ text?: string; size?: number; mode?: 'type' | 'fly'; out?: number; exit?: 'dots' | 'spread'; color?: string; arc?: number; step?: number }> = ({
  text = 'कचरा', size = 110, mode = 'type', out, exit = 'dots', color = C.cyanGlow, arc = 0, step = 3,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const ch = graphemes(text);
  const n = ch.length;
  const [ix, iy, ir] = idle(f, 4, 0.25);
  const fly = mode === 'fly' ? interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) }) : 1;
  const q = out !== undefined ? interpolate(f, [out, out + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const latin = /^[\x00-\x7F]*$/.test(text);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.2, color: '#fff', whiteSpace: 'nowrap', letterSpacing: latin ? 2 : 0,
        textShadow: `0 0 ${size / 8}px ${color}, 0 0 ${size / 3}px ${color}, 0 6px 10px rgba(0,0,0,0.45)`,
        transform: `translate(${ix + (1 - fly) * -900}px, ${iy}px) rotate(${ir * 0.4}deg) scale(${1 + (1 - fly) * 1})`, filter: fly < 0.95 ? `blur(${(1 - fly) * 14}px)` : undefined }}>
        {ch.map((c, i) => {
          const s = mode === 'type' ? interpolate(f, [i * step, i * step + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) }) : 1;
          const k = i / Math.max(1, n - 1) - 0.5;
          const bend = arc ? `translateY(${arc * 4 * k * k * size - arc * size}px) rotate(${arc * 60 * k}deg)` : '';
          const qi = interpolate(q, [i / n * 0.5, i / n * 0.5 + 0.5], [0, 1], clamp);
          const ex = exit === 'dots' ? `translate(${-qi * 300}px, ${-qi * 80}px) scale(${1 - 0.85 * qi})` : `translateX(${k * q * size * 3}px)`;
          return s > 0 ? <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: Math.min(1, s * 2) * (1 - (exit === 'spread' ? q : qi * qi)), transform: `${bend} ${ex} scale(${1.4 - 0.4 * s})` }}>{c}</span> : null;
        })}
      </div>
    </AbsoluteFill>
  );
};
