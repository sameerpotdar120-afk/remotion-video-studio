import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Stage } from "../engine/Stage";
import { Captions } from "../engine/Captions";
import { SHOTS } from "./shots";
import timing from "../../episodes/ep1/timing.json";

export const TAIL = 0.7; // seconds after the last word
export const totalFrames = (fps: number) => Math.ceil((timing.total + TAIL) * fps);

// shot i is on screen from its first word until the next shot's first word
export const shotSpans = (fps: number) =>
  timing.shots.map((s, i) => {
    const a = i === 0 ? 0 : Math.round(s.start * fps);
    const b = i + 1 < timing.shots.length ? Math.round(timing.shots[i + 1].start * fps) : totalFrames(fps);
    return { id: s.id, from: a, dur: b - a };
  });

export const ShotView: React.FC<{ id: number; dur: number }> = ({ id, dur }) => {
  const S = SHOTS[id];
  return (
    <Stage look={S.look} cam={S.cam} dur={dur} focus={S.focus}>
      <S.Body dur={dur} />
    </Stage>
  );
};

export const Episode: React.FC<{ captions?: boolean; music?: boolean }> = ({ captions = true, music = true }) => {
  const { fps } = useVideoConfig();
  const words = timing.shots.flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shotSpans(fps).map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={"shot " + s.id}>
          <ShotView id={s.id} dur={s.dur} />
        </Sequence>
      ))}
      {captions ? <Captions words={words} /> : null}
      <Audio src={staticFile(music ? "ep1/mix.wav" : "ep1/voice.wav")} />
    </AbsoluteFill>
  );
};

// One shot on its own (for checking stills before the full render)
export const ShotStill: React.FC<{ id: number }> = ({ id }) => {
  const { fps } = useVideoConfig();
  const s = shotSpans(fps).find((x) => x.id === id)!;
  return <ShotView id={id} dur={s.dur} />;
};
