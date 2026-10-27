import React from 'react';
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame } from 'remotion';
import FILES from './assets.generated.json';
import { H, W } from '../../lib/constants';
import { clamp, ease, ramp } from '../../lib/easing';

/**
 * Russia video — shared look and motion primitives. Every number is from analysis/russia-mongol/README.md
 * (measured at the reference's 30 fps; doubled here for 60 fps).
 */

export const RC = {
  stage: '#C4C4C4', // grey explainer stage (§1)
  stageDark: '#2A2D33',
  scrollBg: '#3A2A20', // chapter card background (§2.5)
  parchment: '#E9D9B4',
  terracotta: '#D07A4A',
  white: '#FFFFFF',
  yellow: '#FFD84A', // punchline / emphasis
  danger: '#9E1B1B', // dark red / maroon
  green: '#3FA34D', // positive
  blue: '#3D7BD8', // names / places
  sub: '#4A4A4A', // small dark-grey sub-caption
  ink: '#1A1410',
  stampRed: '#C81E2B',
  stampGreen: '#2E8B3E',
  tag: 'rgba(40, 40, 44, 0.72)', // year tag box
  // map colours per era (§2.8)
  rusRed: '#C8352B',
  peterGreen: '#3E8E3A',
  empireGold: '#D9A520',
  sovietRed: '#C0392B',
  sweden: '#3B6FC9',
  poland: '#E6E2DA',
  ottoman: '#B8322A',
  kazan: '#4FA34A',
  oprich: '#141414',
  horde: '#E8892B',
  germany: '#7D8085',
  napoleon: '#3F4C66',
  rusMustard: '#D9B23A',
};

export const HAND = '"Kalam", cursive';

const lum = (hex: string) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/**
 * Text style for handwritten captions, readable on any plate (grey stage, map, photo background):
 * light text gets a dark sticker outline, coloured text a white one, both with a soft drop shadow.
 * Dark-grey sub-captions (only used on the light stage) keep a plain soft glow.
 */
export const hand = (size: number, color: string = RC.white, weight = 700): React.CSSProperties => {
  const L = lum(color);
  const base: React.CSSProperties = { fontFamily: HAND, fontWeight: weight, fontSize: size, color, lineHeight: 1.12, whiteSpace: 'nowrap' };
  if (L < 0.32 && color !== RC.danger) return { ...base, textShadow: '0 0.03em 0.12em rgba(255,255,255,0.35)' };
  const light = L > 0.72;
  return {
    ...base,
    WebkitTextStroke: `${light ? 0.09 : 0.12}em ${light ? 'rgba(26,20,16,0.88)' : '#FFFFFF'}`,
    paintOrder: 'stroke fill',
    textShadow: '0 0.05em 0.16em rgba(0,0,0,0.45)',
  };
};

/* ──────────────────────────────── assets ──────────────────────────────── */

const PRESENT = new Set<string>(FILES as string[]);
// backgrounds and cards are installed as .jpg; the code keeps asking for the .png name
const real = (path: string) => (PRESENT.has(path) ? path : path.replace(/\.png$/, '.jpg'));
/** Russia asset present in public/russia/assets? (src/russia/kit/assets.generated.json) */
export const has = (path: string) => PRESENT.has(real(path));
export const ra = (path: string) => staticFile(`russia/assets/${real(path)}`);
/** America-era shared asset (gloves, candle, …) */
export const aa = (path: string) => staticFile(`assets/${path}`);

/* ──────────────────────────────── motion ──────────────────────────────── */

/**
 * Elastic pop (§2.2): ease-out reaching 94 % in ≈10 f @60, 38 % of pops overshoot to ≈1.10×.
 * over = peak scale (1 = no overshoot).
 */
export const pop = (frame: number, start: number, over = 1.1) => {
  if (frame < start) return 0;
  const s = spring({ frame: frame - start, fps: 60, config: { damping: over > 1.12 ? 9 : 11, stiffness: 260, mass: 0.55 } });
  if (over <= 1.001) return Math.min(1, s);
  // spring overshoots ~1.12 with these constants; rescale the overshoot part to the requested peak
  return s > 1 ? 1 + (s - 1) * ((over - 1) / 0.12) : s;
};

/** Visible-window helper: 0 before start, pop in, then shrink out at `exit`. */
export const lifeScale = (frame: number, start: number, exit?: number, over = 1.1, outDur = 10) => {
  const s = pop(frame, start, over);
  if (exit === undefined || frame < exit) return s;
  return s * (1 - ramp(frame, exit, outDur, ease.in));
};

