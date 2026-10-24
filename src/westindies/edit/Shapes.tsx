import React from 'react';
import { clamp01, easeOut, pop, ramp } from './anim';
import { Cam, P, project } from './cam';

/** A country fill the reference's way: a flat, saturated, slightly see-through colour (the satellite still shows
 *  through), a darker rim and a soft outer glow. It reveals in about 10 frames, either wiping across from one side
 *  (`wipe`, an angle in degrees: 0 = from the left) with a soft leading edge, or growing out from a point (`from`),
 *  lifts a little as it lands, and keeps a slow light band sweeping over it so it never sits still. `grey` fades it
 *  to a dull grey (the countries that don't play for the cricket team). */
export type Region = { key: string; rings: P[][]; color: string; t0: number; t1?: number; dur?: number; wipe?: number; from?: P; grey?: number; alpha?: number; glow?: number };

const ringsD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');

const bbox = (rings: P[][]) => {
  let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18;
  for (const r of rings) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
};
const BOX = new Map<string, ReturnType<typeof bbox>>();
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

const Shape: React.FC<{ c: Cam; r: Region; t: number }> = ({ c, r, t }) => {
  const dur = r.dur ?? 0.17;
  const out = r.t1 !== undefined ? 1 - ramp(t, r.t1 - 0.2, r.t1) : 1;
  const p = ramp(t, r.t0, r.t0 + dur, easeOut);
  if (p <= 0 || out <= 0) return null;
  if (!BOX.has(r.key)) BOX.set(r.key, bbox(r.rings));
  const b = BOX.get(r.key)!;
  const d = ringsD(c, r.rings);
  const [x0, y1] = project(c, b.x0, b.y0), [x1, y0] = project(c, b.x1, b.y1);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, diag = Math.hypot(x1 - x0, y1 - y0);
  const g = r.grey ?? 0;
  const col = mix(r.color, '#5E6670', g);
  const rim = mix(col, '#000000', 0.35);
  const lift = clamp01(pop(t, r.t0 + dur * 0.6, 8, 220)) * (1 - ramp(t, r.t0 + 0.5, r.t0 + 1.0));
  const tf = `translate(${cx},${cy}) scale(${1 + 0.05 * lift}) translate(${-cx},${-cy})`;
  const id = `wi_${r.key.replace(/[^A-Za-z0-9_]/g, '')}`;
  const ang = r.wipe ?? 0;
  // the wipe: a wide soft-edged band slides across the bbox along the wipe direction
  const rad = (ang * Math.PI) / 180, ux = Math.cos(rad), uy = Math.sin(rad);
  const edge = -diag * 0.6 + diag * 1.4 * p;
  const sweep = (((t * 0.28 + (r.key.length % 7) * 0.13) % 1.3) / 1.3) * diag * 1.8 - diag * 0.9;
  const a = (r.alpha ?? 0.8) * out;
  return (
    <g>
      <defs>
        {r.from ? (
          <radialGradient id={`${id}rg`} gradientUnits="userSpaceOnUse" cx={project(c, r.from[0], r.from[1])[0]} cy={project(c, r.from[0], r.from[1])[1]} r={Math.max(1, diag * 1.3 * p)}>
            <stop offset="0.86" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        ) : (
          <linearGradient id={`${id}lg`} gradientUnits="userSpaceOnUse" x1={cx + ux * (edge - diag * 0.12)} y1={cy + uy * (edge - diag * 0.12)} x2={cx + ux * edge} y2={cy + uy * edge}>
            <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        )}
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={11000} height={12000}>
          {p >= 0.999 ? <rect x={-4000} y={-4000} width={11000} height={12000} fill="#fff" /> : (
            <rect x={-4000} y={-4000} width={11000} height={12000} fill={r.from ? `url(#${id}rg)` : `url(#${id}lg)`} />
          )}
        </mask>
        <linearGradient id={`${id}sw`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.2} /><stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
      </defs>
      {lift > 0.01 && <path d={d} transform={`${tf} translate(${8 * lift},${14 * lift})`} fill="#000" fillOpacity={0.45 * lift * out} style={{ filter: 'blur(9px)' }} />}
      <g transform={tf} mask={`url(#${id}m)`} opacity={out}>
        <path d={d} fill={col} fillOpacity={a * (1 + 0.05 * Math.sin(t * 2.2 + r.key.length))} style={{ filter: `drop-shadow(0 0 ${(r.glow ?? 14) * (1 - g * 0.8)}px ${col})` }} />
        <g clipPath={`url(#${id}c)`}>
          <rect x={cx + sweep - diag * 0.18} y={cy - diag * 2} width={diag * 0.36} height={diag * 4} fill={`url(#${id}sw)`} transform={`rotate(-22 ${cx} ${cy})`} />
        </g>
        <path d={d} fill="none" stroke={rim} strokeWidth={2.5} strokeLinejoin="round" opacity={0.9} />
      </g>
    </g>
  );
};

export const Shapes: React.FC<{ c: Cam; t: number; regions: Region[] }> = ({ c, t, regions }) => (
  <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {regions.map((r) => <Shape key={r.key} c={c} r={r} t={t} />)}
  </svg>
);
