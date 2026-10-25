import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, graphemes, idle, ramp } from './theme';

// g01_highlighter (line 1 and 2, the reference's 0:00–0:03: a place name typed onto the map in a yellow highlighter
// box): a marker stroke swipes out from the left in 7 frames with a rough, slightly uneven edge, then the black text
// types on at one letter per frame, the cursor bar blinking at its end. `out` squeezes it flat in 5 frames (the
// reference's morph into the glowing name, g02). Transparent, 900×260, 60 fps; centred.
export const G01Highlighter: React.FC<{ text?: string; size?: number; out?: number; seed?: number }> = ({ text = 'Greenland', size = 96, out, seed = 0 }) => {
  useFonts();
  const f = useCurrentFrame();
  const ch = graphemes(text);
  const sw = ramp(f, 0, 7, Easing.out(Easing.quad));
  const n = Math.max(0, Math.min(ch.length, Math.floor(f - 5)));
  const sq = out !== undefined ? interpolate(f, [out, out + 5], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) }) : 1;
  const [ix, iy, ir] = idle(f, seed, 0.25);
  const blink = n >= ch.length ? Math.floor(f / 18) % 2 : 1;
  if (sq <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <svg width={0} height={0}><defs>
        <filter id={`g01r${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed={seed + 3} /><feDisplacementMap in="SourceGraphic" scale="9" /></filter>
      </defs></svg>
      <div style={{ position: 'relative', transform: `translate(${ix}px, ${iy}px) rotate(${ir - 1.5}deg) scale(${1 + 0.15 * (1 - sq)}, ${sq})` }}>
        <div style={{ position: 'absolute', left: -22, right: -22, top: '8%', bottom: '4%', background: `linear-gradient(180deg, ${C.hi}, ${C.hiDeep})`, transformOrigin: '0 50%',
          transform: `scaleX(${sw})`, filter: `url(#g01r${seed}) drop-shadow(0 6px 8px rgba(0,0,0,0.35))`, borderRadius: 6 }} />
        <div style={{ position: 'relative', fontFamily: UI, fontWeight: 800, fontSize: size, color: C.ink, lineHeight: 1.25, whiteSpace: 'pre', padding: '0 8px' }}>
          <span>{ch.slice(0, n).join('')}</span>
          <span style={{ display: 'inline-block', width: 0, height: size, verticalAlign: 'top', position: 'relative' }}>
            {sw >= 1 && <span style={{ position: 'absolute', left: 3, top: size * 0.2, height: size * 0.95, width: 7, background: C.ink, opacity: blink }} />}
          </span>
          <span style={{ visibility: 'hidden' }}>{ch.slice(n).join('')}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
