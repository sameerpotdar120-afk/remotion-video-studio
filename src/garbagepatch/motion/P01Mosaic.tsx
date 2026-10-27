import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p01_mosaic (line 1–2, the reference's 0:00–0:08): the island first shows as a censor mosaic, big square cells with
// the colours of the creator's trash island (gp01) averaged inside them, masked to a soft oval; at `reveal` the cells
// shrink (22 → 1 px over `dur` frames, ease-in) and the real image sharpens out of them with a quick crossfade, like
// the reference's "because it's made of trash". `pixelAt` runs it backwards (the loop's end: the island breaks back
// into cells for frame 0). Drawn on a canvas so the cells stay hard-edged. `w`×`h`, centred.
export const P01Mosaic: React.FC<{ src: string; w?: number; h?: number; reveal?: number; dur?: number; cell?: number; pixelAt?: number }> = ({ src, w = 600, h = 600, reveal = 60, dur = 30, cell = 22, pixelAt }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [handle] = useState(() => delayRender('p01 image'));
  useEffect(() => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => setImg(im);
    im.onerror = () => continueRender(handle);
    im.src = src;
  }, [src, handle]);
  const t = interpolate(f, [reveal, reveal + dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) *
    (pixelAt !== undefined ? 1 - interpolate(f, [pixelAt, pixelAt + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) }) : 1);
  const size = Math.max(1, Math.round(cell * (1 - t) + t));
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !img) return;
    const sw = Math.max(1, Math.round(w / size)), sh = Math.max(1, Math.round(h / size));
    cv.width = sw;
    cv.height = sh;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(img, 0, 0, sw, sh);
    if (!done.current) { done.current = true; continueRender(handle); }
  }, [img, size, w, h, handle]);
  const crisp = interpolate(t, [0.6, 1], [0, 1], clamp);
  const mask = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 78%, transparent 100%)';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: w, height: h, WebkitMaskImage: crisp < 1 ? mask : undefined, maskImage: crisp < 1 ? mask : undefined }}>
        <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h, imageRendering: 'pixelated', opacity: 1 - crisp }} />
        {crisp > 0 && <Img src={src} style={{ position: 'absolute', inset: 0, width: w, height: h, objectFit: 'contain', opacity: crisp }} />}
      </div>
    </AbsoluteFill>
  );
};
