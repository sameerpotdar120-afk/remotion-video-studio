import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as { plates: Record<string, Plate>; countries: Record<string, P[][]>; centroids: Record<string, P> };
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

const GL = GEO.centroids.Greenland, IS = GEO.centroids.Iceland, NO = GEO.centroids.Norway;
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
/** Frame 0 (and the loop's last frame): Greenland whole, Iceland at the lower right. */
export const CAM0: Cam = { x: GL[0] + 400000, y: GL[1] - 900000, mpp: 6200 };
const WHOLE_GL: P = add(GL, 0, -300000);
const BOTH: P = [(GL[0] + IS[0]) / 2, (GL[1] + IS[1]) / 2];
const SEA: P = [(IS[0] + NO[0]) / 2, 9700000];

const keys = (): Key[] => [
  // line 1: the title card over the whole of Greenland, a slow push while the ice spreads
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.n80_1 - 0.1, at: add(WHOLE_GL, 150000, -200000), mpp: 6200, e: inOut },
  { t: C.hari2 - 0.5, at: WHOLE_GL, mpp: 5600, e: linear },
  // line 2: the whip to Iceland, a slow push in while the cards land
  { t: C.hari2 + 0.15, at: add(IS, 0, -60000), mpp: 1500, e: inOut },
  { t: C.ulta3 - 0.45, at: add(IS, 0, -60000), mpp: 1330, e: linear },
  // line 3: out to both islands for the swap, drift
  { t: C.ulta3 + 0.1, at: BOTH, mpp: 6000, e: inOut },
  { t: C.sadi4 - 0.4, at: add(BOTH, 150000, 0), mpp: 5800, e: linear },
  // line 4: the paper map, Norway to Iceland, following the voyage west
  { t: C.sadi4 + 0.1, at: add(SEA, 300000, 0), mpp: 4300, e: inOut },
  { t: C.samundar4, at: add(SEA, 600000, -100000), mpp: 4000, e: linear },
  { t: C.aise4, at: add(SEA, -500000, 0), mpp: 3900, e: inOut },
  { t: C.pahuncha4 + 0.3, at: add(IS, 0, -40000), mpp: 1700, e: inOut },
  // line 5: the first winter on Iceland (paper), then the spyglass (its own picture)
  { t: C.neeche5 - 0.2, at: add(IS, 0, -40000), mpp: 1500, e: linear },
  { t: C.ice5 + 0.4, at: add(IS, 0, -40000), mpp: 1450, e: linear },
  // line 6: back to the satellite on Iceland, Erik, the exile
  { t: C.ab6 + 0.1, at: add(BOTH, 0, 200000), mpp: 5900, e: inOut },
  { t: C.sau6 - 0.2, at: add(BOTH, 0, 200000), mpp: 5700, e: linear },
  { t: C.erik6 - 0.1, at: add(IS, 0, -50000), mpp: 1500, e: inOut },
  { t: C.paschim7 - 0.4, at: add(IS, 0, -50000), mpp: 1380, e: linear },
  // line 7: west to Greenland, the biggest island, almost all ice
  { t: C.paschim7 + 0.8, at: add(BOTH, -100000, 0), mpp: 6000, e: inOut },
  { t: C.duniya7, at: add(BOTH, -400000, 200000), mpp: 5800, e: linear },
  { t: C.bada7, at: WHOLE_GL, mpp: 6000, e: inOut },
  { t: C.socho8 - 0.2, at: add(WHOLE_GL, 0, 100000), mpp: 5600, e: linear },
  // line 8: Erik names it (Null in the split), the green spreads, the people come
  { t: C.green8 + 0.1, at: WHOLE_GL, mpp: 5900, e: inOut },
  { t: C.chaal9 - 0.2, at: add(WHOLE_GL, 0, -150000), mpp: 5500, e: linear },
  // line 9: the fleet from Iceland to Greenland's south-west coast
  { t: C.chaal9 + 0.4, at: add(BOTH, -200000, -300000), mpp: 5200, e: inOut },
  { t: C.matlab10 - 0.2, at: add(BOTH, -300000, -350000), mpp: 4900, e: linear },
  // line 10: the clickbait stamp, then back to the frame-0 view for the loop
  { t: C.matlab10 + 0.4, at: WHOLE_GL, mpp: 6000, e: inOut },
  { t: C.duniya10, at: add(WHOLE_GL, 100000, -300000), mpp: 6000, e: linear },
  { t: DURATION_S - 0.2, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp, e: inOut },
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
      // on big zooms the position follows the zoom (log-span), so the target stays put on screen
      let q = p;
      if (Math.abs(Math.log(b.mpp / a.mpp)) > 1.0) q = clamp(b.mpp < a.mpp ? 1 - (mpp - b.mpp) / (a.mpp - b.mpp) : (mpp - a.mpp) / (b.mpp - a.mpp));
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), mpp };
    }
  }
  return FULL[FULL.length - 1];
};

/** Zoom punches on the big hits. */
export const HITS = () => [C.green1 + 0.15, C.ice2 + 0.3, C.ulta3 + 0.1, C.sadi4 + 0.1, C.pahuncha4 + 0.3, C.nikal6, C.bada7, C.green8 + 0.1, C.click10];
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
  const breathe = (1 + 0.022 * Math.sin(t * LOOPF(13)) + 0.008 * Math.sin(t * LOOPF(31) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(19)) * drift, y: y + Math.sin(t * LOOPF(16)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: P): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ll = (c: Cam, lon: number, lat: number) => toS(c, merc(lon, lat));
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.nikal6 + 0.05, 8], [C.click10 + 0.05, 10], [C.ulta3, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
export { GL, IS, NO };
