import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import v1 from '../diomede/geo.json';
import raw from './geo2.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres; longitudes west of -130° are unwrapped (+360) so the US, the Atlantic, Russia and Alaska lie on one strip. */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const l = lon < -130 ? lon + 360 : lon;
  return [R * ((l * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
};

export const GEO2 = raw as unknown as {
  plate: { bounds: [number, number, number, number]; w: number; h: number };
  usa48: P[][];
  alaska: P[][];
  russia: P[][];
  chukotka: P[][];
  canada: P[][];
};
export const GEO1 = v1 as unknown as {
  big: P[][];
  little: P[][];
  bigCenter: P;
  littleCenter: P;
  bigBounds: [number, number, number, number];
  littleBounds: [number, number, number, number];
  gapA: P;
  gapB: P;
  walk: [P, P];
  border: P[][];
  dateline: P[][];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export const BIG = GEO1.bigCenter;
export const LIT = GEO1.littleCenter;
export const MID: P = [(BIG[0] + LIT[0]) / 2, (BIG[1] + LIT[1]) / 2];
/** Mercator metres per true metre at the islands (1 / cos 65.77°). */
export const MS = 1 / Math.cos((65.77 * Math.PI) / 180);

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 2900, ox: 1300, oy: 1450 };

const USA = merc(-96, 43);
const ATL = merc(-22, 47);
const BERING = merc(-169.6, 65.6);
const ALASKA = merc(-160, 63.5);
const BERING_WIDE = merc(-172, 64.5);

/** Camera keys, all anchored to words of the voiceover. */
const keys = (): Key[] => [
  // ज़्यादातर लोग नहीं जानते कि अमेरिका… : the US in its flag
  { t: 0, at: USA, span: 1.3e7, rot: 0 },
  { t: C.rus - 0.25, at: USA, dx: 9e5, span: 1.22e7, rot: -6, e: linear },
  // …और रशिया: across the Atlantic, the laser
  { t: C.rus + 0.75, at: ATL, span: 1.55e7, rot: -30, e: inOut },
  { t: C.ekdusre + 0.15, at: ATL, dx: 6e5, span: 1.5e7, rot: -32, e: linear },
  // the globe swings round to the Pacific side: Russia and Alaska face each other
  { t: C.four - 0.05, at: BERING, span: 5.2e6, rot: 0, e: inOut },
  // (iris wipe) the flat infographic map
  { t: C.four + 0.55, at: BERING, span: 3.4e6, e: easeOut },
  { t: C.dekho + 0.35, at: BERING, span: 2.9e6, e: linear },
  // back to satellite, neon countries, Bering Strait
  { t: C.dono, at: BERING, span: 2.4e6, rot: 4, e: inOut },
  { t: C.zoom, at: BERING, dx: 2e4, span: 2.0e6, rot: 8, e: linear },
  // ज़ूम: dive to the islands
  { t: C.dikhte + 0.3, at: MID, span: 52000, rot: 0, e: inOut },
  { t: C.d38 + 0.9, at: MID, span: 46000, e: linear },
  // little diomede
  { t: C.little + 0.4, at: LIT, dy: 1000, span: 15000, rot: -6, e: inOut },
  { t: C.gaon, at: LIT, dy: 900, span: 13500, rot: -8, e: linear },
  // (village photo) then big diomede
  { t: C.bada + 0.1, at: BIG, dy: 1500, span: 30000, rot: 4, e: inOut },
  { t: C.bantwara - 0.2, at: BIG, dy: 1200, span: 26000, rot: 7, e: linear },
  // 1867: out to Alaska
  { t: C.y1867 + 0.1, at: ALASKA, span: 5.4e6, rot: 0, e: inOut },
  { t: C.kharida + 0.9, at: ALASKA, dx: -3e5, span: 5.0e6, e: linear },
  // winter: back to the islands, freeze, walk
  { t: C.sardi + 0.6, at: MID, span: 58000, rot: 0, e: inOut },
  { t: C.dusre + 0.6, at: MID, span: 50000, rot: -3, e: linear },
  // the date line
  { t: C.intl + 0.2, at: BERING_WIDE, span: 3.6e6, rot: 0, e: inOut },
  { t: C.yaani - 0.25, at: BERING_WIDE, span: 3.3e6, e: linear },
  // time travel
  { t: C.yaani + 0.6, at: MID, dy: -4000, span: 60000, e: inOut },
  { t: DURATION_S, at: MID, dy: -4000, span: 54000, rot: -2, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of keys()) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({ t: k.t, x: at[0] + (k.dx ?? 0), y: at[1] + (k.dy ?? 0), span: k.span ?? prev.span, rot: k.rot ?? prev?.rot ?? 0, e: k.e ?? linear });
}
const clamp = (x: number) => Math.min(1, Math.max(0, x));

export const camAt = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const lz = lerp(Math.log(a.span), Math.log(b.span), p);
      const span = Math.exp(lz);
      let q = p;
      if (Math.abs(Math.log(b.span / a.span)) > 1.5) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};

export const pxPerM = (c: Cam) => 1920 / c.span;
export const camSpeed = (t: number) => {
  const a = camAt(t);
  const b = camAt(t + 1 / 30);
  return Math.abs(Math.log(b.span / a.span)) * 30 + (Math.hypot(b.x - a.x, b.y - a.y) / a.span) * 30 * 1.6;
};
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

export { easeIn, easeOut, inOut, linear };
