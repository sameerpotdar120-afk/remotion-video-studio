import React from 'react';
import { clamp01, easeOut, inOut, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, DURATION_S, GEO, P, PLANE, project } from './cam';

export const COL = { gold: '#FFD84A', green: '#7CE38B', cyan: '#7FE3FF', white: '#FFF6E6', route: '#FFF1D6' };

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');

/** A country lit up: soft warm tint and a glowing outline. */
const Lit: React.FC<{ c: Cam; rings: P[][]; a: number; color: string }> = ({ c, rings, a, color }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, rings);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill={color} fillOpacity={0.22} />
      <path d={d} fill="none" stroke={color} strokeWidth={10} strokeOpacity={0.35} strokeLinejoin="round" style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5} strokeOpacity={0.9} strokeLinejoin="round" />
    </svg>
  );
};

/** A pulsing glow marker on a place (the route's start/end). */
const Glow: React.FC<{ c: Cam; at: P; a: number; color: string; r?: number; t: number }> = ({ c, at, a, color, r = 120, t }) => {
  if (a <= 0.001) return null;
  const [x, y] = project(c, at[0], at[1]);
  const pulse = 1 + Math.sin(t * 3) * 0.08;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <radialGradient id={`g${Math.round(at[0])}`}>
          <stop offset="0" stopColor={color} stopOpacity={0.75} />
          <stop offset="0.45" stopColor={color} stopOpacity={0.28} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 2.2 * pulse} fill={`url(#g${Math.round(at[0])})`} />
      <circle cx={x} cy={y} r={12} fill="#fff" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      <circle cx={x} cy={y} r={34 * pulse} fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.8} />
    </svg>
  );
};

/** A curved trade route from A to B, drawn on over [t0, t1] with a glowing head; it can pulse later (flow toward B). */
type Route = { from: string; to: string; t0: number; t1: number; bend?: number; color?: string };
const arc = (c: Cam, r: Route) => {
  const [x0, y0] = project(c, ...GEO.places[r.from]);
  const [x1, y1] = project(c, ...GEO.places[r.to]);
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0;
  const k = r.bend ?? 0.28;
  const cx = mx - dy * k, cy = my + dx * k;
  return { d: `M${x0.toFixed(1)},${y0.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`, p: (u: number): P => [
    (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1] };
};

const RouteLine: React.FC<{ c: Cam; r: Route; t: number; a: number; flow?: number }> = ({ c, r, t, a, flow = 0 }) => {
  const p = ramp(t, r.t0, r.t1, inOut);
  if (a <= 0.001 || p <= 0) return null;
  const { d, p: at } = arc(c, r);
  const head = at(p);
  const col = r.color ?? COL.route;
  const dash = flow > 0 ? `${0.05} ${0.07}` : undefined;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill="none" stroke={col} strokeWidth={22} strokeOpacity={0.25} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: 'blur(8px)' }} />
      <path d={d} fill="none" stroke={col} strokeWidth={6.5} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
      {flow > 0 && (
        <path d={d} fill="none" stroke={COL.gold} strokeWidth={7} pathLength={1} strokeDasharray={dash} strokeDashoffset={-((t * 0.5) % 0.12)} strokeLinecap="round" opacity={flow} />
      )}
      {p < 1 && (
        <>
          <circle cx={head[0]} cy={head[1]} r={26} fill={COL.gold} opacity={0.35} style={{ filter: 'blur(8px)' }} />
          <circle cx={head[0]} cy={head[1]} r={10} fill="#fff" style={{ filter: `drop-shadow(0 0 10px ${COL.gold})` }} />
        </>
      )}
    </svg>
  );
};

/** All routes of the story, in order. */
export const ROUTES: Record<string, Route> = {
  inPe: { from: 'gujarat', to: 'persia', t0: C.persia5 - 0.7, t1: C.persia5 + 0.3, bend: 0.22 },
  peAr: { from: 'persia', to: 'arabia', t0: C.arab5 - 0.6, t1: C.arab5 + 0.2, bend: 0.3 },
  arIt: { from: 'arabia', to: 'italy', t0: C.europe6 - 0.2, t1: C.italy6 + 0.3, bend: -0.25 },
  itFr: { from: 'italy', to: 'france', t0: C.france6 - 0.5, t1: C.france6 + 0.1, bend: 0.3 },
  frEn: { from: 'france', to: 'england', t0: C.england6 - 0.5, t1: C.england6 + 0.1, bend: -0.3 },
  enIn: { from: 'england', to: 'india_c', t0: C.yani7 - 0.1, t1: C.yani7 + 0.7, bend: 0.2, color: COL.gold },
  inPe2: { from: 'gujarat', to: 'persia', t0: C.persia9 - 0.5, t1: C.persia9 + 0.4, bend: 0.22, color: COL.green },
  peEn: { from: 'persia', to: 'england', t0: C.angrez10 - 0.2, t1: C.candy + 0.1, bend: 0.22, color: COL.green },
  egIn: { from: 'egypt', to: 'gujarat', t0: C.arab11 - 0.2, t1: C.bharat11 + 0.5, bend: 0.25, color: COL.cyan },
  chIn: { from: 'canton', to: 'bengal', t0: C.china12 + 0.1, t1: C.safed12 + 0.3, bend: -0.3, color: COL.white },
};

