import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c01_emboss_fill (the reference's signature map fill, 0:00–0:31): a country or state (`d`, screen px) coloured over
// the satellite so the terrain shows through (multiply), lifted as a slab: a soft dark drop shadow offset down-right,
// a thin bright rim, a faint top sheen. It arrives at frame 0 by `mode`: `wipe` (a soft-edged colour wipe travelling
// at `angle`°, e.g. 0 = west→east, the reference's Pakistan), `fade`, or `grow` (from the centre). `out` fades it.
// `blend` "normal" gives the glossy white of undivided Punjab. Place directly above the map (same parent) so the
// multiply reads the satellite. Transparent, 1080×1920.
const bboxOf = (d: string) => {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i + 1 < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
  return { x0, y0, x1, y1 };
};
let uid = 0;
export const C01EmbossFill: React.FC<{ d: string; color: string; mode?: 'wipe' | 'fade' | 'grow'; angle?: number; dur?: number; out?: number; outDur?: number; lift?: number; blend?: 'multiply' | 'normal'; strength?: number; rim?: number }> = ({
  d, color, mode = 'fade', angle = 0, dur = 18, out, outDur = 18, lift = 6, blend = 'multiply', strength = 1, rim = 2.2,
}) => {
  const f = useCurrentFrame();
  const [id] = React.useState(() => `c01_${uid++}`);
  const p = dur <= 0 ? 1 : interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const o = out !== undefined ? interpolate(f, [out, out + outDur], [1, 0], clamp) : 1;
  if (o <= 0 || (p <= 0 && mode !== 'fade')) return null;
  const b = bboxOf(d), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  const rad = (angle * Math.PI) / 180, half = (Math.abs(Math.cos(rad)) * (b.x1 - b.x0) + Math.abs(Math.sin(rad)) * (b.y1 - b.y0)) / 2 + 60;
  const ax = cx - Math.cos(rad) * half, ay = cy - Math.sin(rad) * half, bx = cx + Math.cos(rad) * half, by = cy + Math.sin(rad) * half;
  const edge = mode === 'wipe' ? p * 1.25 : 1;
  const alpha = (mode === 'fade' ? p : 1) * o;
  const sc = mode === 'grow' ? 0.85 + 0.15 * Easing.out(Easing.back(1.6))(p) : 1;
  const g = `translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`;
  const lifted = `translate(${-lift * 0.3} ${-lift * 0.5}) ${g}`;
  const mask = mode === 'wipe' ? `url(#${id}m)` : undefined;
  const defs = (
    <defs>
      <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={bx} y2={by}>
        <stop offset={Math.max(0, edge - 0.25)} stopColor="#fff" /><stop offset={Math.max(0.001, edge)} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={5080} height={5920}><rect x={-2000} y={-2000} width={5080} height={5920} fill={`url(#${id}g)`} /></mask>
      <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={lift * 1.1} /></filter>
      <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.18} /><stop offset="0.35" stopColor="#fff" stopOpacity={0} /></linearGradient>
    </defs>
  );
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        {defs}
        <g mask={mask}><path d={d} transform={`translate(${lift * 0.7} ${lift * 1.3}) ${g}`} fill="#000" opacity={0.6} filter={`url(#${id}s)`} /></g>
      </svg>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible', mixBlendMode: blend === 'multiply' ? 'multiply' : 'normal' }}>
        {defs}
        <g mask={mask}><path d={d} transform={lifted} fill={color} opacity={blend === 'multiply' ? 0.9 * strength : 0.82} /></g>
      </svg>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        {defs}
        <g mask={mask} transform={lifted}>
          {blend === 'multiply' && <path d={d} fill={color} opacity={0.28 * strength} />}
          <path d={d} fill={`url(#${id}h)`} />
          <path d={d} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={rim} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
