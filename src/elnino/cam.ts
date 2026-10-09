import { Ease, easeIn, easeOut, inOut, lerp, linear } from '../darien/anim';
import raw from './geo.json';
import timing from './timing.json';

export type P = [number, number];

/** Web Mercator metres; longitudes west of -20° are unwrapped (+360): one strip from East Africa across the Pacific to the Atlantic. */
const R = 6378137;
export const merc = (lon: number, lat: number): P => {
  const l = lon < -20 ? lon + 360 : lon;
  const la = Math.max(-85, Math.min(85, lat));
  return [R * ((l * Math.PI) / 180), R * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))];
};

type Plate = { bounds: [number, number, number, number]; w: number; h: number };
export const GEO = raw as unknown as {
  world: Plate; india: Plate; peru: Plate; indo: Plate;
  sst: Plate & { days: string[]; n34: number[] };
  peru_c: P[][]; ecuador: P[][]; australia: P[][]; indonesia: P[][]; india_c: P[][]; usa: P[][]; canada: P[][];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

/** Camera: centre (Mercator m), span = metres across the 1920 px height, rot = screen roll (deg), tilt = map pitch (deg, GeoLayers-style perspective). */
export type Cam = { x: number; y: number; span: number; rot: number; tilt: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; tilt?: number; e?: Ease };

export const PLANE = { w: 2800, h: 3400, ox: 1400, oy: 1800 };

// places (lon, lat)
export const PL = {
  peru: merc(-79, -8),
  ecuadorCoast: merc(-80.5, -2),
  eastPac: merc(-112, 0),
  midPac: merc(-150, 2),
  westPac: merc(165, 2),
  indo: merc(118, -2),
  aus: merc(134, -25),
  india: merc(80, 21),
  sUS: merc(-95, 31),
  americas: merc(-95, 10),
};

const keys = (): Key[] => [
  // सोचो… AC: close on the Peru coast, pulling back as the AC blows cold air west
  { t: 0, at: PL.ecuadorCoast, dx: -5e5, span: 6.0e6, rot: -4, tilt: 18 },
  { t: C.ac + 0.3, at: PL.americas, dx: -1.4e6, dy: -6e5, span: 1.45e7, rot: 0, tilt: 12, e: inOut },
  { t: C.isi, at: PL.americas, dx: -1.8e6, dy: -6e5, span: 1.38e7, rot: 1, tilt: 11, e: linear },
  // (hook flash-forward: burning Earth insert) → नाम है सुपर एल नीनो: the real NOAA map, whole tropical Pacific
  { t: C.naam - 0.2, at: PL.eastPac, dx: -1.6e6, span: 2.35e7, rot: 0, tilt: 4, e: linear },
  { t: C.itihas, at: PL.eastPac, dx: -1.9e6, span: 2.25e7, rot: -1, tilt: 4, e: linear },
  // time-lapse: slow push in on the hot tongue
  { t: C.ac2 - 0.2, at: PL.eastPac, dx: -1.0e6, span: 1.75e7, rot: 0, tilt: 8, e: inOut },
  // ये AC हैं हवाएँ, ट्रेड विंड्स… पूरब से पश्चिम: drift west with the wind
  { t: C.paschim + 0.4, at: PL.midPac, span: 2.4e7, rot: -3, tilt: 10, e: inOut },
  { t: C.garm, at: PL.midPac, dx: -1.5e6, span: 2.3e7, rot: -3, tilt: 10, e: linear },
  // warm water pushed west → Indonesia/Australia
  { t: C.indo + 0.2, at: PL.westPac, dx: -2.0e6, dy: -1.0e6, span: 1.7e7, rot: 0, tilt: 10, e: inOut },
  { t: C.barish + 0.5, at: PL.indo, dx: 6e5, dy: -1.2e6, span: 1.15e7, rot: 3, tilt: 14, e: inOut },
  // whip east to Peru: cold water, dry coast
  { t: C.peru + 0.25, at: PL.peru, dx: -1.2e6, span: 1.05e7, rot: -3, tilt: 14, e: inOut },
  { t: C.sukha + 0.5, at: PL.peru, dx: -1.5e6, span: 9.8e6, rot: -4, tilt: 14, e: linear },
  // लेकिन: wide again, winds weaken, warm water flows back east
  { t: C.kamzor + 0.2, at: PL.midPac, dx: 1.5e6, span: 2.45e7, rot: 0, tilt: 6, e: inOut },
  { t: C.degree + 0.3, at: PL.eastPac, dx: -1.6e6, span: 2.1e7, rot: 1, tilt: 6, e: inOut },
  { t: C.bas, at: PL.eastPac, dx: -1.6e6, span: 1.95e7, rot: 1, tilt: 6, e: linear },
  // (space insert) then Peru floods → Australia drought
  { t: C.peru7 - 0.05, at: PL.peru, dx: -6e5, dy: 6e5, span: 9.5e6, rot: -2, tilt: 14, e: linear },
  { t: C.aus7 - 0.15, at: PL.peru, dx: -5e5, dy: 8e5, span: 9.0e6, rot: -3, tilt: 14, e: linear },
  { t: C.aus7 + 0.35, at: PL.aus, span: 1.15e7, rot: 2, tilt: 12, e: inOut },
  { t: C.bharat - 0.15, at: PL.aus, dx: -3e5, span: 1.1e7, rot: 3, tilt: 12, e: linear },
  // भारत में हमारा मानसून: fly to India
  { t: C.monsoon + 0.2, at: PL.india, dy: -3e5, span: 6.2e6, rot: 0, tilt: 16, e: inOut },
  { t: C.y1876 - 0.1, at: PL.india, dy: -4e5, span: 5.6e6, rot: -2, tilt: 16, e: linear },
  // (dry field, film insert) then India in 1876
  { t: C.akele - 0.1, at: merc(77.5, 17), span: 5.0e6, rot: 1, tilt: 16, e: linear },
  { t: C.mare + 0.5, at: merc(77.5, 17), dy: 2e5, span: 4.6e6, rot: 2, tilt: 16, e: linear },
  // और अब समंदर 3 डिग्री: whip back to the hottest water
  { t: C.ab + 0.45, at: PL.eastPac, dx: -4e5, span: 1.3e7, rot: -2, tilt: 14, e: inOut },
  { t: C.garmi, at: PL.eastPac, dx: -6e5, span: 1.2e7, rot: -3, tilt: 14, e: linear },
  // heat rises, the whole planet burns
  { t: C.tapayegi + 0.2, at: PL.americas, dx: -3.0e6, dy: 2.5e6, span: 3.0e7, rot: 0, tilt: 8, e: inOut },
  { t: DURATION_S, at: PL.americas, dx: -3.2e6, dy: 2.7e6, span: 2.8e7, rot: 0, tilt: 8, e: linear },
];

type Full = Cam & { t: number; e: Ease };
const FULL: Full[] = [];
for (const k of keys()) {
  const prev = FULL[FULL.length - 1];
  const at = k.at ?? [prev.x, prev.y];
  FULL.push({
    t: k.t, x: at[0] + (k.dx ?? 0), y: at[1] + (k.dy ?? 0), span: k.span ?? prev.span,
    rot: k.rot ?? prev?.rot ?? 0, tilt: k.tilt ?? prev?.tilt ?? 0, e: k.e ?? linear,
  });
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
      // for big zooms, pan in screen space so the target stays put while the scale changes
      let q = p;
      if (Math.abs(Math.log(b.span / a.span)) > 1.0) {
        q = clamp(b.span < a.span ? 1 - (span - b.span) / (a.span - b.span) : (span - a.span) / (b.span - a.span));
      }
      return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), span, rot: lerp(a.rot, b.rot, p), tilt: lerp(a.tilt, b.tilt, p) };
    }
  }
  return FULL[FULL.length - 1];
};

