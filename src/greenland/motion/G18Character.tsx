import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, pop } from './theme';

// g18_character (Flóki, gl01, line 4; Erik the Red, gl02, lines 6 and 8): the creator's cut-out character slides up
// from below the frame on a spring with a small overshoot, then lives: a slow breath (the chest lifts 0.6%), a weight
// shift side to side, a slight head-and-shoulders sway, a soft rim light pulsing on one side. `out` drops him back
// down in 12 frames. `h` is his height in px; anchored bottom-centre of the box (he stands on its bottom edge).
export const G18Character: React.FC<{ src: string; ratio: number; h?: number; out?: number; flip?: boolean; seed?: number; rim?: string }> = ({ src, ratio, h = 900, out, flip, seed = 0, rim = 'rgba(255,190,120,0.55)' }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 18, 1.4);
  const o = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: (x) => x * x }) : 0;
  const breath = 1 + 0.006 * Math.sin((f + seed * 30) / 26);
  const sway = Math.sin((f + seed * 50) / 71) * 1.1, shift = Math.sin((f + seed * 50) / 97) * 10;
  const w = h / ratio;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: '50%', bottom: 0, width: w, height: h, marginLeft: -w / 2, transformOrigin: '50% 100%',
        transform: `translate(${shift}px, ${(1 - s) * h * 0.9 + o * h}px) rotate(${sway}deg) scale(${flip ? -1 : 1}, ${breath})` }}>
        <Img src={src} style={{ width: w, height: h, filter: `drop-shadow(${flip ? 10 : -10}px 0 18px ${rim}) drop-shadow(0 20px 24px rgba(0,0,0,0.5))` }} />
      </div>
    </AbsoluteFill>
  );
};
