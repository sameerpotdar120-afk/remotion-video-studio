import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { SCRIPT, useFonts } from './font';
import { C, lerp, pop, ramp } from './theme';

// w15_script_note (lines 7 and 9, "Danish Island में आपका स्वागत है" / "Canada में आपका स्वागत है"; the reference's
// 35.3–37.7 and 50.0–51.4 s): a torn-paper note slides up into the middle while the scene behind blurs (the edit blurs
// it), the message writes on letter by letter in red script with a little underline flourish, then the note shrinks
// and flies onto the flag pole as a small sign at `sign`. Transparent, 1080×1920, 60 fps. `text` and `sub` (a second,
// smaller line, e.g. the Danish "Velkommen til den danske ø").
const TORN = 'M 0 18 L 40 4 L 90 16 L 150 2 L 210 14 L 270 0 L 330 12 L 400 2 L 460 16 L 520 4 L 580 14 L 640 0 L 700 12 L 760 4 L 800 18 L 796 80 L 804 150 L 798 222 L 760 236 L 700 224 L 640 238 L 580 226 L 520 240 L 460 228 L 400 238 L 330 226 L 270 240 L 210 228 L 150 238 L 90 226 L 40 236 L 2 224 L 6 150 L -2 80 Z';
export const W15ScriptNote: React.FC<{ text?: string; sub?: string; sign?: [number, number]; shrink?: number }> = ({
  text = 'Welcome to the Danish Island', sub, sign = [640, 760], shrink = 150,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const up = pop(f, 0, 16, 1.4);
  const chars = Array.from(text);
  const n = Math.floor(ramp(f, 14, 110, (t) => t) * chars.length);
  const flo = ramp(f, 108, 124);
  const s = ramp(f, shrink, shrink + 20, Easing.inOut(Easing.cubic));
  const x = lerp(540, sign[0], s), y = lerp(960 + (1 - up) * 900, sign[1], s);
  const sc = lerp(1, 0.36, s);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - 400, top: y - 120, width: 800, height: 240, transform: `scale(${sc}) rotate(${lerp(-2, 3, s)}deg)` }}>
        <svg width={800} height={240} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.4))' }}>
          <defs>
            <linearGradient id="noteG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6EDD6" /><stop offset="1" stopColor="#E3D3AE" /></linearGradient>
          </defs>
          <path d={TORN} fill="url(#noteG)" />
          {[60, 100, 140, 180].map((yy) => <path key={yy} d={`M 30 ${yy} H 770`} stroke="#D2C29E" strokeWidth={2} opacity={0.5} />)}
          <path d={`M 120 ${sub ? 128 : 160} q 140 26 280 0 t 280 0`} stroke={C.noteInk} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${flo} 1`} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: sub ? 38 : 70, textAlign: 'center', fontFamily: SCRIPT, fontWeight: 700, fontSize: Math.min(70, 1500 / Math.max(1, chars.length)), color: C.noteInk, whiteSpace: 'nowrap' }}>
          {chars.slice(0, n).join('')}
        </div>
        {sub && <div style={{ position: 'absolute', left: 0, right: 0, top: 148, textAlign: 'center', fontFamily: SCRIPT, fontSize: 48, color: C.noteInk, opacity: ramp(f, 100, 120) }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
