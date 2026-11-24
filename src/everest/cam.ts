import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import { C, DURATION_S, PUNCH } from './timing';
import { CamS, P3, V3, xz } from './World';

/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** A camera key: looking at lon/lat (`up` km above the ground) from d km away, pitched down `pitch` degrees, facing `head`
 * degrees (0 = north, 90 = east). */
export type Key = { t: number; lon: number; lat: number; up: number; d: number; pitch: number; head: number; e: Ease };
const k = (t: number, lon: number, lat: number, up: number, d: number, pitch: number, head: number, e: Ease = inOut): Key => ({ t, lon, lat, up, d, pitch, head, e });

export const EV: [number, number] = [86.925, 27.9881];
export const LZ: [number, number] = [78.0742, 32.2697];
// frame 0 and the last frame: under the old sea, just below the summit, facing north-east (the climber on the top)
const HOOK = (t: number, e: Ease = inOut) => k(t, EV[0], EV[1], -0.75, 5.6, 2, 28, e);

/** The world shots. Each segment is continuous; cuts happen between segments. */
export const SEGS: Record<string, Key[]> = {
  hook: [
    HOOK(0, linear),
    k(1.3, EV[0], EV[1], -0.7, 5.2, 2, 30, linear),
    k(2.3, EV[0], EV[1], -0.8, 6.4, 6, 36),
    k(4.7, EV[0], EV[1], -1.0, 8.6, 11, 46, inOut),
    k(6.3, EV[0], EV[1], -1.0, 9.0, 10, 50, linear),
    k(7.9, EV[0], EV[1], -0.6, 5.0, 5, 47, inOut),
    k(8.55, EV[0], EV[1], -0.15, 0.3, 2, 45, easeIn),
  ],
  edge: [
    k(14.0, 85.0, 30.0, 0, 3600, 56, 0, linear),
    k(15.4, 82.5, 28.2, 0, 6200, 62, 0, inOut),
    k(17.7, 82.0, 28.0, 0, 5600, 62, 2, linear),
  ],
  rise: [
    k(31.95, 86.2, 27.0, 0, 900, 30, 4, linear),
    k(33.4, 86.5, 27.4, 0, 640, 24, 10, inOut),
    k(35.3, 86.92, 27.85, 2, 210, 18, 18, inOut),
    // 5. pull back and whip west along the Himalaya to Himachal
    k(36.0, 86.4, 28.1, 0, 330, 26, 12, inOut),
    k(37.1, 79.6, 31.0, 0, 2200, 52, -6, inOut),
    k(37.75, 77.8, 31.7, 0, 1500, 54, -4, inOut),
    k(38.7, 78.05, 32.2, 0, 420, 46, 4, inOut),
    k(40.4, LZ[0], LZ[1], 0.1, 15, 26, 22, inOut),
    k(42.4, LZ[0], LZ[1], 0.05, 9.5, 20, 34, inOut),
    k(45.6, LZ[0], LZ[1], 0.05, 7.5, 17, 52, linear),
    // 6. out to all of India, then along the Himalaya as it rises
    k(47.6, 80.5, 22.5, 0, 4300, 72, 0, inOut),
    k(50.3, 80.8, 24.0, 0, 3900, 70, 0, linear),
    k(51.4, 84.0, 27.4, 0, 1150, 30, 10, inOut),
    k(52.65, 84.6, 27.6, 0, 1000, 27, 14, linear),
  ],
  send: [
    k(52.6, 78.12, 32.24, 0.1, 9.0, 6, 70, linear),
    k(56.55, 78.13, 32.25, 0.15, 7.6, 7, 82, linear),
    k(57.05, 82.5, 30.2, 0, 900, 50, 50, inOut),
    k(57.7, EV[0], EV[1], -1.0, 9.4, 13, 45, easeOut),
    k(59.0, EV[0], EV[1], -0.8, 6.8, 7, 38, inOut),
    HOOK(DURATION_S, inOut),
  ],
};

