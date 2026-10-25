import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, clamp, pop, ramp } from './theme';

// g03_ice_spread (line 1, "ये ज़मीन 80 प्रतिशत बर्फ़ से ढकी है"; the reference's 0:02–0:05): a translucent icy-blue
// sheet spreads over the land from `from` (screen px), its edge wavy and alive (turbulence-displaced), a bright frost
// rim on the moving front and a slow shimmer inside, while a "80%" badge counts up beside it. `d` is the country's
// outline in screen px (the edit projects Greenland's rings through its camera). Over `dur` frames.
// Transparent, 1080×1920, 60 fps.
export const G03IceSpread: React.FC<{ d: string; from: [number, number]; reach?: number; dur?: number; badge?: [number, number]; value?: number; label?: string }> = ({
  d, from, reach = 900, dur = 70, badge = [780, 520], value = 80, label = 'बर्फ़',
}) => {
  useFonts();
  const f = useCurrentFrame();
  const p = ramp(f, 0, dur, Easing.inOut(Easing.cubic));
  const r = Math.max(1, reach * p);
  const n = Math.round(interpolate(f, [6, dur], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const b = pop(f, 4, 14, 2.4);
  const done = f > dur ? pop(f, dur, dur + 10, 3) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="g03edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={90} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="g03rg" gradientUnits="userSpaceOnUse" cx={from[0]} cy={from[1]} r={r}>
            <stop offset="0" stopColor="#fff" /><stop offset="0.9" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <mask id="g03m" maskUnits="userSpaceOnUse" x={-500} y={-500} width={2100} height={2900}>
            <circle cx={from[0]} cy={from[1]} r={r} fill="url(#g03rg)" filter="url(#g03edge)" transform={`rotate(${f * 0.15} ${from[0]} ${from[1]})`} />
          </mask>
          <clipPath id="g03c"><path d={d} /></clipPath>
          <linearGradient id="g03sh" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={C.iceGlow} stopOpacity={0.75} /><stop offset="0.5" stopColor={C.ice} stopOpacity={0.55} /><stop offset="1" stopColor={C.iceDeep} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <g clipPath="url(#g03c)">
          <g mask="url(#g03m)">
            <rect x={-500} y={-500} width={2100} height={2900} fill="url(#g03sh)" />
            {/* a slow shimmer band moving through the ice */}
            <rect x={-300 + ((f * 6) % 1800)} y={-500} width={160} height={2900} fill="#fff" opacity={0.18} transform={`rotate(25 540 960)`} style={{ filter: 'blur(30px)' }} />
          </g>
          {p < 1 && <circle cx={from[0]} cy={from[1]} r={r * 0.95} fill="none" stroke="#fff" strokeWidth={14} opacity={0.7 * (1 - p * 0.6)} filter="url(#g03edge)" style={{ mixBlendMode: 'screen' }} transform={`rotate(${f * 0.15} ${from[0]} ${from[1]})`} />}
        </g>
        <path d={d} fill="none" stroke={C.iceGlow} strokeWidth={4} opacity={0.9 * p} style={{ filter: `drop-shadow(0 0 10px ${C.ice})` }} />
      </svg>
      <div style={{ position: 'absolute', left: badge[0], top: badge[1], transform: `translate(-50%,-50%) scale(${b * (1 + 0.12 * done * Math.sin(f / 4) * Math.exp(-(f - dur) / 20))})`,
        padding: '6px 30px 2px', borderRadius: 26, background: 'rgba(255,255,255,0.92)', border: `5px solid ${C.iceDeep}`, boxShadow: `0 0 30px ${C.ice}, 0 12px 20px rgba(0,0,0,0.35)`, textAlign: 'center' }}>
        <div style={{ fontFamily: NUM, fontSize: 140, lineHeight: 1, color: C.iceDeep }}>{n}%</div>
        <div style={{ fontFamily: NUM, fontSize: 52, lineHeight: 1.2, color: C.ink }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};
