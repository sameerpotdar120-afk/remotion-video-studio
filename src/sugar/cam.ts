import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
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
  india: P[][]; china: P[][]; iran: P[][]; saudi: P[][]; egypt: P[][]; italy: P[][]; france: P[][]; uk: P[][];
  places: Record<string, P>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const PLc = GEO.places;
export const PL = {
  hook: merc(67, 30),
  india: merc(78.5, 22.5),
  indiaPersia: merc(57, 26),
  west: merc(22, 38),
  england: merc(5, 46),
  egypt: merc(31, 27),
  egyptIndia: merc(56, 24),
  chinaIndia: merc(95, 28),
  all: merc(55, 33),
  wideWest: merc(13, 44),
};
void PLc;

/** Camera keys, all anchored to words of the voiceover; every move rolls a few degrees. */
const keys = (): Key[] => [
  // चीनी… चीन… मिश्री… मिस्र: the wide map behind the hook, China and Egypt glowing
  { t: 0, at: PL.hook, span: 1.6e7, rot: -3 },
  { t: C.jawab2, at: PL.hook, span: 1.45e7, rot: 0, e: linear },
  // …शुरू हुआ भारत से: dive onto India
  { t: C.bharat2 + 0.2, at: PL.india, span: 4.6e6, rot: 2, e: inOut },
  { t: C.daane3, at: PL.india, span: 3.6e6, rot: 0, e: linear },
  { t: C.kankad4 + 0.4, at: PL.india, dy: 1e5, span: 3.3e6, rot: -1, e: linear },
  // Persia… Arab
  { t: C.persia5 + 0.1, at: PL.indiaPersia, span: 7.2e6, rot: 3, e: inOut },
  { t: C.sukkar5 + 0.6, at: PL.indiaPersia, dx: -3e5, span: 7.6e6, rot: 1, e: linear },
  // Europe: Italy, France, England
  { t: C.europe6 + 0.4, at: PL.west, span: 1.15e7, rot: -3, e: inOut },
  { t: C.england6 + 0.3, at: PL.england, span: 8.5e6, rot: -1, e: inOut },
  // यानी Sugar हमारा ही शब्द: snap home
  { t: C.yani7 + 0.5, at: PL.india, span: 3.6e6, rot: 2, e: inOut },
  { t: C.khand8 + 0.4, at: PL.india, span: 3.3e6, rot: 0, e: linear },
  // खण्ड → कंद (Persia) → Candy (England)
  { t: C.persia9 + 0.2, at: PL.indiaPersia, span: 7.2e6, rot: -2, e: inOut },
  { t: C.gulkand + 0.4, at: PL.indiaPersia, span: 7.0e6, rot: -1, e: linear },
  { t: C.angrez10 + 0.5, at: PL.wideWest, span: 1.3e7, rot: 2, e: inOut },
  { t: C.egypt11 - 0.4, at: PL.wideWest, span: 1.25e7, rot: 1, e: linear },
  // Egypt → मिश्री
  { t: C.egypt11 + 0.3, at: PL.egypt, span: 4.2e6, rot: -2, e: inOut },
  { t: C.crystals + 0.6, at: PL.egypt, span: 3.9e6, rot: -1, e: linear },
  { t: C.bharat11 + 0.2, at: PL.egyptIndia, span: 8.2e6, rot: 1, e: inOut },
  { t: C.mishri11 + 0.4, at: PL.egyptIndia, span: 8.0e6, rot: 0, e: linear },
  // China → चीनी
  { t: C.china12 + 0.2, at: PL.chinaIndia, span: 7.8e6, rot: 3, e: inOut },
  { t: C.cheeni12 - 0.4, at: PL.chinaIndia, dx: -3e5, span: 7.4e6, rot: 1, e: linear },
  // भारत से निकली… घर लौट आई: everything at once
  { t: C.nikli13 - 0.4, at: PL.all, span: 1.55e7, rot: -2, e: inOut },
  { t: C.ghar13 + 0.3, at: PL.all, span: 1.5e7, rot: -1, e: linear },
  // the question, at home
  { t: C.ghar14 + 0.2, at: PL.india, span: 4.2e6, rot: 1, e: inOut },
  { t: DURATION_S, at: PL.india, span: 3.8e6, rot: 0, e: linear },
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

/** Keyed path smoothed with a short centred window: continuous velocity through every key. */
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += c.x * W8[i]; y += c.y * W8[i]; ls += Math.log(c.span) * W8[i]; rot += c.rot * W8[i];
  }
  // a slow breathing sway on top, so even the holds feel hand-held in 3D
  return { x, y, span: Math.exp(ls), rot: rot + Math.sin(t * 0.55) * 0.8 };
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
