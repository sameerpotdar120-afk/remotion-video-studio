import React from 'react';
import { staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, pop, ramp, window4 } from './anim';
import { C, Cam, DURATION_S, GEO, P, merc, project } from './cam';

export const COL = { gold: '#FFD84A', amber: '#FFB347', red: '#FF4D5E', green: '#3DDC84', teal: '#2EC4B6', river: '#38D6FF', white: '#FFF6E6', sand: '#E3B05A' };

const ringD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');
const lineD = (c: Cam, pts: P[]) => pts.map((pt, i) => {
  const [x, y] = project(c, pt[0], pt[1]);
  return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
}).join('');

/** A region lit the After Effects way: graded fill, a wide bloom, a hot edge that draws on, and a light sweep. */
const Glow: React.FC<{ c: Cam; rings: P[][]; a: number; color: string; t: number; fill?: number }> = ({ c, rings, a, color, t, fill = 0.2 }) => {
  if (a <= 0.001 || !rings.length) return null;
  const d = ringD(c, rings);
  const pulse = 0.8 + 0.2 * Math.sin(t * 4.2);
  const draw = Math.min(1, a * 1.15);
  return (
    <g opacity={Math.min(1, a * 1.6)}>
      <path d={d} fill={color} fillOpacity={fill * a * pulse} />
      <path d={d} fill="none" stroke={color} strokeWidth={30} strokeOpacity={0.22 * pulse} strokeLinejoin="round" style={{ filter: 'blur(12px)' }} pathLength={1} strokeDasharray={`${draw} 1`} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.9} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray="0.05 0.95" strokeDashoffset={-((t * 0.22) % 1)}
        style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px #fff)` }} />
    </g>
  );
};

/** The Hooghly, graded: deep teal water from the plate's own water mask, a soft bloom, and a gold sun-glint that travels
 *  downstream. Drawn in plane coordinates over the city plate, so it sits exactly on the real riverbank. */
const CITY = GEO.plates.city.bounds;
const River: React.FC<{ c: Cam; t: number; a: number; warm: number }> = ({ c, t, a, warm }) => {
  if (a <= 0.001) return null;
  const [x0, y0] = project(c, CITY[0], CITY[3]);
  const [x1, y1] = project(c, CITY[2], CITY[1]);
  const w = x1 - x0, h = y1 - y0;
  const mask = `url(${staticFile('kolkata/maps/city_water.png')})`;
  const glint = ((t * 0.07) % 1.4) - 0.2;
  const base = warm > 0.5 ? 'rgba(20,110,120,0.85)' : 'rgba(10,95,120,0.85)';
  const common: React.CSSProperties = { position: 'absolute', left: x0, top: y0, width: w, height: h, WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      {/* bloom: the water's own shape, blurred and lit (kept low so it rolls off instead of clipping) */}
      <div style={{ ...common, background: COL.river, opacity: 0.14, filter: 'blur(22px)' }} />
      {/* the graded water: deepen it first, then a teal-to-jade soft-light pass with a lighter mid-channel */}
      <div style={{ ...common, background: 'rgba(4,52,64,0.55)', mixBlendMode: 'multiply' }} />
      <div style={{ ...common, mixBlendMode: 'soft-light', background: `linear-gradient(${160 + 10 * Math.sin(t * 0.4)}deg, ${base}, rgba(70,200,180,0.95) 45%, ${base})` }} />
      <div style={{ ...common, opacity: 0.35, mixBlendMode: 'screen', background: `repeating-linear-gradient(${115 + 5 * Math.sin(t * 0.3)}deg, rgba(255,255,255,0) 0 22px, rgba(170,240,230,0.18) 26px, rgba(255,255,255,0) 32px)`,
        backgroundPosition: `${(t * 18) % 64}px ${(t * 30) % 64}px` }} />
      {/* gold sun-glint travelling downstream (north-east to south-west across the plate) */}
      <div style={{ ...common, mixBlendMode: 'screen', background: `radial-gradient(ellipse 22% 14% at ${lerp(55, 5, glint) * 1}% ${lerp(5, 70, glint)}%, rgba(255,214,120,0.95), rgba(255,180,60,0.35) 45%, rgba(255,180,60,0) 75%)` }} />
    </div>
  );
};

