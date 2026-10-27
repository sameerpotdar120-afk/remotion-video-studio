import React from 'react';
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p17_letterbox (line 11, "ये पानी में घुला हुआ plastic का soup है"; the reference's real footage at 0:44–0:47, rebuilt
// with the creator's images gp13 and gp14 instead of stock footage): each 16:9 image sits across the middle of the 9:16
// frame, while the same image, enlarged and heavily blurred, fills the frame behind it. Each holds a slow push-in and
// drift (like a moving camera); it cuts hard to the next image at each frame in `cuts`. Small bubbles and specks rise
// through the picture so it never sits still. Opaque, 1080×1920.
export const P17Letterbox: React.FC<{ srcs: string[]; cuts?: number[] }> = ({ srcs, cuts = [] }) => {
  const f = useCurrentFrame();
  const k = cuts.filter((c) => f >= c).length;
  const src = srcs[Math.min(k, srcs.length - 1)];
  const lf = f - (k ? cuts[k - 1] : 0);
  const push = 1.04 + 0.08 * interpolate(lf, [0, 300], [0, 1], clamp);
  const dx = Math.sin(lf / 90 + k) * 10, dy = Math.cos(lf / 110 + k) * 6;
  const H = 1080 * 9 / 16;
  return (
    <AbsoluteFill style={{ background: '#0a1a2a', overflow: 'hidden' }}>
      <Img src={src} style={{ position: 'absolute', left: -200, top: -200, width: 1480, height: 2320, objectFit: 'cover', filter: 'blur(36px) brightness(0.75) saturate(1.2)', transform: `scale(${push})` }} />
      <div style={{ position: 'absolute', left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
        <Img src={src} style={{ width: 1080, height: H, objectFit: 'cover', transform: `translate(${dx}px, ${dy}px) scale(${push})` }} />
        <svg width={1080} height={H} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 26 }, (_, i) => {
            const sp = 0.6 + random(`s${i}`) * 1.2, t = ((f * sp) / 400 + random(`t${i}`)) % 1;
            const x = random(`x${i}`) * 1080 + Math.sin(t * 12 + i) * 10, y = H + 20 - t * (H + 40), r = 1.5 + random(`r${i}`) * 3.5;
            return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="rgba(220,245,255,0.7)" strokeWidth={1.2} opacity={Math.sin(t * Math.PI)} />;
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
