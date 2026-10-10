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
  spain: P[][]; france: P[][]; portugal: P[][]; andorra: P[][]; uk: P[][]; gibraltar: P[][]; morocco: P[][]; africa: P[][]; europe: P[][];
  llivia: P[][]; ceuta: P[][]; melilla: P[][]; penon: P[][]; pheasant: P[][];
  b_france: P[][]; b_portugal: P[][]; b_andorra: P[][]; b_llivia: P[][]; b_gibraltar: P[][]; b_ceuta: P[][]; b_melilla: P[][]; b_penon: P[][];
  places: Record<string, P>; llivia_gap: P[];
};

const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
export const C = T.cues;
export const CAPS = T.caps;
export const DURATION_S = T.duration;

export type Cam = { x: number; y: number; span: number; rot: number };
type Key = { t: number; at?: P; dx?: number; dy?: number; span?: number; rot?: number; e?: Ease };

export const PLANE = { w: 2600, h: 3200, ox: 1300, oy: 1600 };
const PLc = GEO.places;
export const PL = {
  europe: merc(4, 46),
  iberia: merc(-3.6, 40.0),
  iberiaWide: merc(-3.2, 38.6),
  pyrenees: merc(0.6, 42.6),
  cerdanya: merc(1.80, 42.50),
  llivia: PLc.llivia,
  bidasoaMid: merc(-0.5, 43.0),
  pheasant: PLc.pheasant,
  andorra: merc(1.56, 42.54),
  ukWide: merc(-3.5, 45.0),
  gib: merc(-5.35, 36.14),
  strait: merc(-5.45, 36.0),
  africa: merc(-3.0, 33.5),
  alboran: merc(-4.12, 35.45),
  penon: PLc.penon,
};

/** Camera keys, all anchored to words of the voiceover. Every move rolls a few degrees (the reference's 3D sway). */
const keys = (): Key[] => [
  // तुमने पढ़ा है… दो पड़ोसी… क्विज़ तुम हार गए: Europe → Spain
  { t: 0, at: PL.europe, span: 7.5e6, rot: 4 },
  { t: C.spain1 + 0.6, at: PL.iberia, span: 2.3e6, rot: -2, e: inOut },
  { t: C.haar + 0.6, at: PL.iberia, span: 2.1e6, rot: -3, e: linear },
  // पाँच हैं… नक्शे ने छुपा लिए: pull back to see all five
  { t: C.paanch + 0.2, at: PL.iberiaWide, span: 3.1e6, rot: 2, e: inOut },
  { t: C.chupa + 0.6, at: PL.iberiaWide, span: 2.95e6, rot: 1, e: linear },
  // स्पेन का बॉर्डर खुद इतना अजीब: along the Pyrenees
  { t: C.border3 + 0.2, at: PL.pyrenees, span: 8.5e5, rot: -6, e: inOut },
  { t: C.yakeen + 0.8, at: PL.pyrenees, dx: 6e4, span: 7.8e5, rot: -3, e: linear },
  // फ्रांस के अंदर… लिविया
  { t: C.dedh + 0.2, at: PL.cerdanya, span: 1.1e5, rot: 3, e: inOut },
  { t: C.llivia + 0.2, at: PL.llivia, span: 4.2e4, rot: 1, e: inOut },
  { t: C.y1659 - 0.2, at: PL.llivia, span: 3.8e4, rot: -1, e: linear },
  { t: C.bacha + 0.6, at: PL.llivia, span: 3.4e4, rot: -2, e: linear },
  // थोड़ा पश्चिम चलो… फेज़ेंट आइलैंड
  { t: C.nadi - 0.1, at: PL.bidasoaMid, span: 7.0e5, rot: 5, e: inOut },
  { t: C.pheasant + 0.1, at: PL.pheasant, span: 5.5e3, rot: -3, e: inOut },
  { t: C.waqt + 0.6, at: PL.pheasant, span: 4.8e3, rot: -1, e: linear },
  // तीसरा पड़ोसी… अंडोरा… दो प्रिंस
  { t: C.andorra - 0.2, at: PL.andorra, span: 1.35e5, rot: 4, e: inOut },
  { t: C.bishop + 0.3, at: PL.andorra, span: 1.2e5, rot: 1, e: linear },
  // चौथा पड़ोसी… ब्रिटेन… जिब्राल्टर… 1713
  { t: C.britain + 0.1, at: PL.ukWide, span: 4.8e6, rot: -4, e: inOut },
  { t: C.dakshin + 0.2, at: PL.ukWide, dy: -3e5, span: 4.5e6, rot: -2, e: linear },
  { t: C.gib + 0.3, at: PL.gib, span: 2.6e4, rot: 3, e: inOut },
  { t: C.y1713 + 1.4, at: PL.gib, span: 2.3e4, rot: 1, e: linear },
  // भूमध्य सागर का दरवाज़ा
  { t: C.darwaza - 0.2, at: PL.strait, span: 2.6e5, rot: -3, e: inOut },
  { t: C.khulta + 0.9, at: PL.strait, span: 2.4e5, rot: -1, e: linear },
  // पाँचवाँ पड़ोसी अफ्रीका में… मोरक्को… यूरोप का अकेला देश
  { t: C.africa10 + 0.2, at: PL.africa, span: 3.3e6, rot: 4, e: inOut },
  { t: C.africa10b + 0.4, at: PL.africa, span: 3.1e6, rot: 2, e: linear },
  // सेउटा और मेलिया
  { t: C.ceuta - 0.2, at: PL.alboran, span: 6.6e5, rot: -2, e: inOut },
  { t: C.melilla + 0.7, at: PL.alboran, span: 6.3e5, rot: -1, e: linear },
  // एक चट्टान जो कभी टापू थी… 85 मीटर
  { t: C.tapu11 + 0.1, at: PL.penon, dy: 2600, span: 2.3e4, rot: 3, e: inOut },
  { t: C.m85 + 1.0, at: PL.penon, dy: 2300, span: 2.0e4, rot: 1, e: linear },
  // कितने पड़ोसी तुम्हें पता थे?
  { t: C.paanch12 + 0.2, at: PL.iberiaWide, span: 3.3e6, rot: -2, e: inOut },
  { t: DURATION_S, at: PL.iberiaWide, span: 3.05e6, rot: 0, e: linear },
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
