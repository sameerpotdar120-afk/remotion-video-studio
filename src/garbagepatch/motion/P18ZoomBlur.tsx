import React from 'react';
import { AbsoluteFill } from 'remotion';

// p18_zoom_blur (the reference's cut into and out of the real footage, 0:44.5 and 0:47.6): a radial zoom blur on
// its children. `amount` 0..1 (drive it with the edit's clock: 0 → 1 over ~6 frames going out of a shot, 1 → 0 coming
// into the next): the picture punches in (up to 1.6×) while 7 copies, each a little bigger and fainter, smear it out
// from the centre. At 0 it is the children untouched.
export const P18ZoomBlur: React.FC<{ amount: number; children: React.ReactNode; max?: number }> = ({ amount, children, max = 0.6 }) => {
  if (amount <= 0.001) return <AbsoluteFill>{children}</AbsoluteFill>;
  const n = 7, base = 1 + max * amount;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ transform: `scale(${base * (1 + i * 0.07 * amount)})`, opacity: i === 0 ? 1 : 0.42 * (1 - i / n), filter: `blur(${(2 + i * 1.5) * amount}px)` }}>
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
