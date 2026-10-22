import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import SIZES from '../../../public/ukweather/img_sizes.json';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SC, merc, pxPerM, toScreen } from './cam';
import { HEAD, SUB } from '../../timezones/fonts';
import { COL, WIND, winnerAt } from './regions';
import { NUM, UI } from '../motion/font';
import { Arrow, DashArrows } from '../motion/U14DashArrow';
import { FogLayer, RainLayer, SunLayer } from '../motion/U02WeatherMontage';
import { U01TouristPop } from '../motion/U01TouristPop';
import { U02WeatherMontage } from '../motion/U02WeatherMontage';
import { U03WindBlow } from '../motion/U03WindBlow';
import { U04NeonSlam } from '../motion/U04NeonSlam';
import { U05Lightning } from '../motion/U05Lightning';
import { U07Calendar } from '../motion/U07Calendar';
import { U08EllipseTitle } from '../motion/U08EllipseTitle';
import { U10GiantWord } from '../motion/U10GiantWord';
import { U11GlowLabel } from '../motion/U11GlowLabel';
import { U12RibbonGrow } from '../motion/U12RibbonGrow';
import { U13HatchHalo } from '../motion/U13HatchHalo';
import { U15FlyAtCamera } from '../motion/U15FlyAtCamera';
import { U16WindCurls } from '../motion/U16WindCurls';
import { U17AirTag } from '../motion/U17AirTag';
import { U18SendUmbrella } from '../motion/U18SendUmbrella';

export { useFonts } from '../motion/font';

const FPS = 60;
const STROKE = (w: number, col = '#06101a') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
type Pt = [number, number];
const S = (c: Cam, lon: number, lat: number): Pt => toScreen(c, merc(lon, lat));
const f60 = (s: number) => Math.round(s * FPS);
const fr = (t: number, t0: number) => (t - t0) * FPS;

/** The creator's images (cut out by tools/cut_ukweather_assets.py); missing ones fall back to drawn stand-ins. */
type Size = { w: number; h: number; ext?: string };
const SZ = SIZES as Record<string, Size>;
const IMG = (k: string) => (SZ[k] ? { src: staticFile(`ukweather/img/${k}.${SZ[k].ext ?? 'png'}`), w: SZ[k].w, h: SZ[k].h } : null);

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
export const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; rot?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, rot = 0, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; rot?: number; font?: string }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', rot = -3, font = HEAD }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot + Math.sin((t - t0) * 1.3) * 0.8}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, textShadow: SHADOW, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A map pin: a dot with a pulsing ring and a label that pops up on a short leader, bobbing. */
const Pin: React.FC<{ t: number; t0: number; t1: number; c: Cam; at: Pt; text: string; color?: string; size?: number; up?: number }> = ({ t, t0, t1, c, at, text, color = '#fff', size = 54, up = 70 }) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const [x, y] = S(c, at[0], at[1]);
  const s = clamp01(pop(t, t0, 10, 240));
  const ring = ((t - t0) * 1.2) % 1;
  const bob = Math.sin((t - t0) * 2.4) * 5;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: a, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={14 + ring * 46} fill="none" stroke={color} strokeWidth={4} opacity={(1 - ring) * 0.8} />
        <circle cx={x} cy={y} r={13 * s} fill={color} stroke="#06101a" strokeWidth={4} />
        <path d={`M ${x} ${y - 14} V ${y - up * s + bob}`} stroke="#fff" strokeWidth={4} opacity={0.9} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y - up * s + bob, transform: `translate(-50%,-100%) scale(${s}) rotate(-3deg)`, fontFamily: NUM, fontSize: size, color, letterSpacing: 3, whiteSpace: 'nowrap',
        textShadow: SHADOW, ...STROKE(8) }}>{text}</div>
    </div>
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
        <span key={q} style={{ color: q === cur ? '#7CFF6B' : HOT.test(w) ? COL.yellow : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

/** The grade, built like a Lumetri pass (no grain: studio-clean): the map gets an S-curve and vibrance in its own filter
 *  (see UKWeather), then here a teal split-tone into the shadows, warm highlights, a slow-moving warm light leak that
 *  never stops drifting, a vignette and darker top and bottom edges. */
export const Grade: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  const lx = 50 + 38 * Math.sin(t * 0.23 + 1.1), ly = 30 + 22 * Math.sin(t * 0.17 + 0.4);
  const leak = 0.55 + 0.25 * Math.sin(t * 0.7) + 0.1 * Math.sin(t * 2.3);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.34), rgba(0,70,96,0.18) 45%, rgba(0,60,90,0.3))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,176,96,0.2), rgba(255,140,60,0) 62%)', mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.32), rgba(255,140,70,0.08) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: leak }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
    </AbsoluteFill>
  );
};
/** The map's CSS grade: an S-curve (contrast), vibrance and a touch of lift, Lumetri's "Creative" basics. */
export const MAP_GRADE = 'contrast(1.12) saturate(1.2) brightness(1.03)';

