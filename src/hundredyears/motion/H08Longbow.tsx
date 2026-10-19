import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { clamp } from './theme';

// h08_longbow (line 5, "England के longbow के सामने"; the reference's 27.1–30.7 s): a row of chibi English longbowmen
// (St George tunics, kettle hats) draw their bows (0 → full over 20 frames), hold, loose a volley (arrows fly off to the
// upper left, the way they face), and draw again; staggered slightly so the line ripples. Transparent, 1080×1920, 60 fps, 240 frames.
const ROW: [number, number, number][] = [[240, 1500, 0.33], [460, 1520, 0.34], [690, 1540, 0.35], [330, 1660, 0.38], [580, 1690, 0.39], [820, 1700, 0.4]];
const CYCLE = 80;

export const H08Longbow: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {[...ROW].sort((a, b) => a[1] - b[1]).map(([x, y, s], i) => {
          const c = (f + i * 4) % CYCLE;
          const draw = c < 40 ? interpolate(c, [10, 30], [0, 1], clamp) : interpolate(c, [44, 50], [1, 0], clamp);
          const loose = c >= 44 && c < 70;
          const ax = interpolate(c, [44, 70], [0, -900], clamp), ay = interpolate(c, [44, 70], [0, -500], clamp);
          return (
            <g key={i}>
              <g transform={`translate(${x} ${y}) scale(${s})`}>
                <Plush who="archer" seed={`b${i}`} f={f + i * 30} pose={{ ...PP0, arms: 1, lx: -270, ly: -40, rx: -110 + draw * 160, ry: -40, mouth: 'flat', brow: -0.5, look: -0.8, lean: 3 + draw * 3 }} bow={draw} />
              </g>
              {loose && (
                <g transform={`translate(${x - 270 * s + ax} ${y - 390 * s + ay}) rotate(${210 + random(`r${i}`) * 6})`}>
                  <path d="M 0 0 L 90 0" stroke="#6A4A2A" strokeWidth={6} />
                  <path d="M 0 0 l 16 -8 l 0 16 Z" fill="#555B66" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
