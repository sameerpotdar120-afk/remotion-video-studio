import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// u12_ribbon_grow (line 5, "और ऊँचे पहाड़"; the reference's 33.4–35.0 s, the Andes in Colombia): three darker red-brown
// ribbons (the three cordilleras) grow up the country from the south, staggered by 4 frames, each a tapered band with a
// lighter ridge line. Transparent, 1080×1080, 60 fps. `paths` are the ridge centre lines in this box (the edit passes the
// projected cordilleras), `w` their widths.
const DEMO: string[] = ['M 430 980 C 420 820 400 640 420 420 C 430 300 470 200 520 120', 'M 520 990 C 520 820 540 640 560 460 C 575 330 620 230 690 150', 'M 610 980 C 640 820 680 660 720 520 C 750 420 800 330 860 260'];
export const U12RibbonGrow: React.FC<{ paths?: string[]; w?: number[] }> = ({ paths = DEMO, w = [70, 90, 60] }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {paths.map((d, i) => {
          const k = ramp(f, i * 4, i * 4 + 26, Easing.out(Easing.cubic));
          return (
            <g key={i} style={{ mixBlendMode: 'multiply' }}>
              <path d={d} stroke="#9A3A1C" strokeWidth={w[i] ?? 70} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} opacity={0.85} />
              <path d={d} stroke="#E0784A" strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} opacity={0.9} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
