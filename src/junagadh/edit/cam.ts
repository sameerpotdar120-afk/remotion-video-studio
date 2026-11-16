import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
const D2R = Math.PI / 180;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * lon * D2R, R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * D2R) / 2))];
const K = merc;

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; junagadh: P[][]; manavadar: P[][]; borders: P[][];
  places: Record<string, P>; jg_center: P;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: Gujarat and Sindh, Junagadh and Karachi in one frame. */
export const HOOK: P = K(69.4, 23.2);
export const HOOK_MPP = 950;
const SAU = K(70.45, 21.28), STATE = K(70.45, 21.32), SOM = K(70.42, 20.93), WIDE = K(68.9, 22.9);
/** Moves the focus point into the top half (while Null fills the bottom half). */
const up = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.gujarat1 - 0.3, at: K(69.6, 22.9), mpp: 880, e: linear },
  { t: C.pak1 + 0.4, at: K(69.0, 23.0), mpp: 1000, e: inOut },
  { t: C.somnath1 + 0.3, at: K(70.5, 21.2), mpp: 250, e: inOut },
  { t: C.map1 - 0.1, at: K(70.45, 21.25), mpp: 235, e: linear },
  { t: C.map1 + 0.7, at: K(69.3, 23.0), mpp: 1050, e: inOut },
  { t: C.kaise + 0.6, at: K(69.3, 23.0), mpp: 1000, e: linear },
  { t: C.yehai + 0.4, at: SAU, mpp: 150, e: inOut },
  { t: C.zila + 1.2, at: SAU, mpp: 138, e: linear },
  { t: C.princely + 0.3, at: STATE, mpp: 175, e: inOut },
  { t: C.nawab1 + 1.2, at: K(70.5, 21.36), mpp: 190, e: linear },
  { t: C.azadi + 0.7, at: K(72.5, 21.5), mpp: 2000, e: inOut },
  { t: C.pakc + 0.6, at: K(72.3, 21.8), mpp: 1900, e: linear },
  { t: C.n15 + 0.5, at: K(70.1, 22.4), mpp: 720, e: inOut },
  { t: C.chose + 0.3, at: K(70.3, 22.0), mpp: 560, e: inOut },
  { t: C.zameen + 0.4, at: WIDE, mpp: 1000, e: inOut },
  { t: C.nahi + 0.2, at: WIDE, mpp: 970, e: linear },
  { t: C.teen + 0.2, at: up(K(70.5, 21.7), 640), mpp: 640, e: inOut },
  { t: C.sardar - 0.1, at: up(K(70.5, 21.7), 610), mpp: 610, e: linear },
  { t: C.sardar + 0.8, at: STATE, mpp: 330, e: inOut },
  { t: C.naka + 1.0, at: STATE, mpp: 290, e: linear },
  { t: C.mumbai + 0.4, at: K(71.4, 19.6), mpp: 600, e: inOut },
  { t: C.arzi + 0.9, at: K(71.4, 19.7), mpp: 575, e: linear },
  { t: C.gaon + 0.3, at: SAU, mpp: 150, e: inOut },
  { t: C.control + 0.8, at: SAU, mpp: 140, e: linear },
  { t: C.karachi + 0.3, at: K(68.7, 23.2), mpp: 950, e: inOut },
  { t: C.bhaag + 0.7, at: K(68.7, 23.2), mpp: 920, e: linear },
  { t: C.n9 + 0.4, at: STATE, mpp: 260, e: inOut },
  { t: C.haath + 1.0, at: STATE, mpp: 240, e: linear },
  { t: C.pm + 0.4, at: K(69.0, 22.9), mpp: 950, e: inOut },
  { t: C.pita + 0.4, at: K(69.0, 22.9), mpp: 920, e: linear },
  { t: C.n13 + 0.3, at: K(70.40, 20.98), mpp: 120, e: inOut },
  { t: C.somnath2 + 0.3, at: SOM, mpp: 62, e: inOut },
  { t: C.khula + 0.5, at: SOM, mpp: 54, e: linear },
  { t: C.feb + 0.5, at: SAU, mpp: 170, e: inOut },
  { t: C.n91 + 0.8, at: SAU, mpp: 155, e: linear },
  { t: C.n2020 + 0.4, at: K(69.2, 23.4), mpp: 1100, e: inOut },
  { t: C.newmap - 0.3, at: up(K(69.6, 22.4), 900), mpp: 900, e: inOut },
  { t: C.dikhaya + 0.5, at: up(K(69.6, 22.4), 870), mpp: 870, e: linear },
  { t: C.somnath3 + 0.4, at: SOM, mpp: 72, e: inOut },
  { t: C.passport + 1.2, at: SOM, mpp: 64, e: linear },
  { t: C.signature + 0.2, at: STATE, mpp: 230, e: inOut },
  { t: C.pak_last + 0.6, at: K(70.0, 22.3), mpp: 520, e: inOut },
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
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
const HITS = () => [C.pak1, C.somnath1, C.map1, C.kaise, C.yehai, C.n80, C.nawab1, C.n15, C.chose, C.nahi, C.naka, C.arzi, C.karachi, C.n9, C.haath, C.zulfi, C.n1951, C.votes, C.n91, C.n2020, C.signature];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lm = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(wrap(t + SMOOTH[i]));
    x += k.x * W8[i]; y += k.y * W8[i]; lm += Math.log(k.mpp) * W8[i];
  }
  const mpp = Math.exp(lm);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.025 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.014 * Math.sin(t * LOOPF(13)) + 0.006 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 6;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: P[]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
/** Camera speed for motion blur: screen px per frame of pan, |d ln mpp| per frame of zoom. */
export const camSpeed = (t: number) => {
  const a = camAt(t - 1 / 120), b = camAt(t + 1 / 120), c = camAt(t);
  return { pan: Math.hypot(b.x - a.x, b.y - a.y) / c.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) };
};
/** A slow camera roll (degrees), with kicks on the whip moves. */
export const rollAt = (t: number) => 0.7 * Math.sin(t * LOOPF(7) + 0.4) + 2.2 * Math.exp(-(((t - C.azadi - 0.3) / 0.45) ** 2)) - 1.8 * Math.exp(-(((t - C.mumbai) / 0.4) ** 2)) + 1.8 * Math.exp(-(((t - C.karachi) / 0.4) ** 2)) - 2.0 * Math.exp(-(((t - C.n2020) / 0.45) ** 2));
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.chose, 9], [C.naka + 0.2, 8], [C.haath, 7], [C.n91, 6], [C.signature + 0.4, 8], [C.n1951, 6]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
