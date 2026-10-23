import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { idle, ramp } from './theme';

// p11_rain_cloud (line 4, "ये पूरी झील भरती है सिर्फ़ बारिश से", and line 5's drought: "बारिश नहीं आई"; the reference's
// 32–34.5 s and 35–36.5 s): a fluffy grey-white cloud (several soft puffs that breathe at their own rates) drifts in
// from the left; rain streaks fall from it and splash on the ground line. With `dry` the rain stops and the cloud
// thins and evaporates (puffs shrink and fade one by one) from frame `dry`. Transparent, 800×800, 60 fps.
const PUFFS: [number, number, number][] = [[-150, 20, 90], [-60, -40, 120], [60, -30, 110], [160, 20, 85], [0, 30, 100], [-90, 40, 80], [100, 45, 80]];
export const P11RainCloud: React.FC<{ dry?: number; rain?: boolean }> = ({ dry = 9999, rain = true }) => {
  const f = useCurrentFrame();
  const inn = ramp(f, 0, 30);
  const [ix, iy] = idle(f, 5, 0.8);
  const cx = 400 - (1 - inn) * 500 + ix + f * 0.3, cy = 220 + iy;
  const raining = rain && f < dry;
  return (
    <AbsoluteFill>
      {raining && Array.from({ length: 40 }, (_, i) => {
        const t = ((f * 1.4 + random(`r${i}`) * 60) % 60) / 60;
        const x = cx - 180 + random(`x${i}`) * 360 + t * 30;
        const y = cy + 60 + t * 480;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 3, height: 34, background: 'rgba(200,235,255,0.85)', transform: 'rotate(12deg)', borderRadius: 2, opacity: inn }} />;
      })}
      {raining && Array.from({ length: 8 }, (_, i) => {
        const t = ((f + i * 7) % 24) / 24;
        return <div key={`s${i}`} style={{ position: 'absolute', left: cx - 170 + random(`sx${i}`) * 340, top: cy + 540, width: 30 * t + 6, height: 8 * t + 2, borderRadius: '50%', border: '2px solid rgba(220,240,255,0.8)', opacity: (1 - t) * inn }} />;
      })}
      {PUFFS.map(([dx, dy, r], i) => {
        const gone = ramp(f, dry + i * 6, dry + i * 6 + 26);
        const b = 1 + 0.05 * Math.sin(f / (14 + i * 3) + i);
        return <div key={i} style={{ position: 'absolute', left: cx + dx - r, top: cy + dy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #D4DCE4 70%, #B8C3CE)', transform: `scale(${b * (1 - gone * 0.7)})`, opacity: inn * (1 - gone), filter: 'blur(1.5px)' }} />;
      })}
    </AbsoluteFill>
  );
};