/** A village spot: a warm glow with an expanding ring (it can fade, crack away, or merge into the others). */
const Village: React.FC<{ c: Cam; at: P; a: number; t: number; color: string; r?: number }> = ({ c, at, a, t, color, r = 260 }) => {
  if (a <= 0.001) return null;
  const [x, y] = project(c, at[0], at[1]);
  const R = r;
  const ring = (t * 0.8) % 1;
  return (
    <g opacity={a}>
      <circle cx={x} cy={y} r={R * 1.25} fill={color} opacity={0.18} style={{ filter: 'blur(26px)' }} />
      <circle cx={x} cy={y} r={R * 0.55} fill={color} opacity={0.32} style={{ filter: 'blur(10px)' }} />
      <circle cx={x} cy={y} r={R * (0.5 + 0.7 * ring)} fill="none" stroke="#fff" strokeWidth={5} opacity={(1 - ring) * 0.8} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <circle cx={x} cy={y} r={16} fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
    </g>
  );
};

/** A star fort outline (code-drawn), centred on the Fort William site, about 1 km across. */
const FORT_PTS: P[] = (() => {
  const c = GEO.places.fort, out: P[] = [];
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? 380 : 620;
    out.push([c[0] + Math.cos(ang) * rr, c[1] + Math.sin(ang) * rr]);
  }
  return out;
})();

/** The Company's border round all three villages (a rounded box, in metres). */
const BORDER: P[] = (() => {
  const s = GEO.places.sutanuti, g = GEO.places.gobindapur;
  const w0 = Math.min(s[0], g[0]) - 1300, e0 = Math.max(s[0], g[0]) + 1300, n0 = s[1] + 1500, s0 = g[1] - 1500;
  return [[w0, n0], [e0, n0], [e0, s0], [w0, s0], [w0, n0]];
})();

