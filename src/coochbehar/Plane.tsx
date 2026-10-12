import React from 'react';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { C, Cam, DAHALA, GEO, P, PLANE, project, pxPerM } from './cam';

export const COL = {
  saffron: '#FF9F1C', gold: '#FFD84A', green: '#21E08A', deepGreen: '#0B8F55', red: '#FF4D4D', white: '#FFF6E6', cyan: '#7FE3FF', night: '#9FC4FF',
};

const pathD = (c: Cam, rings: P[][], close = true) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + (close ? 'Z' : '')).join('');

const Svg: React.FC<{ a: number; children: React.ReactNode; blend?: React.CSSProperties['mixBlendMode'] }> = ({ a, children, blend }) => (
  <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, mixBlendMode: blend }}>{children}</svg>
);

/** A country lit up the After Effects way: graded fill, a wide soft bloom, a hot inner edge and a light sweep running along the border. */
const CountryGlow: React.FC<{ c: Cam; rings: P[][]; a: number; color: string; t: number; fill?: number; id: string; tricolour?: number }> = ({ c, rings, a, color, t, fill = 0.2, id, tricolour = 0 }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, rings);
  const sweep = (t * 0.22) % 1;
  return (
    <Svg a={a}>
      <defs>
        <linearGradient id={`tri${id}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#FF9933" /><stop offset="0.36" stopColor="#FF9933" />
          <stop offset="0.44" stopColor="#ffffff" /><stop offset="0.6" stopColor="#ffffff" />
          <stop offset="0.68" stopColor="#138808" /><stop offset="1" stopColor="#138808" />
        </linearGradient>
      </defs>
      <path d={d} fill={color} fillOpacity={fill * (1 - tricolour)} />
      {tricolour > 0 && <path d={d} fill={`url(#tri${id})`} fillOpacity={0.5 * tricolour} />}
      <path d={d} fill="none" stroke={color} strokeWidth={34} strokeOpacity={0.22} strokeLinejoin="round" style={{ filter: 'blur(14px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={12} strokeOpacity={0.55} strokeLinejoin="round" style={{ filter: 'blur(5px)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.95} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={-sweep}
        style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px #fff)` }} />
    </Svg>
  );
};

/** The India–Bangladesh border line: draws on, can glow red (1947) or calm gold (2015). */
const BorderLine: React.FC<{ c: Cam; a: number; p: number; color: string; width?: number }> = ({ c, a, p, color, width = 5 }) => {
  if (a <= 0.001 || p <= 0) return null;
  const d = pathD(c, GEO.border, false);
  return (
    <Svg a={a}>
      <path d={d} fill="none" stroke={color} strokeWidth={width * 5} strokeOpacity={0.3} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: 'blur(9px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </Svg>
  );
};

// ---------------------------------------------------------------- the 162 enclaves
type Dot = { x: number; y: number; s: number; home: 'in' | 'bd'; i: number };
const DOTS: Dot[] = [
  ...GEO.dots_bd.map(([x, y, s], i) => ({ x, y, s, home: 'in' as const, i })),
  ...GEO.dots_in.map(([x, y, s], i) => ({ x, y, s, home: 'bd' as const, i })),
];
const X0 = Math.min(...DOTS.map((d) => d.x)), X1 = Math.max(...DOTS.map((d) => d.x));
const mixHex = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
  const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  return `rgb(${pa.map((v, k) => Math.round(lerp(v, pb[k], p))).join(',')})`;
};

/** Every enclave as a glowing chip. Indian ones (saffron) pop in for "111", Bangladeshi ones (green) join for "162";
 *  they flip at "जागे" (a preview), rewind for the story, get caged in 1947, and swap for real at midnight 2015. */
const Enclaves: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const span = c.span;
  const farA = ramp(span, 2.5e4, 6e4, linear) * (1 - ramp(span, 2.2e6, 3.5e6, linear));
  const vis = window4(t, C.bd1 - 0.8, C.bd1 - 0.6, C.anokha4 + 0.4, C.dahala4 + 0.2)
    + window4(t, C.kehte8 + 0.1, C.kehte8 + 0.5, C.nakshe13 + 1.6, C.parivar14 + 0.3)
    + window4(t, C.n1000 - 0.2, C.n1000 + 0.2, C.mitti16, C.mitti16 + 0.5);
  const a = clamp01(vis) * farA;
  if (a <= 0.001) return null;
  const base = 9;
  const cage = ramp(t, C.phans9 - 0.2, C.phans9 + 0.4, easeOut) * (1 - ramp(t, C.itihas13 - 0.3, C.itihas13 + 0.3, linear));
  const preview = window4(t, C.jaage2 - 0.05, C.jaage2 + 0.15, C.kahani3 - 0.2, C.kahani3 + 0.15);
  const merge = ramp(t, C.nakshe13 + 0.2, C.nakshe13 + 1.4, inOut);
  return (
    <Svg a={a}>
      {DOTS.map((d) => {
        const appear = d.home === 'in' ? C.bd1 - 0.6 + (d.i / 111) * 1.3 : C.n162 - 0.7 + (d.i / 51) * 0.7;
        const appear2 = C.kehte8 + 0.1;
        const s1 = t < C.kehte8 ? clamp01(pop(t, appear, 9, 260)) : clamp01(pop(t, appear2 + ((d.x - X0) / (X1 - X0)) * 0.4, 10, 240));
        if (s1 <= 0.01) return null;
        // the real swap rolls west → east across the belt
        const tf = C.itihas13 - 0.15 + ((d.x - X0) / (X1 - X0)) * 1.1;
        const flip = clamp01(ramp(t, tf, tf + 0.25, inOut) + preview);
        const [from, to] = d.home === 'in' ? [COL.saffron, COL.green] : [COL.green, COL.saffron];
        const col = mixHex(from, to, flip);
        const flash = window4(t, tf - 0.05, tf, tf + 0.05, tf + 0.35);
        const [x, y] = project(c, d.x, d.y);
        const r = base * d.s * s1 * (1 - merge * 0.75) * (1 + kick(t, tf, 0.35, 20, 8));
        return (
          <g key={`${d.home}${d.i}`}>
            <circle cx={x} cy={y} r={r * 2.6} fill={col} opacity={0.28} style={{ filter: 'blur(5px)' }} />
            <circle cx={x} cy={y} r={r} fill={col} stroke="#fff" strokeWidth={2} />
            {flash > 0 && <circle cx={x} cy={y} r={r * (1.6 + flash)} fill="#fff" opacity={flash * 0.8} />}
            {cage > 0 && <rect x={x - r * 1.9} y={y - r * 1.9} width={r * 3.8 * cage} height={r * 3.8} fill="none" stroke={COL.red} strokeWidth={2.4} opacity={cage} />}
          </g>
        );
      })}
    </Svg>
  );
};

