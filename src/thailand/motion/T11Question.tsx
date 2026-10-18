import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, wobble } from './theme';

// t11_question (line 1, on the country that was never anyone's colony): a giant white "?" drops in from above, lands with a
// squash and bounce, then its dot drops in after it; it keeps a slow sway with a soft glow. Drawn as a path, no font.
// Transparent, 600x800, 60 fps, 120 frames.
const Q = 'M -110 -170 C -110 -300 110 -300 110 -170 C 110 -80 0 -70 0 30';

export const T11Question: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 14], [-700, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const sq = 1 - wobble(f, 14, 2.6, 5) * 0.22;
  const dy = interpolate(f, [12, 24], [-800, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const dsq = 1 - wobble(f, 24, 3, 6) * 0.3;
  const sway = f > 30 ? Math.sin((f - 30) / 24) * 4 : 0;
  return (
    <AbsoluteFill>
      <svg width={600} height={800}>
        <defs><filter id="qg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={16} /></filter></defs>
        <g transform={`translate(300 520) rotate(${sway} 0 260)`}>
          <g transform={`translate(0 ${y}) translate(0 60) scale(${1 / Math.sqrt(sq)} ${sq}) translate(0 -60)`}>
            <path d={Q} stroke="#fff" strokeWidth={90} fill="none" strokeLinecap="round" opacity={0.5} filter="url(#qg)" />
            <path d={Q} stroke={C.ink} strokeWidth={100} fill="none" strokeLinecap="round" />
            <path d={Q} stroke="#fff" strokeWidth={72} fill="none" strokeLinecap="round" />
          </g>
          <g transform={`translate(0 ${dy}) translate(0 190) scale(${1 / Math.sqrt(dsq)} ${dsq}) translate(0 -190)`}>
            <circle cy={150} r={50} fill={C.ink} />
            <circle cy={150} r={36} fill="#fff" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
