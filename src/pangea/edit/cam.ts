import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
/** A piece's pose on the world canvas: centre (km, y down) and turn (degrees, clockwise). */
export type Pose = [number, number, number];
type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  pieces: Record<string, P[][]>; india_country: P[][]; himalaya: P[]; everest: P; plate: Plate; plate_world: Plate; india_merc: P[][];
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const clamp = (x: number) => Math.min(1, Math.max(0, x));

// ------------------------------------------------------------------ layouts (tools/build_pangea_geo.py pieces)
export const PIECES = ['antarctica', 'australia', 'samerica', 'namerica', 'africa', 'madagascar', 'eurasia', 'india'] as const;
export type Piece = typeof PIECES[number];
type Layout = Record<Piece, Pose>;
export const TODAY: Layout = { india: [7584, -2442, 0], africa: [1920, -333, 0], madagascar: [4500, 2109, 0], samerica: [-5760, 1887, 0],
  namerica: [-9400, -5328, 0], eurasia: [8160, -5772, 0], australia: [13440, 2886, 0], antarctica: [0, 9300, 0] };
/** About 250 million years ago (after published Pangea maps; illustrative). */
const PANGEA: Layout = { africa: [1500, 500, 0], madagascar: [3650, 2100, -12], india: [5000, 2700, 20], samerica: [-3300, 2300, 40],
  namerica: [-4700, -2900, 25], eurasia: [4000, -5000, -22], australia: [7000, 5600, 60], antarctica: [3300, 6400, 10] };
/** Mid-drift, about 70 million years ago. */
const DRIFT: Layout = { africa: [1800, 0, 0], madagascar: [4300, 2000, -4], india: [6500, 700, 8], samerica: [-4800, 2000, 15],
  namerica: [-7500, -4300, 10], eurasia: [7500, -5600, -5], australia: [11000, 6000, 30], antarctica: [1500, 9000, 0] };
/** India just before it meets Asia (the Tethys almost closed). */
const INDIA_NEAR: Pose = [7400, -1500, 4];
/** Pangaea Ultima, about 250 million years from now (after Scotese's model; illustrative). */
const ULTIMA: Layout = { africa: [2200, -500, 10], madagascar: [4000, 1200, 0], india: [7584, -2442, 0], samerica: [-700, 3300, -120],
  namerica: [-2900, -3000, -40], eurasia: [8160, -5772, 0], australia: [11000, -200, -20], antarctica: [4800, 3300, 40] };

export const HOOK_FF0 = C.n25 + 0.2, HOOK_FF1 = C.n25 + 3.9;
const mixPose = (a: Pose, b: Pose, p: number): Pose => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
const seg = (t: number, t0: number, t1: number, e: Ease = inOut) => e(clamp((t - t0) / (t1 - t0)));
export const poseAt = (t: number, k: Piece): Pose => {
  // the hook fast-forwards to Pangaea Ultima, then "30 crore saal pehle" rewinds into Pangea
  if (t < HOOK_FF0) return TODAY[k];
  if (t < C.karib30) return mixPose(TODAY[k], ULTIMA[k], seg(t, HOOK_FF0, HOOK_FF1));
  if (t < C.toota) return mixPose(ULTIMA[k], PANGEA[k], seg(t, C.karib30, 16.7));
  if (k === 'india') {
    if (t < C.n15 + 0.6) return mixPose(PANGEA.india, DRIFT.india, seg(t, C.toota, C.n15 + 0.6, linear));
    if (t < C.karib5) return mixPose(DRIFT.india, INDIA_NEAR, seg(t, C.n15 + 0.6, C.karib5, linear));
    if (t < C.n25b) return mixPose(INDIA_NEAR, TODAY.india, seg(t, C.karib5, C.takraya, (x) => x * x));
    return TODAY.india;
  }
  if (t < C.karib5) return mixPose(PANGEA[k], DRIFT[k], seg(t, C.toota, C.beech));
  if (t < C.model) return mixPose(DRIFT[k], TODAY[k], seg(t, C.karib5, C.takraya + 0.4));
  if (t < C.yani) return mixPose(TODAY[k], ULTIMA[k], seg(t, C.model + 0.2, C.ultima));
  return mixPose(ULTIMA[k], TODAY[k], seg(t, C.himalaya2, C.safar + 1.0));
};
/** A point of a piece (local km) on the world canvas. */
export const onCanvas = (pose: Pose, p: P): P => {
  const a = (pose[2] * Math.PI) / 180;
  return [pose[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), pose[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
};

// ------------------------------------------------------------------ satellite plate (Web Mercator) on the canvas
const R = 6378137, D2R = Math.PI / 180;
const mercX = (lon: number) => R * lon * D2R;
const mercY = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2));
const K22 = Math.cos(22 * D2R) / 1000;
const MX0 = mercX(79), MY0 = mercY(22);
/** Mercator metres to canvas km, matched to India's "today" pose at (79 E, 22 N). */
export const satKm = (m: P): P => [TODAY.india[0] + (m[0] - MX0) * K22, TODAY.india[1] - (m[1] - MY0) * K22];
export const llKm = (lon: number, lat: number): P => satKm([mercX(lon), mercY(lat)]);
export const EVEREST = llKm(86.925, 27.988);

