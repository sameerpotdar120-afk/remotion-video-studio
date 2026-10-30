import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { idle, type Pose } from './chars';

/* Timing helpers for episodes: everything is keyed in global frames so acting lands on the caption words. */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const sm = (t: number) => t * t * (3 - 2 * t);
/** 0 → 1 smoothly over [a, a + d]. */
export const ramp = (f: number, a: number, d: number) => sm(clamp01((f - a) / d));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Keyed value [[frame, value], ...] with smoothstep between keys. */
export const kv = (f: number, k: [number, number][]) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return lerp(k[i - 1][1], k[i][1], sm((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
};
/** Mouth openness while talking between frames a and b (0 outside). */
export const talk = (f: number, a: number, b: number) => (f >= a && f < b ? Math.abs(Math.sin((f - a) * 0.42)) : 0);
/** Walk from x0 to x1 over [a, a + d]; moving tells you when to use the walk cycle. */
export const walkTo = (f: number, a: number, d: number, x0: number, x1: number) => { const t = clamp01((f - a) / d); return { x: lerp(x0, x1, t), moving: t > 0 && t < 1 }; };

/* Acting presets (merge into a pose). */
export const shrug = (k: number): Partial<Pose> => ({ armL: { a: lerp(8, 42, k), e: lerp(0, -95, k) }, armR: { a: lerp(8, 42, k), e: lerp(0, -95, k) }, headTilt: -6 * k });
export const point = (k: number): Partial<Pose> => ({ armR: { a: lerp(8, 82, k), e: lerp(0, -8, k) } });
export const cheer = (k: number, f: number): Partial<Pose> => ({ armL: { a: lerp(10, 150, k), e: lerp(0, -25, k) + Math.sin(f * 0.3) * 6 * k }, armR: { a: lerp(10, 150, k), e: lerp(0, -25, k) - Math.sin(f * 0.3) * 6 * k }, sparkles: k, bob: -Math.abs(Math.sin(f * 0.15)) * 1.5 * k });
export const hipsAngry: Partial<Pose> = { armL: { a: 40, e: 95 }, armR: { a: 40, e: 95 } };
export const calm = (f: number, seed = 0, o: Partial<Pose> = {}): Pose => ({ ...idle(f, seed), ...o });

/** A shot on [a, b) with dissolve ramps: fi frames fading in at the start, fo frames fading out at the end. */
export const Seg: React.FC<{ a: number; b: number; fi?: number; fo?: number; children: React.ReactNode }> = ({ a, b, fi = 0, fo = 0, children }) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  const o = Math.min(fi ? clamp01((f - a) / fi) : 1, fo ? clamp01((b - f) / fo) : 1);
  return React.createElement(AbsoluteFill, { style: { opacity: o } }, children);
};
