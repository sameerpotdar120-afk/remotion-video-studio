import React from 'react';
import { Img, staticFile } from 'remotion';
import { LOOPF } from './cam';
import { ASPECT } from './assets';

/** Studio highlight colours: a hot red for India, a strong blue for every other place the VO names. */
export const HUE = {
  red: { top0: '#FF3B30', top1: '#B8000F', side: '#5A0008', rim: '#FF9A90', glow: '#FF1A1A' },
  blue: { top0: '#3AA8FF', top1: '#0046C8', side: '#041F5C', rim: '#9FD6FF', glow: '#1E7BFF' },
  green: { top0: '#39D26A', top1: '#0E8A38', side: '#06401A', rim: '#B8F5C8', glow: '#1FC25A' },
  orange: { top0: '#FFA247', top1: '#E0640A', side: '#6A2C02', rim: '#FFD9B0', glow: '#FF8A1E' },
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

/** One of the creator's GPT images (public/ukcountry/img), w px wide. screen = an image made on black (light, fire). */
export const Cut: React.FC<{ k: string; w: number; screen?: boolean; style?: React.CSSProperties; shadow?: boolean }> = ({ k, w, screen, style, shadow = true }) =>
  ASPECT[k] ? (
    <Img src={staticFile(`ukcountry/img/${k}.png`)} style={{ width: w, height: w / ASPECT[k], display: 'block', ...(screen ? { mixBlendMode: 'screen' } : shadow ? { filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.5))' } : {}), ...style }} />
  ) : null;
