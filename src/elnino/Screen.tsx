import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { useMontserrat } from '../darien/Brand';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { COLD, GOLD, WARM } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
export const LATIN = "'Montserrat', sans-serif";

/** GPT assets that have arrived (file names in public/elnino/img). Anything missing renders as a labelled placeholder. */
export const HAVE = new Set<string>([]);

const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');
const at = (c: Cam, lon: number, lat: number): P => toScreen(c, merc(lon, lat));
/** Local screen scale at a map point relative to the camera's nominal scale (perspective makes near things bigger). */
const persp = (c: Cam, lon: number, lat: number) => {
  const a = at(c, lon, lat);
  const b = at(c, lon + 1, lat);
  const a0 = toScreen({ ...c, tilt: 0 }, merc(lon, lat));
  const b0 = toScreen({ ...c, tilt: 0 }, merc(lon + 1, lat));
  return Math.hypot(b[0] - a[0], b[1] - a[1]) / Math.max(1e-6, Math.hypot(b0[0] - a0[0], b0[1] - a0[1]));
};

// ---------------------------------------------------------------- assets
const Asset: React.FC<{ name: string; w: number; h?: number; style?: React.CSSProperties; blend?: React.CSSProperties['mixBlendMode'] }> = ({ name, w, h, style, blend }) => {
  if (HAVE.has(name)) {
    return <img src={staticFile(`elnino/img/${name}`)} style={{ width: w, height: h ?? 'auto', display: 'block', mixBlendMode: blend, ...style }} />;
  }
  return (
    <div style={{ width: w, height: h ?? w, borderRadius: 24, border: '3px dashed rgba(255,255,255,0.7)', background: 'rgba(30,60,90,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'monospace', fontSize: Math.max(14, w / 12), textAlign: 'center', ...style }}>
      {name.replace('.png', '')}
    </div>
  );
};

/**
 * A 3D prop standing on the map: springs in from below with overshoot and blur, squashes on landing, casts a soft
 * contact shadow, bobs gently and gets a light sweep across its surface. Exits by shrinking with a little blur.
 */
const Prop: React.FC<{
  name: string; t: number; t0: number; t1: number; x: number; y: number; w: number; bob?: number; rot?: number; shadow?: boolean; children?: React.ReactNode; sweep?: boolean;
}> = ({ name, t, t0, t1, x, y, w, bob = 6, rot = 0, shadow = true, children, sweep = true }) => {
  if (t < t0 - 0.05 || t > t1 + 0.4) return null;
  const s = pop(t, t0, 10, 190);
  const out = ramp(t, t1, t1 + 0.32, easeIn);
  const sc = clamp01(s) * (1 - out) + (s > 1 ? s - 1 : 0) * (1 - out);
  if (sc <= 0.01) return null;
  const land = kick(t, t0 + 0.18, 0.12, 26, 10);
  const blur = Math.max(0, (1 - clamp01((t - t0) / 0.18)) * 6) + out * 8;
  const yb = Math.sin((t - t0) * 2.6) * bob;
  const sw = sweep ? ((t - t0 - 0.25) % 3.2) / 0.9 : -1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.32, top: -w * 0.07, width: w * 0.64, height: w * 0.14, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.45), rgba(0,0,0,0))', transform: `scale(${sc * (1 - yb / 60)})`, opacity: 1 - out }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, bottom: 0, width: w, transformOrigin: '50% 100%',
        transform: `translateY(${-yb - (1 - clamp01(s)) * 120}px) rotate(${rot}deg) scale(${sc * (1 - land)}, ${sc * (1 + land)})`,
        filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
        <Asset name={name} w={w} />
        {sweep && sw > 0 && sw < 1 && HAVE.has(name) && (
          <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay',
            WebkitMaskImage: `url(${staticFile(`elnino/img/${name}`)})`, WebkitMaskSize: '100% 100%',
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${sw * 140 - 40}%, rgba(255,255,255,0.9) ${sw * 140 - 20}%, rgba(255,255,255,0) ${sw * 140}%)` }} />
        )}
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- text
/** Hindi label pinned to the map: letters rise in one by one with a soft glow, underline draws on. */
const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string }> = ({ text, t, t0, t1, x, y, size = 46, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', opacity: a, fontFamily: FONT, fontWeight: 800, fontSize: size, color,
      textShadow: '0 3px 10px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)' }}>
      {g.map((ch, i) => {
        const p = clamp01(pop(t, t0 + i * 0.035, 12, 200));
        return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 26}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
      })}
      <div style={{ height: 4, marginTop: 2, borderRadius: 2, background: color, opacity: 0.85, transformOrigin: '0 50%', transform: `scaleX(${ramp(t, t0 + 0.1, t0 + 0.5, easeOut)})`, boxShadow: `0 0 10px ${color}` }} />
    </div>
  );
};

/** Big Latin title: letters slam in from depth with blur, a layered colour glow, and a light sweep across. */
const Title: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size: number; glowColor: string; color?: string; stagger?: number; tilt?: number; font?: string }> = ({
  text, t, t0, t1, x, y, size, glowColor, color = '#fff', stagger = 0.045, tilt = -6, font = LATIN,
}) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.2, t1);
  if (a <= 0) return null;
  const letters = graphemes(text);
  const sw = ramp(t, t0 + 0.35, t0 + 1.1, inOut);
  const breathe = 1 + 0.015 * Math.sin((t - t0) * 3);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, perspective: 1000 }}>
      <div style={{ position: 'absolute', transform: `translate(-50%,-50%) rotate(${tilt}deg) scale(${breathe})`, whiteSpace: 'nowrap', opacity: a,
        fontFamily: font, fontWeight: 900, fontSize: size, letterSpacing: font === LATIN ? -size * 0.02 : 0, color,
        filter: `drop-shadow(0 0 ${size * 0.08}px ${glowColor}) drop-shadow(0 0 ${size * 0.22}px ${glowColor}) drop-shadow(0 6px 14px rgba(0,0,0,0.5))` }}>
        {letters.map((ch, i) => {
          const s = pop(t, t0 + i * stagger, 9, 210);
          const p = clamp01(s);
          const bl = Math.max(0, (1 - clamp01((t - t0 - i * stagger) / 0.16)) * 10);
          return (
            <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 2), transform: `translateZ(${lerp(-700, 0, p)}px) scale(${0.4 + 0.6 * s})`,
              filter: bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : undefined }}>{ch === ' ' ? ' ' : ch}</span>
          );
        })}
        <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
          backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sw * 160 - 50}%, rgba(255,255,255,0.95) ${sw * 160 - 30}%, rgba(255,255,255,0) ${sw * 160 - 10}%)` }}>{text}</span>
      </div>
    </div>
  );
};

