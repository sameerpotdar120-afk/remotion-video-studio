import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; fence: P[]; countries: Record<string, P[][]>; states: Record<string, P[][]>; statePts: Record<string, P>;
  land: P[][]; londonNY: P[]; points: Record<string, P>; sides: { sheep: P[][]; dingo: P[][] };
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Frame 0 and the loop's end: the Indian and Pacific Oceans with Australia, seen south-up (see rotAt). */
export const INDO: P = merc(128, -22);
export const INDO_MPP = 7600;
/** Australia, a little high so the captions sit on the Southern Ocean. */
export const AUS: P = merc(134, -29.5);
export const AUS_MPP = 4300;
/** The fence close-up (the magnifier dives here): a stretch north-east of Coober Pedy. */
export const FENCE_PT: P = merc(134.505, -28.755);
export const CLOSE_MPP = 34;
/** Where the lens finds the fence (screen-space search path is in DingoFence.tsx). */
const SE: P = merc(146, -31.5);
const SYD: P = merc(149.5, -33.3);

const keys = (): Key[] => [
  // line 1: the south-up ocean view (frame 0), the flip, the push onto Australia as the fence flashes across
  { t: 0, at: INDO, mpp: INDO_MPP },
  { t: C.longest - 0.1, at: INDO, mpp: 7200, e: linear },
  { t: C.n5614 + 0.2, at: AUS, mpp: AUS_MPP, e: inOut },
  // line 2: the magnifier searches over a still map (the lens has its own camera); then the dive lands on the fence
  { t: C.is + 0.55, at: add(AUS, 0, 0), mpp: 4100, e: linear },
  { t: C.is + 0.56, at: FENCE_PT, mpp: CLOSE_MPP, e: linear },
  { t: C.runs, at: add(FENCE_PT, 900, 0), mpp: CLOSE_MPP * 0.9, e: linear },
  // line 3: the fast pull-back to the continent, the fence draws, the states lift; the comparison panel (Australia left)
  { t: C.three + 0.4, at: AUS, mpp: AUS_MPP, e: inOut },
  { t: C.longer - 0.4, at: add(AUS, 0, 80000), mpp: 4100, e: linear },
  { t: C.longer + 0.1, at: add(AUS, 270 * 9000, 0), mpp: 9000, e: inOut },
  { t: C.built - 0.2, at: add(AUS, 270 * 8800, 0), mpp: 8800, e: linear },
  // line 4: back to the continent, closer on the fence's middle for the dingo silhouette
  { t: C.built + 0.4, at: AUS, mpp: AUS_MPP, e: inOut },
  { t: C.dingo, at: merc(139, -29.5), mpp: 2600, e: inOut },
  // (the board covers 24-36.4; the parchment map uses this camera 36.4-53.4)
  { t: C.then + 0.3, at: merc(128, -26), mpp: 7400, e: inOut },
  { t: C.europeans + 0.8, at: merc(140, -32), mpp: 5200, e: inOut },
  { t: C.brought, at: SYD, mpp: 1500, e: inOut },
  { t: C.fora - 0.1, at: add(SYD, -60000, 0), mpp: 1400, e: linear },
  { t: C.fora + 0.6, at: add(SYD, -220000, 0), mpp: 1900, e: inOut },
  { t: C.by - 0.3, at: add(SYD, -200000, 0), mpp: 1800, e: linear },
  // line 10-12: the satellite again: the old fences join and turn blue, the two sides fill, the question
  { t: C.y1940 + 0.3, at: AUS, mpp: AUS_MPP, e: inOut },
  { t: C.sheepside - 0.2, at: add(AUS, 50000, 0), mpp: 4100, e: linear },
  { t: C.whos, at: add(AUS, 80000, 0), mpp: 4000, e: linear },
  { t: C.end - 0.6, at: add(AUS, 120000, 0), mpp: 3800, e: linear },
  { t: DURATION_S, at: INDO, mpp: INDO_MPP, e: inOut },
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
export const HITS = () => [C.n5614 + 0.2, C.three + 0.4, C.dingo, C.giant];
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
/** The cut into the close-up is hidden by the lens filling the screen: no smoothing across it. */
const CUT = () => C.is + 0.555;
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lm = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    let tt = wrap(t + SMOOTH[i]);
    if ((t < CUT()) !== (tt < CUT())) tt = t < CUT() ? CUT() - 0.001 : CUT() + 0.001;
    const k = camRaw(tt);
    x += k.x * W8[i]; y += k.y * W8[i]; lm += Math.log(k.mpp) * W8[i];
  }
  const mpp = Math.exp(lm);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.05 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.02 * Math.sin(t * LOOPF(13)) + 0.008 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
/** The map's rotation (degrees): south-up at frame 0, the fast flip to north-up on "longest", back again at the end. */
export const rotAt = (t: number) => {
  const e = (x: number) => x * x * (3 - 2 * x);
  const a = clamp((t - (C.never + 0.2)) / 0.75), b = clamp((t - (DURATION_S - 0.75)) / 0.75);
  return 180 * (1 - e(a)) + 180 * e(b);
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const toW = (c: Cam, s: P): P => [c.x + (s[0] - 540) * c.mpp, c.y - (s[1] - 960) * c.mpp];
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: P[]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
export const camMotion = (t: number) => {
  if (Math.abs(t - CUT()) < 0.02) return { vx: 0, vy: 0, zoom: 0 };
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.n5614 + 0.1, 5], [C.giant, 6], [C.dingo, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
/** The fence's cumulative length (Mercator metres) along its points, for drawing it on progressively. */
export const FENCE_LEN = (() => { const L = [0]; for (let i = 1; i < GEO.fence.length; i++) L.push(L[i - 1] + Math.hypot(GEO.fence[i][0] - GEO.fence[i - 1][0], GEO.fence[i][1] - GEO.fence[i - 1][1])); return L; })();
/** The first fraction p (0..1) of the fence. */
export const fencePart = (p: number, from = 0): P[] => {
  const tot = FENCE_LEN[FENCE_LEN.length - 1], a = tot * from, b = tot * p;
  const out: P[] = [];
  for (let i = 0; i < GEO.fence.length; i++) {
    const l = FENCE_LEN[i];
    if (l >= a && l <= b) out.push(GEO.fence[i]);
    if (l > b) {
      const l0 = FENCE_LEN[i - 1], q = (b - l0) / Math.max(1e-6, l - l0), p0 = GEO.fence[i - 1], p1 = GEO.fence[i];
      out.push([p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q]);
      break;
    }
  }
  return out;
};
export { SE };
