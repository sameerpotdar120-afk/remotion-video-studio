import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p22_satellite (line 10, "ये इतने छोटे हैं कि satellite भी इन्हें नहीं देख पाते"): the creator's satellite (gp16)
// glides across the top of the frame from `from` to `to` over `dur` frames, turning slightly, solar panels glinting;
// a pale scan beam sweeps down from it over the ocean, and where it passes the patch it finds nothing: the beam
// flickers and a small red "no signal" cross blinks at `target`. Transparent, 1080×1920.
export const P22Satellite: React.FC<{ src: string; from?: [number, number]; to?: [number, number]; dur?: number; w?: number; target?: [number, number] }> = ({ src, from = [-200, 260], to = [1280, 330], dur = 240, w = 360, target }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t + Math.sin(f / 30) * 6;
  const beam = interpolate(f, [20, 40], [0, 1], clamp) * (target && Math.abs(x - target[0]) < 140 ? 0.55 + 0.45 * (Math.floor(f / 3) % 2) : 1);
  const glint = Math.max(0, Math.sin(f / 12)) ** 8;
  const bx = target ? target[0] : x, by = target ? target[1] : 1300;
  const cross = target && Math.abs(x - target[0]) < 160 && Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        <defs><linearGradient id="p22b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CFF6FF" stopOpacity={0.45} /><stop offset="1" stopColor="#CFF6FF" stopOpacity={0} /></linearGradient></defs>
        <path d={`M${x - 14},${y + 30} L${x + 14},${y + 30} L${bx + 170},${by} L${bx - 170},${by} Z`} fill="url(#p22b)" opacity={beam} />
        {cross && <g transform={`translate(${target![0]} ${target![1] - 40})`} stroke="#FF3D4E" strokeWidth={10} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #FF3D4E)' }}><line x1={-30} y1={-30} x2={30} y2={30} /><line x1={30} y1={-30} x2={-30} y2={30} /></g>}
      </svg>
      <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.28, width: w, height: w * 0.56, objectFit: 'contain', transform: `rotate(${-6 + 12 * t}deg)`,
        filter: `drop-shadow(0 12px 14px rgba(0,0,0,0.45)) brightness(${1 + glint * 0.5})` }} />
    </AbsoluteFill>
  );
};
