import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, wobble } from './theme';

// w06_columbus (lines 7–8, Columbus at sea, looking out and "finding India"): the creator's two-part rig (wi05 body,
// wi05b right arm with the spyglass), pivoted at the shoulder. He breathes (a 1% chest rise), his cloak sways, and
// at `raise` the arm lifts the spyglass to his eye in 18 frames with an overshoot and a settle; at `look` he leans
// forward slightly as if spotting land. Until the images arrive a simple painted stand-in is drawn. Transparent,
// 600×800, 60 fps; the shoulder pivot is at (370, 330).
export const W06Columbus: React.FC<{ body?: string; arm?: string; raise?: number; look?: number }> = ({ body, arm, raise = 30, look = 9999 }) => {
  const f = useCurrentFrame();
  const up = interpolate(f, [raise, raise + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const ang = 70 - 100 * up + wobble(f, raise + 18, 2.5, 6) * 4;
  const lean = interpolate(f, [look, look + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const breathe = 1 + 0.01 * Math.sin(f / 22);
  const sway = Math.sin(f / 30) * 1.2;
  return (
    <AbsoluteFill style={{ transformOrigin: '300px 780px', transform: `rotate(${lean * 4 + sway * 0.3}deg) scale(${breathe})` }}>
      {body ? <Img src={body} style={{ position: 'absolute', inset: 0, width: 600, height: 800, objectFit: 'contain' }} /> : (
        <svg width={600} height={800} style={{ position: 'absolute', inset: 0 }}>
          <defs><linearGradient id="w06c" x1="0" x2="1"><stop offset="0" stopColor="#1A1410" /><stop offset="0.5" stopColor="#3A2C22" /><stop offset="1" stopColor="#15100C" /></linearGradient></defs>
          <path d={`M 150 800 C 150 560 190 380 300 350 C 410 380 450 560 450 800 Z`} fill="url(#w06c)" transform={`skewX(${sway})`} />
          <path d="M 260 360 L 300 420 L 340 360 Z" fill="#EDE6D6" />
          <ellipse cx={300} cy={270} rx={62} ry={78} fill="#D9A984" />
          <path d="M 236 250 C 230 170 290 150 330 168 C 372 186 372 240 366 300 L 352 250 C 340 210 270 200 250 260 Z" fill="#6A5848" />
          <path d="M 236 250 C 226 300 230 340 248 350 L 250 270 Z" fill="#6A5848" />
          <rect x={275} y={262} width={14} height={5} rx={2} fill="#3A2416" /><rect x={312} y={262} width={14} height={5} rx={2} fill="#3A2416" />
          <path d="M 288 312 Q 300 318 314 312" stroke="#8A4A34" strokeWidth={4} fill="none" strokeLinecap="round" />
        </svg>
      )}
      <div style={{ position: 'absolute', left: 370 - 60, top: 330 - 60, width: 300, height: 300, transformOrigin: '60px 60px', transform: `rotate(${ang}deg)` }}>
        {arm ? <Img src={arm} style={{ width: 300, height: 300, objectFit: 'contain' }} /> : (
          <svg width={300} height={300} style={{ overflow: 'visible' }}>
            <path d="M 60 60 L 200 40" stroke="#2A2018" strokeWidth={46} strokeLinecap="round" />
            <circle cx={210} cy={40} r={20} fill="#D9A984" />
            <rect x={200} y={22} width={110} height={30} rx={6} fill="#B8862E" stroke="#5A3C10" strokeWidth={3} />
            <rect x={300} y={18} width={24} height={38} rx={5} fill="#D9AE48" stroke="#5A3C10" strokeWidth={3} />
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};
