import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// c15_spotlight (line 8, "सिर्फ़ लोग पैदल घूमते हैं"; the reference's 0:59–1:01): a top-down image of the sector
// (the creator's cg25) fills the frame, slowly pushing in; outside a rounded rectangle (`rect`, screen px) the picture
// drops to near black (24 frames), while a glowing white frame draws round it; tiny walking dots wander along the
// plaza's paths inside it. Opaque, 1080×1920.
export const C15Spotlight: React.FC<{ src: string; rect?: [number, number, number, number]; walkers?: number }> = ({ src, rect = [240, 420, 600, 1000], walkers = 26 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [4, 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const [x, y, w, h] = rect, r = 40;
  const push = 1.04 + 0.05 * interpolate(f, [0, 300], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <Img src={src} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${push})` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><mask id="c15m"><rect width={1080} height={1920} fill="#fff" /><rect x={x} y={y} width={w} height={h} rx={r} fill="#000" /></mask></defs>
        <rect width={1080} height={1920} fill="#000" opacity={0.78 * t} mask="url(#c15m)" />
        <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke="#fff" strokeWidth={6} pathLength={1} strokeDasharray={`${t} 2`} style={{ filter: 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 22px rgba(255,255,255,0.7))' }} />
        {t > 0.6 && Array.from({ length: walkers }, (_, i) => {
          const sp = 0.4 + random(`s${i}`) * 0.6, a = random(`a${i}`) * Math.PI * 2;
          const px = x + w * (0.1 + random(`x${i}`) * 0.8) + Math.cos(a) * f * sp * 0.6, py = y + h * (0.1 + random(`y${i}`) * 0.8) + Math.sin(a) * f * sp * 0.6;
          const cx = x + 20 + (((px - x - 20) % (w - 40)) + (w - 40)) % (w - 40), cy = y + 20 + (((py - y - 20) % (h - 40)) + (h - 40)) % (h - 40);
          return <circle key={i} cx={cx} cy={cy} r={4.5} fill="#FFF3C8" opacity={(t - 0.6) * 2.5} style={{ filter: 'drop-shadow(0 0 3px #fff)' }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
