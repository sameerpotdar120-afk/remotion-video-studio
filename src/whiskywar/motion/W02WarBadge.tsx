import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { pop, ramp } from './theme';

// w02_war_badge (line 1; the reference's 1.25–3.1 s): a glossy red disc "WAR?" pops mid-ocean with a bounce, two thick
// white curved arrows draw in from both sides and stab into it, and the badge pulses like a heartbeat. Transparent,
// 1080×1080, 60 fps; the badge sits at (540, 540); the arrows start at `a` and `b`. `text` can be Hindi ("जंग?").
export const W02WarBadge: React.FC<{ text?: string; a?: [number, number]; b?: [number, number] }> = ({ text = 'WAR?', a = [80, 820], b = [1000, 380] }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 8, 22, 2.4);
  const pulse = 1 + 0.06 * Math.max(0, Math.sin((f - 24) / 7)) * (f > 24 ? 1 : 0);
  const da = ramp(f, 0, 18, Easing.inOut(Easing.cubic)), db = ramp(f, 6, 24, Easing.inOut(Easing.cubic));
  const arrow = (p: [number, number], k: number, bend: number) => {
    const [x0, y0] = p, x1 = 540 + Math.sign(x0 - 540) * 175, y1 = 540 + Math.sign(y0 - 540) * 30;
    const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2 - Math.abs(bend);
    const ang = (Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI;
    return (
      <g>
        <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} stroke="#fff" strokeWidth={30} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`}
          style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' }} />
        {k > 0.97 && <path d="M -10 -34 L 40 0 L -10 34 Z" fill="#fff" transform={`translate(${x1} ${y1}) rotate(${ang})`} />}
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs>
          <radialGradient id="wbG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#FF6A5E" /><stop offset="0.6" stopColor="#D8161B" /><stop offset="1" stopColor="#8A0A0E" /></radialGradient>
        </defs>
        {arrow(a, da, -120)}{arrow(b, db, 120)}
        <g transform={`translate(540 540) scale(${s * pulse})`}>
          <circle r={128} fill="#fff" opacity={0.25} />
          <circle r={110} fill="url(#wbG)" stroke="#fff" strokeWidth={8} />
          <ellipse cx={-30} cy={-55} rx={55} ry={22} fill="#fff" opacity={0.25} />
          <text y={22} textAnchor="middle" fontFamily={NUM} fontSize={62} fill="#fff">{text}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
