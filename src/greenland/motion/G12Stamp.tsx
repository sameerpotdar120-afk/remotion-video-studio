import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, wobble } from './theme';

// g12_stamp (line 6, Erik's exile: "देश निकाला" / "3 साल"; line 10, "CLICKBAIT" / "1000 साल पुराना"): a red rubber
// stamp slams down (from 1.8× in 7 frames, ease-in, a twist), the frame jolts, a shock ring and ink specks burst out,
// and the ink looks stamped (a worn, uneven edge) and breathes. Transparent, 900×500, 60 fps; centred.
export const G12Stamp: React.FC<{ text?: string; sub?: string; color?: string; tilt?: number; seed?: string }> = ({ text = 'देश निकाला', sub = '3 साल', color = C.red, tilt = -9, seed = 's' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 7], [1.8, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rot = interpolate(f, [0, 7], [tilt - 12, tilt], clamp) + wobble(f, 7, 4, 9) * 2;
  const a = interpolate(f, [0, 3], [0, 1], clamp);
  const ring = interpolate(f, [7, 26], [0, 1], clamp);
  const sq = f >= 7 ? 1 - 0.1 * Math.max(0, 1 - (f - 7) / 6) : 1;
  const latin = /^[\x00-\x7F]*$/.test(text);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {f >= 7 && <div style={{ position: 'absolute', width: 640 + 300 * ring, height: 300 + 200 * ring, borderRadius: 40, border: `${10 * (1 - ring)}px solid ${color}`, opacity: 1 - ring, transform: `rotate(${tilt}deg)` }} />}
      {f >= 7 && Array.from({ length: 18 }, (_, i) => {
        const t = interpolate(f, [7, 32], [0, 1], clamp), ang = (i / 18) * Math.PI * 2 + random(`${seed}a${i}`);
        const d = 220 + 120 * t * (0.6 + random(`${seed}d${i}`) * 0.6);
        return <div key={i} style={{ position: 'absolute', left: 450 + Math.cos(ang) * d * 1.3, top: 250 + Math.sin(ang) * d * 0.6, width: 9, height: 9, borderRadius: 5, background: color, opacity: 1 - t }} />;
      })}
      <svg width={0} height={0} style={{ position: 'absolute' }}><defs>
        <filter id={`g12w${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={5} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.45" /><feComposite in="SourceGraphic" operator="in" /></filter>
      </defs></svg>
      <div style={{ opacity: a, transform: `scale(${s * sq * (1 + 0.015 * Math.sin(f / 9))}, ${s / sq}) rotate(${rot}deg)`, filter: `drop-shadow(0 8px 10px rgba(0,0,0,0.4))` }}>
        <div style={{ filter: `url(#g12w${seed})`, border: `14px solid ${color}`, outline: `5px solid ${color}`, outlineOffset: 8, borderRadius: 22, padding: '4px 44px 0', textAlign: 'center', background: 'rgba(255,255,255,0.12)' }}>
          <div style={{ fontFamily: latin ? NUM : UI, fontWeight: 800, fontSize: latin ? 150 : 130, lineHeight: latin ? 1.05 : 1.25, color, whiteSpace: 'nowrap', letterSpacing: latin ? 6 : 0 }}>{text}</div>
          {sub && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 76, lineHeight: 1.25, color, borderTop: `6px solid ${color}`, marginBottom: 4 }}>{sub}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
