import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
const D2R = Math.PI / 180;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * lon * D2R, R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * D2R) / 2))];
const K = (lon: number, lat: number): P => merc(lon, lat);

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; borders: P[][]; hajar: P[][]; lane: P[]; toIndia: P[]; gauge: P[];
  canal: P[]; pipeSA: P[]; pipeAE: P[]; places: Record<string, P>; centroids: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/**
 * The 3D camera: the ground point under the screen's focus (Mercator metres), metres per screen pixel at that point,
 * the tilt (0 = straight down, degrees) and the yaw (degrees, positive turns the map clockwise).
 */
export type Cam = { x: number; y: number; mpp: number; tilt: number; yaw: number };
type Key = { t: number; at: P; mpp: number; tilt: number; yaw: number; e?: Ease };

/** Frame 0 and the loop's end: low over the strait, the 33 km gap. */
export const HOOK = { at: K(56.42, 26.6), mpp: 105, tilt: 50, yaw: -12 };
const GULF = K(54.2, 26.2), WIDE = K(62.5, 21.5), MUSANDAM = K(56.12, 25.78), HAJAR = K(57.1, 24.0), ARABIA = K(48.5, 24.6);
/** Split screens: the map lives in the top half (the focus moves half a screen down the ground). */
const up = (p: P, mpp: number, tilt: number): P => [p[0], p[1] - 380 * mpp / Math.cos((tilt * Math.PI) / 180)];

