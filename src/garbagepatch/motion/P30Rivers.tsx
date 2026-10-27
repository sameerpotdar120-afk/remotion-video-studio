import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p30_rivers (line 7, "नदियों से"): rivers on land (`ds`, screen px, drawn from the source to the sea, e.g. the
// Columbia, Sacramento, Fraser and Yukon from Natural Earth) light up cyan one after another, the light running down
// each toward the coast in 18 frames, then a stream of bright dashes keeps flowing seaward with a glow. Transparent.
export const P30Rivers: React.FC<{ ds: string[]; step?: number; out?: number }> = ({ ds, step = 5, out }) => {
  const f = useCurrentFrame();
  const op = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs><filter id="p30g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={5} /></filter></defs>
        {ds.map((d, i) => {
          const t = interpolate(f, [i * step, i * step + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return t > 0 ? (
            <g key={i}>
              <path d={d} pathLength={1} fill="none" stroke={C.cyan} strokeWidth={10} strokeDasharray={`${t} 2`} filter="url(#p30g)" opacity={0.8} />
              <path d={d} pathLength={1} fill="none" stroke={C.cyanGlow} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${t} 2`} />
              {t >= 1 && <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeDasharray="0.03 0.09" strokeDashoffset={-f * 0.01} />}
            </g>
          ) : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};
