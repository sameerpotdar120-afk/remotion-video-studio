import { Easing, interpolate, spring } from 'remotion';
import { noise2D } from '@remotion/noise';
import { FPS } from './constants';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 over [start, start+duration] with an easing. */
export const ramp = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = Easing.bezier(0.25, 0.1, 0.25, 1),
) => interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], { ...clamp, easing });

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // arrivals (fast start, soft land)
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits (accelerate away)
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // travel / camera moves
  snap: Easing.bezier(0.5, 0, 0.1, 1), // whip / punch
  linear: (t: number) => t,
};

/** Pop-in scale: 0 → 1.1 → 1 (overshoot), measured from the reference. */
export const popScale = (frame: number, start: number, fps = FPS) =>
  spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });

/** Soft settle used for characters landing / props dropping. */
export const settle = (frame: number, start: number, fps = FPS) =>
  spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });

/** Smooth organic wobble in px (or degrees). Same seed → same motion every render. */
export const wobble = (seed: string, frame: number, amp: number, speed = 0.02) =>
  noise2D(seed, frame * speed, 0) * amp;

/** Repeating 0..1 sawtooth with period p frames. */
export const loop = (frame: number, p: number) => ((frame % p) + p) % p / p;
