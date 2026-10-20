import { Easing, interpolate } from 'remotion';

// Shared look for the Whisky War motion pieces. Canada orange on the atlas map (red on the flag), Greenland violet,
// labels in the reference's yellow boxes.
export const C = {
  canada: '#F28A2E',
  canadaRed: '#E1261C',
  denmark: '#C8102E',
  greenland: '#6A5FD0',
  yellow: '#F5F23A',
  ink: '#111111',
  white: '#FFFFFF',
  paper: '#F1E6CC',
  noteInk: '#9E1B1B',
  border: '#F08AB0',
} as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const pop = (f: number, a: number, b: number, k = 1.8) => ramp(f, a, b, Easing.out(Easing.back(k)));
export const inOut = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const wobble = (f: number, a: number, hz = 2.2, decay = 4) => {
  if (f < a) return 0;
  const t = (f - a) / 60;
  return Math.exp(-decay * t) * Math.cos(t * Math.PI * 2 * hz);
};
/** How many characters of `s` are shown, typing from frame a at `cps` characters per second. */
export const typed = (s: string, f: number, a: number, cps = 22) => Array.from(s).slice(0, Math.max(0, Math.floor(((f - a) / 60) * cps))).join('');
