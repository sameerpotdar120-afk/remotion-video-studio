import React from 'react';
import { clamp01, lerp } from '../darien/anim';
import { PLANE } from './cam';

type P = [number, number];
export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
export const RED = '#FF3B4B';
export const BLUE = '#3B5BFF';
export const CYAN = '#3FE0FF';

export const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

/** Full-plane SVG layer. */
export const Svg: React.FC<{ children: React.ReactNode; opacity?: number; filter?: string; blend?: React.CSSProperties['mixBlendMode'] }> = ({ children, opacity = 1, filter, blend }) =>
  opacity <= 0.001 ? null : (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, filter, mixBlendMode: blend }}>
      {children}
    </svg>
  );

// ---------------------------------------------------------------- flags drawn to spec
const starD = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.382 : r;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return d + 'Z';
};

const FlagArt: React.FC<{ kind: 'us' | 'ru'; x: number; y: number; w: number; h: number }> = ({ kind, x, y, w, h }) => {
  if (kind === 'ru') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h / 3 + 1} fill="#FFFFFF" />
        <rect x={x} y={y + h / 3} width={w} height={h / 3 + 1} fill="#0039A6" />
        <rect x={x} y={y + (2 * h) / 3} width={w} height={h / 3} fill="#D52B1E" />
      </g>
    );
  }
  const sh = h / 13;
  const cw = w * 0.4;
  const ch = sh * 7;
  let stars = '';
  for (let r = 0; r < 9; r++) {
    const n = r % 2 === 0 ? 6 : 5;
    for (let i = 0; i < n; i++) stars += starD(x + (cw / 12) * (r % 2 === 0 ? 1 + i * 2 : 2 + i * 2), y + (ch / 10) * (r + 1), h * 0.0308);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={x} y={y + i * 2 * sh} width={w} height={sh + 0.5} fill="#B22234" />)}
      <rect x={x} y={y} width={cw} height={ch} fill="#3C3B6E" />
      <path d={stars} fill="#FFFFFF" />
    </g>
  );
};

/**
 * A flag waving like cloth inside a shape: the flag is cut into vertical strips that ride a travelling
 * sine wave, each strip lit or shaded by the wave's slope, then clipped to the country/island outline.
 */
export const WavingFlag: React.FC<{
  id: string; clipD: string; box: [number, number, number, number]; kind: 'us' | 'ru'; t: number;
  opacity?: number; amp?: number; strips?: number; outline?: string; flip?: number; wave?: number;
}> = ({ id, clipD, box, kind, t, opacity = 1, amp, strips = 56, outline = 'rgba(255,255,255,0.85)', flip = 1, wave = 1 }) => {
  if (opacity <= 0.001) return null;
  const [x0, y0, x1, y1] = box;
  const bw = x1 - x0;
  const bh = y1 - y0;
  const ar = kind === 'us' ? 1.9 : 1.5;
  // cover the shape's box with the flag, a little oversized so waving never shows an edge
  let fw = Math.max(bw, bh * ar) * 1.12;
  let fh = fw / ar;
  if (fh < bh * 1.12) {
    fh = bh * 1.12;
    fw = fh * ar;
  }
  const fx = (x0 + x1) / 2 - fw / 2;
  const fy = (y0 + y1) / 2 - fh / 2;
  const A = (amp ?? Math.max(4, Math.min(28, bh * 0.035))) * wave;
  const k = (Math.PI * 2) / (fw * 0.55);
  const sw = fw / strips;
  const cx = (x0 + x1) / 2;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < strips; i++) {
    const sx = fx + i * sw;
    const ph = k * (sx - fx) - t * 5.2;
    const dy = A * Math.sin(ph);
    els.push(
      <g key={i} clipPath={`url(#${id}s${i})`}>
        <g transform={`translate(0 ${dy.toFixed(2)})`}>
          <use href={`#${id}art`} />
        </g>
      </g>,
    );
  }
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }}>
      <defs>
        <clipPath id={`${id}c`}><path d={clipD} /></clipPath>
        {Array.from({ length: strips }, (_, i) => (
          <clipPath key={i} id={`${id}s${i}`}><rect x={fx + i * sw - 0.5} y={fy - 4 * A} width={sw + 1.2} height={fh + 8 * A} /></clipPath>
        ))}
        <linearGradient id={`${id}sh`} gradientUnits="userSpaceOnUse" x1={fx} x2={fx + fw} y1={0} y2={0}>
          {Array.from({ length: 41 }, (_, j) => {
            const xs = fx + (j / 40) * fw;
            const sl = Math.cos(k * (xs - fx) - t * 5.2);
            return <stop key={j} offset={j / 40} stopColor={sl > 0 ? '#ffffff' : '#000000'} stopOpacity={(sl > 0 ? 0.2 : 0.32) * Math.abs(sl) * wave} />;
          })}
        </linearGradient>
        <g id={`${id}art`}><FlagArt kind={kind} x={fx} y={fy} w={fw} h={fh} /></g>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <g transform={`translate(${cx} 0) scale(${flip} 1) translate(${-cx} 0)`}>
          {els}
          <rect x={fx} y={fy - 4 * A} width={fw} height={fh + 8 * A} fill={`url(#${id}sh)`} />
        </g>
      </g>
      {outline && <path d={clipD} fill="none" stroke={outline} strokeWidth={2.5} strokeLinejoin="round" />}
    </svg>
  );
};

