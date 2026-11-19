// Mountain Cabin series: an AI-generated environment photo turned into a 3D scene (depth-displaced mesh), with drifting fog,
// flickering lights, 2D reference-style characters standing inside it at the right depth, and a slow cinematic camera.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { drawPerson, PersonSpec, PersonPose } from "../engine/person";

export const WW = 4.5, HH = 8; // world size of the 9:16 photo plane
export type Cam = { from: [number, number, number]; to: [number, number, number]; lookFrom?: [number, number, number]; lookTo?: [number, number, number]; fov?: number };
export type Actor = { spec: PersonSpec; pose?: Omit<PersonPose, "t">; uv: [number, number]; h: number; fadeIn?: number; fadeOut?: number; path?: { to: [number, number]; start: number; end: number }; tint?: string; flip?: boolean };
export type Glow = { uv: [number, number]; size: number; color: string; flicker?: number; off?: number };

// sample the depth map on the CPU so characters stand on the surface at the right depth
const depthCache = new Map<string, Promise<{ w: number; h: number; d: Uint8ClampedArray }>>();
const loadDepth = (src: string) => {
  if (!depthCache.has(src)) depthCache.set(src, new Promise((res) => { const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = 270; c.height = 480; const g = c.getContext("2d")!; g.drawImage(im, 0, 0, 270, 480); res({ w: 270, h: 480, d: g.getImageData(0, 0, 270, 480).data }); }; im.src = src; }));
  return depthCache.get(src)!;
};
const sample = (D: { w: number; h: number; d: Uint8ClampedArray }, u: number, v: number) => { const x = Math.min(D.w - 1, Math.max(0, Math.round(u * (D.w - 1)))), y = Math.min(D.h - 1, Math.max(0, Math.round(v * (D.h - 1)))); return D.d[(y * D.w + x) * 4] / 255; };

