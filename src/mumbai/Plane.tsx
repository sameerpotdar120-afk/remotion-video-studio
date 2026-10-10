import React from 'react';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, IslandKey, P, PLANE, merc, project } from './cam';
import { LandDraw } from './Map';

export const ISLANDS: IslandKey[] = ['colaba', 'bombay', 'mazagaon', 'parel', 'worli', 'mahim', 'oldwoman'];
export const COL = { portugal: '#2F8F5B', england: '#C9353D', company: '#E08A2E', gold: '#FFD45A', water: '#7FD8F0' };

const ALL_ISLANDS: P[][] = ISLANDS.flatMap((k) => GEO.islands[k]);
const INK = '#2a1d12';

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');

const lineD = (c: Cam, pts: P[]) => pts.map(([x, y], i) => {
  const [px, py] = project(c, x, y);
  return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
}).join('');

// ---------------------------------------------------------------- the land through the story
const FLOOD = () => [C.samandar2 - 0.3, C.mumbai3 - 0.05];
const MERGE = () => [C.ek22 - 0.55, C.ek22 + 0.75];
const westX = merc(72.79, 19)[0];
const eastX = merc(72.89, 19)[0];

/** Live land for the chart: today's city, flooded back to seven islands, then merged into one again. */
export const landAt = (t: number): LandDraw[] => {
  const [f0, f1] = FLOOD();
  const [m0, m1] = MERGE();
  if (t < f0) return [{ rings: GEO.city, a: 1 }];
  if (t < f1) return [{ rings: ALL_ISLANDS, a: 1 }, { rings: GEO.flats, a: 1, eastOf: lerp(westX, eastX, ramp(t, f0, f1, inOut)) }];
  if (t < m0) return [{ rings: ALL_ISLANDS, a: 1 }];
  if (t < m1) {
    const r = ramp(t, m0, m1, easeIn) * 3600;
    return [{ rings: ALL_ISLANDS, a: 1 }, { rings: GEO.flats, a: 1, circles: ISLANDS.map((k) => ({ at: GEO.label[k], r })) }];
  }
  return [{ rings: GEO.city, a: 1 }];
};
const outlineAt = (t: number): P[][] => {
  const [f0] = FLOOD();
  const [, m1] = MERGE();
  return t < f0 + 0.4 || t >= m1 ? GEO.city : ALL_ISLANDS;
};
export const floodFront = (t: number) => {
  const [f0, f1] = FLOOD();
  return t > f0 && t < f1 + 0.2 ? lerp(westX, eastX, ramp(t, f0, f1, inOut)) : null;
};

// ---------------------------------------------------------------- pieces
/** Old-chart coast: parallel engraved lines fading out to sea, an ink outline, a soft inner shade. */
const Engraved: React.FC<{ c: Cam; rings: P[][]; a: number; id: string }> = ({ c, rings, a, id }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, rings);
  const steps: [number, number][] = [[34, 0.3], [22, 0.5], [12, 0.75]];
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={12000} height={12000}>
          <rect x={-4000} y={-4000} width={12000} height={12000} fill="#000" />
          {steps.map(([w, g], i) => (
            <React.Fragment key={i}>
              <path d={d} fill="none" stroke={`rgb(${g * 255},${g * 255},${g * 255})`} strokeWidth={w * 2 + 2.6} strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#000" strokeWidth={w * 2 - 0.6} strokeLinejoin="round" />
            </React.Fragment>
          ))}
          <path d={d} fill="#000" />
        </mask>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
      </defs>
      <rect x={-4000} y={-4000} width={12000} height={12000} fill={INK} opacity={0.42} mask={`url(#${id}m)`} />
      <g clipPath={`url(#${id}c)`}><path d={d} fill="none" stroke="#5a3a1a" strokeOpacity={0.25} strokeWidth={22} style={{ filter: 'blur(7px)' }} /></g>
      <path d={d} fill="none" stroke={INK} strokeOpacity={0.85} strokeWidth={2.6} strokeLinejoin="round" />
    </svg>
  );
};

