import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// s17_cloud_wipe (lines 1→ and 13, the loop): thick white-grey clouds billow in from the bottom and cover the frame,
// then part to reveal `next`. At `at` they start; at `at + dur/2` the frame is fully covered (the cut point); at
// `at + dur` they're gone.
export const S17CloudWipe: React.FC<{ children: React.ReactNode; next: React.ReactNode; at?: number; dur?: number }> = ({ children, next, at = 0, dur = 30 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  const cover = p < 0.5 ? p * 2 : (1 - p) * 2;
  const up = p < 0.5 ? (1 - p * 2) * 2000 : -(p - 0.5) * 2 * 2400;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{p < 0.5 ? children : next}</AbsoluteFill>
      {p > 0 && p < 1 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="cwF" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={21} />
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.95  0 0 0 0 0.97  0 0 0 3.2 -1.1" />
          </filter>
          <linearGradient id="cwM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.18" stopColor="#fff" /><stop offset="0.82" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <mask id="cwMask"><rect x={-200} y={up - 300} width={1480} height={2600} fill="url(#cwM)" /></mask>
        </defs>
        <g mask="url(#cwMask)">
          <rect x={-200} y={up - 300} width={1480} height={2600} fill="#E9EEF2" opacity={Math.min(1, cover * 1.6)} />
          <rect x={-200} y={up - 300} width={1480} height={2600} filter="url(#cwF)" />
        </g>
      </svg>}
    </AbsoluteFill>
  );
};
