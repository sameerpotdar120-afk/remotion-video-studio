import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m15_zzz: three cartoon "Z" shapes float up and to the right from the bottom left, growing and fading, for a sleeping
// character. Drawn as shapes (no font). Loops every 180 frames. 360x460, 60 fps, 180 frames. Transparent.

const Z: React.FC<{ s: number; o: number }> = ({ s, o }) => (
  <path d={`M ${-s} ${-s} L ${s} ${-s} L ${-s} ${s} L ${s} ${s}`} fill="none" stroke="#ffffff" strokeWidth={s * 0.42} strokeLinecap="round" strokeLinejoin="round" opacity={o}
    style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />
);

export const M15Zzz: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={360} height={460} viewBox="0 0 360 460">
        {[0, 60, 120].map((d) => {
          const p = ((f + d) % 180) / 180;
          const x = 70 + p * 210 + Math.sin(p * Math.PI * 3) * 18;
          const y = 420 - p * 360;
          const o = Math.sin(p * Math.PI);
          return <g key={d} transform={`translate(${x} ${y}) rotate(${-12 + p * 20})`}><Z s={14 + p * 30} o={o} /></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
