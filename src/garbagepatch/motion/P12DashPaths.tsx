import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p12_dash_paths (line 7, "नदियों से, जहाज़ों से, और किनारे बसे शहरों से"; the reference's 0:30–0:33): white dashed
// curves (`ds`, screen px, each ending on the patch) draw on one after another (`step` frames apart, 20 frames each),
// then the dashes keep marching toward the patch, and a small glowing bead runs down each path every 70 frames, like
// trash drifting in. `out` fades them. Transparent, 1080×1920.
export const P12DashPaths: React.FC<{ ds: string[]; step?: number; out?: number; width?: number }> = ({ ds, step = 8, out, width = 5 }) => {
  const f = useCurrentFrame();
  const op = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
        {ds.map((d, i) => {
          const t = interpolate(f, [i * step, i * step + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          if (t <= 0) return null;
          const bead = ((f - i * step - 20 + i * 23) % 70) / 70;
          return (
            <g key={i}>
              <mask id={`p12m${i}`}><path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 3} strokeDasharray={`${t} 2`} /></mask>
              <path d={d} fill="none" stroke="#fff" strokeWidth={width} strokeLinecap="round" strokeDasharray={`${width * 3} ${width * 3}`} strokeDashoffset={-f * 1.2} mask={`url(#p12m${i})`} />
              {t >= 1 && <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 2.4} strokeLinecap="round" strokeDasharray="0.001 2" strokeDashoffset={-bead} opacity={Math.sin(bead * Math.PI)} />}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
