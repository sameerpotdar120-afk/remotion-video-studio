import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import raw from './geo.json';

/** Web Mercator metres, longitudes unwrapped around the date line (west longitudes get +360°). */
const R = 6378137;
export const merc = (lon: number, lat: number): [number, number] => {
  const l = lon < 0 ? lon + 360 : lon;
  return [R * ((l * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
};

type P = [number, number];
export const GEO = raw as unknown as {
  big: P[][];
  little: P[][];
  bigCenter: P;
  littleCenter: P;
  bigBounds: [number, number, number, number];
  littleBounds: [number, number, number, number];
  gapA: P;
  gapB: P;
  gapKm: number;
  walk: [P, P];
  border: P[][];
  dateline: P[][];
  alaska: P[][];
};

export const MID: P = [(GEO.bigCenter[0] + GEO.littleCenter[0]) / 2, (GEO.bigCenter[1] + GEO.littleCenter[1]) / 2];

/** span = Mercator metres visible over the 1920 px frame height. */
export type Cam = { x: number; y: number; span: number; rot: number; tilt: number };
type Key = { t: number; at?: P; dy?: number; span?: number; rot?: number; tilt?: number; e?: Ease };

export const PLANE = { w: 3200, h: 4000, ox: 1600, oy: 2500 };

const BIG = GEO.bigCenter;
const LIT = GEO.littleCenter;
const ALASKA = merc(-165, 63.8);
const STRAIT = merc(-169.0, 65.9);
const PACIFIC = merc(180, 22);

// dy shifts the camera north (positive) so on-screen UI above the islands has room
const KEYS: Key[] = [
  // hook: already diving in frame 1
  { t: 0.0, at: MID, dy: 2000, span: 1.05e5, rot: -6, tilt: 0 },
  { t: 1.35, at: MID, span: 62000, rot: 0, e: easeOut },
  { t: 3.6, at: MID, span: 56000, e: linear },
  // आज / कल calendars above the islands
  { t: 4.4, at: MID, dy: 13000, span: 82000, e: inOut },
  { t: 6.9, at: MID, dy: 13500, span: 79000, rot: 2, e: linear },
  // title, then America / Russia
  { t: 7.7, at: MID, dy: 2000, span: 60000, rot: -3, e: inOut },
  { t: 9.2, at: MID, span: 56000, e: linear },
  { t: 10.0, at: LIT, dy: 4000, span: 38000, rot: 2, e: inOut },
  { t: 11.2, at: LIT, dy: 4000, span: 36000, e: linear },
  { t: 12.0, at: BIG, dy: 4000, span: 46000, rot: -2, e: inOut },
  { t: 12.8, at: BIG, dy: 4000, span: 44000, e: linear },
  // the date line between them, then out to the whole Pacific
  { t: 13.5, at: MID, span: 66000, rot: 0, e: inOut },
  { t: 14.55, at: MID, span: 72000, e: linear },
  { t: 15.95, at: PACIFIC, span: 2.35e7, e: inOut },
  { t: 16.5, at: PACIFIC, span: 2.3e7, e: linear },
  // back down: Monday / Tuesday clocks and calendars
  { t: 17.55, at: MID, dy: 21000, span: 96000, e: inOut },
  { t: 23.2, at: MID, dy: 21500, span: 93000, rot: 1, e: linear },
  // "पर इतने पास होकर भी…" slow orbit
  { t: 24.2, at: MID, dy: 11000, span: 64000, rot: 6, e: inOut },
  { t: 27.0, at: MID, dy: 11500, span: 61000, rot: 10, e: linear },
  // 1867: out to Alaska
  { t: 28.3, at: ALASKA, span: 6.0e6, rot: 0, e: inOut },
  { t: 31.3, at: ALASKA, span: 5.6e6, e: linear },
  // the border drawn through the strait, then into the islands
  { t: 32.3, at: STRAIT, span: 8.5e5, e: inOut },
  { t: 33.0, at: STRAIT, span: 7.8e5, e: linear },
  { t: 34.1, at: MID, span: 64000, rot: -4, e: inOut },
  // Cold War / Ice Curtain
  { t: 36.9, at: MID, span: 72000, rot: 90, e: inOut },
  { t: 37.6, at: MID, span: 74000, rot: 90, tilt: 24, e: inOut },
  { t: 39.7, at: MID, span: 78000, rot: 92, tilt: 25, e: linear },
  // military base on Big Diomede
  { t: 41.1, at: BIG, dy: -2000, span: 30000, rot: 5, tilt: 34, e: inOut },
  { t: 45.9, at: BIG, dy: -2000, span: 26000, rot: 8, tilt: 36, e: linear },
  // winter: sea ice and the ice bridge
  { t: 47.4, at: MID, dy: -6000, span: 66000, rot: 0, tilt: 36, e: inOut },
  { t: 49.0, at: MID, dy: -6500, span: 60000, tilt: 37, e: linear },
  { t: 53.7, at: MID, dy: -5000, span: 64000, tilt: 36, e: linear },
  // the question
  { t: 54.6, at: MID, dy: 6000, span: 76000, tilt: 18, e: inOut },
  { t: 59.5, at: MID, dy: 6500, span: 72000, tilt: 16, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of KEYS) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y - 0];
  FULL.push({
    t: k.t,
    x: at[0],
    y: (k.at ? at[1] : prev.y) + (k.dy ?? 0),
    span: k.span ?? prev.span,
    rot: k.rot ?? prev?.rot ?? 0,
    tilt: k.tilt ?? prev?.tilt ?? 0,
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
      return {
        x: lerp(a.x, b.x, p),
        y: lerp(a.y, b.y, p),
        span: Math.exp(lerp(Math.log(a.span), Math.log(b.span), p)),
        rot: lerp(a.rot, b.rot, p),
        tilt: lerp(a.tilt, b.tilt, p),
      };
    }
  }
  return FULL[FULL.length - 1];
};

export const pxPerM = (c: Cam) => 1920 / c.span;

export const camSpeed = (t: number) => {
  const dt = 1 / 30;
  const a = camAt(t);
  const b = camAt(t + dt);
  return Math.abs(Math.log(b.span / a.span)) / dt + (Math.hypot(b.x - a.x, b.y - a.y) / a.span / dt) * 1.6;
};

/** Mercator metres → plane pixels (before the plane's CSS rotate/tilt). */
export const project = (c: Cam, x: number, y: number): [number, number] => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};

export { easeIn, easeOut, inOut, linear };
