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
  const kick = hits.reduce((a, h) => a + (f >= h ? wobble(f, h, 5, 10) : 0), 0);
  return (
    <AbsoluteFill style={{ transform: `translateY(${kick * 6}px)` }}>
      {/* sound block */}
      <div style={{ position: 'absolute', left: 300, top: 760, width: 300, height: 140 }}>
        {block ? <Img src={block} style={{ width: 300, height: 140, objectFit: 'contain' }} /> : (
          <svg width={300} height={140}><ellipse cx={150} cy={90} rx={140} ry={40} fill="#3B2314" /><ellipse cx={150} cy={70} rx={140} ry={40} fill="#6B4226" stroke="#C9A04A" strokeWidth={6} /></svg>
        )}
      </div>
      {/* gavel, pivoting at the end of its handle (bottom right) */}
      <div style={{ position: 'absolute', left: 420, top: 520, width: 420, height: 260, transformOrigin: '100% 80%', transform: `rotate(${ang}deg)` }}>
        {hammer ? <Img src={hammer} style={{ width: 420, height: 260, objectFit: 'contain' }} /> : (
          <svg width={420} height={260}><rect x={130} y={190} width={290} height={26} rx={13} fill="#7A4A2A" stroke="#3B2314" strokeWidth={4} /><rect x={20} y={130} width={130} height={130} rx={24} fill="#5A3420" stroke="#3B2314" strokeWidth={5} /><rect x={20} y={160} width={130} height={14} fill="#C9A04A" /><rect x={20} y={214} width={130} height={14} fill="#C9A04A" /></svg>
        )}
      </div>
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
