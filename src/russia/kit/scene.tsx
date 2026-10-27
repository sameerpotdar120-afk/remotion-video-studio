import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { RC, has, hand, pop, ra } from './core';
import { useAudioOnly } from './audioMode';

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
  if (useAudioOnly()) return null;
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
  // painterly particle fire (reads on photo backgrounds): soft glowing tongues that rise, narrow and fade,
  // a warm ground glow, and sparks; everything blends with 'screen' so it lights up what is behind it
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const g = ramp(frame, start, grow, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 14, ease.in) : 1);
  if (g <= 0) return null;
  const t = frame - start;
  const tongues: React.ReactNode[] = [];
  const N = 26;
  for (let i = 0; i < N; i++) {
    const life = 22 + random(`${seed}l${i}`) * 14;
    const u = ((t + random(`${seed}o${i}`) * life) % life) / life; // 0 → 1 over its life
    const off = (random(`${seed}x${i}`) - 0.5) * size * 0.6;
    const bx = off * (1 - u * 0.5) + Math.sin(t / 6 + i) * size * 0.05 * u;
    const by = -u * size * 0.35;
    const w = size * (0.17 - 0.08 * u) * (1 - Math.abs(off) / size * 0.8);
    const h = size * (0.55 + random(`${seed}h${i}`) * 0.6) * (1 - u * 0.35) * (1 - Math.abs(off) / size * 1.2);
    const lean = Math.sin(t / 5 + i * 1.7) * w * 0.6;
    const d = `M ${bx - w} ${by} C ${bx - w} ${by - h * 0.45} ${bx - w * 0.2 + lean * 0.5} ${by - h * 0.7} ${bx + lean} ${by - h} C ${bx + w * 0.3 + lean * 0.5} ${by - h * 0.65} ${bx + w} ${by - h * 0.45} ${bx + w} ${by} Q ${bx} ${by + w * 0.5} ${bx - w} ${by} Z`;
    tongues.push(<path key={i} d={d} fill={`url(#${seed}g${u < 0.4 ? 'a' : 'b'})`} opacity={Math.sin(Math.min(1, u * 1.1) * Math.PI) * 0.95} />);
  }
  const smoke = Array.from({ length: 6 }, (_, i) => {
    const life = 90;
    const u = ((t + i * 15) % life) / life;
    const r = size * (0.25 + u * 0.55);
    const sx = (random(`${seed}k${i}`) - 0.5) * size * 0.4 + u * size * 0.35;
    const sy = -size * (0.9 + u * 1.6);
    return <div key={`k${i}`} style={{ position: 'absolute', left: sx - r, top: sy - r, width: r * 2, height: r * 2, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(36,28,24,0.62), rgba(36,28,24,0) 70%)', opacity: Math.sin(u * Math.PI) * Math.min(1, t / 30) }} />;
  });
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const life = 50;
    const u = ((t + i * 7) % life) / life;
    const sx = (random(`${seed}s${i}`) - 0.5) * size * 0.8 + Math.sin(t / 9 + i * 2) * size * 0.12 * u;
    const sy = -u * size * 1.7;
    const r = size * 0.018 * (1 - u * 0.5);
    return <div key={`s${i}`} style={{ position: 'absolute', left: sx - r, top: sy - r, width: r * 2, height: r * 2, borderRadius: '50%',
      background: '#FFD27A', boxShadow: `0 0 ${r * 4}px ${r * 1.5}px rgba(255,150,40,0.8)`, opacity: (1 - u) * 0.9 }} />;
  });
  const flicker = 0.85 + 0.15 * Math.sin(t / 3.1) * Math.sin(t / 5.3 + 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${g})`, transformOrigin: '0 0' }}>
      {smoke}
      <div style={{ position: 'absolute', left: -size * 1.1, top: -size * 1.15, width: size * 2.2, height: size * 1.5, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 70%, rgba(255,140,40,0.55), rgba(255,90,20,0.18) 45%, rgba(255,80,20,0) 70%)', opacity: flicker, mixBlendMode: 'screen' }} />
      <svg width={size * 2} height={size * 1.6} viewBox={`${-size} ${-size * 1.45} ${size * 2} ${size * 1.6}`}
        style={{ position: 'absolute', left: -size, top: -size * 1.45, overflow: 'visible', mixBlendMode: 'screen' }}>
        <defs>
          <radialGradient id={`${seed}ga`} cx="50%" cy="85%" r="75%">
            <stop offset="0" stopColor="#FFFBE0" /><stop offset="0.35" stopColor="#FFD35A" /><stop offset="0.7" stopColor="#FF7A1A" /><stop offset="1" stopColor="#C8300C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${seed}gb`} cx="50%" cy="85%" r="75%">
            <stop offset="0" stopColor="#FFC24A" /><stop offset="0.5" stopColor="#FF6A14" /><stop offset="1" stopColor="#A0200A" stopOpacity="0" />
          </radialGradient>
          <filter id={`${seed}fb`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={size * 0.008} /></filter>
        </defs>
        <g filter={`url(#${seed}fb)`}>
          <ellipse cx={0} cy={-size * 0.02} rx={size * 0.36} ry={size * 0.05} fill={`url(#${seed}ga)`} opacity={0.6 * flicker} />
          {tongues}
        </g>
      </svg>
      {sparks}
    </div>
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
      background: `radial-gradient(circle, rgba(${color},0.4) 0%, rgba(${color},0) 70%)`, opacity: (1 - u) * o * Math.min(1, (frame - start) / 20) }} />);
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

