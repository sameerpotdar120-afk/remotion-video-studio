import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
const D2R = Math.PI / 180;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * lon * D2R, R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * D2R) / 2))];
export const mercY = (lat: number) => merc(0, lat)[1];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; deg: Record<string, P[][]>; borders: P[][]; land: P[][];
  measure: { glNS: [P, P]; glEW: [P, P]; inNS: [P, P]; inEW: [P, P] }; centroids: Record<string, P>;
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

/** Frame 0 and the loop's end: Greenland and India together on the world map. */
export const HOOK: P = [merc(12, 0)[0], 6.19e6];
export const HOOK_MPP = 18500;
/** Greenland alone, then Greenland in the top half (the India panel takes the bottom half). */
const GL_CLOSE: P = [merc(-40, 0)[0], 13.3e6];
const GL_SPLIT: P = [merc(-40, 0)[0], 13.4e6 - 480 * 11500];
/** Greenland and Africa in one frame. */
const AF_GL: P = [merc(-10, 0)[0], 7.13e6];
/** The whole world, as the stretched gores leave it; then the Tissot view. */
export const WORLD: P = [0, 0];
export const WORLD_MPP = 37100;
const TISSOT: P = [0, 5.0e6];
/** The end: India and the moved, true-size Greenland. */
const PAIR: P = [merc(68, 0)[0], mercY(27)];

const keys = (): Key[] => [
  { t: 0, at: HOOK, mpp: HOOK_MPP },
  { t: C.gl1, at: HOOK, mpp: 17600, e: linear },
  { t: C.neeche1 + 0.2, at: GL_CLOSE, mpp: 7300, e: inOut },
  { t: C.in1 - 0.1, at: GL_CLOSE, mpp: 6900, e: linear },
  { t: C.in1 + 0.5, at: GL_SPLIT, mpp: 11500, e: inOut },
  { t: C.area - 0.2, at: GL_SPLIT, mpp: 10900, e: linear },
  { t: C.area + 0.6, at: HOOK, mpp: HOOK_MPP, e: inOut },
  { t: C.uthakar, at: HOOK, mpp: 17800, e: linear },
  { t: C.glpar + 1.0, at: [merc(-38, 0)[0], 12.4e6], mpp: 9800, e: inOut },
  { t: C.africa, at: [merc(-38, 0)[0], 12.4e6], mpp: 9400, e: linear },
  { t: C.africa + 0.8, at: AF_GL, mpp: 14500, e: inOut },
  { t: C.gadbad - 0.3, at: AF_GL, mpp: 13900, e: linear },
  // Null takes the bottom half: the stack of Greenland on Africa fits the top half
  { t: C.gadbad + 0.3, at: [merc(10, 0)[0], 3.6e6 - 480 * 21000], mpp: 21000, e: inOut },
  { t: C.y1569 + 1.6, at: [merc(10, 0)[0], 3.6e6 - 480 * 21000], mpp: 19500, e: linear },
  // (the parchment, the atlas and phone, and the globe have their own cameras, 47.2-79.1)
  { t: C.pole - 0.35, at: WORLD, mpp: WORLD_MPP, e: linear },
  { t: C.pole + 0.6, at: TISSOT, mpp: 20500, e: inOut },
  { t: C.glbeech - 0.3, at: TISSOT, mpp: 19800, e: linear },
  { t: C.glbeech + 0.6, at: HOOK, mpp: HOOK_MPP, e: inOut },
  { t: C.ablao, at: HOOK, mpp: 17600, e: linear },
  { t: C.asli + 1.2, at: PAIR, mpp: 10500, e: inOut },
  { t: C.chhota4 + 0.9, at: PAIR, mpp: 9900, e: linear },
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
export const HITS = () => [C.n2670, C.n3214, C.n14, C.n10];
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
/** The cut back from the stretched gores to the map: no smoothing across it. */
export const CUT = () => C.pole - 0.35;
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
  for (const h of HITS()) if (t > h) punch += 0.035 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.016 * Math.sin(t * LOOPF(13)) + 0.006 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 6;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const toW = (c: Cam, s: P): P => [c.x + (s[0] - 540) * c.mpp, c.y - (s[1] - 960) * c.mpp];
export const ringsD = (c: Cam, rings: P[][], dx = 0, dy = 0) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${(sx + dx).toFixed(1)},${(sy + dy).toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: P[]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
export const camMotion = (t: number) => {
  if (Math.abs(t - CUT()) < 0.02) return { vx: 0, vy: 0, zoom: 0 };
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.n2670, 4], [C.n3214, 4], [C.n14, 5], [C.n10, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

// ------------------------------------------------------------------ the sphere: true-size moves and Tissot circles
type V3 = [number, number, number];
const vec = (lon: number, lat: number): V3 => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
const ll = (v: V3): P => [Math.atan2(v[1], v[0]) / D2R, Math.asin(Math.max(-1, Math.min(1, v[2]))) / D2R];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Rotate v about the unit axis k by angle a (Rodrigues). */
const rot = (v: V3, k: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a), kv = cross(k, v), d = dot(k, v) * (1 - c);
  return [v[0] * c + kv[0] * s + k[0] * d, v[1] * c + kv[1] * s + k[1] * d, v[2] * c + kv[2] * s + k[2] * d];
};
/** A shape (lon/lat rings) carried over the globe from `from` to `to` (fraction p of the way along the great circle),
 *  keeping its true size, then drawn in Mercator metres: what thetruesize.com does. */
export const moveTrue = (rings: P[][], from: P, to: P, p: number): P[][] => {
  const a = vec(from[0], from[1]), b = vec(to[0], to[1]);
  const ax = cross(a, b), n = Math.hypot(ax[0], ax[1], ax[2]);
  if (n < 1e-9 || p <= 0) return rings.map((r) => r.map(([lo, la]) => merc(lo, la)));
  const k: V3 = [ax[0] / n, ax[1] / n, ax[2] / n];
  const ang = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * p;
  return rings.map((r) => r.map(([lo, la]) => { const [x, y] = ll(rot(vec(lo, la), k, ang)); return merc(x, y); }));
};
/** A circle of radius km on the ground around (lon, lat), as Mercator metres: a Tissot indicatrix. */
export const groundCircle = (lon: number, lat: number, km: number, n = 48): P[] => {
  const d = km / 6371, out: P[] = [];
  const la1 = lat * D2R, lo1 = lon * D2R;
  for (let i = 0; i <= n; i++) {
    const br = (i / n) * 2 * Math.PI;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(br));
    const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
    out.push(merc(lo2 / D2R, la2 / D2R));
  }
  return out;
};
/** Points along a straight Mercator segment between two lon/lat ends (fraction p drawn). */
export const segment = (a: P, b: P, p: number): P[] => {
  const A = merc(a[0], a[1]), B = merc(b[0], b[1]);
  return [A, [A[0] + (B[0] - A[0]) * p, A[1] + (B[1] - A[1]) * p]];
};
