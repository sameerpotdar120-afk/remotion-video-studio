import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import type { Mood } from '../../lib/character/Face';
import { ease, ramp } from '../../lib/easing';
import { talkIn } from '../vo/timeline';
import { HOST_LOOK, Peg, type Gesture, type Step } from './Peg';
import { has, ra } from './core';

/**
 * The narrator-host (reference §5: stick-legged host on every explainer beat, bottom-right on maps).
 * Talks whenever the VO talks (lip-flap every 4 f @60 = 2 f @30), blinks, gestures on cue, holds his
 * pointer staff; `dropAt` = staff falls flat (the reference's chapter-break gag) and hands go to his head.
 * `offset` converts sequence-local frames to absolute VO frames for the lip-flap.
 */
export const Host: React.FC<{
  x: number; y: number; height: number;
  start?: number; exit?: number; flip?: boolean;
  offset: number; // absolute frame of this sequence's frame 0
  gestures?: [number, Gesture][];
  moods?: [number, Mood][];
  walk?: Step[];
  dropAt?: number;
  staff?: boolean;
  look2?: number;
  hopAt?: number[];
  shake?: [number, number];
}> = ({ x, y, height, start = 0, exit, flip, offset, gestures = [], moods = [], walk, dropAt, staff = true, look2 = 0.3, hopAt, shake }) => {
  const frame = useCurrentFrame();
  const talk = talkIn(offset + start - 10, offset + (exit ?? 99999)).map(([a, b]) => [a - offset, b - offset] as [number, number]);
  const g: [number, Gesture][] = dropAt !== undefined ? [...gestures.filter(([f]) => f < dropAt + 10), [dropAt + 10, 'handsHead']] : gestures;
  const m: [number, Mood][] = dropAt !== undefined ? [...moods.filter(([f]) => f < dropAt), [dropAt + 8, 'shocked']] : moods;
  const bodyH = height * 0.84;
  // staff held in the LEFT hand side, vertical; falls flat at dropAt
  const fall = dropAt !== undefined ? ramp(frame, dropAt, 16, ease.in) : 0;
  const bounce = dropAt !== undefined && frame > dropAt + 16 ? Math.abs(Math.sin((frame - dropAt - 16) / 3)) * Math.exp(-(frame - dropAt - 16) / 6) * 8 : 0;
  const staffH = height * 1.15;
  const staffNode = staff ? (
    <div style={{ position: 'absolute', left: bodyH * 0.62 * 0.02, top: bodyH * 0.6 - staffH * 0.55, width: staffH * 0.05, height: staffH,
      transformOrigin: '50% 95%', transform: `rotate(${-fall * 84}deg) translateY(${-bounce}px)` }}>
      {has('props/host_pointer_staff.png') ? (
        <Img src={ra('props/host_pointer_staff.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <svg viewBox="0 0 10 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <rect x="3.2" y="2" width="3.6" height="196" rx="1.8" fill="#B78A55" stroke="#3A2A20" strokeWidth="0.9" />
          <path d="M5 16 L1 30 L9 30 Z" fill="#C8352B" stroke="#3A2A20" strokeWidth="0.6" />
        </svg>
      )}
    </div>
  ) : null;
  return (
    <Peg src="chars/host_narrator.png" look={HOST_LOOK} x={x} y={y} height={height} start={start} exit={exit} flip={flip}
      talk={talk} gestures={g} moods={m} walk={walk} seed="host" look2={look2} hopAt={hopAt} shake={shake}>
      {staffNode}
    </Peg>
  );
};
