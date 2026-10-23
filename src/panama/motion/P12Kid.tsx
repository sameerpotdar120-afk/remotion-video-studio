import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Face, K0, Kid, KidPose } from './Kid';
import { useFonts } from './font';
import { clamp, idle, pop, ramp, wobble } from './theme';

// p12_kid (line 5, "तो जब 2023 में बारिश नहीं आई…", and line 6, "इसी Gatun Lake का पानी Panama के आधे लोग पीते हैं";
// the reference's 35–40 s on the dry lakebed and 50.4–53 s at the city fountain): the chibi Panamanian pops up from
// the ground (overshoot and squash), breathes and sways, and changes face on cue: `beats` = [[frame, face, mark]]
// (e.g. cry with tear streams, then "!" shock; drink → "?" → "!"). Each face change is a quick squash (0.92 for 3
// frames) and a head bob; a mark pops over his head with a spring and wobbles. `drink` lifts the paper cup to his
// mouth and tilts his head back. Transparent, 800×1000, 60 fps; his feet at (400, 960).
type Beat = [number, Face, '' | '!' | '?'];
export const P12Kid: React.FC<{ beats?: Beat[] }> = ({ beats = [[0, 'smile', ''], [60, 'cry', ''], [150, 'oh', '!'], [230, 'drink', ''], [300, 'smile', '?'], [370, 'oh', '!']] }) => {
  useFonts();
  const f = useCurrentFrame();
  let cur = beats[0], at = 0;
  for (const b of beats) if (f >= b[0]) { cur = b; at = b[0]; }
  const s = pop(f, 0, 16, 2.2);
  const land = 1 - wobble(f, 16, 3, 6) * 0.1;
  const swap = 1 - 0.08 * Math.max(0, 1 - Math.abs(f - at) / 4);
  const [ix, iy, ir] = idle(f, 3, 0.8);
  const face = cur[1];
  const drinking = face === 'drink';
  const cup = drinking ? ramp(f, at, at + 14, Easing.inOut(Easing.cubic)) : 0;
  const tears = face === 'cry' ? ramp(f, at, at + 20) : 0;
  const markK = cur[2] ? pop(f, at, at + 10, 2.6) * (1 + 0.06 * wobble(f, at + 10, 3, 4)) : 0;
  // eyes glance around now and then; arms act out each face: wiping tears, both up in shock, a shrug for "?"
  const gl = Math.floor(f / 50);
  const look: [number, number] = face === 'oh' ? [0, -4] : [Math.round((Math.sin(gl * 2.1) * 10)), Math.round(Math.cos(gl * 1.3) * 5)];
  const shock = face === 'oh' ? pop(f, at, at + 8, 2.4) : 0;
  const wipe = face === 'cry' ? ramp(f, at + 10, at + 22) * (0.85 + 0.15 * Math.sin(f / 5)) : 0;
  const shrug = cur[2] === '?' ? pop(f, at, at + 10, 2) : 0;
  const armL = 150 * shock + 168 * wipe + 60 * shrug + Math.sin(f / 13) * 4; // + lifts the left arm
  const pose: KidPose = {
    ...K0, look, armL, hairK: face === 'oh' ? Math.max(0, 1 - (f - at) / 30) : 0.15, face, mark: cur[2], markK,
    tilt: (drinking ? -14 * cup : 0) + Math.sin(f / 21) * 4 + (face === 'cry' ? Math.sin(f / 6) * 3 : 0),
    squash: land * swap * (1 + 0.02 * Math.sin(f / 12)), arm: drinking ? 40 * cup : face === 'oh' ? 150 * shock : 60 * shrug + Math.sin(f / 11) * 5, cup, tears,
    lean: face === 'oh' ? -4 : 0, hop: face === 'oh' ? 30 * Math.max(0, 1 - (f - at) / 10) : 0,
  };
  return (
    <AbsoluteFill>
      <svg width={800} height={1000}>
        <g transform={`translate(${400 + ix} ${960 + iy}) rotate(${ir}) scale(${0.62 * s}) `}>
          <Kid f={f} pose={pose} />
        </g>
      </svg>
      <div style={{ display: 'none' }}>{interpolate(f, [0, 1], [0, 1], clamp)}</div>
    </AbsoluteFill>
  );
};
