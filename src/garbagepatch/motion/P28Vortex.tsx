import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p28_vortex (line 12, "एक भँवर की तरह घुमाती रहती हैं"; small inside each gyre ring in line 5): four spiral arms
// of translucent current-blue fade in round `at` and spin clockwise, tighter and faster toward the centre, with white
// foam streaks riding the arms. `r` the outer radius, `squash` flattens it to sit on the map. Transparent.
export const P28Vortex: React.FC<{ at: [number, number]; r?: number; squash?: number; speed?: number; out?: number }> = ({ at, r = 300, squash = 0.75, speed = 1, out }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 16], [0, 1], clamp) * (out !== undefined ? interpolate(f, [out, out + 14], [1, 0], clamp) : 1);
  const arm = (k: number) => Array.from({ length: 40 }, (_, i) => {
    const t = i / 39, ang = k * (Math.PI / 2) + t * Math.PI * 2.2, rr = r * (1 - t * 0.92);
    return `${i ? 'L' : 'M'}${(Math.cos(ang) * rr).toFixed(1)},${(Math.sin(ang) * rr).toFixed(1)}`;
  }).join('');
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <g transform={`translate(${at[0]} ${at[1]}) scale(1 ${squash}) rotate(${f * 1.4 * speed})`}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <path d={arm(k)} fill="none" stroke={C.current} strokeWidth={r * 0.09} strokeLinecap="round" opacity={0.45} />
              <path d={arm(k)} pathLength={1} fill="none" stroke="#fff" strokeWidth={r * 0.02} strokeLinecap="round" strokeDasharray="0.08 0.25" strokeDashoffset={-f * 0.012 * speed} opacity={0.7} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
