import { Easing } from 'remotion';
import timing from './timing.json';
import { Cam, merc } from '../motion/MapView';

// Cues (seconds) from the VO, per-shot map cameras and the loop helpers for the Sikkim edit.
const T = timing as unknown as { duration: number; cues: Record<string, number> };
export const C = T.cues;
export const DURATION_S = T.duration;
export const F = (s: number) => Math.round(s * 60);
type Ease = (x: number) => number;
const inOut: Ease = Easing.bezier(0.7, 0, 0.18, 1);
const linear: Ease = (x) => x;
type Key = [number, number, number, number, Ease?]; // t, lon, lat, mpp, ease into this key
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** A keyed camera: log-zoom between keys, the pan following the zoom on big zooms (no swoop past the target). */
export const track = (keys: Key[]) => {
  const K = keys.map(([t, lon, lat, mpp, e]) => { const [x, y] = merc(lon, lat); return { t, x, y, mpp, e: e ?? linear }; });
  return (t: number): Cam => {
    if (t <= K[0].t) return K[0];
    for (let i = 1; i < K.length; i++) {
      const a = K[i - 1], b = K[i];
      if (t <= b.t) {
        const p = b.e(clamp01((t - a.t) / Math.max(1e-6, b.t - a.t)));
        const mpp = Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), p));
        let q = p;
        if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp01(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
        return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp };
      }
    }
    return K[K.length - 1];
  };
};
/** Whole cycles over the video, so anything driven by it is the same on the last frame as on frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
/** The camera never stops: a slow breathe and drift on top of the keys (whole cycles, loop-safe). */
export const live = (c: Cam, t: number): Cam => {
  const b = 1 + 0.014 * Math.sin(t * LOOPF(37)) + 0.006 * Math.sin(t * LOOPF(71) + 1.3);
  const d = c.mpp * 6;
  return { x: c.x + Math.sin(t * LOOPF(29)) * d, y: c.y + Math.sin(t * LOOPF(23)) * d, mpp: c.mpp * b };
};
const D = DURATION_S;
// frame 0 and the loop's last frame
export const CAM0 = { lon: 81, lat: 23, mpp: 3600 };
// lines 1–5: India, the swing to the north-east, Sikkim, the track from the south, Siliguri and the road, the Himalaya
export const camMap1 = track([
  [0, CAM0.lon, CAM0.lat, CAM0.mpp],
  [3.2, 81.6, 23.6, 3250],
  [5.0, 88.45, 27.5, 290, inOut],
  [9.5, 88.45, 27.48, 245],
  [10.5, 88.42, 26.95, 430, inOut],
  [12.6, 88.42, 26.95, 400],
  [13.9, 88.47, 26.88, 125, inOut],
  [22.9, 88.48, 26.9, 108],
  [24.2, 88.47, 27.5, 300, inOut],
  [30.8, 88.47, 27.5, 255],
]);
// lines 7–8: the Teesta valley, the route
export const camRoute = track([[40.6, 88.47, 27.0, 31], [57.4, 88.47, 27.01, 27]]);
// line 9: the storm over the valley
export const camStorm = track([[58.99, 88.47, 27.0, 28], [70.6, 88.46, 26.98, 36]]);
// line 10: the quake over Sikkim
export const camQuake = track([[70.53, 88.45, 27.58, 280], [76.4, 88.45, 27.56, 225]]);
// line 12: the fact card over the north-east
export const camFact = track([[81.18, 88.5, 27.3, 330], [91.7, 88.5, 27.25, 260]]);
// the loop: out to frame 0
export const camEnd = track([[101.6, 85.5, 25.6, 1500], [D, CAM0.lon, CAM0.lat, CAM0.mpp, Easing.bezier(0.3, 0, 0.2, 1)]]);
