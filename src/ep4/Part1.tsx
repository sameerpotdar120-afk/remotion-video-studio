// Mountain Cabin, Part 1 "The Knock": 21 shots, each with its own camera move, on the creator's voice (x1.15).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene3D, Actor, Dust } from "./Scene3D";
import { P } from "./cast";
import { Captions, Word } from "../engine/Captions";
import words from "./words.json";

const FPS = 30;
const WARM: Dust = { color: "#ffc27a", count: 150, size: 0.03, center: [0, 0, 1.6], spread: [5, 7, 4], speed: 0.8, opacity: 0.55 };
const COLD: Dust = { color: "#c8d6ff", count: 90, size: 0.025, center: [0, 0, 1.4], spread: [5, 7, 4], speed: 0.5, opacity: 0.35 };
const IN = "#e9cfb2", OUT = "#9eabc6", PALE = "#b8a898";
// close-up actor placed straight in front of the camera (feet far below frame), head at y≈hy
const cu = (spec: Actor["spec"], extra: Partial<Actor>, x = 0, hy = 0.12, h = 3.7, z = 8.6): Actor => ({ spec, h, pos: [x, hy - 0.83 * h, z], res: 2, ...extra });
const room = (u: number, v: number, h: number, spec: Actor["spec"], extra: Partial<Actor> = {}): Actor => ({ spec, uv: [u, v], h, tint: IN, ...(v < 0.55 ? { uv: [u, 0.6] as [number, number], zuv: [u, v] as [number, number], h: h + 0.5 } : {}), ...extra });

