import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, pop, typed } from './theme';

// w06_type_tag (lines 3–4, "CANADA", "DENMARK", "GREENLAND"; the reference's 10.0–11.1 s and 17.2 s): a yellow box tilts
// in and the name types inside it letter by letter, the box growing with the text, then it bobs gently. Transparent,
// 800×300, 60 fps; the box is centred at (400, 150). `text`, `size`, `tilt`.
export const W06TypeTag: React.FC<{ text?: string; size?: number; tilt?: number }> = ({ text = 'CANADA', size = 70, tilt = -6 }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 8, 2.2);
  const t = typed(text, f, 4, 18);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `rotate(${tilt + Math.sin(f / 30) * 0.8}deg) scale(${s}) translateY(${Math.sin(f / 22) * 3}px)`, background: C.yellow, padding: `${size * 0.04}px ${size * 0.3}px 0`,
        fontFamily: NUM, fontSize: size, color: C.ink, letterSpacing: 2, whiteSpace: 'nowrap', minWidth: size * 0.4, minHeight: size * 1.1, boxShadow: '0 8px 18px rgba(0,0,0,0.35)' }}>{t || ' '}</div>
    </AbsoluteFill>
  );
};
