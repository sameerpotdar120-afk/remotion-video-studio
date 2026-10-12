import React from 'react';
import { clamp01, easeOut, inOut, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, P, PLANE, merc, project } from './cam';

export const COL = { red: '#E0262B', glow: '#FFB23A', gold: '#FFD84A', cyan: '#5FE3FF', radar: '#FFD000' };

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');

// ---------------------------------------------------------------- the radar's air traffic
/** Deterministic pseudo-random. */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const inside = (pt: P, ring: P[]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
type Flight = { at: P; hdg: number; v: number };
/** About 900 flights over Asia, Europe's edge and the oceans; none over the plateau (a margin around it stays nearly empty too). */
export const TRAFFIC: Flight[] = (() => {
  const out: Flight[] = [];
  const ring = GEO.plateau[0];
  for (let i = 0; out.length < 900 && i < 6000; i++) {
    const lon = 32 + rnd(i) * 106, lat = -8 + rnd(i + 9999) * 64;
    const at = merc(lon, lat);
    if (inside(at, ring)) continue;
    // thin out a band just outside the plateau, like the real map
    const near = GEO.plateau[0].some((q) => Math.hypot(q[0] - at[0], q[1] - at[1]) < 2.2e5);
    if (near && rnd(i + 77) < 0.7) continue;
    out.push({ at, hdg: rnd(i + 31) * 360, v: 2.4e4 + rnd(i + 5) * 2.0e4 });
  }
  return out;
})();

const PLANE_GLYPH = 'M0,-10 L1.6,-6 L1.6,-2 L9,2.5 L9,4.5 L1.6,2.5 L1.2,7 L4,9 L4,10.5 L0,9.5 L-4,10.5 L-4,9 L-1.2,7 L-1.6,2.5 L-9,4.5 L-9,2.5 L-1.6,-2 L-1.6,-6 Z';

/** The radar look: dark sea and land, faint country edges, hundreds of yellow planes, and the empty hole. */
const Radar: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const ring = ramp(t, C.beech2 - 0.1, C.khaali2 + 0.5, inOut);
  const tag = ramp(t, C.khaali2, C.khaali2 + 0.3, easeOut);
  const plat = pathD(c, GEO.plateau);
  const appear = (i: number) => clamp01((t - C.radar2 + 0.3) * 3 - (i % 40) * 0.025);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="#1d2329" opacity={0.86} />
      <path d={pathD(c, GEO.india)} fill="#2b3139" stroke="#59616b" strokeWidth={2} />
      <path d={pathD(c, GEO.china)} fill="#2b3139" stroke="#59616b" strokeWidth={2} />
      {TRAFFIC.map((f, i) => {
        const dt = t - C.radar2;
        const r = (f.hdg * Math.PI) / 180;
        const [x, y] = project(c, f.at[0] + Math.sin(r) * f.v * dt * 0.06, f.at[1] + Math.cos(r) * f.v * dt * 0.06);
        if (x < -200 || x > PLANE.w + 200 || y < -200 || y > PLANE.h + 200) return null;
        const s = appear(i);
        return s > 0 ? <path key={i} d={PLANE_GLYPH} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${f.hdg.toFixed(0)}) scale(${(1.25 * s).toFixed(2)})`} fill={COL.radar} stroke="#5a4600" strokeWidth={0.6} /> : null;
      })}
      {ring > 0 && (
        <path d={plat} fill="none" stroke={COL.red} strokeWidth={9} pathLength={1} strokeDasharray={`${ring} 1`} strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(224,38,43,0.9))' }} />
      )}
      {tag > 0 && <path d={plat} fill={COL.red} fillOpacity={0.28 * tag} />}
    </svg>
  );
};

/** The plateau in its "danger zone" look: red fill, a hot orange-gold edge that breathes. */
export const PlateauGlow: React.FC<{ c: Cam; t: number; a: number; fill?: number }> = ({ c, t, a, fill = 0.62 }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, GEO.plateau);
  const pulse = 0.75 + 0.25 * Math.sin(t * 4);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <clipPath id="platC"><path d={d} /></clipPath>
      </defs>
      <path d={d} fill={COL.red} fillOpacity={fill} />
      <g clipPath="url(#platC)">
        <path d={d} fill="none" stroke="#7a0d10" strokeWidth={60} strokeOpacity={0.45} style={{ filter: 'blur(18px)' }} />
      </g>
      <path d={d} fill="none" stroke={COL.glow} strokeWidth={34} strokeOpacity={0.35 * pulse} strokeLinejoin="round" style={{ filter: 'blur(14px)' }} />
      <path d={d} fill="none" stroke={COL.glow} strokeWidth={7} strokeOpacity={0.95} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 8 * pulse}px ${COL.glow})` }} />
    </svg>
  );
};

