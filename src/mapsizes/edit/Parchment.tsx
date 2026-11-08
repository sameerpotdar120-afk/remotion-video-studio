import React from 'react';
import { Cam, GEO, merc, ringsD, toS } from './cam';

// The 1569 act: an old-style Mercator chart of the Atlantic drawn in code from Natural Earth land (aged paper sea,
// inked coasts, a 15° graticule, rhumb-line rays from a wind rose), and a sailing ship. No image assets.
const INK = '#3E2C1E';

/** An 16th-century sailing ship facing right, waterline at (0,0). rock is the sway in degrees; flip faces it left. */
export const Ship: React.FC<{ s?: number; rock?: number; flip?: boolean }> = ({ s = 1, rock = 0, flip }) => (
  <g transform={`scale(${flip ? -s : s} ${s}) rotate(${rock})`}>
    <ellipse cx={0} cy={14} rx={70} ry={8} fill="rgba(60,40,20,0.25)" />
    <path d="M-60 -6 L60 -6 L46 16 L-48 16 Z" fill="#7A5236" stroke={INK} strokeWidth={2.5} />
    <rect x={-50} y={-10} width={100} height={6} fill="#A9784F" />
    {[-22, 18].map((x, i) => (
      <g key={x}>
        <rect x={x - 2} y={-92 + i * 8} width={4} height={86 - i * 8} fill="#4A3424" />
        <path d={`M${x - 22} ${-80 + i * 8} Q${x} ${-72 + i * 8} ${x + 22} ${-80 + i * 8} L${x + 20} ${-34} Q${x} ${-28} ${x - 20} ${-34} Z`} fill="#F4EBD6" stroke={INK} strokeWidth={2} />
        <path d={`M${x - 8} ${-66 + i * 8} L${x + 8} ${-66 + i * 8} M${x} ${-74 + i * 8} L${x} ${-56 + i * 8}`} stroke="#A8322D" strokeWidth={3} />
      </g>
    ))}
    <path d="M-2 -100 L14 -96 L-2 -92 Z" fill="#B0302B" />
  </g>
);

export const Parchment: React.FC<{ c: Cam }> = ({ c }) => {
  const d = ringsD(c, GEO.land);
  const [rx, ry] = toS(c, merc(-40, 32));
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
        <radialGradient id="vig" cx="50%" cy="48%" r="70%"><stop offset="0.6" stopColor="#5A3A1A" stopOpacity="0" /><stop offset="1" stopColor="#5A3A1A" stopOpacity="0.45" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#C9C7AE" />
      {/* the wind rose's rhumb lines, as on the old charts */}
      {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <line key={i} x1={rx} y1={ry} x2={rx + Math.cos(a) * 2600} y2={ry + Math.sin(a) * 2600} stroke={INK} strokeOpacity={0.14} strokeWidth={1.5} />; })}
      {Array.from({ length: 13 }, (_, i) => { const lon = -120 + i * 15; const [x] = toS(c, merc(lon, 0)); return <line key={lon} x1={x} y1={0} x2={x} y2={1920} stroke={INK} strokeOpacity={0.18} strokeWidth={1.6} />; })}
      {Array.from({ length: 10 }, (_, i) => { const lat = -60 + i * 15; const [, y] = toS(c, merc(0, lat)); return <line key={lat} x1={0} y1={y} x2={1080} y2={y} stroke={INK} strokeOpacity={lat === 0 ? 0.4 : 0.18} strokeWidth={lat === 0 ? 3 : 1.6} />; })}
      <path d={d} fill="#E3CFA4" stroke="#F7EBD0" strokeWidth={6} strokeLinejoin="round" style={{ filter: 'drop-shadow(4px 6px 6px rgba(70,45,20,0.35))' }} />
      <path d={d} fill="none" stroke={INK} strokeOpacity={0.6} strokeWidth={2} />
      <g transform={`translate(${rx} ${ry})`} opacity={0.75}>
        <circle r={70} fill="none" stroke={INK} strokeWidth={3} /><circle r={58} fill="none" stroke={INK} strokeWidth={1.5} />
        {[0, 90, 180, 270].map((a) => <path key={a} d="M0 -86 L11 -11 L0 0 L-11 -11 Z" fill={a === 0 ? '#A8322D' : INK} transform={`rotate(${a})`} />)}
        {[45, 135, 225, 315].map((a) => <path key={a} d="M0 -54 L7 -7 L0 0 L-7 -7 Z" fill={INK} opacity={0.6} transform={`rotate(${a})`} />)}
      </g>
      <rect width={1080} height={1920} filter="url(#blot)" />
      <rect width={1080} height={1920} filter="url(#paper)" />
      <rect width={1080} height={1920} fill="url(#vig)" />
    </svg>
  );
};
