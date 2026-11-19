// Part 1, scene 1 (hook, 0-8.1 s): the cabin at night, slow push-in; the pale stranger appears at the foot of the porch steps on "stranger";
// the porch lantern dies on "never came home".
import React from "react";
import { Scene3D } from "./Scene3D";
import { P } from "./cast";

export const HOOK_FRAMES = 243;
export const Hook: React.FC = () => (
  <Scene3D dur={8.1}
    env="E1"
    K={1.6}
    fog={0.55}
    cam={{ from: [0.05, -0.15, 12.9], to: [0.35, -0.05, 10.4], lookFrom: [0.05, -0.2, 0], lookTo: [0.4, -0.25, 0], fov: 30 }}
    glows={[
      { uv: [0.652, 0.482], size: 0.55, color: "#ffb35a", flicker: 0.25, off: 6.5 },
      { uv: [0.365, 0.505], size: 0.7, color: "#ffb860", flicker: 0.08 },
      { uv: [0.615, 0.362], size: 0.6, color: "#ffb860", flicker: 0.06 },
    ]}
    actors={[{ spec: P.stranger, pose: { eyes: "stare", mouth: "closed", armL: "down", armR: "down" }, uv: [0.62, 0.655], h: 0.82, fadeIn: 2.9, tint: "#b8a898" }]}
  />
);
