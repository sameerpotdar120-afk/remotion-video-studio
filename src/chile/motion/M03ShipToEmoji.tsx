import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m03_ship_to_emoji: a small galleon (drawn in code) bobs on the water, then at frame 120 pops into a smiling,
// waving face ("बातचीत"), which keeps smiling innocently. 300x300, 60 fps, 300 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M03ShipToEmoji: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * 6, tilt = Math.sin(f / 13) * 5;
  const shipOut = interpolate(f, [116, 124], [1, 0], c);
  const face = interpolate(f, [120, 130, 138], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wave = Math.sin(f / 4) * 22;
  const blink = f % 150 > 140 ? 0.15 : 1;
  return (
    <AbsoluteFill>
      <svg width={300} height={300} viewBox="-150 -150 300 300">
        {shipOut > 0 && (
          <g transform={`translate(0 ${bob + 20}) rotate(${tilt}) scale(${shipOut})`}>
            <path d="M -95 10 L 95 10 L 70 52 L -78 52 Z" fill="#6b3f1f" stroke="#2d1a0c" strokeWidth={5} />
            <rect x={-70} y={18} width={140} height={8} fill="#c9a061" />
            {[-40, 15].map((x, i) => <line key={i} x1={x} y1={10} x2={x} y2={-110 + i * 15} stroke="#3a2412" strokeWidth={7} />)}
            {[-40, 15].map((x, i) => <path key={`s${i}`} d={`M ${x - 38} ${-95 + i * 15} Q ${x + 8} ${-70 + i * 15} ${x + 34} ${-95 + i * 15} L ${x + 30} ${-25} Q ${x} ${-12} ${x - 34} ${-25} Z`} fill="#f3ead6" stroke="#8a7a5a" strokeWidth={4} />)}
            <path d="M 15 -96 L 52 -86 L 15 -76 Z" fill="#c8102e" stroke="#7a0a1c" strokeWidth={3} />
            <path d="M -120 54 Q -60 44 0 54 T 120 54" fill="none" stroke="#bfe6ff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
          </g>
        )}
        {face > 0 && (
          <g transform={`scale(${face})`}>
            <circle r={78} fill="#ffcc33" stroke="#e09a12" strokeWidth={6} />
            <ellipse cx={-26} cy={-16} rx={10} ry={14 * blink} fill="#3b2410" />
            <ellipse cx={26} cy={-16} rx={10} ry={14 * blink} fill="#3b2410" />
            <path d="M -40 18 Q 0 58 40 18" fill="none" stroke="#3b2410" strokeWidth={9} strokeLinecap="round" />
            <circle cx={-48} cy={14} r={11} fill="#ff8a65" opacity={0.6} /><circle cx={48} cy={14} r={11} fill="#ff8a65" opacity={0.6} />
            <g transform={`translate(78 20) rotate(${-30 + wave})`}>
              <rect x={-14} y={-60} width={28} height={60} rx={14} fill="#ffcc33" stroke="#e09a12" strokeWidth={5} />
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