// ---------------------------------------------------------------- Dahala Khagrabari: three nested rings
/** A soft irregular blob (looks like a hand-drawn land parcel rather than a perfect circle). */
const blob = (cx: number, cy: number, r: number, seed: number, n = 48) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.09 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2.3));
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return d + 'Z';
};
// approximate, schematic radii in metres: Balapara Khagrabari (India) ⊃ Upanchowki Bhajni (Bangladesh) ⊃ Dahala Khagrabari (India)
export const RINGS = [
  { r: 760, color: COL.saffron, seed: 1.2, key: 'in1' },
  { r: 330, color: COL.green, seed: 2.7, key: 'bd1' },
  { r: 60, color: COL.saffron, seed: 0.4, key: 'in2' },
] as const;

const Ring: React.FC<{ c: Cam; r: number; color: string; seed: number; a: number; draw: number; pulse: number; fill?: number }> = ({ c, r, color, seed, a, draw, pulse, fill = 0.22 }) => {
  if (a <= 0.001) return null;
  const [x, y] = project(c, DAHALA[0], DAHALA[1]);
  const R = r * pxPerM(c);
  const d = blob(x, y, R, seed);
  return (
    <Svg a={a}>
      <path d={d} fill={color} fillOpacity={fill * draw} />
      <path d={d} fill="none" stroke={color} strokeWidth={30} strokeOpacity={0.25 + pulse * 0.3} style={{ filter: 'blur(12px)' }} pathLength={1} strokeDasharray={`${draw} 1`} />
      <path d={d} fill="none" stroke={color} strokeWidth={9 + pulse * 5} strokeOpacity={0.9} pathLength={1} strokeDasharray={`${draw} 1`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5} pathLength={1} strokeDasharray={`${draw} 1`} />
    </Svg>
  );
};

