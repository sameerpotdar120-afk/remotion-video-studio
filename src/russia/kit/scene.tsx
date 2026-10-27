import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { RC, has, hand, pop, ra } from './core';

/**
 * Cartoon-scene helpers for the Russia video: background plates (with a painted fallback while the generated
 * plate is pending), fire, smoke, snow, light rays, dialogue lines, small map cards.
 */

/** Background plate: generated matte painting with a slow parallax push; fallback = sky→ground gradient + label. */
export const BgPlate: React.FC<{
  src: string; // 'bg/bg_forest_river_862.png'
  from?: number;
  push?: number; // zoom per second
  pan?: number; // px per second (x)
  sky?: string; ground?: string; // fallback colours
  dim?: number; // 0..1 darken
  tint?: string; // multiply colour
  blur?: number;
  focus?: [number, number];
}> = ({ src, from = 0, push = 0.012, pan = -6, sky = '#9FC3E0', ground = '#7D8F4E', dim = 0, tint, blur = 0, focus = [0.5, 0.5] }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - from) / 60;
  const z = 1.04 + push * t;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#222' }}>
      <AbsoluteFill style={{ transform: `translateX(${pan * t}px) scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: blur ? `blur(${blur}px)` : undefined }}>
        {has(src) ? (
          <Img src={ra(src)} style={{ width: W, height: H, objectFit: 'cover' }} />
        ) : (
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky} 0%, ${sky} 52%, ${ground} 62%, ${ground} 100%)` }}>
            <div style={{ position: 'absolute', left: 40, bottom: 30, ...hand(46, 'rgba(255,255,255,0.55)'), textShadow: 'none' }}>{src.split('/').pop()} (pending)</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: 'multiply' }} />}
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />}
    </AbsoluteFill>
  );
};

/** Flickering cartoon fire (flat flames, the reference's growing fire/smoke). */
export const Fire: React.FC<{ x: number; y: number; size: number; start: number; grow?: number; exit?: number; seed?: string }> = ({ x, y, size, start, grow = 30, exit, seed = 'f' }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const g = ramp(frame, start, grow, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 14, ease.in) : 1);
  if (g <= 0) return null;
  const flames = [0, 1, 2, 3, 4].map((i) => {
    const ph = frame / (3 + i * 0.7) + random(`${seed}${i}`) * 6;
    const h = size * (0.6 + 0.4 * random(`${seed}h${i}`)) * (1 + 0.12 * Math.sin(ph));
    const dx = (i - 2) * size * 0.16 + Math.sin(ph * 0.7) * size * 0.03;
    return { h, dx, col: i % 2 ? '#FF8A1E' : '#FFC23A' };
  });
  return (
    <svg width={size * 1.4} height={size * 1.4} viewBox={`${-size * 0.7} ${-size * 1.3} ${size * 1.4} ${size * 1.4}`}
      style={{ position: 'absolute', left: x - size * 0.7, top: y - size * 1.3, overflow: 'visible', transform: `scale(${g})`, transformOrigin: '50% 93%' }}>
      <ellipse cx={0} cy={-size * 0.3} rx={size * 0.6} ry={size * 0.55} fill="rgba(255,140,40,0.22)" />
      {flames.map((f, i) => (
        <path key={i} d={`M ${f.dx - size * 0.16} 0 Q ${f.dx - size * 0.2} ${-f.h * 0.55} ${f.dx} ${-f.h} Q ${f.dx + size * 0.2} ${-f.h * 0.55} ${f.dx + size * 0.16} 0 Z`} fill={f.col} stroke="#B23A12" strokeWidth={size * 0.012} />
      ))}
      <path d={`M ${-size * 0.12} 0 Q 0 ${-size * 0.4} ${size * 0.12} 0 Z`} fill="#FFF2B0" />
    </svg>
  );
};

