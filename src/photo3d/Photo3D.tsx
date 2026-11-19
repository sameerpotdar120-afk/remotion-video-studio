// 2D photo -> 3D scene: the photo is wrapped onto a dense mesh pushed forward by its depth map (scripts/depth.mjs),
// then a three.js camera dollies / orbits through it (parallax, real perspective). Props: photo, depth (files in public/), move.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

type Move = "push" | "orbit" | "crane";
const Scene: React.FC<{ photo: string; depth: string; move: Move; strength: number }> = ({ photo, depth, move, strength }) => {
  const f = useCurrentFrame(); const { durationInFrames } = useVideoConfig(); const { camera, advance } = useThree();
  const [handle] = React.useState(() => delayRender("photo3d textures"));
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { if (ready) { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); }); } }, [ready]);
  const tex = useMemo(() => {
    const L = new THREE.TextureLoader(); let n = 0; const done = () => { if (++n === 2) setReady(true); };
    const p = L.load(staticFile(photo), done); p.colorSpace = THREE.SRGBColorSpace; p.anisotropy = 8;
    const d = L.load(staticFile(depth), done);
    return { p, d };
  }, [photo, depth]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { tPhoto: { value: tex.p }, tDepth: { value: tex.d }, k: { value: strength } },
    vertexShader: `uniform sampler2D tDepth; uniform float k; varying vec2 vUv; void main(){ vUv = uv;
      float d = texture2D(tDepth, uv).r; vec3 p = position; p.z += (d - 0.5) * k;   // near pixels come forward
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform sampler2D tPhoto; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tPhoto, vUv);
      #include <colorspace_fragment>
    }`,
  }), [tex, strength]);
  const geo = useMemo(() => new THREE.PlaneGeometry(4, 4, 512, 512), []);
  const t = interpolate(f, [0, durationInFrames - 1], [0, 1], { easing: Easing.inOut(Easing.sin) });
  const cam = camera as THREE.PerspectiveCamera;
  if (move === "push") cam.position.set(Math.sin(t * Math.PI) * 0.15, 0.05, 6.2 - t * 1.9);
  if (move === "orbit") cam.position.set((t - 0.5) * 2.2, 0.15 + Math.sin(t * Math.PI) * 0.15, 5.4 - Math.sin(t * Math.PI) * 0.6);
  if (move === "crane") cam.position.set(0.1, 1.0 - t * 1.4, 5.8 - t * 1.0);
  cam.fov = 33; cam.updateProjectionMatrix(); cam.lookAt(0, 0, 0.3);
  return <mesh geometry={geo} material={mat} />;
};

export const Photo3D: React.FC<{ photo: string; depth: string; move?: Move; strength?: number }> = ({ photo, depth, move = "orbit", strength = 1.3 }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 6] }} gl={{ antialias: true }}>
        <Scene photo={photo} depth={depth} move={move} strength={strength} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
