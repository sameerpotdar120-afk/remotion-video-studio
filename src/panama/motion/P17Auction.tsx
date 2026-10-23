import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { clamp, pop, ramp, wobble } from './theme';

// p17_auction (line 5, "line लगी, तो आगे निकलने के लिए auction होने लगे… 5.3 million dollar की record बोली लगी"):
// an auction gavel swings up and strikes its sound block three times (each strike: 6-frame wind-up, 3-frame hit, a
// shock ring and a small screen kick); with each strike a bid tag pops higher up a stack, the amounts climbing
// ($1M, $2.5M, $4.6M), and the last strike lands the gold "$5.3M" tag with a sparkle burst. `hammer` / `block` are the
// creator's UE5 parts (pivot at the end of the handle); drawn in code until then. Transparent, 1080×1080, 60 fps.
const BIDS = ['$1M', '$2.5M', '$4.6M', '$5.3M'];
export const P17Auction: React.FC<{ hammer?: string; block?: string; bids?: string[] }> = ({ hammer, block, bids = BIDS }) => {
  useFonts();
  const f = useCurrentFrame();
  const hits = [24, 48, 72, 96];
  let ang = -35;
  for (const h of hits) {
    if (f >= h - 9 && f < h) ang = interpolate(f, [h - 9, h - 3, h], [-35, -55, 0], { ...clamp, easing: Easing.in(Easing.quad) });
    if (f >= h && f < h + 9) ang = interpolate(f, [h, h + 9], [0, -35], { ...clamp, easing: Easing.out(Easing.cubic) });
  }
  if (f < hits[0] - 9) ang = -35 + Math.sin(f / 10) * 3;
  let prevAng = -35;
  { const g = f - 1; prevAng = -35;
    for (const h of hits) {
      if (g >= h - 9 && g < h) prevAng = interpolate(g, [h - 9, h - 3, h], [-35, -55, 0], { ...clamp, easing: Easing.in(Easing.quad) });
      if (g >= h && g < h + 9) prevAng = interpolate(g, [h, h + 9], [0, -35], { ...clamp, easing: Easing.out(Easing.cubic) });
    } }
  const flash = hits.reduce((a, h) => Math.max(a, f >= h && f < h + 6 ? 1 - (f - h) / 6 : 0), 0);
  const kick = hits.reduce((a, h) => a + (f >= h ? wobble(f, h, 5, 10) : 0), 0);
  return (
    <AbsoluteFill style={{ transform: `translateY(${kick * 6}px)` }}>
      {/* sound block */}
      <div style={{ position: 'absolute', left: 300, top: 760, width: 300, height: 140 }}>
        {block ? <Img src={block} style={{ position: 'absolute', left: 0, top: -50, width: 300, height: 212, objectFit: 'contain' }} /> : (
          <svg width={300} height={140}>
            <defs><radialGradient id="blkTop" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#9A6A42" /><stop offset="0.7" stopColor="#6B4226" /><stop offset="1" stopColor="#4A2C18" /></radialGradient></defs>
            <ellipse cx={150} cy={118} rx={146} ry={22} fill="#000" opacity={0.35} />
            <path d="M 10 70 L 10 92 A 140 40 0 0 0 290 92 L 290 70 Z" fill="#3B2314" />
            <ellipse cx={150} cy={70} rx={140} ry={40} fill="url(#blkTop)" stroke="#D9B45A" strokeWidth={6} />
            <ellipse cx={130} cy={60} rx={60} ry={12} fill="#fff" opacity={0.12} />
          </svg>
        )}
      </div>
      {/* gavel, pivoting at the end of its handle (bottom right) */}
      <div style={{ position: 'absolute', left: 420, top: 520, width: 420, height: 260, transformOrigin: '100% 80%', transform: `rotate(${ang}deg)`, filter: Math.abs(ang - prevAng) > 4 ? `blur(${Math.min(6, Math.abs(ang - prevAng) * 0.4).toFixed(1)}px)` : undefined }}>
        {/* the creator's gavel lies diagonally (head top right, handle down left): turned so the handle runs right */}
        {hammer ? <Img src={hammer} style={{ position: 'absolute', left: 217 - 149, top: 196 - 142, width: 298, height: 285, transform: 'rotate(-136deg)' }} /> : (
          <svg width={420} height={260}>
            <defs>
              <linearGradient id="gvH" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A06A40" /><stop offset="0.5" stopColor="#6E4426" /><stop offset="1" stopColor="#3E2412" /></linearGradient>
              <linearGradient id="gvB" x1="0" x2="1"><stop offset="0" stopColor="#4A2A16" /><stop offset="0.35" stopColor="#8A5A34" /><stop offset="0.7" stopColor="#5A3420" /><stop offset="1" stopColor="#2E1A0C" /></linearGradient>
              <linearGradient id="gvBr" x1="0" x2="1"><stop offset="0" stopColor="#8A6A26" /><stop offset="0.4" stopColor="#F2D27A" /><stop offset="1" stopColor="#8A6A26" /></linearGradient>
            </defs>
            <rect x={130} y={188} width={290} height={28} rx={14} fill="url(#gvH)" stroke="#2E1A0C" strokeWidth={3} />
            <path d="M 150 196 L 410 196" stroke="#fff" strokeWidth={3} opacity={0.2} />
            <rect x={14} y={124} width={142} height={140} rx={30} fill="url(#gvB)" stroke="#2E1A0C" strokeWidth={4} />
            <rect x={14} y={150} width={142} height={16} fill="url(#gvBr)" />
            <rect x={14} y={222} width={142} height={16} fill="url(#gvBr)" />
            <rect x={36} y={128} width={18} height={132} rx={9} fill="#fff" opacity={0.15} />
          </svg>
        )}
      </div>
      {flash > 0 && <div style={{ position: 'absolute', left: 300, top: 700, width: 300, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,190,0.95), rgba(255,220,120,0) 70%)', opacity: flash, mixBlendMode: 'screen' }} />}
      {hits.map((h, i) => f >= h && f < h + 24 ? Array.from({ length: 10 }, (_, k) => {
        const t = (f - h) / 24, a = Math.PI + (k / 9) * Math.PI;
        return <div key={`d${i}${k}`} style={{ position: 'absolute', left: 450 + Math.cos(a) * 200 * t, top: 820 + Math.sin(a) * 120 * t + 300 * t * t, width: 7, height: 7, borderRadius: 2, background: '#C9A070', opacity: 1 - t }} />;
      }) : null)}
      {hits.map((h, i) => {
        const r = ramp(f, h, h + 18);
        return f >= h && f < h + 18 ? <div key={`r${i}`} style={{ position: 'absolute', left: 450 - 150 * r, top: 830 - 50 * r, width: 300 * r, height: 100 * r, borderRadius: '50%', border: '6px solid #FFE27A', opacity: 1 - r }} /> : null;
      })}
      {bids.map((b, i) => {
        const h = hits[i], s = pop(f, h, h + 10, 2.4);
        const last = i === bids.length - 1;
        return s > 0 ? (
          <div key={b} style={{ position: 'absolute', left: 120 + i * 40, top: 560 - i * 140 + Math.sin(f / 16 + i) * 4, transform: `scale(${s}) rotate(${-4 + i * 2}deg)`, padding: '4px 26px 0', borderRadius: 18,
            background: last ? 'linear-gradient(180deg, #FFE36A, #F5B81F)' : 'rgba(14,22,32,0.9)', border: '4px solid #fff', fontFamily: NUM, fontSize: last ? 110 : 72, color: last ? '#1A1406' : '#fff',
            boxShadow: last ? `0 0 ${30 + 20 * Math.sin(f / 6)}px rgba(255,220,90,0.9)` : '0 8px 18px rgba(0,0,0,0.4)', opacity: last ? 1 : 1 - 0.4 * ramp(f, hits[3], hits[3] + 12) }}>{b}</div>
        ) : null;
      })}
      {f >= hits[3] && f < hits[3] + 30 && Array.from({ length: 16 }, (_, i) => {
        const t = (f - hits[3]) / 30, a = (i / 16) * Math.PI * 2;
        return <div key={`s${i}`} style={{ position: 'absolute', left: 330 + Math.cos(a) * 260 * t, top: 200 + Math.sin(a) * 180 * t, width: 14, height: 14, background: random(`sc${i}`) > 0.5 ? '#FFE27A' : '#fff', transform: `rotate(45deg) scale(${1 - t})` }} />;
      })}
    </AbsoluteFill>
  );
};
