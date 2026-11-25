// Thumbnail: shocked pirate captain + the hooded hostage with glowing eyes + hook text (no name: keep the reveal).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Bg, Finish, Scene } from "./lib";
import "../engine/Captions";

const font = "MontserratLocal";
const Line: React.FC<{ text: string; top: number; size: number; color?: string }> = ({ text, top, size, color = "#fff" }) =>
  <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
    <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, color, letterSpacing: -1, WebkitTextStroke: "16px #111014", paintOrder: "stroke fill", textShadow: "0 10px 18px rgba(0,0,0,0.5)" }}>{text}</span>
  </div>;

export const CaesarThumb: React.FC = () => <Scene cam={{ zoom: 1.0 }} grade="saturate(1.2) contrast(1.1)">
  <Bg k="BG02" z={0.3} over={1.05} />
  <Actor k="CA05" x={230} y={2420} h={1900} z={1} rot={-4} eyes={{ mood: "shock", seed: 3, scale: 1.15 }} mouth="O" />
  <Actor k="HE03" x={730} y={2250} h={1700} z={1.05} eyes={{ mood: "glow", seed: 4, scale: 1.2 }} />
  <Finish vignette={0.55} warm={0.15} />
  <AbsoluteFill>
    <Line text="PIRATES" top={70} size={170} />
    <Line text="KIDNAPPED" top={250} size={140} />
    <Line text="THE WRONG GUY" top={420} size={112} color="#ffd23f" />
  </AbsoluteFill>
</Scene>;
