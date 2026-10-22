import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp, pop } from './theme';

// u09_tilt_world (line 5, "दुनिया के 70 से ज़्यादा देशों में…"; the reference's 24.6–29.2 s): the flat world map tilts
// back into a sheet in space (rotateX 0 → 52°, a thin white edge along the top, the map scaled to fit), then dozens of
// tiny white country tags pop on in a wave across the tropics, each with a short leader; at `back` it un-tilts. Wrap the
// world map as `children`; `tags` are [x, y, label] in 1080×1920 map coordinates (the edit passes the real 72 countries).
// 1080×1920, 60 fps.
const DEMO_TAGS: [number, number, string][] = Array.from({ length: 40 }, (_, i) => [80 + random(`tx${i}`) * 920, 820 + random(`ty${i}`) * 360, `देश ${i + 1}`]);
export const U09TiltWorld: React.FC<{ children?: React.ReactNode; tags?: [number, number, string][]; back?: number }> = ({ children, tags = DEMO_TAGS, back = 200 }) => {
  const f = useCurrentFrame();
  const tilt = interpolate(f, [0, 30, back, back + 24], [0, 52, 52, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sc = interpolate(tilt, [0, 52], [1, 1.25]);
  const map = children ?? <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0F3F55, #1A6B5A 45%, #C8A86A 55%, #0F3F55)' }} />;
  return (
    <AbsoluteFill style={{ background: '#0A1A2E', perspective: 1400 }}>
      <AbsoluteFill style={{ transform: `rotateX(${tilt}deg) scale(${sc})`, transformOrigin: '50% 58%' }}>
        {map}
        <AbsoluteFill style={{ borderTop: `${Math.round(tilt / 8)}px solid rgba(255,255,255,0.85)` }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {tags.map(([x, y, l], i) => {
            const t0 = 34 + (x / 1080) * 40 + random(`tg${i}`) * 10;
            const s = pop(f, t0, t0 + 8, 2.4) * (1 - interpolate(f, [back - 6, back], [0, 1], clamp));
            if (s <= 0) return null;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <path d="M 0 0 V -26" stroke="#fff" strokeWidth={2} />
                <circle r={4} fill="#fff" />
                <text y={-32} textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontWeight={700} fontSize={18} fill="#fff" stroke="#000" strokeWidth={4} paintOrder="stroke">{l}</text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
