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
  plates: Record<string, Plate>; places: Record<string, P>; states: Record<string, P[][]>; teesta: P[];
  india: P[][]; ne: P[][]; westbengal: P[][]; andaman: P[][]; nepal: P[][]; bhutan: P[][]; bangladesh: P[][]; myanmar: P[][];
  pakistan: P[][]; srilanka: P[][]; malaysia: P[][]; indonesia: P[][]; thailand: P[][]; china: P[][]; chumbi: P[][]; corridor: P[][];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** tilt: After Effects style camera tilt in degrees (the map leans back), applied to the map layer and to every label. */
export type Cam = { x: number; y: number; span: number; rot: number; tilt?: number; cut?: boolean };
export const PERSP = 1800;
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** Null's two moments: "पर India भी तैयार है" (middle) and the closing question (end), each in a split screen. */
export const NULL_WIN = () => [
  { name: 'A', t0: C.par8 - 0.1, t1: C.n3_8 + 0.3, from: 4.6 },
  { name: 'B', t0: C.to10 - 0.1, t1: DURATION_S, from: 0.6 },
];

const ll = merc;
const pl = GEO.places;
export const PL = {
  india: ll(84, 24), east: ll(91.0, 25.6), neck: pl.neck, corridor: ll(88.3, 26.6), nbrs: ll(88.9, 26.9),
  bengal: ll(90.2, 23.6), mongla: pl.mongla, teesta: ll(88.95, 26.2), bases: ll(88.75, 26.35), kaladan: ll(92.2, 22.0),
  asia: ll(98, 12), malacca: ll(100.8, 3.6), andaman: ll(93.6, 10.2), ne: ll(92.6, 25.9),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // the hook: India, then down onto the strip; it's cut; the Northeast is gone; "where is it?"
  { t: 0, at: off(PL.india, 0, 2e5), span: 4.4e6, rot: -3 },
  { t: C.n22 + 0.3, at: PL.neck, span: 5.0e5, rot: 1, e: inOut },
  { t: C.kati1 + 0.2, at: PL.neck, span: 4.2e5, rot: 0, e: linear },
  { t: C.crore1 + 0.2, at: off(PL.east, -1e5, 0), span: 1.9e6, rot: -1, e: inOut },
  { t: C.khatam1 + 0.4, at: off(PL.east, 0, 0), span: 1.8e6, rot: 0, e: linear },
  { t: C.kahan1 + 0.5, at: PL.corridor, span: 2.2e5, rot: 2, e: inOut },
  // the Siliguri Corridor, the chicken's neck; then the 8 states and 8%
  { t: C.chicken2 + 0.6, at: off(PL.corridor, 0, -8e3), span: 1.8e5, rot: 0, e: linear },
  { t: C.northeast2 + 0.3, at: PL.ne, span: 1.75e6, rot: -1, e: inOut },
  { t: C.zameen2 + 0.3, at: off(PL.ne, -5e4, 0), span: 1.6e6, rot: 0, e: linear },
  // road, rail, oil: through the strip
  { t: C.sadak3 + 0.2, at: ll(89.4, 26.3), span: 1.0e6, rot: 1, e: inOut },
  { t: C.sab3 + 0.6, at: ll(89.4, 26.35), span: 9.0e5, rot: 0, e: linear },
  // the neighbours and China's Chumbi Valley
  { t: C.nepal4, at: off(PL.nbrs, -2e5, 0), span: 9.0e5, rot: -2, e: inOut },
  { t: C.bangla4 + 0.2, at: off(PL.nbrs, 0, -1.2e5), span: 1.0e6, rot: 0, e: inOut },
  { t: C.bhutan4 + 0.2, at: off(PL.nbrs, 6e4, 5e4), span: 8.5e5, rot: 1, e: inOut },
  { t: C.chumbi4 + 0.3, at: ll(88.85, 27.15), span: 4.2e5, rot: 0, e: inOut },
  // the second route: by sea through Chattogram and Mongla
  { t: C.isiliye5 + 0.6, at: PL.bengal, span: 1.5e6, rot: -1, e: inOut },
  { t: C.mongla5 + 0.6, at: off(PL.bengal, -5e4, -3e4), span: 1.35e6, rot: 0, e: linear },
  // Mongla: India's zone becomes China's; China pays for the port
  { t: C.par6 + 0.4, at: PL.mongla, span: 3.4e5, rot: 1, e: inOut },
  { t: C.paisa6 + 1.2, at: off(PL.mongla, 0, 1e4), span: 2.9e5, rot: 0, e: linear },
  // the Teesta project, right next to the neck
  { t: C.teesta7 + 0.3, at: PL.teesta, span: 6.0e5, rot: -1, e: inOut },
  { t: C.karib7 + 0.4, at: off(PL.teesta, -3e4, 2e4), span: 4.6e5, rot: 0, e: linear },
  // India is ready: 3 new bases; then the Kaladan route
  { t: C.army8, at: PL.bases, span: 6.2e5, rot: 1, e: inOut },
  { t: C.kaladan8 + 0.3, at: PL.kaladan, span: 1.5e6, rot: -1, e: inOut },
  { t: C.mizoram8 + 1.4, at: off(PL.kaladan, 0, 6e4), span: 1.35e6, rot: 0, e: linear },
  // China's own thin neck: Malacca; India's Andaman-Nicobar at its door
  { t: C.gardan9 + 0.3, at: PL.asia, span: 7.5e6, rot: 0, e: inOut },
  { t: C.tel9 + 0.6, at: off(PL.asia, 0, -5e5), span: 6.0e6, rot: 0, e: linear },
  { t: C.malacca9 + 0.5, at: PL.malacca, span: 1.9e6, rot: -2, e: inOut },
  { t: C.n28 + 1.2, at: ll(102.6, 2.0), span: 9.0e5, rot: 0, e: inOut },
  { t: C.darwaze9 + 0.4, at: PL.andaman, span: 2.6e6, rot: 1, e: inOut },
  { t: C.to10 - 0.2, at: off(PL.andaman, 0, 4e4), span: 2.3e6, rot: 0, e: linear },
  // the question: back on India and the neck
  { t: C.to10 + 0.4, at: off(PL.east, -2e5, -1e5), span: 2.2e6, rot: 0, e: inOut },
  { t: DURATION_S, at: off(PL.east, -2e5, -1e5), span: 2.0e6, rot: -1, e: linear },
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
export const HITS = () => [C.n22, C.kati1, C.khatam1, C.siliguri2, C.n8b2, C.chumbi4, C.y2018, C.china6, C.taiyar8, C.n3_8, C.malacca9, C.n28, C.andaman9];

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
  const dx = x * Math.cos(r) - y * Math.sin(r), dy = x * Math.sin(r) + y * Math.cos(r);
  if (!k.tilt) return [540 + dx, 960 + dy];
  const a = (k.tilt * Math.PI) / 180, w = 1 - (dy * Math.sin(a)) / PERSP;
  return [540 + dx / w, 960 + (dy * Math.cos(a)) / w];
};
export const camMotion = (t: number) => {
  const a = camAt(t), b = camAt(t + 1 / 30);
  const s = pxPerM(a);
  return { vx: (a.x - b.x) * s, vy: (b.y - a.y) * s, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.kati1, 12], [C.khatam1, 9], [C.chumbi4, 8], [C.china6, 8], [C.n3_8 + 0.3, 7], [C.n28, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
