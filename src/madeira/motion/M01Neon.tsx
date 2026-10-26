import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ramp } from './theme';

// m01_neon (line 1, the archipelago; line 9, the island; the reference's 0:01–0:03 and 0:46–0:50): the islands'
// outlines in red neon (a hot thin core, a red stroke, a wide soft glow). `mode="strobe"`: the outline and a
// yellow-green fill flash on and off together 3 times (4 frames on, 4 off, like the reference), then the outline
// stays and breathes. `mode="draw"`: the outline draws round the coast in `dur` frames with a bright running light at
// its head, then a slow light keeps running round it. `d` is the outline in screen px. Transparent, any size.
export const M01Neon: React.FC<{ d: string; mode?: 'strobe' | 'draw'; dur?: number; color?: string; fill?: string; width?: number; out?: number }> = ({
  d, mode = 'strobe', dur = 40, color = C.neon, fill = '#C8E83A', width = 4, out,
}) => {
  const f = useCurrentFrame();
  const o = out !== undefined ? 1 - ramp(f, out, out + 10) : 1;
  if (o <= 0) return null;
  const strobeOn = mode === 'strobe' && f < 24 ? Math.floor(f / 4) % 2 === 0 : true;
  const fillA = mode === 'strobe' && f < 24 ? (strobeOn ? 0.55 : 0) : 0;
  const p = mode === 'draw' ? ramp(f, 0, dur) : 1;
  const breathe = 0.85 + 0.15 * Math.sin(f / 11);
  const run = ((f * 0.006) % 1);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {fillA > 0 && <path d={d} fill={fill} fillOpacity={fillA} />}
        {strobeOn && (
          <g opacity={breathe}>
            <path d={d} fill="none" stroke={color} strokeWidth={width * 5} strokeOpacity={0.35} pathLength={1} strokeDasharray={`${p} 2`} strokeLinejoin="round" style={{ filter: 'blur(8px)' }} />
            <path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={`${p} 2`} strokeLinejoin="round" />
            <path d={d} fill="none" stroke="#FFE0E3" strokeWidth={width * 0.35} pathLength={1} strokeDasharray={`${p} 2`} strokeLinejoin="round" />
          </g>
        )}
        {mode === 'draw' && (p < 1
          ? <path d={d} fill="none" stroke="#fff" strokeWidth={width * 2.5} pathLength={1} strokeDasharray={`0.02 2`} strokeDashoffset={-(p - 0.02)} strokeLinecap="round" style={{ filter: 'blur(2px)' }} />
          : <path d={d} fill="none" stroke="#fff" strokeWidth={width * 1.6} pathLength={1} strokeDasharray={`0.06 0.94`} strokeDashoffset={-run} strokeLinecap="round" opacity={0.75} style={{ filter: 'blur(1.5px)' }} />)}
      </svg>
    </AbsoluteFill>
  );
};
