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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; andaman: P[][]; mainland: P[][]; borders: P[][];
  places: Record<string, P>; route: P[]; pearls: P[]; diamonds: P[];
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: Great Nicobar and the Six Degree Channel, where the tankers pass. */
export const HOOK: P = K(94.15, 6.75);
export const HOOK_MPP = 150;
/** Moves the focus point into the top half (while Null fills the bottom half). */
const up = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.neeche - 0.2, at: K(94.2, 6.65), mpp: 165, e: linear },
  { t: C.tel1 + 0.3, at: K(94.6, 6.25), mpp: 260, e: inOut },
  { t: C.darr1 + 0.2, at: K(94.6, 6.3), mpp: 240, e: linear },
  { t: C.china3 + 0.6, at: K(93.0, 21.0), mpp: 3000, e: inOut },
  { t: C.n140 + 0.6, at: K(93.0, 21.5), mpp: 2850, e: linear },
  { t: C.n80 + 0.3, at: K(80.0, 13.0), mpp: 4500, e: inOut },
  { t: C.gali + 0.1, at: K(80.5, 12.5), mpp: 4300, e: linear },
  { t: C.malacca1 + 0.5, at: K(99.3, 4.4), mpp: 720, e: inOut },
  { t: C.darwaze, at: K(99.0, 4.6), mpp: 760, e: linear },
  { t: C.an2 + 0.5, at: K(94.0, 9.0), mpp: 980, e: inOut },
  { t: C.indira - 0.1, at: K(94.0, 8.6), mpp: 900, e: linear },
  { t: C.n145 + 0.3, at: K(94.45, 6.45), mpp: 175, e: inOut },
  { t: C.tri - 0.6, at: K(94.45, 6.5), mpp: 165, e: linear },
  { t: C.tri + 0.4, at: K(92.75, 11.4), mpp: 520, e: inOut },
  { t: C.air + 1.0, at: K(92.75, 11.45), mpp: 490, e: linear },
  { t: C.naam + 0.4, at: up(K(102.0, 12.0), 3200), mpp: 3200, e: inOut },
  { t: C.dilemma + 0.8, at: up(K(102.0, 12.5), 3100), mpp: 3100, e: linear },
  { t: C.ports + 0.4, at: K(80.0, 14.0), mpp: 4700, e: inOut },
  { t: C.base + 0.6, at: K(80.5, 14.0), mpp: 4550, e: linear },
  { t: C.string - 0.3, at: up(K(80.5, 14.0), 4500), mpp: 4500, e: inOut },
  { t: C.jawab - 0.2, at: up(K(80.5, 14.3), 4400), mpp: 4400, e: linear },
  { t: C.necklace + 0.4, at: K(78.0, 14.0), mpp: 4500, e: inOut },
  { t: C.duqm + 0.8, at: K(78.0, 14.2), mpp: 4400, e: linear },
  { t: C.sabang + 0.4, at: K(95.6, 6.4), mpp: 520, e: inOut },
  { t: C.muhaane + 0.6, at: K(95.7, 6.3), mpp: 480, e: linear },
  { t: C.n2035 + 0.5, at: K(82.0, 12.0), mpp: 4200, e: inOut },
  { t: C.n200 + 0.8, at: K(82.5, 12.0), mpp: 4000, e: linear },
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
const HITS = () => [C.an1, C.tel1, C.darr1, C.n370, C.n140, C.n80, C.malacca1, C.an2, C.n145, C.army, C.navy2, C.air, C.dilemma, C.gwadar, C.hambantota, C.kyaukpyu, C.djibouti, C.string, C.necklace, C.chabahar, C.duqm, C.sabang, C.n2035, C.n200];
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
export const rollAt = (t: number) => 0.7 * Math.sin(t * LOOPF(7) + 0.4) + 2.0 * Math.exp(-(((t - C.china3 - 0.3) / 0.45) ** 2)) - 1.8 * Math.exp(-(((t - C.malacca1) / 0.4) ** 2)) + 1.8 * Math.exp(-(((t - C.ports) / 0.45) ** 2)) - 1.6 * Math.exp(-(((t - C.sabang) / 0.4) ** 2));
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.darr1, 8], [C.dilemma, 7], [C.djibouti + 0.3, 6], [C.n200, 5]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
