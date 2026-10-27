import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p06_region_glow (line 3, "California और Hawaii के बीच में"; the reference's 0:11–0:13): the region (`d`, screen px)
// fills from its centre out in gold (a scale-up from 0.6 with a back-ease, 12 frames), with a white top sheen, a hot
// edge and a big soft bloom that throbs; Hawaii, too small to fill, gets the same glow round its islands. `out` fades
// it over 20 frames. Transparent, 1080×1920.
export const P06RegionGlow: React.FC<{ d: string; c: [number, number]; color?: string; bloom?: number; out?: number }> = ({ d, c, color = C.gold, bloom = 26, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 12], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const a = interpolate(f, [0, 6], [0, 1], clamp) * (out !== undefined ? interpolate(f, [out, out + 20], [1, 0], clamp) : 1);
  const th = 0.75 + 0.25 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="p06b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={bloom * th} /></filter>
          <linearGradient id="p06s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.55} /><stop offset="0.45" stopColor="#fff" stopOpacity={0} /></linearGradient>
        </defs>
        <g transform={`translate(${c[0]} ${c[1]}) scale(${s}) translate(${-c[0]} ${-c[1]})`}>
          <path d={d} fill={color} stroke={color} strokeWidth={bloom * 0.8} filter="url(#p06b)" opacity={0.9} />
          <path d={d} fill={color} />
          <path d={d} fill="url(#p06s)" />
          <path d={d} fill="none" stroke={C.goldGlow} strokeWidth={3} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
