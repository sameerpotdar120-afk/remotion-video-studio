import React from 'react';
import { AbsoluteFill, Freeze, Img, Loop, OffthreadVideo, Sequence, random, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SC, merc, pxPerM, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL } from './regions';
import sizes from '../../public/chile/img_sizes.json';

const FPS = 60;

/** A motion asset rendered from motion_assets.md (transparent 60 fps WebM): loops, or holds its last frame. */
const LEN: Record<string, number> = { m01_chili_label: 300, m02_long_letters: 240, m03_ship_to_emoji: 300, m04_flag_talk: 240, m04_flag_shocked: 240, m04_flag_south: 240,
  m05_mini_flags: 120, m06_bolivia_face: 300, m07_arrows_wider: 150, m07_arrows_longer: 150, m08_send_burst: 180, m09_title_1500: 180 };
const Clip: React.FC<{ name: string; loop?: boolean }> = ({ name, loop }) => {
  const n = LEN[name];
  const v = <OffthreadVideo src={staticFile(`chile/motion/${name}.webm`)} transparent muted style={{ width: '100%', height: '100%' }} />;
  if (loop) return <Loop durationInFrames={n}>{v}</Loop>;
  return (
    <>
      <Sequence durationInFrames={n} layout="none">{v}</Sequence>
      <Sequence from={n} layout="none"><Freeze frame={n - 1}>{v}</Freeze></Sequence>
    </>
  );
};
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
const pl = GEO.places;
const SZ = sizes as unknown as Record<string, [number, number]>;

/** A motion asset placed on screen and started at second t0 (it keeps running, or holds, until t1). */
const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, children,
}) => (
  <Sequence from={Math.round(t0 * FPS)} durationInFrames={Math.max(1, Math.round((t1 - t0) * FPS))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box. */
export const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number }> = ({ t, t0, t1, text, x, y, color, pin, size = 46 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.72)', color: '#fff',
          padding: '8px 24px 2px 20px', borderRadius: 10, border: '4px solid #fff', fontFamily: NUM, fontSize: size, letterSpacing: 1.5,
          boxShadow: `0 8px 22px rgba(0,0,0,0.55), 0 0 18px ${color}66`, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: color, display: 'inline-block', marginTop: -6, boxShadow: `0 0 10px ${color}` }} />{text}
        </div>
      )}
    </>
  );
};

/** The name written on the shape itself, letters popping in one after another (reference frames 522–530). */
const MapName: React.FC<{ t: number; t0: number; t1: number; text: string; at: P; c: Cam; size?: number; caps?: boolean }> = ({ t, t0, t1, text, at, c, size = 64, caps }) => {
  const out = ramp(t, t1, t1 + 0.2, easeIn);
  if (t < t0 || out >= 1) return null;
  const [x, y] = toScreen(c, at);
  const chars = Array.from(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${c.rot}deg)`, whiteSpace: 'nowrap', opacity: 1 - out,
      fontFamily: NUM, fontSize: size, letterSpacing: caps ? 4 : 1, color: '#fff', textShadow: '0 4px 10px rgba(0,0,0,0.6)', ...STROKE(7, '#0b3a12') }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ display: 'inline-block', transform: `scale(${clamp01(pop(t, t0 + i * 0.045, 8, 300))})` }}>{ch === ' ' ? '\u00a0' : ch}</span>
      ))}
    </div>
  );
};

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number; fill?: string }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2, fill }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 260));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 800, fontSize: size,
      color: '#fff', background: fill ?? 'rgba(8,16,26,0.82)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** A rolling counter. */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number; comma?: boolean }> = ({
  t, t0, t1, to, x, y, size = 160, color = COL.gold, pre = '', post = '', dur = 0.8, comma,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(0, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>
      {pre}{comma ? v.toLocaleString('en-US') : v}<span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.45 }}>{post}</span>
    </div>
  );
};

/** A UE5 cut-out that pops in with overshoot, floats, and pops out. h = its height on screen. */
const Sticker: React.FC<{ t: number; t0: number; t1: number; name: string; x: number; y: number; h: number; rot?: number; flip?: boolean; grey?: number; children?: React.ReactNode }> = ({
  t, t0, t1, name, x, y, h, rot = 0, flip, grey = 0, children,
}) => {
  if (t < t0 - 0.02 || t > t1 + 0.3) return null;
  const [w0, h0] = SZ[name];
  const w = (h * w0) / h0;
  const s = clamp01(pop(t, t0, 9, 230)) * (1 - ramp(t, t1, t1 + 0.22, easeIn));
  const fl = Math.sin((t - t0) * 2.1) * 8;
  const wob = kick(t, t0 + 0.05, 7, 18, 6);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 + fl, width: w, height: h, transform: `rotate(${rot + wob}deg) scale(${s * (flip ? -1 : 1)}, ${s})`,
      filter: `drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 2px rgba(255,255,255,0.9)) grayscale(${grey})` }}>
      <Img src={staticFile(`chile/img/${name}.png`)} style={{ width: w, height: h }} />
      {children}
    </div>
  );
};

/** A red "no" sign drawing on over something: a ring, then the slash. */
const NoSign: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; r: number }> = ({ t, t0, t1, x, y, r }) => {
  const a = 1 - ramp(t, t1, t1 + 0.22, easeIn);
  if (t < t0 || a <= 0) return null;
  const ring = ramp(t, t0, t0 + 0.28, easeOut), slash = ramp(t, t0 + 0.18, t0 + 0.4, easeOut);
  const d = r * 0.707;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a, overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6)) drop-shadow(0 0 14px rgba(255,40,40,0.7))' }}>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#ff2a2a" strokeWidth={r * 0.14} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-90 ${x} ${y})`} />
      <line x1={x - d} y1={y - d} x2={lerp(x - d, x + d, slash)} y2={lerp(y - d, y + d, slash)} stroke="#ff2a2a" strokeWidth={r * 0.14} strokeLinecap="round" />
    </svg>
  );
};

