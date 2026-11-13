import React from 'react';
import { Img, staticFile } from 'remotion';
import { LOOPF } from './cam';
import { HAVE } from './assets';

/** Studio highlight colours: a hot red for India, a strong blue for every other place the VO names. */
export const HUE = {
  red: { top0: '#FF3B30', top1: '#B8000F', side: '#5A0008', rim: '#FF9A90', glow: '#FF1A1A' },
  blue: { top0: '#3AA8FF', top1: '#0046C8', side: '#041F5C', rim: '#9FD6FF', glow: '#1E7BFF' },
};
export type Hue = keyof typeof HUE;

/**
 * A raised highlight (GeoLayers "extrude" look): a soft shadow, a thick side wall, a glossy gradient top, an inner glow,
 * a light sweep, a crisp white rim and an outer glow. g grows it in (0..1): it rises off the map as g grows. d is a
 * screen-space path; cx/cy is the point it scales around; dx/dy slide it.
 */
export const Slab: React.FC<{ d: string; hue: Hue; g: number; t: number; id: string; depth?: number; dx?: number; dy?: number; s?: number; cx?: number; cy?: number; pulse?: number }> = ({
  d, hue, g, t, id, depth = 16, dx = 0, dy = 0, s = 1, cx = 540, cy = 960, pulse = 1,
}) => {
  if (g <= 0.001) return null;
  const H = HUE[hue];
  const lift = depth * Math.min(1, g * 1.2);
  const n = Math.max(1, Math.round(lift / 2));
  const breathe = 1 + 0.06 * Math.sin(t * LOOPF(41) + id.length) * pulse;
  const sweep = ((t * 0.5 + id.length * 0.17) % 1.8) - 0.4;
  const tf = `translate(${dx} ${dy - lift}) translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;
  return (
    <g opacity={Math.min(1, g * 1.5)}>
      <defs>
        <linearGradient id={`top_${id}`} x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor={H.top0} /><stop offset="1" stopColor={H.top1} /></linearGradient>
        <linearGradient id={`sw_${id}`} x1={sweep - 0.25} y1="0" x2={sweep + 0.25} y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id={`cl_${id}`}><path d={d} /></clipPath>
        <filter id={`bl_${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <path d={d} fill="#000" opacity={0.45 * g} transform={`translate(${dx + 10} ${dy + 20}) translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} filter={`url(#bl_${id})`} />
      <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
        {Array.from({ length: n }, (_, k) => <path key={k} d={d} fill={H.side} transform={`translate(0 ${-(k * lift) / n})`} />)}
      </g>
      <g transform={tf}>
        <path d={d} fill={H.glow} opacity={0.55 * breathe} filter={`url(#bl_${id})`} />
        <path d={d} fill={`url(#top_${id})`} />
        <path d={d} fill="none" stroke={H.rim} strokeWidth={12} opacity={0.3} clipPath={`url(#cl_${id})`} strokeLinejoin="round" />
        <path d={d} fill={`url(#sw_${id})`} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={3.6} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** One of the creator's GPT cut-outs (public/pangea/img), or the code fallback while it hasn't arrived. */
export const Cut: React.FC<{ k: string; w: number; fallback?: React.ReactNode; style?: React.CSSProperties }> = ({ k, w, fallback = null, style }) =>
  HAVE[k] ? <Img src={staticFile(`pangea/img/${k}.png`)} style={{ width: w, height: 'auto', display: 'block', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.45))', ...style }} /> : <>{fallback}</>;

/** The "you are here" pin with pulse rings. */
export const Pin: React.FC<{ t: number; size?: number }> = ({ t, size = 120 }) => (
  <svg width={size * 3} height={size * 3} viewBox="-150 -150 300 300" style={{ overflow: 'visible' }}>
    {[0, 1, 2].map((k) => { const p = ((t * 0.9 + k / 3) % 1); return <ellipse key={k} cx={0} cy={60} rx={20 + 110 * p} ry={(20 + 110 * p) * 0.42} fill="none" stroke="#FF2B2B" strokeWidth={6} opacity={0.8 * (1 - p)} />; })}
    <ellipse cx={0} cy={62} rx={22} ry={9} fill="#000" opacity={0.4} />
    <path d="M0,60 C-14,30 -46,4 -46,-34 A46,46 0 1 1 46,-34 C46,4 14,30 0,60Z" fill="#E8141F" stroke="#fff" strokeWidth={6} />
    <circle cx={0} cy={-34} r={17} fill="#fff" />
  </svg>
);

/** Dust bursting off something that crumbles (code particles; the GPT dust burst sits on top when it exists). */
export const Crumble: React.FC<{ t: number; t0: number; w: number; seed: number }> = ({ t, t0, w, seed }) => {
  const d = t - t0;
  if (d < 0 || d > 1.6) return null;
  return (
    <svg width={w * 2} height={w * 2} viewBox={`${-w} ${-w} ${w * 2} ${w * 2}`} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible', pointerEvents: 'none' }}>
      {Array.from({ length: 46 }, (_, i) => {
        const r1 = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453, a = r1 - Math.floor(r1);
        const r2 = Math.sin(i * 39.346 + seed * 11.135) * 24634.6345, b = r2 - Math.floor(r2);
        const x = (a - 0.5) * w * 0.8 + d * (120 + 260 * b), y = (b - 0.5) * w * 0.6 - d * (60 + 90 * a) + d * d * 40;
        return <circle key={i} cx={x} cy={y} r={3 + 6 * a * (1 - d / 1.6)} fill={i % 3 ? '#C9A27A' : '#8C6A48'} opacity={(1 - d / 1.6) * 0.9} />;
      })}
    </svg>
  );
};
