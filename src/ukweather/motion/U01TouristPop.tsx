import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { P0, Tourist } from './Tourist';
import { clamp, idle, pop, ramp, wobble } from './theme';

// u01_tourist_pop (line 2, "सोचो, तुम Mumbai की गर्मी से London गए"; the reference's 0.23–0.63 s): the tourist pops onto the
// map from a dot (overshoot ~1.12 at frame 12, squash on landing), sweating from the Mumbai heat; the furled umbrella
// hangs at his side and at `open` it swings up and snaps open overhead in 4 frames with a 2-frame bounce; then a slow
// bob. Transparent, 800×1000, 60 fps; his feet at (400, 960).
export const U01TouristPop: React.FC<{ open?: number }> = ({ open = 40 }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 16, 2.2);
  const land = 1 - wobble(f, 16, 3, 6) * 0.1;
  const swing = interpolate(f, [open, open + 8], [70, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const o = ramp(f, open + 4, open + 12, Easing.out(Easing.back(2.5)));
  const bob = 1 + 0.03 * Math.sin(f / 13);
  const [ix, iy, ir] = idle(f, 1, 0.8);
  const swayArm = Math.sin(f / 11) * 4 + wobble(f, open + 12, 2.6, 3) * 12;
  return (
    <AbsoluteFill>
      <svg width={800} height={1000}>
        <g transform={`translate(${400 + ix} ${960 + iy}) rotate(${ir}) scale(${0.62 * s * bob})`}>
          <Tourist f={f} pose={{ ...P0, umbrella: f >= open + 4 ? 'open' : 'closed', open: o, arm: swing + swayArm, squash: land, tilt: Math.sin(f / 23) * 6, lean: Math.sin(f / 31) * 2, sweat: f < open ? 1 : 0, mouth: f < open ? 'worried' : 'smile' }} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
