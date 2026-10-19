import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c04_zoom_blur (every scene change in the reference: 10.7, 15.5, 24.6, 64.4, 73.8 s): a fast push into a point with a
// radial (zoom) blur, 4–8 frames, faked with stacked, scaled, fading copies; then the next scene lands and the blur
// clears. Wraps its children; `at` = frame of the peak, `dir` 1 = zoom in, -1 = zoom out, (ox, oy) = the point.
export const C04ZoomBlur: React.FC<{ at?: number; len?: number; dir?: 1 | -1; ox?: number; oy?: number; children?: React.ReactNode }> = ({
  at = 30, len = 10, dir = 1, ox = 540, oy = 960, children,
}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at - len, at, at + len * 0.6], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const push = interpolate(f, [at - len, at], [1, dir > 0 ? 2.4 : 0.42], { ...clamp, easing: Easing.in(Easing.cubic) });
  const scene = children ?? <AbsoluteFill style={{ background: 'repeating-linear-gradient(45deg,#1b4f7a 0 60px,#c8a86a 60px 120px)' }} />;
  const n = 7;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {Array.from({ length: n }, (_, i) => {
        const s = f < at ? push * (1 + k * 0.05 * i) : 1 + k * 0.08 * i * dir;
        return (
          <AbsoluteFill key={i} style={{ transform: `scale(${s})`, transformOrigin: `${ox}px ${oy}px`, opacity: i === 0 ? 1 : k * (0.5 / (i + 0.5)), filter: k > 0.05 ? `blur(${k * 2 * i}px)` : undefined }}>
            {scene}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${ox}px ${oy}px, rgba(255,255,255,${k * 0.25}), rgba(255,255,255,0) 60%)` }} />
    </AbsoluteFill>
  );
};
