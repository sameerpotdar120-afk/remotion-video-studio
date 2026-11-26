import * as THREE from 'three';
import { Easing } from 'remotion';
import GEOJ from './geo.json';

/**
 * Two cameras for the Tamil Nadu letters Short.
 * - The campus camera (3D, metres; x east, y north, z up, origin at the ring's centre, the library): keys
 *   [t, x, y, distance, tilt from vertical (deg), heading (deg)], eased between keys, with breathing.
 * - The map camera (2D Web Mercator, as the Brands Short) for the India / Tamil Nadu / Thanjavur moments.
 * `MODE` says which one is on screen; the cuts between them hide inside cloud whips.
 */
export const GEO = GEOJ as unknown as {
  plates: Record<string, { bounds: [number, number, number, number]; w: number; h: number }>;
  order: string[];
  campus: { half: number; center: [number, number]; ground: string };
  letters: Record<string, { parts: number[][][]; c: [number, number] }>;
  countries: Record<string, number[][][]>;
  states: Record<string, number[][][]>;
  places: Record<string, [number, number]>;
};
export const DUR = 73.7;
export const LETTERS = ['த', 'மி', 'ழ்', 'நா', 'டு'] as const;
export type L = (typeof LETTERS)[number];
export const READ: Record<L, string> = { 'த': 'त', 'மி': 'मि', 'ழ்': 'ऴ्', 'நா': 'ना', 'டு': 'डु' };

// ------------------------------------------------------------------ which world is on screen
/** [start, end] of each map (2D) stretch; the campus (3D) everywhere else */
export const MAPS: [number, number][] = [[0.48, 2.12], [7.84, 9.88], [69.96, 72.84]];
export const mode = (t: number) => (MAPS.some(([a, b]) => t >= a && t < b) ? 'map' : 'campus');
/** cloud whip strength around each cut (0..1) */
export const cloud = (t: number) => {
  let v = 0;
  MAPS.forEach(([a, b]) => [a, b].forEach((c) => { v = Math.max(v, Math.exp(-Math.pow((t - c) / 0.11, 2))); }));
  return v;
};

// ------------------------------------------------------------------ the campus camera
type CK = [number, number, number, number, number, number, ('w' | 'h')?];
// prettier-ignore
const CKEYS: CK[] = [
  [0.0, 0, 80, 2250, 0, 0],
  [0.48, 0, 0, 7000, 0, 0, 'w'],             // "Google Map": whip up (cut to the map)
  [2.12, 0, 0, 6200, 0, 0],                  // back from the map, coming down
  [2.42, 0, 80, 2350, 0, 0, 'w'],             // "ऊपर से देखो": lands
  [5.1, 0, 80, 2230, 0, 0],
  [5.4, 0, 70, 2020, 0, 0, 'w'],              // "असल में": punch-in
  [7.0, 0, 70, 1960, 0, 0],
  [7.84, 0, 0, 3200, 0, 0, 'w'],             // out to the map
  [9.88, 0, 0, 4200, 0, 0],                  // back: "campus"
  [10.4, 0, 0, 2300, 4, 0, 'w'],
  [11.1, 0, -60, 2400, 18, 12],
  [13.0, 0, -80, 4300, 22, 20],              // "900 एकड़": pull out to show the size
  [14.8, 0, -60, 4100, 24, 24],
  [15.3, 0, 0, 2000, 14, 8, 'w'],            // "1981 ... MGR"
  [20.1, 0, 0, 1900, 8, 0],
  [20.5, 0, 40, 1850, 0, 0, 'w'],             // the blueprint (top-down, fixed)
  [36.8, 0, 40, 1850, 0, 0],
  [37.7, 40, -40, 1650, 50, 24, 'w'],        // "उनके जाने के": the ground, tilted
  [38.7, 200, -200, 700, 52, 34, 'w'],       // ழ் rises
  [40.5, 200, -190, 680, 55, 40],
  [41.25, 234, 143, 720, 52, 70, 'w'],       // மி
  [41.95, 234, 143, 700, 52, 74],
  [42.3, -300, 30, 720, 52, -60, 'w'],       // டு
  [43.2, -300, 30, 700, 52, -56],
  [43.9, 0, 0, 1900, 46, 0, 'w'],            // "2016": the whole ring, tilted
  [45.6, 0, 0, 1800, 40, -8],
  [46.5, 0, 80, 2300, 0, 0, 'w'],             // "35 साल": straight up, it reads
  [48.0, 0, 80, 2200, 0, 0],
  [50.4, 200, -204, 520, 54, 32, 'w'],       // "भाषा": ழ்
  [51.7, 200, -204, 500, 56, 38],
  [52.35, 234, 143, 520, 54, 66, 'w'],       // "विज्ञान": மி
  [53.2, 234, 143, 500, 56, 72],
  [53.75, -300, 30, 520, 54, -58, 'w'],      // "तमिल को आगे": டு
  [55.5, -300, 30, 500, 56, -52],
  [56.4, 200, -204, 900, 0, 0, 'w'],         // "एक अक्षर": ழ் from above
  [69.5, 200, -204, 820, 0, 0],
  [69.96, 0, 0, 7000, 0, 0, 'w'],            // up and out (cut to the map)
  [72.84, 0, 0, 6000, 0, 0],                 // back down
  [73.7, 0, 80, 2250, 0, 0, 'w'],             // = frame 0
];
const whipE = Easing.bezier(0.72, 0, 0.2, 1);
const holdE = Easing.bezier(0.45, 0, 0.55, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export type CC = { x: number; y: number; d: number; tilt: number; head: number };
export const campusCam = (t: number): CC => {
  let i = 1;
  while (i < CKEYS.length - 1 && t > CKEYS[i][0]) i++;
  const a = CKEYS[i - 1], b = CKEYS[i];
  const p = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
  const s = (b[6] === 'w' ? whipE : holdE)(p);
  const ld = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), s));
  const br = 1 + 0.008 * Math.sin(t * 0.8) + 0.004 * Math.sin(t * 1.9 + 1);
  return { x: lerp(a[1], b[1], s) + Math.sin(t * 0.6) * ld * 0.004, y: lerp(a[2], b[2], s) + Math.cos(t * 0.45) * ld * 0.003, d: ld * br, tilt: lerp(a[4], b[4], s), head: lerp(a[5], b[5], s) + Math.sin(t * 0.3) * 0.6 };
};
export const FOV = 40;
/** a THREE camera for the campus at time t (also used to place the 2D overlays) */
export const threeCam = (c: CC, aspect = 1080 / 1920) => {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 1, 40000);
  const tl = (c.tilt * Math.PI) / 180, h = (c.head * Math.PI) / 180;
  const tx = c.x, tz = -c.y;
  cam.position.set(tx - Math.sin(h) * Math.sin(tl) * c.d, Math.cos(tl) * c.d, tz + Math.cos(h) * Math.sin(tl) * c.d);
  cam.up.set(Math.sin(h), 0, -Math.cos(h));
  cam.lookAt(tx, 0, tz);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};
