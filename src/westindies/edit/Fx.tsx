import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, project, toScreen } from './cam';
import type { Region } from './Shapes';
import { SUB } from '../../timezones/fonts';
import { NUM, UI } from '../motion/font';
import { W01Magnifier } from '../motion/W01Magnifier';
import { W02CrossStamp } from '../motion/W02CrossStamp';
import { W03BigCount } from '../motion/W03BigCount';
import { W04SpeechBubble } from '../motion/W04SpeechBubble';
import { W09FedFlag } from '../motion/W09FedFlag';
import { W10Crack } from '../motion/W10Crack';
import { W11TitleCard } from '../motion/W11TitleCard';
import { W12GlowLabel } from '../motion/W12GlowLabel';

const FPS = 60;
const f60 = (s: number) => Math.round(s * FPS);
type Pt = [number, number];
const STROKE = (w: number, col = '#000') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.7)';

export const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>{children}</div>
  </Sequence>
);

/** Kinetic headline (white, black stroke, a pop and a slow float). */
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; rot?: number; font?: string }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', rot = -3, font = UI }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260));
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot + Math.sin((t - t0) * 1.3) * 0.8}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.15, textShadow: SHADOW, ...STROKE(size > 150 ? 12 : 9, '#06101a') }}>{text}</div>
  );
};

// ================================================================ the fills

