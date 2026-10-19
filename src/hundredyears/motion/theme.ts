import { Easing, interpolate } from 'remotion';

// Shared look for the Hundred Years' War motion pieces. England red and France royal blue match the map fills.
export const C = {
  en: '#D0111B',
  fr: '#1F2BD0',
  gold: '#F2C24B',
  ink: '#1D1610',
  paper: '#F3E6C8',
  steel: '#C9D1DA',
  steelDark: '#7E8893',
  white: '#FFFFFF',
  green: '#4BE36A',
  cyan: '#9FF3FF',
} as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const pop = (f: number, a: number, b: number, k = 1.8) => ramp(f, a, b, Easing.out(Easing.back(k)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// a damped settle: 1 at frame a, wobbling to 0
export const wobble = (f: number, a: number, hz = 2.2, decay = 4) => {
  if (f < a) return 0;
  const t = (f - a) / 60;
  return Math.exp(-decay * t) * Math.cos(t * Math.PI * 2 * hz);
};
