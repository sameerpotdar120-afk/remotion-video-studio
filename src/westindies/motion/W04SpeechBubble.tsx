import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { idle, ramp, TypeOn, wobble } from './theme';

// w04_speech_bubble (line 7, Columbus: "उसे लगा, यही India है"; the reference's 0:37.5–0:38.0, built in 15 frames): a
// yellow bubble that grows the way the reference's does: a short vertical tick drops (frames 0–4), the tail opens out
// of it (4–8), the bar stretches sideways from the tail with an elastic overshoot (8–15), then the text types on and
// the bubble floats. Transparent, 700×360, 60 fps (frame counts doubled from the 30 fps reference); the tail's tip is
// at (220, 330).
export const W04SpeechBubble: React.FC<{ text?: string; color?: string; ink?: string }> = ({ text = 'यही India है?', color = '#FFE21F', ink = '#14110A' }) => {
  useFonts();
  const f = useCurrentFrame();
  const tick = ramp(f, 0, 8, Easing.out(Easing.quad));
  const tail = ramp(f, 8, 16, Easing.out(Easing.back(2)));
  const bar = ramp(f, 16, 30, Easing.out(Easing.back(1.6)));
  const land = wobble(f, 30, 3, 8);
  const [ix, iy, ir] = idle(f, 5, 0.5);
  const W = 560 * bar, H = 120;
  return (
    <AbsoluteFill style={{ transform: `translate(${ix}px, ${iy}px) rotate(${ir * 0.6}deg)` }}>
      <svg width={700} height={360} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))' }}>
        {tail <= 0 && <path d={`M 220 ${330 - 70 * tick} L 220 330`} stroke={color} strokeWidth={10} strokeLinecap="round" />}
        {tail > 0 && <path d={`M ${220 - 34 * tail} 140 L 220 330 L ${220 + 34 * tail} 140 Z`} fill={color} />}
        {bar > 0 && <rect x={220 - W * 0.32} y={90 - (H / 2) * (1 + 0.05 * land)} width={W} height={H * (1 + 0.05 * land)} rx={H / 2.4} fill={color} />}
      </svg>
      {bar > 0.6 && (
        <div style={{ position: 'absolute', left: 220 - 560 * 0.32, top: 90 - H / 2, width: 560, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 64, color: ink, whiteSpace: 'pre', lineHeight: 1 }}>
          <TypeOn text={text} f={f} at={26} step={2} />
        </div>
      )}
    </AbsoluteFill>
  );
};
