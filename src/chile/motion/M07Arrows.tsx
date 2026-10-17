import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m07_arrows_*: glowing arrows for "can't grow wider → grow longer". 700x1000, 60 fps, 150 frames. Transparent.
//   kind "wider":  a red double arrow pushes out sideways, bonks (shake) on invisible walls, a red ✕ pops, fades.
//   kind "longer": two green arrows stretch out north and south from the centre with a pulse.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Arrow: React.FC<{ len: number; color: string; glow: string }> = ({ len, color, glow }) => (
  <g style={{ filter: `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 4px ${glow})` }}>
    <line x1={0} y1={0} x2={len - 30} y2={0} stroke={color} strokeWidth={22} strokeLinecap="round" />
    <path d={`M ${len - 44} -34 L ${len} 0 L ${len - 44} 34 Z`} fill={color} />
  </g>
);

export const M07Arrows: React.FC<{ kind: 'wider' | 'longer' }> = ({ kind }) => {
  const f = useCurrentFrame();
  if (kind === 'wider') {
    const push = interpolate(f, [0, 18], [30, 150], { ...c, easing: Easing.out(Easing.cubic) });
    const bonk = f > 18 && f < 40 ? Math.sin((f - 18) * 1.6) * 10 * Math.exp(-(f - 18) / 8) : 0;
    const x = interpolate(f, [40, 50, 58], [0, 1.25, 1], c);
    const fade = interpolate(f, [110, 145], [1, 0], c);
    return (
      <AbsoluteFill style={{ opacity: fade }}>
        <svg width={700} height={1000} viewBox="-350 -500 700 1000">
          <g transform={`translate(${bonk} 0)`}><Arrow len={push} color="#fff" glow="#ff2a2a" /></g>
          <g transform={`translate(${-bonk} 0) rotate(180)`}><Arrow len={push} color="#fff" glow="#ff2a2a" /></g>
          <circle r={70} fill="#ff2a2a" opacity={0.25 * Math.max(0, 1 - Math.abs(f - 20) / 20)} />
          <g transform={`translate(0 -150) scale(${x})`} style={{ filter: 'drop-shadow(0 0 12px #ff2a2a)' }}>
            <line x1={-40} y1={-40} x2={40} y2={40} stroke="#ff2a2a" strokeWidth={20} strokeLinecap="round" />
            <line x1={40} y1={-40} x2={-40} y2={40} stroke="#ff2a2a" strokeWidth={20} strokeLinecap="round" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  const grow = interpolate(f, [0, 40], [40, 380], { ...c, easing: Easing.out(Easing.cubic) });
  const pulse = 1 + 0.06 * Math.sin(f / 5);
  const fade = interpolate(f, [120, 148], [1, 0], c);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={700} height={1000} viewBox="-350 -500 700 1000">
        <g transform={`rotate(-90) scale(${pulse})`}><Arrow len={grow} color="#eaffea" glow="#39ff5a" /></g>
        <g transform={`rotate(90) scale(${pulse})`}><Arrow len={grow} color="#eaffea" glow="#39ff5a" /></g>
      </svg>
    </AbsoluteFill>
  );
};
