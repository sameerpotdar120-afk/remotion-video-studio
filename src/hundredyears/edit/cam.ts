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
  england: Rings; scotland: Rings; france: Rings; en_1337: Rings; en_1429: Rings; en_1430: Rings; burgundy: Rings; dauphin_1429: Rings; en_1453: Rings; europe_land: Rings;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The cutaways (everything else is the map). Each runs [t0, t1). */
export const CUT = {
  field: [C.ghud5 - 0.25, C.saal6 - 0.05],
  village: [C.upar7 - 0.55, C.jaan8 - 0.05],
  square: [C.rouen11 + 0.35, C.aag12 + 1.4],
} as const;
export type Scene = 'map' | keyof typeof CUT;
export const sceneAt = (t: number): Scene => {
  for (const k of Object.keys(CUT) as (keyof typeof CUT)[]) if (t >= CUT[k][0] && t < CUT[k][1]) return k;
  return 'map';
};
/** The parchment map runs from the 1337 slam to the cavalry cutaway; the game look covers line 6. */
export const PARCH: [number, number] = [C.n1337_3 - 0.02, C.ghud5 - 0.25];
export const GAME: [number, number] = [C.saal6 - 0.05, C.domremy7 - 0.45];
/** The burn: the square scene burns away over the map (it starts inside the square cutaway). */
export const BURN: [number, number] = [C.aag12 - 0.3, C.aag12 + 1.4];

