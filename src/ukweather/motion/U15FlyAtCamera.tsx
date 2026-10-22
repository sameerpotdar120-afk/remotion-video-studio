import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp, TypeOn } from './theme';

// u15_fly_at_camera (line 8, "…बारिश की असली sponsor, Gulf Stream"; the reference's 45.0–46.6 s): the name types in
// white bold on the ocean letter by letter, holds, then at `fly` it scales up hugely toward the camera (×14 in 30 frames,
// ease-in) as the transition to the next shot. Transparent, 1080×1080, 60 fps.
export const U15FlyAtCamera: React.FC<{ text?: string; fly?: number }> = ({ text = 'Gulf Stream', fly = 80 }) => {
  useFonts();
  const f = useCurrentFrame();
  const z = interpolate(f, [fly, fly + 30], [1, 14], { ...clamp, easing: Easing.in(Easing.cubic) });
  const a = 1 - interpolate(f, [fly + 22, fly + 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: a }}>
      <div style={{ transform: `rotate(-4deg) scale(${z})`, fontFamily: UI, fontWeight: 800, fontSize: 120, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 0 30px rgba(0,30,60,0.6)' }}>
        <TypeOn text={text} f={f} step={3} />
      </div>
    </AbsoluteFill>
  );
};
