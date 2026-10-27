import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, idle } from './theme';

// p07_count_up (line 4, "करीब 16 लाख square kilometre"; the reference's "617,000 mi²"): a big cyan number counts up
// from `from` to `to` in `dur` frames (ease-out, ticking), with the unit beside it, bumps on the last value, then the
// sub-line (`sub`, e.g. "भारत का लगभग आधा") slides up under it. The whole block scales up slowly while it holds, like
// the reference. Centred; transparent.
export const P07CountUp: React.FC<{ from?: number; to?: number; dur?: number; unit?: string; sub?: string; size?: number }> = ({ from = 0, to = 16, dur = 50, unit = ' लाख km²', sub, size = 150 }) => {
  useFonts();
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [4, 4 + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const pop = interpolate(f, [0, 10], [0.3, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
  const bump = f > 4 + dur ? 1 + 0.12 * Math.exp(-(f - 4 - dur) / 5) : 1;
  const grow = 1 + 0.08 * interpolate(f, [0, 240], [0, 1], clamp);
  const subT = interpolate(f, [dur + 8, dur + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const [ix, iy, ir] = idle(f, 5, 0.3);
  const glow = `0 0 12px ${C.cyan}, 0 0 30px ${C.cyan}, 0 6px 12px rgba(0,0,0,0.5)`;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', transform: `translate(${ix}px, ${iy}px) rotate(${ir * 0.4}deg) scale(${pop * bump * grow})` }}>
        <div style={{ whiteSpace: 'nowrap', color: '#fff', textShadow: glow }}>
          <span style={{ fontFamily: NUM, fontSize: size, color: C.cyanGlow }}>{v.toLocaleString('en-IN')}</span>
          <span style={{ fontFamily: UI, fontWeight: 800, fontSize: size * 0.42 }}>{unit}</span>
        </div>
        {sub && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size * 0.32, color: '#fff', textShadow: glow, opacity: subT, transform: `translateY(${(1 - subT) * 30}px)` }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
