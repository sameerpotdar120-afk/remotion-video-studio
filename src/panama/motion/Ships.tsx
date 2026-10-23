import React from 'react';
import { Img, random } from 'remotion';
import { C } from './theme';

// Top-down ships, bow pointing +x, origin at the centre, `len` long. The creator's UE5 images (pc01 LPG carrier, pc02
// container ship) are used when given; until then a detailed ship is drawn in code: a shaded hull (rounded bilge,
// lighter along the keel line), deck plating, containers as little boxes (lit top, darker sides, corrugation lines),
// the bridge block with window rows and its own shadow, a soft drop shadow on the water, bow foam and stern wash.
const CONT = [['#C8553A', '#8E3624'], ['#3A7CC4', '#244F80'], ['#4E9A5B', '#2F6438'], ['#9AA1A8', '#646A70'], ['#E08A33', '#9C5A1C'], ['#B04848', '#702A2A'], ['#3A9C9C', '#236464']];
let uid = 0;

export const ShipTop: React.FC<{ len?: number; src?: string; seed?: string; gas?: boolean; f?: number }> = ({ len = 220, src, seed = 's', gas = false, f = 0 }) => {
  const w = len * 0.165;
  const id = `sh${seed}${(uid = (uid + 1) % 1e6)}`;
  const shadow = <div style={{ position: 'absolute', left: -len * 0.47 + len * 0.04, top: -w * 0.5 + len * 0.05, width: len * 0.94, height: w, borderRadius: `${w}px ${w * 1.6}px ${w * 1.6}px ${w}px`, background: 'rgba(0,20,30,0.45)', filter: `blur(${len * 0.025}px)` }} />;
  if (src) return <>{shadow}<Img src={src} style={{ position: 'absolute', left: -len / 2, top: -len * 0.28, width: len, height: len * 0.56, objectFit: 'contain' }} /></>;
  const hull = `M ${-len * 0.48} ${-w * 0.42} Q ${-len * 0.5} 0 ${-len * 0.48} ${w * 0.42} L ${-len * 0.46} ${w / 2} L ${len * 0.3} ${w / 2} C ${len * 0.42} ${w * 0.46} ${len * 0.5} ${w * 0.15} ${len * 0.5} 0 C ${len * 0.5} ${-w * 0.15} ${len * 0.42} ${-w * 0.46} ${len * 0.3} ${-w / 2} L ${-len * 0.46} ${-w / 2} Z`;
  const rows = 11, bays = 4;
  const foam = 0.6 + 0.4 * Math.sin(f / 5 + len);
  return (
    <>
      {shadow}
      <svg width={len * 1.1} height={w * 2} viewBox={`${-len * 0.55} ${-w} ${len * 1.1} ${w * 2}`} style={{ position: 'absolute', left: -len * 0.55, top: -w, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}h`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={gas ? '#2A1416' : '#5E1216'} /><stop offset="0.5" stopColor={gas ? '#4A2427' : '#A62228'} /><stop offset="1" stopColor={gas ? '#1E0E10' : '#4A0E12'} />
          </linearGradient>
          <linearGradient id={`${id}d`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5A2A2C" /><stop offset="0.5" stopColor="#7A3A3C" /><stop offset="1" stopColor="#4A2022" /></linearGradient>
          <radialGradient id={`${id}t`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#E6E2D8" /><stop offset="1" stopColor="#A8A296" /></radialGradient>
        </defs>
        {/* bow foam */}
        <path d={`M ${len * 0.5} 0 Q ${len * 0.44} ${-w * 0.7} ${len * 0.28} ${-w * 0.68} M ${len * 0.5} 0 Q ${len * 0.44} ${w * 0.7} ${len * 0.28} ${w * 0.68}`} stroke="#fff" strokeWidth={w * 0.12} fill="none" strokeLinecap="round" opacity={0.55 * foam} style={{ filter: 'blur(1px)' }} />
        <path d={hull} fill={`url(#${id}h)`} stroke="#200608" strokeWidth={len * 0.006} />
        <path d={hull} transform="scale(0.94 0.78)" fill={`url(#${id}d)`} />
        {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M ${-len * 0.4 + k * len * 0.1} ${-w * 0.36} L ${-len * 0.4 + k * len * 0.1} ${w * 0.36}`} stroke="#00000022" strokeWidth={1} />)}
        {gas
          ? [0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={-len * 0.3 + i * len * 0.15} y={-w * 0.3} width={len * 0.135} height={w * 0.6} rx={w * 0.3} fill={`url(#${id}t)`} stroke="#8C867A" strokeWidth={len * 0.004} />
              <rect x={-len * 0.3 + i * len * 0.15 + len * 0.02} y={-w * 0.04} width={len * 0.095} height={w * 0.08} rx={2} fill="#C9C3B6" />
            </g>
          ))
          : Array.from({ length: rows }, (_, i) => Array.from({ length: bays }, (_, j) => {
            const c = CONT[Math.floor(random(`${seed}${i}${j}`) * CONT.length)];
            const x = -len * 0.33 + i * len * 0.056, y = -w * 0.37 + j * w * 0.185, cw = len * 0.053, ch = w * 0.175;
            return (
              <g key={`${i}${j}`}>
                <rect x={x} y={y} width={cw} height={ch} fill={c[1]} />
                <rect x={x} y={y} width={cw * 0.88} height={ch * 0.82} fill={c[0]} />
                {[0.25, 0.5, 0.75].map((q) => <path key={q} d={`M ${x + cw * q} ${y} L ${x + cw * q} ${y + ch * 0.82}`} stroke="#00000030" strokeWidth={0.8} />)}
              </g>
            );
          }))}
        {/* bridge: shadow, block, window rows, funnel */}
        <rect x={-len * 0.455 + len * 0.012} y={-w * 0.4 + len * 0.012} width={len * 0.085} height={w * 0.8} rx={2} fill="#00000040" />
        <rect x={-len * 0.455} y={-w * 0.42} width={len * 0.085} height={w * 0.84} rx={2} fill="#F4F4F0" stroke="#9A9A96" strokeWidth={len * 0.004} />
        <rect x={-len * 0.38} y={-w * 0.42} width={len * 0.012} height={w * 0.84} fill="#2B3A46" />
        <rect x={-len * 0.44} y={-w * 0.09} width={len * 0.03} height={w * 0.18} rx={2} fill={gas ? '#2B3A46' : '#C8202A'} />
      </svg>
    </>
  );
};

/** A V-shaped wake behind a ship: foam lines that stretch, flicker and break into dots, plus prop wash. */
export const Wake: React.FC<{ len: number; f: number; k?: number; seed?: number; speed?: number }> = ({ len, f, k = 1, seed = 0, speed = 1 }) => {
  const s = 0.75 + 0.25 * Math.sin(f / 7 + seed);
  const L = len * (1.4 + 0.8 * speed);
  return (
    <svg width={L * 2} height={len} viewBox={`${-L - len * 0.5} ${-len / 2} ${L * 2} ${len}`} style={{ position: 'absolute', left: -L - len * 0.5, top: -len / 2, overflow: 'visible', opacity: k }}>
      {[-1, 1].map((d) => (
        <path key={d} d={`M ${-len * 0.42} ${d * len * 0.07} Q ${-len * 0.9} ${d * len * 0.16} ${-L * s} ${d * len * (0.3 + 0.08 * s) * (0.6 + 0.4 * speed)}`} stroke="#fff" strokeWidth={len * 0.018} strokeLinecap="round" fill="none" opacity={0.7} strokeDasharray={`${len * 0.3} ${len * 0.06}`} strokeDashoffset={-f * 2 * speed} />
      ))}
      <path d={`M ${-len * 0.46} 0 L ${-L * (0.9 + 0.1 * s)} 0`} stroke="#E8FBFF" strokeWidth={len * 0.07} strokeLinecap="round" opacity={0.35} style={{ filter: `blur(${len * 0.02}px)` }} />
      {Array.from({ length: 10 }, (_, i) => {
        const t = ((f * 0.03 * (0.5 + speed) + random(`w${seed}${i}`)) % 1);
        return <circle key={i} cx={-len * 0.5 - t * L} cy={(random(`wy${seed}${i}`) - 0.5) * len * 0.3 * t} r={len * 0.012 * (1 - t) + 1} fill="#fff" opacity={0.8 * (1 - t)} />;
      })}
    </svg>
  );
};

/** The gold "skip the line" glow: a pulsing warm halo, soft god-rays turning slowly, and rising sparkles. */
export const GoldHalo: React.FC<{ len: number; f: number }> = ({ len, f }) => {
  const p = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <>
      <div style={{ position: 'absolute', left: -len * 0.9, top: -len * 0.45, width: len * 1.8, height: len * 0.9, borderRadius: '50%', mixBlendMode: 'screen',
        background: `radial-gradient(ellipse, rgba(255,232,140,${0.9}), rgba(255,200,61,${0.4 + 0.2 * p}) 40%, rgba(255,170,40,0) 70%)`, transform: `scale(${1 + 0.1 * p})` }} />
      <svg width={len * 3} height={len * 3} viewBox={`${-len * 1.5} ${-len * 1.5} ${len * 3} ${len * 3}`} style={{ position: 'absolute', left: -len * 1.5, top: -len * 1.5, mixBlendMode: 'screen', opacity: 0.55 }}>
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M 0 0 L ${len * 1.4} ${-len * 0.06} L ${len * 1.4} ${len * 0.06} Z`} fill="#FFE9A0" opacity={0.25 + 0.2 * Math.sin(f / 8 + i)} transform={`rotate(${i * 36 + f * 0.4})`} style={{ filter: 'blur(4px)' }} />)}
      </svg>
      {Array.from({ length: 8 }, (_, i) => {
        const t = ((f + i * 11) % 60) / 60;
        return <div key={i} style={{ position: 'absolute', left: (random(`gs${i}`) - 0.5) * len, top: -t * len * 0.6 + (random(`gy${i}`) - 0.5) * len * 0.3, width: 8, height: 8, background: '#FFF4C2', transform: `rotate(45deg) scale(${Math.sin(t * Math.PI)})`, boxShadow: '0 0 8px #FFE27A' }} />;
      })}
    </>
  );
};

export const SHIP_TINTS = ['none', 'hue-rotate(150deg) saturate(0.6)', 'hue-rotate(30deg) saturate(1.1)', 'saturate(0.3) brightness(1.15)'];
export { C };