/** Two parallax layers of soft cloud drifting over the map, each with its shadow on the ground, so the map is never
 *  still even when the camera nearly is. */
const CLOUDS = staticFile('ukweather/fx/clouds.png');
export const Clouds: React.FC<{ t: number; a?: number }> = ({ t, a = 1 }) => {
  if (a <= 0.01) return null;
  const L = [
    { size: 1500, vx: 26, vy: 7, o: 0.16, sh: 0.13, off: 0 },
    { size: 2300, vx: 15, vy: -4, o: 0.11, sh: 0.09, off: 700 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: a }}>
      {L.map((l, i) => {
        const x = l.off + t * l.vx, y = l.off * 0.6 + t * l.vy;
        const base: React.CSSProperties = { position: 'absolute', inset: -200, backgroundImage: `url(${CLOUDS})`, backgroundSize: `${l.size}px ${l.size}px` };
        return (
          <React.Fragment key={i}>
            <div style={{ ...base, backgroundPosition: `${x + 46}px ${y + 70}px`, filter: 'brightness(0) blur(14px)', opacity: l.sh }} />
            <div style={{ ...base, backgroundPosition: `${x}px ${y}px`, opacity: l.o }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** A white flash on each hard cut (the reference's 2-frame flash with a soft tail). */
export const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [SC.flight[0], SC.tilt[0], SC.tilt[1]]) a = Math.max(a, ramp(t, p - 0.05, p, linear) * (1 - ramp(t, p, p + 0.3, easeOut)));
  for (const p of [C.takrati7]) a = Math.max(a, 0.6 * ramp(t, p - 0.03, p, linear) * (1 - ramp(t, p, p + 0.25, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a * 0.85, pointerEvents: 'none' }} /> : null;
};

// ================================================================ line 2: the flight

const bez2 = (a: P, b: P, c: P, u: number): P => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
const MUM = merc(72.88, 19.08), LON = merc(-0.13, 51.51), MID = merc(40, 50);
/** Mumbai → London: a dashed arc draws behind the creator's airliner, which banks along it and casts a shadow. */
const Flight: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.socho2 + 0.05, t1 = C.london2 - 0.05;
  if (t < SC.flight[0] || t > C.london2 + 0.7) return null;
  const u = ramp(t, t0, t1, inOut);
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) pts.push(toScreen(c, bez2(MUM, MID, LON, (i / 60) * u)));
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const [px, py] = toScreen(c, bez2(MUM, MID, LON, u));
  const [qx, qy] = toScreen(c, bez2(MUM, MID, LON, Math.max(0, u - 0.02)));
  const ang = u > 0.02 ? (Math.atan2(py - qy, px - qx) * 180) / Math.PI : -60;
  const img = IMG('uk02_airplane');
  const out = 1 - ramp(t, C.london2 + 0.1, C.london2 + 0.6, easeIn);
  const s = clamp01(pop(t, SC.flight[0] + 0.05, 10, 220)) * (0.9 + 0.1 * Math.sin(u * Math.PI)) * (1 + 1.6 * (1 - out));
  const W = 240, H = img ? (W * img.h) / img.w : 120;
  const bank = Math.sin(t * 2.3) * 4;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: out }}>
        <path d={d} fill="none" stroke="#06101a" strokeWidth={14} strokeLinecap="round" opacity={0.35} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="22 16" strokeDashoffset={-t * 60} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: px - W / 2, top: py - H / 2, width: W, height: H, transform: `rotate(${ang + bank}deg) scale(${s})`, opacity: Math.min(1, out * 1.5) }}>
        {img ? (
          <>
            <Img src={img.src} style={{ position: 'absolute', left: 26, top: 40, width: W, height: H, filter: 'brightness(0) blur(6px)', opacity: 0.35 }} />
            <Img src={img.src} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
          </>
        ) : <svg width={W} height={H}><path d={`M 0 ${H / 2} L ${W} ${H / 2}`} stroke="#fff" strokeWidth={20} /></svg>}
      </div>
    </AbsoluteFill>
  );
};

