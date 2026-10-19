import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useAnton } from './font';
import { clamp, pop } from './theme';

// h02_counter (line 1, "116 साल"; the reference's 4.4–7.4 s): a yellow rolling counter that counts up 13 → 116 with an
// ease-out (steps like the reference: 13, 35, 64, 85, 99, 107, 112, 115, 116), lands with a punch, holds, then rushes at
// the camera (scales up and fades off the top). Digits only; "साल" is added as a caption in the edit.
// Transparent, 900×500, 60 fps, 200 frames. `fly` = the frame the fly-off starts.
export const H02Counter: React.FC<{ to?: number; fly?: number }> = ({ to = 116, fly = 150 }) => {
  useAnton();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 90], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = Math.round(13 + (to - 13) * k);
  const s = pop(f, 0, 12, 2) * (1 + (f > 90 && f < 104 ? Math.sin(((f - 90) / 14) * Math.PI) * 0.12 : 0));
  const out = interpolate(f, [fly, fly + 36], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: NUM, fontSize: 260, color: '#FFE11A', WebkitTextStroke: '12px #1D1610', paintOrder: 'stroke fill', letterSpacing: 4,
        transform: `translate(${out * 160}px, ${-out * 520}px) scale(${s * (1 + out * 5)}) rotate(${-4 + out * 6}deg)`, opacity: 1 - out * 0.8,
        textShadow: '0 12px 0 rgba(0,0,0,0.35), 0 18px 40px rgba(0,0,0,0.55)', filter: out > 0.1 ? `blur(${out * 6}px)` : undefined }}>{v}</div>
    </AbsoluteFill>
  );
};
