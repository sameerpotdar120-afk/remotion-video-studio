import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// p21_ecg (line 7, "बस इस canal को ज़िंदा रखने के लिए", and line 8, "अगर पानी फिर भी खत्म हो गया"; the reference's
// 56–58.6 s): a heart-monitor panel: a green ECG trace sweeps left to right (the classic P-QRS-T beat every ~45
// frames, a bright head dot and a fading tail), a heart icon beats on each spike. At `flat` the colour drains to red,
// the beats shrink and the line goes flat, the heart greys out. Transparent, 800×240, 60 fps.
const beat = (x: number) => {
  const u = ((x % 160) + 160) % 160;
  if (u > 40 && u < 50) return -10 * Math.sin(((u - 40) / 10) * Math.PI);
  if (u > 60 && u < 64) return 14;
  if (u > 64 && u < 70) return -70 + (u - 64) * 6;
  if (u > 70 && u < 76) return 60 - (u - 70) * 12;
  if (u > 90 && u < 110) return -16 * Math.sin(((u - 90) / 20) * Math.PI);
  return 0;
};
export const P21Ecg: React.FC<{ flat?: number }> = ({ flat = 9999 }) => {
  const f = useCurrentFrame();
  const fl = ramp(f, flat, flat + 30);
  const head = (f * 7) % 700;
  const col = fl > 0.5 ? '#FF3B3B' : '#36E07A';
  const pts: string[] = [];
  for (let x = 0; x <= 700; x += 3) {
    pts.push(`${x === 0 ? 'M' : 'L'} ${50 + x} ${120 + beat(x + Math.floor((f * 7) / 700) * 700) * (1 - fl)}`);
  }
  const spike = Math.abs(((head % 160) - 66)) < 8 && fl < 0.9;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 20, top: 20, width: 760, height: 200, borderRadius: 22, background: 'rgba(6,16,22,0.88)', border: `4px solid ${col}`, boxShadow: `0 0 22px ${col}88` }} />
      <svg width={800} height={240} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="ecgFade" x1="0" x2="1"><stop offset="0" stopColor={col} stopOpacity={0.15} /><stop offset="1" stopColor={col} stopOpacity={1} /></linearGradient>
          <clipPath id="ecgClip"><rect x={50} y={20} width={head} height={200} /></clipPath>
        </defs>
        {[60, 120, 180].map((y) => <path key={y} d={`M 50 ${y} L 750 ${y}`} stroke="#ffffff14" strokeWidth={2} />)}
        <path d={pts.join(' ')} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" clipPath="url(#ecgClip)" style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
        <circle cx={50 + head} cy={120 + beat(head) * (1 - fl)} r={8} fill="#fff" />
        <g transform={`translate(720 60) scale(${spike ? 1.25 : 1})`}>
          <path d="M 0 12 C -22 -6 -14 -24 0 -12 C 14 -24 22 -6 0 12 Z" fill={fl > 0.9 ? '#6A6F75' : '#FF3B5C'} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