/** A flat colour wash over land with a bright leading edge as it spreads from `from`. */
const Tint: React.FC<{ id: string; c: Cam; rings: P[][]; color: string; a: number; reveal?: number; from?: P; fill?: number; glow?: number; stroke?: number }> = ({
  id, c, rings, color, a, reveal = 1, from, fill = 0.42, glow = 0, stroke = 0,
}) => {
  if (a <= 0.001 || reveal <= 0.001) return null;
  const d = pathD(c, rings);
  const o = project(c, ...(from ?? GEO.cityCentre));
  const rad = reveal >= 1 ? 99999 : 30 + reveal * 2600;
  const edge = reveal < 1 ? Math.sin(reveal * Math.PI) : 0;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a,
      filter: glow > 0 ? `drop-shadow(0 0 ${8 * glow}px ${color}) drop-shadow(0 0 ${22 * glow}px ${color})` : undefined }}>
      <defs>
        <clipPath id={`${id}r`}><circle cx={o[0]} cy={o[1]} r={rad} /></clipPath>
        <clipPath id={`${id}s`}><path d={d} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}r)`}>
        <path d={d} fill={color} fillOpacity={fill} />
        {stroke > 0 && <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />}
      </g>
      {edge > 0.01 && <circle cx={o[0]} cy={o[1]} r={rad} fill="none" stroke="#fff" strokeOpacity={0.6 * edge} strokeWidth={12} clipPath={`url(#${id}s)`} style={{ filter: 'blur(4px)' }} />}
    </svg>
  );
};

/** Dashed sea route through waypoints (lon/lat), drawn on with p; returns nothing when hidden. */
const Route: React.FC<{ c: Cam; pts: [number, number][]; p: number; alpha: number; color?: string; id: string }> = ({ c, pts, p, alpha, color = '#3b2a1a', id }) => {
  if (alpha <= 0.001 || p <= 0) return null;
  const q = pts.map(([lo, la]) => project(c, ...merc(lo, la)));
  // smooth through the waypoints (Catmull-Rom → cubic)
  let d = `M${q[0][0]},${q[0][1]}`;
  for (let i = 0; i < q.length - 1; i++) {
    const p0 = q[Math.max(0, i - 1)], p1 = q[i], p2 = q[i + 1], p3 = q[Math.min(q.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: alpha }}>
      <defs>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={16} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
        </mask>
      </defs>
      <path d={d} fill="none" stroke="#f6e8c8" strokeWidth={9} strokeDasharray="16 12" strokeLinecap="round" mask={`url(#${id}m)`} opacity={0.6} />
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="16 12" strokeLinecap="round" mask={`url(#${id}m)`} />
    </svg>
  );
};
export const ROUTE_DOWRY: [number, number][] = [[-9.3, 38.6], [-11.5, 43.5], [-6.5, 48.6], [-0.4, 51.3]];
export const ROUTE_COMPANY: [number, number][] = [[-0.4, 51.3], [-7, 48.5], [-14, 36], [-19, 16], [-10, 1], [3, -18], [17, -36.5], [32, -33], [45, -27], [56, -8], [64, 9], [72.6, 18.9]];
export const routePoint = (pts: [number, number][], u: number): P => {
  // position along the polyline by length in Mercator metres (close enough to the smoothed curve)
  const m = pts.map(([lo, la]) => merc(lo, la));
  const seg = m.slice(1).map((b, i) => Math.hypot(b[0] - m[i][0], b[1] - m[i][1]));
  let L = seg.reduce((a, b) => a + b, 0) * clamp01(u);
  for (let i = 0; i < seg.length; i++) {
    if (L <= seg[i]) {
      const k = L / seg[i];
      return [lerp(m[i][0], m[i + 1][0], k), lerp(m[i][1], m[i + 1][1], k)];
    }
    L -= seg[i];
  }
  return m[m.length - 1];
};

/** Hornby's wall: a dashed plan, then stone laid along it from Malabar Hill to Worli. */
const Vellard: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const planA = window4(t, C.deewar - 0.1, C.deewar + 0.3, C.y1784 + 0.4, C.y1784 + 0.8);
  const build = ramp(t, C.ruka - 0.4, C.y1784 + 0.9, inOut);
  const wallA = window4(t, C.ruka - 0.4, C.ruka - 0.3, C.aajbhi + 0.6, C.aajbhi + 1.2);
  const glow = window4(t, C.y1784 + 0.6, C.y1784 + 0.9, C.vellard + 0.6, C.vellard + 1.2);
  if (planA <= 0 && wallA <= 0) return null;
  const d = lineD(c, GEO.vellard);
  const k = Math.min(1.6, Math.max(0.35, 7000 / c.span));
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {planA > 0 && (
        <path d={d} fill="none" stroke="#7a1f1f" strokeWidth={6 * k} strokeDasharray={`${14 * k} ${12 * k}`} strokeLinecap="round" opacity={planA * 0.9}
          strokeDashoffset={-t * 30} />
      )}
      {wallA > 0 && build > 0 && (
        <g opacity={wallA} style={{ filter: glow > 0 ? `drop-shadow(0 0 ${14 * glow}px #FFD45A)` : 'drop-shadow(0 3px 3px rgba(30,20,10,0.5))' }}>
          <path d={d} fill="none" stroke="#3a2e22" strokeWidth={30 * k} pathLength={1} strokeDasharray={`${build} 1`} strokeLinecap="butt" />
          <path d={d} fill="none" stroke="#a89880" strokeWidth={24 * k} pathLength={1} strokeDasharray={`${build} 1`} strokeLinecap="butt" />
          <path d={d} fill="none" stroke="#6d604f" strokeWidth={24 * k} pathLength={1} strokeDasharray={`${build * 0.999} 1`} strokeLinecap="butt" opacity={0.0} />
          {/* block joints */}
          <path d={d} fill="none" stroke="#5b4f40" strokeWidth={24 * k} strokeDasharray={`${2 * k} ${16 * k}`} opacity={0.8} mask="url(#vbuild)" />
          <defs>
            <mask id="vbuild" maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
              <path d={d} fill="none" stroke="#fff" strokeWidth={40 * k} pathLength={1} strokeDasharray={`${build} 1`} />
            </mask>
          </defs>
          <path d={d} fill="none" stroke="#d8ccb4" strokeWidth={5 * k} pathLength={1} strokeDasharray={`${build} 1`} transform={`translate(${-6 * k},0)`} opacity={0.7} />
        </g>
      )}
    </svg>
  );
};

