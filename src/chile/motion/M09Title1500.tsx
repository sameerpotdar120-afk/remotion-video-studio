import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m09_title_1500: an old-map serif title "1500 AD" that starts huge (3×) and settles over the vintage map, ink colour,
// slight letter spacing, with a thin rule under it. 1080x400, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M09Title1500: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 30], [3, 1], { ...c, easing: Easing.out(Easing.exp) });
  const o = interpolate(f, [0, 6], [0, 1], c);
  const rule = interpolate(f, [24, 48], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${s})`, opacity: o, textAlign: 'center' }}>
        <div style={{ fontFamily: '"Cinzel", "Trajan Pro", Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: 150, letterSpacing: 14, color: '#f3ead6',
          textShadow: '0 4px 0 rgba(60,40,20,0.35), 0 8px 24px rgba(0,0,0,0.45)' }}>1500 AD</div>
        <div style={{ height: 6, width: 560, margin: '6px auto 0', background: '#f3ead6', transform: `scaleX(${rule})`, borderRadius: 3, opacity: 0.85 }} />
      </div>
    </AbsoluteFill>
  );
};
