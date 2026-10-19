import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp, pop, ramp } from './theme';

// c17_send_pop ("ये video उस दोस्त को भेजो, जो कहता है कि Everest से ऊपर कुछ नहीं।"; our close, a send prompt): a round
// white button with a paper plane pops in, pulses twice like a tap, then the plane launches out of it on a looping
// dashed trail toward the top-right and away. Text-free. Transparent, 600×600, 60 fps.
const Plane: React.FC = () => (
  <g>
    <path d="M -60 0 L 70 -50 L 20 60 L 5 15 Z" fill="#fff" stroke="#14161C" strokeWidth={6} strokeLinejoin="round" />
    <path d="M 5 15 L 70 -50" stroke="#14161C" strokeWidth={5} />
    <path d="M 5 15 L 0 45 L 20 60" fill="#DDE6F2" stroke="#14161C" strokeWidth={5} strokeLinejoin="round" />
  </g>
);
export const C17SendPop: React.FC<{ launch?: number }> = ({ launch = 60 }) => {
  const f = useCurrentFrame();
  const btn = pop(f, 0, 14, 2.4);
  const tap = 1 - 0.1 * Math.max(0, Math.sin(((f - 20) / 14) * Math.PI)) * (f > 20 && f < 48 ? 1 : 0);
  const fly = ramp(f, launch, launch + 40, Easing.in(Easing.quad));
  const fade = 1 - ramp(f, launch + 20, launch + 40);
  const px = interpolate(fly, [0, 0.5, 1], [300, 360, 760], clamp);
  const py = interpolate(fly, [0, 0.5, 1], [300, 160, -200], clamp);
  return (
    <AbsoluteFill>
      <svg width={600} height={600}>
        <g transform={`translate(300 300) scale(${btn * tap})`} opacity={fly > 0 ? fade : 1}>
          <circle r={120} fill="#2F80FF" stroke="#fff" strokeWidth={10} />
          <circle r={120} fill="none" stroke="#2F80FF" strokeWidth={6} opacity={0.4} transform={`scale(${1 + ((f % 40) / 40) * 0.5})`} />
        </g>
        {fly > 0 && <path d={`M 300 300 Q 330 220 ${px} ${py}`} stroke="#fff" strokeWidth={6} strokeDasharray="16 12" fill="none" opacity={0.8 * fade} />}
        <g transform={`translate(${fly > 0 ? px : 300} ${fly > 0 ? py : 300}) rotate(${-20 - fly * 25}) scale(${btn * (1 + fly * 0.3)})`}><Plane /></g>
      </svg>
    </AbsoluteFill>
  );
};
