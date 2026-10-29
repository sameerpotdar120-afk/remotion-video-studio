import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { SERIF, useFonts } from './font';
import { C, clamp } from './theme';

// c03_ribbon (line 4, "Shivalik की पहाड़ियों के ठीक नीचे"; the reference's 0:14.5): a wide, slightly see-through
// turquoise band with the creator's water texture (cg20) draws itself along the foothill line (`d`, screen px,
// north-west to south-east) in `dur` frames with a thin dark edge, then the name rides along its centre in black
// serif capitals that follow the curve, letter-spaced, appearing just behind the band's head. `out` fades it.
let uid = 0;
export const C03Ribbon: React.FC<{ d: string; texture?: string; width?: number; dur?: number; text?: string; out?: number; offset?: number }> = ({ d, texture, width = 84, dur = 70, text = 'SHIVALIK HILLS', out, offset = 0.28 }) => {
  useFonts();
  const f = useCurrentFrame();
  const [id] = React.useState(() => `c03_${uid++}`);
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tx = interpolate(f, [dur * 0.5, dur + 10], [0, 1], clamp);
  const o = out !== undefined ? interpolate(f, [out, out + 14], [1, 0], clamp) : 1;
  const drift = (f * 0.6) % 512;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          {texture && <pattern id={`${id}p`} patternUnits="userSpaceOnUse" width={512} height={512} patternTransform={`translate(${drift} ${drift * 0.4})`}><image href={texture} width={512} height={512} /></pattern>}
          <path id={`${id}c`} d={d} />
        </defs>
        <path d={d} pathLength={1} fill="none" stroke="#06343a" strokeOpacity={0.7} strokeWidth={width + 5} strokeLinecap="butt" strokeDasharray={`${t} 2`} />
        <path d={d} pathLength={1} fill="none" stroke={texture ? `url(#${id}p)` : C.ribbon} strokeOpacity={0.88} strokeWidth={width} strokeLinecap="butt" strokeDasharray={`${t} 2`} />
        <path d={d} pathLength={1} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={width * 0.35} strokeDasharray={`${t} 2`} transform={`translate(0 ${-width * 0.22})`} />
        <text fontFamily={SERIF} fontWeight={700} fontSize={width * 0.56} letterSpacing={width * 0.08} fill="#0a1a1c" opacity={tx} dominantBaseline="central">
          <textPath href={`#${id}c`} startOffset={`${offset * 100}%`}>{text}</textPath>
        </text>
      </svg>
    </AbsoluteFill>
  );
};
