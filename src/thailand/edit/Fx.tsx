import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, CUT, Cam, DURATION_S, GEO, P, merc, project, toScreen } from './cam';
import { HEAD, NUM, SUB } from '../../timezones/fonts';
import { COL, regionsAt } from './regions';
import { MapCanvas } from './Map';
import { Shapes } from './Shapes';
import { FlagBall, FlagId } from '../motion/Flags';
import { M12Whip } from '../../timezones/motion/M12Whip';
import { M16Sparkle } from '../../timezones/motion/M16Sparkle';
import { T01TugOfWar } from '../motion/T01TugOfWar';
import { T02Flex } from '../motion/T02Flex';
import { T03Balance } from '../motion/T03Balance';
import { T04Electric } from '../motion/T04Electric';
import { T05Clash } from '../motion/T05Clash';
import { T06Diplomats } from '../motion/T06Diplomats';
import { T07Gloves } from '../motion/T07Gloves';
import { T08Padlock } from '../motion/T08Padlock';
import { T09Chevrons } from '../motion/T09Chevrons';
import { T10Gunboat } from '../motion/T10Gunboat';
import { T11Question } from '../motion/T11Question';
import { T13Soldiers } from '../motion/T13Soldiers';
import { T14King } from '../motion/T14King';
import { T15Heart } from '../motion/T15Heart';
import { T16Dodge } from '../motion/T16Dodge';
import { T17Send } from '../motion/T17Send';

const FPS = 60;
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
const S = (c: Cam, lon: number, lat: number) => toScreen(c, merc(lon, lat));
const f60 = (s: number) => Math.round(s * FPS);

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; rot?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, rot = 0, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box. */
const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number }> = ({ t, t0, t1, text, x, y, color, pin, size = 46 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  const bob = Math.sin((t - t0) * 2.4) * 4;
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y + bob, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.72)', color: '#fff',
          padding: '8px 24px 2px 20px', borderRadius: 10, border: '4px solid #fff', fontFamily: NUM, fontSize: size, letterSpacing: 1.5,
          boxShadow: `0 8px 22px rgba(0,0,0,0.55), 0 0 18px ${color}66`, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: color, display: 'inline-block', marginTop: -6, boxShadow: `0 0 10px ${color}` }} />{text}
        </div>
      )}
    </>
  );
};

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  const bob = Math.sin((t - t0) * 2.2) * 5;
  return (
    <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number; fill?: string; font?: string }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2, fill, font = HEAD }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 260));
  const bob = Math.sin((t - t0) * 2.6) * 4;
  return (
    <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800, fontSize: size,
      color: '#fff', background: fill ?? 'rgba(8,16,26,0.82)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** A rolling counter. */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number }> = ({
  t, t0, t1, to, x, y, size = 160, color = COL.gold, pre = '', post = '', dur = 0.8,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(0, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>
      {pre}{v}<span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.45 }}>{post}</span>
    </div>
  );
};

/** A rubber stamp that slams down (scale 1.8 → 1 with a thud) and stays a little rotated. */
const Stamp: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color?: string }> = ({ t, t0, t1, text, x, y, color = '#E5202E' }) => {
  const a = window4(t, t0, t0 + 0.04, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = lerp(1.9, 1, ramp(t, t0, t0 + 0.14, easeIn)) + kick(t, t0 + 0.14, 0.05, 30, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-9deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 800, fontSize: 96,
      color, border: `10px solid ${color}`, borderRadius: 22, padding: '10px 36px 0', background: 'rgba(255,255,255,0.86)', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', letterSpacing: 2 }}>{text}</div>
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

/** The grade: teal shadows and warm highlights (soft light), a vignette, darker edges, grain, and flashes on the hits. */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  let flash = 0;
  for (const h of [C.kaise1, C.jang7 + 0.05, C.l14, C.laos17, C.colony20]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.32), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 74%, rgba(0,6,12,0.45))' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Whip transitions into and out of every cutaway. */
const WHIPS = () => Object.values(CUT).flatMap(([a, b]) => [a, b]);
export const Whips: React.FC = () => (
  <>{WHIPS().map((w, i) => <At key={i} t0={w - 0.22} t1={w + 0.3} x={540} y={960} w={1080} h={1920}><M12Whip dir={i % 2 ? 'right' : 'left'} /></At>)}</>
);

// ================================================================ map pieces

/** A flag-ball pinned to a place: pops in with an overshoot, bobs, squashes on landing, shrinks away at t1. */
const MapFlag: React.FC<{ t: number; c: Cam; id: FlagId; at: [number, number]; t0: number; t1: number; r?: number; from?: [number, number] }> = ({ t, c, id, at, t0, t1, r = 54, from }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0, 8, 240)) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  let [x, y] = S(c, at[0], at[1]);
  if (from) {
    // slide in from a screen point (an edge, or a parent ball for a split)
    const k = ramp(t, t0, t0 + 0.55, inOut);
    x = lerp(from[0], x, k); y = lerp(from[1], y, k);
  }
  const bob = Math.sin((t - t0) * 2.6 + at[0]) * 5;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <g transform={`translate(${x} ${y - r - 18 + bob}) scale(${s})`}>
        <path d={`M 0 ${r * 0.9} L 0 ${r + 22}`} stroke="#fff" strokeWidth={5} />
        <FlagBall id={id} r={r} uid={`mf-${id}-${t0}`} />
      </g>
    </svg>
  );
};

