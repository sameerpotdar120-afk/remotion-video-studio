import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { pop, ramp } from './theme';

// c16_answer_type ("मतलब space के सबसे पास Nepal या China नहीं, Ecuador है।"; the reference's 81.2–84.3 s): the answer
// types in letter by letter in glowing gold, each letter popping; the subline types under it in white; a curved
// hand-drawn arrow draws down to the point, where a white-gold flare blooms and twinkles. Transparent, 1080×1080,
// 60 fps; the flare point is (`px`, `py`). `word` and `sub` are text (Hindi or English).
export const C16AnswerType: React.FC<{ word?: string; sub?: string; px?: number; py?: number }> = ({ word = 'Ecuador', sub = 'space के सबसे पास', px = 420, py = 760 }) => {
  useFonts();
  const f = useCurrentFrame();
  const chars = Array.from(word);
  const subChars = Array.from(sub);
  const nW = Math.floor(ramp(f, 0, 26, (t) => t) * (chars.length + 0.99));
  const nS = Math.floor(ramp(f, 30, 60, (t) => t) * (subChars.length + 0.99));
  const arrow = ramp(f, 34, 56, Easing.inOut(Easing.cubic));
  const flare = pop(f, 50, 66, 2);
  const tw = 1 + 0.15 * Math.sin(f / 4);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="flare"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.3" stopColor="#FFF1B8" stopOpacity={0.9} /><stop offset="1" stopColor="#FFC83D" stopOpacity={0} /></radialGradient>
        </defs>
        <path d={`M 720 470 C 640 520 500 600 ${px + 14} ${py - 40}`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="520" strokeDashoffset={520 * (1 - arrow)} />
        {arrow > 0.95 && <path d={`M ${px + 14} ${py - 40} l -2 -34 M ${px + 14} ${py - 40} l 30 -14`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />}
        {flare > 0 && (
          <g transform={`translate(${px} ${py}) scale(${flare * tw})`}>
            <circle r={90} fill="url(#flare)" />
            <path d="M -110 0 H 110 M 0 -110 V 110" stroke="#fff" strokeWidth={5} opacity={0.8} />
            <path d="M -50 -50 L 50 50 M 50 -50 L -50 50" stroke="#fff" strokeWidth={3} opacity={0.5} />
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 150, lineHeight: 1, color: '#FFF3C4',
        textShadow: '0 0 24px #FFC83D, 0 0 60px #F29A12, 0 0 110px rgba(242,154,18,0.6)', whiteSpace: 'nowrap' }}>
        {chars.slice(0, nW).map((ch, i) => (
          <span key={i} style={{ display: 'inline-block', transform: `scale(${pop(f, (i * 26) / chars.length, (i * 26) / chars.length + 8, 3)})`, transformOrigin: '50% 80%' }}>{ch}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff',
        textShadow: '0 0 18px rgba(255,200,61,0.6), 0 4px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>{subChars.slice(0, nS).join('')}</div>
    </AbsoluteFill>
  );
};
