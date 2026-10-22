import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp } from './theme';

// u10_giant_word (line 5, "वजह है गर्म मौसम"; the reference's 31.0–32.7 s "TROPICAL CLIMATE"): a giant word wipes in from
// the left, so large it is cropped by the frame, colour-shifting light blue → white, and settles to a title across the
// country with a pink-red gradient band behind it and thin white isobar curves sweeping across the screen; fades at
// `out`. Transparent, 1080×1920, 60 fps; the title sits at y = `y`.
export const U10GiantWord: React.FC<{ text?: string; y?: number; out?: number }> = ({ text = 'गर्म मौसम', y = 980, out = 100 }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = 1 - interpolate(f, [out, out + 12], [0, 1], clamp);
  const band = interpolate(f, [8, 26], [0, 1], clamp) * a;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ top: y - 380, height: 760, background: 'linear-gradient(180deg, rgba(255,60,90,0), rgba(255,60,90,0.45) 35%, rgba(255,120,60,0.45) 65%, rgba(255,120,60,0))', opacity: band, mixBlendMode: 'screen' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: band }}>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M -100 ${y - 300 + i * 170 + Math.sin(f / 20 + i) * 20} C 300 ${y - 420 + i * 170} 700 ${y - 160 + i * 170} 1180 ${y - 320 + i * 170}`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.55} />)}
      </svg>
      <div style={{ position: 'absolute', left: 540 + (1 - k) * -900, top: y, transform: `translate(-50%,-50%) translate(${Math.sin(f / 40) * 12}px, ${Math.sin(f / 31) * 6}px) rotate(${Math.sin(f / 50) * 1.2}deg) scale(${(3.4 - 2.4 * k) * (1 + 0.02 * Math.sin(f / 16))})`, filter: k < 0.9 ? `blur(${((1 - k) * 8).toFixed(1)}px)` : undefined, fontFamily: UI, fontWeight: 800, fontSize: 130,
        color: `rgb(${Math.round(150 + 105 * k)},${Math.round(220 + 35 * k)},255)`, whiteSpace: 'nowrap', letterSpacing: 4, textShadow: '0 0 24px rgba(255,80,120,0.7), 0 6px 0 rgba(0,0,0,0.3)' }}>{text}</div>
    </AbsoluteFill>
  );
};
