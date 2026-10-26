import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// m07_sprout (line 5–6, the sugar cane: "चीनी उगाने लगा", then "पूरा धंधा Brazil चला गया"; the reference's 0:26–0:32):
// the creator's sugar cane clumps (md06) shoot up out of the ground at `pts` (screen px), one after another in a
// shuffled order `step` frames apart, stretching up from their base with an overshoot and a little wobble, then
// swaying. `sink` (frame) sends them back down into the ground one by one (squashing and sliding below their base
// line, which hides them). Transparent, 1080×1920, 60 fps.
export const M07Sprout: React.FC<{ pts: [number, number][]; src: string; size?: number; step?: number; sink?: number }> = ({ pts, src, size = 90, step = 3, sink }) => {
  const f = useCurrentFrame();
  const order = pts.map((_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
  return (
    <AbsoluteFill>
      {pts.map(([x, y], i) => {
        const at = order.indexOf(i) * step;
        const g = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
        const down = sink !== undefined ? interpolate(f, [sink + order.indexOf(i) * 2, sink + order.indexOf(i) * 2 + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
        if (g <= 0 || down >= 1) return null;
        const w = size * (0.8 + random(`s${i}`) * 0.4);
        const sway = Math.sin(f / 23 + x / 60) * 3;
        return (
          <div key={i} style={{ position: 'absolute', left: x - w / 2, top: y - w, width: w, height: w, overflow: 'hidden' }}>
            <Img src={src} style={{ width: w, height: w, objectFit: 'contain', transformOrigin: '50% 100%', transform: `translateY(${down * w}px) scale(${1 + 0.1 * (1 - g)}, ${g}) skewX(${sway}deg)`,
              filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.4))' }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
