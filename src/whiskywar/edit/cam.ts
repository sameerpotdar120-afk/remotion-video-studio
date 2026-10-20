import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from '../../timezones/anim';
import raw from '../geo.json';
import timing from './timing.json';
import type { Look } from './Map';

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
  canada: Rings; greenland: Rings; denmark: Rings; canada_nares: Rings; greenland_nares: Rings; strait: P[][];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };

/** The scenes, in order; each runs [t0, t1). Map scenes carry their look. */
export type Scene = { k: string; t0: number; t1: number; look?: Look };
export const SCENES = (): Scene[] => {
  const s: [string, number, Look | undefined][] = [
    ['map1', 0, 'sat'],
    ['paper', C.canada2 - 0.45, undefined],
    ['dive', C.ladai2 + 0.25, 'sat'],
    ['atlas', C.door3 - 0.3, 'atlas'],
    ['parch', C.greenland4 - 0.15, 'parch'],
    ['strait', C.samundar5 - 0.3, 'sat'],
    ['y1984', C.n1984_6 - 0.2, 'sat'],
    ['beach1', C.sainik6 - 0.3, undefined],
    ['heli', C.usi7 - 0.1, 'sat'],
    ['beach2', C.jhanda7 - 0.6, undefined],
    ['war', C.ab8 - 0.1, 'atlas'],
    ['beach3', C.nahi9 - 0.05, undefined],
    ['montage', C.silsila10 - 0.1, undefined],
    ['island', C.n2022_10 - 0.2, undefined],
    ['border', C.yun11 - 0.15, 'sat'],
  ];
  return s.map(([k, t0, look], i) => ({ k, t0, t1: i + 1 < s.length ? s[i + 1][1] : DURATION_S + 1, look }));
};
export const sceneAt = (t: number): Scene => {
  const S = SCENES();
  for (const s of S) if (t >= s.t0 && t < s.t1) return s;
  return S[S.length - 1];
};
export const SC = (k: string) => SCENES().find((s) => s.k === k)!;

/** Null's moments: the war fake-out (B) and the close (A). `from` is the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.ab8 + 0.1, t1: C.nahi9 - 0.15, from: 0.3 },
  { name: 'A', t0: C.tumhare12 - 0.2, t1: DURATION_S, from: 0.2 },
];

const ll = merc;
export const PL = {
  atlantic: ll(-45, 62), canada: ll(-98, 60), denmark: ll(10, 56), greenland: ll(-42, 72), hans: ll(-66.459, 80.826), nares: ll(-66.5, 80.4),
  between: ll(-40, 66), ottawaCph: ll(-35, 55),
};
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Map camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover. */
const keys = (): Key[] => [
  // line 1: the North Atlantic, Canada fills, Denmark fills, the WAR? badge between
  { t: 0, at: off(PL.canada, 1.5e6, -1.5e6), span: 2.0e7, rot: -1 },
  { t: C.n49_1 + 0.6, at: off(PL.between, -1.0e6, -1.8e6), span: 2.6e7, rot: 0, e: inOut },
  { t: C.botal1 + 0.5, at: off(PL.between, 0, -1.8e6), span: 2.7e7, rot: 0, e: inOut },
  { t: SC('paper').t0, at: PL.denmark, span: 9e6, rot: 0, e: easeIn },
  // after the burn: the dive onto the Nares Strait and Hans Island
  { t: SC('dive').t0 + 0.001, at: off(PL.greenland, -1.5e6, 2e6), span: 1.4e7, rot: 0, cut: true },
  { t: C.patthar2 - 0.2, at: PL.nares, span: 1.6e6, rot: 0, e: easeIn },
  { t: C.hans2 - 0.2, at: PL.hans, span: 6.0e4, rot: 0, e: inOut },
  { t: SC('atlas').t0, at: off(PL.hans, 0, -2e3), span: 5.0e4, rot: 0, e: linear },
  // line 3 on the atlas: Canada and Denmark far apart
  { t: SC('atlas').t0 + 0.001, at: off(PL.between, -1.5e6, -2.4e6), span: 2.9e7, rot: 0, cut: true },
  { t: SC('parch').t0, at: off(PL.between, -1.5e6, -2.2e6), span: 2.7e7, rot: 0, e: linear },
  // line 4 on parchment: 1953, Greenland, then down onto the strait
  { t: SC('parch').t0 + 0.001, at: off(PL.greenland, -6e5, -2e6), span: 1.6e7, rot: 0, cut: true },
  { t: C.hissa4 + 0.4, at: off(PL.greenland, -3e5, -6e5), span: 1.2e7, rot: 0, e: inOut },
  { t: C.sarhad4 - 0.1, at: off(PL.nares, 0, -1e5), span: 2.6e6, rot: -14, e: inOut },
  { t: SC('strait').t0, at: PL.nares, span: 2.2e6, rot: -14, e: linear },
  // line 5: the satellite strait, then the island and the two 18 km arrows
  { t: SC('strait').t0 + 0.001, at: PL.nares, span: 1.8e6, rot: -14, cut: true },
  { t: C.hans5 - 0.1, at: PL.hans, span: 1.6e5, rot: -14, e: inOut },
  { t: SC('y1984').t0, at: PL.hans, span: 1.3e5, rot: -14, e: linear },
  // 1984 over Greenland
  { t: SC('y1984').t0 + 0.001, at: off(PL.greenland, 0, 0), span: 1.1e7, rot: 0, cut: true },
  { t: SC('beach1').t0, at: off(PL.greenland, 0, -3e5), span: 1.0e7, rot: 0, e: linear },
  // the minister's route
  { t: SC('heli').t0 + 0.001, at: off(PL.greenland, -4e5, 6e5), span: 1.0e7, rot: 0, cut: true },
  { t: SC('beach2').t0, at: off(PL.greenland, -8e5, 1.3e6), span: 6.5e6, rot: 0, e: inOut },
  // war plan on the atlas
  { t: SC('war').t0 + 0.001, at: off(PL.between, -6e5, 2e5), span: 1.15e7, rot: 0, cut: true },
  { t: SC('beach3').t0, at: off(PL.between, -6e5, 2e5), span: 1.05e7, rot: 0, e: linear },
  // the new border: a pull-out from the island
  { t: SC('border').t0 + 0.001, at: PL.hans, span: 2.0e4, rot: -14, cut: true },
  { t: C.sarhad11 + 0.6, at: PL.hans, span: 1.2e5, rot: -14, e: easeOut },
  { t: DURATION_S, at: PL.hans, span: 1.6e5, rot: -14, e: linear },
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
export const HITS = () => [C.n49_1, C.whisky2, C.hans2, C.n1953_4, C.n18_5, C.n1984_6, C.jang8, C.n2022_10, C.sarhad11];

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
  for (const [t0, a] of [[C.jang1, 8], [C.whisky2, 6], [C.jang8, 12], [C.nahi9, 10], [C.n2022_10, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
