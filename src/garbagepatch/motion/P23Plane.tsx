import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p23_plane (the reference's small plane crossing over Alaska at 0:01 and 0:31–0:40, an ambient prop): the creator's
// airliner seen from above (gp09) flies straight from `from` to `to` (screen px) over `dur` frames, nose first, with
// its soft shadow on the ground below and to the right. Transparent, 1080×1920.
export const P23Plane: React.FC<{ src: string; from: [number, number]; to: [number, number]; dur?: number; w?: number; shadow?: [number, number] }> = ({ src, from, to, dur = 300, w = 70, shadow = [26, 34] }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], clamp);
  const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t;
  const a = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI + 90;
  const op = interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp);
  const st = (dx: number, dy: number, extra: React.CSSProperties) => (
    <Img src={src} style={{ position: 'absolute', left: x - w / 2 + dx, top: y - w / 2 + dy, width: w, height: w, objectFit: 'contain', transform: `rotate(${a}deg)`, opacity: op, ...extra }} />
  );
  return (
    <AbsoluteFill>
      {st(shadow[0], shadow[1], { filter: 'brightness(0) blur(2px)', opacity: op * 0.45 })}
      {st(0, 0, { filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' })}
    </AbsoluteFill>
  );
};
