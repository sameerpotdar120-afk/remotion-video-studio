import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// u16_wind_curls (line 8, "…नमी भरकर सीधे Britain पर बरसा देती है"; the reference's 46.6–51.7 s): a field of small blue
// moisture rings over the sea, and thin white crescent wind strokes (each ~¼ screen long, with a small curl at the head)
// drifting left → right in layers, fading in and out over ~36 frames, denser as `density` rises. Raindrop splashes pop
// where they cross land (`land` is a y range). Transparent, 1080×1920, 60 fps.
export const U16WindCurls: React.FC<{ density?: number; moisture?: boolean; angle?: number }> = ({ density = 1, moisture = true, angle = -10 }) => {
  const f = useCurrentFrame();
  const n = Math.round(26 * density);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {moisture && Array.from({ length: 140 }, (_, i) => {
          const x = random(`mx${i}`) * 700 - 40, y = 300 + random(`my${i}`) * 1300;
          const a = 0.35 + 0.35 * Math.sin(f / 14 + i);
          return <circle key={i} cx={x + Math.sin(f / 30 + i) * 6} cy={y} r={6 + random(`mr${i}`) * 6} fill="none" stroke="#5AA8F0" strokeWidth={4} opacity={Math.min(1, a + 0.25)} />;
        })}
        <g transform={`rotate(${angle} 540 960)`}>
          {Array.from({ length: n }, (_, i) => {
            const per = 70 + random(`cp${i}`) * 40, t = ((f + random(`cf${i}`) * per) % per) / per;
            const y = 200 + random(`cy${i}`) * 1500, x = -300 + t * 1500, len = 220 + random(`cl${i}`) * 160;
            const o = Math.sin(t * Math.PI);
            return (
              <g key={i} opacity={o * 0.85}>
                <path d={`M ${x - len} ${y} Q ${x - len / 2} ${y - 26} ${x} ${y}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
                <path d={`M ${x} ${y} q 26 -4 22 -28 q -4 -20 -24 -12`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
