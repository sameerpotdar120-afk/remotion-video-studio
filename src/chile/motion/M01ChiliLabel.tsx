import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m01_chili_label: a hand-written "Chili" label with a curved arrow writes on; later the "i" is struck through in red
// and an "e" pops in above it ("Chili" → "Chile"). 700x420, 60 fps, 300 frames. Transparent.
// Font: any bold rounded/handwritten face; falls back to a heavy system sans.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const FONT = '"Kalam", "Comic Sans MS", "Arial Rounded MT Bold", sans-serif';

export const M01ChiliLabel: React.FC = () => {
  const f = useCurrentFrame();
  const letters = ['C', 'h', 'i', 'l', 'i'];
  const arrow = interpolate(f, [24, 44], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const strike = interpolate(f, [180, 192], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
  const e = interpolate(f, [190, 200, 208], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wob = f > 190 && f < 230 ? Math.sin((f - 190) / 2.5) * 8 * Math.exp(-(f - 190) / 12) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, top: 190, transform: 'rotate(-18deg)', transformOrigin: '0 50%', fontFamily: FONT, fontWeight: 800, fontSize: 132,
        color: '#fff', letterSpacing: 2, textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 10px 22px rgba(0,0,0,0.55)', WebkitTextStroke: '3px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
        {letters.map((ch, i) => {
          const s = interpolate(f, [i * 4, i * 4 + 6, i * 4 + 10], [0, 1.2, 1], { ...c, easing: Easing.out(Easing.quad) });
          const last = i === letters.length - 1;
          return (
            <span key={i} style={{ display: 'inline-block', position: 'relative', transform: `scale(${s})`, transformOrigin: '50% 80%' }}>
              {ch}
              {last && (
                <>
                  <span style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 14, background: '#ff2a2a', borderRadius: 8, transformOrigin: '0 50%',
                    transform: `scaleX(${strike}) rotate(-12deg)`, boxShadow: '0 0 10px rgba(255,40,40,0.8)' }} />
                  <span style={{ position: 'absolute', left: '50%', top: -96, transform: `translateX(-50%) scale(${e}) rotate(${wob}deg)`, color: '#fff', fontSize: 104 }}>e</span>
                </>
              )}
            </span>
          );
        })}
      </div>
      <svg width={700} height={420} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d="M 250 340 C 300 400, 380 410, 450 370" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${arrow} 1`}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
        {arrow > 0.95 && <path d="M 420 352 L 456 368 L 432 398" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};
