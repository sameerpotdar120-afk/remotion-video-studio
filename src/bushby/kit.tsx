import React from 'react';
import { staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, kick, lerp, linear, pop, ramp, inOut, window4 } from '../darien/anim';
import sizes from '../../public/bushby/img_sizes.json';
import { HEAD, NUM } from './fonts';

export const COL = { gold: '#FFD84A', saffron: '#FF9F1C', red: '#FF4D4D', green: '#21E08A', ice: '#BFE8FF', sea: '#38B6FF', white: '#FFF6E6' };
export const SZ = sizes as unknown as Record<string, [number, number]>;
export const img = (n: string) => staticFile(`bushby/img/${n}.png`);
export const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
export const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

// ---------------------------------------------------------------- building blocks
/** A miniature at a screen point (bottom-centre anchor): springs in, breathes, can glide along a path, pops out. */
export const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; arc?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean; fadeIn?: number;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true, fadeIn }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = fadeIn ? 1 : pop(t, t0, 10, 200);
  const fa = fadeIn ? ramp(t, t0, t0 + fadeIn, linear) : 1;
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = fadeIn ? 0 : kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q) - Math.sin(q * Math.PI) * (path.arc ?? 0);
  }
  const [iw, ih] = SZ[pose] ?? [1024, 1024];
  const w = (h * iw) / ih;
  const sc = Math.max(0, s) * (fadeIn ? 1 - out * 0.1 : 1 - out);
  if (sc <= 0.01) return null;
  const breathe = Math.sin((t - t0) * 2.4) * bob;
  const rock = sway ? Math.sin((t - t0) * 2.1) * sway : 0;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0, opacity: fa * (fadeIn ? 1 - out : 1) }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${Math.min(1, sc)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-(drop && !fadeIn ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
        filter: `${glow ? `drop-shadow(0 0 18px ${glow}) ` : ''}drop-shadow(0 10px 12px rgba(0,0,0,0.55))` }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

/** A place tag: bold pill on a stem, pinned to a screen point. */
export const Tag: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; sub?: string; rot?: number; latin?: boolean; up?: number; ink?: string }> = ({
  t, t0, t1, text, x, y, color, size = 60, sub, rot = -3, latin, up = 80, ink = '#140c03',
}) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 9, 240) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  if (s <= 0.01) return null;
  const stem = ramp(t, t0, t0 + 0.2, easeOut) * up;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <svg width={10} height={up + 10} style={{ position: 'absolute', left: -5, top: -stem, overflow: 'visible' }}>
        <line x1={5} y1={0} x2={5} y2={stem} stroke="#fff" strokeWidth={3} />
        <circle cx={5} cy={stem} r={8} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: -stem, transform: `translate(-50%,-100%) rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 100%', textAlign: 'center' }}>
        <div style={{ whiteSpace: 'nowrap', background: `linear-gradient(180deg, ${color}, ${color}dd)`, color: ink, padding: latin ? '8px 26px 2px' : '4px 24px 0', borderRadius: 14,
          fontFamily: latin ? NUM : HEAD, fontWeight: 800, fontSize: size, letterSpacing: latin ? 1.5 : 0, boxShadow: SHADOW, border: '4px solid #140c03', lineHeight: 1.15 }}>{text}</div>
        {sub && <div style={{ marginTop: 8, fontFamily: HEAD, fontWeight: 700, fontSize: size * 0.5, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.95)', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Kinetic text: letters rise in one by one (grapheme-safe), stroked, with a soft drop. */
export const Kin: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; font?: string; stroke?: number; box?: string; rot?: number; gap?: number }> = ({
  text, t, t0, t1, x, y, size = 72, color = '#fff', font = HEAD, stroke = 8, box, rot = 0, gap = 0.028,
}) => {
  const a = window4(t, t0, t0 + 0.08, t1 - 0.2, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.15, textShadow: SHADOW, ...STROKE(stroke),
        ...(box ? { background: box, padding: '6px 28px 2px', borderRadius: 18, boxShadow: SHADOW, transform: `scale(${clamp01(pop(t, t0, 11, 220))})` } : {}) }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * gap, 12, 230));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 34}px) scale(${lerp(0.6, 1, p)})` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
    </div>
  );
};

/** A slammed stamp with a gold frame. */
export const Stamp: React.FC<{ t: number; t0: number; t1: number; children: React.ReactNode; x: number; y: number; rot?: number; color?: string }> = ({ t, t0, t1, children, x, y, rot = -5, color = COL.gold }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.13, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.13, 0.07, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '10px 36px 6px', border: `10px solid ${color}`, borderRadius: 22, background: 'rgba(14,8,2,0.84)', boxShadow: `0 12px 34px rgba(0,0,0,0.55), 0 0 40px ${color}55`, whiteSpace: 'nowrap', textAlign: 'center' }}>{children}</div>
  );
};

/** A rolling counter (Anton numerals). */
export const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number; sub?: string }> = ({
  t, t0, t1, to, x, y, size = 150, color = COL.gold, pre = '', post = '', dur = 0.7, sub,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(to * ramp(t, t0, t0 + dur, easeOut));
  const s = clamp01(pop(t, t0, 10, 240));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s * (1 + kick(t, t0 + dur, 0.08, 26, 9))})`, opacity: a, textAlign: 'center' }}>
      <div style={{ fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(7) }}>{pre}{v.toLocaleString('en-IN')}{post}</div>
      {sub && <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.36, color: '#fff', marginTop: 4, textShadow: SHADOW, ...STROKE(5) }}>{sub}</div>}
    </div>
  );
};

/** A big red X drawn over something (two strokes). */
export const Cross: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; r?: number }> = ({ t, t0, t1, x, y, r = 120 }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const p1 = ramp(t, t0, t0 + 0.14, easeOut), p2 = ramp(t, t0 + 0.1, t0 + 0.24, easeOut);
  return (
    <svg width={r * 2.4} height={r * 2.4} style={{ position: 'absolute', left: x - r * 1.2, top: y - r * 1.2, overflow: 'visible', opacity: a }}>
      {[[0.2, 0.2, 2.2, 2.2, p1], [2.2, 0.2, 0.2, 2.2, p2]].map(([x0, y0, x1, y1, p], i) => (
        <line key={i} x1={x0 * r} y1={y0 * r} x2={lerp(x0, x1, p) * r} y2={lerp(y0, y1, p) * r} stroke={COL.red} strokeWidth={r * 0.22} strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,60,60,0.8)) drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />
      ))}
    </svg>
  );
};

/** Black-background overlays from the asset pack, added with screen blending. */
export const Overlay: React.FC<{ name: string; a: number; x: number; y: number; w: number; rot?: number; sc?: number }> = ({ name, a, x, y, w, rot = 0, sc = 1 }) => {
  if (a <= 0.001 || !SZ[name]) return null;
  const [iw, ih] = SZ[name];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `rotate(${rot}deg) scale(${sc})` }} />;
};