const keys = (): Key[] => [
  { t: 0, ...HOOK },
  { t: C.doosra, at: HOOK.at, mpp: 104, tilt: 48, yaw: -6, e: linear },
  { t: C.yehai + 1.1, at: GULF, mpp: 1450, tilt: 38, yaw: 0, e: inOut },
  { t: C.jahaz - 0.3, at: GULF, mpp: 1350, tilt: 40, yaw: 3, e: linear },
  { t: C.n49 + 0.6, at: K(55.6, 26.3), mpp: 900, tilt: 44, yaw: 6, e: inOut },
  { t: C.bharat + 1.0, at: WIDE, mpp: 4300, tilt: 34, yaw: 0, e: inOut },
  { t: C.isi + 0.8, at: WIDE, mpp: 4100, tilt: 36, yaw: -4, e: linear },
  { t: C.map + 1.0, at: MUSANDAM, mpp: 135, tilt: 46, yaw: -8, e: inOut },
  { t: C.oman1 + 0.3, at: MUSANDAM, mpp: 120, tilt: 48, yaw: -4, e: linear },
  { t: C.hajar + 0.9, at: HAJAR, mpp: 700, tilt: 54, yaw: 28, e: inOut },
  { t: C.n3000 + 0.8, at: K(57.3, 23.6), mpp: 520, tilt: 58, yaw: 36, e: inOut },
  { t: C.do + 0.6, at: up(K(56.15, 25.6), 210, 44), mpp: 210, tilt: 44, yaw: 0, e: inOut },
  { t: C.kat + 0.3, at: up(K(56.15, 25.6), 190, 46), mpp: 190, tilt: 46, yaw: 0, e: linear },
  { t: C.kat + 1.1, at: K(56.15, 25.6), mpp: 170, tilt: 48, yaw: -4, e: inOut },
  { t: C.sab + 0.4, at: K(56.15, 25.6), mpp: 160, tilt: 50, yaw: -2, e: linear },
  { t: C.to3 + 0.7, at: ARABIA, mpp: 2600, tilt: 30, yaw: 0, e: inOut },
  { t: C.canal3 - 0.3, at: ARABIA, mpp: 2550, tilt: 30, yaw: 0, e: linear },
  { t: C.canal3 + 0.4, at: up(ARABIA, 2500, 32), mpp: 2500, tilt: 32, yaw: 0, e: inOut },
  { t: C.saudi - 0.3, at: up(ARABIA, 2450, 32), mpp: 2450, tilt: 32, yaw: 0, e: linear },
  { t: C.saudi + 0.8, at: ARABIA, mpp: 2350, tilt: 40, yaw: -4, e: inOut },
  { t: C.fuj + 0.6, at: K(51.0, 24.8), mpp: 2100, tilt: 42, yaw: 0, e: inOut },
  { t: C.parh + 0.8, at: K(53.0, 25.4), mpp: 1900, tilt: 44, yaw: 4, e: inOut },
  { t: C.baaki - 0.1, at: K(53.6, 25.6), mpp: 1750, tilt: 46, yaw: 2, e: linear },
  { t: DURATION_S, ...HOOK, e: inOut },
];
const FULL = keys().map((k) => ({ ...k, x: k.at[0], y: k.at[1], e: k.e ?? linear }));
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  const f0 = FULL[0];
  if (t <= f0.t) return { x: f0.x, y: f0.y, mpp: f0.mpp, tilt: f0.tilt, yaw: f0.yaw };
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const mpp = Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), p));
      let q = p;
      if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp, tilt: lerp(a.tilt, b.tilt, p), yaw: lerp(a.yaw, b.yaw, p) };
    }
  }
  const l = FULL[FULL.length - 1];
  return { x: l.x, y: l.y, mpp: l.mpp, tilt: l.tilt, yaw: l.yaw };
};
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
const HITS = () => [C.band, C.n2cr, C.n49, C.n3000, C.kat, C.n26b, C.kam];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lm = 0, tilt = 0, yaw = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(wrap(t + SMOOTH[i]));
    x += k.x * W8[i]; y += k.y * W8[i]; lm += Math.log(k.mpp) * W8[i]; tilt += k.tilt * W8[i]; yaw += k.yaw * W8[i];
  }
  const mpp = Math.exp(lm);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.025 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.014 * Math.sin(t * LOOPF(13)) + 0.006 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe,
    tilt: tilt + 1.2 * Math.sin(t * LOOPF(11)), yaw: yaw + 1.5 * Math.sin(t * LOOPF(9) + 0.7) };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.band, 4], [C.n49, 5], [C.n3000, 5], [C.kat, 6], [C.kam, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

// ------------------------------------------------------------------ the 3D projection (it mirrors the CSS transforms)
/** The ground plane is a GW×GH box of "ground pixels" (1 px = mpp metres), centred on the focus, which sits at screen
 *  (FX, FY); it is rotated rotateX(tilt) rotateZ(yaw) and seen through a CSS perspective of PERSP px from (FX, PY). */
export const GW = 2000, GH = 3300, FX = 540, FY = 1060, PERSP = 1500, PY = 760;
/** Ground pixel coordinates (in the GW×GH box) of a Mercator point. */
export const toG = (c: Cam, p: P): P => [GW / 2 + (p[0] - c.x) / c.mpp, GH / 2 - (p[1] - c.y) / c.mpp];
/** Screen position of a Mercator point lifted z ground px off the ground, and its perspective scale. */
export const project = (c: Cam, p: P, z = 0): [number, number, number] => {
  const [gx, gy] = toG(c, p);
  let u = gx - GW / 2, v = gy - GH / 2;
  const yr = (c.yaw * Math.PI) / 180, tr = (c.tilt * Math.PI) / 180;
  [u, v] = [u * Math.cos(yr) - v * Math.sin(yr), u * Math.sin(yr) + v * Math.cos(yr)];
  const y1 = v * Math.cos(tr) - z * Math.sin(tr), z1 = v * Math.sin(tr) + z * Math.cos(tr);
  const X = FX + u, Y = FY + y1;
  const s = PERSP / (PERSP - z1);
  return [FX + (X - FX) * s, PY + (Y - PY) * s, s];
};
export const pathD = (c: Cam, pts: P[], close = false) => pts.map((p, i) => { const [x, y] = toG(c, p); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('') + (close ? 'Z' : '');
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => pathD(c, r, true)).join('');
