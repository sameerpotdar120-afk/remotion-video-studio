import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Stage } from "../engine/Stage";
import { Captions } from "../engine/Captions";
import { SHOTS } from "./shots";
import timing from "../../episodes/ep3/timing.json";

export const TAIL = 0.7;
export const totalFrames3 = (fps: number) => Math.ceil((timing.total + TAIL) * fps);
const XF = 7; // measured on the reference: mostly 7-frame dissolves, only 3 hard cuts
const HARD = new Set([4, 14, 23]); // hard cuts (2013 jump, the leak, empty apartment)

export const shotSpans3 = (fps: number) =>
  timing.shots.map((s, i) => {
    const a = i === 0 ? 0 : Math.round(s.start * fps);
    const b = i + 1 < timing.shots.length ? Math.round(timing.shots[i + 1].start * fps) : totalFrames3(fps);
    return { id: s.id, from: a, dur: b - a };
  });

const ShotView: React.FC<{ id: number; dur: number }> = ({ id, dur }) => {
  const S = SHOTS[id];
  return <Stage look={S.look} cam={S.cam} dur={dur} focus={S.focus}><S.Body dur={dur} /></Stage>;
};
const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, XF], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

export const Episode3: React.FC<{ captions?: boolean; music?: boolean; audio?: boolean }> = ({ captions = true, music = true, audio = true }) => {
  const { fps } = useVideoConfig();
  const words = timing.shots.flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shotSpans3(fps).map((s) => {
        const dis = s.id > 1 && !HARD.has(s.id);
        return (
          <Sequence key={s.id} from={s.from - (dis ? XF : 0)} durationInFrames={s.dur + (dis ? XF : 0)} name={"shot " + s.id}>
            {dis ? <Fade><ShotView id={s.id} dur={s.dur + XF} /></Fade> : <ShotView id={s.id} dur={s.dur} />}
          </Sequence>
        );
      })}
      {captions ? <Captions words={words} y={0.7} /> : null}
      {audio ? <Audio src={staticFile(music ? "ep3/mix.wav" : "ep3/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};

export const ShotStill3: React.FC<{ id: number }> = ({ id }) => {
  const { fps } = useVideoConfig();
  const s = shotSpans3(fps).find((x) => x.id === id)!;
  return <ShotView id={id} dur={s.dur} />;
};
