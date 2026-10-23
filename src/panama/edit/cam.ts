import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from '../../timezones/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres. */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
type Rings = P[][];
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; places: Record<string, P>; places_deg: Record<string, P>;
  panama: Rings; colombia: Rings; samerica: Record<string, Rings>; gatun: Rings; canal: P[]; rio_indio: P[]; route: P[];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const ll = merc;
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** The scenes, in order; each runs [t0, t1). `map` scenes show the satellite map, the others are full-screen stages. */
export type SceneK = 'map' | 'locks' | 'pools' | 'drought' | 'auction' | 'city';
export const SCENES = (): { k: SceneK; t0: number; t1: number }[] => {
  const s: [SceneK, number][] = [
    ['map', 0], ['locks', C.locks2 - 0.25], ['map', C.khel3 - 0.4], ['pools', C.olympic3 - 0.8], ['map', C.hisaab4 - 0.2],
    ['drought', C.n2023_5 - 0.45], ['map', C.jaise5 - 0.2], ['auction', C.auction5 - 0.2], ['map', C.sept5 - 0.25], ['city', C.ships6 - 0.3], ['map', C.business6 - 0.6],
  ];
  return s.map(([k, t0], i) => ({ k, t0, t1: i + 1 < s.length ? s[i + 1][1] : DURATION_S + 1 }));
};
export const sceneAt = (t: number) => {
  const S = SCENES();
  for (const s of S) if (t >= s.t0 && t < s.t1) return s;
  return S[S.length - 1];
};
export const sceneT0 = (k: SceneK, n = 1) => SCENES().filter((s) => s.k === k)[n - 1];

/** Null's moments (split screen, never at the start, none at the loop's end). `from` = the clip time at t0. */
export const NULL_WIN = () => [
  // B: the finger on "ships का नहीं है", the glass on "आधे लोग पीते हैं"
  { name: 'B', t0: C.ships6 - 0.3, t1: C.peene6 - 3.1, from: 0.1 },
  // C: the hand raised like a wall on "dam", the cupped hands on "ज़िंदा रखने"
  { name: 'C', t0: C.dam7 - 1.0, t1: C.zinda7 + 0.85, from: 0.0 },
];

export const PL = {
  queue: ll(-79.515, 8.862), isthmus: ll(-80.0, 8.75), canal: ll(-79.76, 9.14), lake: ll(-79.86, 9.17), pacific: ll(-79.55, 8.92),
  west: ll(-79.98, 9.02), city: ll(-79.69, 9.08), americas: ll(-72, -14),
};
/** The frame-0 camera: the line of ships in the Pacific approach. The loop's last frame lands back exactly here. */
export const CAM0: Cam = { x: PL.queue[0], y: PL.queue[1], span: 1.7e4, rot: -2 };

