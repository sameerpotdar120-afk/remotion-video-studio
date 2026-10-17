import React from 'react';
import { AbsoluteFill, Freeze, Img, Loop, OffthreadVideo, Sequence, random, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SC, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { globeAt, globePoint, globeRadius } from './Globe';
import { COL } from './regions';
import sizes from '../../public/ww3safe/img_sizes.json';

const FPS = 60;

/** A motion asset rendered from motion_assets.md (transparent 60 fps WebM): loops, or holds its last frame. */
const LEN: Record<string, number> = { m01_title_banner: 150, m02_impact_flash: 48, m03_nuke: 240, m04_war_splat: 240, m05_ash_fall: 360, m07_steam: 240, m08_comment_burst: 180 };
const Clip: React.FC<{ name: string; loop?: boolean }> = ({ name, loop }) => {
  const n = LEN[name];
  const v = <OffthreadVideo src={staticFile(`ww3safe/motion/${name}.webm`)} transparent muted style={{ width: '100%', height: '100%' }} />;
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
      <Img src={staticFile(`ww3safe/img/${name}.png`)} style={{ width: w, height: h }} />
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

/** Push-slide into a cutaway: the new shot shoves the map off to the left (reference frames 1209–1218). */
const PUSH = 0.2;
const CUTAWAYS = () => [[C.n300 - 0.15, C.aus4 - 0.1], [C.nz5b - 0.15, C.teesra6 - 0.15], [C.thand7 - 0.15, SC.close - 0.1]];
export const pushAt = (t: number) => {
  for (const [a, b] of CUTAWAYS()) if (t >= a && t < b) return -1080 * ramp(t, a, a + PUSH, easeOut);
  return 0;
};

/** A full-screen still with a slow push and a little parallax drift (the live-footage cutaways of the reference). */
const Cutaway: React.FC<{ t: number; t0: number; t1: number; src: string; from?: number; to?: number; dx?: number; children?: React.ReactNode }> = ({ t, t0, t1, src, from = 1.04, to = 1.16, dx = 30, children }) => {
  if (t < t0 - 0.01 || t > t1 + 0.01) return null;
  const p = ramp(t, t0, t1, linear);
  const inn = ramp(t, t0, t0 + PUSH, easeOut);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', transform: `translateX(${(1 - inn) * 1080}px)`, filter: inn < 1 ? `blur(${(1 - inn) * 14}px)` : undefined }}>
      <Img src={staticFile(`ww3safe/img/${src}.jpg`)} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${lerp(from, to, p)}) translateX(${lerp(-dx, dx, p)}px)`,
        filter: 'saturate(1.12) contrast(1.06)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- hook: missiles over the Atlantic

type Shot = { from: [number, number]; to: [number, number]; t0: number; dur: number };
const SHOTS: Shot[] = [
  { from: [-100, 47], to: [-87, 41], t0: 0.0, dur: 0.9 }, { from: [-80, 38], to: [-95, 33], t0: 0.25, dur: 0.85 },
  { from: [-75, 44], to: [-118, 36], t0: 0.55, dur: 1.2 }, { from: [-60, 48], to: [-80, 40.5], t0: 1.0, dur: 1.1 },
  // across the Atlantic to Europe
  { from: [-88, 42], to: [2.3, 48.8], t0: 1.6, dur: 2.2 }, { from: [-77, 39], to: [13.4, 52.5], t0: 1.85, dur: 2.15 },
  { from: [-70, 44], to: [21, 52.2], t0: 2.05, dur: 2.1 }, { from: [-95, 30], to: [-3.7, 40.4], t0: 2.2, dur: 2.0 },
  { from: [-82, 46], to: [30.5, 50.4], t0: 2.4, dur: 2.0 }, { from: [-74, 41], to: [24.9, 60.2], t0: 2.55, dur: 1.9 },
];
const arcPt = (a: P, b: P, f: number): P => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  const cx = mx + (dy / (L || 1)) * L * 0.22 * (dx > 0 ? 1 : -1) * -1, cy = my - Math.abs(dx / (L || 1)) * L * 0.22;
  const u = 1 - f;
  return [u * u * a[0] + 2 * u * f * cx + f * f * b[0], u * u * a[1] + 2 * u * f * cy + f * f * b[1]];
};
const Missiles: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id="mhead"><stop offset="0" stopColor="#fff" /><stop offset="0.3" stopColor="#fffbd0" /><stop offset="0.6" stopColor="#ffe63a" stopOpacity={0.7} /><stop offset="1" stopColor="#ffd000" stopOpacity={0} /></radialGradient>
        <filter id="spray"><feGaussianBlur stdDeviation={1.2} /></filter>
      </defs>
      {SHOTS.map((s, i) => {
        const f = ramp(t, s.t0, s.t0 + s.dur, (x) => x * (0.75 + 0.25 * x));
        if (t < s.t0 || t > s.t0 + s.dur + 0.6) return null;
        const A = toScreen(c, merc(...s.from)), B = toScreen(c, merc(...s.to));
        const fade = 1 - ramp(t, s.t0 + s.dur, s.t0 + s.dur + 0.6, linear);
        const tail = Math.max(0, f - 0.38);
        const n = 26;
        const dots = Array.from({ length: n }, (_, k) => {
          const q = lerp(tail, f, k / (n - 1));
          const [x, y] = arcPt(A, B, q);
          const j = (random(`j${i}_${k}`) - 0.5) * 6 * (1 - k / n);
          return <circle key={k} cx={x + j} cy={y + j} r={1 + 3.2 * (k / n)} fill="#fff" opacity={(0.15 + 0.85 * (k / n)) * fade} />;
        });
        const [hx, hy] = arcPt(A, B, f);
        return (
          <g key={i}>
            <g filter="url(#spray)">{dots}</g>
            {f < 1 && <circle cx={hx} cy={hy} r={34} fill="url(#mhead)" />}
            {f < 1 && <circle cx={hx} cy={hy} r={8} fill="#fff" />}
          </g>
        );
      })}
    </svg>
    {SHOTS.map((s, i) => {
      const [x, y] = toScreen(c, merc(...s.to));
      return <At key={i} t0={s.t0 + s.dur - 0.02} t1={s.t0 + s.dur + 0.8} x={x} y={y} w={360} h={360}><Clip name="m02_impact_flash" /></At>;
    })}
    {/* war splats stay smoking on the hits */}
    {[[-96, 38, C.america1], [-80, 41, C.america1 + 0.2], [2.3, 48.8, 3.8], [13.4, 52.5, 4.0], [30.5, 50.4, 4.4]].map(([lo, la, t0], i) => {
      const [x, y] = toScreen(c, merc(lo, la));
      return <At key={`s${i}`} t0={t0} t1={SC.globeIn + 0.4} x={x} y={y} w={420} h={420} ay={0.55} scale={0.55}><Clip name="m04_war_splat" loop /></At>;
    })}
  </>
);

// ---------------------------------------------------------------- the globe's overlays

const GlobeFx: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.globeIn - 0.1 || t > SC.flat + 0.05) return null;
  const g = globeAt(t);
  const R = globeRadius(g);
  const halo = 1 - ramp(t, SC.dive + 0.3, SC.flat, easeIn);
  const india = globePoint(g, 78.9, 22.5);
  const nukes = [[C.matlab2 - 0.1, -0.45, 0.85], [C.matlab2 + 0.35, 0.25, 1.0], [C.khatra2 - 0.05, -0.05, 1.15], [C.khatra2 + 0.4, 0.55, 0.8]] as const;
  const fiji = globePoint(g, 178.1, -17.8), nz = globePoint(g, 172.5, -41.5);
  const glowA = window4(t, C.dakshin3 - 0.1, C.dakshin3 + 0.2, SC.dive + 0.3, SC.flat);
  return (
    <>
      {/* atmosphere rim */}
      <div style={{ position: 'absolute', left: 540 - R * 1.25, top: 960 - R * 1.25, width: R * 2.5, height: R * 2.5, borderRadius: '50%', opacity: halo, pointerEvents: 'none',
        background: `radial-gradient(circle, rgba(0,0,0,0) ${(100 / 1.25) * 0.96}%, rgba(110,225,255,0.55) ${100 / 1.25}%, rgba(60,170,220,0.18) ${(100 / 1.25) * 1.08}%, rgba(0,0,0,0) 100%)` }} />
      {/* the nuclear powers */}
      <Chip t={t} t0={C.nuke2 - 0.05} t1={C.uttari2 - 0.1} text="9 परमाणु देश" x={540} y={300} color={COL.war} size={64} />
      {india.front > 0 && <Label t={t} t0={C.india2} t1={C.uttari2 - 0.1} text="INDIA" x={india.x + 180} y={india.y - 170} color={COL.war} pin={[india.x, india.y]} size={44} />}
      <Chip t={t} t0={C.uttari2 + 0.1} t1={C.bachna3 - 0.1} text="⬆ उत्तरी हिस्सा" x={540} y={300} color={COL.war} size={60} />
      <Chip t={t} t0={C.uttari2 + 0.4} t1={C.matlab2 - 0.1} text="भूमध्य रेखा" x={540} y={960 + R + 70} color={COL.gold} size={44} rot={0} />
      {/* the nukes stand on the northern horizon */}
      {nukes.map(([t0, ox, sc], i) => (
        <At key={i} t0={t0} t1={C.bachna3 + 0.6} x={540 + ox * R} y={960 - R * Math.sqrt(1 - ox * ox) + 40} w={700} h={1000} ay={0.96} scale={sc * (R / 520)}
          opacity={1 - ramp(t, C.bachna3, C.bachna3 + 0.6, linear)}><Clip name="m03_nuke" /></At>
      ))}
      <Big t={t} t0={C.khatra2 - 0.1} t1={C.bachna3} text="सबसे बड़ा खतरा" x={540} y={1560} size={104} color={COL.war} />
      {/* south: Fiji and New Zealand glow */}
      {glowA > 0 && [fiji, nz].map((p, i) => p.front > 0 && (
        <div key={i} style={{ position: 'absolute', left: p.x - 46, top: p.y - 46, width: 92, height: 92, borderRadius: '50%', opacity: glowA * (0.75 + 0.25 * Math.sin(t * 8 + i)),
          background: 'radial-gradient(circle, #fff 0%, #fff7a0 18%, rgba(255,230,60,0.65) 40%, rgba(255,210,0,0) 70%)' }} />
      ))}
      <Big t={t} t0={C.neeche3 - 0.1} t1={C.dakshin3 + 0.7} text="⬇ नीचे चलो" x={540} y={300} size={100} color={COL.safe} rot={-2} />
    </>
  );
};

// ---------------------------------------------------------------- Fiji

/** The dashed line from Fiji to Australia. "2,700 KM" rides just behind the line's head, rotated to the line, pinned
 *  to the map (it grows and shrinks with the camera), its letters revealing as the line grows: as in the reference. */
const DashLine: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.aus4 - 0.05, C.aus4 + 0.1, C.akela4 + 0.5, C.akela4 + 0.9);
  if (a <= 0) return null;
  const A = toScreen(c, pl.fiji), B = toScreen(c, pl.brisbane);
  const f = ramp(t, C.aus4 + 0.1, C.n2700 + 0.3, inOut);
  const hx = lerp(A[0], B[0], f), hy = lerp(A[1], B[1], f);
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang > 90 || ang < -90) ang += 180;
  const k = Math.max(0.45, Math.min(2.4, 7.6e6 / c.span));
  const q = Math.max(0, f - 0.16);
  const lx = lerp(A[0], B[0], q) + (dy / L) * 58 * k, ly = lerp(A[1], B[1], q) - Math.abs(dx / L) * 58 * k;
  const km = Math.round(lerp(0, 2700, ramp(t, C.n2700 - 0.05, C.n2700 + 0.7, easeOut)) / 10) * 10;
  const text = t < C.n2700 - 0.05 ? '' : `${km.toLocaleString('en-US')} KM`;
  const shown = Math.ceil(text.length * ramp(t, C.n2700 - 0.05, C.n2700 + 0.35, linear));
  const pop1 = clamp01(pop(t, C.n2700 - 0.05, 9, 240));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(255,255,255,0.35))' }}>
        <line x1={A[0]} y1={A[1]} x2={hx} y2={hy} stroke="#fff" strokeWidth={4 + 3 * Math.min(1.4, k)} strokeDasharray={`${26 * Math.min(1.4, k)} ${18 * Math.min(1.4, k)}`} strokeLinecap="round" />
        <circle cx={A[0]} cy={A[1]} r={11} fill="#fff" />
        {f > 0.98 && <circle cx={B[0]} cy={B[1]} r={11} fill="#fff" />}
      </svg>
      {shown > 0 && (
        <div style={{ position: 'absolute', left: lx, top: ly, transform: `translate(-50%,-50%) rotate(${ang}deg) scale(${pop1})`, whiteSpace: 'nowrap',
          fontFamily: NUM, fontStyle: 'italic', fontSize: 88 * k, color: '#fff', letterSpacing: 2, textShadow: SHADOW, ...STROKE(6 * Math.min(1.5, k)) }}>
          {text.slice(0, shown)}
        </div>
      )}
    </div>
  );
};

/** "Alone": sonar rings from Fiji; "a reason to be a target": a reticle that hunts, then gives up. */
const Alone: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [fx, fy] = toScreen(c, pl.fiji);
  const a = window4(t, C.akela4 - 0.1, C.akela4 + 0.1, C.ilaka4 - 0.3, C.ilaka4);
  if (a <= 0) return null;
  const hunt = ramp(t, C.nishane4 - 0.2, C.nishane4 + 0.6, inOut);
  const gone = ramp(t, C.nishane4 + 1.2, C.nishane4 + 1.7, easeIn);
  const rx = lerp(fx + 330, fx, hunt), ry = lerp(fy - 380, fy, hunt);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a, overflow: 'visible' }}>
      {[0, 1, 2].map((k) => {
        const p = ((t - C.akela4) * 0.7 + k / 3) % 1;
        return <circle key={k} cx={fx} cy={fy} r={30 + p * 420} fill="none" stroke={COL.safe} strokeWidth={4} opacity={(1 - p) * 0.8} />;
      })}
      {t > C.nishane4 - 0.25 && (
        <g transform={`translate(${rx},${ry}) rotate(${(t - C.nishane4) * 90}) scale(${1 - gone * 0.4})`} opacity={1 - gone} style={{ filter: 'drop-shadow(0 0 8px #ff2a2a)' }}>
          <circle r={70} fill="none" stroke="#ff3b3b" strokeWidth={6} />
          <circle r={8} fill="#ff3b3b" />
          {[0, 90, 180, 270].map((d) => <line key={d} x1={0} y1={-100} x2={0} y2={-45} stroke="#ff3b3b" strokeWidth={6} transform={`rotate(${d})`} />)}
        </g>
      )}
    </svg>
  );
};

/** The South Pacific nuclear-free zone, drawn as an approximate glowing area. */
const Zone: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.ilaka4 - 0.1, C.ilaka4 + 0.5, C.nz5 - 0.3, C.nz5 + 0.1);
  if (a <= 0) return null;
  const pts = GEO.spnfz.map((p) => toScreen(c, p));
  const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join('') + 'Z';
  const draw = ramp(t, C.ilaka4, C.sandhi4 + 0.4, inOut);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a, overflow: 'visible' }}>
      <path d={d} fill={COL.zone} fillOpacity={0.22 * draw} stroke="none" />
      <path d={d} fill="none" stroke={COL.zone} strokeWidth={6} pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 10px ${COL.zone})` }} />
    </svg>
  );
};

