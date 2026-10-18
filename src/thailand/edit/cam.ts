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
  plates: Record<string, Plate>; countries: Record<string, Rings>; places: Record<string, P>; places_deg: Record<string, P>;
  british_india: Rings; burma: Rings; french_indochina: Rings; siam_1890: Rings; siam_today: Rings; laos: Rings; cambodia_1907: Rings; cambodia_rest: Rings;
  malay4: Rings; malaya_british: Rings; vietnam: Rings; chao_phraya_core: Rings; sphere_west: Rings; sphere_east: Rings; dutch_east_indies: Rings;
  philippines: Rings; timor: Rings;
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
  tug: [C.britain3 - 0.3, C.paschim4 - 0.02],
  soldiers: [C.teen4 - 0.12, C.burma4 - 0.06],
  flex: [C.dono7 - 0.1, C.dikkat7 - 0.05],
  balance: [C.dikkat7 - 0.05, C.sarhad7 - 0.08],
  palace: [C.hua8 - 0.3, C.bas15 - 0.12],
  king: [C.rajaon18 - 0.3, C.kinare19 - 0.12],
} as const;
export type Scene = 'map' | keyof typeof CUT;
export const sceneAt = (t: number): Scene => {
  for (const k of Object.keys(CUT) as (keyof typeof CUT)[]) if (t >= CUT[k][0] && t < CUT[k][1]) return k;
  return 'map';
};

/** Null's moment: the send prompt at the close, about 6 s. `from` is the clip time at t0. */
export const NULL_WIN = () => [{ name: 'A', t0: C.video21 - 0.6, t1: DURATION_S, from: 0.2 }];