const PUSH = 0.2;

/** A full-screen still with a slow push and a little parallax drift (the live-footage cutaways of the reference). */
const Cutaway: React.FC<{ t: number; t0: number; t1: number; src: string; from?: number; to?: number; dx?: number; children?: React.ReactNode }> = ({ t, t0, t1, src, from = 1.04, to = 1.16, dx = 30, children }) => {
  if (t < t0 - 0.01 || t > t1 + 0.01) return null;
  const p = ramp(t, t0, t1, linear);
  const inn = ramp(t, t0, t0 + PUSH, easeOut);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', transform: `translateX(${(1 - inn) * 1080}px)`, filter: inn < 1 ? `blur(${(1 - inn) * 14}px)` : undefined }}>
      <Img src={staticFile(`chile/img/${src}.jpg`)} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${lerp(from, to, p)}) translateX(${lerp(-dx, dx, p)}px)`,
        filter: 'saturate(1.12) contrast(1.06)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
      {children}
    </AbsoluteFill>
  );
};

/** Whip transitions on the big moves. */
const WHIPS = () => [SC.india - 0.15, SC.back - 0.15, SC.valley - 0.15, SC.squeeze - 0.15, SC.lake - 0.15, SC.close - 0.15, C.bhai8 - 0.3, C.rehte8 + 0.3];
export const Whips: React.FC<{ t: number }> = ({ t }) => (
  <>
    {WHIPS().map((w, i) => {
      const p = ramp(t, w, w + 0.32, linear);
      if (p <= 0 || p >= 1) return null;
      const dir = i % 2 ? -1 : 1;
      return (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.75,
          background: `linear-gradient(${dir > 0 ? 100 : 80}deg, rgba(255,255,255,0) ${lerp(-40, 100, p) - 25}%, rgba(200,225,255,0.9) ${lerp(-40, 100, p)}%, rgba(255,255,255,0) ${lerp(-40, 100, p) + 25}%)` }} />
      );
    })}
  </>
);

/** The grade: teal shadows and warm highlights (soft light), a vignette, darker edges, grain, and flashes on the hits. */
export const Grade: React.FC<{ t: number; frame: number; vintage: boolean }> = ({ t, frame, vintage }) => {
  let flash = 0;
  for (const h of [C.chile1, C.n1000, C.y1818, C.andes14, C.y1879, C.kinara17]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  const guns = window4(t, C.rehte8 + 0.4, C.rehte8 + 0.5, C.aham9 + 0.4, C.aham9 + 0.7);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {!vintage && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />}
      {vintage && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,240,210,0.12) 0%, rgba(60,35,10,0.35) 100%)', mixBlendMode: 'multiply' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.5) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.4), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,6,12,0.5))' }} />
      <AbsoluteFill style={{ opacity: vintage ? 0.12 : 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {guns > 0 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(150,0,0,0.55) 100%)', opacity: guns }} />}
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. */
const HOT = /^[0-9,.~%]+|^[A-Za-z]/;
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
  const words = text.split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:.]/g, '').length));
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


// ================================================================ Chile beats

const has = (n: string) => !!SZ[n];
const S = (c: Cam, lon: number, lat: number) => toScreen(c, merc(lon, lat));

/** Chile's own red fill. Its visible part is a band of latitudes, so it can grow south and later take the north. */
const chileBand = (t: number): [number, number, number] => {
  // [north edge lat, south edge lat, opacity]
  if (t < SC.india) {
    const g = ramp(t, C.chile1 - 0.25, C.chile1 + 0.45, easeOut);
    return [-17.4, lerp(-17.4, -56.5, g), 1 - ramp(t, SC.india - 0.2, SC.india, linear)];
  }
  if (t >= SC.squeeze && t < SC.lake) {
    if (t < C.chile15 - 0.1) return [-17.4, -56.5, ramp(t, SC.squeeze, SC.squeeze + 0.3, easeOut)];
    // the growth: back to 1818 Chile, then down to the tip; then the war adds the north
    const south = lerp(-37.6, -56.5, ramp(t, C.chile15 + 0.1, C.chor15, inOut));
    const north = t < C.kinara17 - 0.1 ? -26.5 : lerp(-26.5, -21.4, ramp(t, C.kinara17 - 0.1, C.kinara17 + 0.4, easeOut));
    const north2 = t < C.hissa17 - 0.2 ? north : lerp(-21.4, -17.4, ramp(t, C.hissa17 - 0.2, C.hissa17 + 0.3, easeOut));
    return [north2, south, 1];
  }
  if (t >= SC.close) return [-17.4, -56.5, 1];
  return [0, 0, 0];
};
const ChileFill: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [n, s, a] = chileBand(t);
  if (a <= 0.001 || n <= s) return null;
  const d = GEO.chile_main.map((r) => r.map((p, i) => { const [x, y] = toScreen(c, p); return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }).join('') + 'Z').join('');
  // the band in screen space: a rotated rectangle between two latitudes
  const [ax, ay] = S(c, -100, n), [bx, by] = S(c, -40, n), [cx, cy] = S(c, -40, s), [dx, dy] = S(c, -100, s);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
      <defs>
        <clipPath id="chband"><path d={`M${ax},${ay}L${bx},${by}L${cx},${cy}L${dx},${dy}Z`} /></clipPath>
        <linearGradient id="chfill" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#ff8a8a" /><stop offset="0.3" stopColor={COL.chile} /><stop offset="1" stopColor="#c81b2d" /></linearGradient>
      </defs>
      <g clipPath="url(#chband)">
        <path d={d} fill="none" stroke={COL.chile} strokeWidth={26} strokeOpacity={0.35} strokeLinejoin="round" style={{ filter: 'blur(10px)' }} />
        <path d={d} fill="url(#chfill)" fillOpacity={0.92} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${COL.chile})` }} />
      </g>
    </svg>
  );
};

