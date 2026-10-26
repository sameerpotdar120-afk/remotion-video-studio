import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, idle, pop } from './theme';

// m17_pin_label (line 10, "शहर Funchal में…", "airport भी उसी के नाम पर है"): a red pin drops onto the map at the
// box's bottom centre (from 200 px above, ease-in, with a squash and a pulse ring on landing), then a boxed label
// slides up out of it with a short stem: a white box with a red neon rim, the name typed on, and an optional small
// second line. Transparent, 900×520, 60 fps; the pin tip sits at (450, 500).
export const M17PinLabel: React.FC<{ text?: string; sub?: string; color?: string }> = ({ text = 'Funchal', sub, color = C.neon }) => {
  useFonts();
  const f = useCurrentFrame();
  const drop = interpolate(f, [0, 10], [-200, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const sq = f > 10 ? 1 - 0.25 * Math.exp(-(f - 10) / 4) * Math.cos((f - 10) / 2) : 1;
  const ring = ((f - 10) % 50) / 50;
  const lab = pop(f, 12, 24, 2.2);
  const [ix, iy] = idle(f, 3, 0.3);
  return (
    <AbsoluteFill>
      {f > 10 && <div style={{ position: 'absolute', left: 450 - 50 * ring - 10, top: 490 - 15 * ring, width: 20 + 100 * ring, height: 20 + 30 * ring, borderRadius: '50%', border: `3px solid ${color}`, opacity: 1 - ring }} />}
      <svg width={60} height={80} viewBox="-30 -70 60 80" style={{ position: 'absolute', left: 420, top: 430, overflow: 'visible', transformOrigin: '30px 70px', transform: `translateY(${drop}px) scale(${2 - sq}, ${sq})` }}>
        <path d="M 0 0 C -6 -18 -24 -30 -24 -46 A 24 24 0 1 1 24 -46 C 24 -30 6 -18 0 0 Z" fill={color} stroke="#fff" strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 6px 6px rgba(0,0,0,0.5))` }} />
        <circle cx={0} cy={-46} r={9} fill="#fff" />
      </svg>
      {lab > 0 && (
        <div style={{ position: 'absolute', left: 450 + ix, top: 330 + iy, transform: `translate(-50%, -100%) scale(${lab})`, transformOrigin: '50% 100%', textAlign: 'center' }}>
          <div style={{ padding: '8px 30px 2px', borderRadius: 16, background: 'rgba(255,255,255,0.96)', border: `4px solid ${color}`, boxShadow: `0 0 22px ${color}, 0 10px 18px rgba(0,0,0,0.45)`, whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 64, lineHeight: 1.2, color: C.ink }}>{text}</div>
            {sub && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, lineHeight: 1.2, color: '#5A1018' }}>{sub}</div>}
          </div>
          <div style={{ width: 4, height: 40, background: color, margin: '0 auto' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
