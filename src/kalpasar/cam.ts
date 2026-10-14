import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from './anim';
import raw from './geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres. */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; india: P[][]; gujarat: P[][]; saurashtra: P[][]; lake: P[][]; sea_south: P[][];
  dam: P[]; dam_ll: P[]; rivers: Record<string, P[]>; places: Record<string, P>; route_old: P[]; route_new: P[];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The three Null moments (split screen): the idea, the twist, the closing question. ≈ 15 s in all. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.tabhi6 + 0.1, t1: C.tabhi6 + 3.9, from: 1.2 },
  { name: 'C', t0: C.perfect12 - 0.6, t1: C.perfect12 + 3.8, from: 0.2 },
  { name: 'A', t0: C.banega16 - 0.2, t1: DURATION_S, from: 0.3 },
];

const ll = merc;
export const PL = {
  india: ll(79, 22.5), gulf: ll(72.45, 21.85), saurashtra: ll(70.85, 21.7), rivers: ll(72.65, 22.45), head: ll(72.5, 22.1),
  dam: ll(72.52, 21.86), lake: ll(72.48, 22.0), wide: ll(71.6, 21.95), route: ll(72.62, 21.65),
};

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover.
 *  Every move follows the real map: Saurashtra is west (left) of the gulf, the rivers come in from the north and east,
 *  the wall builds west to east from Bhavnagar to Bharuch, Surat is south of Bharuch. */
const keys = (): Key[] => [
  // frame 0: India already moving, then a dive straight into the Gulf of Khambhat
  { t: 0, at: PL.india, span: 5.6e6, rot: -3 },
  { t: C.n60 - 0.2, at: ll(74.5, 22.2), span: 2.2e6, rot: 0, e: easeIn },
  { t: C.deewar1 + 0.1, at: PL.gulf, span: 3.6e5, rot: 1, e: easeOut },
  { t: C.kyu1 + 0.4, at: PL.gulf, span: 3.9e5, rot: 0, e: linear },
  // the farmer in Saurashtra: west
  { t: C.socho2 + 0.6, at: PL.saurashtra, span: 6.4e5, rot: -1, e: inOut },
  { t: C.pyaase3 + 0.6, at: [PL.saurashtra[0] + 1.0e4, PL.saurashtra[1] - 1.5e4], span: 5.0e5, rot: 1, e: linear },
  // "पानी ज़्यादा दूर नहीं… बिल्कुल सामने": swing east to the gulf and up to the rivers
  { t: C.door4 + 0.3, at: [PL.gulf[0] - 6.0e4, PL.gulf[1] + 1.5e4], span: 5.6e5, rot: 0, e: inOut },
  { t: C.gulf5 + 0.4, at: PL.rivers, span: 8.0e5, rot: 1, e: inOut },
  { t: C.hazaron5 - 0.2, at: PL.rivers, span: 7.4e5, rot: 0, e: linear },
  { t: C.baha5 + 0.4, at: PL.head, span: 3.8e5, rot: -1, e: inOut },
  // the idea (Null, top half shows the old map)
  { t: C.rok6 + 0.3, at: PL.gulf, span: 3.4e5, rot: 0, e: inOut },
  // Kalpasar: Bhavnagar, Bharuch, the wall
  { t: C.bhavnagar8 + 0.2, at: [PL.dam[0] - 1.5e4, PL.dam[1]], span: 2.9e5, rot: 1, e: inOut },
  { t: C.km8 + 0.6, at: PL.dam, span: 2.6e5, rot: 0, e: linear },
  // the tide and the gates: close in on the wall
  { t: C.bharti9 + 0.3, at: [PL.dam[0], PL.dam[1] - 6.0e3], span: 1.6e5, rot: -1, e: inOut },
  { t: C.andar9 + 0.6, at: [PL.dam[0], PL.dam[1] + 4.0e3], span: 1.5e5, rot: 0, e: linear },
  // the lake fills, then pull back west so its water reaches Saurashtra's 9 districts
  { t: C.n1600 + 0.3, at: PL.lake, span: 3.2e5, rot: 1, e: inOut },
  { t: C.bharat10 + 0.6, at: PL.lake, span: 3.4e5, rot: 0, e: linear },
  { t: C.kisan10 + 0.5, at: PL.wide, span: 7.8e5, rot: -1, e: inOut },
  { t: C.n9 + 1.2, at: PL.wide, span: 7.2e5, rot: 0, e: linear },
  // the highway and railway, then Bhavnagar → Surat
  { t: C.bonus11 + 0.4, at: PL.dam, span: 2.2e5, rot: 1, e: inOut },
  { t: C.surat11 + 0.4, at: PL.route, span: 6.4e5, rot: 0, e: inOut },
  { t: C.n177 + 1.2, at: PL.route, span: 6.0e5, rot: -1, e: linear },
  // the twist (Null), then the sea fights back: in on the wall in the storm
  { t: C.jwaar13 + 0.2, at: [PL.dam[0], PL.dam[1] - 1.0e4], span: 1.9e5, rot: 1, e: inOut },
  { t: C.daldal13 + 0.8, at: [PL.dam[0], PL.dam[1] - 1.0e4], span: 1.7e5, rot: 0, e: linear },
  // 50 years, the file, the brick, the cost
  { t: C.n50b + 0.3, at: PL.gulf, span: 3.2e5, rot: -1, e: inOut },
  { t: C.lakh14 + 1.0, at: PL.gulf, span: 2.9e5, rot: 0, e: linear },
  // the name over the lake, the farmer waiting, the question (Null)
  { t: C.naam15 + 0.4, at: PL.lake, span: 3.0e5, rot: 1, e: inOut },
  { t: C.kisan16 + 0.4, at: [PL.wide[0] + 3.0e4, PL.wide[1]], span: 6.0e5, rot: 0, e: inOut },
  { t: DURATION_S, at: [PL.wide[0] + 6.0e4, PL.wide[1]], span: 5.4e5, rot: -1, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], span: k.span, rot: k.rot ?? 0, e: k.e ?? linear }));
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const span = Math.exp(lerp(Math.log(a.span), Math.log(b.span), p));
      let q = p;
      if (Math.abs(Math.log(b.span / a.span)) > 1.0) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};