export const PopIn: React.FC<{
  x: number;
  y: number;
  start: number;
  exit?: number;
  over?: number;
  tilt?: number; // degrees, cards pop with ≈ −5°
  children: React.ReactNode;
  origin?: string;
}> = ({ x, y, start, exit, over = 1.1, tilt = 0, children, origin = '50% 50%' }) => {
  const frame = useCurrentFrame();
  const s = lifeScale(frame, start, exit, over);
  if (s <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${s})`, transformOrigin: origin }}>
      {children}
    </div>
  );
};

/* ──────────────────────────────── text ──────────────────────────────── */

const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('hi', { granularity: 'grapheme' }) : null;
const graphemes = (s: string) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));

/**
 * Handwritten type-on (§2.4): ≈0.8 graphemes per frame @30 → 0.45 per frame @60; each new grapheme drops
 * in from slightly below. Colour code: white main · yellow punchline · danger red · green positive · blue names.
 */
export const TypeOn: React.FC<{
  text: string;
  x: number;
  y: number;
  start: number;
  size?: number;
  color?: string;
  rate?: number; // graphemes per frame
  exit?: number;
  align?: 'left' | 'center' | 'right';
  weight?: number;
  rotate?: number;
}> = ({ text, x, y, start, size = 110, color = RC.white, rate = 0.45, exit, align = 'center', weight = 700, rotate = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (out <= 0) return null;
  const g = graphemes(text);
  const n = (frame - start) * rate;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%) rotate(${rotate}deg)`, opacity: out, ...hand(size, color, weight) }}>
      {g.map((c, i) => {
        const t = Math.max(0, Math.min(1, n - i));
        if (t <= 0) return <span key={i} style={{ opacity: 0 }}>{c}</span>;
        const k = ease.out(Math.min(1, t * 1.6));
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - k) * 0.18}em)`, opacity: Math.min(1, t * 3) }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Plain caption (no type-on) — pops in. */
export const Caption: React.FC<{ text: string; x: number; y: number; start: number; size?: number; color?: string; exit?: number }> = ({
  text, x, y, start, size = 100, color = RC.white, exit,
}) => (
  <PopIn x={x} y={y} start={start} exit={exit}>
    <div style={hand(size, color)}>{text}</div>
  </PopIn>
);

/* ──────────────────────────────── stamps, numbers, tags ──────────────────────────────── */

/**
 * Rubber stamp (§2.9): tilted red box, slams 150 % → 100 % in 6 f with a micro-shake; green for "TRUE STORY".
 */
export const Stamp: React.FC<{ text: string; x: number; y: number; start: number; color?: string; size?: number; rotate?: number; exit?: number; sub?: string }> = ({
  text, x, y, start, color = RC.stampRed, size = 120, rotate = -9, exit, sub,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const s = t < 1 ? 1.6 : interpolate(t, [1, 6], [1.5, 1], { ...clamp, easing: ease.out });
  const shake = t >= 6 && t < 16 ? Math.sin(t * 2.4) * (16 - t) * 0.6 : 0;
  return (
    <div style={{ position: 'absolute', left: x + shake, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${s * out})`, opacity: t < 1 ? 0.5 : 1 }}>
      <div style={{
        border: `${size * 0.085}px solid ${color}`, borderRadius: size * 0.14, padding: `${size * 0.06}px ${size * 0.28}px`,
        color, fontFamily: '"Anton", "Impact", sans-serif', fontSize: size, letterSpacing: size * 0.04, lineHeight: 1.08, whiteSpace: 'nowrap',
        maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.78) 100%)', mixBlendMode: 'multiply',
        textAlign: 'center',
      }}>
        {text}
        {sub && <div style={{ fontFamily: HAND, fontSize: size * 0.42, letterSpacing: 0, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Big outlined number counting up (§2.9) + small handwritten unit / sub-caption. */
export const BigNumber: React.FC<{
  x: number; y: number; to: number; start: number; dur?: number; size?: number; prefix?: string; suffix?: string; sub?: string; exit?: number;
  color?: string; format?: (v: number) => string; hollow?: boolean;
}> = ({ x, y, to, start, dur = 50, size = 260, prefix = '', suffix = '', sub, exit, color = RC.white, format, hollow = true }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (out <= 0) return null;
  const v = to * ramp(frame, start, dur, ease.out);
  const txt = format ? format(v) : Math.round(v).toLocaleString('en-IN');
  const done = frame >= start + dur;
  const punch = done ? 1 + 0.08 * Math.exp(-(frame - start - dur) / 6) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${pop(frame, start) * punch * out})`, textAlign: 'center' }}>
      <div style={{
        fontFamily: HAND, fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
        color: hollow ? 'transparent' : color, WebkitTextStroke: hollow ? `${size * 0.035}px ${color}` : undefined,
        textShadow: hollow ? '0 0.03em 0.1em rgba(0,0,0,0.35)' : '0 0.04em 0 rgba(0,0,0,0.5)',
      }}>
        {prefix}{txt}{suffix}
      </div>
      {sub && <div style={{ ...hand(size * 0.24, RC.white, 700), marginTop: size * 0.04 }}>{sub}</div>}
    </div>
  );
};

/**
 * Year tag (§2.1): small dark translucent rounded box top-left, white handwritten year, fades in ≈8 f a beat
 * after the shot starts.
 */
export const YearTag: React.FC<{ text: string; start: number; exit?: number; x?: number; y?: number; size?: number }> = ({
  text, start, exit, x = W * 0.035, y = H * 0.045, size = 92,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = ramp(frame, start, 8, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, background: RC.tag, borderRadius: size * 0.22,
      padding: `${size * 0.08}px ${size * 0.36}px ${size * 0.04}px`, ...hand(size), textShadow: 'none' }}>
      {text}
    </div>
  );
};
export const TAG_CENTER: [number, number] = [W * 0.035 + 150, H * 0.045 + 60];

/**
 * Iris spotlight (§2.1, measured at f4866–4930): frame dims ×0.54 over 20 f while a soft light circle closes
 * onto the year tag (r ≈ 0.28 H, inside ≈ 0.88), holds ≈1.1 s, reopens in 16 f.
 */
export const Iris: React.FC<{ at: number; hold?: number; cx?: number; cy?: number }> = ({ at, hold = 66, cx = TAG_CENTER[0], cy = TAG_CENTER[1] }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 20 + hold + 16) return null;
  const k = t < 20 ? ease.out(t / 20) : t < 20 + hold ? 1 : 1 - ease.inOut((t - 20 - hold) / 16);
  const r = interpolate(k, [0, 1], [H * 1.6, H * 0.28]);
  const dim = 0.46 * k;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none',
      background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,${0.12 * k}) ${r * 0.72}px, rgba(0,0,0,${dim}) ${r}px)` }} />
  );
};

