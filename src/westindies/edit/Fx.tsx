import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { clamp01, easeOut, inOut, linear, pop, ramp, window4 } from './anim';
import { C, Cam, GEO, P, merc, project, toScreen } from './cam';
import type { Region } from './Shapes';
import { UI } from '../motion/font';
import { W01Magnifier } from '../motion/W01Magnifier';
import { W02CrossStamp } from '../motion/W02CrossStamp';
import { W03BigCount } from '../motion/W03BigCount';
import { W11TitleCard } from '../motion/W11TitleCard';
import { W12GlowLabel } from '../motion/W12GlowLabel';

const FPS = 60;
const f60 = (s: number) => Math.round(s * FPS);
type Pt = [number, number];

export const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>{children}</div>
  </Sequence>
);

/** The reference's fill colours, one per country, in the order the VO names them. */
export const FILL: Record<string, string> = {
  Cuba: '#E8383D', Jamaica: '#3FE0CF', Haiti: '#46E04F', 'Dominican Republic': '#F28A24', 'The Bahamas': '#36B6F2', Barbados: '#3FE0CF',
  'Trinidad and Tobago': '#E2333A', Grenada: '#C9D62B', 'Saint Lucia': '#3FE0CF', 'Antigua and Barbuda': '#E2333A', Dominica: '#46E04F',
  'Saint Kitts and Nevis': '#3B5BF0', 'Saint Vincent and the Grenadines': '#E8C52E', Guyana: '#A8335A',
};
const SHORT: Record<string, string> = {
  'Dominican Republic': 'Dominican\nRepublic', 'The Bahamas': 'Bahamas', 'Trinidad and Tobago': 'Trinidad and\nTobago', 'Antigua and Barbuda': 'Antigua',
  'Saint Kitts and Nevis': 'St Kitts', 'Saint Vincent and the Grenadines': 'St Vincent', 'Saint Lucia': 'St Lucia',
};
// where each fill starts: the tour order and the reveal direction (the reference: Haiti wipes in from the left, the
// Dominican Republic grows out from the border with Haiti)
const TOUR: [string, number, Partial<Region>][] = [
  ['Cuba', C.cuba3, { wipe: 0 }], ['Jamaica', C.jamaica3, { wipe: 0 }], ['Haiti', C.haiti3, { wipe: 0 }], ['Dominican Republic', C.dr3, { from: merc(-71.75, 19.0) }],
  ['The Bahamas', C.bahamas3, { wipe: -60 }], ['Barbados', C.barbados3, { wipe: 90 }], ['Trinidad and Tobago', C.trinidad3, { wipe: 0 }],
];
const REST = ['Grenada', 'Saint Vincent and the Grenadines', 'Saint Lucia', 'Dominica', 'Antigua and Barbuda', 'Saint Kitts and Nevis'];
const NOT_CRICKET = { Cuba: C.xcuba4, Haiti: C.xhaiti4, 'Dominican Republic': C.xdr4, 'The Bahamas': C.xbah4 } as Record<string, number>;
const TERR: [string, string, string[], number][] = [
  ['Britain', '#9FB7FF', ['Cayman Islands', 'Turks and Caicos Islands', 'British Virgin Islands', 'Anguilla', 'Montserrat'], C.britain3],
  ['France', '#7FA8FF', ['France', 'Saint Martin'], C.france3],
  ['Netherlands', '#FF9A4A', ['Aruba', 'Curaçao', 'Sint Maarten', 'Netherlands'], C.neth3],
  ['America', '#E9EEF5', ['Puerto Rico', 'United States Virgin Islands'], C.america3],
];

export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  for (const [n, t0, more] of TOUR) {
    const g = NOT_CRICKET[n] !== undefined ? ramp(t, NOT_CRICKET[n] + 0.05, NOT_CRICKET[n] + 0.4) : 0;
    out.push({ key: n, rings: GEO.countries[n], color: FILL[n], t0: t0 - 0.05, grey: g, ...more });
  }
  REST.forEach((n, i) => out.push({ key: n, rings: GEO.countries[n], color: FILL[n], t0: C.n13_3 + 0.25 + i * 0.07, dur: 0.22 }));
  for (const [, col, names, t0] of TERR) names.forEach((n, i) => GEO.territories[n]?.length && out.push({ key: `t_${n}`, rings: GEO.territories[n], color: col, t0: t0 + i * 0.05, alpha: 0.55, glow: 20, t1: C.twist4 + 0.3 }));
  return out;
};

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
  if (!CENT.has(n)) CENT.set(n, n === 'The Bahamas' ? merc(-77.6, 24.4) : centroid(biggest(GEO.countries[n])));
  return CENT.get(n)!;
};

