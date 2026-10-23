import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, UI, useFonts } from './font';
import { clamp, mblur, pop, ramp, wobble } from './theme';

// p10_pools (line 3, "मतलब 80 Olympic pools, सिर्फ़ एक ship के लिए खत्म"; the reference's 26–29.2 s): a deep navy
// stage with drifting light motes; a field of little Olympic pools laid out in perspective (tilted back like a floor,
// the camera slowly dollying in and drifting), each a real tiny pool: white deck rim, inner wall shade, lane ropes,
// moving caustic light. They drop in as a diagonal wave (each falls from above with a bounce and a splash ring) while
// the glowing count rolls to `n`; "= 1 [ship]" sails in from the right. At `drain` the pools empty in a wave from the
// far rows (the water level drops, a little whirlpool spins in each, the tile goes dry and pale) and the ship sails
// off with motion blur. Opaque, 1080×1920, 60 fps.
export const P10Pools: React.FC<{ n?: number; drain?: number; ship?: string; unit?: string }> = ({ n = 80, drain = 140, ship, unit = 'Olympic pools' }) => {
  useFonts();
  const f = useCurrentFrame();
  const cols = 8, rows = Math.ceil(n / cols);
  const tw = 108, th = 64, gx = 14, gy = 18;
  const gw = cols * tw + (cols - 1) * gx, gh = rows * th + (rows - 1) * gy;
  const order = (r: number, c: number) => (r + c) * 1.4; // diagonal wave
  const shown = Math.min(n, Array.from({ length: n }, (_, i) => i).filter((i) => f >= 8 + order(Math.floor(i / cols), i % cols) + 6).length);
  const shipIn = pop(f, 60, 80, 1.5);
  const shipOut = ramp(f, drain + 30, drain + 70, Easing.in(Easing.cubic));
  const dolly = interpolate(f, [0, 220], [1, 1.08], clamp);
  const cnt = wobble(f, 8 + order(rows - 1, cols - 1) + 6, 3, 6);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 38%, #18598E, #0A2547 55%, #04112A 100%)', overflow: 'hidden' }}>
      {Array.from({ length: 30 }, (_, i) => {
        const t = ((f * 0.3 + random(`mx${i}`) * 400) % 400) / 400;
        return <div key={i} style={{ position: 'absolute', left: random(`m${i}`) * 1080, top: 1920 - t * 2100, width: 4 + random(`ms${i}`) * 6, height: 4 + random(`ms${i}`) * 6, borderRadius: '50%', background: '#9FE3FF', opacity: 0.25 * Math.sin(t * Math.PI) }} />;
      })}
      <div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: NUM, fontSize: 150, color: '#fff', textShadow: '0 0 28px rgba(120,220,255,0.9)', transform: `scale(${1 + 0.06 * cnt + 0.015 * Math.sin(f / 12)})` }}>
        {shown}<span style={{ fontFamily: UI, fontWeight: 800, fontSize: 60, marginLeft: 16 }}>{unit}</span>
      </div>
      <div style={{ position: 'absolute', left: 540 - gw / 2, top: 560, width: gw, height: gh, perspective: 1400 }}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotateX(32deg) scale(${dolly}) translateY(${Math.sin(f / 60) * 10}px) rotateZ(${Math.sin(f / 80) * 1.2}deg)`, transformOrigin: '50% 40%', transformStyle: 'preserve-3d' }}>
          {Array.from({ length: n }, (_, i) => {
            const r = Math.floor(i / cols), c = i % cols;
            const at = 8 + order(r, c);
            const drop = interpolate(f, [at, at + 8], [-260, 0], { ...clamp, easing: Easing.in(Easing.quad) });
            const s = f < at ? 0 : 1 + 0.12 * wobble(f, at + 8, 3, 7);
            const dAt = drain + (rows - 1 - r) * 3 + c * 0.8;
            const dr = ramp(f, dAt, dAt + 16);
            const splash = ramp(f, at + 8, at + 26);
            return s > 0 ? (
              <div key={i} style={{ position: 'absolute', left: c * (tw + gx), top: r * (th + gy) + drop, width: tw, height: th, transform: `scale(${s})` }}>
                <div style={{ position: 'absolute', inset: -6, borderRadius: 10, background: '#000', opacity: 0.35, filter: 'blur(6px)', transform: 'translateY(8px)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'linear-gradient(180deg, #F4FAFD, #D2E6EE)', padding: 6 }}>
                  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', background: dr > 0.95 ? '#C8DCE4' : 'linear-gradient(180deg, #8FC7DA, #B9DCE7)' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${100 * (1 - dr)}%`, background: 'linear-gradient(180deg, #7FE0FF, #2A9BE0)' }} />
                    <div style={{ position: 'absolute', inset: 0, opacity: (1 - dr) * 0.5, background: `repeating-linear-gradient(${60 + Math.sin(f / 20 + i) * 10}deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.6) ${4 + ((f + i * 3) % 6)}px, rgba(255,255,255,0) 10px)`, mixBlendMode: 'screen' }} />
                    {[1, 2, 3].map((l) => <div key={l} style={{ position: 'absolute', left: 3, right: 3, top: ((th - 12) / 4) * l - 1, height: 2, background: 'repeating-linear-gradient(90deg, #E33 0 6px, #fff 6px 12px)', opacity: 0.8 * (1 - dr) }} />)}
                    {dr > 0.05 && dr < 0.98 && <div style={{ position: 'absolute', left: '50%', top: '55%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', borderRightColor: 'transparent', transform: `rotate(${f * 18}deg)` }} />}
                  </div>
                </div>
                {splash > 0 && splash < 1 && <div style={{ position: 'absolute', left: tw / 2 - 60 * splash, top: th / 2 - 30 * splash, width: 120 * splash, height: 60 * splash, borderRadius: '50%', border: '3px solid #BFF4FF', opacity: 1 - splash }} />}
              </div>
            ) : null;
          })}
        </div>
      </div>
      {shipIn > 0 && (
        <div style={{ position: 'absolute', left: 260 + (1 - shipIn) * 760 + shipOut * 1000, top: 560 + gh + 120, display: 'flex', alignItems: 'center', gap: 24, filter: mblur((1 - shipIn) * 30 + shipOut * 40, 0.25, 8) }}>
          <span style={{ fontFamily: NUM, fontSize: 110, color: '#fff', textShadow: '0 0 20px rgba(120,220,255,0.8)' }}>= 1</span>
          <div style={{ position: 'relative', width: 340, height: 140, transform: `translateY(${Math.sin(f / 14) * 5}px) rotate(${Math.sin(f / 20) * 1.5}deg)` }}>
            {ship ? <Img src={ship} style={{ width: 340, height: 140, objectFit: 'contain' }} /> : (
              <svg width={340} height={140}>
                <defs><linearGradient id="plHull" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C2303A" /><stop offset="1" stopColor="#4A0E12" /></linearGradient></defs>
                <path d="M 10 92 L 304 92 L 330 64 L 330 120 Q 170 138 24 124 Z" fill="url(#plHull)" />
                {Array.from({ length: 10 }, (_, k) => [0, 1, 2].map((j) => <rect key={`${k}${j}`} x={74 + k * 23} y={72 - j * 17} width={22} height={16} fill={['#D5603F', '#3F86CE', '#53A361', '#E39436'][(k + j) % 4]} />))}
                <rect x={24} y={30} width={44} height={64} fill="#F4F4F0" />
              </svg>
            )}
            <div style={{ position: 'absolute', left: -20, right: -20, bottom: 4, height: 14, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(191,244,255,0.9), rgba(191,244,255,0) 70%)' }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