// ---------------------------------------------------------------- the flat-map overlays

export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const S = (p: P) => toScreen(c, p);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {t < SC.globeIn + 0.5 && <Missiles t={t} c={c} />}
      {/* Fiji */}
      <MapName t={t} t0={C.fiji4 + 0.05} t1={C.aus4 - 0.3} text="Fiji" at={merc(178.0, -17.85)} c={c} size={Math.min(110, 64 * (6.4e5 / c.span) ** 0.6)} />
      <Chip t={t} t0={C.fiji4 - 0.1} t1={C.pacific4 + 0.1} text="पहला" x={540} y={300} color={COL.safe} size={72} />
      <div style={{ position: 'absolute', left: 540, top: 1180, transform: 'translate(-50%,-50%)', fontFamily: NUM, fontSize: 64, letterSpacing: 10, color: '#7ff3ff',
        opacity: window4(t, C.pacific4 + 0.05, C.pacific4 + 0.3, C.n300 - 0.3, C.n300 - 0.1), textShadow: '0 0 18px rgba(0,200,255,0.8), 0 4px 10px rgba(0,0,0,0.6)' }}>PACIFIC OCEAN</div>
      <DashLine t={t} c={c} />
      <MapName t={t} t0={C.aus4 + 0.15} t1={C.akela4 + 0.2} text="AUSTRALIA" at={merc(147, -24)} c={c} size={52} caps />
      <Alone t={t} c={c} />
      <Big t={t} t0={C.akela4 - 0.05} t1={C.nishane4 - 0.15} text="इतना अकेला!" x={540} y={330} size={110} color={COL.safe} />
      <Chip t={t} t0={C.nishane4 + 0.6} t1={C.ilaka4 - 0.2} text="निशाने की वजह ही नहीं" x={540} y={330} color={COL.war} size={58} />
      <Zone t={t} c={c} />
      <Chip t={t} t0={C.zone4 - 0.4} t1={C.nz5 - 0.2} text="NUCLEAR FREE ZONE" x={540} y={330} color={COL.zone} size={62} rot={-2} />
      <Sticker t={t} t0={C.sandhi4 + 0.2} t1={C.nz5 - 0.3} name="w01_nuke_bomb" x={540} y={760} h={220} rot={-8} />
      <NoSign t={t} t0={C.zone4 - 0.3} t1={C.nz5 - 0.3} x={540} y={760} r={210} />
      {/* New Zealand */}
      <MapName t={t} t0={C.nz5 + 0.2} t1={C.y2023 - 0.2} text="New Zealand" at={merc(172.3, -42.2)} c={c} size={70} />
      <Chip t={t} t0={C.nz5 - 0.1} t1={C.y1987} text="दूसरा" x={540} y={300} color={COL.safe} size={72} />
      <Counter t={t} t0={C.y1987 - 0.05} t1={C.hathiyar5 - 0.2} to={1987} x={540} y={330} size={170} color={COL.gold} dur={0.7} />
      <Sticker t={t} t0={C.kanoon5 - 0.05} t1={C.y2023 - 0.2} name="w03_law_scroll" x={800} y={1430} h={360} rot={6} />
      <Sticker t={t} t0={C.hathiyar5 - 0.35} t1={C.y2023 - 0.2} name="w01_nuke_bomb" x={290} y={700} h={170} rot={8} />
      <NoSign t={t} t0={C.hathiyar5} t1={C.y2023 - 0.2} x={290} y={700} r={175} />
      <Chip t={t} t0={C.y2023 - 0.05} t1={C.sardi5 - 0.1} text="2023 की STUDY" x={540} y={330} color={COL.gold} size={64} />
      <Chip t={t} t0={C.sardi5 - 0.05} t1={C.nz5b - 0.2} text="❄ परमाणु सर्दी" x={540} y={330} color={COL.winter} size={72} />
      <Sticker t={t} t0={C.fasle5 - 0.1} t1={C.nz5b - 0.2} name="w04_wheat_bundle" x={290} y={1250} h={380} rot={-14} grey={ramp(t, C.barbaad5, C.barbaad5 + 0.6)} />
      <NoSign t={t} t0={C.barbaad5 + 0.1} t1={C.nz5b - 0.2} x={290} y={1250} r={190} />
      {/* Iceland */}
      <Chip t={t} t0={C.teesra6 - 0.05} t1={C.iceland6 - 0.1} text="तीसरा" x={540} y={300} color={COL.safe} size={72} />
      <Big t={t} t0={C.ajeeb6 - 0.05} t1={C.iceland6 + 0.2} text="सबसे अजीब नाम…" x={540} y={460} size={96} color={COL.gold} />
      <MapName t={t} t0={C.iceland6 + 0.05} t1={C.uttar6 - 0.3} text="Iceland" at={merc(-18.7, 64.9)} c={c} size={110} />
      <Chip t={t} t0={C.uttar6} t1={C.army7 - 0.3} text="⬆ उत्तर में!" x={540} y={640} color={COL.war} size={64} />
      <Sticker t={t} t0={C.army7 - 0.05} t1={C.n19 - 0.2} name="w06_tank" x={540} y={1180} h={300} rot={-3} />
      <NoSign t={t} t0={C.army7 + 0.25} t1={C.n19 - 0.2} x={540} y={1180} r={290} />
      <Chip t={t} t0={C.army7 + 0.1} t1={C.n19 - 0.2} text="NO ARMY" x={540} y={330} color={COL.war} size={70} />
      <Counter t={t} t0={C.n19 - 0.05} t1={C.thand7 - 0.2} to={19} post=" साल" x={540} y={330} size={190} color={COL.gold} dur={0.6} />
      <Chip t={t} t0={C.shaant7 - 0.1} t1={C.thand7 - 0.2} text="#1 सबसे शांत देश" x={540} y={520} color={COL.safe} size={62} />
      <Dove t={t} t0={C.n19 + 0.1} t1={C.thand7 - 0.15} />
      {/* the close */}
      <Big t={t} t0={C.chautha8 - 0.05} t1={C.bunker8 - 0.2} text="चौथा देश?" x={540} y={660} size={130} color={COL.teaser} />
    </AbsoluteFill>
  );
};

