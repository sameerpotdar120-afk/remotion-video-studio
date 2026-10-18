import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m11_comment_bubble: a comment card pops up with two pill buttons, a green one with a tick on the left and a red one with
// a cross on the right (labels हाँ / ना are added in the edit), then a hand cursor slides in and taps the green one: the
// button presses down and a ripple spreads. 900x620, 60 fps, 210 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M11CommentBubble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  const b1 = spring({ frame: f - 10, fps, config: { damping: 9, stiffness: 180 } });
  const b2 = spring({ frame: f - 16, fps, config: { damping: 9, stiffness: 180 } });
  const hand = spring({ frame: f - 60, fps, config: { damping: 14, stiffness: 90 } });
  const press = f > 100 && f < 112 ? Math.sin(((f - 100) / 12) * Math.PI) : 0;
  const ripple = interpolate(f, [104, 150], [0, 1], c);
  const float = Math.sin(f / 60 * Math.PI * 2 * 0.6) * 6;
  return (
    <AbsoluteFill>
      <svg width={900} height={620} viewBox="0 0 900 620">
        <g transform={`translate(450 ${300 + float}) scale(${pop}) translate(-450 -300)`} style={{ filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.45))' }}>
          <path d="M 90 70 Q 90 30 130 30 L 770 30 Q 810 30 810 70 L 810 400 Q 810 440 770 440 L 300 440 L 200 530 L 220 440 L 130 440 Q 90 440 90 400 Z" fill="#ffffff" stroke="#16202e" strokeWidth={9} strokeLinejoin="round" />
          {/* two grey lines stand in for the comment text above the buttons */}
          {[0, 1].map((i) => <rect key={i} x={150} y={80 + i * 46} width={i ? 380 : 560} height={22} rx={11} fill="#d7dde6" />)}
          <g transform={`translate(270 330) scale(${b1 * (1 - 0.08 * press)})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={60} fill="#22C55E" stroke="#0d4a24" strokeWidth={7} />
            <path d="M -40 2 L -8 34 L 46 -30" fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
            <circle r={150 * ripple} fill="none" stroke="#22C55E" strokeWidth={10} opacity={1 - ripple} />
          </g>
          <g transform={`translate(630 330) scale(${b2})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={60} fill="#EF4444" stroke="#5a1010" strokeWidth={7} />
            <path d="M -32 -32 L 32 32 M 32 -32 L -32 32" fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" />
          </g>
        </g>
        {/* hand cursor */}
        <g transform={`translate(${900 - 560 * hand} ${640 - 300 * hand}) translate(0 ${press * 10})`} opacity={hand > 0.02 ? 1 : 0}>
          <path d="M 0 0 L 0 -70 Q 0 -86 16 -86 Q 32 -86 32 -70 L 32 -24 L 40 -28 Q 56 -34 62 -18 L 70 -22 Q 86 -26 90 -10 L 96 -12 Q 112 -14 112 4 L 112 60 Q 112 110 62 120 L 30 120 Q -4 116 -20 86 L -46 30 Q -54 12 -36 6 Q -20 2 -10 16 Z"
            fill="#ffffff" stroke="#16202e" strokeWidth={7} strokeLinejoin="round" transform="rotate(-18)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
