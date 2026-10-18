import React from 'react';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp, window4 } from './anim';
import { C, Cam, GEO, P, SC, merc, project, pxPerM, toScreen, xOfLon } from './cam';
import { NUM } from './fonts';

/** The reference's zone colours: translucent bands, one colour per offset, cycling. */
const PAL = ['#E8473A', '#2FB86A', '#8A5BD6', '#22A8C9', '#F2B632', '#E85FA0', '#5FD35A', '#3D6FE0'];
export const zoneColor = (z: number) => PAL[(((Math.round(Math.floor(z)) % 8) + 8) % 8)];

const ringsD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');

const TOP = merc(0, 80)[1], BOT = merc(0, -72)[1];
/** A straight band n (centred on n × 15°), as a rectangle on the sheet. */
const bandD = (c: Cam, n: number) => {
  const [x0, y0] = project(c, xOfLon(n * 15 - 7.5), TOP);
  const [x1, y1] = project(c, xOfLon(n * 15 + 7.5), BOT);
  return `M${x0},${y0}L${x1},${y0}L${x1},${y1}L${x0},${y1}Z`;
};

/** How the bands look at time t. straight: 0 = real zones, 1 = straight strips. */
const state = (t: number) => {
  // the hook: real zones sweep in left to right; dimmed while the clock plays; gone by Greenwich
  const hook = window4(t, 0.25, C.n24_1 + 0.2, C.subah1, SC.greenwich);
  const sweep = ramp(t, 0.25, C.n24_1 + 0.4, inOut);
  // offsets and the what-if: straight strips, one by one from 0 eastward then westward
  const strips = window4(t, SC.offsets, SC.offsets + 0.3, SC.mirzapur + 0.8, SC.mirzapur + 1.4);
  // the fix: straight strips bend onto the real zones; real zones stay (dim) through France
  const fix = window4(t, SC.borders, SC.borders + 0.3, SC.china - 0.3, SC.china);
  const morph = ramp(t, C.seema7 - 0.1, C.mod7 + 0.15, inOut);
  return { hook, sweep, strips, fix, morph };
};

/** Which straight strips are showing during the offsets beat (0 first, then east, then west). */
const stripOn = (t: number, n: number) => {
  if (t > SC.india - 0.3) return 1;
  if (n === 0) return ramp(t, C.zero2, C.zero2 + 0.3, easeOut);
  if (n > 0) {
    const t0 = n <= 3 ? [C.p1_3, C.p2_3, C.p3_3][n - 1] : C.p3_3 + 0.1 + (n - 3) * 0.08;
    return ramp(t, t0 - 0.05, t0 + 0.2, easeOut);
  }
  const k = -n;
  const t0 = k <= 2 ? [C.m1_3, C.m2_3][k - 1] : C.m2_3 + 0.1 + (k - 2) * 0.08;
  return ramp(t, t0 - 0.05, t0 + 0.2, easeOut);
};

const FRANCE = new Set(GEO.france_zones.map((f) => f.zone));

