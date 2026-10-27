import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp, wobble } from './theme';

// p03_hand_arrow (the reference's curved hand-drawn arrows: from "Missing from any map" down to the island, and the
// pair hugging "TRASH"): a slightly wobbly white marker stroke draws on from `from` to `to` (screen px) along a curve
// bent by `bend` (12 frames, ease-out), then the head flicks open at the tip with a little spring. The line keeps a
// faint boil (the stroke jitters a pixel every 6 frames, like hand-drawn animation). `out` fades it.
export const P03HandArrow: React.FC<{ from: [number, number]; to: [number, number]; bend?: number; width?: number; out?: number; color?: string }> = ({ from, to, bend = 0.35, width = 7, out, color = '#fff' }) => {
  const f = useCurrentFrame();
  const [x0, y0] = from, [x1, y1] = to;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
  const boil = Math.floor(f / 6);
  const j = (k: number) => Math.sin(boil * 12.9898 + k * 78.233) * 1.4;
  const cx = (x0 + x1) / 2 - dy * bend + j(1), cy = (y0 + y1) / 2 + dx * bend + j(2);
  const d = `M${x0 + j(3)},${y0 + j(4)} Q${cx},${cy} ${x1},${y1}`;
  const t = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const head = interpolate(f, [10, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(3)) }) * (1 + 0.15 * wobble(f, 16));
  const a = Math.atan2(y1 - cy, x1 - cx), hl = Math.min(40, L * 0.22) * head;
  const op = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const len = L * 1.3;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))' }}>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
        {head > 0 && <path d={`M${x1 - hl * Math.cos(a - 0.55)},${y1 - hl * Math.sin(a - 0.55)} L${x1},${y1} L${x1 - hl * Math.cos(a + 0.55)},${y1 - hl * Math.sin(a + 0.55)}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};
