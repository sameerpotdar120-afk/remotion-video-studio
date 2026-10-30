import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, useFonts } from './font';
import { C, clamp, wobble } from './theme';

// s07_slope (line 5, "लंबी, धीमी चढ़ाई… लेकिन सिक्किम में ज़मीन सीधी ऊपर उठती है"): a side-view card. Top: a long gentle
// ramp, a train glides up it, a green ✓ and "GENTLE". At `steep`, the bottom half: a jagged Himalayan profile, the
// train starts up, its wheels slip back, a red ✕ and "STEEP". Centred card 900 wide. Transparent outside the card.
const Train: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x},${y}) rotate(${a})`}>
    {[0, 1, 2].map((k) => <rect key={k} x={-k * 50 - 46} y={-30} width={44} height={26} rx={5} fill={k ? '#C7CFD6' : C.gold} stroke="#111" strokeWidth={2} />)}
    {[0, 1, 2].map((k) => <circle key={k} cx={-k * 50 - 24} cy={-2} r={5} fill="#111" />)}
  </g>
);
const Mark: React.FC<{ ok: boolean; x: number; y: number; s: number }> = ({ ok, x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={38} fill={ok ? '#1FBF6A' : C.red} stroke="#fff" strokeWidth={4} />
    <path d={ok ? 'M-16,0 L-4,13 L18,-12' : 'M-14,-14 L14,14 M14,-14 L-14,14'} stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);
export const S07Slope: React.FC<{ steep?: number; out?: number }> = ({ steep = 90, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const In = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  // top: gentle ramp from (60, 330) to (840, 220)
  const g = interpolate(f, [8, steep - 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const ga = Math.atan2(-110, 780) * 180 / Math.PI;
  const okS = interpolate(f, [steep - 30, steep - 20], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  // bottom: jagged profile
  const B = interpolate(f, [steep, steep + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const prof = 'M40,740 L170,735 L240,560 L300,610 L380,420 L450,500 L520,380 L600,520 L660,460 L740,600 L860,610';
  const up = interpolate(f, [steep + 10, steep + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const slip = interpolate(f, [steep + 34, steep + 50], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sx = 170 + 52 * (up - slip * 0.7), sy = 735 - 175 * (up - slip * 0.7);
  const sa = Math.atan2(-175, 70) * 180 / Math.PI * Math.min(1, up * 3);
  const noS = interpolate(f, [steep + 44, steep + 54], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const shake = wobble(f, steep + 44, 4, 6) * 10;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: O, pointerEvents: 'none' }}>
      <div style={{ width: 900, height: 860, transform: `scale(${0.6 + 0.4 * In})`, opacity: In, borderRadius: 26, background: 'linear-gradient(180deg, rgba(14,22,28,0.94), rgba(6,10,14,0.94))',
        border: '2px solid rgba(127,255,248,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
        <svg width={900} height={860}>
          <text x={60} y={86} fontFamily={LABEL} fontWeight={800} fontSize={34} letterSpacing={4} fill={C.cyanGlow}>TRAIN NEEDS</text>
          <path d="M60,330 L840,220 L840,360 L60,360Z" fill="#20323C" />
          <path d="M60,330 L840,220" stroke="#E8EEF2" strokeWidth={5} />
          <Train x={110 + 720 * g} y={323 - 101.5 * g} a={ga} />
          <text x={560} y={330} fontFamily={TITLE} fontSize={44} fill="#9FF5B8">GENTLE</text>
          {okS > 0 && <Mark ok x={800} y={130} s={okS} />}
          <line x1={40} y1={420} x2={860} y2={420} stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="8 10" opacity={B} />
          <g opacity={B} transform={`translate(${shake},0)`}>
            <text x={60} y={480} fontFamily={LABEL} fontWeight={800} fontSize={34} letterSpacing={4} fill="#FFB0A8">SIKKIM</text>
            <path d={`${prof} L860,800 L40,800Z`} fill="#2A3B44" />
            <path d={prof} stroke="#E8EEF2" strokeWidth={5} fill="none" strokeLinejoin="round" />
            <path d="M380,420 L410,456 L395,452 L380,440 L362,452 L352,448Z M520,380 L548,414 L520,404 L496,412Z" fill="#fff" />
            {up > 0 && <Train x={sx} y={sy} a={sa} />}
            <text x={250} y={700} fontFamily={TITLE} fontSize={44} fill="#FFB0A8">STEEP</text>
            {noS > 0 && <Mark ok={false} x={800} y={500} s={noS} />}
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
