import { Easing, interpolate } from 'remotion';

// Shared look for the Panama Canal motion pieces (the reference's palette): teal sea, gold "skip the line" ship,
// red warnings and stamps, cyan fresh water, dark rounded labels.
export const C = {
  gold: '#FFC83D',
  goldGlow: '#FFE27A',
  red: '#E5262B',
  redDeep: '#B3121A',
  cyan: '#6FE6FF',
  water: '#3FB6E8',
  waterDeep: '#1D7FC2',
  green: '#35C46A',
  sea: '#1E8FA0',
  sky: '#8FD3F5',
  earth: '#8A5A33',
  earthDark: '#6B4226',
  hill: '#3E8E3A',
  concrete: '#C9CDD2',
  ink: '#14161C',
  label: '#141A22',
  white: '#FFFFFF',
} as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const pop = (f: number, a: number, b: number, k = 1.8) => ramp(f, a, b, Easing.out(Easing.back(k)));
export const inOut = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Motion blur for a moving layer: blur in px from its speed (px/frame), like After Effects' motion blur. */
export const mblur = (v: number, k = 0.18, max = 10) => { const b = Math.min(max, Math.abs(v) * k); return b > 0.4 ? `blur(${b.toFixed(1)}px)` : undefined; };
/** A slow idle float: a mix of sines so it never loops visibly. Returns [dx, dy, rot]. */
export const idle = (f: number, seed = 0, amp = 1): [number, number, number] => [
  amp * (6 * Math.sin(f / 37 + seed) + 3 * Math.sin(f / 17 + seed * 2)),
  amp * (5 * Math.sin(f / 29 + seed * 1.3) + 2 * Math.sin(f / 13 + seed)),
  amp * (1.2 * Math.sin(f / 41 + seed) + 0.5 * Math.sin(f / 19 + seed * 3)),
];
export const wobble = (f: number, a: number, hz = 2.2, decay = 4) => {
  if (f < a) return 0;
  const t = (f - a) / 60;
  return Math.exp(-decay * t) * Math.cos(t * Math.PI * 2 * hz);
};
/** Letter-by-letter type-on (the reference: ~3 frames per letter, each popping from 1.4× to 1). */
// split by grapheme cluster so Devanagari matras and conjuncts stay on their letter
export const graphemes = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment: (x: string) => Iterable<{ segment: string }> } }).Segmenter;
  return Seg ? Array.from(new Seg('hi', { granularity: 'grapheme' }).segment(s), (x) => x.segment) : Array.from(s);
};
export const TypeOn: React.FC<{ text: string; f: number; at?: number; step?: number }> = ({ text, f, at = 0, step = 3 }) => {
  const ch = graphemes(text);
  return (
    <>
      {ch.map((c, i) => {
        const s = pop(f, at + i * step, at + i * step + 7, 2);
        return s > 0 ? <span key={i} style={{ display: 'inline-block', transform: `scale(${1.4 - 0.4 * s})`, opacity: Math.min(1, s * 2), whiteSpace: 'pre' }}>{c}</span> : null;
      })}
    </>
  );
};
