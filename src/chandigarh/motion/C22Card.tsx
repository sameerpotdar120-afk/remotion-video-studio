import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { GEO, UI, useFonts } from './font';
import { clamp, idle } from './theme';

// c22_card (line 7, "घर, school, hospital"; line 8, the Sector 17 plaza): a photo card (the creator's image) flips in
// from its left edge like a page (rotateY −100° → tilt, 14 frames, perspective), with a white border, a moving shadow,
// a sheen, and a small "AI चित्र" tag in the corner (the reference's "AI REPRESENTATION"); it floats. `into` = [frame,
// x, y] shrinks it into that point (the sector tile). `w` its width, `ratio` h/w. Centred in its box; transparent.
export const C22Card: React.FC<{ src: string; w?: number; ratio?: number; tilt?: number; into?: [number, number, number]; tag?: string; seed?: number }> = ({ src, w = 520, ratio = 0.75, tilt = -4, into, tag = 'AI चित्र', seed = 1 }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const q = into ? interpolate(f, [into[0], into[0] + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const [ix, iy, ir] = idle(f, seed, 0.4);
  const h = w * ratio, sheen = interpolate(f, [2, 18], [-0.4, 1.4], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 1400 }}>
      <div style={{ position: 'relative', width: w + 20, height: h + 20, padding: 10, background: '#fff', borderRadius: 10, transformOrigin: '0% 50%', opacity: Math.min(1, t * 4),
        boxShadow: `0 24px 36px rgba(0,0,0,${0.45 * t})`, transform: `translate(${ix + (into ? into[1] * q : 0)}px, ${iy + (into ? into[2] * q : 0)}px) rotateY(${-100 * (1 - t)}deg) rotate(${tilt + ir}deg) scale(${1 - 0.92 * q})` }}>
        <div style={{ width: w, height: h, overflow: 'hidden', borderRadius: 5, position: 'relative' }}>
          <Img src={src} style={{ width: w, height: h, objectFit: 'cover', transform: `scale(${1.1 - 0.05 * Math.min(1, f / 200)})` }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 100 - 20}%, rgba(255,255,255,0.35) ${sheen * 100}%, rgba(255,255,255,0) ${sheen * 100 + 20}%)` }} />
          {tag && <div style={{ position: 'absolute', left: 12, top: 12, padding: '2px 12px', borderRadius: 20, background: 'rgba(20,20,24,0.72)', color: '#fff', fontFamily: /^[\x00-\x7F]*$/.test(tag) ? GEO : UI, fontWeight: 700, fontSize: 22 }}>{tag}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
