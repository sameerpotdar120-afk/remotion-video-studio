import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useAnton } from './font';
import { clamp, wobble } from './theme';

// h03_slam (line 3, "बात है 1337 की"; the reference's 13.3–13.8 s): big white heavy numerals slam in from the top-left,
// oversized, tilted and motion-blurred, settle in about 0.4 s with an overshoot, then punch once more (`punch`).
// Transparent, 1080×700, 60 fps, 150 frames.
export const H03Slam: React.FC<{ text?: string; punch?: number }> = ({ text = '1337', punch = 80 }) => {
  useAnton();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const blur = interpolate(f, [0, 14], [14, 0], clamp);
  const pk = f >= punch ? 1 + wobble(f, punch, 3, 7) * 0.12 : 1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: NUM, fontSize: 300, color: '#F7F7F2', WebkitTextStroke: '10px #2A2A2A', paintOrder: 'stroke fill', letterSpacing: 6,
        transform: `translate(${(1 - k) * -620}px, ${(1 - k) * -520}px) scale(${(2.4 - 1.4 * k) * pk}) rotate(${(1 - k) * -22 + 4}deg) skewX(-6deg)`,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined, textShadow: '10px 16px 0 rgba(0,0,0,0.3), 0 24px 50px rgba(0,0,0,0.45)' }}>{text}</div>
    </AbsoluteFill>
  );
};
