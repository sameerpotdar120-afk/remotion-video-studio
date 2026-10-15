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
  plates: Record<string, Plate>; india: P[][]; westbengal: P[][]; urban: P[][]; places: Record<string, P>; hooghly: P[];
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

/** Null's one moment: the closing question and the send prompt (split screen, about 7 s). */
export const NULL_WIN = () => [{ name: 'A', t0: C.to10 - 0.1, t1: DURATION_S, from: 1.0 }];

const ll = merc;
const pl = GEO.places;
export const PL = {
  india: ll(82, 22.5), city: ll(88.355, 22.575), villages: ll(88.352, 22.578),
  sutanuti: pl.sutanuti, kalikata: pl.kalikata, gobindapur: pl.gobindapur, court: pl.highcourt,
  bay: ll(88.1, 21.75), river: ll(88.2, 22.25),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover.
 *  The real map throughout: Sutanuti is the north village, Kalikata the middle, Gobindapur the south (the Fort William site);
 *  the Hooghly runs down to the Bay of Bengal in the south. */
const keys = (): Key[] => [
  // frame 0: today's Kolkata from above, already pushing in on the river
  { t: 0, at: off(PL.city, 1200, -1500), span: 5.2e4, rot: -4 },
  { t: C.kolkata1, at: PL.city, span: 1.9e4, rot: 1, e: easeOut },
  // "तीन गाँव": closer, onto the three village spots (the past grade comes in)
  { t: C.teen1 + 0.3, at: PL.villages, span: 1.15e4, rot: 0, e: inOut },
  { t: C.to1 - 0.1, at: off(PL.villages, 200, 150), span: 1.05e4, rot: -1, e: linear },
  // "देश की राजधानी?": pull all the way out to India
  { t: C.raj1 + 0.4, at: PL.india, span: 3.3e6, rot: 1, e: inOut },
  { t: C.pehla2 - 0.3, at: off(PL.india, 1.5e5, 0), span: 3.1e6, rot: 0, e: linear },
  // 1: Sutanuti (north)
  { t: C.sutanuti2 + 0.2, at: PL.sutanuti, span: 6.5e3, rot: -1, e: inOut },
  { t: C.chitpur2 + 0.6, at: off(PL.sutanuti, 300, 400), span: 5.8e3, rot: 0, e: linear },
  // 2: south to Gobindapur
  { t: C.gobind3 + 0.2, at: PL.gobindapur, span: 6.5e3, rot: 1, e: inOut },
  { t: C.vahin3 + 0.8, at: off(PL.gobindapur, -200, -100), span: 5.8e3, rot: 0, e: linear },
  // 3: back north to Kalikata (the middle)
  { t: C.kalikata4 + 0.2, at: PL.kalikata, span: 6.5e3, rot: -1, e: inOut },
  { t: C.central4 + 1.0, at: off(PL.kalikata, 200, 0), span: 6.0e3, rot: 0, e: linear },
  // the Hooghly: drop to the Bay and fly up the river with the ship
  { t: C.hooghly5 + 0.4, at: PL.bay, span: 1.7e5, rot: 2, e: inOut },
  { t: C.perfect5, at: PL.river, span: 1.3e5, rot: 0, e: linear },
  // 1698: back on the three villages
  { t: C.y1698 + 0.3, at: PL.villages, span: 1.4e4, rot: -1, e: inOut },
  { t: C.haq5 + 0.6, at: PL.villages, span: 1.25e4, rot: 0, e: linear },
  // Fort William: Gobindapur close
  { t: C.fort6 + 0.3, at: PL.gobindapur, span: 5.5e3, rot: 1, e: inOut },
  { t: C.khali6 + 1.0, at: PL.gobindapur, span: 4.8e3, rot: 0, e: linear },
  // one city, then the capital of British India
  { t: C.yahin7 + 0.4, at: PL.villages, span: 1.6e4, rot: -1, e: inOut },
  { t: C.british7 - 0.2, at: PL.city, span: 2.4e4, rot: 0, e: linear },
  { t: C.raj7 + 0.4, at: PL.india, span: 3.2e6, rot: 1, e: inOut },
  // the book (camera drifts on the city), then the High Court
  { t: C.kitab8 + 0.4, at: PL.city, span: 2.2e4, rot: 0, e: inOut },
  { t: C.court8 + 0.2, at: PL.court, span: 5.0e3, rot: -1, e: inOut },
  { t: C.pehle8 + 0.8, at: PL.villages, span: 1.2e4, rot: 0, e: inOut },
  // "ये हमेशा से यहीं था": the whole city in golden light
  { t: C.hamesha9 + 0.3, at: PL.city, span: 2.6e4, rot: 1, e: inOut },
  { t: DURATION_S, at: off(PL.city, 0, -600), span: 2.3e4, rot: -1, e: linear },
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
export const HITS = () => [C.teen1, C.n1300, C.raj1, C.sutanuti2, C.gobind3, C.kalikata4, C.y1698, C.khali6, C.raj7, C.court8, C.hamesha9];

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
  for (const [t0, a] of [[C.n1300 + 0.4, 7], [C.raj1, 6], [C.y1698, 8], [C.khali6, 10], [C.raj7, 7], [C.court8 + 0.5, 11], [C.hamesha9, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