/** The chili pepper lying on Chile, and the hand that plucks it away (and the pepper that drops back at the end). */
const Chili: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [nx, ny] = S(c, -70.0, -18.5), [sx, sy] = S(c, -71.8, -53.5);
  const len = Math.hypot(sx - nx, sy - ny);
  const ang = (Math.atan2(sy - ny, sx - nx) * 180) / Math.PI - 90;
  const [w0, h0] = SZ.c01_chili;
  const H = len * 1.08, W = (H * w0) / h0;
  const mx = (nx + sx) / 2 - 20, my = (ny + sy) / 2;
  const intro = t < SC.india;
  const t0 = intro ? 0.45 : C.mirchi20 - 0.55;
  if (t < t0 || (intro && t > C.chile1 + 0.2) || (!intro && t < SC.close)) return null;
  const drop = ramp(t, t0, t0 + 0.28, easeIn);
  const land = kick(t, t0 + 0.28, 0.06, 26, 8);
  // the pluck: the hand pinches at mirchi1 + 0.2 and lifts it up and out
  const pinch = C.mirchi1 + 0.25;
  const lift = intro ? ramp(t, pinch + 0.15, pinch + 0.75, easeIn) : 0;
  const yOff = lerp(-1400, 0, drop) - lift * 1500;
  const blur = (1 - drop) * 14 + lift * 16;
  const sway = Math.sin(t * 3) * 1.5;
  const hand = intro && t > C.mirchi1 - 0.45 && t < pinch + 0.9;
  const hin = ramp(t, C.mirchi1 - 0.45, pinch, easeOut);
  const [hw0, hh0] = SZ.c02_hand_pinch;
  const HW = 820, HH = (HW * hh0) / hw0;
  // the hand's fingertips are at about (8%, 92%) of the cut-out; put them on the pepper's stem
  const tipX = nx + 10, tipY = ny + 40;
  const hx = lerp(tipX + 700, tipX, hin) - HW * 0.08, hy = lerp(tipY - 900, tipY, hin) - HH * 0.92 - lift * 1500;
  return (
    <>
      <Img src={staticFile('chile/img/c01_chili.png')} style={{ position: 'absolute', left: mx - W / 2, top: my - H / 2 + yOff, width: W, height: H,
        transform: `rotate(${ang + sway}deg) scale(${1 + land}, ${1 - land})`, filter: `blur(${blur.toFixed(1)}px) drop-shadow(0 16px 18px rgba(0,0,0,0.55))` }} />
      {hand && <Img src={staticFile('chile/img/c02_hand_pinch.png')} style={{ position: 'absolute', left: hx, top: hy, width: HW, height: HH,
        filter: `blur(${((1 - hin) * 10 + lift * 14).toFixed(1)}px) drop-shadow(0 20px 26px rgba(0,0,0,0.5))` }} />}
    </>
  );
};