/** Rising smoke column (puffs grow, drift and fade). */
export const Smoke: React.FC<{ x: number; y: number; size: number; start: number; color?: string; exit?: number; wind?: number }> = ({ x, y, size, start, color = '60,55,52', exit, wind = 0.6 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 20, ease.in) : 1;
  const puffs: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const life = 140;
    const u = (((frame - start) + i * 10) % life) / life;
    if (frame - start + i * 10 < life * 0.0 && u > (frame - start) / life) continue;
    const px = x + wind * u * size * 1.6 + Math.sin(u * 6 + i) * size * 0.08;
    const py = y - u * size * 2.4;
    const r = size * (0.18 + u * 0.5);
    puffs.push(<div key={i} style={{ position: 'absolute', left: px - r, top: py - r, width: r * 2, height: r * 2, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(${color},0.55) 0%, rgba(${color},0) 70%)`, opacity: (1 - u) * o * Math.min(1, (frame - start) / 20) }} />);
  }
  return <>{puffs}</>;
};

/** Falling snow over the whole frame (1812 retreat, winter scenes). */
export const Snow: React.FC<{ start?: number; density?: number; wind?: number; size?: number }> = ({ start = 0, density = 120, wind = 2, size = 10 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const o = Math.min(1, t / 30);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {Array.from({ length: density }, (_, i) => {
        const sp = 2 + random(`sn${i}`) * 3;
        const y = ((random(`sy${i}`) * H + t * sp) % (H + 40)) - 20;
        const x = ((random(`sx${i}`) * W + t * wind + Math.sin(t / 30 + i) * 20) % W + W) % W;
        const r = size * (0.5 + random(`sr${i}`));
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: '#fff', opacity: 0.85 }} />;
      })}
    </AbsoluteFill>
  );
};

/** Soft god-rays behind something holy / dazzling (Hagia Sophia). */
export const Rays: React.FC<{ x: number; y: number; r: number; start: number; color?: string; exit?: number }> = ({ x, y, r, start, color = '255,230,150', exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = ramp(frame, start, 20, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 12, ease.in) : 1);
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o, transform: `rotate(${frame * 0.25}deg)`,
      background: `repeating-conic-gradient(rgba(${color},0.55) 0deg 7deg, rgba(${color},0) 7deg 20deg)`,
      maskImage: 'radial-gradient(circle, #000 15%, transparent 68%)', WebkitMaskImage: 'radial-gradient(circle, #000 15%, transparent 68%)' }} />
  );
};

/** Dialogue (§2.4): plain handwritten text above the speaker, no bubble; types on. */
export { TypeOn as Say } from './core';

/** Small rounded card that shows anything (map inset, icon) with the card pop and soft shadow. */
export const Frame: React.FC<{ x: number; y: number; w: number; h: number; start: number; exit?: number; tilt?: number; children: React.ReactNode; bg?: string }> = ({
  x, y, w, h, start, exit, tilt = -3, children, bg = '#F4F1EA',
}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, start, 1.1) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
  if (s <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${tilt}deg) scale(${s})`, borderRadius: w * 0.04, overflow: 'hidden',
      background: bg, boxShadow: '0 30px 70px rgba(0,0,0,0.38)', border: `${Math.max(6, w * 0.012)}px solid #F4F1EA` }}>
      {children}
    </div>
  );
};

/** Scale a full-frame (W×H) element into a box (map insets inside Frame). */
export const Fit: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => {
  const k = Math.max(w / W, h / H);
  return <div style={{ position: 'absolute', left: (w - W * k) / 2, top: (h - H * k) / 2, width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>{children}</div>;
};

/** Emoji / glyph icon (OS emoji font) — quick universal symbols in captions and on maps. */
export const Glyph: React.FC<{ g: string; size: number }> = ({ g, size }) => <div style={{ fontSize: size, lineHeight: 1, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}>{g}</div>;

/** Red "no" circle with a slash over its children. */
export const NoSign: React.FC<{ size: number; children: React.ReactNode; slashAt?: number }> = ({ size, children, slashAt = -1 }) => {
  const frame = useCurrentFrame();
  const k = slashAt < 0 ? 1 : ramp(frame, slashAt, 8, ease.out);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', inset: size * 0.16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
        <circle cx={50} cy={50} r={44} fill="none" stroke={RC.stampRed} strokeWidth={9} />
        <line x1={20} y1={20} x2={80} y2={80} stroke={RC.stampRed} strokeWidth={9} />
      </svg>
    </div>
  );
};

/** Speed lines / anime shock lines behind a reaction. */
export const ShockLines: React.FC<{ x: number; y: number; r: number; start: number; dur?: number }> = ({ x, y, r, start, dur = 30 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur) return null;
  const o = 1 - t / dur;
  return (
    <svg width={r * 2} height={r * 2} style={{ position: 'absolute', left: x - r, top: y - r, overflow: 'visible', opacity: o }}>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r0 = r * (0.55 + 0.1 * Math.sin(i * 3)) + t * 3, r1 = r0 + r * 0.25;
        return <line key={i} x1={r + Math.cos(a) * r0} y1={r + Math.sin(a) * r0} x2={r + Math.cos(a) * r1} y2={r + Math.sin(a) * r1} stroke="#222" strokeWidth={r * 0.025} strokeLinecap="round" />;
      })}
    </svg>
  );
};
