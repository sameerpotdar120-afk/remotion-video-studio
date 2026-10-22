import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { idle, ramp, TypeOn } from './theme';

// u08_ellipse_title (line 3, "देखकर लगता है, यही दुनिया की सबसे गीली जगह होगी"; the reference's 17.7–20.3 s): a white
// hand-drawn ellipse draws round the point in 12 frames (starting top-left, slightly overshooting its start), then a
// neon-red-glow title types in at the top-left letter by letter, and a curved hand-drawn arrow draws from the title down
// to the ellipse; at `strike` two red strike-through lines draw across the title (the reference's 22.6–24.6 s "it's not").
// Transparent, 1080×1080, 60 fps; the ellipse centre is (`cx`, `cy`), radii `rx`, `ry`.
export const U08EllipseTitle: React.FC<{ text?: string; line2?: string; cx?: number; cy?: number; rx?: number; ry?: number; strike?: number }> = ({
  text = 'सबसे गीली जगह', line2 = 'दुनिया में?', cx = 620, cy = 720, rx = 170, ry = 230, strike = 9999,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const e = ramp(f, 0, 12, Easing.inOut(Easing.cubic));
  const arrow = ramp(f, 26, 40, Easing.inOut(Easing.cubic));
  const s1 = ramp(f, strike, strike + 10), s2 = ramp(f, strike + 8, strike + 18);
  const n = 180;
  const pts = Array.from({ length: Math.round(n * 1.08 * e) + 1 }, (_, i) => {
    const a = -2.4 + (i / n) * Math.PI * 2;
    const boil = Math.floor(f / 4);
    const wob = 1 + 0.025 * Math.sin(i * 0.12) + 0.008 * Math.sin(i * 0.9 + boil * 1.7);
    return `${cx + Math.cos(a) * rx * wob},${cy + Math.sin(a) * ry * wob}`;
  });
  const pulse = 1 + 0.2 * Math.sin(f / 8);
  const glow = `0 0 ${14 * pulse}px #FF2E3A, 0 0 ${40 * pulse}px #FF2E3A, 0 0 80px rgba(255,46,58,0.7)`;
  const [ix, iy, ir] = idle(f, 4);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {pts.length > 1 && <path d={`M ${pts.join(' L ')}`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />}
        <path d={`M 470 250 C 520 330 ${cx - 40} ${cy - ry - 120} ${cx - 10} ${cy - ry - 18}`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${arrow} 1`} />
        {arrow > 0.97 && <path d={`M ${cx - 10} ${cy - ry - 18} l -28 -18 M ${cx - 10} ${cy - ry - 18} l 6 -32`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />}
        {s1 > 0 && <path d={`M 70 120 L ${70 + 620 * s1} 108`} stroke="#E8262B" strokeWidth={14} strokeLinecap="round" />}
        {s2 > 0 && <path d={`M 250 210 L ${250 + 430 * s2} 200`} stroke="#E8262B" strokeWidth={14} strokeLinecap="round" />}
      </svg>
      <div style={{ position: 'absolute', left: 60 + ix, top: 60 + iy, transform: `rotate(${-5 + ir}deg)`, fontFamily: UI, fontWeight: 800, color: '#fff', lineHeight: 1.05, textShadow: glow }}>
        <div style={{ fontSize: 110 }}>{f >= 12 && <TypeOn text={text} f={f} at={12} step={2} />}</div>
        <div style={{ fontSize: 80, marginLeft: 180 }}>{f >= 26 && <TypeOn text={line2} f={f} at={26} step={2} />}</div>
      </div>
    </AbsoluteFill>
  );
};
