// Thumbnail: panicked Napoleon + giant angry rabbit + one hook line.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Bg, Finish, Scene } from "./lib";
import "../engine/Captions";

const font = "MontserratLocal";
const Line: React.FC<{ text: string; top: number; size: number; color?: string }> = ({ text, top, size, color = "#fff" }) =>
  <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
    <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, color, letterSpacing: -1, WebkitTextStroke: "16px #111014", paintOrder: "stroke fill", textShadow: "0 10px 18px rgba(0,0,0,0.5)" }}>{text}</span>
  </div>;

export const NapThumb: React.FC = () => <Scene cam={{ zoom: 1.0 }} grade="saturate(1.18) contrast(1.08)">
  <Bg k="BG11" z={0.3} over={1.05} panX={-0.2} />
  <Actor k="N10" x={330} y={1060} h={1150} z={1} rot={-8} eyes={{ mood: "panic", seed: 3, scale: 1.1 }} mouth="scream" />
  <Actor k="R14" x={600} y={2300} h={1750} z={1} eyes={{ mood: "angry", browAngle: 28, seed: 4 }} mouth="scream" />
  <Finish vignette={0.5} />
  <AbsoluteFill>
    <Line text="NAPOLEON" top={70} size={150} />
    <Line text="RAN FROM THIS" top={240} size={118} color="#ffd23f" />
  </AbsoluteFill>
</Scene>;
