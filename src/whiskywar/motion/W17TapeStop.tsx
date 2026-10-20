import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// w17_tape_stop (line 9, "नहीं।"; our own beat between the war fake-out and the second visit): the scene freezes,
// drains to grey, gets VHS tracking lines and a big rewind ⏪ chip, then snaps back to colour. Wrap the scene as
// `children`. 1080×1920, 60 fps, 40 frames.
export const W17TapeStop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 4, 30, 40], [0, 1, 1, 0], clamp);
  const jitter = Math.sin(f * 2.3) * 6 * k;
  const scene = children ?? <AbsoluteFill style={{ background: 'linear-gradient(180deg, #9FB8C2, #8C7B66)' }} />;
  const chip = interpolate(f, [2, 8, 30, 36], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${k}) contrast(${1 + 0.3 * k})`, transform: `translateX(${jitter}px) scale(${1 + 0.02 * k})` }}>{scene}</AbsoluteFill>
      {k > 0.05 && (
        <AbsoluteFill style={{ opacity: k * 0.6, background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0 ${9 + (f % 3)}px, rgba(255,255,255,0.18) ${9 + (f % 3)}px ${11 + (f % 3)}px)` }} />
      )}
      {k > 0.05 && <AbsoluteFill style={{ top: 300 + ((f * 37) % 1300), height: 40, background: 'rgba(255,255,255,0.25)', filter: 'blur(4px)', opacity: k }} />}
      {chip > 0 && (
        <div style={{ position: 'absolute', left: 540, top: 700, transform: `translate(-50%,-50%) scale(${chip})`, background: 'rgba(0,0,0,0.65)', borderRadius: 30, padding: '10px 40px',
          color: '#fff', fontSize: 120, fontFamily: 'sans-serif' }}>⏪</div>
      )}
    </AbsoluteFill>
  );
};
