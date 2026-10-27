import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp } from './theme';

// p35_bracket (line 13, "वो तो बस थोड़ा सा हिस्सा है"): a white curly bracket draws down the right edge from `top`
// to `bottom` (screen px) beside the layer it marks (the floating surface plastic), 12 frames, then a boxed label pops
// at its point and nudges in and out. `color` tints the label rim. Transparent, 1080×1920.
export const P35Bracket: React.FC<{ top: number; bottom: number; x?: number; label?: string; color?: string; out?: number }> = ({ top, bottom, x = 960, label = 'थोड़ा सा', color = '#3FD8FF', out }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lab = interpolate(f, [10, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
  const op = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const m = (top + bottom) / 2, k = 26;
  const d = `M${x - k},${top} Q${x},${top} ${x},${top + k} L${x},${m - k} Q${x},${m} ${x + k},${m} Q${x},${m} ${x},${m + k} L${x},${bottom - k} Q${x},${bottom} ${x - k},${bottom}`;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
        <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${t} 2`} />
      </svg>
      {lab > 0 && <div style={{ position: 'absolute', left: x - 20, top: m, transform: `translate(-100%, -50%) translateX(${Math.sin(f / 10) * 6 - 20}px) scale(${lab})`, transformOrigin: '100% 50%', padding: '4px 18px 0', borderRadius: 12,
        background: 'rgba(255,255,255,0.95)', border: `4px solid ${color}`, fontFamily: UI, fontWeight: 800, fontSize: 42, color: '#0B1620', whiteSpace: 'nowrap', boxShadow: '0 6px 12px rgba(0,0,0,0.4)' }}>{label}</div>}
    </AbsoluteFill>
  );
};