/** The weather time-of-day chip at the top during the montage: सुबह → दोपहर → शाम → +10 मिनट. */
const Chip: React.FC<{ t: number }> = ({ t }) => {
  const steps: [number, string, string][] = [[C.subah2 - 0.05, 'सुबह', '#7FB8FF'], [C.kohra2 - 0.45, 'दोपहर', '#C9D1DA'], [C.dhoop2 - 0.45, 'शाम', '#FFC93C'], [C.n10_2 - 0.05, '+10 मिनट', '#BFE8FF']];
  const a = window4(t, steps[0][0], steps[0][0] + 0.1, C.hawa2 - 0.2, C.hawa2);
  if (a <= 0) return null;
  let k = 0;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i][0]) k = i;
  const [t0, text, col] = steps[k];
  const flip = 1 - clamp01(pop(t, t0, 10, 300));
  return (
    <div style={{ position: 'absolute', left: 540, top: 300 + Math.sin(t * 2) * 4, transform: `translate(-50%,-50%) rotateX(${flip * 90}deg) rotate(-2deg)`, opacity: a, padding: '10px 34px 4px', borderRadius: 26,
      background: 'rgba(6,16,26,0.78)', border: `5px solid ${col}`, boxShadow: `0 0 26px ${col}88, 0 10px 24px rgba(0,0,0,0.5)`, fontFamily: HEAD, fontWeight: 800, fontSize: 74, color: col, whiteSpace: 'nowrap' }}>{text}</div>
  );
};

// ================================================================ line 5: Colombia

