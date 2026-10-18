import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m04_steam: three soft white steam wisps curl up from the bottom centre and fade, for a glass of chai. Loops cleanly
// every 180 frames. 300x420, 60 fps, 180 frames. Transparent.

const Wisp: React.FC<{ f: number; off: number; x: number }> = ({ f, off, x }) => {
  const p = ((f + off) % 180) / 180; // 0 → 1 over the loop
  const y = 400 - p * 330;
  const sway = Math.sin(p * Math.PI * 2 + off) * 26;
  const o = Math.sin(p * Math.PI) * 0.75;
  const w = 26 + p * 46;
  return (
    <path d={`M ${x} ${y + 60} C ${x - 30 + sway} ${y + 30}, ${x + 30 + sway} ${y}, ${x + sway} ${y - 40}`} fill="none" stroke="#ffffff"
      strokeOpacity={o} strokeWidth={w} strokeLinecap="round" style={{ filter: `blur(${10 + p * 10}px)` }} />
  );
};

export const M04Steam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={300} height={420} viewBox="0 0 300 420">
        <Wisp f={f} off={0} x={130} />
        <Wisp f={f} off={60} x={165} />
        <Wisp f={f} off={120} x={148} />
      </svg>
    </AbsoluteFill>
  );
};
