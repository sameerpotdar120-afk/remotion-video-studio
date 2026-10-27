import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as { plates: Record<string, Plate>; countries: Record<string, P[][]>; islands: Record<string, P[][]> };
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

export const MAD = merc(-16.96, 32.75), ARCH = merc(-16.72, 32.8), FUNCHAL = merc(-16.91, 32.65), AIRPORT = merc(-16.776, 32.694), LISBON = merc(-9.14, 38.72);
/** Frame 0 (and the loop's last frame): the North Atlantic, Portugal top right, Madeira low in the middle. */
export const CAM0: Cam = { x: merc(-13.5, 35.6)[0], y: merc(-13.5, 35.6)[1], mpp: 1250 };
const EUROPE = merc(-3, 42), BRAZIL_V = merc(-30, 8), PORT_V = merc(-12.5, 36.2);
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

const keys = (): Key[] => [
  // line 1: frame 0, then the dive onto the archipelago; the neon strobe and "7 साल"
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.island1 - 0.3, at: add([CAM0.x, CAM0.y], -60000, -40000), mpp: 1150, e: linear },
  { t: C.island1 + 0.6, at: ARCH, mpp: 150, e: inOut },
  { t: C.kyun2 - 0.4, at: ARCH, mpp: 135, e: linear },
  // line 2: out to Portugal, the caravel sails to Madeira (the camera rides with it), the forest grows
  { t: C.kyun2 + 0.4, at: PORT_V, mpp: 1100, e: inOut },
  { t: C.sailors2 + 0.6, at: add(PORT_V, -200000, -150000), mpp: 900, e: linear },
  { t: C.kali2 - 0.6, at: ARCH, mpp: 160, e: inOut },
  { t: C.jungle2, at: MAD, mpp: 80, e: inOut },
  { t: C.naam2 - 0.2, at: MAD, mpp: 72, e: linear },
  // the name, the wall of trees, the fuse and the fire (slow pushes)
  { t: C.lakdi2 + 0.5, at: add(MAD, 0, 4000), mpp: 70, e: linear },
  { t: C.aag3 - 1.6, at: add(MAD, 0, -2000), mpp: 64, e: inOut },
  { t: C.kahani4, at: add(MAD, 0, -3000), mpp: 60, e: linear },
  // line 4: the settlers in the sea (south of the island), the legend: 7 years
  { t: C.samundar4 - 0.4, at: add(MAD, 3000, -14000), mpp: 62, e: inOut },
  { t: C.legend4 - 0.2, at: add(MAD, 4000, -15000), mpp: 58, e: linear },
  { t: C.legend4 + 0.4, at: MAD, mpp: 74, e: inOut },
  // line 5: the ash, the cane, then out to Europe for the sugar trade
  { t: C.europe5 - 0.6, at: MAD, mpp: 68, e: linear },
  { t: C.europe5 + 0.3, at: EUROPE, mpp: 2300, e: inOut },
  { t: C.duniya6 + 0.6, at: add(EUROPE, -300000, 0), mpp: 2200, e: linear },
  // line 6: the trade moves to Brazil, then back to Madeira as the cane sinks (Null in the split)
  { t: C.ganna6 - 0.2, at: BRAZIL_V, mpp: 4200, e: inOut },
  { t: C.dhandha6 - 0.1, at: add(BRAZIL_V, -200000, 0), mpp: 4000, e: linear },
  { t: C.dhandha6 + 0.7, at: add(MAD, 0, -8000), mpp: 74, e: inOut },
  // line 7: the levadas: water lines, cards, 2,000 km
  { t: C.haar7, at: add(MAD, 0, -6000), mpp: 70, e: linear },
  { t: C.levadas7, at: add(MAD, 0, -2000), mpp: 64, e: inOut },
  { t: C.angoor8 - 0.3, at: MAD, mpp: 60, e: linear },
  // line 8–9: wine, today's paradise (the outline draws round in light)
  { t: C.jala9, at: MAD, mpp: 76, e: inOut },
  { t: C.n1985_10 - 0.3, at: add(MAD, 1500, 0), mpp: 70, e: linear },
  // line 10: Funchal, the boy, Ronaldo, the airport (Null in the split)
  { t: C.funchal10 - 0.4, at: add(FUNCHAL, 0, 9000), mpp: 40, e: inOut },
  { t: C.airport10 - 0.3, at: add(FUNCHAL, 2000, 10000), mpp: 37, e: linear },
  { t: C.airport10 + 0.3, at: add(AIRPORT, -6000, 4000), mpp: 34, e: inOut },
  { t: C.socho11 + 0.2, at: add(AIRPORT, -7000, 4000), mpp: 32, e: linear },
  // line 11: the island named "wood"; then the pull back to frame 0 for the loop
  { t: C.lakdi11, at: MAD, mpp: 78, e: inOut },
  { t: C.chehra11 - 0.6, at: add(MAD, 0, 2000), mpp: 72, e: linear },
  { t: DURATION_S - 0.12, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp, e: inOut },
];
const FULL = keys().map((k) => ({ t: k.t, x: k.at[0], y: k.at[1], mpp: k.mpp, e: k.e ?? linear }));
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const camRaw = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      const mpp = Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), p));
      let q = p;
      if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp };
    }
  }
  return FULL[FULL.length - 1];
};
/** Zoom punches on the big hits. */
export const HITS = () => [C.island1 + 0.6, C.madeira2, C.aag3, C.saat4, C.europe5 + 0.3, C.brazil6, C.levadas7, C.n2000_7, C.ronaldo10, C.airport10];
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
/** Whole cycles over the duration, so the loop's last frame matches frame 0. */
export const LOOPF = (k: number) => (2 * Math.PI * k) / DURATION_S;
const wrap = (t: number) => Math.min(DURATION_S, Math.max(0, t));
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, lm = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const k = camRaw(wrap(t + SMOOTH[i]));
    x += k.x * W8[i]; y += k.y * W8[i]; lm += Math.log(k.mpp) * W8[i];
  }
  const mpp = Math.exp(lm);
  let punch = 0;
  for (const h of HITS()) if (t > h) punch += 0.05 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.022 * Math.sin(t * LOOPF(19)) + 0.008 * Math.sin(t * LOOPF(43) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(27)) * drift, y: y + Math.sin(t * LOOPF(23)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: number[]): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ll = (c: Cam, lon: number, lat: number) => toS(c, merc(lon, lat));
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.aag3, 6], [C.saat4, 7], [C.doob6, 6]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