/** The reference's fill colours, one per country. */
export const FILL: Record<string, string> = {
  Cuba: '#E8383D', Jamaica: '#3FE0CF', Haiti: '#46E04F', 'Dominican Republic': '#F28A24', 'The Bahamas': '#36B6F2', Barbados: '#3FE0CF',
  'Trinidad and Tobago': '#E2333A', Grenada: '#C9D62B', 'Saint Lucia': '#3FE0CF', 'Antigua and Barbuda': '#E2333A', Dominica: '#46E04F',
  'Saint Kitts and Nevis': '#3B5BF0', 'Saint Vincent and the Grenadines': '#E8C52E', Guyana: '#C2416B',
};
const SHORT: Record<string, string> = {
  'Dominican Republic': 'Dominican\nRepublic', 'The Bahamas': 'Bahamas', 'Trinidad and Tobago': 'Trinidad and\nTobago', 'Antigua and Barbuda': 'Antigua',
  'Saint Kitts and Nevis': 'St Kitts', 'Saint Vincent and the Grenadines': 'St Vincent', 'Saint Lucia': 'St Lucia',
};
const MAROON = '#C2416B', FEDBLUE = '#3E7BFF';
const TOUR: [string, number, Partial<Region>][] = [
  ['Cuba', C.cuba3, { wipe: 0 }], ['Jamaica', C.jamaica3, { wipe: 0 }], ['Haiti', C.haiti3, { wipe: 0 }], ['Dominican Republic', C.dr3, { from: merc(-71.75, 19.0) }],
  ['The Bahamas', C.bahamas3, { wipe: -60 }], ['Barbados', C.barbados3, { wipe: 90 }], ['Trinidad and Tobago', C.trinidad3, { wipe: 0 }],
];
const REST = ['Grenada', 'Saint Vincent and the Grenadines', 'Saint Lucia', 'Dominica', 'Antigua and Barbuda', 'Saint Kitts and Nevis'];
const NOT_CRICKET: Record<string, number> = { Cuba: C.xcuba4, Haiti: C.xhaiti4, 'Dominican Republic': C.xdr4, 'The Bahamas': C.xbah4 };
const TERR: [string, string, string[], number][] = [
  ['Britain', '#9FB7FF', ['Cayman Islands', 'Turks and Caicos Islands', 'British Virgin Islands', 'Anguilla', 'Montserrat'], C.britain3],
  ['France', '#7FA8FF', ['France', 'Saint Martin'], C.france3],
  ['Netherlands', '#FF9A4A', ['Aruba', 'Curaçao', 'Sint Maarten', 'Netherlands'], C.neth3],
  ['America', '#E9EEF5', ['Puerto Rico', 'United States Virgin Islands'], C.america3],
];
// Cricket West Indies: mostly the former British islands, and Guyana on the mainland
const CRICKET = ['Jamaica', 'Barbados', 'Trinidad and Tobago', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Grenada'];
const CRICKET_T = ['Anguilla', 'Montserrat', 'British Virgin Islands', 'United States Virgin Islands', 'Sint Maarten'];
// the West Indies Federation, 1958–1962
const FED = ['Jamaica', 'Trinidad and Tobago', 'Barbados', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Grenada'];
const FED_T = ['Anguilla', 'Montserrat'];

const SET_A = [C.kyun5 + 0.3, C.naam7 + 0.2] as const; // line 5–6 maroon
const SET_B = [C.toot9 + 0.2, DURATION_S - 0.55] as const; // line 9 maroon
const FED_W = [C.desh8 - 0.2, C.toot9 + 0.3] as const;

export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const tourEnd = C.kyun5 + 0.5;
  for (const [n, t0, more] of TOUR) {
    const g = NOT_CRICKET[n] !== undefined ? ramp(t, NOT_CRICKET[n] + 0.05, NOT_CRICKET[n] + 0.4) : 0;
    out.push({ key: n, rings: GEO.countries[n], color: FILL[n], t0: t0 - 0.05, t1: tourEnd, grey: g, ...more });
  }
  REST.forEach((n, i) => out.push({ key: n, rings: GEO.countries[n], color: FILL[n], t0: C.n13_3 + 0.25 + i * 0.07, t1: tourEnd, dur: 0.22 }));
  for (const [, col, names, t0] of TERR) names.forEach((n, i) => GEO.territories[n]?.length && out.push({ key: `t_${n}`, rings: GEO.territories[n], color: col, t0: t0 + i * 0.05, alpha: 0.55, glow: 20, t1: C.twist4 + 0.3 }));
  // line 5–6 and line 9: the cricket team's islands in maroon (Guyana joins at its line)
  for (const [k, [a, b]] of [['A', SET_A], ['B', SET_B]] as [string, readonly [number, number]][]) {
    CRICKET.forEach((n, i) => out.push({ key: `ck${k}_${n}`, rings: GEO.countries[n], color: MAROON, t0: a + i * 0.05, t1: b, dur: 0.25, glow: 18 }));
    CRICKET_T.forEach((n, i) => GEO.territories[n]?.length && out.push({ key: `ck${k}t_${n}`, rings: GEO.territories[n], color: MAROON, t0: a + 0.45 + i * 0.05, t1: b, dur: 0.25 }));
    out.push({ key: `ck${k}_Guyana`, rings: GEO.countries.Guyana, color: MAROON, t0: k === 'A' ? C.guyana6 - 0.05 : a + 0.5, t1: b, dur: k === 'A' ? 0.5 : 0.25, wipe: 90, glow: 18 });
  }
  // line 8: the Federation in one blue; Jamaica turns red at its vote and the rest fade at the break
  FED.forEach((n, i) => {
    const isJ = n === 'Jamaica';
    out.push({ key: `fed_${n}`, rings: GEO.countries[n], color: isJ && t > C.jamaica8 ? '#F0373C' : FEDBLUE, t0: FED_W[0] + i * 0.06, t1: isJ ? FED_W[1] : C.toot8 + 0.9, dur: 0.25, glow: 20 });
  });
  FED_T.forEach((n, i) => out.push({ key: `fedt_${n}`, rings: GEO.territories[n], color: FEDBLUE, t0: FED_W[0] + 0.5 + i * 0.05, t1: C.toot8 + 0.9, dur: 0.25 }));
  // line 5 and line 7: India in its official boundary (Natural Earth, India point-of-view)
  out.push({ key: 'india5', rings: GEO.india, color: '#FF9933', t0: C.hamari5 + 0.05, t1: C.jamaica5 + 0.1, dur: 0.3, alpha: 0.7, glow: 24 });
  out.push({ key: 'india7', rings: GEO.india, color: '#FFC93C', t0: C.east7 - 0.15, t1: C.desh8 - 0.6, dur: 0.3, alpha: 0.72, glow: 24 });
  return out;
};

// ================================================================ names, pins, lines

const centroid = (rings: P[][]): P => {
  let a = 0, x = 0, y = 0;
  for (const r of rings) for (let i = 0; i < r.length - 1; i++) {
    const c = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
    a += c; x += (r[i][0] + r[i + 1][0]) * c; y += (r[i][1] + r[i + 1][1]) * c;
  }
  return a ? [x / (3 * a), y / (3 * a)] : rings[0][0];
};
const biggest = (rings: P[][]): P[][] => {
  let best = rings[0], ba = 0;
  for (const r of rings) {
    let a = 0;
    for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
    if (Math.abs(a) > ba) { ba = Math.abs(a); best = r; }
  }
  return [best];
};
const CENT = new Map<string, P>();
export const anchorOf = (n: string): P => {
  if (!CENT.has(n)) CENT.set(n, n === 'The Bahamas' ? merc(-77.6, 24.4) : centroid(biggest(GEO.countries[n] ?? GEO.territories[n])));
  return CENT.get(n)!;
};

/** A country's name inside its fill, in a lighter tint of the fill colour (the reference's labels), scaled with zoom. */
const NameTag: React.FC<{ t: number; c: Cam; n: string; t0: number; t1: number; size?: number; color?: string; label?: string }> = ({ t, c, n, t0, t1, size = 64, color, label }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.2, t1);
  if (a <= 0) return null;
  const [x, y] = toScreen(c, anchorOf(n));
  if (x < -300 || x > 1380 || y < -300 || y > 2220) return null;
  const s = clamp01(pop(t, t0, 10, 240));
  const g = NOT_CRICKET[n] !== undefined && !color ? ramp(t, NOT_CRICKET[n] + 0.05, NOT_CRICKET[n] + 0.4) : 0;
  const col = color ?? FILL[n];
  const k = Math.min(1.35, Math.max(0.42, Math.pow(1.4e6 / c.span, 0.32)));
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.3) * 3, transform: `translate(-50%,-50%) scale(${s})`, textAlign: 'center', whiteSpace: 'pre', lineHeight: 1.0, opacity: a * (1 - 0.3 * g),
      fontFamily: UI, fontWeight: 800, fontSize: size * k, color: g > 0.5 ? '#C9CED6' : `color-mix(in srgb, ${col} 45%, white)`, textShadow: `0 0 14px ${col}, 0 3px 8px rgba(0,0,0,0.75)` }}>{label ?? SHORT[n] ?? n}</div>
  );
};

