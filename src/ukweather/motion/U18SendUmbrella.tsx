import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UmbrellaSvg } from './Tourist';
import { clamp, pop } from './theme';

// u18_send_umbrella (line 12, "ये video उस दोस्त को भेजो, जो London जाने का सपना देखता है, पर छाता कभी साथ नहीं रखता"):
// our close. A round blue send button pops and pulses like a tap; an open umbrella (the gift for that friend) drifts
// down onto it; at `launch` a paper plane carrying the umbrella flies off top-right on a dashed trail. Text-free.
// Transparent, 600×700, 60 fps.
export const U18SendUmbrella: React.FC<{ launch?: number }> = ({ launch = 70 }) => {
  const f = useCurrentFrame();
  const btn = pop(f, 0, 14, 2.4);
  const tap = 1 - 0.1 * Math.max(0, Math.sin(((f - 24) / 14) * Math.PI)) * (f > 24 && f < 52 ? 1 : 0);
  const drop = interpolate(f, [10, 40], [-500, 0], { ...clamp, easing: Easing.out(Easing.bounce) });
  const fly = interpolate(f, [launch, launch + 40], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const px = 300 + fly * 500, py = 420 - fly * 700 - Math.sin(fly * Math.PI) * 80;
  return (
    <AbsoluteFill>
      <svg width={600} height={700}>
        <g transform={`translate(300 520) scale(${btn * tap})`} opacity={1 - fly}>
          <circle r={120} fill="#2F80FF" stroke="#fff" strokeWidth={10} />
          <circle r={120} fill="none" stroke="#2F80FF" strokeWidth={6} opacity={0.4} transform={`scale(${1 + ((f % 40) / 40) * 0.5})`} />
        </g>
        {fly > 0 && <path d={`M 300 420 Q 380 300 ${px} ${py}`} stroke="#fff" strokeWidth={6} strokeDasharray="16 12" fill="none" opacity={0.8 * (1 - fly)} />}
        <g transform={`translate(${fly > 0 ? px : 300} ${(fly > 0 ? py : 420) + drop}) rotate(${-20 - fly * 25}) scale(${0.9 + fly * 0.2})`}>
          <path d="M -60 0 L 70 -50 L 20 60 L 5 15 Z" fill="#fff" stroke="#14161C" strokeWidth={6} strokeLinejoin="round" />
          <g transform="translate(10 -10) scale(0.28) rotate(20)"><UmbrellaSvg state="open" open={1} f={f} /></g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
