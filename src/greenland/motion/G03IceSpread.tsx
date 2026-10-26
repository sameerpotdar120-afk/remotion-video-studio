import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { C, clamp, pop, ramp } from './theme';

// g03_ice_spread (line 1, "ये ज़मीन 80 प्रतिशत बर्फ़ से ढकी है"; line 7, "लगभग पूरा बर्फ़ से ढका हुआ"): the land under
// Greenland's outline first dims and cools, then the creator's glacier ice (gl11: white ice, blue crevasses, melt
// pools) spreads over it from `from` with a living, wavy front. The sheet has thickness (a soft shadow under it), a
// frosty white band on the moving front, its crevasses glowing a little brighter as it settles, and a cold glint
// travelling across. A glassy "80% बर्फ़" badge counts up beside it. `d` is the outline in screen px (the edit
// projects Greenland through its camera); `tex` the texture image. Over `dur` frames. Transparent, 1080×1920, 60 fps.
export const G03IceSpread: React.FC<{ d: string; from: [number, number]; tex?: string; reach?: number; dur?: number; badge?: [number, number] | null; value?: number; label?: string; texSize?: number; out?: number }> = ({
  d, from, tex, reach = 900, dur = 70, badge = [780, 520], value = 80, label = 'बर्फ़', texSize = 1100, out,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const dim = ramp(f, 0, 12);
  const p = ramp(f, 6, 6 + dur, Easing.inOut(Easing.cubic));
  const r = Math.max(1, reach * p);
  const n = Math.round(interpolate(f, [10, 6 + dur], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const b = pop(f, 8, 18, 2.4);
  const settle = ramp(f, 6 + dur * 0.8, 6 + dur + 30);
  const gl = ((f - 6 - dur * 0.5) * 9) % 2600;
  const o = out !== undefined ? 1 - ramp(f, out, out + 12) : 1;
  if (o <= 0) return null;
  const rot = `rotate(${f * 0.12} ${from[0]} ${from[1]})`;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="g03edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={110} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="g03rg" gradientUnits="userSpaceOnUse" cx={from[0]} cy={from[1]} r={r}>
            <stop offset="0" stopColor="#fff" /><stop offset="0.93" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="g03front" gradientUnits="userSpaceOnUse" cx={from[0]} cy={from[1]} r={r}>
            <stop offset="0.8" stopColor="#fff" stopOpacity={0} /><stop offset="0.95" stopColor="#fff" stopOpacity={1} /><stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <mask id="g03m" maskUnits="userSpaceOnUse" x={-600} y={-600} width={2300} height={3100}>
            <circle cx={from[0]} cy={from[1]} r={r * 1.02} fill="url(#g03rg)" filter="url(#g03edge)" transform={rot} />
          </mask>
          <mask id="g03fm" maskUnits="userSpaceOnUse" x={-600} y={-600} width={2300} height={3100}>
            <circle cx={from[0]} cy={from[1]} r={r * 1.02} fill="url(#g03front)" filter="url(#g03edge)" transform={rot} />
          </mask>
          <clipPath id="g03c"><path d={d} /></clipPath>
          {tex && (
            <pattern id="g03tex" patternUnits="userSpaceOnUse" x={from[0] - texSize / 2} y={from[1] - texSize / 2} width={texSize} height={texSize}>
              <image href={tex} width={texSize} height={texSize} preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
          <linearGradient id="g03glint" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#E9FBFF" stopOpacity={0.55} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
        </defs>
        <g clipPath="url(#g03c)">
          {/* the land under it dims and cools first, so the ice reads against it */}
          <rect x={-600} y={-600} width={2300} height={3100} fill="#0E3550" opacity={0.42 * dim * (1 - 0.6 * settle)} />
          <g mask="url(#g03m)">
            <g style={{ filter: 'drop-shadow(0 10px 10px rgba(0,25,50,0.55))' }}>
              <rect x={-600} y={-600} width={2300} height={3100} fill={tex ? 'url(#g03tex)' : C.iceGlow} />
            </g>
            {/* the crevasses glow a little brighter as it settles */}
            {tex && <rect x={-600} y={-600} width={2300} height={3100} fill="url(#g03tex)" style={{ mixBlendMode: 'screen' }} opacity={0.18 + 0.14 * settle * (0.6 + 0.4 * Math.sin(f / 23))} />}
            <rect x={-600} y={-600} width={2300} height={3100} fill="#5FC8FF" style={{ mixBlendMode: 'multiply' }} opacity={0.12} />
            <rect x={-1300 + gl} y={-600} width={260} height={3100} fill="url(#g03glint)" transform="rotate(24 540 960)" style={{ mixBlendMode: 'screen' }} />
          </g>
          {p < 1 && <rect x={-600} y={-600} width={2300} height={3100} fill="#FFFFFF" mask="url(#g03fm)" opacity={0.85} style={{ filter: 'blur(2px)' }} />}
        </g>
        <path d={d} fill="none" stroke="#E8FAFF" strokeWidth={3.5} opacity={0.85 * p} style={{ filter: `drop-shadow(0 0 8px ${C.ice})` }} />
      </svg>
      {badge && (
        <div style={{ position: 'absolute', left: badge[0], top: badge[1], transform: `translate(-50%,-50%) scale(${b})`, padding: '10px 34px 6px', borderRadius: 28, textAlign: 'center',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.95), rgba(214,244,255,0.9))', border: '4px solid rgba(255,255,255,0.95)',
          boxShadow: `0 0 0 4px ${C.iceDeep}, 0 0 34px ${C.ice}, 0 16px 26px rgba(0,20,40,0.45)` }}>
          <div style={{ fontFamily: NUM, fontSize: 150, lineHeight: 1, color: C.iceDeep, textShadow: '0 3px 0 #fff' }}>{n}%</div>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 56, lineHeight: 1.25, color: '#0B2B44' }}>{label}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