/**
 * Horse + rider: 2-frame gallop (generated frames A/B swapped every 5 f @60 ≈ 12 strides/s) with a body bob,
 * dust puffs behind; rider = a cast member without legs sitting on the saddle. Fallback horse drawn in code.
 */
import { Char } from './cast';
export const Rider: React.FC<{
  horse: 'horse_brown' | 'horse_black' | 'horse_steppe' | 'horse_white';
  who: string; x: number; y: number; height: number; // height of the horse body box (feet → saddle ≈ 0.58)
  start: number; exit?: number; flip?: boolean; gallop?: boolean; moods?: [number, import('../../lib/character/Face').Mood][];
  gestures?: [number, import('./Peg').Gesture][]; seed?: string; dust?: boolean; children?: React.ReactNode;
}> = ({ horse, who, x, y, height, start, exit, flip, gallop = true, moods, gestures, seed = 'r', dust = true, children }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  if (exit !== undefined && frame > exit) return null;
  const s = pop(frame, start, 1.05);
  const step = gallop ? Math.floor((frame + seed.length * 3) / 5) % 2 : 1;
  const bob = gallop ? Math.abs(Math.sin((frame + seed.length * 3) / 5 * Math.PI)) * height * 0.03 : 0;
  const wBox = height * 1.5;
  const src = `horses/${horse}_gallop_${step ? 'b' : 'a'}.png`;
  const col = { horse_brown: '#8A5A34', horse_black: '#1E1E22', horse_steppe: '#B8925A', horse_white: '#E8E6E0' }[horse];
  return (
    <div style={{ position: 'absolute', left: x - wBox / 2, top: y - height - bob, width: wBox, height, transform: `scaleX(${flip ? -1 : 1}) scale(${s})`, transformOrigin: '50% 100%' }}>
      {dust && gallop && [0, 1, 2].map((i) => {
        const u = ((frame + i * 9) % 27) / 27;
        return <div key={i} style={{ position: 'absolute', left: wBox * (0.12 - u * 0.25), top: height * (0.86 - u * 0.12), width: height * (0.12 + u * 0.2), height: height * (0.12 + u * 0.2),
          borderRadius: '50%', background: 'rgba(170,150,120,0.5)', opacity: 1 - u }} />;
      })}
      {/* rider sits on the saddle (saddle top ≈ 42 % from the top of the horse box) */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: wBox, height }}>
        <Char who={who} x={wBox * 0.47} y={height * 0.5} height={height * 0.6} legs={false} start={0} moods={moods} gestures={gestures} seed={seed} />
      </div>
      {has(src) ? (
        <Img src={ra(src)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <svg viewBox="0 0 150 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <g stroke="#1A1410" strokeWidth={1.6} strokeLinejoin="round">
            {(step ? [[52, 70, 46, 96], [62, 70, 66, 96], [98, 70, 92, 96], [108, 70, 112, 96]] : [[52, 70, 30, 92], [62, 70, 44, 96], [98, 70, 118, 94], [108, 70, 130, 88]]).map(([a, b, c, d], i) => (
              <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={col} strokeWidth={6} strokeLinecap="round" />
            ))}
            <ellipse cx={80} cy={58} rx={36} ry={17} fill={col} />
            <path d="M108 52 Q118 30 128 26 L140 34 Q136 40 128 40 L118 58 Z" fill={col} />
            <path d="M44 52 Q30 50 26 66 Q36 60 46 60 Z" fill="#3A2A20" />
            <rect x={68} y={40} width={26} height={10} rx={3} fill="#B8322A" />
          </g>
        </svg>
      )}
      {children}
    </div>
  );
};
