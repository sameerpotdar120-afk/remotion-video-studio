import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import raw from './geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres (the whole story fits between -170° and 55°, so no unwrapping). */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((lon * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  world: Plate; namerica: Plate; europe: Plate; carib: Plate;
  louisiana: P[][]; usa: P[][]; spain: P[][]; britainNA: P[][]; britainCarib: P[][]; haiti: P[][]; franceEU: P[][]; britainEU: P[][]; india: P[][];
  mississippi: P[]; newOrleans: P; areas_km2: Record<string, number>;
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2400, h: 3000, ox: 1200, oy: 1500 };

export const PL = {
  dc: merc(-77.0, 38.9),
  nola: merc(-90.07, 29.95),
  eastUS: merc(-84, 34.5),
  atlantic: merc(-38, 38),
  namerica: merc(-96, 38),
  europe: merc(-1.5, 49.5),
  paris: merc(2.35, 48.86),
  london: merc(-0.12, 51.5),
  carib: merc(-74, 20),
  haiti: merc(-72.6, 19.0),
  miss: merc(-91, 38.5),
  world: merc(-42, 36),
  louisC: merc(-99, 41.5),
};

/** Camera keys, all anchored to words of the voiceover. Flat map like the reference; gentle drift between beats. */
const keys = (): Key[] => [
  // सोचो… दो लोगों को… एक शहर: the US east coast with New Orleans in frame
  { t: 0, at: PL.eastUS, span: 5.6e6, rot: 0 },
  { t: C.bhejo, at: PL.eastUS, dx: 3e5, span: 5.2e6, e: linear },
  // …भेजो: the ship crosses the Atlantic
  { t: C.poora - 0.15, at: PL.atlantic, span: 1.25e7, e: inOut },
  // पूरा लुईज़ियाना: back over North America, Louisiana floods
  { t: C.louis + 0.35, at: PL.namerica, span: 9.2e6, e: inOut },
  { t: C.kaise, at: PL.namerica, dx: 2e5, span: 8.8e6, e: linear },
  // (rewind) 1802: the whole Atlantic world, then Europe
  { t: C.y1802 - 0.1, at: PL.world, span: 2.4e7, e: inOut },
  { t: C.jung + 0.3, at: PL.europe, span: 3.0e6, e: inOut },
  { t: C.brk + 0.2, at: PL.europe, dx: 1e5, span: 2.7e6, e: linear },
  // उधर उत्तर अमेरिका में
  { t: C.napoleon - 0.2, at: PL.namerica, span: 9.8e6, e: inOut },
  { t: C.samrajya + 1.2, at: PL.namerica, dx: -3e5, span: 9.0e6, e: linear },
  // चाबी… सेंट डॉमिंग: dive to the Caribbean, then Haiti (satellite)
  { t: C.ameer, at: PL.carib, span: 4.2e6, e: inOut },
  { t: C.haiti + 0.2, at: PL.haiti, span: 1.25e6, e: inOut },
  { t: C.bina + 0.3, at: PL.haiti, dx: 2e4, span: 1.12e6, e: linear },
  // (plantation insert) बगावत… कंट्रोल: back on the island
  { t: C.control - 0.4, at: PL.haiti, span: 1.3e6, e: linear },
  // फौज: the fleet sails from France to Saint-Domingue
  { t: C.napo9 + 0.4, at: PL.world, dx: 6e5, dy: -1.5e6, span: 2.2e7, e: inOut },
  { t: C.shuru9 - 0.2, at: PL.world, dx: -1.2e6, dy: -1.8e6, span: 2.0e7, e: linear },
  // (beach insert) द्वीप हमेशा के लिए हाथ से गया
  { t: C.dweep - 0.2, at: PL.haiti, span: 1.4e6, e: linear },
  { t: C.haath + 0.4, at: PL.haiti, span: 1.3e6, e: linear },
  // सेंट डॉमिंग के बिना लुईज़ियाना…
  { t: C.saint11 + 0.4, at: PL.namerica, span: 9.4e6, e: inOut },
  { t: C.matlab + 1.0, at: PL.namerica, span: 9.0e6, e: linear },
  // व्यापार… मिसिसिपी… न्यू ऑर्लियंस
  { t: C.miss + 0.2, at: PL.miss, span: 4.6e6, e: inOut },
  { t: C.neworl + 0.6, at: PL.miss, dy: -9e5, span: 4.0e6, e: linear },
  { t: C.neworl2 - 0.1, at: PL.nola, dy: 2e5, span: 1.9e6, e: inOut },
  { t: C.france12 + 1.0, at: PL.nola, dy: 2e5, span: 1.75e6, e: linear },
  // जेफरसन… डिप्लोमैट्स
  { t: C.jeff + 0.3, at: PL.eastUS, dx: 4e5, span: 5.6e6, e: inOut },
  { t: C.crore + 0.6, at: PL.eastUS, dx: 5e5, span: 5.2e6, e: linear },
  // ब्रिटेन से जंग… इतनी दूर
  { t: C.britain14 + 0.2, at: PL.world, dx: 2.0e6, span: 2.0e7, e: inOut },
  { t: C.door, at: PL.world, dx: 1.0e6, span: 2.1e7, e: linear },
  { t: C.namumkin + 0.8, at: PL.world, span: 2.25e7, e: linear },
  // (map-room insert) then back to Louisiana: SOLD, doubling, India
  { t: C.haan16 - 0.3, at: PL.namerica, span: 9.6e6, e: linear },
  { t: C.ekdin + 0.2, at: PL.namerica, span: 9.0e6, e: inOut },
  { t: C.bharat - 0.2, at: PL.louisC, dy: -6e5, span: 8.2e6, e: inOut },
  { t: DURATION_S, at: PL.louisC, dy: -6e5, span: 7.6e6, e: linear },
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
  return { x, y, span: Math.exp(ls), rot };
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
