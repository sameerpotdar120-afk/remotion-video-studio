import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import raw from './geo.json';

/** Web Mercator metres (EPSG:3857). */
const R = 6378137;
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];

export type P = [number, number];
export const GEO = raw as unknown as {
  sentinel: P[];
  center: P;
  bounds: [number, number, number, number];
  lat: number;
  mercScale: number;
  southAndaman: P[][];
  andaman: P[][];
  india: P[][];
  manhattan: P[];
  portBlair: P;
};

export const ISL = GEO.center;
/** Mercator metres per true metre at the island (1 / cos lat). */
export const MS = GEO.mercScale;

/** span = Mercator metres visible over the 1920 px frame height. No tilt in this video: the reference keeps a flat top-down camera. */
export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2400, h: 2600, ox: 1200, oy: 1300 };

const ASIA = merc(88, 10);
const OCEAN = merc(84, 9);
const MIDPB: P = [(ISL[0] + GEO.portBlair[0]) / 2, (ISL[1] + GEO.portBlair[1]) / 2];
/** The west coast where the boat sneaks in. */
export const COAST: P = [GEO.bounds[0] + 700, ISL[1] - 1200];

const KEYS: Key[] = [
  // the most dangerous island: Asia, already pushing in
  { t: 0.0, at: ASIA, span: 1.15e7, rot: 0 },
  { t: 3.0, at: ASIA, dx: 2.0e5, dy: 1.0e5, span: 8.6e6, e: linear },
  // "यहाँ जाने की सोची" → dive to the island
  { t: 4.55, at: ISL, span: 23000, rot: -3, e: inOut },
  { t: 7.8, at: ISL, span: 21000, rot: -9, e: linear },
  // animals / gas / the people
  { t: 11.3, at: ISL, span: 21500, rot: 4, e: linear },
  { t: 14.6, at: ISL, span: 19500, rot: 0, e: linear },
  // (scenes cover the map 14.7–19.4) out to the island's surroundings
  { t: 19.2, at: ISL, span: 72000, rot: 0, e: inOut },
  { t: 22.3, at: ISL, span: 60000, e: linear },
  // Manhattan at true scale
  { t: 23.2, at: ISL, dy: -4500, span: 62000, rot: -4, e: inOut },
  { t: 24.4, at: ISL, dy: -4500, span: 60000, e: linear },
  // Indian Ocean, India
  { t: 25.3, at: OCEAN, span: 9.0e6, rot: 0, e: inOut },
  { t: 27.85, at: OCEAN, dx: 1.5e5, dy: 2.0e5, span: 8.2e6, e: linear },
  // back down to the island
  { t: 29.35, at: ISL, span: 24000, rot: 6, e: inOut },
  { t: 31.0, at: ISL, span: 22500, rot: 9, e: linear },
  // Port Blair, 64 km
  { t: 32.1, at: MIDPB, dx: 5000, span: 1.38e5, rot: 0, e: inOut },
  { t: 34.3, at: MIDPB, dx: 5000, span: 1.3e5, e: linear },
  // contact attempts
  { t: 35.1, at: ISL, span: 22000, rot: -5, e: inOut },
  { t: 37.6, at: ISL, span: 20500, rot: -8, e: linear },
  // 2004 tsunami, then the helicopter
  { t: 38.4, at: ISL, span: 52000, rot: 0, e: inOut },
  { t: 39.7, at: ISL, span: 48000, e: linear },
  { t: 40.5, at: ISL, span: 30000, e: inOut },
  { t: 41.6, at: ISL, span: 27000, e: linear },
  // (scene 41.7–43.8) the 9 km zone
  { t: 44.4, at: ISL, span: 80000, e: inOut },
  { t: 48.6, at: ISL, span: 74000, rot: 3, e: linear },
  // sneaking in: through the zone to the west coast
  { t: 49.9, at: COAST, dx: -1500, dy: -300, span: 7600, rot: 0, e: inOut },
  { t: 53.9, at: COAST, dx: -1300, dy: -300, span: 7000, e: linear },
  // jungle, population
  { t: 54.9, at: ISL, span: 21000, rot: -4, e: inOut },
  { t: 58.7, at: ISL, span: 19500, rot: 2, e: linear },
  // the ending: disease
  { t: 59.6, at: ISL, span: 17500, rot: 0, e: inOut },
  { t: 68.8, at: ISL, span: 15500, rot: -3, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of KEYS) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({
    t: k.t,
    x: at[0] + (k.dx ?? 0),
    y: at[1] + (k.dy ?? 0),
    span: k.span ?? prev.span,
    rot: k.rot ?? prev?.rot ?? 0,
    e: k.e ?? linear,
  });
}

export const camAt = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e((t - a.t) / (b.t - a.t));
      // zoom moves in log space; position follows the zoom so dives stay centred on the target
      const lz = lerp(Math.log(a.span), Math.log(b.span), p);
      const span = Math.exp(lz);
      const big = Math.abs(Math.log(b.span / a.span)) > 1.5;
      let q = p;
      if (big) {
        // keep the destination (dive) or the origin (pull-back) at a fixed screen spot: offset scales with the span
        q = b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span);
        q = clamp(q);
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));

export const pxPerM = (c: Cam) => 1920 / c.span;

export const camSpeed = (t: number) => {
  const dt = 1 / 30;
  const a = camAt(t);
  const b = camAt(t + dt);
  return Math.abs(Math.log(b.span / a.span)) / dt + (Math.hypot(b.x - a.x, b.y - a.y) / a.span / dt) * 1.6;
};

/** Mercator metres → plane pixels (before the plane's CSS rotation). */
export const project = (c: Cam, x: number, y: number): P => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};

/** Mercator metres → final screen pixels (plane rotated about its origin, which sits at screen centre). */
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  const x = px - PLANE.ox;
  const y = py - PLANE.oy;
  const r = (c.rot * Math.PI) / 180;
  return [540 + x * Math.cos(r) - y * Math.sin(r), 960 + x * Math.sin(r) + y * Math.cos(r)];
};

export { easeIn, easeOut, inOut, linear };
