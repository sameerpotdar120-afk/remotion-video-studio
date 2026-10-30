import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { TITLE, useFonts } from './font';
import { clamp, idle } from './theme';

// s03_title_3d (the reference's "SIKKIM"): a bold condensed word in a cyan gradient with a bevel highlight, a deep
// extrusion (stacked layers going darker), a glow and a slight perspective tilt. It drops in at 1.4× with a blur and
// settles with an overshoot, then floats. `size` in px; `tilt` degrees. Centred in its box. Transparent.
export const S03Title3D: React.FC<{ text: string; size?: number; tilt?: number; out?: number; depth?: number }> = ({ text, size = 150, tilt = -6, out, depth = 14 }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const o = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const [ix, iy, ir] = idle(f, 3, 0.6);
  const ext = Array.from({ length: depth }, (_, i) => {
    const k = i + 1, c = Math.round(110 - (i / depth) * 90);
    return `${(k * 0.35).toFixed(1)}px ${k}px 0 rgb(0,${c},${c + 6})`;
  }).join(',');
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 900 }}>
      <div style={{ position: 'relative', transform: `translate(${ix}px, ${iy - (1 - t) * 60}px) rotateX(18deg) rotate(${tilt + ir}deg) scale(${1.4 - 0.4 * t})`, opacity: Math.min(1, t * 3) * o,
        filter: t < 0.6 ? `blur(${(1 - t / 0.6) * 8}px)` : undefined }}>
        <div style={{ position: 'absolute', inset: 0, fontFamily: TITLE, fontSize: size, letterSpacing: 2, color: 'transparent', textShadow: `${ext}, 0 ${depth + 10}px 30px rgba(0,0,0,0.75), 0 0 60px rgba(70,255,245,0.55)` }}>{text}</div>
        <div style={{ position: 'relative', fontFamily: TITLE, fontSize: size, letterSpacing: 2, lineHeight: 1.1,
          background: 'linear-gradient(180deg, #F2FFFF 0%, #8FFFF8 30%, #2EDFE0 62%, #0E9AA6 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          WebkitTextStroke: '1.5px rgba(230,255,255,0.9)' }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
