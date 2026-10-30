import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, UI, useFonts } from './font';
import { C, clamp, idle } from './theme';

// s15_fact_card (line 12; the reference shows an article screenshot here, we show our own card in our own words): a dark
// card whips in from the right with a motion blur, a small "SEVOKE–RANGPO RAIL LINK" kicker, then our Hindi lines; a
// cyan highlight sweeps across the key line at `hl`. The card scrolls up slowly while held. Transparent outside it.
export const S15FactCard: React.FC<{ kicker: string; lines: string[]; key1?: number; hl?: number; out?: number; children?: React.ReactNode }> = ({ kicker, lines, key1 = 1, hl = 30, out, children }) => {
  useFonts();
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const H = interpolate(f, [hl, hl + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const [ix, iy] = idle(f, 9, 0.5);
  const v = (1 - p) * 1100;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: O, pointerEvents: 'none' }}>
      <div style={{ width: 900, transform: `translate(${v + ix}px, ${iy - f * 0.25}px) rotate(${(1 - p) * 6 - 1.5}deg)`, filter: p < 0.9 ? `blur(${(1 - p) * 14}px)` : undefined,
        background: 'linear-gradient(180deg, #121B22, #0A1015)', borderRadius: 22, padding: '40px 46px 46px', boxShadow: '0 40px 90px rgba(0,0,0,0.75)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: C.cyan, marginBottom: 22 }}>{kicker}</div>
        {lines.map((l, i) => (
          <div key={i} style={{ position: 'relative', fontFamily: UI, fontWeight: 600, fontSize: 44, lineHeight: 1.45, color: i === key1 ? '#fff' : 'rgba(235,242,246,0.78)', marginBottom: 8 }}>
            {i === key1 && <span style={{ position: 'absolute', left: -10, right: -10, top: 6, bottom: 2, background: C.cyanDeep, transformOrigin: '0 50%', transform: `scaleX(${H})`, borderRadius: 6, zIndex: 0 }} />}
            <span style={{ position: 'relative' }}>{l}</span>
          </div>
        ))}
        {children}
      </div>
    </AbsoluteFill>
  );
};
// a big "DEC 2027" date stamp
export const DateStamp: React.FC<{ text: string; t0?: number; out?: number; y?: number }> = ({ text, t0 = 0, out, y = 640 }) => {
  useFonts();
  const f = useCurrentFrame();
  const p = interpolate(f, [t0, t0 + 10], [2.2, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = interpolate(f, [t0, t0 + 6], [0, 1], clamp) * (out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1);
  if (f < t0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(-4deg)`, opacity: a, fontFamily: TITLE, fontSize: 170, color: C.gold, whiteSpace: 'nowrap',
        textShadow: `0 8px 0 ${C.goldDeep}, 0 18px 40px rgba(0,0,0,0.75)` }}>{text}</div>
    </AbsoluteFill>
  );
};
