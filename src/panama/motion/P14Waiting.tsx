import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { ShipTop } from './Ships';
import { pop, ramp } from './theme';

// p14_waiting (line 5, "दोनों तरफ़ किलोमीटर लंबी line लग गई"; the reference's 40–42.2 s): tiny anchored ships pop into
// a cluster one by one (2 frames apart, each swinging slightly on its anchor), a hand-drawn red circle draws around
// them (starting at the top, overshooting its start), and a dark "Waiting" tag pops above. Transparent, 600×600,
// 60 fps. `count` ships; `ship` is the creator's top-down image.
export const P14Waiting: React.FC<{ count?: number; label?: string; ship?: string }> = ({ count = 18, label = 'Waiting', ship }) => {
  useFonts();
  const f = useCurrentFrame();
  const circ = ramp(f, count * 2 + 4, count * 2 + 22);
  const tag = pop(f, count * 2 + 18, count * 2 + 28, 2.2);
  const L = 2 * Math.PI * 230;
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`wa${i}`) * Math.PI * 2, r = Math.sqrt(random(`wr${i}`)) * 170;
        const s = pop(f, i * 2, i * 2 + 8, 2);
        const sw = Math.sin(f / 30 + i) * 6;
        return (
          <div key={i} style={{ position: 'absolute', left: 300 + Math.cos(a) * r, top: 320 + Math.sin(a) * r * 0.7, transform: `rotate(${random(`wd${i}`) * 360 + sw}deg) scale(${s})` }}>
            <ShipTop len={96} src={ship} seed={`w${i}`} f={f + i * 7} />
          </div>
        );
      })}
      <svg width={600} height={600} style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx={300} cy={320} rx={230} ry={175} fill="none" stroke="#FF3B3B" strokeWidth={9} strokeLinecap="round" strokeDasharray={`${L * 1.06 * circ} ${L * 2}`} transform="rotate(-100 300 320)" style={{ filter: 'drop-shadow(0 0 6px rgba(255,40,40,0.7))' }} />
      </svg>
      {tag > 0 && (
        <div style={{ position: 'absolute', left: 300, top: 70 + Math.sin(f / 18) * 5, transform: `translate(-50%,0) scale(${tag})`, padding: '4px 22px 0', borderRadius: 14, background: 'rgba(14,22,32,0.92)', border: '3px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 44, color: '#fff' }}>{label}</div>
      )}
    </AbsoluteFill>
  );
};
