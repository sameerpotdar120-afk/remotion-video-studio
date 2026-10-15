import React from 'react';
import { clamp01, easeOut, inOut, linear, ramp, window4 } from './anim';
import { C, Cam, GEO, P, PLANE, merc, project } from './cam';

export const COL = { red: '#E0262B', glow: '#FFB23A', gold: '#FFD84A', cyan: '#5FE3FF', radar: '#FFD000', france: '#3FA9FF', white: '#FFF6E6' };

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [px, py] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');
const lineD = (c: Cam, pts: P[]) => pts.map((pt, i) => {
  const [x, y] = project(c, pt[0], pt[1]);
  return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
}).join('');

// ---------------------------------------------------------------- the flight map's air traffic (drawn in code; no app data)
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
/** About 900 illustrative flights over Asia; none over the plateau, and a thinned band around it. */
const TRAFFIC: Flight[] = (() => {
  const out: Flight[] = [];
  const ring = GEO.plateau[0];
  for (let i = 0; out.length < 900 && i < 7000; i++) {
    const lon = 32 + rnd(i) * 106, lat = -8 + rnd(i + 9999) * 64;
    const at = merc(lon, lat);
    if (inside(at, ring)) continue;
    const near = ring.some((q) => Math.hypot(q[0] - at[0], q[1] - at[1]) < 2.2e5);
    if (near && rnd(i + 77) < 0.7) continue;
    out.push({ at, hdg: rnd(i + 31) * 360, v: 2.4e4 + rnd(i + 5) * 2.0e4 });
  }
  return out;
})();
const PLANE_GLYPH = 'M0,-10 L1.6,-6 L1.6,-2 L9,2.5 L9,4.5 L1.6,2.5 L1.2,7 L4,9 L4,10.5 L0,9.5 L-4,10.5 L-4,9 L-1.2,7 L-1.6,2.5 L-9,4.5 L-9,2.5 L-1.6,-2 L-1.6,-6 Z';

/** The flight map: dark land and sea, faint borders (India official), hundreds of gold planes, the empty hole, a red ring. */
const FlightMap: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const ring = ramp(t, C.khaali1 - 0.2, C.khaali1 + 0.6, inOut);
  const plat = pathD(c, GEO.plateau);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="#141b22" opacity={0.88} />
      <path d={pathD(c, GEO.china)} fill="#252d36" stroke="#4d5763" strokeWidth={2} />
      <path d={pathD(c, GEO.india)} fill="#252d36" stroke="#6b7682" strokeWidth={2.5} />
      {TRAFFIC.map((f, i) => {
        const r = (f.hdg * Math.PI) / 180;
        const [x, y] = project(c, f.at[0] + Math.sin(r) * f.v * t * 0.06, f.at[1] + Math.cos(r) * f.v * t * 0.06);
        if (x < -200 || x > PLANE.w + 200 || y < -200 || y > PLANE.h + 200) return null;
        return <path key={i} d={PLANE_GLYPH} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${f.hdg.toFixed(0)}) scale(1.3)`} fill={COL.radar} stroke="#5a4600" strokeWidth={0.6} />;
      })}
      {ring > 0 && (
        <>
          <path d={plat} fill={COL.red} fillOpacity={0.18 * ring} />
          <path d={plat} fill="none" stroke={COL.red} strokeWidth={10} pathLength={1} strokeDasharray={`${ring} 1`} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 12px rgba(224,38,43,0.95))' }} />
        </>
      )}
    </svg>
  );
};

/** Spotlight: everything outside the region dims, so the highlight reads at a glance. */
const Spotlight: React.FC<{ c: Cam; rings: P[][]; a: number }> = ({ c, rings, a }) => {
  if (a <= 0.001) return null;
  const outer = `M${-6000},${-6000}H${PLANE.w + 6000}V${PLANE.h + 6000}H${-6000}Z`;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={outer + pathD(c, rings)} fill="#040a14" fillOpacity={0.36} fillRule="evenodd" />
    </svg>
  );
};

/** The plateau in the reference's "danger zone" look: red fill, a hot orange-gold edge that breathes. */
const PlateauGlow: React.FC<{ c: Cam; t: number; a: number; fill?: number; hot?: number }> = ({ c, t, a, fill = 0.62, hot = 0 }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, GEO.plateau);
  const pulse = 0.75 + 0.25 * Math.sin(t * 4);
  const top = hot ? '#ff7a2a' : '#ff4a3d', bottom = hot ? '#d8461a' : '#b5141a';
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <clipPath id="t2platC"><path d={d} /></clipPath>
        <radialGradient id="t2platF" cx="50%" cy="55%" r="65%">
          <stop offset="0" stopColor={top} stopOpacity={fill * 0.85} />
          <stop offset="1" stopColor={bottom} stopOpacity={fill} />
        </radialGradient>
      </defs>
      <path d={d} fill="url(#t2platF)" style={{ mixBlendMode: 'multiply' }} />
      <path d={d} fill={top} fillOpacity={fill * 0.35} />
      <g clipPath="url(#t2platC)">
        <path d={d} fill="none" stroke="#5a0608" strokeWidth={70} strokeOpacity={0.5} style={{ filter: 'blur(20px)' }} />
        <path d={d} fill="none" stroke="#ffd27a" strokeWidth={22} strokeOpacity={0.35 * pulse} style={{ filter: 'blur(10px)' }} />
      </g>
      <path d={d} fill="none" stroke={COL.glow} strokeWidth={46} strokeOpacity={0.3 * pulse} strokeLinejoin="round" style={{ filter: 'blur(18px)' }} />
      <path d={d} fill="none" stroke="#ffe2a0" strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${6 + 8 * pulse}px ${COL.glow}) drop-shadow(0 0 2px #fff)` }} />
    </svg>
  );
};