/** Null's moments: the shrug on line 6 (B) and the close (A). `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.saal6, t1: C.khel6 - 0.95, from: 0.4 },
  { name: 'A', t0: C.saint13 - 0.3, t1: DURATION_S, from: 0.2 },
];

const ll = merc;
export const PL = {
  hook: ll(0.6, 49.4), channel: ll(1.0, 50.3), england: ll(-1.6, 52.6), france: ll(2.4, 46.8), both: ll(0.5, 49.6), game: ll(2.2, 47.6),
  domremy: ll(5.6847, 48.4417), north: ll(2.4, 48.4), orleans: ll(1.91, 47.9), reims: ll(3.6, 48.9), englandFr: ll(0.4, 50.4), burgundy: ll(2.6, 49.4), end: ll(1.5, 48.2),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: England and France across the Channel, a slow push onto the duel, Joan swoops in
  { t: 0, at: off(PL.hook, 0, 2e5), span: 3.0e6, rot: -1 },
  { t: C.n17_2 - 0.2, at: PL.hook, span: 2.3e6, rot: 0, e: inOut },
  { t: C.n17_2 + 0.5, at: PL.channel, span: 1.5e6, rot: 1, e: easeOut },
  { t: C.par2, at: off(PL.channel, 0, 0), span: 1.3e6, rot: 0, e: linear },
  { t: C.dard2 + 1.0, at: off(PL.channel, 0, -3e4), span: 1.05e6, rot: 0, e: inOut },
  // 1337: a hard cut to the parchment map, then onto England and Edward
  { t: C.n1337_3 - 0.02 + 0.001, at: PL.both, span: 4.2e6, rot: 0, cut: true },
  { t: C.n1337_3 + 0.4, at: PL.both, span: 3.4e6, rot: 0, e: easeOut },
  { t: C.edward3 - 0.1, at: off(PL.both, 0, 0), span: 3.2e6, rot: 0, e: linear },
  { t: C.edward3 + 0.6, at: PL.england, span: 1.35e6, rot: 0, e: inOut },
  { t: C.mana4 - 0.4, at: off(PL.england, 0, 0), span: 1.25e6, rot: 0, e: linear },
  // France says no; the war begins
  { t: C.mana4 + 0.3, at: PL.france, span: 1.7e6, rot: 0, e: inOut },
  { t: C.zid4 - 0.1, at: off(PL.france, 0, 0), span: 1.6e6, rot: 0, e: linear },
  { t: C.zid4 + 0.6, at: PL.both, span: 2.4e6, rot: 0, e: inOut },
  { t: PARCH[1], at: PL.both, span: 2.3e6, rot: 0, e: linear },
  // the game look over France, decades later
  { t: GAME[0] + 0.001, at: off(PL.game, 0, 3e5), span: 2.9e6, rot: 0, cut: true },
  { t: C.khel6, at: PL.game, span: 2.5e6, rot: 0, e: easeOut },
  { t: GAME[1], at: PL.game, span: 2.4e6, rot: 0, e: linear },
  // Domrémy: a satellite close-up, Joan appears, a pull-out
  { t: GAME[1] + 0.001, at: off(PL.domremy, 0, 2e4), span: 2.6e5, rot: 0, cut: true },
  { t: C.joan7 - 0.2, at: PL.domremy, span: 2.3e5, rot: 0, e: easeOut },
  { t: C.joan7 + 0.6, at: off(PL.domremy, 0, 1.2e5), span: 0.9e6, rot: 0, e: inOut },
  { t: CUT.village[0], at: off(PL.domremy, 0, 1.2e5), span: 0.85e6, rot: 0, e: linear },
  // the rally: from Joan out to all of northern France under English red
  { t: CUT.village[1] + 0.001, at: PL.north, span: 4.5e5, rot: 0, cut: true },
  { t: C.n1429_9, at: PL.north, span: 2.0e6, rot: 0, e: inOut },
  { t: C.orleans9 + 0.5, at: PL.orleans, span: 1.0e6, rot: 0, e: inOut },
  { t: C.reims9 - 0.2, at: off(PL.orleans, 0, 0), span: 0.95e6, rot: 0, e: linear },
  { t: C.reims9 + 0.5, at: PL.reims, span: 1.2e6, rot: 0, e: inOut },
  { t: C.dushman10 - 0.2, at: off(PL.reims, 0, 0), span: 1.15e6, rot: 0, e: linear },
  // the enemy's answer, Burgundy, the capture
  { t: C.dushman10 + 0.5, at: PL.englandFr, span: 2.4e6, rot: 0, e: inOut },
  { t: C.burgundy11 - 0.1, at: off(PL.englandFr, 0, 0), span: 2.3e6, rot: 0, e: linear },
  { t: C.burgundy11 + 0.6, at: PL.burgundy, span: 1.5e6, rot: 0, e: inOut },
  { t: CUT.square[0], at: off(PL.burgundy, -1e5, 0), span: 1.4e6, rot: 0, e: linear },
  // after the burn: the map under the ash, then France whole again
  { t: BURN[0] + 0.001, at: PL.end, span: 2.4e6, rot: 0, cut: true },
  { t: C.n1453_12 + 0.6, at: PL.end, span: 2.7e6, rot: 0, e: inOut },
  { t: DURATION_S, at: off(PL.end, 0, -1e5), span: 2.9e6, rot: 0, e: linear },
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
export const HITS = () => [C.n116_1 + 0.3, C.n17_2 + 0.1, C.n1337_3, C.edward3, C.hundred4, C.domremy7, C.joan7, C.jaan8, C.ghera9, C.charles9, C.burgundy11, C.n1453_12, C.saint13];

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
  for (const h of HITS()) if (t > h) punch += 0.06 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  // the camera never stops: a slow breathe plus a drift and a gentle roll
  const breathe = (1 + 0.035 * Math.sin(t * 0.9) + 0.015 * Math.sin(t * 2.2 + 1.3)) * (1 - punch);
  const drift = span * 0.012;
  return { x: x + Math.sin(t * 1.3) * drift, y: y + Math.cos(t * 1.1) * drift, span: span * breathe, rot: rot + Math.sin(t * 0.6) * 1.2 + Math.sin(t * 1.7) * 0.35 };
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
  for (const [t0, a] of [[C.n17_2 + 0.15, 14], [C.n1337_3, 12], [C.zid4 + 0.4, 10], [C.jaan8, 8], [C.ghera9, 7], [C.n1453_12, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
