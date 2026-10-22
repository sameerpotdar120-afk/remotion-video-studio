import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp, wobble } from './theme';

// u17_air_tag (line 9, the air masses; the reference's 53.2–61.0 s): a rounded label tag with a white rim slides in from
// `from` (left / top / bottom / right) in 12 frames with an overshoot, tilted a few degrees, then bobs gently. Its colour
// is the air mass (blue Arctic / Polar, purple returning polar, red tropical, yellow continental). Transparent,
// 600×300, 60 fps; the tag centred at (300, 150). Text in Hindi or English, up to three lines.
export const U17AirTag: React.FC<{ lines?: string[]; color?: string; from?: 'left' | 'top' | 'bottom' | 'right'; tilt?: number; dark?: boolean }> = ({
  lines = ['Arctic', 'Maritime'], color = '#1C5FD0', from = 'top', tilt = -6, dark = false,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const d = (1 - k) * 700;
  const [dx, dy] = from === 'left' ? [-d, 0] : from === 'right' ? [d, 0] : from === 'top' ? [0, -d] : [0, d];
  const bob = Math.sin(f / 22) * 5, rot = tilt + wobble(f, 12, 2.4, 4) * 6 + Math.sin(f / 30) * 1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `translate(${dx}px, ${dy + bob}px) rotate(${rot}deg)`, background: `linear-gradient(180deg, ${color}, ${color}CC)`, border: '5px solid #fff', borderRadius: 18,
        padding: '8px 22px 4px', textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 46, lineHeight: 1.0, color: dark ? '#1A1A10' : '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
