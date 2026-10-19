import React from 'react';
import { C } from './theme';

// Period heraldry drawn in code (no modern flags): England's St George's cross, the French royal arms (gold
// fleur-de-lis on blue) and Burgundy's red saltire. Each fills a 60 × 40 box.

// a fleur-de-lis in a 100 × 100 box, centred at (50, 50)
export const FLEUR = 'M50 2 C64 20 66 38 50 58 C34 38 36 20 50 2 Z M45 52 C40 36 22 30 13 40 C6 49 13 62 25 59 C19 53 22 45 30 47 C37 49 42 55 44 59 Z M55 52 C60 36 78 30 87 40 C94 49 87 62 75 59 C81 53 78 45 70 47 C63 49 58 55 56 59 Z M28 58 H72 V67 H28 Z M44 67 H56 L54 82 Q50 94 46 82 Z M40 67 C34 76 26 80 20 78 C26 86 36 84 42 74 Z M60 67 C66 76 74 80 80 78 C74 86 64 84 58 74 Z';

export const Fleur: React.FC<{ x: number; y: number; s: number; fill?: string }> = ({ x, y, s, fill = C.gold }) => (
  <path d={FLEUR} transform={`translate(${x - 50 * s} ${y - 50 * s}) scale(${s})`} fill={fill} stroke="#7A5A10" strokeWidth={2 / s} strokeLinejoin="round" />
);

export type Arms = 'england' | 'france' | 'burgundy';
export const Banner: React.FC<{ id: Arms }> = ({ id }) => {
  if (id === 'england') return (
    <g><rect width={60} height={40} fill="#fff" /><rect x={25} width={10} height={40} fill="#CE1124" /><rect y={15} width={60} height={10} fill="#CE1124" /></g>
  );
  if (id === 'burgundy') return (
    <g><rect width={60} height={40} fill="#fff" /><path d="M4 2 L56 38 M56 2 L4 38" stroke="#C8102E" strokeWidth={7} strokeLinecap="round" strokeDasharray="7 4" /></g>
  );
  return (
    <g><rect width={60} height={40} fill="#1F3FB0" />
      <Fleur x={18} y={13} s={0.18} /><Fleur x={42} y={13} s={0.18} /><Fleur x={30} y={30} s={0.18} /></g>
  );
};

// a heater shield (pointed bottom) carrying the arms, centred at (0, 0), about 2r wide
export const Shield: React.FC<{ id: Arms; r: number; uid: string }> = ({ id, r, uid }) => {
  const d = `M ${-r} ${-r * 1.05} H ${r} V ${-r * 0.1} C ${r} ${r * 0.7} ${r * 0.4} ${r * 1.1} 0 ${r * 1.35} C ${-r * 0.4} ${r * 1.1} ${-r} ${r * 0.7} ${-r} ${-r * 0.1} Z`;
  return (
    <g>
      <defs><clipPath id={`sh-${uid}`}><path d={d} /></clipPath>
        <linearGradient id={`shg-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.45} /><stop offset="0.5" stopColor="#fff" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.25} /></linearGradient>
      </defs>
      <g clipPath={`url(#sh-${uid})`}>
        <g transform={`translate(${-r * 1.05} ${-r * 1.1}) scale(${(r * 2.1) / 60} ${(r * 2.5) / 40})`}><Banner id={id} /></g>
        <path d={d} fill={`url(#shg-${uid})`} />
      </g>
      <path d={d} fill="none" stroke={C.gold} strokeWidth={r * 0.12} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={r * 0.04} strokeLinejoin="round" />
    </g>
  );
};

// a round banner pin for the map (like the reference's end flags), centred at (0, 0)
export const BannerPin: React.FC<{ id: Arms; w: number; uid: string; wave: number }> = ({ id, w, uid, wave }) => {
  const h = (w * 40) / 60;
  return (
    <g>
      <defs><clipPath id={`bp-${uid}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} /></clipPath></defs>
      <rect x={-w / 2 + w * 0.05} y={-h / 2 + w * 0.07} width={w} height={h} rx={w * 0.08} fill="#000" opacity={0.3} />
      <g clipPath={`url(#bp-${uid})`} transform={`skewY(${wave})`}>
        <g transform={`translate(${-w / 2} ${-h / 2}) scale(${w / 60})`}><Banner id={id} /></g>
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} fill="none" stroke="#fff" strokeWidth={w * 0.06} transform={`skewY(${wave})`} />
    </g>
  );
};
