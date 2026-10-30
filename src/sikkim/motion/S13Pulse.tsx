import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, useFonts } from './font';
import { C, clamp, wobble } from './theme';

// s13_pulse (line 10, the reference's earthquake rings): red rings throb out from (x, y) every 18 frames, the area
// under them glows red, and a "ZONE IV · HIGH RISK" tag stamps in beside them with a screen jolt (`shake` returns the
// jolt so the edit can shake the whole frame). Transparent.
export const quakeShake = (f: number, t: number) => [wobble(f, t, 7, 3) * 18, wobble(f, t + 2, 6, 3) * 12] as const;
export const S13Pulse: React.FC<{ x: number; y: number; t0?: number; tag?: number; out?: number; r?: number }> = ({ x, y, t0 = 0, tag, out, r = 360 }) => {
  useFonts();
  const f = useCurrentFrame();
  const In = interpolate(f, [t0, t0 + 10], [0, 1], clamp);
  const O = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const T = tag !== undefined ? interpolate(f, [tag, tag + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) }) : 0;
  if (f < t0) return null;
  return (
    <AbsoluteFill style={{ opacity: In * O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs><radialGradient id="pqG"><stop offset="0" stopColor={C.red} stopOpacity={0.55} /><stop offset="1" stopColor={C.red} stopOpacity={0} /></radialGradient></defs>
        <circle cx={x} cy={y} r={r * (0.8 + 0.08 * Math.sin(f / 4))} fill="url(#pqG)" />
        {[0, 1, 2, 3].map((k) => {
          const ph = (((f - t0) / 18 + k / 4) % 1 + 1) % 1;
          return <circle key={k} cx={x} cy={y} r={30 + ph * r} fill="none" stroke={C.red} strokeWidth={10 * (1 - ph) + 2} opacity={(1 - ph) * 0.9} />;
        })}
        <circle cx={x} cy={y} r={16} fill="#fff" stroke={C.red} strokeWidth={6} />
      </svg>
      {T > 0 && <div style={{ position: 'absolute', left: 540, top: y + r * 0.62, transform: `translate(-50%,0) scale(${T}) rotate(-3deg)`, textAlign: 'center' }}>
        <div style={{ background: C.red, color: '#fff', fontFamily: TITLE, fontSize: 92, lineHeight: 1.05, padding: '6px 30px', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>ZONE IV</div>
        <div style={{ display: 'inline-block', background: '#fff', color: C.red, fontFamily: LABEL, fontWeight: 800, fontSize: 40, letterSpacing: 6, padding: '6px 20px', whiteSpace: 'nowrap' }}>HIGH RISK</div>
      </div>}
    </AbsoluteFill>
  );
};
