import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';

// p34_waves (line 8, "और लहरें"): the creator's breaking wave (gp12) rises and breaks again and again at points round
// the patch's edge (on an oval round `at`, radii `rx`×`ry`): each wave grows up from its base (scaleY 0 → 1), leans
// forward as it curls, then collapses into a burst of white foam dots, staggered so one is always breaking; waves on
// the left are mirrored to face the patch. Transparent, 1080×1920.
export const P34Waves: React.FC<{ src: string; at: [number, number]; rx?: number; ry?: number; n?: number; w?: number; period?: number }> = ({ src, at, rx = 300, ry = 220, n = 6, w = 220, period = 50 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const ang = (i / n) * Math.PI * 2 + 0.4, x = at[0] + Math.cos(ang) * rx, y = at[1] + Math.sin(ang) * ry;
        const p = ((f + random(`w${i}`) * period) % period) / period;
        const rise = p < 0.55 ? p / 0.55 : 1, fall = p > 0.55 ? (p - 0.55) / 0.45 : 0;
        const dir = Math.cos(ang) > 0 ? -1 : 1;
        const h = w * 0.56;
        return (
          <React.Fragment key={i}>
            <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, objectFit: 'contain', transformOrigin: '50% 100%',
              transform: `scale(${dir}, ${rise * (1 - fall)}) skewX(${-12 * rise}deg)`, opacity: 1 - fall * 0.6 }} />
            {fall > 0 && (
              <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x + (random(`f${i}${k}`) - 0.5) * w * (0.4 + fall)} cy={y - fall * 30 * random(`g${i}${k}`)} r={4 + 4 * random(`h${i}${k}`)} fill="#fff" opacity={(1 - fall) * 0.85} />)}
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
