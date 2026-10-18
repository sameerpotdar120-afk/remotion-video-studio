import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { CountryChar } from './Char';
import { Paper } from './Paper';
import { clamp, wobble } from './theme';

// t03_balance (line 7, "जो भी Siam को लेता, उसकी सरहद सीधे दूसरे से जा मिलती"): a brass balance with Britain in the left
// pan and France in the right, level and calm. Siam is tossed in a high arc into one pan (`into`); on landing the beam tips
// about 15° with an overshoot and the pans swing on their chains, while the other side looks over, angry.
// 1080x1920, 60 fps, 240 frames.

const PX = 540, PY = 760, HALF = 360, CH = 380;

export const T03Balance: React.FC<{ bg?: boolean; into?: 'france' | 'britain' }> = ({ bg = true, into = 'france' }) => {
  const f = useCurrentFrame();
  const side = into === 'france' ? 1 : -1;
  const LAND = 74;
  const tip = f < LAND ? Math.sin(f / 30) * 1.2 : side * (15 - wobble(f, LAND, 1.6, 3.5) * 15);
  const th = (tip * Math.PI) / 180;
  const ends = [-1, 1].map((k) => [PX + Math.cos(th) * HALF * k, PY + Math.sin(th) * HALF * k] as [number, number]);
  const swing = f < LAND ? Math.sin(f / 24) * 1.5 : -side * wobble(f, LAND, 1.1, 2.4) * 9;
  const pan = (i: 0 | 1, who: 'britain' | 'france', size: number, mood: 'happy' | 'angry' | 'smug' | 'scared', look: number) => {
    const [x, y] = ends[i];
    const sw = swing * (i === 0 ? 1 : 0.85);
    return (
      <g transform={`translate(${x} ${y}) rotate(${sw})`}>
        <path d={`M 0 0 L -170 ${CH} M 0 0 L 170 ${CH} M 0 0 L 0 ${CH - 30}`} stroke="#6B4A12" strokeWidth={7} strokeDasharray="16 7" />
        <circle r={20} fill="#D9A43A" stroke="#1D1430" strokeWidth={7} />
        <g transform={`translate(0 ${CH + 14})`}>
          <CountryChar who={who} size={size} f={f} mood={mood} look={look} shadow={false} armL={{ x: -90, y: 160, bend: -1 }} armR={{ x: 90, y: 160, bend: 1 }} legs={{ spread: 30 }} />
          <path d="M -230 -20 Q 0 90 230 -20 Z" fill="#E2AE45" stroke="#1D1430" strokeWidth={9} strokeLinejoin="round" />
          <path d="M -200 -8 Q 0 70 200 -8" fill="none" stroke="#FFE19A" strokeWidth={8} opacity={0.6} />
        </g>
      </g>
    );
  };
  // Siam's throw: from top centre, a high arc into the receiving pan
  const t = interpolate(f, [40, LAND], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const [tx, ty] = [ends[into === 'france' ? 1 : 0][0], ends[into === 'france' ? 1 : 0][1] + CH - 10];
  const sx = interpolate(t, [0, 1], [PX, tx]), sy = interpolate(t, [0, 1], [-220, ty]) - Math.sin(t * Math.PI) * 260;
  const landed = f >= LAND;
  const angryB = landed && into === 'france', angryF = landed && into === 'britain';
  return (
    <AbsoluteFill>
      {bg && <Paper floor={1640} />}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2C85A" /><stop offset="1" stopColor="#B98425" /></linearGradient>
          </defs>
          {/* column and base */}
          <path d={`M ${PX - 26} ${PY} L ${PX - 38} 1560 L ${PX + 38} 1560 L ${PX + 26} ${PY} Z`} fill="url(#br)" stroke="#1D1430" strokeWidth={9} />
          <path d={`M ${PX - 220} 1640 Q ${PX - 200} 1560 ${PX} 1556 Q ${PX + 200} 1560 ${PX + 220} 1640 Z`} fill="url(#br)" stroke="#1D1430" strokeWidth={9} />
          {pan(0, 'britain', 300, angryB ? 'angry' : 'happy', landed && into === 'france' ? 0.8 : 0.2)}
          {pan(1, 'france', 250, angryF ? 'angry' : landed ? 'smug' : 'happy', landed && into === 'britain' ? -0.8 : -0.2)}
          {/* beam */}
          <g transform={`translate(${PX} ${PY}) rotate(${tip})`}>
            <path d={`M ${-HALF - 20} -12 Q 0 -40 ${HALF + 20} -12 L ${HALF + 20} 12 Q 0 0 ${-HALF - 20} 12 Z`} fill="url(#br)" stroke="#1D1430" strokeWidth={9} strokeLinejoin="round" />
          </g>
          <circle cx={PX} cy={PY} r={34} fill="#F2C85A" stroke="#1D1430" strokeWidth={9} />
          <path d={`M ${PX} ${PY - 34} L ${PX - 16} ${PY - 90} L ${PX + 16} ${PY - 90} Z`} fill="#F2C85A" stroke="#1D1430" strokeWidth={8} />
          {/* Siam in flight, spinning, then sitting in the pan */}
          {f >= 40 && (
            <g transform={landed ? undefined : `translate(${sx} ${sy}) rotate(${t * 540})`}>
              {landed ? null : <g transform="translate(0 90)"><CountryChar who="siam" size={180} f={f} mood="scared" shadow={false} armL={{ x: -100, y: -120 }} armR={{ x: 100, y: -120 }} /></g>}
            </g>
          )}
          {landed && (() => {
            const [x, y] = ends[into === 'france' ? 1 : 0];
            return (
              <g transform={`translate(${x} ${y}) rotate(${swing}) translate(${-side * 150} ${CH + 6})`}>
                <CountryChar who="siam" size={180} f={f} mood="scared" shadow={false} squash={1 - wobble(f, LAND, 3, 6) * 0.12} armL={{ x: -100, y: -60 }} armR={{ x: 100, y: -60 }} />
              </g>
            );
          })()}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