/** Water forcing through the Great Breach and over the low ground every monsoon. */
const BreachWater: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const a = window4(t, C.samandar16 - 0.2, C.samandar16 + 0.2, C.y1782 + 0.2, C.y1782 + 0.7);
  if (a <= 0) return null;
  const arrows: [number, number, number, number][] = [
    [72.795, 18.979, 72.826, 18.976], [72.797, 18.985, 72.828, 18.986], [72.800, 18.973, 72.824, 18.968],
  ];
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {arrows.map(([a0, b0, a1, b1], i) => {
        const A = project(c, ...merc(a0, b0));
        const B = project(c, ...merc(a1, b1));
        const p = ramp(t, C.samandar16 - 0.1 + i * 0.12, C.ghus + 0.5 + i * 0.12, easeOut);
        const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
        const H = [lerp(A[0], B[0], p), lerp(A[1], B[1], p)];
        return (
          <g key={i} style={{ filter: 'drop-shadow(0 0 6px #7FD8F0)' }}>
            <path d={`M${A[0]},${A[1]} L${H[0]},${H[1]}`} stroke="#e8fbff" strokeWidth={9} strokeLinecap="round" />
            <path d={`M${H[0] + Math.cos(ang) * 18},${H[1] + Math.sin(ang) * 18} L${H[0] + Math.cos(ang + 2.5) * 24},${H[1] + Math.sin(ang + 2.5) * 24} L${H[0] + Math.cos(ang - 2.5) * 24},${H[1] + Math.sin(ang - 2.5) * 24} Z`} fill="#e8fbff" />
          </g>
        );
      })}
    </svg>
  );
};

/** The Coastal Road on today's satellite: a glowing line drawn along the reclaimed edge. */
const CoastalRoad: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const p = ramp(t, C.coastal - 0.15, C.road + 0.7, inOut);
  const a = window4(t, C.coastal - 0.2, C.coastal, C.kisne + 0.2, C.kisne + 0.8) * 0.95 + window4(t, C.kisne + 0.2, C.kisne + 0.8, 998, 999) * 0.45;
  if (a <= 0 || p <= 0) return null;
  const d = lineD(c, GEO.coastalRoad);
  const pulse = 0.8 + 0.2 * Math.sin(t * 9);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill="none" stroke="#FFC24A" strokeWidth={26} strokeOpacity={0.35 * pulse} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(9px)' }} />
      <path d={d} fill="none" stroke="#FFD87A" strokeWidth={9} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px #FFB020)' }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** An engraved compass rose in the Arabian Sea, as on the old charts. */
const Compass: React.FC<{ c: Cam; a: number; t: number }> = ({ c, a, t }) => {
  if (a <= 0.001) return null;
  const [x, y] = project(c, ...merc(72.772, 19.0));
  const r = Math.max(60, Math.min(220, (2600 * 1920) / c.span / 1.0)) * 0.55;
  const pts = (n: number, r1: number, r2: number, rot: number) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const ang = rot + (i * Math.PI) / n;
      const rr = i % 2 ? r2 : r1;
      return `${(x + Math.sin(ang) * rr).toFixed(1)},${(y - Math.cos(ang) * rr).toFixed(1)}`;
    }).join(' ');
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a * 0.75 }}>
      <circle cx={x} cy={y} r={r * 1.08} fill="none" stroke={INK} strokeWidth={2} />
      <circle cx={x} cy={y} r={r * 0.98} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="3 5" />
      <polygon points={pts(8, r * 0.62, r * 0.16, Math.PI / 8)} fill="#e9d7ae" stroke={INK} strokeWidth={1.4} />
      <polygon points={pts(4, r, r * 0.2, 0)} fill="#b8452f" stroke={INK} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={r * 0.07} fill={INK} />
      <text x={x} y={y - r * 1.18} textAnchor="middle" fontFamily="'IMFell', serif" fontSize={r * 0.34} fill={INK}>N</text>
    </svg>
  );
};

