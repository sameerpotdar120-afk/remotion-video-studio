import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, idle, mblur, pop, ramp, TypeOn, wobble } from './theme';

// u07_calendar (line 3, "साल के 250 से ज़्यादा दिन बारिश"; the reference's 14.1–17.7 s): a tear-off calendar pad flies in
// from the right and lands with a tilt; a page flips every 3 frames (each flip a page lifting from the top binding and
// flying off, the pad wobbling ±8°); the last page shows a big red "250"; then the pad slides left and "rainy days/साल"
// types in beside it in yellow. Transparent, 1080×700, 60 fps. `pad` / `page` are the creator's images (pad body and a
// single page); without them a drawn pad is used. `flips` pages flip from frame `start`.
export const U07Calendar: React.FC<{ pad?: string; page?: string; start?: number; flips?: number; text?: string }> = ({ pad, page, start = 14, flips = 9, text = 'बारिश वाले दिन/साल' }) => {
  useFonts();
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const end = start + flips * 3;
  const slide = ramp(f, end + 10, end + 28, Easing.inOut(Easing.cubic));
  const x = 540 + (1 - inn) * 700 - slide * 260;
  const flipping = f >= start && f < end;
  const wob = flipping ? Math.sin(((f - start) / 3) * Math.PI) * 8 : wobble(f, end, 2.5, 4) * 6;
  const W = 280, H = 330;
  const [ix, iy, ir] = idle(f, 3);
  const v = f < 12 ? (1 - inn) * 60 : f > end + 10 && f < end + 28 ? 14 : 0;
  const drawnPad = (num: string | null) => (
    <svg width={W} height={H} viewBox="0 0 280 330">
      <rect x={6} y={30} width={268} height={294} rx={18} fill="#FFFFFF" stroke="#C9CDD3" strokeWidth={4} />
      <rect x={6} y={30} width={268} height={70} rx={18} fill="#D8262B" />
      <rect x={6} y={78} width={268} height={22} fill="#D8262B" />
      {[50, 100, 150, 200].map((xx) => <rect key={xx} x={xx} y={10} width={18} height={44} rx={9} fill="#8A9099" stroke="#5A5F66" strokeWidth={3} />)}
      {num ? <text x={140} y={250} textAnchor="middle" fontFamily={NUM} fontSize={130} fill="#D8262B">{num}</text>
        : Array.from({ length: 20 }, (_, i) => <rect key={i} x={30 + (i % 5) * 46} y={124 + Math.floor(i / 5) * 46} width={30} height={30} rx={4} fill="#DDE2E8" />)}
    </svg>
  );
  const flipK = flipping ? ((f - start) % 3) / 3 : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - W / 2 + ix, top: 350 - H / 2 + iy, width: W, height: H, transform: `rotate(${-6 + wob + ir}deg)`, filter: [mblur(v), 'drop-shadow(0 14px 16px rgba(0,0,0,0.45))'].filter(Boolean).join(' ') }}>
        {pad ? <Img src={pad} style={{ width: W, height: H, objectFit: 'contain' }} /> : drawnPad(f >= end ? '250' : null)}
        {pad && f >= end && <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: NUM, fontSize: 120, color: '#D8262B' }}>250</div>}
        {flipping && (
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 8%', transform: `perspective(800px) rotateX(${flipK * 170}deg) translateY(${-flipK * 40}px)`, opacity: 1 - flipK }}>
            {page ? <Img src={page} style={{ width: W, height: H, objectFit: 'contain' }} /> : drawnPad(null)}
          </div>
        )}
      </div>
      {f >= end + 22 && (
        <div style={{ position: 'absolute', left: x + W / 2 + 10 + ix, top: 310 + iy + Math.sin(f / 17) * 4, fontFamily: UI, fontWeight: 800, fontSize: 66, color: C.yellow, whiteSpace: 'nowrap', transform: 'rotate(-6deg)',
          textShadow: '0 4px 0 rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.4)' }}><TypeOn text={text} f={f} at={end + 22} step={2} /></div>
      )}
      <div style={{ display: 'none' }}>{pop(f, 0, 1)}</div>
    </AbsoluteFill>
  );
};
