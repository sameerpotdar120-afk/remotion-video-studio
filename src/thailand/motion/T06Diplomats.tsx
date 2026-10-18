import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Chibi, POSE0, Pose, blend } from './Chibi';
import { talkAt } from './Char';
import { clamp, pop } from './theme';

// t06_diplomats (lines 8–14, the skit): the British and French diplomats in front of the palace-room background
// (t01_palace_room_bg, with the live map in its frame). Transparent; laid over the background in the edit.
//   8  तो हुआ कुछ ऐसा।                     both walk in from the sides
//   9  ये Siam बड़ा प्यारा है, है ना?          Briton raises his pointer to Siam on the map, head tilted, admiring
//   10 कहीं तुम इसे लेने का…                  Frenchman turns, blinks, crosses his arms and squints
//   11 मैं? अरे नहीं। पर अगर मैंने ले लिया तो?   Briton jumps back, hands up (innocent), then leans in and taps the map
//   12 तो मुझे तुमसे लड़ना पड़ेगा।               Frenchman points his stick at him, Briton points back: pointers crossed, an anger pop
//   13 तो छोड़ो, दोनों ही इसे छोड़ देते हैं।        Briton lowers his stick and offers his hand
//   14 Deal!                                 handshake with a shake bounce and a sparkle
// Mouths flap on each speaker's line. `cues`: the start frame of lines 9–14 (from the VO timing); `walk`: the walk-in
// start. 1080x1920, 60 fps; the default cues fit 840 frames.

const BX = 265, FX = 825, GY = 1780, K = 0.8;
const P = (o: Partial<Pose>): Pose => ({ ...POSE0, stick: 1, stickA: 80, nx: 40, ny: 220, ...o });

const B = {
  idle: P({ lookX: 0.6, lookY: -0.2 }),
  map: P({ nx: 200, ny: -280, nb: -1, stickA: -76, stickLen: 560, tilt: 10, lookX: 0.6, lookY: -0.8, lean: -3 }),
  glance: P({ nx: 200, ny: -280, nb: -1, stickA: -76, stickLen: 560, tilt: 4, lookX: 1, lookY: 0, face: 'smirk' }),
  hands: P({ nx: 170, ny: -210, nb: -1, fx: -170, fy: -210, fb: 1, stick: 0.25, stickA: -100, brow: 1, face: 'oh', lookX: 0.8, dx: -60, lean: -8 }),
  sly: P({ nx: 200, ny: -270, nb: -1, stickA: -70, stickLen: 540, lean: 7, squint: 0.45, brow: 0.5, face: 'smirk', lookX: 1, dx: -10 }),
  back: P({ nx: 180, ny: -90, nb: -1, stickA: -40, lean: -6, face: 'angry', brow: -0.8, lookX: 1, dx: -30 }),
  offer: P({ nx: 165, ny: 30, stick: 0, fx: -150, fy: 10, fb: 1, tilt: -6, brow: 0.6, face: 'smile', lookX: 1 }),
  shake: P({ nx: 170, ny: 70, stick: 0, tilt: -3, brow: 0.4, face: 'smile', lookX: 1 }),
};
const F = {
  idle: P({ lookX: 0.1, lookY: -0.6, turn: 0.15 }),
  turn: P({ cross: 1, nx: -150, ny: 70, fx: 170, fy: 60, stick: 0, turn: 0.7, squint: 0.65, brow: -0.5, face: 'smirk', lookX: 1 }),
  threat: P({ nx: 185, ny: -90, nb: -1, stickA: -40, lean: 6, face: 'angry', brow: -1, squint: 0.3, lookX: 1, turn: 0.6 }),
  think: P({ stick: 0.7, stickA: 75, nx: 60, ny: 180, fx: 40, fy: -120, fb: 1, tilt: 7, brow: 0.2, face: 'calm', lookX: 1, turn: 0.55 }),
  shake: P({ nx: 170, ny: 70, stick: 0, tilt: 3, brow: 0.5, face: 'smile', lookX: 1, turn: 0.55 }),
};

type Key = [number, Pose];
// keyed poses with a springy 14-frame transition into each
const at = (keys: Key[], f: number): Pose => {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t, p] = keys[i];
    if (f < t) break;
    cur = blend(cur, p, interpolate(f, [t, t + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.25)) }));
  }
  return cur;
};

