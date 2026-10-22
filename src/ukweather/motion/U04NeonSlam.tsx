import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp } from './theme';

// u04_neon_slam (line 1, "…कोई हिसाब ही नहीं है"; the reference's 2.2–4.3 s "Unpredictable"): a word slams in huge from
// the right, rotated −5°, cropped by the frame, and shrinks to title size over 20 frames with a red neon glow that pulses
// once on landing; it hovers with a slow drift, then at `out` punches up and flies off to the left. Transparent,
// 1080×1080, 60 fps; the title centre lands at (540, 540).
export const U04NeonSlam: React.FC<{ text?: string; out?: number; size?: number }> = ({ text = 'बेहिसाब!', out = 110, size = 150 }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const s = 4.2 - 3.2 * k;
  const x = 540 + (1 - k) * 700;
  const glow = 1 + 0.6 * Math.max(0, 1 - Math.abs(f - 22) / 10);
  const o = interpolate(f, [out, out + 8, out + 18], [0, 0.25, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const drift = Math.sin(f / 30) * 8;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - o * 1500, top: 540 + drift, transform: `translate(-50%,-50%) rotate(${-5 + o * -6}deg) scale(${s * (1 + o * 1.5)})`,
        fontFamily: UI, fontWeight: 800, fontSize: size, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1,
        textShadow: `0 0 ${14 * glow}px #FF2E3A, 0 0 ${40 * glow}px #FF2E3A, 0 0 ${90 * glow}px rgba(255,46,58,0.8), 0 6px 0 rgba(0,0,0,0.3)` }}>{text}</div>
    </AbsoluteFill>
  );
};
