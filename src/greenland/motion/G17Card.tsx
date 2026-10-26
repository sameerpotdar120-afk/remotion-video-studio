import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, idle, pop } from './theme';

// g17_card (line 2, "हरी-भरी, गरम पानी के झरनों वाली ज़मीन": the creator's Iceland photos, gl06 / gl06b / gl06c; line
// 5, the snowed-in hut, gl07, on a card too): a photo print with a white border flies in from `from` (px offset) on a
// spring with a little spin, lands at `rot`, casts a soft shadow, and the photo inside slowly pushes in (Ken Burns).
// `out` throws it off the other way in 10 frames. Centred in its box; `w` its width.
export const G17Card: React.FC<{ src: string; ratio: number; w?: number; rot?: number; from?: [number, number]; out?: number; seed?: number; contain?: boolean }> = ({
  src, ratio, w = 640, rot = -4, from = [700, 200], out, seed = 2, contain,
}) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 1.6);
  const o = out !== undefined ? interpolate(f, [out, out + 10], [0, 1], { ...clamp, easing: (x) => x * x }) : 0;
  const [ix, iy, ir] = idle(f, seed, 0.45);
  const x = from[0] * (1 - s) - from[0] * 1.4 * o, y = from[1] * (1 - s) + 260 * o;
  const h = w * ratio;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: w + 28, height: h + 28, padding: 14, background: contain ? 'transparent' : '#FAFAF6', borderRadius: 10, boxShadow: contain ? 'none' : '0 26px 40px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.3)',
        transform: `translate(${x + ix}px, ${y + iy}px) rotate(${rot + (1 - s) * 18 + o * -30 + ir}deg) scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 3) * (1 - o) }}>
        <div style={{ width: w, height: h, overflow: 'hidden', borderRadius: 4 }}>
          <Img src={src} style={{ width: w, height: h, objectFit: contain ? 'contain' : 'cover', transform: `scale(${1.12 - 0.08 * Math.min(1, f / 300)})`, filter: contain ? 'drop-shadow(0 18px 18px rgba(0,0,0,0.45))' : undefined }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
