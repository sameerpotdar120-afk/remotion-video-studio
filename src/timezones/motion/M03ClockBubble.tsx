import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m03_clock_bubble: a white speech bubble pops in with a springy overshoot; inside it a small clock shows a time. With
// flip on, the minute hand whips one full turn and the hour hand moves on one hour (5:00 → 6:00) and the bubble boings.
// Tail on the left or right. 700x560, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M03ClockBubble: React.FC<{ h?: number; flip?: boolean; tail?: 'left' | 'right' }> = ({ h = 5, flip = false, tail = 'left' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const turn = flip ? interpolate(f, [70, 100], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) }) : 0;
  const boing = flip && f > 100 ? Math.sin((f - 100) / 3) * 0.06 * Math.exp(-(f - 100) / 14) : 0;
  const idle = Math.sin(f / 60 * Math.PI * 2 * 0.7) * 6;
  const minA = turn * 360, hourA = (h % 12) * 30 + turn * 30;
  const sx = tail === 'left' ? 1 : -1;
  return (
    <AbsoluteFill>
      <svg width={700} height={560} viewBox="0 0 700 560">
        <g transform={`translate(350 ${270 + idle}) scale(${pop * (1 + boing)}) scale(${sx} 1)`} style={{ filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.4))' }}>
          {/* bubble with tail (tail drawn toward the bottom left; mirrored for the right) */}
          <path d="M -250 -170 Q -250 -215 -205 -215 L 205 -215 Q 250 -215 250 -170 L 250 120 Q 250 165 205 165 L -120 165 L -230 245 L -170 165 L -205 165 Q -250 165 -250 120 Z"
            fill="#ffffff" stroke="#1d2a3a" strokeWidth={9} strokeLinejoin="round" />
          <g transform={`scale(${sx} 1)`}>
            <circle cy={-25} r={140} fill="#fdf6e3" stroke="#1d2a3a" strokeWidth={10} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-5} y={-155} width={10} height={i % 3 === 0 ? 26 : 14} rx={4} fill="#1d2a3a" transform={`translate(0 -25) rotate(${i * 30}) translate(0 0)`} />
            ))}
            <g transform="translate(0 -25)">
              <rect x={-9} y={-78} width={18} height={90} rx={9} fill="#1d2a3a" transform={`rotate(${hourA})`} />
              <rect x={-6} y={-112} width={12} height={124} rx={6} fill="#E8343A" transform={`rotate(${minA})`} />
              <circle r={14} fill="#1d2a3a" />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
