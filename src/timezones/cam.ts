import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from './anim';
import raw from './geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres. */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export type Zone = { zone: number; rings: P[][] };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; borders: P[][]; countries: Record<string, P[][]>; states: Record<string, P[][]>; zones: Zone[]; china_zone: P[][]; india_split: { west: P[][]; east: P[][] };
  places: Record<string, P>; places_deg: Record<string, P>; france_zones: { name: string; at: P; zone: number }[];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The scenes: the map, and the Assam tea-garden cutaway. */
export const SC = {
  greenwich: C.london2 - 0.3, offsets: C.poorab3 - 0.2, india: C.india3 - 0.2, whatif: C.socho4 - 0.2, mirzapur: C.ist5 - 0.1,
  borders: C.jhamela7 - 0.1, france: C.sabse8 - 0.2, china: C.ulta9 - 0.25, india2: C.india10 - 0.25, assam: C.assam11 - 0.2,
  garden: C.bagan11 + 0.35, gardenEnd: C.n1_11 + 1.4, nepal: C.nepal12 - 0.25, close: C.batao13 - 0.2,
};
export type Scene = 'map' | 'garden';
export const sceneAt = (t: number): Scene => (t >= SC.garden && t < SC.gardenEnd ? 'garden' : 'map');

/** Null's moment: the close (the Nepal punchline and the question), about 9.5 s. `from` is the clip time at t0. */
export const NULL_WIN = () => [{ name: 'A', t0: C.n15_12 - 1.0, t1: DURATION_S, from: 0.2 }];

