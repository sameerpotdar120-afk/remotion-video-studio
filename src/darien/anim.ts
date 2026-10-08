import { Easing, interpolate, spring } from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type Ease = (x: number) => number;
export const inOut: Ease = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut: Ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn: Ease = Easing.bezier(0.7, 0, 0.84, 0);
export const linear: Ease = (x) => x;

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 → 1 between seconds a and b. */
export const ramp = (t: number, a: number, b: number, e: Ease = inOut) =>
  interpolate(t, [a, b], [0, 1], { ...CLAMP, easing: e });

/** Fade in over [a, b], hold, fade out over [c, d]. */
export const window4 = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(t, a, b, linear), 1 - ramp(t, c, d, linear));

/** Springy 0 → 1 (with overshoot) starting at second t0. */
export const pop = (t: number, t0: number, damping = 11, stiffness = 170, mass = 0.9) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping, stiffness, mass } });

/** Short decaying wobble, used for impacts. */
export const kick = (t: number, t0: number, amp: number, freq = 22, decay = 9) => {
  if (t < t0) return 0;
  const d = t - t0;
  return amp * Math.exp(-decay * d) * Math.sin(d * freq);
};

/** Split a string into grapheme clusters so Devanagari matras never break apart. */
export const graphemes = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (!Seg) return Array.from(s);
  return Array.from(new Seg('hi', { granularity: 'grapheme' }).segment(s), (x) => x.segment);
};
