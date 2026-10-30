import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, useFonts } from './font';
import { C, clamp, idle } from './theme';

// s08_hex (line 6, the reference's "LARGE PEAKS" / "VALLEYS" badges): a hexagon window (white rim, cyan glow) pops at
// (x, y) holding `children` (a 3D view, a drawing), with a white label bar under it that types in. Transparent.
const hex = (r: number) => Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${(Math.cos(a) * r).toFixed(1)}px ${(Math.sin(a) * r).toFixed(1)}px`; });
export const S08Hex: React.FC<{ x: number; y: number; r?: number; label: string; t0?: number; out?: number; seed?: number; children?: React.ReactNode }> = ({ x, y, r = 190, label, t0 = 0, out, seed = 1, children }) => {
  useFonts();
  const f = useCurrentFrame();
  const p = interpolate(f, [t0, t0 + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.9)) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const n = Math.round(interpolate(f, [t0 + 10, t0 + 10 + label.length * 1.6], [0, label.length], clamp));
  const [ix, iy, ir] = idle(f, seed, 0.8);
  if (f < t0) return null;
  const poly = `polygon(${hex(r).map((s) => s.split(' ').map((v, i) => `calc(${r}px + ${v})`).join(' ')).join(',')})`;
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x - r + ix, top: y - r + iy, width: r * 2, height: r * 2, transform: `scale(${p}) rotate(${ir * 2}deg)` }}>
        <div style={{ position: 'absolute', inset: -10, clipPath: `polygon(${hex(r + 10).map((s) => s.split(' ').map((v) => `calc(${r + 10}px + ${v})`).join(' ')).join(',')})`, background: '#fff', filter: `drop-shadow(0 0 18px ${C.cyan})` }} />
        <div style={{ position: 'absolute', inset: 0, clipPath: poly, background: '#0b1418', overflow: 'hidden' }}>{children}</div>
        {n > 0 && <div style={{ position: 'absolute', left: '50%', top: r * 2 - 14, transform: 'translateX(-50%)', background: '#fff', color: C.ink, padding: '6px 18px',
          fontFamily: LABEL, fontWeight: 800, fontSize: 34, letterSpacing: 4, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>{label.slice(0, n)}</div>}
      </div>
    </AbsoluteFill>
  );
};
