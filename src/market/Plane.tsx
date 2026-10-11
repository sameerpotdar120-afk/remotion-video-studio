import React from 'react';
import { staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, P, PLANE, project, pxPerM } from './cam';

export const COL = { sweBlue: '#006AA7', sweYellow: '#FECC00', finBlue: '#002F6C', russia: '#B8322F', ink: '#2a1d12', gold: '#FFD45A' };

const pathD = (c: Cam, rings: P[][], close = true) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + (close ? 'Z' : '')).join('');

const bbox = (c: Cam, rings: P[][]) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of rings) for (const [x, y] of r) {
    const [px, py] = project(c, x, y);
    x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
  }
  return { x0, y0, x1, y1 };
};

/** A country filled with its own flag, the cloth rippling (light bands drifting across), revealed from a corner. */
const FlagFill: React.FC<{ id: string; c: Cam; rings: P[][]; kind: 'se' | 'fi'; a: number; t: number; reveal?: number }> = ({ id, c, rings, kind, a, t, reveal = 1 }) => {
  if (a <= 0.001 || reveal <= 0.001) return null;
  const d = pathD(c, rings);
  const b = bbox(c, rings);
  const w = b.x1 - b.x0, h = b.y1 - b.y0;
  const cx = b.x0 + w * (kind === 'se' ? 0.42 : 0.38);
  const cy = b.y0 + h * 0.62;
  const bar = Math.max(w, h) * 0.075;
  const bg = kind === 'se' ? COL.sweBlue : '#F4F6F8';
  const cross = kind === 'se' ? COL.sweYellow : COL.finBlue;
  const ph = (t * 140) % 400;
  const rad = reveal >= 1 ? 99999 : 30 + reveal * Math.max(w, h) * 1.3;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}>
      <defs>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <clipPath id={`${id}r`}><circle cx={b.x0} cy={b.y1} r={rad} /></clipPath>
        <linearGradient id={`${id}w`} gradientUnits="userSpaceOnUse" x1={b.x0 - 400 + ph} y1={b.y0} x2={b.x0 + ph} y2={b.y0 + 260} spreadMethod="repeat">
          <stop offset="0" stopColor="#fff" stopOpacity={0.0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#000" stopOpacity={0.18} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}r)`}>
        <g clipPath={`url(#${id}c)`}>
          <rect x={b.x0 - 10} y={b.y0 - 10} width={w + 20} height={h + 20} fill={bg} />
          <rect x={cx - bar / 2} y={b.y0 - 10} width={bar} height={h + 20} fill={cross} />
          <rect x={b.x0 - 10} y={cy - bar / 2} width={w + 20} height={bar} fill={cross} />
          <rect x={b.x0 - 10} y={b.y0 - 10} width={w + 20} height={h + 20} fill={`url(#${id}w)`} />
          <path d={d} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={14} style={{ filter: 'blur(6px)' }} />
        </g>
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

/** A glowing line drawn on with p (sea border, the 1809 line). */
const Glow: React.FC<{ c: Cam; pts: P[]; p: number; a: number; color?: string; w?: number; dash?: string }> = ({ c, pts, p, a, color = '#FFF4C8', w = 5, dash }) => {
  if (a <= 0.001 || p <= 0) return null;
  const d = pathD(c, [pts], false);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs><mask id="gmask" maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w * 6} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
      </mask></defs>
      <g mask="url(#gmask)">
        <path d={d} fill="none" stroke={color} strokeWidth={w * 4} strokeOpacity={0.35} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(6px)' }} />
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </g>
    </svg>
  );
};

