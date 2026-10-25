import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// g08_snow (lines 5–7: the first winter, the drift ice, Greenland; the reference's falling snow over the paper map):
// three depths of snow, near flakes big, fast and soft (blurred), far flakes small and slow, each drifting on its own
// sway, all pushed sideways by a slow gust that comes and goes. It wraps seamlessly, so it can run any length.
// `amount` 0..1 scales how many flakes. Transparent, 1080×1920, 60 fps.
export const G08Snow: React.FC<{ amount?: number; wind?: number }> = ({ amount = 1, wind = 1 }) => {
  const f = useCurrentFrame();
  const gust = (Math.sin(f / 140) * 0.6 + Math.sin(f / 61) * 0.25) * wind;
  const layers = [
    { n: 90, r: [2, 4], v: 1.1, blur: 0, a: 0.7 },
    { n: 50, r: [4, 7], v: 2.0, blur: 1, a: 0.85 },
    { n: 16, r: [9, 15], v: 3.6, blur: 4, a: 0.9 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {layers.map((L, li) => (
        <AbsoluteFill key={li} style={{ filter: L.blur ? `blur(${L.blur}px)` : undefined }}>
          <svg width={1080} height={1920}>
            {Array.from({ length: Math.round(L.n * amount) }, (_, i) => {
              const k = `${li}_${i}`;
              const r = L.r[0] + random(`r${k}`) * (L.r[1] - L.r[0]);
              const v = L.v * (0.8 + random(`v${k}`) * 0.4);
              const y = ((random(`y${k}`) * 2000 + f * v) % 2000) - 40;
              const x = (((random(`x${k}`) * 1200 + Math.sin(f / (40 + random(`s${k}`) * 40) + i) * 18 * L.v + f * gust * L.v * 1.4) % 1200) + 1200) % 1200 - 60;
              return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={L.a * (0.6 + 0.4 * random(`a${k}`))} />;
            })}
          </svg>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
