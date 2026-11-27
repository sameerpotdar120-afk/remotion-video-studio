import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Stage } from "../engine/Stage";
import { Captions } from "../engine/Captions";
import { SHOTS } from "./shots";
import timing from "../../episodes/ep3/timing.json";

export const TAIL = 0.7;
const baseFrames = (fps: number) => Math.ceil((timing.total + TAIL) * fps); // shot 25 keeps this length so its camera move is unchanged
// BUSTED ending (our own take on the reference's game-over card): freeze, desaturate, card + sting
export const BUSTED_AT = (fps: number) => Math.round((timing.shots[timing.shots.length - 1].end + 0.25) * fps);
export const BUSTED_LEN = 2.8;
export const totalFrames3 = (fps: number) => BUSTED_AT(fps) + Math.round(BUSTED_LEN * fps);
const XF = 7; // measured on the reference: mostly 7-frame dissolves, only 3 hard cuts
const HARD = new Set([4, 14, 23]); // hard cuts (2013 jump, the leak, empty apartment)

export const shotSpans3 = (fps: number) =>
  timing.shots.map((s, i) => {
    const a = i === 0 ? 0 : Math.round(s.start * fps);
    const b = i + 1 < timing.shots.length ? Math.round(timing.shots[i + 1].start * fps) : baseFrames(fps);
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
        const from = s.from - (dis ? XF : 0);
        const last = s.id === timing.shots[timing.shots.length - 1].id;
        const view = dis ? <Fade><ShotView id={s.id} dur={s.dur + XF} /></Fade> : <ShotView id={s.id} dur={s.dur} />;
        return (
          <React.Fragment key={s.id}>
            <Sequence from={from} durationInFrames={last ? BUSTED_AT(fps) - from : s.dur + (dis ? XF : 0)} name={"shot " + s.id}>{view}</Sequence>
            {last ? (
              <Sequence from={BUSTED_AT(fps)} name="busted">
                <Busted><Freeze frame={BUSTED_AT(fps) - from}>{view}</Freeze></Busted>
              </Sequence>
            ) : null}
          </React.Fragment>
        );
      })}
      {captions ? <Captions words={words} y={0.7} /> : null}
      {audio ? <Audio src={staticFile(music ? "ep3/mix.wav" : "ep3/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};

// the frame freezes, drains to grey and dims; BUSTED slams in with police red/blue glow
const Busted: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  const k = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const pop = interpolate(f, [8, 14, 18], [1.6, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const show = f >= 8;
  const red = Math.floor(f / 6) % 2 === 0;
  const u = width / 1080;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${k}) brightness(${1 - 0.3 * k}) contrast(${1 + 0.1 * k})`, transform: `scale(${1 + 0.04 * k})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.55 * k}) 100%)` }} />
      {show ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: "28%" }}>
          <div style={{ fontFamily: "MontserratLocal", fontWeight: 900, fontSize: 210 * u, letterSpacing: 6 * u, transform: `scale(${pop}) rotate(-4deg)`,
            color: "#ff3b3b", WebkitTextStroke: `${10 * u}px #14070a`, paintOrder: "stroke fill",
            textShadow: red ? `0 0 ${40 * u}px rgba(255,40,40,0.95), 0 0 ${90 * u}px rgba(255,40,40,0.6)` : `0 0 ${40 * u}px rgba(60,120,255,0.95), 0 0 ${90 * u}px rgba(60,120,255,0.6)` }}>BUSTED</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const ShotStill3: React.FC<{ id: number }> = ({ id }) => {
  const { fps } = useVideoConfig();
  const s = shotSpans3(fps).find((x) => x.id === id)!;
  return <ShotView id={id} dur={s.dur} />;
};
