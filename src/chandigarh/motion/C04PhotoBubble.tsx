import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, idle } from './theme';

// c04_photo_bubble (line 1–2, the reference's 0:01.5–0:03.6, and line 3's Lahore): from a point on the map (`at`,
// the pointer tip) a round photo bubble grows out of nothing (0 → 1 with a back-ease while a blur clears, 10 frames),
// a thin white rim, a white pointer triangle and a soft shadow, floating gently. `shots` = [frame, src] swaps the
// picture with a quick pop. `stamp` slams a red ✕ over it with a shake; `fly` = [frame, dx, dy] sends it off (into
// Pakistan) and pops it; `out` blurs and shrinks it back into the pin. `size` its diameter. Transparent, 1080×1920.
export const C04PhotoBubble: React.FC<{ at: [number, number]; shots: [number, string, ('cover' | 'contain')?][]; size?: number; out?: number; stamp?: number; fly?: [number, number, number] }> = ({ at, shots, size = 360, out, stamp, fly }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const q = out !== undefined ? interpolate(f, [out, out + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const fl = fly ? interpolate(f, [fly[0], fly[0] + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const flyPop = fly ? interpolate(f, [fly[0] + 14, fly[0] + 22], [0, 1], clamp) : 0;
  const sc = s * (1 - q) * (1 - flyPop);
  if (sc <= 0.01) return null;
  let k = 0;
  for (let i = 0; i < shots.length; i++) if (f >= shots[i][0]) k = i;
  const swap = shots[k][0] > 0 ? interpolate(f, [shots[k][0], shots[k][0] + 8], [0.85, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) }) : 1;
  const [ix, iy] = idle(f, 2, 0.35);
  // the ✕ clears on the next swap after it (the computer is crossed out, the body is not)
  const clear = stamp !== undefined ? shots.find(([sf]) => sf > stamp)?.[0] : undefined;
  const st = stamp !== undefined && (clear === undefined || f < clear) ? interpolate(f, [stamp, stamp + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) }) : 0;
  const shake = stamp !== undefined && f >= stamp && f < stamp + 12 ? Math.sin(f * 2.8) * 10 * (1 - (f - stamp) / 12) : 0;
  const r = size / 2, x = at[0] + (fly ? fly[1] * fl : 0) + shake, y = at[1] + (fly ? fly[2] * fl : 0);
  const blur = (1 - s) * 14 + q * 12;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - r + ix, top: y - size - 26 + iy, width: size, height: size + 26, transformOrigin: '50% 100%', transform: `scale(${sc * swap})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: 'absolute', left: r - 16, top: size - 6, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '26px solid #fff', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 14px 26px rgba(0,0,0,0.5)', background: '#ddd' }}>
          <Img src={shots[k][1]} style={{ width: '100%', height: '100%', objectFit: shots[k][2] ?? 'cover', background: '#fff', transform: `scale(${shots[k][2] === 'contain' ? 0.94 + 0.03 * Math.sin(f / 30) : 1.08 + 0.04 * Math.sin(f / 30)})` }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.25), rgba(255,255,255,0) 45%)' }} />
        </div>
        {st > 0 && (
          <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <g transform={`translate(${r} ${r}) scale(${2 - st})`} stroke="#FF2E3F" strokeWidth={size / 12} strokeLinecap="round" opacity={Math.min(1, st * 2)} style={{ filter: 'drop-shadow(0 0 10px #FF2E3F) drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }}>
              <line x1={-r * 0.5} y1={-r * 0.5} x2={r * 0.5} y2={r * 0.5} /><line x1={r * 0.5} y1={-r * 0.5} x2={-r * 0.5} y2={r * 0.5} />
            </g>
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};
