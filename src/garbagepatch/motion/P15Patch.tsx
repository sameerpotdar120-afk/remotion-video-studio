import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, wobble } from './theme';

// p15_patch (the island itself through the video): the creator's trash island (gp01) floating on the map, rising and
// sinking on a slow swell with its own drop shadow. At `dissolveAt` it breaks up (line 8, "ये बन जाते हैं
// microplastic"; the reference's 0:36): it eats away in noisy blotches over `dissolveDur` frames while its colour
// drains, and the microplastic texture (gp02) shows through in a lumpy oval with soft edges, shimmering. `fadeAt`
// fades that speckle down to `fadeTo` (line 10, satellites can't see it); `swellAt` swells the patch 15% with an
// overshoot (line 12, "ये patch बढ़ता ही जाए"). `w`×`h` px, centred in its box.
export const P15Patch: React.FC<{ island: string; texture: string; w?: number; h?: number; dissolveAt?: number; dissolveDur?: number; fadeAt?: number; fadeTo?: number; swellAt?: number; seed?: number }> = ({
  island, texture, w = 520, h = 400, dissolveAt, dissolveDur = 50, fadeAt, fadeTo = 0.18, swellAt, seed = 1,
}) => {
  const f = useCurrentFrame();
  const t = dissolveAt !== undefined ? interpolate(f, [dissolveAt, dissolveAt + dissolveDur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) }) : 0;
  const fade = fadeAt !== undefined ? interpolate(f, [fadeAt, fadeAt + 60], [1, fadeTo], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1;
  const sw = swellAt !== undefined ? interpolate(f, [swellAt, swellAt + 30], [0, 0.15], { ...clamp, easing: Easing.out(Easing.back(2)) }) + 0.03 * wobble(f, swellAt + 30) : 0;
  const breathe = 1 + 0.012 * Math.sin(f / 40 + seed) + sw;
  const thr = -0.1 + 1.1 * t;
  const id = `p15d${seed}`;
  const blob = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2, k = 1 + 0.06 * Math.sin(3 * a + seed) + 0.04 * Math.sin(5 * a + 1.3 + seed) + 0.03 * Math.sin(9 * a + f / 50);
    return `${i ? 'L' : 'M'}${(w / 2 + Math.cos(a) * w * 0.47 * k).toFixed(1)},${(h / 2 + Math.sin(a) * h * 0.47 * k).toFixed(1)}`;
  }).join('') + 'Z';
  const soft = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={seed} result="n" />
          <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 ${(0.5 - 9 * (0.25 + thr * 0.5)).toFixed(3)}`} result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </svg>
      <div style={{ position: 'relative', width: w, height: h, transform: `scale(${breathe})` }}>
        {t > 0 && (
          <div style={{ position: 'absolute', inset: 0, clipPath: `path('${blob}')`, WebkitMaskImage: soft, maskImage: soft, opacity: Math.min(1, t * 1.6) * fade }}>
            <Img src={texture} style={{ position: 'absolute', left: -w * 0.1, top: -h * 0.1, width: w * 1.2, height: h * 1.2, objectFit: 'cover', transform: `translate(${Math.sin(f / 60) * 8}px, ${Math.cos(f / 70) * 8}px)` }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${110 + f}deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)` }} />
          </div>
        )}
        {t < 1 && (
          <Img src={island} style={{ position: 'absolute', inset: 0, width: w, height: h, objectFit: 'contain', transform: `translateY(${Math.sin(f / 30 + seed) * 3}px) rotate(${Math.sin(f / 70) * 0.8}deg)`,
            filter: `${t > 0 ? `url(#${id}) ` : ''}saturate(${1 - 0.8 * t}) drop-shadow(0 10px 14px rgba(0,20,40,0.5))` }} />
        )}
      </div>
    </AbsoluteFill>
  );
};
