import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, FX, FY, GEO, GH, GW, LOOPF, P, PERSP, PY, camAt, merc, pathD, project, shake, toG } from './cam';
import { Badge, FlagId } from './Flags';
import { Grade } from './Fx';
import { LABEL, TITLE, UI, useFonts } from './font';
import sizes from '../../../public/hormuz/img/img_sizes.json';

export const HZ_DURATION_S = DURATION_S;
/** The strait at its narrowest: 21 nautical miles, about 39 km (Quoin islands to Larak). */
const WIDTH_KM = 39;
const AUDIO = 'hormuz/audio/mix.wav';
const IMG = (k: string) => staticFile(`hormuz/img/${k}.png`);
const SZ = sizes as unknown as Record<string, { w: number; h: number }>;
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const INK = '#0B1830';
const COL = { ir: '#7BE04A', om: '#3FD46A', ae: '#FF4D5E', sa: '#C9A15A', in: '#FF9933', lane: '#FF2E4D', gold: '#FFC21A', hajar: '#33B8FF', pipe: '#FFB020', sign: '#1F7A4D' };
/** The slab's side colour: the fill darkened. */
const shade = (hex: string) => { const n = parseInt(hex.slice(1), 16); const f = 0.45; return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; };
const roll = (t: number, t0: number, n: number, d = 0.9) => n * easeOut(ramp(t, t0, t0 + d, linear));

