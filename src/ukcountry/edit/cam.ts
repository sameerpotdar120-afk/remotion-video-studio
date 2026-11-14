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
  plates: Record<string, Plate>; countries: Record<string, P[][]>; nib: P[][]; inb: P[][]; borders: P[][];
  places: Record<string, P>; castles: Record<string, P>; centroids: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;

export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: India, where the Angrez ruled. */
export const HOOK: P = K(80, 22.5);
export const HOOK_MPP = 4300;
const UK = K(-3.6, 54.6), UKUP = K(-3.6, 54.6), WALES = K(-3.7, 52.45), BORDER = K(-3.2, 55.2), PANAMA = K(-78.5, 9.0), IRL = K(-7.3, 53.6), MID = K(30, 42);
const up = (p: P, mpp: number): P => [p[0], p[1] - 480 * mpp];
const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.uk1 - 0.5, at: K(79, 23), mpp: 4000, e: linear },
  { t: C.uk1 + 0.4, at: MID, mpp: 11000, e: inOut },
  { t: C.char1 + 0.4, at: UK, mpp: 1050, e: inOut },
  { t: C.parl1 - 0.1, at: UK, mpp: 1000, e: linear },
  { t: C.n1801a + 0.2, at: K(-7.0, 53.5), mpp: 700, e: inOut },
  { t: C.kaise + 0.2, at: K(-7.0, 53.5), mpp: 680, e: linear },
  { t: C.king, at: UKUP, mpp: 1000, e: inOut },
  { t: C.capital + 0.6, at: UK, mpp: 950, e: linear },
  { t: C.vishwas + 0.2, at: up(UK, 1000), mpp: 1000, e: inOut },
  { t: C.engwales + 1.0, at: up(UK, 980), mpp: 980, e: linear },
  { t: C.football + 0.4, at: UK, mpp: 1000, e: inOut },
  { t: C.teamgb + 0.6, at: UK, mpp: 960, e: linear },
  { t: C.shuruat + 0.8, at: WALES, mpp: 330, e: inOut },
  { t: C.kilon + 1.4, at: K(-3.9, 52.7), mpp: 300, e: linear },
  { t: C.baari + 0.6, at: BORDER, mpp: 700, e: inOut },
  { t: C.n1603 + 0.2, at: BORDER, mpp: 680, e: linear },
  { t: C.raja + 0.3, at: K(-2.0, 53.6), mpp: 1050, e: inOut },
  { t: C.london1 + 0.6, at: K(-1.5, 53.0), mpp: 1000, e: linear },
  { t: C.panama + 0.5, at: PANAMA, mpp: 1500, e: inOut },
  { t: C.doob + 0.5, at: PANAMA, mpp: 1400, e: linear },
  { t: C.n1707 + 0.6, at: K(-4.0, 56.4), mpp: 650, e: inOut },
  { t: C.church + 0.6, at: K(-4.0, 56.3), mpp: 630, e: linear },
  { t: C.gb + 0.3, at: UK, mpp: 1000, e: inOut },
  { t: C.ireland1 + 0.7, at: IRL, mpp: 620, e: inOut },
  { t: C.vote + 0.4, at: IRL, mpp: 600, e: linear },
  { t: C.ukd + 0.4, at: K(-4.8, 54.6), mpp: 1000, e: inOut },
  { t: C.irish + 0.6, at: IRL, mpp: 700, e: inOut },
  { t: C.uttar + 0.4, at: K(-6.8, 54.2), mpp: 560, e: inOut },
  { t: C.batwara - 0.1, at: up(K(-4.0, 54.0), 900), mpp: 900, e: inOut },
  { t: C.n1947 - 0.3, at: up(K(-4.0, 54.0), 880), mpp: 880, e: linear },
  { t: C.n1947 + 0.7, at: up(K(76, 27), 2600), mpp: 2600, e: inOut },
  { t: C.bharat + 1.3, at: up(K(76, 27), 2500), mpp: 2500, e: linear },
  { t: C.naam + 0.5, at: UK, mpp: 1000, e: inOut },
  { t: C.nation + 0.6, at: UK, mpp: 960, e: linear },
  { t: C.agli + 1.2, at: MID, mpp: 9000, e: inOut },
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
const HITS = () => [C.n1801a, C.kaise, C.king, C.passport, C.army, C.eng_list, C.scot_list, C.wales_list, C.ni_list, C.cricket, C.teamgb, C.n13, C.n1603, C.n1707, C.gb, C.n1801b, C.ukd, C.n1922, C.n1947, C.sovereign];
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
export const rollAt = (t: number) => 0.7 * Math.sin(t * LOOPF(7) + 0.4) + 2.4 * Math.exp(-(((t - C.uk1) / 0.45) ** 2)) - 2.0 * Math.exp(-(((t - C.panama - 0.1) / 0.4) ** 2)) + 1.8 * Math.exp(-(((t - C.n1947) / 0.4) ** 2)) - 2.0 * Math.exp(-(((t - C.agli - 0.6) / 0.5) ** 2));
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.bribe + 0.3, 9], [C.scots + 0.4, 8], [C.doob, 7], [C.khitab + 0.9, 10], [C.n1922, 6], [C.sovereign, 6]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
