import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { pop, ramp, wobble } from './theme';

// p03_odometer (lines 1, 3, 4, 5: "$5,300,000", "20 करोड़ लीटर", "36 ships", "36 → 22"; the reference's 1.0–2.0,
// 22–25, 30–31, 38–39 and 44.5–46 s): a big glowing number on rolling digit drums. Each digit is a vertical strip
// 0–9 that rolls (with a vertical motion blur from its own speed) to its place as the value runs from `from` to `to`
// with an ease-out; the lower digits spin faster and settle last, each landing with a tiny overshoot. Then the whole
// number lands with a scale bump, a glow flash and a light sweep, and keeps a slow float. `down` counts down in red
// with a ↓. Thousands separators Indian or Western (`indian`). Transparent, 1000×260, 60 fps; centred.
const fmt = (n: number, indian: boolean) => Math.round(n).toLocaleString(indian ? 'en-IN' : 'en-US');
export const P03Odometer: React.FC<{ from?: number; to?: number; dur?: number; prefix?: string; suffix?: string; indian?: boolean; down?: boolean; size?: number; color?: string }> = ({
  from = 0, to = 5300000, dur = 60, prefix = '$', suffix = '', indian = false, down = false, size = 150, color,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const p = ramp(f, 4, 4 + dur, Easing.out(Easing.cubic));
  const v = from + (to - from) * p;
  const fin = fmt(to, indian);
  const done = f >= 4 + dur;
  const land = done ? wobble(f, 4 + dur, 3, 7) : 0;
  const s = pop(f, 0, 10, 2) * (1 + 0.07 * land);
  const glow = done ? Math.max(0, 1 - (f - 4 - dur) / 24) : 0.25;
  const col = color ?? (down ? '#FF4A4A' : '#FFFFFF');
  const H = size * 1.12;
  // digit place values in the final string, so the layout never jumps while counting
  const places: (number | string)[] = [];
  let pw = 0;
  for (let i = fin.length - 1; i >= 0; i--) { if (/\d/.test(fin[i])) { places.unshift(pw); pw++; } else places.unshift(fin[i]); }
  const speed = Math.abs((to - from) * (ramp(f + 1, 4, 4 + dur, Easing.out(Easing.cubic)) - p));
  const sweep = done ? ramp(f, 4 + dur, 4 + dur + 26) : -1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', transform: `scale(${s}) translateY(${Math.sin(f / 23) * 4}px) rotate(${Math.sin(f / 37) * 0.6}deg)`, fontFamily: NUM, fontSize: size, color: col,
        filter: `drop-shadow(0 0 ${14 + 30 * glow}px ${down ? 'rgba(255,60,60,0.8)' : 'rgba(255,236,170,0.85)'}) drop-shadow(0 6px 0 rgba(0,0,0,0.35))` }}>
        {down && <span style={{ fontSize: size * 0.7, marginRight: 10 }}>↓</span>}
        {prefix && <span style={{ display: 'inline-block', height: H, lineHeight: `${H}px`, verticalAlign: 'middle' }}>{prefix}</span>}
        {places.map((pl, i) => {
          if (typeof pl === 'string') return <span key={i} style={{ display: 'inline-block', height: H, lineHeight: `${H}px`, verticalAlign: 'middle' }}>{pl}</span>;
          const unit = Math.pow(10, pl);
          const val = (Math.abs(v) / unit) % 10; // fractional: the drum rolls continuously
          const settled = Math.floor((Math.abs(to) / unit) % 10);
          const pos = done ? settled : val;
          const dv = Math.min(16, (speed / unit) * H * 0.4);
          const os = done ? wobble(f, 4 + dur + pl, 4, 9) * 0.12 : 0;
          return (
            <span key={i} style={{ position: 'relative', display: 'inline-block', width: size * 0.56, height: H, overflow: 'hidden', verticalAlign: 'middle', WebkitMaskImage: done ? undefined : 'linear-gradient(180deg, transparent, #000 28%, #000 72%, transparent)' }}>
              <span style={{ position: 'absolute', left: 0, right: 0, top: -(pos + os) * H }}>
                {Array.from({ length: 11 }, (_, d) => (
                  <span key={d} style={{ display: 'block', height: H, lineHeight: `${H}px`, textAlign: 'center', filter: dv > 0.6 ? `blur(${(dv * 0.3).toFixed(1)}px)` : undefined }}>{d % 10}</span>
                ))}
              </span>
            </span>
          );
        })}
        {suffix && <span style={{ fontSize: size * 0.4, marginLeft: 14, alignSelf: 'flex-end', marginBottom: size * 0.18 }}>{suffix}</span>}
        {sweep >= 0 && sweep < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 120 - 20}%`, width: 70, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))', transform: 'skewX(-20deg)', mixBlendMode: 'overlay' }} />}
      </div>
    </AbsoluteFill>
  );
};
