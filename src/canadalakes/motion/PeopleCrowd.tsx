import React from 'react';
import { random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Reference 37.6–43.3 s: white person icons pop into a loose crowd (hunters, loggers, locals), 2 frames apart, each a
 *  springy rise from below with a soft shadow, then a gentle idle bob. */
const Person: React.FC<{ h: number }> = ({ h }) => (
  <svg width={h * 0.42} height={h} viewBox="0 0 42 100" style={{ overflow: 'visible' }}>
    <circle cx={21} cy={11} r={10} fill="#fff" />
    <path d="M8 26 Q21 21 34 26 L36 56 L30 56 L29 98 L23 98 L21 64 L19 98 L13 98 L12 56 L6 56 Z" fill="#fff" />
  </svg>
);
export const PeopleCrowd: React.FC<{ x: number; y: number; n?: number; h?: number; spread?: number; every?: number }> = ({ x, y, n = 22, h = 300, spread = 820, every = 2 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const people = Array.from({ length: n }, (_, i) => ({ i, dx: (random(`px${i}`) - 0.5) * spread, dy: (random(`py${i}`) - 0.5) * spread * 0.9 }))
    .sort((a, b) => a.dy - b.dy);
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {people.map(({ i, dx, dy }) => {
        const p = spring({ frame: f - i * every, fps, config: { damping: 11, stiffness: 180 } });
        const bob = Math.sin((f + i * 7) / 9) * 3;
        const sc = 0.82 + (dy / spread + 0.5) * 0.3;
        return (
          <div key={i} style={{ position: 'absolute', left: dx, top: dy + (1 - p) * 60 + bob, opacity: Math.min(1, p * 1.4), transform: `translate(-50%,-100%) scale(${sc * p})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))' }}>
            <Person h={h} />
          </div>
        );
      })}
    </div>
  );
};