/** Chile laid over India at true size: its north tip on Kashmir, its axis along Kashmir → Kanyakumari. */
const km = (lon: number, lat: number, lon0: number, lat0: number): [number, number] => [(lon - lon0) * 111.32 * Math.cos((lat * Math.PI) / 180), (lat - lat0) * 110.57];
const CH_TOP: [number, number] = [-69.9, -17.5], CH_BOT: [number, number] = [-67.3, -55.9];
const KASH: [number, number] = [75.0, 35.5], KANYA: [number, number] = [77.54, 8.08];
const chileOnIndia = (() => {
  const [bx, by] = km(CH_BOT[0], CH_BOT[1], CH_TOP[0], CH_TOP[1]);
  const [ix, iy] = km(KANYA[0], KANYA[1], KASH[0], KASH[1]);
  const rot = Math.atan2(iy, ix) - Math.atan2(by, bx);
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const place = (lon: number, lat: number): P => {
    const [x, y] = km(lon, lat, CH_TOP[0], CH_TOP[1]);
    const X = x * cos - y * sin, Y = x * sin + y * cos;
    const la = KASH[1] + Y / 110.57;
    return merc(KASH[0] + X / (111.32 * Math.cos((la * Math.PI) / 180)), la);
  };
  return { ring: GEO.chile_deg.map(([lo, la]) => place(lo, la)), tail: place(CH_BOT[0], CH_BOT[1]), mid: place(-71.0, -36.5) };
})();
const OverIndia: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < SC.india || t > SC.back) return null;
  const slide = ramp(t, SC.india + 0.15, C.kashmir2 + 0.1, easeOut);
  const dx = lerp(-900, 0, slide), rot = lerp(-25, 0, slide);
  const pts = chileOnIndia.ring.map((p) => toScreen(c, p));
  const [kx, ky] = toScreen(c, merc(...KASH)), [qx, qy] = toScreen(c, merc(...KANYA)), [tx, ty] = toScreen(c, chileOnIndia.tail);
  const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join('') + 'Z';
  const lineI = ramp(t, C.kanya2 - 0.2, C.kanya2 + 0.5, inOut), lineC = ramp(t, C.n1000 - 0.4, C.n1000 + 0.2, inOut);
  const fade = 1 - ramp(t, C.par3 + 0.2, C.par3 + 0.6, linear) * 0.35 - ramp(t, C.delhi3 - 0.5, C.delhi3 - 0.1, linear) * 0.4;
  const ext = window4(t, C.n1000 - 0.1, C.n1000 + 0.2, SC.back - 0.3, SC.back);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g transform={`translate(${dx} 0) rotate(${rot} ${kx} ${ky})`} opacity={fade}>
          <path d={d} fill={COL.chile} fillOpacity={0.82} stroke="#fff" strokeWidth={3} style={{ filter: `drop-shadow(0 10px 14px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${COL.chile})` }} />
        </g>
        {lineI > 0 && <line x1={kx - 40} y1={ky} x2={lerp(kx - 40, qx - 40, lineI)} y2={lerp(ky, qy, lineI)} stroke="#fff" strokeWidth={6} strokeDasharray="22 14" />}
        {lineC > 0 && <line x1={kx + 40} y1={ky} x2={lerp(kx + 40, tx + 40, lineC)} y2={lerp(ky, ty, lineC)} stroke={COL.gold} strokeWidth={6} strokeDasharray="22 14" />}
        {ext > 0 && <line x1={qx - 140} y1={qy} x2={qx + 220} y2={qy} stroke="#fff" strokeWidth={4} opacity={ext} />}
      </svg>
      <Label t={t} t0={C.kashmir2} t1={C.par3 - 0.2} text="KASHMIR" x={kx - 220} y={ky - 120} color="#ff9933" pin={[kx, ky]} size={40} />
      <Label t={t} t0={C.kanya2 + 0.2} t1={C.par3 - 0.2} text="KANYAKUMARI" x={qx - 230} y={qy + 40} color="#138808" pin={[qx, qy]} size={36} />
      <Chip t={t} t0={C.kanya2 + 0.5} t1={C.par3 - 0.2} text="India: 3,214 KM" x={300} y={420} color="#ffffff" size={50} />
      <Chip t={t} t0={C.n1000 - 0.3} t1={C.par3 - 0.2} text="Chile: ~4,300 KM" x={780} y={520} color={COL.gold} size={50} />
      <Big t={t} t0={C.n1000 - 0.05} t1={C.par3 - 0.1} text="+1,000 KM" x={tx + 30} y={ty - 90} size={110} color={COL.gold} font={NUM} rot={-4} />
    </>
  );
};
/** The width: a cross line through the middle counting up to 180 km, then Delhi → Agra. */
const Width: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < C.par3 - 0.1 || t > SC.back) return null;
  const [mx, my] = toScreen(c, chileOnIndia.mid);
  const half = (90 * 1000) * pxPerM(c);
  const g = ramp(t, C.n180 - 0.4, C.n180 + 0.4, easeOut);
  const a = 1 - ramp(t, C.delhi3 - 0.4, C.delhi3 - 0.1, linear);
  const [dx, dy] = S(c, ...(GEO.places_deg.delhi as [number, number])), [ax, ay] = S(c, ...(GEO.places_deg.agra as [number, number]));
  const line = ramp(t, C.agra3 - 0.1, C.agra3 + 0.5, inOut);
  return (
    <>
      {a > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a }}>
          <line x1={mx - half * g} y1={my} x2={mx + half * g} y2={my} stroke={COL.gold} strokeWidth={8} strokeLinecap="round" />
          {[-1, 1].map((s) => <line key={s} x1={mx + s * half * g} y1={my - 26} x2={mx + s * half * g} y2={my + 26} stroke={COL.gold} strokeWidth={8} />)}
        </svg>
      )}
      <Counter t={t} t0={C.n180 - 0.3} t1={C.delhi3 - 0.1} to={180} post=" KM" x={540} y={420} size={190} color={COL.gold} dur={0.6} />
      <Label t={t} t0={C.delhi3} t1={SC.back - 0.1} text="DELHI" x={Math.max(200, dx - 200)} y={dy - 140} color="#ff9933" pin={[dx, dy]} size={44} />
      <Label t={t} t0={C.agra3} t1={SC.back - 0.1} text="AGRA" x={Math.min(880, ax + 170)} y={ay + 140} color="#138808" pin={[ax, ay]} size={44} />
      {line > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={dx} y1={dy} x2={lerp(dx, ax, line)} y2={lerp(dy, ay, line)} stroke="#fff" strokeWidth={7} strokeDasharray="20 12" />
        </svg>
      )}
      <Chip t={t} t0={C.agra3 + 0.3} t1={SC.back - 0.1} text="~180 KM" x={540} y={420} color={COL.gold} size={70} />
    </>
  );
};