// ------------------------------------------------------------------ the ground plane: plates under the camera
const ORDER = ['wide', 'gulf', 'musandam'];
const SRC = (n: string) => staticFile(`hormuz/maps/${n}_geo.jpg`);
const native = (n: string) => { const p = GEO.plates[n]; return (p.bounds[2] - p.bounds[0]) / p.w; };
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('hz plates'));
  React.useEffect(() => {
    if (!preloaded) preloaded = Promise.all([...ORDER.map(SRC), ...ORDER.map((n) => staticFile(`hormuz/maps/${n}_atlas.jpg`))].map((u) => { const i = new Image(); i.src = u; return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};
const FEATHER = 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent), linear-gradient(180deg, transparent, #000 5%, #000 95%, transparent)';
/** Two pre-graded sets of the same plates (satellite, and the desaturated "atlas" made by the builder), crossfaded by
 *  opacity: no live CSS filter on the big ground layer. */
const SRCA = (n: string) => staticFile(`hormuz/maps/${n}_atlas.jpg`);
const Plates: React.FC<{ c: Cam; atlas: number }> = ({ c, atlas }) => {
  usePreload();
  const sets: [(n: string) => string, number][] = [[SRC, 1 - atlas], [SRCA, atlas]];
  // the finest plate that is fully opaque and covers the whole ground box hides everything coarser
  const rectOf = (n: string) => { const [b0, b1, b2, b3] = GEO.plates[n].bounds; const [l, tp] = toG(c, [b0, b3]), [r, bt] = toG(c, [b2, b1]); return [l, tp, r, bt]; };
  const opac = (n: string, i: number) => (i === 0 ? 1 : Math.min(1, Math.max(0, (native(n) * 9 - c.mpp) / (native(n) * 4))));
  let floor = 0;
  ORDER.forEach((n, i) => { const [l, tp, r, bt] = rectOf(n); if (opac(n, i) >= 1 && l <= 0 && tp <= 0 && r >= GW && bt >= GH) floor = i; });
  if (atlas > 0.999) sets[0][1] = 0;
  if (atlas < 0.001) sets[1][1] = 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: GW, height: GH, background: atlas > 0.5 ? '#80878A' : '#0E3A57' }}>
      {sets.map(([src, so], si) => so <= 0.001 ? null : ORDER.map((n, i) => {
        if (i < floor) return null;
        const [b0, b1, b2, b3] = GEO.plates[n].bounds;
        const [l, tp] = toG(c, [b0, b3]), [r, bt] = toG(c, [b2, b1]);
        const w = r - l, h = bt - tp;
        if (l > GW || tp > GH || l + w < 0 || tp + h < 0) return null;
        const k = native(n);
        const o = i === 0 ? 1 : Math.min(1, Math.max(0, (k * 9 - c.mpp) / (k * 4)));
        if (o <= 0) return null;
        const size = `${w}px ${h}px`, pos = `${l}px ${tp}px`;
        return <div key={`${si}${n}`} style={{ position: 'absolute', inset: 0, opacity: o * (si === 1 ? so : 1), backgroundImage: `url(${src(n)})`, backgroundSize: size, backgroundPosition: pos, backgroundRepeat: 'no-repeat',
          ...(i ? { WebkitMaskImage: FEATHER, WebkitMaskSize: size, WebkitMaskPosition: pos, WebkitMaskRepeat: 'no-repeat', maskImage: FEATHER, maskSize: size, maskPosition: pos, maskRepeat: 'no-repeat' } : {}) }} />;
      }))}
    </div>
  );
};

/** A raised slab: the shape extruded h ground px up (darker side layers, then the glossy top). Only its bounding box
 *  is painted, so deep zooms stay cheap. dx, dy shift it on the ground (ground px). */
const Slab: React.FC<{ c: Cam; rings: P[][]; color: string; t: number; id: string; g?: number; h?: number; dx?: number; dy?: number; alpha?: number; clip?: P[]; layers?: number }> = ({ c, rings, color, t, id, g = 1, h = 14, dx = 0, dy = 0, alpha = 0.72, clip, layers = 4 }) => {
  if (g <= 0.01) return null;
  const pts = rings.flat().map((p) => toG(c, p));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const pad = 40;
  x0 = Math.max(-pad, x0 - pad); y0 = Math.max(-pad, y0 - pad); x1 = Math.min(GW + pad, x1 + pad); y1 = Math.min(GH + pad, y1 + pad);
  if (x1 <= x0 || y1 <= y0) return null;
  const d = rings.map((r) => r.map((p, i) => { const [x, y] = toG(c, p); return `${i ? 'L' : 'M'}${(x - x0).toFixed(1)},${(y - y0).toFixed(1)}`; }).join('') + 'Z').join('');
  const H = h * easeOut(clamp01(g));
  const N = layers;
  const cd = clip ? clip.map((p, i) => { const [x, y] = toG(c, p); return `${i ? 'L' : 'M'}${(x - x0).toFixed(1)},${(y - y0).toFixed(1)}`; }).join('') + 'Z' : '';
  const cid = `cl_${id}`;
  const cp = clip ? `url(#${cid})` : undefined;
  const cdef = clip ? <defs><clipPath id={cid}><path d={cd} /></clipPath></defs> : null;
  const box: React.CSSProperties = { position: 'absolute', left: x0 + dx, top: y0 + dy, width: x1 - x0, height: y1 - y0, transformStyle: 'preserve-3d' };
  return (
    <div style={box}>
      {Array.from({ length: N }, (_, k) => (
        <svg key={k} width={x1 - x0} height={y1 - y0} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translateZ(${(H * k) / N}px)` }}>
          {cdef}
          <g clipPath={cp}>
            {k === 0 && <path d={d} fill="#000" opacity={0.3 * g} transform="translate(12 16)" />}
            <path d={d} fill={shade(color)} opacity={0.9 * Math.min(1, g * 1.5)} />
          </g>
        </svg>
      ))}
      <svg width={x1 - x0} height={y1 - y0} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translateZ(${H}px)` }}>
        <defs><linearGradient id={`gl_${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.32" /><stop offset="0.6" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        {cdef}
        <g clipPath={cp} opacity={Math.min(1, g * 1.4)}>
          <path d={d} fill={color} opacity={alpha * (1 + 0.07 * Math.sin(t * LOOPF(40) + id.length))} />
          <path d={d} fill={`url(#gl_${id})`} />
          <path d={d} fill="none" stroke={color} strokeWidth={12} opacity={0.35 + 0.15 * Math.sin(t * LOOPF(53) + id.length)} />
          <path d={d} fill="none" stroke="#fff" strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
};

/** Text laid flat on the ground (country and sea names), like the reference's atlas. */
const GroundText: React.FC<{ c: Cam; at: P; text: string; size: number; o?: number; font?: string; color?: string; rot?: number; spacing?: number }> = ({ c, at, text, size, o = 1, font = "'Courier New', monospace", color = '#F2EBDD', rot = 0, spacing = 6 }) => {
  if (o <= 0) return null;
  const [x, y] = toG(c, at);
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: o, fontFamily: font, fontWeight: 700, fontSize: size, letterSpacing: spacing, color, whiteSpace: 'nowrap', textShadow: '0 2px 0 rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.35)' }}>{text}</div>;
};

/** A line on the ground drawn to fraction p (glowing). */
const lineTo = (c: Cam, pts: P[], p: number): P[] => {
  if (p >= 1) return pts;
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = L[L.length - 1] * Math.max(0, p);
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= target) { out.push(pts[i]); continue; }
    const f = (target - L[i - 1]) / (L[i] - L[i - 1]);
    out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]);
    break;
  }
  return out;
};
const pointAt = (pts: P[], p: number): [P, number] => {
  const s = lineTo(null as unknown as Cam, pts, p);
  const a = s[s.length - 2] ?? pts[0], b = s[s.length - 1];
  return [b, Math.atan2(b[1] - a[1], b[0] - a[0])];
};

