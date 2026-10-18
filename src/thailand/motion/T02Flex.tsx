import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { CountryChar } from './Char';
import { Paper } from './Paper';
import { clamp, pop } from './theme';

// t02_flex (line 7, "दोनों में से कोई भी Siam को एक झटके में निगल सकता था"): a worried Siam stands alone; Britain slides in
// from the left and pops two huge flexing arms (0 → 1 in 12 frames with an overshoot), then France from the right. They
// pump every 0.4 s while Siam's eyes dart left and right and a sweat drop slides down.
// 1080x1920, 60 fps, 240 frames.

const GY = 1440;

const Sweat: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y + t * 60})`} opacity={Math.min(1, t * 4) * (1 - Math.max(0, t - 0.8) * 5)}>
      <path d="M 0 -34 C 18 -6 22 8 0 22 C -22 8 -18 -6 0 -34 Z" fill="#7FD6FF" stroke="#1D1430" strokeWidth={5} />
      <ellipse cx={-6} cy={4} rx={5} ry={8} fill="#fff" opacity={0.8} />
    </g>
  );

export const T02Flex: React.FC<{ bg?: boolean }> = ({ bg = true }) => {
  const f = useCurrentFrame();
  const bIn = interpolate(f, [30, 52], [-420, 265], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const fIn = interpolate(f, [70, 92], [1500, 835], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const bFlex = pop(f, 52, 64, 2.2), fFlex = pop(f, 92, 104, 2.2);
  const pump = (k: number, start: number) => (f > start ? Math.max(0, Math.sin(((f - start) / 24) * Math.PI * 2 + k)) : 0);
  const bp = pump(0, 64), fp = pump(1.2, 104);
  // the flexing arm: upper arm out, forearm up; hand target relative to each shoulder
  const flexL = (k: number, p: number) => ({ x: -200 * k, y: -230 * k - p * 34 + 140 * (1 - k), flex: k * (1 + p * 0.12), bend: 1 });
  const flexR = (k: number, p: number) => ({ x: 200 * k, y: -230 * k - p * 34 + 140 * (1 - k), flex: k * (1 + p * 0.12), bend: -1 });
  const dart = f < 40 ? 0 : f < 90 ? -0.8 : Math.sign(Math.sin((f - 90) / 14)) * 0.85;
  const walkB = f > 30 && f < 52 ? f * 0.6 : 0, walkF = f > 70 && f < 92 ? f * 0.6 : 0;
  return (
    <AbsoluteFill>
      {bg && <Paper floor={GY} />}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <g transform={`translate(540 ${GY})`}>
            <CountryChar who="siam" size={400} f={f} mood={f < 52 ? 'sad' : 'scared'} look={dart} lookY={0.2}
              armL={{ x: 40, y: 200, bend: -1 }} armR={{ x: -60, y: 180, bend: 1 }} legs={{ spread: 15 }}
              squash={1 + Math.sin(f / 8) * 0.01} />
            <g transform="translate(105 -445) scale(0.6)"><Sweat x={0} y={0} t={interpolate(f, [110, 200], [0, 1], clamp)} /></g>
          </g>
          <g transform={`translate(${bIn} ${GY})`}>
            <CountryChar who="britain" size={540} f={f} mood="smug" look={0.7} bob={-bp * 14} tilt={-2 + bp * 1.5}
              armL={flexL(bFlex, bp)} armR={flexR(bFlex, bp)} legs={{ spread: 50, stride: Math.sin(walkB) * 40, lift: walkB ? 30 : 0, phase: walkB }} />
          </g>
          <g transform={`translate(${fIn} ${GY})`}>
            <CountryChar who="france" size={470} f={f} mood="smug" look={-0.7} bob={-fp * 14} tilt={2 - fp * 1.5}
              armL={flexL(fFlex, fp)} armR={flexR(fFlex, fp)} legs={{ spread: 50, stride: Math.sin(walkF) * 40, lift: walkF ? 30 : 0, phase: walkF }} />
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
