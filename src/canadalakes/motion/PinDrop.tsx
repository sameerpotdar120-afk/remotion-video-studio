import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Reference 20.5–27.0 s and 43–50 s: a red map pin falls in, squashes on landing, a ring ripples out from its tip, and a
 *  boxed label (children) slides up beside it. Anchored at the pin's tip (x, y). */
export const PinDrop: React.FC<{ x: number; y: number; size?: number; at?: number; children?: React.ReactNode }> = ({ x, y, size = 150, at = 0, children }) => {
  const f = useCurrentFrame() - at;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const fall = interpolate(f, [0, 7], [-260, 0], { extrapolateRight: 'clamp', easing: (t) => t * t });
  const sq = f >= 7 ? 1 - 0.22 * Math.exp(-(f - 7) / 3) * Math.cos((f - 7) / 1.6) : 1;
  const ring = interpolate(f, [7, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lab = spring({ frame: f - 9, fps, config: { damping: 13, stiffness: 160 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div style={{ position: 'absolute', left: -size * 0.9 * ring, top: -size * 0.3 * ring, width: size * 1.8 * ring, height: size * 0.6 * ring, borderRadius: '50%', border: `${4 * (1 - ring)}px solid rgba(255,255,255,${1 - ring})` }} />
      <svg width={size} height={size * 1.35} viewBox="0 0 40 54" style={{ position: 'absolute', left: -size / 2, top: -size * 1.35 + fall, transform: `scaleY(${sq}) scaleX(${2 - sq})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }}>
        <path d="M20 53 C20 53 3 31 3 19 A17 17 0 0 1 37 19 C37 31 20 53 20 53 Z" fill="#E8262B" stroke="#fff" strokeWidth={3} />
        <circle cx={20} cy={19} r={6.5} fill="#fff" />
      </svg>
      {children && (
        <div style={{ position: 'absolute', left: size * 0.45, top: -size * 1.25, opacity: lab, transform: `translateY(${(1 - lab) * 24}px)` }}>{children}</div>
      )}
    </div>
  );
};
