import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { CanadaFlag, DenmarkFlag } from './Flags';
import { NUM, useFonts } from './font';
import { ramp } from './theme';

// w01_flag_fill (line 1, "सोचो, दो देश … जंग लड़ते रहे"; the reference's 0.0–1.25 s): a red dot pops inside the country,
// and the flag wipes out from it in a growing circle to fill the country's shape, waving inside it, with the name in
// big white outlined letters across it. Transparent, 1080×1080, 60 fps. `d` is the country outline as an SVG path in
// this box (the edit passes the projected Natural Earth outline); `from` is where the wipe starts.
const DEMO = 'M 160 380 Q 260 250 430 300 Q 560 200 700 290 Q 860 260 930 420 Q 900 600 760 640 Q 600 720 430 660 Q 250 700 180 560 Z';
export const W01FlagFill: React.FC<{ kind?: 'canada' | 'denmark'; d?: string; from?: [number, number]; label?: string; size?: number }> = ({
  kind = 'canada', d = DEMO, from = [540, 470], label = 'CANADA', size = 120,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const dot = ramp(f, 0, 6);
  const r = ramp(f, 6, 48, Easing.out(Easing.cubic)) * 900;
  const txt = ramp(f, 30, 46);
  const id = `ff-${kind}`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs>
          <clipPath id={`${id}-c`}><path d={d} /></clipPath>
          <clipPath id={`${id}-r`}><circle cx={from[0]} cy={from[1]} r={Math.max(0.1, r)} /></clipPath>
        </defs>
        <g clipPath={`url(#${id}-c)`}>
          <g clipPath={`url(#${id}-r)`}>
            <g transform="translate(60 220)">{kind === 'canada' ? <CanadaFlag w={960} h={480} f={f} wave={1} uid={id} /> : <DenmarkFlag w={960} h={727} f={f} wave={1} uid={id} />}</g>
          </g>
        </g>
        {r < 40 && <circle cx={from[0]} cy={from[1]} r={18 * dot} fill="#E1261C" />}
        <text x={from[0]} y={from[1] + size * 0.35} textAnchor="middle" fontFamily={NUM} fontSize={size} fill="#fff" stroke="#1A3A6A" strokeWidth={10} paintOrder="stroke"
          opacity={txt} transform={`rotate(-4 ${from[0]} ${from[1]})`} letterSpacing={6}>{label}</text>
      </svg>
    </AbsoluteFill>
  );
};
