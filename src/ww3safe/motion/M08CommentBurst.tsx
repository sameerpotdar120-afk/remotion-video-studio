import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m08_comment_burst: blue sparkle burst, then a white comment bubble with a "?" pops in with a wobble while
// red and blue confetti dashes fly out. The bubble then floats gently.
// 600x600, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08CommentBurst: React.FC = () => {
  const f = useCurrentFrame();
  const spark = interpolate(f, [0, 18], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const sparkO = interpolate(f, [0, 4, 18, 26], [0, 1, 1, 0], c);
  const pop = interpolate(f, [12, 22, 30], [0, 1.22, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wob = f < 50 ? Math.sin((f - 12) / 3.2) * 12 * Math.exp(-(f - 12) / 14) * (f > 12 ? 1 : 0) : 0;
  const float = Math.sin(f / 24) * 6;
  const conf = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.3;
    const t = interpolate(f, [14, 60], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
    const dist = 120 + t * (110 + random(`d${i}`) * 80);
    return { a, x: Math.cos(a) * dist, y: Math.sin(a) * dist, o: interpolate(f, [14, 18, 50, 66], [0, 1, 1, 0], c), col: i % 2 ? '#ff2d55' : '#2f8cff' };
  });
  return (
    <AbsoluteFill>
      <svg width={600} height={600} viewBox="-300 -300 600 600">
        <g opacity={sparkO}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r0 = 30 + spark * 80, r1 = 60 + spark * 150;
            return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1}
              stroke="#39b4ff" strokeWidth={10 * (1 - spark) + 3} strokeLinecap="round" />;
          })}
        </g>
        {conf.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={p.x + Math.cos(p.a) * 22} y2={p.y + Math.sin(p.a) * 22}
            stroke={p.col} strokeWidth={9} strokeLinecap="round" opacity={p.o} />
        ))}
        <g transform={`translate(0 ${float}) rotate(${wob}) scale(${pop})`} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.35))' }}>
          <path d="M-120,-95 Q-120,-125 -90,-125 L90,-125 Q120,-125 120,-95 L120,45 Q120,75 90,75 L-20,75 L-70,120 L-60,75 L-90,75 Q-120,75 -120,45 Z"
            fill="#ffffff" />
          <path d="M-28,-48 Q-28,-88 2,-88 Q34,-88 34,-56 Q34,-34 12,-24 Q2,-19 2,-4 L2,6" fill="none" stroke="#1d2a3a" strokeWidth={20}
            strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={2} cy={40} r={12} fill="#1d2a3a" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