/** The 1809 world on parchment: Scandinavia in ink, Sweden in a blue wash, Finland turning Russian red. */
const Parchment: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const land = pathD(c, [...GEO.sweden, ...GEO.finland, ...GEO.norway, ...GEO.russia]);
  const fiRed = ramp(t, C.finland4 - 0.1, C.russi4 + 0.6, inOut);
  const fiFrom = project(c, ...GEO.places.petersburg);
  const line = ramp(t, C.naya5 - 0.1, C.seedha5 + 0.4, inOut);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <pattern id="paper" patternUnits="userSpaceOnUse" width={1254} height={1254}>
          <image href={staticFile('market/img/texture_parchment_1809.png')} width={1254} height={1254} />
        </pattern>
        <clipPath id="fiRed"><circle cx={fiFrom[0]} cy={fiFrom[1]} r={10 + fiRed * 2600} /></clipPath>
      </defs>
      <rect x={-2000} y={-2000} width={PLANE.w + 4000} height={PLANE.h + 4000} fill="url(#paper)" />
      <rect x={-2000} y={-2000} width={PLANE.w + 4000} height={PLANE.h + 4000} fill="#6f9a98" opacity={0.42} style={{ mixBlendMode: 'multiply' }} />
      <path d={land} fill="url(#paper)" />
      <path d={pathD(c, GEO.sweden)} fill="#3b6fb6" opacity={0.42} />
      <path d={pathD(c, GEO.finland)} fill="#3b6fb6" opacity={0.42 * (1 - fiRed)} />
      <g clipPath="url(#fiRed)"><path d={pathD(c, [...GEO.finland, ...GEO.russia])} fill={COL.russia} opacity={0.5} /></g>
      <path d={pathD(c, GEO.russia)} fill={COL.russia} opacity={0.32} />
      <path d={land} fill="none" stroke={COL.ink} strokeWidth={2.4} strokeLinejoin="round" opacity={0.85} />
      {line > 0 && <Mask p={line} c={c} />}
    </svg>
  );
};
// the 1809 ink line, drawn on (separate so the dash pattern isn't distorted by pathLength)
const Mask: React.FC<{ p: number; c: Cam }> = ({ p, c }) => {
  const d = pathD(c, [GEO.seaBorder], false);
  return (
    <>
      <defs><mask id="lineM" maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={30} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
      </mask></defs>
      <path d={d} fill="none" stroke="#f6e8c8" strokeWidth={14} mask="url(#lineM)" opacity={0.7} />
      <path d={d} fill="none" stroke="#7a1f1f" strokeWidth={7} strokeDasharray="20 12" mask="url(#lineM)" />
    </>
  );
};

