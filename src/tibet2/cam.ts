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
  plates: Record<string, Plate>; india: P[][]; china: P[][]; plateau: P[][]; france: P[][]; france_c: P; l888: P[];
  places: Record<string, P>; hima: { bounds: number[]; lonlat: [number, number, number, number]; w: number; h: number; max: number; min: number };
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** Null's one moment: the closing question (split screen, about 6 s). */
export const NULL_WIN = () => [{ name: 'A', t0: C.aap10 - 0.1, t1: DURATION_S, from: 1.6 }];

const ll = merc;
export const PL = {
  tibet: GEO.places.tibet_c, asia: ll(86, 30), indiaTibet: ll(84, 27.5), l888: ll(89.5, 32.6), everest: GEO.places.everest,
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Map camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover.
 *  The 3D fly-over (from "ज़मीन" to "मौसम") has its own camera; the map waits on the plateau meanwhile. */
const keys = (): Key[] => [
  // frame 0: the flight map, already drifting toward the empty zone
  { t: 0, at: off(PL.tibet, -6e5, -4e5), span: 1.3e7, rot: -3 },
  { t: C.khaali1 + 0.3, at: PL.tibet, span: 9.5e6, rot: 0, e: easeOut },
  // "India के ठीक ऊपर"
  { t: C.india1 + 0.4, at: PL.indiaTibet, span: 1.0e7, rot: 1, e: inOut },
  { t: C.kyu1, at: PL.indiaTibet, span: 9.2e6, rot: 0, e: linear },
  // "ये है Tibet का पठार": in on the plateau, glowing red
  { t: C.tibet2 + 0.3, at: PL.tibet, span: 6.2e6, rot: -2, e: inOut },
  // "France से चार गुना": pull out a little so the four Frances read
  { t: C.france2 + 0.2, at: PL.tibet, span: 7.2e6, rot: 0, e: inOut },
  { t: C.unchaa2 + 0.6, at: PL.tibet, span: 6.6e6, rot: 1, e: linear },
  // "ज़मीन… 4,500 मीटर": dive toward Everest (the 3D fly-over takes over)
  { t: C.zameen3 + 0.2, at: PL.everest, span: 1.6e6, rot: 0, e: easeIn },
  { t: C.mausam7 - 0.6, at: PL.tibet, span: 6.6e6, rot: -1, e: inOut },
  // weather over the plateau
  { t: C.mausam7 + 0.1, at: PL.tibet, span: 6.2e6, rot: 1, e: inOut },
  { t: C.aasmaan7 + 0.4, at: PL.tibet, span: 5.8e6, rot: -1, e: linear },
  // the few airports
  { t: C.airports8 + 0.2, at: PL.tibet, span: 6.4e6, rot: 0, e: inOut },
  { t: C.pahadon8 + 0.6, at: PL.tibet, span: 6.1e6, rot: 1, e: linear },
  // L888 across the plateau
  { t: C.raasta9 + 0.2, at: PL.l888, span: 6.4e6, rot: 0, e: inOut },
  { t: C.planes9 + 0.4, at: PL.l888, span: 6.0e6, rot: -1, e: linear },
  { t: DURATION_S, at: off(PL.l888, 0, -3e5), span: 6.6e6, rot: 0, e: linear },
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
export const HITS = () => [C.khaali1, C.tibet2, C.chaar2, C.airports8, C.l888];

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
  for (const [t0, a] of [[C.khaali1, 6], [C.gadbad1 + 0.2, 8], [C.tibet2, 7], [C.achanak4, 12], [C.par6, 10], [C.jagah6 + 0.3, 9], [C.hawayen7, 9], [C.jhatke7, 14], [C.band9, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
