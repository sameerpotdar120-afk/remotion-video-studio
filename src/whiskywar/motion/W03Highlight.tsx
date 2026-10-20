import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// w03_highlight (line 2, "ये है … Whisky War"; the reference's 4.7–5.0 s): a yellow highlighter stroke swipes left to
// right over a headline, slightly tilted, with a ragged marker edge and multiply blend so the print shows through.
// Transparent, 1080×400, 60 fps. Place it over the newspaper's headline; `w`, `h`, `tilt` fit the words.
export const W03Highlight: React.FC<{ w?: number; h?: number; tilt?: number }> = ({ w = 760, h = 110, tilt = -6 }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 14, Easing.inOut(Easing.quad));
  const x0 = (1080 - w) / 2, y0 = 200 - h / 2;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'multiply' }}>
      <svg width={1080} height={400}>
        <defs>
          <filter id="hlEdge"><feTurbulence type="fractalNoise" baseFrequency="0.05 0.3" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale={10} /></filter>
        </defs>
        <g transform={`rotate(${tilt} 540 200)`}>
          <rect x={x0} y={y0} width={w * k} height={h} rx={10} fill="#F5F23A" opacity={0.9} filter="url(#hlEdge)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
