import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from './theme';

// p32_shock (line 1, the island throbbing; line 4 and 6, the numbers slamming down): two or three rings burst out
// from `at` (screen px) and fade over 30 frames, a white core flash, and `shake(f)` gives the camera a matching jolt
// (px offset, decaying over 12 frames) for the edit to add to the camera. `repeat` re-fires every N frames (the
// island's slow throb). Transparent, 1080×1920.
export const shake = (f: number, at = 0, amp = 14): [number, number] => {
  const g = f - at;
  if (g < 0 || g > 12) return [0, 0];
  const k = amp * (1 - g / 12);
  return [Math.sin(g * 2.9) * k, Math.cos(g * 3.7) * k * 0.7];
};
export const P32Shock: React.FC<{ at: [number, number]; r?: number; color?: string; rings?: number; repeat?: number }> = ({ at, r = 260, color = C.cyanGlow, rings = 3, repeat }) => {
  const f0 = useCurrentFrame();
  const f = repeat ? f0 % repeat : f0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {Array.from({ length: rings }, (_, i) => {
          const g = (f - i * 5) / 30;
          if (g < 0 || g > 1) return null;
          return <ellipse key={i} cx={at[0]} cy={at[1]} rx={r * (0.3 + g)} ry={r * (0.3 + g) * 0.8} fill="none" stroke={color} strokeWidth={8 * (1 - g)} opacity={1 - g} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
        })}
        {f < 8 && <circle cx={at[0]} cy={at[1]} r={r * 0.25} fill="#fff" opacity={0.5 * (1 - f / 8)} />}
      </svg>
    </AbsoluteFill>
  );
};