/** The peace dove, wings flapping, flying across. */
const Dove: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const p = ramp(t, t0, t1 + 0.3, linear);
  const x = lerp(-260, 1340, p), y = 1250 - Math.sin(p * Math.PI) * 220 + Math.sin(t * 9) * 10;
  const [bw, bh] = SZ.w07_dove_body, [ww, wh] = SZ.w07_dove_wing;
  const H = 300, W = (H * bw) / bh;
  const flap = Math.sin(t * 15);
  const wing = (back: boolean) => (
    <Img src={staticFile('ww3safe/img/w07_dove_wing.png')} style={{ position: 'absolute', left: W * 0.3, top: -H * 0.78, width: (H * 1.25 * ww) / wh, height: H * 1.25,
      transformOrigin: '12% 92%', transform: `scaleY(${back ? -0.25 + 0.75 * flap : 0.2 + 0.8 * flap}) rotate(${back ? -8 : 0}deg)`, filter: back ? 'brightness(0.82)' : undefined }} />
  );
  return (
    <div style={{ position: 'absolute', left: x - W / 2, top: y - H / 2, width: W, height: H, transform: `rotate(${-6 + flap * 3}deg)`, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.45))' }}>
      {wing(true)}
      <Img src={staticFile('ww3safe/img/w07_dove_body.png')} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
      {wing(false)}
    </div>
  );
};

