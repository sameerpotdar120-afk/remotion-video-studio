import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; states: Record<string, P[][]>; statePts: Record<string, P>;
  dcRing: P[][]; nyDistricts: Record<string, P[][]>; nyDistrictPts: Record<string, P>; points: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };
const PT = GEO.points;
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** The lower 48, sitting in the upper middle so the captions fall on the Gulf. */
export const US: P = merc(-96, 35.5);
export const US_MPP = 6000;
/** Frame 0 (and the loop's last frame): North America from high up, tilted (see tiltAt). */
export const CAM0: Cam = { x: merc(-98, 42)[0], y: merc(-98, 42)[1], mpp: 11500 };
const NYV: P = merc(-75.6, 41.9);
const WYV: P = merc(-107.55, 42.2);
const DCA: P = merc(-77.02, 38.885);
const WH = PT['White House'], CAP = PT.Capitol;

const keys = (): Key[] => [
  // line 1: the continent, the arcs flip; then the US, Wyoming and New York with their people and their two senators
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.but - 0.2, at: add([CAM0.x, CAM0.y], 0, -150000), mpp: 10200, e: linear },
  { t: C.wyoming0 - 0.1, at: US, mpp: US_MPP, e: inOut },
  { t: C.heres - 0.2, at: add(US, 120000, 0), mpp: 5600, e: linear },
  // line 2-3: the dive to Washington DC (the district's diamond), then the White House, the pan along the Mall to the Capitol
  { t: C.heres + 1.0, at: DCA, mpp: 34, e: inOut },
  { t: C.this - 0.1, at: add(DCA, 0, 600), mpp: 28, e: linear },
  { t: C.whitehouse - 0.05, at: add(WH, 0, -250), mpp: 3.4, e: inOut },
  { t: C.andjust, at: add(WH, 150, -250), mpp: 3.1, e: linear },
  { t: C.capitol - 0.1, at: add(CAP, -120, -250), mpp: 3.4, e: inOut },
  { t: C.meets + 0.6, at: add(CAP, -60, -250), mpp: 3.1, e: linear },
  // (the board covers 19-26.5) the map waits on the US
  { t: C.inhouse - 0.6, at: US, mpp: US_MPP, e: inOut },
  { t: C.population, at: add(US, 80000, 0), mpp: 5600, e: linear },
  // line 5: New York (its 26 districts), a push into New York City, the whip to Wyoming (one district)
  { t: C.population + 0.75, at: NYV, mpp: 860, e: inOut },
  { t: C.ny26 + 0.15, at: add(NYV, 20000, 0), mpp: 800, e: linear },
  { t: C.ny26 + 1.2, at: add(PT.NYC, 0, 15000), mpp: 150, e: inOut },
  { t: C.wyoming2 - 0.35, at: add(PT.NYC, 0, 15000), mpp: 135, e: linear },
  { t: C.wyoming2 + 0.25, at: WYV, mpp: 1250, e: inOut },
  { t: C.one + 0.6, at: WYV, mpp: 1130, e: linear },
  // line 6 (Null A splits): New York again, a representative in each district
  { t: C.each + 0.2, at: add(NYV, 0, 230000), mpp: 900, e: inOut },
  { t: C.so - 0.3, at: add(NYV, 30000, 230000), mpp: 860, e: linear },
  // (the board covers 39.3-44.4) line 8: the whole country, two senators in every state
  { t: C.insenate - 0.4, at: US, mpp: US_MPP, e: inOut },
  { t: C.senserve - 0.2, at: add(US, -100000, 0), mpp: 5500, e: linear },
  // (the board covers 51.7-69.9) the close: Wyoming and New York side by side again, then back to frame 0
  { t: C.should - 0.5, at: add(US, 300000, 150000), mpp: 5300, e: inOut },
  { t: C.yorkers + 0.3, at: add(US, 350000, 150000), mpp: 5000, e: linear },
  { t: DURATION_S, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp, e: inOut },
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
export const HITS = () => [C.wyoming0 - 0.1, C.heres + 1.0, C.whitehouse - 0.05, C.capitol - 0.1, C.ny26 + 0.15, C.wyoming2 + 0.25];
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
  for (const h of HITS()) if (t > h) punch += 0.05 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.02 * Math.sin(t * LOOPF(13)) + 0.008 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
/** The opening tilt, flattening in the first 0.9 s and back over the last 0.9 s. */
export const tiltAt = (t: number) => {
  const a = 1 - clamp(t / 0.9), b = clamp((t - (DURATION_S - 0.9)) / 0.9);
  const e = (x: number) => x * x * (3 - 2 * x);
  return 24 * Math.max(e(a), e(b));
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.ny26, 6], [C.one, 7], [C.senateexists, 6]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
export { mid };
