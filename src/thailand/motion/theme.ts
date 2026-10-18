import { Easing, interpolate } from 'remotion';

// Shared look for the Thailand motion pieces: the same colours as the map layers, so a character and its country's fill
// always match on screen.
export const C = {
  brit: '#B51CC9',
  fr: '#F03A0B',
  siam: '#F2D80A',
  ink: '#1D1430',
  paper: '#FBF6EA',
  cyan: '#38E8FF',
  gold: '#F2B632',
  glove: '#FFFFFF',
} as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// 0 → 1 between two frames, with an optional easing (ease-out cubic by default)
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// a pop with overshoot: 0 → 1 between a and b, overshooting by about `k` (Easing.back)
export const pop = (f: number, a: number, b: number, k = 1.8) => ramp(f, a, b, Easing.out(Easing.back(k)));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// a damped spring settle: starts at 1 when f = a and wobbles to 0 (for swings after an impact)
export const wobble = (f: number, a: number, hz = 2.2, decay = 4) => {
  if (f < a) return 0;
  const t = (f - a) / 60;
  return Math.exp(-decay * t) * Math.cos(t * Math.PI * 2 * hz);
};

// hex colour mix, for recolour morphs
export const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('');
};
