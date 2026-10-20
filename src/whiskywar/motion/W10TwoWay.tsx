import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { ramp } from './theme';

// w10_two_way (line 5, "दोनों किनारों से करीब 18 किलोमीटर"; the reference's 23.1–24.3 s): two white arrows grow out of
// the island in opposite directions toward both shores, each with a counter ticking "2 km … 18 km" (miles under it),
// the text rotated along the arrow. Transparent, 1080×1080, 60 fps; the island is (540, 540); `angle` sets the
// direction (the strait's axis), `len` the arrow length in px, `km` the end value.
export const W10TwoWay: React.FC<{ angle?: number; len?: number; km?: number }> = ({ angle = -36, len = 380, km = 18 }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = ramp(f, 0, 60, Easing.out(Easing.cubic));
  const n = Math.max(1, Math.round(km * k));
  const arm = (dir: 1 | -1) => (
    <g transform={`rotate(${angle + (dir < 0 ? 180 : 0)} 540 540)`}>
      <path d={`M ${540 + 30} 540 H ${540 + 30 + len * k}`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <path d="M -16 -16 L 6 0 L -16 16" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" transform={`translate(${540 + 30 + len * k} 540)`} />
      <g transform={`translate(${540 + 30 + len * k * 0.6} 500) rotate(${dir < 0 ? 180 : 0})`}>
        <text textAnchor="middle" fontFamily={NUM} fontSize={52} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">{n} km</text>
        <text y={40} textAnchor="middle" fontFamily={NUM} fontSize={30} fill="#fff" stroke="#000" strokeWidth={5} paintOrder="stroke">({Math.round(n * 0.62)} mi)</text>
      </g>
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {arm(1)}{arm(-1)}
        <circle cx={540} cy={540} r={10} fill="#E8D9B8" stroke="#fff" strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};
