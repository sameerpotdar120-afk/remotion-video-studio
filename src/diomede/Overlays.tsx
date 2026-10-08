import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { Cam, GEO, MID, PLANE, merc, project, pxPerM } from './cam';
import { FlagRussia, FlagUSA } from './Flags';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
export const CYAN = '#3FC6FF';
export const RED = '#FF3B4B';
export const GOLD = '#FFD21F';
type P = [number, number];

// ---------------------------------------------------------------- helpers
const ringsD = (c: Cam, rings: P[][]) => {
  let d = '';
  for (const r of rings) {
    for (let i = 0; i < r.length; i++) {
      const [x, y] = project(c, r[i][0], r[i][1]);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    d += 'Z';
  }
  return d;
};
const lineD = (c: Cam, pts: P[]) =>
  pts.length < 2 ? '' : 'M' + pts.map(([x, y]) => project(c, x, y).map((v) => v.toFixed(1)).join(',')).join('L');

const len = (pts: P[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const sliceLen = (pts: P[], p: number): P[] => {
  if (p <= 0) return [];
  const L = len(pts) * Math.min(1, p);
  const out: P[] = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= L) {
      const k = (L - acc) / (seg || 1);
      out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]);
      return out;
    }
    acc += seg;
    out.push(pts[i]);
  }
  return out;
};
/** Keep the parts of a polyline whose y lies inside [lo, hi], clipping every segment (for top-down / centre-out reveals). */
const clipY = (pts: P[], lo: number, hi: number): P[][] => {
  const out: P[][] = [];
  let cur: P[] = [];
  const at = (q: P, p: P, y: number): P => {
    const k = (y - q[1]) / (p[1] - q[1] || 1);
    return [lerp(q[0], p[0], k), y];
  };
  for (let i = 1; i < pts.length; i++) {
    const q = pts[i - 1];
    const p = pts[i];
    const yMin = Math.min(q[1], p[1]);
    const yMax = Math.max(q[1], p[1]);
    if (yMax < lo || yMin > hi) {
      if (cur.length) { out.push(cur); cur = []; }
      continue;
    }
    const a: P = q[1] > hi ? at(q, p, hi) : q[1] < lo ? at(q, p, lo) : q;
    const b: P = p[1] > hi ? at(q, p, hi) : p[1] < lo ? at(q, p, lo) : p;
    if (!cur.length) cur.push(a);
    cur.push(b);
    if (b !== p) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Svg: React.FC<{ children: React.ReactNode; filter?: string; opacity?: number; blend?: React.CSSProperties['mixBlendMode'] }> = ({
  children, filter, opacity = 1, blend,
}) =>
  opacity <= 0.001 ? null : (
    <svg width={PLANE.w} height={PLANE.h}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter, opacity, mixBlendMode: blend }}>
      {children}
    </svg>
  );

/** HTML pinned to a Mercator point; billboarded against camera roll and tilt unless `flat`. */
export const Pin: React.FC<{ c: Cam; at: P; children: React.ReactNode; anchor?: 'center' | 'bottom'; flat?: boolean; rot?: number }> = ({
  c, at, children, anchor = 'center', flat = false, rot = 0,
}) => {
  const [x, y] = project(c, at[0], at[1]);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: 0, height: 0, transformStyle: 'preserve-3d',
      transform: flat ? `rotate(${rot}deg)` : `rotate(${-c.rot}deg) rotateX(${-c.tilt}deg)`,
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: anchor === 'center' ? 'translate(-50%,-50%)' : 'translate(-50%,-100%)',
      }}>
        {children}
      </div>
    </div>
  );
};

const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

const BIG = GEO.bigCenter;
const LIT = GEO.littleCenter;
const bigTop: P = [BIG[0], GEO.bigBounds[3]];
const litTop: P = [LIT[0], GEO.littleBounds[3]];

