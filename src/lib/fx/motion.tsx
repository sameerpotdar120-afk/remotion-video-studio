import React from 'react';
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { C, H, T, W } from '../constants';
import { clamp, ease, loop, popScale, ramp, settle, wobble } from '../easing';

type Pos = { x: number; y: number; w: number; h?: number; rotate?: number };
const abs = (p: Pos): React.CSSProperties => ({
  position: 'absolute',
  left: p.x - p.w / 2,
  top: p.y - (p.h ?? p.w) / 2,
  width: p.w,
  height: p.h,
});

/**
 * PopIn — every prop/icon/sticker in the reference enters like this:
 * 1 frame squashed sliver → overshoot to ~110% → settle 100%, with a damped ±8° wobble.
 */
export const PopIn: React.FC<
  Pos & { start: number; src?: string; children?: React.ReactNode; exit?: number; wobbleDeg?: number }
> = ({ start, src, children, exit, wobbleDeg = 8, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const squash = frame - start < 2 ? 0.15 : 1; // the 1-frame "thin sliver" (ref f580)
  const rot = (p.rotate ?? 0) + wobbleDeg * Math.exp(-(frame - start) / 10) * Math.sin((frame - start) / 2.2);
  const out = exit ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  return (
    <div style={{ ...abs(p), transform: `rotate(${rot}deg) scale(${s * out}, ${s * squash * out})` }}>
      {src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : children}
    </div>
  );
};

/**
 * StampSlam — wind-up (shrink + rise toward camera) → slam (150% → 100% in 6 f) → micro-shake.
 * Pass `withHandle` to show the wooden stamp block coming down first (ref f580–603 @30).
 */
export const StampSlam: React.FC<
  Pos & { start: number; src: string; handleSrc?: string; onScreenShake?: boolean; exit?: number }
> = ({ start, src, handleSrc, exit, ...p }) => {
  const frame = useCurrentFrame();
  const land = start + (handleSrc ? T.windUp + 6 : 0);
  const out = exit ? 1 - ramp(frame, exit, 6, ease.in) : 1;
  const nodes: React.ReactNode[] = [];
  if (handleSrc && frame >= start && frame < land + 6) {
    const up = ramp(frame, start, T.windUp, ease.out); // hover + rise toward camera
    const down = ramp(frame, start + T.windUp, 6, ease.in);
    const sc = 1 + up * 0.25 - down * 0.25;
    const y = p.y - 260 + down * 260;
    nodes.push(
      <Img
        key="h"
        src={handleSrc}
        style={{ ...abs({ ...p, y, w: p.w * 0.9 }), transform: `scale(${sc})`, opacity: frame > land + 2 ? 0 : 1 }}
      />,
    );
  }
  if (frame >= land && out > 0) {
    const t = frame - land;
    const s = interpolate(t, [0, T.stampSlam], [1.5, 1], { ...clamp, easing: ease.out });
    const shake = t < T.stampShake ? (random(`sh${t}`) - 0.5) * 14 : 0;
    nodes.push(
      <Img
        key="s"
        src={src}
        style={{
          ...abs(p),
          transform: `translate(${shake}px, ${-shake / 2}px) rotate(${p.rotate ?? -8}deg) scale(${s * out})`,
          opacity: interpolate(t, [0, 2], [0.6, 1], clamp) * out,
          objectFit: 'contain', // the box is wide (e.g. 900×360); never squash the stamp art
        }}
      />,
    );
  }
  return <>{nodes}</>;
};

/** Screen shake for the whole frame on a slam / gunshot. Wrap the scene with it. */
export const Shake: React.FC<{ hits: number[]; amp?: number; dur?: number; children: React.ReactNode }> = ({
  hits,
  amp = 18,
  dur = 10,
  children,
}) => {
  const frame = useCurrentFrame();
  let dx = 0;
  let dy = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t >= 0 && t < dur) {
      const k = amp * (1 - t / dur);
      dx += (random(`x${h}-${t}`) - 0.5) * 2 * k;
      dy += (random(`y${h}-${t}`) - 0.5) * 2 * k;
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</AbsoluteFill>;
};

/**
 * ZoomPunch — instant 2.5–4× push to read a document (ref f1150–1153, f1500–1506 @30).
 * Wrap the content; focus is the point (screen px) that ends up centred.
 */
export const ZoomPunch: React.FC<{
  start: number;
  to?: number;
  focus: [number, number];
  dur?: number;
  children: React.ReactNode;
}> = ({ start, to = 3, focus, dur = T.zoomPunch, children }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, dur, ease.snap);
  const s = 1 + (to - 1) * t;
  const fx = (W / 2 - focus[0]) * t;
  const fy = (H / 2 - focus[1]) * t;
  // motion blur proxy during the punch (cheap at 4K): blur peaks mid-move
  const blur = t > 0 && t < 1 ? Math.sin(t * Math.PI) * 10 : 0;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        transform: `translate(${fx}px, ${fy}px) scale(${s})`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Slide a character/prop in from an edge with motion-blur smear (ref f3158–3160: 3 f @30). */
export const SlideIn: React.FC<
  Pos & { start: number; from: 'left' | 'right' | 'top' | 'bottom'; dur?: number; exit?: number; children: React.ReactNode }
> = ({ start, from, dur = T.slideFast, exit, children, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, dur, ease.out);
  const o = exit ? ramp(frame, exit, dur, ease.in) : 0;
  const dist = from === 'left' || from === 'right' ? W * 0.7 : H * 0.8;
  const dir = from === 'left' || from === 'top' ? -1 : 1;
  const off = dir * dist * (1 - t) + -dir * dist * o * -1;
  const horiz = from === 'left' || from === 'right';
  const v = Math.abs((1 - t) * (t > 0 ? 1 : 0)) + o;
  return (
    <div
      style={{
        ...abs(p),
        transform: horiz ? `translateX(${off}px)` : `translateY(${off}px)`,
        filter: v > 0.02 && v < 0.98 ? `blur(${v * 14}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Idle bob for anything on screen (signs, crowd heads, flags). */
export const Bob: React.FC<{ seed: string; amp?: number; speed?: number; children: React.ReactNode }> = ({
  seed,
  amp = 6,
  speed = 0.05,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ transform: `translate(${wobble(seed + 'x', frame, amp * 0.4, speed)}px, ${wobble(seed, frame, amp, speed)}px)` }}>
      {children}
    </div>
  );
};

/** White block arrow that pops then pulses in/out (ref f882–915 @30: ~6 px every ~10 f). */
export const ArrowBob: React.FC<Pos & { start: number; src: string; exit?: number }> = ({ start, src, exit, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const pulse = Math.sin(loop(frame - start, 40) * Math.PI * 2) * 18;
  const r = ((p.rotate ?? 0) * Math.PI) / 180;
  const out = exit ? 1 - ramp(frame, exit, 6, ease.in) : 1;
  if (out <= 0) return null;
  return (
    <Img
      src={src}
      style={{
        ...abs(p),
        transform: `translate(${Math.cos(r) * pulse}px, ${Math.sin(r) * pulse}px) rotate(${p.rotate ?? 0}deg) scale(${s * (exit ? 1 + (1 - out) * 0.6 : 1)})`,
        opacity: out,
      }}
    />
  );
};

/** Drop from above with a squash on landing (crown, cap, headbands, the Declaration). */
export const DropIn: React.FC<Pos & { start: number; src: string; fall?: number; spin?: number }> = ({
  start,
  src,
  fall = 12,
  spin = 0,
  ...p
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, fall, ease.in);
  const y = p.y - (1 - t) * (p.y + (p.h ?? p.w));
  const land = frame - (start + fall);
  const squash = land >= 0 ? 1 - 0.18 * Math.exp(-land / 3) * Math.cos(land / 1.5) : 1;
  return (
    <Img
      src={src}
      style={{
        ...abs({ ...p, y }),
        transformOrigin: '50% 100%',
        transform: `rotate(${(1 - t) * spin + (p.rotate ?? 0)}deg) scale(${2 - squash}, ${squash})`,
      }}
    />
  );
};

/** Thrown/flung object on a gravity arc with spin (torn paper halves, tea chests, cards). */
export const Fling: React.FC<
  Pos & { start: number; src: string; vx: number; vy: number; g?: number; spin?: number; life?: number }
> = ({ start, src, vx, vy, g = 2.2, spin = 18, life = 40, ...p }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > life) return null;
  return (
    <Img
      src={src}
      style={{
        ...abs({ ...p, x: p.x + vx * t, y: p.y + vy * t + 0.5 * g * t * t }),
        transform: `rotate(${(p.rotate ?? 0) + spin * t}deg)`,
        opacity: interpolate(t, [life - 8, life], [1, 0], clamp),
      }}
    />
  );
};

/** Lands with a settle spring (used for characters arriving at a mark). */
export const SettleIn: React.FC<Pos & { start: number; children: React.ReactNode }> = ({ start, children, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = settle(frame, start);
  return <div style={{ ...abs(p), transform: `translateY(${(1 - s) * 80}px)`, opacity: Math.min(1, s * 2) }}>{children}</div>;
};

/** Red X / green ✓ neon icon with a flicker-on (ref f1962–1979 @30: 3 f on / 3 f off ×2). */
export const NeonIcon: React.FC<Pos & { start: number; src: string; color: 'red' | 'green'; exit?: number }> = ({
  start,
  src,
  color,
  exit,
  ...p
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const flick = t < 8 ? 0.35 : t < 14 ? 1 : t < 20 ? 0.35 : t < 26 ? 1 : 1; // 6 f on/off @60
  const glow = color === 'red' ? C.neonRed : C.neonGreen;
  const s = popScale(frame, start);
  const out = exit ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  return (
    <Img
      src={src}
      style={{
        ...abs(p),
        transform: `scale(${s * out})`,
        filter: `drop-shadow(0 0 ${24 * flick}px ${glow}) drop-shadow(0 0 ${60 * flick}px ${glow})`,
        opacity: (0.55 + 0.45 * flick) * out,
      }}
    />
  );
};