const Star: React.FC<{ x: number; y: number; s: number; r: number }> = ({ x, y, s, r }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z"
    fill="#FFE98A" stroke="#1D1430" strokeWidth={5} strokeLinejoin="round" />
);

export const T06Diplomats: React.FC<{ cues?: number[]; walk?: number }> = ({ cues = [70, 200, 340, 500, 630, 770], walk = 0 }) => {
  const f = useCurrentFrame();
  const [c9, c10, c11, c12, c13, c14] = cues;
  const mid11 = c11 + (c12 - c11) * 0.45;
  let bp = at([[0, B.idle], [c9, B.map], [c10 + 10, B.glance], [c11, B.hands], [mid11, B.sly], [c12 + 6, B.back], [c13, B.offer], [c14 - 4, B.shake]], f);
  let fp = at([[0, F.idle], [c10, F.turn], [c12, F.threat], [c13 + 10, F.think], [c14 - 4, F.shake]], f);
  // walk-in from the sides with a bouncy step
  const wb = interpolate(f, [walk, walk + 50], [-520, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const wf = interpolate(f, [walk + 8, walk + 58], [520, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const stepB = f < walk + 50 ? Math.abs(Math.sin(f * 0.35)) * 40 : 0, stepF = f < walk + 58 ? Math.abs(Math.sin(f * 0.35 + 1)) * 40 : 0;
  // little extras: the innocent jump on "मैं?", a lean-in tap on the map, the handshake pump
  const jump = Math.sin(interpolate(f, [c11, c11 + 18], [0, 1], clamp) * Math.PI) * 90;
  const tap = f > mid11 + 14 && f < c12 ? Math.max(0, Math.sin((f - mid11) * 0.5)) * 26 : 0;
  const shk = f > c14 + 6 ? Math.sin((f - c14) * 0.55) * 26 * Math.exp(-(f - c14 - 6) / 50) : 0;
  const idle = (k: number) => Math.sin(f / 22 + k) * 6;
  bp = { ...bp, hop: bp.hop + jump + stepB + Math.max(0, idle(0)), ny: bp.ny + tap + shk, stickA: bp.stickA + tap * 0.3 };
  fp = { ...fp, hop: fp.hop + stepF + Math.max(0, idle(2)), ny: fp.ny + shk };
  // the anger pop over the Frenchman on line 12, the sparkle over the handshake on 14
  const anger = pop(f, c12 + 8, c12 + 20, 2.5) * (1 - interpolate(f, [c13 - 10, c13], [0, 1], clamp));
  const sp = pop(f, c14 + 4, c14 + 18, 2) * (1 - interpolate(f, [c14 + 60, c14 + 75], [0, 1], clamp));
  const mx = (BX + FX) / 2, my = GY - 400 * K;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(${BX + wb} ${GY}) scale(${K})`}>
          <Chibi outfit="brit" pose={bp} f={f} seed="brit" talk={Math.max(talkAt(f, c9, c10 - 15, 'a'), talkAt(f, c11, c12 - 15, 'b'), talkAt(f, c13, c14 - 15, 'c'))} />
        </g>
        <g transform={`translate(${FX + wf} ${GY}) scale(${-K} ${K})`}>
          <Chibi outfit="fr" pose={fp} f={f} seed="fr" talk={Math.max(talkAt(f, c10, c11 - 15, 'd'), talkAt(f, c12, c13 - 15, 'e'), talkAt(f, c14, c14 + 40, 'g'))} />
        </g>
        {anger > 0.01 && (
          <g transform={`translate(${FX + 150} ${GY - 1080 * K}) scale(${anger}) rotate(${Math.sin(f * 0.8) * 6})`}>
            {[0, 90, 180, 270].map((r) => (
              <path key={r} transform={`rotate(${r + 45}) translate(0 -46)`} d="M -18 -22 Q 0 4 18 -22" fill="none" stroke="#E5202E" strokeWidth={16} strokeLinecap="round" />
            ))}
          </g>
        )}
        {sp > 0.01 && [[-90, -110, 1, 0], [100, -140, 0.8, 20], [0, -210, 1.2, 10], [-150, 10, 0.6, 30], [150, 0, 0.7, 5]].map(([x, y, s, r], i) => (
          <Star key={i} x={mx + x * sp} y={my + y * sp} s={s * sp * (1 + Math.sin(f * 0.3 + i) * 0.15)} r={r + f * 2} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
