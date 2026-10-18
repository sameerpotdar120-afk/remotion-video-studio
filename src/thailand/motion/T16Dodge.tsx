import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { CountryChar } from './Char';
import { C, clamp, wobble } from './theme';

// t16_dodge (line 1 "जो कभी किसी का ग़ुलाम बना ही नहीं", reusable on line 20): an iron shackle swoops down on the little Siam
// character; Siam hops aside at the last moment, the cuff snaps shut on nothing, cracks and falls apart, and Siam lands
// with a grin. Transparent, 1080x1080, 60 fps, 150 frames.

const Cuff: React.FC<{ open: number }> = ({ open }) => (
  <g stroke={C.ink} strokeWidth={12} strokeLinejoin="round">
    <path d="M -120 0 A 120 120 0 0 1 120 0" fill="none" stroke="#5A606B" strokeWidth={48} transform={`rotate(${-open * 50} -120 0)`} />
    <path d="M -120 0 A 120 120 0 0 0 120 0" fill="none" stroke="#5A606B" strokeWidth={48} />
    <rect x={-150} y={-36} width={60} height={72} rx={12} fill="#7A808C" />
    <path d="M 120 0 L 120 -150" stroke="#5A606B" strokeWidth={22} />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={120} cy={-180 - i * 70} rx={24} ry={40} fill="none" stroke="#5A606B" strokeWidth={16} />)}
  </g>
);

export const T16Dodge: React.FC = () => {
  const f = useCurrentFrame();
  const SNAP = 52;
  const cy = interpolate(f, [8, SNAP], [-300, 760], { ...clamp, easing: Easing.in(Easing.cubic) });
  const open = interpolate(f, [8, SNAP - 4, SNAP], [1, 1, 0], clamp);
  // Siam's hop: up and to the left (the chain hangs on the right) from SNAP-14 to SNAP+12
  const hop = interpolate(f, [SNAP - 14, SNAP + 12], [0, 1], clamp);
  const sx = 540 - hop * 300, sy = 900 - Math.sin(hop * Math.PI) * 260;
  const sq = f > SNAP + 12 ? 1 - wobble(f, SNAP + 12, 2.6, 5) * 0.18 : 1;
  const breakT = interpolate(f, [SNAP + 10, SNAP + 70], [0, 1], clamp);
  const crack = f > SNAP + 4;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {!crack && <g transform={`translate(540 ${cy})`}><Cuff open={open} /></g>}
        {crack && [-1, 1].map((s) => (
          <g key={s} transform={`translate(${540 + s * breakT * 220} ${760 + breakT * breakT * 600}) rotate(${s * breakT * 120})`} opacity={1 - Math.max(0, breakT - 0.7) * 3.3}>
            <path d={s < 0 ? 'M -120 0 A 120 120 0 0 1 0 -120' : 'M 0 -120 A 120 120 0 0 1 120 0'} fill="none" stroke={C.ink} strokeWidth={60} />
            <path d={s < 0 ? 'M -120 0 A 120 120 0 0 1 0 -120' : 'M 0 -120 A 120 120 0 0 1 120 0'} fill="none" stroke="#5A606B" strokeWidth={48} />
            <path d={s < 0 ? 'M -120 0 A 120 120 0 0 0 0 120' : 'M 0 120 A 120 120 0 0 0 120 0'} fill="none" stroke={C.ink} strokeWidth={60} />
            <path d={s < 0 ? 'M -120 0 A 120 120 0 0 0 0 120' : 'M 0 120 A 120 120 0 0 0 120 0'} fill="none" stroke="#5A606B" strokeWidth={48} />
          </g>
        ))}
        {f >= SNAP && f < SNAP + 14 && (
          <g transform="translate(540 760)" opacity={1 - (f - SNAP) / 14}>
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2, r = 60 + (f - SNAP) * 14;
              return <path key={i} d={`M ${Math.cos(a) * r} ${Math.sin(a) * r} l ${Math.cos(a) * 40} ${Math.sin(a) * 40}`} stroke="#FFE27A" strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        )}
        <g transform={`translate(${sx} ${sy})`}>
          <CountryChar who="siam" size={300} f={f} mood={f < SNAP - 14 ? 'shifty' : f < SNAP + 12 ? 'scared' : 'smug'} look={f < SNAP ? 0.6 : 0.9} lookY={f < SNAP ? -0.6 : 0}
            squash={sq} armL={{ x: -60, y: hop > 0 && hop < 1 ? -160 : 180, bend: -1 }} armR={{ x: 120, y: hop > 0 && hop < 1 ? -160 : 120, bend: 1 }} shadow={hop === 0 || hop === 1} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
