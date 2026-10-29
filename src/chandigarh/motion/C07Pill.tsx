import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { GEO, UI, useFonts } from './font';
import { C, clamp, graphemes, idle } from './theme';

// c07_pill (the reference's glass labels on photos and maps: "LE CORBUSIER", "LEGISLATIVE ASSEMBLY", "PEDESTRIAN-ONLY
// ZONE", "V1 Line"): a dot appears, stretches into a dark translucent rounded pill (12 frames), and the text types on
// letter by letter in glowing bold caps (`color`: the reference's yellow, or neon green, or white). `dot` adds a
// coloured circle at the left (the V-line pills). `sub` adds a small second line. Gently floats. `out` erases the
// text backward, then the pill shrinks. Centred in its box; transparent.
export const C07Pill: React.FC<{ text: string; size?: number; color?: string; dot?: string; sub?: string; out?: number; step?: number }> = ({ text, size = 54, color = C.pillText, dot, sub, out, step = 2 }) => {
  useFonts();
  const f = useCurrentFrame();
  const ch = graphemes(text);
  const latin = /^[\x00-\x7F'’]*$/.test(text);
  const q = out !== undefined ? interpolate(f, [out, out + ch.length * 1 + 10], [0, 1], clamp) : 0;
  const grow = interpolate(f, [0, 6, 14], [0, 0.3, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 - interpolate(q, [0.7, 1], [0, 1], clamp));
  const shown = Math.floor(interpolate(f, [8, 8 + ch.length * step], [0, ch.length], clamp) * (1 - interpolate(q, [0, 0.7], [0, 1], clamp)));
  const [ix, iy] = idle(f, 4, 0.2);
  if (grow <= 0.01) return null;
  const glow = `0 0 ${size / 6}px ${color}, 0 0 ${size / 3}px ${color}99`;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `translate(${ix}px, ${iy}px) scale(${0.3 + 0.7 * grow}, ${Math.min(1, grow * 2)})`, display: 'flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.18}px ${size * 0.55}px`,
        borderRadius: size, background: 'linear-gradient(180deg, rgba(40,44,52,0.78), rgba(12,14,18,0.82))', border: '1.5px solid rgba(255,255,255,0.22)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)', minWidth: size * 1.2, minHeight: size * 1.2, backdropFilter: 'blur(6px)' }}>
        {dot && <div style={{ width: size * 0.7, height: size * 0.7, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${dot}, #000 140%)`, boxShadow: `0 0 10px ${dot}` }} />}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: latin ? GEO : UI, fontWeight: 800, fontSize: size, lineHeight: 1.1, color: dot ? '#fff' : color, textShadow: dot ? undefined : glow, whiteSpace: 'nowrap', letterSpacing: latin ? 1 : 0 }}>
            {ch.slice(0, shown).join('') || ' '}
          </div>
          {sub && <div style={{ fontFamily: latin ? GEO : UI, fontWeight: 600, fontSize: size * 0.42, color: '#ddd', opacity: interpolate(f, [8 + ch.length * step, 16 + ch.length * step], [0, 1], clamp) * (1 - q) }}>{sub}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
