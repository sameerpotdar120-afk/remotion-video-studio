import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m08_send_burst: a white paper-plane "send" icon pops in, does a small swoop, with a ring of sparkles.
// 500x500, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08SendBurst: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 10, 16], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const swoop = interpolate(f, [20, 50], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const x = Math.sin(swoop * Math.PI) * 50, y = -Math.sin(swoop * Math.PI * 2) * 24;
  const ring = interpolate(f, [0, 30], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const ringO = interpolate(f, [0, 6, 26, 40], [0, 1, 1, 0], c);
  const float = Math.sin(f / 20) * 6;
  return (
    <AbsoluteFill>
      <svg width={500} height={500} viewBox="-250 -250 500 500">
        <g opacity={ringO}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2, r0 = 60 + ring * 60, r1 = 80 + ring * 110;
            return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={i % 2 ? '#39b4ff' : '#ffd84a'} strokeWidth={9} strokeLinecap="round" />;
          })}
        </g>
        <g transform={`translate(${x} ${y + float}) rotate(${-12 + swoop * 10}) scale(${pop})`} style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }}>
          <path d="M -90 -10 L 100 -80 L 40 90 L 10 20 Z" fill="#ffffff" stroke="#1d2a3a" strokeWidth={8} strokeLinejoin="round" />
          <path d="M 10 20 L 100 -80" stroke="#1d2a3a" strokeWidth={8} strokeLinecap="round" />
          <path d="M 10 20 L 18 70 L 40 90" fill="#dfe8f2" stroke="#1d2a3a" strokeWidth={6} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
