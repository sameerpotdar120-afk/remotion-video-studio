import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Horse, PP0, Plush } from './Plush';
import { clamp } from './theme';

// h07_cavalry (line 5, "France के घुड़सवार … ये कवच काग़ज़ जैसा है"; the reference's 22.3–26.7 s): a squad of chibi French
// knights on caparisoned horses bob forward to the left with galloping legs and a slow drift. At `rain` arrows fall in
// from the upper right, and the knights topple one after another (rotate and drop, horse and rider), ending in a heap
// with arrows sticking up. Transparent (laid over the battlefield background), 1080×1920, 60 fps, 270 frames.
const ROW: [number, number, number][] = [[620, 1470, 0.26], [800, 1500, 0.27], [520, 1580, 0.3], [720, 1610, 0.31], [900, 1640, 0.32], [620, 1720, 0.35]];

export const H07Cavalry: React.FC<{ rain?: number }> = ({ rain = 150 }) => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, 270], [120, -160]);
  const arrows = Array.from({ length: 26 }).map((_, i) => {
    const t0 = rain - 20 + random(`a${i}`) * 50;
    const t = interpolate(f, [t0, t0 + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    if (f < t0) return null;
    const x1 = 300 + random(`ax${i}`) * 700, y1 = 1380 + random(`ay${i}`) * 380;
    const x0 = x1 + 520, y0 = y1 - 900;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${ang})`}>
        <path d="M -90 0 L 0 0" stroke="#6A4A2A" strokeWidth={6} />
        <path d="M 0 0 l -16 -8 l 0 16 Z" fill="#555B66" />
        <path d="M -90 0 l -14 -9 M -90 0 l -14 9" stroke="#EDE6D6" strokeWidth={5} />
      </g>
    );
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {[...ROW].sort((a, b) => a[1] - b[1]).map(([x, y, s], i) => {
          const fall = interpolate(f, [rain + 10 + i * 6, rain + 30 + i * 6], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
          const stop = Math.min(f, rain + 10 + i * 6);
          const bob = fall > 0 ? 0 : Math.abs(Math.sin(stop / 6 + i)) * 26;
          const px = x + drift - (fall > 0 ? 0 : 0);
          return (
            <g key={i} transform={`translate(${px} ${y - bob}) rotate(${-fall * 80} -200 0) scale(${s})`}>
              <Horse f={f + i * 5} run={fall > 0 ? 0 : 1} />
              <g transform="translate(40 -380) scale(0.8)">
                <Plush who="knightFR" seed={`c${i}`} f={f} pose={{ ...PP0, visor: 1, arms: 1, rx: -200, ry: -260, lx: -150, ly: 60, mouth: fall > 0 ? 'oh' : 'grin', brow: fall > 0 ? 1 : -0.4 }} />
              </g>
            </g>
          );
        })}
        {arrows}
      </svg>
    </AbsoluteFill>
  );
};
