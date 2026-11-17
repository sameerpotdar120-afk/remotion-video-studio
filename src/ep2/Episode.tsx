import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Stage } from "../engine/Stage";
import { Captions } from "../engine/Captions";
import { SHOTS } from "./shots";
import timing from "../../episodes/ep2/timing.json";

export const TAIL = 0.7;
export const totalFrames2 = (fps: number) => Math.ceil((timing.total + TAIL) * fps);
const XF = 5; // cross-dissolve frames (measured: 4-10, usually 5-6; the opening 23 s never hard-cuts)
const DISSOLVE_UNTIL = 11; // shots 2..11 dissolve in, later shots hard-cut (as the reference)

export const shotSpans2 = (fps: number) =>
  timing.shots.map((s, i) => {
    const a = i === 0 ? 0 : Math.round(s.start * fps);
    const b = i + 1 < timing.shots.length ? Math.round(timing.shots[i + 1].start * fps) : totalFrames2(fps);
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

export const Episode2: React.FC<{ captions?: boolean; music?: boolean }> = ({ captions = true, music = true }) => {
  const { fps } = useVideoConfig();
  const words = timing.shots.flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shotSpans2(fps).map((s) => {
        const dis = s.id > 1 && s.id <= DISSOLVE_UNTIL;
        return (
          <Sequence key={s.id} from={s.from - (dis ? XF : 0)} durationInFrames={s.dur + (dis ? XF : 0)} name={"shot " + s.id}>
            {dis ? <Fade><ShotView id={s.id} dur={s.dur + XF} /></Fade> : <ShotView id={s.id} dur={s.dur} />}
          </Sequence>
        );
      })}
      {captions ? <Captions words={words} y={0.7} /> : null}
      <Audio src={staticFile(music ? "ep2/mix.wav" : "ep2/voice.wav")} />
    </AbsoluteFill>
  );
};

export const ShotStill2: React.FC<{ id: number }> = ({ id }) => {
  const { fps } = useVideoConfig();
  const s = shotSpans2(fps).find((x) => x.id === id)!;
  return <ShotView id={id} dur={s.dur} />;
};
