import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m05_question: a chunky yellow "?" (drawn as a shape, no font) drops in, squashes on landing, bounces twice and then
// keeps a small tilt-wobble. 400x520, 60 fps, 120 frames. Transparent.

export const M05Question: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f, fps, config: { damping: 7, stiffness: 140, mass: 0.8 } });
  const y = (1 - drop) * -420;
  const squash = f > 10 && f < 30 ? 1 + Math.sin((f - 10) / 20 * Math.PI) * 0.12 : 1;
  const tilt = Math.sin(f / 60 * Math.PI * 2 * 0.9) * 7;
  return (
    <AbsoluteFill>
      <svg width={400} height={520} viewBox="0 0 400 520">
        <g transform={`translate(200 ${470 + y}) rotate(${tilt}) scale(${1 / squash} ${squash}) translate(-200 -470)`}
          style={{ filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.45))' }}>
          {/* hook of the question mark */}
          <path d="M 110 150 C 110 60, 290 50, 290 150 C 290 215, 210 225, 205 300 L 205 335" fill="none" stroke="#3a2a00" strokeWidth={88} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 110 150 C 110 60, 290 50, 290 150 C 290 215, 210 225, 205 300 L 205 335" fill="none" stroke="#FFE11A" strokeWidth={68} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 135 125 C 150 90, 200 82, 235 95" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={14} strokeLinecap="round" />
          <circle cx={205} cy={430} r={46} fill="#3a2a00" />
          <circle cx={205} cy={430} r={36} fill="#FFE11A" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
