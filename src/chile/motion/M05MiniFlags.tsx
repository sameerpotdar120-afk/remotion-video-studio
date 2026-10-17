import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m05_mini_flags: five small Chile flags (the followers) bobbing as they march. Seamless loop.
// 500x400, 60 fps, 120 frames. Transparent.

const Flag: React.FC<{ x: number; y: number; ph: number; f: number }> = ({ x, y, ph, f }) => {
  const bob = -Math.abs(Math.sin((f / 120) * Math.PI * 4 + ph)) * 10;
  const w = (k: number) => Math.sin(k / 18 - (f / 120) * Math.PI * 8 + ph) * 3;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <line x1={-3} y1={-2} x2={-3} y2={70} stroke="#5b4636" strokeWidth={4} />
      <path d={`M0,${w(0)} L90,${w(90)} L90,${30 + w(90)} L0,${30 + w(0)}Z`} fill="#fff" stroke="#1b1b1b" strokeWidth={3} />
      <path d={`M0,${30 + w(0)} L90,${30 + w(90)} L90,${60 + w(90)} L0,${60 + w(0)}Z`} fill="#d52b1e" stroke="#1b1b1b" strokeWidth={3} />
      <rect x={0} y={w(0)} width={30} height={30} fill="#0039a6" stroke="#1b1b1b" strokeWidth={3} />
      <circle cx={15} cy={15 + w(15)} r={6} fill="#fff" />
    </g>
  );
};

export const M05MiniFlags: React.FC = () => {
  const f = useCurrentFrame();
  const pos = [[40, 40], [150, 10], [260, 60], [80, 200], [210, 230]];
  return (
    <AbsoluteFill>
      <svg width={500} height={400}>
        {pos.map(([x, y], i) => <Flag key={i} x={x} y={y} ph={i * 1.3} f={f} />)}
      </svg>
    </AbsoluteFill>
  );
};
