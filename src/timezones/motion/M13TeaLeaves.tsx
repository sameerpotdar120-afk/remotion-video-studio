import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m13_tea_leaves: fresh green tea leaves drift down and across the frame, turning and fluttering, at three depths (near
// leaves bigger, faster and softly blurred). Loops cleanly every 300 frames. 1080x1920, 60 fps, 300 frames. Transparent.

const L = 300;
const Leaf: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const depth = i % 3; // 0 far, 1 mid, 2 near
  const size = [34, 54, 86][depth];
  const speed = [1, 1, 2][depth];
  const p = ((f / L) * speed + random(`p${i}`)) % 1; // whole-number speeds, so frame 300 matches frame 0
  const x = random(`x${i}`) * 1180 - 50 + Math.sin(p * Math.PI * 4 + i) * 60 + p * 160;
  const y = -120 + p * 2160;
  const rot = random(`r${i}`) * 360 + p * 720 * (i % 2 ? 1 : -1);
  const flip = Math.cos(p * Math.PI * 6 + i);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip} 1)`} opacity={[0.55, 0.8, 0.95][depth]} style={{ filter: depth === 2 ? 'blur(2px)' : undefined }}>
      <path d={`M 0 ${-size} C ${size * 0.62} ${-size * 0.5}, ${size * 0.58} ${size * 0.5}, 0 ${size} C ${-size * 0.58} ${size * 0.5}, ${-size * 0.62} ${-size * 0.5}, 0 ${-size} Z`}
        fill={depth === 0 ? '#3f8f3a' : '#5cb848'} stroke="#24561f" strokeWidth={2} />
      <path d={`M 0 ${-size * 0.9} L 0 ${size * 0.95}`} stroke="#2f6e29" strokeWidth={2.5} />
      {[-0.45, -0.1, 0.25].map((t, k) => (
        <path key={k} d={`M 0 ${size * t} q ${size * 0.3} ${-size * 0.15} ${size * 0.42} ${-size * 0.32} M 0 ${size * t} q ${-size * 0.3} ${-size * 0.15} ${-size * 0.42} ${-size * 0.32}`}
          fill="none" stroke="#2f6e29" strokeWidth={1.6} />
      ))}
    </g>
  );
};

export const M13TeaLeaves: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 30 }, (_, i) => <Leaf key={i} i={i} f={f} />)}
      </svg>
    </AbsoluteFill>
  );
};
