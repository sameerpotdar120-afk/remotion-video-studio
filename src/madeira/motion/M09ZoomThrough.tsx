import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, idle } from './theme';

// m09_zoom_through (line 8, "बनी Madeira wine"; the reference's 0:42–0:46): the creator's wine bottle (md11) pops up
// in front of the island (0 → 1 with a back-ease bounce in 12 frames), a light sweep slides down the glass, it floats,
// then at `through` it rushes at the camera (scale ×9 in 16 frames, ease-in, with motion blur), so the next shot can
// cut in behind it. `h` its height in px; centred in its box.
export const M09ZoomThrough: React.FC<{ src: string; ratio: number; h?: number; through?: number }> = ({ src, ratio, h = 900, through }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const z = through !== undefined ? interpolate(f, [through, through + 16], [1, 9], { ...clamp, easing: Easing.in(Easing.cubic) }) : 1;
  const zb = through !== undefined ? interpolate(f, [through, through + 16], [0, 14], clamp) : 0;
  const [ix, iy, ir] = idle(f, 6, 0.4);
  const w = h / ratio;
  const sheen = ((f % 120) / 120) * 1.6 - 0.3;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: w, height: h, transform: `translate(${ix}px, ${iy}px) rotate(${ir}deg) scale(${s * z})`, filter: zb > 0.5 ? `blur(${zb}px)` : undefined }}>
        <Img src={src} style={{ width: w, height: h, filter: 'drop-shadow(0 24px 24px rgba(0,0,0,0.55))' }} />
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${src})`, WebkitMaskSize: '100% 100%', maskImage: `url(${src})`, maskSize: '100% 100%', mixBlendMode: 'screen',
          background: `linear-gradient(170deg, rgba(255,255,255,0) ${sheen * 100 - 12}%, rgba(255,240,220,0.5) ${sheen * 100}%, rgba(255,255,255,0) ${sheen * 100 + 12}%)` }} />
      </div>
    </AbsoluteFill>
  );
};