// ------------------------------------------------------------------ the camera (canvas km; kpp = km per screen px)
export type Cam = { x: number; y: number; kpp: number };
type Key = { t: number; at: P; kpp: number; e?: Ease };
export const INDIA0: P = [7650, -2330];
/** "Tumhe": the viewer's pin in central India (frame 0 and the loop's end). */
export const PIN = llKm(77.4, 23.25);
const HIM: P = [8094, -3172];
const up = (p: P, kpp: number): P => [p[0], p[1] + 480 * kpp];
const keys = (): Key[] => [
  { t: 0, at: PIN, kpp: 1.25 },
  { t: C.par - 0.05, at: [7650, -2150], kpp: 3.5, e: inOut },
  { t: C.n25 - 0.3, at: [7720, -2150], kpp: 3.25, e: linear },
  { t: C.n25 + 0.8, at: [3300, -500], kpp: 13.5, e: inOut },
  { t: C.karib30, at: [3500, -450], kpp: 11.8, e: linear },
  { t: C.karib30 + 3.4, at: [1600, 300], kpp: 13.5, e: inOut },
  { t: C.aur_bharat - 0.1, at: [1500, 300], kpp: 12.8, e: linear },
  { t: C.aur_bharat + 0.9, at: [4400, 900], kpp: 6.6, e: inOut },
  { t: C.africa - 0.2, at: [4300, 1300], kpp: 6.4, e: linear },
  { t: C.austr + 0.6, at: [4200, 3200], kpp: 7.2, e: inOut },
  { t: C.toota - 0.2, at: [4000, 3000], kpp: 7.4, e: linear },
  { t: C.bhagta, at: [5200, 0], kpp: 10, e: inOut },
  { t: C.beech - 0.2, at: [6200, -600], kpp: 8.5, e: linear },
  { t: C.tethys + 0.3, at: [7200, -1700], kpp: 5.6, e: inOut },
  { t: C.n5cr, at: [7500, -2200], kpp: 4.6, e: inOut },
  { t: C.takraya + 0.1, at: [7800, -2650], kpp: 3.4, e: linear },
  { t: C.farsh + 0.4, at: HIM, kpp: 2.3, e: inOut },
  { t: C.himalaya + 0.6, at: HIM, kpp: 2.0, e: linear },
  { t: C.fossil - 0.6, at: EVEREST, kpp: 0.85, e: inOut },
  { t: C.shaligram - 0.2, at: EVEREST, kpp: 0.75, e: linear },
  { t: C.takkar2 - 0.3, at: [EVEREST[0], EVEREST[1] + 60], kpp: 0.9, e: linear },
  { t: C.takkar2 + 0.5, at: up(HIM, 2.4), kpp: 2.4, e: inOut },
  { t: C.model - 0.1, at: up(HIM, 2.2), kpp: 2.2, e: linear },
  { t: C.atlantic + 0.4, at: [1200, -800], kpp: 14.5, e: inOut },
  { t: C.n25b - 0.2, at: [2200, -600], kpp: 13.5, e: linear },
  { t: C.ultima + 0.3, at: [3600, -400], kpp: 11.5, e: inOut },
  { t: C.yani - 0.2, at: [3500, -500], kpp: 11, e: linear },
  { t: C.himalaya2 + 0.2, at: [7700, -2600], kpp: 4.2, e: inOut },
  { t: C.safar - 0.3, at: [7650, -2400], kpp: 3.6, e: linear },
  { t: DURATION_S, at: PIN, kpp: 1.25, e: inOut },
];
const FULL = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], kpp: k.kpp, e: k.e ?? linear }));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const kpp = Math.exp(lerp(Math.log(a.kpp), Math.log(b.kpp), p));
      let q = p;
      if (Math.abs(Math.log(b.kpp / a.kpp)) > 1.0) q = clamp(b.kpp < a.kpp ? 1 - (kpp - b.kpp) / (a.kpp - b.kpp) : (kpp - a.kpp) / (b.kpp - a.kpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), kpp };
    }
  }
  return FULL[FULL.length - 1];
};
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
const HITS = () => [C.par, C.n5, C.khisak, C.n30, C.takraya, C.fossil, C.n25b, C.n70, C.n8];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lk = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(wrap(t + SMOOTH[i]));
    x += k.x * W8[i]; y += k.y * W8[i]; lk += Math.log(k.kpp) * W8[i];
  }
  const kpp = Math.exp(lk);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.022 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.012 * Math.sin(t * LOOPF(13)) + 0.005 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = kpp * 6;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, kpp: kpp * breathe };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.khisak, 9], [C.takraya, 14], [C.n25b, 5], [C.n30, 4], [C.mita, 7], [C.kyu, 5]] as P[]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
/** Canvas km to screen px. */
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.kpp, 960 + (p[1] - c.y) / c.kpp];

/** Camera speed for motion blur: screen px per frame (60 fps) of pan, and |d ln kpp| per frame of zoom. */
export const camSpeed = (t: number) => {
  const a = camAt(t - 1 / 120), b = camAt(t + 1 / 120), c = camAt(t);
  return { pan: Math.hypot(b.x - a.x, b.y - a.y) / c.kpp, zoom: Math.abs(Math.log(b.kpp / a.kpp)) };
};
/** A slow camera roll (degrees), with a kick on the hook's whip-out and on the rewind. */
export const rollAt = (t: number) => 0.7 * Math.sin(t * LOOPF(7) + 0.4) + 3.2 * Math.exp(-(((t - C.n25 - 0.35) / 0.4) ** 2)) - 2.0 * Math.exp(-(((t - C.karib30 - 0.6) / 0.5) ** 2));
