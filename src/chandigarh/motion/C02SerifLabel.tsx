import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { SERIF, UI, useFonts } from './font';
import { clamp, graphemes } from './theme';

// c02_serif_label (the reference's engraved map names, "INDIA", "PUNJAB", and our "1947"): wide-tracked classical
// serif capitals with an engraved gradient (white to soft grey, or `tone` "dark" for brown on the yellow fill), a soft
// shadow; the letters fade up and close their tracking from wide to normal over 20 frames, one after another.
// Devanagari text uses Baloo 2 in the same treatment. `out` fades it. Centred in its box; transparent.
export const C02SerifLabel: React.FC<{ text: string; size?: number; tone?: 'light' | 'dark' | 'gold'; out?: number; step?: number }> = ({ text, size = 90, tone = 'light', out, step = 2 }) => {
  useFonts();
  const f = useCurrentFrame();
  const latin = /^[\x00-\x7F]*$/.test(text);
  const o = out !== undefined ? interpolate(f, [out, out + 14], [1, 0], clamp) : 1;
  const grad = tone === 'dark' ? 'linear-gradient(180deg, #5A3A12, #2A1806)' : tone === 'gold' ? 'linear-gradient(180deg, #FFF1B8, #E8B23A 60%, #9C6B12)' : 'linear-gradient(180deg, #FFFFFF, #D8D2CA 70%, #A8A096)';
  const ch = graphemes(text);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ whiteSpace: 'nowrap', filter: `drop-shadow(0 ${size / 18}px ${size / 10}px rgba(0,0,0,${tone === 'dark' ? 0.25 : 0.6}))` }}>
        {ch.map((c, i) => {
          const s = interpolate(f, [i * step, i * step + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', fontFamily: latin ? SERIF : UI, fontWeight: latin ? 600 : 800, fontSize: size, letterSpacing: latin ? size * (0.08 + 0.3 * (1 - s)) : 0,
              opacity: s, transform: `translateY(${(1 - s) * size * 0.15}px)`, backgroundImage: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{c}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
