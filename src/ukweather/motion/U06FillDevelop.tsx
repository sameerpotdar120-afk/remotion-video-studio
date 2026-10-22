import React from 'react';
import { AbsoluteFill, Easing, interpolateColors, useCurrentFrame } from 'remotion';
import { clamp, ramp, wobble } from './theme';

// u06_fill_develop (line 3, the UK and Ireland; the reference's 13.2–14.1 s): a country flashes cream at full opacity,
// then "develops" through tan into its colour over 20 frames with a small scale pop and a settle, ending
// semi-transparent so the terrain shows through (multiply). Transparent, 1080×1080, 60 fps. `d` is the outline path in
// this box (the edit passes the projected Natural Earth outline), `color` the final colour.
const DEMO = 'M 480 140 Q 560 120 600 200 Q 640 300 610 400 Q 700 480 690 600 Q 760 720 700 820 Q 600 900 470 880 Q 400 800 450 720 Q 380 640 430 560 Q 380 460 450 380 Q 420 260 480 140 Z';
export const U06FillDevelop: React.FC<{ d?: string; color?: string; delay?: number }> = ({ d = DEMO, color = '#8B3A22', delay = 0 }) => {
  const f = useCurrentFrame() - delay;
  const a = ramp(f, 0, 4);
  const dev = ramp(f, 8, 28, Easing.inOut(Easing.cubic));
  const col = interpolateColors(dev, [0, 0.5, 1], ['#F5E8D0', '#C9A27A', color]);
  const s = 1 + 0.06 * Math.max(0, 1 - Math.abs(f - 6) / 8) - 0.02 * wobble(f, 14, 3, 5);
  const op = 1 - 0.18 * dev;
  if (f < 0) return null;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ transform: `scale(${s})`, transformOrigin: '50% 50%' }}>
        <defs>
          <clipPath id="fdc"><path d={d} /></clipPath>
          <linearGradient id="fdl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.35} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
        </defs>
        <path d={d} fill={col} opacity={a * op} style={{ mixBlendMode: dev > 0.6 ? 'multiply' : 'normal' }} stroke={`rgba(255,255,255,${0.35 + 0.25 * Math.sin(f / 9)})`} strokeWidth={3} />
        <g clipPath="url(#fdc)"><rect x={-400 + ((f - 20) * 14) % 1900} y={0} width={300} height={1080} fill="url(#fdl)" transform="skewX(-20)" opacity={f > 20 ? 1 : 0} /></g>
      </svg>
    </AbsoluteFill>
  );
};
export { clamp };
