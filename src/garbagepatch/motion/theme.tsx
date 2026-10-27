// Shared look for the Garbage Patch motion pieces: the reference's cyan (outlines, numbers, rings), California gold,
// the food chain's pink-red glow, current blue and plain white for captions and arrows. Timing helpers are the West
// Indies ones.
export { clamp, graphemes, idle, inOut, lerp, mblur, pop, ramp, wobble } from '../../westindies/motion/theme';

export const C = {
  cyan: '#3FD8FF',
  cyanDeep: '#0A7FB8',
  cyanGlow: '#9BEBFF',
  gold: '#FFC21A',
  goldGlow: '#FFE07A',
  pink: '#FF3D6E',
  pinkGlow: '#FF8FB0',
  current: '#2F9BE8',
  grid: '#2557D6',
  gridLine: '#4F7FF0',
  india: '#FF9933',
  indiaGreen: '#138808',
  ink: '#0B1620',
  white: '#FFFFFF',
} as const;
