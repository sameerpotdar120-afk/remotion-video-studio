// Anime character look-dev: loads a VRM (anime 3D standard), renders it with its toon (MToon) shading from several angles.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const cache = new Map<string, Promise<VRM>>();
export const loadVrm = (url: string) => {
  if (!cache.has(url)) cache.set(url, new Promise((res, rej) => {
    const l = new GLTFLoader(); l.register((p) => new VRMLoaderPlugin(p));
    l.load(url, (g) => { const v = g.userData.vrm as VRM; VRMUtils.rotateVRM0(v); res(v); }, undefined, rej);
  }));
  return cache.get(url)!;
};

export const relaxArms = (vrm: VRM, a = 1.2) => {
  const hb = vrm.humanoid;
  for (const side of ["left", "right"] as const) {
    const up = hb.getNormalizedBoneNode(`${side}UpperArm`)!, lo = hb.getNormalizedBoneNode(`${side}LowerArm`)!, hand = hb.getRawBoneNode(`${side}Hand`)!;
    let best = 0, bestY = Infinity;
    for (const s of [1, -1]) { up.rotation.z = s * a; vrm.update(0); vrm.scene.updateMatrixWorld(true); const y = hand.getWorldPosition(new THREE.Vector3()).y; if (y < bestY) { bestY = y; best = s; } }
    up.rotation.z = best * a; lo.rotation.z = best * 0.15;
  }
  vrm.update(0);
};
// frame the camera on a bone (head for close-ups, hips for full body)
export const boneY = (vrm: VRM, bone: "head" | "hips") => vrm.humanoid.getRawBoneNode(bone)!.getWorldPosition(new THREE.Vector3()).y;

const Scene: React.FC<{ file: string; yaw: number; dist: number; y: number }> = ({ file, yaw, dist, y }) => {
  const { scene, camera, advance } = useThree();
  const [h] = React.useState(() => delayRender("vrm " + file, { timeoutInMilliseconds: 120000 }));
  const f = useCurrentFrame();
  React.useEffect(() => {
    loadVrm(staticFile(file)).then((vrm) => {
      const root = vrm.scene;
      // relaxed arms instead of T-pose: pick the rotation direction that actually lowers each hand (VRM 0.x and 1.0 differ)
      relaxArms(vrm);
      scene.add(root);
      const meshes: string[] = []; root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { const m = o as THREE.Mesh; meshes.push(o.name + ":" + (Array.isArray(m.material) ? m.material.map((x) => x.name).join("|") : m.material.name)); } });
      console.log("VRM meshes", JSON.stringify(meshes));
      setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 400);
    }).catch((e) => { console.error(e); continueRender(h); });
  }, []);
  const [autoY, setAutoY] = React.useState<number | null>(null);
  React.useEffect(() => { loadVrm(staticFile(file)).then((v) => setAutoY(y < 0 ? boneY(v, "head") + 0.06 : boneY(v, "hips") * 0.95)); }, []);
  y = y === 0 || y < 0 ? (autoY ?? 1) : y;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(Math.sin(yaw) * dist, y, Math.cos(yaw) * dist); c.lookAt(0, y, 0); c.fov = 25; c.updateProjectionMatrix();
  void f;
  return (<>
    <ambientLight intensity={0.6} />
    <directionalLight position={[1.5, 3, 2]} intensity={2.2} />
  </>);
};

export const VrmView: React.FC<{ file?: string; yaw?: number; dist?: number; y?: number }> = ({ file = "anime/base_pixiv.vrm", yaw = 0, dist = 3.2, y = 0.9 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#cfd8e6, #9aa8bd)" }}>
    <ThreeCanvas width={720} height={1280} camera={{ fov: 25, position: [0, 1, 3] }} gl={{ antialias: true }}>
      <Scene file={file} yaw={yaw} dist={dist} y={y} />
    </ThreeCanvas>
  </AbsoluteFill>
);