// ---------------------------------------------------------------- full-screen scenes

/** Cutaways and full-screen beats that cover the map. */
export const Scenes: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* Fiji: 300+ islands */}
    <Cutaway t={t} t0={C.n300 - 0.15} t1={C.aus4 - 0.1} src="w09_fiji_aerial" from={1.02} to={1.18} dx={-20}>
      <Counter t={t} t0={C.n300 - 0.05} t1={C.aus4 - 0.1} to={300} post="+ द्वीप" x={540} y={420} size={200} color="#fff" dur={0.7} />
      <Sticker t={t} t0={C.dweep4 - 0.1} t1={C.aus4 - 0.15} name="w02_palm_trunk" x={900} y={1500} h={760} rot={4} />
      <PalmCrown t={t} t0={C.dweep4 - 0.1} t1={C.aus4 - 0.15} />
    </Cutaway>
    {/* New Zealand still grows its food */}
    <Cutaway t={t} t0={C.nz5b - 0.15} t1={C.teesra6 - 0.15} src="w11_nz_farm" from={1.05} to={1.15} dx={24}>
      <Sticker t={t} t0={C.khana5 - 0.1} t1={C.teesra6 - 0.2} name="w05_sheep" x={760} y={1300} h={380} />
      <Sticker t={t} t0={C.uga5 - 0.1} t1={C.teesra6 - 0.2} name="w04_wheat_bundle" x={290} y={1240} h={440} rot={-6} />
      <Chip t={t} t0={C.uga5} t1={C.teesra6 - 0.2} text="✓ अपना खाना खुद" x={540} y={420} color={COL.safe} size={66} />
    </Cutaway>
    {/* Iceland: heat from the ground */}
    <Cutaway t={t} t0={C.thand7 - 0.15} t1={SC.close - 0.1} src="w10_iceland_geothermal" from={1.04} to={1.14} dx={-20}>
      <At t0={C.thand7 - 0.15} t1={SC.close} x={760} y={1300} w={600} h={900} ay={1} scale={1.1}><Clip name="m07_steam" loop /></At>
      <At t0={C.thand7 + 0.4} t1={SC.close} x={330} y={1360} w={600} h={900} ay={1} scale={0.8} opacity={0.8}><Clip name="m07_steam" loop /></At>
      <Counter t={t} t0={C.n90 - 0.05} t1={SC.close - 0.1} to={90} post="% घर" x={540} y={420} size={210} color={COL.gold} dur={0.6} />
      <Chip t={t} t0={C.garmi7 - 0.05} t1={SC.close - 0.1} text="ज़मीन की गर्मी से" x={540} y={620} color={COL.aus} size={60} />
    </Cutaway>
    <Bunker t={t} />
  </>
);