/** India, official boundary, lit gold, filling up from the south while "तीन-चौथाई" is said. */
const IndiaLit: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, GEO.india);
  const [, y0] = project(c, 0, merc(0, 37.5)[1]);
  const [, y1] = project(c, 0, merc(0, 6)[1]);
  const fillUp = ramp(t, C.chauthai3 - 0.2, C.chauthai3 + 0.9, inOut);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs><clipPath id="indC"><path d={d} /></clipPath></defs>
      <path d={d} fill={COL.gold} fillOpacity={0.14} />
      <g clipPath="url(#indC)">
        <rect x={-4000} y={y1 - (y1 - y0) * fillUp * 0.75} width={PLANE.w + 8000} height={(y1 - y0) * 0.75 * fillUp + 10} fill={COL.gold} opacity={0.35} />
      </g>
      <path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${COL.gold})` }} />
    </svg>
  );
};

/** The few airports on the plateau, as pulsing red dots. */
const Airports: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const keys = Object.keys(GEO.places).filter((k) => k.startsWith('ap_'));
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {keys.map((k, i) => {
        const [x, y] = project(c, ...GEO.places[k]);
        const s = clamp01((t - C.airports9 - i * 0.12) * 4);
        const ping = ((t - C.airports9 - i * 0.12) * 0.9) % 1;
        return s > 0 ? (
          <g key={k} transform={`translate(${x},${y})`}>
            <circle r={18 + ping * 50} fill="none" stroke="#fff" strokeOpacity={(1 - ping) * 0.8} strokeWidth={3} />
            <circle r={16 * s} fill="#ff2b2b" stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 10px #ff2b2b)' }} />
          </g>
        ) : null;
      })}
    </svg>
  );
};

/** Flight routes that bend around the plateau instead of crossing it. */
export const AROUND: [P, P, P][] = [
  // Europe → South-East Asia, south of the plateau over India
  [merc(55, 34), merc(80, 22), merc(103, 13)],
  // Delhi → Beijing, the long way north
  [merc(77.2, 28.6), merc(80, 45), merc(116.4, 39.9)],
  // Gulf → China, around the west and north
  [merc(60, 30), merc(88, 44), merc(110, 35)],
  // Kolkata → Chengdu, around the east
  [merc(88.4, 22.6), merc(101, 24), merc(104, 30.7)],
];
export const routePt = (c: Cam, r: [P, P, P], u: number): P => {
  const q = (k: number): P => project(c, r[k][0], r[k][1]);
  const [a, b, d] = [q(0), q(1), q(2)];
  return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * d[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * d[1]];
};
const Routes: React.FC<{ c: Cam; t: number; a: number; t0: number }> = ({ c, t, a, t0 }) => {
  if (a <= 0.001) return null;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {AROUND.map((r, i) => {
        const p = ramp(t, t0 + i * 0.25, t0 + 1.2 + i * 0.25, inOut);
        const pts = Array.from({ length: 41 }, (_, k) => routePt(c, r, k / 40));
        const d = pts.map((q, k) => (k ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('');
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={14} strokeOpacity={0.18} pathLength={1} strokeDasharray={`${p} 1`} style={{ filter: 'blur(6px)' }} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={4.5} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- the plane layer (map sections only)
export const radarAt = (t: number) => window4(t, C.radar2 - 0.35, C.radar2 - 0.05, C.pathar3 - 0.3, C.pathar3 + 0.1);

export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const rad = radarAt(t);
  const glowA = (window4(t, 0.4, 1.0, C.radar2 - 0.4, C.radar2) + window4(t, C.pathar3 - 0.1, C.pathar3 + 0.3, 998, 999)) * (1 - rad);
  return (
    <>
      <PlateauGlow c={c} t={t} a={glowA} fill={t > C.doosri8 - 1 ? 0.5 : 0.62} />
      <IndiaLit c={c} t={t} a={window4(t, C.bharat3 - 0.15, C.bharat3 + 0.25, C.pehli5 - 0.3, C.pehli5)} />
      <Radar c={c} t={t} a={rad} />
      <Airports c={c} t={t} a={window4(t, C.airports9 - 0.1, C.airports9, C.gadbad10 + 0.2, C.gadbad10 + 0.6)} />
      <Routes c={c} t={t} a={window4(t, C.gadbad10, C.gadbad10 + 0.2, 998, 999)} t0={C.gadbad10 + 0.2} />
    </>
  );
};

export { linear };
