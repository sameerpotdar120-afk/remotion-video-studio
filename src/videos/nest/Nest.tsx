// Samulation #3 "Nest of Bees" in three.js inside Remotion (toon family A). Post chain from the bridge template:
// ink (own pass, props/machines) -> lens blur -> bloom (light sources only) -> Neutral tone map -> day grade.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { World } from "./world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../bridge/grade";
import { TOTAL, FPS, layersAt, SHOTS } from "./story";

export const NEST_FRAMES = TOTAL;
const fwd = new THREE.Vector3();

const Inner: React.FC<{ si: number }> = ({ si }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    vig: new VignetteEffect({ offset: 0.32, darkness: 0.32 }),   // refs: corners ~.80 of centre by day
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  const focus = world.update(si, f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, focus.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = world.dof(SHOTS[si].id, f / FPS);   // refs: DOF on close/medium shots only, wides stay sharp
  gradeFor(fx.grade, "day");
  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.lens.pre} dispose={null} />
        <primitive object={fx.lens.main} dispose={null} />
        <primitive object={fx.bloom} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.grade} dispose={null} />
        <primitive object={fx.vig} dispose={null} />
      </EffectComposer>
    </>
  );
};

const ShotView: React.FC<{ si: number; alpha: number }> = ({ si, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, toneMappingExposure: 1.0 }} camera={{ fov: 38, near: 0.1, far: 2000 }}>
      <Inner si={si} />
    </ThreeCanvas>
  </AbsoluteFill>
);
export const NestShort: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#c8e0f6" }}>
      {layersAt(f / FPS).map((l, k) => <ShotView key={k ? "over" : "base"} si={l.i} alpha={l.a} />)}
    </AbsoluteFill>
  );
};
