import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { pop, ramp } from './theme';

// c10_spin_arrows ("धरती अपनी धुरी पर घूमती है … equator पर थोड़ी फैल जाती है और poles पर दब जाती है"; the reference's
// 38.4–46.0 s): curved spin swooshes orbit the globe; then two white triangle arrows push outward left and right at
// the equator (the globe stretches), then two push inward at the poles (it squashes). Transparent, 1080×1080, 60 fps;
// the globe centre is (540, 540) with radius `r`. Frames: `stretch`, `squash`. The globe itself is the edit's 3D globe;
// read `bulge(frame)` for its x/y scale so it deforms in step.
export const bulge = (f: number, stretch = 100, squash = 190) => {
  const sx = 1 + 0.18 * ramp(f, stretch + 6, stretch + 50, Easing.inOut(Easing.cubic));
  const sy = 1 - 0.14 * ramp(f, squash + 6, squash + 50, Easing.inOut(Easing.cubic));
  return { sx, sy };
};
const Tri: React.FC<{ x: number; y: number; rot: number; s: number }> = ({ x, y, rot, s }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -34 -40 L 40 0 L -34 40 Z" fill="#fff" stroke="rgba(0,0,0,0.3)" strokeWidth={4} strokeLinejoin="round" />
    <rect x={-80} y={-12} width={52} height={24} rx={8} fill="#fff" />
  </g>
);
export const C10SpinArrows: React.FC<{ r?: number; stretch?: number; squash?: number }> = ({ r = 300, stretch = 100, squash = 190 }) => {
  const f = useCurrentFrame();
  const { sx, sy } = bulge(f, stretch, squash);
  const spin = ramp(f, 0, 20) * (1 - ramp(f, stretch - 10, stretch));
  const pushX = pop(f, stretch, stretch + 12, 2);
  const pushY = pop(f, squash, squash + 12, 2);
  const outX = 1 - ramp(f, squash - 12, squash);
  const shoveX = Math.sin(Math.max(0, f - stretch) / 5) * 10;
  const shoveY = Math.sin(Math.max(0, f - squash) / 5) * 10;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {spin > 0 && [0, 1].map((k) => {
          const a = ((f * 7 + k * 180) % 360) * (Math.PI / 180);
          return (
            <g key={k} opacity={spin} transform="translate(540 540) scale(1 0.32)">
              <path d={`M ${Math.cos(a) * (r + 60)} ${Math.sin(a) * (r + 60)} A ${r + 60} ${r + 60} 0 0 1 ${Math.cos(a + 1.2) * (r + 60)} ${Math.sin(a + 1.2) * (r + 60)}`}
                stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
            </g>
          );
        })}
        {pushX > 0 && outX > 0 && (
          <g opacity={outX}>
            <Tri x={540 + r * sx + 70 + shoveX} y={540} rot={0} s={pushX} />
            <Tri x={540 - r * sx - 70 - shoveX} y={540} rot={180} s={pushX} />
          </g>
        )}
        {pushY > 0 && (
          <g>
            <Tri x={540} y={540 - r * sy - 70 - shoveY} rot={90} s={pushY} />
            <Tri x={540} y={540 + r * sy + 70 + shoveY} rot={-90} s={pushY} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