type Shot = { a: number; b: number; el: (dur: number) => React.ReactNode };
const S: Shot[] = [
  // 1 HOOK: slow creeping push on the cabin, the stranger appears, the lantern dies
  { a: 0, b: 8.1, el: (d) => <Scene3D dur={d} env="E1" fog={0.55}
      cam={{ from: [0.05, -0.15, 12.9], to: [0.35, -0.05, 10.4], lookFrom: [0.05, -0.15, 0], lookTo: [0.4, -0.25, 0], fov: 30, whipOut: 0.25 }}
      glows={[{ uv: [0.652, 0.482], size: 0.55, color: "#ffb35a", flicker: 0.25, off: 6.5 }, { uv: [0.365, 0.505], size: 0.7, color: "#ffb860", flicker: 0.08 }, { uv: [0.615, 0.362], size: 0.6, color: "#ffb860", flicker: 0.06 }]}
      actors={[{ spec: P.stranger, pose: { eyes: "stare", mouth: "closed" }, uv: [0.62, 0.655], h: 0.82, fadeIn: 2.9, tint: PALE }]} /> },
  // 2 "summer of 1991": crane DOWN from the moon to the forest road
  { a: 8.1, b: 10.55, el: (d) => <Scene3D dur={d} env="E3" fog={0.5} dust={[COLD]}
      cam={{ from: [0.3, 1.0, 9.4], to: [0.0, -0.2, 10.0], lookFrom: [0.35, 1.15, 0], lookTo: [0.0, -0.3, 0], fov: 32, ease: "out", whipIn: 0.2 }}
      glows={[{ uv: [0.83, 0.06], size: 0.9, color: "#cfe0ff", amt: 0.4 }]}>
      <Stamp text="SUMMER 1991" at={0.35} /></Scene3D> },
  // 3 Ryan & Kate engaged: ARC around them (camera swings left to right, always looking at the couple)
  { a: 10.55, b: 15.75, el: (d) => <Scene3D dur={d} env="E2" fog={0} dust={[WARM]}
      cam={{ from: [-0.7, -0.3, 9.6], via: [0.0, -0.1, 9.0], to: [0.7, -0.2, 9.6], lookFrom: [0.1, -0.4, 0], lookTo: [0.15, -0.4, 0], fov: 32, roll: [-1.5, 1.5] }}
      glows={[{ uv: [0.12, 0.42], size: 1.1, color: "#ff8a3a", flicker: 0.35, amt: 0.45 }, { uv: [0.55, 0.29], size: 0.8, color: "#ffc070", flicker: 0.05, amt: 0.45 }]}
      actors={[room(0.42, 0.74, 2.3, P.ryan, { poseAt: (t) => ({ mouth: "grin", armR: t > 1.3 ? "wave" : "down", talk: t < 1.2 }) }),
               room(0.6, 0.74, 2.15, P.kate, { poseAt: (t) => ({ mouth: t > 1.9 ? "smile" : "closed", armL: t > 1.9 ? "up" : "down", turn: -0.3 }) })]} /> },
  // 4 the four of us: TRUCK sideways along the line-up as each name is said
  { a: 15.75, b: 19.1, el: (d) => <Scene3D dur={d} env="E2" fog={0} dust={[WARM]}
      cam={{ from: [-0.55, -0.6, 9.2], to: [0.55, -0.6, 9.2], lookFrom: [-0.55, -0.8, 0], lookTo: [0.55, -0.8, 0], fov: 30, ease: "linear", whipOut: 0.22 }}
      glows={[{ uv: [0.12, 0.42], size: 1.1, color: "#ff8a3a", flicker: 0.35, amt: 0.45 }]}
      actors={[room(0.22, 0.8, 2.3, P.narrator, { pose: { mouth: "smile" }, fadeIn: 0 }), room(0.4, 0.8, 2.15, P.emma, { pose: { mouth: "smile", armL: "wave" }, fadeIn: 0.6 }),
               room(0.6, 0.8, 2.35, P.josh, { pose: { mouth: "grin", armR: "hips" }, fadeIn: 1.55 }), room(0.78, 0.8, 2.1, P.lauren, { pose: { mouth: "smile", armR: "wave" }, fadeIn: 2.5 })]} /> },
  // 5 Josh drove us up: low on the road, CRANE UP and over to the cabin far away
  { a: 19.1, b: 25.65, el: (d) => <Scene3D dur={d} env="E3" K={2.0} fog={0.6} dust={[COLD]}
      cam={{ from: [0.3, -2.6, 8.0], via: [0.1, -0.8, 7.6], to: [0.0, 0.5, 8.4], lookFrom: [0.3, -2.4, 0], lookVia: [0.1, -0.3, 0], lookTo: [0.0, 0.85, 0], fov: 34, whipIn: 0.2 }}
      glows={[{ uv: [0.43, 0.535], size: 0.6, color: "#fff2c8", amt: 0.7, flicker: 0.05 }, { uv: [0.62, 0.56], size: 0.3, color: "#ff2a1a", amt: 0.6 }, { uv: [0.5, 0.31], size: 0.4, color: "#ffb860", amt: 0.4, flicker: 0.1 }]} /> },
  // 6 dinner: slow ORBIT-in towards the table, everybody laughing
  { a: 25.65, b: 29.5, el: (d) => <Scene3D dur={d} env="E2" fog={0} dust={[WARM]}
      cam={{ from: [0.6, 0.3, 10.2], via: [0.2, 0.1, 8.6], to: [-0.2, -0.05, 8.0], lookFrom: [0.5, -0.1, 0], lookTo: [0.35, -0.3, 0], fov: 30 }}
      glows={[{ uv: [0.12, 0.42], size: 1.1, color: "#ff8a3a", flicker: 0.35, amt: 0.45 }, { uv: [0.55, 0.29], size: 0.8, color: "#ffc070", flicker: 0.05, amt: 0.45 }]}
      actors={[room(0.42, 0.45, 1.6, P.emma, { poseAt: (t) => ({ mouth: Math.sin(t * 6) > 0 ? "grin" : "open", armR: "hold" }) }), room(0.53, 0.45, 1.65, P.ryan, { poseAt: (t) => ({ mouth: "grin", talk: true, armL: "hold" }) }),
               room(0.64, 0.45, 1.55, P.kate, { pose: { mouth: "smile", eyes: "closed" } }), room(0.76, 0.46, 1.7, P.josh, { poseAt: (t) => ({ mouth: Math.sin(t * 5 + 1) > 0 ? "grin" : "open", armR: "hold" }) }),
               room(0.31, 0.46, 1.6, P.lauren, { pose: { mouth: "grin", armL: "eat" } }), room(0.88, 0.5, 1.8, P.narrator, { pose: { mouth: "smile", armR: "hold", turn: -0.5 } })]} /> },
  // 7 the knock: creeping DOLLY towards the front door, three hard shakes on the knocks
  { a: 29.5, b: 32.3, el: (d) => <Scene3D dur={d} env="E4" K={1.4} fog={0} dust={[WARM]} light={(t) => (t > 1.5 && t < 2.1 ? 0.75 + 0.25 * Math.abs(Math.sin(t * 40)) : 1)}
      cam={{ from: [0, -0.9, 11.0], to: [0, -0.2, 8.4], lookFrom: [0, -0.9, 0], lookTo: [0, 0.4, 0], fov: 30, ease: "in", handheld: 0.3,
             shake: [{ t: 1.52, amp: 0.06 }, { t: 1.84, amp: 0.07 }, { t: 2.14, amp: 0.09 }] }}
      glows={[{ uv: [0.1, 0.3], size: 0.9, color: "#ffb05a", flicker: 0.12, amt: 0.4 }]} /> },
  // 8 we all froze: DOLLY ZOOM (vertigo) on the group, then they all turn to the door
  { a: 32.3, b: 36.25, el: (d) => <Scene3D dur={d} env="E2" K={2.2} fog={0} dust={[WARM]}
      cam={{ from: [0.3, -0.5, 7.4], to: [0.3, -0.5, 11.6], lookFrom: [0.35, -0.5, 0], lookTo: [0.35, -0.5, 0], fov: 46, fovTo: 29, ease: "out", handheld: 0.2 }}
      glows={[{ uv: [0.12, 0.42], size: 1.1, color: "#ff8a3a", flicker: 0.35, amt: 0.4 }]}
      actors={[room(0.3, 0.76, 2.2, P.emma, { pose: { eyes: "wide", mouth: "o", turn: 0.8 } }), room(0.46, 0.76, 2.35, P.narrator, { pose: { eyes: "wide", mouth: "closed", turn: 0.8 } }),
               room(0.62, 0.77, 2.3, P.ryan, { poseAt: (t) => ({ eyes: "worried", mouth: t > 1.8 && t < 3.0 ? undefined : "frown", talk: t > 1.8 && t < 3.0, turn: t > 1.8 ? -0.3 : 0.8 }) }),
               room(0.76, 0.77, 2.1, P.kate, { pose: { eyes: "wide", mouth: "closed", turn: 0.8 } })]} /> },
  // 9 Kate opened the door: over-the-shoulder PUSH through the doorway, she's standing there
  { a: 36.25, b: 39.8, el: (d) => <Scene3D dur={d} env="E5" K={1.8} fog={0.35} fogColor="#7e8aa8" dust={[COLD]}
      cam={{ from: [-0.2, -0.6, 11.2], to: [0.05, -0.1, 8.6], lookFrom: [-0.1, -0.6, 0], lookTo: [0.0, 0.1, 0], fov: 30, roll: [0, -3], handheld: 0.25 }}
      glows={[{ uv: [0.29, 0.22], size: 0.6, color: "#ffb35a", flicker: 0.4, amt: 0.5 }]}
      actors={[{ spec: P.stranger, pose: { eyes: "stare", mouth: "closed" }, uv: [0.47, 0.73], h: 3.2, fadeIn: 0.35, tint: "#a8a4b0", dz: 0.15 }]} /> },
  // 10 pale, dark circles: CLOSE-UP, slow push with a dutch tilt, background blurred
  { a: 39.8, b: 42.55, el: (d) => <Scene3D dur={d} env="E9" blur={1} fog={0} dust={[COLD]}
      cam={{ from: [0, 0.1, 12.2], to: [0, 0.2, 11.4], lookFrom: [0, 0.1, 0], lookTo: [0, 0.25, 0], fov: 30, roll: [3, 5], handheld: 0.15 }}
      actors={[cu(P.stranger, { pose: { eyes: "stare", mouth: "closed" }, tint: "#b0a49a" }, 0.0)]} /> },
  // 11 pointed down the driveway: she points, camera PANS off her towards the dark outside
  { a: 42.55, b: 46.1, el: (d) => <Scene3D dur={d} env="E5" K={1.8} fog={0.35} fogColor="#7e8aa8" dust={[COLD]}
      cam={{ from: [-0.15, -0.2, 9.0], to: [0.35, 0.1, 8.0], lookFrom: [-0.05, -0.3, 0], lookTo: [0.35, 0.3, 0], fov: 30, handheld: 0.2, whipOut: 0.25 }}
      glows={[{ uv: [0.29, 0.22], size: 0.6, color: "#ffb35a", flicker: 0.4, amt: 0.5 }]}
      actors={[{ spec: P.stranger, poseAt: (t) => ({ eyes: "stare", talk: t < 1.7, armR: t > 1.9 ? "point" : "down" }), uv: [0.4, 0.73], h: 3.2, tint: "#a8a4b0", dz: 0.15 }]} /> },
  // 12 the pickup at the bottom: slow ZOOM (fov) down the driveway from the porch, the man waves
  { a: 46.1, b: 51.0, el: (d) => <Scene3D dur={d} env="E6" K={1.8} fog={0.6} dust={[COLD]}
      cam={{ from: [0.2, -0.4, 12.0], to: [0.15, -0.55, 11.6], lookFrom: [0.2, -0.2, 0], lookTo: [0.45, -0.2, 0], fov: 30, fovTo: 17, ease: "inout", whipIn: 0.25 }}
      glows={[{ uv: [0.47, 0.47], size: 0.5, color: "#fff0c0", amt: 0.6, flicker: 0.04 }, { uv: [0.6, 0.47], size: 0.5, color: "#fff0c0", amt: 0.6, flicker: 0.04 }]}
      actors={[{ spec: P.truckman, poseAt: (t) => ({ armR: t > 3.6 ? "wave" : "down", mouth: "smile" }), uv: [0.79, 0.535], h: 0.62, tint: OUT }]} /> },
  // 13 Ryan grabs his toolbox and heads down: camera FOLLOWS him (truck + pan)
  { a: 51.0, b: 53.35, el: (d) => <Scene3D dur={d} env="E7" K={2.0} fog={0.7} dust={[COLD]}
      cam={{ from: [-0.6, -1.9, 9.0], to: [0.4, -1.4, 8.6], lookFrom: [-0.6, -2.0, 0], lookTo: [0.5, -1.2, 0], fov: 32, ease: "linear" }}
      glows={[{ uv: [0.89, 0.56], size: 0.25, color: "#ff2a1a", amt: 0.6, flicker: 0.05 }, { uv: [0.25, 0.37], size: 0.3, color: "#ffb860", amt: 0.4 }]}
      actors={[{ spec: P.ryan, pose: { armR: "toolbox", walk: 1, mouth: "closed" }, uv: [0.28, 0.9], h: 2.2, path: { to: [0.68, 0.8], start: 0, end: 2.35 }, tint: OUT }]} /> },
  // 14 the woman sat at our table: high angle TILT DOWN onto the table
  { a: 53.35, b: 56.3, el: (d) => <Scene3D dur={d} env="E2" fog={0} dust={[WARM]}
      cam={{ from: [0.3, 1.2, 9.0], to: [0.35, 0.0, 8.4], lookFrom: [0.3, 0.6, 0], lookTo: [0.4, -0.5, 0], fov: 32, roll: [0, -2], whipOut: 0.2, whipDir: -1 }}
      glows={[{ uv: [0.55, 0.29], size: 0.8, color: "#ffc070", flicker: 0.05, amt: 0.45 }]}
      actors={[room(0.56, 0.45, 1.6, P.stranger, { pose: { eyes: "stare", mouth: "closed" }, tint: "#d4c0ae" }), room(0.8, 0.47, 1.7, P.kate, { pose: { eyes: "worried", mouth: "closed", turn: -0.6 } }),
               room(0.3, 0.47, 1.7, P.narrator, { pose: { eyes: "narrow", mouth: "closed", turn: 0.6, armL: "cross", armR: "cross" } })]} /> },
  // 15 "Do you have any food?": snap CLOSE-UP, handheld
  { a: 56.3, b: 57.9, el: (d) => <Scene3D dur={d} env="E2" blur={1.2} fog={0} dust={[WARM]}
      cam={{ from: [0, 0.2, 11.2], to: [0, 0.25, 10.6], lookFrom: [0.2, 0.15, 0], lookTo: [0.2, 0.25, 0], fov: 30, handheld: 0.35, whipIn: 0.2, whipDir: -1 }}
      actors={[cu(P.stranger, { poseAt: (t) => ({ eyes: "stare", talk: t > 0.05 && t < 0.75, mouth: "closed" }), tint: "#d8c4b2" }, 0.2, 0.1, 3.4, 7.6)]} /> },
  // 16 she ate like she hadn't eaten in days: low PUSH across the plate up to her
  { a: 57.9, b: 61.65, el: (d) => <Scene3D dur={d} env="E8" K={1.8} fog={0} dust={[WARM]}
      cam={{ from: [0.0, -2.2, 8.6], via: [0.0, -1.3, 8.0], to: [0.05, -0.2, 7.8], lookFrom: [0.0, -2.4, 0], lookTo: [0.05, 0.1, 0], fov: 32 }}
      glows={[{ uv: [0.5, 0.2], size: 1.0, color: "#ffc070", flicker: 0.06, amt: 0.55 }]}
      actors={[{ spec: P.stranger, poseAt: (t) => ({ eyes: "narrow", mouth: "chew", armR: "eat", armL: "eat", headTilt: Math.sin(t * 9) * 0.04 }), uv: [0.55, 0.85], zuv: [0.55, 0.52], dz: 0.4, h: 4.15, res: 2, tint: "#dcc6b0" }]} /> },
  // 17 I asked how they ended up here: me, close-up, slow ARC
  { a: 61.65, b: 64.2, el: (d) => <Scene3D dur={d} env="E9" blur={1} fog={0} dust={[WARM]}
      cam={{ from: [-0.35, 0.2, 11.6], via: [0, 0.25, 11.2], to: [0.35, 0.2, 11.6], lookFrom: [0, 0.2, 0], lookTo: [0, 0.2, 0], fov: 30 }}
      actors={[cu(P.narrator, { poseAt: (t) => ({ eyes: "narrow", talk: t < 1.9, turn: -0.25 }), tint: "#e6c9ac" }, 0.1)]} /> },
  // 18 "My brother and I were going camping.": her close-up, steady
  { a: 64.2, b: 66.55, el: (d) => <Scene3D dur={d} env="E8" blur={1.3} fog={0}
      cam={{ from: [0, 0.3, 12.0], to: [0, 0.3, 11.5], lookFrom: [0, 0.3, 0], lookTo: [0, 0.3, 0], fov: 30 }}
      glows={[{ uv: [0.5, 0.2], size: 1.0, color: "#ffc070", flicker: 0.06, amt: 0.5 }]}
      actors={[cu(P.stranger, { poseAt: (t) => ({ eyes: "normal", talk: t > 0.1 && t < 1.6, mouth: "chew" }), tint: "#d8c4b2" }, 0)]} /> },
  // 19 "Your brother? You said your husband.": me, SNAP ZOOM in
  { a: 66.55, b: 68.65, el: (d) => <Scene3D dur={d} env="E9" blur={1} fog={0}
      cam={{ from: [0, 0.2, 12.2], to: [0, 0.3, 11.2], lookFrom: [0, 0.2, 0], lookTo: [0, 0.35, 0], fov: 30, fovTo: 24, ease: "out", handheld: 0.2 }}
      actors={[cu(P.narrator, { poseAt: (t) => ({ eyes: t < 0.8 ? "wide" : "narrow", talk: true, mouth: "frown" }), tint: "#e6c9ac" }, 0)]} /> },
  // 20 She stopped chewing... and slowly looked up at me: creeping push to her eyes, light flickers
  { a: 68.65, b: 71.6, el: (d) => <Scene3D dur={d} env="E8" blur={1.6} fog={0} vignette={0.75} light={(t) => (t > 2.2 ? 0.55 + 0.45 * (Math.sin(t * 37) > 0.2 ? 1 : 0.3) : 1)}
      cam={{ from: [0, 0.3, 12.2], to: [0, 0.42, 10.4], lookFrom: [0, 0.3, 0], lookTo: [0, 0.42, 0], fov: 30, fovTo: 22, ease: "in", roll: [0, -4] }}
      actors={[cu(P.stranger, { poseAt: (t) => ({ eyes: "stare", mouth: t < 0.2 ? "chew" : "closed", headTilt: t < 1.3 ? 0.12 : 0.12 * Math.max(0, 1 - (t - 1.3) / 1.0), look: t < 1.3 ? 0.9 : 0.9 - 1.0 * Math.min(1, (t - 1.3) / 1.0), blink: false }), tint: "#c8b4a2" }, 0)]} /> },
];
export const PART1_FRAMES = Math.round(73.4 * FPS);

