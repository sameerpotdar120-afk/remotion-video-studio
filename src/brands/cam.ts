import { Easing } from 'remotion';
import GEOJ from './geo.json';

/**
 * The Brands Short's one continuous camera, in Web Mercator metres. Keys are [t, lon, lat, width in km across the
 * frame, kind]; the segment INTO a key moves the way its kind says:
 *  'h' a hold: a slow drift/push (eased in and out over the whole hold),
 *  'w' a whip: fast in the middle, pulling out in flight when the jump is long (a fly-to), landing with a small settle.
 * On top: breathing (never a locked frame) and a settle punch after every whip. 1080x1920 design pixels.
 */
export const GEO = GEOJ as unknown as {
  plates: Record<string, { bounds: [number, number, number, number]; w: number; h: number }>;
  order: string[];
  countries: Record<string, number[][][]>;
  states: Record<string, number[][][]>;
  borders: number[][][];
  places: Record<string, [number, number]>;
  centers: Record<string, [number, number]>;
};
export type Cam = { x: number; y: number; mpp: number };
const R = 6378137;
export const mx = (lon: number) => (R * lon * Math.PI) / 180;
export const my = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const lat0 = (y: number) => (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2);

type K = [number, number, number, number, 'h' | 'w'];
// prettier-ignore
export const KEYS: K[] = [
  [0.0, 80.5, 23.0, 3700, 'h'],
  [2.1, 80.0, 23.6, 3150, 'h'],      // frame 0: India, pushing in
  [2.72, 15.4, 49.8, 900, 'w'],      // "Czech Republic"
  [4.45, 15.5, 49.75, 780, 'h'],
  [4.98, 7.42, 43.80, 130, 'w'],    // "Monte Carlo": Monaco
  [6.48, 7.42, 43.79, 95, 'h'],
  [7.06, 75.85, 30.85, 520, 'w'],    // "लुधियाना"
  [7.84, 75.86, 30.88, 430, 'h'],
  [8.34, 16.6, 49.55, 640, 'w'],     // "1894 ... Zlín"
  [11.22, 17.3, 49.35, 400, 'h'],
  [13.3, 88.3, 22.9, 820, 'w'],      // "nineteen thirties ... भारत आई" (the route)
  [17.66, 88.35, 22.75, 600, 'h'],
  [18.24, 8.25, 46.8, 470, 'w'],     // "Maggi ... स्विट्ज़रलैंड"
  [19.0, 8.25, 46.82, 400, 'h'],
  [19.55, -97.5, 39.2, 5000, 'w'],   // "Colgate ... अमेरिका"
  [20.75, -97.2, 39.0, 4500, 'h'],
  [21.3, -2.6, 54.2, 1150, 'w'],     // "Lifebuoy ... ब्रिटेन"
  [22.5, -2.4, 54.0, 1000, 'h'],
  [24.1, 38.0, 38.0, 9000, 'w'],     // "लेकिन खेल उल्टा": the world
  [25.0, 45.0, 34.0, 8800, 'h'],
  [27.3, 79.5, 23.0, 3500, 'w'],     // back to India: "देसी"
  [28.62, 79.4, 23.2, 3250, 'h'],
  [29.12, 2.4, 50.4, 1150, 'w'],     // "Louis Philippe"
  [31.84, 2.4, 51.0, 950, 'h'],
  [32.4, 79.0, 22.8, 3300, 'w'],     // "भारत में ही"
  [33.06, 79.0, 22.9, 3100, 'h'],
  [33.56, 7.42, 43.80, 130, 'w'],   // "Monte Carlo ... Monaco"
  [35.55, 7.42, 43.79, 90, 'h'],
  [36.1, 75.85, 30.85, 480, 'w'],    // "लुधियाना"
  [38.18, 75.86, 30.9, 320, 'h'],
  [38.7, -1.6, 53.4, 1000, 'w'],      // "Red Tape ... British"
  [41.12, -1.2, 53.0, 820, 'h'],
  [41.62, 80.3, 26.6, 640, 'w'],     // "कानपुर"
  [42.62, 80.33, 26.5, 520, 'h'],
  [43.12, 2.35, 48.6, 560, 'w'],     // "Lakmé ... French opera" (Paris)
  [45.86, 2.35, 48.75, 420, 'h'],
  [46.36, 73.4, 19.1, 640, 'w'],     // "1952 ... Tata" (Mumbai)
  [48.9, 73.2, 19.05, 520, 'h'],
  [50.6, 79.6, 22.6, 3350, 'w'],     // "तो अगली बार": all of India
  [55.3, 80.1, 23.2, 3000, 'h'],
  [57.5, 80.5, 23.0, 3700, 'h'],     // back to frame 0 (the loop)
];
export const DUR = 57.5;

