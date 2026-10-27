import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p26_magnifier (line 8, "ये बन जाते हैं microplastic"): the creator's magnifying glass (gp14) slides in from `from` to
// `to` (screen px, the lens centre) in 20 frames (back-ease), then hovers in a small circle; inside the lens the
// microplastic texture (gp02) shows enlarged 3×, sliding as the lens moves, with a glass highlight. `lens` gives the
// lens centre and radius inside the prop image as fractions of its width; the lens is drawn over the image's white glass. Transparent, 1080×1920.
export const P26Magnifier: React.FC<{ glass: string; texture: string; from?: [number, number]; to: [number, number]; w?: number; lens?: [number, number, number]; out?: number }> = ({
  glass, texture, from = [1300, 1500], to, w = 420, lens = [0.36, 0.36, 0.3], out,
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const q = out !== undefined ? interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const hx = Math.cos(f / 25) * 18, hy = Math.sin(f / 25) * 12;
  const cx = from[0] + (to[0] - from[0]) * t + hx + q * 700, cy = from[1] + (to[1] - from[1]) * t + hy + q * 500;
  const r = w * lens[2];
  const left = cx - w * lens[0], top = cy - w * lens[1];
  return (
    <AbsoluteFill>
      <Img src={glass} style={{ position: 'absolute', left, top, width: w, height: w, objectFit: 'contain', filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.5))' }} />
      <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }}>
        <Img src={texture} style={{ position: 'absolute', left: -cx * 0.5 - 300, top: -cy * 0.5 - 300, width: 1800, height: 1800, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%)' }} />
      </div>
    </AbsoluteFill>
  );
};
