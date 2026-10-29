import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c27_stop (line 8, "जहाँ गाड़ियाँ नहीं"; line 1, the computer): the creator's prop (the car cg24) drives in from
// `from` toward `to` (screen px) and brakes hard short of it (a forward dip and a bounce back), then a red ✕ slams over
// it at 2× → 1× with a shake, and it reverses out. `w` its width, `ratio` h/w. Transparent, 1080×1920.
export const C27Stop: React.FC<{ src: string; from: [number, number]; to: [number, number]; w?: number; ratio?: number; stamp?: number; dur?: number }> = ({ src, from, to, w = 260, ratio = 0.56, stamp = 26, dur = 22 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const back = interpolate(f, [stamp + 14, stamp + 34], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x = from[0] + (to[0] - from[0]) * t * (1 - back), y = from[1] + (to[1] - from[1]) * t * (1 - back);
  const dip = f > dur - 4 && f < dur + 10 ? Math.sin(((f - dur + 4) / 14) * Math.PI) * 6 : 0;
  const st = interpolate(f, [stamp, stamp + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const shake = f >= stamp && f < stamp + 10 ? Math.sin(f * 3) * 8 * (1 - (f - stamp) / 10) : 0;
  const h = w * ratio, dir = to[0] >= from[0] ? 1 : -1;
  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, objectFit: 'contain', transform: `scaleX(${dir}) rotate(${dip * dir}deg)`, filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.45))' }} />
      {st > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
          <g transform={`translate(${x} ${y}) scale(${2 - st})`} stroke="#FF2E3F" strokeWidth={22} strokeLinecap="round" opacity={Math.min(1, st * 2) * (1 - back)} style={{ filter: 'drop-shadow(0 0 10px #FF2E3F)' }}>
            <line x1={-80} y1={-80} x2={80} y2={80} /><line x1={80} y1={-80} x2={-80} y2={80} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};
