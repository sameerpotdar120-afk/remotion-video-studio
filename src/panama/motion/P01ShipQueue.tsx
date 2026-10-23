import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { GoldHalo, SHIP_TINTS, ShipTop, Wake } from './Ships';
import { clamp, mblur, ramp } from './theme';

// p01_ship_queue (line 1 and the loop, "एक ship ने 5.3 million dollar दे दिए, बस Panama Canal की line तोड़ने के लिए";
// the reference's 0–4.5 s and 62–66 s): a long diagonal line of ships creeping toward the canal (each bobbing and
// slowly yawing, with a short wake), one ship glowing gold with a pulsing halo. At `overtake` the gold ship pulls out
// of the line, speeds up past the others (motion blur, long wake), and small red rings ripple at the ships it passes.
// `lanes` > 1 draws parallel queues (the reference's 44–49 s). Transparent, 1080×1920, 60 fps. `ship` / `gold` are
// the creator's top-down images (bow right); code-drawn ships until then.
export const P01ShipQueue: React.FC<{ n?: number; angle?: number; overtake?: number; lanes?: number; goldAt?: number; ship?: string; gold?: string }> = ({
  n = 22, angle = -62, overtake = 70, lanes = 1, goldAt = 0.62, ship, gold,
}) => {
  const f = useCurrentFrame();
  const len = 150, gap = 175;
  const creep = f * 0.35;
  const go = ramp(f, overtake, overtake + 110, Easing.inOut(Easing.cubic));
  const vGold = interpolate(f, [overtake, overtake + 55, overtake + 110], [0, 14, 0], clamp);
  const total = n * gap;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 540, top: 960, transform: `rotate(${angle}deg)` }}>
        {Array.from({ length: lanes }, (_, L) => (
          <div key={L} style={{ position: 'absolute', left: 0, top: (L - (lanes - 1) / 2) * 120 }}>
            {Array.from({ length: n }, (_, i) => {
              const isGold = L === Math.floor(lanes / 2) && i === Math.round(n * goldAt);
              const x0 = -total / 2 + i * gap + creep + (L % 2) * 60;
              const x = isGold ? x0 + go * (total * 0.42) : x0;
              const y = (isGold ? -go * Math.sin(go * Math.PI) * 70 : 0) + Math.sin(f / 40 + i) * 3;
              const yaw = Math.sin(f / 55 + i * 1.7) * 1.5 + (isGold ? Math.sin(go * Math.PI) * -8 : 0);
              const g0 = -total / 2 + Math.round(n * goldAt) * gap + creep + (L % 2) * 60, gx = g0 + go * total * 0.42;
              const ring = !isGold && go > 0 && go < 1 && x0 > g0 && x0 < gx + gap * 0.5 && x0 > gx - gap * 3;
              const tint = SHIP_TINTS[Math.floor(random(`t${L}${i}`) * SHIP_TINTS.length)];
              return (
                <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${yaw}deg)`, filter: isGold ? mblur(vGold, 0.6, 8) : tint === 'none' ? undefined : tint }}>
                  {isGold && <GoldHalo len={len} f={f} />}
                  <Wake len={len} f={f} k={isGold ? 0.6 + 0.4 * go : 0.45} seed={i} />
                  <ShipTop len={isGold ? len * 1.08 : len} src={isGold ? gold : ship} seed={`q${L}${i}`} gas={isGold} />
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
  const t = ((f + seed * 7) % 36) / 36;
  return <div style={{ position: 'absolute', left: 60 - 30 * t, top: -40 - 30 * t, width: 60 * t + 20, height: 60 * t + 20, borderRadius: '50%', border: '3px solid #FF4A4A', opacity: 1 - t }} />;
};
