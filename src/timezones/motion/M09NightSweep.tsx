import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m09_night_sweep: night rolls across the frame like the line between day and night: a deep blue-black shade with a soft
// edge sweeps in from one side (prop from), and stars twinkle on in the dark part. Holds at the end. 1080x1920, 60 fps,
// 240 frames. Transparent where it is still day.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M09NightSweep: React.FC<{ from?: 'left' | 'right'; cover?: number }> = ({ from = 'right', cover = 0.75 }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 150], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const edge = 1080 * (from === 'right' ? 1 - cover * k : cover * k); // x of the soft edge
  const dark = from === 'right' ? { x0: edge - 220, x1: edge + 220 } : { x0: edge + 220, x1: edge - 220 };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="term" gradientUnits="userSpaceOnUse" x1={dark.x0} y1={0} x2={dark.x1} y2={0}>
            <stop offset="0" stopColor="#050b1e" stopOpacity={0} />
            <stop offset="0.5" stopColor="#081333" stopOpacity={0.55} />
            <stop offset="1" stopColor="#050b1e" stopOpacity={0.82} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#term)" />
        {Array.from({ length: 70 }, (_, i) => {
          const x = random(`sx${i}`) * 1080, y = random(`sy${i}`) * 1920;
          const inDark = from === 'right' ? x > edge + 80 : x < edge - 80;
          if (!inDark) return null;
          const tw = 0.45 + 0.55 * Math.abs(Math.sin(f / 60 * Math.PI * (0.6 + random(`st${i}`)) + i));
          const r = 1.5 + random(`sr${i}`) * 2.5;
          return <circle key={i} cx={x} cy={y} r={r} fill="#eaf2ff" opacity={tw * interpolate(f, [40, 120], [0, 1], c)} style={{ filter: 'drop-shadow(0 0 4px #bcd4ff)' }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
