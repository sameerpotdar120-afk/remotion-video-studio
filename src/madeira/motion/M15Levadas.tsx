import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, inOut, ramp } from './theme';

// m15_levadas (line 7, "पहाड़ों की चट्टानें काटकर पानी की नहरें बनाईं, levadas"): bright blue water lines run across
// the island along `paths` (screen px, contour-following polylines the edit makes), each drawing on in turn, `step`
// frames apart, with a glowing head; once drawn, a dashed shimmer keeps flowing along them (water moving), and a soft
// blue glow sits under them. Transparent, 1080×1920, 60 fps.
export const M15Levadas: React.FC<{ paths: string[]; step?: number; dur?: number; width?: number }> = ({ paths, step = 6, dur = 40, width = 3.5 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {paths.map((d, i) => {
          const p = ramp(f, i * step, i * step + dur, inOut);
          if (p <= 0) return null;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={C.water} strokeWidth={width * 4} strokeOpacity={0.3} pathLength={1} strokeDasharray={`${p} 2`} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(4px)' }} />
              <path d={d} fill="none" stroke={C.water} strokeWidth={width} pathLength={1} strokeDasharray={`${p} 2`} strokeLinecap="round" strokeLinejoin="round" />
              {p < 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={width * 2.2} pathLength={1} strokeDasharray="0.012 2" strokeDashoffset={-(p - 0.012)} strokeLinecap="round" style={{ filter: 'blur(1.5px)' }} />}
              {p >= 1 && <path d={d} fill="none" stroke="#E8FAFF" strokeWidth={width * 0.6} pathLength={1} strokeDasharray="0.02 0.05" strokeDashoffset={-f * 0.002 - i * 0.1} opacity={0.9} />}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