/** A push arrow: a thick, glowing arrow that draws from a to b with a bounce at the tip. */
const PushArrow: React.FC<{ t: number; c: Cam; a: [number, number]; b: [number, number]; t0: number; t1: number; color: string; width?: number }> = ({ t, c, a, b, t0, t1, color, width = 34 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = ramp(t, t0, t0 + 0.5, easeOut);
  const o = 1 - ramp(t, t1, t1 + 0.3);
  const [x0, y0] = S(c, a[0], a[1]), [x1, y1] = S(c, b[0], b[1]);
  const mx = (x0 + x1) / 2 - (y1 - y0) * 0.18, my = (y0 + y1) / 2 + (x1 - x0) * 0.18;
  const d = `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`;
  // the tip rides the curve, pointing along its tangent
  const tipX = lerp(lerp(x0, mx, k), lerp(mx, x1, k), k), tipY = lerp(lerp(y0, my, k), lerp(my, y1, k), k);
  const tx = 2 * (1 - k) * (mx - x0) + 2 * k * (x1 - mx), ty = 2 * (1 - k) * (my - y0) + 2 * k * (y1 - my);
  const tipA = (Math.atan2(ty, tx) * 180) / Math.PI + kick(t, t0 + 0.5, 6, 20, 8);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o }}>
      <path d={d} stroke="#000" strokeOpacity={0.35} strokeWidth={width + 14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.94} 1`} transform="translate(6 10)" />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.94} 1`} style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
      <path d={d} stroke="#fff" strokeOpacity={0.5} strokeWidth={width * 0.25} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.94} 1`} />
      <g transform={`translate(${tipX} ${tipY}) rotate(${tipA})`}>
        <path d={`M ${width * 1.6} 0 L ${-width * 0.6} ${-width * 1.25} L ${-width * 0.2} 0 L ${-width * 0.6} ${width * 1.25} Z`} fill={color} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

/** The gunboat cut-out (the creator's t04), sailing in big across the bottom with a bob, smoke and a wake. */
const HeroShip: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.4) return null;
  const k = ramp(t, t0, t1, linear);
  const o = window4(t, t0, t0 + 0.15, t1 - 0.1, t1 + 0.3);
  const x = lerp(-640, 520, easeOut(k)), y = 1300 + Math.sin(t * 3.2) * 8;
  const w = 980, h = (980 * 865) / 2000;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h + 80, opacity: o, transform: `rotate(${Math.sin(t * 2.4) * 1.4}deg)` }}>
      {[0, 1, 2, 3].map((i) => {
        const q = ((t - t0) * 0.8 + i * 0.25) % 1;
        return <div key={i} style={{ position: 'absolute', left: w * 0.55 - q * 260, top: h * 0.12 - q * 160, width: 60 + q * 120, height: 60 + q * 120, borderRadius: '50%', background: '#8A8A92', opacity: (1 - q) * 0.55, filter: 'blur(6px)' }} />;
      })}
      <Img src={staticFile('thailand/img/t04_french_gunboat.png')} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.55))' }} />
      <div style={{ position: 'absolute', left: -60, right: w * 0.05, top: h - 26, height: 40, borderRadius: 20, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85))', filter: 'blur(5px)' }} />
    </div>
  );
};

/** The live map seen from a fixed camera inside a frame (the palace room's picture frame). */
const MiniMap: React.FC<{ t: number; x: number; y: number; w: number; h: number; cam: Cam }> = ({ t, x, y, w, h, cam }) => {
  const k = h / 1920;
  const regs = [
    { key: 'mm_bi', rings: GEO.british_india, a: 1, color: COL.brit, fill: 1, phase: 0.1, sat: 0.8 },
    { key: 'mm_burma', rings: GEO.burma, a: 1, color: COL.brit, fill: 1, phase: 0.3, sat: 0.8 },
    { key: 'mm_malaya', rings: GEO.malaya_british, a: 1, color: COL.brit, fill: 1, phase: 0.5, sat: 0.8 },
    { key: 'mm_vn', rings: GEO.vietnam, a: 1, color: COL.fr, fill: 1, phase: 0.7, sat: 0.8 },
    { key: 'mm_kh', rings: GEO.cambodia_rest, a: 1, color: COL.fr, fill: 1, phase: 0.9, sat: 0.8 },
    { key: 'mm_siam', rings: GEO.siam_1890, a: 1, color: COL.siam, fill: 1, phase: 0.2, sat: 0.9 },
  ];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: '#0c2a3c', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }}>
      <div style={{ position: 'absolute', left: w / 2 - 1300 * k, top: h / 2 - 1600 * k, width: 2600, height: 3200, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.15) contrast(1.1)' }}><MapCanvas cam={cam} res={0.6} /></div>
        <Shapes c={cam} t={t} regions={regs} starts={{}} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,240,210,0.18), rgba(0,0,0,0.12))' }} />
    </div>
  );
};

/** A full-frame background image with a slow push. */
const Bg: React.FC<{ t: number; t0: number; t1: number; name: string }> = ({ t, t0, t1, name }) => (
  <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * ramp(t, t0, t1, linear)})` }}>
    <Img src={staticFile(`thailand/img/${name}.jpg`)} style={{ width: 1080, height: 1920 }} />
  </AbsoluteFill>
);

