import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export type Zone = { z0: number; z1: number; rings: P[][] };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; provinces: Record<string, P[][]>; admin1: Record<string, P[][]>;
  zones: Zone[]; points: Record<string, P>; rail: P[];
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
/** All of the US and Canada, with the lower 48 in the upper middle so the captions sit on the Gulf. */
export const NA: P = merc(-100, 45);
export const NA_MPP = 9000;
/** Frame 0 (and the loop's last frame): the continent, a little further out and tilted (see tiltAt). */
export const CAM0: Cam = { x: NA[0], y: NA[1] + 300000, mpp: 9800 };
const CASC = add(mid(PT.Vancouver, PT.Seattle), 0, -10000);
const CD = mid(PT.Calgary, PT.Destin);
const CANADA: P = merc(-112, 58);

const keys = (): Key[] => [
  // line 1: the continent tilted, then the dive to Vancouver and Seattle (the hook: 3 hours there, 5 back)
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.vancouver1 - 0.1, at: NA, mpp: NA_MPP, e: linear },
  { t: C.vancouver1 + 0.75, at: add(CASC, 0, 8000), mpp: 330, e: inOut },
  { t: C.five1 + 0.4, at: CASC, mpp: 290, e: linear },
  // line 2: out to the continent; the zones develop, the tags, the meridians, the clocks
  { t: C.kyu2 + 0.7, at: NA, mpp: NA_MPP, e: inOut },
  { t: C.east2, at: add(NA, -250000, 0), mpp: 8700, e: linear },
  { t: C.end6, at: add(NA, 250000, 0), mpp: 8500, e: linear },
  // line 3 (the clock covers it): back on the continent for the recolour
  { t: C.ulta3, at: NA, mpp: NA_MPP, e: inOut },
  { t: C.end8 + 0.2, at: NA, mpp: 8700, e: linear },
  // line 4: Calgary, the whip to Destin, out to both (the line, the meridians), the same time
  { t: C.calgary4 - 0.05, at: add(PT.Calgary, 0, -60000), mpp: 1250, e: inOut },
  { t: C.destin4 - 0.55, at: add(PT.Calgary, 0, -60000), mpp: 1150, e: linear },
  { t: C.destin4 + 0.05, at: add(PT.Destin, 0, -60000), mpp: 1250, e: inOut },
  { t: C.doori4 + 0.1, at: add(PT.Destin, 0, -60000), mpp: 1150, e: linear },
  { t: C.doori4 + 1.0, at: add(CD, 0, -250000), mpp: 4700, e: inOut },
  { t: C.end12, at: add(CD, 0, -250000), mpp: 4400, e: linear },
  // line 5: to Vancouver (the ring), the dive into it, the two meridians, the border split
  { t: C.ulta5 + 0.55, at: PT.Vancouver, mpp: 2600, e: inOut },
  { t: C.vancouver5 - 0.25, at: PT.Vancouver, mpp: 2300, e: linear },
  { t: C.vancouver5 + 0.35, at: CASC, mpp: 245, e: inOut },
  { t: C.clocks5 - 0.25, at: CASC, mpp: 225, e: linear },
  { t: C.clocks5 + 0.3, at: add(CASC, 0, 15000), mpp: 520, e: inOut },
  { t: C.end16, at: add(CASC, 0, 15000), mpp: 490, e: linear },
  { t: C.train6 + 0.3, at: CASC, mpp: 215, e: inOut },
  // line 6: the train runs the line (the station insert covers 'par ghadi dekho')
  { t: C.ghadi6 + 0.2, at: CASC, mpp: 200, e: linear },
  { t: C.end19, at: CASC, mpp: 190, e: linear },
  // line 7: out to the continent, the rings and the question marks
  { t: C.aise7 + 0.55, at: NA, mpp: NA_MPP, e: inOut },
  { t: C.bc8 - 0.2, at: add(NA, 0, -150000), mpp: 8600, e: linear },
  // line 8: Canada's west, the provinces one by one, the padlocks
  { t: C.bc8 + 0.45, at: CANADA, mpp: 6600, e: inOut },
  { t: C.end25, at: add(CANADA, 0, -100000), mpp: 6100, e: linear },
  // line 9: the continent: everyone else turns back, the map slips
  { t: C.baaki9 + 0.6, at: NA, mpp: NA_MPP, e: inOut },
  { t: C.end28, at: add(NA, 0, 100000), mpp: 8600, e: linear },
  // line 10: spring, the map straightens, then back to frame 0
  { t: C.tabtak10, at: add(NA, 0, 150000), mpp: 8800, e: linear },
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
      // on big zooms the position follows the zoom (log-span), so the target stays put on screen
      let q = p;
      if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp };
    }
  }
  return FULL[FULL.length - 1];
};

/** Zoom punches on the big hits. */
export const HITS = () => [C.vancouver1 + 0.75, C.ulta3, C.calgary4 - 0.05, C.destin4 + 0.05, C.vancouver5 + 0.35, C.bc8 + 0.45, C.khisak9];
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
/** The opening tilt (the reference's world map seen from an angle), flattening in the first 0.8 s and back at the end. */
export const tiltAt = (t: number) => {
  const a = 1 - clamp(t / 0.8), b = clamp((t - (DURATION_S - 0.9)) / 0.9);
  const e = (x: number) => x * x * (3 - 2 * x);
  return 22 * Math.max(e(a), e(b));
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.ulta3 + 0.15, 9], [C.khisak9 + 0.3, 8], [C.chhod8 + 0.9, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
