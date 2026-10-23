import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp, wobble } from './theme';

// p05_stamp (line 7: "RECORD", and "TRAFFIC फिर कम!"; the reference's 49.1 s "TRAFFIC CUT AGAIN"): a red rubber stamp
// slams down from 1.5× (8 frames, ease-in) with a 6° twist, lands with a shake and a dust puff of tiny particles, its
// ink slightly worn (a speckle mask), then breathes. Transparent, 1000×320, 60 fps.
export const P05Stamp: React.FC<{ text?: string; color?: string; rot?: number }> = ({ text = 'RECORD', color = '#E5262B', rot = -6 }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 8], [1.5, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const a = interpolate(f, [0, 3], [0, 1], clamp);
  const w = wobble(f, 8, 4, 9);
  const shake = f >= 8 ? w * 6 : 0;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: a }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="stampWorn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.6" /><feComposite in="SourceGraphic" operator="in" /></filter>
      </svg>
      <div style={{ transform: `translate(${shake}px, ${-shake * 0.4}px) rotate(${rot + (k - 1) * 12}deg) scale(${k * (1 + 0.01 * Math.sin(f / 13))})`, padding: '4px 34px', border: `10px solid ${color}`, borderRadius: 16,
        fontFamily: UI, fontWeight: 800, fontSize: 120, lineHeight: 1.15, color, letterSpacing: 4, filter: 'url(#stampWorn)', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.06)' }}>{text}</div>
      {f >= 8 && f < 40 && Array.from({ length: 14 }, (_, i) => {
        const t = (f - 8) / 32, ang = random(`a${i}`) * Math.PI * 2, r = 230 + random(`r${i}`) * 200;
        return <div key={i} style={{ position: 'absolute', left: 500 + Math.cos(ang) * r * t, top: 160 + Math.sin(ang) * r * 0.35 * t, width: 8, height: 8, borderRadius: 4, background: color, opacity: 1 - t }} />;
      })}
    </AbsoluteFill>
  );
};
