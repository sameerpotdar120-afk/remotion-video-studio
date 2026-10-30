import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { RainLayer } from '../../ukweather/motion/U02WeatherMontage';
import { U05Lightning } from '../../ukweather/motion/U05Lightning';
import { clamp } from './theme';

// s11_storm (line 9, the reference's 0:34–0:39): dark storm clouds roll in from the top and bottom edges (layered fractal
// noise, lit from below by the flashes), rain streaks fall at an angle, and lightning strikes at `bolts` (frames, with
// a landing point). The map is darkened and cooled under it. `out` clears it. Transparent.
export const S11Storm: React.FC<{ t0?: number; bolts?: [number, number, number][]; out?: number; rain?: number }> = ({ t0 = 0, bolts = [], out, rain = 1 }) => {
  const f = useCurrentFrame();
  const In = interpolate(f, [t0, t0 + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const O = out !== undefined ? interpolate(f, [out, out + 20], [1, 0], clamp) : 1;
  const a = In * O;
  const flash = bolts.reduce((m, [t]) => Math.max(m, f >= t && f < t + 10 ? [1, 0.6, 0.9, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05, 0][f - t] : 0), 0);
  if (a <= 0) return null;
  const roll = (1 - In) * 600 - (1 - O) * 600;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#0a1420', opacity: 0.38 * a, mixBlendMode: 'multiply' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
        <defs>
          {[0, 1].map((k) => (
            <filter key={k} id={`stC${k}`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency={k ? '0.0035 0.006' : '0.005 0.009'} numOctaves={4} seed={k ? 17 : 5} />
              <feColorMatrix values={`0 0 0 0 ${0.16 + flash * 0.5}  0 0 0 0 ${0.19 + flash * 0.5}  0 0 0 0 ${0.24 + flash * 0.55}  0 0 0 2.6 -1.05`} />
            </filter>
          ))}
          <linearGradient id="stMask" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="0.36" stopColor="#fff" stopOpacity={0.15} /><stop offset="0.64" stopColor="#fff" stopOpacity={0.15} /><stop offset="1" stopColor="#fff" /></linearGradient>
          <mask id="stM"><rect width={1080} height={1920} fill="url(#stMask)" /></mask>
        </defs>
        <g mask="url(#stM)">
          <rect x={-300 + ((f * 1.6) % 300)} y={-roll} width={1700} height={1200} filter="url(#stC0)" />
          <rect x={-300 - ((f * 1.1) % 300)} y={900 + roll} width={1700} height={1100} filter="url(#stC1)" />
        </g>
      </svg>
      <RainLayer f={f} a={0.7 * a * rain} n={110} angle={14} />
      {bolts.map(([t, x, y], i) => <Sequence key={i} from={t} durationInFrames={14} layout="none"><U05Lightning x={x} y={y} seed={`sk${i}`} /></Sequence>)}
      <AbsoluteFill style={{ background: '#CFE3FF', opacity: flash * 0.22 }} />
    </AbsoluteFill>
  );
};
