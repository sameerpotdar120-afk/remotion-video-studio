import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, idle } from './theme';

// m05_title_drop (line 2, "इसका नाम ही रख दिया Madeira"; the reference's 0:09–0:10): the creator's wooden MADEIRA
// lettering (md05) lands letter by letter, the way the reference's title does: each letter is a slice of the image
// (`cuts`, fractions of its width; even slices by default) that drops from above and from 0.4× with a back-ease
// bounce, 3 frames after the one before, with a red neon glow behind the word that swells as the last letter lands
// and then breathes; the ember cracks in the wood glint. Centred in its box; `w` is its width.
export const M05TitleDrop: React.FC<{ src: string; ratio: number; w?: number; letters?: number; cuts?: number[]; step?: number; out?: number }> = ({
  src, ratio, w = 880, letters = 7, cuts, step = 3, out,
}) => {
  const f = useCurrentFrame();
  const h = w * ratio;
  const edges = cuts ?? Array.from({ length: letters + 1 }, (_, i) => i / letters);
  const n = edges.length - 1;
  const glow = interpolate(f, [n * step, n * step + 10], [0, 1], clamp) * (0.8 + 0.2 * Math.sin(f / 12));
  const o = out !== undefined ? 1 - interpolate(f, [out, out + 8], [0, 1], clamp) : 1;
  const [ix, iy, ir] = idle(f, 4, 0.3);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ position: 'relative', width: w, height: h, transform: `translate(${ix}px, ${iy}px) rotate(${ir * 0.5}deg)` }}>
        <div style={{ position: 'absolute', inset: '-10% -6%', borderRadius: 40, opacity: glow, background: `radial-gradient(ellipse at 50% 55%, ${C.neon}88, ${C.neonDeep}33 50%, rgba(0,0,0,0) 72%)`, filter: 'blur(12px)' }} />
        {Array.from({ length: n }, (_, i) => {
          const a = i * step;
          const s = interpolate(f, [a, a + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
          if (s <= 0) return null;
          const l = edges[i], r = edges[i + 1];
          return (
            <div key={i} style={{ position: 'absolute', left: l * w, top: 0, width: (r - l) * w, height: h, overflow: 'hidden', opacity: Math.min(1, s * 3),
              transformOrigin: '50% 100%', transform: `translateY(${(1 - s) * -140}px) scale(${0.4 + 0.6 * s})` }}>
              <Img src={src} style={{ position: 'absolute', left: -l * w, top: 0, width: w, height: h, maxWidth: 'none', filter: `drop-shadow(0 10px 10px rgba(0,0,0,0.5)) drop-shadow(0 0 ${8 + 10 * glow}px ${C.neon})` }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
