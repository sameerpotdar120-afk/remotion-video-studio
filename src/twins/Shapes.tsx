import React from 'react';
import { clamp01, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, Cam, GEO, P, PLANE, THAI_TWIN, project, pxPerM } from './cam';

/** Pair colours: bold and saturated, one warm and one cool per pair so the twins read apart. */
export const PAIR = {
  thailand: '#FFC93C', myanmar: '#B67CFF', benin: '#FFC93C', togo: '#FF5468',
  italy: '#3EE6A0', vietnam: '#B67CFF', norway: '#3DDC4A', chile: '#FF3B30',
};
type Key = keyof typeof PAIR;

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');

/** How a shape is posed: a = visible, lift = raised off the map, d = offset in metres, s = scale, rot in degrees.
 *  anchor: the point it scales and turns about (metres). */
type Pose = { a: number; lift?: number; dx?: number; dy?: number; sx?: number; sy?: number; rot?: number; anchor?: P; pulse?: number; ghost?: boolean };

const Shape: React.FC<{ c: Cam; k: Key; p: Pose; t: number; main?: boolean; deco?: boolean; children?: (ax: number, ay: number, s: number) => React.ReactNode }> = ({ c, k, p, t, main, deco, children }) => {
  if (p.a <= 0.001) return null;
  const g = GEO.c[k];
  const d = pathD(c, main ? g.main : g.rings);
  const s = pxPerM(c);
  const an = p.anchor ?? g.centre;
  const [ax, ay] = project(c, an[0], an[1]);
  const tx = ax + (p.dx ?? 0) * s, ty = ay - (p.dy ?? 0) * s;
  const lift = p.lift ?? 0;
  const pl = 1 + 0.06 * lift + (p.pulse ?? 0);
  const tf = `translate(${tx.toFixed(1)},${ty.toFixed(1)}) rotate(${(p.rot ?? 0).toFixed(2)}) scale(${((p.sx ?? 1) * pl).toFixed(4)},${((p.sy ?? 1) * pl).toFixed(4)}) translate(${-ax},${-ay})`;
  const col = PAIR[k];
  const draw = Math.min(1, p.a * 1.2);
  const id = `g_${k}${p.ghost ? 'x' : ''}`;
  if (deco) return <g style={{ opacity: Math.min(1, p.a * 1.5) }}><g transform={tf}>{children && children(ax, ay, s)}</g></g>;
  return (
    <g style={{ opacity: Math.min(1, p.a * 1.5) }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="0.22" stopColor={col} />
          <stop offset="1" stopColor={col} stopOpacity={0.82} />
        </linearGradient>
      </defs>
      {lift > 0.01 && (
        <g transform={`translate(${18 * lift},${34 * lift})`}>
          <path d={d} transform={tf} fill="#000" fillOpacity={0.45 * lift} style={{ filter: 'blur(10px)' }} />
        </g>
      )}
      <g transform={tf}>
        <path d={d} fill="none" stroke={col} strokeWidth={34} strokeOpacity={0.32} strokeLinejoin="round" style={{ filter: 'blur(14px)' }} vectorEffect="non-scaling-stroke" />
        <path d={d} fill={p.ghost ? 'none' : `url(#${id})`} fillOpacity={p.ghost ? 0 : lerp(0.5, 0.95, lift) * draw} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={p.ghost ? 5 : 4} strokeLinejoin="round" pathLength={1} strokeDasharray={p.ghost ? undefined : `${draw} 1`}
          strokeOpacity={0.95} vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray="0.05 0.95" strokeDashoffset={-((t * 0.25) % 1)}
          vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 10px ${col}) drop-shadow(0 0 4px #fff)` }} />
      </g>
    </g>
  );
};

const G = GEO.c;
const off = (from: P, to: P) => ({ dx: to[0] - from[0], dy: to[1] - from[1] });

/** Cartoon eyes that look sideways and blink. */
const Eyes: React.FC<{ x: number; y: number; r: number; look: number; t: number; t0: number }> = ({ x, y, r, look, t, t0 }) => {
  const s = clamp01(pop(t, t0, 9, 240));
  if (s <= 0.01) return null;
  const blink = (t - t0) % 2.6 > 2.45 ? 0.12 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * r * 1.15},0)`}>
          <ellipse rx={r} ry={r * 1.25 * blink} fill="#fff" stroke="#111" strokeWidth={r * 0.14} />
          <circle cx={look * r * 0.38} cy={r * 0.12} r={r * 0.48 * Math.min(1, blink * 3)} fill="#111" />
          <circle cx={look * r * 0.38 - r * 0.16} cy={-r * 0.08} r={r * 0.14} fill="#fff" />
        </g>
      ))}
    </g>
  );
};

/** One arm over the neighbour's shoulder: a thick white curve with a round hand. */
const Arm: React.FC<{ x0: number; y0: number; x1: number; y1: number; w: number; p: number }> = ({ x0, y0, x1, y1, w, p }) => {
  if (p <= 0.01) return null;
  const ex = lerp(x0, x1, p), ey = lerp(y0, y1, p) - Math.sin(p * Math.PI) * w * 1.2;
  const cx = (x0 + ex) / 2, cy = Math.min(y0, ey) - w * 2.2;
  return (
    <g>
      <path d={`M${x0},${y0} Q${cx},${cy} ${ex},${ey}`} fill="none" stroke="#111" strokeWidth={w * 1.35} strokeLinecap="round" />
      <path d={`M${x0},${y0} Q${cx},${cy} ${ex},${ey}`} fill="none" stroke="#fff" strokeWidth={w} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={w * 0.95} fill="#fff" stroke="#111" strokeWidth={w * 0.25} />
    </g>
  );
};

/** Togo's coastline (the southern edge of the main shape): the measuring line runs west to east along it. */
const coast = (() => {
  const r = G.togo.main[0];
  const yMin = Math.min(...r.map((p) => p[1]));
  const low = r.filter((p) => p[1] < yMin + 22000);
  const w = low.reduce((a, b) => (b[0] < a[0] ? b : a)), e = low.reduce((a, b) => (b[0] > a[0] ? b : a));
  return { w, e };
})();
export const TOGO_COAST = coast;

/** The mirror between Norway and Chile: a line halfway between their centres, so Norway's reflection lands on Chile's latitude. */
export const MIRROR_Y = (G.norway.centre[1] + G.chile.centre[1]) / 2;
/** Norway and Chile are thin at world scale, so they lift out at this size. */
export const BIG = 1.7;

export const ShapeLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  // ---------------------------------------------------------------- hook: Italy with Vietnam's copy beside it, then the world
  const hookOut = ramp(t, C.maps1 + 0.1, C.maps1 + 1.0, inOut);
  const vnHook = off(G.vietnam.centre, [G.italy.centre[0] + 1.05e6, G.italy.centre[1] - 0.05e6]);
  const flash = (i: number) => window4(t, C.judwa2 - 0.1 + i * 0.09, C.judwa2 + 0.05 + i * 0.09, C.pehla3 - 0.25, C.pehla3 + 0.05);
  const hookItaly = Math.max(1 - ramp(t, C.notice1, C.notice1 + 0.5, linear), flash(4));
  const hookViet = t < C.notice1 + 0.6 ? 1 - ramp(t, C.notice1, C.notice1 + 0.5, linear) : flash(5);

  // ---------------------------------------------------------------- 1: Thailand flips and stands beside Myanmar
  const p1out = 1 - ramp(t, C.doosra5 - 0.1, C.doosra5 + 0.35, linear);
  const thA = Math.max(ramp(t, C.thai3 - 0.1, C.thai3 + 0.3, linear) * p1out, flash(0));
  const myA = Math.max(ramp(t, C.myan3 - 0.1, C.myan3 + 0.3, linear) * p1out, flash(1));
  const flip = ramp(t, C.palat4, C.palat4 + 0.55, inOut);
  const thLift = ramp(t, C.thai4, C.thai4 + 0.35, easeOut) * (1 - 0.6 * ramp(t, C.samne4 + 0.5, C.samne4 + 0.9, inOut));
  const slide = ramp(t, C.samne4 - 0.25, C.samne4 + 0.6, inOut);
  const th2 = off(G.thailand.centre, THAI_TWIN);
  const stamp = (t0: number) => kick(t, t0, 0.07, 26, 8);
  const sameKick = stamp(C.same4 + 0.25) + stamp(C.saanche4 + 0.05);

  // ---------------------------------------------------------------- 2: Benin and Togo, shoulder to shoulder
  const p2out = 1 - ramp(t, C.teesra7 - 0.1, C.teesra7 + 0.35, linear);
  const bnA = Math.max(ramp(t, C.benin5 - 0.1, C.benin5 + 0.3, linear) * p2out, flash(2));
  const tgA = Math.max(ramp(t, C.togo5 - 0.1, C.togo5 + 0.3, linear) * p2out, flash(3));
  const settle = ramp(t, C.suno6 - 0.1, C.togo6 + 0.3, inOut);
  const lift2 = ramp(t, C.kandhe6 - 0.2, C.kandhe6 + 0.25, easeOut) * (1 - settle);
  const tall = ramp(t, C.lambe6 - 0.1, C.lambe6 + 0.35, easeOut) * (1 - settle);
  const thin = ramp(t, C.patle6 - 0.1, C.patle6 + 0.35, easeOut) * (1 - settle);
  const wob = kick(t, C.lambe6 + 0.3, 0.05, 20, 6) + kick(t, C.patle6 + 0.3, 0.05, 20, 6);
  const arms = ramp(t, C.kandhe6 + 0.15, C.kandhe6 + 0.65, easeOut) * (1 - settle);
  const bt = (k: 'benin' | 'togo'): Pose => {
    const g = G[k];
    return { a: k === 'benin' ? bnA : tgA, lift: lift2, sy: 1 + 0.24 * tall + wob, sx: 1 - 0.26 * thin - wob * 0.6, anchor: [g.centre[0], g.bbox[1]] };
  };

  // ---------------------------------------------------------------- 3: Italy and Vietnam
  const p3out = 1 - ramp(t, C.asli9 - 0.1, C.asli9 + 0.4, linear);
  const itA = t < C.teesra7 ? hookItaly : ramp(t, C.italy7 - 0.15, C.italy7 + 0.25, linear) * p3out;
  const vnA = t < C.teesra7 ? hookViet : ramp(t, C.vietnam8 - 0.15, C.vietnam8 + 0.25, linear) * p3out;
  const kickRot = t > C.laat8 - 0.15 ? -9 * Math.sin(clamp01((t - C.laat8 + 0.15) / 0.35) * Math.PI) : 0;

  // ---------------------------------------------------------------- 4: Norway and Chile, and the mirror
  const p4 = (t0: number) => ramp(t, t0 - 0.1, t0 + 0.3, linear);
  const up = kick(t, C.upar11 + 0.05, 0.08, 18, 6), down = kick(t, C.neeche11 + 0.05, 0.08, 18, 6);
  const mir = ramp(t, C.aaina11 + 0.1, C.aaina11 + 0.75, inOut), mirSlide = ramp(t, C.aaina11 + 0.6, C.to12 + 0.1, inOut);
  const [nx, ny] = G.norway.centre;
  const big = ramp(t, C.norway10 + 0.1, C.norway10 + 0.6, easeOut), bigC = ramp(t, C.chile10 + 0.1, C.chile10 + 0.6, easeOut);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {/* hook */}
      <Shape c={c} k="italy" t={t} p={{ a: itA, lift: t < C.teesra7 ? 1 - hookOut : 0.35 * ramp(t, C.boot7, C.boot7 + 0.3), rot: kickRot, anchor: [G.italy.centre[0], G.italy.bbox[3]] }} />
      <Shape c={c} k="vietnam" t={t} p={{ a: vnA, lift: t < C.teesra7 ? 1 - hookOut : 0.35 * ramp(t, C.boot8, C.boot8 + 0.3),
        dx: t < C.teesra7 ? vnHook.dx * (1 - hookOut) : 0, dy: t < C.teesra7 ? vnHook.dy * (1 - hookOut) : 0 }} />
      {/* 1 */}
      <Shape c={c} k="myanmar" t={t} p={{ a: myA, pulse: sameKick + kick(t, C.myan4, 0.05, 18, 7) }} />
      <Shape c={c} k="thailand" t={t} p={{ a: thA, lift: thLift, sx: Math.cos(flip * Math.PI) * (1 + 0.1 * Math.sin(flip * Math.PI)), sy: 1 + 0.1 * Math.sin(flip * Math.PI),
        dx: th2.dx * slide, dy: th2.dy * slide, pulse: sameKick, rot: Math.sin(slide * Math.PI) * -4 }} />
      {/* 2 */}
      <Shape c={c} k="togo" t={t} main p={bt('togo')} />
      <Shape c={c} k="benin" t={t} main p={bt('benin')} />
<Shape c={c} k="togo" t={t} main deco p={bt('togo')}>
        {(ax, ay, k) => {
          const g = G.togo, h = (g.bbox[3] - g.bbox[1]) * k;
          const ex = ax - 0.005e6 * k, ey = ay - h * 0.78;
          return (
            <>
              <Eyes x={ex} y={ey} r={0.02e6 * k} look={1} t={t} t0={C.kandhe6 - 0.1} />
              <Arm x0={ax + 0.03e6 * k} y0={ay - h * 0.62} x1={ax + 0.2e6 * k} y1={ay - h * 0.74} w={0.013e6 * k} p={arms} />
            </>
          );
        }}
      </Shape>
      <Shape c={c} k="benin" t={t} main deco p={bt('benin')}>
        {(ax, ay, k) => {
          const g = G.benin, h = (g.bbox[3] - g.bbox[1]) * k;
          const ex = ax - 0.01e6 * k, ey = ay - h * 0.82;
          return (
            <>
              <Eyes x={ex} y={ey} r={0.019e6 * k} look={-1} t={t} t0={C.kandhe6} />
              <Arm x0={ax - 0.05e6 * k} y0={ay - h * 0.56} x1={ax - 0.19e6 * k} y1={ay - h * 0.66} w={0.014e6 * k} p={arms} />
            </>
          );
        }}
      </Shape>
      {/* 3 is above (italy / vietnam) */}
      {/* 4 */}
      <Shape c={c} k="norway" t={t} main p={{ a: Math.max(p4(C.norway10), flash(6)), lift: big, sx: 1 + (BIG - 1) * big, sy: 1 + (BIG - 1) * big, pulse: up }} />
      <Shape c={c} k="chile" t={t} main p={{ a: Math.max(p4(C.chile10), flash(7)), lift: bigC, sx: 1 + (BIG - 1) * bigC, sy: 1 + (BIG - 1) * bigC, pulse: down }} />
      {/* the mirror: Norway's reflection across the line, then it slides west onto Chile */}
      {mir > 0 && (
        <Shape c={c} k="norway" t={t} main p={{ a: mir * 0.95, ghost: true, sx: BIG, sy: BIG * lerp(1, -1, mir), dy: (2 * MIRROR_Y - ny - ny) * mir, dx: (G.chile.centre[0] - nx) * mirSlide }} />
      )}
      {/* the mirror line */}
      {window4(t, C.aaina11 - 0.1, C.aaina11 + 0.25, 99, 100) > 0 && (() => {
        const a = ramp(t, C.aaina11 - 0.1, C.aaina11 + 0.25, easeOut);
        const [x0, y] = project(c, -1.2e7, MIRROR_Y), [x1] = project(c, 0.7e7, MIRROR_Y);
        const sweep = ((t - C.aaina11) * 0.7) % 1;
        return (
          <g opacity={a}>
            <line x1={x0} y1={y} x2={lerp(x0, x1, a)} y2={y} stroke="#BFF4FF" strokeWidth={26} strokeOpacity={0.35} style={{ filter: 'blur(10px)' }} />
            <line x1={x0} y1={y} x2={lerp(x0, x1, a)} y2={y} stroke="#fff" strokeWidth={5} style={{ filter: 'drop-shadow(0 0 10px #8FE9FF)' }} />
            <circle cx={lerp(x0, x1, sweep)} cy={y} r={16} fill="#fff" style={{ filter: 'blur(4px) drop-shadow(0 0 14px #fff)' }} />
          </g>
        );
      })()}
      {/* Togo's coast: a measuring line drawn west to east */}
      {(() => {
        const a = window4(t, C.n56 - 0.7, C.n56 - 0.5, C.teesra7 - 0.2, C.teesra7 + 0.1);
        if (a <= 0) return null;
        const p = ramp(t, C.n56 - 0.6, C.n56 + 0.2, inOut);
        const [x0, y0] = project(c, coast.w[0], coast.w[1] - 4000), [x1, y1] = project(c, coast.e[0], coast.e[1] - 4000);
        const ex = lerp(x0, x1, p), ey = lerp(y0, y1, p);
        return (
          <g opacity={a}>
            <line x1={x0} y1={y0} x2={ex} y2={ey} stroke="#FFD84A" strokeWidth={22} strokeOpacity={0.3} style={{ filter: 'blur(8px)' }} />
            <line x1={x0} y1={y0} x2={ex} y2={ey} stroke="#FFD84A" strokeWidth={9} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #FFD84A)' }} />
            {[0, 1].map((i) => <line key={i} x1={i ? ex : x0} y1={(i ? ey : y0) - 26} x2={i ? ex : x0} y2={(i ? ey : y0) + 26} stroke="#fff" strokeWidth={7} strokeLinecap="round" />)}
          </g>
        );
      })()}
    </svg>
  );
};

