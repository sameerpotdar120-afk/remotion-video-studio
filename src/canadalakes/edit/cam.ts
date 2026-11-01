import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import raw from '../geo.json';
import timing from './timing.json';

export type P = [number, number];
const R = 6378137;
/** Web Mercator metres. */
export const merc = (lon: number, lat: number): P => [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  plates: Record<string, Plate>; countries: Record<string, P[][]>; provinces: Record<string, P[][]>; lakes: Record<string, P[][]>;
  points: Record<string, P>; dots: P[];
};
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** The camera: the screen centre in Mercator metres and metres per screen pixel. */
export type Cam = { x: number; y: number; mpp: number };
type Key = { t: number; at: P; mpp: number; e?: Ease };

const PT = GEO.points;
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
const PEK = PT['Pekwachnamaykoskwaskwaypinwanik Lake'];
/** Frame 0 (and the loop's last frame): the lake-dotted Shield round the long-name lake, close. */
export const CAM0: Cam = { x: PEK[0], y: PEK[1] - 3000, mpp: 19 };
/** All of Canada, a little high in the frame so the captions sit on the US. */
const CANADA: P = merc(-97, 55.5);
const CAN_MPP = 10500;
const BCAREA: P = add(PT['Another Lake'], 160, 0);
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const keys = (): Key[] => [
  // line 1: the Shield close-up, then the whip out to the whole country (fill, dots, count), "Another Lake?"
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.bees1 + 0.45, at: add(PEK, 0, -2200), mpp: 16, e: linear },
  { t: C.bees1 + 1.25, at: CANADA, mpp: CAN_MPP, e: inOut },
  { t: C.another1 - 0.2, at: add(CANADA, 0, -150000), mpp: 9600, e: linear },
  { t: C.end1, at: add(CANADA, 120000, -250000), mpp: 9300, e: linear },
  // line 2: (the map room covers 7.4–10.2) the country again with the count, then the dive into the "???" storm
  { t: C.sach2 + 1.3, at: CANADA, mpp: CAN_MPP, e: inOut },
  { t: C.har2 - 0.3, at: add(CANADA, -100000, -100000), mpp: 9800, e: linear },
  { t: C.har2 + 0.5, at: add(PEK, 0, -3000), mpp: 30, e: inOut },
  { t: C.shuru3 - 0.2, at: add(PEK, 0, -3000), mpp: 26, e: linear },
  // line 3: back out (the storm collapses), then the whip to Lake Athabasca
  { t: C.shuru3 + 0.7, at: CANADA, mpp: CAN_MPP, e: inOut },
  { t: C.athabasca3 - 0.35, at: add(CANADA, 150000, 0), mpp: 9600, e: linear },
  { t: C.athabasca3 + 0.3, at: add(PT['Lake Athabasca'], 110000, -60000), mpp: 520, e: inOut },
  { t: C.end3 + 0.3, at: add(PT['Lake Athabasca'], 110000, -60000), mpp: 460, e: linear },
  // line 4 (the Lake Louise cards cover this): back out to the country
  { t: C.kuch4 + 0.8, at: CANADA, mpp: CAN_MPP, e: inOut },
  { t: C.end5, at: add(CANADA, 0, -200000), mpp: 9400, e: linear },
  // line 6: the Shield's forest and lakes, drifting, the crowd
  { t: C.jheelen6 + 0.15, at: add(PEK, 6000, 3000), mpp: 18, e: inOut },
  { t: C.end6, at: add(PEK, 2000, 2000), mpp: 16, e: linear },
  // line 7: whip to British Columbia, dive to the two lakes, pan from one to the other
  { t: C.bc7 + 0.5, at: PT['British Columbia'], mpp: 2400, e: inOut },
  { t: C.bc7 + 1.3, at: PT['British Columbia'], mpp: 2200, e: linear },
  { t: C.another7 - 0.1, at: add(BCAREA, -150, -300), mpp: 2.1, e: inOut },
  { t: C.kuch7, at: add(BCAREA, -100, -350), mpp: 1.95, e: linear },
  { t: C.andanother7 - 0.1, at: add(mid(PT['Another Lake'], PT['And Another Lake']), 0, -350), mpp: 1.8, e: inOut },
  { t: C.end7, at: add(mid(PT['Another Lake'], PT['And Another Lake']), 0, -350), mpp: 1.7, e: linear },
  // line 8: Manitoba → Stupid Lake; out east to Nova Scotia (1953) → Big Ass Lake
  { t: C.manitoba8 + 0.55, at: PT.Manitoba, mpp: 2600, e: inOut },
  { t: C.stupid8 - 0.3, at: add(PT['Stupid Lake'], 0, -3500), mpp: 7, e: inOut },
  { t: C.nova8 - 0.2, at: add(PT['Stupid Lake'], 0, -3500), mpp: 6.4, e: linear },
  { t: C.nova8 + 0.45, at: add(PT['Nova Scotia'], 0, -120000), mpp: 900, e: inOut },
  { t: C.official8 - 0.3, at: add(PT['Nova Scotia'], 0, -120000), mpp: 820, e: linear },
  { t: C.bigass8 - 0.25, at: add(PT['Big Ass Lake'], 0, 120), mpp: 1.3, e: inOut },
  { t: C.par9, at: add(PT['Big Ass Lake'], 0, 120), mpp: 1.2, e: linear },
  // line 9: out to the country (all the pins), then into the long-name lake
  { t: C.par9 + 0.6, at: CANADA, mpp: CAN_MPP, e: inOut },
  { t: C.name9 - 0.6, at: add(CANADA, 0, -150000), mpp: 9600, e: linear },
  { t: C.name9 + 0.1, at: add(PEK, 0, -2400), mpp: 17, e: inOut },
  { t: C.end10, at: add(PEK, 0, -2600), mpp: 13.5, e: linear },
  // line 11: ease back to the frame-0 view for the loop
  { t: DURATION_S, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp, e: inOut },
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
export const HITS = () => [C.bees1 + 1.25, C.bees2, C.athabasca3 + 0.3, C.another7, C.andanother7, C.stupid8 - 0.3, C.bigass8, C.name9 + 0.1];
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
export const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.another1, 7], [C.bigass8, 9], [C.stupid8, 5]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
