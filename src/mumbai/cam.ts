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
export type IslandKey = 'colaba' | 'oldwoman' | 'bombay' | 'mazagaon' | 'parel' | 'worli' | 'mahim';
export const GEO = raw as unknown as {
  india: Plate; konkan: Plate; mumbai: Plate; konkan_chart: Plate; world_chart: Plate;
  city: P[][]; flats: P[][]; islands: Record<IslandKey, P[][]>; label: Record<IslandKey, P>;
  places: { mumbadevi: P; worliKoliwada: P }; vellard: P[]; coastalRoad: P[]; cityCentre: P;
  cities: { lisbon: P; london: P; mumbai: P };
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; e?: Ease };

export const PLANE = { w: 2400, h: 3000, ox: 1200, oy: 1500 };

export const PL = {
  india: merc(76.5, 20.5),
  konkan: merc(73.1, 19.1),
  city: merc(72.836, 18.962),
  colaba: merc(72.814, 18.902),
  bombay: merc(72.822, 18.945),
  mazagaon: merc(72.848, 18.977),
  parel: merc(72.857, 19.013),
  worli: merc(72.812, 19.008),
  mahim: merc(72.838, 19.030),
  oldwoman: merc(72.824, 18.913),
  kolis: merc(72.818, 18.948),
  temple: merc(72.8352, 18.9435),
  arabian: merc(72.70, 18.955),
  harbour: merc(72.80, 18.958),
  europe: merc(1, 45),
  route: merc(24, 14),
  routeEast: merc(46, 4),
  breach: merc(72.8135, 18.9805),
  westCoast: merc(72.8085, 18.982),
  koliwada: merc(72.8155, 19.0245),
};

/** Camera keys, all anchored to words of the voiceover: one continuous move, no cuts. */
const keys = (): Key[] => [
  // जिस मुंबई में आज दो करोड़ लोग: dive from India onto today's city
  { t: 0, at: PL.india, span: 4.4e6 },
  { t: 0.5, at: PL.india, dx: -1.5e5, span: 3.9e6, e: linear },
  { t: C.crore - 0.1, at: PL.konkan, span: 2.6e5, e: easeIn },
  { t: C.log + 0.55, at: PL.city, span: 3.0e4, e: easeOut },
  // दो सौ साल पहले वहाँ समंदर था
  { t: C.dosau + 0.2, at: PL.city, span: 2.9e4, e: linear },
  { t: C.mumbai3, at: PL.city, span: 2.65e4, e: inOut },
  { t: C.saat + 0.6, at: PL.city, span: 2.55e4, e: linear },
  // the seven names, island by island
  { t: C.colaba + 0.25, at: PL.colaba, span: 8.5e3, e: inOut },
  { t: C.bombay + 0.25, at: PL.bombay, span: 1.25e4, e: inOut },
  { t: C.mazgaon + 0.25, at: PL.mazagaon, span: 1.05e4, e: inOut },
  { t: C.parel + 0.25, at: PL.parel, span: 1.4e4, e: inOut },
  { t: C.worli + 0.25, at: PL.worli, span: 1.2e4, e: inOut },
  { t: C.mahim + 0.25, at: PL.mahim, span: 1.05e4, e: inOut },
  { t: C.oldw + 0.4, at: PL.oldwoman, span: 7.5e3, e: inOut },
  { t: C.island7 + 0.55, at: PL.city, span: 2.6e4, e: inOut },
  // हमारे कोली भाई, समंदर के असली मालिक
  { t: C.koli8 + 0.1, at: PL.kolis, span: 1.45e4, e: inOut },
  { t: C.malik + 0.8, at: PL.kolis, dx: 600, span: 1.32e4, e: linear },
  // मुंबा देवी → मुंबई
  { t: C.mumba + 0.1, at: PL.temple, span: 6.2e3, e: inOut },
  { t: C.mumbai10 + 0.6, at: PL.temple, span: 5.6e3, e: linear },
  // 1534: the Portuguese sail in
  { t: C.y1534 + 0.5, at: PL.arabian, span: 7.5e4, e: inOut },
  { t: C.kabja + 0.3, at: PL.harbour, span: 4.6e4, e: inOut },
  { t: C.y1661 + 0.15, at: PL.harbour, span: 4.4e4, e: linear },
  // 1661: dowry to England, the king, the Company's ship back round the Cape
  { t: C.dahej + 0.1, at: PL.europe, span: 1.15e7, e: inOut },
  { t: C.raja + 0.4, at: PL.europe, dx: 2e5, span: 1.1e7, e: linear },
  { t: C.company14 + 0.55, at: PL.route, span: 1.9e7, e: inOut },
  { t: C.diya + 0.25, at: PL.routeEast, span: 2.0e7, e: inOut },
  // ज़मीन कम थी: dive back to the islands
  { t: C.kam + 0.45, at: PL.city, span: 2.6e4, e: inOut },
  { t: C.monsoon, at: PL.city, span: 2.5e4, e: linear },
  { t: C.ghus + 0.9, at: PL.city, dx: -500, span: 2.3e4, e: linear },
  // 1782: Hornby at the Great Breach
  { t: C.y1782 + 0.55, at: PL.breach, span: 7.6e3, e: inOut },
  { t: C.thani, at: PL.breach, span: 7.1e3, e: linear },
  { t: C.ruka, at: PL.breach, span: 6.7e3, e: linear },
  { t: C.vellard + 0.2, at: PL.breach, span: 6.3e3, e: linear },
  // सातों द्वीप एक हो गए
  { t: C.saaton + 0.35, at: PL.city, span: 2.6e4, e: inOut },
  { t: C.gaye22 + 0.45, at: PL.city, span: 2.5e4, e: linear },
  // आज भी… 2024 का कोस्टल रोड
  { t: C.zameen23 + 0.1, at: PL.westCoast, span: 1.35e4, e: inOut },
  { t: C.coastal, at: PL.westCoast, span: 1.28e4, e: linear },
  { t: C.hectare + 0.7, at: PL.westCoast, dy: 400, span: 1.36e4, e: linear },
  // पर सबसे ज़्यादा किसने खोया? वही कोली भाई
  { t: C.kisne + 0.35, at: PL.koliwada, span: 5.6e3, e: inOut },
  { t: C.koli27 + 0.9, at: PL.koliwada, span: 5.1e3, e: linear },
  // जिनकी देवी के नाम पर शहर बना: pull out to the whole city
  { t: DURATION_S, at: PL.city, dy: -800, span: 2.75e4, e: inOut },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of keys()) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({ t: k.t, x: at[0] + (k.dx ?? 0), y: at[1] + (k.dy ?? 0), span: k.span ?? prev.span, rot: 0, e: k.e ?? linear });
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
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: 0 };
    }
  }
  return FULL[FULL.length - 1];
};

/** Keyed path smoothed with a short centred window: continuous velocity through every key. */
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += c.x * W8[i]; y += c.y * W8[i]; ls += Math.log(c.span) * W8[i];
  }
  return { x, y, span: Math.exp(ls), rot: 0 };
};

export const pxPerM = (c: Cam) => 1920 / c.span;
export const project = (c: Cam, x: number, y: number): P => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  return [540 + px - PLANE.ox, 960 + py - PLANE.oy];
};
export const camMotion = (t: number) => {
  const a = camAt(t);
  const b = camAt(t + 1 / 30);
  const k = pxPerM(a);
  return { vx: (a.x - b.x) * k, vy: (b.y - a.y) * k, zoom: Math.abs(Math.log(b.span / a.span)) * 30 };
};

export { easeIn, easeOut, inOut, linear };
