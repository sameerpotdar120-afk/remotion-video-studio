// Look-dev for any set: <SetView set="fort" cam="main" /> (1080x1920). Optional stand-in figures at the marks to check scale.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { SETS } from "./sets";
import type { BuiltSet } from "./sets/types";

const Scene: React.FC<{ set: string; cam: string; dummies: boolean }> = ({ set, cam, dummies }) => {
  const { scene, camera, advance } = useThree(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const [h] = React.useState(() => delayRender("set " + set));
  const ref = React.useRef<BuiltSet | null>(null);
  React.useEffect(() => { const s = SETS[set](); ref.current = s; scene.add(s.group); if (s.fog) scene.fog = s.fog;
    s.group.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    if (dummies) for (const p of Object.values(s.marks)) { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.3, 4, 12), new THREE.MeshToonMaterial({ color: "#e0e0e0" })); d.position.set(p[0], p[1] + 0.87, p[2]); d.castShadow = true; scene.add(d); }
    setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 300); }, []);
  ref.current?.update(f / fps);
  const k = ref.current?.cams[cam] ?? ref.current?.cams.main;
  if (k) { const c = camera as THREE.PerspectiveCamera; c.position.set(...k.pos); c.lookAt(...k.look); c.fov = k.fov; c.near = 0.05; c.far = 1000; c.updateProjectionMatrix(); }
  return null;
};
export const SetView: React.FC<{ set?: string; cam?: string; dummies?: boolean }> = ({ set = "fort", cam = "main", dummies = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 34, position: [0, 2, 8], far: 1000 }} gl={{ antialias: true }} shadows><Scene set={set} cam={cam} dummies={dummies} /></ThreeCanvas>
  </AbsoluteFill>
);
