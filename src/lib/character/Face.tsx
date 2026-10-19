import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T } from '../constants';
import { loop } from '../easing';

export type Mood = 'neutral' | 'smile' | 'grin' | 'angry' | 'furious' | 'worried' | 'shocked' | 'smug' | 'sad';
export type Talk = [number, number][]; // frame ranges where the character speaks (lip-flap)

/**
 * Chibi face drawn in code (reference style: dot eyes, thin brows, simple mouth).
 * Mouth shapes: closed line / small "o" / open oval / big grin / gritted teeth.
 * Talking = open↔closed every T.mouthCycle frames inside each `talk` range.
 */
export const Face: React.FC<{
  size: number; // face width in px
  mood?: Mood;
  look?: number; // -1..1 pupils left/right
  talk?: Talk;
  blinkSeed?: number;
  style?: 'dot' | 'googly'; // dot = human chibi, googly = map characters (big white eyes)
}> = ({ size, mood = 'neutral', look = 0, talk = [], blinkSeed = 0, style = 'dot' }) => {
  const frame = useCurrentFrame();
  const talking = talk.some(([a, b]) => frame >= a && frame <= b);
  const open = talking && loop(frame, T.mouthCycle) < 0.5;
  const blink = loop(frame + blinkSeed * 53, T.blinkEvery) < T.blink / T.blinkEvery;
  const brow = { neutral: 0, smile: -4, grin: -6, angry: 16, furious: 24, worried: -14, shocked: -18, smug: 6, sad: -10 }[mood];
  const eyeY = 42;
  const googly = style === 'googly';
  const eyeR = googly ? 17 : 5.5;

  const mouth = () => {
    if (mood === 'furious') return <rect x={36} y={70} width={28} height={12} rx={3} fill="#fff" stroke={C.ink} strokeWidth={3} />;
    if (mood === 'shocked') return <ellipse cx={50} cy={76} rx={8} ry={open ? 12 : 10} fill={C.ink} />;
    if (open) return <ellipse cx={50} cy={74} rx={9} ry={7} fill={C.ink} />;
    if (mood === 'grin' || mood === 'smile' || mood === 'smug')
      return (
        <path
          d={mood === 'grin' ? 'M34 68 Q50 90 66 68 Z' : 'M38 70 Q50 80 62 70'}
          fill={mood === 'grin' ? '#fff' : 'none'}
          stroke={C.ink}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      );
    if (mood === 'sad' || mood === 'worried') return <path d="M40 76 Q50 68 60 76" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
    return <line x1={42} y1={73} x2={58} y2={73} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {[32, 68].map((cx, i) => {
        const side = i === 0 ? -1 : 1;
        return (
          <g key={cx}>
            {googly && <ellipse cx={cx} cy={eyeY} rx={eyeR} ry={blink ? 2 : eyeR * 1.15} fill="#fff" stroke={C.ink} strokeWidth={3} />}
            {!blink && <circle cx={cx + look * (googly ? 7 : 2.5)} cy={eyeY + (googly ? 3 : 0)} r={googly ? 7 : eyeR} fill={C.ink} />}
            {blink && !googly && <line x1={cx - 6} y1={eyeY} x2={cx + 6} y2={eyeY} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />}
            {mood !== 'neutral' && (
              <line
                x1={cx - 12}
                y1={eyeY - (googly ? 26 : 15)}
                x2={cx + 12}
                y2={eyeY - (googly ? 26 : 15)}
                stroke={C.ink}
                strokeWidth={googly ? 6 : 4}
                strokeLinecap="round"
                // positive brow = angry "V" (inner ends down), negative = worried (inner ends up)
                transform={`rotate(${-side * brow} ${cx} ${eyeY - (googly ? 26 : 15)})`}
              />
            )}
          </g>
        );
      })}
      {mouth()}
    </svg>
  );
};

/** Pick the mood active at this frame from a list of [frame, mood] changes. */
export const moodAt = (frame: number, moods: [number, Mood][], fallback: Mood = 'neutral'): Mood => {
  let m = fallback;
  for (const [f, mood] of moods) if (frame >= f) m = mood;
  return m;
};
