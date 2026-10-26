import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, idle } from './theme';

// m08_card_flip (line 7, the levadas; line 8–9, the vineyards and today's paradise; the reference's 0:32–0:42): a
// photo card (md09 / md09b / md10 / md12) turns in like a page from its left edge (rotateY from -100° to the card's
// tilt, perspective 1400 px, a moving shadow under it and a highlight sweeping its face as it turns), lands with a
// little overshoot and floats. `fly` = [frame, dx, dy]: it then shrinks, spins and flies to the offset (into the
// island) in 14 frames. Centred in its box; `w` its width.
export const M08CardFlip: React.FC<{ src: string; ratio: number; w?: number; tilt?: number; fly?: [number, number, number]; seed?: number }> = ({ src, ratio, w = 640, tilt = -6, fly, seed = 1 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const ry = -100 * (1 - t);
  const q = fly ? interpolate(f, [fly[0], fly[0] + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const [ix, iy, ir] = idle(f, seed, 0.5);
  const h = w * ratio;
  const sheen = interpolate(f, [2, 18], [-0.4, 1.4], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 1400 }}>
      <div style={{ position: 'relative', width: w + 24, height: h + 24, padding: 12, background: '#FAFAF4', borderRadius: 8, transformOrigin: '0% 50%',
        boxShadow: `${20 + ry * 0.3}px 30px 40px rgba(0,0,0,${0.5 * t}), 0 4px 10px rgba(0,0,0,0.3)`,
        transform: `translate(${ix + (fly ? fly[1] * q : 0)}px, ${iy + (fly ? fly[2] * q : 0)}px) rotateY(${ry}deg) rotate(${tilt + ir + q * 40}deg) scale(${1 - 0.9 * q})`, opacity: Math.min(1, t * 4) }}>
        <div style={{ width: w, height: h, overflow: 'hidden', borderRadius: 3, position: 'relative' }}>
          <Img src={src} style={{ width: w, height: h, objectFit: 'cover', transform: `scale(${1.1 - 0.06 * Math.min(1, f / 240)})` }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 100 - 20}%, rgba(255,255,255,0.35) ${sheen * 100}%, rgba(255,255,255,0) ${sheen * 100 + 20}%)` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