/** India, official boundary, lit gold. */
const IndiaLit: React.FC<{ c: Cam; a: number }> = ({ c, a }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, GEO.india);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill={COL.gold} fillOpacity={0.16} />
      <path d={d} fill="none" stroke={COL.gold} strokeWidth={30} strokeOpacity={0.3} strokeLinejoin="round" style={{ filter: 'blur(12px)' }} />
      <path d={d} fill="none" stroke="#fff6d6" strokeWidth={4} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${COL.gold}) drop-shadow(0 0 2px #fff)` }} />
    </svg>
  );
};

/** Four true-size Frances stamped onto the plateau (scaled from France's latitude to Tibet's, so the comparison is fair on a
 *  Mercator map: cos 46.5° / cos 32.5° ≈ 0.81). Positions are spread across the plateau. */
const FR_K = Math.cos((46.5 * Math.PI) / 180) / Math.cos((32.5 * Math.PI) / 180);
const FR_AT: P[] = [merc(80.0, 35.6), merc(88.6, 35.9), merc(96.8, 33.6), merc(88.4, 30.0)];
const Frances: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const fc = GEO.france_c;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {FR_AT.map((at, i) => {
        const t0 = C.france2 + 0.2 + i * 0.32;
        const p = ramp(t, t0, t0 + 0.28, easeOut);
        if (p <= 0) return null;
        const s = FR_K * (1 + (1 - p) * 0.8);
        const rings: P[][] = GEO.france.map((r) => r.map(([x, y]) => [at[0] + (x - fc[0]) * s, at[1] + (y - fc[1]) * s] as P));
        const d = pathD(c, rings);
        return (
          <g key={i} opacity={p}>
            <path d={d} fill={COL.france} fillOpacity={0.82} stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))' }} />
          </g>
        );
      })}
    </svg>
  );
};

/** The few airports on the plateau (approximate positions): pulsing dots that pop in one by one. */
const Airports: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const keys = Object.keys(GEO.places).filter((k) => k.startsWith('ap_'));
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {keys.map((k, i) => {
        const [x, y] = project(c, ...GEO.places[k]);
        const t0 = C.airports8 - 0.2 + i * 0.16;
        const s = clamp01((t - t0) * 4);
        const ping = (((t - t0) * 0.9) % 1 + 1) % 1;
        return s > 0 ? (
          <g key={k} transform={`translate(${x},${y})`}>
            <circle r={18 + ping * 50} fill="none" stroke="#fff" strokeOpacity={(1 - ping) * 0.8} strokeWidth={3} />
            <circle r={15 * s} fill="#ff2b2b" stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 10px #ff2b2b)' }} />
          </g>
        ) : null;
      })}
    </svg>
  );
};

