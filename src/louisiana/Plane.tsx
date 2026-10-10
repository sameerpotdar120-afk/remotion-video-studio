import React from 'react';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, P, PLANE, merc, project } from './cam';

export const COL = {
  britain: '#C9353D', france: '#2F4FA6', louisiana: '#3A62C9', usa: '#2BA3A3', spain: '#E0862E', haiti: '#3BAA4A', india: '#F2B233',
};
export const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";
export const FELL = "'IMFell', 'IM Fell English', serif";

const pathD = (c: Cam, rings: P[][], tf?: (p: P) => P) =>
  rings.map((r) => r.map((pt, i) => {
    const q = tf ? tf(pt) : pt;
    const [px, py] = project(c, q[0], q[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');

const centroid = (rings: P[][]): P => {
  let sx = 0, sy = 0, n = 0;
  for (const r of rings) for (const [x, y] of r) { sx += x; sy += y; n++; }
  return [sx / n, sy / n];
};

/**
 * A colour block on the antique map: flat fill with a darker inner edge and an ink outline, revealed by a circle
 * growing from `from` (a map point), with a brief bright flash on the leading edge as it spreads.
 */
const Block: React.FC<{ id: string; c: Cam; rings: P[][]; color: string; a: number; reveal?: number; from?: P; fill?: number; tf?: (p: P) => P; glow?: number; rim?: string }> = ({
  id, c, rings, color, a, reveal = 1, from, fill = 0.86, tf, glow = 0, rim,
}) => {
  if (a <= 0.001 || reveal <= 0.001) return null;
  const d = pathD(c, rings, tf);
  const o = project(c, ...(from ?? centroid(rings)));
  const rad = reveal >= 1 ? 99999 : 40 + reveal * 2600;
  const edge = reveal < 1 ? Math.sin(reveal * Math.PI) : 0;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a,
      filter: glow > 0 ? `drop-shadow(0 0 ${8 * glow}px ${color}) drop-shadow(0 0 ${20 * glow}px ${color})` : undefined }}>
      <defs>
        <clipPath id={`${id}r`}><circle cx={o[0]} cy={o[1]} r={rad} /></clipPath>
        <clipPath id={`${id}s`}><path d={d} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}r)`}>
        <path d={d} fill={color} fillOpacity={fill} />
        {/* inner shade along the border, like a hand-coloured map */}
        <g clipPath={`url(#${id}s)`}><path d={d} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={18} style={{ filter: 'blur(6px)' }} /></g>
        <path d={d} fill="none" stroke={rim ?? '#2a1d12'} strokeOpacity={rim ? 1 : 0.85} strokeWidth={rim ? 5 : 2.4} strokeLinejoin="round" />
      </g>
      {edge > 0.01 && <circle cx={o[0]} cy={o[1]} r={rad} fill="none" stroke="#fff" strokeOpacity={0.55 * edge} strokeWidth={10} clipPath={`url(#${id}s)`} style={{ filter: 'blur(4px)' }} />}
    </svg>
  );
};

/** Map label in the antique serif, with a pale halo; letter-spaced, fades and rises in. */
const MapLabel: React.FC<{ c: Cam; at: P; text: string; t: number; t0: number; t1: number; size: number; color?: string; rot?: number }> = ({ c, at, text, t, t0, t1, size, color = '#2a1d12', rot = 0 }) => {
  const a = window4(t, t0, t0 + 0.3, t1 - 0.3, t1);
  if (a <= 0) return null;
  const [x, y] = project(c, at[0], at[1]);
  const k = Math.max(0.55, Math.min(1.6, c.span > 0 ? 9.5e6 / c.span : 1));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) translateY(${(1 - ramp(t, t0, t0 + 0.4, easeOut)) * 14}px)`, opacity: a * 0.92,
      fontFamily: SERIF, fontWeight: 700, fontSize: size * k, color, whiteSpace: 'nowrap', letterSpacing: 2,
      textShadow: '0 0 6px rgba(246,232,200,0.9), 0 0 2px rgba(246,232,200,0.9)' }}>{text}</div>
  );
};

/** Glowing river drawn on from its source (north) down to the sea, with a light pulse travelling downstream. */
const River: React.FC<{ c: Cam; p: number; a: number; t: number }> = ({ c, p, a, t }) => {
  if (a <= 0.001 || p <= 0) return null;
  const pts = [...GEO.mississippi].reverse(); // north → south
  const d = pts.map(([x, y], i) => {
    const [px, py] = project(c, x, y);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('');
  const flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill="none" stroke="#7FE3FF" strokeWidth={22} strokeOpacity={0.35 * flick} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: 'blur(10px)' }} />
      <path d={d} fill="none" stroke="#BFF3FF" strokeWidth={7} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #7FE3FF)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
      {p >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={10} pathLength={1} strokeDasharray="0.06 1" strokeDashoffset={-((t * 0.35) % 1.06) + 0.06} strokeLinecap="round" style={{ filter: 'blur(3px)' }} />}
    </svg>
  );
};

/** Dashed sea route arcing between two places, drawn on with p (a solid mask reveals the dashes). */
const Route: React.FC<{ c: Cam; a: P; b: P; p: number; alpha: number; bulge?: number; color?: string; id: string }> = ({ c, a, b, p, alpha, bulge = 0.18, color = '#3b2a1a', id }) => {
  if (alpha <= 0.001 || p <= 0) return null;
  const A = project(c, ...merc(...a));
  const B = project(c, ...merc(...b));
  const mx = (A[0] + B[0]) / 2;
  const my = (A[1] + B[1]) / 2 - Math.hypot(B[0] - A[0], B[1] - A[1]) * bulge;
  const d = `M${A[0]},${A[1]} Q${mx},${my} ${B[0]},${B[1]}`;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: alpha }}>
      <defs>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={14} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
        </mask>
      </defs>
      <path d={d} fill="none" stroke="#f6e8c8" strokeWidth={9} strokeDasharray="16 12" strokeLinecap="round" mask={`url(#${id}m)`} opacity={0.6} />
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="16 12" strokeLinecap="round" mask={`url(#${id}m)`} />
    </svg>
  );
};

