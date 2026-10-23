import React from 'react';
import { AbsoluteFill, Easing, random, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { pop, ramp, wobble } from './theme';

// p03_odometer (lines 1, 4, 5, 6 and 7: "$5,300,000", "20 करोड़ लीटर", "36 ships", "36 → 22"; the reference's 1.0–2.0,
// 22–25, 30–31, 38–39 and 44.5–46 s): a big glowing number that counts from `from` to `to` over `dur` frames with an
// ease-out, its lower digits scrambling (random digits with a vertical motion blur) while the leading digits settle, then
// lands with a scale bump and a glow flash. `down` counts downward in red with a ↓ arrow. Thousands separators in the
// Indian or Western style (`indian`). Transparent, 1000×260, 60 fps; centred.
const fmt = (n: number, indian: boolean) => (indian ? Math.round(n).toLocaleString('en-IN') : Math.round(n).toLocaleString('en-US'));
export const P03Odometer: React.FC<{ from?: number; to?: number; dur?: number; prefix?: string; suffix?: string; indian?: boolean; down?: boolean; size?: number; color?: string }> = ({
  from = 0, to = 5300000, dur = 60, prefix = '$', suffix = '', indian = false, down = false, size = 150, color,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const p = ramp(f, 4, 4 + dur, Easing.out(Easing.cubic));
  const v = from + (to - from) * p;
  const done = p >= 1;
  const txt = fmt(v, indian);
  const fin = fmt(to, indian);
  // scramble the digits that are still moving (those right of the first digit that differs from the final value)
  let firstDiff = 0;
  while (firstDiff < Math.min(txt.length, fin.length) && txt.length === fin.length && txt[firstDiff] === fin[firstDiff]) firstDiff++;
  const chars = txt.split('').map((c, i) => (!done && /\d/.test(c) && i > firstDiff ? String(Math.floor(random(`d${f}${i}`) * 10)) : c));
  const land = done ? wobble(f, 4 + dur, 3, 7) : 0;
  const s = pop(f, 0, 10, 2) * (1 + 0.08 * land);
  const glow = done ? Math.max(0, 1 - (f - 4 - dur) / 24) : 0.3;
  const col = color ?? (down ? '#FF4A4A' : '#FFFFFF');
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${s}) translateY(${Math.sin(f / 23) * 4}px)`, fontFamily: NUM, fontSize: size, color: col, whiteSpace: 'nowrap', letterSpacing: 2,
        textShadow: `0 0 ${18 + 30 * glow}px ${down ? 'rgba(255,60,60,0.8)' : 'rgba(255,240,180,0.9)'}, 0 6px 0 rgba(0,0,0,0.35)`, WebkitTextStroke: '6px rgba(10,20,30,0.9)', paintOrder: 'stroke fill' }}>
        {down && <span style={{ fontSize: size * 0.7 }}>↓ </span>}
        {prefix}
        {chars.map((c, i) => (
          <span key={i} style={{ display: 'inline-block', filter: !done && i > firstDiff && /\d/.test(c) ? 'blur(2.5px)' : undefined, transform: !done && i > firstDiff ? `translateY(${(random(`y${f}${i}`) - 0.5) * 10}px)` : undefined }}>{c}</span>
        ))}
        {suffix && <span style={{ fontSize: size * 0.42, marginLeft: 12 }}>{suffix}</span>}
      </div>
    </AbsoluteFill>
  );
};
