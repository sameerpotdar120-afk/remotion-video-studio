import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { AUDIO, CHAPTERS, TOTAL, at, speakingAt } from './vo/timeline';
import { interpolate } from 'remotion';
import { ChapterScroll, CollapseMarks } from './kit/devices';
import { Sfx } from '../lib/fx/particles';
import { AudioOnly } from './kit/audioMode';
import { S00Open, OPEN_TO } from './scenes/S00Open';
import { C01Rus, C1_FROM, C1_TO } from './scenes/C01Rus';
import { C02Mongols, C2_FROM, C2_TO } from './scenes/C02Mongols';
import { C03Ivan, C3_FROM, C3_TO } from './scenes/C03Ivan';
import { C04Troubles, C4_FROM, C4_TO } from './scenes/C04Troubles';
import { C05Peter, C5_FROM, C5_TO } from './scenes/C05Peter';
import { C06Catherine, C6_FROM, C6_TO } from './scenes/C06Catherine';
import { C07Napoleon, C7_FROM, C7_TO } from './scenes/C07Napoleon';
import { C08LastTsar, C8_FROM, C8_TO } from './scenes/C08LastTsar';
import { C09Stalin, C9_FROM, C9_TO } from './scenes/C09Stalin';
import { C10Today, C10_FROM, C10_TO } from './scenes/C10Today';
import { C11Payoff, PAY_FROM, PAY_TO } from './scenes/C11Payoff';

/**
 * RUSSIA — final 4K60 cut. Scenes sit on exact VO frames; chapter cards fill the silent gaps the timeline
 * inserted. Unbuilt stretches render a labelled slate (never silent black).
 *   npx remotion render src/index.ts Russia-4K out/russia/part01.mp4 --frames=0-3599 --gl=swangle
 */
type Built = { from: number; to: number; comp: React.FC };
const BUILT: Built[] = [
  { from: 0, to: OPEN_TO, comp: S00Open },
  { from: C1_FROM, to: C1_TO, comp: C01Rus },
  { from: C2_FROM, to: C2_TO, comp: C02Mongols },
  { from: C3_FROM, to: C3_TO, comp: C03Ivan },
  { from: C4_FROM, to: C4_TO, comp: C04Troubles },
  { from: C5_FROM, to: C5_TO, comp: C05Peter },
  { from: C6_FROM, to: C6_TO, comp: C06Catherine },
  { from: C7_FROM, to: C7_TO, comp: C07Napoleon },
  { from: C8_FROM, to: C8_TO, comp: C08LastTsar },
  { from: C9_FROM, to: C9_TO, comp: C09Stalin },
  { from: C10_FROM, to: C10_TO, comp: C10Today },
  { from: PAY_FROM, to: PAY_TO, comp: C11Payoff },
];

// the four collapses (top-right marks turn red when the narrator says "पहला/दूसरा/तीसरा/चौथा collapse")
export const COLLAPSE_AT = [at(16, 'पहला'), at(39, 'दूसरा'), at(75, 'तीसरा'), at(90, 'चौथा')];

const Slate: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill style={{ background: '#2A2D33', color: '#999', fontFamily: '"Kalam", cursive', fontSize: 90, alignItems: 'center', justifyContent: 'center' }}>{label}</AbsoluteFill>
);

export const RussiaFinal: React.FC<{ audioOnly?: boolean }> = ({ audioOnly = false }) => {
  const cards = CHAPTERS.map((c) => ({ from: c.card, to: c.from }));
  return (
    <AudioOnly.Provider value={audioOnly}>
    <AbsoluteFill style={{ background: '#000' }}>
      <Slate label="(scene not built yet)" />
      {BUILT.map((b, i) => (
        <Sequence key={i} from={b.from} durationInFrames={b.to - b.from}>
          <b.comp />
        </Sequence>
      ))}
      {CHAPTERS.map((c) => (
        <Sequence key={c.n} from={c.card} durationInFrames={c.from - c.card} name={`chapter ${c.n}`}>
          <ChapterScroll n={c.n} dur={c.from - c.card} />
          <Sfx at={0} file="paper_swish.wav" volume={0.7} />
          <Sfx at={60} file="pop_high.wav" volume={0.6} />
        </Sequence>
      ))}
      {/* persistent corner marks from the end of the turn, hidden on chapter cards */}
      {[{ from: OPEN_TO }, ...cards.map((c) => ({ from: c.to }))].map((seg, i) => {
        const to = i < cards.length ? cards[i].from : PAY_FROM;
        return (
          <Sequence key={`m${i}`} from={seg.from} durationInFrames={Math.max(1, to - seg.from)} layout="none">
            <MarksAbs offset={seg.from} />
          </Sequence>
        );
      })}
      {/* original score (scripts/russia/make_bgm.py), ducked ≈7 dB under the narration */}
      <Audio src={staticFile('russia/music/bgm.mp3')} volume={(f) => interpolate(speakingAt(f), [0, 1], [1, 0.45])} />
      {AUDIO.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at} durationInFrames={a.trimTo - a.trimFrom} layout="none">
          <Audio src={staticFile(a.file)} trimBefore={a.trimFrom} trimAfter={a.trimTo} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
    </AudioOnly.Provider>
  );
};

const MarksAbs: React.FC<{ offset: number }> = ({ offset }) => (
  <CollapseMarks redAt={COLLAPSE_AT.map((f) => f - offset)} start={0} size={64} />
);

export const RUSSIA_TOTAL = TOTAL;
