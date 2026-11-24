// Environment look-dev: the Hale homestead from the camera angles scene 1 needs.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { buildFarm, Farm, SUN_DIR } from "./farm";

export const FARM_CAMS: Record<string, { pos: [number, number, number]; look: [number, number, number]; fov: number }> = {
  establish: { pos: [26, 9, 38], look: [0, 2, 0], fov: 34 },
  gallop: { pos: [0.4, 1.3, 30], look: [0.6, 2.0, 56], fov: 34 },     // shot A: in front of the riders, looking back through the gate down the track
  ots: { pos: [1.0, 2.5, 34], look: [0, 2.1, 4], fov: 30 },           // shot C: behind the leader's gun, looking at the house (sun behind the roof)
  victim: { pos: [0.3, 1.1, 19.5], look: [0, 2.0, 6], fov: 30 },        // shot D: the father ~3 m in front of the porch
};
// anime glow: bloom on the sun, sky rim light, windows + lantern
export const Bloom: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => {
  const { gl, scene, camera, size } = useThree();
  const comp = React.useMemo(() => { const c = new EffectComposer(gl); c.addPass(new RenderPass(scene, camera)); c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), strength, 0.65, 0.82)); c.addPass(new OutputPass()); return c; }, [gl, scene, camera, size.width, size.height, strength]);
  useFrame(() => { comp.render(); }, 1);
  return null;
};
const Scene: React.FC<{ cam: string }> = ({ cam }) => {
  const { scene, camera, advance } = useThree(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const [h] = React.useState(() => delayRender("farm"));
  const farm = React.useRef<Farm | null>(null);
  React.useEffect(() => { const fm = buildFarm(); farm.current = fm; scene.add(fm.group); scene.fog = fm.group.userData.fog as THREE.Fog;
    setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 300); }, []);
  farm.current?.update(f / fps);
  const c = camera as THREE.PerspectiveCamera; const k = FARM_CAMS[cam]; c.position.set(...k.pos); c.lookAt(...k.look); c.fov = k.fov; c.far = 1000; c.updateProjectionMatrix();
  const sun = SUN_DIR.clone().multiplyScalar(70);
  return (<><hemisphereLight args={["#c4bde6", "#6e5a70", 0.85]} /><directionalLight position={[sun.x, sun.y, sun.z]} intensity={2.6} color="#ffc28a" castShadow shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={45} shadow-camera-bottom={-45} shadow-camera-near={1} shadow-camera-far={140} shadow-bias={-0.0004} /><directionalLight position={[10, 6, 40]} intensity={0.45} color="#9fb0ff" /></>);
};
export const FarmView: React.FC<{ cam?: string }> = ({ cam = "establish" }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 2, 20], far: 1000 }} gl={{ antialias: true }} shadows><Scene cam={cam} /></ThreeCanvas>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 42%, rgba(255,210,170,0) 55%, rgba(60,30,70,0.35) 100%)" }} />
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(rgba(255,170,120,0.10), rgba(120,90,190,0.10))", mixBlendMode: "soft-light" }} />
  </AbsoluteFill>
);
