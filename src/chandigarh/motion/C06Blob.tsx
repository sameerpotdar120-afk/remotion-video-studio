import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// c06_blob (line 4, the chosen land and the temple; the reference's 0:15.6 and 0:23.2): a rough, paper-cut blob at
// `at` (radius `r`, screen px). `gold`: it fades in faint then firms up to solid gold (the creator's gold texture
// cg23, or flat gold) with a lifted shadow, its ragged edge settling (30 frames). `reveal`: at `grow` the blob fills
// with the creator's image (the temple) and then grows organically, its edge boiling, until it covers the frame
// (28 frames), so the next shot is the image. Transparent until the reveal covers the frame.
const blobPts = (cx: number, cy: number, r: number, f: number, rough: number) => Array.from({ length: 90 }, (_, i) => {
  const a = (i / 90) * Math.PI * 2;
  const k = 1 + rough * (0.06 * Math.sin(5 * a + 1.1) + 0.045 * Math.sin(9 * a + f / 9) + 0.03 * Math.sin(17 * a - f / 7) + 0.02 * Math.sin(29 * a + 2));
  return [cx + Math.cos(a) * r * k * 1.08, cy + Math.sin(a) * r * k * 0.92];
});
export const C06Blob: React.FC<{ at: [number, number]; r?: number; mode?: 'gold' | 'reveal'; texture?: string; image?: string; grow?: number; out?: number }> = ({ at, r = 110, mode = 'gold', texture, image, grow = 20, out }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 10, 30], [0, 0.35, 1], clamp) * (out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1);
  if (a <= 0) return null;
  const g = mode === 'reveal' ? interpolate(f, [grow, grow + 28], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const fillIn = mode === 'reveal' ? interpolate(f, [0, grow], [0, 1], clamp) : 0;
  const R = r * (1 + g * 16);
  const settle = interpolate(f, [0, 30], [1.8, 1], clamp);
  const pts = blobPts(at[0], at[1], R, f, settle + g * 1.5);
  const poly = `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
  const shadow = pts.map(([x, y]) => `${(x + 6).toFixed(1)}px ${(y + 10).toFixed(1)}px`).join(',');
  return (
    <AbsoluteFill style={{ opacity: a }}>
      {g < 0.3 && <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(${shadow})`, background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)' }} />}
      <div style={{ position: 'absolute', inset: 0, clipPath: poly, background: texture ? undefined : C.site }}>
        {texture && <Img src={texture} style={{ position: 'absolute', left: at[0] - r * 1.6, top: at[1] - r * 1.6, width: r * 3.2, height: r * 3.2, objectFit: 'cover' }} />}
        {image && fillIn > 0 && <Img src={image} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', opacity: fillIn, transform: `scale(${1.15 - 0.1 * g})` }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.25), rgba(255,255,255,0) 40%)', opacity: 1 - g }} />
      </div>
    </AbsoluteFill>
  );
};
