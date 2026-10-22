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
  gb: Rings; uk: Rings; ireland: Rings; colombia: Rings; wetter: [string, number, number, number][];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The beats (seconds). */
export const SC = {
  fog: C.par1 - 0.15,
  flight: [C.socho2 - 0.1, C.london2 + 0.15] as const,
  tourist: C.london2 + 0.1,
  montage: [C.subah2 - 0.15, C.hawa2 - 0.05] as const,
  wind: [C.hawa2 - 0.05, C.scotland3 - 0.2] as const,
  tilt: [C.duniya5 - 0.25, C.pehle5 - 0.1] as const,
  battle: C.kyunki7 - 0.2,
  gulf: C.pashchim8 - 0.15,
  winds: C.uttar9 - 0.2,
};
export const inTilt = (t: number) => t >= SC.tilt[0] && t < SC.tilt[1];

/** Null's moments: "…इतना अजीब क्यों है?" (B) and the close (A). `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.toh6 - 0.1, t1: C.kyunki7 - 0.15, from: 0.2 },
  { name: 'A', t0: C.video11 - 0.25, t1: DURATION_S, from: 0.3 },
];

const ll = merc;
export const PL = {
  europe: ll(2, 50), isles: ll(-3.5, 54.6), england: ll(-1.6, 52.6), mid: ll(30, 40), scot: ll(-4.5, 56.8),
  colombia: ll(-73.5, 4.2), samerica: ll(-70, 0), atlantic: ll(-40, 38), world: ll(10, 10),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Map camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // line 1: Europe, the push into Britain (the reference's ease-in push with a slight roll)
  { t: 0, at: off(PL.europe, 0, -6e5), span: 7.5e6, rot: -3 },
  { t: C.britain1 - 0.1, at: PL.isles, span: 2.4e6, rot: 2, e: easeIn },
  { t: SC.flight[0], at: off(PL.isles, 0, -1e5), span: 2.2e6, rot: 0, e: linear },
  // line 2: Mumbai → London on the world map, then the dive into England
  { t: SC.flight[0] + 0.001, at: ll(36, 36), span: 1.4e7, rot: 0, cut: true },
  { t: C.london2 - 0.3, at: ll(10, 46), span: 9e6, rot: 0, e: inOut },
  { t: SC.tourist, at: PL.england, span: 9.0e5, rot: 0, e: easeIn },
  { t: SC.wind[1], at: off(PL.england, 0, 2e4), span: 7.5e5, rot: 1, e: linear },
  // line 3: out to the islands, the calendar over Scotland, the ellipse
  { t: C.scotland3 + 0.4, at: PL.isles, span: 2.6e6, rot: 0, e: inOut },
  { t: C.dekh3, at: off(PL.isles, 0, -2e5), span: 3.0e6, rot: 0, e: inOut },
  { t: C.geeli3 + 0.3, at: off(PL.isles, 2e5, -1.4e6), span: 6.0e6, rot: 0, e: inOut },
  { t: SC.tilt[0], at: off(PL.isles, 2e5, -1.6e6), span: 6.5e6, rot: 0, e: linear },
  // line 5: the world (tilted), then Colombia
  { t: SC.tilt[0] + 0.001, at: PL.world, span: 3.6e7, rot: 0, cut: true },
  { t: SC.tilt[1], at: PL.world, span: 3.4e7, rot: 0, e: linear },
  { t: SC.tilt[1] + 0.001, at: off(PL.samerica, 0, 5e5), span: 9.0e6, rot: 0, cut: true },
  { t: C.colombia5 + 0.3, at: PL.colombia, span: 4.0e6, rot: 0, e: inOut },
  { t: C.pacific5 - 0.2, at: off(PL.colombia, -6e5, -1e5), span: 4.4e6, rot: 0, e: inOut },
  { t: C.pahaad5 - 0.1, at: PL.colombia, span: 2.6e6, rot: 0, e: inOut },
  { t: C.toh6, at: PL.colombia, span: 2.4e6, rot: 0, e: linear },
  // line 6: the long pan back over the Atlantic to the islands
  { t: C.kyunki7 - 0.3, at: PL.isles, span: 3.2e6, rot: 0, e: inOut },
  { t: SC.gulf, at: off(PL.isles, 0, -2e5), span: 3.4e6, rot: 0, e: linear },
  // line 8: the North Atlantic and the Gulf Stream, back to the islands for the moisture and the winds
  { t: C.sponsor8, at: PL.atlantic, span: 1.6e7, rot: 0, e: inOut },
  { t: C.garm8, at: off(PL.atlantic, 4e5, 0), span: 1.5e7, rot: 0, e: linear },
  { t: C.nami8 + 0.2, at: off(PL.isles, -6e5, 0), span: 4.0e6, rot: 0, e: inOut },
  { t: SC.winds, at: off(PL.isles, -2e5, 0), span: 3.2e6, rot: 0, e: linear },
  // line 9–10: the four winds, the end card
  { t: C.poorab9 + 0.3, at: off(PL.isles, 2e5, -3e5), span: 4.2e6, rot: 0, e: inOut },
  { t: C.jeet10, at: off(PL.isles, 0, -4e5), span: 5.0e6, rot: 0, e: inOut },
  { t: DURATION_S, at: off(PL.isles, 0, -5e5), span: 5.4e6, rot: 0, e: linear },
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
export const HITS = () => [C.hisaab1, C.n250_3, C.nahi4, C.n70_5, C.colombia5, C.jang7, C.gulf8, C.jeet10];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
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
  // the camera never stops: a slow breathe plus a drift and a gentle roll
  const breathe = (1 + 0.03 * Math.sin(t * 0.9) + 0.012 * Math.sin(t * 2.2 + 1.3)) * (1 - punch);
  const drift = span * 0.01;
  return { x: x + Math.sin(t * 1.3) * drift, y: y + Math.cos(t * 1.1) * drift, span: span * breathe, rot: rot + Math.sin(t * 0.6) * 1.0 + Math.sin(t * 1.7) * 0.3 };
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
  for (const [t0, a] of [[C.hisaab1, 10], [C.ole2, 6], [C.nahi4, 10], [C.jang7, 8], [C.jeet10, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
