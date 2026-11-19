import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import timing from './timing.json';
import { CamS, M, V3, xz } from './Terrain';

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
export const PL = M.places;

/** A camera key: looking at lon/lat from d km away, pitched `pitch` degrees down, heading `head` (0 = facing north). */
type Key = { t: number; lon: number; lat: number; d: number; pitch: number; head: number; e?: Ease };
export type CamK = { lon: number; lat: number; d: number; pitch: number; head: number };

/** Frame 0 and the loop's end: over the corridor, facing north, China's red Himalaya above it. */
export const HOOK: CamK = { lon: 88.55, lat: 26.85, d: 330, pitch: 52, head: 4 }; // d before ZOOM
const ZOOM = 3.0; // portrait frames are narrow: distances are written as for a square view, then scaled
const k = (t: number, lon: number, lat: number, d: number, pitch: number, head: number, e: Ease = inOut): Key => ({ t, lon, lat, d: d * ZOOM, pitch: Math.min(70, pitch + 9), head, e });
const keys = (): Key[] => [
  k(0, HOOK.lon, HOOK.lat, HOOK.d, HOOK.pitch, HOOK.head, linear),
  k(C.darj + 0.5, 88.45, 26.95, 300, 52, 3, linear),
  k(C.guw + 0.55, 89.9, 26.5, 400, 60, 14),
  k(C.n22 - 0.15, 89.6, 26.55, 380, 60, 12, linear),
  k(C.patti + 0.25, 88.33, 26.62, 125, 50, 0),
  k(C.upar1 - 0.1, 88.36, 26.66, 115, 49, 0, linear),
  k(C.china1 + 0.2, 88.75, 27.35, 230, 40, 6),
  k(C.army1 + 0.45, 88.85, 27.45, 160, 42, 8, linear),
  k(C.sili + 0.35, 88.36, 26.62, 140, 56, -4),
  k(C.neck + 0.3, 88.38, 26.66, 120, 56, -2, linear),
  k(C.ne1 + 0.6, 91.6, 25.6, 720, 66, 2),
  k(C.crore + 0.5, 91.8, 25.7, 680, 66, 2, linear),
  k(C.jude - 0.6, 89.4, 26.4, 520, 54, 0),
  k(C.jude + 0.2, 89.2, 26.45, 480, 54, 0, linear),
  k(C.sikkim + 0.1, 88.85, 27.25, 240, 44, 8),
  k(C.chumbi + 0.6, 88.9, 27.42, 170, 42, 10, linear),
  k(C.doklam + 0.3, 88.95, 27.22, 75, 46, 8),
  k(C.pahadi + 0.1, 88.97, 27.18, 70, 47, 6, linear),
  k(C.corr2 + 0.1, 88.75, 26.95, 160, 40, 2),
  k(C.army2 - 0.1, 88.85, 27.05, 140, 42, 4, linear),
  k(C.army2 + 0.45, 88.96, 27.24, 62, 47, 4),
  k(C.ruk + 0.5, 88.96, 27.25, 58, 48, 6, linear),
  k(C.neeche + 0.6, 89.05, 26.15, 300, 50, -2),
  k(C.bang1 - 0.1, 89.1, 26.05, 280, 50, -2, linear),
  k(C.lalmo + 0.35, 89.42, 25.98, 95, 50, -4),
  k(C.n2025 + 0.6, 89.42, 26.0, 88, 50, -6, linear),
  k(C.dhaka - 0.1, 90.6, 24.9, 800, 56, 0),
  k(C.greater + 0.6, 91.0, 25.3, 860, 56, 0, linear),
  k(C.parl + 0.6, 91.2, 25.5, 820, 56, 0, linear),
  k(C.gardan + 0.3, 88.55, 26.55, 260, 52, 0),
  k(C.kila + 0.6, 88.58, 26.6, 240, 52, 0, linear),
  k(C.hasimara + 0.3, 89.1, 26.6, 260, 46, 10),
  k(C.s400 + 0.6, 88.9, 26.55, 280, 48, 6, linear),
  k(C.garrison + 0.2, 88.95, 26.3, 420, 52, 0),
  k(C.chopra + 0.8, 88.95, 26.32, 400, 52, 0, linear),
  k(C.pooche + 0.4, 88.6, 26.75, 360, 52, 3),
  k(DURATION_S, HOOK.lon, HOOK.lat, HOOK.d, HOOK.pitch, HOOK.head, inOut),
];
let FULL: Key[] | null = null;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): CamK => {
  FULL ??= keys();
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = (b.e ?? linear)(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const d = Math.exp(lerp(Math.log(a.d), Math.log(b.d), p));
      let q = p;
      if (Math.abs(Math.log(b.d / a.d)) > 1.0) q = clamp(b.d < a.d ? 1 - (d - b.d) / (a.d - b.d) : (d - a.d) / (b.d - a.d));
      return { lon: lerp(a.lon, b.lon, q), lat: lerp(a.lat, b.lat, q), d, pitch: lerp(a.pitch, b.pitch, p), head: lerp(a.head, b.head, p) };
    }
  }
  return FULL[FULL.length - 1];
};
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
const HITS = () => [C.darj, C.guw, C.n22, C.china1, C.army1, C.sili, C.neck, C.crore, C.chumbi, C.doklam, C.n73, C.ruk, C.lalmo, C.greater, C.parl, C.kila, C.rafale, C.s400, C.bamuni, C.kishan, C.chopra];
export const camK = (t: number): CamK => {
  let lon = 0, lat = 0, ld = 0, pitch = 0, head = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(wrap(t + SMOOTH[i]));
    lon += c.lon * W8[i]; lat += c.lat * W8[i]; ld += Math.log(c.d) * W8[i]; pitch += c.pitch * W8[i]; head += c.head * W8[i];
  }
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.03 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const d = Math.exp(ld) * (1 + 0.016 * Math.sin(t * LOOPF(13)) + 0.007 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  return { lon: lon + 0.006 * Math.sin(t * LOOPF(19)) * d / 100, lat: lat + 0.005 * Math.sin(t * LOOPF(16)) * d / 100, d, pitch: pitch + 0.8 * Math.sin(t * LOOPF(9) + 0.7), head: head + 1.2 * Math.sin(t * LOOPF(7) + 0.4) };
};
export const FOV = 34;
/** The three.js camera for a key (scene km). `groundY` lifts the look point onto the terrain. */
export const camS = (c: CamK, groundY = 0, roll = 0, split = 0): CamS => {
  let [x, z] = xz(c.lon, c.lat);
  // while Null fills the bottom half, the look point moves toward the camera so the subject sits in the top half
  const hd0 = (c.head * Math.PI) / 180, sh = split * 0.2 * c.d;
  x -= Math.sin(hd0) * sh; z += Math.cos(hd0) * sh;
  const p = (c.pitch * Math.PI) / 180, hd = (c.head * Math.PI) / 180;
  const look: V3 = [x, groundY, z];
  const pos: V3 = [x - c.d * Math.cos(p) * Math.sin(hd), groundY + c.d * Math.sin(p), z + c.d * Math.cos(p) * Math.cos(hd)];
  return { pos, look, fov: FOV, roll };
};
/** Camera speed for motion blur (relative change per frame). */
export const camSpeed = (t: number) => {
  const a = camK(t - 1 / 120), b = camK(t + 1 / 120), c = camK(t);
  const pan = Math.hypot((b.lon - a.lon) * 100, (b.lat - a.lat) * 110) / c.d;
  return { pan, zoom: Math.abs(Math.log(b.d / a.d)) };
};
/** A slow roll (degrees), with kicks on the whip moves. */
export const rollAt = (t: number) => t < 0 ? 0 : 0.6 * Math.sin(t * LOOPF(7) + 0.4) + 1.6 * Math.exp(-(((t - C.guw - 0.3) / 0.4) ** 2)) - 1.5 * Math.exp(-(((t - C.upar2 - 0.3) / 0.4) ** 2)) + 1.5 * Math.exp(-(((t - C.neeche - 0.3) / 0.45) ** 2)) - 1.3 * Math.exp(-(((t - C.hasimara) / 0.4) ** 2));
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.army1, 8], [C.n73, 7], [C.ruk, 6], [C.parl, 7], [C.kila, 9], [C.rafale + 0.3, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 8);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 8);
  }
  return [x, y];
};
