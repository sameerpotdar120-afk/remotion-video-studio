import React from 'react';
import { Cam, GEO, ringsD, toS } from './cam';

// The history section's cartoon cast and its parchment map, all drawn in code (SVG): no image assets.
const INK = '#3E2C1E';

/** A fluffy cartoon sheep facing right, feet at (0,0). bob 0..1 lifts it mid-hop. */
export const Sheep: React.FC<{ s?: number; flip?: boolean; bob?: number }> = ({ s = 1, flip, bob = 0 }) => (
  <g transform={`scale(${flip ? -s : s} ${s}) translate(0 ${-bob * 10})`}>
    <ellipse cx={0} cy={4} rx={26} ry={6} fill="rgba(60,40,20,0.25)" />
    {[-14, -5, 6, 14].map((x) => <rect key={x} x={x - 2.5} y={-12} width={5} height={15} rx={2} fill={INK} />)}
    {[[-14, -22], [-4, -27], [8, -26], [16, -20], [-18, -14], [0, -16], [14, -13]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#FBF7EE" stroke={INK} strokeWidth={2} />)}
    <ellipse cx={24} cy={-22} rx={8} ry={10} fill={INK} />
    <circle cx={27} cy={-24} r={2} fill="#fff" />
    <ellipse cx={19} cy={-30} rx={5} ry={3} fill={INK} transform="rotate(-30 19 -30)" />
  </g>
);

/** A cartoon settler (tricorn hat, coat), feet at (0,0). mood: 0 neutral, 1 cross. arm 0..1 raises the rifle. */
export const Settler: React.FC<{ s?: number; coat?: string; mood?: number; arm?: number; rifle?: boolean }> = ({ s = 1, coat = '#2F4A7A', mood = 0, arm = 0, rifle }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={2} rx={22} ry={5} fill="rgba(60,40,20,0.25)" />
    <rect x={-10} y={-26} width={8} height={26} rx={3} fill="#5A4636" />
    <rect x={2} y={-26} width={8} height={26} rx={3} fill="#5A4636" />
    <path d="M-17 -26 L-14 -66 Q0 -74 14 -66 L17 -26 Z" fill={coat} stroke={INK} strokeWidth={2.5} />
    <rect x={-3} y={-64} width={6} height={36} fill="#F2EBDD" />
    {rifle && <g transform={`rotate(${-70 + 60 * arm} 10 -50)`}><rect x={8} y={-54} width={46} height={5} rx={2} fill="#4A3424" /><rect x={8} y={-55} width={14} height={8} rx={2} fill="#6B4A2E" /></g>}
    <circle cx={0} cy={-84} r={15} fill="#F1C7A1" stroke={INK} strokeWidth={2.5} />
    <circle cx={-5} cy={-85} r={2} fill={INK} /><circle cx={5} cy={-85} r={2} fill={INK} />
    <path d={mood > 0.5 ? 'M-6 -76 Q0 -80 6 -76' : 'M-6 -78 Q0 -74 6 -78'} stroke={INK} strokeWidth={2} fill="none" />
    {mood > 0.5 && <path d="M-9 -92 L-2 -89 M9 -92 L2 -89" stroke={INK} strokeWidth={2.5} />}
    <path d="M-24 -96 Q0 -112 24 -96 Q12 -100 0 -92 Q-12 -100 -24 -96 Z" fill="#2A2420" stroke={INK} strokeWidth={2} />
  </g>
);

/** An 18th-century sailing ship facing right, waterline at (0,0). rock is the sway in degrees. */
export const Ship: React.FC<{ s?: number; rock?: number }> = ({ s = 1, rock = 0 }) => (
  <g transform={`scale(${s}) rotate(${rock})`}>
    <path d="M-60 -6 L60 -6 L46 16 L-48 16 Z" fill="#7A5236" stroke={INK} strokeWidth={2.5} />
    <rect x={-50} y={-10} width={100} height={6} fill="#A9784F" />
    {[-22, 18].map((x, i) => (
      <g key={x}>
        <rect x={x - 2} y={-92 + i * 8} width={4} height={86 - i * 8} fill="#4A3424" />
        <path d={`M${x - 22} ${-80 + i * 8} Q${x} ${-72 + i * 8} ${x + 22} ${-80 + i * 8} L${x + 20} ${-34} Q${x} ${-28} ${x - 20} ${-34} Z`} fill="#F4EBD6" stroke={INK} strokeWidth={2} />
      </g>
    ))}
    <path d="M-2 -100 L14 -96 L-2 -92 Z" fill="#B0302B" />
  </g>
);

/** A steel leg-hold trap (open). */
export const Trap: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={0} rx={22} ry={8} fill="none" stroke="#5B6168" strokeWidth={4} />
    {[-16, -8, 0, 8, 16].map((x) => <path key={x} d={`M${x - 3} -2 L${x} -9 L${x + 3} -2`} fill="#7B8189" />)}
    <rect x={-4} y={-3} width={8} height={6} fill="#7B8189" />
    <path d="M22 0 Q34 4 40 -2" stroke="#5B6168" strokeWidth={3} fill="none" />
  </g>
);

/** A wooden fence post with two strands of wire stubs, base at (0,0). */
export const Post: React.FC<{ h?: number }> = ({ h = 70 }) => (
  <g>
    <ellipse cx={0} cy={2} rx={9} ry={3} fill="rgba(60,40,20,0.3)" />
    <rect x={-5} y={-h} width={10} height={h} rx={2} fill="#8A6A48" stroke={INK} strokeWidth={2} />
    <rect x={-5} y={-h} width={10} height={6} rx={2} fill="#6B4F35" />
  </g>
);

/** The parchment map: aged paper sea, land as cut paper with an inked coast, a faint graticule, paper fibres. */
export const Parchment: React.FC<{ c: Cam; seed?: number }> = ({ c }) => {
  const d = ringsD(c, GEO.land);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <filter id="paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} result="n" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.12 0" />
        </filter>
        <filter id="blot" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={2} seed={9} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.36  0 0 0 0 0.2  0 0 0 0.35 -0.08" />
        </filter>
        <filter id="landEdge"><feMorphology operator="dilate" radius={3} /></filter>
        <radialGradient id="vig" cx="50%" cy="48%" r="70%"><stop offset="0.6" stopColor="#5A3A1A" stopOpacity="0" /><stop offset="1" stopColor="#5A3A1A" stopOpacity="0.45" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#B9C3B6" />
      {Array.from({ length: 13 }, (_, i) => { const lon = 60 + i * 10; const [x] = toS(c, [6378137 * lon * Math.PI / 180, 0]); return <line key={lon} x1={x} y1={0} x2={x} y2={1920} stroke={INK} strokeOpacity={0.12} strokeWidth={1.5} />; })}
      {Array.from({ length: 10 }, (_, i) => { const lat = -50 + i * 10; const y = 960 - (6378137 * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) - c.y) / c.mpp; return <line key={lat} x1={0} y1={y} x2={1080} y2={y} stroke={INK} strokeOpacity={0.12} strokeWidth={1.5} />; })}
      <path d={d} fill="#E3CFA4" stroke="#F7EBD0" strokeWidth={6} strokeLinejoin="round" style={{ filter: 'drop-shadow(4px 6px 6px rgba(70,45,20,0.35))' }} />
      <path d={d} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.8} />
      <g transform="translate(870 300)" opacity={0.85}>
        <circle r={78} fill="none" stroke={INK} strokeWidth={3} /><circle r={66} fill="none" stroke={INK} strokeWidth={1.5} />
        {[0, 90, 180, 270].map((a) => <path key={a} d="M0 -96 L12 -12 L0 0 L-12 -12 Z" fill={a === 0 ? '#A8322D' : INK} transform={`rotate(${a})`} />)}
        {[45, 135, 225, 315].map((a) => <path key={a} d="M0 -60 L8 -8 L0 0 L-8 -8 Z" fill={INK} opacity={0.6} transform={`rotate(${a})`} />)}
        <text y={-104} textAnchor="middle" fontFamily="serif" fontSize={30} fill={INK}>N</text>
      </g>
      <rect width={1080} height={1920} filter="url(#blot)" />
      <rect width={1080} height={1920} filter="url(#paper)" />
      <rect width={1080} height={1920} fill="url(#vig)" />
    </svg>
  );
};
