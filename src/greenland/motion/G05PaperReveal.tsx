import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// g05_paper_reveal (line 4, "9वीं सदी में…"; the reference's hard cut to the old paper map): the 9th-century paper map
// (`children`, e.g. the atlantic_paper plate through the camera) slides over the satellite map from the right in
// `dur` frames with a torn paper edge (the creator's parchment, gl13, multiplied over it) (a jagged, fibrous rim with a cast shadow), so it reads as a page laid over the
// present day. Then a slow vignette breathes on the paper. Opaque where the paper is; 1080×1920, 60 fps.
export const G05PaperReveal: React.FC<{ children: React.ReactNode; dur?: number; seed?: string; parchment?: string }> = ({ children, dur = 16, seed = 'p', parchment }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, dur], [1180, -120], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pts = Array.from({ length: 49 }, (_, i) => {
    const y = (i / 48) * 1960 - 20;
    return `${x + (random(`${seed}${i}`) - 0.5) * 34 + Math.sin(i * 1.7) * 10},${y}`;
  });
  const edge = `M ${x + 2000},-20 L ${pts.join(' L ')} L ${x + 2000},1940 Z`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}><defs><clipPath id={`g05c${seed}`}><path d={edge} /></clipPath></defs></svg>
      <AbsoluteFill style={{ filter: 'drop-shadow(-14px 0 18px rgba(40,20,0,0.55))' }}>
        <AbsoluteFill style={{ clipPath: `url(#g05c${seed})` }}>
          {children}
          {/* the creator's parchment (gl13) laid over the drawn map: stains, fibres, burnt edges */}
          {parchment && <Img src={parchment} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.6 }} />}
          {/* the torn fibre rim: a lighter, rough band along the edge */}
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#F8EED6" strokeWidth={10} strokeLinejoin="round" opacity={0.9} />
          </svg>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(70,40,10,${0.32 + 0.05 * Math.sin(f / 40)}) 100%)` }} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
