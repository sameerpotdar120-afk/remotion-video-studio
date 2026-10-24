import React from 'react';
import { Img } from 'remotion';

/** A 15th-century carrack seen from the side, bow to the right, `w` wide (the creator's wi04 image when given; drawn in
 *  code until then): a rounded oak hull with a tall stern castle, three masts with wind-filled sails (red crosses),
 *  rigging lines. `f` drives the sails' breathing. Origin at the top-left; the waterline is at 0.82 of the height. */
export const Carrack: React.FC<{ w?: number; src?: string; f?: number }> = ({ w = 360, src, f = 0 }) => {
  const h = w * 0.56;
  if (src) return <Img src={src} style={{ width: w, height: h, objectFit: 'contain' }} />;
  const b = 1 + 0.03 * Math.sin(f / 11);
  const sail = (x: number, top: number, sw: number, sh: number, cross: boolean, k: number) => (
    <g key={x} transform={`translate(${x} ${top})`}>
      <path d={`M 0 0 Q ${sw * 0.62 * b} ${sh * 0.5} 0 ${sh} L ${-sw * 0.06} ${sh} Q ${sw * 0.52 * b} ${sh * 0.5} ${-sw * 0.06} 0 Z`} fill="#000" opacity={0.15} transform={`translate(${-sw * 0.5} 0)`} />
      <path d={`M ${-sw / 2} 0 L ${sw / 2} 0 Q ${sw / 2 + sw * 0.18 * b} ${sh * 0.5} ${sw / 2} ${sh} L ${-sw / 2} ${sh} Q ${-sw / 2 + sw * 0.18 * b} ${sh * 0.5} ${-sw / 2} 0 Z`} fill={`url(#csail${k})`} stroke="#8C7A5A" strokeWidth={1.5} />
      {cross && <path d={`M ${sw * 0.05} ${sh * 0.2} L ${sw * 0.05} ${sh * 0.8} M ${-sw * 0.18} ${sh * 0.48} L ${sw * 0.28} ${sh * 0.48}`} stroke="#B3121A" strokeWidth={sw * 0.09} strokeLinecap="round" />}
    </g>
  );
  return (
    <svg width={w} height={h} viewBox="0 0 360 202" style={{ overflow: 'visible' }}>
      <defs>
        {[0, 1, 2].map((k) => <linearGradient key={k} id={`csail${k}`} x1="0" x2="1"><stop offset="0" stopColor="#E9DFC6" /><stop offset="0.6" stopColor="#F7F0DE" /><stop offset="1" stopColor="#CFC3A4" /></linearGradient>)}
        <linearGradient id="chull" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8A5A30" /><stop offset="0.5" stopColor="#5E3A1C" /><stop offset="1" stopColor="#3A220E" /></linearGradient>
      </defs>
      {/* rigging */}
      <path d="M 40 120 L 100 18 L 170 8 L 250 22 L 330 120 M 100 18 L 60 120 M 250 22 L 300 120" stroke="#3A2A18" strokeWidth={1.2} fill="none" opacity={0.7} />
      {/* masts */}
      {[[100, 20], [175, 6], [255, 26]].map(([x, t]) => <rect key={x} x={x - 3} y={t} width={6} height={150 - t} fill="#4A2E14" />)}
      {sail(100, 34, 60, 70, false, 0)}
      {sail(175, 18, 84, 100, true, 1)}
      {sail(255, 40, 62, 74, true, 2)}
      {/* hull: low waist, tall stern castle (left), forecastle (right) */}
      <path d="M 18 108 L 70 112 L 300 118 L 344 104 L 330 150 Q 300 172 180 174 Q 60 172 34 152 Z" fill="url(#chull)" stroke="#24140A" strokeWidth={2} />
      <path d="M 18 108 L 14 86 L 76 90 L 72 114 Z" fill="#6E4422" stroke="#24140A" strokeWidth={2} />
      <path d="M 300 118 L 302 100 L 348 96 L 344 106 Z" fill="#6E4422" stroke="#24140A" strokeWidth={2} />
      {[130, 140, 150, 160].map((y) => <path key={y} d={`M ${40 + (y - 130) * 0.4} ${y} Q 180 ${y + 8} ${326 - (y - 130) * 0.4} ${y - 12}`} stroke="#2A170A" strokeWidth={1} fill="none" opacity={0.6} />)}
      {[60, 110, 160, 210, 260].map((x) => <circle key={x} cx={x} cy={128 + x * 0.01} r={3} fill="#1A0E06" />)}
      <path d="M 175 6 L 196 12 L 175 16 Z" fill="#B3121A" />
    </svg>
  );
};
