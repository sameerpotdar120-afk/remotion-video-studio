import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from './anim';
import raw from './geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres (longitudes past 180 stay unwrapped, for the Pacific). */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; deg: Record<string, P[][]>; groups: Record<string, string[]>;
  places: Record<string, P>; places_deg: Record<string, P>; spnfz: P[];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The big scene changes. */
export const SC = {
  globeIn: C.kyon2 - 0.05, // flat map → globe
  dive: C.dakshin3 + 0.95, // into the globe at Fiji
  flat: C.dakshin3 + 1.75, // flat Fiji map
  iceland: C.teesra6 + 0.05, // long whip north
  close: C.chautha8 - 0.15, // the world, for the teaser
};

/** Null's moments: the Iceland "क्यों?" (middle) and the close, each in a split screen. `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'A', t0: C.uttar6 - 0.1, t1: C.army7 - 0.25, from: 3.0 },
  { name: 'B', t0: C.chautha8 - 0.3, t1: C.chautha8 + 1.5, from: 0.2 },
  { name: 'B', t0: C.pehchana9 - 0.2, t1: DURATION_S, from: 4.8 },
];

const ll = merc;
export const PL = {
  usa: ll(-96, 39), atl: ll(-40, 46), europe: ll(14, 50),
  fiji: ll(178.1, -17.75), brisbane: ll(153.03, -27.47), pacific: ll(178, -22), between: ll(162, -24),
  nz: ll(172.8, -41.2), oceania: ll(160, -30), iceland: ll(-18.7, 64.95), world: ll(40, 28),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: over North America, panning to Europe while the missiles fly
  { t: 0, at: off(PL.usa, 0, -3e5), span: 8.0e6, rot: -3 },
  { t: C.america1 + 0.3, at: off(PL.usa, 1.6e6, 0), span: 7.0e6, rot: -1, e: inOut },
  { t: C.europe1 + 0.4, at: PL.europe, span: 5.2e6, rot: 1, e: inOut },
  { t: SC.globeIn + 0.6, at: PL.europe, span: 6.5e6, rot: 0, e: easeIn },
  // after the dive: Fiji
  { t: SC.flat, at: off(PL.fiji, 2.5e5, 1.5e5), span: 1.6e6, rot: -4, cut: true },
  { t: C.fiji4 + 0.6, at: PL.fiji, span: 6.4e5, rot: 0, e: easeOut },
  { t: C.pacific4 + 0.3, at: PL.fiji, span: 1.5e6, rot: 1, e: inOut },
  { t: C.aus4 - 0.2, at: off(PL.fiji, 0, 0), span: 1.35e6, rot: 0, e: linear },
  // the dashed line to Australia: pull back and pan west
  { t: C.n2700 + 0.2, at: PL.between, span: 7.6e6, rot: -1, e: inOut },
  { t: C.akela4 - 0.2, at: off(PL.between, 0, 1e5), span: 7.2e6, rot: 0, e: linear },
  // alone in the ocean: way out
  { t: C.nishane4 + 0.2, at: PL.pacific, span: 1.25e7, rot: 0, e: inOut },
  { t: C.ilaka4 - 0.3, at: PL.pacific, span: 1.15e7, rot: 1, e: linear },
  // the nuclear-free zone
  { t: C.sandhi4 + 0.3, at: ll(175, -28), span: 1.9e7, rot: 0, e: inOut },
  { t: C.nz5 - 0.25, at: ll(175, -28), span: 1.8e7, rot: 0, e: linear },
  // New Zealand
  { t: C.nz5 + 0.5, at: PL.nz, span: 2.6e6, rot: -2, e: inOut },
  { t: C.y2023 - 0.3, at: off(PL.nz, 0, 0), span: 2.2e6, rot: 0, e: linear },
  // nuclear winter: the region greys out, New Zealand stays green
  { t: C.sardi5 + 0.3, at: PL.oceania, span: 1.0e7, rot: 0, e: inOut },
  { t: C.nz5b + 0.2, at: off(PL.oceania, 0, 0), span: 9.0e6, rot: 1, e: linear },
  { t: C.uga5 + 0.4, at: PL.nz, span: 3.0e6, rot: 0, e: inOut },
  { t: SC.iceland, at: PL.nz, span: 2.8e6, rot: 0, e: linear },
  // Iceland, after the whip north
  { t: SC.iceland + 0.01, at: off(PL.iceland, -3e5, -6e5), span: 2.4e6, rot: 4, cut: true },
  { t: C.iceland6 + 0.4, at: PL.iceland, span: 9.5e5, rot: 0, e: easeOut },
  { t: C.uttar6 - 0.1, at: off(PL.iceland, 0, 0), span: 8.5e5, rot: 0, e: linear },
  // "it's in the north": pull back to show how far north
  { t: C.list6 + 0.4, at: ll(-10, 60), span: 8.0e6, rot: -1, e: inOut },
  { t: C.army7 - 0.2, at: ll(-10, 60), span: 7.6e6, rot: 0, e: linear },
  { t: C.army7 + 0.3, at: PL.iceland, span: 1.2e6, rot: 1, e: inOut },
  { t: SC.close, at: off(PL.iceland, 0, 0), span: 1.0e6, rot: 0, e: linear },
  // the teaser: the world, flickering
  { t: SC.close + 0.01, at: off(PL.world, 0, 8e5), span: 1.6e7, rot: -2, cut: true },
  { t: DURATION_S, at: PL.world, span: 1.35e7, rot: 0, e: linear },
];

type Full = Cam & { t: number; e: Ease; cut: boolean };
const FULL: Full[] = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], span: k.span, rot: k.rot ?? 0, e: k.e ?? linear, cut: !!k.cut }));
/** Segment boundaries: smoothing never reaches across a cut. */
const CUTS = FULL.filter((k) => k.cut).map((k) => k.t);
const segOf = (t: number) => {
  let a = 0, b = DURATION_S;
  for (const c of CUTS) { if (c <= t) a = c; else { b = Math.min(b, c - 1e-3); break; } }
  return [a, b] as const;
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      if (b.cut) return FULL[i - 1];
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const span = Math.exp(lerp(Math.log(a.span), Math.log(b.span), p));
      let q = p;
      if (Math.abs(Math.log(b.span / a.span)) > 1.0) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};

