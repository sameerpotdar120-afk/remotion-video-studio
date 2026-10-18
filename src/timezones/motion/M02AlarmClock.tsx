import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m02_alarm_clock: a cartoon twin-bell alarm clock springs in, its hands whirl round fast and slow down to land on a
// set time (props h, m), and it rattles as if ringing, with little shake lines. 600x700, 60 fps, 150 frames. Transparent.
// No numerals on the face (ticks only), so no fonts are needed.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M02AlarmClock: React.FC<{ h?: number; m?: number; body?: string }> = ({ h = 10, m = 0, body = '#E8343A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  // the hands spin 3 extra turns, easing out onto the target time
  const spin = interpolate(f, [6, 78], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const target = (h % 12) * 60 + m;
  const minutes = target - 3 * 720 * (1 - spin);
  const minA = (minutes % 60) * 6, hourA = (minutes / 60) * 30;
  const ring = f > 70 && f < 130 ? Math.sin(f * 1.9) * 5 * interpolate(f, [70, 130], [1, 0], c) : 0;
  const lines = f > 70 && f < 130 ? interpolate(f, [70, 80, 120, 130], [0, 1, 1, 0], c) : 0;
  return (
    <AbsoluteFill>
      <svg width={600} height={700} viewBox="0 0 600 700">
        <defs>
          <radialGradient id="face" cx="45%" cy="40%" r="65%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9eef5" /></radialGradient>
          <linearGradient id="bodyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={body} /><stop offset="1" stopColor="#9c1a22" /></linearGradient>
        </defs>
        <g transform={`translate(300 380) scale(${pop}) rotate(${ring})`}>
          {/* shake lines */}
          {[-1, 1].map((s) => (
            <g key={s} opacity={lines} stroke="#fff" strokeWidth={10} strokeLinecap="round">
              <path d={`M ${s * 250} -150 l ${s * 40} -24`} /><path d={`M ${s * 262} -80 l ${s * 46} 0`} /><path d={`M ${s * 250} -10 l ${s * 40} 24`} />
            </g>
          ))}
          {/* legs */}
          <path d="M -120 160 L -165 235" stroke="#2b2b33" strokeWidth={22} strokeLinecap="round" />
          <path d="M 120 160 L 165 235" stroke="#2b2b33" strokeWidth={22} strokeLinecap="round" />
          {/* bells and hammer */}
          <g transform={`rotate(${ring * 2})`}>
            <path d="M -175 -170 A 85 85 0 0 1 -30 -255 Z" fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={6} />
            <path d="M 175 -170 A 85 85 0 0 0 30 -255 Z" fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={6} />
            <rect x={-8} y={-268} width={16} height={46} rx={6} fill="#2b2b33" />
          </g>
          {/* body and face */}
          <circle r={210} fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={8} />
          <circle r={210} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={10} transform="translate(-6 -8) scale(0.94)" />
          <circle r={168} fill="url(#face)" stroke="#7a1a20" strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-5} y={-156} width={10} height={i % 3 === 0 ? 30 : 18} rx={4} fill="#2b2b33" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-9} y={-100} width={18} height={112} rx={9} fill="#1f1f26" transform={`rotate(${hourA})`} />
          <rect x={-6} y={-140} width={12} height={152} rx={6} fill="#1f1f26" transform={`rotate(${minA})`} />
          <circle r={16} fill={body} stroke="#1f1f26" strokeWidth={5} />
          {/* glass shine */}
          <path d="M -120 -90 A 150 150 0 0 1 -20 -150" fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
