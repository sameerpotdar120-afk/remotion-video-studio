import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, inOut, mblur, ramp } from './theme';

// w01_magnifier (line 1, "दुनिया के किसी भी map पर ये देश आपको नहीं मिलेगा"; the reference's 0:04.3–0:06.3): a brass
// magnifying glass glides across the world map searching, along a smooth path through `pts` (screen points, one hop
// every `hop` frames, eased in and out with a small overshoot at each stop), tilting into each move with motion blur.
// The lens brightens and sharpens what is under it, a highlight slides over the glass, a soft shadow trails below.
// At each stop it gives a tiny "look" wiggle. It fades in over 8 frames and out at `out`. Transparent, 1080×1920,
// 60 fps. `src` is the creator's image (wi03); drawn in code until then.
type Pt = [number, number];
export const W01Magnifier: React.FC<{ pts?: Pt[]; hop?: number; out?: number; src?: string; size?: number }> = ({
  pts = [[300, 760], [560, 980], [760, 820], [640, 1180], [400, 1060]], hop = 26, out = 9999, src, size = 260,
}) => {
  const f = useCurrentFrame();
  const at = (g: number): Pt => {
    const k = Math.max(0, g) / hop, i = Math.min(pts.length - 2, Math.floor(k));
    const u = Math.min(1, k - i);
    const e = inOut(u) + 0.06 * Math.sin(Math.PI * Math.min(1, u * 1.25)) * (u > 0.8 ? 1 : 0);
    const a = pts[i], b = pts[i + 1];
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
  };
  const [x, y] = at(f);
  const [px, py] = at(f - 1);
  const v = Math.hypot(x - px, y - py);
  const tilt = Math.max(-14, Math.min(14, (x - px) * 1.1));
  const stop = (f % hop) / hop;
  const wig = stop < 0.15 && f > hop ? Math.sin(stop * Math.PI * 12) * 3 * (1 - stop / 0.15) : 0;
  const a = Math.min(ramp(f, 0, 8), 1 - ramp(f, out, out + 8));
  const r = size * 0.36;
  const glint = ((f % 70) / 70) * 1.6 - 0.3;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      {/* the lens: brightens and sharpens the map under it */}
      <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', backdropFilter: 'brightness(1.45) saturate(1.5) contrast(1.15)', WebkitBackdropFilter: 'brightness(1.45) saturate(1.5) contrast(1.15)', boxShadow: `0 0 40px ${C.shallow}55` }} />
      {/* shadow */}
      <div style={{ position: 'absolute', left: x - r + 30, top: y - r + 46, width: r * 2, height: r * 2, borderRadius: '50%', border: `${r * 0.16}px solid rgba(0,0,0,0.35)`, filter: 'blur(10px)' }} />
      <div style={{ position: 'absolute', left: x - size * 0.5, top: y - size * 0.5, width: size * 1.6, height: size * 1.6, transformOrigin: `${size * 0.5}px ${size * 0.5}px`, transform: `rotate(${tilt + wig}deg)`, filter: mblur(v, 0.12, 8) }}>
        {src ? <Img src={src} style={{ position: 'absolute', left: size * 0.5 - r * 1.18, top: size * 0.5 - r * 1.18, width: size * 1.25, height: size * 1.25 }} /> : (
          <svg width={size * 1.6} height={size * 1.6} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="w01rim" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#FFE9A8" /><stop offset="0.45" stopColor="#C8963A" /><stop offset="1" stopColor="#6E4A16" /></linearGradient>
              <linearGradient id="w01h" x1="0" x2="1"><stop offset="0" stopColor="#2A1608" /><stop offset="0.5" stopColor="#5A3418" /><stop offset="1" stopColor="#24140A" /></linearGradient>
            </defs>
            <g transform={`translate(${size * 0.5} ${size * 0.5})`}>
              <rect x={r * 0.78} y={r * 0.68} width={r * 1.3} height={r * 0.34} rx={r * 0.17} transform="rotate(45)" fill="url(#w01h)" stroke="#1A0E06" strokeWidth={3} />
              <rect x={r * 0.86} y={r * 0.62} width={r * 0.3} height={r * 0.46} rx={6} transform="rotate(45)" fill="url(#w01rim)" />
              <circle r={r} fill="rgba(170,220,255,0.08)" stroke="url(#w01rim)" strokeWidth={r * 0.16} />
              <circle r={r * 0.92} fill="none" stroke="#fff" strokeWidth={2} opacity={0.35} />
              <path d={`M ${-r * 0.55} ${-r * 0.35} A ${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.1} ${-r * 0.68}`} stroke="#fff" strokeWidth={r * 0.08} strokeLinecap="round" fill="none" opacity={0.55} />
            </g>
          </svg>
        )}
        <div style={{ position: 'absolute', left: size * 0.5 - r, top: size * 0.5 - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, bottom: -20, width: r * 0.35, left: `${glint * 100}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))', transform: 'skewX(-25deg)' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
