import { Easing, interpolate } from 'remotion';

// Shared look for the closest-to-space motion pieces. Colour code (fixed through the video, as in the reference):
// green = seems right, red = wrong, gold = the real answer; Nepal blue, China red, Ecuador amber.
export const C = {
  green: '#47E36B',
  red: '#E8262B',
  gold: '#FFC83D',
  goldDeep: '#F29A12',
  polar: '#3D8BFF',
  equator: '#FF3B3B',
  nepal: '#2F6BFF',
  china: '#E1261C',
  ecuador: '#F59E0B',
  ink: '#14161C',
  white: '#FFFFFF',
  ice: '#EAF4FF',
  rock: '#7A6A5A',
} as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const pop = (f: number, a: number, b: number, k = 1.8) => ramp(f, a, b, Easing.out(Easing.back(k)));
export const inOut = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// a damped settle: 1 at frame a, wobbling to 0
export const wobble = (f: number, a: number, hz = 2.2, decay = 4) => {
  if (f < a) return 0;
  const t = (f - a) / 60;
  return Math.exp(-decay * t) * Math.cos(t * Math.PI * 2 * hz);
};
