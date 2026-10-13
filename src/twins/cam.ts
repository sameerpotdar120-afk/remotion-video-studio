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
export type Country = { rings: P[][]; main: P[][]; centre: P; bbox: [number, number, number, number] };
export const GEO = raw as unknown as { plates: Record<string, Plate>; c: Record<string, Country>; sicily: P };

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const c = GEO.c;
const mid = (a: P, b: P, f = 0.5): P => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];

/** Where the flipped Thailand lands: just west of Myanmar, level with it, standing like a twin. */
export const THAI_TWIN: P = [c.myanmar.bbox[0] - 0.52e6, 2.15e6];
export const PL = {
  italy: c.italy.centre, vietnam: c.vietnam.centre, world: [2.0e6, 2.6e6] as P,
  seasia: [10.55e6, 1.95e6] as P, bt: mid(c.benin.centre, c.togo.centre), togoCoast: [0.11e6, 0.72e6] as P,
  between: [6.6e6, 3.9e6] as P, atlantic: [-2.1e6, 2.4e6] as P,
};
// frame 0: Italy with a copy of Vietnam beside it, a little east of Italy's centre
export const HOOK_AT: P = [PL.italy[0] + 0.55e6, PL.italy[1] - 0.1e6];

/** Camera keys (Mercator metres; span = screen height in metres), anchored to words of the voiceover.
 *  Every move goes the way the map really lies: east is right, north is up. */
const keys = (): Key[] => [
  // frame 0: already moving, a quick push in on the two boots
  { t: 0, at: [HOOK_AT[0] + 0.25e6, HOOK_AT[1] + 0.15e6], span: 3.6e6, rot: -5 },
  { t: C.maps1 - 0.1, at: HOOK_AT, span: 2.5e6, rot: 1, e: easeOut },
  // "हज़ार Maps": pull out to the whole world
  { t: C.maps1 + 1.2, at: PL.world, span: 2.5e7, rot: 2, e: inOut },
  // "Notice… दुनिया में कुछ देश": sweep the world west to east, the continents lighting up as they pass
  { t: C.notice1 + 0.5, at: [-7.0e6, 1.6e6], span: 2.6e7, rot: -1, e: inOut },
  { t: C.duniya2 + 0.5, at: [2.5e6, 2.8e6], span: 2.45e7, rot: 1, e: inOut },
  { t: C.judwa2 - 0.2, at: [9.5e6, 2.2e6], span: 2.6e7, rot: -1, e: inOut },
  // "जुड़वा": pull out wide so the four twin arcs read
  { t: C.judwa2 + 0.35, at: [1.5e6, 2.4e6], span: 3.3e7, rot: 0, e: inOut },
  // 1: Thailand and Myanmar
  { t: C.thai3 - 0.1, at: PL.seasia, span: 4.6e6, rot: 0, e: inOut },
  { t: C.palat4, at: [PL.seasia[0] + 0.15e6, PL.seasia[1]], span: 4.2e6, rot: 1, e: linear },
  { t: C.samne4 + 0.5, at: [PL.seasia[0] - 0.45e6, PL.seasia[1] + 0.1e6], span: 4.4e6, rot: -1, e: inOut },
  { t: C.saanche4 + 0.6, at: [PL.seasia[0] - 0.5e6, PL.seasia[1] + 0.1e6], span: 4.0e6, rot: 0, e: linear },
  // 2: west to Africa, Benin and Togo
  { t: C.africa5 + 0.2, at: [PL.bt[0] + 0.3e6, PL.bt[1] + 0.2e6], span: 3.2e6, rot: 2, e: inOut },
  { t: C.togo5 + 0.3, at: [PL.bt[0], PL.bt[1] + 0.05e6], span: 1.15e6, rot: 0, e: inOut },
  { t: C.lambe6, at: [PL.bt[0], PL.bt[1] + 0.05e6], span: 1.05e6, rot: -1, e: linear },
  { t: C.patle6 + 0.6, at: [PL.bt[0], PL.bt[1] + 0.08e6], span: 1.1e6, rot: 1, e: linear },
  // "Togo का समंदर किनारा": dive to the coast
  { t: C.togo6 + 0.3, at: PL.togoCoast, span: 3.4e5, rot: 0, e: inOut },
  { t: C.teesra7 - 0.2, at: PL.togoCoast, span: 3.0e5, rot: -1, e: linear },
  // 3: north to Italy
  { t: C.famous7 + 0.3, at: PL.italy, span: 2.3e6, rot: 1, e: inOut },
  { t: C.hazaron8, at: PL.italy, span: 2.0e6, rot: 0, e: linear },
  // "हज़ारों KM दूर": the long whip east to Vietnam
  { t: C.hazaron8 + 0.9, at: PL.between, span: 8.5e6, rot: 2, e: inOut },
  { t: C.vietnam8 + 0.2, at: PL.vietnam, span: 2.5e6, rot: 0, e: inOut },
  { t: C.farak8 - 0.2, at: PL.vietnam, span: 2.25e6, rot: -1, e: linear },
  // Vietnam flies west to stand beside Italy, and the camera rides along with it (pulled out on the way, so the trip reads)
  { t: (C.farak8 + C.italy8) / 2, at: PL.between, span: 6.5e6, rot: 0, e: inOut },
  { t: C.italy8 + 0.1, at: [PL.italy[0] + 0.55e6, PL.italy[1] - 0.1e6], span: 3.1e6, rot: 1, e: inOut },
  { t: C.football8 + 0.3, at: [PL.italy[0] + 0.12e6, PL.italy[1] - 0.45e6], span: 1.55e6, rot: 0, e: inOut },
  { t: C.laat8 + 1.2, at: [PL.italy[0] - 0.05e6, PL.italy[1] - 0.6e6], span: 1.9e6, rot: -1, e: inOut },
  // 4: pull out over the Atlantic: Norway at the top, Chile at the bottom
  { t: C.norway10, at: PL.atlantic, span: 2.75e7, rot: 0, e: inOut },
  { t: C.aaina11, at: [PL.atlantic[0], PL.atlantic[1] - 0.3e6], span: 2.62e7, rot: 0, e: linear },
  { t: DURATION_S, at: [PL.atlantic[0], PL.atlantic[1] - 0.5e6], span: 2.5e7, rot: 0, e: linear },
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
export const HITS = () => [C.maps1 + 1.1, C.judwa2, C.pehla3, C.palat4 + 0.4, C.doosra5, C.kandhe6, C.n56, C.teesra7, C.boot8, C.laat8, C.asli9, C.aaina11];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += k.x * W8[i]; y += k.y * W8[i]; ls += Math.log(k.span) * W8[i]; rot += k.rot * W8[i];
  }
  // the camera never rests: it breathes, tilts, drifts hand-held and punches in on every hit
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
  for (const [t0, a] of [[C.pehla3, 8], [C.palat4 + 0.45, 7], [C.doosra5, 8], [C.kandhe6 + 0.3, 6], [C.n56, 7], [C.teesra7, 8], [C.boot8, 9], [C.laat8, 12], [C.asli9, 10], [C.aaina11, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
