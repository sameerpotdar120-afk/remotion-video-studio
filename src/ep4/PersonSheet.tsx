import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { drawPerson, PersonPose } from "../engine/person";
import { P, NAMES } from "./cast";
const ORDER: [string, Omit<PersonPose, "t">][] = [
  ["narrator", { eyes: "worried", mouth: "closed" }], ["emma", { mouth: "smile", armR: "wave" }], ["josh", { mouth: "grin", armL: "hips" }], ["lauren", { eyes: "wide", mouth: "o" }],
  ["ryan", { armR: "toolbox", mouth: "smile", turn: 0.4 }], ["kate", { armL: "hold", mouth: "smile" }], ["stranger", { eyes: "stare", mouth: "closed", turn: -0.3 }], ["truckman", { armR: "wave", eyes: "narrow", mouth: "smile" }],
];
export const PersonSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!; const grd = g.createLinearGradient(0, 0, 0, 1100); grd.addColorStop(0, "#1e2228"); grd.addColorStop(1, "#0e1014"); g.fillStyle = grd; g.fillRect(0, 0, 3200, 1100);
    const c = document.createElement("canvas"); c.width = 768; c.height = 1536; const cg = c.getContext("2d")!;
    ORDER.forEach(([k, pose], i) => { drawPerson(cg, P[k], { ...pose, t: 0.5, blink: false }); g.drawImage(c, i * 400 - 0, 20, 400, 800); g.fillStyle = "#e8e4dc"; g.font = "700 30px Arial"; g.textAlign = "center"; g.fillText(NAMES[k], i * 400 + 200, 870); });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={3200} height={900} style={{ width: "100%" }} /></AbsoluteFill>;
};