const ll = merc;
export const PL = {
  world: ll(12, 12), asia: ll(84, 26), cluster2: ll(4, 36), greenwich: GEO.places.greenwich, east: ll(112, 18), west: ll(-88, 18),
  india: ll(81, 22), mirzapurMid: ll(82.5, 25.4), mirzapur: ll(82.532, 25.152), russia: ll(82, 60), usa: ll(-98, 40), france: ll(2.6, 46.6),
  china: ll(103, 35), kashgar: GEO.places.kashgar, arunachal: ll(94.6, 27.9), gujarat: ll(71, 23), assam: ll(93, 26.4), nepal: ll(84.1, 28.3),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: the whole world as one sheet on the blue backdrop, the 24 bands sweep in; then the two messy clusters
  { t: 0, at: ll(80, 24), span: 1.5e7, rot: -2 },
  { t: C.naksha1 + 0.2, at: ll(70, 22), span: 2.2e7, rot: -2, e: inOut },
  { t: C.n24_1 + 0.25, at: ll(12, 16), span: 7.4e7, rot: -1, e: inOut },
  { t: C.seedhi1 - 0.9, at: ll(12, 16), span: 7.1e7, rot: 0, e: linear },
  { t: C.seedhi1 - 0.15, at: PL.asia, span: 1.7e7, rot: 2, e: inOut },
  { t: C.kyon1 - 0.15, at: PL.asia, span: 1.55e7, rot: 1, e: linear },
  { t: C.kyon1 + 0.25, at: PL.cluster2, span: 1.5e7, rot: -2, e: inOut },
  { t: C.ghadi1 - 0.1, at: off(PL.cluster2, 0, 0), span: 1.4e7, rot: -1, e: linear },
  { t: C.subah1 + 0.1, at: ll(85, 22), span: 3.4e7, rot: 0, e: inOut },
  { t: SC.greenwich, at: ll(85, 22), span: 3.2e7, rot: 0, e: linear },
  // Greenwich: a whip to London, the red meridian draws down, then the band and UTC
  { t: SC.greenwich + 0.01, at: off(PL.greenwich, 2e5, -1e5), span: 2.6e6, rot: 2, cut: true },
  { t: C.greenwich2 + 0.35, at: PL.greenwich, span: 1.3e6, rot: 0, e: easeOut },
  { t: C.yahin2 + 0.2, at: off(PL.greenwich, 0, -2.5e6), span: 1.25e7, rot: 0, e: inOut },
  { t: C.utc2 + 0.9, at: ll(0, 18), span: 2.8e7, rot: 0, e: inOut },
  { t: SC.offsets, at: ll(0, 18), span: 2.9e7, rot: 0, e: linear },
  // offsets: pan east as +1 … +12 pop in, then west for −1 … −12; then the punch onto India
  { t: C.p3_3 + 0.7, at: PL.east, span: 3.6e7, rot: 0, e: inOut },
  { t: C.paschim3 + 0.05, at: off(PL.east, 0, 0), span: 3.55e7, rot: 0, e: linear },
  { t: C.m2_3 + 0.5, at: PL.west, span: 3.6e7, rot: 0, e: inOut },
  { t: SC.india, at: off(PL.west, 0, 0), span: 3.55e7, rot: 0, e: linear },
  { t: SC.india + 0.01, at: off(PL.india, 0, 8e5), span: 8.0e6, rot: -2, cut: true },
  { t: C.ist3 + 0.2, at: PL.india, span: 6.4e6, rot: 0, e: easeOut },
  { t: SC.whatif, at: PL.india, span: 6.0e6, rot: 0, e: linear },
  // what if the zones were straight lines?
  { t: C.socho4 + 0.7, at: PL.world, span: 6.4e7, rot: 0, e: inOut },
  { t: SC.mirzapur, at: PL.world, span: 6.1e7, rot: 0, e: linear },
  // Mirzapur: down through India onto the town, with the IST line through it
  { t: C.ist5 + 0.8, at: PL.india, span: 7.2e6, rot: 0, e: inOut },
  { t: C.mirzapur5 + 0.2, at: PL.mirzapurMid, span: 1.6e6, rot: 0, e: inOut },
  { t: C.seedhi5 + 0.1, at: off(PL.mirzapur, 1e3, 4e3), span: 1.4e5, rot: 0, e: inOut },
  { t: C.mirzapur5b + 0.3, at: PL.mirzapur, span: 2.8e4, rot: 0, e: inOut },
  { t: C.six6 + 0.9, at: PL.mirzapur, span: 2.5e4, rot: 0, e: linear },
  // the fix: the lines bend to the borders (a long pull back out)
  { t: C.jhamela7 + 1.1, at: PL.world, span: 6.0e7, rot: 0, e: inOut },
  { t: SC.france, at: PL.world, span: 5.6e7, rot: 0, e: linear },
  // France: Russia ✕, America ✕, the punch onto France, then its territories round the world
  { t: C.russia8 - 0.1, at: PL.russia, span: 3.0e7, rot: 0, e: inOut },
  { t: C.america8 - 0.25, at: off(PL.russia, 0, 0), span: 2.9e7, rot: 0, e: linear },
  { t: C.america8 + 0.25, at: PL.usa, span: 2.8e7, rot: 0, e: inOut },
  { t: C.france8 - 0.2, at: off(PL.usa, 0, 0), span: 2.75e7, rot: 0, e: linear },
  { t: C.france8 + 0.35, at: PL.france, span: 3.4e6, rot: 0, e: inOut },
  { t: C.dweep8 - 0.2, at: off(PL.france, 0, 0), span: 3.1e6, rot: 0, e: linear },
  { t: C.dweep8 + 0.7, at: ll(0, 2), span: 7.4e7, rot: 0, e: inOut },
  { t: SC.china, at: ll(0, 2), span: 7.0e7, rot: 0, e: linear },
  // China: five zones squeezed into one, then Kashgar in the dark
  { t: C.china9 + 0.3, at: PL.china, span: 1.1e7, rot: 0, e: inOut },
  { t: C.n5_9 + 0.35, at: off(PL.china, 0, 3e5), span: 1.6e7, rot: 0, e: inOut },
  { t: C.beijing9 - 0.1, at: off(PL.china, 0, 3e5), span: 1.5e7, rot: 0, e: linear },
  { t: C.natija9, at: PL.china, span: 1.1e7, rot: 0, e: inOut },
  { t: C.kashgar9 + 0.2, at: off(PL.kashgar, 0, 0), span: 3.0e6, rot: 0, e: inOut },
  { t: C.sardi9 + 0.5, at: PL.kashgar, span: 1.9e5, rot: 0, e: inOut },
  { t: SC.india2, at: PL.kashgar, span: 1.7e5, rot: 0, e: linear },
  // India: one clock for ~3,000 km; Arunachal's 4 AM sun, Gujarat still dark
  { t: SC.india2 + 0.01, at: off(PL.india, 0, 6e5), span: 8.0e6, rot: 2, cut: true },
  { t: C.ghadi10 + 0.3, at: PL.india, span: 6.8e6, rot: 0, e: easeOut },
  { t: C.arunachal10 + 0.2, at: PL.arunachal, span: 2.6e6, rot: 0, e: inOut },
  { t: C.gujarat10 - 0.3, at: off(PL.arunachal, 0, 0), span: 2.45e6, rot: 0, e: linear },
  { t: C.gujarat10 + 0.4, at: PL.gujarat, span: 2.6e6, rot: 0, e: inOut },
  { t: SC.assam, at: PL.gujarat, span: 2.45e6, rot: 0, e: linear },
  // Assam (then the tea-garden cutaway covers the map)
  { t: SC.assam + 0.01, at: off(PL.assam, -2e5, 0), span: 2.4e6, rot: -2, cut: true },
  { t: C.bagan11 + 0.3, at: PL.assam, span: 1.7e6, rot: 0, e: easeOut },
  { t: SC.gardenEnd, at: PL.assam, span: 1.5e6, rot: 0, e: linear },
  // Nepal's 15 minutes
  { t: SC.nepal + 0.01, at: off(PL.nepal, 1.5e5, 0), span: 2.0e6, rot: 2, cut: true },
  { t: C.n15_12 + 0.2, at: PL.nepal, span: 1.6e6, rot: 0, e: easeOut },
  { t: SC.close, at: PL.nepal, span: 1.5e6, rot: 0, e: linear },
  // the close: India, two halves, the question
  { t: C.batao13 + 0.6, at: PL.india, span: 7.4e6, rot: 0, e: inOut },
  { t: DURATION_S, at: PL.india, span: 6.8e6, rot: 0, e: linear },
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
export const HITS = () => [C.n24_1, C.seedhi1, C.greenwich2, C.utc2, C.ist3, C.kat5, C.mod7, C.france8, C.n12_8, C.beijing9, C.n10_9, C.n4_10, C.n15_12, C.n2_13];

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
  // the camera never stops: a slow breathe plus a drift and a gentle roll
  const breathe = (1 + 0.035 * Math.sin(t * 0.9) + 0.015 * Math.sin(t * 2.2 + 1.3)) * (1 - punch);
  const drift = span * 0.012;
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
  for (const [t0, a] of [[C.kat5, 14], [C.russia8 + 0.35, 8], [C.america8 + 0.6, 8], [C.ghadi9 + 0.4, 7], [C.n15_12, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Longitude of a Mercator x (for the zone bands). */
export const lonOf = (x: number) => (x / R) * (180 / Math.PI);
export const xOfLon = (lon: number) => R * ((lon * Math.PI) / 180);

export { easeIn, easeOut, inOut, linear };
