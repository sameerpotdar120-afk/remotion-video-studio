// The whole film: scene 1 (its own composition) then every shot of the engine, back to back.
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { ShotView, type ShotSpec } from "./engine";
import { Scene1 } from "../Scene1";
import { ACT_A } from "./shots_a";
import { ACT_B } from "./shots_b";
import { ACT_C } from "./shots_c";
import { ACT_D } from "./shots_d";

export const FILM_FPS = 30, FILM_END = 105.9;
const ALL: { at: number; spec: ShotSpec }[] = [...ACT_A, ...ACT_B, ...ACT_C, ...ACT_D].sort((a, b) => a.at - b.at);
export const FILM = ALL.map((s, i) => ({ ...s, end: i + 1 < ALL.length ? ALL[i + 1].at : Math.min(FILM_END, s.at + s.spec.dur) }));
export const findShot = (id: string) => FILM.find((s) => s.spec.id === id)!;

export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0} durationInFrames={Math.round(4.3 * fps)} name="scene 1"><Scene1 captions={false} audio={false} /></Sequence>
      {FILM.map((s) => (<Sequence key={s.spec.id} from={Math.round(s.at * fps)} durationInFrames={Math.max(1, Math.round(s.end * fps) - Math.round(s.at * fps))} name={s.spec.id}><ShotView spec={s.spec} /></Sequence>))}
    </AbsoluteFill>
  );
};
// one shot on its own (look-dev / stills): frame 0 = start of the shot
export const FilmShot: React.FC<{ id?: string }> = ({ id = "A1" }) => <ShotView spec={findShot(id).spec} />;