export const PlaneLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const pl = GEO.places;
  // the river is graded all video long (stronger on the Hooghly beat and the golden ending)
  const riverA = 0.75 + 0.25 * window4(t, C.hooghly5 - 0.4, C.hooghly5, C.y1698, C.y1698 + 0.4) + 0.25 * ramp(t, C.matlab9, C.hamesha9 + 0.5);
  const warm = ramp(t, C.matlab9, C.hamesha9 + 0.5);
  // India and West Bengal on the two pull-outs
  const indiaA = window4(t, C.raj1 - 0.6, C.raj1 + 0.1, C.pehla2 - 0.6, C.pehla2) + window4(t, C.raj7 - 0.6, C.raj7 + 0.1, C.kitab8, C.kitab8 + 0.4);
  const wbA = indiaA;
  // the villages: all three on "तीन गाँव", then each on its own name, then all three again for 1698
  const all3 = window4(t, C.teen1 - 0.2, C.teen1 + 0.3, C.raj1 - 0.6, C.raj1) + window4(t, C.y1698 - 0.4, C.y1698 + 0.2, C.fort6 - 0.2, C.fort6 + 0.3);
  const suA = Math.max(all3, window4(t, C.sutanuti2 - 0.3, C.sutanuti2 + 0.1, C.doosra3 - 0.2, C.doosra3 + 0.3));
  const goA0 = Math.max(all3, window4(t, C.gobind3 - 0.3, C.gobind3 + 0.1, C.teesra4 - 0.2, C.teesra4 + 0.3), window4(t, C.fort6 - 0.3, C.fort6, C.gobind6 + 0.2, C.khali6 + 0.6));
  const goA = goA0 * (1 - ramp(t, C.khali6 - 0.1, C.khali6 + 0.6, easeIn) * window4(t, C.khali6 - 0.2, C.khali6, C.yahin7, C.yahin7 + 0.1));
  const kaA = Math.max(all3, window4(t, C.kalikata4 - 0.3, C.kalikata4 + 0.1, C.hooghly5 - 0.2, C.hooghly5 + 0.3));
  // one city: the three glows slide together and become one big gold glow
  const merge = ramp(t, C.yahin7 + 0.2, C.shehar7 + 0.4, inOut);
  const mergeA = window4(t, C.yahin7 - 0.2, C.yahin7 + 0.2, C.raj7 - 0.4, C.raj7 + 0.2);
  const centre = merc(88.352, 22.578);
  const mv = (p: P): P => [lerp(p[0], centre[0], merge), lerp(p[1], centre[1], merge)];
  // the villages glow again on "बहुत पहले से रहते थे"
  const againA = window4(t, C.pehle8 - 0.2, C.pehle8 + 0.3, C.matlab9 + 0.4, C.hamesha9);
  // fort ghost on "Maidan और Fort William", then the fort drawn for real
  const fortGhost = window4(t, C.maidan3, C.fort3 + 0.2, C.teesra4 - 0.4, C.teesra4);
  const fortDraw = ramp(t, C.fort6 + 0.2, C.gobind6 + 0.4, inOut);
  const fortA = window4(t, C.fort6, C.fort6 + 0.2, C.yahin7 - 0.2, C.yahin7 + 0.3);
  const borderA = window4(t, C.company5 - 0.2, C.company5 + 0.2, C.fort6 - 0.3, C.fort6);
  const borderDraw = ramp(t, C.company5, C.haq5 + 0.3, inOut);
  return (
    <>
      <River c={c} t={t} a={clamp01(riverA)} warm={warm} />
      <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <Glow c={c} rings={GEO.india} a={clamp01(indiaA)} color={COL.gold} t={t} fill={0.1} />
        <Glow c={c} rings={GEO.westbengal} a={clamp01(wbA)} color={COL.amber} t={t} fill={0.28} />
        {borderA > 0 && (
          <path d={lineD(c, BORDER)} fill={COL.gold} fillOpacity={0.06 * borderA} stroke={COL.gold} strokeWidth={8} strokeDasharray="34 18" opacity={borderA}
            style={{ filter: `drop-shadow(0 0 10px ${COL.gold})`, clipPath: `inset(0 ${(1 - borderDraw) * 100}% 0 0)` }} />
        )}
        {(fortGhost > 0 || fortA > 0) && (
          <g opacity={Math.max(fortGhost * 0.6, fortA)}>
            <path d={lineD(c, [...FORT_PTS, FORT_PTS[0]])} fill={COL.red} fillOpacity={0.12 * fortA} stroke="#fff" strokeWidth={fortA > 0 ? 7 : 4}
              pathLength={1} strokeDasharray={fortA > 0 ? `${fortDraw} 1` : '0.02 0.015'} style={{ filter: `drop-shadow(0 0 12px ${COL.red})` }} />
          </g>
        )}
        <Village c={c} at={mv(pl.sutanuti)} a={clamp01(Math.max(suA, mergeA, againA))} t={t} color={COL.amber} />
        <Village c={c} at={mv(pl.kalikata)} a={clamp01(Math.max(kaA, mergeA, againA))} t={t + 0.3} color={COL.gold} />
        <Village c={c} at={mv(pl.gobindapur)} a={clamp01(Math.max(goA, mergeA, againA))} t={t + 0.6} color={COL.teal} />
        {merge > 0.6 && mergeA > 0 && <Village c={c} at={centre} a={clamp01((merge - 0.6) * 2.5) * mergeA} t={t} color={COL.gold} r={520} />}
      </svg>
    </>
  );
};

export { easeOut, linear, pop, DURATION_S };