/** The antique map sheet flipping in (page curl) over the vintage map, and flipping away. */
const OldMap: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.adivasi5 - 0.75, t1 = C.spain6 - 0.35;
  if (t < t0 || t > t1 + 0.5) return null;
  const inn = ramp(t, t0, t0 + 0.55, easeOut), out = ramp(t, t1, t1 + 0.45, easeIn);
  const W = 920, H = 1640;
  return (
    <div style={{ position: 'absolute', left: 540 - W / 2, top: 900 - H / 2, width: W, height: H, perspective: 2200 }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: out > 0 ? '100% 0%' : '0% 100%',
        transform: `rotate(${-4 + 4 * inn}deg) rotateY(${(1 - inn) * -95 + out * 100}deg) rotateX(${out * -25}deg) scale(${1 - out * 0.1})`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)' }}>
        <Img src={staticFile('chile/img/c03_old_map.jpg')} style={{ width: W, height: H }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${out > 0 ? 225 : 45}deg, rgba(0,0,0,${0.45 * (1 - inn + out)}) 0%, rgba(0,0,0,0) 45%)` }} />
      </div>
      <OldLabel t={t} t0={C.inca5} t1={t1} text="INCA" x={W * 0.38} y={H * 0.33} />
      <OldLabel t={t} t0={C.mapuche5} t1={t1} text="MAPUCHE" x={W * 0.36} y={H * 0.72} />
    </div>
  );
};
const OLD = '"Cinzel", "Trajan Pro", Georgia, "Times New Roman", serif';
const OldLabel: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; rot?: number; color?: string }> = ({ t, t0, t1, text, x, y, size = 70, rot = -4, color = '#3a2614' }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.1, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 240));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: OLD, fontWeight: 700,
      fontSize: size, letterSpacing: 6, color, background: 'rgba(243,234,214,0.88)', border: `4px double ${color}`, padding: '4px 22px 0', boxShadow: '0 8px 18px rgba(0,0,0,0.4)' }}>{text}</div>
  );
};

/** The Spanish ships sail from Spain across the Atlantic to South America's coasts, then turn into smiling faces ("बातचीत"). */
const Ships: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  if (t < C.spain6 - 0.2 || t > SC.skit + 0.1) return null;
  const spots: [number, number][] = [[-80, 1], [-81, -9], [-73, -20], [-35, -7], [-39, -20], [-50, -30]];
  const from = merc(-9.8, 37.8);
  return (
    <>
      {spots.map(([lo, la], i) => {
        const to = merc(lo, la);
        const s0 = C.spain6 - 0.1 + i * 0.09;
        const p = ramp(t, s0, C.baat6 - 0.45, inOut);
        const arc = Math.sin(p * Math.PI) * 6e5 * (i % 2 ? 1 : -1);
        const [x, y] = toScreen(c, [lerp(from[0], to[0], p), lerp(from[1], to[1], p) + arc]);
        return <At key={i} t0={C.baat6 - 2.0} t1={SC.skit + 0.1} x={x} y={y} w={300} h={300} scale={0.62}><Clip name="m03_ship_to_emoji" /></At>;
      })}
      <OldLabel t={t} t0={C.spain6 + 0.05} t1={SC.skit} text="SPAIN" x={S(c, -4, 41.5)[0]} y={S(c, -4, 41.5)[1] - 70} size={52} color="#5a0f0a" />
    </>
  );
};

/** The beach skit: the captain admires the "empty" land, the locals answer, the muskets come up. */
const Skit: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.skit || t > SC.skitEnd) return null;
  const locals = t > C.bhai8 - 0.3 && t < C.rehte8 + 0.45;
  const guns = t >= C.rehte8 + 0.45 && t < C.aham9 + 0.6;
  const tt = t - SC.skit;
  const push = 1.04 + 0.04 * ramp(t, SC.skit, SC.skitEnd, linear);
  const [cw, chh] = SZ.c05_captain_body, [aw, ah] = SZ.c05_captain_arm;
  const CH = 980, CW = (CH * cw) / chh;
  const sweep = t < C.bhai8 ? Math.sin(ramp(t, C.wah7, C.khali7 + 0.4, inOut) * Math.PI) * 18 : t > C.aham9 ? Math.sin(ramp(t, C.aham9 + 0.3, C.khali9 + 0.4, inOut) * Math.PI) * 16 : 0;
  const shy = t > C.aham9 + 0.55 && t < C.aham9 + 1.2 ? 6 : 0;
  const AW = CW * 1.15, AH = (AW * ah) / aw;
  const soldier = (pose: 'rest' | 'aim', x: number, s = 1) => {
    const n = `c06_soldier_${pose}`;
    const [w, h] = SZ[n];
    const H = 800 * s, W = (H * w) / h;
    return <Img key={`${pose}${x}`} src={staticFile(`chile/img/${n}.png`)} style={{ position: 'absolute', left: x - W / 2, top: 1700 - H, width: W, height: H, filter: 'drop-shadow(0 20px 18px rgba(0,0,0,0.45))' }} />;
  };
  if (locals) {
    const haveVillage = has('c08_village_bg'), haveGroup = has('c07_mapuche_group');
    const [gw, gh] = haveGroup ? SZ.c07_mapuche_group : [16, 9];
    const GW = 1040, GH = (GW * gh) / gw;
    return (
      <AbsoluteFill style={{ overflow: 'hidden', background: '#2a3a30' }}>
        <Img src={staticFile(haveVillage ? 'chile/img/c08_village_bg.jpg' : 'chile/img/c04_beach_bg.jpg')} style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${push}) ${haveVillage ? '' : 'scaleX(-1)'}` }} />
        {haveGroup && <Img src={staticFile('chile/img/c07_mapuche_group.png')} style={{ position: 'absolute', left: 540 - GW / 2, top: 1720 - GH, width: GW, height: GH, filter: 'drop-shadow(0 20px 18px rgba(0,0,0,0.45))' }} />}
      </AbsoluteFill>
    );
  }
  const zoom = guns ? 1 + 0.22 * clamp01(pop(t, C.rehte8 + 0.45, 12, 260)) : 1;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#2a3a30' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push * zoom})`, transformOrigin: guns ? '30% 70%' : '50% 60%' }}>
        <Img src={staticFile('chile/img/c04_beach_bg.jpg')} style={{ position: 'absolute', width: 1080, height: 1920 }} />
        {[150, 330, 500].map((x, i) => soldier(guns ? 'aim' : 'rest', x - (guns ? 20 : 0), 0.88 + i * 0.04))}
        <div style={{ position: 'absolute', left: 790 - CW / 2, top: 1720 - CH + Math.sin(tt * 2) * 4, width: CW, height: CH, transform: `rotate(${shy ? -3 : 0}deg)`, filter: 'drop-shadow(0 24px 22px rgba(0,0,0,0.5))' }}>
          {/* his right arm: the shoulder socket sits at about (26%, 26%) of the body cut-out; the arm's shoulder end is its right edge */}
          <Img src={staticFile('chile/img/c05_captain_arm.png')} style={{ position: 'absolute', left: CW * 0.28 - AW, top: CH * 0.255 - AH * 0.42, width: AW, height: AH,
            transformOrigin: '100% 42%', transform: `rotate(${sweep - (guns ? 25 : 0) + shy * 4}deg)` }} />
          <Img src={staticFile('chile/img/c05_captain_body.png')} style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The magnifying glass slides over early Chile; inside it, the real satellite valley. Then it fills the screen. */
