import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, pop, ramp } from './theme';

// c14_radius_lines ("धरती के center से equator तक की दूरी, poles के मुकाबले 21 किलोमीटर ज़्यादा है"; the reference's
// 59.2–64.4 s): a white dot at the globe's centre; a thin blue line rises to the North Pole with a blue pill "6,357 km";
// a red line runs out to the equator edge (a touch past the circle, the bulge) with a red pill "6,378 km"; then "+21 km"
// pops above the red pill in glowing gold. Transparent, 1080×1080, 60 fps; centre (540, 540), radius `r`.
const Pill: React.FC<{ x: number; y: number; s: number; text: string; col: string }> = ({ x, y, s, text, col }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, fontFamily: NUM, fontSize: 50, color: '#fff',
    padding: '2px 22px', borderRadius: 40, background: col, boxShadow: `0 0 30px ${col}`, border: '3px solid rgba(255,255,255,0.85)', whiteSpace: 'nowrap', letterSpacing: 1 }}>{text}</div>
);
export const C14RadiusLines: React.FC<{ r?: number; polar?: string; equator?: string; diff?: string; plus?: number }> = ({
  r = 330, polar = '6,357 km', equator = '6,378 km', diff = '+21 km', plus = 110,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const dot = pop(f, 0, 10, 2.4);
  const up = ramp(f, 8, 34, Easing.inOut(Easing.cubic));
  const p1 = pop(f, 30, 44, 2);
  const out = ramp(f, 50, 76, Easing.inOut(Easing.cubic));
  const p2 = pop(f, 72, 86, 2);
  const pl = pop(f, plus, plus + 14, 2.6);
  const eq = r * 1.035;
  const glow = 1 + 0.08 * Math.sin((f - plus) / 6);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute' }}>
        <path d={`M 540 540 V ${540 - r * up}`} stroke={C.polar} strokeWidth={7} />
        {up > 0.98 && <circle cx={540} cy={540 - r} r={11} fill={C.polar} stroke="#fff" strokeWidth={4} />}
        <path d={`M 540 540 H ${540 + eq * out}`} stroke={C.equator} strokeWidth={7} />
        {out > 0.98 && <circle cx={540 + eq} cy={540} r={11} fill={C.equator} stroke="#fff" strokeWidth={4} />}
        <circle cx={540} cy={540} r={12 * dot} fill="#fff" />
      </svg>
      {p1 > 0 && <Pill x={430} y={540 - r * 0.62} s={p1} text={polar} col="rgba(61,139,255,0.92)" />}
      {p2 > 0 && <Pill x={540 + eq * 0.62} y={590} s={p2} text={equator} col="rgba(255,59,59,0.92)" />}
      {pl > 0 && (
        <div style={{ position: 'absolute', left: 540 + eq * 0.62, top: 470, transform: `translate(-50%, -50%) scale(${pl * glow})`, fontFamily: NUM, fontSize: 84, color: '#FFF3C4',
          textShadow: '0 0 20px #FFC83D, 0 0 50px #F29A12, 0 4px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>{diff}</div>
      )}
      <div style={{ display: 'none', fontFamily: UI }} />
    </AbsoluteFill>
  );
};
