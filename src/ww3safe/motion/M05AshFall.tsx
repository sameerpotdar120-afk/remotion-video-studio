import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m05_ash_fall: grey ash drifting down for the nuclear-winter shot. Seamless loop of 360 frames.
// 1080x1920, 60 fps, 360 frames. Transparent.

const N = 260, LOOP = 360;

export const M05AshFall: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="b1"><feGaussianBlur stdDeviation={1.2} /></filter>
          <filter id="b3"><feGaussianBlur stdDeviation={3.5} /></filter>
        </defs>
        {Array.from({ length: N }, (_, i) => {
          const depth = random(`d${i}`);
          const laps = 1 + Math.floor(depth * 2);
          const t = ((f / LOOP) * laps + random(`t${i}`)) % 1;
          const x0 = random(`x${i}`) * 1180 - 50;
          const sway = Math.sin(((f / LOOP) * Math.PI * 2) * (1 + Math.floor(random(`w${i}`) * 3)) + i) * (12 + depth * 30);
          const y = -40 + t * 2000;
          const r = 1.5 + depth * 5;
          const g = 150 + Math.floor(random(`g${i}`) * 90);
          return (
            <circle key={i} cx={x0 + sway + t * 60} cy={y} r={r} fill={`rgb(${g},${g},${g})`}
              opacity={0.35 + depth * 0.5} filter={depth > 0.75 ? 'url(#b3)' : 'url(#b1)'} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