/** The palm crown on top of the trunk, swaying in the wind. */
const PalmCrown: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0 + 0.08, 9, 230)) * (1 - ramp(t, t1, t1 + 0.22, easeIn));
  const [w0, h0] = SZ.w02_palm_crown;
  const H = 560, W = (H * w0) / h0;
  return (
    <Img src={staticFile('ww3safe/img/w02_palm_crown.png')} style={{ position: 'absolute', left: 930 - W / 2, top: 1120 - H * 0.55 + Math.sin((t - t0) * 2.1) * 8, width: W, height: H,
      transformOrigin: '50% 60%', transform: `rotate(${Math.sin(t * 2.4) * 5}deg) scale(${s})`, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.55))' }} />
  );
};

/** The bunker: a heavy round door swings open, light inside. */
const Bunker: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.bunker8 - 0.2, t1 = C.pehchana9 - 0.15;
  if (t < t0 || t > t1 + 0.3) return null;
  const a = ramp(t, t0, t0 + 0.2, easeOut) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  const open = ramp(t, C.bani8 - 0.35, C.bani8 + 0.6, inOut);
  const push = lerp(1.0, 1.12, ramp(t, t0, t1, linear));
  const [fw, fh] = SZ.w08_bunker_frame, [dw, dh] = SZ.w08_bunker_door;
  const FW = 900, FH = (FW * fh) / fw;
  // the doorway: about 47% of the frame width, centred at (55%, 50%) on the cut-out
  const DW = FW * 0.6, DH = (DW * dh) / dw;
  const cx = 540 + FW * 0.06, cy = 860;
  return (
    <AbsoluteFill style={{ opacity: a, background: 'radial-gradient(ellipse at 50% 45%, #2a2f33 0%, #0c0f12 70%)' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, perspective: 1600 }}>
        <Img src={staticFile('ww3safe/img/w08_bunker_frame.png')} style={{ position: 'absolute', left: 540 - FW / 2, top: cy - FH / 2, width: FW, height: FH, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.7))' }} />
        <div style={{ position: 'absolute', left: cx - FW * 0.18, top: cy - FW * 0.18, width: FW * 0.36, height: FW * 0.36, borderRadius: '50%', opacity: open,
          background: 'radial-gradient(circle, rgba(255,214,140,0.65) 0%, rgba(255,180,80,0.15) 50%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen' }} />
        <Img src={staticFile('ww3safe/img/w08_bunker_door.png')} style={{ position: 'absolute', left: cx - DW / 2, top: cy - DH / 2, width: DW, height: DH,
          transformOrigin: '6% 50%', transform: `rotateY(${-100 * open}deg)`, filter: `brightness(${1 - 0.35 * open}) drop-shadow(0 20px 30px rgba(0,0,0,0.6))` }} />
      </div>
      <Chip t={t} t0={C.bunker8 + 0.1} t1={t1} text="हर इंसान के लिए bunker" x={540} y={330} color={COL.gold} size={60} />
    </AbsoluteFill>
  );
};