/** The rainfall comparison: two bars grow, the UK's 1,220 mm and Colombia's 3,240 mm (World Bank). */
const Bars: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.2, t1);
  if (a <= 0) return null;
  const H = 430;
  const bar = (v: number, d: number) => ramp(t, t0 + d, t0 + d + 0.7, easeOut) * (v / 3240) * H;
  const B: [string, number, string, number][] = [['UK', 1220, '#D8262B', 0.05], ['COLOMBIA', 3240, '#F28A2E', 0.25]];
  return (
    <div style={{ position: 'absolute', left: 40, top: 760, width: 400, height: H + 200, opacity: a, transform: `translateY(${(1 - clamp01(pop(t, t0, 10, 200))) * 80}px)` }}>
      <div style={{ position: 'absolute', inset: -20, borderRadius: 28, background: 'rgba(6,16,26,0.62)', backdropFilter: 'blur(6px)', border: '3px solid rgba(255,255,255,0.35)' }} />
      {B.map(([name, v, col, d], i) => {
        const h = bar(v, d);
        const shown = Math.round((h / H) * 3240);
        return (
          <div key={name} style={{ position: 'absolute', left: 30 + i * 190, bottom: 70, width: 150 }}>
            <div style={{ position: 'absolute', bottom: h + 12, width: 150, textAlign: 'center', fontFamily: NUM, fontSize: 46, color: '#fff', ...STROKE(6) }}>{shown.toLocaleString('en-IN')}</div>
            <div style={{ position: 'absolute', bottom: 0, width: 150, height: h, borderRadius: '14px 14px 4px 4px', background: `linear-gradient(180deg, ${col}, ${col}aa)`, boxShadow: `0 0 22px ${col}88` }} />
            <div style={{ position: 'absolute', top: 12, width: 150, textAlign: 'center', fontFamily: NUM, fontSize: 28, color: '#fff', letterSpacing: 1 }}>{name}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: -6, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#BFE8FF' }}>बारिश, mm/साल</div>
    </div>
  );
};

/** The three cordilleras of the Colombian Andes (approximate ridge lines, south → north). */
const ANDES: Pt[][] = [
  [[-77.9, 1.0], [-76.9, 3.4], [-76.2, 5.8], [-75.9, 7.6]],
  [[-77.0, 1.3], [-75.9, 3.5], [-75.4, 5.5], [-75.1, 7.9]],
  [[-76.3, 1.6], [-74.6, 4.0], [-73.1, 7.0], [-72.4, 9.2]],
];

// ================================================================ lines 7–10: the four winds

/** The four air masses as arrows converging on Britain (screen space, anchored to Britain's position). */
const windArrows = (c: Cam, t: number): Record<keyof typeof WIND, Arrow> => {
  const [bx, by] = S(c, -2.2, 54.2);
  const k = Math.min(1.25, Math.max(0.6, pxPerM(c) / (1920 / 3.4e6)));
  const r = (d: number) => d * k;
  return {
    west: { p: [bx - r(760), by + r(160), bx - r(520), by + r(200), bx - r(330), by + r(60), bx - r(170), by], color: WIND.west },
    north: { p: [bx + r(80), by - r(860), bx + r(40), by - r(640), bx - r(10), by - r(470), bx, by - r(300)], color: WIND.north },
    south: { p: [bx + r(180), by + r(880), bx + r(120), by + r(660), bx + r(40), by + r(500), bx + r(10), by + r(330)], color: WIND.south },
    east: { p: [bx + r(780), by - r(80), bx + r(560), by - r(110), bx + r(380), by - r(40), bx + r(200), by], color: WIND.east },
  };
};

const Winds: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < C.chaar7 - 0.2 || t >= SC.gulf) {
    if (t < SC.winds - 0.1) return null;
  }
  const A = windArrows(c, t);
  const battle = t < SC.gulf;
  const base = battle ? C.chaar7 - 0.15 : SC.winds;
  const at: Record<keyof typeof WIND, number> = battle
    ? { west: 0, north: 7, south: 14, east: 21 }
    : { west: 0, north: fr(C.uttar9, base), south: fr(C.dakshin9, base), east: fr(C.poorab9, base) };
  const out = battle ? 1 - ramp(t, SC.gulf - 0.3, SC.gulf) : 1;
  const w = winnerAt(t);
  const arrows: Arrow[] = (Object.keys(A) as (keyof typeof WIND)[]).map((key) => ({
    ...A[key], at: at[key], len: 18, w: w === key ? 84 : 62, opacity: (w && w !== key ? 0.32 : 0.92) * out, fork: key === 'west' && !battle ? 1 : 0,
  }));
  return <div style={{ position: 'absolute', inset: 0, opacity: out }}><DashArrows f={fr(t, base)} arrows={arrows} /></div>;
};

const GULF: Pt[] = [[-86, 24], [-72, 29], [-48, 44], [-9, 52.5]];
const Gulf: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < SC.gulf || t > SC.winds + 0.2) return null;
  const p = GULF.flatMap(([lo, la]) => S(c, lo, la));
  const out = 1 - ramp(t, SC.winds - 0.2, SC.winds + 0.2);
  const arrows: Arrow[] = [{ p, color: WIND.west, at: 0, len: 70, w: 74, fork: 1, opacity: 0.9 }];
  const [gx, gy] = S(c, -80, 25);
  const warm = window4(t, C.garm8 - 0.2, C.garm8 + 0.2, C.nami8, C.nami8 + 0.5);
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: 'none' }}>
      {warm > 0 && <div style={{ position: 'absolute', left: gx - 260, top: gy - 260, width: 520, height: 520, borderRadius: '50%', opacity: warm * (0.75 + 0.25 * Math.sin(t * 6)),
        background: 'radial-gradient(circle, rgba(255,140,40,0.75), rgba(255,90,30,0.35) 45%, rgba(255,60,20,0) 70%)', mixBlendMode: 'screen', transform: `scale(${1 + 0.08 * Math.sin(t * 3)})` }} />}
      <DashArrows f={fr(t, C.pashchim8 - 0.05)} arrows={arrows} />
    </AbsoluteFill>
  );
};

