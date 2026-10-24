import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, pop, wobble } from './theme';

// w08_ballot (line 9, "Jamaica ने वोट करके अलग होना चुना"): the wooden ballot box pops in (overshoot, 10 frames), the
// folded ballot (with its tick) drops in from above on an arc, tumbling, slips into the slot (masked by the lid line)
// at `drop`, and the box thumps (a squash and a dust puff), a ring and a "VOTE" tag pop above it. Drawn stand-ins until
// the creator's wi06 and wi06b arrive. Transparent, 600×700, 60 fps; the slot is at (300, 360).
export const W08Ballot: React.FC<{ box?: string; paper?: string; drop?: number; tag?: string }> = ({ box, paper, drop = 34, tag = 'VOTE' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 10, 2);
  const u = interpolate(f, [8, drop], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const px = 300 + (1 - u) * 140 * Math.sin(u * Math.PI * 0.9), py = -40 + u * 400, rot = (1 - u) * 300;
  const thump = f >= drop ? wobble(f, drop, 4, 9) : 0;
  const ring = interpolate(f, [drop, drop + 22], [0, 1], clamp);
  const t = pop(f, drop + 4, drop + 14, 2.4);
  return (
    <AbsoluteFill>
      {f >= drop && ring < 1 && <div style={{ position: 'absolute', left: 300 - 60 - 160 * ring, top: 380 - 20 - 50 * ring, width: 120 + 320 * ring, height: 40 + 100 * ring, borderRadius: '50%', border: `${6 * (1 - ring)}px solid ${C.gold}`, opacity: 1 - ring }} />}
      <div style={{ position: 'absolute', left: 300, top: 0, width: 0, height: 0 }}>
        {/* the paper, clipped at the slot once it reaches it */}
        <div style={{ position: 'absolute', left: -300, top: 0, width: 600, height: 370, overflow: 'hidden' }}>
          {f < drop + 6 && (
            <div style={{ position: 'absolute', left: px - 70, top: py - 50, width: 140, height: 100, transform: `rotate(${rot}deg)` }}>
              {paper ? <Img src={paper} style={{ width: 140, height: 100, objectFit: 'contain' }} /> : (
                <svg width={140} height={100}><rect x={8} y={14} width={124} height={72} rx={4} fill="#F3EEDC" stroke="#B9AE8E" strokeWidth={2} /><path d="M 8 50 L 132 50" stroke="#D6CCAE" strokeWidth={2} /><path d="M 46 40 L 62 58 L 96 22" stroke="#111" strokeWidth={8} fill="none" strokeLinecap="round" /></svg>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 300 - 190, top: 340, width: 380, height: 320, transformOrigin: '50% 100%', transform: `scale(${s * (1 + 0.06 * thump)}, ${s * (1 - 0.08 * thump)})` }}>
        {box ? <Img src={box} style={{ width: 380, height: 320, objectFit: 'contain' }} /> : (
          <svg width={380} height={320}>
            <defs><linearGradient id="w08w" x1="0" x2="1"><stop offset="0" stopColor="#4A2C16" /><stop offset="0.5" stopColor="#7A4E2A" /><stop offset="1" stopColor="#3A2210" /></linearGradient></defs>
            <path d="M 40 70 L 340 70 L 360 40 L 60 40 Z" fill="#8A5E36" stroke="#2A170A" strokeWidth={3} />
            <rect x={40} y={70} width={300} height={230} fill="url(#w08w)" stroke="#2A170A" strokeWidth={3} />
            <rect x={150} y={48} width={90} height={10} rx={4} fill="#120A04" />
            <rect x={175} y={150} width={40} height={50} rx={6} fill="#C8963A" stroke="#5A3C10" strokeWidth={3} />
            {[[40, 70], [318, 70], [40, 278], [318, 278]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width={22} height={22} fill="#C8963A" />)}
          </svg>
        )}
      </div>
      {t > 0 && <div style={{ position: 'absolute', left: 300, top: 300, transform: `translate(-50%, -100%) scale(${t}) rotate(-4deg)`, padding: '4px 26px 0', borderRadius: 14, background: C.gold, border: '4px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 52, color: '#1A1406', boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}>{tag}</div>}
    </AbsoluteFill>
  );
};