const whipE = Easing.bezier(0.72, 0, 0.18, 1);
const holdE = Easing.bezier(0.45, 0, 0.55, 1);
const toCam = (k: K) => {
  const y = my(k[2]);
  return { x: mx(k[1]), y, lm: Math.log((k[3] * 1000) / Math.cos(lat0(y)) / 1080) };
};
const PTS = KEYS.map(toCam);

const raw = (t: number): Cam & { whip: number; land: number } => {
  if (t <= KEYS[0][0]) return { x: PTS[0].x, y: PTS[0].y, mpp: Math.exp(PTS[0].lm), whip: 0, land: -1 };
  for (let i = 1; i < KEYS.length; i++) {
    if (t > KEYS[i][0]) continue;
    const a = PTS[i - 1], b = PTS[i];
    const ta = KEYS[i - 1][0], tb = KEYS[i][0];
    const p = (t - ta) / (tb - ta);
    if (KEYS[i][4] === 'h') {
      const s = holdE(p);
      return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s, mpp: Math.exp(a.lm + (b.lm - a.lm) * s), whip: 0, land: KEYS[i - 1][4] === 'w' ? ta : -1 };
    }
    const s = whipE(p);
    const D = Math.hypot(b.x - a.x, b.y - a.y);
    const bump = Math.max(0, Math.log(D / 760) - (a.lm + b.lm) / 2) * 0.85;
    const lm = a.lm + (b.lm - a.lm) * s + bump * 4 * s * (1 - s);
    // the centre leads the zoom a little on long flights, so the target is in view as the camera comes down
    const sc = whipE(Math.min(1, p * 1.08));
    return { x: a.x + (b.x - a.x) * sc, y: a.y + (b.y - a.y) * sc, mpp: Math.exp(lm), whip: Math.sin(Math.PI * p), land: -1 };
  }
  const l = PTS[PTS.length - 1];
  return { x: l.x, y: l.y, mpp: Math.exp(l.lm), whip: 0, land: -1 };
};

/** the camera at time t (seconds), with breathing and the whip-landing settle */
export const camAt = (t: number): Cam => {
  const c = raw(t);
  let settle = 0;
  if (c.land >= 0) {
    const d = t - c.land;
    settle = 0.05 * Math.exp(-d * 6.5) * Math.cos(d * 13);
  }
  const br = 1 + 0.006 * Math.sin(t * 0.9) + 0.003 * Math.sin(t * 2.1 + 1);
  const mpp = c.mpp * br * (1 + settle);
  return { x: c.x + Math.sin(t * 0.7) * 3.2 * mpp, y: c.y + Math.cos(t * 0.53) * 2.4 * mpp, mpp };
};

/** screen speed of the camera in design px per frame (pan) and zoom rate per frame, for the motion blur */
export const camSpeed = (t: number, fps: number) => {
  const a = camAt(t - 0.5 / fps), b = camAt(t + 0.5 / fps);
  const m = (a.mpp + b.mpp) / 2;
  return { vx: (b.x - a.x) / m, vy: -(b.y - a.y) / m, zoom: Math.abs(Math.log(b.mpp / a.mpp)) };
};
export const isWhip = (t: number) => raw(t).whip;

/** world (Mercator metres) to screen (design px) */
export const P = (c: Cam, x: number, y: number) => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp] as const;
export const PL = (c: Cam, k: string) => { const p = GEO.places[k]; return P(c, p[0], p[1]); };