// ================================================================ beats

/** Map overlays for every map beat (positions are recomputed from the camera each frame, so they stick to the land). */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const bk = S(c, 100.5, 13.75);
  const siamMid = S(c, 101.0, 15.6);
  const burmaB: [number, number] = [96.3, 20.3], vnB: [number, number] = [106.4, 16.2], khB: [number, number] = [104.9, 12.6];
  const indiaB: [number, number] = [78.6, 23.0];
  // the shared border on the "borders touch" beat: the 100.5°E split line through Siam
  const border = [20.3, 19.2, 18.0, 16.8, 15.6, 14.6, 13.6].map((la) => S(c, 100.5 + Math.sin(la * 3) * 0.12, la));
  return (
    <>
      {/* hook */}
      <MapFlag t={t} c={c} id="britain" at={indiaB} t0={C.britain1 + 0.1} t1={C.bagal1 + 0.4} r={60} />
      <Counter t={t} t0={C.n200_1 - 0.05} t1={C.bagal1 + 0.2} to={200} pre="~" post=" साल" x={540} y={1240} size={170} />
      <MapFlag t={t} c={c} id="britain" at={burmaB} t0={C.bagal1 + 0.5} t1={CUT.tug[0]} r={46} />
      <MapFlag t={t} c={c} id="france" at={vnB} t0={C.bagal1 + 0.9} t1={CUT.tug[0]} r={46} />
      <At t0={C.ghulam1 - 0.15} t1={C.kaise1 - 0.05} x={540} y={1250} w={1080} h={1080} scale={0.62}><T16Dodge /></At>
      <At t0={C.kaise1 - 0.1} t1={C.thailand2 + 0.1} x={siamMid[0]} y={siamMid[1] - 60} w={600} h={800} scale={0.9}><T11Question /></At>
      <Label t={t} t0={C.thailand2 + 0.05} t1={C.siam2 - 0.05} text="THAILAND" x={760} y={560} color={COL.siam} pin={bk} size={54} />
      <Label t={t} t0={C.siam2 - 0.02} t1={CUT.tug[0]} text="SIAM" x={760} y={560} color={COL.siam} pin={bk} size={62} />
      <MapFlag t={t} c={c} id="siam" at={[101.6, 16.4]} t0={C.siam2 + 0.1} t1={CUT.tug[0]} r={52} />
      <Chip t={t} t0={C.simple3 - 0.05} t1={CUT.tug[0] + 0.05} text="SIMPLE" x={540} y={1300} color={COL.yellow} size={78} font={NUM} rot={-4} />
      {/* Britain from India into Burma */}
      <MapFlag t={t} c={c} id="britain" at={indiaB} t0={C.paschim4 + 0.15} t1={CUT.soldiers[0]} r={56} />
      <Label t={t} t0={C.india4 - 0.05} t1={CUT.soldiers[0]} text="BRITISH INDIA" x={330} y={560} color={COL.brit} size={46} />
      <PushArrow t={t} c={c} a={[84, 22.5]} b={[95.5, 21.2]} t0={C.india4 + 0.4} t1={CUT.soldiers[0]} color="#FF8A1F" />
      <MapFlag t={t} c={c} id="britain" at={burmaB} t0={C.burma4 + 0.05} t1={CUT.flex[0]} r={54} />
      <Label t={t} t0={C.burma4 + 0.1} t1={C.poorab5} text="BURMA" x={770} y={520} color={COL.brit} pin={S(c, 96.1, 19.8)} size={54} />
      <Chip t={t} t0={C.british4 - 0.05} t1={C.poorab5 + 0.1} text="Burma = British India (1937 तक)" x={540} y={1330} color={COL.brit} size={50} />
      {/* France from the east */}
      <MapFlag t={t} c={c} id="france" at={vnB} t0={C.poorab5 + 0.2} t1={CUT.flex[0]} r={56} from={[1180, 700]} />
      <Label t={t} t0={C.vietnam5 - 0.05} t1={C.cambodia5} text="VIETNAM" x={820} y={460} color={COL.fr} pin={S(c, 105.8, 18.5)} size={50} />
      <MapFlag t={t} c={c} id="france" at={khB} t0={C.cambodia5 + 0.05} t1={CUT.flex[0]} r={46} from={S(c, vnB[0], vnB[1])} />
      <Label t={t} t0={C.cambodia5 + 0.1} t1={C.beech6} text="CAMBODIA" x={760} y={1320} color={COL.fr} pin={S(c, 104.9, 12.2)} size={50} />
      <At t0={C.beech6 - 0.1} t1={CUT.flex[0]} x={540} y={S(c, 101, 15.5)[1]} w={1080} h={1920}><T09Chevrons y={960} gap={150} /></At>
      <Label t={t} t0={C.siam6 - 0.05} t1={CUT.flex[0]} text="SIAM" x={540} y={1330} color={COL.siam} size={60} />
      {/* the borders touch, the clash */}
      {t >= CUT.balance[1] - 0.1 && t < CUT.palace[0] + 0.2 && (
        <>
          <At t0={C.sarhad7 + 0.1} t1={CUT.palace[0]} x={540} y={960} w={1080} h={1920}><T04Electric pts={border} /></At>
          <At t0={C.jang7 - 80 / 60} t1={CUT.palace[0]} x={540} y={960} w={1080} h={1920}>
            <T05Clash a={S(c, 96.0, 17.6)} b={S(c, 105.4, 17.6)} hit={S(c, 100.6, 16.4)} />
          </At>
          <Big t={t} t0={C.jang7} t1={CUT.palace[0]} text="जंग!" x={540} y={1300} size={170} color="#FF4A2B" rot={-5} />
        </>
      )}
      {/* the buffer and the 1896 core */}
      <Chip t={t} t0={C.gaddi15 - 0.1} t1={C.chao15} text="BUFFER" x={540} y={420} color={COL.cyan} size={64} font={NUM} rot={0} />
      <At t0={C.gaddi15 - 0.55} t1={C.chao15 - 0.1} x={540} y={960} w={1080} h={1920}>
        <T07Gloves a={S(c, 96.0, 19.5)} b={S(c, 105.6, 18.0)} meet={S(c, 100.8, 16.2)} />
      </At>
      <Chip t={t} t0={C.n1896_15 - 0.05} t1={C.matlab16} text="1896" x={540} y={410} color={COL.gold} size={84} font={NUM} rot={-3} />
      <Label t={t} t0={C.chao15 + 0.15} t1={C.matlab16} text="CHAO PHRAYA" x={760} y={1320} color={COL.core} pin={S(c, 100.45, 15.0)} size={46} />
      <At t0={C.koi15 - 0.1} t1={C.matlab16 + 0.3} x={S(c, 100.4, 15.4)[0]} y={S(c, 100.4, 15.4)[1] - 120} w={600} h={700} scale={0.55}><T08Padlock /></At>
      {/* spheres; the edges */}
      <Chip t={t} t0={C.safe16 - 0.05} t1={C.kinare16 + 0.1} text="SAFE ✓" x={540} y={1330} color={COL.core} size={66} font={NUM} rot={-3} />
      <Big t={t} t0={C.kinare16} t1={C.french17 - 0.05} text="किनारे?" x={540} y={1330} size={120} color="#FF4A4A" rot={-3} />
      {/* the gunboats to Bangkok, then the losses */}
      <HeroShip t={t} t0={C.french17 + 0.05} t1={C.bangkok17 + 0.6} />
      {t >= C.bangkok17 - 0.3 && t < C.laos17 + 0.2 && (() => {
        const k = ramp(t, C.bangkok17 - 0.3, C.laos17 - 0.4, inOut);
        const [x0, y0] = S(c, 100.585, 13.48), [x1, y1] = S(c, 100.51, 13.72);
        return (
          <At t0={C.bangkok17 - 0.3} t1={C.laos17 + 0.2} x={lerp(x0, x1, k)} y={lerp(y0, y1, k)} w={1200} h={700} scale={0.24} ay={0.72}>
            <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}><T10Gunboat water={false} /></div>
          </At>
        );
      })()}
      <Label t={t} t0={C.bangkok17 - 0.05} t1={C.laos17 - 0.3} text="BANGKOK" x={760} y={560} color={COL.siam} pin={S(c, 100.5, 13.75)} size={52} />
      <Chip t={t} t0={C.bangkok17 + 0.2} t1={C.laos17 - 0.3} text="1893" x={300} y={420} color={COL.fr} size={76} font={NUM} rot={-3} />
      <MapFlag t={t} c={c} id="france" at={[106.2, 17.6]} t0={C.laos17 - 0.2} t1={CUT.king[0]} r={52} />
      <PushArrow t={t} c={c} a={[105.6, 17.8]} b={[102.6, 19.4]} t0={C.laos17 - 0.1} t1={C.malaya17} color={COL.fr} />
      <Label t={t} t0={C.laos17 + 0.2} t1={C.cambodia17} text="LAOS" x={800} y={520} color={COL.fr} size={52} />
      <PushArrow t={t} c={c} a={[105.4, 12.4]} b={[103.2, 13.4]} t0={C.cambodia17 - 0.1} t1={C.malaya17 + 0.4} color={COL.fr} width={28} />
      <Chip t={t} t0={C.cambodia17 + 0.2} t1={C.malaya17} text="1907" x={760} y={1340} color={COL.fr} size={70} font={NUM} rot={2} />
      <MapFlag t={t} c={c} id="britain" at={[102.2, 3.6]} t0={C.malaya17 - 0.25} t1={CUT.king[0]} r={52} />
      <PushArrow t={t} c={c} a={[102.0, 4.2]} b={[101.3, 6.0]} t0={C.malaya17 - 0.1} t1={CUT.king[0]} color={COL.brit} width={28} />
      <Chip t={t} t0={C.malaya17 + 0.2} t1={CUT.king[0]} text="1909 · 4 MALAY STATES" x={540} y={420} color={COL.brit} size={54} font={NUM} rot={-2} />
      {/* edges given, heart kept; never a colony */}
      <At t0={C.dil19 - 0.15} t1={C.isiliye20 + 0.6} x={S(c, 100.6, 15.0)[0]} y={S(c, 100.6, 15.0)[1]} w={600} h={600} scale={0.75}><T15Heart /></At>
      <Stamp t={t} t0={C.colony20 - 0.05} t1={DURATION_S} text="कभी COLONY नहीं" x={540} y={S(c, 101, 15)[1] - 260} />
      <At t0={C.video21 - 0.2} t1={DURATION_S} x={540} y={430} w={700} h={700} scale={0.8}><T17Send /></At>
      <Hits />
    </>
  );
};
const Hits: React.FC = () => (
  <>{[C.n200_1, C.siam2, C.burma4, C.vietnam5, C.n1896_15, C.dil19, C.colony20].map((h, i) => <At key={i} t0={h - 0.05} t1={h + 1.2} x={540} y={760} w={640} h={640} scale={1.3}><M16Sparkle color={i % 2 ? '#FFFFFF' : COL.gold} /></At>)}</>
);

