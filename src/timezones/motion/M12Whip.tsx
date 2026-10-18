import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';

// m12_whip: a fast whip-pan transition overlay: bright horizontal speed streaks rush across the frame in the direction
// of travel with a short white flash in the middle. Lay it over the cut between two map moves. 1080x1920, 60 fps,
// 30 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M12Whip: React.FC<{ dir?: 'left' | 'right' }> = ({ dir = 'left' }) => {
  const f = useCurrentFrame();
  const s = dir === 'left' ? -1 : 1;
  const flash = interpolate(f, [8, 14, 22], [0, 0.55, 0], c);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 46 }, (_, i) => {
          const y = random(`y${i}`) * 1920;
          const len = 300 + random(`l${i}`) * 900;
          const t0 = random(`t${i}`) * 10;
          const k = interpolate(f, [t0, t0 + 16], [0, 1], c);
          if (k <= 0 || k >= 1) return null;
          const x = s > 0 ? -len + k * (1080 + len * 2) : 1080 + len - k * (1080 + len * 2);
          const h = 3 + random(`h${i}`) * 10;
          return <rect key={i} x={s > 0 ? x : x - len} y={y} width={len} height={h} rx={h / 2} fill="#ffffff" opacity={0.25 + random(`o${i}`) * 0.5}
            style={{ filter: `blur(${2 + random(`b${i}`) * 4}px)` }} />;
        })}
        <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={flash} />
      </svg>
    </AbsoluteFill>
  );
};
