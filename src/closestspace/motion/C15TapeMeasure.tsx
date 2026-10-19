import React from 'react';
import { AbsoluteFill, Easing, Img, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { PP0, Plush } from './Plush';
import { C, pop, ramp } from './theme';

// c15_tape_measure ("पर धरती के center से नापो, तो इसकी चोटी Everest से 2 किलोमीटर ज़्यादा दूर है"; the reference's
// 75.0–81.2 s, where plain lines run from the centre to both summits): our version is a chunky tape measure at the
// Earth's centre. Two yellow tapes unroll out to the two summits on the limb, ticking as they go; a plush climber waits
// on each summit (Everest orange, Chimborazo teal); the readouts pop (6,382 km blue, 6,384 km red); "+2 km" pops in
// gold and the Chimborazo climber cheers while the Everest one droops. Transparent, 1080×1080, 60 fps; the centre is
// (540, 620), summit A at angle `aA`, summit B at `aB` (degrees, 0 = right, -90 = up), radius `r`.
const tape = (x0: number, y0: number, x1: number, y1: number, t: number, f: number) => {
  const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
  const len = Math.hypot(x - x0, y - y0);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return (
    <g transform={`translate(${x0} ${y0}) rotate(${ang})`}>
      <rect x={0} y={-15} width={len} height={30} fill="#FFD43B" stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: Math.floor(len / 24) }, (_, i) => <path key={i} d={`M ${i * 24 + ((f * 2) % 24) * (t < 1 ? 1 : 0)} -15 v ${i % 4 === 0 ? 18 : 9}`} stroke={C.ink} strokeWidth={3} />)}
      {t > 0 && <rect x={len - 6} y={-19} width={12} height={38} fill="#C9D1DA" stroke={C.ink} strokeWidth={3} />}
    </g>
  );
};
export const C15TapeMeasure: React.FC<{ r?: number; aA?: number; aB?: number; textA?: string; textB?: string; diff?: string; caseImg?: { src: string; w: number; h: number } }> = ({
  r = 400, aA = -55, aB = -125, textA = '6,382 km', textB = '6,384 km', diff = '+2 km', caseImg,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const cx = 540, cy = 620;
  const pt = (a: number, k = 1) => [cx + Math.cos((a * Math.PI) / 180) * r * k, cy + Math.sin((a * Math.PI) / 180) * r * k];
  const A = pt(aA, 1), B = pt(aB, 1.012);
  const box = pop(f, 0, 14, 2);
  const tA = ramp(f, 16, 56, Easing.inOut(Easing.cubic));
  const tB = ramp(f, 40, 84, Easing.inOut(Easing.cubic));
  const lA = pop(f, 56, 70, 2), lB = pop(f, 84, 98, 2);
  const pl = pop(f, 110, 124, 2.6);
  const cheer = ramp(f, 112, 124);
  const climberPose = (win: number, who: 'a' | 'b') => ({
    ...PP0, arms: 1,
    lx: -160, ly: who === 'b' ? -300 * win + 60 : 80 + 40 * win, rx: 160, ry: who === 'b' ? -300 * win + 60 : 80 + 40 * win,
    mouth: who === 'b' ? (win > 0.5 ? ('grin' as const) : ('smile' as const)) : win > 0.5 ? ('frown' as const) : ('smile' as const),
    brow: who === 'b' ? 0.4 * win : 0.9 * win, hop: who === 'b' ? Math.abs(Math.sin(f / 7)) * 50 * win : 0, sweat: who === 'a' ? win : 0,
  });
  const peak = (p: number[], a: number) => (
    <g transform={`translate(${p[0]} ${p[1]}) rotate(${a + 90})`}>
      <path d="M -70 30 L 0 -50 L 70 30 Z" fill="#8C7D6E" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -30 -6 L 0 -50 L 30 -6 L 14 -14 L 0 -4 L -14 -14 Z" fill="#fff" />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute' }}>
        {peak(A, aA)}{peak(B, aB)}
        {tape(cx, cy, A[0], A[1], tA, f)}
        {tape(cx, cy, B[0], B[1], tB, f)}
        {/* the tape-measure case at the centre */}
        <g transform={`translate(${cx} ${cy}) scale(${box})`} opacity={caseImg ? 0 : 1}>
          <rect x={-70} y={-62} width={140} height={124} rx={36} fill="#FFC83D" stroke={C.ink} strokeWidth={7} />
          <circle r={36} fill="#2A2E38" stroke={C.ink} strokeWidth={5} />
          <circle r={14} fill="#C9D1DA" />
          <rect x={-74} y={20} width={30} height={30} rx={6} fill="#E1261C" stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform={`translate(${A[0] + Math.cos((aA * Math.PI) / 180) * 40} ${A[1] + Math.sin((aA * Math.PI) / 180) * 40}) scale(0.16)`}><Plush who="climberA" f={f} pose={climberPose(cheer, 'a')} /></g>
        <g transform={`translate(${B[0] + Math.cos((aB * Math.PI) / 180) * 40} ${B[1] + Math.sin((aB * Math.PI) / 180) * 40}) scale(0.16)`}><Plush who="climberB" f={f} pose={climberPose(cheer, 'b')} /></g>
      </svg>
      {caseImg && (
        <div style={{ position: 'absolute', left: cx - 95, top: cy - (95 * caseImg.h) / caseImg.w, width: 190, height: (190 * caseImg.h) / caseImg.w, transform: `scale(${box})`,
          filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.5))' }}><Img src={caseImg.src} style={{ width: '100%', height: '100%' }} /></div>
      )}
      {[[A, lA, textA, 'rgba(61,139,255,0.92)', 1], [B, lB, textB, 'rgba(255,59,59,0.92)', -1]].map(([p, s, t, col, side], i) => (
        (s as number) > 0 ? (
          <div key={i} style={{ position: 'absolute', left: (cx + (p as number[])[0]) / 2 + (side as number) * 70, top: (cy + (p as number[])[1]) / 2 - 10, transform: `translate(-50%, -50%) scale(${s})`,
            fontFamily: NUM, fontSize: 46, color: '#fff', padding: '2px 18px', borderRadius: 34, background: col as string, border: '3px solid rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>{t as string}</div>
        ) : null
      ))}
      {pl > 0 && (
        <div style={{ position: 'absolute', left: B[0] - 60, top: B[1] - 170, transform: `translate(-50%, -50%) scale(${pl * (1 + 0.06 * Math.sin(f / 6))})`, fontFamily: NUM, fontSize: 92,
          color: '#FFF3C4', textShadow: '0 0 20px #FFC83D, 0 0 50px #F29A12, 0 4px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>{diff}</div>
      )}
    </AbsoluteFill>
  );
};
