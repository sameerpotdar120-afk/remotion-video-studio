import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m14_pin_pulse: the reference's place pin: a glowing dot drops in with a ring, then rings keep pulsing out from it
// (three, staggered). Colour by prop. Loops from frame 60 every 60 frames. 420x420, 60 fps, 240 frames. Transparent.

export const M14PinPulse: React.FC<{ color?: string }> = ({ color = '#FF2B3A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 7, stiffness: 200, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <svg width={420} height={420} viewBox="0 0 420 420">
        {[0, 20, 40].map((d) => {
          const p = (((f - d) % 60) + 60) % 60 / 60;
          return f >= d ? <circle key={d} cx={210} cy={210} r={30 + p * 170} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 2} opacity={(1 - p) * 0.8} /> : null;
        })}
        <g transform={`translate(210 210) scale(${pop})`}>
          <circle r={58} fill={color} opacity={0.35} style={{ filter: 'blur(10px)' }} />
          <circle r={40} fill="#ffffff" />
          <circle r={28} fill={color} />
          <circle r={11} fill="#ffffff" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
