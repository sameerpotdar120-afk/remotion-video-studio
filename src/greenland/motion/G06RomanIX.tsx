import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { HAND, OLD, useFonts } from './font';
import { C, clamp, idle, ramp, wobble } from './theme';

// g06_roman_ix (line 4, "9वीं सदी में"; the reference's "IX" on the paper map): a big inked "IX" in an old Roman
// face stamps onto the paper (from 1.4× with a twist, ink spreading a little on landing), two ink rules draw out
// beside it, and "9वीं सदी" writes on underneath in a hand. Transparent, 800×520, 60 fps; centred.
export const G06RomanIX: React.FC<{ sub?: string }> = ({ sub = '9वीं सदी' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 8], [1.4, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const a = interpolate(f, [0, 4], [0, 1], clamp);
  const bleed = ramp(f, 8, 30);
  const rule = ramp(f, 10, 26);
  const w = ramp(f, 16, 40, Easing.linear);
  const [ix, iy, ir] = idle(f, 3, 0.3);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translate(${ix}px, ${iy}px) rotate(${ir}deg)` }}>
      <div style={{ fontFamily: OLD, fontWeight: 900, fontSize: 260, lineHeight: 1, color: C.sepia, opacity: a * 0.92, transform: `scale(${s * (1 + 0.03 * wobble(f, 8, 4, 8))}) rotate(${interpolate(f, [0, 8], [-8, -2], clamp)}deg)`,
        textShadow: `0 0 ${1 + bleed * 2}px ${C.sepia}`, letterSpacing: 10 }}>IX</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: -6 }}>
        <div style={{ width: 120 * rule, height: 5, background: C.sepia, borderRadius: 3 }} />
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 72, color: C.sepia, clipPath: `inset(-20% ${100 - w * 100}% -20% 0)` }}>{sub}</div>
        <div style={{ width: 120 * rule, height: 5, background: C.sepia, borderRadius: 3 }} />
      </div>
    </AbsoluteFill>
  );
};
