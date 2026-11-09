import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camMotion, ll, lineD, merc, ringsD, shake, toS } from './cam';
import { Badge, Flag, FlagId } from './Flags';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { LABEL, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import sizes from '../../../public/korea/img/img_sizes.json';

export const KO_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'korea/audio/mix.wav';
const IMG = (k: string) => staticFile(`korea/img/${k}.png`);
const SZ = sizes as unknown as Record<string, { w: number; h: number }>;
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const INK = '#0B1830';
const COL = { nk: '#E8343B', sk: '#2F6BFF', jp: '#FF8A1F', su: '#D11F26', cn: '#9E1018', in: '#FF9933', one: '#FFC21A', gold: '#FFC21A', white: '#F4F6FA' };

// ------------------------------------------------------------------ small parts
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string }> = ({ text, size, color = COL.gold, font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${Math.round(size / 11)}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 40, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; clampX?: boolean; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, clampX = true, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: clampX ? Math.min(880, Math.max(200, x)) : x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
const Cut: React.FC<{ k: string; x: number; y: number; w: number; o?: number; rot?: number; children?: React.ReactNode }> = ({ k, x, y, w, o = 1, rot = 0, children }) => {
  if (o <= 0 || w <= 0) return null;
  const h = (w * SZ[k].h) / SZ[k].w;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)` }}>
      <Img src={IMG(k)} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: 'drop-shadow(0 22px 28px rgba(0,0,0,0.55))' }} />
      {children}
    </div>
  );
};
/** A counter that rolls up to n between t0 and t0 + d. */
const roll = (t: number, t0: number, n: number, d = 0.9) => Math.round(n * easeOut(ramp(t, t0, t0 + d, linear)));
const fmtIN = (n: number) => n.toLocaleString('en-IN');
/** A curved arrow from a to b (screen px), drawn to fraction p. */
const Arrow: React.FC<{ a: P; b: P; p: number; color: string; bend?: number; w?: number }> = ({ a, b, p, color, bend = 0.2, w = 16 }) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const q = (s: number): P => [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * mx + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * my + s * s * b[1]];
  const pts = Array.from({ length: 25 }, (_, i) => q((i / 24) * p));
  const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
  const ang = Math.atan2(ey - py, ex - px);
  const hw = w * 1.8;
  const head = `M${ex + Math.cos(ang) * hw * 0.6},${ey + Math.sin(ang) * hw * 0.6} L${ex + Math.cos(ang + 2.4) * hw},${ey + Math.sin(ang + 2.4) * hw} L${ex + Math.cos(ang - 2.4) * hw},${ey + Math.sin(ang - 2.4) * hw} Z`;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  return (
    <g>
      <path d={d} fill="none" stroke="#fff" strokeWidth={w + 8} strokeLinecap="round" opacity={0.9} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={head} fill={color} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// ------------------------------------------------------------------ the front line (who holds what)
type Front = P[];
const N = GEO.fronts.p38.length;
const flat = (lat: number): Front => Array.from({ length: N }, (_, i) => merc(123.6 + (8 * i) / (N - 1), lat));
const FR: Record<string, Front> = { ...GEO.fronts, allRed: flat(32.6), allBlue: flat(43.6) };
const mix = (a: Front, b: Front, p: number): Front => a.map((x, i) => [x[0] + (b[i][0] - x[0]) * p, x[1] + (b[i][1] - x[1]) * p]);
/** The front at time t: a chain of morphs, each between two VO cues. */
const frontAt = (t: number): Front => {
  const steps: [string, number, number][] = [
    ['allRed', C.dono - 0.1, C.end21 + 0.2], ['allBlue', C.poora2, C.end22 - 0.3], ['p38', C.end22 - 0.1, C.end22 + 0.4],
    ['pusan', C.hamla - 0.2, C.end24], ['yalu', C.un + 0.6, C.end26], ['jan51', C.china2 + 0.2, C.end28 + 0.2], ['mdl', C.ladai - 0.1, C.end39],
  ];
  let f = FR.p38;
  for (const [k, a, b] of steps) { const p = inOut(ramp(t, a, b, linear)); if (p > 0) f = mix(f, FR[k], p); }
  return f;
};
const redD = (c: Cam, f: Front) => lineD(c, f) + `L${toS(c, merc(134, 46)).join(',')}L${toS(c, merc(120, 46)).join(',')}Z`;
const blueD = (c: Cam, f: Front) => lineD(c, f) + `L${toS(c, merc(134, 30)).join(',')}L${toS(c, merc(120, 30)).join(',')}Z`;

// ------------------------------------------------------------------ the map's vector layer
/** Which Korea look is on: 'two' (the two countries), 'one' (one country, 1945), 'japan', 'zones' (the front). */
const KoreaFills: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const one = ramp(t, C.ek - 0.1, C.ek + 0.6, linear) * (1 - ramp(t, C.japan - 0.2, C.japan + 0.4, linear));
  const jp = ramp(t, C.japan - 0.2, C.japan + 0.5, linear) * (1 - ramp(t, C.soviet - 0.3, C.soviet + 0.5, linear));
  const neutral = ramp(t, C.soviet - 0.3, C.soviet + 0.5, linear) * (1 - ramp(t, C.p38 - 0.1, C.p38 + 0.6, linear));
  const zones = ramp(t, C.batwara - 0.2, C.batwara + 0.6, linear) * (1 - ramp(t, C.end39 + 0.2, C.usi + 0.3, linear));
  const two = 1 - ramp(t, C.ek - 0.1, C.ek + 0.6, linear) + ramp(t, C.end39 + 0.2, C.usi + 0.3, linear);
  const dmzClose = ramp(t, C.dmz, C.dmz + 1.0, linear) * (1 - ramp(t, C.ek - 0.2, C.ek + 0.4, linear));
  const k = ringsD(c, GEO.countries.Korea);
  const f = frontAt(t);
  const a = 0.62 - 0.4 * dmzClose;
  return (
    <>
      <defs><clipPath id="kclip"><path d={k} /></clipPath></defs>
      {two > 0.01 && <>
        <HiFill id="nk" t={t} d={ringsD(c, GEO.countries.NK)} color={COL.nk} alpha={a} g={Math.min(1, two)} edge={4} />
        <HiFill id="sk" t={t} d={ringsD(c, GEO.countries.SK)} color={COL.sk} alpha={a} g={Math.min(1, two)} edge={4} />
      </>}
      {one > 0.01 && <HiFill id="one" t={t} d={k} color={COL.one} alpha={0.7} g={one} edge={4} />}
      {jp > 0.01 && <>
        {['Japan', 'Taiwan'].map((n) => <HiFill key={n} id={`jp${n}`} t={t} d={ringsD(c, GEO.countries[n])} color={COL.jp} alpha={0.7} g={jp} edge={3} />)}
        <HiFill id="kjp" t={t} d={k} color={COL.jp} alpha={0.7} g={jp} edge={3} />
      </>}
      {neutral > 0.01 && <path d={k} fill="#fff" opacity={0.22 * neutral} stroke="#fff" strokeWidth={3} />}
      {zones > 0.01 && <>
        <g clipPath="url(#kclip)"><HiFill id="zb" t={t} d={blueD(c, f)} color={COL.sk} alpha={0.62} g={zones} edge={4} /></g>
        <g clipPath="url(#kclip)"><HiFill id="zr" t={t} d={redD(c, f)} color={COL.nk} alpha={0.66} g={zones} edge={4} /></g>
        <path d={lineD(c, f)} fill="none" stroke="#FFE7A0" strokeWidth={5} opacity={zones} clipPath="url(#kclip)" />
      </>}
    </>
  );
};

const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (lon: number, lat: number) => ll(c, lon, lat);
  const su = ramp(t, C.soviet - 0.2, C.soviet + 0.6, linear) * (1 - ramp(t, C.p38 - 0.3, C.p38 + 0.4, linear));
  const cn = ramp(t, C.china2 - 0.3, C.china2 + 0.5, linear) * (1 - ramp(t, C.india - 0.6, C.india + 0.2, linear));
  const ind = ramp(t, C.india - 0.25, C.india + 0.6, linear) * (1 - ramp(t, C.n3 - 0.8, C.n3 - 0.1, linear));
  // the 38th parallel: drawn on "38th parallel", back again on "usi line ke paas"
  const p38 = ramp(t, C.p38 - 0.2, C.p38 + 0.9, inOut);
  const p38o = Math.min(1, p38) * (1 - ramp(t, C.batwara + 0.2, C.batwara + 0.8, linear)) + win(t, C.usi - 0.2, C.y1953 + 0.4, 0.4, 0.4);
  const flare = Math.exp(-3 * Math.max(0, t - C.yahi)) * (t > C.yahi ? 1 : 0);
  const [x0, y38] = s(123.2, 38), [x1] = s(132.2, 38);
  const dmzFlare = Math.exp(-2.5 * Math.max(0, t - C.line1)) * (t > C.line1 - 0.05 ? 1 : 0) + (t > C.usiline - 0.05 ? Math.exp(-2.5 * (t - C.usiline)) : 0);
  // the DMZ band (4 km: 2 km either side of the line), drawn when close
  const band = ramp(t, C.dmz + 0.3, C.dmz + 1.2, linear) * (1 - ramp(t, C.ek - 0.2, C.ek + 0.3, linear));
  const off = 2000 / Math.cos((38 * Math.PI) / 180);
  const up = GEO.dmz.map(([x, y]) => [x, y + off] as P), dn = GEO.dmz.map(([x, y]) => [x, y - off] as P);
  const bandD = lineD(c, up) + dn.slice().reverse().map((p) => { const [a, b] = toS(c, p); return `L${a.toFixed(1)},${b.toFixed(1)}`; }).join('') + 'Z';
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="14" /></filter>
        <pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="rgba(255,80,60,0.18)" /><rect width="5" height="16" fill="rgba(255,235,200,0.35)" /></pattern>
      </defs>
      <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.3} opacity={0.35} />
      {su > 0.01 && <HiFill id="su" t={t} d={ringsD(c, GEO.countries.Russia)} color={COL.su} alpha={0.6} g={su} edge={4} />}
      {cn > 0.01 && <HiFill id="cn" t={t} d={ringsD(c, GEO.countries.China)} color={COL.cn} alpha={0.62} g={cn} edge={4} />}
      {ind > 0.01 && <HiFill id="in" t={t} d={ringsD(c, GEO.countries.India)} color={COL.in} alpha={0.8} g={ind} edge={5} />}
      <KoreaFills t={t} c={c} />
      {band > 0.01 && <>
        <path d={bandD} fill="url(#hatch)" opacity={band} />
        {[up, dn].map((l, i) => <path key={i} d={lineD(c, l)} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="14 8" opacity={band * 0.9} />)}
      </>}
      {/* the line between the two Koreas */}
      <path d={lineD(c, GEO.dmz)} fill="none" stroke="#fff" strokeWidth={8 + 16 * dmzFlare} filter="url(#glow)" opacity={0.25 + 0.75 * Math.min(1, dmzFlare)} />
      <path d={lineD(c, GEO.dmz)} fill="none" stroke="#FFE7A0" strokeWidth={4 + 3 * Math.min(1, dmzFlare)} opacity={0.9} />
      {p38o > 0.01 && <g opacity={Math.min(1, p38o)}>
        <path d={`M${x0},${y38}L${x0 + (x1 - x0) * Math.min(1, p38)},${y38}`} stroke="#fff" strokeWidth={14 + 22 * flare} filter="url(#glow)" opacity={0.6 + 0.4 * flare} />
        <path d={`M${x0},${y38}L${x0 + (x1 - x0) * Math.min(1, p38)},${y38}`} stroke="#fff" strokeWidth={6} strokeDasharray="26 12" strokeLinecap="round" />
      </g>}
    </svg>
  );
};

// ------------------------------------------------------------------ props drawn in code
const Paper: React.FC<{ title: string; sub?: string; w: number; children?: React.ReactNode }> = ({ title, sub, w, children }) => (
  <div style={{ width: w, padding: `${w * 0.07}px ${w * 0.08}px`, background: 'linear-gradient(180deg, #FBF6E9, #EFE5CC)', borderRadius: 10, boxShadow: '0 26px 50px rgba(0,0,0,0.55)', border: '2px solid #D9CBA6' }}>
    <div style={{ fontFamily: "'MSSerif', serif", fontSize: w * 0.085, color: '#2B2117', textAlign: 'center', lineHeight: 1.1 }}>{title}</div>
    {sub && <div style={{ fontFamily: LABEL, fontSize: w * 0.04, color: '#6B5A40', textAlign: 'center', marginTop: 6, letterSpacing: 2 }}>{sub}</div>}
    <div style={{ height: 3, background: '#2B2117', opacity: 0.6, margin: `${w * 0.04}px 0` }} />
    {Array.from({ length: 4 }, (_, i) => <div key={i} style={{ height: 8, background: '#2B2117', opacity: 0.14, margin: '12px 0', width: `${92 - i * 9}%` }} />)}
    {children}
  </div>
);
const SignLine: React.FC<{ who: string; signed: number; empty?: boolean; mark?: number; w: number }> = ({ who, signed, empty, mark = 0, w }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: w * 0.05, position: 'relative' }}>
    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: w * 0.06, color: '#2B2117' }}>{who}</div>
    <div style={{ position: 'relative', width: w * 0.42, height: w * 0.08, borderBottom: '3px solid #2B2117' }}>
      {!empty && <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <path d="M2 16 C10 2 16 20 24 8 S36 4 40 14 S52 2 58 12 S72 16 78 6 S92 10 98 8" fill="none" stroke="#1C3A8A" strokeWidth={2.4} strokeDasharray={140} strokeDashoffset={140 * (1 - signed)} />
      </svg>}
      {empty && mark > 0 && <svg width={w * 0.6} height={w * 0.2} viewBox="-60 -20 120 40" style={{ position: 'absolute', left: -w * 0.09, top: -w * 0.07, overflow: 'visible' }}>
        <ellipse rx={56} ry={18} fill="none" stroke="#E0221B" strokeWidth={4} strokeDasharray={240} strokeDashoffset={240 * (1 - mark)} />
      </svg>}
    </div>
  </div>
);
/** Barbed wire along a screen polyline: a twisted line with barbs. */
const Barbed: React.FC<{ d: string; o: number }> = ({ d, o }) => (
  <g opacity={o}>
    <path d={d} fill="none" stroke="#2A2A2A" strokeWidth={9} />
    <path d={d} fill="none" stroke="#C9CDD2" strokeWidth={5} />
    <path d={d} fill="none" stroke="#E8ECEF" strokeWidth={14} strokeDasharray="3 22" />
  </g>
);
const MineSign: React.FC = () => (
  <svg width={96} height={86} viewBox="-48 -46 96 86" style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
    <path d="M0 -42 L44 36 L-44 36 Z" fill="#E0221B" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={8} r={14} fill="#fff" />
    <path d="M-6 6 h4 v4 h-4 z M3 6 h4 v4 h-4 z" fill="#E0221B" />
    <path d="M-7 18 h14" stroke="#E0221B" strokeWidth={3} />
  </svg>
);
const Rifle: React.FC<{ flip?: boolean; color: string }> = ({ flip, color }) => (
  <svg width={230} height={80} viewBox="0 0 230 80" style={{ transform: flip ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.6))', overflow: 'visible' }}>
    <path d="M6 34 L60 30 L70 22 L200 22 L200 30 L222 30 L222 36 L120 38 L112 54 L96 54 L100 40 L74 42 L40 60 L10 56 Z" fill="#1E2328" stroke={color} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
const People: React.FC<{ color: string }> = ({ color }) => (
  <svg width={190} height={120} viewBox="0 0 190 120" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
    {[[40, 1], [95, 1.2], [150, 0.8]].map(([x, s], i) => (
      <g key={i} transform={`translate(${x} 118) scale(${s})`} fill="#fff" stroke={color} strokeWidth={4}>
        <circle cx={0} cy={-78} r={16} />
        <path d="M-24 0 V-40 Q-24 -58 0 -58 Q24 -58 24 -40 V0 Z" />
      </g>
    ))}
  </svg>
);
const Stopwatch: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <svg width={size} height={size * 1.15} viewBox="-60 -78 120 138" style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.6))', overflow: 'visible' }}>
    <rect x={-10} y={-76} width={20} height={14} rx={3} fill="#D9D9D9" stroke="#222" strokeWidth={3} />
    <circle r={56} fill="#F4F4F2" stroke="#222" strokeWidth={6} />
    <path d={`M0 0 L0 -48 A48 48 0 ${p > 0.5 ? 1 : 0} 1 ${48 * Math.sin(p * 2 * Math.PI)} ${-48 * Math.cos(p * 2 * Math.PI)} Z`} fill="#E0221B" opacity={0.85} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={Math.sin(a) * 44} y1={-Math.cos(a) * 44} x2={Math.sin(a) * 52} y2={-Math.cos(a) * 52} stroke="#222" strokeWidth={3} />; })}
    <line x1={0} y1={0} x2={Math.sin(p * 2 * Math.PI) * 46} y2={-Math.cos(p * 2 * Math.PI) * 46} stroke="#111" strokeWidth={5} strokeLinecap="round" />
    <circle r={6} fill="#111" />
  </svg>
);
const RedCross: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}>
    <circle r={46} fill="#fff" stroke="#E0221B" strokeWidth={6} />
    <path d="M-10 -32 H10 V-10 H32 V10 H10 V32 H-10 V10 H-32 V-10 H-10 Z" fill="#E0221B" />
  </svg>
);

// ------------------------------------------------------------------ overlays on the map
const MapOverlays: React.FC<{ t: number; c: Cam; top: boolean }> = ({ t, c }) => {
  const s = (lon: number, lat: number) => ll(c, lon, lat);
  const head = 1 - ramp(t, C.khatam - 0.1, C.khatam + 0.25, linear) + ramp(t, DURATION_S - 0.75, DURATION_S - 0.1, linear);
  const cross = pop(t, C.khatam, 10, 220) * (t < C.end1 + 0.5 ? 1 : 0);
  const [nkx, nky] = s(127.0, 40.1), [skx, sky] = s(127.9, 36.4);
  // the two Koreas' flags: on at the start and from "1948 … do desh" again, hidden in between
  const kflags = 1 - ramp(t, C.dmz - 0.2, C.dmz + 0.2, linear) + ramp(t, C.do - 0.1, C.do + 0.3, linear) * (1 - ramp(t, C.dono - 0.3, C.dono, linear));
  // the war: badges ride the tide
  const war = win(t, C.end22 + 0.1, C.tab + 0.1, 0.3, 0.3);
  const f = frontAt(t);
  const fm = f[Math.floor(N * 0.55)];
  const [fx, fy] = toS(c, fm);
  const [bx, by] = s(128.9, 35.5);
  const [inx, iny] = s(126.6, 37.47), [seax, seay] = s(124.3, 36.6);
  const [ux0, uy0] = s(128.8, 33.4);
  return (
    <AbsoluteFill>
      {/* frame 0 (and the loop's last frames) */}
      <At x={540} y={250} o={clamp01(head)}>
        <div style={{ position: 'relative' }}>
          <Big text="जंग खत्म?" size={150} color="#fff" font={UI} />
        </div>
      </At>
      {cross > 0 && <At x={700} y={250} p={cross} rot={-8} o={1 - ramp(t, C.end1, C.end1 + 0.4, linear)}><Big text="✗" size={230} color="#FF3B3B" /></At>}
      {kflags > 0.01 && t < C.hamla && <>
        <At x={nkx} y={nky} o={Math.min(1, kflags)}><Badge id="kp" r={58} /></At>
        <At x={skx} y={sky} o={Math.min(1, kflags)}><Badge id="kr" r={58} /></At>
      </>}
      {t > C.ruki && <>
        <At x={nkx} y={nky} o={ramp(t, C.ruki, C.ruki + 0.5, linear)}><Badge id="kp" r={58} /></At>
        <At x={skx} y={sky} o={ramp(t, C.ruki, C.ruki + 0.5, linear)}><Badge id="kr" r={58} /></At>
      </>}
      {/* 73 years, no peace signed, families split */}
      {t > C.n73 - 0.2 && t < C.dmz && <At x={540} y={290} p={pop(t, C.n73 - 0.1, 10, 200)} o={1 - ramp(t, C.kyu, C.dmz, linear)}><Big text={<>{roll(t, C.n73 - 0.1, 73, 0.8)} साल</>} size={130} color={COL.gold} font={UI} /></At>}
      {t > C.sign - 0.4 && t < C.line1 + 0.4 && <At x={300} y={1180} p={pop(t, C.sign - 0.3, 11, 180)} o={1 - ramp(t, C.line1, C.line1 + 0.4, linear)} rot={-6}>
        <Paper title="PEACE TREATY" sub="KOREA" w={430}><SignLine who="—" signed={0} empty w={430} /><SignLine who="—" signed={0} empty w={430} /></Paper>
      </At>}
      {t > C.parivar - 0.2 && t < C.dmz + 0.3 && <>
        <At x={420} y={720} p={pop(t, C.parivar - 0.1, 10, 200)} o={1 - ramp(t, C.dmz, C.dmz + 0.3, linear)}><People color={COL.nk} /></At>
        <At x={700} y={1240} p={pop(t, C.parivar + 0.1, 10, 200)} o={1 - ramp(t, C.dmz, C.dmz + 0.3, linear)}><People color={COL.sk} /></At>
      </>}
      {/* the DMZ close-up */}
      {t > C.n4 - 0.2 && t < C.ek && <At x={540} y={470} p={pop(t, C.n4 - 0.1, 10, 200)} o={1 - ramp(t, C.ek - 0.3, C.ek, linear)}><Tag text={<>↕ 4 KM</>} size={70} color="#FFE7A0" font={TITLE} /></At>}
      {t > C.taar - 0.2 && t < C.ek && <DmzProps t={t} c={c} />}
      {/* one country, 35 years under Japan */}
      {t > C.desh - 0.2 && t < C.n35 + 0.2 && <At x={s(127.6, 40.2)[0]} y={s(127.6, 40.2)[1]} p={pop(t, C.desh - 0.1, 10, 200)} o={1 - ramp(t, C.n35 - 0.2, C.n35 + 0.2, linear)}><Tag text="एक देश" size={56} color={COL.one} /></At>}
      {t > C.y1945 - 0.2 && t < C.phir && <At x={540} y={300} p={pop(t, C.y1945 - 0.1, 10, 200)} o={1 - ramp(t, C.phir - 0.3, C.phir, linear)}><Big text={t < C.n35 - 0.1 ? '1945' : '1910 → 1945'} size={t < C.n35 - 0.1 ? 150 : 110} color={COL.gold} /></At>}
      {t > C.n35 - 0.2 && t < C.phir && <At x={540} y={430} p={pop(t, C.n35 - 0.1, 10, 200)} o={1 - ramp(t, C.phir - 0.3, C.phir, linear)}><Tag text="35 साल: Japan का राज" size={56} color={COL.jp} /></At>}
      {t > C.japan - 0.2 && t < C.soviet && <At x={s(138.5, 36.4)[0]} y={s(138.5, 36.4)[1] - 120} p={pop(t, C.japan, 10, 200)} o={1 - ramp(t, C.soviet - 0.3, C.soviet, linear)}><Badge id="jp" r={56} /></At>}
      {/* the USSR comes in from the north; America worries */}
      {t > C.soviet - 0.2 && t < C.p38 && <>
        <At x={s(133, 46.5)[0]} y={s(133, 46.5)[1]} p={pop(t, C.soviet, 10, 200)} o={1 - ramp(t, C.to2 - 0.3, C.to2, linear)}><Badge id="su" r={64} /></At>
        <At x={s(133, 46.5)[0]} y={s(133, 46.5)[1] + 110} p={pop(t, C.soviet + 0.1, 10, 200)} o={1 - ramp(t, C.to2 - 0.3, C.to2, linear)}><Tag text="USSR" size={50} color={COL.su} font={TITLE} /></At>
      </>}
      {t > C.uttar - 0.3 && t < C.to2 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - ramp(t, C.to2 - 0.3, C.to2, linear) }}>
        {[[130.6, 43.6, 129.6, 41.6], [128.2, 43.4, 127.6, 41.0], [126.0, 42.6, 126.2, 40.6]].map(([a, b, x, y], i) => <Arrow key={i} a={s(a, b)} b={s(x, y)} p={ramp(t, C.uttar - 0.3 + i * 0.15, C.uttar + 0.7 + i * 0.15, inOut)} color={COL.su} />)}
      </svg>}
      {t > C.america1 - 0.2 && t < C.p38 && <>
        <At x={ux0} y={uy0 + (1 - pop(t, C.america1, 11, 170)) * 400} o={1 - ramp(t, C.to2 - 0.3, C.to2, linear)}><Badge id="us" r={64} /></At>
        {t > C.poora1 - 0.1 && <At x={ux0 + 110} y={uy0 - 80} p={pop(t, C.poora1, 9, 220)} o={1 - ramp(t, C.to2 - 0.3, C.to2, linear)}><Big text="?" size={150} color="#fff" /></At>}
      </>}
      {/* the line: 38th parallel */}
      {t > C.p38 - 0.1 && t < C.batwara + 0.6 && <At x={860} y={s(130, 38)[1] - 70} p={pop(t, C.p38 + 0.2, 10, 200)} o={1 - ramp(t, C.batwara + 0.2, C.batwara + 0.6, linear)}><Tag text="38° N" size={60} color="#fff" font={TITLE} /></At>}
      {t > C.yahi - 0.2 && t < C.batwara + 0.6 && <At x={540} y={300} p={pop(t, C.yahi - 0.1, 10, 200)} o={1 - ramp(t, C.batwara + 0.2, C.batwara + 0.6, linear)}><Big text="38th Parallel" size={110} color="#fff" /></At>}
      {/* the zones, the Cold War, 1948 */}
      {t > C.batwara - 0.2 && t < C.do + 0.2 && <>
        <At x={nkx} y={nky} p={pop(t, C.batwara + 0.1, 10, 200)} o={1 - ramp(t, C.do - 0.2, C.do + 0.1, linear)}><Badge id="su" r={64} /></At>
        <At x={skx} y={sky} p={pop(t, C.batwara + 0.3, 10, 200)} o={1 - ramp(t, C.do - 0.2, C.do + 0.1, linear)}><Badge id="us" r={64} /></At>
      </>}
      {t > C.batwara + 0.6 && t < C.cold + 0.3 && <At x={540} y={300} p={pop(t, C.batwara + 0.8, 10, 200)} o={1 - ramp(t, C.cold, C.cold + 0.3, linear)}><Tag text="⏳ कुछ समय के लिए" size={60} color={COL.gold} /></At>}
      {t > C.cold - 0.2 && t < C.do + 0.2 && <Rings t={t} a={[nkx, nky]} b={[skx, sky]} />}
      {t > C.comm - 0.2 && t < C.dono && <At x={nkx} y={nky + 110} p={pop(t, C.comm - 0.1, 10, 200)} o={1 - ramp(t, C.dono - 0.3, C.dono, linear)}><Tag text="Communism" size={52} color={COL.nk} font={TITLE} /></At>}
      {t > C.cap - 0.2 && t < C.dono && <At x={skx} y={sky + 110} p={pop(t, C.cap - 0.1, 10, 200)} o={1 - ramp(t, C.dono - 0.3, C.dono, linear)}><Tag text="Capitalism" size={52} color={COL.sk} font={TITLE} /></At>}
      {t > C.y1948 - 0.2 && t < C.dono && <At x={540} y={300} p={pop(t, C.y1948 - 0.1, 10, 200)} o={1 - ramp(t, C.dono - 0.3, C.dono, linear)}><Big text="1948" size={150} color={COL.gold} /></At>}
      {t > C.do - 0.2 && t < C.dono && <>
        <At x={nkx + 190} y={nky - 70} p={pop(t, C.do, 10, 200)} o={1 - ramp(t, C.dono - 0.3, C.dono, linear)}><Tag text="उत्तर कोरिया" size={46} color={COL.nk} /></At>
        <At x={skx + 200} y={sky - 70} p={pop(t, C.do + 0.15, 10, 200)} o={1 - ramp(t, C.dono - 0.3, C.dono, linear)}><Tag text="दक्षिण कोरिया" size={46} color={COL.sk} /></At>
      </>}
      {/* both claim it all (Null split): one flag, then the other, over the whole peninsula */}
      {t > C.dono && t < C.end22 + 0.3 && <At x={s(127.6, 38.3)[0]} y={s(127.6, 38.3)[1]} p={1} o={win(t, C.dono + 0.1, C.end22 + 0.3, 0.3, 0.3)}><Badge id={t < C.poora2 ? 'kp' : 'kr'} r={86} /></At>}
      {/* the war */}
      {war > 0.01 && <>
        {t > C.y1950 - 0.2 && t < C.hamla + 1.2 && <At x={540} y={300} p={pop(t, C.y1950 - 0.1, 10, 200)} o={1 - ramp(t, C.hamla + 0.8, C.hamla + 1.2, linear)}><Big text="1950" size={150} color={COL.gold} /></At>}
        <At x={fx} y={fy - 150} o={war}><Badge id="kp" r={56} /></At>
        <At x={t < C.un ? bx : fx} y={t < C.un ? by : fy + 140} o={war}><Badge id="kr" r={50} /></At>
        {t > C.un - 0.2 && <At x={fx - 110} y={fy + 150} p={pop(t, C.un - 0.1, 10, 200)} o={war}><Badge id="un" r={50} /></At>}
        {t > C.un && <At x={fx + 110} y={fy + 150} p={pop(t, C.un + 0.1, 10, 200)} o={war}><Badge id="us" r={50} /></At>}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: war }}>
          {t > C.hamla - 0.3 && t < C.end24 + 0.4 && [[126.4, 38.4, 126.9, 35.6], [128.0, 38.6, 128.2, 36.4]].map(([a, b, x, y], i) => <Arrow key={i} a={s(a, b)} b={s(x, y)} p={ramp(t, C.hamla - 0.2 + i * 0.2, C.end24 - 0.3, inOut)} color={COL.nk} bend={0.05} />)}
          {t > C.un + 0.1 && t < C.end26 + 0.3 && <Arrow a={[seax, seay]} b={[inx, iny]} p={ramp(t, C.un + 0.1, C.un + 0.9, inOut)} color={COL.sk} bend={-0.25} />}
          {t > C.china1 - 0.4 && t < C.end26 + 0.3 && [[127.6, 36.6, 126.4, 40.0], [128.6, 36.6, 128.6, 40.6]].map(([a, b, x, y], i) => <Arrow key={i} a={s(a, b)} b={s(x, y)} p={ramp(t, C.china1 - 0.4 + i * 0.2, C.end26 - 0.2, inOut)} color={COL.sk} bend={-0.05} />)}
        </svg>
        {t > C.un + 0.4 && t < C.end26 && <At x={inx - 130} y={iny + 10} p={pop(t, C.un + 0.5, 10, 200)} o={1 - ramp(t, C.china1, C.china1 + 0.3, linear)}><Tag text="Incheon" size={40} color={COL.sk} font={TITLE} /></At>}
      </>}
      {/* China joins (Null split B) */}
      {t > C.china2 - 0.3 && t < C.aur3 + 0.2 && <>
        <At x={s(123.6, 42.4)[0]} y={s(123.6, 42.4)[1]} p={pop(t, C.china2 - 0.1, 10, 200)} o={1 - ramp(t, C.aur3 - 0.2, C.aur3 + 0.2, linear)}><Badge id="cn" r={66} /></At>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - ramp(t, C.aur3 - 0.2, C.aur3 + 0.2, linear) }}>
          {[[124.6, 41.8, 125.6, 39.2], [126.4, 42.4, 126.9, 39.6], [128.6, 42.6, 128.2, 39.6]].map(([a, b, x, y], i) => <Arrow key={i} a={s(a, b)} b={s(x, y)} p={ramp(t, C.china2 + i * 0.12, C.end28, inOut)} color={COL.cn} bend={0.08} w={20} />)}
        </svg>
        {t > C.lakhon - 0.2 && <At x={s(124.4, 43.6)[0] + 40} y={s(124.4, 43.6)[1]} p={pop(t, C.lakhon - 0.1, 10, 200)} o={1 - ramp(t, C.aur3 - 0.2, C.aur3 + 0.2, linear)}><Tag text="लाखों सैनिक" size={50} color={COL.cn} /></At>}
      </>}
      {/* India */}
      <IndiaAct t={t} c={c} />
      {/* the end of the fighting */}
      {t > C.n3 - 0.2 && t < C.ladai + 0.3 && <At x={540} y={300} p={pop(t, C.n3 - 0.1, 10, 200)} o={1 - ramp(t, C.ladai, C.ladai + 0.3, linear)}><Big text="3 साल" size={140} color={COL.gold} font={UI} /></At>}
      {t > C.n25 - 0.2 && t < C.ladai + 0.3 && <At x={540} y={1250} p={pop(t, C.n25 - 0.1, 10, 200)} o={1 - ramp(t, C.ladai, C.ladai + 0.3, linear)}><Tag text={<>कम से कम <span style={{ color: '#FF5A4E' }}>{roll(t, C.n25 - 0.1, 25)} लाख</span> मौतें</>} size={60} color="#FF5A4E" /></At>}
      {t > C.usi - 0.2 && t < C.y1953 + 0.3 && <At x={860} y={s(130, 38)[1] - 70} p={pop(t, C.usi, 10, 200)} o={1 - ramp(t, C.y1953, C.y1953 + 0.3, linear)}><Tag text="38° N" size={56} color="#fff" font={TITLE} /></At>}
      <Papers t={t} />
    </AbsoluteFill>
  );
};

const Rings: React.FC<{ t: number; a: P; b: P }> = ({ t, a, b }) => {
  const o = win(t, C.cold - 0.2, C.do + 0.2, 0.3, 0.3);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: o }}>
      {[[a, COL.nk], [b, COL.sk]].map(([p, col], i) => [0, 0.5].map((d) => {
        const ph = ((t * 0.9 + d + i * 0.25) % 1);
        return <circle key={`${i}${d}`} cx={(p as P)[0]} cy={(p as P)[1]} r={70 + ph * 110} fill="none" stroke={col as string} strokeWidth={10} opacity={(1 - ph) * 0.9} />;
      }))}
    </svg>
  );
};

const DmzProps: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = 1 - ramp(t, C.ek - 0.3, C.ek, linear);
  const off = 2000 / Math.cos((38 * Math.PI) / 180);
  const wire = (dy: number) => lineD(c, GEO.dmz.map(([x, y]) => [x, y + dy] as P));
  const wp = ramp(t, C.taar - 0.2, C.taar + 0.6, linear);
  const mid = (lon: number) => { const p = GEO.dmz.reduce((b, q) => (Math.abs(q[0] - merc(lon, 0)[0]) < Math.abs(b[0] - merc(lon, 0)[0]) ? q : b)); return toS(c, p); };
  const mines = [126.98, 127.1, 127.22, 127.34];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <g style={{ clipPath: `inset(0 ${(1 - wp) * 100}% 0 0)` }}>
          <Barbed d={wire(off * 1.08)} o={1} />
          <Barbed d={wire(-off * 1.08)} o={1} />
        </g>
      </svg>
      {mines.map((lon, i) => { const [x, y] = mid(lon); return t > C.surang - 0.1 + i * 0.12 ? <At key={i} x={x} y={y + (i % 2 ? 26 : -26)} p={1.45 * pop(t, C.surang + i * 0.12, 10, 220)} clampX={false}><MineSign /></At> : null; })}
      {t > C.bandook - 0.2 && <>
        <At x={330} y={mid(127.0)[1] - 300} p={1.9 * pop(t, C.bandook - 0.1, 10, 200)} rot={20}><Rifle color={COL.nk} /></At>
        <At x={750} y={mid(127.3)[1] + 300} p={1.9 * pop(t, C.bandook + 0.1, 10, 200)} rot={20}><Rifle flip color={COL.sk} /></At>
      </>}
    </AbsoluteFill>
  );
};

const IndiaAct: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < C.india - 0.3 || t > C.n3) return null;
  const s = (lon: number, lat: number) => ll(c, lon, lat);
  const o = 1 - ramp(t, C.goli + 0.4, C.n3 - 0.2, linear);
  const [dx, dy] = s(77.2, 28.6), [kx, ky] = s(127.0, 37.6);
  const arc = ramp(t, C.india + 0.2, C.hamne + 1.2, inOut);
  const mx = (dx + kx) / 2, my = Math.min(dy, ky) - 260;
  const q = (u: number): P => [(1 - u) * (1 - u) * dx + 2 * (1 - u) * u * mx + u * u * kx, (1 - u) * (1 - u) * dy + 2 * (1 - u) * u * my + u * u * ky];
  const pts = Array.from({ length: 40 }, (_, i) => q((i / 39) * arc));
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const [cx, cy] = q(arc);
  const medic = pop(t, C.hamari - 0.1, 11, 160);
  const mw = 620;
  const card = (t0: number) => pop(t, t0 - 0.1, 10, 200);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <At x={dx - 30} y={dy + 150} p={pop(t, C.india, 10, 200)}><Tag text="भारत" size={60} color={COL.in} /></At>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray="22 14" strokeLinecap="round" opacity={0.95} />
        <path d={d} fill="none" stroke={COL.in} strokeWidth={7} strokeDasharray="22 14" strokeLinecap="round" />
      </svg>
      {arc > 0.02 && <At x={cx} y={cy} clampX={false}><Badge id="in" r={44} /></At>}
      {t > C.ladne - 0.2 && t < C.bachane + 0.3 && <At x={540} y={360} p={pop(t, C.ladne - 0.1, 10, 200)} o={1 - ramp(t, C.bachane - 0.1, C.bachane + 0.3, linear)}>
        <div style={{ position: 'relative', transform: 'scale(1.6)' }}><Rifle color="#999" /><svg width={240} height={120} viewBox="0 0 240 120" style={{ position: 'absolute', left: -6, top: -20 }}><path d="M20 10 L220 110 M220 10 L20 110" stroke="#FF3B3B" strokeWidth={16} strokeLinecap="round" /></svg></div>
      </At>}
      {t > C.bachane - 0.2 && t < C.hamari + 0.4 && <At x={540} y={360} p={pop(t, C.bachane - 0.1, 10, 200)} o={1 - ramp(t, C.hamari, C.hamari + 0.4, linear)}><RedCross size={200} /></At>}
      {medic > 0 && <Cut k="k02_india_medic" x={330} y={1300 + (1 - medic) * 900} w={mw * 0.95} />}
      {t > C.hamari && <At x={540} y={330} p={pop(t, C.hamari + 0.2, 10, 200)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Flag id="in" w={110} /><Tag text={<>60 Para Field Ambulance</>} size={52} color={COL.in} font={TITLE} /></div>
      </At>}
      {t > C.n627 - 0.2 && <At x={800} y={760} p={card(C.n627)} clampX={false}><StatCard n={fmtIN(roll(t, C.n627 - 0.1, 627, 0.7))} label="लोग" color={COL.in} /></At>}
      {t > C.n22l - 0.2 && <At x={790} y={1010} p={card(C.n22l)} clampX={false}><StatCard n={<>{(roll(t, C.n22l - 0.1, 22, 0.8) / 10).toFixed(1)} लाख+</>} label="मरीज़ों का इलाज" color="#E0221B" /></At>}
      {t > C.n2324 - 0.2 && <At x={790} y={1260} p={card(C.n2324)} clampX={false}><StatCard n={fmtIN(roll(t, C.n2324 - 0.1, 2324, 0.9))} label="surgeries" color="#4FD1C5" /></At>}
    </AbsoluteFill>
  );
};
const StatCard: React.FC<{ n: React.ReactNode; label: string; color: string }> = ({ n, label, color }) => (
  <div style={{ width: 430, padding: '10px 22px 14px', background: 'rgba(10,15,22,0.9)', borderLeft: `14px solid ${color}`, borderRadius: 18, boxShadow: `0 0 26px ${color}55, 0 12px 24px rgba(0,0,0,0.55)` }}>
    <div style={{ fontFamily: TITLE, fontSize: 92, lineHeight: 1.05, color: '#fff' }}>{n}</div>
    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color, lineHeight: 1.1 }}>{label}</div>
  </div>
);

/** The armistice (1953) and the peace treaty that never came. */
const Papers: React.FC<{ t: number }> = ({ t }) => {
  const arm = pop(t, C.y1953 - 0.1, 11, 170), armO = 1 - ramp(t, C.shanti - 0.3, C.shanti, linear);
  const peace = pop(t, C.shanti - 0.1, 11, 170), peaceO = 1 - ramp(t, C.toye - 0.1, C.toye + 0.4, linear);
  const W = 640;
  const sig = (t0: number) => ramp(t, t0, t0 + 0.5, linear);
  return (
    <>
      {t > C.y1953 - 0.2 && armO > 0 && <At x={540} y={960 + (1 - arm) * 1100} o={armO} rot={-2}>
        <Paper title="ARMISTICE AGREEMENT" sub="27 JULY 1953" w={W}>
          <SignLine who="UN Command" signed={sig(C.vir - 0.3)} w={W} />
          <SignLine who="North Korea" signed={sig(C.vir + 0.1)} w={W} />
          <SignLine who="China" signed={sig(C.vir + 0.5)} w={W} />
          <SignLine who="South Korea" signed={0} empty mark={ramp(t, C.sk, C.sk + 0.8, linear)} w={W} />
        </Paper>
      </At>}
      {t > C.y1953 - 0.2 && t < C.shanti && <At x={540} y={360} p={pop(t, C.y1953 - 0.1, 10, 200)} o={armO}><Big text="1953" size={140} color={COL.gold} /></At>}
      {t > C.signtak - 0.1 && t < C.shanti && <At x={800} y={1290} p={pop(t, C.signtak, 9, 220)} o={armO} rot={-10}><Big text="✗" size={200} color="#E0221B" /></At>}
      {t > C.shanti - 0.2 && peaceO > 0 && <At x={540} y={960 + (1 - peace) * 1100} o={peaceO} rot={2}>
        <Paper title="PEACE TREATY" sub="KOREA" w={W}>
          <SignLine who="North Korea" signed={0} empty w={W} />
          <SignLine who="South Korea" signed={0} empty w={W} />
        </Paper>
      </At>}
      {t > C.aaj - 0.1 && peaceO > 0 && <At x={540} y={1000} p={pop(t, C.aaj, 8, 240)} o={peaceO} rot={-12}>
        <div style={{ padding: '6px 40px', border: '12px solid #E0221B', borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#E0221B', background: 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap' }}>आज तक नहीं</div>
      </At>}
    </>
  );
};

// ------------------------------------------------------------------ the officers and the line (cut-in over the map)
const Officers: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, C.to2 - 0.2, C.p38 - 0.05, 0.3, 0.35);
  if (o <= 0) return null;
  const up = pop(t, C.to2 - 0.15, 11, 160);
  const w = 960, h = (w * SZ.k01_officers_map.h) / SZ.k01_officers_map.w;
  const k = w / SZ.k01_officers_map.w;
  const pen = ramp(t, C.khinch - 0.3, C.end14, inOut);
  // the pencil line on the desk map (image px), towards the pencil tip
  const a: P = [880, 780], b: P = [1366, 812];
  const watch = ramp(t, C.aadhe - 0.1, C.end14 + 0.2, linear);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'rgba(4,10,20,0.45)' }} />
      <div style={{ position: 'absolute', left: 540 - w / 2, top: 1080 - h / 2 + (1 - up) * 1300, width: w, height: h }}>
        <Img src={IMG('k01_officers_map')} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: 'drop-shadow(0 26px 34px rgba(0,0,0,0.6))' }} />
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {pen > 0 && <line x1={a[0] * k} y1={a[1] * k} x2={(a[0] + (b[0] - a[0]) * pen) * k} y2={(a[1] + (b[1] - a[1]) * pen) * k} stroke="#E0221B" strokeWidth={7} strokeLinecap="round" />}
        </svg>
      </div>
      {t > C.aadhe - 0.3 && <At x={830} y={330} p={pop(t, C.aadhe - 0.2, 10, 200)}><Stopwatch p={watch * 0.5} size={250} /></At>}
      {t > C.aadhe - 0.3 && <At x={430} y={330} p={pop(t, C.aadhe, 10, 200)}><Big text={<>~30 मिनट</>} size={110} color="#fff" font={UI} /></At>}
      {t > C.officers - 0.2 && t < C.aadhe - 0.2 && <At x={540} y={330} p={pop(t, C.officers - 0.1, 10, 200)} o={1 - ramp(t, C.aadhe - 0.5, C.aadhe - 0.2, linear)}><Tag text="1945: 2 American officers" size={54} color={COL.gold} font={TITLE} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.dono - 0.1, t1: C.end22 + 0.15, from: 0.2 },
  { name: 'B', t0: C.tab - 0.1, t1: C.aur3 + 0.05, from: 0.2 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number }> = ({ t, q, name, t0, t1, from }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={F(t0 - 0.2)} durationInFrames={F(t1 - t0 + 0.6)} layout="none">
        <OffthreadVideo src={staticFile(`korea/null/null_ko_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff',
      WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · front lines approximate';

export const Korea: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(12, Math.hypot(mv.vx, mv.vy) * 0.04 + mv.zoom * 4);
  const split = splitAt(t);
  const capTop = split ? 860 : 1470;
  const papers = t > C.y1953 - 0.2 && t < C.toye + 0.4;
  const dim = Math.max(win(t, C.to2 - 0.2, C.p38, 0.3, 0.3) * 0, papers ? 0.45 * win(t, C.y1953 - 0.2, C.toye + 0.4, 0.4, 0.4) : 0, 0.35 * win(t, C.hamari - 0.2, C.goli + 0.6, 0.4, 0.5));
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <AbsoluteFill style={{ filter: [blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : '', dim > 0.01 ? `brightness(${1 - dim}) saturate(${1 - 0.4 * dim})` : ''].join(' ') || undefined }}>
          <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c0} /></AbsoluteFill>
          <Clouds t={t} a={clamp01((c0.mpp - 300) / 900) * 0.7} />
          <MapVectors t={t} c={c0} />
        </AbsoluteFill>
        <Grade t={t} />
        <MapOverlays t={t} c={c0} top={!!split} />
        <Officers t={t} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && <Captions t={t} top={capTop} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