/** The cutaways: paper cartoons, the battle, the palace skit with the live map in its frame, the King. */
export const Cutaways: React.FC<{ t: number }> = ({ t }) => {
  const sc = (k: keyof typeof CUT) => [CUT[k][0], CUT[k][1]] as const;
  const [p0, p1] = sc('palace');
  const [k0, k1] = sc('king');
  const [b0, b1] = sc('balance');
  const rel = (s: number, at: number) => Math.round((s - at) * FPS);
  const mini: Cam = { ...((): Cam => { const [x, y] = merc(101.4, 14.8); return { x, y, span: 3.0e6, rot: 0 }; })() };
  // the framed map breathes slowly and drifts a touch
  const mcam: Cam = { ...mini, span: mini.span * (1 - 0.06 * ramp(t, p0, p1, linear)), x: mini.x + Math.sin(t * 0.7) * 2e4 };
  return (
    <>
      <At t0={CUT.tug[0]} t1={CUT.tug[1]} x={540} y={960} w={1080} h={1920}><T01TugOfWar /></At>
      {t >= CUT.soldiers[0] && t < CUT.soldiers[1] && <Bg t={t} t0={CUT.soldiers[0]} t1={CUT.soldiers[1]} name="t02_battlefield_bg" />}
      <At t0={CUT.soldiers[0]} t1={CUT.soldiers[1]} x={540} y={960} w={1080} h={1920}><T13Soldiers volleys={[8, 40, 72]} /></At>
      {t >= CUT.soldiers[0] && t < CUT.soldiers[1] && (
        <>
          <Big t={t} t0={CUT.soldiers[0] + 0.05} t1={CUT.soldiers[1]} text="3 जंग" x={540} y={520} size={150} color={COL.gold} rot={-4} />
          <Chip t={t} t0={CUT.soldiers[0] + 0.25} t1={CUT.soldiers[1]} text="1824 · 1852 · 1885" x={540} y={700} color="#C8202C" size={54} font={NUM} rot={0} />
        </>
      )}
      <At t0={CUT.flex[0]} t1={CUT.flex[1]} x={540} y={960} w={1080} h={1920}><T02Flex /></At>
      <At t0={b0} t1={b1} x={540} y={960} w={1080} h={1920}><T03Balance land={rel(C.leta7, b0)} /></At>
      {t >= p0 && t < p1 && (
        <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * ramp(t, p0, p1, linear)})` }}>
          <Img src={staticFile('thailand/img/t01_palace_room_bg.jpg')} style={{ position: 'absolute', width: 1080, height: 1920 }} />
          <MiniMap t={t} x={370} y={295} w={349} h={460} cam={mcam} />
        </AbsoluteFill>
      )}
      <At t0={p0} t1={p1} x={540} y={960} w={1080} h={1920}>
        <T06Diplomats walk={0} cues={[C.l9, C.l10, C.l11, C.l12, C.l13, C.l14].map((x) => rel(x, p0))} />
      </At>
      {t >= k0 && t < k1 && <Bg t={t} t0={k0} t1={k1} name="t03_throne_room_bg" />}
      <At t0={k0} t1={k1} x={540} y={960} w={1080} h={1920}>
        <T14King intro={rel(C.modern18 - 0.2, k0)} cues={[C.army18, C.railway18, C.kanoon18].map((x) => rel(x - 0.1, k0))} shield={rel(C.hamla18, k0)} />
      </At>
      {t >= k0 && t < k1 && <Chip t={t} t0={C.bahana18 - 0.1} t1={k1} text="NO EXCUSE" x={540} y={300} color={COL.cyan} size={64} font={NUM} rot={-2} />}
    </>
  );
};

export { project };
