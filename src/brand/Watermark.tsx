import React from 'react';
import { Img, interpolate, staticFile } from 'remotion';
import { useMontserrat } from '../darien/Brand';

/**
 * Channel watermark: small round logo + handle, semi-transparent, drifting between safe spots
 * every 10 s. A moving mark can't be cropped or blurred out in one step.
 * Spots avoid the captions (y ≈ 1500), the Shorts buttons (right side, lower half) and the title area.
 */
const SPOTS: { x: number; y: number; align: 'left' | 'right' }[] = [
  { x: 44, y: 1300, align: 'left' },
  { x: 1036, y: 860, align: 'right' },
  { x: 44, y: 560, align: 'left' },
];
const PERIOD = 10;
const MOVE = 0.8;

export const Watermark: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 0.55 }) => {
  useMontserrat();
  const i = Math.floor(t / PERIOD);
  const local = t - i * PERIOD;
  const a = SPOTS[i % SPOTS.length];
  const b = SPOTS[(i + 1) % SPOTS.length];
  // fade out at the end of each period, appear at the next spot
  const out = interpolate(local, [PERIOD - MOVE, PERIOD - MOVE / 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const spot = local < PERIOD - MOVE / 2 ? a : b;
  const inA = local < PERIOD - MOVE / 2 ? (i === 0 ? 1 : interpolate(local, [0, MOVE / 2], [0, 1], { extrapolateRight: 'clamp' })) : 0;
  const op = opacity * (local < PERIOD - MOVE / 2 ? Math.min(out, inA) : 0);
  if (op <= 0.01) return null;
  return (
    <div style={{
      position: 'absolute', top: spot.y, [spot.align]: spot.align === 'left' ? spot.x : 1080 - spot.x,
      display: 'flex', flexDirection: spot.align === 'left' ? 'row' : 'row-reverse', alignItems: 'center', gap: 12,
      opacity: op, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.75))', pointerEvents: 'none',
    }}>
      <Img src={staticFile('brand/logo_round_192.png')} style={{ width: 58, height: 58, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)' }} />
      <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 0.5 }}>@null_dynasty</div>
    </div>
  );
};
