import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, wobble } from './theme';

// p24_pin_drop (line 1, "जो आपको किसी भी नक्शे पर नहीं मिलेगा"; line 3, the California pin): the creator's red map pin
// (gp19) drops onto `at` (screen px, the tip) from 260 px up (12 frames, ease-in), squashes and bounces with a ring
// on the water. Then either a "?" pops above it (`ask`), or a boxed `label`. At `stamp` a red ✕ slams over it (2× → 1
// with a shake) and at `stamp`+16 the pin tips over and falls away. Transparent, 1080×1920.
export const P24PinDrop: React.FC<{ src: string; at: [number, number]; h?: number; ask?: boolean; label?: string; stamp?: number }> = ({ src, at, h = 150, ask = true, label, stamp }) => {
  useFonts();
  const f = useCurrentFrame();
  const drop = interpolate(f, [0, 12], [-260, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const sq = f > 12 ? 1 - 0.22 * wobble(f, 12, 2.5, 5) : 1;
  const ring = ((f - 12) % 45) / 45;
  const q = stamp !== undefined ? interpolate(f, [stamp + 16, stamp + 34], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const st = stamp !== undefined ? interpolate(f, [stamp, stamp + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) }) : 0;
  const shake = stamp !== undefined && f >= stamp && f < stamp + 10 ? Math.sin(f * 3) * 8 * (1 - (f - stamp) / 10) : 0;
  const pop = interpolate(f, [16, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) }) * (1 - q);
  const w = h * 0.7;
  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      {f > 12 && q < 1 && <div style={{ position: 'absolute', left: at[0] - (20 + 90 * ring) / 2, top: at[1] - (8 + 26 * ring) / 2, width: 20 + 90 * ring, height: 8 + 26 * ring, borderRadius: '50%', border: '3px solid #fff', opacity: (1 - ring) * 0.8 }} />}
      <Img src={src} style={{ position: 'absolute', left: at[0] - w / 2, top: at[1] - h, width: w, height: h, objectFit: 'contain', transformOrigin: '50% 100%',
        transform: `translateY(${drop + q * 300}px) rotate(${q * 70}deg) scale(${2 - sq}, ${sq})`, opacity: 1 - q, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.45))' }} />
      {pop > 0 && (ask || label) && (
        <div style={{ position: 'absolute', left: at[0], top: at[1] - h - 20, transform: `translate(-50%, -100%) scale(${pop})`, transformOrigin: '50% 100%', fontFamily: UI, fontWeight: 800, whiteSpace: 'nowrap',
          ...(label ? { fontSize: 44, padding: '4px 20px 0', borderRadius: 12, background: 'rgba(255,255,255,0.95)', color: C.ink, boxShadow: '0 6px 12px rgba(0,0,0,0.4)' }
            : { fontSize: 110, color: '#fff', textShadow: `0 0 14px ${C.cyanGlow}, 0 6px 10px rgba(0,0,0,0.5)` }) }}>{label ?? '?'}</div>
      )}
      {st > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
          <g transform={`translate(${at[0]} ${at[1] - h * 0.55}) scale(${2 - st}) rotate(${-8 + 8 * st})`} stroke="#FF2E3F" strokeWidth={22} strokeLinecap="round" opacity={Math.min(1, st * 2)} style={{ filter: 'drop-shadow(0 0 10px #FF2E3F) drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }}>
            <line x1={-70} y1={-70} x2={70} y2={70} /><line x1={70} y1={-70} x2={-70} y2={70} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};