/** Zoom punches on the big hits. */
export const HITS = () => [C.america1, C.europe1, C.fiji4, C.n2700, C.zone4, C.y1987, C.iceland6, C.army7, C.n19, C.n90];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  const [a, b] = segOf(t);
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(Math.min(b, Math.max(a, t + SMOOTH[i])));
    x += k.x * W8[i]; y += k.y * W8[i]; ls += Math.log(k.span) * W8[i]; rot += k.rot * W8[i];
  }
  const span = Math.exp(ls);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.06 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.035 * Math.sin(t * 0.9) + 0.015 * Math.sin(t * 2.2 + 1.3)) * (1 - punch);
  const drift = span * 0.01;
  return { x: x + Math.sin(t * 1.3) * drift, y: y + Math.cos(t * 1.1) * drift, span: span * breathe, rot: rot + Math.sin(t * 0.6) * 1.2 + Math.sin(t * 1.7) * 0.35 };
};

export const pxPerM = (k: Cam) => 1920 / k.span;
export const project = (k: Cam, x: number, y: number): P => {
  const s = pxPerM(k);
  return [PLANE.ox + (x - k.x) * s, PLANE.oy + (k.y - y) * s];
};
export const toScreen = (k: Cam, at: P): P => {
  const [px, py] = project(k, at[0], at[1]);
  const x = px - PLANE.ox, y = py - PLANE.oy;
  const r = (k.rot * Math.PI) / 180;
  return [540 + x * Math.cos(r) - y * Math.sin(r), 960 + x * Math.sin(r) + y * Math.cos(r)];
};
export const camMotion = (t: number) => {
  const [a0, b0] = segOf(t);
  const tb = Math.min(b0, t + 1 / 30), ta = Math.max(a0, tb - 1 / 30);
  const a = camAt(ta), b = camAt(tb);
  const s = pxPerM(a);
  return { vx: (a.x - b.x) * s, vy: (b.y - a.y) * s, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.america1 + 0.05, 10], [C.europe1 + 0.6, 12], [C.khatra2, 14], [C.zone4, 6], [C.army7, 7]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
