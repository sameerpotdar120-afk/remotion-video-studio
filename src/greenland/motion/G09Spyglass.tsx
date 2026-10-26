import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// g09_spyglass (line 5, "पहाड़ पर चढ़ा, नीचे देखा तो पूरी खाड़ी बर्फ़ से भरी हुई थी"; the reference's iris into a
// spyglass view): the frame irises in to a circle in 5 frames (dark outside), framed by the creator's brass eyepiece
// (gl12), and inside it `children` (the fjord full of drift ice, gl05) drifts slowly as if hand-held, with a soft
// lens vignette and a faint reflection. `overlay` sits on top (the edit lands the ICELAND title there). `irisOut`
// opens it back up in 6 frames. Opaque inside the iris, 1080×1920, 60 fps.
export const G09Spyglass: React.FC<{ children: React.ReactNode; ring?: string; r?: number; overlay?: React.ReactNode; irisOut?: number; cy?: number }> = ({ children, ring, r = 400, overlay, irisOut, cy = 900 }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 5], [1400, r], { ...clamp, easing: Easing.out(Easing.quad) });
  const rr = irisOut !== undefined && f > irisOut ? interpolate(f, [irisOut, irisOut + 6], [r, 1400], { ...clamp, easing: Easing.in(Easing.quad) }) : inn;
  const sx = Math.sin(f / 37) * 12 + Math.sin(f / 13) * 2.5, sy = Math.cos(f / 43) * 9 + Math.sin(f / 17) * 2.5;
  const cx = 540 + sx, cyy = cy + sy;
  // the eyepiece's clear hole is about 48% of the image's width
  const RW = (rr * 2) / 0.48;
  const dark = interpolate(rr, [r, 1400], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,6,9,${dark})` }} />
      <AbsoluteFill style={{ clipPath: `circle(${rr}px at ${cx}px ${cyy}px)` }}>
        <AbsoluteFill style={{ transform: `translate(${-sx * 1.6}px, ${-sy * 1.6}px) scale(${1.06 + f * 0.0005})` }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cyy}px, rgba(0,0,0,0) ${rr * 0.62}px, rgba(0,0,0,0.6) ${rr}px)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse ${rr * 0.7}px ${rr * 0.35}px at ${cx - rr * 0.35}px ${cyy - rr * 0.5}px, rgba(255,255,255,0.16), rgba(255,255,255,0) 70%)` }} />
      </AbsoluteFill>
      {ring && <Img src={ring} style={{ position: 'absolute', left: cx - RW / 2, top: cyy - RW / 2, width: RW, height: RW, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }} />}
      {overlay}
    </AbsoluteFill>
  );
};