const DahalaRings: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const on = window4(t, C.khet5 - 0.3, C.khet5, C.kehte8 + 0.1, C.kehte8 + 0.5);
  if (on <= 0.001) return null;
  // build-up in the order the script names them: the field, its Bangladeshi ring, the Indian ring
  const dIn2 = ramp(t, C.khet5 - 0.1, C.khet5 + 0.7, inOut);
  const dBd = ramp(t, C.charon5 - 0.1, C.bd5 + 0.4, inOut);
  const dIn1 = ramp(t, C.bharat6 - 0.1, C.ghira6 + 0.4, inOut);
  // चक्रव्यूह: rings pulse outer → inner on "एक देश… दूसरा देश… पहला देश"
  const pulse = (t0: number) => window4(t, t0 - 0.1, t0 + 0.05, t0 + 0.35, t0 + 0.8);
  const spiral = ramp(t, C.duniya7 + 0.2, C.chakra7 + 0.3, inOut);
  const [x, y] = project(c, DAHALA[0], DAHALA[1]);
  const k = pxPerM(c);
  let sp = '';
  if (spiral > 0) {
    const turns = 3.2, n = 240;
    for (let i = 0; i <= n * spiral; i++) {
      const u = i / n;
      const rr = lerp(820, 40, u) * k;
      const a = u * turns * Math.PI * 2 + t * 0.6;
      sp += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1);
    }
  }
  return (
    <>
      <Ring c={c} {...RINGS[0]} a={on} draw={dIn1} pulse={pulse(C.yaani7 + 0.2) + pulse(C.pehla7)} />
      <Ring c={c} {...RINGS[1]} a={on} draw={dBd} pulse={pulse(C.doosra7)} fill={0.3} />
      <Ring c={c} {...RINGS[2]} a={on} draw={dIn2} pulse={pulse(C.pehla7 + 0.35) + window4(t, C.khet5, C.khet5 + 0.2, C.charon5, C.charon5 + 0.3)} fill={0.45} />
      {spiral > 0 && (
        <Svg a={on * (1 - ramp(t, C.chakra7 + 0.4, C.kehte8, linear) * 0.4)}>
          <path d={sp} fill="none" stroke={COL.gold} strokeWidth={14} strokeOpacity={0.3} style={{ filter: 'blur(8px)' }} />
          <path d={sp} fill="none" stroke={COL.gold} strokeWidth={4.5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${COL.gold})` }} />
        </Svg>
      )}
    </>
  );
};

/** A dashed path from an Indian enclave across Bangladesh to the Indian mainland: the walk to a doctor. */
const Walk: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const a = window4(t, C.sarhad12 - 0.6, C.sarhad12 - 0.3, C.phir13 - 0.2, C.phir13 + 0.2);
  if (a <= 0.001) return null;
  const p = ramp(t, C.sarhad12 - 0.5, C.jaan12 + 1.2, inOut);
  const d = pathD(c, [GEO.walk], false);
  return (
    <Svg a={a}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={0.95}
        style={{ filter: `drop-shadow(0 0 6px ${COL.red})` }} mask="url(#walkmask)" />
      <defs>
        <mask id="walkmask"><path d={d} fill="none" stroke="#fff" strokeWidth={20} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      </defs>
    </Svg>
  );
};

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const indiaA = clamp01(window4(t, -1, 0, C.bd1 + 0.2, C.bd1 + 0.8) + window4(t, C.tirange16 - 0.6, C.tirange16, 999, 1000));
  const bdA = window4(t, C.bd1 - 0.4, C.bd1, C.raat2, C.raat2 + 0.6) + window4(t, C.poore6 - 0.2, C.bd6, C.yaani7, C.yaani7 + 0.5);
  const borderLine = window4(t, C.border3 - 0.4, C.border3, C.n162 - 0.3, C.n162 + 0.3);
  const border47 = window4(t, C.y1947 - 0.2, C.y1947, C.sochiye10, C.sochiye10 + 0.6) + window4(t, C.bukhar12, C.bukhar12 + 0.4, C.phir13, C.n31);
  const border15 = window4(t, C.nakshe13 - 0.2, C.nakshe13 + 0.3, C.parivar14 + 0.5, C.zameen15);
  return (
    <>
      <CountryGlow c={c} rings={GEO.bangladesh} color={COL.green} a={bdA} t={t} id="bd" fill={0.24} />
      <CountryGlow c={c} rings={c.span < 2e6 ? GEO.india_fine : GEO.india} color={COL.saffron} a={indiaA} t={t} id="in" fill={0.2}
        tricolour={ramp(t, C.tirange16 - 0.2, C.tirange16 + 0.6, inOut)} />
      <BorderLine c={c} a={borderLine} p={ramp(t, C.border3 - 0.4, C.lakeer3 + 0.2, inOut)} color={COL.white} />
      <BorderLine c={c} a={border47} p={ramp(t, C.y1947 - 0.2, C.batware9 + 0.3, inOut) + (t > C.bukhar12 ? 1 : 0)} color={COL.red} width={6} />
      <BorderLine c={c} a={border15} p={1} color={COL.gold} width={5} />
      <Enclaves c={c} t={t} />
      <DahalaRings c={c} t={t} />
      <Walk c={c} t={t} />
    </>
  );
};

/** How dark/night the grade is: the night of the hook, and midnight of 31 July 2015. */
export const nightAt = (t: number) => window4(t, C.raat2 - 0.3, C.raat2, C.kahani3 - 0.3, C.kahani3 + 0.2) + window4(t, C.n31, C.aadhi13, C.zameen15 - 0.2, C.zameen15 + 0.4);
/** Desaturated "history" look for the legend and 1947, and a cold look for the 68 years. */
export const pastAt = (t: number) => window4(t, C.kehte8 - 0.1, C.kehte8 + 0.4, C.phans9 + 0.6, C.sochiye10);
export const coldAt = (t: number) => window4(t, C.sochiye10 - 0.2, C.sochiye10 + 0.4, C.phir13, C.n31);
export { easeIn, easeOut, inOut, linear };
