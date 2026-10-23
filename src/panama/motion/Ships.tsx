import React from 'react';
import { Img, random } from 'remotion';
import { C } from './theme';

// Top-down ships, bow pointing +x, origin at the centre, `len` long. The creator's UE5 images (pc01 LPG carrier, pc02
// container ship) are used when given; until then a ship is drawn in code (hull, deck, container rows, bridge).
const CONT = ['#B84A2E', '#2F6DB5', '#3F8A4E', '#8E959C', '#D9822B', '#9C3A3A', '#2E8C8C'];

export const ShipTop: React.FC<{ len?: number; src?: string; seed?: string; gas?: boolean }> = ({ len = 220, src, seed = 's', gas = false }) => {
  const w = len * 0.17;
  if (src) return <Img src={src} style={{ position: 'absolute', left: -len / 2, top: -len * 0.28, width: len, height: len * 0.56, objectFit: 'contain' }} />;
  const hull = `M ${-len / 2} ${-w / 2} L ${len * 0.32} ${-w / 2} Q ${len / 2} 0 ${len * 0.32} ${w / 2} L ${-len / 2} ${w / 2} Z`;
  const rows = 9;
  return (
    <svg width={len} height={w * 1.6} viewBox={`${-len / 2} ${-w * 0.8} ${len} ${w * 1.6}`} style={{ position: 'absolute', left: -len / 2, top: -w * 0.8, overflow: 'visible' }}>
      <path d={hull} fill={gas ? '#3A1E1E' : '#8E1E22'} stroke="#2A0E10" strokeWidth={1.5} />
      <path d={hull} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={3} transform={`scale(0.92 0.8)`} />
      {gas
        ? [0, 1, 2, 3].map((i) => <rect key={i} x={-len * 0.3 + i * len * 0.15} y={-w * 0.32} width={len * 0.13} height={w * 0.64} rx={w * 0.3} fill="#F4F1EA" stroke="#B8B2A6" strokeWidth={1} />)
        : Array.from({ length: rows }, (_, i) => (
          <g key={i}>
            {[-1, 0, 1].map((j) => (
              <rect key={j} x={-len * 0.3 + i * len * 0.065} y={j * w * 0.27 - w * 0.13} width={len * 0.058} height={w * 0.25} fill={CONT[Math.floor(random(`${seed}${i}${j}`) * CONT.length)]} stroke="#00000033" strokeWidth={0.6} />
            ))}
          </g>
        ))}
      <rect x={-len * 0.47} y={-w * 0.36} width={len * 0.1} height={w * 0.72} rx={2} fill="#F2F2EE" stroke="#9A9A96" strokeWidth={1} />
      <rect x={-len * 0.455} y={-w * 0.1} width={len * 0.04} height={w * 0.2} fill="#2A2A2A" />
    </svg>
  );
};

/** A V-shaped wake behind a ship: thin white lines that stretch and fade, flickering a little. */
export const Wake: React.FC<{ len: number; f: number; k?: number; seed?: number }> = ({ len, f, k = 1, seed = 0 }) => {
  const s = 0.75 + 0.25 * Math.sin(f / 7 + seed);
  return (
    <svg width={len * 3} height={len} viewBox={`${-len * 2.6} ${-len / 2} ${len * 3} ${len}`} style={{ position: 'absolute', left: -len * 2.6, top: -len / 2, overflow: 'visible', opacity: k }}>
      {[-1, 1].map((d) => (
        <path key={d} d={`M ${-len * 0.45} ${d * len * 0.06} L ${-len * (1.4 + 0.6 * s)} ${d * len * (0.28 + 0.06 * s)}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
      ))}
      <path d={`M ${-len * 0.48} 0 L ${-len * (1.7 + 0.5 * s)} 0`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} style={{ filter: 'blur(3px)' }} />
    </svg>
  );
};

/** The gold "skip the line" glow: a pulsing warm halo under a ship. */
export const GoldHalo: React.FC<{ len: number; f: number }> = ({ len, f }) => {
  const p = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <div style={{ position: 'absolute', left: -len * 0.75, top: -len * 0.32, width: len * 1.5, height: len * 0.64, borderRadius: '50%', mixBlendMode: 'screen',
      background: `radial-gradient(ellipse, rgba(255,226,122,${0.85 + 0.15 * p}), rgba(255,200,61,${0.35 + 0.2 * p}) 45%, rgba(255,170,40,0) 72%)`, transform: `scale(${1 + 0.08 * p})` }} />
  );
};

export const SHIP_TINTS = ['none', 'hue-rotate(160deg) saturate(0.7)', 'hue-rotate(40deg)', 'saturate(0.4) brightness(1.1)'];
export { C };