// seamless horizontal fog tile, faded top and bottom (no hard edges); one texture per layer so each can scroll on its own
const fogTexs: THREE.CanvasTexture[] = [];
const fogTex = (i: number) => { if (fogTexs[i]) return fogTexs[i]; const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d")!;
  let s = 1234 + i * 77; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 70; n++) { const x = rnd() * 512, y = 100 + rnd() * 60, r = 40 + rnd() * 70; for (const dx of [-512, 0, 512]) { const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, "rgba(255,255,255,0.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); } }
  g.globalCompositeOperation = "destination-in"; const m = g.createLinearGradient(0, 0, 0, 256); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(0.35, "rgba(0,0,0,1)"); m.addColorStop(0.65, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; fogTexs[i] = t; return t; };
const glowTex = (() => { let t: THREE.CanvasTexture | null = null; return () => { if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,0.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); return t; }; })();

const PersonCard: React.FC<{ a: Actor; D: { w: number; h: number; d: Uint8ClampedArray }; K: number; t: number }> = ({ a, D, K, t }) => {
  const card = useMemo(() => { const c = document.createElement("canvas"); c.width = 768; c.height = 1536; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { c, g: c.getContext("2d")!, tex }; }, []);
  let u = a.uv[0], v = a.uv[1], moving = false;
  if (a.path) { const k = Math.min(1, Math.max(0, (t - a.path.start) / (a.path.end - a.path.start))); u = a.uv[0] + (a.path.to[0] - a.uv[0]) * k; v = a.uv[1] + (a.path.to[1] - a.uv[1]) * k; moving = k > 0 && k < 1; }
  drawPerson(card.g, a.spec, { ...(a.pose ?? {}), walk: moving ? (a.pose?.walk ?? 1) : a.pose?.walk, t });
  card.tex.needsUpdate = true;
  const z = (sample(D, u, v) - 0.5) * K + 0.02;
  const op = Math.min(a.fadeIn !== undefined ? interpolate(t, [a.fadeIn, a.fadeIn + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
    a.fadeOut !== undefined ? interpolate(t, [a.fadeOut, a.fadeOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);
  return (<>
    <sprite position={[(u - 0.5) * WW, (0.5 - v) * HH + 0.01, z - 0.01]} scale={[a.h * 0.42, a.h * 0.07, 1]} renderOrder={1}><spriteMaterial map={glowTex()} color="#000" transparent opacity={0.65 * op} depthWrite={false} /></sprite>
    <mesh position={[(u - 0.5) * WW, (0.5 - v) * HH + a.h / 2, z]} scale={[a.flip ? -1 : 1, 1, 1]} renderOrder={2}>
      <planeGeometry args={[a.h * 0.5, a.h]} />
      <meshBasicMaterial map={card.tex} color={a.tint ?? "#aab4cc"} transparent opacity={op} alphaTest={0.5} depthWrite toneMapped={false} />
    </mesh>
  </>);
};

const Inner: React.FC<{ env: string; K: number; cam: Cam; actors: Actor[]; glows: Glow[]; fog: number }> = ({ env, K, cam, actors, glows, fog }) => {
  const f = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig(); const t = f / fps;
  const { camera, advance } = useThree();
  const [handle] = React.useState(() => delayRender("scene3d " + env, { timeoutInMilliseconds: 120000 }));
  const [D, setD] = React.useState<{ w: number; h: number; d: Uint8ClampedArray } | null>(null);
  const tex = useMemo(() => { const L = new THREE.TextureLoader(); const p = L.load(staticFile(`ep4/env/${env}.jpg`)); p.colorSpace = THREE.SRGBColorSpace; p.anisotropy = 8; const d = L.load(staticFile(`ep4/env/${env}_depth.png`)); return { p, d }; }, [env]);
  const loaded = useRef(0);
  React.useEffect(() => { Promise.all([loadDepth(staticFile(`ep4/env/${env}_depth.png`)), new Promise((r) => { const i = new Image(); i.onload = r; i.src = staticFile(`ep4/env/${env}.jpg`); })]).then(([dd]) => { setD(dd as never); }); }, [env]);
  React.useEffect(() => { if (D) { setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); }); }, 300); } }, [D]);
  void loaded;
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { tPhoto: { value: tex.p }, tDepth: { value: tex.d }, k: { value: K } },
    vertexShader: `uniform sampler2D tDepth; uniform float k; varying vec2 vUv; void main(){ vUv = uv; float d = texture2D(tDepth, uv).r; vec3 p = position; p.z += (d - 0.5) * k; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform sampler2D tPhoto; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tPhoto, vUv);\n #include <colorspace_fragment>\n }`,
  }), [tex, K]);
  const geo = useMemo(() => new THREE.PlaneGeometry(WW, HH, 400, 712), []);
  const k = interpolate(f, [0, durationInFrames - 1], [0, 1], { easing: Easing.inOut(Easing.sin) });
  const L3 = (a: number[], b: number[]) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
  const pc = camera as THREE.PerspectiveCamera;
  const p = L3(cam.from, cam.to); pc.position.set(p[0] + Math.sin(t * 0.5) * 0.02, p[1] + Math.sin(t * 0.7) * 0.015, p[2]);
  const look = L3(cam.lookFrom ?? [0, 0, 0], cam.lookTo ?? cam.lookFrom ?? [0, 0, 0]);
  pc.fov = cam.fov ?? 30; pc.near = 0.1; pc.far = 100; pc.updateProjectionMatrix(); pc.lookAt(look[0], look[1], look[2]);
  return (
    <>
      <mesh geometry={geo} material={mat} />
      {D ? actors.map((a, i) => <PersonCard key={i} a={a} D={D} K={K} t={t} />) : null}
      {D ? glows.map((g, i) => {
        const z = (sample(D, g.uv[0], g.uv[1]) - 0.5) * K + 0.05;
        const on = g.off !== undefined && t > g.off ? Math.max(0, 1 - (t - g.off) * 6) * (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1;
        const fl = 1 + (g.flicker ?? 0) * (Math.sin(t * 13 + i) * 0.5 + Math.sin(t * 31 + i * 2) * 0.5);
        const dark = g.off !== undefined && t > g.off ? Math.min(1, (t - g.off) * 4) * (1 - on) : 0; // the photo's own lamp dies too
        return <React.Fragment key={i}>
          {dark > 0 ? <sprite position={[(g.uv[0] - 0.5) * WW, (0.5 - g.uv[1]) * HH, z - 0.01]} scale={[g.size * 0.9, g.size * 0.9, 1]} renderOrder={3}><spriteMaterial map={glowTex()} color="#05070c" transparent opacity={0.92 * dark} depthWrite={false} /></sprite> : null}
          <sprite position={[(g.uv[0] - 0.5) * WW, (0.5 - g.uv[1]) * HH, z]} scale={[g.size, g.size, 1]} renderOrder={3}><spriteMaterial map={glowTex()} color={g.color} transparent opacity={0.55 * fl * on} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
        </React.Fragment>;
      }) : null}
      {fog > 0 ? [0, 1, 2].map((i) => {
        const tx = fogTex(i); tx.offset.x = t * (0.012 + i * 0.008) + i * 0.3; return <mesh key={i} position={[0, -1.4 + i * 0.75, 0.4 + i * 0.45]} renderOrder={4}><planeGeometry args={[16, 2.6]} /><meshBasicMaterial map={tx} transparent opacity={fog * (0.55 - i * 0.12)} depthWrite={false} color="#a8b8d0" /></mesh>;
      }) : null}
    </>
  );
};

// final look: slight grade, vignette, film grain (CSS overlays, cheap)
export const Scene3D: React.FC<{ env: string; K?: number; cam: Cam; actors?: Actor[]; glows?: Glow[]; fog?: number }> = ({ env, K = 1.6, cam, actors = [], glows = [], fog = 0.6 }) => {
  const { width, height } = useVideoConfig(); const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov ?? 30, near: 0.1, far: 100, position: cam.from }} gl={{ antialias: true }}>
        <Inner env={env} K={K} cam={cam} actors={actors} glows={glows} fog={fog} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' seed='${f % 7}'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`, mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};