const Lens: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  if (t < SC.lens || t > SC.valley + 0.05) return null;
  const inn = ramp(t, SC.lens, SC.lens + 0.6, easeOut);
  const grow = ramp(t, SC.valley - 0.6, SC.valley, easeIn);
  const R = lerp(230, 1400, grow);
  const cx = lerp(1300, 520, inn), cy = lerp(1500, 980, inn);
  const [mw, mh] = SZ.c11_magnifier;
  const MW = R * 2 / 0.62, MH = (MW * mh) / mw;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, clipPath: `circle(${R}px at ${cx}px ${cy}px)` }}>{children}</div>
      {grow < 0.9 && <Img src={staticFile('chile/img/c11_magnifier.png')} style={{ position: 'absolute', left: cx - MW * 0.36, top: cy - MH * 0.36, width: MW, height: MH,
        filter: 'drop-shadow(0 26px 30px rgba(0,0,0,0.55))', opacity: 1 - grow }} />}
    </>
  );
};

/** The Andes band in orange, drawn north to south (in plane coordinates, under the labels). */
export const AndesBand: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.andes14 - 0.1, C.andes14 + 0.2, C.uttar16 - 0.2, C.uttar16 + 0.3);
  if (a <= 0) return null;
  const b = GEO.plates.samerica.bounds;
  const [x0, y0] = toScreen(c, [b[0], b[3]]);
  const k = pxPerM(c);
  const W = (b[2] - b[0]) * k, H = (b[3] - b[1]) * k;
  const reveal = ramp(t, C.andes14 - 0.1, C.parvat14 + 0.4, inOut);
  return (
    <div style={{ position: 'absolute', left: x0, top: y0, width: W, height: H, transformOrigin: '0 0', transform: `rotate(${c.rot}deg)`, opacity: a * 0.85,
      background: COL.andes, WebkitMaskImage: `url(${staticFile('chile/maps/andes_mask.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('chile/maps/andes_mask.png')})`,
      maskSize: '100% 100%', clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`, filter: `drop-shadow(0 0 10px ${COL.andes})` }} />
  );
};

const YELLOW: React.CSSProperties = { fontFamily: NUM, fontStyle: 'italic', color: '#FFE53B', letterSpacing: 2, whiteSpace: 'pre', textShadow: SHADOW, ...STROKE(7, '#2a1a00') };
const Yellow: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; rot?: number }> = ({ t, t0, t1, text, x, y, size = 90, rot = -8 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${clamp01(pop(t, t0, 9, 260))})`, opacity: a, fontSize: size, lineHeight: 0.95, textAlign: 'center', ...YELLOW }}>{text}</div>;
};