/** Nuclear winter: the map greys and ash falls, from "परमाणु सर्दी" until New Zealand's farm. */
export const winterAt = (t: number) => window4(t, C.sardi5 - 0.1, C.sardi5 + 0.6, C.nz5b - 0.3, C.nz5b);
export const Ash: React.FC<{ t: number }> = ({ t }) => {
  const a = winterAt(t);
  if (a <= 0) return null;
  return <At t0={C.sardi5 - 0.1} t1={C.nz5b} x={540} y={960} w={1080} h={1920} opacity={a}><Clip name="m05_ash_fall" loop /></At>;
};

/** The comment burst over the teaser map. */
export const Comment: React.FC<{ t: number }> = ({ t }) => (
  t > C.comment9 - 0.2 ? <At t0={C.comment9 - 0.15} t1={DURATION_S + 1} x={540} y={1000} w={600} h={600} scale={1.1}><Clip name="m08_comment_burst" /></At> : null
);

/** The title banner over the hook. */
export const Banner: React.FC<{ t: number }> = ({ t }) => (
  t < SC.globeIn + 0.3 ? (
    <At t0={0.12} t1={SC.globeIn + 0.3} x={540} y={250} w={1080} h={560} opacity={1 - ramp(t, SC.globeIn - 0.1, SC.globeIn + 0.2, linear)}><Clip name="m01_title_banner" /></At>
  ) : null
);

