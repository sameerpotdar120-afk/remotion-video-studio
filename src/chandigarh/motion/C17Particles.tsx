import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// c17_particles (the living layer on photos and plans): `petals` (soft saffron and pink petals drifting down and
// turning, the temple), `wind` (long pale light streaks drifting across, the lungs' clean air), `cool` (pale blue
// air streams flowing out of a facade from `at` toward the viewer, the Secretariat), `sparkle` (gold sparkles bursting
// from `at` and falling, the heritage seal). Wraps every `period` frames so it can run under any length. Transparent.
export const C17Particles: React.FC<{ mode: 'petals' | 'wind' | 'cool' | 'sparkle'; at?: [number, number]; amount?: number; period?: number }> = ({ mode, at = [540, 960], amount = 1, period = 600 }) => {
  const f = useCurrentFrame();
  const n = Math.round((mode === 'sparkle' ? 60 : mode === 'wind' ? 14 : 34) * amount);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920}>
        {Array.from({ length: n }, (_, i) => {
          const rnd = (k: string) => random(`${mode}${k}${i}`);
          if (mode === 'petals') {
            const t = ((f / period) * (1 + rnd('v')) + rnd('t')) % 1, x = rnd('x') * 1180 - 50 + Math.sin(t * 9 + i) * 60, y = -60 + t * 2050;
            return <ellipse key={i} cx={x} cy={y} rx={9 + rnd('r') * 6} ry={5} fill={i % 2 ? '#FFB74A' : '#FF8FB0'} opacity={0.85} transform={`rotate(${f * (1 + rnd('w')) * 3 + i * 40} ${x} ${y})`} />;
          }
          if (mode === 'wind') {
            const t = ((f / period) * (1.5 + rnd('v')) + rnd('t')) % 1, y = 200 + rnd('y') * 1500 + Math.sin(t * 6 + i) * 30, x = -400 + t * 1900;
            return <path key={i} d={`M${x},${y} q120,-30 260,0 t260,0`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.5 * Math.sin(t * Math.PI)} />;
          }
          if (mode === 'cool') {
            const t = ((f / 120) + rnd('t')) % 1, a = -Math.PI / 2 + (rnd('a') - 0.5) * 2.2, d = 60 + t * 520;
            const x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d * 0.6 + t * 200;
            return <circle key={i} cx={x} cy={y} r={6 + t * 18} fill="#BDEBFF" opacity={0.55 * (1 - t)} style={{ filter: 'blur(3px)' }} />;
          }
          const t = (f % 90) / 90, a = rnd('a') * Math.PI * 2, v = 6 + rnd('v') * 14, g = f % 90;
          const x = at[0] + Math.cos(a) * v * g, y = at[1] + Math.sin(a) * v * g + 0.15 * g * g;
          return <path key={i} d={`M${x},${y - 8} L${x + 3},${y} L${x},${y + 8} L${x - 3},${y}Z`} fill={i % 3 ? '#FFD45A' : '#FFF3C0'} opacity={1 - t} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