/** Neon country: translucent fill, bright rim, glow. */
export const Neon: React.FC<{ d: string; color: string; a: number; fill?: number; width?: number }> = ({ d, color, a, fill = 0.32, width = 5 }) =>
  a <= 0.001 ? null : (
    <Svg opacity={a} filter={glow(color, 7, 2)}>
      <path d={d} fill={color} fillOpacity={fill} stroke={color} strokeWidth={width} strokeLinejoin="round" fillRule="nonzero" />
    </Svg>
  );

/** Laser beam from a to b: glowing core, soft halo, sparks along the trail. p = 0..1 head position. */
export const Laser: React.FC<{ a: P; b: P; p: number; t: number; opacity?: number; color?: string }> = ({ a, b, p, t, opacity = 1, color = '#FF4BD8' }) => {
  if (opacity <= 0.001 || p <= 0) return null;
  const hx = lerp(a[0], b[0], p);
  const hy = lerp(a[1], b[1], p);
  const sparks = Array.from({ length: 22 }, (_, i) => {
    const q = clamp01(p - (i / 22) * 0.9);
    const jitter = Math.sin(i * 12.9898 + t * 23) * 14;
    const nx = -(b[1] - a[1]);
    const ny = b[0] - a[0];
    const nl = Math.hypot(nx, ny) || 1;
    return [lerp(a[0], b[0], q) + (nx / nl) * jitter, lerp(a[1], b[1], q) + (ny / nl) * jitter, 1 - i / 22];
  });
  return (
    <Svg opacity={opacity}>
      <defs>
        <linearGradient id="lz" gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={hx} y2={hy}>
          <stop offset="0" stopColor={color} stopOpacity={0.15} />
          <stop offset="1" stopColor={color} stopOpacity={1} />
        </linearGradient>
        <radialGradient id="lzh">
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.35" stopColor={color} stopOpacity={0.9} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${a[0]},${a[1]}L${hx},${hy}`} stroke="url(#lz)" strokeWidth={26} strokeLinecap="round" opacity={0.45} style={{ filter: 'blur(9px)' }} />
      <path d={`M${a[0]},${a[1]}L${hx},${hy}`} stroke="url(#lz)" strokeWidth={9} strokeLinecap="round" />
      <path d={`M${a[0]},${a[1]}L${hx},${hy}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      {sparks.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={2 + 3 * s} fill="#fff" opacity={0.7 * s} />)}
      <circle cx={hx} cy={hy} r={46} fill="url(#lzh)" />
    </Svg>
  );
};

/** Arc arrow from a to b (screen px), bulging up; drawn on with p. */
export const ArcArrow: React.FC<{ a: P; b: P; p: number; bulge?: number; width?: number }> = ({ a, b, p, bulge = 220, width = 22 }) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 - bulge;
  const d = `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`;
  // tangent at the drawn end for the arrowhead
  const q = clamp01(p);
  const tx = 2 * (1 - q) * (mx - a[0]) + 2 * q * (b[0] - mx);
  const ty = 2 * (1 - q) * (my - a[1]) + 2 * q * (b[1] - my);
  const ex = (1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * mx + q * q * b[0];
  const ey = (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * my + q * q * b[1];
  const ang = Math.atan2(ty, tx);
  const hs = width * 2.4;
  const head = `M${ex + Math.cos(ang) * hs * 0.6},${ey + Math.sin(ang) * hs * 0.6} L${ex + Math.cos(ang + 2.4) * hs},${ey + Math.sin(ang + 2.4) * hs} L${ex + Math.cos(ang - 2.4) * hs},${ey + Math.sin(ang - 2.4) * hs} Z`;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow('rgba(255,255,255,0.85)', 8, 2) }}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${q} 1`} />
      <path d={head} fill="#fff" />
    </svg>
  );
};