/** Whip transitions on the big moves. */
const WHIPS = () => [SC.flat - 0.05, C.nz5 - 0.05, SC.iceland - 0.15, SC.close - 0.15, C.ajeeb6 - 0.4];
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
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  let flash = 0;
  for (const h of [C.europe1 + 0.5, C.khatra2, C.fiji4, C.zone4, C.iceland6]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  const pacific = window4(t, C.pacific4, C.pacific4 + 0.3, C.pacific4 + 0.6, C.pacific4 + 1.0);
  // the map darkens under the sticker beats so the props pop (reference frames 738–800)
  const dim = Math.max(window4(t, C.sandhi4, C.sandhi4 + 0.3, C.nz5 - 0.4, C.nz5 - 0.1), window4(t, C.kanoon5 - 0.1, C.kanoon5 + 0.3, C.y2023 - 0.3, C.y2023),
    window4(t, C.army7 - 0.1, C.army7 + 0.3, C.thand7 - 0.4, C.thand7 - 0.15));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      {dim > 0 && <AbsoluteFill style={{ background: '#000', opacity: dim * 0.28 }} />}
      {pacific > 0 && <AbsoluteFill style={{ background: '#1e8fff', opacity: pacific * 0.45, mixBlendMode: 'color-dodge' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.35, mixBlendMode: 'screen' }} />}
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

export { GlobeFx };
