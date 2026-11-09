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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; borders: P[][]; dmz: P[]; yalu: P[];
  fronts: Record<string, P[]>; centroids: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: the whole peninsula, the two Koreas. */
export const HOOK: P = K(127.6, 38.4);
export const HOOK_MPP = 820;
const DMZ_MID = K(127.3, 38.05), DMZ_CLOSE = K(127.15, 38.24);
const JAPAN = K(133.5, 37.2), USSR = K(131, 41.6), SOUTH = K(128.4, 37.6);
const WAR = K(127.4, 38.45);
/** Split screens: the map lives in the top half, so the camera centre sits half a screen lower. */
const upHalf = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const INDIA = K(100.5, 24);

const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.khatam, at: HOOK, mpp: 790, e: linear },
  { t: C.line1 - 0.2, at: HOOK, mpp: 740, e: linear },
  { t: C.line1 + 1.3, at: DMZ_MID, mpp: 520, e: inOut },
  { t: C.dmz - 0.1, at: DMZ_MID, mpp: 490, e: linear },
  { t: C.dmz + 1.3, at: DMZ_CLOSE, mpp: 95, e: inOut },
  { t: C.bandook + 1.0, at: DMZ_CLOSE, mpp: 86, e: linear },
  { t: C.ek + 1.8, at: JAPAN, mpp: 2050, e: inOut },
  { t: C.phir - 0.1, at: JAPAN, mpp: 1950, e: linear },
  { t: C.soviet + 0.6, at: USSR, mpp: 2700, e: inOut },
  { t: C.america1 - 0.2, at: USSR, mpp: 2600, e: linear },
  { t: C.america1 + 1.0, at: SOUTH, mpp: 1650, e: inOut },
  { t: C.p38 - 0.5, at: SOUTH, mpp: 1500, e: linear },
  { t: C.p38 + 0.3, at: WAR, mpp: 780, e: inOut },
  { t: C.dono - 0.2, at: WAR, mpp: 730, e: linear },
  { t: C.dono + 0.4, at: upHalf(K(127.6, 38.2), 1480), mpp: 1480, e: inOut },
  { t: C.end22 - 0.2, at: upHalf(K(127.6, 38.2), 1420), mpp: 1420, e: linear },
  { t: C.end22 + 0.45, at: WAR, mpp: 800, e: inOut },
  { t: C.tab - 0.25, at: WAR, mpp: 770, e: linear },
  { t: C.tab + 0.35, at: upHalf(K(126.2, 40.6), 2500), mpp: 2500, e: inOut },
  { t: C.aur3 - 0.1, at: upHalf(K(126.2, 40.6), 2400), mpp: 2400, e: linear },
  { t: C.aur3 + 1.7, at: INDIA, mpp: 7100, e: inOut },
  { t: C.n22l, at: INDIA, mpp: 6700, e: linear },
  { t: C.n3 - 0.1, at: WAR, mpp: 800, e: inOut },
  { t: C.usi + 0.6, at: WAR, mpp: 740, e: linear },
  { t: C.toye - 0.2, at: HOOK, mpp: 900, e: inOut },
  { t: DURATION_S, at: HOOK, mpp: HOOK_MPP, e: inOut },
];
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
const HITS = () => [C.khatam, C.n4, C.p38, C.hamla, C.china2, C.n25, C.signtak, C.aaj];
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
  for (const [t0, a] of [[C.khatam, 4], [C.n4, 3], [C.p38, 4], [C.hamla, 6], [C.china2, 6], [C.goli, 4], [C.n25, 5], [C.aaj, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
