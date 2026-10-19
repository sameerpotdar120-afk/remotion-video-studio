import React from 'react';
import { AbsoluteFill, Sequence, staticFile } from 'remotion';
import SIZES from '../../../public/closestspace/img_sizes.json';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, SC, merc, project, toScreen } from './cam';
import { HEAD, SUB } from '../../timezones/fonts';
import { COL } from './regions';
import { GState, globePoint, globeRadius } from './Globe';
import { Cam3, SUMMIT, toScreen3 } from './Ev3D';
import { C01PeakPins } from '../motion/C01PeakPins';
import { C02GlowWord } from '../motion/C02GlowWord';
import { C05PeakLabel } from '../motion/C05PeakLabel';
import { C06Climber } from '../motion/C06Climber';
import { C07RedX } from '../motion/C07RedX';
import { C08FlatEarth } from '../motion/C08FlatEarth';
import { C09SphereGeoid } from '../motion/C09SphereGeoid';
import { C10SpinArrows, bulge } from '../motion/C10SpinArrows';
import { C11RumaliRoti } from '../motion/C11RumaliRoti';
import { C12LumpyGlow } from '../motion/C12LumpyGlow';
import { C13Geoid } from '../motion/C13Geoid';
import { C14RadiusLines } from '../motion/C14RadiusLines';
import { C15TapeMeasure } from '../motion/C15TapeMeasure';
import { C16AnswerType } from '../motion/C16AnswerType';
import { C17SendPop } from '../motion/C17SendPop';