const Stamp: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame(); const t = f / FPS; const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * 18)));
  return <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300 }}>
    <div style={{ fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 70, color: "#f2ead8", letterSpacing: 8, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>{text.slice(0, n)}{n < text.length && n > 0 ? "▌" : ""}</div>
  </AbsoluteFill>;
};
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const op = interpolate(f, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
    <div style={{ opacity: op, fontFamily: "MontserratLocal, sans-serif", fontWeight: 900, fontSize: 110, color: "#fff", letterSpacing: 6 }}>PART 2</div>
    <div style={{ opacity: op * 0.8, fontFamily: "MontserratLocal, sans-serif", fontWeight: 700, fontSize: 42, color: "#c9c9c9", marginTop: 20, letterSpacing: 3 }}>COMING SOON</div>
  </AbsoluteFill>;
};

export const Part1: React.FC<{ audio?: boolean; captions?: boolean }> = ({ audio = true, captions = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {S.map((s, i) => { const from = Math.round(s.a * fps), to = Math.round(s.b * fps);
        return <Sequence key={i} from={from} durationInFrames={to - from}>{s.el((to - from) / fps)}</Sequence>; })}
      <Sequence from={Math.round(71.6 * fps)}><EndCard /></Sequence>
      {captions ? <Captions words={words as Word[]} y={0.72} /> : null}
      {audio ? <Audio src={staticFile("ep4/mix.wav")} /> : null}
    </AbsoluteFill>
  );
};
export const SHOT_STARTS = S.map((s) => s.a);
