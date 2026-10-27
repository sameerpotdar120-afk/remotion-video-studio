import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p29_prop_path (line 2, debris bursting out of the island and falling back; line 6, the ghost net drifting across;
// line 12, the bottle that drifts out, hits the current and bounces back in): one of the creator's props moves through
// keyframes `keys` = [frame, x, y, rotation°, scale] (screen px), eased between each pair (ease-in-out, or a back-ease
// bounce where `bounce` is set), bobbing a little on the water, with a soft shadow. Transparent, 1080×1920.
export const P29PropPath: React.FC<{ src: string; keys: [number, number, number, number, number][]; w?: number; bounce?: boolean; bob?: number }> = ({ src, keys, w = 120, bounce = false, bob = 4 }) => {
  const f = useCurrentFrame();
  if (f < keys[0][0]) return null;
  let i = keys.findIndex((k, j) => j < keys.length - 1 && f >= k[0] && f < keys[j + 1][0]);
  if (i < 0) i = keys.length - 2;
  const [a, b] = [keys[i], keys[i + 1]];
  const t = interpolate(f, [a[0], b[0]], [0, 1], { ...clamp, easing: bounce ? Easing.out(Easing.back(2.2)) : Easing.inOut(Easing.cubic) });
  const v = (n: number) => a[n] + (b[n] - a[n]) * t;
  const s = v(4);
  if (s <= 0.01) return null;
  return (
    <AbsoluteFill>
      <Img src={src} style={{ position: 'absolute', left: v(1) - w / 2, top: v(2) - w / 2 + Math.sin(f / 14) * bob, width: w, height: w, objectFit: 'contain', transform: `rotate(${v(3) + Math.sin(f / 20) * 6}deg) scale(${s})`,
        filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))' }} />
    </AbsoluteFill>
  );
};
