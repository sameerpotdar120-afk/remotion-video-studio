import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { lerp, ramp } from './theme';

// w20_border_sweep (line 11, "और यूँ इन दोनों देशों को मिली अपनी पहली ज़मीनी सरहद"; the reference's 58.6–60.0 s): a
// dashed white line draws through the island from top to bottom along the border (it bends where the strait bends),
// then the two names, huge and rotated 90°, sweep in from the edges on either side of it. Transparent, 1080×1920,
// 60 fps; the island is (540, 960); `left` and `right` are the names (Hindi or English).
export const W20BorderSweep: React.FC<{ left?: string; right?: string; angle?: number }> = ({ left = 'CANADA', right = 'DENMARK', angle = 14 }) => {
  useFonts();
  const f = useCurrentFrame();
  const d = ramp(f, 0, 34, Easing.inOut(Easing.cubic));
  const s = ramp(f, 30, 48, Easing.out(Easing.back(1.3)));
  const path = 'M 760 -40 Q 640 500 560 900 Q 520 1200 420 1960';
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <path d={path} stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="26 18" pathLength={1} style={{ strokeDasharray: `${d} 1` }} />
        {d > 0.99 && <path d={path} stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="26 18" />}
        <circle cx={545} cy={960} r={14} fill="#E8D9B8" stroke="#fff" strokeWidth={4} />
      </svg>
      {[[left, -1], [right, 1]].map(([t, side], i) => (
        <div key={i} style={{ position: 'absolute', left: 540 + (side as number) * lerp(900, 330, s), top: 960, transform: `translate(-50%,-50%) rotate(${(side as number) * 90 + (side as number) * -angle * 0.2}deg)`,
          fontFamily: NUM, fontSize: 210, color: '#fff', letterSpacing: 8, whiteSpace: 'nowrap', opacity: s, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{t as string}</div>
      ))}
    </AbsoluteFill>
  );
};
