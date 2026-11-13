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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; near: Record<string, P[][]>; borders: P[][];
  setu: P[]; rail: P[]; places: Record<string, P>; pamban: P[][]; pamban_sat: P[][]; mannar_sat: P[][]; mainland_sat: P[][];
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

const PL = GEO.places;
/** Frame 0 and the loop's end: low over the shoals, the Setu running across the screen. */
export const HOOK: P = K(79.56, 9.125);
export const HOOK_MPP = 30;
const SETU_MID = K(79.57, 9.12), DK = PL.dhanushkodi, TM = PL.talaimannar, INDIA = K(80.5, 17.5), SOUTH = K(79.6, 9.0);
const up = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.n1480 - 0.2, at: K(79.53, 9.13), mpp: 27, e: linear },
  { t: C.n1964 + 0.4, at: K(79.5, 9.14), mpp: 34, e: inOut },
  { t: C.kaise - 0.1, at: K(79.48, 9.145), mpp: 31, e: linear },
  { t: C.ye + 0.9, at: INDIA, mpp: 3900, e: inOut },
  { t: C.dhanush1 - 0.9, at: K(80.0, 15.5), mpp: 3400, e: linear },
  { t: C.dhanush1 + 0.3, at: [DK[0] - 900, DK[1] + 1200], mpp: 14, e: inOut },
  { t: C.nok - 0.4, at: [DK[0] - 600, DK[1] + 900], mpp: 12, e: linear },
  { t: C.naam + 0.4, at: [DK[0] + 300, DK[1] + 300], mpp: 15, e: inOut },
  { t: C.yahin - 0.1, at: [DK[0] + 600, DK[1] + 200], mpp: 16, e: linear },
  { t: C.lakeer + 0.5, at: SETU_MID, mpp: 41, e: inOut },
  { t: C.beech + 0.6, at: K(79.5, 9.19), mpp: 72, e: inOut },
  { t: C.aastha - 0.1, at: K(79.51, 9.18), mpp: 69, e: linear },
  { t: C.aastha + 1.2, at: SETU_MID, mpp: 26, e: inOut },
  { t: C.n5din + 1.5, at: K(79.62, 9.11), mpp: 24, e: linear },
  { t: C.angrez + 0.5, at: SOUTH, mpp: 420, e: inOut },
  { t: C.hamare - 0.4, at: up(SOUTH, 400), mpp: 400, e: linear },
  { t: C.rahega + 0.2, at: up(SOUTH, 390), mpp: 390, e: linear },
  { t: C.n2024 + 0.6, at: SETU_MID, mpp: 36, e: inOut },
  { t: C.n29 + 0.8, at: SETU_MID, mpp: 32, e: linear },
  { t: C.n9998 + 0.5, at: K(79.55, 9.125), mpp: 22, e: inOut },
  { t: C.choona + 0.6, at: K(79.53, 9.13), mpp: 18, e: inOut },
  { t: C.isro2 + 0.8, at: SETU_MID, mpp: 34, e: inOut },
  { t: C.vigyan - 0.4, at: up(SETU_MID, 33), mpp: 33, e: inOut },
  { t: C.aastha2 + 1.2, at: up(SETU_MID, 31), mpp: 31, e: linear },
  { t: C.jo + 0.6, at: SETU_MID, mpp: 28, e: inOut },
  { t: C.par2 - 0.2, at: K(79.5, 9.14), mpp: 30, e: linear },
  { t: C.chakravat + 0.6, at: K(79.38, 9.21), mpp: 46, e: inOut },
  { t: C.train + 1.0, at: K(79.4, 9.18), mpp: 30, e: inOut },
  { t: C.sarkar - 0.2, at: K(79.42, 9.17), mpp: 28, e: linear },
  { t: C.aaj + 0.5, at: [DK[0] - 300, DK[1] + 500], mpp: 13, e: inOut },
  { t: C.mita - 0.2, at: [DK[0] - 200, DK[1] + 400], mpp: 12.5, e: linear },
  { t: C.setu_last + 0.6, at: SETU_MID, mpp: 34, e: inOut },
  { t: C.usi + 1.5, at: SETU_MID, mpp: 33, e: linear },
  { t: DURATION_S, at: HOOK, mpp: HOOK_MPP, e: inOut },
];
export const TM_ = TM;
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
const HITS = () => [C.n1480, C.n1964, C.kaise, C.dhanush1, C.nok, C.ramsetu1, C.n5din, C.adams, C.n29, C.n9998, C.n22, C.n115, C.n1800];
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
export const rollAt = (t: number) => 0.7 * Math.sin(t * LOOPF(7) + 0.4) + 2.4 * Math.exp(-(((t - C.ye - 0.4) / 0.4) ** 2)) - 2.2 * Math.exp(-(((t - C.dhanush1 - 0.1) / 0.4) ** 2)) + 1.6 * Math.exp(-(((t - C.angrez) / 0.4) ** 2));
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.toofan, 9], [C.n1964, 6], [C.nok, 7], [C.chakravat, 8], [C.train + 0.3, 12], [C.n1800, 4]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