export const ZoneBands: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const st = state(t);
  const realA = Math.max(st.hook, st.fix * st.morph);
  const straightA = Math.max(st.strips, st.fix * (1 - st.morph));
  if (realA <= 0.002 && straightA <= 0.002 && t < SC.greenwich) return null;
  const s = pxPerM(c);
  // the hook sweep: a clip that opens from the west edge of the sheet to the east
  const [sx0] = project(c, xOfLon(-180), 0);
  const [sx1] = project(c, xOfLon(180), 0);
  const sweepX = lerp(sx0, sx1, t < SC.greenwich ? st.sweep : 1);
  // France's 12 zones light up one by one on "12"
  const fr = window4(t, C.n12_8 - 0.6, C.n12_8 - 0.3, SC.china - 0.4, SC.china);
  const shimmer = ((t * 0.18) % 1.4) - 0.2;
  return (
    <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <clipPath id="tzsweep"><rect x={-4000} y={-4000} width={Math.max(0, sweepX + 4000)} height={12000} /></clipPath>
        <linearGradient id="tzglass" gradientUnits="userSpaceOnUse" x1={lerp(sx0, sx1, shimmer)} y1={0} x2={lerp(sx0, sx1, shimmer + 0.12)} y2={400}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.22} /><stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {realA > 0.002 && (
        <g clipPath="url(#tzsweep)" opacity={realA}>
          {GEO.zones.map((z, i) => {
            const d = ringsD(c, z.rings);
            const lit = FRANCE.has(z.zone) ? clamp01(ramp(t, C.n12_8 - 0.6 + [...FRANCE].sort((a, b) => a - b).indexOf(z.zone) * 0.09, C.n12_8 - 0.4 + [...FRANCE].sort((a, b) => a - b).indexOf(z.zone) * 0.09, easeOut)) * fr : 0;
            const dim = t > C.sabse8 - 0.2 && t < SC.china ? 0.45 : 1;
            return (
              <g key={i}>
                <path d={d} fill={lit > 0 ? '#FFB45C' : zoneColor(z.zone)} fillOpacity={(0.34 + 0.36 * lit) * (lit > 0 ? 1 : dim)} />
                <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55 + 0.35 * lit} strokeWidth={Math.max(1.2, Math.min(3, s * 9e4)) + lit * 3} strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
      )}
      {straightA > 0.002 && (
        <g opacity={straightA}>
          {Array.from({ length: 25 }, (_, k) => k - 12).map((n) => {
            const on = t < SC.borders ? stripOn(t, n) : 1;
            if (on <= 0.001) return null;
            const d = bandD(c, n);
            return (
              <g key={n} opacity={on}>
                <path d={d} fill={zoneColor(n)} fillOpacity={0.36} />
                <path d={d} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={2.2} />
              </g>
            );
          })}
          {/* the what-if: one glass-like light sweep across all the strips */}
          {t > C.socho4 && t < SC.mirzapur + 1 && (
            <rect x={sx0} y={project(c, 0, TOP)[1]} width={sx1 - sx0} height={project(c, 0, BOT)[1] - project(c, 0, TOP)[1]} fill="url(#tzglass)" />
          )}
        </g>
      )}
    </svg>
  );
};

/** The yellow offset labels along the top of the sheet (+1 … +12, −1 … −12), popping in with their strips. */
export const OffsetRow: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const st = state(t);
  const a = Math.max(st.strips, st.hook * 0.9, st.fix * 0.9);
  if (a <= 0.01) return null;
  const y0 = toScreen(c, merc(0, 80))[1];
  const y = Math.max(78, y0 + 34);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - 34, height: 68, background: 'linear-gradient(180deg, rgba(10,20,60,0.55), rgba(10,20,60,0.25))', opacity: a }} />
      {Array.from({ length: 25 }, (_, k) => k - 12).map((n) => {
        const on = t < SC.borders && st.strips > 0 ? stripOn(t, n) : 1;
        const [x] = toScreen(c, [xOfLon(n * 15), merc(0, 80)[1]]);
        if (x < -60 || x > 1140 || on <= 0.01) return null;
        const sc = clamp01(pop(t, n === 0 ? C.zero2 : n > 0 ? (n <= 3 ? [C.p1_3, C.p2_3, C.p3_3][n - 1] : C.p3_3 + 0.1 + (n - 3) * 0.08) : (-n <= 2 ? [C.m1_3, C.m2_3][-n - 1] : C.m2_3 + 0.1 + (-n - 2) * 0.08), 9, 280));
        const bob = Math.sin(t * 3 + n) * 3;
        const zero = n === 0;
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${t < SC.borders && st.strips > 0 ? sc : 1})`, opacity: a,
            fontFamily: NUM, fontSize: zero ? 40 : 36, color: zero ? '#fff' : '#FFE53B', background: zero ? '#2F63FF' : 'transparent', borderRadius: 8, padding: zero ? '0 10px' : 0,
            textShadow: '0 3px 6px rgba(0,0,0,0.7)', WebkitTextStroke: '2px #2a1d00', paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>
            {n !== 0 && <span style={{ fontFamily: "'TZBaloo', sans-serif", fontWeight: 800, fontSize: '1.2em', marginRight: 1, verticalAlign: '-0.04em' }}>{n > 0 ? '+' : '−'}</span>}
            {n === 0 ? '0' : Math.abs(n)}
          </div>
        );
      })}
    </>
  );
};

/** A meridian drawn top to bottom with a glowing spark at the tip (Greenwich in red, IST 82.5°E in yellow). */
export const Meridian: React.FC<{ c: Cam; t: number; lon: number; t0: number; t1: number; color: string; width?: number; band?: number; dur?: number }> = ({ c, t, lon, t0, t1, color, width = 7, band = 0, dur = 0.7 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.3, t1);
  if (a <= 0) return null;
  const draw = ramp(t, t0, t0 + dur, inOut);
  const [x, ytop] = project(c, xOfLon(lon), TOP);
  const [, ybot] = project(c, xOfLon(lon), BOT);
  const y = lerp(ytop, ybot, draw);
  const bw = band * (xOfLon(7.5) * pxPerM(c));
  const pulse = 0.75 + 0.25 * Math.sin(t * 6);
  return (
    <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      {bw > 0.5 && (
        <>
          <rect x={x - bw} y={ytop} width={bw * 2} height={ybot - ytop} fill="#2F63FF" fillOpacity={0.32} />
          <line x1={x - bw} y1={ytop} x2={x - bw} y2={ybot} stroke="#fff" strokeWidth={3} strokeOpacity={0.85} />
          <line x1={x + bw} y1={ytop} x2={x + bw} y2={ybot} stroke="#fff" strokeWidth={3} strokeOpacity={0.85} />
        </>
      )}
      <line x1={x} y1={ytop} x2={x} y2={y} stroke={color} strokeWidth={width * 4} strokeOpacity={0.35 * pulse} style={{ filter: 'blur(10px)' }} />
      <line x1={x} y1={ytop} x2={x} y2={y} stroke={color} strokeWidth={width} />
      <line x1={x} y1={ytop} x2={x} y2={y} stroke="#fff" strokeWidth={width * 0.35} strokeOpacity={0.9} />
      {draw < 1 && <circle cx={x} cy={y} r={width * 2.6} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 6px #fff)` }} />}
    </svg>
  );
};

export { linear };
