import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp, wobble } from './theme';

// w13_sticker (lines 6–9, the bottles, notes and soldiers; the reference's 30.8, 32.3, 33.5, 43.7, 47.5 s): a cutout
// sticker (thick white outline and a soft drop shadow, like the reference's photo stickers) is thrown in from `from`
// with a spin, lands at its spot with a squash and a damped wobble, then sways gently. Transparent, 1080×1920, 60 fps.
// Pass the cutout as `children` (an <Img> of a prop), sized `w`×`h`, landing centre `at`; `land` = frames to land.
export const Sticker: React.FC<{ children: React.ReactNode; outline?: number }> = ({ children, outline = 10 }) => (
  <div style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 0 #fff) ${Array.from({ length: 8 }, (_, i) => `drop-shadow(${(Math.cos((i * Math.PI) / 4) * outline / 2).toFixed(1)}px ${(Math.sin((i * Math.PI) / 4) * outline / 2).toFixed(1)}px 0 #fff)`).join(' ')} drop-shadow(0 14px 14px rgba(0,0,0,0.45))` }}>
    {children}
  </div>
);
export const W13Sticker: React.FC<{ children?: React.ReactNode; w?: number; h?: number; at?: [number, number]; from?: [number, number]; spin?: number; land?: number; rest?: number }> = ({
  children, w = 260, h = 520, at = [420, 1320], from = [-300, 200], spin = -260, land = 14, rest = -8,
}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, land], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const arc = Math.sin(k * Math.PI) * -160;
  const x = from[0] + (at[0] - from[0]) * k, y = from[1] + (at[1] - from[1]) * k + arc * (1 - k);
  const rot = spin * (1 - k) + rest + wobble(f, land, 2.6, 4) * 9 + Math.sin(f / 26) * 1.2;
  const sq = 1 - wobble(f, land, 3.2, 6) * 0.08;
  const body = children ?? <DemoBottle />;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${1 / Math.sqrt(sq)}, ${sq})`, transformOrigin: '50% 90%' }}>
        <Sticker>{body}</Sticker>
      </div>
    </AbsoluteFill>
  );
};
// a stand-in bottle so the composition renders on its own (the edit passes the creator's bottle images)
const DemoBottle: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 260 520">
    <path d="M 105 20 H 155 V 140 Q 230 180 230 260 V 490 Q 230 510 210 510 H 50 Q 30 510 30 490 V 260 Q 30 180 105 140 Z" fill="#2A1A10" />
    <rect x={55} y={300} width={150} height={120} rx={8} fill="#E9DDBF" />
    <rect x={100} y={10} width={60} height={30} rx={6} fill="#B8860B" />
  </svg>
);
