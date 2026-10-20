import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, pop, ramp } from './theme';

// w07_distance (line 3, "हज़ारों किलोमीटर दूर"; the reference's 11.0–12.8 s): a dashed line draws from A to B while a
// small label rides along its middle and the kilometre figure ticks up to `km`, with miles under it. Transparent,
// 1080×700, 60 fps; A and B are passed in this box. `text` overrides the counter (e.g. "हज़ारों km").
export const W07Distance: React.FC<{ a?: [number, number]; b?: [number, number]; km?: number; text?: string }> = ({ a = [140, 300], b = [940, 420], km = 4000, text }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = ramp(f, 0, 70, Easing.inOut(Easing.cubic));
  const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
  const mx = (a[0] + x) / 2, my = (a[1] + y) / 2;
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const n = Math.round(km * k);
  const s = pop(f, 4, 14, 2);
  return (
    <AbsoluteFill>
      <svg width={1080} height={700}>
        <path d={`M ${a[0]} ${a[1]} L ${x} ${y}`} stroke="#3A3A3A" strokeWidth={6} strokeDasharray="20 12" strokeLinecap="round" />
        <circle cx={a[0]} cy={a[1]} r={9} fill="#3A3A3A" />
        {k > 0.98 && <circle cx={b[0]} cy={b[1]} r={9} fill="#3A3A3A" />}
      </svg>
      <div style={{ position: 'absolute', left: mx, top: my + 40, transform: `translate(-50%,-50%) rotate(${ang}deg) scale(${s})`, textAlign: 'center' }}>
        <div style={{ background: C.yellow, padding: '0 14px', fontFamily: NUM, fontSize: 40, color: C.ink, whiteSpace: 'nowrap' }}>{text ?? `${n.toLocaleString('en-IN')} km`}</div>
        {!text && <div style={{ fontFamily: NUM, fontSize: 24, color: '#333' }}>({Math.round(n * 0.6214).toLocaleString('en-IN')} mi)</div>}
      </div>
    </AbsoluteFill>
  );
};