/** Everything over the maps (satellite and vintage), in screen space. */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [chx, chy] = S(c, -70.6, -30.0);
  const [bx, by] = S(c, -64.6, -17.3);
  const [hx, hy] = S(c, -68.0, -55.3);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <ChileFill t={t} c={c} />
      {/* hook */}
      <Chili t={t} c={c} />
      {t < SC.india && <At t0={C.chalo1 + 1.6} t1={SC.india} x={Math.max(400, chx - 330)} y={chy - 260} w={700} h={420}><Clip name="m01_chili_label" /></At>}
      {t > C.lamba2 - 0.5 && t < SC.india + 0.1 && <At t0={C.lamba2 - 0.35} t1={SC.india + 0.1} x={Math.max(250, chx - 120)} y={chy + 120} w={500} h={1400} scale={0.75}><Clip name="m02_long_letters" /></At>}
      <OverIndia t={t} c={c} />
      <Width t={t} c={c} />
      <Big t={t} t0={C.shakal4 - 0.15} t1={SC.vintage} text="?" x={540} y={760} size={420} color={COL.gold} font={NUM} rot={6} />
      {/* the vintage map */}
      {t > SC.vintage - 0.05 && t < C.adivasi5 && <At t0={SC.vintage} t1={C.adivasi5} x={540} y={330} w={1080} h={400}><Clip name="m09_title_1500" /></At>}
      <OldMap t={t} />
      <Ships t={t} c={c} />
      <OldLabel t={t} t0={C.mapuche10} t1={C.y1818 - 0.1} text="SPAIN" x={S(c, -66, -12)[0]} y={S(c, -66, -12)[1]} size={60} color="#5a0f0a" />
      <OldLabel t={t} t0={C.mapuche10 + 0.2} t1={C.y1818 - 0.1} text="PORTUGAL" x={S(c, -42, -10)[0]} y={S(c, -42, -10)[1]} size={48} color="#11204a" />
      <OldLabel t={t} t0={C.mapuche10 + 0.5} t1={C.y1818 - 0.1} text="MAPUCHE" x={S(c, -69, -44)[0] + 60} y={S(c, -69, -44)[1]} size={50} rot={-12} />
      <Counter t={t} t0={C.y1818 - 0.05} t1={C.shuru11 - 0.1} to={1818} x={540} y={330} size={170} color={COL.paper} dur={0.6} />
      <OldLabel t={t} t0={C.shuru11} t1={SC.valley - 0.1} text="CHILE · 1818" x={S(c, -70.5, -31)[0] + 260} y={S(c, -70.5, -31)[1]} size={44} color="#123a7a" />
      {/* squeezed */}
      <Yellow t={t} t0={C.pacific14 - 0.05} t1={C.chaude15 - 0.1} text={'PACIFIC\nOCEAN'} x={S(c, -82, -32)[0]} y={S(c, -82, -32)[1]} size={84} />
      <Yellow t={t} t0={C.andes14 - 0.05} t1={C.chaude15 - 0.1} text="ANDES" x={S(c, -63, -28)[0]} y={S(c, -63, -28)[1]} size={96} />
      <Chip t={t} t0={C.parvat14 - 0.4} t1={C.chaude15 - 0.1} text="ज़मीन की सबसे लंबी पर्वतमाला" x={540} y={330} color={COL.andes} size={50} />
      {t > C.chaude15 - 0.1 && t < C.lambe15 + 0.1 && <At t0={C.chaude15 - 0.05} t1={C.lambe15 + 0.1} x={chx} y={chy} w={700} h={1000}><Clip name="m07_arrows_wider" /></At>}
      {t > C.lambe15 - 0.1 && t < C.chile15 + 0.9 && <At t0={C.lambe15 - 0.05} t1={C.chile15 + 0.9} x={chx} y={chy} w={700} h={1000}><Clip name="m07_arrows_longer" /></At>}
      <Chip t={t} t0={C.chaude15} t1={C.lambe15 - 0.1} text="चौड़ा? ✕" x={540} y={330} color={COL.chile} size={64} />
      <Chip t={t} t0={C.lambe15} t1={C.chile15 + 0.6} text="लंबा! ✓" x={540} y={330} color="#39ff5a" size={64} />
      {t > C.chor15 - 0.3 && t < C.uttar16 + 0.2 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - ramp(t, C.uttar16 - 0.2, C.uttar16 + 0.2, linear) }}>
          <g transform={`translate(${hx + 70 + Math.sin(t * 9) * 10} ${hy + 60 + Math.sin(t * 9) * 10}) rotate(-135)`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }}>
            <line x1={0} y1={0} x2={90} y2={0} stroke="#fff" strokeWidth={18} strokeLinecap="round" /><path d="M 70 -30 L 116 0 L 70 30 Z" fill="#fff" />
          </g>
        </svg>
      )}
      <Chip t={t} t0={C.chor15 - 0.2} t1={C.uttar16} text="आख़िरी छोर तक" x={540} y={330} color={COL.chile} size={60} />
      {/* the war */}
      <Sticker t={t} t0={C.y1879 - 0.25} t1={C.jung17 + 0.3} name="c13_crossed_swords" x={540} y={600} h={300} />
      <Big t={t} t0={C.y1879 - 0.05} t1={C.jung17 + 0.3} text="1879" x={540} y={340} size={170} color={COL.gold} font={NUM} rot={-3} />
      <MapName t={t} t0={C.bolivia16 + 0.05} t1={C.bhai18 - 0.3} text="BOLIVIA" at={merc(-64.5, -16.8)} c={c} size={60} caps />
      <MapName t={t} t0={C.peru16 + 0.05} t1={SC.lake - 0.2} text="PERU" at={merc(-75, -10.5)} c={c} size={60} caps />
      <Chip t={t} t0={C.kinara17 - 0.1} t1={C.bhai18 - 0.2} text="Bolivia का समुद्री किनारा ➜ Chile" x={540} y={330} color={COL.bolivia} size={46} />
      {t > C.bhai18 - 0.3 && t < SC.lake && <At t0={C.bhai18 - 0.25} t1={SC.lake} x={bx} y={by + 20} w={600} h={500} scale={1.05}><Clip name="m06_bolivia_face" /></At>}
      {/* close: the send burst over the map (above Null's half) */}
      {t > C.bhejo20 - 0.1 && <At t0={C.bhejo20 - 0.05} t1={DURATION_S + 1} x={540} y={760} w={500} h={500}><Clip name="m08_send_burst" /></At>}
    </AbsoluteFill>
  );
};