/** Text written along a curve through map points (reference "Trade winds" / "Eastern Pacific"), revealed left→right. */
const CurveText: React.FC<{ id: string; text: string; pts: P[]; t: number; t0: number; t1: number; size: number; color: string; glowC: string; font?: string; dir?: 1 | -1 }> = ({
  id, text, pts, t, t0, t1, size, color, glowC, font = FONT, dir = 1,
}) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.3, t1);
  if (a <= 0) return null;
  const ps = dir === 1 ? pts : [...pts].reverse();
  let d = `M${ps[0][0]},${ps[0][1]}`;
  for (let i = 1; i < ps.length - 1; i++) d += ` Q${ps[i][0]},${ps[i][1]} ${(ps[i][0] + ps[i + 1][0]) / 2},${(ps[i][1] + ps[i + 1][1]) / 2}`;
  d += ` L${ps[ps.length - 1][0]},${ps[ps.length - 1][1]}`;
  const rv = ramp(t, t0, t0 + 0.7, easeOut);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, filter: glow(glowC, 6, 2) }}>
      <defs>
        <path id={`${id}p`} d={d} />
        <linearGradient id={`${id}m`} gradientUnits="userSpaceOnUse" x1={ps[0][0]} x2={ps[ps.length - 1][0]} y1={0} y2={0}>
          <stop offset={0} stopColor="#fff" />
          <stop offset={Math.max(0, rv - 0.05)} stopColor="#fff" />
          <stop offset={Math.min(1, rv + 0.05)} stopColor="#000" />
        </linearGradient>
        <mask id={`${id}k`}><rect x={-2000} y={-2000} width={6000} height={6000} fill={`url(#${id}m)`} /></mask>
      </defs>
      <text mask={`url(#${id}k)`} fontFamily={font} fontWeight={800} fontSize={size} fill={color} letterSpacing={2}>
        <textPath href={`#${id}p`} startOffset="50%" textAnchor="middle">{text}</textPath>
      </text>
    </svg>
  );
};