const raw = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i];
    if (t <= b.t) {
      const a = keys[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const d = Math.exp(lerp(Math.log(a.d), Math.log(b.d), p));
      let q = p;
      if (Math.abs(Math.log(b.d / a.d)) > 1.0) q = clamp(b.d < a.d ? 1 - (d - b.d) / (a.d - b.d) : (d - a.d) / (b.d - a.d));
      // big jumps: fly over the middle (the distance bulges) so a whip reads as a move, not a slide
      const span = Math.hypot(b.lon - a.lon, b.lat - a.lat) * 100;
      const bulge = span > 3 * Math.max(a.d, b.d) ? Math.sin(Math.PI * p) * span * 0.55 : 0;
      return { ...b, lon: lerp(a.lon, b.lon, q), lat: lerp(a.lat, b.lat, q), up: lerp(a.up, b.up, p), d: d + bulge, pitch: lerp(a.pitch, b.pitch, p), head: lerp(a.head, b.head, p) };
    }
  }
  return keys[keys.length - 1];
};
const SM = [-0.1, -0.066, -0.033, 0, 0.033, 0.066, 0.1];
const WT = [0.07, 0.12, 0.18, 0.26, 0.18, 0.12, 0.07];

/** The camera for a segment at time t (smoothed, breathing, punched in on the key words). */
export const camAt = (seg: string, t: number, H: Record<string, Float32Array>, vex: number): CamS => {
  const keys = SEGS[seg];
  let lon = 0, lat = 0, up = 0, ld = 0, pitch = 0, head = 0;
  for (let i = 0; i < SM.length; i++) {
    const c = raw(keys, Math.min(keys[keys.length - 1].t, Math.max(keys[0].t, t + SM[i])));
    lon += c.lon * WT[i]; lat += c.lat * WT[i]; up += c.up * WT[i]; ld += Math.log(c.d) * WT[i]; pitch += c.pitch * WT[i]; head += c.head * WT[i];
  }
  let punch = 0;
  for (const h of PUNCH) if (t > h - 0.02) punch += 0.045 * (1 - Math.exp(-14 * (t - h + 0.02))) * Math.exp(-3.2 * (t - h));
  const d = Math.exp(ld) * (1 + 0.018 * Math.sin(t * LOOPF(11)) + 0.008 * Math.sin(t * LOOPF(29) + 1.3)) * (1 - punch);
  head += 1.1 * Math.sin(t * LOOPF(7) + 0.4) + 0.4 * Math.sin(t * LOOPF(17));
  pitch += 0.7 * Math.sin(t * LOOPF(9) + 0.7);
  const look = P3(H, lon, lat, vex, up);
  const p = (pitch * Math.PI) / 180, hd = (head * Math.PI) / 180;
  const pos: V3 = [look[0] - d * Math.cos(p) * Math.sin(hd), look[1] + d * Math.sin(p), look[2] + d * Math.cos(p) * Math.cos(hd)];
  const roll = 0.5 * Math.sin(t * LOOPF(6) + 0.2);
  return { pos, look, fov: 38, roll };
};

/** Camera speed (screen fractions per frame) for the motion blur: pan and zoom. */
export const camSpeed = (seg: string, t: number, H: Record<string, Float32Array>, vex: number) => {
  const a = camAt(seg, t - 1 / 60, H, vex), b = camAt(seg, t + 1 / 60, H, vex);
  const d = Math.hypot(a.pos[0] - a.look[0], a.pos[1] - a.look[1], a.pos[2] - a.look[2]);
  const pan = Math.hypot(b.look[0] - a.look[0], b.look[2] - a.look[2]) / d;
  const db = Math.hypot(b.pos[0] - b.look[0], b.pos[1] - b.look[1], b.pos[2] - b.look[2]);
  const rot = Math.abs(Math.atan2(b.pos[0] - b.look[0], b.pos[2] - b.look[2]) - Math.atan2(a.pos[0] - a.look[0], a.pos[2] - a.look[2]));
  return { pan: pan + rot * 0.8, zoom: Math.abs(Math.log(db / d)) };
};
export { xz };