/**
 * The keyed path, smoothed with a short centred window, so every hand-off between an eased move and a linear
 * drift has continuous velocity (no visible "stop and go" at keys): a cheap version of AE's roving keyframes.
 */
const SMOOTH = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
const W8 = [0.06, 0.12, 0.18, 0.28, 0.18, 0.12, 0.06];
export const camAt = (t: number): Cam => {
  let x = 0, y = 0, ls = 0, rot = 0, tilt = 0;
  for (let i = 0; i < SMOOTH.length; i++) {
    const c = camRaw(Math.min(DURATION_S, Math.max(0, t + SMOOTH[i])));
    x += c.x * W8[i]; y += c.y * W8[i]; ls += Math.log(c.span) * W8[i]; rot += c.rot * W8[i]; tilt += c.tilt * W8[i];
  }
  return { x, y, span: Math.exp(ls), rot, tilt };
};

export const pxPerM = (c: Cam) => 1920 / c.span;
export const project = (c: Cam, x: number, y: number): P => {
  const k = pxPerM(c);
  return [PLANE.ox + (x - c.x) * k, PLANE.oy + (c.y - y) * k];
};

/** Screen-space motion of the map between this frame and the next: pan (px/frame) and zoom rate. Drives the motion blur. */
export const camMotion = (t: number) => {
  const a = camAt(t);
  const b = camAt(t + 1 / 30);
  const k = pxPerM(a);
  const r = (a.rot * Math.PI) / 180;
  const dx = (a.x - b.x) * k;
  const dy = (b.y - a.y) * k;
  return {
    vx: dx * Math.cos(r) - dy * Math.sin(r),
    vy: dx * Math.sin(r) + dy * Math.cos(r),
    zoom: Math.abs(Math.log(b.span / a.span)) * 30,
  };
};

/** Mercator point → final screen pixel (includes roll; tilt is approximated, fine for screen-space UI near the centre). */
export const toScreen = (c: Cam, at: P): P => {
  const [px, py] = project(c, at[0], at[1]);
  const x = px - PLANE.ox;
  const y = py - PLANE.oy;
  const r = (c.rot * Math.PI) / 180;
  const sx = x * Math.cos(r) - y * Math.sin(r);
  const sy = x * Math.sin(r) + y * Math.cos(r);
  // perspective of a plane pitched by `tilt` about the screen's horizontal centre line, viewer at PERSP px
  const th = (c.tilt * Math.PI) / 180;
  const z = sy * Math.sin(th);
  const f = PERSP / (PERSP - z);
  return [540 + sx * f, 960 + sy * Math.cos(th) * f];
};
export const PERSP = 2200;

export { easeIn, easeOut, inOut, linear };
