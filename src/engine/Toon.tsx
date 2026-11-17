// Drawn characters placed in the 3D world: a camera-facing card, lit by the world's lights, casting a real shadow.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { drawToon, drawHorse, ToonSpec, ToonPose } from "./draw";
import { LAYER_CHAR, V3 } from "./Stage";

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _yaw = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);
type Path = { from: V3; to: V3; start?: number; end?: number }; // walk path in seconds of the shot

const useCard = (w: number, h: number) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    return { c, g: c.getContext("2d")!, tex, depth };
  }, [w, h]);

export const Toon: React.FC<{
  spec: ToonSpec; pose?: Omit<ToonPose, "t">; pos: V3; h?: number; path?: Path; flip?: boolean; seed?: number; yaw?: number; light?: number;
}> = ({ spec, pose = {}, pos, h = 1.75, path, flip, seed = 0, yaw, light = 0.32 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const card = useCard(768, 1024);
  const grp = useRef<THREE.Group>(null);
  let p = pos, walking = pose.walk ?? 0;
  if (path) {
    const s = path.start ?? 0, e = path.end ?? s + 3;
    const k = Math.min(1, Math.max(0, (t - s) / (e - s)));
    p = [path.from[0] + (path.to[0] - path.from[0]) * k, path.from[1] + (path.to[1] - path.from[1]) * k, path.from[2] + (path.to[2] - path.from[2]) * k];
    walking = k > 0 && k < 1 ? walking || 1 : 0;
  }
  drawToon(card.g, spec, { ...pose, walk: walking, t: t + seed * 1.37 });
  card.tex.needsUpdate = true;
  useFrame(({ camera }) => {
    if (!grp.current) return;
    if (yaw !== undefined) { grp.current.rotation.y = yaw; return; }
    // face the camera in WORLD space, also when the card rides inside a moving / rotated parent (a car seat)
    const wp = grp.current.getWorldPosition(_v);
    _yaw.setFromAxisAngle(_up, Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z));
    const pq = grp.current.parent ? grp.current.parent.getWorldQuaternion(_q).invert() : _q.identity();
    grp.current.quaternion.copy(pq.multiply(_yaw));
  });
  const W = h * 0.75, feet = (24 / 1024) * h * 1.0;
  return (
    <group ref={grp} position={[p[0], p[1] - feet, p[2]]}>
      <mesh layers={LAYER_CHAR} position={[0, h / 2, 0]} scale={[flip ? -1 : 1, 1, 1]} castShadow customDepthMaterial={card.depth}>
        <planeGeometry args={[W, h]} />
        <meshStandardMaterial map={card.tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={1} metalness={0} emissive="#ffffff" emissiveMap={card.tex} emissiveIntensity={light} />
      </mesh>
    </group>
  );
};

// Side-view horse card, fixed in the world (faces +x unless flipped)
export const Horse: React.FC<{ pos: V3; rotY?: number; size?: number; walk?: number; color?: string; blanket?: string; flip?: boolean }> = ({ pos, rotY = 0, size = 2.3, walk = 0, color, blanket, flip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = useCard(1024, 1024);
  drawHorse(card.g, frame / fps, walk, color, blanket);
  card.tex.needsUpdate = true;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh layers={LAYER_CHAR} position={[0, size / 2 - size * 0.012, 0]} scale={[flip ? -1 : 1, 1, 1]} castShadow customDepthMaterial={card.depth}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={card.tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={1} emissive="#ffffff" emissiveMap={card.tex} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};