/** A map pin: a glowing dot with a pulsing ring (for places named in passing). */
const Pin: React.FC<{ t: number; t0: number; t1: number; at: Pt; color?: string }> = ({ t, t0, t1, at, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 10, 240)), ring = ((t - t0) * 1.1) % 1;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      <circle cx={at[0]} cy={at[1]} r={14 + ring * 50} fill="none" stroke={color} strokeWidth={4} opacity={(1 - ring) * 0.8} />
      <circle cx={at[0]} cy={at[1]} r={12 * s} fill={color} stroke="#06101a" strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
    </svg>
  );
};

const polyD = (pts: Pt[], close = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + (close ? 'Z' : '');
const lenOf = (pts: Pt[]) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };

/** The region's outline: a thin white line with a soft glow draws round all the islands, then a light runs along it. */
const Hull: React.FC<{ t: number; c: Cam; t0: number; t1: number; color?: string }> = ({ t, c, t0, t1, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.4, t1);
  if (a <= 0) return null;
  const pts = GEO.hull[0].map((p) => toScreen(c, p));
  const d = polyD(pts, true), L = lenOf(pts);
  const p = ramp(t, t0, t0 + 1.3, inOut), run = ((t - t0) * 0.35) % 1;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#BFF6FF" strokeWidth={10} opacity={0.3} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={3.2} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" />
      {p >= 1 && <path d={d} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${L * 0.06} ${L}`} strokeDashoffset={-L * run} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #9FF3FF)' }} />}
    </svg>
  );
};

/** A network of glowing links between islands (the Federation, the cricket team), drawing on one by one. */
const Links: React.FC<{ t: number; c: Cam; names: string[]; t0: number; t1: number; color: string }> = ({ t, c, names, t0, t1, color }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.3, t1);
  if (a <= 0) return null;
  const pts = names.map((n) => toScreen(c, anchorOf(n)));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      {pts.slice(1).map((q, i) => {
        const p0 = pts[i], L = Math.hypot(q[0] - p0[0], q[1] - p0[1]);
        const k = ramp(t, t0 + i * 0.08, t0 + i * 0.08 + 0.3, easeOut);
        const mx = (p0[0] + q[0]) / 2, my = (p0[1] + q[1]) / 2 - L * 0.18;
        return <path key={i} d={`M ${p0[0]} ${p0[1]} Q ${mx} ${my} ${q[0]} ${q[1]}`} fill="none" stroke={color} strokeWidth={3} strokeDasharray={`${L * 1.2 * k} ${L * 2}`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
      })}
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 * clamp01(pop(t, t0 + i * 0.08, 8, 240))} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />)}
    </svg>
  );
};

/** Columbus's crossing: a gold route draws from Spain past the Canaries to the Bahamas, a bright comet head leading
 *  it; on arrival a ring bursts. The map dims underneath (see `Dim`). */
const ROUTE = ([[-6.95, 37.2], [-12, 33], [-15.6, 28.1], [-30, 25], [-50, 24.2], [-65, 24.6], [-74.5, 24.05]] as Pt[]).map(([a, b]) => merc(a, b));
const Voyage: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.columbus7 + 0.2, t1 = C.pahunch7 + 0.2;
  const a = window4(t, t0 - 0.1, t0 + 0.1, C.galti7 + 0.6, C.galti7 + 1.0);
  if (a <= 0) return null;
  const pts = ROUTE.map((p) => toScreen(c, p));
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += ` Q ${pts[i - 1][0]} ${pts[i - 1][1]} ${m[0]} ${m[1]}`; }
  d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  const L = lenOf(pts) * 1.02;
  const p = ramp(t, t0, t1, inOut);
  let s = p * lenOf(pts), hx = pts[0][0], hy = pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (s <= l) { hx = lerp(pts[i - 1][0], pts[i][0], s / l); hy = lerp(pts[i - 1][1], pts[i][1], s / l); break; }
    s -= l; hx = pts[i][0]; hy = pts[i][1];
  }
  const burst = ramp(t, t1, t1 + 0.6);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#FFC93C" strokeWidth={16} opacity={0.25} strokeDasharray={`${L * p} ${L * 2}`} strokeLinecap="round" style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke="#FFC93C" strokeWidth={5} strokeDasharray={`${L * p} ${L * 2}`} strokeLinecap="round" />
      {p > 0 && p < 1 && <>
        <circle cx={hx} cy={hy} r={26} fill="#FFE48A" opacity={0.35} style={{ filter: 'blur(10px)' }} />
        <circle cx={hx} cy={hy} r={10} fill="#fff" style={{ filter: 'drop-shadow(0 0 12px #FFC93C)' }} />
      </>}
      {burst > 0 && burst < 1 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={20 + 120 * burst} fill="none" stroke="#FFC93C" strokeWidth={8 * (1 - burst)} opacity={1 - burst} />}
    </svg>
  );
};

/** The crossing's dark: the map fades almost to black under the voyage (the reference's 0:34.2–0:34.5). */
export const Dim: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.columbus7 + 0.05, C.columbus7 + 0.35, C.pahunch7 - 0.2, C.pahunch7 + 0.4);
  return a > 0 ? <AbsoluteFill style={{ background: '#01060b', opacity: 0.72 * a, pointerEvents: 'none' }} /> : null;
};

/** A glowing label for a place near the edge: the pill stays inside the frame (x clamped to 330–750) and a dashed
 *  leader runs from it to the real anchor, with a pulsing dot there. */
const Tag: React.FC<{ t: number; t0: number; t1: number; at: Pt; text: string; color: string; dy?: number; scale?: number }> = ({ t, t0, t1, at, text, color, dy = -230, scale = 0.8 }) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const px = Math.min(750, Math.max(330, at[0])), py = Math.min(1500, Math.max(260, at[1] + dy));
  const k = ramp(t, t0 + 0.1, t0 + 0.4, easeOut);
  const L = Math.hypot(at[0] - px, at[1] - py - 40);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
        <path d={`M ${px} ${py + 40} L ${at[0]} ${at[1]}`} stroke={color} strokeWidth={4} strokeDasharray={`${L * k} ${L * 2}`} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {k >= 1 && <circle cx={at[0]} cy={at[1]} r={10} fill={color} stroke="#06101a" strokeWidth={3} />}
      </svg>
      <At t0={t0} t1={t1} x={px} y={py} w={700} h={320} ay={110 / 320} scale={scale}><W12GlowLabel text={text} color={color} arrow={false} /></At>
    </>
  );
};

// ================================================================ subtitles, grade, flashes

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights teal), English names and numbers in gold. */
const HOT = /^[+\-−0-9,.~%:"$]*[0-9A-Za-zÁ-úí]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.05;
  if (i < 0 || t < 0.2 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.replace(/"/g, '').split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:."]/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.8)', ...STROKE(9) }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#3FF0DC' : HOT.test(w) ? '#FFD84D' : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

/** The Midnight grade: no warm tones, no grain. A cool soft-light into the shadows, a slow cool light drifting
 *  across (on whole cycles over the loop), a deep vignette, darker top and bottom edges. */
const LW = (k: number) => (2 * Math.PI * k) / DURATION_S;
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * LW(3) + 0.6), ly = 36 + 20 * Math.sin(t * LW(2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,60,90,0.32), rgba(0,40,70,0.14) 50%, rgba(0,50,80,0.3))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(120,210,255,0.13), rgba(80,170,255,0.04) 30%, rgba(0,0,0,0) 50%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,3,8,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,4,10,0.45), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 74%, rgba(0,4,10,0.55))' }} />
    </AbsoluteFill>
  );
};
export const MAP_GRADE = 'contrast(1.08) saturate(1.05)';

/** A short white flash on the big whips and hits. */
export const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [C.kyun2 + 0.3, C.hamari5 - 0.05, C.n500_7 - 0.4, C.east7 - 0.5, C.desh8 - 0.7]) a = Math.max(a, 0.55 * ramp(t, p - 0.04, p, linear) * (1 - ramp(t, p, p + 0.28, easeOut)));
  for (const p of [C.toot8]) a = Math.max(a, 0.7 * ramp(t, p - 0.03, p, linear) * (1 - ramp(t, p, p + 0.3, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};

// ================================================================ everything over the map

export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const S = (n: string) => toScreen(c, anchorOf(n));
  const L = (lon: number, lat: number) => toScreen(c, merc(lon, lat));
  const tourEnd = C.kyun5 + 0.5;
  const cks = [...CRICKET, 'Guyana'];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* line 1: the title card, the magnifier searching the world */}
      <At t0={0} t1={C.kyun2 + 0.1} x={540} y={300} w={1080} h={640}><W11TitleCard out={f60(C.kyun2 - 0.15)} /></At>
      <At t0={1.1} t1={C.kyun2} x={540} y={960} w={1080} h={1920}><W01Magnifier pts={[[240, 1080], [470, 940], [700, 1160], [880, 900], [600, 760], [380, 1280], [760, 1380]]} hop={38} out={f60(C.kyun2 - 1.3)} /></At>
      {/* line 2: no such country */}
      <Big t={t} t0={C.desh2 - 0.1} t1={C.caribbean3 - 0.1} text="कोई देश नहीं!" x={540} y={420} size={110} color="#FF5A5F" rot={-4} />
      {/* line 3: the outline round the islands, the names in their fills, the 13, the islands that still belong to others */}
      <Hull t={t} c={c} t0={C.kyun2 + 0.6} t1={C.cuba3 + 0.2} />
      <Hull t={t} c={c} t0={C.n13_3 + 0.1} t1={C.twist4 + 0.3} />
      {TOUR.map(([n, t0]) => <NameTag key={n} t={t} c={c} n={n} t0={t0 + 0.1} t1={tourEnd} />)}
      {REST.map((n, i) => <NameTag key={n} t={t} c={c} n={n} t0={C.n13_3 + 0.35 + i * 0.07} t1={tourEnd} size={52} />)}
      <At t0={C.n13_3 - 0.05} t1={C.twist4} x={540} y={420} w={900} h={420} scale={0.95}><W03BigCount to={13} dur={34} caption="आज़ाद देश" /></At>
      {TERR.map(([name, col, names, t0], i) => {
        const [x, y] = toScreen(c, centroid(biggest(GEO.territories[names[0]])));
        const pos: Pt[] = [[300, 1500], [820, 1260], [380, 1660], [760, 1520]];
        return (
          <React.Fragment key={name}>
            <At t0={t0} t1={C.twist4 + 0.2} x={pos[i][0]} y={pos[i][1]} w={700} h={320} scale={0.7}><W12GlowLabel text={name} color={col} arrow={false} size={56} /></At>
            {t > t0 && t < C.twist4 + 0.2 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <path d={`M ${pos[i][0]} ${pos[i][1] - 40} Q ${(pos[i][0] + x) / 2} ${Math.min(y, pos[i][1]) - 80} ${x} ${y}`} stroke={col} strokeWidth={3} fill="none" strokeDasharray="10 8" strokeDashoffset={-t * 40} opacity={0.8 * window4(t, t0, t0 + 0.3, C.twist4 - 0.2, C.twist4 + 0.2)} />
            </svg>}
          </React.Fragment>
        );
      })}
      {/* line 4: the twist: the four that don't play for the cricket team */}
      <At t0={C.cricket4 - 0.1} t1={tourEnd} x={540} y={400} w={700} h={320}><W12GlowLabel text="Cricket वाली West Indies" color={MAROON} arrow={false} size={54} /></At>
      {Object.entries(NOT_CRICKET).map(([n, t0]) => {
        const [x, y] = S(n);
        return <At key={n} t0={t0} t1={tourEnd} x={x} y={y} w={400} h={400} scale={n === 'Cuba' ? 0.75 : 0.6}><W02CrossStamp seed={n.slice(0, 3)} /></At>;
      })}
      {/* line 5: the team is the old British islands, like India; Jamaica, Barbados, Trinidad, the small islands */}
      <Links t={t} c={c} names={cks.slice(0, 9)} t0={C.kyun5 + 0.6} t1={C.hamari5} color="#FF8FB1" />
      <At t0={C.britain5 - 0.1} t1={C.jamaica5 + 0.1} x={540} y={420} w={700} h={320}><W12GlowLabel text="British राज" color="#FF8FB1" arrow={false} size={64} /></At>
      {t > C.hamari5 && t < C.jamaica5 + 0.2 && (() => {
        const a = S('Jamaica'), b = toScreen(c, merc(79, 22));
        const k = ramp(t, C.hamari5 + 0.2, C.hamari5 + 0.7, inOut), Lr = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 260} ${b[0]} ${b[1]}`} fill="none" stroke="#FF9933" strokeWidth={5} strokeDasharray={`${Lr * 1.3 * k} ${Lr * 3}`} style={{ filter: 'drop-shadow(0 0 8px #FF9933)' }} />
          </svg>
        );
      })()}
      <Big t={t} t0={C.hamari5 + 0.15} t1={C.jamaica5 + 0.1} text="बिल्कुल हमारी तरह" x={540} y={1300} size={88} color="#FFB061" rot={-3} />
      {([['Jamaica', C.jamaica5], ['Barbados', C.barbados5], ['Trinidad and Tobago', C.trinidad5]] as [string, number][]).map(([n, t0]) => <NameTag key={`n5${n}`} t={t} c={c} n={n} t0={t0} t1={C.ajeeb6 + 0.2} color="#FF8FB1" />)}
      {['Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Grenada'].map((n, i) => <Pin key={`p5${n}`} t={t} t0={C.chhote5 + i * 0.1} t1={C.ajeeb6 + 0.3} at={S(n)} color="#FF8FB1" />)}
      {/* line 6: Guyana, not an island at all */}
      <Big t={t} t0={C.ajeeb6 - 0.05} t1={C.island6 + 0.2} text="सबसे अजीब बात" x={540} y={420} size={96} color="#FFD84D" rot={-4} />
      <NameTag t={t} c={c} n="Guyana" t0={C.guyana6 + 0.15} t1={C.naam7 + 0.2} color={MAROON} label="Guyana" size={70} />
      <At t0={C.island6 + 0.2} t1={C.naam7} x={540} y={400} w={700} h={320}><W12GlowLabel text="Island नहीं!" color="#FF5A5F" arrow={false} size={60} /></At>
      <Big t={t} t0={C.samerica6 - 0.05} t1={C.naam7} text="SOUTH AMERICA" x={540} y={1020} size={74} color="#fff" rot={0} font={NUM} />
      {/* line 7: why the name: 500 years ago, Columbus, "is this India?", East Indies and West Indies */}
      <Big t={t} t0={C.naam7 - 0.05} t1={C.n500_7 - 0.2} text="नाम West Indies क्यों?" x={540} y={420} size={86} color="#fff" rot={-3} />
      <At t0={C.n500_7 - 0.05} t1={C.columbus7 + 0.3} x={540} y={420} w={900} h={420} scale={0.8}><W03BigCount from={1300} to={1492} dur={40} caption="Columbus" color="#FFE48A" /></At>
      <Pin t={t} t0={C.columbus7 - 0.1} t1={C.pahunch7} at={L(-6.95, 37.2)} color="#FFC93C" />
      <Big t={t} t0={C.columbus7} t1={C.pahunch7 - 0.2} text="Spain → India?" x={540} y={420} size={84} color="#FFE48A" rot={-3} />
      <Voyage t={t} c={c} />
      <At t0={C.yahi7 - 0.15} t1={C.east7 - 0.4} x={Math.min(760, Math.max(320, toScreen(c, merc(-74.5, 24.05))[0]))} y={toScreen(c, merc(-74.5, 24.05))[1] - 40} w={700} h={360} ax={220 / 700} ay={330 / 360}><W04SpeechBubble text="यही India है?" /></At>
      <At t0={C.galti7 - 0.05} t1={C.east7 - 0.4} x={Math.min(760, Math.max(320, toScreen(c, merc(-74.5, 24.05))[0])) + 120} y={toScreen(c, merc(-74.5, 24.05))[1] - 180} w={400} h={400} scale={0.7}><W02CrossStamp seed="galti" /></At>
      <Big t={t} t0={C.galti7} t1={C.east7 - 0.4} text="गलती!" x={540} y={1360} size={120} color="#FF5A5F" rot={-6} />
      <Tag t={t} t0={C.east7 - 0.1} t1={C.desh8 - 0.6} at={L(88, 18)} text="EAST INDIES" color="#FFC93C" dy={-330} />
      <Tag t={t} t0={C.west7 - 0.1} t1={C.desh8 - 0.6} at={L(-70, 18)} text="WEST INDIES" color="#3FF0DC" dy={330} />
      {/* line 8: the West Indies Federation, 1958–1962 */}
      <Links t={t} c={c} names={['Jamaica', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Lucia', 'Barbados', 'Saint Vincent and the Grenadines', 'Grenada', 'Trinidad and Tobago']} t0={C.desh8 + 0.2} t1={C.toot8 + 0.2} color="#9FC0FF" />
      <At t0={C.n1958_8 - 0.05} t1={C.sansad8} x={540} y={400} w={900} h={420} scale={0.8}><W03BigCount from={1900} to={1958} dur={30} caption="West Indies Federation" color="#BFD4FF" /></At>
      <At t0={C.jhanda8 - 0.1} t1={C.n4_8 + 0.2} x={800} y={1250} w={520} h={640} scale={0.6}><W09FedFlag /></At>
      <Pin t={t} t0={C.sansad8} t1={C.n4_8 + 0.2} at={L(-61.51, 10.66)} color="#BFD4FF" />
      <Tag t={t} t0={C.sansad8 + 0.1} t1={C.n4_8 + 0.2} at={L(-61.51, 10.66)} text="संसद · Port of Spain" color="#BFD4FF" dy={-260} scale={0.75} />
      <At t0={C.n4_8 - 0.05} t1={C.toot8 + 0.3} x={540} y={420} w={900} h={420} scale={0.85}><W03BigCount from={0} to={4} dur={24} caption="साल" color="#FFFFFF" /></At>
      <Tag t={t} t0={C.vote8 - 0.05} t1={C.toot8 + 0.2} at={S('Jamaica')} text="Jamaica: VOTE ✓" color="#FF5A5F" dy={-240} />
      <At t0={C.toot8 - 0.05} t1={C.toot9 + 0.5} x={540} y={960} w={1080} h={1080}><W10Crack pts={[[S('Jamaica')[0], S('Jamaica')[1] - 420], [S('Jamaica')[0] + 160, S('Jamaica')[1] - 360], [560, 640], [700, 560], [820, 600], [1000, 420]]} /></At>
      <Big t={t} t0={C.toot8 + 0.05} t1={C.toot9 - 0.1} text="देश टूट गया" x={540} y={1360} size={110} color="#FF5A5F" rot={-5} />
      {/* line 9: the cricket team still plays together, under the old name */}
      <Links t={t} c={c} names={['Jamaica', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Lucia', 'Barbados', 'Saint Vincent and the Grenadines', 'Grenada', 'Trinidad and Tobago', 'Guyana']} t0={C.toot9 + 0.3} t1={DURATION_S - 0.5} color="#FF8FB1" />
      <At t0={C.cricket9 - 0.1} t1={DURATION_S - 0.65} x={540} y={400} w={700} h={320}><W12GlowLabel text="पर team साथ खेलती रही" color={MAROON} arrow={false} size={54} /></At>
      <Big t={t} t0={C.naam9 - 0.05} t1={DURATION_S - 0.65} text="WEST INDIES" x={540} y={1240} size={120} color="#fff" rot={0} font={NUM} />
      {/* the loop: the title card back on its own clock, so the last frame runs straight into frame 0 */}
      <LoopClose t={t} />
    </AbsoluteFill>
  );
};

const LOOP_T0 = DURATION_S - 0.5;
const LoopClose: React.FC<{ t: number }> = ({ t }) => {
  if (t < LOOP_T0) return null;
  const N = Math.ceil(DURATION_S * FPS);
  const fo = f60(LOOP_T0) - N;
  return (
    <AbsoluteFill style={{ opacity: ramp(t, LOOP_T0, DURATION_S - 0.15, easeIn) }}>
      <At t0={LOOP_T0} t1={DURATION_S + 1} x={540} y={300} w={1080} h={640}><W11TitleCard fo={fo} /></At>
    </AbsoluteFill>
  );
};

export { project };
