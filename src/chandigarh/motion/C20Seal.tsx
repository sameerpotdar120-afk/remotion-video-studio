import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { GEO, NUM, useFonts } from './font';
import { clamp, idle } from './theme';

// c20_seal (line 12, "2016 में… World Heritage Site घोषित किया"): the creator's gold seal (cg26, a blank medal, no
// UNESCO logo) drops from above at 2×, slams down at 1× with a squash and a dust ring (14 frames), then its centre
// reads "WORLD HERITAGE" round the top and "2016" big in the middle, a light glint sweeping across. Centred; transparent.
export const C20Seal: React.FC<{ src: string; size?: number; year?: string }> = ({ src, size = 420, year = '2016' }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sq = f > 12 ? 1 - 0.12 * Math.exp(-(f - 12) / 4) * Math.cos((f - 12) / 2) : 1;
  const ring = interpolate(f, [12, 40], [0, 1], clamp);
  const txt = interpolate(f, [16, 28], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const glint = ((f - 20) % 90) / 90;
  const [ix, iy] = idle(f, 9, 0.25);
  const sc = (2 - t) * (f > 12 ? 1 : 1);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {f > 12 && <div style={{ position: 'absolute', width: size * (1 + ring), height: size * 0.35 * (1 + ring), borderRadius: '50%', border: '4px solid rgba(255,230,170,0.8)', opacity: 1 - ring, top: '62%' }} />}
      <div style={{ position: 'relative', width: size, height: size, transform: `translate(${ix}px, ${iy + (1 - t) * -300}px) scale(${sc * (2 - sq)}, ${sc * sq})`, opacity: Math.min(1, t * 3) }}>
        <Img src={src} style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.55))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: txt, transform: `scale(${0.6 + 0.4 * txt})` }}>
          <div style={{ fontFamily: GEO, fontWeight: 800, fontSize: size * 0.075, letterSpacing: 3, color: '#5A3A08' }}>WORLD HERITAGE</div>
          <div style={{ fontFamily: NUM, fontSize: size * 0.24, color: '#4A2E04', lineHeight: 1 }}>{year}</div>
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(120deg, rgba(255,255,255,0) ${glint * 140 - 20}%, rgba(255,255,255,0.55) ${glint * 140}%, rgba(255,255,255,0) ${glint * 140 + 20}%)`, mixBlendMode: 'screen' }} />
      </div>
    </AbsoluteFill>
  );
};