/** A country's name inside its fill, in a lighter tint of the fill colour (the reference's labels), typing in. */
const NameTag: React.FC<{ t: number; c: Cam; n: string; t0: number; size?: number }> = ({ t, c, n, t0, size = 50 }) => {
  if (t < t0) return null;
  const [x, y] = toScreen(c, anchorOf(n));
  if (x < -300 || x > 1380 || y < -300 || y > 2220) return null;
  const s = clamp01(pop(t, t0, 10, 240));
  const g = NOT_CRICKET[n] !== undefined ? ramp(t, NOT_CRICKET[n] + 0.05, NOT_CRICKET[n] + 0.4) : 0;
  const col = FILL[n];
  // names scale with the zoom: big on the close-ups, small in the wide shots so they don't pile up
  const k = Math.min(1.35, Math.max(0.42, Math.pow(1.4e6 / c.span, 0.32)));
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.3) * 3, transform: `translate(-50%,-50%) scale(${s})`, textAlign: 'center', whiteSpace: 'pre', lineHeight: 1.0,
      fontFamily: UI, fontWeight: 800, fontSize: size * k, color: g > 0.5 ? '#C9CED6' : `color-mix(in srgb, ${col} 45%, white)`, opacity: 1 - 0.3 * g,
      textShadow: `0 0 14px ${col}, 0 3px 8px rgba(0,0,0,0.75)` }}>{SHORT[n] ?? n}</div>
  );
};

/** The region's outline: a thin white line with a soft glow draws round all the islands, then a light runs along it. */
const Hull: React.FC<{ t: number; c: Cam; t0: number; t1: number }> = ({ t, c, t0, t1 }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.4, t1);
  if (a <= 0) return null;
  const pts = GEO.hull[0].map((p) => toScreen(c, p));
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z';
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const p = ramp(t, t0, t0 + 1.3, inOut);
  const run = ((t - t0) * 0.35) % 1;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#BFF6FF" strokeWidth={10} opacity={0.3} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={3.2} strokeDasharray={`${L * p} ${L}`} strokeLinejoin="round" />
      {p >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray={`${L * 0.06} ${L}`} strokeDashoffset={-L * run} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #9FF3FF)' }} />}
    </svg>
  );
};

/** The Midnight grade: no warm tones, no grain. A cool soft-light into the shadows, a slow cool light drifting
 *  across, a deep vignette and darker top and bottom edges, so the saturated fills are the brightest thing. */
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * 0.21 + 0.6), ly = 36 + 20 * Math.sin(t * 0.15);
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

export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const S = (n: string) => toScreen(c, anchorOf(n));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* line 1: the title card, the magnifier searching the world */}
      <At t0={0} t1={C.kyun2 + 0.1} x={540} y={300} w={1080} h={640}><W11TitleCard out={f60(C.kyun2 - 0.15)} /></At>
      <At t0={1.1} t1={C.kyun2} x={540} y={960} w={1080} h={1920}><W01Magnifier pts={[[240, 1080], [470, 940], [700, 1160], [880, 900], [600, 760], [380, 1280], [760, 1380]]} hop={34} out={f60(C.kyun2 - 1.4)} /></At>
      {/* line 3: the outline round the islands, the names in their fills, the 13, the islands that still belong to others */}
      <Hull t={t} c={c} t0={C.kyun2 + 0.5} t1={C.cuba3 + 0.2} />
      <Hull t={t} c={c} t0={C.n13_3 + 0.1} t1={C.twist4 + 0.3} />
      {TOUR.map(([n, t0]) => <NameTag key={n} t={t} c={c} n={n} t0={t0 + 0.1} size={64} />)}
      {REST.map((n, i) => <NameTag key={n} t={t} c={c} n={n} t0={C.n13_3 + 0.35 + i * 0.07} size={52} />)}
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
      <At t0={C.cricket4 - 0.1} t1={DURATION + 1} x={540} y={400} w={700} h={320}><W12GlowLabel text="Cricket वाली West Indies" color="#C84A72" arrow={false} size={54} /></At>
      {Object.entries(NOT_CRICKET).map(([n, t0]) => {
        const [x, y] = S(n);
        return <At key={n} t0={t0} t1={DURATION + 1} x={x} y={y} w={400} h={400} scale={n === 'Cuba' ? 0.75 : 0.6}><W02CrossStamp seed={n.slice(0, 3)} /></At>;
      })}
    </AbsoluteFill>
  );
};
const DURATION = 29.5;
export { easeOut, linear, project };
