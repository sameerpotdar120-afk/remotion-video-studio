import React from 'react';
import { C } from './theme';

// Period flags, drawn in code. Each fills a 60 × 40 box.
//   Britain: the Union Flag (counterchanged saltire simplified to a centred one).
//   France: the tricolour.
//   Siam: the 1855–1916 flag, a white elephant facing the hoist on red (Thailand's tricolour came in 1917).
export type FlagId = 'britain' | 'france' | 'siam';

const UnionJack: React.FC = () => (
  <g>
    <rect width={60} height={40} fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth={8} />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth={2.6} />
    <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth={13} />
    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth={7.5} />
  </g>
);

const Tricolour: React.FC = () => (
  <g>
    <rect width={20} height={40} fill="#002395" />
    <rect x={20} width={20} height={40} fill="#FFFFFF" />
    <rect x={40} width={20} height={40} fill="#ED2939" />
  </g>
);

// a plain white elephant, standing, trunk down toward the hoist (left)
export const Elephant: React.FC<{ fill?: string }> = ({ fill = '#fff' }) => (
  <g fill={fill}>
    <ellipse cx={33} cy={20} rx={13} ry={8.2} />
    <circle cx={20.5} cy={17.5} r={6.6} />
    <ellipse cx={24} cy={17} rx={4.2} ry={5.6} opacity={0.92} />
    <path d="M15.2,17 C12.2,19 12.6,24 12.4,28.5 L15,28.5 C15.2,25 15.4,22 18,20.4 Z" />
    <rect x={22.5} y={24} width={3.6} height={8.5} rx={1.2} />
    <rect x={27.5} y={24.5} width={3.6} height={8} rx={1.2} />
    <rect x={36.5} y={24.5} width={3.6} height={8} rx={1.2} />
    <rect x={41.2} y={24} width={3.6} height={8.5} rx={1.2} />
    <path d="M45.6,18 C48,19 48.4,22 47.6,25" stroke={fill} strokeWidth={1.2} fill="none" strokeLinecap="round" />
  </g>
);

const SiamFlag: React.FC = () => (
  <g>
    <rect width={60} height={40} fill="#D2232A" />
    <Elephant />
  </g>
);

export const Flag: React.FC<{ id: FlagId }> = ({ id }) => (id === 'britain' ? <UnionJack /> : id === 'france' ? <Tricolour /> : <SiamFlag />);

// A round flag pin like the reference's: the flag clipped to a circle, a dark rim, a glossy highlight and a soft shadow.
// Drawn centred on (0, 0) with radius r.
export const FlagBall: React.FC<{ id: FlagId; r: number; uid: string }> = ({ id, r, uid }) => {
  const k = (2 * r) / 40;
  return (
    <g>
      <defs>
        <clipPath id={`fb-${uid}`}><circle r={r} /></clipPath>
        <radialGradient id={`fbg-${uid}`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <ellipse cx={r * 0.08} cy={r * 0.16} rx={r * 1.04} ry={r * 1.04} fill="#000" opacity={0.35} style={{ filter: `blur(${r * 0.1}px)` }} />
      <g clipPath={`url(#fb-${uid})`}>
        <g transform={`translate(${-30 * k} ${-20 * k}) scale(${k})`}><Flag id={id} /></g>
        <circle r={r} fill={`url(#fbg-${uid})`} />
      </g>
      <circle r={r} fill="none" stroke={C.ink} strokeWidth={r * 0.13} />
      <ellipse cx={-r * 0.32} cy={-r * 0.42} rx={r * 0.32} ry={r * 0.16} fill="#fff" opacity={0.55} transform={`rotate(-28 ${-r * 0.32} ${-r * 0.42})`} />
    </g>
  );
};
