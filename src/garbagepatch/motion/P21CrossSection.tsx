import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p21_cross_section (line 13, "जो ऊपर तैर रहा है, वो तो बस थोड़ा सा हिस्सा है। बाकी plastic… तल में बैठ जाता है, या
// किनारों पर आ जाता है"; the reference's 0:53–1:00, its flat cartoon ocean rebuilt with the creator's cutaway gp15):
// the cutaway (sky, surface, water column, sea floor, shore) fills the frame 1.5× tall; the camera starts on the
// surface, where the creator's props (gp03 bottle, gp04 container, gp06 bag) bob on the waterline, then at `down`
// pans down the water column over 90 frames while copies of the props sink slowly, tumbling, and settle on the floor.
// At `shore` the creator's littered beach slope (gp17) wipes in diagonally from the bottom right. Light rays drift.
// Opaque, 1080×1920.
export const P21CrossSection: React.FC<{ bg: string; beach?: string; props: string[]; down?: number; shore?: number; surfaceY?: number }> = ({ bg, beach, props, down = 90, shore = 200, surfaceY = 0.3 }) => {
  const f = useCurrentFrame();
  const H = 1920 * 1.5;
  const pan = interpolate(f, [down, down + 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const y0 = -pan * (H - 1920);
  const wipe = interpolate(f, [shore, shore + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sy = H * surfaceY;
  const n = 14;
  return (
    <AbsoluteFill style={{ background: '#08313a', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: y0 + Math.sin(f / 80) * 4, width: 1080, height: H }}>
        <Img src={bg} style={{ width: 1080, height: H, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${100 + Math.sin(f / 60) * 5}deg, transparent 20%, rgba(200,255,250,0.08) 30%, transparent 40%, rgba(200,255,250,0.06) 55%, transparent 65%)`, mixBlendMode: 'screen' }} />
        {Array.from({ length: n }, (_, i) => {
          const src = props[i % props.length], x = 60 + random(`x${i}`) * 960, w = 80 + random(`w${i}`) * 60;
          const floats = i < 7;
          const sink = floats ? 0 : interpolate(f, [down + i * 10, down + 260 + i * 10], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
          const y = sy - w * 0.3 + Math.sin(f / 16 + i) * 6 + sink * (H * 0.92 - sy);
          const rot = floats ? Math.sin(f / 21 + i) * 10 : sink * 260 * (random(`r${i}`) - 0.5) + Math.sin(f / 30 + i) * 6;
          return <Img key={i} src={src} style={{ position: 'absolute', left: x - w / 2 + Math.sin(f / 50 + i) * 12 * (1 - sink * 0.5), top: y, width: w, height: w, objectFit: 'contain',
            transform: `rotate(${rot}deg)`, opacity: floats ? 1 : 0.92 - sink * 0.2, filter: floats ? 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))' : `brightness(${1 - sink * 0.35}) saturate(${1 - sink * 0.3})` }} />;
        })}
        {beach && wipe > 0 && (
          <Img src={beach} style={{ position: 'absolute', right: -40, bottom: -20, width: 1080 * 0.8, height: H * 0.55, objectFit: 'contain', objectPosition: '100% 100%',
            clipPath: `polygon(${100 - 140 * wipe}% 100%, 100% ${100 - 140 * wipe}%, 100% 100%)`, filter: 'drop-shadow(-8px 0 16px rgba(0,0,0,0.35))' }} />
        )}
      </div>
    </AbsoluteFill>
  );
};
