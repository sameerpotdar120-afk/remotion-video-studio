import React from 'react';
import { AbsoluteFill, Img, Sequence, random, staticFile } from 'remotion';
import SIZES from '../../../public/panama/img_sizes.json';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SCENES, merc, pxPerM, sceneT0, toScreen } from './cam';
import { SUB } from '../../timezones/fonts';
import { COL } from './regions';
import { NUM, UI } from '../motion/font';
import { ShipTop } from '../motion/Ships';
import { P01ShipQueue } from '../motion/P01ShipQueue';
import { P02BobArrow } from '../motion/P02BobArrow';
import { P03Odometer } from '../motion/P03Odometer';
import { P04Sticker } from '../motion/P04Sticker';
import { P05Stamp } from '../motion/P05Stamp';
import { P06Label } from '../motion/P06Label';
import { P07SaltFresh } from '../motion/P07SaltFresh';
import { P08Locks } from '../motion/P08Locks';
import { P09WaterArc } from '../motion/P09WaterArc';
import { P10Pools } from '../motion/P10Pools';
import { P11RainCloud } from '../motion/P11RainCloud';
import { P12Kid } from '../motion/P12Kid';
import { P13Sun } from '../motion/P13Sun';
import { P14Waiting } from '../motion/P14Waiting';
import { P16Calendar } from '../motion/P16Calendar';
import { P17Auction } from '../motion/P17Auction';
import { P18LakeBubble } from '../motion/P18LakeBubble';
import { P19Balance } from '../motion/P19Balance';
import { P20Dam } from '../motion/P20Dam';
import { P21Ecg } from '../motion/P21Ecg';
import { P22Route } from '../motion/P22Route';

export { useFonts } from '../motion/font';

const FPS = 60;
const STROKE = (w: number, col = '#06101a') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
type Pt = [number, number];
const S = (c: Cam, lon: number, lat: number): Pt => toScreen(c, merc(lon, lat));
const D = GEO.places_deg;
const SD = (c: Cam, k: keyof typeof GEO.places_deg | string): Pt => S(c, D[k][0], D[k][1]);
const f60 = (s: number) => Math.round(s * FPS);
const fr = (t: number, t0: number) => (t - t0) * FPS;
const polyD = (c: Cam, pts: P[], dy = 0) => pts.map((p, i) => { const [x, y] = toScreen(c, p); return `${i ? 'L' : 'M'}${x.toFixed(1)},${(y - dy).toFixed(1)}`; }).join('');
const polyLen = (c: Cam, pts: P[]) => { let L = 0; for (let i = 1; i < pts.length; i++) { const a = toScreen(c, pts[i - 1]), b = toScreen(c, pts[i]); L += Math.hypot(b[0] - a[0], b[1] - a[1]); } return L; };

