import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p09_map_card (line 5, "दुनिया के समुंदरों में ऐसे 5 बड़े कचरे के भँवर हैं"; the reference's 0:21–0:26): the map
// (children, full frame, cropped to the card's `band` [top, bottom] px) tilts back into a card lying on a blue
// blueprint grid: rotateX 0 → 28°, rotateZ 0 → -9°,
// scale 1 → 0.86 in `tilt` frames (ease-in-out) with a soft drop shadow under the card, then keeps drifting round
// slowly. At `out` it reverses in 18 frames (the dive back in). The grid scrolls slowly.
export const P09MapCard: React.FC<{ children: React.ReactNode; tilt?: number; out?: number; band?: [number, number] }> = ({ children, tilt = 24, out, band = [560, 1360] }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, tilt], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) * (out !== undefined ? 1 - interpolate(f, [out, out + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 1);
  const drift = interpolate(f, [tilt, tilt + 400], [0, 1], clamp);
  const rx = 28 * t, rz = (-9 - 4 * drift) * t, s = 1 - 0.14 * t;
  const g = (f * 0.4) % 80;
  return (
    <AbsoluteFill style={{ background: C.grid, perspective: 1600, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: t, backgroundImage: `linear-gradient(${C.gridLine} 2px, transparent 2px), linear-gradient(90deg, ${C.gridLine} 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px', backgroundPosition: `${g}px ${g}px, ${g}px ${g}px, ${g}px ${g}px, ${g}px ${g}px` }} />
      <AbsoluteFill style={{ transform: `rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s})`, transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', left: -200, right: -200, top: band[0], bottom: 1920 - band[1], boxShadow: `0 ${40 * t}px ${80 * t}px rgba(0,0,20,${0.6 * t})` }} />
        <AbsoluteFill style={{ clipPath: `inset(${band[0]}px -200px ${1920 - band[1]}px -200px)` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
