import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Reference 16.2–19.9 s: hundreds of "???" labels pop over the lakes one after another (each a 6-frame overshoot pop),
 *  hold, then all fly to the centre and shrink into one block that fades. Text-free apart from the question marks. */
export const QuestionStorm: React.FC<{ n?: number; popEvery?: number; collapseAt?: number; color?: string; font?: string }> = ({
  n = 220, popEvery = 0.35, collapseAt = 70, color = '#fff', font = 'Anton, Impact, sans-serif',
}) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const k = spring({ frame: f - collapseAt, fps, config: { damping: 16, stiffness: 90 } });
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const t0 = i * popEvery;
        const pop = spring({ frame: f - t0, fps, config: { damping: 9, stiffness: 220 } });
        if (f < t0) return null;
        const x = random(`x${i}`) * width, y = (0.08 + random(`y${i}`) * 0.84) * height;
        const cx = width / 2 + (random(`cx${i}`) - 0.5) * 160, cy = height / 2 + (random(`cy${i}`) - 0.5) * 240;
        const s = interpolate(k, [0, 1], [1, 0.32]) * pop;
        const op = interpolate(f, [collapseAt + 18, collapseAt + 34], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{ position: 'absolute', left: interpolate(k, [0, 1], [x, cx]), top: interpolate(k, [0, 1], [y, cy]), transform: `translate(-50%,-50%) scale(${s}) rotate(${(random(`r${i}`) - 0.5) * 16}deg)`,
            fontFamily: font, fontSize: 46 + random(`s${i}`) * 26, color, opacity: op, textShadow: '0 3px 8px rgba(0,0,0,0.65)', letterSpacing: -2 }}>???</div>
        );
      })}
    </AbsoluteFill>
  );
};
