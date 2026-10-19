import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, pop, ramp } from './theme';

// c01_peak_pins (hook, "सोचो, दुनिया का कौन सा देश space के सबसे पास है?"; the reference's 0.0–3.1 s): small white pins
// pop on the big peaks one after another, then each lifts off on a dashed white stem that grows straight up, like
// balloons let go toward space, with a soft glow at the head. Transparent, 1080×1920, 60 fps. Peaks are screen points
// (pass your own `pts` to match the map); `rise` is the frame the stems start growing.
const DEF: [number, number][] = [[180, 1150], [300, 1380], [520, 1060], [610, 1300], [760, 1120], [880, 1240], [960, 1460], [420, 1230]];
export const C01PeakPins: React.FC<{ pts?: [number, number][]; rise?: number; height?: number }> = ({ pts = DEF, rise = 40, height = 900 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="pinGlow"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
        </defs>
        {pts.map(([x, y], i) => {
          const a = 4 + i * 3;
          const s = pop(f, a, a + 12, 2.4);
          const r0 = rise + i * 4;
          const up = ramp(f, r0, r0 + 70, Easing.inOut(Easing.cubic)) * (height * (0.75 + 0.25 * ((i * 37) % 10) / 10));
          const sway = Math.sin((f + i * 13) / 18) * 6 * ramp(f, r0, r0 + 30);
          if (s <= 0) return null;
          return (
            <g key={i}>
              {up > 2 && <path d={`M ${x} ${y} L ${x + sway} ${y - up}`} stroke="#fff" strokeWidth={5} strokeDasharray="18 12" strokeDashoffset={-f * 1.5} opacity={0.9} />}
              <circle cx={x} cy={y} r={7 * s} fill="#fff" opacity={0.8} />
              <g transform={`translate(${x + sway} ${y - up}) scale(${s})`}>
                <circle r={40} fill="url(#pinGlow)" opacity={0.6} />
                <circle r={15} fill="#fff" stroke="rgba(0,0,0,0.35)" strokeWidth={3} />
                <circle cx={-4} cy={-4} r={5} fill="#DDE8FF" />
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
