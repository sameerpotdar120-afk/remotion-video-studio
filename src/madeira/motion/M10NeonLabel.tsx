import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, graphemes, idle } from './theme';

// m10_neon_label (the reference's red-glow labels, "MADEIRA" and "$8 BILLION ECONOMY": here "लकड़ी", "7 साल",
// "2,000 km", "सफ़ेद सोना", "Funchal"): white bold letters with a deep red neon glow, each letter dropping in from
// above and from 0.4× with a back-ease bounce, 2 frames apart, then the glow pulses. `count` counts a number up instead
// (e.g. 0 → 2000) with the suffix, ticking and bumping on the last value. Centred; transparent.
export const M10NeonLabel: React.FC<{ text?: string; count?: [number, number, number]; suffix?: string; size?: number; color?: string; step?: number }> = ({
  text = 'MADEIRA', count, suffix = '', size = 120, color = C.neon, step = 2,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const latin = /^[\x00-\x7F]*$/.test(text + suffix);
  const pulse = 0.75 + 0.25 * Math.sin(f / 9);
  const [ix, iy, ir] = idle(f, 2, 0.35);
  let body: React.ReactNode;
  if (count) {
    const [a, b, dur] = count;
    const v = Math.round(interpolate(f, [4, 4 + dur], [a, b], { ...clamp, easing: Easing.out(Easing.cubic) }));
    const bump = f > 4 + dur ? 1 + 0.12 * Math.exp(-(f - 4 - dur) / 5) : 1;
    body = <span style={{ display: 'inline-block', transform: `scale(${bump * interpolate(f, [0, 8], [0.4, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) })})` }}>{v.toLocaleString('en-IN')}{suffix}</span>;
  } else {
    body = graphemes(text).map((ch, i) => {
      const s = interpolate(f, [i * step, i * step + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
      return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: Math.min(1, s * 3), transform: `translateY(${(1 - s) * -60}px) scale(${0.4 + 0.6 * s})` }}>{ch}</span>;
    });
  }
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: latin ? NUM : UI, fontWeight: 800, fontSize: size, lineHeight: 1.15, color: '#fff', whiteSpace: 'nowrap', letterSpacing: latin ? 3 : 0,
        WebkitTextStroke: `${size / 26}px ${C.neonDeep}`, paintOrder: 'stroke fill', transform: `translate(${ix}px, ${iy}px) rotate(${ir * 0.5}deg)`,
        textShadow: `0 0 ${10 * pulse}px ${color}, 0 0 ${26 * pulse}px ${color}, 0 0 ${50 * pulse}px ${C.neonDeep}, 0 8px 12px rgba(0,0,0,0.6)` }}>{body}</div>
    </AbsoluteFill>
  );
};
