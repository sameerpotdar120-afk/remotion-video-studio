import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
const D2R = Math.PI / 180;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * lon * D2R, R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * D2R) / 2))];
export const mercY = (lat: number) => merc(0, lat)[1];
const K = (lon: number, lat: number): P => [merc(lon, 0)[0], mercY(lat)];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; borders: P[][]; continents: Record<string, P[][]>;
  centroids: Record<string, P>; oil: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: the world map. */
export const WORLD: P = K(30, 16);
export const WORLD_MPP = 18000;
const INDIA = K(79.5, 22.5);
const keys = (): Key[] => [
  { t: 0, at: WORLD, mpp: WORLD_MPP },
  { t: C.kya, at: WORLD, mpp: 17500, e: linear },
  { t: C.bharat - 0.3, at: K(45, 20), mpp: 16500, e: linear },
  { t: C.bharat + 0.8, at: INDIA, mpp: 3900, e: inOut },
  { t: C.isi - 0.3, at: INDIA, mpp: 3600, e: linear },
  { t: C.isi + 0.8, at: WORLD, mpp: 18500, e: inOut },
  { t: C.bharat2 - 0.4, at: WORLD, mpp: 18000, e: linear },
  { t: C.bharat2 + 0.8, at: upHalf(INDIA, 4300), mpp: 4300, e: inOut },
  { t: C.dharti2 - 0.3, at: upHalf(INDIA, 4100), mpp: 4100, e: linear },
  { t: C.dharti2 + 0.8, at: WORLD, mpp: 18300, e: inOut },
  { t: C.purani - 0.3, at: WORLD, mpp: 17800, e: linear },
  { t: C.purani + 0.5, at: upHalf(K(30, 16), 26000), mpp: 26000, e: inOut },
  { t: C.n44b + 0.5, at: upHalf(K(30, 16), 25500), mpp: 25500, e: linear },
  { t: C.oil + 0.6, at: K(35, 28), mpp: 16500, e: inOut },
  { t: C.roshni - 0.2, at: K(40, 28), mpp: 15500, e: linear },
  { t: C.yesab - 0.2, at: WORLD, mpp: 19500, e: linear },
  { t: DURATION_S, at: WORLD, mpp: WORLD_MPP, e: inOut },
];
const upHalf = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const FULL = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], mpp: k.mpp, e: k.e ?? linear }));
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const mpp = Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), p));
      let q = p;
      if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp };
    }
  }
  return FULL[FULL.length - 1];
};
const HITS = () => [C.n4a, C.n9500, C.n44b, C.n1200a];
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lm = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(wrap(t + SMOOTH[i]));
    x += k.x * W8[i]; y += k.y * W8[i]; lm += Math.log(k.mpp) * W8[i];
  }
  const mpp = Math.exp(lm);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.03 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.014 * Math.sin(t * LOOPF(13)) + 0.006 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 6;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ll = (c: Cam, lon: number, lat: number): P => toS(c, merc(lon, lat));
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: P[]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.n4a, 4], [C.bijli, 6], [C.n44b, 6], [C.n1200a, 4]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
