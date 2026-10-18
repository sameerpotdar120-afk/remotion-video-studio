import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m10_wall_clock: a round wooden-rim wall clock pops in showing a start time, waits, then its minute hand sweeps forward
// by add minutes (60 for बागान टाइम, 15 for Nepal) with a springy overshoot and settle; a glowing arc marks the minutes
// gained. 600x600, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M10WallClock: React.FC<{ h?: number; m?: number; add?: number; arc?: string }> = ({ h = 6, m = 0, add = 60, arc = '#3BE07A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 10, stiffness: 170, mass: 0.6 } });
  const go = spring({ frame: f - 50, fps, config: { damping: 8, stiffness: 90, mass: 0.9 } });
  const mins = h * 60 + m + add * go;
  const minA = (mins % 60) * 6, hourA = ((mins / 60) % 12) * 30;
  const a0 = (m % 60) * 6, a1 = a0 + add * 6 * Math.min(1, go);
  const r = 168;
  const p = (a: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  const tick = f > 50 && f < 110 ? interpolate(f, [50, 110], [1, 0], c) : 0;
  return (
    <AbsoluteFill>
      <svg width={600} height={600} viewBox="0 0 600 600">
        <defs>
          <radialGradient id="wface" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#fffdf6" /><stop offset="1" stopColor="#efe6d2" /></radialGradient>
          <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8693a" /><stop offset="1" stopColor="#5b3216" /></linearGradient>
        </defs>
        <g transform={`translate(300 300) scale(${pop}) rotate(${Math.sin(f * 1.7) * 2 * tick})`} style={{ filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.45))' }}>
          <circle r={250} fill="url(#rim)" stroke="#3b1f0c" strokeWidth={8} />
          <circle r={214} fill="url(#wface)" stroke="#3b1f0c" strokeWidth={6} />
          {add > 0 && go > 0.01 && (a1 - a0 >= 359.5
            ? <circle r={r} fill={arc} opacity={0.38} />
            : <path d={`M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`} fill={arc} opacity={0.38} />)}
          {Array.from({ length: 60 }, (_, i) => (
            <rect key={i} x={i % 5 ? -2.5 : -5} y={-204} width={i % 5 ? 5 : 10} height={i % 5 ? 12 : 26} rx={3} fill="#2b2016" transform={`rotate(${i * 6})`} />
          ))}
          <rect x={-10} y={-112} width={20} height={124} rx={10} fill="#1d150e" transform={`rotate(${hourA})`} />
          <rect x={-6} y={-178} width={12} height={194} rx={6} fill="#1d150e" transform={`rotate(${minA})`} />
          <circle r={18} fill="#c9302c" stroke="#1d150e" strokeWidth={5} />
          <path d="M -150 -100 A 180 180 0 0 1 -40 -175" fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
