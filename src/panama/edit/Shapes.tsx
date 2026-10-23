import React from 'react';
import { clamp01, easeOut, pop, ramp } from './anim';
import { Cam, P, project, pxPerM } from './cam';
import type { Region } from './regions';

/** Regions drawn the reference's way: bold flat fills with no outline. A fill spreads out from its origin (the centre,
 *  or `from`) behind a soft, blobby edge (a turbulence-displaced mask), and lifts a little when it lands. */

const ringsD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');

const bbox = (rings: P[][]) => {
  let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18;
  for (const r of rings) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, d: Math.hypot(x1 - x0, y1 - y0) };
};
const BOX = new Map<string, ReturnType<typeof bbox>>();

const Shape: React.FC<{ c: Cam; r: Region; t: number; t0: number; fk: number }> = ({ c, r, t, t0, fk }) => {
  if (r.a <= 0.002) return null;
  if (!BOX.has(r.key)) BOX.set(r.key, bbox(r.rings));
  const b = BOX.get(r.key)!;
  const d = ringsD(c, r.rings);
  const s = pxPerM(c);
  const [ox, oy] = project(c, r.from ? r.from[0] : b.cx, r.from ? r.from[1] : b.cy);
  const grow = ramp(r.a, 0, 1, easeOut);
  const reach = b.d * s * (r.from ? 1.25 : 0.7);
  const lift = clamp01(pop(t, t0, 8, 220)) * (1 - ramp(t, t0 + 0.6, t0 + 1.2));
  const [ax, ay] = project(c, b.cx, b.cy);
  const tf = `translate(${ax},${ay}) scale(${1 + 0.04 * lift}) translate(${-ax},${-ay})`;
  const id = `pc_${r.key}`;
  const span = Math.max(400, b.d * s);
  const sweepX = ax - span * 0.8 + (((t * 0.32 + r.phase) % 1.25) / 1.25) * span * 1.6;
  return (
    <g style={{ opacity: Math.min(1, r.a * 2) }}>
      <defs>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6600} height={7200}>
          {grow >= 0.999 ? <rect x={-2000} y={-2000} width={6600} height={7200} fill="#fff" /> : <circle cx={ox} cy={oy} r={Math.max(0.1, reach * grow)} fill="#fff" filter="url(#pcblob)" />}
        </mask>
      </defs>
      {lift > 0.01 && <path d={d} transform={`${tf} translate(${10 * lift},${18 * lift})`} fill="#000" fillOpacity={0.35 * lift} style={{ filter: 'blur(10px)' }} />}
      <g transform={tf} mask={`url(#${id}m)`}>
        <path d={d} fill={r.color} fillOpacity={(r.sat ?? 0.88) * fk * (1 + 0.07 * Math.sin(t * 2.1 + r.phase * 6))} />
        {/* the living fill: a soft light band sweeps across, and the glow edge breathes */}
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <g clipPath={`url(#${id}c)`}>
          <rect x={sweepX - 260} y={-2000} width={520} height={7200} fill={`url(#${id}g)`} transform={`rotate(-22 ${sweepX} ${ay})`} />
        </g>
        <defs>
          <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.22 * fk} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        {r.edge && <path d={d} fill="none" stroke={r.edge} strokeWidth={4.5 + 1.5 * Math.sin(t * 3 + r.phase * 5)} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${(9 + 5 * Math.sin(t * 2.4 + r.phase * 4)).toFixed(1)}px ${r.edge})` }} />}
      </g>
    </g>
  );
};

/** All regions, big to small. `starts` gives each region's landing time (for the lift). */
export const Shapes: React.FC<{ c: Cam; t: number; regions: Region[]; starts: Record<string, number> }> = ({ c, t, regions, starts }) => {
  // close in, the fills thin out so the satellite land shows through (the reference's village close-ups)
  const fk = 0.3 + 0.7 * clamp01((c.span - 3e5) / (1.3e6 - 3e5));
  return (
  <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <defs>
      <filter id="pcblob" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={140} xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation={6} />
      </filter>
    </defs>
    {regions.map((r) => <Shape key={r.key} c={c} r={r} t={t} t0={starts[r.key] ?? -10} fk={fk} />)}
  </svg>
  );
};