/** The creator's images (cut out by tools/cut_panama_assets.py); missing ones fall back to the drawn stand-ins. */
type Size = { w: number; h: number; ext?: string };
const SZ = SIZES as Record<string, Size>;
export const IMG = (k: string) => (SZ[k] ? staticFile(`panama/img/${k}.${SZ[k].ext ?? 'png'}`) : undefined);
const SHIP = IMG('pc02_container_ship_top'), GOLD = IMG('pc01_lpg_carrier_top'), SIDE = IMG('pc03_container_ship_side');

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
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; rot?: number; font?: string }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', rot = -3, font = UI }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot + Math.sin((t - t0) * 1.3) * 0.8}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.15, textShadow: SHADOW, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A map pin: a dot with a pulsing ring and a label that pops up on a short leader, bobbing. */
const Pin: React.FC<{ t: number; t0: number; t1: number; at: Pt; text: string; color?: string; size?: number; up?: number }> = ({ t, t0, t1, at, text, color = '#fff', size = 54, up = 70 }) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const [x, y] = at;
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
const HOT = /^[+\-−0-9,.~%:"$]*[0-9A-Za-zÁ-úí]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.05;
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

/** The loop: every drifting thing completes whole cycles over the video, so the last frame matches frame 0. */
const W = (k: number) => (2 * Math.PI * k) / DURATION_S;

/** The house grade (Lumetri-style, no grain): teal split-tone shadows, warm highlights, a drifting light leak, a
 *  vignette and darker top and bottom edges. The leak's path is periodic over the loop. */
export const Grade: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  const lx = 50 + 38 * Math.sin(t * W(4) + 1.1), ly = 30 + 22 * Math.sin(t * W(3) + 0.4);
  const leak = 0.55 + 0.25 * Math.sin(t * W(11)) + 0.1 * Math.sin(t * W(37));
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
export const MAP_GRADE = 'contrast(1.12) saturate(1.2) brightness(1.03)';

/** Two parallax layers of soft cloud drifting over the map, each casting its shadow; each moves exactly one tile
 *  over the video, so the loop closes. */
const CLOUDS = staticFile('ukweather/fx/clouds.png');
export const Clouds: React.FC<{ t: number; a?: number }> = ({ t, a = 1 }) => {
  if (a <= 0.01) return null;
  const L = [
    { size: 1500, kx: 2, ky: 0, o: 0.14, sh: 0.11, off: 0 },
    { size: 2300, kx: 1, ky: 0, o: 0.1, sh: 0.08, off: 700 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: a }}>
      {L.map((l, i) => {
        const u = t / DURATION_S;
        const x = l.off + u * l.kx * l.size, y = l.off * 0.6 + 30 * Math.sin(t * W(3) + i);
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

/** A white flash on each hard cut between scenes (2 frames up, a soft tail). */
export const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const s of SCENES().slice(1)) a = Math.max(a, ramp(t, s.t0 - 0.05, s.t0, linear) * (1 - ramp(t, s.t0, s.t0 + 0.3, easeOut)));
  for (const p of [C.khatam1, C.record5, C.khatam8]) a = Math.max(a, 0.5 * ramp(t, p - 0.03, p, linear) * (1 - ramp(t, p, p + 0.25, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a * 0.85, pointerEvents: 'none' }} /> : null;
};

/** The stamps' worn red ink reads weakly over the map: lift it with a white rim and a dark halo. */
const Inked: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 2px #fff) drop-shadow(0 6px 16px rgba(0,0,0,0.7)) saturate(1.3) brightness(1.1)' }}>{children}</AbsoluteFill>
);

// ================================================================ map-drawn lines

/** The canal: a glowing dashed line from Colón to Panama City, drawing on, its dashes flowing toward the Pacific. */
const CanalLine: React.FC<{ t: number; c: Cam; t0: number; t1: number }> = ({ t, c, t0, t1 }) => {
  const a = window4(t, t0, t0 + 0.2, t1 - 0.3, t1);
  if (a <= 0) return null;
  const d = polyD(c, GEO.canal);
  const L = polyLen(c, GEO.canal);
  const draw = ramp(t, t0, t0 + 0.9, easeOut);
  const w = Math.max(5, Math.min(12, pxPerM(c) * 400));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#FFE14D" strokeWidth={w * 3.2} strokeLinecap="round" opacity={0.25} strokeDasharray={`${L * draw} ${L * 2}`} style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke="#06101a" strokeWidth={w + 6} strokeLinecap="round" opacity={0.5} strokeDasharray={`${L * draw} ${L * 2}`} />
      <path d={d} fill="none" stroke="#FFE14D" strokeWidth={w} strokeLinecap="round" strokeDasharray={draw < 1 ? `${L * draw} ${L * 2}` : `${w * 3} ${w * 1.6}`} strokeDashoffset={draw < 1 ? 0 : -t * 60} />
    </svg>
  );
};

/** Little ships streaming through the canal both ways (line 4: 36 ships a day), each with a soft wake glow. */
const CanalShips: React.FC<{ t: number; c: Cam; t0: number; t1: number; n?: number }> = ({ t, c, t0, t1, n = 9 }) => {
  const a = window4(t, t0, t0 + 0.3, t1 - 0.3, t1);
  if (a <= 0) return null;
  const pts = GEO.canal.map((p) => toScreen(c, p));
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = seg[seg.length - 1];
  const at = (u: number): [number, number, number] => {
    const s = u * L;
    let i = 1;
    while (i < seg.length - 1 && seg[i] < s) i++;
    const k = (s - seg[i - 1]) / Math.max(1e-6, seg[i] - seg[i - 1]);
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return [lerp(x0, x1, k), lerp(y0, y1, k), (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI];
  };
  return (
    <AbsoluteFill style={{ opacity: a, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        const u0 = ((i / n + (t - t0) * 0.05 * dir) % 1 + 1) % 1;
        const [x, y, ang] = at(u0);
        const s = clamp01(pop(t, t0 + i * 0.08, 8, 220));
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${ang + (dir < 0 ? 180 : 0)}deg) translateY(${dir * 9}px) scale(${s})` }}>
            <div style={{ position: 'absolute', left: -90, top: -12, width: 100, height: 24, borderRadius: 10, background: 'rgba(255,255,255,0.45)', filter: 'blur(5px)' }} />
            <ShipTop len={84} src={SHIP} seed={`cs${i}`} f={t * 60 + i * 9} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ================================================================ the stages (full-screen scenes between map runs)

/** A full-frame photo background that never holds still: a slow push, drift and a breathing light. */
const Photo: React.FC<{ src?: string; t: number; t0: number; z0?: number; z1?: number; dx?: number; dur?: number; children?: React.ReactNode; fallback: string }> = ({ src, t, t0, z0 = 1.04, z1 = 1.14, dx = -30, dur = 6, children, fallback }) => {
  const u = ramp(t, t0, t0 + dur, linear);
  const z = lerp(z0, z1, u);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: fallback }}>
      {src && <Img src={src} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z}) translate(${dx * u + Math.sin(t * 0.9) * 4}px, ${Math.cos(t * 0.8) * 4}px) rotate(${Math.sin(t * 0.5) * 0.4}deg)`, filter: MAP_GRADE }} />}
      {children}
    </AbsoluteFill>
  );
};

/** Heat shimmer: a few warm translucent bands rising over the drought. */
const Heat: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
    {Array.from({ length: 6 }, (_, i) => {
      const y = 1900 - (((t * 90 + i * 330) % 1980));
      return <div key={i} style={{ position: 'absolute', left: -100, right: -100, top: y, height: 120, background: 'linear-gradient(180deg, rgba(255,200,120,0), rgba(255,190,110,0.12), rgba(255,200,120,0))', transform: `skewY(${Math.sin(t * 2 + i) * 2}deg)` }} />;
    })}
  </AbsoluteFill>
);

