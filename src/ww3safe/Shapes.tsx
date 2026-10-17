import React from 'react';
import { clamp01, easeOut, lerp, pop, ramp } from './anim';
import { Cam, P, project, pxPerM } from './cam';
import type { Region } from './regions';

/** Regions drawn the Judwa Desh way: a bold flat fill with a white sheen at the top, a soft outer glow, a white edge
 *  that draws on, and a light that runs round the border. The fill grows out from the region's centre as it is named,
 *  and the shape lifts a little (scale + drop shadow) when it lands. */

const ringsD = (c: Cam, rings: P[][], dx = 0, dy = 0) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0] + dx, pt[1] + dy);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');

const bbox = (rings: P[][]) => {
  let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18;
  for (const r of rings) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, d: Math.hypot(x1 - x0, y1 - y0) };
};
const BOX = new Map<string, ReturnType<typeof bbox>>();

const Shape: React.FC<{ c: Cam; r: Region; t: number; t0: number }> = ({ c, r, t, t0 }) => {
  if (r.a <= 0.002) return null;
  if (!BOX.has(r.key)) BOX.set(r.key, bbox(r.rings));
  const b = BOX.get(r.key)!;
  const dx = r.dx ?? 0, dy = r.dy ?? 0;
  const d = ringsD(c, r.rings, dx, dy);
  const s = pxPerM(c);
  const [ax, ay] = project(c, b.cx + dx, b.cy + dy);
  const grow = ramp(r.a, 0, 0.85, easeOut);
  const lift = clamp01(pop(t, t0, 8, 220)) * (1 - ramp(t, t0 + 0.6, t0 + 1.2));
  const sc = 1 + 0.05 * lift;
  const tf = `translate(${ax},${ay}) scale(${sc}) translate(${-ax},${-ay})`;
  const draw = Math.min(1, r.a * 1.15);
  const id = `ww_${r.key}`;
  const op = Math.min(1, r.a * 1.6);
  return (
    <g style={{ opacity: op }}>
      <defs>
        <clipPath id={`${id}c`}><circle cx={ax} cy={ay} r={Math.max(0.1, b.d * s * 0.62 * grow)} /></clipPath>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="0.22" stopColor={r.color} />
          <stop offset="1" stopColor={r.color} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      {lift > 0.01 && (
        <g transform={`translate(${14 * lift},${26 * lift})`}>
          <path d={d} transform={tf} fill="#000" fillOpacity={0.4 * lift} style={{ filter: 'blur(10px)' }} />
        </g>
      )}
      <g transform={tf}>
        <path d={d} fill="none" stroke={r.color} strokeWidth={32} strokeOpacity={0.3} strokeLinejoin="round" style={{ filter: 'blur(14px)' }} />
        <path d={d} fill={`url(#${id})`} fillOpacity={lerp(0.55, 0.9, r.sat ?? 0.6) * draw} clipPath={`url(#${id}c)`} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} strokeOpacity={0.95}
          style={{ filter: `drop-shadow(0 0 8px ${r.color})` }} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray="0.05 0.95" strokeDashoffset={-((t * 0.25 + r.phase) % 1)}
          style={{ filter: `drop-shadow(0 0 10px ${r.color}) drop-shadow(0 0 4px #fff)` }} />
      </g>
    </g>
  );
};

/** All regions, big to small. `starts` gives each region's landing time (for the lift). */
export const Shapes: React.FC<{ c: Cam; t: number; regions: Region[]; starts: Record<string, number> }> = ({ c, t, regions, starts }) => (
  <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {regions.map((r) => <Shape key={r.key} c={c} r={r} t={t} t0={starts[r.key] ?? -10} />)}
  </svg>
);
