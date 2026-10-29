import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp } from './theme';

// c26_pin_hop (line 3, "एक बिल्कुल नई राजधानी": the search for a new capital): the creator's map pin (gp19) with a
// "?" above it hops from point to point (`pts`, screen px), `step` frames per hop, each hop an arc with a squash on
// landing and a ripple ring, the "?" wobbling; on the last point it settles. Transparent, 1080×1920.
export const C26PinHop: React.FC<{ src: string; pts: [number, number][]; step?: number; h?: number }> = ({ src, pts, step = 18, h = 130 }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = Math.min(pts.length - 1, Math.floor(f / step)), u = Math.min(1, (f - k * step) / (step * 0.7));
  const a = pts[Math.max(0, k - 1)], b = pts[k];
  const e = Easing.inOut(Easing.quad)(k === 0 ? 1 : u);
  const x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e - Math.sin(e * Math.PI) * 120 * (k === 0 ? 0 : 1);
  const land = f - k * step - step * 0.7;
  const sq = land > 0 && land < 10 ? 1 - 0.2 * Math.exp(-land / 3) * Math.cos(land) : 1;
  const ring = land > 0 ? Math.min(1, land / 24) : 0;
  const w = h * 0.68;
  const s = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill>
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: b[0] - 50 * ring - 10, top: b[1] - 15 * ring - 4, width: 20 + 100 * ring, height: 8 + 30 * ring, borderRadius: '50%', border: '3px solid #fff', opacity: 1 - ring }} />}
      <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, objectFit: 'contain', transformOrigin: '50% 100%', transform: `scale(${s * (2 - sq)}, ${s * sq})`, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.45))' }} />
      <div style={{ position: 'absolute', left: x, top: y - h - 20, transform: `translate(-50%, -100%) rotate(${Math.sin(f / 6) * 10}deg) scale(${s})`, fontFamily: UI, fontWeight: 800, fontSize: 90, color: '#fff', textShadow: '0 0 12px rgba(255,255,255,0.7), 0 6px 10px rgba(0,0,0,0.5)' }}>?</div>
    </AbsoluteFill>
  );
};
