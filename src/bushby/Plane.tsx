import React from 'react';
import { clamp01, inOut, interpolateKeys, linear, ramp, window4 } from './anim2';
import { C, Cam, GEO, P, PLANE, merc, project, pxPerM } from './cam';
import { COL } from './kit';

const pathD = (c: Cam, rings: P[][], close = true) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + (close ? 'Z' : '')).join('');

const Svg: React.FC<{ a: number; children: React.ReactNode }> = ({ a, children }) => (
  <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>{children}</svg>
);

/** A region lit the After Effects way: graded fill, a wide soft bloom, a hot edge and a light sweep along the border. */
export const Glow: React.FC<{ c: Cam; rings: P[][]; a: number; color: string; t: number; fill?: number }> = ({ c, rings, a, color, t, fill = 0.22 }) => {
  if (a <= 0.001 || !rings.length) return null;
  const d = pathD(c, rings);
  return (
    <Svg a={a}>
      <path d={d} fill={color} fillOpacity={fill} />
      <path d={d} fill="none" stroke={color} strokeWidth={30} strokeOpacity={0.22} strokeLinejoin="round" style={{ filter: 'blur(12px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={10} strokeOpacity={0.55} strokeLinejoin="round" style={{ filter: 'blur(4px)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5} strokeOpacity={0.9} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={-((t * 0.22) % 1)}
        style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px #fff)` }} />
    </Svg>
  );
};

// ---------------------------------------------------------------- the walk
const S = GEO.stage;
/** How far along the route (fractional point index) Karl is at time t. */
const ROUTE_KEYS: [number, number][] = [
  [C.karl4 - 0.4, 0], [C.gaadi4, 0.2], [C.imtihan5 - 0.1, S.darien - 1], [C.darien5 + 0.3, S.darien], [C.maut6 + 0.4, S.darien + 1], [C.panama6 + 0.2, S.panama],
  [C.jail6 + 0.8, S.panama], [C.bering7 - 0.2, S.alaska - 3], [C.jamne7, S.strait], [C.n14 + 0.2, S.strait + 0.15], [C.russia7 + 0.2, S.russia],
  [C.giraftar7 + 0.8, S.russia], [C.russia8 + 0.6, S.russia + 1], [C.ban9, S.russia + 2], [C.siberia9 + 0.4, S.russia + 3], [C.n11 + 0.8, S.asia],
  [C.pandemic10 + 0.3, S.stall - 1], [C.sarhad10 + 0.3, S.stall], [C.caspian11 + 0.3, S.caspian], [C.kood12 + 0.1, S.caspian], [C.naav12, S.baku],
  [C.turkey13 + 0.2, S.europe - 2], [C.europe13 + 0.4, S.europe + 2], [C.october13 + 0.3, S.channel - 1], [C.channel13 + 0.2, S.channel],
  [C.england13 + 0.3, S.dover], [C.ghar14, S.dover + 1], [C.sau14 + 0.4, S.home],
];
export const routeAt = (t: number) => interpolateKeys(ROUTE_KEYS, t);
const SWIM = new Set([S.caspian, S.channel]);
const ICE = new Set([S.strait]);

export const pointAt = (k: number): P => {
  const i = Math.max(0, Math.min(GEO.route.length - 2, Math.floor(k)));
  const f = clamp01(k - i);
  const a = GEO.route[i], b = GEO.route[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
};

/** The route drawn up to Karl's position: gold on land, white over the ice, cyan dashes where he swam. */
const Route: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const k = routeAt(t);
  const segs: React.ReactNode[] = [];
  const n = Math.floor(k);
  for (let i = 0; i <= Math.min(n, GEO.route.length - 2); i++) {
    const p0 = GEO.route[i], p1 = i < n ? GEO.route[i + 1] : pointAt(k);
    const [x0, y0] = project(c, p0[0], p0[1]);
    const [x1, y1] = project(c, p1[0], p1[1]);
    const col = SWIM.has(i) ? COL.sea : ICE.has(i) ? COL.ice : COL.gold;
    const dash = SWIM.has(i) ? '16 12' : undefined;
    segs.push(
      <g key={i}>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={col} strokeWidth={24} strokeOpacity={0.25} strokeLinecap="round" style={{ filter: 'blur(8px)' }} />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={col} strokeWidth={8} strokeLinecap="round" strokeDasharray={dash} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
      </g>,
    );
  }
  const [hx, hy] = project(c, ...pointAt(k));
  const pulse = 1 + Math.sin(t * 6) * 0.12;
  return (
    <Svg a={a}>
      {segs}
      <circle cx={hx} cy={hy} r={34 * pulse} fill={COL.gold} opacity={0.3} style={{ filter: 'blur(8px)' }} />
      <circle cx={hx} cy={hy} r={13} fill="#fff" stroke={COL.gold} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${COL.gold})` }} />
    </Svg>
  );
};

/** A soft irregular blob in metres around a place (the Darién Gap). */
const Blob: React.FC<{ c: Cam; at: P; r: number; a: number; color: string; t: number }> = ({ c, at, r, a, color, t }) => {
  if (a <= 0.001) return null;
  const [x, y] = project(c, at[0], at[1]);
  const R = r * pxPerM(c);
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const q = (i / 60) * Math.PI * 2;
    const rr = R * (1 + 0.12 * Math.sin(q * 3 + 1.3) + 0.07 * Math.sin(q * 5 + 0.4) + 0.02 * Math.sin(q * 2 + t));
    d += (i ? 'L' : 'M') + (x + Math.cos(q) * rr * 1.25).toFixed(1) + ',' + (y + Math.sin(q) * rr * 0.8).toFixed(1);
  }
  d += 'Z';
  return (
    <Svg a={a}>
      <path d={d} fill={color} fillOpacity={0.3} />
      <path d={d} fill="none" stroke={color} strokeWidth={26} strokeOpacity={0.3} style={{ filter: 'blur(10px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={7} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
    </Svg>
  );
};

/** The visa rule: out of Russia, back to the same spot. A dashed loop from Karl's position to the border and back. */
const VisaLoop: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const a = window4(t, C.exit8 - 0.3, C.exit8, C.ban9 - 0.2, C.ban9 + 0.2);
  if (a <= 0.001) return null;
  const [hx, hy] = project(c, ...pointAt(routeAt(t)));
  const k = pxPerM(c);
  const out = ramp(t, C.exit8 - 0.2, C.exit8 + 1.0, inOut), back = ramp(t, C.jagah8 - 0.3, C.entry8 + 0.3, inOut);
  const dx = 0, dy = 1.1e6 * k;
  const bend = 0.55e6 * k;
  const d = `M${hx},${hy} C${hx + bend},${hy + dy * 0.3} ${hx + bend},${hy + dy * 0.9} ${hx + dx},${hy + dy}`;
  const d2 = `M${hx + dx},${hy + dy} C${hx - bend},${hy + dy * 0.9} ${hx - bend},${hy + dy * 0.3} ${hx},${hy}`;
  return (
    <Svg a={a}>
      {out > 0 && <path d={d} fill="none" stroke={COL.red} strokeWidth={7} strokeDasharray="18 12" opacity={out} style={{ filter: `drop-shadow(0 0 6px ${COL.red})` }} />}
      {back > 0 && <path d={d2} fill="none" stroke={COL.green} strokeWidth={7} strokeDasharray="18 12" style={{ filter: `drop-shadow(0 0 6px ${COL.green})` }} opacity={back} />}
    </Svg>
  );
};

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const darienA = window4(t, C.darien5 - 0.3, C.darien5 + 0.2, C.panama6, C.panama6 + 0.5);
  const panamaA = window4(t, C.panama6 - 0.1, C.panama6 + 0.3, C.bering7 - 0.4, C.bering7);
  const russiaA = window4(t, C.russia7 - 0.2, C.russia7 + 0.3, C.n11 + 0.6, C.pandemic10);
  const banFlash = window4(t, C.ban9 - 0.05, C.ban9 + 0.1, C.ban9 + 0.6, C.ban9 + 1.0);
  const pandemicA = window4(t, C.pandemic10 - 0.1, C.pandemic10 + 0.2, C.caspian11 - 0.2, C.caspian11 + 0.2);
  const caspA = window4(t, C.caspian11 - 0.2, C.caspian11 + 0.3, C.turkey13, C.turkey13 + 0.5);
  const blockA = window4(t, C.russia11 - 0.1, C.russia11 + 0.2, C.kood12, C.kood12 + 0.4);
  const ukA = window4(t, C.england13 - 0.2, C.england13 + 0.2, 999, 1000);
  return (
    <>
      <Blob c={c} at={merc(-77.6, 8.0)} r={95000} color={COL.green} a={darienA} t={t} />
      <Glow c={c} rings={GEO.panama} color={COL.red} a={panamaA} t={t} fill={0.2} />
      <Glow c={c} rings={GEO.russia} color={banFlash > 0 ? '#ff2a2a' : COL.red} a={russiaA * 0.8} t={t} fill={0.06 + 0.2 * banFlash} />
      {['kazakhstan', 'turkmenistan', 'iran'].map((k) => (
        <Glow key={k} c={c} rings={(GEO as unknown as Record<string, P[][]>)[k]} color={COL.red} a={pandemicA * (0.6 + 0.4 * Math.abs(Math.sin(t * 5)))} t={t} fill={0.1} />
      ))}
      <Glow c={c} rings={GEO.russia} color={COL.red} a={blockA} t={t} fill={0.2} />
      <Glow c={c} rings={GEO.iran} color={COL.red} a={blockA} t={t} fill={0.2} />
      <Glow c={c} rings={GEO.caspian} color={COL.sea} a={caspA} t={t} fill={0.3} />
      <Glow c={c} rings={GEO.uk} color={COL.gold} a={ukA} t={t} fill={0.16} />
      <Route c={c} t={t} a={1} />
      <VisaLoop c={c} t={t} />
    </>
  );
};

export { linear };