/** The point (and heading) a fraction f of the way along a polyline, in plane pixels. */
export const alongPx = (c: Cam, pts: P[], f: number): [number, number, number] => {
  const px = pts.map((p) => project(c, p[0], p[1]));
  const seg = px.slice(1).map((p, i) => Math.hypot(p[0] - px[i][0], p[1] - px[i][1]));
  let need = clamp01(f) * seg.reduce((s, v) => s + v, 0);
  for (let i = 0; i < seg.length; i++) {
    if (need <= seg[i] || i === seg.length - 1) {
      const q = Math.min(1, need / Math.max(1e-6, seg[i]));
      const [a, b] = [px[i], px[i + 1]];
      return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI];
    }
    need -= seg[i];
  }
  return [px[px.length - 1][0], px[px.length - 1][1], 0];
};

/** L888: the one airway across the plateau (approximate line), drawing on in gold. */
export const l888Draw = (t: number) => ramp(t, C.raasta9 - 0.2, C.l888 + 0.8, inOut);
const L888Line: React.FC<{ c: Cam; t: number; a: number }> = ({ c, t, a }) => {
  if (a <= 0.001) return null;
  const d = lineD(c, GEO.l888);
  const p = l888Draw(t);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <path d={d} fill="none" stroke={COL.gold} strokeWidth={30} strokeOpacity={0.3} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: 'blur(10px)' }} />
      <path d={d} fill="none" stroke="#fff3c4" strokeWidth={7} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${COL.gold})` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={9} pathLength={1} strokeDasharray="0.03 0.97" strokeDashoffset={-((t * 0.25) % 1)} strokeLinecap="round" opacity={p > 0.98 ? 0.9 : 0}
        style={{ filter: `drop-shadow(0 0 8px ${COL.gold})` }} />
    </svg>
  );
};

/** Flight routes that bend around the plateau (illustrative): used for the hook's plane, which veers away. */
export const AROUND: [P, P, P] = [merc(70, 26), merc(84, 22.5), merc(104, 24)];
export const routePx = (c: Cam, r: [P, P, P], u: number): [number, number, number] => {
  const q = (k: number) => project(c, r[k][0], r[k][1]);
  const [a, b, d] = [q(0), q(1), q(2)];
  const pt = (v: number): [number, number] => [(1 - v) ** 2 * a[0] + 2 * (1 - v) * v * b[0] + v * v * d[0], (1 - v) ** 2 * a[1] + 2 * (1 - v) * v * b[1] + v * v * d[1]];
  const [x, y] = pt(u), [x2, y2] = pt(Math.min(1, u + 0.01));
  return [x, y, (Math.atan2(x2 - x, -(y2 - y)) * 180) / Math.PI];
};

// ---------------------------------------------------------------- the map layer
export const flightMapAt = (t: number) => window4(t, -1, -0.5, C.ye2 - 0.2, C.tibet2);
export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const fm = flightMapAt(t);
  const glowA = window4(t, C.ye2 - 0.2, C.tibet2 + 0.1, 998, 999) * (1 - fm);
  const indiaA = window4(t, C.india1 - 0.15, C.india1 + 0.25, C.kyu1, C.ye2);
  const hot = window4(t, C.mausam7 - 0.6, C.mausam7, C.utarna8, C.utarna8 + 0.5);
  return (
    <>
      <Spotlight c={c} rings={GEO.plateau} a={glowA * 0.9} />
      <PlateauGlow c={c} t={t} a={glowA} fill={t > C.raasta9 ? 0.4 : 0.62} hot={hot} />
      <Frances c={c} t={t} a={window4(t, C.france2, C.france2 + 0.1, C.duniya2 - 0.3, C.duniya2)} />
      <FlightMap c={c} t={t} a={fm} />
      <IndiaLit c={c} a={indiaA} />
      <Airports c={c} t={t} a={window4(t, C.airports8 - 0.3, C.airports8 - 0.2, C.raasta9 - 0.3, C.raasta9)} />
      <L888Line c={c} t={t} a={window4(t, C.raasta9 - 0.3, C.raasta9 - 0.2, 998, 999)} />
    </>
  );
};

export { linear };
