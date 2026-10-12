import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
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
  plates: Record<string, Plate>;
  india: P[][]; bangladesh: P[][]; india_fine: P[][]; border: P[][];
  dots_bd: [number, number, number][]; dots_in: [number, number, number][]; walk: P[];
  places: Record<string, P>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
export const DAHALA = merc(88.76246, 26.15005);
export const PL = {
  india: merc(84.5, 23.2),
  bengal: merc(89.4, 25.2),
  belt: merc(89.15, 26.18),
  cooch: merc(89.2, 26.25),
  dahala: DAHALA,
  wideBorder: merc(88.95, 26.2),
};
export const WALKC: P = [(GEO.walk[0][0] + GEO.walk[3][0]) / 2, (GEO.walk[0][1] + GEO.walk[3][1]) / 2];

/** Camera keys, all anchored to words of the voiceover; every move rolls a few degrees. */
const keys = (): Key[] => [
  // क्या आप जानते हैं… 111 गाँव Bangladesh के अंदर: India lit, then a fast dive onto the border belt
  { t: 0, at: PL.india, span: 5.2e6, rot: -2 },
  { t: C.bharat1, at: PL.india, span: 4.6e6, rot: 0, e: linear },
  { t: C.n111 + 0.25, at: PL.bengal, span: 1.25e6, rot: 2, e: inOut },
  { t: C.bd1 + 0.3, at: PL.belt, span: 3.2e5, rot: 0, e: inOut },
  // …एक रात… सोए… जागे: hold on the belt at night
  { t: C.kyon2, at: PL.belt, span: 2.7e5, rot: -1, e: linear },
  // Cooch Behar: the border as a line, then 162 pieces
  { t: C.cooch3 + 0.2, at: PL.cooch, span: 2.2e5, rot: 1, e: inOut },
  { t: C.n162, at: PL.belt, span: 2.9e5, rot: -1, e: inOut },
  { t: C.anokha4, at: PL.belt, span: 2.7e5, rot: 0, e: linear },
  // Dahala Khagrabari: dive straight down to one field
  { t: C.dahala4 + 0.6, at: PL.dahala, span: 9e3, rot: 2, e: inOut },
  { t: C.khet5 + 0.2, at: PL.dahala, span: 1.5e3, rot: 0, e: inOut },
  { t: C.bharat5 + 0.4, at: PL.dahala, span: 1.3e3, rot: -1, e: linear },
  // …चारों तरफ Bangladesh → that piece inside India → inside all of Bangladesh: pull back ring by ring
  { t: C.charon5 + 0.3, at: PL.dahala, span: 3.4e3, rot: 1, e: inOut },
  { t: C.bdi6 + 0.2, at: PL.dahala, span: 3.8e3, rot: 0, e: linear },
  { t: C.bharat6 + 0.3, at: PL.dahala, span: 7.5e3, rot: -1, e: inOut },
  { t: C.poore6 + 0.5, at: PL.dahala, span: 3.2e4, rot: 1, e: inOut },
  // यानी… चक्रव्यूह: back in to the rings
  { t: C.yaani7 + 0.3, at: PL.dahala, span: 8.5e3, rot: 0, e: inOut },
  { t: C.chakra7 + 0.4, at: PL.dahala, span: 6.5e3, rot: 3, e: linear },
  // the chess legend: the old kingdoms, wide
  { t: C.kehte8 + 0.4, at: PL.wideBorder, span: 4.6e5, rot: -2, e: inOut },
  { t: C.daanv8 + 0.6, at: PL.wideBorder, span: 4.2e5, rot: 0, e: linear },
  // 1947: the border is drawn, the pieces are trapped
  { t: C.y1947 + 0.3, at: PL.belt, span: 3.3e5, rot: 1, e: inOut },
  { t: C.phans9 + 0.6, at: PL.belt, span: 2.6e5, rot: 0, e: linear },
  // 68 years: slow push in on the belt (props carry the story)
  { t: C.sochiye10 + 0.3, at: PL.cooch, span: 2.2e5, rot: -1, e: inOut },
  { t: C.bd11 + 0.4, at: PL.cooch, span: 1.9e5, rot: 1, e: linear },
  // the walk to a doctor: down to the border near Dahala
  { t: C.bukhar12, at: WALKC, span: 6.2e4, rot: 0, e: inOut },
  { t: C.jaan12 + 0.8, at: WALKC, span: 5.4e4, rot: -1, e: linear },
  // 31 July 2015, midnight: the whole belt swaps
  { t: C.n31 + 0.3, at: PL.belt, span: 3.0e5, rot: 1, e: inOut },
  { t: C.nakshe13 + 0.8, at: PL.belt, span: 2.6e5, rot: -1, e: linear },
  // the choice → about 1,000 chose India: out to the Tricolour
  { t: C.sawal14, at: PL.belt, span: 2.4e5, rot: 0, e: linear },
  { t: C.n1000 + 0.3, at: PL.belt, span: 3.0e5, rot: 1, e: inOut },
  { t: C.tirange16 + 0.4, at: PL.india, span: 4.4e6, rot: -2, e: inOut },
  { t: C.chhod16 + 0.6, at: PL.india, span: 4.1e6, rot: 0, e: linear },
  // the question
  { t: C.sach17 + 0.3, at: PL.bengal, span: 1.5e6, rot: 1, e: inOut },
  { t: DURATION_S, at: PL.bengal, span: 1.3e6, rot: 0, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of keys()) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({ t: k.t, x: at[0] + (k.dx ?? 0), y: at[1] + (k.dy ?? 0), span: k.span ?? prev.span, rot: k.rot ?? prev?.rot ?? 0, e: k.e ?? linear });
}
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
      // big zooms pan in screen space, so the target doesn't race across the frame
      if (Math.abs(Math.log(b.span / a.span)) > 1.0) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p) };
    }
  }
  return FULL[FULL.length - 1];
};

/** Keyed path smoothed with a short centred window: continuous velocity through every key. */
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += c.x * W8[i]; y += c.y * W8[i]; ls += Math.log(c.span) * W8[i]; rot += c.rot * W8[i];
  }
  // a slow breathing sway on top, so even the holds feel hand-held in 3D
  return { x, y, span: Math.exp(ls), rot: rot + Math.sin(t * 0.55) * 0.8 };
};

export const pxPerM = (c: Cam) => 1920 / c.span;
export const project = (c: Cam, x: number, y: number): P => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  const x = px - PLANE.ox;
  const y = py - PLANE.oy;
  const r = (c.rot * Math.PI) / 180;
  return [540 + x * Math.cos(r) - y * Math.sin(r), 960 + x * Math.sin(r) + y * Math.cos(r)];
};
export const camMotion = (t: number) => {
  const a = camAt(t);
  const b = camAt(t + 1 / 30);
  const k = pxPerM(a);
  return { vx: (a.x - b.x) * k, vy: (b.y - a.y) * k, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export { easeIn, easeOut, inOut, linear };
