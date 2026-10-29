import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c10_brush_wipe (line 6, the reference's 0:37.8 into the Capitol buildings): big painterly white brush strokes sweep
// diagonally from the top-right to the bottom-left over `dur` frames from `at`, each stroke a ragged, dry-edged band;
// the next shot (`next`) shows through the painted area until it covers the frame. A few loose white strokes trail
// over the new shot and fade. Opaque.
let uid = 0;
export const C10BrushWipe: React.FC<{ children: React.ReactNode; next: React.ReactNode; at?: number; dur?: number; strokes?: number }> = ({ children, next, at = 0, dur = 26, strokes = 7 }) => {
  const f = useCurrentFrame();
  const [id] = React.useState(() => `c10_${uid++}`);
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const S = Array.from({ length: strokes }, (_, i) => {
    const t = interpolate(p, [i / strokes * 0.6, i / strokes * 0.6 + 0.45], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const y = -200 + (i / (strokes - 1)) * 2400, w = 260 + random(`w${i}`) * 220;
    return { d: `M${1300},${y - 600} C${800},${y - 300} ${300},${y + 100} ${-250},${y + 500}`, t, w };
  });
  const trail = interpolate(p, [0.85, 1], [1, 0], clamp);
  // the mask is an SVG image (strokes with a rough displacement), rebuilt each frame; at the end the frame is full
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920' viewBox='0 0 1080 1920'><defs><filter id='r' x='-10%' y='-10%' width='120%' height='120%'><feTurbulence type='fractalNoise' baseFrequency='0.02 0.25' numOctaves='2' seed='4'/><feDisplacementMap in='SourceGraphic' scale='60'/></filter></defs>`
    + (p >= 0.98 ? `<rect width='1080' height='1920' fill='white'/>` : `<g filter='url(#r)'>${S.map((s) => `<path d='${s.d}' pathLength='1' fill='none' stroke='white' stroke-width='${s.w.toFixed(0)}' stroke-dasharray='${s.t.toFixed(3)} 2' stroke-linecap='round'/>`).join('')}</g>`) + '</svg>';
  const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs><filter id={`${id}r`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.25" numOctaves={2} seed={4} /><feDisplacementMap in="SourceGraphic" scale={60} /></filter></defs>
      </svg>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>{next}</AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 0.85 * trail }}>
        <g filter={`url(#${id}r)`}>{S.filter((_, i) => i % 3 === 1).map((s, i) => <path key={i} d={s.d} pathLength={1} fill="none" stroke="#fff" strokeWidth={30} strokeDasharray={`0.15 2`} strokeDashoffset={-s.t + 0.15} />)}</g>
      </svg>
    </AbsoluteFill>
  );
};
