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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; chile_main: P[][]; chile_deg: P[]; chile_1818: P[][];
  bolivia_coast: P[][]; peru_south: P[][]; portugal: P[][]; spain: P[][]; mapuche: P[][]; places: Record<string, P>; places_deg: Record<string, P>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The scenes: satellite, vintage paper map, the beach skit, the Andes wall, Lake Titicaca. */
export const SC = {
  india: C.india2 - 0.05, back: C.kaise4 - 0.75, vintage: C.y1500 - 0.1, skit: C.wah7 - 0.25, skitEnd: C.khali9 + 0.5,
  lens: C.shuru11 + 0.6, valley: C.chalo12 - 0.1, wall: C.accha13 - 0.1, squeeze: C.kyunki14 - 0.1, lake: C.bolivia19 - 0.6, close: C.bhejo20 - 1.0,
};
export type Scene = 'sat' | 'vintage' | 'skit' | 'wall' | 'lake';
export const sceneAt = (t: number): Scene => {
  if (t < SC.vintage) return 'sat';
  if (t < SC.skit) return 'vintage';
  if (t < SC.skitEnd) return 'skit';
  if (t < SC.valley) return 'vintage';
  if (t < SC.wall) return 'sat';
  if (t < SC.squeeze) return 'wall';
  if (t < SC.lake) return 'sat';
  if (t < SC.close) return 'lake';
  return 'sat';
};

/** Null's moments: after the skit (facepalm) and the close (send). `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'A', t0: C.khali9 + 0.6, t1: C.jeet10 + 0.2, from: 0.3 },
  { name: 'B', t0: C.bhejo20 - 1.1, t1: DURATION_S, from: 0.2 },
];

const ll = merc;
const pl = GEO.places;
export const PL = {
  world: ll(-40, 5), sa: ll(-62, -22), chile: ll(-69, -33), india: ll(79, 17), mid: ll(78.5, 17.5), delhi: ll(77.6, 27.9),
  vint: ll(-60, -20), cl: ll(-71.0, -32.5), valley: ll(-70.9, -33.4), north: ll(-67, -20), bolivia: ll(-65, -18), lake: ll(-69.35, -15.95),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: the world as a sheet of paper, a dive onto South America and the chili
  { t: 0, at: PL.world, span: 2.4e7, rot: 0 },
  { t: 0.9, at: PL.sa, span: 9.0e6, rot: -2, e: easeOut },
  { t: C.chile1 - 0.2, at: off(PL.chile, 0, 4e5), span: 7.4e6, rot: 0, e: inOut },
  // "इतना लंबा": the map rolls so Chile runs on the diagonal
  { t: C.lamba2 + 0.3, at: PL.chile, span: 7.6e6, rot: -24, e: inOut },
  { t: SC.india, at: off(PL.chile, 0, 0), span: 7.8e6, rot: -26, e: linear },
  // over India: Kashmir to Kanyakumari, and the 1,000 km that sticks out
  { t: SC.india + 0.01, at: off(PL.india, -6e5, 4e5), span: 7.6e6, rot: 6, cut: true },
  { t: C.kashmir2, at: PL.india, span: 6.6e6, rot: 0, e: easeOut },
  { t: C.bach2 + 0.4, at: off(PL.india, 0, -6e5), span: 7.2e6, rot: 0, e: inOut },
  // the width: zoom to the middle, then Delhi–Agra
  { t: C.n180 - 0.1, at: PL.mid, span: 2.2e6, rot: 2, e: inOut },
  { t: C.delhi3 - 0.3, at: PL.delhi, span: 1.25e6, rot: 0, e: inOut },
  { t: SC.back, at: off(PL.delhi, 0, 0), span: 1.15e6, rot: 0, e: linear },
  // back to South America: "how did it get this shape?"
  { t: SC.back + 0.01, at: off(PL.sa, 5e5, 3e5), span: 1.05e7, rot: -4, cut: true },
  { t: SC.vintage, at: PL.sa, span: 9.5e6, rot: 0, e: easeOut },
  // the vintage map: 1500, the peoples, the Spanish arrive
  { t: SC.vintage + 0.01, at: PL.vint, span: 1.25e7, rot: 0, cut: true },
  { t: C.baat6 + 0.6, at: PL.vint, span: 1.15e7, rot: 0, e: linear },
  { t: SC.skit, at: PL.vint, span: 1.12e7, rot: 0, e: linear },
  // after the skit: Spain and the Mapuche, independence, then down onto early Chile
  { t: SC.skitEnd + 0.01, at: off(PL.vint, 0, -1e6), span: 1.1e7, rot: 0, cut: true },
  { t: C.y1818, at: off(PL.vint, 0, -8e5), span: 1.0e7, rot: 0, e: linear },
  { t: C.itna11, at: PL.cl, span: 3.2e6, rot: 0, e: inOut },
  { t: SC.valley, at: PL.cl, span: 2.6e6, rot: 0, e: linear },
  // the valley (satellite): the flag sets off east
  { t: SC.valley + 0.01, at: off(PL.valley, -4e4, 0), span: 4.4e5, rot: 0, cut: true },
  { t: SC.wall, at: off(PL.valley, 3e4, 0), span: 4.0e5, rot: 0, e: linear },
  // squeezed between the ocean and the Andes; wider no, longer yes
  { t: SC.squeeze + 0.01, at: off(PL.chile, 0, 2e6), span: 3.2e6, rot: 0, cut: true },
  { t: C.pacific14 - 0.2, at: off(PL.sa, -2e5, 0), span: 9.5e6, rot: 0, e: inOut },
  { t: C.parvat14 + 0.3, at: off(PL.sa, -2e5, 0), span: 9.0e6, rot: 0, e: linear },
  { t: C.chaude15 + 0.1, at: off(PL.chile, 0, 0), span: 4.2e6, rot: 0, e: inOut },
  { t: C.chile15 - 0.1, at: off(PL.chile, 0, 0), span: 4.0e6, rot: 0, e: linear },
  { t: C.neeche15 + 0.6, at: ll(-69, -42), span: 8.0e6, rot: 0, e: inOut },
  { t: C.chor15 + 0.5, at: ll(-69, -46), span: 7.0e6, rot: 0, e: linear },
  // the war in the north; Bolivia loses its coast
  { t: C.uttar16 + 0.4, at: PL.north, span: 5.0e6, rot: 0, e: inOut },
  { t: C.hissa17 + 0.2, at: off(PL.north, 0, 0), span: 4.6e6, rot: 0, e: linear },
  { t: C.bhai18, at: PL.bolivia, span: 4.0e6, rot: 0, e: inOut },
  { t: SC.lake, at: off(PL.bolivia, 0, 0), span: 3.8e6, rot: 0, e: linear },
  // Lake Titicaca: Bolivia's navy
  { t: SC.lake + 0.01, at: off(PL.lake, 0, 3e4), span: 3.2e5, rot: 0, cut: true },
  { t: SC.close, at: PL.lake, span: 2.7e5, rot: 0, e: linear },
  // the close: the chili comes back
  { t: SC.close + 0.01, at: PL.sa, span: 9.0e6, rot: 0, cut: true },
  { t: DURATION_S, at: off(PL.chile, 0, 0), span: 7.6e6, rot: 0, e: linear },
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
export const HITS = () => [C.chile1, C.n1000, C.n180, C.y1818, C.pacific14, C.andes14, C.y1879, C.kinara17, C.samandar18];

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
  for (const [t0, a] of [[C.accha13, 9], [C.chaude15 + 0.3, 7], [C.y1879, 8], [C.kinara17, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
