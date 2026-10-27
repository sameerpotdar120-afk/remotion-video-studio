import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p04_glow_outline (line 3, "इसे कहते हैं Great Pacific Garbage Patch"; the reference's 0:08): a cyan neon outline
// draws on round the patch (or any path `d`, screen px) clockwise in `dur` frames, a white-hot running head at its
// tip with a comet tail; once closed, a slow light keeps travelling round it and the glow breathes. `fill` adds a
// faint cyan wash inside. `out` fades it. Transparent, 1080×1920.
export const P04GlowOutline: React.FC<{ d: string; dur?: number; width?: number; color?: string; fill?: boolean; out?: number }> = ({ d, dur = 40, width = 5, color = C.cyan, fill = false, out }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pulse = 0.8 + 0.2 * Math.sin(f / 10);
  const op = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const run = ((f - dur) / 110) % 1;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="p04g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={8 * pulse} /></filter>
        </defs>
        {fill && <path d={d} fill={color} opacity={0.12 * t} />}
        <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width * 4} strokeDasharray={`${t} 2`} filter="url(#p04g)" opacity={0.8} />
        <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeDasharray={`${t} 2`} />
        <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 0.4} strokeDasharray={`${t} 2`} opacity={0.9} />
        {t < 1 && <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 2.2} strokeLinecap="round" strokeDasharray="0.06 2" strokeDashoffset={-(t - 0.06)} filter="url(#p04g)" />}
        {t < 1 && <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 1.6} strokeLinecap="round" strokeDasharray="0.004 2" strokeDashoffset={-(t - 0.004)} />}
        {t >= 1 && <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 1.4} strokeLinecap="round" strokeDasharray="0.08 2" strokeDashoffset={-run} opacity={0.75} filter="url(#p04g)" />}
      </svg>
    </AbsoluteFill>
  );
};