/** Dust motes drifting across a stage. */
const Motes: React.FC<{ t: number; n?: number; color?: string }> = ({ t, n = 40, color = 'rgba(255,240,210,0.7)' }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => {
      const x = ((random(`mx${i}`) * 1080 + t * (12 + random(`mv${i}`) * 30)) % 1140) - 30;
      const y = random(`my${i}`) * 1920 + Math.sin(t * 0.8 + i) * 30;
      const r = 2 + random(`mr${i}`) * 4;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: color, opacity: 0.3 + 0.5 * Math.abs(Math.sin(t * 1.3 + i)), filter: 'blur(0.6px)' }} />;
    })}
  </AbsoluteFill>
);

export const Stage: React.FC<{ t: number; k: string; t0: number; t1: number }> = ({ t, k, t0, t1 }) => {
  if (k === 'locks') return <Sequence from={f60(t0)} durationInFrames={f60(t1 - t0) + 2} layout="none"><P08Locks dur={f60(t1 - t0)} ship={SIDE} /></Sequence>;
  if (k === 'pools') return <Sequence from={f60(t0)} durationInFrames={f60(t1 - t0) + 2} layout="none"><P10Pools n={80} drain={f60(C.khatam3 - t0)} ship={SIDE} /></Sequence>;
  if (k === 'drought') {
    return (
      <Photo src={IMG('pc04_dry_lakebed_bg')} t={t} t0={t0} dur={t1 - t0} z0={1.05} z1={1.16} dx={20} fallback="#B99468">
        <Heat t={t} />
        <Motes t={t} n={34} />
        <At t0={t0} t1={t1} x={780} y={330} w={600} h={600} scale={0.9}><P13Sun /></At>
        <Big t={t} t0={C.n2023_5 - 0.05} t1={C.n22_5 - 0.4} text="2023" x={330} y={420} size={190} color="#FFE14D" rot={-6} font={NUM} />
        <Big t={t} t0={C.n2023_5 + 0.5} t1={C.n22_5 - 0.4} text="बारिश नहीं" x={330} y={580} size={78} color="#fff" rot={-4} />
        <At t0={C.n22_5 - 1.0} t1={t1} x={540} y={600} w={1000} h={260}><P03Odometer from={36} to={22} prefix="" suffix="ships/दिन" down dur={50} /></At>
        <At t0={t0} t1={t1} x={540} y={1430} w={800} h={1000} scale={0.95}>
          <P12Kid beats={[[0, 'smile', ''], [f60(C.n2023_5 + 0.8 - t0), 'cry', ''], [f60(C.n22_5 - t0), 'oh', '!']]} />
        </At>
      </Photo>
    );
  }
  if (k === 'auction') {
    return (
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #2A3D52, #0C141E 75%)' }}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + 20 * Math.sin(t * 0.9)}% 30%, rgba(255,214,140,0.28), rgba(255,214,140,0) 40%)`, mixBlendMode: 'screen' }} />
        <Motes t={t} n={30} color="rgba(255,230,170,0.8)" />
        <Big t={t} t0={t0 + 0.05} t1={t1} text="AUCTION" x={540} y={420} size={150} color="#FFD53D" rot={-4} font={NUM} />
        <At t0={t0 + 0.1} t1={t1 + 0.1} x={540} y={1060} w={1080} h={1080} scale={1.05}><P17Auction hammer={IMG('pc06_gavel_hammer')} block={IMG('pc06b_gavel_block')} /></At>
      </AbsoluteFill>
    );
  }
  if (k === 'city') {
    const lake = staticFile('panama/maps/canal_geo.jpg');
    return (
      <Photo src={IMG('pc05_panama_city_bg')} t={t} t0={t0} dur={t1 - t0} z0={1.06} z1={1.15} dx={-24} fallback="#6FB4E0">
        <Motes t={t} n={20} color="rgba(255,255,255,0.7)" />
        {/* the split shows the top half: everything sits in y < 900 */}
        <Big t={t} t0={t0 + 0.15} t1={t1} text="PANAMA CITY" x={540} y={150} size={96} color="#fff" rot={-3} font={NUM} />
        <At t0={C.gatun6 - 0.15} t1={t1} x={760} y={480} w={500} h={700} scale={0.78}><P18LakeBubble src={lake} /></At>
        <At t0={C.aadhe6 - 0.1} t1={t1} x={300} y={560} w={600} h={300} scale={0.95}><P06Label text="आधा Panama" look="pill" leader={false} size={52} /></At>
        <Big t={t} t0={C.peete6} t1={t1} text="यही पानी पीता है" x={330} y={720} size={62} color="#7FE3FF" rot={-3} />
      </Photo>
    );
  }
  return null;
};