const GroundLayer: React.FC<{ t: number; c: Cam; atlas: number }> = ({ t, c, atlas }) => {
  const s = (lon: number, lat: number) => merc(lon, lat);
  // --- which highlights are on
  const musandamAct = win(t, C.map + 0.2, C.par + 0.3, 0.6, 0.5) + win(t, C.upar - 0.3, C.sab + 0.6, 0.5, 0.6);
  const indiaOn = win(t, C.bharat - 0.2, C.map + 0.6, 0.5, 0.6);
  const hajar = ramp(t, C.hajar - 0.2, C.hajar + 1.4, inOut) * (1 - ramp(t, C.upar, C.upar + 0.6, linear));
  const iranOn = win(t, C.yehai, C.bharat + 0.4, 0.6, 0.6);
  const split = ramp(t, C.kat - 0.25, C.kat + 0.6, inOut) * (1 - ramp(t, C.to3 - 0.2, C.to3 + 0.4, linear));
  const pipes = t > C.saudi - 0.3 && t < C.baaki + 0.6;
  const lanes = 1 - ramp(t, C.bharat + 0.2, C.bharat + 0.8, linear) * (1 - ramp(t, C.baaki - 0.4, C.baaki + 0.4, linear));
  const laneDraw = t < C.yehai ? 1 : ramp(t, C.yehai + 0.4, C.roz + 1.2, inOut);
  const dim = 1 - 0.75 * ramp(t, C.jahaz - 0.1, C.n49, linear) * (1 - ramp(t, C.bharat, C.map, linear)) - 0.7 * win(t, C.parh, C.baaki, 0.4, 0.8);
  const canal = ramp(t, C.canal - 0.3, C.canal + 1.0, inOut) * (1 - ramp(t, C.to3 - 0.2, C.to3 + 0.4, linear));
  const gauge = 1 - ramp(t, C.yehai - 0.4, C.yehai, linear) + ramp(t, DURATION_S - 1.2, DURATION_S - 0.2, linear);
  const barrier = ramp(t, C.band - 0.1, C.band + 0.4, inOut) * (1 - ramp(t, C.kyu, C.yehai, linear)) + ramp(t, DURATION_S - 1.2, DURATION_S - 0.2, linear) * 0;
  const sa = 0.6 * ramp(t, C.saudi - 0.3, C.saudi + 0.6, linear) * (1 - ramp(t, C.parh, C.parh + 0.6, linear));
  // the canal cuts both countries in two: the north halves slide up the ground, the south halves down
  const gap = 60 * split;
  const cn = GEO.canal.map(([x, y]) => [x, y] as P);
  const NORTH: P[] = [s(54.5, 25.95), ...cn, s(57.6, 25.55), s(57.6, 27.6), s(54.5, 27.6)];
  const SOUTH: P[] = [s(54.5, 25.95), ...cn, s(57.6, 25.55), s(57.6, 21.5), s(54.5, 21.5)];
  return (
    <>
      <svg width={GW} height={GH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter><filter id="glow2"><feGaussianBlur stdDeviation="14" /></filter></defs>
        <path d={GEO.borders.map((l) => pathD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.6} opacity={0.32 + 0.25 * atlas} />
        {/* the tanker lane through the strait */}
        {lanes > 0.01 && <g opacity={lanes * Math.max(0.15, dim)}>
          <path d={pathD(c, lineTo(c, GEO.lane, laneDraw))} fill="none" stroke={COL.lane} strokeWidth={34} opacity={0.18} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.lane, laneDraw))} fill="none" stroke={COL.lane} strokeWidth={16} opacity={0.6} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.lane, laneDraw))} fill="none" stroke="#FFD0D6" strokeWidth={5} strokeLinecap="round" />
        </g>}
        {indiaOn > 0.01 && <g opacity={indiaOn}>
          <path d={pathD(c, lineTo(c, GEO.toIndia, ramp(t, C.aadha - 0.3, C.n26a + 0.4, inOut)))} fill="none" stroke={COL.lane} strokeWidth={40} opacity={0.2} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.toIndia, ramp(t, C.aadha - 0.3, C.n26a + 0.4, inOut)))} fill="none" stroke={COL.lane} strokeWidth={20} opacity={0.65} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.toIndia, ramp(t, C.aadha - 0.3, C.n26a + 0.4, inOut)))} fill="none" stroke="#FFD0D6" strokeWidth={7} strokeLinecap="round" />
        </g>}
        {/* the 33 km gauge */}
        {gauge > 0.01 && <g opacity={Math.min(1, gauge)}>
          <path d={pathD(c, GEO.gauge)} stroke="#fff" strokeWidth={26} opacity={0.25} strokeLinecap="round" /><path d={pathD(c, GEO.gauge)} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
          <path d={pathD(c, GEO.gauge)} stroke={COL.gold} strokeWidth={8} strokeDasharray="20 10" />
          {GEO.gauge.map((p, i) => { const [x, y] = toG(c, p); return <circle key={i} cx={x} cy={y} r={14} fill="#fff" stroke={COL.gold} strokeWidth={6} />; })}
        </g>}
        {barrier > 0.01 && (() => { const [a, b] = GEO.gauge.map((p) => toG(c, p)); const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const k = 0.5 * barrier;
          return <g opacity={barrier}><path d={`M${m[0] + (a[0] - m[0]) * k * 2},${m[1] + (a[1] - m[1]) * k * 2}L${m[0] + (b[0] - m[0]) * k * 2},${m[1] + (b[1] - m[1]) * k * 2}`} stroke="#FF1E3C" strokeWidth={30} strokeLinecap="round" /><path d={`M${m[0] + (a[0] - m[0]) * k * 2},${m[1] + (a[1] - m[1]) * k * 2}L${m[0] + (b[0] - m[0]) * k * 2},${m[1] + (b[1] - m[1]) * k * 2}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeDasharray="30 18" /></g>; })()}
        {/* the canal */}
        {canal > 0.01 && <g opacity={Math.min(1, canal * 1.5)}>
          <path d={pathD(c, lineTo(c, GEO.canal, canal))} fill="none" stroke="#0B1B2E" strokeWidth={46} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.canal, canal))} fill="none" stroke="#1E4E78" strokeWidth={26} strokeLinecap="round" />
          <path d={pathD(c, lineTo(c, GEO.canal, canal))} fill="none" stroke={COL.lane} strokeWidth={6} strokeDasharray="18 12" opacity={ramp(t, C.canal + 0.6, C.persian, linear)} />
        </g>}
      </svg>
      {/* raised slabs */}
      <Slab c={c} rings={GEO.countries.Iran} color={COL.ir} t={t} id="ir" g={Math.min(1, iranOn) * 0.85} h={12} alpha={0.55} />
      <Slab c={c} rings={GEO.countries.India} color={COL.in} t={t} id="in" g={indiaOn} h={16} alpha={0.8} />
      <Slab c={c} rings={GEO.countries['Saudi Arabia']} color={COL.sa} t={t} id="sa" g={sa} h={10} alpha={0.45} />
      <Slab c={c} rings={GEO.countries['United Arab Emirates']} color={COL.ae} t={t} id="aeN" g={musandamAct} h={18} dy={-gap} alpha={0.66} clip={NORTH} />
      <Slab c={c} rings={GEO.countries['United Arab Emirates']} color={COL.ae} t={t} id="aeS" g={musandamAct} h={18} dy={gap} alpha={0.66} clip={SOUTH} />
      <Slab c={c} rings={GEO.countries.Oman} color={COL.om} t={t} id="omN" g={musandamAct} h={18} dy={-gap} alpha={0.62} clip={NORTH} />
      <Slab c={c} rings={GEO.countries.Oman} color={COL.om} t={t} id="omS" g={musandamAct} h={18} dy={gap} alpha={0.62} clip={SOUTH} />
      {hajar > 0.01 && <Slab c={c} rings={GEO.hajar} color={COL.hajar} t={t} id="hj" g={hajar} h={60} alpha={0.6} layers={3} />}
      {pipes && <svg width={GW} height={GH} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: 'translateZ(16px)' }}>
        <defs><filter id="pglow"><feGaussianBlur stdDeviation="14" /></filter></defs>
        {/* the pipelines */}
        {pipes && [[GEO.pipeSA, C.saudi - 0.2, C.redsea + 0.6], [GEO.pipeAE, C.uaep - 0.2, C.fuj + 0.5]].map(([pts, a, b], i) => {
          const d = pathD(c, lineTo(c, pts as P[], ramp(t, a as number, b as number, inOut)));
          return <g key={i}><path d={d} fill="none" stroke={COL.pipe} strokeWidth={44} opacity={0.22} strokeLinecap="round" /><path d={d} fill="none" stroke="#3A2A12" strokeWidth={16} strokeLinecap="round" /><path d={d} fill="none" stroke="#FFD27A" strokeWidth={9} strokeLinecap="round" /></g>;
        })}
      </svg>}
      {/* names on the ground */}
      <GroundText c={c} at={s(55.2, 29.6)} text="IRAN" size={c.mpp > 600 ? 120 : 64} o={clamp01((c.mpp - 70) / 200)} />
      <GroundText c={c} at={s(56.9, 22.6)} text="OMAN" size={c.mpp > 600 ? 70 : 56} o={clamp01((c.mpp - 300) / 300) * (1 - clamp01((c.mpp - 3200) / 800))} />
      <GroundText c={c} at={s(54.3, 24.0)} text="U.A.E." size={56} o={clamp01((c.mpp - 300) / 300) * (1 - clamp01((c.mpp - 3200) / 800))} />
      <GroundText c={c} at={s(45.5, 23.4)} text="SAUDI ARABIA" size={110} o={clamp01((c.mpp - 900) / 600)} />
      <GroundText c={c} at={s(51.9, 27.0)} text="Persian Gulf" size={c.mpp > 600 ? 62 : 44} font="'MSSerif', serif" spacing={2} o={clamp01((c.mpp - 70) / 200) * (1 - clamp01((c.mpp - 3000) / 600))} rot={-20} />
      <GroundText c={c} at={s(58.3, 24.9)} text="Gulf of Oman" size={c.mpp > 600 ? 62 : 44} font="'MSSerif', serif" spacing={2} o={clamp01((c.mpp - 70) / 200) * (1 - clamp01((c.mpp - 3000) / 600))} rot={-35} />
      <GroundText c={c} at={s(38.4, 21.6)} text="Red Sea" size={84} font="'MSSerif', serif" spacing={2} o={clamp01((c.mpp - 1200) / 600)} rot={-55} />
      <GroundText c={c} at={s(78.5, 21.5)} text="INDIA" size={150} o={clamp01((c.mpp - 2600) / 800)} />
      <GroundText c={c} at={s(56.32, 26.05)} text="MUSANDAM (OMAN)" size={30} o={clamp01(1 - (c.mpp - 140) / 120) * musandamAct} spacing={3} />
    </>
  );
};

/** The ground plane in 3D: a CSS perspective camera over the rotated ground (the reference's tilted map). */
const World: React.FC<{ t: number; c: Cam; atlas: number }> = ({ t, c, atlas }) => (
  <AbsoluteFill style={{ perspective: `${PERSP}px`, perspectiveOrigin: `${FX}px ${PY}px`, overflow: 'hidden', background: `linear-gradient(180deg, ${atlas > 0.5 ? '#C9C6BD' : '#D8CBB0'}, #6F6A60 40%)` }}>
    <div style={{ position: 'absolute', left: FX - GW / 2, top: FY - GH / 2, width: GW, height: GH, transformStyle: 'preserve-3d', transform: `rotateX(${c.tilt}deg) rotateZ(${c.yaw}deg)` }}>
      <Plates c={c} atlas={atlas} />
      <GroundLayer t={t} c={c} atlas={atlas} />
    </div>
    {/* distance haze, so the far ground fades like the reference's horizon */}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${atlas > 0.5 ? '150,150,146' : '196,184,160'},1) 0%, rgba(${atlas > 0.5 ? '150,150,146' : '196,184,160'},0.96) 12%, rgba(140,140,134,0.45) 22%, rgba(0,0,0,0) 34%)`, pointerEvents: 'none' }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ upright signs and props (projected)
const Sign: React.FC<{ text: React.ReactNode; size?: number; color?: string }> = ({ text, size = 48, color = COL.sign }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ padding: `${size * 0.14}px ${size * 0.45}px`, background: color, border: `${Math.max(3, size / 14)}px solid #fff`, borderRadius: size * 0.16, fontFamily: TITLE, fontSize: size, lineHeight: 1.05, color: '#fff', textAlign: 'center', letterSpacing: 1, boxShadow: '0 10px 22px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{text}</div>
    <div style={{ width: Math.max(5, size / 9), height: size * 1.2, background: 'linear-gradient(90deg, #ddd, #fff, #bbb)' }} />
  </div>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string }> = ({ text, size, color = COL.gold, font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${Math.round(size / 11)}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
/** An element standing on a ground point (anchored at its bottom centre), scaled by perspective. */
const Stand: React.FC<{ c: Cam; at: P; p?: number; o?: number; z?: number; k?: number; children: React.ReactNode }> = ({ c, at, p = 1, o = 1, z = 0, k = 1, children }) => {
  if (p <= 0 || o <= 0) return null;
  const [x, y, s] = project(c, at, z);
  if (x < -400 || x > 1480 || y < -200 || y > 2300) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${p * Math.min(1.6, s) * k})`, transformOrigin: '50% 100%', opacity: o }}>{children}</div>;
};
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
const Cut: React.FC<{ k: string; w: number; rot?: number; flip?: boolean }> = ({ k, w, rot = 0, flip }) => {
  const h = (w * SZ[k].h) / SZ[k].w;
  return <Img src={IMG(k)} style={{ width: w, height: h, display: 'block', transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.55))' }} />;
};
const Icon: React.FC<{ kind: 'shield' | 'customs' | 'helmet'; label: string }> = ({ kind, label }) => (
  <div style={{ width: 170, height: 170, clipPath: 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.6)' }}>
    <svg width={86} height={86} viewBox="-50 -50 100 100">
      {kind === 'shield' && <><path d="M0 -42 L36 -28 V2 Q36 30 0 44 Q-36 30 -36 2 V-28 Z" fill="none" stroke="#fff" strokeWidth={7} /><rect x={-11} y={-6} width={22} height={18} rx={3} fill="#fff" /><path d="M-7 -6 V-13 A7 7 0 0 1 7 -13 V-6" fill="none" stroke="#fff" strokeWidth={5} /></>}
      {kind === 'customs' && <><rect x={-30} y={-40} width={60} height={76} rx={6} fill="none" stroke="#fff" strokeWidth={7} /><path d="M-18 -18 H18 M-18 -2 H18 M-18 14 H6" stroke="#fff" strokeWidth={6} /><circle cx={24} cy={26} r={16} fill="#E0221B" stroke="#fff" strokeWidth={5} /></>}
      {kind === 'helmet' && <><path d="M-38 10 Q-38 -38 0 -38 Q38 -38 38 10 Z" fill="#4E6B3A" stroke="#fff" strokeWidth={6} /><rect x={-46} y={8} width={92} height={10} rx={5} fill="#fff" /><path d="M-20 -12 H20" stroke="#2F4424" strokeWidth={5} /></>}
    </svg>
    <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 24, color: '#fff', marginTop: 2 }}>{label}</div>
  </div>
);

const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (lon: number, lat: number) => merc(lon, lat);
  const head = 1 - ramp(t, C.band - 0.4, C.band, linear) + ramp(t, DURATION_S - 0.75, DURATION_S - 0.1, linear);
  const gm: P = [(GEO.gauge[0][0] + GEO.gauge[1][0]) / 2, (GEO.gauge[0][1] + GEO.gauge[1][1]) / 2];
  const gaugeO = 1 - ramp(t, C.yehai - 0.4, C.yehai, linear) + ramp(t, DURATION_S - 1.2, DURATION_S - 0.2, linear);
  // tankers along the lane: many before the war, a trickle after
  const thin = ramp(t, C.jahaz, C.n49, linear);
  const tankersOn = win(t, C.roz - 0.2, C.bharat + 0.3, 0.5, 0.4) + win(t, C.parh, C.baaki + 0.2, 0.4, 0.4) * 0.6;
  const tankers = Array.from({ length: 4 }, (_, i) => i).filter((i) => i === 0 || i * (1 - thin) > 0.6 || t > C.parh);
  return (
    <AbsoluteFill>
      {/* frame 0 (and the loop's end): the gap */}
      <At x={540} y={250} o={clamp01(head)}><Big text={`${WIDTH_KM} KM`} size={150} color="#fff" /></At>
      <Stand c={c} at={gm} o={clamp01(gaugeO)} k={1.0}><Sign text={<>{WIDTH_KM} KM</>} size={46} color="#1A1A1A" /></Stand>
      {t > C.band - 0.2 && t < C.kyu + 0.4 && <At x={540} y={410} p={pop(t, C.band - 0.1, 10, 220)} o={1 - ramp(t, C.kyu, C.kyu + 0.4, linear)}><Tag text="लगभग बंद" size={70} color="#FF1E3C" /></At>}
      {t > C.petrol - 0.2 && t < C.doosra + 0.2 && <At x={800} y={1180 + (1 - pop(t, C.petrol - 0.1, 11, 170)) * 900} o={1 - ramp(t, C.doosra - 0.2, C.doosra + 0.2, linear)} rot={-8}><Cut k="h02_fuel_nozzle" w={330} /></At>}
      {t > C.doosra - 0.2 && t < C.yehai && <At x={540} y={410} p={pop(t, C.doosra - 0.1, 10, 200)} o={1 - ramp(t, C.kyu + 0.2, C.yehai, linear)}><Tag text="कोई दूसरा समुद्री रास्ता?" size={56} color={COL.gold} /></At>}
      {t > C.kyu - 0.2 && t < C.yehai + 0.2 && <At x={540} y={560} p={pop(t, C.kyu - 0.1, 9, 220)} o={1 - ramp(t, C.yehai - 0.2, C.yehai + 0.2, linear)}><Big text="?" size={220} color="#fff" /></At>}
      {/* Hormuz, 2 crore barrels, a fifth */}
      <Stand c={c} at={s(56.3, 26.9)} p={pop(t, C.hormuz - 0.2, 10, 200)} o={win(t, C.hormuz - 0.3, C.bharat + 0.3, 0.2, 0.4)} k={1.1}><Sign text={<>STRAIT OF<br />HORMUZ</>} size={44} /></Stand>
      {t > C.n2cr - 0.2 && t < C.y2026 && <At x={540} y={1250} p={pop(t, C.n2cr - 0.1, 10, 200)} o={1 - ramp(t, C.y2026 - 0.3, C.y2026, linear)}><Tag text={<>~2 करोड़ बैरल / दिन</>} size={60} color={COL.lane} /></At>}
      {t > C.panch - 0.2 && t < C.y2026 && <At x={540} y={330} p={pop(t, C.panch - 0.1, 10, 200)} o={1 - ramp(t, C.y2026 - 0.3, C.y2026, linear)}><Big text="~20% दुनिया का तेल" size={84} color={COL.gold} font={UI} /></At>}
      {tankersOn > 0.01 && tankers.map((i) => {
        const ph = ((t * 0.03 + i / 4) % 1);
        const [pt, ang] = pointAt(GEO.lane, ph);
        const [x, y, sc] = project(c, pt);
        const [x2, y2] = project(c, [pt[0] + Math.cos(ang) * 5000, pt[1] + Math.sin(ang) * 5000]);
        const rot = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
        const flip = Math.abs(rot) > 90;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-60%) scale(${Math.max(0.75, Math.min(1.3, sc))})`, opacity: Math.min(1, tankersOn) }}><Cut k="h01_tanker" w={170} rot={flip ? rot - 180 : rot} flip={flip} /></div>;
      })}
      {/* 2026: the war, the collapse */}
      {t > C.y2026 - 0.2 && t < C.bharat && <At x={540} y={330} p={pop(t, C.y2026 - 0.1, 10, 200)} o={1 - ramp(t, C.bharat - 0.3, C.bharat, linear)}><Big text="2026" size={150} color="#FF4D5E" /></At>}
      {t > C.n216 - 0.2 && t < C.bharat && <FlowBars t={t} />}
      {/* India */}
      <Stand c={c} at={s(78.0, 23.0)} p={pop(t, C.bharat - 0.1, 10, 200)} o={win(t, C.bharat - 0.2, C.map + 0.4, 0.2, 0.4)} k={1.2}><Badge id="in" r={54} /></Stand>
      {t > C.aadha - 0.2 && t < C.map + 0.3 && <At x={540} y={330} p={pop(t, C.aadha - 0.1, 10, 200)} o={1 - ramp(t, C.map, C.map + 0.3, linear)}><Big text="~50% crude" size={110} color={COL.in} /></At>}
      {t > C.n26a - 0.2 && t < C.map + 0.3 && <At x={540} y={1250} p={pop(t, C.n26a - 0.1, 10, 200)} o={1 - ramp(t, C.map, C.map + 0.3, linear)}><Tag text={<>रोज़ ~{Math.round(roll(t, C.n26a - 0.1, 26))} लाख बैरल</>} size={60} color={COL.in} /></At>}
      {/* the canal idea */}
      {t > C.canal - 0.2 && t < C.par + 0.3 && <At x={540} y={330} p={pop(t, C.canal - 0.1, 10, 200)} o={1 - ramp(t, C.par, C.par + 0.3, linear)}><Tag text="Canal?" size={80} color={COL.gold} font={TITLE} /></At>}
      {/* Hajar: 700 km, ~3,000 m */}
      {t > C.n700 - 0.2 && t < C.upar && <At x={540} y={330} p={pop(t, C.n700 - 0.1, 10, 200)} o={1 - ramp(t, C.upar - 0.3, C.upar, linear)}><Big text={<>{Math.round(roll(t, C.n700 - 0.1, 700))} KM</>} size={130} color={COL.hajar} /></At>}
      <Stand c={c} at={GEO.places.jebelshams} z={70} p={pop(t, C.choti - 0.1, 10, 200)} o={win(t, C.choti - 0.2, C.upar, 0.2, 0.3)} k={1.2}><Sign text={<>⛰ {fmt(roll(t, C.choti, 3000, 1.6))} M<br /><span style={{ fontSize: 30 }}>HAJAR MOUNTAINS</span></>} size={52} color="#14506E" /></Stand>
      {/* two countries */}
      <Stand c={c} at={s(55.6, 24.9)} p={pop(t, C.uae - 0.1, 10, 200)} o={win(t, C.uae - 0.2, C.to3, 0.2, 0.4)} k={1.1}><Badge id="ae" r={60} /></Stand>
      <Stand c={c} at={s(56.25, 25.2)} p={pop(t, C.oman2 - 0.1, 10, 200)} o={win(t, C.oman2 - 0.2, C.to3, 0.2, 0.4)} k={1.1}><Badge id="om" r={60} /></Stand>
      {([['shield', 'Security', C.sec], ['customs', 'Customs', C.cus], ['helmet', 'Military', C.fauj]] as const).map(([k, l, t0], i) => (
        t > t0 - 0.2 && t < C.to3 ? <At key={k} x={250 + i * 290} y={430} p={pop(t, t0 - 0.1, 10, 200)} o={1 - ramp(t, C.to3 - 0.3, C.to3, linear)}><Icon kind={k} label={l} /></At> : null
      ))}
      {t > C.sab - 0.2 && t < C.to3 && <At x={540} y={1250} p={pop(t, C.sab - 0.1, 10, 200)} o={1 - ramp(t, C.to3 - 0.3, C.to3, linear)}><Tag text="2 हिस्से" size={70} color="#FF4D5E" /></At>}
      {/* pipelines */}
      {t > C.pipes - 0.2 && t < C.parh && <At x={540} y={300} p={pop(t, C.pipes - 0.1, 10, 200)} o={1 - ramp(t, C.parh - 0.3, C.parh, linear)}><Tag text="Pipelines" size={84} color={COL.pipe} font={TITLE} /></At>}
      <Stand c={c} at={GEO.places.yanbu} p={pop(t, C.redsea, 10, 200)} o={win(t, C.redsea - 0.1, C.parh, 0.2, 0.4)}><Sign text="YANBU" size={40} color="#7A4B0E" /></Stand>
      <Stand c={c} at={GEO.places.fujairah} p={pop(t, C.fuj, 10, 200)} o={win(t, C.fuj - 0.1, C.parh, 0.2, 0.4)}><Sign text="FUJAIRAH" size={40} color="#7A4B0E" /></Stand>
      {t > C.saudi - 0.2 && t < C.parh && <At x={560} y={1440 + (1 - pop(t, C.saudi, 11, 170)) * 800} o={1 - ramp(t, C.parh - 0.3, C.parh, linear)}><Cut k="h03_pipeline" w={540} rot={-4} /></At>}
      {/* the bypass is small */}
      {t > C.khali - 0.3 && t < C.baaki + 0.4 && <BypassBars t={t} />}
    </AbsoluteFill>
  );
};
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