/** India's outline moved onto Louisiana at true scale (Mercator scale corrected for latitude). */
const indiaTf = (shift: number): ((p: P) => P) => {
  const ci = centroid(GEO.india);
  const cl = centroid(GEO.louisiana);
  const latOf = (y: number) => (2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2);
  const s = Math.cos(latOf(ci[1])) / Math.cos(latOf(cl[1]));
  return ([x, y]: P) => [cl[0] + (x - ci[0]) * s + shift, cl[1] + (y - ci[1]) * s];
};

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  // ---- which blocks are on, by beat
  const hookUSA = window4(t, 0.2, 0.7, C.kaise + 0.3, C.kaise + 0.9);
  const hookLou = ramp(t, C.louis - 0.1, C.louis + 1.0, easeOut);
  const hookLouA = window4(t, C.louis - 0.1, C.louis, C.kaise + 0.3, C.kaise + 0.9);
  const eu = (t0: number) => window4(t, t0, t0 + 0.2, C.udhar + 0.3, C.udhar + 0.9);
  const euLate = window4(t, C.napo9, C.napo9 + 0.4, C.dweep - 0.4, C.dweep) + window4(t, C.britain14 - 0.2, C.britain14 + 0.3, C.chaunk, C.chaunk + 0.3);
  const naOn = window4(t, C.udhar + 0.1, C.udhar + 0.4, C.chaabi + 0.6, C.chaabi + 1.2) + window4(t, C.saint11, C.saint11 + 0.4, C.chaunk + 0.1, C.chaunk + 0.5)
    + window4(t, C.haan16 - 0.5, C.haan16 - 0.2, 998, 999);
  const naRev = (t0: number) => (t < C.udhar + 2.5 ? ramp(t, t0, t0 + 1.0, easeOut) : 1);
  const louColour = ramp(t, C.ekdin, C.ekdin + 1.2, inOut); // French blue → American teal
  const louGrey = window4(t, C.matlab - 0.2, C.matlab + 0.3, C.vyapar, C.vyapar + 0.6);
  const haitiBlue = window4(t, C.ameer - 0.2, C.ameer + 0.3, C.control, C.control + 0.6) + window4(t, C.napo9, C.napo9 + 0.4, C.dweep - 0.2, C.dweep + 0.4) * 0.9;
  const onSat = t > C.saint - 0.3 && t < C.haan;
  const haitiShake = t > C.control - 0.2 && t < C.control + 0.6 ? Math.sin(t * 60) * 0.3 : 0;
  const haitiGreen = ramp(t, C.dweep, C.haath, easeOut) * (1 - ramp(t, C.vyapar, C.vyapar + 0.5));
  const fleetP = ramp(t, C.napo9 + 0.3, C.shuru9 - 0.3, inOut);
  const fleetA = window4(t, C.napo9 + 0.2, C.napo9 + 0.5, C.shuru9 + 0.2, C.shuru9 + 0.6);
  const arrowP = ramp(t, C.door - 0.3, C.namumkin, easeOut);
  const arrowA = window4(t, C.door - 0.3, C.door, C.chaunk - 0.1, C.chaunk + 0.2);
  const riverP = ramp(t, C.miss - 0.2, C.neworl + 0.4, inOut);
  const riverA = window4(t, C.miss - 0.3, C.miss, C.jeff - 0.2, C.jeff + 0.3);
  const indiaP = ramp(t, C.bharat - 0.25, C.bharat + 0.6, easeOut);
  const indiaA = window4(t, C.bharat - 0.25, C.bharat + 0.05, 998, 999);

  const louColor = louColour > 0.5 ? COL.usa : COL.louisiana;
  return (
    <>
      {/* hook */}
      <Block id="hu" c={c} rings={GEO.usa} color={COL.usa} a={hookUSA} />
      <Block id="hl" c={c} rings={GEO.louisiana} color={COL.louisiana} a={hookLouA} reveal={hookLou} from={GEO.newOrleans} glow={0.6 * (1 - hookLou)} />

      {/* 1802 Europe */}
      <Block id="eb" c={c} rings={GEO.britainEU} color={COL.britain} a={eu(C.britain - 0.1) + euLate} reveal={t < C.udhar ? ramp(t, C.britain - 0.1, C.britain + 0.8) : 1} />
      <Block id="ef" c={c} rings={GEO.franceEU} color={COL.france} a={eu(C.france - 0.1) + euLate} reveal={t < C.udhar ? ramp(t, C.france - 0.1, C.france + 0.8) : 1} />
      <MapLabel c={c} at={merc(-2.2, 53.3)} text="ब्रिटेन" t={t} t0={C.britain} t1={C.udhar + 0.4} size={54} color="#f6e8c8" />
      <MapLabel c={c} at={merc(2.4, 46.6)} text="फ्रांस" t={t} t0={C.france} t1={C.udhar + 0.4} size={60} color="#f6e8c8" />

      {/* North America, 1802-03 */}
      <Block id="nb" c={c} rings={GEO.britainNA} color={COL.britain} a={naOn} reveal={naRev(C.udhar + 0.2)} from={merc(-95, 60)} />
      <Block id="nu" c={c} rings={GEO.usa} color={COL.usa} a={naOn} reveal={naRev(C.udhar + 0.5)} from={merc(-80, 38)} />
      <Block id="ns" c={c} rings={GEO.spain} color={COL.spain} a={naOn + window4(t, C.ameer - 0.4, C.ameer, C.saint, C.saint + 0.4)} reveal={naRev(C.udhar + 0.8)} from={merc(-103, 25)} />
      <Block id="nl" c={c} rings={GEO.louisiana} color={louColor} a={naOn * (1 - 0.55 * louGrey)} reveal={t < C.udhar + 5 ? ramp(t, C.ilaka - 0.3, C.ilaka + 0.8, easeOut) : 1} from={GEO.newOrleans}
        glow={window4(t, C.louis4, C.louis4 + 0.2, C.plan, C.plan + 0.4) * 0.8 + window4(t, C.ekdin, C.ekdin + 0.2, C.dugna, C.dugna + 0.6)} />
      {louColour > 0 && louColour < 1 && <Block id="nl2" c={c} rings={GEO.louisiana} color={COL.usa} a={naOn} reveal={louColour} from={merc(-90, 38)} glow={0.8} />}
      <Block id="cb" c={c} rings={GEO.britainCarib} color={COL.britain} a={window4(t, C.ameer - 0.4, C.ameer, C.saint, C.saint + 0.4)} />
      <MapLabel c={c} at={merc(-100, 57)} text="ब्रिटेन" t={t} t0={C.udhar + 0.5} t1={C.chaabi + 0.6} size={58} color="#f6e8c8" />
      <MapLabel c={c} at={merc(-80.5, 37.5)} text="अमेरिका" t={t} t0={C.udhar + 0.8} t1={C.chaabi + 0.6} size={48} color="#f6e8c8" rot={-8} />
      <MapLabel c={c} at={merc(-108, 30)} text="स्पेन" t={t} t0={C.udhar + 1.1} t1={C.chaabi + 0.6} size={56} color="#f6e8c8" />
      <MapLabel c={c} at={merc(-99, 41.5)} text="लुईज़ियाना" t={t} t0={C.plan + 0.3} t1={C.chaabi + 0.6} size={54} color="#f6e8c8" rot={-12} />
      {/* second visit: labels again */}
      <MapLabel c={c} at={merc(-99, 41.5)} text="लुईज़ियाना" t={t} t0={C.saint11 + 0.3} t1={C.vyapar + 0.4} size={54} color="#f6e8c8" rot={-12} />
      <MapLabel c={c} at={merc(-80.5, 37.5)} text="अमेरिका" t={t} t0={C.jeff} t1={C.britain14} size={48} color="#f6e8c8" rot={-8} />

      {/* Saint-Domingue */}
      <Block id="hb" c={c} rings={GEO.haiti} color={COL.france} a={Math.min(1, haitiBlue) * (1 - haitiGreen)} fill={(onSat ? 0.1 : 0.62) + haitiShake} rim={onSat ? '#FFE07A' : undefined} reveal={ramp(t, C.ameer - 0.2, C.ameer + 0.6)} glow={window4(t, C.saint, C.saint + 0.2, C.haiti + 0.4, C.haiti + 0.9)} />
      <Block id="hg" c={c} rings={GEO.haiti} color={COL.haiti} a={haitiGreen} reveal={ramp(t, C.dweep, C.dweep + 0.8, easeOut)} glow={window4(t, C.dweep, C.dweep + 0.3, C.haath, C.haath + 0.6)} />

      {/* the fleet's route, Brest → Saint-Domingue */}
      <Route id="rf" c={c} a={[-4.5, 48.4]} b={[-72.3, 19.6]} p={fleetP} alpha={fleetA} bulge={0.12} />
      {/* "too far to defend": an arrow from Paris that falls short of Louisiana */}
      <Route id="ra" c={c} a={[2.35, 48.86]} b={[-60, 33]} p={arrowP} alpha={arrowA} bulge={0.22} color="#7a1f1f" />

      {/* the Mississippi */}
      <River c={c} p={riverP} a={riverA} t={t} />
      <MapLabel c={c} at={merc(-86.6, 36.2)} text="मिसिसिपी" t={t} t0={C.miss + 0.3} t1={C.neworl2} size={46} color="#0d4e66" rot={-70} />

      {/* India at true scale */}
      <Block id="in" c={c} rings={GEO.india} color={COL.india} a={indiaA} fill={0.55} tf={indiaTf(lerp(6.0e6, 0, indiaP))} glow={1 - 0.6 * clamp01(indiaP)} />
      <MapLabel c={c} at={indiaTf(0)(centroid(GEO.india))} text="भारत" t={t} t0={C.bharat + 0.5} t1={999} size={66} color="#5a3300" />
    </>
  );
};

export { easeIn, easeOut, inOut, linear };