// ================================================================ everything over the map

/** The beats drawn in screen space over the map (most anchored to map positions through the camera). */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const uk = S(c, -2.6, 54.4);
  const k = pxPerM(c);
  const col = S(c, -74, 4.5);
  const pac = S(c, -82, 3.5);
  const ell = { cx: uk[0], cy: uk[1] - 420, rx: 0.62e6 * k, ry: 0.98e6 * k };
  const andesBoxTop = col[1] - 540;
  const ribbons = ANDES.map((r) => {
    const q = r.map(([lo, la]) => S(c, lo, la));
    return `M ${q[0][0]} ${q[0][1] - andesBoxTop} C ${q[1][0]} ${q[1][1] - andesBoxTop} ${q[2][0]} ${q[2][1] - andesBoxTop} ${q[3][0]} ${q[3][1] - andesBoxTop}`;
  });
  const pad = IMG('uk01_calendar_pad'), page = IMG('uk01b_calendar_page');
  const B = S(c, -2.2, 54.2);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* line 1: India (the official map), the monsoon, then Britain */}
      <Pin t={t} t0={0.5} t1={C.par1 + 0.1} c={c} at={[79, 23]} text="INDIA" color="#FFB866" size={70} up={60} />
      {t < C.par1 + 0.2 && <RainLayer f={fr(t, 0)} a={0.45 * window4(t, 1.0, 1.6, C.par1 - 0.2, C.par1 + 0.1)} n={60} />}
      <Big t={t} t0={C.bharosa1 - 0.05} t1={C.par1 + 0.05} text="भरोसा नहीं!" x={540} y={1330} size={100} color="#FFE14D" rot={-4} />
      {t >= C.britain1 - 0.3 && t < SC.flight[0] && <RainLayer f={fr(t, 0)} a={0.6 * window4(t, C.britain1, C.britain1 + 0.4, SC.flight[0] - 0.3, SC.flight[0])} n={110} angle={22} />}
      {t >= C.par1 && t < SC.flight[0] && <FogLayer f={fr(t, 0)} a={0.4 * window4(t, C.par1, C.par1 + 0.5, C.britain1 + 0.1, C.britain1 + 0.6)} />}
      <Pin t={t} t0={C.britain1 + 0.15} t1={C.hisaab1 - 0.1} c={c} at={[-1.5, 52.8]} text="BRITAIN" color="#FFD7D0" size={64} />
      <At t0={C.hisaab1 - 0.08} t1={SC.flight[0]} x={540} y={900} w={1080} h={1080}><U04NeonSlam text="बेहिसाब!" out={f60(SC.flight[0] - C.hisaab1 - 0.32)} size={150} /></At>
      <At t0={C.hisaab1 + 0.22} t1={SC.flight[0]} x={540} y={960} w={1080} h={1920}><U05Lightning x={uk[0] + 40} y={uk[1] + 120} seed="hs1" /></At>

      {/* line 2: Mumbai → London, the tourist, the day of weather, the wind */}
      <Pin t={t} t0={SC.flight[0] + 0.1} t1={C.london2 + 0.3} c={c} at={[72.88, 19.08]} text="MUMBAI" color="#FFB866" size={52} />
      {t >= C.mumbai2 - 0.1 && t < C.london2 && (() => {
        const [mx, my] = S(c, 72.88, 19.08);
        const a = window4(t, C.mumbai2 - 0.1, C.mumbai2 + 0.2, C.london2 - 0.5, C.london2);
        return <div style={{ position: 'absolute', left: mx - 170, top: my - 170, width: 340, height: 340, borderRadius: '50%', opacity: a * (0.8 + 0.2 * Math.sin(t * 9)), mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(255,200,60,0.95), rgba(255,120,30,0.5) 40%, rgba(255,80,20,0) 70%)', transform: `scale(${1 + 0.1 * Math.sin(t * 5)})` }} />;
      })()}
      <Pin t={t} t0={C.london2 - 0.15} t1={C.london2 + 0.45} c={c} at={[-0.13, 51.51]} text="LONDON" color="#9FD8FF" size={52} />
      <Flight t={t} c={c} />
      <At t0={SC.tourist} t1={C.baarish2 - 0.1} x={540} y={1150 - 960 + 500} w={800} h={1000}><U01TouristPop open={f60(C.subah2 - SC.tourist)} /></At>
      <At t0={C.baarish2 - 0.1} t1={SC.wind[0]} x={540} y={960} w={1080} h={1920}>
        <U02WeatherMontage rain={0} fog={f60(C.kohra2 - C.baarish2 + 0.1)} sun={f60(C.dhoop2 - C.baarish2 + 0.1)} hail={f60(C.ole2 - C.baarish2 + 0.1)} />
      </At>
      <Chip t={t} />
      <At t0={SC.wind[0]} t1={SC.wind[1]} x={540} y={960} w={1080} h={1920}><U03WindBlow flip={20} rip={44} gone={84} /></At>
      <Big t={t} t0={C.free2} t1={SC.wind[1]} text="FREE!" x={800} y={470} size={130} color="#7CFF6B" rot={-10} font={NUM} />

      {/* line 3: Scotland, 250 rainy days, the wettest place? no. */}
      <Pin t={t} t0={C.scotland3 + 0.1} t1={C.n250_3 - 0.3} c={c} at={[-4.6, 57.1]} text="SCOTLAND" color="#BFE2FF" size={56} />
      <At t0={C.n250_3 - 0.68} t1={C.dekh3 + 0.1} x={540} y={1330} w={1080} h={700} scale={1.35}>
        <U07Calendar pad={pad?.src} page={page?.src} start={14} flips={9} text="दिन बारिश/साल" />
      </At>
      <At t0={C.dekh3} t1={SC.tilt[0]} x={540} y={420} w={1080} h={1080} ay={0}>
        <U08EllipseTitle text="सबसे गीली जगह" line2="दुनिया में?" cx={ell.cx} cy={ell.cy} rx={ell.rx} ry={ell.ry} strike={f60(C.nahi4 - C.dekh3)} />
      </At>
      <Big t={t} t0={C.nahi4} t1={SC.tilt[0]} text="नहीं!" x={540} y={1380} size={170} color="#FF4B4B" rot={-6} />

      {/* line 5: Colombia, number one */}
      <Big t={t} t0={C.pehle5 - 0.05} t1={C.n3240_5 - 0.1} text="नंबर 1" x={540} y={380} size={130} color="#FFE14D" rot={-4} />
      <Pin t={t} t0={C.colombia5 + 0.1} t1={C.n3240_5 + 0.7} c={c} at={[-74.1, 4.7]} text="COLOMBIA" color="#FFD9A8" size={60} up={90} />
      {t >= C.n3240_5 - 0.1 && t < C.wajah5 && (() => {
        const a = window4(t, C.n3240_5 - 0.1, C.n3240_5, C.wajah5 - 0.2, C.wajah5);
        const n = Math.round(3240 * ramp(t, C.n3240_5, C.n3240_5 + 0.8, easeOut));
        return (
          <div style={{ position: 'absolute', left: 540, top: 400, transform: `translate(-50%,-50%) rotate(-3deg) scale(${clamp01(pop(t, C.n3240_5 - 0.1, 9, 260))})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: NUM, fontSize: 170, color: '#FFE14D', lineHeight: 1, textShadow: SHADOW, ...STROKE(12) }}>{n.toLocaleString('en-IN')}</div>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 60, color: '#fff', textShadow: SHADOW, ...STROKE(8) }}>मिलीमीटर/साल</div>
          </div>
        );
      })()}
      <Bars t={t} t0={C.n3240_5 + 0.7} t1={C.wajah5 + 0.1} />
      <At t0={C.garm5 - 0.1} t1={C.pacific5 + 0.2} x={540} y={960} w={1080} h={1920}><U10GiantWord text="गर्म मौसम" y={1300} out={f60(C.pacific5 - C.garm5 - 0.15)} /></At>
      {t >= C.pacific5 - 0.2 && t < C.toh6 + 0.3 && (
        <div style={{ position: 'absolute', left: pac[0] - 520, top: pac[1] - 700, width: 900, height: 1400, borderRadius: '50%', mixBlendMode: 'screen', pointerEvents: 'none',
          opacity: window4(t, C.pacific5 - 0.2, C.pacific5 + 0.3, C.toh6 - 0.3, C.toh6 + 0.3) * (0.75 + 0.25 * Math.sin(t * 3.1)),
          background: 'radial-gradient(ellipse, rgba(80,220,255,0.42), rgba(40,160,255,0.16) 45%, rgba(0,120,255,0) 70%)', transform: `scale(${1 + 0.05 * Math.sin(t * 1.7)})` }} />
      )}
      <At t0={C.pacific5 - 0.05} t1={C.toh6} x={Math.max(330, pac[0] + 60)} y={pac[1] + 200} w={800} h={400} scale={0.8}><U11GlowLabel a="Pacific" b="Ocean" /></At>
      {t >= C.pacific5 + 0.2 && t < C.toh6 && (() => {
        const p0 = S(c, -84, 1), p1 = S(c, -80.5, 2.5), p2 = S(c, -78.5, 3.5), p3 = S(c, -76.8, 4.6);
        const q0 = S(c, -84, 6.5), q1 = S(c, -80.5, 6.6), q2 = S(c, -78.5, 6.4), q3 = S(c, -76.4, 6.2);
        return <DashArrows f={fr(t, C.pacific5 + 0.2)} arrows={[{ p: [...p0, ...p1, ...p2, ...p3], color: '#6FE6FF', at: 0, len: 22, w: 46, opacity: 0.85 }, { p: [...q0, ...q1, ...q2, ...q3], color: '#6FE6FF', at: 8, len: 22, w: 46, opacity: 0.85 }]} />;
      })()}
      <At t0={C.pahaad5 - 0.05} t1={C.kyunki7 - 0.3} x={540} y={andesBoxTop} w={1080} h={1080} ay={0}><U12RibbonGrow paths={ribbons} w={[54, 64, 50].map((v) => v * Math.min(1.4, k / (1920 / 2.6e6)))} /></At>

      {/* line 7: the battlefield, the four winds converge and collide */}
      <At t0={C.jang7 - 0.25} t1={C.chaar7 + 0.3} x={B[0]} y={B[1]} w={1080} h={1080} opacity={1 - ramp(t, C.chaar7 - 0.1, C.chaar7 + 0.3)}><U13HatchHalo title={['मौसम की', 'जंग का मैदान']} rx={300} ry={460} tilt={-12} /></At>
      <At t0={C.takrati7 - 0.05} t1={C.takrati7 + 0.8} x={540} y={960} w={1080} h={1920}><U05Lightning x={B[0]} y={B[1]} seed="tk7" /></At>
      <Winds t={t} c={c} />

      {/* line 8: the Gulf Stream */}
      <Gulf t={t} c={c} />
      <Big t={t} t0={C.sponsor8 - 0.05} t1={C.gulf8 - 0.05} text="बारिश की SPONSOR" x={540} y={620} size={80} color="#FFE14D" rot={-5} />
      <At t0={C.gulf8 - 0.15} t1={C.nami8} x={540} y={900} w={1080} h={1080}><U15FlyAtCamera text="Gulf Stream" fly={f60(C.nami8 - 0.55 - C.gulf8 + 0.15)} /></At>
      <Big t={t} t0={C.garm8 - 0.05} t1={C.nami8 - 0.4} text="गर्म समुंदर" x={540} y={1450} size={96} color="#FFB866" rot={-3} />
      <At t0={C.nami8 - 0.1} t1={SC.winds + 0.3} x={540} y={960} w={1080} h={1920} opacity={1}><U16WindCurls density={1.2} moisture angle={-8} /></At>
      {t >= C.barsa8 - 0.1 && t < SC.winds + 0.4 && <RainLayer f={fr(t, 0)} a={0.7 * window4(t, C.barsa8 - 0.1, C.barsa8 + 0.3, SC.winds, SC.winds + 0.4)} n={120} angle={18} />}

      {/* line 9: the four air masses, tagged */}
      <At t0={SC.winds + 0.05} t1={C.video11 - 0.2} x={250} y={1180} w={600} h={300} scale={0.85}><U17AirTag lines={['Gulf Stream', 'नमी वाली हवा']} color={WIND.west} from="left" tilt={-4} /></At>
      <At t0={C.uttar9 + 0.1} t1={C.video11 - 0.2} x={540} y={300} w={600} h={300} scale={0.85}><U17AirTag lines={['Arctic', 'ठंडी हवा']} color={WIND.north} from="top" tilt={3} dark /></At>
      <At t0={C.dakshin9 + 0.1} t1={C.video11 - 0.2} x={600} y={1600} w={600} h={300} scale={0.85}><U17AirTag lines={['दक्षिण', 'गर्म हवा']} color={WIND.south} from="bottom" tilt={-3} /></At>
      <At t0={C.poorab9 + 0.1} t1={C.video11 - 0.2} x={830} y={760} w={600} h={300} scale={0.8}><U17AirTag lines={['Europe', 'सूखी हवा']} color={WIND.east} from="right" tilt={4} dark /></At>
      <Big t={t} t0={C.mausam10 - 0.05} t1={C.video11 - 0.1} text="आज का मौसम!" x={540} y={1430} size={100} color="#FFE14D" rot={-4} />
    </AbsoluteFill>
  );
};

/** The close: the send button with the umbrella for the friend, over the top half. */
export const Close: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  <>
  <div style={{ position: 'absolute', inset: 0, transform: 'translateY(-480px)' }}><Pin t={t} t0={C.london11 - 0.05} t1={DURATION_S + 1} c={c} at={[-0.13, 51.51]} text="LONDON" color="#9FD8FF" size={48} /></div>
  <At t0={C.video11 - 0.1} t1={DURATION_S + 1} x={300} y={480} w={600} h={700} scale={0.8}><U18SendUmbrella launch={f60(C.chhata11 + 0.4 - C.video11 + 0.1)} /></At>
  </>
);

/** The tilt's country tags: the 73 countries wetter than the UK (World Bank), at their screen positions. */
export const wetterTags = (c: Cam): [number, number, string][] => GEO.wetter.map(([name, lon, lat]) => {
  const [x, y] = S(c, lon, lat);
  return [x, y, name.replace('Democratic Republic of the Congo', 'DR Congo').replace('Papua New Guinea', 'PNG')];
});
export const TiltCounter: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.n70_5 - 0.1, C.n70_5, SC.tilt[1] - 0.2, SC.tilt[1]);
  if (a <= 0) return null;
  const n = Math.round(73 * ramp(t, C.n70_5, C.n70_5 + 1.6, easeOut));
  return (
    <div style={{ position: 'absolute', left: 540, top: 380, transform: `translate(-50%,-50%) rotate(-3deg) scale(${clamp01(pop(t, C.n70_5 - 0.1, 9, 260))})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div style={{ fontFamily: NUM, fontSize: 190, color: '#FFE14D', lineHeight: 1, textShadow: SHADOW, ...STROKE(12) }}>{n}</div>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 58, color: '#fff', textShadow: SHADOW, ...STROKE(8) }}>देश, Britain से ज़्यादा बारिश</div>
    </div>
  );
};
export const UKTag: React.FC<{ t: number; c: Cam }> = ({ t, c }) => <Pin t={t} t0={C.britain5 - 0.1} t1={SC.tilt[1]} c={c} at={[-2, 53.5]} text="UK" color="#FF6A5C" size={64} up={110} />;
