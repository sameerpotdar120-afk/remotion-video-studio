import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

/** Stroke data per character (Make Me a Hanzi format): outline paths + median polylines, 1024 em, y up from -124.
 *  Fetch with scripts/stickman3d/hanzi_strokes.py "<characters>" <out.json>. */
export type Glyph = { strokes: string[]; medians: [number, number][][] };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sm = (t: number) => t * t * (3 - 2 * t);
const mlen = (m: [number, number][]) => m.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - m[i][0], p[1] - m[i][1]), 0);

/** One character brushed on between frames a and b, stroke by stroke (Make Me a Hanzi stroke data): each stroke is revealed along its median. */
export const Hanzi: React.FC<{ glyph: Glyph; a: number; b: number; size: number; color?: string; id: string }> = ({ glyph: g, a, b, size, color = '#1d1814', id }) => {
  const f = useCurrentFrame();
  const lens = useMemo(() => g.medians.map((m) => mlen(m) + 60), [g]);
  const total = lens.reduce((s, l) => s + l, 0);
  const prog = clamp01((f - a) / Math.max(1, b - a)) * total;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024">
      <g transform="scale(1,-1) translate(0,-900)">
        {g.strokes.map((s, i) => {
          const start = acc; acc += lens[i];
          const p = clamp01((prog - start) / lens[i]);
          if (p <= 0) return null;
          const m = g.medians[i];
          const d = 'M' + m.map(([x, y]) => `${x} ${y}`).join(' L');
          return (
            <g key={i}>
              <clipPath id={`${id}-${i}`}><path d={s} /></clipPath>
              <path d={d} fill="none" stroke={color} strokeWidth={150} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${lens[i]} ${lens[i] + 10}`} strokeDashoffset={lens[i] * (1 - sm(p))} clipPath={`url(#${id}-${i})`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

