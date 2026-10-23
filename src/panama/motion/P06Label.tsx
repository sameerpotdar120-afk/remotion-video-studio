import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { idle, pop, ramp, TypeOn } from './theme';

// p06_label (every name: "Panama Canal", "Atlantic", "Pacific", "Gatun Lake", "Waiting", "Canal: 82 km", pills like
// "$5.3M SKIP THE LINE" and "Refills only with rain"; the reference uses them everywhere): a rounded tag that pops from
// 0.6× with an overshoot in 8 frames, the text typing on letter by letter, an optional leader line drawing down to a
// pulsing dot at the anchor, then a slow float. `look`: 'dark' (navy box, white text), 'pill' (yellow with a dark tag
// on the left), 'red' (red box). Transparent, 600×300, 60 fps; the tag centred at (300, 110), the anchor at (300, 260).
export const P06Label: React.FC<{ text?: string; tag?: string; look?: 'dark' | 'pill' | 'red'; leader?: boolean; size?: number }> = ({ text = 'Gatun Lake', tag = '$5.3M', look = 'dark', leader = true, size = 46 }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 9, 2.4);
  const [ix, iy, ir] = idle(f, 2, 0.5);
  const ld = ramp(f, 4, 14);
  const bg = look === 'pill' ? 'linear-gradient(180deg, #FFE36A, #F5C21F)' : look === 'red' ? 'linear-gradient(180deg, #F0373C, #C8161D)' : 'rgba(14,22,32,0.92)';
  const fg = look === 'pill' ? '#1A1406' : '#fff';
  const pulse = ((f % 40) / 40);
  return (
    <AbsoluteFill>
      {leader && (
        <svg width={600} height={300} style={{ position: 'absolute', inset: 0 }}>
          <path d={`M 300 140 L 300 ${140 + 115 * ld}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          {ld >= 1 && <circle cx={300} cy={258} r={10 + pulse * 22} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - pulse} />}
          {ld >= 1 && <circle cx={300} cy={258} r={9} fill="#fff" stroke="#0E1620" strokeWidth={3} />}
        </svg>
      )}
      <div style={{ position: 'absolute', left: 300, top: 110, transform: `translate(-50%, -50%) translate(${ix}px, ${iy}px) rotate(${ir}deg) scale(${s})`, display: 'flex', alignItems: 'center', gap: 14,
        padding: look === 'pill' ? '8px 26px 4px 10px' : '6px 24px 2px', borderRadius: look === 'pill' ? 40 : 16, background: bg, border: look === 'dark' ? '3px solid rgba(255,255,255,0.75)' : '4px solid rgba(255,255,255,0.9)',
        boxShadow: '0 10px 22px rgba(0,0,0,0.4)', whiteSpace: 'nowrap', fontFamily: UI, fontWeight: 800, fontSize: size, color: fg, lineHeight: 1.3 }}>
        {look === 'pill' && <span style={{ background: '#1A1406', color: '#FFE36A', borderRadius: 30, padding: '2px 14px 0', fontSize: size * 0.7 }}>{tag}</span>}
        <TypeOn text={text} f={f} at={3} step={2} />
      </div>
    </AbsoluteFill>
  );
};