// ================================================================ everything over the map

export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const lake = SD(c, 'gatun_lake');
  const pac = SD(c, 'pacific_anchor'), atl = SD(c, 'atlantic_anchor'), colon = SD(c, 'colon'), city = SD(c, 'panama_city');
  const sc = (k: string, n = 1) => sceneT0(k as never, n);
  const L1 = sc('locks'), M3 = sc('map', 2), PO = sc('pools'), M4 = sc('map', 3), DR = sc('drought'), M5 = sc('map', 4), AU = sc('auction'), M6 = sc('map', 5), CI = sc('city'), M7 = sc('map', 6);
  const box = (p: Pt): [number, number] => [p[0], p[1] - 420];
  // the Río Indio and the dam, in P20's 1080×1080 box centred on screen
  const rio = polyD(c, GEO.rio_indio, 420);
  const dam = box(SD(c, 'rio_indio_dam'));
  // the route round South America (P22 draws it full-screen)
  const route = polyD(c, GEO.route);
  const routeLen = polyLen(c, GEO.route);
  const capeHorn = SD(c, 'cape_horn');
  // the overtake in line 1 lands on "line तोड़ने"
  const over1 = f60(C.line1 - 0.9);
  const qA = (t0: number, t1: number) => window4(t, t0, t0 + 0.35, t1 - 0.35, t1);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* line 1: the line of ships, the gold one skipping it */}
      <AbsoluteFill style={{ opacity: qA(-1, C.kyunki1 + 0.1) }}>
        <At t0={0} t1={C.kyunki1 + 0.2} x={540} y={960} w={1080} h={1920}><P01ShipQueue angle={-118} overtake={over1} ship={SHIP} gold={GOLD} /></At>
      </AbsoluteFill>
      <At t0={0} t1={C.kyun1 + 0.2} x={540} y={330} w={1080} h={500}><P04Sticker out={f60(C.kyun1 - 0.1)} /></At>
      <At t0={0.0} t1={1.2} x={560} y={760} w={300} h={300} ax={70 / 300} ay={230 / 300} rot={-30}><P02BobArrow out={f60(0.95)} /></At>
      <At t0={C.n53_1 - 0.08} t1={C.kyun1} x={540} y={1180} w={1000} h={260}><P03Odometer from={0} to={5300000} dur={f60(C.line1 - C.n53_1 - 0.8)} /></At>
      <At t0={C.line1 - 0.1} t1={C.kyun1} x={540} y={1400} w={600} h={300} scale={1.1}><P06Label text="SKIP THE LINE" look="pill" leader={false} size={44} /></At>
      <Big t={t} t0={C.kyun1 - 0.03} t1={C.kyunki1 + 0.1} text="क्यों?" x={540} y={760} size={200} color="#FFE14D" rot={-6} />
      <Pin t={t} t0={C.kyunki1 + 0.3} t1={C.khatam1 - 0.2} at={S(c, -80.3, 8.55)} text="PANAMA" color="#FFD98A" size={60} up={90} />
      <At t0={C.khatam1 - 0.05} t1={C.ajeeb2 + 0.2} x={540} y={1260} w={1000} h={320} scale={0.95}><Inked><P05Stamp text="पानी खत्म!" rot={-6} /></Inked></At>

      {/* line 2: salt or fresh? the canal runs on the lake */}
      <CanalLine t={t} c={c} t0={C.ajeeb2 + 0.2} t1={L1.t0} />
      <Big t={t} t0={C.ajeeb2 + 0.05} t1={C.samundar2 - 0.2} text="अजीब बात" x={540} y={430} size={110} color="#fff" rot={-4} />
      <At t0={C.samundar2 - 0.1} t1={C.insaan2 - 0.1} x={540} y={960} w={1080} h={1080}>
        <P07SaltFresh a={box(colon)} b={box(pac)} c={box(lake)} check={f60(C.gatun2 - C.samundar2 + 0.1)} />
      </At>
      <At t0={C.gatun2 + 0.4} t1={L1.t0} x={lake[0]} y={lake[1]} w={600} h={300} ay={260 / 300}><P06Label text="Gatun Lake" /></At>
      <At t0={C.insaan2 - 0.05} t1={L1.t0} x={540} y={1360} w={600} h={300} scale={1.05}><P06Label text="इंसानों की बनाई" look="red" leader={false} size={50} /></At>
      <Big t={t} t0={C.meethe2 - 0.05} t1={L1.t0} text="मीठा पानी" x={540} y={440} size={120} color="#7FE3FF" rot={-4} />

      {/* line 3: each ship pours the lake into the sea */}
      <Big t={t} t0={M3.t0 + 0.1} t1={C.n20_3 - 0.3} text="पानी का खेल" x={540} y={430} size={120} color="#FFE14D" rot={-4} />
      <At t0={C.n20_3 - 1.3} t1={PO.t0} x={540} y={960} w={1080} h={1080}>
        <P09WaterArc p={[...box(lake), (lake[0] + pac[0]) / 2, Math.min(lake[1], pac[1]) - 420 - 260, ...box(pac)]} />
      </At>
      <At t0={C.n20_3 - 0.1} t1={PO.t0} x={540} y={420} w={1000} h={260}><P03Odometer from={0} to={200000000} prefix="" suffix="लीटर" indian dur={70} size={120} /></At>
      <Pin t={t} t0={C.samundar3 - 0.05} t1={PO.t0} at={pac} text="PACIFIC" color="#9FE3FF" size={52} />

      {/* line 4: 36 ships a day, and only rain refills the lake */}
      <CanalLine t={t} c={c} t0={M4.t0} t1={DR.t0} />
      <CanalShips t={t} c={c} t0={C.n36_4 - 0.5} t1={DR.t0} n={12} />
      <Big t={t} t0={M4.t0 + 0.1} t1={C.n36_4 - 0.2} text="अब हिसाब लगाओ" x={540} y={430} size={104} color="#fff" rot={-4} />
      <At t0={C.n36_4 - 0.1} t1={C.baarish4 - 0.4} x={540} y={420} w={1000} h={260}><P03Odometer from={0} to={36} prefix="" suffix="ships/दिन" dur={40} /></At>
      <At t0={C.baarish4 - 0.5} t1={DR.t0 + 0.1} x={lake[0]} y={lake[1] - 330} w={800} h={800} scale={0.85}><P11RainCloud /></At>
      <Big t={t} t0={C.baarish4 + 0.1} t1={DR.t0} text="सिर्फ़ बारिश" x={540} y={1380} size={96} color="#7FE3FF" rot={-3} />

      {/* line 5: the lines at both ends, then the auction's queue */}
      <At t0={C.jaise5 + 0.4} t1={C.line5 + 0.6} x={atl[0]} y={atl[1]} w={600} h={600} scale={0.6} opacity={qA(C.jaise5 + 0.4, C.line5 + 0.6)}><P14Waiting count={16} ship={SHIP} /></At>
      <At t0={C.jaise5 + 0.9} t1={C.line5 + 0.6} x={pac[0]} y={pac[1]} w={600} h={600} scale={0.6} opacity={qA(C.jaise5 + 0.9, C.line5 + 0.6)}><P14Waiting count={18} ship={SHIP} /></At>
      <Big t={t} t0={C.jaise5 + 0.1} t1={C.line5 + 0.5} text="Ships कम = line लंबी" x={540} y={430} size={84} color="#fff" rot={-4} />
      <AbsoluteFill style={{ opacity: qA(C.line5 + 0.4, AU.t0 + 0.2) }}>
        <At t0={C.line5 + 0.4} t1={AU.t0 + 0.2} x={540} y={960} w={1080} h={1920}><P01ShipQueue angle={-118} n={13} overtake={9999} lanes={3} ship={SHIP} gold={SHIP} /></At>
      </AbsoluteFill>
      <Big t={t} t0={C.line5 + 0.9} t1={AU.t0} text="किलोमीटर लंबी line" x={540} y={430} size={92} color="#FFE14D" rot={-4} />
      <AbsoluteFill style={{ opacity: qA(M6.t0 - 0.1, CI.t0 + 0.2) }}>
        <At t0={M6.t0 - 0.1} t1={CI.t0 + 0.2} x={540} y={960} w={1080} h={1920}><P01ShipQueue angle={-118} n={13} overtake={f60(C.n53_5 - 0.6 - M6.t0)} lanes={3} ship={SHIP} gold={GOLD} /></At>
      </AbsoluteFill>
      <At t0={C.sept5 - 0.1} t1={CI.t0} x={830} y={420} w={400} h={400} scale={0.9}><P16Calendar month="SEPTEMBER" year="2026" /></At>
      <At t0={C.n53_5 - 0.1} t1={CI.t0} x={500} y={1180} w={1000} h={260}><P03Odometer from={0} to={5300000} dur={60} /></At>
      <At t0={C.record5 - 0.05} t1={CI.t0} x={540} y={1400} w={1000} h={320} scale={0.9}><Inked><P05Stamp text="RECORD" /></Inked></At>

      {/* line 6 (after the city): one lake, two jobs */}
      <At t0={M7.t0 + 0.1} t1={C.rio7 - 0.6} x={540} y={980} w={900} h={700}><P19Balance /></At>
      <At t0={M7.t0 + 0.2} t1={C.rio7 - 0.6} x={lake[0]} y={lake[1]} w={600} h={300} ay={260 / 300} scale={0.85}><P06Label text="Gatun Lake" /></At>

      {/* line 7: the Río Indio dam (Null's split keeps the top half: all of this sits around the middle) */}
      <At t0={C.rio7 - 0.3} t1={C.socho8} x={540} y={960} w={1080} h={1080}>
        <P20Dam river={rio} dam={dam} to={box(lake)} name="Río Indio" />
      </At>
      <Big t={t} t0={C.zinda7 - 0.3} t1={C.socho8} text="Canal ज़िंदा रहे" x={540} y={560} size={84} color="#7CFF6B" rot={-4} />
      <At t0={C.zinda7 - 0.1} t1={C.samerica8 - 0.3} x={540} y={760} w={800} h={240}><P21Ecg flat={f60(C.khatam8 - C.zinda7 + 0.1)} /></At>

      {/* line 8: if the water runs out: the long way round */}
      <Big t={t} t0={C.socho8 - 0.05} t1={C.khatam8 - 0.1} text="पर सोचो…" x={540} y={430} size={120} color="#fff" rot={-4} />
      <Big t={t} t0={C.khatam8 - 0.05} t1={C.samerica8 - 0.2} text="पानी खत्म?" x={540} y={1280} size={130} color="#FF4B4B" rot={-5} />
      <At t0={C.samerica8 + 0.4} t1={C.isiliye8 + 0.2} x={540} y={960} w={1080} h={1920} opacity={1 - ramp(t, C.isiliye8 - 0.2, C.isiliye8 + 0.2)}>
        <P22Route d={route} len={routeLen} dur={f60(C.n13k_8 - C.samerica8 - 0.4)} km={13000} tag={[Math.min(860, capeHorn[0] + 260), Math.min(1500, capeHorn[1] - 60)]} />
      </At>
      <Pin t={t} t0={C.samerica8 + 0.5} t1={C.isiliye8} at={S(c, -60, -12)} text="SOUTH AMERICA" color="#FFD9A8" size={50} up={60} />

      {/* the loop: the opening shot rebuilt so the last frame runs straight into frame 0 */}
      <LoopClose t={t} />
    </AbsoluteFill>
  );
};

/** The last ~0.8 s: the queue and the sticker fade in under the whip back, on clocks offset so that the final frame
 *  is the frame just before frame 0. */
const LOOP_T0 = 99.95;
const LoopClose: React.FC<{ t: number }> = ({ t }) => {
  if (t < LOOP_T0) return null;
  const N = Math.ceil(DURATION_S * FPS);
  const fo = f60(LOOP_T0) - N;
  const a = ramp(t, LOOP_T0, DURATION_S - 0.15, easeIn);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <At t0={LOOP_T0} t1={DURATION_S + 1} x={540} y={960} w={1080} h={1920}><P01ShipQueue angle={-118} overtake={f60(C.line1 - 0.9)} ship={SHIP} gold={GOLD} fo={fo} /></At>
      <At t0={LOOP_T0} t1={DURATION_S + 1} x={540} y={330} w={1080} h={500}><P04Sticker fo={fo} /></At>
    </AbsoluteFill>
  );
};

export { easeIn, easeOut, inOut };
