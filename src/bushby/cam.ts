import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import { interpolateKeys } from './anim2';
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
export const GEO = raw as unknown as {
  plates: Record<string, Plate>;
  russia: P[][]; iran: P[][]; panama: P[][]; chile: P[][]; kazakhstan: P[][]; turkmenistan: P[][]; uk: P[][]; usa: P[][]; canada: P[][]; turkey: P[][];
  caspian: P[][]; route: P[]; route_ll: P[]; stage: Record<string, number>; places: Record<string, P>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const Pl = GEO.places;
export const PL = {
  punta: Pl.punta_arenas, sa: merc(-71, -30), colombia: merc(-76.5, 4), darien: merc(-77.5, 8.1), meteti: Pl.meteti,
  america: merc(-112, 38), strait: merc(-168.9, 65.9), uelen: Pl.uelen, siberia: merc(-212, 63), siberia2: merc(-238, 58), mongolia: merc(-262, 50),
  casia: merc(-293, 41.5), caspian: merc(-309.3, 41.9), turkey: merc(-328, 41), europe: merc(-345, 47), channel: merc(-358.45, 51.05), hull: Pl.hull,
  uk: merc(-359.6, 52.6),
};

/** The flat-map part runs from "Karl" to "28 साल" and again from "घर" to the end; the globe covers the rest. */
export const FLAT0 = C.karl4 - 0.35, FLAT1 = C.n28b - 0.1, FLAT2 = C.ghar14 - 0.4;

/** Camera keys on the flat map (unwrapped Mercator), all anchored to words of the voiceover. */
const keys = (): Key[] => [
  { t: 0, at: PL.punta, span: 2.2e6, rot: -2 },
  { t: C.karl4 + 0.2, at: PL.punta, span: 1.7e6, rot: -2, e: linear },
  { t: C.chhor4, at: PL.punta, span: 1.45e6, rot: 0, e: linear },
  // न गाड़ी… न Plane: the line races north up South America
  { t: C.gaadi4 + 0.3, at: PL.sa, span: 7.5e6, rot: 2, e: inOut },
  { t: C.imtihan5 - 0.1, at: PL.colombia, span: 4.2e6, rot: 0, e: inOut },
  // Darién Gap: dive into the jungle
  { t: C.darien5 + 0.5, at: PL.darien, span: 6.5e5, rot: -2, e: inOut },
  { t: C.maut6, at: PL.darien, span: 5.6e5, rot: 0, e: linear },
  { t: C.panama6 + 0.3, at: PL.meteti, span: 5e5, rot: 2, e: inOut },
  { t: C.jail6 + 0.6, at: PL.meteti, span: 4.6e5, rot: 1, e: linear },
  // north through the Americas to the Bering Strait
  { t: C.bering7 - 0.2, at: PL.america, span: 1.25e7, rot: -2, e: inOut },
  { t: C.jamne7, at: PL.strait, span: 1.5e6, rot: 0, e: inOut },
  { t: C.n14 + 0.3, at: PL.strait, span: 1.0e6, rot: -1, e: linear },
  { t: C.russia7 + 0.3, at: PL.uelen, span: 8e5, rot: 1, e: inOut },
  { t: C.giraftar7 + 0.6, at: PL.uelen, span: 7.2e5, rot: 0, e: linear },
  // Russia: 90-day visas, the ban, 11 years
  { t: C.russia8 + 0.4, at: PL.siberia, span: 8.5e6, rot: 2, e: inOut },
  { t: C.entry8 + 0.4, at: PL.siberia, span: 7.8e6, rot: 0, e: linear },
  { t: C.siberia9 + 0.3, at: PL.siberia2, span: 8.2e6, rot: -2, e: inOut },
  { t: C.n11 + 0.6, at: PL.mongolia, span: 7.2e6, rot: 0, e: inOut },
  // the pandemic in Central Asia
  { t: C.pandemic10 + 0.2, at: PL.casia, span: 4.2e6, rot: 1, e: inOut },
  { t: C.sarhad10 + 0.6, at: PL.casia, span: 3.8e6, rot: 0, e: linear },
  // the Caspian Sea
  { t: C.caspian11 + 0.3, at: PL.caspian, span: 2.0e6, rot: -1, e: inOut },
  { t: C.band11 + 0.4, at: PL.caspian, span: 1.8e6, rot: 0, e: linear },
  { t: C.kood12 + 0.2, at: PL.caspian, span: 1.45e6, rot: 2, e: inOut },
  { t: C.naav12 + 0.4, at: PL.caspian, span: 1.35e6, rot: 0, e: linear },
  // Turkey, Europe, the English Channel
  { t: C.turkey13 + 0.2, at: PL.turkey, span: 4.2e6, rot: -2, e: inOut },
  { t: C.europe13 + 0.3, at: PL.europe, span: 4.4e6, rot: 0, e: inOut },
  { t: C.channel13, at: PL.channel, span: 6.5e5, rot: 1, e: inOut },
  { t: C.england13 + 0.6, at: PL.channel, span: 5.8e5, rot: 0, e: linear },
  // (the globe takes over for "28 साल, 50,000 KM"), then home
  { t: FLAT2, at: PL.uk, span: 1.6e6, rot: -1, e: linear },
  { t: C.sau14 + 0.3, at: PL.hull, span: 6.5e5, rot: 0, e: inOut },
  { t: DURATION_S, at: PL.hull, span: 5.6e5, rot: 1, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of keys()) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({ t: k.t, x: at[0] + (k.dx ?? 0), y: at[1] + (k.dy ?? 0), span: k.span ?? prev.span, rot: k.rot ?? prev?.rot ?? 0, e: k.e ?? linear });
}
const clamp = (x: number) => Math.min(1, Math.max(0, x));

const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const span = Math.exp(lerp(Math.log(a.span), Math.log(b.span), p));
      let q = p;
      // big zooms pan in screen space, so the target doesn't race across the frame
      if (Math.abs(Math.log(b.span / a.span)) > 1.0) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};