/** Zoom punches on the big hits. */
export const HITS = () => [C.deewar1, C.kalpasar7, C.km8, C.khulenge9, C.n1600, C.n177, C.par12, C.n10m, C.daldal13, C.file14, C.lakh14, C.kalpasar15];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += k.x * W8[i]; y += k.y * W8[i]; ls += Math.log(k.span) * W8[i]; rot += k.rot * W8[i];
  }
  // never at rest: breathe, tilt, hand-held drift, punch on the hits
  const span = Math.exp(ls);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.07 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.04 * Math.sin(t * 0.9) + 0.018 * Math.sin(t * 2.2 + 1.3)) * (1 - punch);
  const drift = span * 0.011;
  return { x: x + Math.sin(t * 1.3) * drift, y: y + Math.cos(t * 1.1) * drift, span: span * breathe, rot: rot + Math.sin(t * 0.6) * 1.3 + Math.sin(t * 1.7) * 0.4 };
};

export const pxPerM = (k: Cam) => 1920 / k.span;
export const project = (k: Cam, x: number, y: number): P => {
  const s = pxPerM(k);
  return [PLANE.ox + (x - k.x) * s, PLANE.oy + (k.y - y) * s];
};
export const toScreen = (k: Cam, at: P): P => {
  const [px, py] = project(k, at[0], at[1]);
  const x = px - PLANE.ox, y = py - PLANE.oy;
  const r = (k.rot * Math.PI) / 180;
  return [540 + x * Math.cos(r) - y * Math.sin(r), 960 + x * Math.sin(r) + y * Math.cos(r)];
};
export const camMotion = (t: number) => {
  const a = camAt(t), b = camAt(t + 1 / 30);
  const s = pxPerM(a);
  return { vx: (a.x - b.x) * s, vy: (b.y - a.y) * s, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.deewar1, 9], [C.kalpasar7, 7], [C.khulenge9, 7], [C.par12, 10], [C.n10m, 11], [C.daldal13, 8], [C.file14 + 0.2, 10], [C.eent14, 6], [C.lakh14, 9]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
