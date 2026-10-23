import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { mblur, pop, ramp } from './theme';

// p10_pools (line 3, "मतलब 80 Olympic pools, सिर्फ़ एक ship के लिए खत्म"; the reference's 26–29.2 s): on a deep navy
// background a grid of little swimming-pool tiles (blue water, white lane lines, a shimmer) pops in row by row, two
// frames apart, while the count above runs to `n`; then "= 1 [ship]" slides in from the right; at `drain` the pools
// empty row by row from the top (water level drops, the tile goes pale) and the ship sails off. Opaque, 1080×1920.
export const P10Pools: React.FC<{ n?: number; drain?: number; ship?: string; unit?: string }> = ({ n = 80, drain = 120, ship, unit = 'Olympic pools' }) => {
  useFonts();
  const f = useCurrentFrame();
  const cols = 8, rows = Math.ceil(n / cols);
  const tw = 104, th = 58, gx = 14, gy = 16;
  const x0 = 540 - (cols * tw + (cols - 1) * gx) / 2, y0 = 560;
  const shown = Math.min(n, Math.floor(Math.max(0, f - 6) / 0.9));
  const shipIn = pop(f, n * 0.9 + 10, n * 0.9 + 26, 1.6);
  const shipOut = ramp(f, drain + rows * 3 + 6, drain + rows * 3 + 40);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #134A78, #071A33 75%)' }}>
      <div style={{ position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: NUM, fontSize: 130, color: '#fff', textShadow: '0 0 24px rgba(120,220,255,0.8)', transform: `scale(${1 + 0.02 * Math.sin(f / 12)})` }}>
        {shown}<span style={{ fontFamily: UI, fontWeight: 800, fontSize: 56, marginLeft: 16 }}>{unit}</span>
      </div>
      {Array.from({ length: n }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const s = pop(f, 6 + i * 0.9, 14 + i * 0.9, 2.2);
        const dr = ramp(f, drain + r * 3, drain + r * 3 + 14);
        return s > 0 ? (
          <div key={i} style={{ position: 'absolute', left: x0 + c * (tw + gx), top: y0 + r * (th + gy), width: tw, height: th, borderRadius: 8, overflow: 'hidden', transform: `scale(${s})`, background: '#EAF6FB', border: '3px solid #CFEAF6' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${100 * (1 - dr)}%`, background: 'linear-gradient(180deg, #6ED3FF, #2E9BE0)' }} />
            {[1, 2, 3].map((l) => <div key={l} style={{ position: 'absolute', left: 6, right: 6, top: (th / 4) * l - 1, height: 2, background: '#fff', opacity: 0.6 * (1 - dr) }} />)}
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 26, left: `${(((f * 2 + i * 13) % 160) / 160) * 140 - 30}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))', opacity: 1 - dr }} />
          </div>
        ) : null;
      })}
      {shipIn > 0 && (
        <div style={{ position: 'absolute', left: 300 + (1 - shipIn) * 700 + shipOut * 900, top: y0 + rows * (th + gy) + 40, display: 'flex', alignItems: 'center', gap: 20, filter: mblur((1 - shipIn) * 40 + shipOut * 30, 0.2, 8) }}>
          <span style={{ fontFamily: NUM, fontSize: 96, color: '#fff' }}>= 1</span>
          <div style={{ width: 300, height: 120, transform: `translateY(${Math.sin(f / 14) * 4}px)` }}>
            {ship ? <Img src={ship} style={{ width: 300, height: 120, objectFit: 'contain' }} /> : (
              <svg width={300} height={120}><path d="M 10 80 L 270 80 L 290 58 L 290 100 Q 150 118 20 106 Z" fill="#8E1E22" />{Array.from({ length: 8 }, (_, k) => [0, 1].map((j) => <rect key={`${k}${j}`} x={60 + k * 24} y={58 - j * 16} width={22} height={15} fill={['#B84A2E', '#2F6DB5', '#3F8A4E', '#D9822B'][(k + j) % 4]} />))}<rect x={22} y={30} width={34} height={50} fill="#F2F2EE" /></svg>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
