import { Ease, inOut, kick, lerp, linear } from '../../darien/anim';
import timing from './timing.json';
import { Cam, PATCH, merc } from '../motion/MapView';

export type P = [number, number];
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;
export { merc, PATCH };
export type { Cam };

type Key = { t: number; at: P; mpp: number; e?: Ease };
const at = (lon: number, lat: number): P => merc(lon, lat);
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

/** Frame 0 (and the loop's last frame): the Americas and the north Pacific, the island a pixelated blob in the ocean. */
export const CAM0: Cam = { x: merc(-112, 20)[0], y: merc(-112, 20)[1], mpp: 11000 };
/** The patch close, a little off-centre so labels fit above it. */
export const CP: P = add(PATCH as P, 250e3, -150e3);
const WIDE = at(-132, 38), COAST = at(-129, 41), FAR = at(-118, 34), WORLD: P = [merc(-25, 0)[0], 2.755e6];

const keys = (): Key[] => [
  // line 1: the push-in from the Americas onto the blob (it never stops), the pin, "किसी नक्शे पर नहीं"
  { t: 0, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp },
  { t: C.nakshe1, at: add(CP, 150e3, 300e3), mpp: 5200, e: inOut },
  { t: C.kyun2, at: CP, mpp: 4600, e: linear },
  // line 2: "ये पूरा island": a fast push in, the reveal
  { t: C.poora2 + 0.4, at: CP, mpp: 3600, e: inOut },
  { t: C.kehte3, at: CP, mpp: 3900, e: linear },
  // line 3: the outline and the name; pull back for California and Hawaii
  { t: C.california3 - 0.2, at: CP, mpp: 4100, e: linear },
  { t: C.california3 + 0.6, at: WIDE, mpp: 8500, e: inOut },
  { t: C.size4 - 0.1, at: WIDE, mpp: 8200, e: linear },
  // line 4: punch on the size, India lands beside the patch
  { t: C.size4 + 0.5, at: add(WIDE, -200e3, -150e3), mpp: 7200, e: inOut },
  { t: C.matlab4, at: WIDE, mpp: 8300, e: inOut },
  { t: C.akela5 - 0.1, at: WIDE, mpp: 8000, e: linear },
  // line 5: the whip out to the world (the map card takes over at "दुनिया"), then back down onto the patch
  { t: C.duniya5 + 0.1, at: WORLD, mpp: 30800, e: inOut },
  { t: C.yahan6 - 0.6, at: WORLD, mpp: 30000, e: linear },
  { t: C.yahan6 + 0.1, at: CP, mpp: 4300, e: inOut },
  // line 6: 80,000 tonnes, the callouts
  { t: C.zyada6, at: CP, mpp: 4000, e: linear },
  { t: C.machhli6 + 0.2, at: CP, mpp: 3600, e: inOut },
  { t: C.aata7 - 0.1, at: CP, mpp: 3800, e: linear },
  // line 7: out to the coast: rivers, ships, cities
  { t: C.nadiyon7 + 0.2, at: COAST, mpp: 5600, e: inOut },
  { t: C.dhoop8 - 0.3, at: add(COAST, -100e3, 0), mpp: 5300, e: linear },
  // line 8: the sun and the waves, the shatter, the dissolve, the magnifier
  { t: C.dhoop8 + 0.4, at: CP, mpp: 4200, e: inOut },
  { t: C.micro8, at: CP, mpp: 3700, e: linear },
  // line 9 (Null in the split): wider for the food chain
  { t: C.yahi9 + 0.3, at: WIDE, mpp: 7400, e: inOut },
  { t: C.chhote10 - 0.2, at: WIDE, mpp: 7000, e: linear },
  // line 10: out to the satellite's view, then down through the viewfinder
  { t: C.satellite10 + 0.2, at: FAR, mpp: 11500, e: inOut },
  { t: C.upar10 - 0.1, at: FAR, mpp: 11000, e: linear },
  { t: C.neela10, at: PATCH as P, mpp: 5200, e: inOut },
  { t: C.asal11, at: PATCH as P, mpp: 3000, e: inOut },
  // line 11 is the plastic soup (no map); line 12: the currents round the patch
  { t: C.samundar12 - 0.1, at: CP, mpp: 5600, e: linear },
  { t: C.badhta12, at: CP, mpp: 5000, e: linear },
  { t: C.jo13, at: CP, mpp: 5400, e: linear },
  // line 13 is the cross-section; line 14: the patch from above, three punches, then back to frame 0
  { t: C.mitti14 - 0.2, at: PATCH as P, mpp: 4200, e: linear },
  { t: C.isiliye14 - 0.1, at: PATCH as P, mpp: 3600, e: linear },
  { t: DURATION_S - 0.1, at: [CAM0.x, CAM0.y], mpp: CAM0.mpp, e: inOut },
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
/** Zoom punches on the big hits (the reference punches in on nearly every new element). */
export const HITS = () => [C.kyun2, C.kachre2, C.size4, C.ton6 + 0.3, C.zyada6, C.tod8, C.mitti14, C.kinara14, C.pakki14];
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
  for (const h of HITS()) if (t > h) punch += 0.06 * Math.exp(-7 * (t - h)) * Math.cos((t - h) * 9);
  const breathe = (1 + 0.02 * Math.sin(t * LOOPF(19)) + 0.008 * Math.sin(t * LOOPF(43) + 1.3)) * (1 - punch);
  const drift = mpp * 7;
  return { x: x + Math.sin(t * LOOPF(27)) * drift, y: y + Math.sin(t * LOOPF(23)) * drift, mpp: mpp * breathe };
};
export const toS = (c: Cam, p: number[]): P => [540 + (p[0] - c.x) / c.mpp, 960 - (p[1] - c.y) / c.mpp];
export const ll = (c: Cam, lon: number, lat: number) => toS(c, merc(lon, lat));
export const camMotion = (t: number) => {
  const a = camAt(t - 1 / 60), b = camAt(t);
  return { vx: (a.x - b.x) / b.mpp, vy: (b.y - a.y) / b.mpp, zoom: Math.abs(Math.log(b.mpp / a.mpp)) * 60 };
};
/** Camera jolts on the slams: the 80,000 tonnes, the ✕ on the pin, the shatter. */
export const shake = (t: number): P => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.milega1, 6], [C.ton6 + 0.3, 8], [C.tod8 + 0.5, 7]] as P[]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};