const FPS = 60;
const IMG = (k: keyof typeof SIZES) => ({ src: staticFile(`closestspace/img/${k}.png`), ...SIZES[k] });
export const GLASS = () => IMG('cs01_magnifier') as { src: string; w: number; h: number; cx: number; cy: number; r: number };
const STROKE = (w: number, col = '#06101a') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
type Pt = [number, number];
const S = (c: Cam, lon: number, lat: number): Pt => toScreen(c, merc(lon, lat));
const f60 = (s: number) => Math.round(s * FPS);
const rel = (s: number, at: number) => Math.round((s - at) * FPS);

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; rot?: number; glow?: string }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', rot = -3, glow }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: HEAD, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, textShadow: glow ? `0 0 30px ${glow}, 0 0 70px ${glow}, ${SHADOW}` : `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** The reference's country reveal: a huge white tilted name sweeps in from the bottom-left and shrinks into place. */
const Sweep: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; rot?: number }> = ({ t, t0, t1, text, x, y, size = 96, rot = -8 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.2, t1);
  if (a <= 0) return null;
  const k = ramp(t, t0, t0 + 0.55, easeOut);
  const s = lerp(3.4, 1, k);
  return (
    <div style={{ position: 'absolute', left: lerp(x - 420, x, k), top: lerp(y + 520, y, k) + Math.sin((t - t0) * 2.4) * 4, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a,
      fontFamily: HEAD, fontWeight: 800, fontSize: size, color: '#fff', whiteSpace: 'nowrap', textShadow: SHADOW, ...STROKE(8) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number }> = ({ t, t0, t1, text, x, y, color, size = 50, rot = -2 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.6) * 4, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${clamp01(pop(t, t0, 8, 260))})`, opacity: a, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 800,
      fontSize: size, color: '#fff', background: 'rgba(8,16,26,0.82)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** A small boxed place label on a pin (the reference's "Mt Everest" tags). */
const Tag: React.FC<{ t: number; t0: number; t1: number; text: string; p: Pt; dy?: number }> = ({ t, t0, t1, text, p, dy = -46 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 240));
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: a }}>
        <path d={`M ${p[0]} ${p[1] - 18 * s} l ${15 * s} ${26 * s} h ${-30 * s} Z`} fill={COL.red} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', left: p[0], top: p[1] + dy, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
        fontSize: 30, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.85)' }}>{text}</div>
    </>
  );
};

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. */
const HOT = /^[+\-−0-9,.~%:"]*[0-9A-Za-z]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.3;
  if (i < 0 || t < 0.2 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.replace(/"/g, '').split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:."]/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#7CFF6B' : HOT.test(w) ? COL.gold : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

/** The grade: teal shadows and warm highlights (soft light), a vignette, darker edges, grain, flashes on the hits. */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  let flash = 0;
  for (const h of [C.galat4, C.n21_8, C.n2_10, C.ecuador11]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.2), rgba(0,40,60,0.06) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.3), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 74%, rgba(0,6,12,0.42))' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

// ================================================================ map beats

const PEAKS: [number, number][] = [[-151.0, 63.07], [-105.6, 39.1], [-70.0, -32.65], [-78.8, -1.47], [6.86, 45.83], [42.44, 43.35], [37.36, -3.07], [86.93, 27.99], [76.5, 35.9], [148.3, -36.5], [-64.5, -22.5], [102.0, 29.6]];

/** The Nepal–China border through the summit: draws on in yellow (both ways from the summit), turns white for the fills. */
const Border: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const draw = ramp(t, C.border3 - 0.1, C.dakshin3 + 0.9, inOut);
  const white = ramp(t, C.nepal3 - 0.3, C.nepal3 + 0.1);
  const a = window4(t, C.border3 - 0.15, C.border3, SC.globe1[0] - 0.2, SC.globe1[0]);
  if (a <= 0 || !GEO.border_np_cn.length) return null;
  const s = toScreen(c, merc(86.925, 27.988));
  const col = white > 0.5 ? '#fff' : '#FFE14A';
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs>
        <clipPath id="csbd"><circle cx={s[0]} cy={s[1]} r={Math.max(1, draw * 2600)} /></clipPath>
      </defs>
      <g clipPath="url(#csbd)">
        {GEO.border_np_cn.map((line, i) => {
          const d = line.map((p, k) => {
            const q = toScreen(c, p as [number, number]);
            return (k ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1);
          }).join('');
          return <path key={i} d={d} stroke={col} strokeWidth={7} fill="none" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />;
        })}
      </g>
    </svg>
  );
};

/** The dashed equator across the map (the second hunt). */
const Equator: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, SC.lens2[0], SC.lens2[0] + 0.25, C.chimb9 + 0.6, C.chimb9 + 1.2);
  if (a <= 0) return null;
  const y = toScreen(c, merc(0, 0))[1];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <path d={`M -100 ${y} H 1180`} stroke="#fff" strokeWidth={9} strokeDasharray="44 26" strokeDashoffset={-t * 60} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} />
    </svg>
  );
};

/** Everest vs Chimborazo, side by side to scale (8,849 m and 6,263 m), on "Everest से 2,600 मीटर छोटा". */
const Heights: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.everest10 - 0.15, t1 = SC.globe2[0];
  const a = window4(t, t0, t0 + 0.1, t1 - 0.2, t1);
  if (a <= 0) return null;
  const g = ramp(t, t0, t0 + 0.6, easeOut);
  const H1 = 600 * g, H2 = (600 * 6263) / 8849 * ramp(t, t0 + 0.25, t0 + 0.85, easeOut);
  const base = 1360;
  const peak = (x: number, h: number, col: string, label: string, sub: string) => (
    <g>
      <path d={`M ${x - 210} ${base} L ${x} ${base - h} L ${x + 210} ${base} Z`} fill={col} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${x - 70} ${base - h + h / 3} L ${x} ${base - h} L ${x + 70} ${base - h + h / 3} L ${x + 30} ${base - h + h / 3.6} L ${x} ${base - h + h / 3} L ${x - 30} ${base - h + h / 3.6} Z`} fill="#fff" opacity={h > 20 ? 0.95 : 0} />
      <text x={x} y={base - h - 70} textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontWeight={800} fontSize={40} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke" opacity={h > 50 ? 1 : 0}>{label}</text>
      <text x={x} y={base - h - 24} textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontWeight={800} fontSize={40} fill={COL.gold} stroke="#000" strokeWidth={6} paintOrder="stroke" opacity={h > 50 ? 1 : 0}>{sub}</text>
    </g>
  );
  const dip = pop(t, C.n2600_10 - 0.05, 9, 240);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,12,24,0) 30%, rgba(4,12,24,0.7) 55%, rgba(4,12,24,0.75) 75%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M 60 ${base} H 1020`} stroke="#fff" strokeWidth={4} opacity={0.6} />
        {peak(300, H1, '#7A6A5A', 'Everest', '8,849 m')}
        {peak(780, H2, '#B8642A', 'Chimborazo', '6,263 m')}
        {dip > 0 && (
          <g transform={`translate(780 ${base - 600}) scale(${clamp01(dip)})`}>
            <path d={`M 0 0 V ${600 - (600 * 6263) / 8849 - 120}`} stroke={COL.red} strokeWidth={6} strokeDasharray="14 10" />
            <text x={-300} y={30} textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontWeight={800} fontSize={54} fill={COL.red} stroke="#000" strokeWidth={7} paintOrder="stroke">−2,600 m</text>
          </g>
        )}
      </svg>
    </div>
  );
};

/** Map overlays for every map beat; positions follow the camera each frame. */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const ev = S(c, 86.925, 27.988), ch = S(c, -78.817, -1.469);
  const pins = PEAKS.map(([lo, la]) => S(c, lo, la));
  const np = S(c, 84.0, 28.3), cn = S(c, 96, 34), ecu = S(c, -78.0, -0.9);
  return (
    <>
      {/* line 1: pins on the world's big peaks rise toward space; "space के सबसे पास?"; EASY green → red */}
      <At t0={0.05} t1={C.dhoond2 + 0.1} x={540} y={960} w={1080} h={1920}><C01PeakPins pts={pins} rise={rel(C.desh1 - 0.3, 0.05)} height={1100} /></At>
      <Big t={t} t0={C.space1 - 0.05} t1={C.easy1 - 0.15} text={<span>space के <span style={{ color: '#9FD7FF' }}>सबसे पास?</span></span>} x={540} y={560} size={104} rot={-6} glow="rgba(80,150,255,0.8)" />
      <At t0={C.easy1 - 0.12} t1={C.dhoond2 - 0.05} x={540} y={700} w={1080} h={700}><C02GlowWord text="EASY" flip={rel(C.par1 + 0.15, C.easy1 - 0.12)} punch={rel(C.dhoond2 - 0.3, C.easy1 - 0.12)} /></At>
      {/* line 2: the lens lands on the Himalaya */}
      <Tag t={t} t0={C.everest2 - 0.1} t1={SC.ev3d[0] + 0.05} text="Mount Everest" p={ev} />
      {/* line 3: the summit top-down, the border, Nepal, China */}
      <Tag t={t} t0={SC.ev3d[1] + 0.05} t1={C.china3 + 0.2} text="Mt Everest" p={ev} dy={-42} />
      <Border t={t} c={c} />
      <Sweep t={t} t0={C.nepal3 - 0.1} t1={SC.globe1[0]} text="Nepal" x={np[0] - 40} y={np[1] + 120} size={92} rot={-8} />
      <Sweep t={t} t0={C.china3 + 0.05} t1={SC.globe1[0]} text="China" x={cn[0]} y={cn[1]} size={104} rot={-4} />
      {/* line 9: the dashed equator, Chimborazo, Ecuador */}
      <Equator t={t} c={c} />
      <Chip t={t} t0={SC.lens2[0] + 0.2} t1={C.ecuador9 - 0.4} text="Equator" x={540} y={toScreen(c, merc(0, 0))[1] - 70} color="#ffffff" size={46} rot={0} />
      <Sweep t={t} t0={C.ecuador9 + 0.05} t1={C.everest10 - 0.1} text="Ecuador" x={ecu[0] - 40} y={ecu[1] + 230} size={96} rot={-10} />
      <At t0={C.chimb9 - 0.1} t1={C.everest10 - 0.1} x={ch[0]} y={ch[1]} w={900} h={700} ax={0.5} ay={620 / 700} scale={0.85}>
        <C05PeakLabel name="Mt Chimborazo" count={6263} unit=" m" glow="rgba(255,200,61,0.7)" />
      </At>
      <Heights t={t} />
    </>
  );
};

/** Overlays on the 3D fly-over: the summit label (the height ticks up), then the climber sticker on "दुनिया की छत". */
export const Ev3DFx: React.FC<{ t: number; cam: Cam3 }> = ({ t, cam }) => {
  const [sx, sy] = toScreen3(cam, SUMMIT);
  const out = 1 - ramp(t, SC.ev3d[1] - 0.45, SC.ev3d[1] - 0.15);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: out }}>
        <At t0={C.n8849_2 - 0.75} t1={SC.ev3d[1]} x={sx} y={sy} w={900} h={700} ax={0.5} ay={620 / 700} scale={1.0}>
          <C05PeakLabel name="Mt Everest" count={8849} unit=" m" />
        </At>
      </div>
      <At t0={C.chhat2 - 0.35} t1={SC.ev3d[1] - 0.2} x={760} y={1560} w={1080} h={1400} scale={0.36}>
        <div style={{ position: 'absolute', inset: 40, borderRadius: 80, background: 'linear-gradient(180deg, #8fc3ff, #dcecff)', border: '16px solid #fff', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -40, top: -40, width: 1080, height: 1400 }}><C06Climber plant={rel(C.chhat2 + 0.5, C.chhat2 - 0.35)} /></div>
        </div>
      </At>
    </>
  );
};

/** Globe overlays: labels on the painted countries, the red X, the flat earth, sphere → geoid, the bulge arrows, the
 *  lumpy outline, the radius lines, the tape measure, the answer. All follow the globe's screen position. */
export const GlobeFx: React.FC<{ t: number; g: GState }> = ({ t, g }) => {
  const R = globeRadius(g);
  const cx = 540 + g.dx, cy = 960;
  const np = globePoint(g, 84.1, 28.3), cn = globePoint(g, 100, 34);
  const ev = globePoint(g, 86.925, 27.988, 1.0), chb = globePoint(g, -78.817, -1.469, 1.0);
  const ang = (p: { x: number; y: number }) => (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI;
  const s1 = SC.globe1[0];
  const lbl = (p: { x: number; y: number; front: number }, text: string, t0: number, t1: number, size: number, dx = 0, dy = 0) => {
    const a = window4(t, t0, t0 + 0.2, t1 - 0.3, t1) * clamp01(p.front * 3);
    return a > 0 ? (
      <div style={{ position: 'absolute', left: p.x + dx, top: p.y + dy, transform: 'translate(-50%,-50%)', opacity: a, fontFamily: HEAD, fontWeight: 800, fontSize: size, color: '#fff', textShadow: SHADOW, ...STROKE(7) }}>{text}</div>
    ) : null;
  };
  const bz = bulge(Math.round((t - (C.dhuri6 - 0.2)) * 60), Math.round((C.equator6 - C.dhuri6 + 0.2) * 60), Math.round((C.poles6 - C.dhuri6 + 0.2) * 60));
  return (
    <>
      {lbl(np, 'Nepal', s1 + 0.2, C.gol4, 54, -30, 40)}
      {lbl(cn, 'China', s1 + 0.2, C.gol4, 66)}
      {/* line 4: but that's wrong */}
      <At t0={C.galat4 - 0.08} t1={C.dharti4 + 0.5} x={540} y={960} w={1080} h={1920}><C07RedX x={np.x} y={np.y + 40} out={rel(C.dharti4 - 0.1, C.galat4 - 0.08)} /></At>
      {/* "वो चपटी है… मज़ाक कर रहा हूँ" */}
      <At t0={C.chapti4 - 0.08} t1={C.mazak5 + 0.9} x={540} y={960} w={1080} h={1920} scale={1.15}><C08FlatEarth out={rel(C.mazak5 + 0.05, C.chapti4 - 0.08)} img={IMG('cs02_flat_earth')} /></At>
      {/* line 5: the ring, "गोल" struck out → "Geoid" */}
      <At t0={C.perfect5 - 0.25} t1={C.dhuri6 - 0.1} x={cx} y={cy} w={1080} h={1080} ax={0.5} ay={640 / 1080}>
        <C09SphereGeoid r={R + 10} first="गोल" second="Geoid" strike={rel(C.ball5 + 0.55, C.perfect5 - 0.25)} />
      </At>
      {/* line 6: spin, stretch at the equator, squash at the poles */}
      <At t0={C.dhuri6 - 0.2} t1={SC.roti[0] + 0.05} x={cx} y={cy} w={1080} h={1080}>
        <C10SpinArrows r={R} stretch={rel(C.equator6, C.dhuri6 - 0.2)} squash={rel(C.poles6, C.dhuri6 - 0.2)} />
      </At>
      {/* line 7: the lumpy outline crawls round the squashed globe */}
      <At t0={C.pahad7 - 0.05} t1={SC.geoid[0] + 0.05} x={cx} y={cy} w={1080} h={1080}>
        <C12LumpyGlow rx={R * bz.sx * 0.96} ry={R * bz.sy * 0.97} dur={Math.max(40, rel(C.wazan7 + 0.3, C.pahad7 - 0.05))} />
      </At>
      {/* line 8: the two radii */}
      <At t0={C.natija8 + 0.1} t1={C.dhoond9 + 0.1} x={cx} y={cy} w={1080} h={1080}>
        <C14RadiusLines r={R} plus={rel(C.n21_8, C.natija8 + 0.1)} />
      </At>
      {lbl({ x: cx, y: cy - R - 60, front: 1 }, 'North Pole', C.center8, C.dhoond9 - 0.2, 38)}
      {/* line 10: the tape measure from the centre to both summits */}
      {t >= SC.globe2[0] + 0.5 && (
        <At t0={SC.globe2[0] + 0.55} t1={C.matlab11 + 0.1} x={cx} y={cy} w={1080} h={1080} ax={0.5} ay={620 / 1080}>
          <C15TapeMeasure r={R} aA={ang(ev)} aB={ang(chb)} textA="6,382 km" textB="6,384 km" diff="+2 km" caseImg={IMG('cs03_tape_measure')} />
        </At>
      )}
      {lbl({ ...ev, y: ev.y - 70 }, 'Everest', SC.globe2[0] + 0.7, C.matlab11, 40)}
      {lbl({ ...chb, y: chb.y - 70 }, 'Chimborazo', SC.globe2[0] + 0.7, C.matlab11, 40)}
      {/* line 11: the answer */}
      <At t0={C.ecuador11 - 0.15} t1={DURATION_S} x={chb.x} y={chb.y} w={1080} h={1080} ax={420 / 1080} ay={760 / 1080}>
        <C16AnswerType word="Ecuador" sub="space के सबसे पास" px={420} py={760} />
      </At>
      {/* line 12: send it */}
      <At t0={C.video12 - 0.1} t1={DURATION_S} x={820} y={300} w={600} h={600} scale={0.75}><C17SendPop launch={rel(C.everest12, C.video12 - 0.1)} /></At>
    </>
  );
};

/** The two full-screen cutaways inside the globe section: the rumali roti and the geoid potato. */
export const Cutaways: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t >= SC.roti[0] && t < SC.roti[1] && (
      <At t0={SC.roti[0]} t1={SC.roti[1]} x={540} y={1000} w={1080} h={1400} scale={1.3}><C11RumaliRoti img={IMG('cs04_rumali_roti')} /></At>
    )}
    {t >= SC.geoid[0] && t < SC.geoid[1] && (
      <>
        <At t0={SC.geoid[0]} t1={SC.geoid[1]} x={540} y={900} w={1080} h={1080} scale={1.0}><C13Geoid grow={rel(C.hazaron7 + 1.2, SC.geoid[0])} bg={null} /></At>
        <Chip t={t} t0={C.hazaron7 + 0.2} t1={SC.geoid[1]} text="हज़ारों गुना बढ़ाकर" x={540} y={1430} color={COL.gold} size={48} rot={-2} />
        <Big t={t} t0={C.aalu7 - 0.05} t1={SC.geoid[1]} text="आलू!" x={800} y={470} size={110} rot={8} color={COL.gold} />
      </>
    )}
  </>
);

/** Scene changes: a zoom with radial blur (the reference's cut), in (1) or out (-1). */
export const CUTS = () => [
  { t: SC.ev3d[0], dir: 1 }, { t: SC.ev3d[1], dir: 1 }, { t: SC.globe1[0], dir: -1 }, { t: SC.roti[0], dir: -1 }, { t: SC.roti[1], dir: -1 },
  { t: SC.geoid[0], dir: 1 }, { t: SC.geoid[1], dir: -1 }, { t: SC.lens2[0], dir: 1 }, { t: SC.globe2[0], dir: -1 },
];
export const zoomCut = (t: number) => {
  let scale = 1, blur = 0, flash = 0;
  for (const { t: tc, dir } of CUTS()) {
    const d = t - tc;
    if (d > -0.16 && d < 0) {
      const q = easeIn(1 + d / 0.16);
      scale *= dir > 0 ? 1 + 1.4 * q : 1 - 0.35 * q;
      blur = Math.max(blur, 14 * q);
      flash = Math.max(flash, 0.35 * q);
    } else if (d >= 0 && d < 0.22) {
      const q = 1 - easeOut(d / 0.22);
      scale *= dir > 0 ? 1 - 0.3 * q : 1 + 0.6 * q;
      blur = Math.max(blur, 12 * q);
      flash = Math.max(flash, 0.3 * q);
    }
  }
  return { scale, blur, flash };
};
export { project };
