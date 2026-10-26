import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { C } from './theme';

// m13_embers (line 4, the long fire; line 11, the loop's close: "उसकी कहानी… आग से"): glowing embers drift up through
// the frame, each wobbling on its own path, flickering and fading, near ones bigger and soft. `amount` 0..1. It
// wraps seamlessly (loops at `period` frames), so it can run under the loop's last and first frames. Transparent.
export const M13Embers: React.FC<{ amount?: number; period?: number }> = ({ amount = 1, period = 600 }) => {
  const f = useCurrentFrame() % period;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      <svg width={1080} height={1920}>
        {Array.from({ length: Math.round(70 * amount) }, (_, i) => {
          const sp = 1 + Math.floor(random(`v${i}`) * 3);
          const t = ((f * sp) / period + random(`t${i}`)) % 1;
          const x = random(`x${i}`) * 1080 + Math.sin(t * Math.PI * 2 * sp + i) * 30;
          const y = 1980 - t * 2100;
          const r = 1.5 + random(`r${i}`) * 4;
          const fl = 0.6 + 0.4 * Math.sin((f * sp * 2 * Math.PI) / period * 9 + i);
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? C.ember : C.fireHot} opacity={fl * Math.sin(t * Math.PI)} style={{ filter: r > 4 ? 'blur(1.5px)' : undefined }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
