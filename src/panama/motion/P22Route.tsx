import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { pop, ramp } from './theme';

// p22_route (line 8, "हर ship को पूरा South America घूमकर जाना पड़ेगा, लगभग 13,000 किलोमीटर ज़्यादा"; the reference's
// 59–62 s): a thick glowing yellow route draws round the continent (ease-in-out over `dur` frames) with a small ship
// marker riding its head and a dashed shimmer running along the drawn part; the distance tag pops at the far end and
// counts up. The edit passes the real path (`d`, projected from lon/lat) and `len`. Transparent, 1080×1920, 60 fps.
// the ship marker at the head of the route: a glowing dot with a white boat chevron, a fading trail, a pulse ring
const RouteHead: React.FC<{ d: string; k: number; f: number }> = ({ d, k, f }) => {
  if (typeof document === 'undefined' || k <= 0 || k >= 1) return null;
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  const L = el.getTotalLength();
  const p = el.getPointAtLength(L * k), q = el.getPointAtLength(Math.max(0, L * k - 6));
  const ang = (Math.atan2(p.y - q.y, p.x - q.x) * 180) / Math.PI;
  const ring = (f % 30) / 30;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={p.x} cy={p.y} r={18 + ring * 40} fill="none" stroke="#FFE27A" strokeWidth={4} opacity={1 - ring} />
      <circle cx={p.x} cy={p.y} r={20} fill="#FFD53D" stroke="#fff" strokeWidth={5} style={{ filter: 'drop-shadow(0 0 10px #FFD53D)' }} />
      <path d="M -9 -7 L 10 0 L -9 7 Z" fill="#1A1406" transform={`translate(${p.x} ${p.y}) rotate(${ang})`} />
    </svg>
  );
};

export const P22Route: React.FC<{ d?: string; len?: number; dur?: number; km?: number; tag?: [number, number] }> = ({
  d = 'M 470 520 C 640 560 820 700 760 980 C 720 1200 620 1400 560 1560 C 520 1660 470 1640 450 1560 C 420 1420 400 1200 420 960 C 440 760 430 600 400 520', len = 3100, dur = 70, km = 13000, tag = [780, 1500],
}) => {
  useFonts();
  const f = useCurrentFrame();
  const k = ramp(f, 0, dur);
  const t = pop(f, dur * 0.6, dur * 0.6 + 12, 2.2);
  const n = Math.round(km * ramp(f, dur * 0.6, dur * 0.6 + 40));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <path d={d} fill="none" stroke="#FFD53D" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * k} ${len}`} opacity={0.3} style={{ filter: 'blur(8px)' }} />
        <path d={d} fill="none" stroke="#FFD53D" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * k} ${len}`} />
        <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeDasharray={`20 46`} strokeDashoffset={-f * 4} opacity={0.8} style={{ clipPath: 'none' }} mask="url(#routeMask)" />
        <defs><mask id="routeMask"><path d={d} fill="none" stroke="#fff" strokeWidth={12} strokeDasharray={`${len * k} ${len}`} /></mask></defs>
      </svg>
      <RouteHead d={d} k={k} f={f} />
      {t > 0 && (
        <div style={{ position: 'absolute', left: tag[0], top: tag[1] + Math.sin(f / 18) * 5, transform: `translate(-50%,-50%) scale(${t})`, padding: '4px 24px 0', borderRadius: 16, background: 'rgba(14,22,32,0.92)', border: '4px solid #FFD53D', fontFamily: NUM, fontSize: 64, color: '#FFD53D', whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(255,213,61,0.5)' }}>
          +{n.toLocaleString('en-IN')} km
        </div>
      )}
    </AbsoluteFill>
  );
};
