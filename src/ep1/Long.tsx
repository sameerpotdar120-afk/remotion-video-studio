// The long version (16:9): same sets and characters, a longer script (episodes/ep1long). Each line reuses a shot from the Short
// with a different camera move, so nothing new has to be built. Length is just more lines: 2, 8 or 12 minutes work the same way.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Stage, CamKeys, V3 } from "../engine/Stage";
import { SHOTS } from "./shots";
import timing from "../../episodes/ep1long/timing.json";
import plan from "../../episodes/ep1long/shots.json";

const TAIL = 1.2;
export const longFrames = (fps: number) => Math.ceil((timing.total + TAIL) * fps);

const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
function vary(c: CamKeys, v?: string): CamKeys {
  const L = c.lookFrom;
  switch (v) {
    case "near": return { ...c, from: lerp(c.from, L, 0.3), to: lerp(c.to, L, 0.35) };
    case "close": return { ...c, from: lerp(c.to, L, 0.3), to: lerp(c.to, L, 0.45) };
    case "wide": return { ...c, from: lerp(c.from, L, -0.35), to: lerp(c.to, L, -0.25) };
    case "back": return { ...c, from: c.to, to: c.from, lookFrom: c.lookTo ?? c.lookFrom, lookTo: c.lookFrom };
    case "low": return { ...c, from: [c.from[0], Math.max(0.6, c.from[1] * 0.55), c.from[2]], to: [c.to[0], Math.max(0.7, c.to[1] * 0.6), c.to[2]] };
    case "top": return { ...c, from: c.to, to: [c.to[0], c.to[1] + 4, c.to[2] - 2] };
    case "still": return { ...c, from: c.to, to: lerp(c.to, L, 0.06) };
    case "other": return { ...c, from: [2 * L[0] - c.to[0], c.to[1], c.to[2]], to: [2 * L[0] - c.from[0], c.from[1], c.from[2]] };
    case "keeper": return { ...c, from: lerp(c.from, [1.3, 1.5, 0.55], 0.35), to: lerp(c.to, [1.3, 1.5, 0.55], 0.45), lookFrom: [1.3, 1.5, 0.55], lookTo: [1.3, 1.5, 0.55] };
    default: return c;
  }
}

export const LongEpisode: React.FC = () => {
  const { fps } = useVideoConfig();
  const total = longFrames(fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timing.shots.map((s, i) => {
        const p = (plan as { id: number; base: number; variant?: string }[])[i];
        const a = i === 0 ? 0 : Math.round(s.start * fps);
        const b = i + 1 < timing.shots.length ? Math.round(timing.shots[i + 1].start * fps) : total;
        const S = SHOTS[p.base];
        const cam = vary(S.cam, p.variant);
        const focus = p.variant === "wide" ? S.focus * 1.3 : p.variant === "near" || p.variant === "close" ? S.focus * 0.7 : S.focus;
        return (
          <Sequence key={s.id} from={a} durationInFrames={b - a} name={`line ${s.id} (shot ${p.base} ${p.variant ?? ""})`}>
            <Stage look={S.look} cam={{ ...cam, fov: (cam.fov ?? 55) * 0.82 }} dur={b - a} focus={focus}>
              <S.Body dur={b - a} />
            </Stage>
          </Sequence>
        );
      })}
      <Audio src={staticFile("ep1long/mix.wav")} />
    </AbsoluteFill>
  );
};