// which section each route belongs to (it stays visible, dimmer, until its section ends); the finale shows them all
const SECTIONS: [string[], number, number][] = [
  [['inPe', 'peAr', 'arIt', 'itFr', 'frEn'], C.persia5 - 0.8, C.yani7 + 1.2],
  [['enIn'], C.yani7 - 0.2, C.khand8 + 0.3],
  [['inPe2', 'peEn'], C.persia9 - 0.6, C.egypt11 + 0.2],
  [['egIn'], C.arab11 - 0.3, C.china12 + 0.4],
  [['chIn'], C.china12, C.nikli13],
];
export const finaleAt = (t: number) => window4(t, C.nikli13 - 0.6, C.nikli13 - 0.1, C.ghar14 - 0.2, C.ghar14 + 0.4);

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const fin = finaleAt(t);
  const indiaA = clamp01(window4(t, C.bharat2 - 0.3, C.bharat2, C.persia5 + 0.6, C.persia5 + 1.2) + window4(t, C.yani7, C.yani7 + 0.4, C.persia9, C.persia9 + 0.5)
    + window4(t, C.bharat11 - 0.2, C.bharat11 + 0.3, C.mishri11 + 0.6, C.mishri11 + 1.2) + window4(t, C.safed12, C.safed12 + 0.4, 998, 999));
  return (
    <>
      {/* countries light up as the word arrives */}
      <Lit c={c} rings={GEO.iran} color={COL.gold} a={window4(t, C.persia5 - 0.2, C.persia5 + 0.2, C.europe6, C.europe6 + 0.5) + window4(t, C.persia9 - 0.2, C.persia9 + 0.2, C.angrez10, C.angrez10 + 0.4)} />
      <Lit c={c} rings={GEO.saudi} color={COL.gold} a={window4(t, C.arab5 - 0.2, C.arab5 + 0.2, C.europe6 + 0.3, C.europe6 + 0.8)} />
      <Lit c={c} rings={GEO.italy} color={COL.gold} a={window4(t, C.italy6 - 0.1, C.italy6 + 0.2, C.yani7, C.yani7 + 0.4)} />
      <Lit c={c} rings={GEO.france} color={COL.gold} a={window4(t, C.france6 - 0.1, C.france6 + 0.2, C.yani7, C.yani7 + 0.4)} />
      <Lit c={c} rings={GEO.uk} color={COL.gold} a={window4(t, C.england6 - 0.1, C.england6 + 0.2, C.yani7, C.yani7 + 0.4) + window4(t, C.angrez10 + 0.2, C.candy, C.egypt11 - 0.2, C.egypt11 + 0.2)} />
      <Lit c={c} rings={GEO.egypt} color={COL.cyan} a={window4(t, -1, 0, C.jawab2, C.jawab2 + 0.4) + window4(t, C.egypt11 - 0.2, C.egypt11 + 0.2, C.china12, C.china12 + 0.4)} />
      {/* India and China: glow markers */}
      {/* India (official boundary) and China, lit with a marker at their heart */}
      <Lit c={c} rings={GEO.china} color="#ffffff" a={0.8 * (window4(t, -1, 0, C.jawab2, C.jawab2 + 0.4) + window4(t, C.china12 - 0.2, C.china12 + 0.2, C.nikli13 - 0.4, C.nikli13))} />
      <Glow c={c} at={GEO.places.china} color="#ffffff" r={110} t={t} a={window4(t, -1, 0, C.jawab2, C.jawab2 + 0.4) + window4(t, C.china12 - 0.2, C.china12 + 0.2, C.nikli13 - 0.4, C.nikli13)} />
      <Lit c={c} rings={GEO.india} color={COL.gold} a={indiaA} />
      <Glow c={c} at={GEO.places.india_c} color={COL.gold} r={120} t={t} a={indiaA} />
      {/* routes, section by section */}
      {SECTIONS.map(([ids, s0, s1]) => ids.map((id) => {
        const a = window4(t, s0, s0 + 0.2, s1 - 0.4, s1) * (fin > 0 ? 1 - fin : 1);
        const r = ROUTES[id];
        const dim = t > r.t1 + 1.2 ? 0.55 : 1;
        return <RouteLine key={id} c={c} r={r} t={t} a={a * dim} />;
      }))}
      {/* finale: every route at once, gold pulses flowing back home */}
      {fin > 0 && Object.entries(ROUTES).filter(([k]) => k !== 'enIn').map(([k, r]) => (
        <RouteLine key={`f${k}`} c={c} r={{ ...r, t0: C.nikli13 - 0.6 + Object.keys(ROUTES).indexOf(k) * 0.06, t1: C.nikli13 + 0.2 + Object.keys(ROUTES).indexOf(k) * 0.06 }} t={t} a={fin} flow={ramp(t, C.nikli13 + 0.3, C.ghar13, linear)} />
      ))}
    </>
  );
};

export const darkAt = (t: number) => ramp(t, C.ghar14 - 0.1, C.kya14, easeOut) * 0.55 + window4(t, -1, 0, C.jawab2 - 0.2, C.jawab2 + 0.4) * 0.35;
export { DURATION_S };
