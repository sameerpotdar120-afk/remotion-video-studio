import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, useFonts } from './font';
import { C, clamp, idle } from './theme';

// s12_card (line 9, the reference's tilted "FREQUENT LANDSLIDES" card): a white-framed card slides in from the right,
// tilted, overshoots and settles, holding `children` (a live view), with a caption bar under the picture: a big title
// and a small line. Floats while held. Transparent.
export const S12Card: React.FC<{ x: number; y: number; w?: number; h?: number; tilt?: number; title: string; sub?: string; t0?: number; out?: number; accent?: string; children?: React.ReactNode }> = ({ x, y, w = 760, h = 560, tilt = -5, title, sub, t0 = 0, out, accent = C.red, children }) => {
  useFonts();
  const f = useCurrentFrame();
  const p = interpolate(f, [t0, t0 + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const O = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const [ix, iy, ir] = idle(f, 7, 0.8);
  if (f < t0) return null;
  const dx = (1 - p) * 1200 - O * 1300;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x - w / 2 + dx + ix, top: y - h / 2 + iy, width: w, transform: `rotate(${tilt + (1 - p) * 10 + ir}deg)`, background: '#fff', padding: 14, paddingBottom: 0,
        boxShadow: '0 30px 70px rgba(0,0,0,0.75)' }}>
        <div style={{ width: w - 28, height: h, overflow: 'hidden', position: 'relative', background: '#111' }}>{children}</div>
        <div style={{ padding: '14px 8px 18px' }}>
          <div style={{ fontFamily: TITLE, fontSize: 64, lineHeight: 1, color: C.ink, letterSpacing: 1 }}><span style={{ display: 'inline-block', width: 16, height: 46, background: accent, marginRight: 14, verticalAlign: 'middle' }} />{title}</div>
          {sub && <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: '#4A5560', marginTop: 8 }}>{sub}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