/** The valley and the Andes wall: the flag's little march. */
export const FlagScenes: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t >= SC.valley && t < SC.wall && (
      <>
        <At t0={SC.valley} t1={SC.wall} x={lerp(300, 520, ramp(t, SC.valley, SC.wall, linear))} y={1150} w={500} h={400} scale={0.8}><Clip name="m05_mini_flags" loop /></At>
        <At t0={SC.valley} t1={SC.wall} x={lerp(480, 760, ramp(t, SC.valley, SC.wall, linear))} y={1000} w={640} h={480} scale={1.0}><Clip name="m04_flag_talk" loop /></At>
        <Chip t={t} t0={C.poorab12 - 0.1} t1={SC.wall} text="पूरब ➜" x={820} y={420} color={COL.gold} size={64} />
      </>
    )}
    {t >= SC.wall && t < SC.squeeze && (
      <AbsoluteFill>
        <Img src={staticFile('chile/img/c09_andes_wall.jpg')} style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${1.04 + 0.05 * ramp(t, SC.wall, SC.squeeze, linear)})` }} />
        <At t0={SC.wall} t1={SC.squeeze} x={430} y={1460} w={500} h={400} scale={0.75}><Clip name="m05_mini_flags" loop /></At>
        {t < C.dakshin13 - 0.2
          ? <At t0={SC.wall} t1={C.dakshin13 - 0.2} x={640} y={1300} w={640} h={480}><Clip name="m04_flag_shocked" /></At>
          : <At t0={C.dakshin13 - 0.2} t1={SC.squeeze} x={640} y={1300} w={640} h={480}><Clip name="m04_flag_south" /></At>}
        <Big t={t} t0={C.accha13} t1={C.dakshin13 - 0.2} text="ANDES 😳" x={540} y={420} size={120} color="#fff" font={NUM} rot={-3} />
        <Chip t={t} t0={C.dakshin13 - 0.1} t1={SC.squeeze} text="⬇ दक्षिण" x={540} y={420} color={COL.gold} size={70} />
      </AbsoluteFill>
    )}
  </>
);

/** Lake Titicaca: Bolivia's navy bobbing on the lake. */
export const LakeFx: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.lake || t > SC.close) return null;
  const [w, h] = SZ.c10_navy_boat;
  const W = 620, H = (W * h) / w;
  const bob = Math.sin(t * 3) * 10, tilt = Math.sin(t * 2.2) * 3;
  const x = lerp(380, 640, ramp(t, SC.lake, SC.close, linear));
  return (
    <>
      <Img src={staticFile('chile/img/c10_navy_boat.png')} style={{ position: 'absolute', left: x - W / 2, top: 980 - H / 2 + bob, width: W, height: H, transform: `rotate(${tilt}deg)`,
        filter: 'drop-shadow(0 18px 14px rgba(0,0,0,0.5))' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[0, 1, 2].map((k) => { const p = ((t - SC.lake) * 0.8 + k / 3) % 1; return <ellipse key={k} cx={x} cy={990 + H * 0.4} rx={W * (0.4 + p * 0.5)} ry={18 + p * 22} fill="none" stroke="#dff6ff" strokeWidth={4} opacity={(1 - p) * 0.6} />; })}
      </svg>
      <Chip t={t} t0={C.navy19 - 0.1} t1={SC.close} text="BOLIVIAN NAVY ⚓" x={540} y={420} color={COL.bolivia} size={60} />
      <Chip t={t} t0={SC.lake + 0.3} t1={SC.close} text="BOLIVIA" x={860} y={1380} color={COL.bolivia} size={46} rot={0} />
      <Chip t={t} t0={SC.lake + 0.4} t1={SC.close} text="PERU" x={220} y={700} color={COL.peru} size={46} rot={0} />
      <Chip t={t} t0={C.jheel19 - 0.1} t1={SC.close} text="LAKE TITICACA" x={540} y={560} color="#7fe3ff" size={48} />
    </>
  );
};

export { Lens, Skit };
