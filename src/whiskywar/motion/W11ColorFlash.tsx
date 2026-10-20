import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// w11_color_flash (every era change; the reference's 25.5, 38.4, 54.2, 58.2 s): an overexposed colour wash between
// scenes: red → orange → yellow-white → magenta → violet, peaking white at `peak`, drawn with screen blend and a soft
// light leak sweeping across. Transparent, 1080×1920, 60 fps, 40 frames; put the cut at `peak`.
export const W11ColorFlash: React.FC<{ peak?: number }> = ({ peak = 16 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, peak - 4, peak, peak + 6, 40], [0, 0.85, 1, 0.8, 0], clamp);
  const col = interpolateColors(f, [0, 8, 14, 20, 28, 40], ['#E8262B', '#FF8A1E', '#FFF6B8', '#FF4FD8', '#7B4CFF', '#3A2B8A']);
  const sweep = interpolate(f, [0, 40], [-400, 1400], clamp);
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: a }}>
      <AbsoluteFill style={{ background: col }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at ${sweep}px 700px, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)` }} />
    </AbsoluteFill>
  );
};