// ---------------------------------------------------------------- where Karl is on the route
const S = GEO.stage;
/** How far along the route (fractional point index) Karl is at time t. */
export const ROUTE_KEYS: [number, number][] = [
  [C.karl4 - 0.4, 0], [C.gaadi4, 0.2], [C.imtihan5 - 0.1, S.darien - 1], [C.darien5 + 0.3, S.darien], [C.maut6 + 0.4, S.darien + 1], [C.panama6 + 0.2, S.panama],
  [C.jail6 + 0.8, S.panama], [C.bering7 - 0.2, S.alaska - 3], [C.jamne7, S.strait], [C.n14 + 0.2, S.strait + 0.15], [C.russia7 + 0.2, S.russia],
  [C.giraftar7 + 0.8, S.russia], [C.russia8 + 0.6, S.russia + 1], [C.ban9, S.russia + 2], [C.siberia9 + 0.4, S.russia + 3], [C.n11 + 0.8, S.asia],
  [C.pandemic10 + 0.3, S.stall - 1], [C.sarhad10 + 0.3, S.stall], [C.caspian11 + 0.3, S.caspian], [C.kood12 + 0.1, S.caspian], [C.naav12, S.baku],
  [C.turkey13 + 0.2, S.europe - 2], [C.europe13 + 0.4, S.europe + 2], [C.october13 + 0.3, S.channel - 1], [C.channel13 + 0.2, S.channel],
  [C.england13 + 0.3, S.dover], [C.ghar14, S.dover + 1], [C.sau14 + 0.4, S.home],
];
export const routeAt = (t: number) => interpolateKeys(ROUTE_KEYS, t);
export const pointAt = (k: number): P => {
  const i = Math.max(0, Math.min(GEO.route.length - 2, Math.floor(k)));
  const f = Math.min(1, Math.max(0, k - i));
  const a = GEO.route[i], b = GEO.route[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
};

/** Keyed path smoothed with a short centred window: continuous velocity through every key. */
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += c.x * W8[i]; y += c.y * W8[i]; ls += Math.log(c.span) * W8[i]; rot += c.rot * W8[i];
  }
  // the camera never rests: it leans toward the head of the route (so the map slides as the line draws),
  // breathes in and out, tilts, and carries a little hand-held drift
  const [hx, hy] = pointAt(routeAt(t));
  const span = Math.exp(ls);
  const w = 0.32;
  const breathe = 1 + 0.045 * Math.sin(t * 0.85) + 0.02 * Math.sin(t * 2.1 + 1.3);
  const drift = span * 0.012;
  return {
    x: lerp(x, hx, w) + Math.sin(t * 1.3) * drift, y: lerp(y, hy, w) + Math.cos(t * 1.1) * drift,
    span: span * breathe, rot: rot + Math.sin(t * 0.55) * 1.4 + Math.sin(t * 1.7) * 0.4,
  };
};

export const pxPerM = (c: Cam) => 1920 / c.span;
export const project = (c: Cam, x: number, y: number): P => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  const x = px - PLANE.ox;
  const y = py - PLANE.oy;
  const r = (c.rot * Math.PI) / 180;
  return [540 + x * Math.cos(r) - y * Math.sin(r), 960 + x * Math.sin(r) + y * Math.cos(r)];
};
export const camMotion = (t: number) => {
  const a = camAt(t);
  const b = camAt(t + 1 / 30);
  const k = pxPerM(a);
  return { vx: (a.x - b.x) * k, vy: (b.y - a.y) * k, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export { easeIn, easeOut, inOut, linear };