// ---------------------------------------------------------------- the layer
export const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = pxPerM(c);
  const items: React.ReactNode[] = [];

  // ---- sea ice spreading across the strait (46.4 →)
  if (t > 46.3) {
    const grow = ramp(t, 46.4, 48.7, easeOut);
    const R0 = 80000 * grow;
    const [cx, cy] = project(c, MID[0], MID[1]);
    const box = 90000;
    const [ax, ay] = project(c, MID[0] - box, MID[1] + box * 1.4);
    const [bx, by] = project(c, MID[0] + box, MID[1] - box * 1.4);
    const holes = ringsD(c, [...GEO.big, ...GEO.little]);
    const tile = 16000 * k;
    items.push(
      <svg key="ice" width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <clipPath id="iceclip"><path d={`M${ax},${ay}L${bx},${ay}L${bx},${by}L${ax},${by}Z` + holes} clipRule="evenodd" /></clipPath>
          <radialGradient id="icegrow" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={Math.max(1, R0 * k)}>
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.82" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="icemask"><rect x={ax} y={ay} width={bx - ax} height={by - ay} fill="url(#icegrow)" /></mask>
          <pattern id="icetile" patternUnits="userSpaceOnUse" x={project(c, MID[0], MID[1])[0]} y={project(c, MID[0], MID[1])[1]}
            width={tile} height={tile * 1.5} patternTransform={`rotate(${17})`}>
            <image href={staticFile('diomede/img/sea_ice_topdown.png')} width={tile} height={tile * 1.5} preserveAspectRatio="none" />
          </pattern>
        </defs>
        <g clipPath="url(#iceclip)" mask="url(#icemask)" opacity={0.86}>
          <rect x={ax} y={ay} width={bx - ax} height={by - ay} fill="url(#icetile)" />
        </g>
      </svg>,
    );
  }

  // ---- island fills and outlines
  const hook = window4(t, -0.1, 0.0, 6.7, 7.3);
  const litA = Math.max(ramp(t, 10.1, 10.5, linear), 0) * (1 - 0.55 * ramp(t, 46.4, 47.4, linear));
  const bigA = Math.max(ramp(t, 11.9, 12.3, linear), 0) * (1 - 0.55 * ramp(t, 46.4, 47.4, linear)) * (1 - 0.4 * window4(t, 40.4, 41.2, 45.6, 46.4));
  const endPulseL = 1 + 1.2 * window4(t, 55.9, 56.1, 56.6, 57.0);
  const endPulseB = 1 + 1.2 * window4(t, 56.85, 57.05, 57.6, 58.0) + 0.6 * window4(t, 42.1, 42.4, 43.0, 43.6);
  const zoomedOut = ramp(t, 27.4, 28.0, linear) * (1 - ramp(t, 33.2, 33.8, linear));
  const islVis = 1 - zoomedOut;
  if (islVis > 0) {
    const dL = ringsD(c, GEO.little);
    const dB = ringsD(c, GEO.big);
    if (litA > 0 || bigA > 0) {
      items.push(
        <Svg key="islTint" blend="hard-light" opacity={islVis}>
          <path d={dL} fill={CYAN} fillOpacity={0.5 * litA * Math.min(1.6, endPulseL)} />
          <path d={dB} fill={RED} fillOpacity={0.42 * bigA * Math.min(1.6, endPulseB)} />
        </Svg>,
      );
    }
    items.push(
      <Svg key="islLine" opacity={islVis} filter={glow('rgba(255,255,255,0.85)', 6)}>
        <path d={dL} fill="none" stroke={litA > 0.5 ? '#BDEBFF' : '#fff'} strokeOpacity={Math.max(hook, litA)} strokeWidth={3 * Math.min(1.5, endPulseL)} strokeLinejoin="round" />
        <path d={dB} fill="none" stroke={bigA > 0.5 ? '#FFC2C7' : '#fff'} strokeOpacity={Math.max(hook, bigA)} strokeWidth={3 * Math.min(1.5, endPulseB)} strokeLinejoin="round" />
      </Svg>,
    );
  }

  // ---- hook pulse rings on both islands (0 – 1.8)
  if (t < 1.9) {
    for (const [i, at] of [GEO.bigCenter, GEO.littleCenter].entries()) {
      const ph = ((t + i * 0.25) % 0.9) / 0.9;
      const a = 1 - ramp(t, 1.4, 1.9, linear);
      items.push(
        <Pin key={`ring${i}`} c={c} at={at}>
          <div style={{ position: 'relative', opacity: a }}>
            {[0, 0.5].map((o) => {
              const q = (ph + o) % 1;
              const R = (i ? 70 : 110) * (0.6 + q * 1.4);
              return <div key={o} style={{ position: 'absolute', left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: '50%',
                border: `5px solid rgba(255,255,255,${0.9 * (1 - q)})`, boxShadow: `0 0 18px rgba(255,210,31,${0.7 * (1 - q)})` }} />;
            })}
          </div>
        </Pin>,
      );
    }
  }

  // ---- 3.8 km arrow (1.2 – 7.0)
  const arrowA = ramp(t, 1.15, 1.3, linear) * (1 - ramp(t, 6.6, 7.0, linear));
  if (arrowA > 0) {
    const p = ramp(t, 1.2, 2.3, easeOut);
    const A = GEO.gapA;
    const B = GEO.gapB;
    const m: P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const pa = project(c, lerp(m[0], A[0], p), lerp(m[1], A[1], p));
    const pb = project(c, lerp(m[0], B[0], p), lerp(m[1], B[1], p));
    const ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
    const head = (Q: number[], dir: number) => {
      const s = 22;
      const a1 = ang + dir * Math.PI + 0.5;
      const a2 = ang + dir * Math.PI - 0.5;
      return `M${Q[0] + Math.cos(a1) * s},${Q[1] + Math.sin(a1) * s}L${Q[0]},${Q[1]}L${Q[0] + Math.cos(a2) * s},${Q[1] + Math.sin(a2) * s}`;
    };
    items.push(
      <Svg key="arrow" opacity={arrowA} filter="drop-shadow(0 0 6px rgba(0,0,0,0.7)) drop-shadow(0 0 10px rgba(255,210,31,0.6))">
        <path d={`M${pa[0]},${pa[1]}L${pb[0]},${pb[1]}`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <path d={head(pa, 1) + head(pb, 0)} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>,
    );
    const km = (3.8 * ramp(t, 1.4, 2.6, easeOut)).toFixed(1);
    items.push(
      <Pin key="arrowlbl" c={c} at={[m[0] + 3500, m[1] - 7500]}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: '#fff', whiteSpace: 'nowrap', opacity: arrowA,
          transform: `scale(${pop(t, 1.3, 11, 200)})`, textShadow: '0 0 14px rgba(255,200,0,0.8), 0 4px 12px rgba(0,0,0,0.85)' }}>
          {km} किमी
        </div>
      </Pin>,
    );
  }

  // ---- International Date Line
  const dlA = ramp(t, 13.35, 13.5, linear) * (1 - ramp(t, 31.2, 31.8, linear)) * (1 - 0.6 * ramp(t, 27.2, 27.8, linear));
  if (dlA > 0) {
    const local = ramp(t, 13.44, 14.4, inOut) * 45000;
    const top = MID[1] + local + ramp(t, 14.6, 15.7, inOut) * 2.0e7;
    const bot = MID[1] - local - ramp(t, 14.6, 16.0, inOut) * 2.8e7;
    const parts = GEO.dateline.flatMap((pts) => clipY(pts, bot, top));
    items.push(
      <Svg key="dl" opacity={dlA} filter={glow('rgba(255,200,0,0.9)', 5)}>
        {parts.map((pts, i) => (
          <path key={i} d={lineD(c, pts)} fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray="20 13" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>,
    );
    // Pacific-scale labels
    const lblA = window4(t, 15.0, 15.4, 16.6, 17.0);
    if (lblA > 0) {
      items.push(
        <Pin key="dllbl" c={c} at={merc(180, 57)}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: GOLD, whiteSpace: 'nowrap', opacity: lblA,
            textShadow: '0 0 14px rgba(255,190,0,0.7), 0 4px 12px rgba(0,0,0,0.85)' }}>
            इंटरनेशनल डेट लाइन ↓
          </div>
        </Pin>,
      );
      const side = (txt: string, at: P, col: string, d: number) => (
        <Pin key={`side${txt}`} c={c} at={at}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, color: col, opacity: lblA * clamp01(pop(t, 15.6 + d, 12, 200)),
            textShadow: `0 0 18px ${col}, 0 4px 12px rgba(0,0,0,0.85)` }}>{txt}</div>
        </Pin>
      );
      items.push(side('कल', merc(160, 12), '#FF8A93', 0), side('आज', merc(-160, 12), '#9FE3FF', 0.15));
    }
  }

  // ---- Alaska: Russian, then American (28.4 – 31.6)
  const akA = ramp(t, 28.2, 28.7, linear) * (1 - ramp(t, 31.5, 32.1, linear));
  if (akA > 0) {
    const toBlue = ramp(t, 30.85, 31.25, inOut);
    const red = 0.22 + 0.18 * window4(t, 29.6, 29.9, 30.6, 30.9);
    const col = toBlue > 0.5 ? CYAN : RED;
    const flash = window4(t, 30.85, 30.95, 31.0, 31.35);
    const d = ringsD(c, GEO.alaska);
    items.push(
      <Svg key="akT" blend="hard-light" opacity={akA}>
        <path d={d} fill={col} fillOpacity={lerp(red, 0.34, toBlue) + flash * 0.3} fillRule="nonzero" />
      </Svg>,
      <Svg key="akL" opacity={akA} filter={glow(toBlue > 0.5 ? 'rgba(63,198,255,0.9)' : 'rgba(255,60,75,0.9)', 7)}>
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.5} strokeLinejoin="round" />
      </Svg>,
    );
    const lbl = (txt: string, at: P, t0: number, colr: string) => (
      <Pin key={`ak${txt}`} c={c} at={at}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, color: colr, opacity: akA * clamp01(pop(t, t0, 12, 200)), whiteSpace: 'nowrap',
          textShadow: '0 0 12px rgba(0,0,0,0.9), 0 3px 10px rgba(0,0,0,0.9)' }}>{txt}</div>
      </Pin>
    );
    items.push(lbl('रशिया', merc(-176, 66.2), 29.6, '#FFD0D4'), lbl('अलास्का', merc(-156, 64.8), 30.3, '#fff'));
  }

  // ---- the border, drawn south → north (31.8 →), kept through the Cold War
  const bA = ramp(t, 31.75, 31.9, linear) * (1 - ramp(t, 40.0, 40.6, linear));
  if (bA > 0) {
    const p = ramp(t, 31.8, 33.0, inOut);
    const pulse = 1 + 0.6 * window4(t, 32.9, 33.1, 33.7, 34.2) + 0.5 * window4(t, 36.7, 36.9, 37.4, 38.0);
    items.push(
      <Svg key="border" opacity={bA} filter={glow('rgba(255,255,255,0.9)', 5 * pulse)}>
        {GEO.border.map((pts, i) => (
          <path key={i} d={lineD(c, sliceLen(pts, p))} fill="none" stroke="#fff" strokeWidth={5 * Math.min(1.4, pulse)} strokeLinecap="round" />
        ))}
      </Svg>,
    );
  }

  // ---- Ice Curtain wall rising along the border (36.8 – 40.4)
  const wallA = ramp(t, 36.75, 36.9, linear) * (1 - ramp(t, 39.9, 40.5, linear));
  if (wallA > 0) {
    const rise = ramp(t, 36.78, 37.9, easeOut);
    const at: P = [(GEO.gapA[0] + GEO.gapB[0]) / 2 + 900, (GEO.gapA[1] + GEO.gapB[1]) / 2];
    items.push(
      <Pin key="wall" c={c} at={at} anchor="bottom">
        <Img src={staticFile('diomede/img/ice_curtain_wall.png')} style={{
          width: 980, opacity: wallA * 0.93, transform: `scaleY(${rise}) scaleX(${0.85 + 0.15 * rise})`, transformOrigin: '50% 100%',
          filter: 'drop-shadow(0 0 18px rgba(140,220,255,0.75))',
        }} />
      </Pin>,
    );
  }

  // ---- US / Russia flags (10.1 – 13.7)
  const flagA = 1 - ramp(t, 13.3, 13.7, linear);
  if (t > 10.0 && flagA > 0) {
    const card = (key: string, at: P, t0: number, flag: React.ReactNode, label: string, col: string) => {
      const s = pop(t, t0, 10, 190);
      if (s <= 0) return null;
      return (
        <Pin key={key} c={c} at={at} anchor="bottom">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: flagA, transform: `scale(${s})`, transformOrigin: '50% 100%' }}>
            <div style={{ padding: 6, background: '#fff', borderRadius: 10, boxShadow: `0 0 0 3px ${col}, 0 0 26px ${col}, 0 10px 20px rgba(0,0,0,0.5)` }}>{flag}</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#fff', marginTop: 10, textShadow: `0 0 12px ${col}, 0 3px 10px rgba(0,0,0,0.9)` }}>{label}</div>
            <div style={{ width: 4, height: 70, background: '#fff', marginTop: 4, boxShadow: `0 0 10px ${col}` }} />
          </div>
        </Pin>
      );
    };
    items.push(
      card('fUS', litTop, 10.14, <FlagUSA w={170} />, 'अमेरिका', CYAN),
      card('fRU', bigTop, 11.92, <FlagRussia w={150} />, 'रशिया', RED),
    );
  }

  // ---- military pin + outpost on Big Diomede (42.2 – 46.6)
  const milA = 1 - ramp(t, 46.0, 46.6, linear);
  if (t > 42.1 && milA > 0) {
    const sPin = pop(t, 42.2, 9, 210);
    const sOut = pop(t, 42.55, 11, 150);
    const at: P = [BIG[0] - 600, BIG[1] + 2500];
    const ph = ((t - 43.0) % 1.3) / 1.3;
    items.push(
      <Pin key="outpost" c={c} at={[at[0] + 1300, at[1] - 3200]} anchor="bottom">
        <Img src={staticFile('diomede/img/arctic_outpost.png')} style={{ width: 560, opacity: milA, transform: `scale(${sOut})`, transformOrigin: '50% 85%',
          filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.55))' }} />
      </Pin>,
      <Pin key="milpin" c={c} at={at} anchor="bottom">
        <div style={{ position: 'relative', opacity: milA }}>
          {t > 43.0 && [0, 0.5].map((o) => {
            const q = (ph + o) % 1;
            const R = 60 + 160 * q;
            return <div key={o} style={{ position: 'absolute', left: 105 - R, top: 220 - R * 0.55, width: 2 * R, height: 1.1 * R, borderRadius: '50%',
              border: `4px solid rgba(255,59,75,${0.85 * (1 - q)})` }} />;
          })}
          <Img src={staticFile('diomede/img/pin_military.png')} style={{ width: 250, transform: `scale(${sPin * (1 + 0.12 * window4(t, 44.7, 44.85, 45.0, 45.3))})`,
            transformOrigin: '50% 92%', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.5))', position: 'relative' }} />
        </div>
      </Pin>,
    );
  }

  // ---- ice bridge glow, footprints and the walker (48.6 – 54)
  const [wa, wb] = GEO.walk;
  const bridgeA = window4(t, 48.6, 49.0, 50.2, 51.0);
  if (bridgeA > 0) {
    items.push(
      <Svg key="bridge" opacity={bridgeA} filter={glow('rgba(200,240,255,0.95)', 10, 3)}>
        <path d={lineD(c, [wa, wb])} stroke="#E8FAFF" strokeWidth={14} strokeLinecap="round" strokeOpacity={0.8} />
      </Svg>,
    );
  }
  const walkA = 1 - ramp(t, 53.6, 54.2, linear);
  if (t > 49.0 && walkA > 0) {
    const [sa, sb] = [project(c, wa[0], wa[1]), project(c, wb[0], wb[1])];
    const dirDeg = (Math.atan2(sb[1] - sa[1], sb[0] - sa[0]) * 180) / Math.PI + 90;
    const N = 4;
    for (let i = 0; i < N; i++) {
      const f = (i + 0.5) / N;
      const t0 = 49.6 + i * 0.85;
      const a = ramp(t, t0, t0 + 0.12, linear) * walkA;
      if (a <= 0) continue;
      items.push(
        <Pin key={`fp${i}`} c={c} at={[lerp(wa[0], wb[0], f), lerp(wa[1], wb[1], f)]} flat rot={dirDeg}>
          <Img src={staticFile('diomede/img/footprints_snow.png')} style={{ width: 96, opacity: a * 0.9 }} />
        </Pin>,
      );
    }
    const m = ramp(t, 49.1, 53.0, linear);
    const pose = Math.floor(t / 0.22) % 2 ? 'a' : 'b';
    items.push(
      <Pin key="walker" c={c} at={[lerp(wa[0], wb[0], m), lerp(wa[1], wb[1], m)]} anchor="bottom">
        <Img src={staticFile(`diomede/img/person_parka_${pose}.png`)} style={{ width: 330, opacity: walkA * ramp(t, 49.0, 49.3, linear),
          filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.55))', transform: `translateY(${Math.abs(Math.sin(t * 14.3)) * -4}px)` }} />
      </Pin>,
    );
  }

  return <>{items}</>;
};
