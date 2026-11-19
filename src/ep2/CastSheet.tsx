// Check sheet for the drawn cast (not part of the episode).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { drawToon, ToonPose } from "../engine/draw";
import { C } from "./cast";
import { C as C3 } from "../ep3/cast";
const POSES: [string, Omit<ToonPose, "t">][] = [
  ["hero", { eyes: "dot", mouth: "smile" }], ["hero", { walk: 1, eyes: "smug", mouth: "smirk" }], ["hero", { armR: "point", eyes: "smug", mouth: "smirk" }],
  ["hero", { eyes: "shock", mouth: "o", armL: "shrug", armR: "shrug" }], ["hero", { eyes: "sad", mouth: "wavy", sweat: true }], ["hero", { eyes: "happy", mouth: "grin", armL: "up", armR: "up" }],
  ["sheriff", { eyes: "angry", mouth: "frown" }], ["sheriff", { eyes: "glow", mouth: "flat" }], ["worker1", { armR: "up" }], ["driver1", {}], ["gf3", { eyes: "happy", mouth: "smile" }], ["gf3", { eyes: "angry", mouth: "flat", armL: "hips", armR: "hips" }], ["teen3", { eyes: "smug", mouth: "grin" }],
];
export const CastSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!; g.fillStyle = "#3a3550"; g.fillRect(0, 0, 5000, 1100);
    const c = document.createElement("canvas"); c.width = 768; c.height = 1024; const cg = c.getContext("2d")!;
    POSES.forEach(([who, pose], i) => { drawToon(cg, (who.endsWith("3") ? C3[who.slice(0, -1)] : C[who]), { ...pose, t: 0.5 }); g.drawImage(c, i * 384, 40, 384, 512 * 1.0); });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={5000} height={600} style={{ width: "100%" }} /></AbsoluteFill>;
};