const keys = (): Key[] => [
  // line 1: the queue, the gold ship skipping the line; then out to Panama, and down onto the lake that is drying up
  { t: 0, at: [CAM0.x, CAM0.y], span: CAM0.span, rot: CAM0.rot },
  { t: C.line1 + 0.4, at: off(PL.queue, -600, 900), span: 1.45e4, rot: 1, e: linear },
  { t: C.kyunki1 + 0.15, at: PL.isthmus, span: 7.0e5, rot: 0, e: inOut },
  { t: C.paani1 - 0.1, at: PL.isthmus, span: 6.4e5, rot: 0, e: linear },
  { t: C.khatam1 + 0.3, at: PL.lake, span: 1.2e5, rot: 0, e: inOut },
  // line 2: salt or fresh? the whole canal, then the lake itself
  { t: C.ajeeb2 + 0.4, at: PL.canal, span: 1.75e5, rot: 0, e: inOut },
  { t: C.gatun2, at: PL.canal, span: 1.6e5, rot: 0, e: linear },
  { t: C.insaan2, at: PL.lake, span: 1.0e5, rot: -1, e: inOut },
  { t: C.locks2 - 0.25, at: off(PL.lake, 1500, -1500), span: 0.9e5, rot: 0, e: linear },
  // line 3: the water poured into the sea, lake → Pacific
  { t: C.khel3 - 0.4 + 0.001, at: off(PL.canal, 2000, -4000), span: 1.6e5, rot: 0, cut: true },
  { t: C.olympic3 - 0.8, at: off(PL.canal, 3000, -6000), span: 1.45e5, rot: 0, e: linear },
  // line 4: 36 ships a day, the lake refills only with rain
  { t: C.hisaab4 - 0.2 + 0.001, at: PL.canal, span: 1.6e5, rot: 0, cut: true },
  { t: C.baarish4 - 0.6, at: off(PL.lake, 1000, 0), span: 1.05e5, rot: 0, e: inOut },
  { t: C.n2023_5 - 0.45, at: off(PL.lake, 1500, 0), span: 1.0e5, rot: 0, e: linear },
  // line 5b: ships pile up at both ends, then the queue in the Pacific
  { t: C.jaise5 - 0.2 + 0.001, at: off(PL.canal, 2000, 2500), span: 1.85e5, rot: 0, cut: true },
  { t: C.line5 - 0.3, at: off(PL.canal, 2000, 2500), span: 1.75e5, rot: 0, e: linear },
  { t: C.line5 + 0.7, at: PL.queue, span: 2.6e4, rot: 0, e: inOut },
  { t: C.auction5 - 0.2, at: off(PL.queue, 0, 500), span: 2.4e4, rot: 0, e: linear },
  // line 5c: the September slot, the record bid
  { t: C.sept5 - 0.25 + 0.001, at: off(PL.queue, -300, -300), span: 2.2e4, rot: -1, cut: true },
  { t: C.ships6 - 0.9, at: off(PL.queue, -900, 600), span: 1.8e4, rot: 1, e: linear },
  // line 6 (after Panama City): one lake for ships and for drinking water
  { t: C.business6 - 0.6 + 0.001, at: PL.lake, span: 1.35e5, rot: 0, cut: true },
  { t: C.rio7 - 1.0, at: PL.lake, span: 1.22e5, rot: 0, e: linear },
  // line 7: the new dam on the Río Indio, west of the lake
  { t: C.rio7 - 0.4, at: PL.west, span: 1.75e5, rot: 0, e: inOut },
  { t: C.zinda7 + 0.6, at: off(PL.west, 1500, 0), span: 1.6e5, rot: 0, e: linear },
  // line 8: if the water runs out: the lake dries, then the long way round South America, then the whip back to frame 0
  { t: C.khatam8 + 0.2, at: PL.lake, span: 1.1e5, rot: 0, e: inOut },
  { t: C.samerica8 - 0.5, at: PL.lake, span: 1.0e5, rot: 0, e: linear },
  { t: C.samerica8 + 0.6, at: PL.americas, span: 1.25e7, rot: 0, e: inOut },
  { t: C.isiliye8 - 0.15, at: off(PL.americas, 200000, 0), span: 1.18e7, rot: 0, e: linear },
  // lands a few frames early and holds, so the smoothing window has settled on the frame-0 camera by the last frame
  { t: DURATION_S - 0.14, at: [CAM0.x, CAM0.y], span: CAM0.span, rot: CAM0.rot, e: easeIn },
];

type Full = Cam & { t: number; e: Ease; cut: boolean };
const FULL: Full[] = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], span: k.span, rot: k.rot ?? 0, e: k.e ?? linear, cut: !!k.cut }));
const CUTS = FULL.filter((k) => k.cut).map((k) => k.t);
const segOf = (t: number) => {
  let a = 0, b = DURATION_S;
  for (const c of CUTS) { if (c <= t) a = c; else { b = Math.min(b, c - 1e-3); break; } }
  return [a, b] as const;
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      if (b.cut) return FULL[i - 1];
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
export const HITS = () => [C.n53_1, C.khatam1, C.n26_2, C.n20_3, C.n22_5, C.n53_5, C.record5, C.dam7, C.n13k_8];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** The breathe and drift are tied to the loop (whole cycles over the duration), so the last frame matches frame 0. */
const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
export const camAt = (t: number): Cam => {
  const [a, b] = segOf(t);
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(Math.min(b, Math.max(a, t + SMOOTH[i])));
    x += k.x * W8[i]; y += k.y * W8[i]; ls += Math.log(k.span) * W8[i]; rot += k.rot * W8[i];
  }
  const span = Math.exp(ls);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.05 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.025 * Math.sin(t * LOOPF(14)) + 0.01 * Math.sin(t * LOOPF(35) + 1.3)) * (1 - punch);
  const drift = span * 0.008;
  return { x: x + Math.sin(t * LOOPF(20)) * drift, y: y + Math.sin(t * LOOPF(17)) * drift, span: span * breathe, rot: rot + Math.sin(t * LOOPF(9)) * 0.8 };
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
  const [a0, b0] = segOf(t);
  const tb = Math.min(b0, t + 1 / 30), ta = Math.max(a0, tb - 1 / 30);
  const a = camAt(ta), b = camAt(tb);
  const s = pxPerM(a);
  return { vx: (a.x - b.x) * s, vy: (b.y - a.y) * s, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.khatam1, 8], [C.n22_5, 8], [C.record5, 10], [C.dam7, 6], [C.khatam8, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
