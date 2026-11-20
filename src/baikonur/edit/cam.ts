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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; ussr: P[][]; ussr_parts: Record<string, P[][]>; borders: P[][];
  lease: P[]; places: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: the lease circle in the steppe, a little left of centre (Rakesh rises on its right). */
export const HOOK: P = K(63.62, 45.86);
export const HOOK_MPP = 135;
/** Moves the focus point into the top half (while Null fills the bottom half). */
const up = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const L = (k: string): P => GEO.places[k];
const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.kiraya1 - 0.2, at: K(63.6, 45.86), mpp: 125, e: linear },
  { t: C.dollar1 + 0.4, at: K(63.55, 45.88), mpp: 118, e: linear },
  { t: C.kz1 + 0.5, at: K(67.0, 47.6), mpp: 3600, e: inOut },
  { t: C.registan + 0.3, at: K(66.0, 47.0), mpp: 3300, e: linear },
  { t: C.ghera1 + 0.5, at: L('lease_c'), mpp: 190, e: inOut },
  { t: C.bk1 + 0.1, at: L('lease_c'), mpp: 170, e: linear },
  { t: C.spaceport1 + 0.2, at: L('gagarin_start'), mpp: 9, e: inOut },
  { t: C.n1955 - 0.25, at: L('gagarin_start'), mpp: 8, e: linear },
  { t: C.soviet1 + 0.6, at: K(72.0, 56.0), mpp: 11000, e: inOut },
  { t: C.ussr + 0.6, at: K(73.0, 56.5), mpp: 10500, e: linear },
  { t: C.n1957 + 0.3, at: K(63.45, 45.93), mpp: 260, e: inOut },
  { t: C.n1961 - 0.2, at: K(63.45, 45.93), mpp: 240, e: linear },
  { t: C.n1961 + 0.3, at: K(63.2, 45.93), mpp: 230, e: inOut },
  { t: C.n1984 - 0.2, at: K(63.2, 45.93), mpp: 225, e: linear },
  { t: C.n1984 + 0.3, at: K(63.62, 45.9), mpp: 210, e: inOut },
  { t: C.rakesh2 + 0.6, at: K(63.62, 45.9), mpp: 200, e: linear },
  { t: C.toot + 0.2, at: up(K(72.0, 56.0), 11000), mpp: 11000, e: inOut },
  { t: C.desh + 0.6, at: up(K(70.0, 52.0), 7500), mpp: 7500, e: inOut },
  { t: C.kiraye + 0.4, at: K(60.0, 52.5), mpp: 6200, e: inOut },
  { t: C.n2050 + 0.4, at: K(61.0, 52.0), mpp: 5900, e: linear },
  { t: C.ghere2 + 0.4, at: L('lease_c'), mpp: 160, e: inOut },
  { t: C.rouble + 0.6, at: L('lease_c'), mpp: 150, e: linear },
  { t: C.kyun1 + 0.3, at: up(K(72.0, 40.0), 7000), mpp: 7000, e: inOut },
  { t: C.south - 0.2, at: K(72.0, 36.0), mpp: 6600, e: inOut },
  { t: C.equator + 0.5, at: K(72.0, 31.0), mpp: 7200, e: inOut },
  { t: C.dharti - 0.1, at: K(72.0, 31.5), mpp: 7000, e: linear },
  { t: C.dhakka + 0.2, at: K(63.5, 45.95), mpp: 220, e: inOut },
  { t: C.fuel + 0.5, at: K(63.5, 45.95), mpp: 200, e: linear },
  { t: DURATION_S, at: HOOK, mpp: HOOK_MPP, e: inOut },
];
let FULL: { t: number; x: number; y: number; mpp: number; e: Ease }[] | null = null;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  FULL ??= keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], mpp: k.mpp, e: k.e ?? linear }));
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
const HITS = () => [C.kiraya1, C.n115a, C.kz1, C.ghera1, C.spaceport1, C.n1955, C.n1957, C.n1961, C.n1984, C.toot, C.kiraye, C.n2050, C.kanoon, C.rouble, C.south, C.equator, C.dhakka];
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
/** A slow camera roll (degrees), with kicks on the big moves. */
export const rollAt = (t: number) => 0.6 * Math.sin(t * LOOPF(7) + 0.4) + 1.6 * Math.exp(-(((t - C.kz1 - 0.2) / 0.45) ** 2)) - 1.6 * Math.exp(-(((t - C.soviet1) / 0.45) ** 2)) + 1.5 * Math.exp(-(((t - C.toot) / 0.4) ** 2)) - 1.4 * Math.exp(-(((t - C.kyun1) / 0.45) ** 2));
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.kiraya1, 8], [C.toot, 9], [C.n2050, 6], [C.dhakka, 7]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