const V = new THREE.Vector3();
/** campus metres (x east, y north, z up) -> design px; z < 1 when in front of the camera */
export const projC = (cam: THREE.PerspectiveCamera, x: number, y: number, z = 0) => {
  V.set(x, z, -y).project(cam);
  return [540 + V.x * 540, 960 - V.y * 960, V.z] as const;
};
/** metres per design px at the ground centre (for sizes) */
export const mppC = (c: CC) => (2 * c.d * Math.tan((FOV * Math.PI) / 360)) / 1920;

// ------------------------------------------------------------------ the map camera (2D Mercator)
export type Cam = { x: number; y: number; mpp: number };
const R = 6378137;
export const mx = (lon: number) => (R * lon * Math.PI) / 180;
export const my = (lat: number) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
type MK = [number, number, number, number, ('w' | 'h')?];
const CAMPUS: [number, number] = [79.0947, 10.7397];
// prettier-ignore
const MKEYS: MK[] = [
  [0.48, CAMPUS[0], CAMPUS[1], 40],
  [0.98, 80.2, 21.5, 3300, 'w'],             // "भारत": India from above
  [1.42, 80.0, 21.0, 3100],
  [2.12, CAMPUS[0], CAMPUS[1], 30, 'w'],     // "एक University": dive
  [7.84, CAMPUS[0], CAMPUS[1], 30],
  [8.3, 78.6, 11.0, 620, 'w'],               // "तंजावुर": Tamil Nadu
  [9.1, 78.7, 11.0, 560],
  [9.88, CAMPUS[0], CAMPUS[1], 30, 'w'],     // "Tamil University": dive
  [69.96, CAMPUS[0], CAMPUS[1], 40],
  [70.7, 80.2, 21.5, 3300, 'w'],             // "Satellite Map": India
  [72.15, 80.0, 21.0, 3000],
  [72.84, CAMPUS[0], CAMPUS[1], 30, 'w'],    // "तंजावुर": dive
];
const toM = (k: MK) => { const y = my(k[2]); return { x: mx(k[1]), y, lm: Math.log((k[3] * 1000) / Math.cos((k[2] * Math.PI) / 180) / 1080) }; };
const MP = MKEYS.map(toM);
export const mapCam = (t: number): Cam => {
  let i = 1;
  while (i < MKEYS.length - 1 && t > MKEYS[i][0]) i++;
  const a = MP[i - 1], b = MP[i];
  const p = Math.min(1, Math.max(0, (t - MKEYS[i - 1][0]) / (MKEYS[i][0] - MKEYS[i - 1][0])));
  const s = (MKEYS[i][4] === 'w' ? whipE : holdE)(p);
  const sc = whipE(Math.min(1, p * 1.25));
  const lm = lerp(a.lm, b.lm, s);
  const mpp = Math.exp(lm) * (1 + 0.006 * Math.sin(t * 0.9));
  return { x: lerp(a.x, b.x, MKEYS[i][4] === 'w' ? sc : s) + Math.sin(t * 0.7) * 3 * mpp, y: lerp(a.y, b.y, MKEYS[i][4] === 'w' ? sc : s), mpp };
};
export const P = (c: Cam, x: number, y: number) => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp] as const;
export const PL = (c: Cam, k: string) => { const p = GEO.places[k]; return P(c, p[0], p[1]); };