/** Number that counts up with a slight overshoot and a glow pulse when it lands. */
const Counter: React.FC<{ t: number; t0: number; t1: number; from: number; to: number; fmt: (v: number) => string; x: number; y: number; size: number; color: string; glowC: string; dur?: number; font?: string; prefix?: string; suffix?: string }> = ({
  t, t0, t1, from, to, fmt, x, y, size, color, glowC, dur = 0.9, font = LATIN, prefix = '', suffix = '',
}) => {
  const a = window4(t, t0, t0 + 0.12, t1 - 0.25, t1);
  if (a <= 0) return null;
  const p = ramp(t, t0, t0 + dur, easeOut);
  const v = lerp(from, to, p);
  const land = kick(t, t0 + dur, 0.08, 20, 8);
  const s = clamp01(pop(t, t0, 11, 200));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * s) * (1 + land)})`, opacity: a, whiteSpace: 'nowrap',
      fontFamily: font, fontWeight: 900, fontSize: size, color, filter: `drop-shadow(0 0 ${size * 0.1}px ${glowC}) drop-shadow(0 0 ${size * 0.3}px ${glowC}) drop-shadow(0 6px 12px rgba(0,0,0,0.6))` }}>
      {prefix && <span style={{ fontFamily: FONT, fontSize: size * 0.42, fontWeight: 800, marginRight: size * 0.12 }}>{prefix}</span>}
      {fmt(v)}
      {suffix && <span style={{ fontFamily: FONT, fontSize: size * 0.42, fontWeight: 800, marginLeft: size * 0.12 }}>{suffix}</span>}
    </div>
  );
};

/** Thermometer with liquid that rises and shifts blue → red, and a reading that counts up beside it. */
const Thermo: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; h: number; to: number; dur?: number }> = ({ t, t0, t1, x, y, h, to, dur = 1.1 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.4) return null;
  const s = pop(t, t0, 10, 190);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const sc = Math.max(0, s * (1 - out));
  const p = ramp(t, t0 + 0.2, t0 + 0.2 + dur, easeOut);
  const v = to * p;
  const hot = clamp01(v / 2.5);
  const col = `rgb(${Math.round(lerp(60, 255, hot))},${Math.round(lerp(150, 55, hot))},${Math.round(lerp(255, 50, hot))})`;
  const w = h * 0.26;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -w / 2, bottom: 0, width: w, height: h, transformOrigin: '50% 100%', transform: `scale(${sc})` }}>
        {HAVE.has('thermometer.png') ? (
          <>
            <div style={{ position: 'absolute', left: '41%', width: '18%', bottom: '14%', height: `${12 + 62 * clamp01(v / Math.max(2.5, to))}%`, background: col, borderRadius: 99, boxShadow: `0 0 12px ${col}` }} />
            <div style={{ position: 'absolute', left: '28%', width: '44%', bottom: '2%', height: '22%', background: col, borderRadius: '50%', boxShadow: `0 0 16px ${col}` }} />
            <img src={staticFile('elnino/img/thermometer.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
          </>
        ) : (
          <svg width={w} height={h} viewBox="0 0 26 100">
            <rect x={8} y={2} width={10} height={80} rx={5} fill="rgba(255,255,255,0.85)" />
            <rect x={10.5} y={78 - 66 * clamp01(v / Math.max(2.5, to))} width={5} height={66 * clamp01(v / Math.max(2.5, to)) + 6} rx={2.5} fill={col} />
            <circle cx={13} cy={86} r={11} fill={col} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
          </svg>
        )}
        <div style={{ position: 'absolute', left: w * 1.05, top: h * 0.08, fontFamily: LATIN, fontWeight: 900, fontSize: h * 0.26, color: '#fff', whiteSpace: 'nowrap',
          filter: `drop-shadow(0 0 6px ${col}) drop-shadow(0 3px 6px rgba(0,0,0,0.7))`, opacity: clamp01(p * 3) }}>
          +{v.toFixed(1)}°C
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the fan rig (body / spinning blades / grill)
const fanSpin = (t: number) => {
  // angle = integral of speed; speed ramps up after the pop and decays to zero when the fan "stops"
  const on = C.pankha + 0.1;
  const off = C.achanak + 0.15;
  const dt = 1 / 120;
  let ang = 0;
  for (let u = on; u < Math.min(t, DURATION_S); u += dt) {
    const sp = u < off ? 1500 * ramp(u, on, on + 0.5, easeOut) : 1500 * Math.exp(-(u - off) * 2.6);
    ang += sp * dt;
  }
  return ang;
};

const Fan: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.pankha - 0.15;
  const t1 = C.elnino + 0.2;
  if (t < t0 - 0.05 || t > t1 + 1.2) return null;
  const [x, y] = at(c, -79.5, -2.5);
  const s = pop(t, t0, 10, 180);
  const shrink = lerp(1, 0.55, ramp(t, C.elnino - 0.1, C.elnino + 0.4, inOut));
  const out = ramp(t, C.naam + 0.2, C.isbaar, easeIn);
  const w = 300 * persp(c, -79.5, -2.5) * shrink;
  const sc = clamp01(s) * (1 - out);
  if (sc <= 0.01) return null;
  const ang = fanSpin(t);
  const stopped = ramp(t, C.band, C.band + 0.5, easeOut);
  const droop = stopped * 8 + kick(t, C.band, 3, 18, 6);
  const puff = window4(t, C.band - 0.05, C.band + 0.05, C.band + 0.6, C.band + 1.4);
  const spark = window4(t, C.band - 0.05, C.band, C.band + 0.1, C.band + 0.25);
  const blurB = Math.min(1, 1 - stopped) * 2.5;
  const layer = (name: string, extra?: React.CSSProperties) => (
    <div style={{ position: 'absolute', inset: 0, ...extra }}><Asset name={name} w={w} /></div>
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -w * 0.35, top: -w * 0.06, width: w * 0.7, height: w * 0.12, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))', transform: `scale(${sc})` }} />
      <div style={{ position: 'absolute', left: -w / 2, top: -w, width: w, height: w, transformOrigin: '50% 100%',
        transform: `translateY(${(1 - clamp01(s)) * 140}px) scale(${sc}) rotate(${-droop}deg) scaleX(-1)` }}>
        {layer('fan_body.png')}
        {/* blades: rotate about the hub (the images share a centre); motion-blur ghosts while fast */}
        {HAVE.has('fan_blades.png') ? (
          <>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ position: 'absolute', inset: 0, transform: `rotate(${ang - k * 14}deg)`, opacity: k === 0 ? 1 : 0.35 * (1 - stopped), filter: blurB > 0.2 ? `blur(${blurB}px)` : undefined }}>
                <Asset name="fan_blades.png" w={w} />
              </div>
            ))}
          </>
        ) : null}
        {layer('fan_grill.png')}
        {puff > 0 && (
          <div style={{ position: 'absolute', left: w * 0.15, top: -w * 0.25, width: w * 0.7, opacity: puff, transform: `translateY(${-ramp(t, C.band, C.band + 1.4) * w * 0.35}px) scale(${0.6 + 0.6 * ramp(t, C.band, C.band + 1.4)})` }}>
            <Asset name="smoke_puff.png" w={w * 0.7} blend="screen" />
          </div>
        )}
        {spark > 0 && <div style={{ position: 'absolute', left: '50%', top: '42%', width: w * 1.6, height: w * 1.6, transform: 'translate(-50%,-50%)', opacity: spark, background: 'radial-gradient(closest-side, rgba(255,255,255,1), rgba(160,230,255,0.6) 30%, rgba(160,230,255,0) 70%)', mixBlendMode: 'screen' }} />}
      </div>
    </div>
  );
};

/** Cool air streaming out of the fan toward the west (screen space): a fan of fading streaks. */
const FanAir: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.pankha + 0.1, C.pankha + 0.5, C.achanak + 0.1, C.band + 0.3);
  if (a <= 0) return null;
  const [x, y] = at(c, -81, -2.5);
  const k = persp(c, -81, -2.5);
  const lines = Array.from({ length: 26 }, (_, i) => {
    const r1 = Math.sin(i * 91.7) * 0.5 + 0.5;
    const r2 = Math.sin(i * 37.3 + 1) * 0.5 + 0.5;
    const ph = ((t * (1.1 + r1 * 0.8) + r2) % 1);
    const ang = (180 + (r1 - 0.5) * 34) * (Math.PI / 180);
    const d0 = 60 + ph * 620 * k;
    const len = (90 + r2 * 120) * k;
    const x0 = x + Math.cos(ang) * d0;
    const y0 = y - 120 * k + Math.sin(ang) * d0 * 0.5;
    const x1 = x + Math.cos(ang) * (d0 + len);
    const y1 = y - 120 * k + Math.sin(ang) * (d0 + len) * 0.5;
    return { x0, y0, x1, y1, o: Math.sin(ph * Math.PI) };
  });
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a, filter: glow('rgba(120,230,255,0.9)', 5, 2) }}>
      {lines.map((l, i) => (
        <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1} stroke="#DFFBFF" strokeOpacity={0.8 * l.o} strokeWidth={3} strokeLinecap="round" />
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------- ships
const Ship: React.FC<{ t: number; c: Cam; name: string; lat: number; lon0: number; lon1: number; w: number; delay: number }> = ({ t, c, name, lat, lon0, lon1, w, delay }) => {
  const t0 = C.jahaz - 0.1 + delay;
  const t1 = C.garm + 0.1;
  if (t < t0 - 0.05 || t > t1 + 0.5) return null;
  const lon = lerp(lon0, lon1, ramp(t, t0, t1 + 0.4, linear));
  const [x, y] = at(c, lon, lat);
  const k = persp(c, lon, lat);
  const roll = Math.sin(t * 3.1 + delay * 5) * 4;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: window4(t, t0, t0 + 0.3, t1, t1 + 0.4) * 0.8 }}>
        <path d={`M${x + 10},${y - 6} L${x + 160 * k},${y - 34 * k} M${x + 10},${y + 4} L${x + 160 * k},${y + 26 * k}`} stroke="#fff" strokeWidth={3} strokeOpacity={0.5} strokeLinecap="round" style={{ filter: 'blur(1.5px)' }} />
      </svg>
      <Prop name={name} t={t} t0={t0} t1={t1} x={x} y={y} w={w * k} bob={4} rot={roll} shadow={false} />
    </>
  );
};

// ---------------------------------------------------------------- rain under a cloud
const Rain: React.FC<{ t: number; x: number; y: number; w: number; h: number; a: number; heavy?: number }> = ({ t, x, y, w, h, a, heavy = 1 }) => {
  if (a <= 0) return null;
  const n = Math.round(34 * heavy);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      {Array.from({ length: n }, (_, i) => {
        const r = Math.sin(i * 57.13) * 0.5 + 0.5;
        const ph = (t * (2.2 + r) + r * 3) % 1;
        const px = x - w / 2 + ((i * 0.618) % 1) * w - ph * 22;
        const py = y + ph * h;
        return <line key={i} x1={px} y1={py} x2={px - 9} y2={py + 34} stroke="#CFEFFF" strokeWidth={2.4} strokeOpacity={0.75 * Math.sin(ph * Math.PI)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const Cloud: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w: number; rain?: number; flash?: boolean }> = ({ t, t0, t1, x, y, w, rain = 1, flash }) => {
  const ra = window4(t, t0 + 0.3, t0 + 0.6, t1 - 0.2, t1) * rain;
  const fl = flash ? Math.max(0, Math.sin((t - t0) * 9.5) ** 18) * window4(t, t0 + 0.6, t0 + 0.7, t1 - 0.3, t1) : 0;
  return (
    <>
      <Rain t={t} x={x} y={y - w * 0.18} w={w * 0.7} h={w * 0.8} a={ra} heavy={rain} />
      <Prop name="icon_raincloud.png" t={t} t0={t0} t1={t1} x={x} y={y} w={w} bob={5} shadow={false} />
      {fl > 0.01 && <div style={{ position: 'absolute', left: x - w, top: y - w * 1.2, width: w * 2, height: w * 2, background: 'radial-gradient(closest-side, rgba(220,240,255,0.8), rgba(220,240,255,0))', opacity: fl, mixBlendMode: 'screen' }} />}
    </>
  );
};

// ---------------------------------------------------------------- inserts
const stars = Array.from({ length: 220 }, (_, i) => {
  const r = (k: number) => {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1080, y: r(2) * 1920, s: 0.6 + r(3) * 2.2, ph: r(4) * 6.28, d: r(5) };
});

/** "बस, दुनिया भर का मौसम बिगड़ जाता है": deep-space insert, calm Earth → overheated Earth with a shockwave. */
const SpaceInsert: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.bas - 0.12;
  const t1 = C.peru7 - 0.08;
  if (t < t0 || t > t1 + 0.3) return null;
  const inP = ramp(t, t0, t0 + 0.28, easeOut);
  const outP = ramp(t, t1 - 0.05, t1 + 0.25, easeIn);
  const x = (1 - inP) * 1080 - outP * 1080;
  const vel = (1 - inP) * (inP > 0 ? 1 : 0) + outP * (1 - outP);
  const hit = C.bigad - 0.05;
  const boom = ramp(t, hit, hit + 0.6, easeOut);
  const calm = 1 - ramp(t, hit - 0.05, hit + 0.05, linear);
  const es = 1 + kick(t, hit, 0.18, 16, 7) + 0.04 * Math.sin(t * 2);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: vel > 0.05 ? `blur(${(vel * 18).toFixed(1)}px)` : undefined }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #10403f 0%, #072322 45%, #020a0b 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x - (t - t0) * 14 * s.d} cy={s.y} r={s.s} fill="#fff" opacity={0.35 + 0.45 * Math.sin(t * 2 + s.ph) ** 2} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 540, top: 900, width: 0, height: 0 }}>
        {boom > 0 && boom < 1 && (
          <div style={{ position: 'absolute', left: -600 * boom, top: -600 * boom, width: 1200 * boom, height: 1200 * boom, borderRadius: '50%',
            border: `${(1 - boom) * 40}px solid rgba(255,170,90,${(1 - boom) * 0.8})`, filter: 'blur(4px)' }} />
        )}
        <div style={{ position: 'absolute', left: -280, top: -280, width: 560, height: 560, transform: `scale(${es * clamp01(pop(t, t0 + 0.1, 11, 170))})`,
          filter: `drop-shadow(0 0 40px ${calm > 0.5 ? 'rgba(80,200,255,0.55)' : 'rgba(255,110,40,0.7)'})` }}>
          <div style={{ position: 'absolute', inset: 0, opacity: calm }}><Asset name="earth_calm.png" w={560} /></div>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - calm, transform: `translate(${kick(t, hit, 14, 40, 6)}px, 0)` }}><Asset name="earth_overheat.png" w={560} /></div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: window4(t, hit - 0.02, hit, hit + 0.02, hit + 0.18) * 0.6, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

/** India beat: a cinematic still of a dry field with the "−13%" counter. */
const FieldInsert: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.p13 - 0.35;
  const t1 = C.y1876 - 0.05;
  if (t < t0 || t > t1 + 0.1) return null;
  const a = window4(t, t0, t0 + 0.35, t1 - 0.05, t1 + 0.05);
  const z = 1.06 + 0.06 * ramp(t, t0, t1, linear);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        {HAVE.has('scene_dry_field.png') ? <img src={staticFile('elnino/img/scene_dry_field.png')} style={{ width: 1080, height: 1920, objectFit: 'cover' }} /> : <Asset name="scene_dry_field.png" w={1080} h={1920} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />
      <Counter t={t} t0={C.p13} t1={t1 + 0.1} from={0} to={-13} fmt={(v) => `${Math.round(v)}%`} x={540} y={760} size={230} color="#fff" glowC="#FF8A3D" />
      <Label text="मानसून 2026" t={t} t0={C.p13 + 0.15} t1={t1 + 0.1} x={540} y={600} size={58} color="#FFD98A" />
      <Label text="2015 के बाद सबसे कम" t={t} t0={C.y2015 - 0.1} t1={t1 + 0.1} x={540} y={925} size={52} color="#fff" />
    </AbsoluteFill>
  );
};

/** 1876: an old film strip rolling in, sepia/purple tint, flicker, scratches, the year burnt in. */
const FilmInsert: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.y1876 - 0.1;
  const t1 = C.akele - 0.15;
  if (t < t0 || t > t1 + 0.35) return null;
  const inP = ramp(t, t0, t0 + 0.35, easeOut);
  const outP = ramp(t, t1, t1 + 0.35, easeIn);
  const roll = (1 - inP) * 1920 - outP * 1920;
  const flick = 0.9 + 0.1 * Math.sin(t * 61) * Math.sin(t * 23);
  const hole = (t * 420) % 160;
  const scratchX = 200 + ((Math.floor(t * 8) * 397) % 680);
  return (
    <AbsoluteFill style={{ transform: `translateY(${roll}px)`, filter: Math.abs(roll) > 20 ? 'blur(6px)' : undefined }}>
      <AbsoluteFill style={{ background: '#140c18' }} />
      <div style={{ position: 'absolute', left: 120, top: 160, width: 840, height: 1600, overflow: 'hidden', opacity: flick }}>
        <div style={{ width: 840, height: 1600, transform: `scale(${1.04 + 0.05 * ramp(t, t0, t1)})`, filter: 'sepia(0.85) hue-rotate(-18deg) contrast(1.15) brightness(0.92)' }}>
          {HAVE.has('scene_1876_drought.png') ? <img src={staticFile('elnino/img/scene_1876_drought.png')} style={{ width: 840, height: 1600, objectFit: 'cover' }} /> : <Asset name="scene_1876_drought.png" w={840} h={1600} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(90,40,120,0.35), rgba(40,10,60,0.15))', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', left: scratchX, top: 0, width: 2, height: 1600, background: 'rgba(255,255,240,0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 160px rgba(0,0,0,0.9)' }} />
      </div>
      {[46, 990].map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: -160 + hole, width: 44, height: 2400 }}>
          {Array.from({ length: 15 }, (_, i) => <div key={i} style={{ position: 'absolute', top: i * 160, width: 44, height: 78, borderRadius: 8, background: 'rgba(235,225,240,0.85)' }} />)}
        </div>
      ))}
      <Title text="1876" t={t} t0={C.y1876 + 0.05} t1={t1 + 0.3} x={540} y={1180} size={190} glowColor="rgba(255,190,120,0.7)" color="#F6E7CF" tilt={0} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- heat arrows rising from the ocean
const HeatArrows: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.garmi - 0.1;
  const a = window4(t, t0, t0 + 0.2, C.y2027 - 0.2, C.y2027 + 0.3);
  if (a <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, filter: glow('rgba(255,120,40,0.9)', 6, 2) }}>
      {Array.from({ length: 16 }, (_, i) => {
        const r = (k: number) => Math.sin(i * 12.9 + k * 7.7) * 0.5 + 0.5;
        const lon = -175 + r(1) * 92;
        const lat = -5 + r(2) * 8;
        const [x, y] = at(c, lon, lat);
        const p = ramp(t, t0 + r(3) * 0.8, t0 + r(3) * 0.8 + 0.7, easeOut);
        if (p <= 0) return null;
        const len = (380 + r(4) * 420) * p;
        const bend = (r(5) - 0.5) * 120;
        const tx = x + bend;
        const ty = y - len;
        const d = `M${x},${y} Q${x + bend * 0.2},${y - len * 0.6} ${tx},${ty}`;
        const hs = 22;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#FF7A3A" strokeWidth={9} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#FFD3A8" strokeWidth={3} strokeLinecap="round" />
            <path d={`M${tx},${ty - hs} L${tx - hs * 0.75},${ty + hs * 0.4} L${tx + hs * 0.75},${ty + hs * 0.4} Z`} fill="#FF7A3A" />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- famine rings (1876, India)
const FAMINE: [string, number, number][] = [['मद्रास', 80.27, 13.08], ['बॉम्बे', 72.88, 19.08], ['मैसूर', 76.64, 12.3], ['हैदराबाद', 78.47, 17.38], ['पुणे', 73.86, 18.52]];

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  useMontserrat();
  const S = (lon: number, lat: number) => at(c, lon, lat);
  const K = (lon: number, lat: number) => persp(c, lon, lat);
  const last = GEO.sst.n34.length - 1;
  const n34 = (p: number) => {
    const f = p * last;
    const i = Math.min(last - 1, Math.floor(f));
    return lerp(GEO.sst.n34[i], GEO.sst.n34[i + 1], f - i);
  };
  const lapse = ramp(t, C.ab + 0.25, C.taqatwar + 0.9, inOut);
  const dayLabel = () => {
    const d = GEO.sst.days[Math.round(lapse * last)];
    const months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    return `${parseInt(d.slice(6, 8), 10)} ${months[parseInt(d.slice(4, 6), 10) - 1]} ${d.slice(0, 4)}`;
  };
  const lapseA = window4(t, C.ab + 0.1, C.ab + 0.4, C.yahan, C.yahan + 0.4);
  return (
    <AbsoluteFill>
      {/* opening: the fan and its breath */}
      <FanAir t={t} c={c} />
      <Fan t={t} c={c} />
      <CurveText id="ep" text="पूर्वी Pacific" t={t} t0={C.thanda - 0.1} t1={C.achanak + 0.3} size={58} color="#BFF6FF" glowC={COLD}
        pts={[S(-92, 4), S(-110, 7), S(-128, 7), S(-146, 5)].map(([x, y]) => [x, y - 60] as P)} dir={-1} />

      {/* El Niño / Super */}
      <Title text="El Niño" t={t} t0={C.elnino - 0.05} t1={C.hawayen - 0.2} x={560} y={830} size={210} glowColor="rgba(70,120,255,0.95)" />
      <Title text="Super" t={t} t0={C.super - 0.08} t1={C.hawayen - 0.2} x={500} y={640} size={150} glowColor="rgba(255,40,60,0.95)" color="#FFE9E9" stagger={0.05} tilt={-8} />

      {/* trade winds */}
      <CurveText id="tw" text="Trade Winds" font={LATIN} t={t} t0={C.trade - 0.05} t1={C.paschim + 0.9} size={78} color="#fff" glowC="rgba(160,230,255,0.9)"
        pts={[S(-100, 13), S(-130, 15), S(-160, 14), S(175, 12)]} dir={-1} />
      <Label text="पूरब" t={t} t0={C.purab - 0.05} t1={C.jahaz} x={S(-95, -14)[0]} y={S(-95, -14)[1]} size={50} />
      <Label text="पश्चिम" t={t} t0={C.paschim - 0.05} t1={C.jahaz} x={S(155, -14)[0]} y={S(155, -14)[1]} size={50} />

      {/* ships */}
      <Ship t={t} c={c} name="ship_galleon_a.png" lat={9} lon0={-150} lon1={-188} w={190} delay={0} />
      <Ship t={t} c={c} name="ship_galleon_b.png" lat={3} lon0={-140} lon1={-176} w={150} delay={0.25} />

      {/* warm water west, rain over Indonesia */}
      <Label text="इंडोनेशिया" t={t} t0={C.indo} t1={C.peru - 0.1} x={S(112, 4)[0]} y={S(112, 4)[1]} size={44} />
      <Label text="ऑस्ट्रेलिया" t={t} t0={C.indo + 0.25} t1={C.peru - 0.1} x={S(134, -24)[0]} y={S(134, -24)[1]} size={48} />
      <Cloud t={t} t0={C.barish - 0.15} t1={C.peru - 0.1} x={S(116, 3)[0]} y={S(116, 3)[1] - 60} w={250 * K(116, 3)} flash />
      <Cloud t={t} t0={C.barish + 0.1} t1={C.peru - 0.1} x={S(140, -4)[0]} y={S(140, -4)[1] - 40} w={190 * K(140, -4)} />

      {/* Peru: cold water, dry coast */}
      <Label text="पेरू" t={t} t0={C.peru + 0.05} t1={C.lekin} x={S(-74, -10)[0]} y={S(-74, -10)[1]} size={52} />
      <Label text="ठंडा पानी" t={t} t0={C.thanda4 - 0.05} t1={C.lekin} x={S(-98, -8)[0]} y={S(-98, -8)[1]} size={46} color="#BFF6FF" />
      <Prop name="icon_sun.png" t={t} t0={C.sukha - 0.15} t1={C.lekin} x={S(-71, -14)[0]} y={S(-71, -14)[1] - 120} w={170 * K(-71, -14)} bob={7} shadow={false} />
      <Prop name="tile_cracked_earth.png" t={t} t0={C.sukha} t1={C.lekin} x={S(-76, -12)[0]} y={S(-76, -12)[1]} w={170 * K(-76, -12)} bob={2} />

      {/* weakening winds → thermometers */}
      <Thermo t={t} t0={C.ekdo - 0.2} t1={C.bas - 0.2} x={S(-150, 1)[0]} y={S(-150, 1)[1]} h={150 * K(-150, 1)} to={1.3} />
      <Thermo t={t} t0={C.ekdo} t1={C.bas - 0.2} x={S(-125, -1)[0]} y={S(-125, -1)[1]} h={160 * K(-125, -1)} to={1.8} />
      <Thermo t={t} t0={C.degree - 0.1} t1={C.bas - 0.2} x={S(-100, -2)[0]} y={S(-100, -2)[1]} h={170 * K(-100, -2)} to={2.2} />

      {/* effects tour */}
      <Prop name="icon_flood_house.png" t={t} t0={C.baadh - 0.1} t1={C.america} x={S(-80, -4)[0]} y={S(-80, -4)[1]} w={200 * K(-80, -4)} />
      <Label text="बाढ़" t={t} t0={C.baadh} t1={C.america} x={S(-89, -1)[0]} y={S(-89, -1)[1] - 40} size={56} color="#9EC2FF" />
      <Cloud t={t} t0={C.bhari - 0.2} t1={C.aus7 - 0.1} x={S(-100, 33)[0]} y={S(-100, 33)[1] - 50} w={220 * K(-100, 33)} rain={1.3} flash />
      <Cloud t={t} t0={C.bhari} t1={C.aus7 - 0.1} x={S(-86, 32)[0]} y={S(-86, 32)[1] - 40} w={170 * K(-86, 32)} rain={1.1} />
      <Label text="भारी बारिश" t={t} t0={C.bhari} t1={C.aus7 - 0.1} x={S(-95, 26)[0]} y={S(-95, 26)[1] + 30} size={50} color="#BFE6FF" />
      <Prop name="icon_sun.png" t={t} t0={C.sukha7 - 0.2} t1={C.bharat} x={S(128, -20)[0]} y={S(128, -20)[1] - 130} w={180 * K(128, -20)} bob={7} shadow={false} />
      <Prop name="tile_cracked_earth.png" t={t} t0={C.sukha7 - 0.05} t1={C.bharat} x={S(136, -27)[0]} y={S(136, -27)[1]} w={180 * K(136, -27)} bob={2} />
      <Label text="सूखा" t={t} t0={C.sukha7} t1={C.bharat} x={S(134, -33)[0]} y={S(134, -33)[1]} size={60} color={GOLD} />

      {/* India: the monsoon thins out */}
      <Label text="भारत" t={t} t0={C.bharat + 0.1} t1={C.p13 - 0.2} x={S(78, 23)[0]} y={S(78, 23)[1]} size={70} color="#FFE7A3" />
      {[[74, 20, 0], [84, 24, 0.12], [78, 15, 0.24], [88, 22, 0.36], [72, 27, 0.48]].map(([lon, lat, d], i) => {
        const fade = ramp(t, C.kamzor8 + d * 0.8, C.kamzor8 + d * 0.8 + 0.6, inOut);
        return (
          <div key={i} style={{ opacity: 1 - fade * 0.85 }}>
            <Rain t={t + i} x={S(lon, lat)[0]} y={S(lon, lat)[1] - 40} w={200} h={180} a={window4(t, C.monsoon - 0.1 + d, C.monsoon + 0.3 + d, C.kamzor8 + d * 0.8, C.kamzor8 + d * 0.8 + 0.4)} />
            <Prop name="cloud_monsoon_dark.png" t={t} t0={C.monsoon - 0.3 + d} t1={C.p13 - 0.25} x={S(lon, lat)[0] - fade * 60} y={S(lon, lat)[1] - 60} w={300 * K(lon, lat)} bob={4} shadow={false} sweep={false} />
          </div>
        );
      })}
      <FieldInsert t={t} />
      <FilmInsert t={t} />

      {/* 1876 India: famine regions */}
      {FAMINE.map(([name, lon, lat], i) => {
        const t0 = C.akaal + i * 0.18;
        const p = ramp(t, t0, t0 + 0.5, easeOut);
        const a = window4(t, t0, t0 + 0.1, C.ab - 0.2, C.ab + 0.1);
        if (a <= 0) return null;
        const [x, y] = S(lon, lat);
        return (
          <React.Fragment key={name}>
            <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a, filter: glow('rgba(255,40,40,0.9)', 5, 2) }}>
              <circle cx={x} cy={y} r={20 + 36 * p} fill="none" stroke="#FF3B30" strokeWidth={9 * (1 - p) + 4} />
              <circle cx={x} cy={y} r={9} fill="#FF3B30" />
            </svg>
            <Prop name="icon_dry_crop.png" t={t} t0={t0 + 0.15} t1={C.ab - 0.2} x={x + 50} y={y - 10} w={110} bob={2} shadow={false} />
          </React.Fragment>
        );
      })}
      <Counter t={t} t0={C.lakh50 - 0.1} t1={C.ab - 0.1} from={0} to={50} fmt={(v) => `${Math.round(v)} लाख+`} font={FONT} x={540} y={560} size={150} color="#fff" glowC="#FF2B3D" dur={1.0} />

      {/* the NOAA time-lapse: date and live Niño-3.4 reading */}
      {lapseA > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: lapseA }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)' }}>{dayLabel()}</div>
          <div style={{ fontFamily: LATIN, fontWeight: 900, fontSize: 120, color: '#fff', marginTop: 6, filter: `drop-shadow(0 0 12px ${WARM}) drop-shadow(0 0 30px ${WARM}) drop-shadow(0 4px 8px rgba(0,0,0,0.6))` }}>
            +{n34(lapse).toFixed(1)}°C
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>Pacific का तापमान, सामान्य से ऊपर · NOAA</div>
        </div>
      )}
      <Title text="सबसे ताक़तवर?" font={FONT} t={t} t0={C.itihas - 0.05} t1={C.yahan + 0.2} x={540} y={1200} size={110} glowColor="rgba(255,60,40,0.95)" tilt={-4} stagger={0.06} />
      <Thermo t={t} t0={C.d3 - 0.3} t1={C.dharti} x={S(-118, -1)[0]} y={S(-118, -1)[1]} h={260 * K(-118, -1)} to={GEO.sst.n34[last]} dur={1.3} />

      {/* heat into the atmosphere, 2027 */}
      <HeatArrows t={t} c={c} />
      <Title text="2027" t={t} t0={C.y2027 - 0.05} t1={DURATION_S + 1} x={540} y={760} size={240} glowColor="rgba(255,120,30,0.95)" stagger={0.07} tilt={0} />
      <SpaceInsert t={t} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- whole-frame look
/** Map hidden while an insert fully covers the frame. */
export const mapHidden = (t: number) =>
  (t > C.bas + 0.2 && t < C.peru7 - 0.12) || (t > C.y1876 + 0.3 && t < C.akele - 0.2) || (t > C.p13 + 0.05 && t < C.y1876 - 0.1);

/** Colour grade on the map plane: sepia/red for 1876 India, a hot burnt-orange world for the finale. */
export const mapGrade = (t: number) => {
  const old = window4(t, C.akele - 0.3, C.akele + 0.1, C.ab - 0.2, C.ab + 0.2);
  const heat = ramp(t, C.dharti - 0.2, C.tapayegi + 0.4, inOut);
  const dim = window4(t, C.elnino - 0.1, C.elnino + 0.1, C.hawayen - 0.3, C.hawayen) * 0.22;
  return `sepia(${0.75 * old + 0.55 * heat}) saturate(${1 + 0.6 * heat - 0.3 * old}) hue-rotate(${-12 * heat}deg) brightness(${1 - dim - 0.12 * old + 0.08 * heat}) contrast(${1.04 + 0.08 * heat})`;
};

/** Screen-space shake for impacts. */
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.elnino, 14], [C.super, 10], [C.bigad - 0.05, 22], [C.y2027, 16], [C.band, 6]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Vignette, heat glow, embers, flare, flashes and film grain over everything. */
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const heat = ramp(t, C.dharti - 0.2, C.tapayegi + 0.4, inOut);
  const flash = Math.max(
    window4(t, C.elnino - 0.04, C.elnino, C.elnino + 0.03, C.elnino + 0.22),
    window4(t, C.y2027 - 0.04, C.y2027, C.y2027 + 0.03, C.y2027 + 0.25),
    window4(t, C.peru - 0.05, C.peru + 0.05, C.peru + 0.1, C.peru + 0.3) * 0.5,
  );
  const grainX = (Math.floor(t * 30) * 137) % 512;
  const grainY = (Math.floor(t * 30) * 241) % 512;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {heat > 0 && (
        <>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% -5%, rgba(255,210,120,0.95) 0%, rgba(255,120,40,0.45) 30%, rgba(255,80,20,0) 65%)', opacity: heat, mixBlendMode: 'screen' }} />
          <AbsoluteFill style={{ opacity: heat * 0.9, mixBlendMode: 'screen', transform: `translateY(${-(t - C.dharti) * 60}px)` }}>
            {HAVE.has('overlay_embers.png') && <img src={staticFile('elnino/img/overlay_embers.png')} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />}
          </AbsoluteFill>
          {HAVE.has('overlay_sun_flare.png') && (
            <img src={staticFile('elnino/img/overlay_sun_flare.png')} style={{ position: 'absolute', left: -200, top: -260, width: 1480, opacity: heat * 0.9, mixBlendMode: 'screen' }} />
          )}
        </>
      )}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('elnino/fx/noise_b.png')})`, backgroundPosition: `${grainX}px ${grainY}px`, backgroundSize: '256px 256px', opacity: 0.05, mixBlendMode: 'overlay' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.55, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.5;
  if (i < 0 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

export { COLD, GOLD, WARM };