// ---------------------------------------------------------------- the plane layer
export const PlaneLayers: React.FC<{ t: number; c: Cam; sat: number }> = ({ t, c, sat }) => {
  const chartA = 1 - sat;
  const outline = outlineAt(t);
  const names: [IslandKey, number][] = [['colaba', C.colaba], ['bombay', C.bombay], ['mazagaon', C.mazgaon], ['parel', C.parel], ['worli', C.worli], ['mahim', C.mahim], ['oldwoman', C.oldw]];
  // tints through the colonial years
  const portuA = window4(t, C.kabja - 0.5, C.kabja - 0.1, C.england, C.england + 0.4);
  const engA = window4(t, C.england - 0.1, C.england + 0.3, C.company14 + 0.3, C.company14 + 0.8);
  const coA = window4(t, C.company14 + 0.2, C.company14 + 0.7, C.monsoon - 0.2, C.monsoon + 0.6);
  const mergedGlow = window4(t, C.ek22 + 0.2, C.ek22 + 0.6, C.gaye22 + 0.6, C.aajbhi + 0.4);
  const monsoonEdge = window4(t, C.samandar16 - 0.3, C.samandar16, C.y1782, C.y1782 + 0.5) * (0.6 + 0.4 * Math.sin(t * 7));
  return (
    <>
      <Compass c={c} a={chartA * (c.span < 9e4 ? 1 : 0)} t={t} />
      <Engraved id="eg" c={c} rings={outline} a={chartA} />
      {/* the seven islands named one by one; on "सात" they flash in turn */}
      {ISLANDS.map((k, i) => {
        const nm = names.find((n) => n[0] === k)![1];
        const own = window4(t, nm - 0.1, nm + 0.15, nm + 0.75, nm + 1.1);
        const all = window4(t, C.island7 + 0.1, C.island7 + 0.4, C.yahan + 0.3, C.yahan + 0.8) * 0.55;
        const flash = window4(t, C.saat + i * 0.12, C.saat + i * 0.12 + 0.1, C.saat + i * 0.12 + 0.3, C.saat + i * 0.12 + 0.6);
        const a = Math.min(1, Math.max(own, all, flash)) * chartA;
        return <Tint key={k} id={`n${k}`} c={c} rings={GEO.islands[k]} color={COL.gold} a={a} fill={0.2} glow={0.55 * a} stroke={3} />;
      })}
      <Tint id="tp" c={c} rings={ALL_ISLANDS} color={COL.portugal} a={portuA * chartA} reveal={ramp(t, C.kabja - 0.5, C.kabja + 0.6, easeOut)} from={GEO.label.bombay} fill={0.5} />
      <Tint id="te" c={c} rings={ALL_ISLANDS} color={COL.england} a={engA * chartA} fill={0.55} glow={0.5} />
      <Tint id="tc" c={c} rings={ALL_ISLANDS} color={COL.company} a={coA * chartA} fill={0.42} />
      {/* monsoon: the sea washing over every island edge */}
      {monsoonEdge > 0 && (
        <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: monsoonEdge }}>
          <defs><clipPath id="mclip"><path d={pathD(c, ALL_ISLANDS)} /></clipPath></defs>
          <g clipPath="url(#mclip)"><path d={pathD(c, ALL_ISLANDS)} fill="none" stroke={COL.water} strokeWidth={26} style={{ filter: 'blur(5px)' }} /></g>
        </svg>
      )}
      <BreachWater c={c} t={t} />
      <Vellard c={c} t={t} />
      {/* one island at last */}
      <Tint id="tm" c={c} rings={GEO.city} color={COL.gold} a={mergedGlow * chartA} fill={0.18} glow={1.0 * mergedGlow} stroke={5} />
      {/* the dowry and the Company's ship */}
      <Route id="rd" c={c} pts={ROUTE_DOWRY} p={ramp(t, C.dahej + 0.1, C.england + 0.5, inOut)} alpha={window4(t, C.dahej, C.dahej + 0.2, C.company14, C.company14 + 0.4)} color="#7a1f1f" />
      <Route id="rc" c={c} pts={ROUTE_COMPANY} p={ramp(t, C.company14, C.diya + 0.4, inOut)} alpha={window4(t, C.company14 - 0.1, C.company14 + 0.1, C.kam + 0.1, C.kam + 0.4)} color="#5a3200" />
      <CoastalRoad c={c} t={t} />
    </>
  );
};

export { easeIn, easeOut, inOut, linear };
