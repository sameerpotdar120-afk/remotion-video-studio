import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { GoldHalo, SHIP_TINTS, ShipTop, Wake } from './Ships';
import { clamp, mblur, ramp } from './theme';

// p01_ship_queue (line 1 and the loop, "एक ship ने 5.3 million dollar दे दिए, बस Panama Canal की line तोड़ने के लिए";
// the reference's 0–4.5 s and 62–66 s): a long diagonal line of ships creeping toward the canal (each bobbing and
// yawing on its own rhythm, bow foam pulsing, a broken-foam wake), one glowing gold (pulsing halo, turning god-rays,
// rising sparkles). The whole shot never holds: a slow camera push and roll runs throughout. At `overtake` the gold
// ship anticipates (a tiny back-off), pulls out of the line, accelerates past the others with motion blur, speed lines
// and a long wake, red rings rippling at each ship it passes, then eases back in at the front. Sun glints sparkle on
// the water. `lanes` > 1 draws parallel queues (44–49 s). Transparent, 1080×1920, 60 fps. `ship` / `gold` images.
export const P01ShipQueue: React.FC<{ n?: number; angle?: number; overtake?: number; lanes?: number; goldAt?: number; ship?: string; gold?: string; glints?: boolean }> = ({
  n = 11, angle = -62, overtake = 70, lanes = 1, goldAt = 0.6, ship, gold, glints = true,
}) => {
  const f = useCurrentFrame();
  const len = 320, gap = 370;
  const creep = f * 0.45;
  const back = interpolate(f, [overtake - 10, overtake], [0, -14], { ...clamp, easing: Easing.out(Easing.quad) }) * (1 - ramp(f, overtake, overtake + 12));
  const go = ramp(f, overtake, overtake + 120, Easing.inOut(Easing.cubic));
  const vGold = interpolate(f, [overtake, overtake + 60, overtake + 120], [0, 16, 0], clamp);
  const total = n * gap;
  const push = 1 + 0.06 * (f / 300) + 0.01 * Math.sin(f / 50);
  const roll = Math.sin(f / 90) * 1.2;
  const gi = Math.round(n * goldAt);
  return (
    <AbsoluteFill style={{ transform: `scale(${push}) rotate(${roll}deg)` }}>
      {glints && Array.from({ length: 26 }, (_, i) => {
        const t = ((f + random(`gl${i}`) * 90) % 90) / 90;
        return <div key={`g${i}`} style={{ position: 'absolute', left: random(`glx${i}`) * 1080, top: random(`gly${i}`) * 1920, width: 18, height: 3, borderRadius: 2, background: '#fff', opacity: Math.sin(t * Math.PI) * 0.55, transform: `rotate(${angle + 90}deg) scaleX(${0.4 + t})` }} />;
      })}
      <div style={{ position: 'absolute', left: 540, top: 960, transform: `rotate(${angle}deg)` }}>
        {Array.from({ length: lanes }, (_, L) => (
          <div key={L} style={{ position: 'absolute', left: 0, top: (L - (lanes - 1) / 2) * 190 }}>
            {Array.from({ length: n }, (_, i) => {
              const isGold = L === Math.floor(lanes / 2) && i === gi;
              const x0 = -total / 2 + i * gap + creep + (L % 2) * 90 + (random(`jx${L}${i}`) - 0.5) * 30;
              const g0 = -total / 2 + gi * gap + creep + (L % 2) * 90, gx = g0 + back + go * total * 0.4;
              const x = isGold ? gx : x0;
              const y = (isGold ? -Math.sin(go * Math.PI) * 95 : (random(`jy${L}${i}`) - 0.5) * 16) + Math.sin(f / (36 + i % 5) + i) * 3;
              const yaw = Math.sin(f / (50 + i % 7) + i * 1.7) * 1.6 + (isGold ? -Math.cos(go * Math.PI) * 0 - Math.sin(go * Math.PI * 2) * 7 : 0);
              const ring = !isGold && go > 0 && go < 1 && x0 > g0 && x0 < gx + gap * 0.5 && x0 > gx - gap * 2.5;
              const tint = SHIP_TINTS[Math.floor(random(`t${L}${i}`) * SHIP_TINTS.length)];
              return (
                <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${yaw}deg)`, filter: isGold ? mblur(vGold, 0.5, 7) : tint === 'none' ? undefined : tint, zIndex: isGold ? 5 : 1 }}>
                  {isGold && <GoldHalo len={len} f={f} />}
                  <Wake len={len} f={f} k={isGold ? 0.7 + 0.3 * go : 0.5} seed={i} speed={isGold ? 0.3 + vGold / 10 : 0.3} />
                  {isGold && vGold > 3 && Array.from({ length: 6 }, (_, k) => (
                    <div key={k} style={{ position: 'absolute', left: -len * (1 + random(`sl${k}`)), top: (random(`sy${k}`) - 0.5) * len * 0.5, width: len * (0.6 + random(`sw${k}`)), height: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,245,200,0.9))', opacity: vGold / 16 }} />
                  ))}
                  <ShipTop len={isGold ? len * 1.08 : len} src={isGold ? gold : ship} seed={`q${L}${i}`} gas={isGold} f={f + i * 9} />
                  {ring && <Ripple f={f} seed={i} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Ripple: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const t = ((f + seed * 7) % 30) / 30;
  return (
    <>
      {[0, 0.5].map((o) => {
        const u = (t + o) % 1;
        return <div key={o} style={{ position: 'absolute', left: -40 - 50 * u, top: -40 - 50 * u, width: 80 + 100 * u, height: 80 + 100 * u, borderRadius: '50%', border: `${4 - 3 * u}px solid #FF4A4A`, opacity: 1 - u, boxShadow: '0 0 10px rgba(255,60,60,0.6)' }} />;
      })}
    </>
  );
};
