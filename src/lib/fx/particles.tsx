import React from 'react';
import { AbsoluteFill, Audio, Img, random, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../constants';
import { ease, ramp } from '../easing';

/**
 * Musket smoke: grey puffs spawn at the muzzle, grow, drift and fade over ~40 f (ref f2421–2443 @30).
 * Also used for the Lexington single shot and battle-map puffs (smaller `size`).
 */
export const MuzzleSmoke: React.FC<{ x: number; y: number; start: number; dir?: 1 | -1; size?: number; puffs?: number }> = ({
  x,
  y,
  start,
  dir = -1,
  size = 160,
  puffs = 7,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 90) return null;
  return (
    <>
      {t < 3 && (
        <div
          style={{
            position: 'absolute',
            left: x - size * 0.35,
            top: y - size * 0.35,
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff7c2 0%, #ffb02e 45%, rgba(255,120,0,0) 70%)',
          }}
        />
      )}
      {Array.from({ length: puffs }).map((_, i) => {
        const d = Math.max(0, t - i * 2);
        const g = ramp(d, 0, 50, ease.out);
        const px = x + dir * (i * size * 0.22 + g * size * 0.9) + (random(`sx${start}${i}`) - 0.5) * size * 0.4;
        const py = y - g * size * 0.35 + (random(`sy${start}${i}`) - 0.5) * size * 0.3;
        const r = size * (0.35 + g * 0.9) * (0.7 + random(`sr${start}${i}`) * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - r,
              top: py - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(225,225,225,0.85) 0%, rgba(200,200,200,0.5) 45%, rgba(200,200,200,0) 70%)',
              filter: 'blur(6px)',
              opacity: 1 - ramp(d, 30, 60, ease.inOut),
            }}
          />
        );
      })}
    </>
  );
};

/** White powder burst (snowball hit, ref f2307–2319 @30). */
export const ImpactPuff: React.FC<{ x: number; y: number; start: number; color?: string; size?: number }> = ({
  x,
  y,
  start,
  color = '#ffffff',
  size = 140,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = random(`ia${start}${i}`) * Math.PI * 2;
        const v = 6 + random(`iv${start}${i}`) * 10;
        const r = 10 + random(`ir${start}${i}`) * 22;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(a) * v * t - r,
              top: y + Math.sin(a) * v * t + 0.25 * t * t - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: color,
              opacity: 1 - t / 30,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: x - size,
          top: y - size,
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
          opacity: 1 - t / 12,
        }}
      />
    </>
  );
};

/**
 * Paper tear: one image split into two halves along a jagged line, halves pull apart then fling
 * (ref f1437–1462 @30). The jag is generated deterministically.
 */
export const PaperTear: React.FC<{ x: number; y: number; w: number; h: number; src: string; tearAt: number; flingAt: number }> = ({
  x,
  y,
  w,
  h,
  src,
  tearAt,
  flingAt,
}) => {
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 9 }).map((_, i) => [50 + (random(`tear${i}`) - 0.5) * 12, (i / 8) * 100]);
  const left = `polygon(0% 0%, ${pts.map(([px, py]) => `${px}% ${py}%`).join(', ')}, 0% 100%)`;
  const right = `polygon(100% 0%, ${pts.map(([px, py]) => `${px}% ${py}%`).join(', ')}, 100% 100%)`;
  const apart = ramp(frame, tearAt, 8, ease.out) * w * 0.18;
  const ft = Math.max(0, frame - flingAt);
  const half = (side: -1 | 1, clip: string) => (
    <Img
      src={src}
      style={{
        position: 'absolute',
        left: x - w / 2 + side * apart + side * ft * 14,
        top: y - h / 2 - ft * 10 + 0.5 * 1.6 * ft * ft,
        width: w,
        height: h,
        clipPath: clip,
        transform: `rotate(${side * (frame >= tearAt ? 6 : 0) + side * ft * 9}deg)`,
        opacity: ft > 40 ? 0 : 1,
      }}
    />
  );
  return (
    <>
      {half(-1, left)}
      {half(1, right)}
    </>
  );
};

/* ───────────── COLOUR GRADE / FINISH (put <Finish/> as the LAST layer of every scene) ───────────── */

/**
 * Studio finish: gentle S-curve via contrast/saturation, warm highlights, vignette and
 * animated film grain (feTurbulence seeded per frame, rendered at 1/2 res then upscaled).
 * For a real LUT, render ProRes and grade in DaVinci, or ffmpeg -vf lut3d=file.cube (see docs).
 */
export const Finish: React.FC<{ grain?: number; vignette?: number; warmth?: number }> = ({
  grain = 0.06,
  vignette = 0.32,
  warmth = 0.06,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `rgba(255, 170, 80, ${warmth})`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,${vignette}) 100%)` }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W / 2} height={H / 2} filter="url(#grain)" transform="scale(2)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Grade wrapper: apply to the scene content (NOT to <Finish/>). */
export const Grade: React.FC<{ children: React.ReactNode; contrast?: number; saturate?: number; brightness?: number }> = ({
  children,
  contrast = 1.06,
  saturate = 1.08,
  brightness = 1.0,
}) => <AbsoluteFill style={{ filter: `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})` }}>{children}</AbsoluteFill>;

/** One-shot SFX at a frame. Files live in public/assets/sfx (see the asset doc for sources). */
export const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at, file, volume = 0.9 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`assets/sfx/${file}`)} volume={volume} />
  </Sequence>
);
