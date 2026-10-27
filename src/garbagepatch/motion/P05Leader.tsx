import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, graphemes, idle } from './theme';

// p05_leader (line 3, the name; the reference's "Great Pacific Garbage Patch" label): from the anchor `at` (screen
// px) a thin cyan line grows straight up `len` px with a dot at its foot (10 frames), then the name types on above
// it in cyan-glowing white, 2 frames a letter, and gently floats. `out` retracts it (text first, then the line).
export const P05Leader: React.FC<{ at: [number, number]; len?: number; text?: string; size?: number; out?: number }> = ({ at, len = 220, text = 'Great Pacific Garbage Patch', size = 52, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const q = out !== undefined ? interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const g = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 - interpolate(q, [0.4, 1], [0, 1], clamp));
  const [ix, iy] = idle(f, 7, 0.2);
  const ch = graphemes(text);
  const shown = Math.floor(interpolate(f, [8, 8 + ch.length * 2], [0, ch.length], clamp) * (1 - interpolate(q, [0, 0.5], [0, 1], clamp)));
  const [x, y] = at;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible', filter: `drop-shadow(0 0 6px ${C.cyan})` }}>
        <circle cx={x} cy={y} r={7 * g} fill="#fff" />
        <line x1={x} y1={y} x2={x} y2={y - len * g} stroke={C.cyan} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: x + ix, top: y - len - 12 + iy, transform: 'translate(-50%, -100%)', fontFamily: UI, fontWeight: 800, fontSize: size, color: '#fff', whiteSpace: 'nowrap',
        textShadow: `0 0 10px ${C.cyan}, 0 0 24px ${C.cyan}, 0 4px 8px rgba(0,0,0,0.5)` }}>
        {ch.slice(0, shown).join('')}
      </div>
    </AbsoluteFill>
  );
};
