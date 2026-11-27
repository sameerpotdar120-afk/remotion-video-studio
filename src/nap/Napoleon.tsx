import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Captions } from "../engine/Captions";
import { CUTS, END, SHOTS } from "./shots";
import { WORDS } from "./data";

export const NAP_FPS = 30;
export const NAP_FRAMES = Math.round(END * NAP_FPS);
const capWords = WORDS.map((w) => ({ w: w.w, start: w.s, end: w.e }));

export const Napoleon: React.FC<{ from?: number; to?: number; noAudio?: boolean }> = ({ noAudio }) => {
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ background: "#000" }}>
    {SHOTS.map((S, i) => {
      const a = Math.round(CUTS[i] * fps), b = Math.round((CUTS[i + 1] ?? END) * fps);
      return <Sequence key={i} from={a} durationInFrames={b - a} name={`Shot ${i + 1}`}><S /></Sequence>;
    })}
    <Captions words={capWords} y={0.62} size={84} />
    {noAudio ? null : <>
      <Audio src={staticFile("nap/mix.wav")} />
    </>}
  </AbsoluteFill>;
};