/** Märket close up: dark sea, the granite island, and the border, which bends from straight (1809) into the zig-zag (1985). */
const Island: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const a = clamp01((9000 - c.span) / 4000);
  if (a <= 0.001) return null;
  const isl = pathD(c, GEO.island);
  const b = bbox(c, GEO.island);
  // the line: the 1985 zig-zag in the hook and from "मोड़ दिया"; straight (1809) in between
  const straightA = window4(t, C.beech5 - 0.4, C.beech5, C.moda10 - 0.1, C.moda10 + 0.5);
  const morph = t < C.y1809 ? 1 : ramp(t, C.moda10 - 0.1, C.zigzag10 + 0.6, inOut);
  const zz = GEO.line1985;
  const st = zz.map((_, i) => {
    const u = i / (zz.length - 1);
    return [lerp(GEO.line1809[0][0], GEO.line1809[1][0], u), lerp(GEO.line1809[0][1], GEO.line1809[1][1], u)] as P;
  });
  const linePts = zz.map((p, i) => [lerp(st[i][0], p[0], morph), lerp(st[i][1], p[1], morph)] as P);
  const lineD = pathD(c, [linePts], false);
  const lineA = t < C.y1809 ? window4(t, -1, 0, C.y1809 - 0.6, C.y1809 - 0.2) : straightA + window4(t, C.moda10 - 0.2, C.moda10, 998, 999);
  const red = window4(t, C.dikkat7 - 0.1, C.dikkat7 + 0.2, C.jung8, C.par8 + 0.3);
  const lineCol = red > 0.5 ? '#FF4A4A' : '#FFF2B0';
  const flash = t < 6 ? 0.6 + 0.4 * Math.sin(t * 5) : window4(t, C.tedhi3 - 0.1, C.tedhi3 + 0.1, C.tedhi3 + 0.6, C.tedhi3 + 1.2);
  // the two halves, tinted once the border is settled
  const tintA = window4(t, C.finland10 - 0.2, C.finland10 + 0.3, C.shareef11 + 0.2, C.shareef11 + 0.8) + (t < 5.6 ? 0.6 : 0);
  const westPoly = pathD(c, [[...linePts, [linePts[linePts.length - 1][0] - 4000, linePts[linePts.length - 1][1]], [linePts[0][0] - 4000, linePts[0][1]]]]);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <radialGradient id="granite" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#c7ada0" />
          <stop offset="0.55" stopColor="#9a8076" />
          <stop offset="1" stopColor="#5f4d47" />
        </radialGradient>
        <radialGradient id="seaV" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#123a4a" />
          <stop offset="1" stopColor="#06141c" />
        </radialGradient>
        <clipPath id="islC"><path d={isl} /></clipPath>
        <filter id="rock" filterUnits="userSpaceOnUse" x={b.x0 - 60} y={b.y0 - 60} width={b.x1 - b.x0 + 120} height={b.y1 - b.y0 + 120}>
          <feTurbulence type="fractalNoise" baseFrequency={(0.045 / Math.max(0.25, pxPerM(c))).toFixed(4)} numOctaves={5} seed={7} result="n" />
          <feDiffuseLighting in="n" surfaceScale={4} lightingColor="#fff7ea" result="l"><feDistantLight azimuth={225} elevation={38} /></feDiffuseLighting>
          <feComposite in="l" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="lichen" filterUnits="userSpaceOnUse" x={b.x0 - 60} y={b.y0 - 60} width={b.x1 - b.x0 + 120} height={b.y1 - b.y0 + 120}>
          <feTurbulence type="fractalNoise" baseFrequency={(0.012 / Math.max(0.25, pxPerM(c))).toFixed(4)} numOctaves={3} seed={3} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.45  0 0 0 0 0.18  0 0 0 7 -3.9" result="m" />
          <feComposite in="m" in2="SourceAlpha" operator="in" />
        </filter>
        <clipPath id="westC"><path d={westPoly} /></clipPath>
      </defs>
      <rect x={-3000} y={-3000} width={PLANE.w + 6000} height={PLANE.h + 6000} fill="url(#seaV)" opacity={0.92} />
      {/* surf ring and the rock */}
      <path d={isl} fill="none" stroke="#e8f6ff" strokeOpacity={0.35} strokeWidth={26} style={{ filter: 'blur(9px)' }} />
      <g clipPath="url(#islC)"><path d={isl} fill="url(#granite)" /><rect x={b.x0 - 50} y={b.y0 - 50} width={b.x1 - b.x0 + 100} height={b.y1 - b.y0 + 100} fill="#fff" filter="url(#rock)" style={{ mixBlendMode: 'multiply' }} />
        <rect x={b.x0 - 50} y={b.y0 - 50} width={b.x1 - b.x0 + 100} height={b.y1 - b.y0 + 100} fill="#fff" filter="url(#lichen)" opacity={0.28} /></g>
      <g clipPath="url(#islC)">
        {[0.2, 0.45, 0.7].map((u, i) => <path key={i} d={isl} fill="none" stroke="#5d7a46" strokeOpacity={0.25} strokeWidth={40 - i * 10} transform={`translate(${(u - 0.5) * 60},${(0.5 - u) * 30})`} style={{ filter: 'blur(10px)' }} />)}
        {tintA > 0 && <rect x={-3000} y={-3000} width={9000} height={9000} fill={COL.finBlue} opacity={0.22 * Math.min(1, tintA)} />}
        {tintA > 0 && <g clipPath="url(#westC)"><rect x={-3000} y={-3000} width={9000} height={9000} fill={COL.sweYellow} opacity={0.3 * Math.min(1, tintA)} /></g>}
        <path d={isl} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={22} style={{ filter: 'blur(8px)' }} />
      </g>
      <g clipPath="url(#islC)"><path d={isl} fill="none" stroke="#2b2420" strokeOpacity={0.8} strokeWidth={14} style={{ filter: 'blur(3px)' }} /></g>
      <path d={isl} fill="none" stroke="#dff2ff" strokeOpacity={0.45} strokeWidth={2} />
      {lineA > 0.001 && (
        <g opacity={Math.min(1, lineA)} style={{ filter: `drop-shadow(0 0 ${8 + 10 * Math.max(red, flash * 0.6)}px ${lineCol})` }}>
          <path d={lineD} fill="none" stroke={lineCol} strokeWidth={9} strokeOpacity={0.35} strokeLinejoin="round" style={{ filter: 'blur(4px)' }} />
          <path d={lineD} fill="none" stroke={lineCol} strokeWidth={4.5} strokeDasharray={morph >= 1 || t < C.y1809 ? undefined : '14 9'} strokeLinejoin="round" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- the plane layer
export const parchmentAt = (t: number) => window4(t, C.y1809 - 0.15, C.y1809 + 0.2, C.seedha5 + 0.6, C.beech5 - 0.1);

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const flags = window4(t, C.sweden2 - 0.3, C.sweden2, C.zoom3b - 0.3, C.zoom3b + 0.2);
  const seA = flags;
  const fiA = window4(t, C.finland2 - 0.3, C.finland2, C.zoom3b - 0.3, C.zoom3b + 0.2);
  const seaP = ramp(t, C.samandar2 - 0.2, C.zoom3 + 0.2, inOut);
  const seaA = window4(t, C.samandar2 - 0.3, C.samandar2, C.paanch3, C.paanch3 + 0.4);
  return (
    <>
      <FlagFill id="se" c={c} rings={GEO.sweden} kind="se" a={seA} t={t} reveal={ramp(t, C.sweden2 - 0.3, C.sweden2 + 0.7, easeOut)} />
      <FlagFill id="fi" c={c} rings={GEO.finland} kind="fi" a={fiA} t={t} reveal={ramp(t, C.finland2 - 0.3, C.finland2 + 0.7, easeOut)} />
      <Glow c={c} pts={GEO.seaBorder} p={seaP} a={seaA} color="#FFE45A" w={6} />
      <Parchment c={c} t={t} a={parchmentAt(t)} />
      <Island c={c} t={t} />
    </>
  );
};

export { easeIn, easeOut, inOut, linear };
