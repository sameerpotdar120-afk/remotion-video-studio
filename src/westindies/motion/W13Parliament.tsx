import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, useCurrentFrame } from 'remotion';
import { W09FedFlag } from './W09FedFlag';
import { clamp, wobble } from './theme';

// w13_parliament (line 8, "अपनी संसद"): the parliament building (wi07) rises out of the ground in 22 frames with an
// overshoot and a settle, kicking up a band of dust; its windows light up one after another; then the Federation flag
// (w09) is hoisted on its roof. Drawn stand-in until the creator's image arrives. Transparent, 900×700, 60 fps; the
// ground line is at y 620.
export const W13Parliament: React.FC<{ src?: string; flagAt?: number }> = ({ src, flagAt = 30 }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 22], [1, 0], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const settle = wobble(f, 22, 3, 8);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 0 80px 0)' }}>
        <div style={{ position: 'absolute', left: 90, top: 250, width: 720, height: 380, transform: `translateY(${rise * 400}px) scaleY(${1 + 0.02 * settle})`, transformOrigin: '50% 100%' }}>
          {src ? <Img src={src} style={{ width: 720, height: 380, objectFit: 'contain' }} /> : (
            <svg width={720} height={380}>
              <rect x={40} y={150} width={640} height={220} fill="#E9DCC0" stroke="#8C7A5A" strokeWidth={3} />
              <path d="M 20 150 L 360 70 L 700 150 Z" fill="#B5502C" stroke="#6A2A14" strokeWidth={3} />
              <rect x={320} y={10} width={80} height={100} fill="#E9DCC0" stroke="#8C7A5A" strokeWidth={3} />
              <circle cx={360} cy={50} r={22} fill="#fff" stroke="#6A5A3A" strokeWidth={3} />
              {Array.from({ length: 10 }, (_, i) => {
                const lit = interpolate(f, [22 + i * 2, 28 + i * 2], [0, 1], clamp);
                return <rect key={i} x={70 + i * 60} y={200} width={30} height={60} rx={14} fill={lit > 0.5 ? '#FFD98A' : '#5A6A78'} opacity={0.9} />;
              })}
              {[260, 300, 420, 460].map((x) => <rect key={x} x={x} y={270} width={18} height={100} fill="#F6EEDC" stroke="#8C7A5A" strokeWidth={2} />)}
            </svg>
          )}
        </div>
      </div>
      {f < 50 && Array.from({ length: 26 }, (_, i) => {
        const t = interpolate(f, [4, 46], [0, 1], clamp);
        const x = 90 + random(`pd${i}`) * 720;
        return <div key={i} style={{ position: 'absolute', left: x, top: 600 - 60 * t * random(`pe${i}`), width: 40, height: 40, borderRadius: '50%', background: 'rgba(210,190,150,0.5)', filter: 'blur(8px)', transform: `scale(${0.5 + t})`, opacity: 1 - t }} />;
      })}
      {f >= flagAt && (
        <div style={{ position: 'absolute', left: 430, top: -60, width: 520, height: 640, transform: 'scale(0.45)', transformOrigin: '0 100%' }}>
          <Sequence from={flagAt} layout="none"><W09FedFlag /></Sequence>
        </div>
      )}
    </AbsoluteFill>
  );
};