const ll = merc;
export const PL = {
  india: ll(80, 23), sea: ll(104, 10), siam: ll(101, 15.2), indiaBurma: ll(89, 21.5), burma: ll(96.5, 20.5), indochina: ll(105.5, 15), three: ll(99.5, 16.5),
  core: ll(100.4, 15.3), gulf: ll(100.56, 13.66), laos: ll(102.5, 16.5), south: ll(101.2, 9.5), wide: ll(108, 8),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // hook: British India first, then east to South-East Asia where the colonies fill in, then onto the one plain country
  { t: 0, at: off(PL.india, 0, 4e5), span: 6.6e6, rot: -2 },
  { t: C.raj1 + 0.4, at: PL.india, span: 5.6e6, rot: 0, e: inOut },
  { t: C.bagal1 - 0.1, at: off(PL.india, 2e5, 0), span: 5.4e6, rot: 0, e: linear },
  { t: C.bagal1 + 1.1, at: PL.sea, span: 1.05e7, rot: 0, e: inOut },
  { t: C.kaise1 - 0.4, at: off(PL.sea, 0, 0), span: 1.0e7, rot: 0, e: linear },
  { t: C.kaise1 + 0.3, at: PL.siam, span: 4.6e6, rot: 1, e: inOut },
  { t: C.thailand2 + 0.4, at: PL.siam, span: 3.9e6, rot: 0, e: inOut },
  { t: CUT.tug[0], at: off(PL.siam, 0, 0), span: 3.6e6, rot: 0, e: linear },
  // Britain from India: India and Burma, the push arrow, then (after the battle) Burma turns British
  { t: CUT.tug[1] + 0.01, at: off(PL.indiaBurma, -4e5, 2e5), span: 7.4e6, rot: -2, cut: true },
  { t: C.india4 + 0.2, at: PL.indiaBurma, span: 6.6e6, rot: 0, e: easeOut },
  { t: CUT.soldiers[0], at: off(PL.indiaBurma, 3e5, 0), span: 6.0e6, rot: 0, e: inOut },
  { t: CUT.soldiers[1] + 0.01, at: off(PL.burma, 2e5, 0), span: 4.8e6, rot: 1, cut: true },
  { t: C.british4, at: PL.burma, span: 4.3e6, rot: 0, e: easeOut },
  { t: C.poorab5 - 0.2, at: off(PL.burma, 0, 0), span: 4.1e6, rot: 0, e: linear },
  // France from the east: Vietnam, then Cambodia
  { t: C.poorab5 + 0.9, at: PL.indochina, span: 5.0e6, rot: 0, e: inOut },
  { t: C.cambodia5 + 0.3, at: off(PL.indochina, -2e5, -2e5), span: 4.6e6, rot: 0, e: inOut },
  // all three: Siam squeezed in the middle
  { t: C.beech6 + 0.3, at: PL.three, span: 7.4e6, rot: 0, e: inOut },
  { t: CUT.flex[0], at: off(PL.three, 0, 0), span: 7.0e6, rot: 0, e: linear },
  // the borders would touch: the spheres over Siam, the electric line, the clash
  { t: CUT.balance[1] + 0.01, at: off(PL.siam, 0, 3e5), span: 4.4e6, rot: -1, cut: true },
  { t: C.mil7, at: PL.siam, span: 3.9e6, rot: 0, e: easeOut },
  { t: CUT.palace[0], at: PL.siam, span: 3.7e6, rot: 0, e: linear },
  // the buffer: Siam, the gloves, the 1896 core and its padlock
  { t: CUT.palace[1] + 0.01, at: off(PL.siam, 0, -3e5), span: 4.4e6, rot: 1, cut: true },
  { t: C.gaddi15, at: PL.siam, span: 3.9e6, rot: 0, e: easeOut },
  { t: C.chao15 - 0.3, at: off(PL.siam, 0, 0), span: 3.7e6, rot: 0, e: linear },
  { t: C.chao15 + 0.7, at: PL.core, span: 2.5e6, rot: 0, e: inOut },
  { t: C.matlab16 - 0.2, at: off(PL.core, 0, 0), span: 2.35e6, rot: 0, e: linear },
  // safe in the middle, the edges up for grabs
  { t: C.matlab16 + 0.8, at: off(PL.siam, 0, -6e5), span: 5.0e6, rot: 0, e: inOut },
  { t: C.french17 - 0.15, at: off(PL.siam, 0, -6e5), span: 4.8e6, rot: 0, e: linear },
  // the gunboats up the river to Bangkok (1893), then Laos, Cambodia's provinces and the Malay states go
  { t: C.french17 + 0.01, at: off(PL.gulf, 0, -1.2e5), span: 5.2e5, rot: -2, cut: true },
  { t: C.bangkok17 + 0.6, at: off(PL.gulf, -1e4, 4e4), span: 4.0e5, rot: 0, e: inOut },
  { t: C.laos17 - 0.35, at: off(PL.gulf, -1e4, 5e4), span: 3.8e5, rot: 0, e: linear },
  { t: C.laos17 + 0.5, at: PL.laos, span: 5.6e6, rot: 0, e: inOut },
  { t: C.cambodia17 + 0.4, at: off(PL.laos, 2e5, -6e5), span: 5.4e6, rot: 0, e: inOut },
  { t: C.malaya17 + 0.5, at: PL.south, span: 5.0e6, rot: 0, e: inOut },
  { t: CUT.king[0], at: off(PL.south, 0, 0), span: 4.8e6, rot: 0, e: linear },
  // edges given, heart kept
  { t: CUT.king[1] + 0.01, at: off(PL.siam, 0, -9e5), span: 5.4e6, rot: -1, cut: true },
  { t: C.dil19 + 0.3, at: off(PL.siam, 0, -5e5), span: 4.4e6, rot: 0, e: easeOut },
  // never a colony: the whole region, colonies grey, Siam glowing; the close
  { t: C.isiliye20 + 0.9, at: PL.wide, span: 1.1e7, rot: 0, e: inOut },
  { t: DURATION_S, at: off(PL.wide, -3e5, 0), span: 1.0e7, rot: 0, e: linear },
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
export const HITS = () => [C.britain1, C.n200_1, C.kaise1, C.siam2, C.burma4, C.vietnam5, C.cambodia5, C.jang7, C.n1896_15, C.laos17, C.malaya17, C.dil19, C.colony20];

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
  for (const [t0, a] of [[C.jang7 + 0.05, 16], [C.burma4, 7], [C.laos17, 8], [C.malaya17, 6], [C.colony20, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
