import { Ease, easeIn, easeOut, inOut, kick, lerp, linear } from '../../timezones/anim';
import raw from '../geo.json';

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
  plates: Record<string, Plate>; countries: Record<string, Rings>; territories: Record<string, Rings>; india: Rings; hull: Rings; centroids: Record<string, P>;
};

/** The look test runs on estimated cue times (the creator's VO will replace them): about 2.6 words a second. */
export const C = {
  kyun2: 6.45, caribbean3: 9.4, cuba3: 11.9, jamaica3: 12.6, haiti3: 13.3, dr3: 14.0, bahamas3: 15.0, barbados3: 15.7, trinidad3: 16.4,
  n13_3: 17.9, britain3: 19.9, france3: 20.6, neth3: 21.2, america3: 22.0, twist4: 22.8, cricket4: 24.2, xcuba4: 25.6, xhaiti4: 26.1, xdr4: 26.6, xbah4: 27.6,
};
export const DURATION_S = 29.5;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at: P; span: number; rot?: number; e?: Ease; cut?: boolean };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const ll = merc;
export const CAM0: Cam = { x: merc(-45, 14)[0], y: merc(-45, 14)[1], span: 3.0e7, rot: 0 };

const keys = (): Key[] => [
  // line 1: the dark world, the title card; a slow drift west while the magnifier searches
  { t: 0, at: [CAM0.x, CAM0.y], span: CAM0.span },
  { t: C.kyun2 - 0.35, at: ll(-58, 16), span: 2.6e7, e: linear },
  // line 2 → 3: the whip down onto the Caribbean, the outline draws round the islands
  { t: C.kyun2 + 0.55, at: ll(-72.5, 18.2), span: 4.6e6, e: inOut },
  { t: C.cuba3 - 0.4, at: ll(-71.5, 18.0), span: 4.2e6, e: linear },
  // the island tour: a quick eased whip to each island, then a slow push while its fill and name land
  { t: C.cuba3 + 0.05, at: ll(-79.2, 21.7), span: 1.55e6, e: inOut }, { t: C.jamaica3 - 0.3, at: ll(-79.0, 21.6), span: 1.45e6, e: linear },
  { t: C.jamaica3 + 0.05, at: ll(-77.35, 18.15), span: 5.2e5, e: inOut }, { t: C.haiti3 - 0.3, at: ll(-77.3, 18.15), span: 4.9e5, e: linear },
  { t: C.haiti3 + 0.05, at: ll(-72.6, 19.0), span: 6.8e5, e: inOut }, { t: C.dr3 - 0.3, at: ll(-72.4, 19.0), span: 6.5e5, e: linear },
  { t: C.dr3 + 0.05, at: ll(-70.6, 18.8), span: 7.2e5, e: inOut }, { t: C.bahamas3 - 0.3, at: ll(-70.5, 18.8), span: 6.9e5, e: linear },
  { t: C.bahamas3 + 0.05, at: ll(-76.6, 24.6), span: 1.45e6, e: inOut }, { t: C.barbados3 - 0.3, at: ll(-76.5, 24.5), span: 1.38e6, e: linear },
  { t: C.barbados3 + 0.05, at: ll(-59.55, 13.17), span: 2.6e5, e: inOut }, { t: C.trinidad3 - 0.3, at: ll(-59.55, 13.17), span: 2.45e5, e: linear },
  { t: C.trinidad3 + 0.05, at: ll(-61.2, 10.75), span: 4.4e5, e: inOut }, { t: C.n13_3 - 0.45, at: ll(-61.2, 10.75), span: 4.2e5, e: linear },
  // all thirteen, then the islands that still belong to Britain, France, the Netherlands and the US
  { t: C.n13_3 + 0.15, at: ll(-70.5, 18.0), span: 4.7e6, e: inOut },
  { t: C.twist4 - 0.3, at: ll(-69.5, 17.6), span: 4.4e6, e: linear },
  // line 4: the twist, onto Cuba, Hispaniola and the Bahamas for the crosses
  { t: C.twist4 + 0.6, at: ll(-75.0, 21.2), span: 2.7e6, e: inOut },
  { t: DURATION_S, at: ll(-74.6, 21.0), span: 2.45e6, e: linear },
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
export const HITS = () => [C.kyun2 + 0.55, C.n13_3 + 0.15, C.xcuba4, C.xhaiti4, C.xdr4, C.xbah4];

const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
const LOOPF = (k: number) => (2 * Math.PI * k) / 100;
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
  for (const [t0, a] of [[C.xcuba4, 7], [C.xhaiti4, 7], [C.xdr4, 7], [C.xbah4, 7]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export { easeIn, easeOut, inOut, linear };