/** White/cream flash frame for explosions and gunfire (§2.10), 1–4 frames @30. */
export const Flash: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 6, color = '#FFF8E8' }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t >= dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: t < dur / 2 ? 1 : 1 - (t - dur / 2) / (dur / 2) }} />;
};

/* ──────────────────────────────── stage + camera ──────────────────────────────── */

/** The flat light-grey explainer stage (§1.1) with a barely-there paper grain so it never looks digital. */
export const GreyStage: React.FC<{ dark?: boolean; children?: React.ReactNode }> = ({ dark, children }) => (
  <AbsoluteFill style={{ background: dark ? RC.stageDark : RC.stage }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, rgba(255,255,255,${dark ? 0.06 : 0.12}) 0%, rgba(0,0,0,${dark ? 0.35 : 0.08}) 100%)` }} />
    {children}
  </AbsoluteFill>
);

/**
 * Shot camera (§3): Russia never lets a frame sit still — slow push ≈1 %/s with a slight up-left pan,
 * plus optional keyed moves. Wrap a shot's content in it.
 */
export type CamKey = { at: number; zoom: number; x?: number; y?: number; dur?: number; easing?: (t: number) => number };
export const Camera: React.FC<{
  from: number; // shot's first frame (sequence-local)
  drift?: number; // zoom per second (0.0106 = reference median)
  keys?: CamKey[];
  focus?: [number, number]; // drift focus point in px
  shake?: { at: number; amp?: number; dur?: number }[];
  children: React.ReactNode;
}> = ({ from, drift = 0.0106, keys = [], focus = [W * 0.48, H * 0.46], shake = [], children }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - from) / 60;
  let z = 1, x = 0, y = 0;
  let prev = { zoom: 1, x: 0, y: 0 };
  for (const k of keys) {
    const dur = k.dur ?? 40;
    if (frame < k.at) break;
    const e = ramp(frame, k.at, dur, k.easing ?? ease.inOut);
    z = prev.zoom + (k.zoom - prev.zoom) * e;
    x = prev.x + ((k.x ?? 0) - prev.x) * e;
    y = prev.y + ((k.y ?? 0) - prev.y) * e;
    prev = { zoom: k.zoom, x: k.x ?? 0, y: k.y ?? 0 };
    if (frame < k.at + dur) break;
  }
  const d = 1 + drift * t;
  let sx = 0, sy = 0;
  for (const s of shake) {
    const u = frame - s.at;
    const dur = s.dur ?? 16;
    if (u >= 0 && u < dur) {
      const a = (s.amp ?? 18) * (1 - u / dur);
      sx += (random(`sx${s.at}${u}`) - 0.5) * 2 * a;
      sy += (random(`sy${s.at}${u}`) - 0.5) * 2 * a;
    }
  }
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transformOrigin: `${focus[0]}px ${focus[1]}px`, transform: `translate(${-x + sx - t * 2.2}px, ${-y + sy - t * 1.2}px) scale(${z * d})` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ──────────────────────────────── cards ──────────────────────────────── */

/**
 * Rounded-corner portrait/photo card with a soft shadow (§1.1), pops with a slight tilt and overshoot;
 * name written on the bottom edge. Missing image → a clean silhouette card (never a broken image).
 */
export const Card: React.FC<{
  src?: string; // russia asset path, e.g. 'cards/card_lenin.png'
  x: number; y: number; w: number; h?: number; start: number; exit?: number; tilt?: number;
  name?: string; nameColor?: string; ribbonAt?: number; grey?: number; // grey: frame from which the card desaturates
  children?: React.ReactNode;
}> = ({ src, x, y, w, h, start, exit, tilt = -4, name, nameColor = RC.blue, ribbonAt, grey, children }) => {
  const frame = useCurrentFrame();
  const s = lifeScale(frame, start, exit, 1.1);
  if (s <= 0.001) return null;
  const hh = h ?? w * 1.25;
  const g = grey !== undefined ? ramp(frame, grey, 24, ease.out) : 0;
  const ok = src && has(src);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: hh, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${s})` }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: w * 0.05, overflow: 'hidden', background: '#E8E4DC',
        boxShadow: '0 30px 70px rgba(0,0,0,0.38), 0 6px 14px rgba(0,0,0,0.25)', border: `${w * 0.02}px solid #F4F1EA`,
        filter: g ? `grayscale(${g}) brightness(${1 - 0.15 * g})` : undefined }}>
        {ok ? (
          <Img src={ra(src!)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg viewBox="0 0 100 125" style={{ width: '100%', height: '100%' }}>
            <rect width="100" height="125" fill="#B9B4AA" />
            <circle cx="50" cy="48" r="22" fill="#8E897F" />
            <path d="M12 125 Q14 82 50 78 Q86 82 88 125 Z" fill="#8E897F" />
          </svg>
        )}
        {children}
      </div>
      {ribbonAt !== undefined && frame >= ribbonAt && (
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', right: -w * 0.02, top: -w * 0.02, width: w * 0.42, overflow: 'visible',
          transform: `scale(${pop(frame, ribbonAt, 1.05)})`, transformOrigin: '100% 0%' }}>
          <path d="M30 0 L100 70 L100 100 L0 0 Z" fill="#111" />
          <path d="M45 0 L100 55" stroke="#333" strokeWidth="3" />
        </svg>
      )}
      {name && (
        <div style={{ position: 'absolute', left: '50%', bottom: -w * 0.02, transform: 'translate(-50%, 50%)' }}>
          <TypeOn text={name} x={0} y={0} start={start + 10} size={Math.max(56, w * 0.13)} color={nameColor} />
        </div>
      )}
    </div>
  );
};

/** Picture-in-picture image: a Russia asset (or a labelled silhouette while the asset is pending). */
export const RImg: React.FC<{ src: string; w: number; h?: number; style?: React.CSSProperties; label?: string }> = ({ src, w, h, style, label }) =>
  has(src) ? (
    <Img src={ra(src)} style={{ width: w, height: h, objectFit: 'contain', display: 'block', ...style }} />
  ) : (
    <div style={{ width: w, height: h ?? w * 0.75, borderRadius: w * 0.06, background: 'rgba(60,60,60,0.28)', border: `${Math.max(3, w * 0.008)}px dashed rgba(40,40,40,0.55)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...hand(Math.max(26, w * 0.07), '#333', 700), textShadow: 'none', whiteSpace: 'normal', textAlign: 'center', ...style }}>
      {label ?? src.split('/').pop()?.replace('.png', '').replace(/_/g, ' ')}
    </div>
  );

/** Deterministic tiny jitter for hand-drawn things. */
export const jit = (seed: string, amp: number) => (random(seed) - 0.5) * 2 * amp;
