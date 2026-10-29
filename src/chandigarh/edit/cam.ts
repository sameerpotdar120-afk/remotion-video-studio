import { Easing } from 'remotion';
import { Ease, kick, lerp, linear } from '../../darien/anim';

/** A snappy in-out: the moves get where they're going faster (the creator wants a quicker pace). */
const inOut: Ease = Easing.bezier(0.7, 0, 0.18, 1);
import timing from './timing.json';
import { Cam, merc } from '../motion/MapView';

export type P = [number, number];
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
export { merc };
export type { Cam };

type Key = { t: number; at: P; mpp: number; e?: Ease };
const at = (lon: number, lat: number): P => merc(lon, lat);

/** Frame 0 (and the loop's last frame): India big and red on the warm relief map. */
export const CAM0: Cam = { x: merc(82, 22)[0], y: merc(82, 22)[1], mpp: 3200 };
const INDIA0: P = [CAM0.x, CAM0.y], NORTH = at(78.5, 27.5), CHD = at(76.78, 30.74), CHD_UP = at(76.8, 30.62);
const PB = at(74.9, 30.9), PB_IN = at(75.6, 30.9), HILLS = at(76.65, 31.0), SITE = at(76.78, 30.76);

// The map shots: lines 1–4 (0 → "Chandigarh।" and the city view after it) and the loop's pull-out after "इसीलिए".
// Between them the camera holds; those stretches are paper, photos and Null.
const keys = (): Key[] => [
  // line 1: India big, a slow push the whole time; the bubble; push in on north India as the bubble closes
  { t: 0, at: INDIA0, mpp: CAM0.mpp },
  { t: C.design1, at: at(80.5, 23.6), mpp: 2900, e: linear },
  { t: C.jee2 - 0.2, at: NORTH, mpp: 1500, e: inOut },
  // line 2: on the city for the head, heart, lungs and veins
  { t: C.sir2 - 0.3, at: CHD_UP, mpp: 540, e: inOut },
  { t: C.hum2, at: CHD_UP, mpp: 390, e: linear },
  // "हम बात कर रहे हैं, Chandigarh की": back out to all of India
  { t: C.chd2 - 0.1, at: at(80, 23.5), mpp: 3100, e: inOut },
  { t: C.bantwara3 - 0.3, at: at(79.5, 24.5), mpp: 2850, e: linear },
  // line 3: partition (Pakistan, Punjab, Lahore), then the push in on Indian Punjab and the "?" pin
  { t: C.lahore3 - 0.2, at: PB, mpp: 1350, e: inOut },
  { t: C.azaad3, at: PB, mpp: 1250, e: linear },
  { t: C.chahiye3, at: PB_IN, mpp: 900, e: inOut },
  { t: C.zameen4 - 0.1, at: at(75.9, 30.95), mpp: 680, e: linear },
  // line 4: down onto the foothills, the site, the icons, the temple
  { t: C.shivalik4, at: HILLS, mpp: 600, e: inOut },
  { t: C.neeche4 + 0.3, at: SITE, mpp: 430, e: inOut },
  { t: C.paas4 + 0.4, at: SITE, mpp: 330, e: linear },
  // after the temple: the UT on the city plate, a slow pull out while it greys
  { t: C.chd4 - 0.2, at: CHD, mpp: 32, e: linear },
  { t: C.design5 + 0.6, at: CHD, mpp: 44, e: linear },
  // the loop: from just after "इसीलिए" out to frame 0
  { t: C.isiliye13 - 0.25, at: at(78.6, 26.5), mpp: 2300, e: linear },
  { t: DURATION_S, at: INDIA0, mpp: CAM0.mpp, e: inOut },
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
/** Zoom punches on the big hits (the reference punches in on nearly every new element). */
export const HITS = () => [C.chd2, C.bantwara3, C.lahore3, C.ittefaq4, C.chd4];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
export const camAt = (t: number): Cam => {
  const k = camRaw(t);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.05 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.016 * Math.sin(t * LOOPF(41)) + 0.008 * Math.sin(t * LOOPF(73) + 1.3)) * (1 - punch);
  const drift = k.mpp * 7;
  return { x: k.x + Math.sin(t * LOOPF(31)) * drift, y: k.y + Math.sin(t * LOOPF(27)) * drift, mpp: k.mpp * breathe };
};
export const toS = (c: Cam, p: number[]): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ll = (c: Cam, lon: number, lat: number) => toS(c, merc(lon, lat));
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
/** Camera jolts on the slams: the ✕ on the computer, the ✕ on the car, the seal. */
export const shake = (t: number, hits: number[]): P => {
  let x = 0, y = 0;
  for (const t0 of hits) {
    x += kick(t, t0, 7, 31, 9);
    y += kick(t, t0 + 0.02, 5, 27, 9);
  }
  return [x, y];
};
