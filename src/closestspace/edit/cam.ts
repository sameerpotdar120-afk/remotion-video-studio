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
  nepal: Rings; china: Rings; india: Rings; ecuador: Rings; border_np_cn: P[][]; equator: P[][];
  ev3d: { lonlat: [number, number, number, number]; w: number; h: number; max: number; min: number };
  deg: Record<string, P[][]>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The scenes. The map runs everywhere the others don't. */
export const SC = {
  // the magnifier lands on Everest, then dives through the lens into the 3D fly-over
  lens1: [C.dhoond2 - 0.2, C.everest2 + 0.62] as const,
  ev3d: [C.everest2 + 0.55, C.choti3 - 0.22] as const,
  // the globe: from "तो लगता है…" to the dive onto the equator
  globe1: [C.lagta3 - 0.25, C.dhoond9 + 0.5] as const,
  roti: [C.bilkul6 - 0.12, C.pahad7 - 0.12] as const,
  geoid: [C.hazaron7 - 0.12, C.natija8 - 0.15] as const,
  // the hunt along the equator to the Andes
  lens2: [C.dhoond9 + 0.5, C.chimb9 + 0.15] as const,
  globe2: [C.center10 - 0.35, DURATION_S + 1] as const,
};
export type Scene = 'map' | 'ev3d' | 'globe' | 'roti' | 'geoid';
export const sceneAt = (t: number): Scene => {
  if (t >= SC.ev3d[0] && t < SC.ev3d[1]) return 'ev3d';
  if (t >= SC.roti[0] && t < SC.roti[1]) return 'roti';
  if (t >= SC.geoid[0] && t < SC.geoid[1]) return 'geoid';
  if ((t >= SC.globe1[0] && t < SC.globe1[1]) || t >= SC.globe2[0]) return 'globe';
  return 'map';
};

/** Null's moments: the flat-earth joke (B) and the close (A). `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.chapti4 - 0.1, t1: C.ball5 - 0.2, from: 0.0 },
  { name: 'A', t0: C.video12 - 0.25, t1: DURATION_S, from: 2.4 },
];

const ll = merc;
export const PL = {
  hook0: ll(-10, 22), hook1: ll(30, 24), oldworld: ll(55, 22), asia: ll(84, 27), everest: ll(86.925, 27.988), nepalChina: ll(88, 31),
  africaEq: ll(36, 0), atlantic: ll(-25, 0), chimb: ll(-78.817, -1.469), ecuador: ll(-78.4, -1.6),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Map camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: the flat world, drifting right while the pins rise toward space
  { t: 0, at: PL.hook0, span: 2.5e7, rot: -1 },
  { t: C.nahi1 + 0.4, at: PL.hook1, span: 2.2e7, rot: 0, e: inOut },
  // the hunt: in onto the Old World, the lens sweeps Africa → Arabia → India, lands on the Himalaya
  { t: C.dhoond2 + 0.3, at: PL.oldworld, span: 1.25e7, rot: 0, e: inOut },
  { t: C.everest2 - 0.2, at: PL.asia, span: 7.5e6, rot: 0, e: inOut },
  { t: SC.ev3d[0], at: PL.everest, span: 5.0e6, rot: 0, e: easeIn },
  // after the fly-over: top-down over the summit, the border draws, then out to Nepal and China
  { t: SC.ev3d[1] + 0.001, at: off(PL.everest, 0, -4e3), span: 7.0e4, rot: 0, cut: true },
  { t: C.dakshin3 - 0.1, at: PL.everest, span: 1.6e5, rot: 0, e: inOut },
  { t: C.nepal3 + 0.1, at: off(PL.everest, -2e4, -1e4), span: 2.2e5, rot: 0, e: linear },
  { t: C.china3 - 0.05, at: PL.nepalChina, span: 4.6e6, rot: 0, e: inOut },
  { t: SC.globe1[0], at: PL.nepalChina, span: 4.2e6, rot: 0, e: linear },
  // the equator: Africa, then west across the Atlantic to the Andes
  { t: SC.lens2[0] + 0.001, at: PL.africaEq, span: 3.6e6, rot: 0, cut: true },
  { t: C.equator9 + 0.3, at: off(PL.africaEq, -6e5, 0), span: 4.0e6, rot: 0, e: easeOut },
  { t: C.ecuador9 - 0.35, at: PL.chimb, span: 6.0e6, rot: 0, e: inOut },
  { t: C.chimb9 + 0.6, at: off(PL.chimb, 0, -1e5), span: 2.4e6, rot: 0, e: inOut },
  { t: C.n6263_9 + 0.8, at: off(PL.chimb, 0, -1.2e5), span: 2.2e6, rot: 0, e: linear },
  { t: C.everest10 + 0.2, at: PL.ecuador, span: 2.6e6, rot: 0, e: inOut },
  { t: SC.globe2[0], at: PL.ecuador, span: 2.9e6, rot: 0, e: linear },
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
export const HITS = () => [C.space1, C.everest2, C.nepal3, C.china3, C.galat4, C.n21_8, C.chimb9, C.n2_10, C.ecuador11];

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
  for (const [t0, a] of [[C.easy1 + 0.1, 8], [C.galat4, 12], [C.n21_8, 6], [C.n2_10, 8], [C.ecuador11, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
