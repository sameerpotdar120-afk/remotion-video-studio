import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c16_sun_rays (line 11, "High Court की मुड़ी हुई छत धूप को रोकती है"; the reference's 1:28–1:30): the sun (the
// creator's gp10) slides in at the top-left with a warm glow; then hot rays shoot from it toward the roof line
// (`roof`: two screen points, left and right) one after another, and where they hit the roof they bend and glance
// off upward instead of reaching the building, flickering. `out` slides the sun out. Transparent, 1080×1920.
export const C16SunRays: React.FC<{ sun: string; roof: [[number, number], [number, number]]; rays?: number; out?: number }> = ({ sun, roof, rays = 4, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) }) * (out !== undefined ? 1 - interpolate(f, [out, out + 14], [0, 1], clamp) : 1);
  const sx = 60 + 150 * s, sy = 60 + 140 * s;
  const [[ax, ay], [bx, by]] = roof;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${(sx / 1080) * 100}% ${(sy / 1920) * 100}%, rgba(255,226,120,${0.4 * s}), rgba(255,200,80,0) 45%)`, mixBlendMode: 'screen' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        {Array.from({ length: rays }, (_, i) => {
          const t = interpolate(f, [12 + i * 5, 24 + i * 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          if (t <= 0) return null;
          const u = (i + 1) / (rays + 1), hx = ax + (bx - ax) * u, hy = ay + (by - ay) * u;
          const d = `M${sx},${sy} L${hx},${hy} Q${hx + 40},${hy - 10} ${hx + 140},${hy - 120}`;
          const fl = 0.8 + 0.2 * Math.sin(f / 3 + i);
          return (
            <g key={i}>
              <path d={d} pathLength={1} fill="none" stroke="#FF9A2E" strokeWidth={22} strokeLinecap="round" strokeDasharray={`${t} 2`} opacity={0.45 * fl} style={{ filter: 'blur(6px)' }} />
              <path d={d} pathLength={1} fill="none" stroke="#FFE07A" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${t} 2`} opacity={fl} />
            </g>
          );
        })}
      </svg>
      <Img src={sun} style={{ position: 'absolute', left: sx - 150, top: sy - 150, width: 300, height: 300, objectFit: 'contain', transform: `rotate(${f * 0.5}deg) scale(${s})`, filter: 'drop-shadow(0 0 30px rgba(255,210,80,0.9))' }} />
    </AbsoluteFill>
  );
};
