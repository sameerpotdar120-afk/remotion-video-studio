import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { pop, ramp, wobble } from './theme';

// p20_dam (line 7, "Panama अब Río Indio नदी पर एक नया dam बनाने जा रहा है"; the reference's 53–56 s): a river (a bright
// winding line with a flowing dash) draws down the map, a curved white concrete dam slams across it (drops from above
// with a bounce and a dust ring), the reservoir behind it fills outward as a blob with a shimmering edge, then a
// dashed arrow runs from the new lake toward Gatun Lake (off to the right) with "→ Gatun Lake". Tags "Río Indio",
// "नया dam". Transparent, 1080×1080, 60 fps; the edit passes `river` (an SVG path in this box) from the real data.
export const P20Dam: React.FC<{ river?: string; dam?: [number, number]; to?: [number, number]; name?: string }> = ({
  river = 'M 420 40 C 380 200 480 300 440 420 C 400 540 500 640 470 760 C 450 860 500 960 480 1060', dam = [450, 560], to = [1000, 420], name = 'Río Indio',
}) => {
  useFonts();
  const f = useCurrentFrame();
  const rd = ramp(f, 0, 30);
  const ds = pop(f, 30, 40, 2.4);
  const dy = (1 - ramp(f, 30, 38)) * -220;
  const fill = ramp(f, 42, 80);
  const arrow = ramp(f, 80, 104);
  const w = wobble(f, 38, 4, 8);
  const L = 1400;
  // the reservoir: a soft blob (smooth closed curve through 12 wobbling points) growing from the dam
  const P = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = (120 + 22 * Math.sin(i * 2.3 + 1) + 5 * Math.sin(f / 11 + i)) * fill;
    return [dam[0] + Math.cos(a) * r * 1.25, dam[1] - 120 + Math.sin(a) * r * 0.85];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(P[11], P[0]);
  const blob = `M ${m0[0]} ${m0[1]} ` + P.map((p, i) => { const m = mid(p, P[(i + 1) % 12]); return `Q ${p[0]} ${p[1]} ${m[0]} ${m[1]}`; }).join(' ') + ' Z';
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <path d={river} fill="none" stroke="#6FE6FF" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${L * rd} ${L}`} style={{ filter: 'drop-shadow(0 0 8px #6FE6FF)' }} />
        <path d={river} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="18 40" strokeDashoffset={-f * 3} opacity={rd} />
        {fill > 0 && (
          <g>
            <path d={blob} fill="#0B3A5A" opacity={0.35} transform="translate(8 12)" style={{ filter: 'blur(6px)' }} />
            <path d={blob} fill="#3FB6E8" stroke="#BFF4FF" strokeWidth={5} opacity={0.95} />
            {[0.75, 0.5, 0.28].map((k, j) => <path key={j} d={blob} fill="none" stroke="#E8FBFF" strokeWidth={3} opacity={0.25 + 0.2 * Math.sin(f / 10 + j)} transform={`translate(${dam[0] * (1 - k)} ${(dam[1] - 120) * (1 - k)}) scale(${k + 0.03 * Math.sin(f / 14 + j)})`} />)}
          </g>
        )}
        {ds > 0 && (
          <g transform={`translate(${dam[0]} ${dam[1] + dy + w * 6}) scale(${ds})`}>
            <path d="M -130 -10 Q 0 -60 130 -10 L 120 16 Q 0 -30 -120 16 Z" transform="translate(6 18)" fill="#000" opacity={0.3} style={{ filter: 'blur(5px)' }} />
            <path d="M -120 16 Q 0 -30 120 16 L 120 34 Q 0 -12 -120 34 Z" fill="#9AA2AA" />
            <path d="M -130 -10 Q 0 -60 130 -10 L 120 16 Q 0 -30 -120 16 Z" fill="#F0F2F4" stroke="#8A9096" strokeWidth={5} />
            <path d="M -110 -16 Q 0 -54 110 -16" stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} />
            {[-80, -40, 0, 40, 80].map((x) => <rect key={x} x={x - 6} y={-30 + Math.abs(x) * 0.15} width={12} height={30} fill="#B9BFC5" />)}
            {f < 60 && <ellipse rx={150 + (f - 38) * 6} ry={(150 + (f - 38) * 6) * 0.3} fill="none" stroke="#E8E2D6" strokeWidth={6} opacity={Math.max(0, 1 - (f - 38) / 22)} />}
          </g>
        )}
        {arrow > 0 && <path d={`M ${dam[0] + 150} ${dam[1] - 140} Q ${(dam[0] + to[0]) / 2} ${dam[1] - 320} ${dam[0] + 150 + (to[0] - dam[0] - 150) * arrow} ${dam[1] - 140 + (to[1] - dam[1] + 140) * arrow}`}
          fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="26 18" strokeDashoffset={-f * 2} strokeLinecap="round" />}
      </svg>
      {[[dam[0] - 220, 200, name, 20], [dam[0] + 170, dam[1] + 40, 'नया dam', 44], [to[0] - 120, to[1] - 110, '→ Gatun Lake', 96]].map(([x, y, t, at], i) => {
        const s = pop(f, at as number, (at as number) + 10, 2.2);
        return s > 0 ? <div key={i} style={{ position: 'absolute', left: x as number, top: (y as number) + Math.sin(f / 20 + i) * 4, transform: `translate(-50%,0) scale(${s})`, padding: '4px 20px 0', borderRadius: 14, background: 'rgba(14,22,32,0.92)', border: '3px solid #fff', fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff', whiteSpace: 'nowrap' }}>{t as string}</div> : null;
      })}
    </AbsoluteFill>
  );
};