const Bar: React.FC<{ h: number; color: string; label: React.ReactNode; sub: string; w?: number }> = ({ h, color, label, sub, w = 230 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: w + 60 }}>
    <div style={{ fontFamily: TITLE, fontSize: 64, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>{label}</div>
    <div style={{ width: w, height: Math.max(6, h), background: `linear-gradient(90deg, ${color}, #fff8 50%, ${color})`, borderRadius: '12px 12px 0 0', boxShadow: `0 0 30px ${color}88, 0 12px 24px rgba(0,0,0,0.5)`, border: '4px solid #fff' }} />
    <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 8, WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>{sub}</div>
  </div>
);
const FlowBars: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - ramp(t, C.bharat - 0.3, C.bharat, linear);
  const a = easeOut(ramp(t, C.n216 - 0.1, C.n216 + 0.7, linear)), b = easeOut(ramp(t, C.n49 - 0.1, C.n49 + 0.7, linear));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 700, height: 760, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 70, opacity: o }}>
      <Bar h={620 * a} color="#7C8794" label={<>{(2.16 * a).toFixed(2)} Cr</>} sub="पहले" />
      {b > 0 && <Bar h={620 * (49 / 216) * b} color="#FF2E4D" label={<>{Math.round(49 * b)} L</>} sub="2026" />}
    </div>
  );
};
const BypassBars: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, C.khali - 0.3, C.baaki + 0.4, 0.3, 0.4);
  const a = easeOut(ramp(t, C.n26b - 0.1, C.n26b + 0.7, linear)), b = easeOut(ramp(t, C.n2cr2 - 0.1, C.n2cr2 + 0.8, linear));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 560, height: 900, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 70, opacity: o }}>
      <Bar h={800 * (26 / 200) * a} color={COL.pipe} label={<>{Math.round(26 * a)} L</>} sub="pipelines" />
      {t > C.bharat2 - 0.2 && <div style={{ position: 'absolute', left: 175, top: 300, transform: `scale(${pop(t, C.bharat2 - 0.1, 10, 200)})` }}><Badge id="in" r={46} /></div>}
      {b > 0 && <Bar h={800 * b} color="#FF2E4D" label={<>{(2 * b).toFixed(1)} Cr</>} sub="Hormuz" />}
    </div>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.do + 0.1, t1: C.kat + 0.5, from: 0.0 },
  { name: 'B', t0: C.canal3 - 0.2, t1: C.saudi - 0.1, from: 3.9 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
        <OffthreadVideo src={staticFile(`hormuz/null/null_hz_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · routes approximate';

/** Atlas grade on the wide shots, satellite on the close ones (like the reference). */
const atlasAt = (t: number) => Math.min(1, ramp(t, C.yehai, C.yehai + 1.0, linear) * (1 - ramp(t, C.map + 0.2, C.map + 1.0, linear)) + ramp(t, C.to3, C.to3 + 0.8, linear) * (1 - ramp(t, C.baaki, DURATION_S - 0.8, linear)));

export const Hormuz: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = camAt(t);
  const [sx, sy] = shake(t);
  const split = splitAt(t);
  const atlas = atlasAt(t);
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <World t={t} c={c} atlas={atlas} />
        <Grade t={t} />
        <Overlays t={t} c={c} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1470} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
