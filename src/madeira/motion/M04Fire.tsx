import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { C, ramp } from './theme';

// m04_fire (lines 3–4, the forest burning, "ये आग 7 साल तक बुझी ही नहीं"; the reference's 0:05–0:09 and 0:16–0:24):
// fires light up at `pts` (screen px) as the front reaches them (from `from` at `speed` px per frame). Each fire is
// the creator's flames (md04 / md04b, screen-blended) flickering: swapping between the two every few frames, each on
// its own phase, stretching and leaning in the wind; under each a warm glow pools on the map, and embers rise and
// drift off. `out` (frame) dies them down. Transparent, 1080×1920, 60 fps.
export const M04Fire: React.FC<{ pts: [number, number][]; flames?: string[]; from?: [number, number]; speed?: number; size?: number; out?: number }> = ({
  pts, flames = [], from = [0, 0], speed = 9, size = 80, out,
}) => {
  const f = useCurrentFrame();
  const die = out !== undefined ? 1 - ramp(f, out, out + 30) : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {pts.map(([x, y], i) => {
        const at = Math.hypot(x - from[0], y - from[1]) / speed + random(`d${i}`) * 6;
        const a = ramp(f, at, at + 10) * die;
        if (a <= 0) return null;
        const k = (0.7 + random(`s${i}`) * 0.6) * size;
        const ph = f + Math.floor(random(`p${i}`) * 20);
        const fl = 1 + 0.16 * Math.sin(ph * 0.9) + 0.08 * Math.sin(ph * 2.3);
        const src = flames.length ? flames[Math.floor(ph / 5) % flames.length] : undefined;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x - k, top: y - k * 0.6, width: k * 2, height: k * 1.2, borderRadius: '50%', opacity: 0.55 * a * fl,
              background: `radial-gradient(ellipse at 50% 50%, ${C.fire}, rgba(255,90,20,0.25) 45%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen' }} />
            {src && <Img src={src} style={{ position: 'absolute', left: x - k / 2, top: y - k * 0.95, width: k, height: k, objectFit: 'contain', mixBlendMode: 'screen', opacity: a,
              transformOrigin: '50% 95%', transform: `scale(${(i % 2 ? -1 : 1) * fl * a}, ${fl * 1.1 * a}) skewX(${Math.sin(ph / 9) * 6 - 4}deg)` }} />}
            <svg width={k * 2} height={k * 3} style={{ position: 'absolute', left: x - k, top: y - k * 3, overflow: 'visible' }}>
              {Array.from({ length: 4 }, (_, j) => {
                const t = ((f * 0.012 + random(`e${i}${j}`)) % 1);
                return <circle key={j} cx={k + Math.sin(t * 6 + j) * 12 + t * 30} cy={k * 3 - t * k * 2.6} r={2.2 * (1 - t) + 0.5} fill={j % 2 ? C.fireHot : C.ember} opacity={(1 - t) * a} />;
              })}
            </svg>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
