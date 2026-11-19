// Mountain Cabin series: an AI-generated environment photo turned into a 3D scene (depth-displaced mesh), with drifting fog,
// floating dust, flickering lights, 2D reference-style characters standing inside it at the right depth, and a cinematic camera.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { drawPerson, PersonSpec, PersonPose } from "../engine/person";

export const WW = 4.5, HH = 8; // world size of the 9:16 photo plane
type V3 = [number, number, number];
export type Cam = { from: V3; to: V3; lookFrom?: V3; lookTo?: V3; fov?: number; fovTo?: number; ease?: "inout" | "out" | "in" | "linear";
  shake?: { t: number; amp: number; dur?: number }[]; sway?: number;
  via?: V3; lookVia?: V3;            // curved (arc / crane) paths: quadratic bezier through a mid control point
  roll?: [number, number];           // dutch angle in degrees, from -> to
  handheld?: number;                 // 0..1 nervous handheld shake (multi-frequency)
  whipIn?: number; whipOut?: number; // seconds of whip-pan into / out of the shot (direction +1 right / -1 left via whipDir)
  whipDir?: number; keys?: { t: number; pos: V3; look: V3; fov?: number }[] };  // keys: explicit keyframes (overrides from/to)
type Pose = Omit<PersonPose, "t">;
export type Actor = { spec: PersonSpec; pose?: Pose; poseAt?: (t: number) => Pose; uv?: [number, number]; pos?: V3; h: number; fadeIn?: number; fadeOut?: number;
  path?: { to: [number, number]; start: number; end: number }; tint?: string; flip?: boolean; res?: number; dz?: number; zuv?: [number, number] }; // zuv: where to read the depth (e.g. the far side of a table) when the feet are hidden behind it
export type Glow = { uv: [number, number]; size: number; color: string; flicker?: number; off?: number; on?: number; amt?: number; dz?: number };
export type Dust = { color: string; count: number; size: number; spread?: [number, number, number]; center?: V3; speed?: number; opacity?: number };
type DepthMap = { w: number; h: number; d: Uint8ClampedArray };

// sample the depth map on the CPU so characters stand on the surface at the right depth
const depthCache = new Map<string, Promise<DepthMap>>();
const loadDepth = (src: string) => {
  if (!depthCache.has(src)) depthCache.set(src, new Promise((res) => { const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = 270; c.height = 480; const g = c.getContext("2d")!; g.drawImage(im, 0, 0, 270, 480); res({ w: 270, h: 480, d: g.getImageData(0, 0, 270, 480).data }); }; im.src = src; }));
  return depthCache.get(src)!;
};
const sample = (D: DepthMap, u: number, v: number) => { const x = Math.min(D.w - 1, Math.max(0, Math.round(u * (D.w - 1)))), y = Math.min(D.h - 1, Math.max(0, Math.round(v * (D.h - 1)))); return D.d[(y * D.w + x) * 4] / 255; };
export const uvToWorld = (D: DepthMap, K: number, u: number, v: number, dz = 0): V3 => [(u - 0.5) * WW, (0.5 - v) * HH, (sample(D, u, v) - 0.5) * K + dz];

// seamless horizontal fog tile, faded top and bottom (no hard edges); one texture per layer so each can scroll on its own
const fogTexs: THREE.CanvasTexture[] = [];
const fogTex = (i: number) => { if (fogTexs[i]) return fogTexs[i]; const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d")!;
  let s = 1234 + i * 77; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 70; n++) { const x = rnd() * 512, y = 100 + rnd() * 60, r = 40 + rnd() * 70; for (const dx of [-512, 0, 512]) { const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, "rgba(255,255,255,0.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); } }
  g.globalCompositeOperation = "destination-in"; const m = g.createLinearGradient(0, 0, 0, 256); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(0.35, "rgba(0,0,0,1)"); m.addColorStop(0.65, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; fogTexs[i] = t; return t; };
const glowTex = (() => { let t: THREE.CanvasTexture | null = null; return () => { if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,0.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); return t; }; })();

const PersonCard: React.FC<{ a: Actor; D: DepthMap; K: number; t: number }> = ({ a, D, K, t }) => {
  const res = a.res ?? 1;
  const card = useMemo(() => { const c = document.createElement("canvas"); c.width = 768 * res; c.height = 1536 * res; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { c, g: c.getContext("2d")!, tex }; }, [res]);
  let u = a.uv?.[0] ?? 0.5, v = a.uv?.[1] ?? 0.5, moving = false;
  if (a.path && a.uv) { const k = Math.min(1, Math.max(0, (t - a.path.start) / (a.path.end - a.path.start))); u = a.uv[0] + (a.path.to[0] - a.uv[0]) * k; v = a.uv[1] + (a.path.to[1] - a.uv[1]) * k; moving = k > 0 && k < 1; }
  const pose = { ...(a.pose ?? {}), ...(a.poseAt ? a.poseAt(t) : {}) };
  card.g.setTransform(res, 0, 0, res, 0, 0);
  drawPerson(card.g, a.spec, { ...pose, walk: moving ? (pose.walk ?? 1) : pose.walk, t });
  card.tex.needsUpdate = true;
  const base: V3 = a.pos ?? (a.zuv ? [(u - 0.5) * WW, (0.5 - v) * HH, uvToWorld(D, K, a.zuv[0], a.zuv[1], 0.02 + (a.dz ?? 0))[2]] : uvToWorld(D, K, u, v, 0.02 + (a.dz ?? 0)));
  const op = Math.min(a.fadeIn !== undefined ? interpolate(t, [a.fadeIn, a.fadeIn + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
    a.fadeOut !== undefined ? interpolate(t, [a.fadeOut, a.fadeOut + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);
  if (op <= 0.001) return null;
  return (<>
    {a.pos || a.zuv ? null : <sprite position={[base[0], base[1] + 0.01, base[2] - 0.01]} scale={[a.h * 0.42, a.h * 0.07, 1]} renderOrder={1}><spriteMaterial map={glowTex()} color="#000" transparent opacity={0.65 * op} depthWrite={false} /></sprite>}
    <mesh position={[base[0], base[1] + a.h / 2, base[2]]} scale={[a.flip ? -1 : 1, 1, 1]} renderOrder={2}>
      <planeGeometry args={[a.h * 0.5, a.h]} />
      <meshBasicMaterial map={card.tex} color={a.tint ?? "#aab4cc"} transparent opacity={op} alphaTest={0.5} depthWrite toneMapped={false} />
    </mesh>
  </>);
};

// floating dust / embers / moths: real 3D points in front of the photo, so they parallax with the camera
const DustField: React.FC<{ d: Dust; t: number }> = ({ d, t }) => {
  const seeds = useMemo(() => { let s = 99; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: d.count }, () => [r(), r(), r(), r(), r()]); }, [d.count]);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const [sx, sy, sz] = d.spread ?? [4.5, 6, 3]; const [cx, cy, cz] = d.center ?? [0, 0, 1.2]; const sp = d.speed ?? 1;
  const arr = new Float32Array(d.count * 3);
  seeds.forEach(([a, b, c, e, f], i) => {
    const x = cx + (a - 0.5) * sx + Math.sin(t * 0.4 * sp + e * 20) * 0.12;
    const y = cy + ((((b + t * 0.025 * sp * (0.5 + f)) % 1) + 1) % 1 - 0.5) * sy;
    const z = cz + (c - 0.5) * sz + Math.cos(t * 0.3 * sp + f * 20) * 0.08;
    arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return <points geometry={geo} renderOrder={5}><pointsMaterial map={glowTex()} color={d.color} size={d.size} sizeAttenuation transparent opacity={d.opacity ?? 0.7} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
};

type InnerProps = { env: string; K: number; cam: Cam; actors: Actor[]; glows: Glow[]; fog: number; fogColor: string; dust: Dust[]; dur: number; blur: number; light?: (t: number) => number };
const Inner: React.FC<InnerProps> = ({ env, K, cam, actors, glows, fog, fogColor, dust, dur, blur, light }) => {
  const f = useCurrentFrame(); const { fps, width, height } = useVideoConfig(); const t = f / fps;
  const { camera, advance } = useThree();
  const [handle] = React.useState(() => delayRender("scene3d " + env, { timeoutInMilliseconds: 120000 }));
  const [D, setD] = React.useState<DepthMap | null>(null);
  const tex = useMemo(() => { const L = new THREE.TextureLoader(); const p = L.load(staticFile(`ep4/env/${env}.jpg`)); p.colorSpace = THREE.SRGBColorSpace; p.anisotropy = 8; p.generateMipmaps = true; p.minFilter = THREE.LinearMipmapLinearFilter; const d = L.load(staticFile(`ep4/env/${env}_depth.png`)); return { p, d }; }, [env]);
  React.useEffect(() => { Promise.all([loadDepth(staticFile(`ep4/env/${env}_depth.png`)), new Promise((r) => { const i = new Image(); i.onload = r; i.src = staticFile(`ep4/env/${env}.jpg`); })]).then(([dd]) => { setD(dd as DepthMap); }); }, [env]);
  React.useEffect(() => { if (D) { setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); }); }, 300); } }, [D]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { tPhoto: { value: tex.p }, tDepth: { value: tex.d }, k: { value: K }, uBlur: { value: blur }, uLight: { value: 1 }, uPx: { value: new THREE.Vector2(1 / 2160, 1 / 3840) } },
    vertexShader: `uniform sampler2D tDepth; uniform float k; varying vec2 vUv; void main(){ vUv = uv; float d = texture2D(tDepth, uv).r; vec3 p = position; p.z += (d - 0.5) * k; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform sampler2D tPhoto; uniform float uBlur; uniform float uLight; uniform vec2 uPx; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tPhoto, vUv);
        if (uBlur > 0.0) { vec4 acc = c; float n = 1.0; for (int i = 0; i < 16; i++) { float a = float(i) * 2.39996; float r = sqrt(float(i) + 0.5) / 4.0 * uBlur; acc += texture2D(tPhoto, vUv + vec2(cos(a), sin(a)) * r * uPx * 9.0); n += 1.0; } c = acc / n; }
        gl_FragColor = vec4(c.rgb * uLight, 1.0);\n #include <colorspace_fragment>\n }`,
  }), [tex, K, blur]);
  mat.uniforms.uLight.value = light ? light(t) : 1;
  const geo = useMemo(() => new THREE.PlaneGeometry(WW, HH, 360, 640), []);
  const easing = cam.ease === "out" ? Easing.out(Easing.cubic) : cam.ease === "in" ? Easing.in(Easing.cubic) : cam.ease === "linear" ? (x: number) => x : Easing.inOut(Easing.sin);
  const k = interpolate(t, [0, dur], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bez = (a: V3, m: V3 | undefined, b: V3, u: number): V3 => m ? a.map((x, i) => (1 - u) ** 2 * x + 2 * (1 - u) * u * m[i] + u * u * b[i]) as V3 : a.map((x, i) => x + (b[i] - x) * u) as V3;
  let p: V3, look: V3, fov: number;
  if (cam.keys && cam.keys.length > 1) {
    const ks = cam.keys; let j = 0; while (j < ks.length - 2 && t > ks[j + 1].t) j++;
    const a = ks[j], b = ks[j + 1]; const u = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
    p = bez(a.pos, undefined, b.pos, u); look = bez(a.look, undefined, b.look, u); fov = (a.fov ?? cam.fov ?? 30) + ((b.fov ?? a.fov ?? cam.fov ?? 30) - (a.fov ?? cam.fov ?? 30)) * u;
  } else {
    p = bez(cam.from, cam.via, cam.to, k); look = bez(cam.lookFrom ?? [0, 0, 0], cam.lookVia, cam.lookTo ?? cam.lookFrom ?? [0, 0, 0], k);
    fov = (cam.fov ?? 30) + ((cam.fovTo ?? cam.fov ?? 30) - (cam.fov ?? 30)) * k;
  }
  const pc = camera as THREE.PerspectiveCamera; const sw = cam.sway ?? 1, hh = cam.handheld ?? 0;
  let shx = 0, shy = 0;
  for (const s of cam.shake ?? []) { const dt = t - s.t, d = s.dur ?? 0.35; if (dt >= 0 && dt < d) { const e = s.amp * (1 - dt / d) ** 2; shx += Math.sin(dt * 90) * e; shy += Math.cos(dt * 77) * e; } }
  shx += hh * 0.05 * (Math.sin(t * 2.1) * 0.6 + Math.sin(t * 5.3 + 1) * 0.3 + Math.sin(t * 11.7 + 2) * 0.1);
  shy += hh * 0.04 * (Math.sin(t * 1.7 + 3) * 0.6 + Math.sin(t * 4.9) * 0.3 + Math.sin(t * 13.1 + 1) * 0.1);
  // whip pans: the look target flies sideways at the very start / end of the shot
  const wd = cam.whipDir ?? 1; let whip = 0;
  if (cam.whipIn && t < cam.whipIn) whip = -wd * (1 - t / cam.whipIn) ** 2 * 2.2;
  if (cam.whipOut && t > dur - cam.whipOut) whip = wd * ((t - (dur - cam.whipOut)) / cam.whipOut) ** 2 * 2.2;
  pc.position.set(p[0] + Math.sin(t * 0.5) * 0.02 * sw + shx, p[1] + Math.sin(t * 0.7) * 0.015 * sw + shy, p[2]);
  pc.fov = fov; pc.aspect = width / height; pc.near = 0.05; pc.far = 100; pc.updateProjectionMatrix();
  pc.up.set(0, 1, 0); pc.lookAt(look[0] + shx * 0.5 + whip, look[1] + shy * 0.5, look[2]);
  const roll = cam.roll ? cam.roll[0] + (cam.roll[1] - cam.roll[0]) * k : 0; if (roll) pc.rotateZ((roll * Math.PI) / 180);
  return (
    <>
      <mesh geometry={geo} material={mat} />
      {D ? actors.map((a, i) => <PersonCard key={i} a={a} D={D} K={K} t={t} />) : null}
      {D ? glows.map((g, i) => {
        const z = (sample(D, g.uv[0], g.uv[1]) - 0.5) * K + 0.05 + (g.dz ?? 0);
        const on = g.off !== undefined && t > g.off ? Math.max(0, 1 - (t - g.off) * 6) * (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1;
        const onIn = g.on !== undefined ? interpolate(t, [g.on, g.on + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
        const fl = 1 + (g.flicker ?? 0) * (Math.sin(t * 13 + i) * 0.5 + Math.sin(t * 31 + i * 2) * 0.5);
        const dark = g.off !== undefined && t > g.off ? Math.min(1, (t - g.off) * 4) * (1 - on) : 0; // the photo's own lamp dies too
        const pos: V3 = [(g.uv[0] - 0.5) * WW, (0.5 - g.uv[1]) * HH, z];
        return <React.Fragment key={i}>
          {dark > 0 ? <sprite position={[pos[0], pos[1], z - 0.01]} scale={[g.size * 0.9, g.size * 0.9, 1]} renderOrder={3}><spriteMaterial map={glowTex()} color="#05070c" transparent opacity={0.92 * dark} depthWrite={false} /></sprite> : null}
          <sprite position={pos} scale={[g.size, g.size, 1]} renderOrder={3}><spriteMaterial map={glowTex()} color={g.color} transparent opacity={(g.amt ?? 0.55) * fl * on * onIn} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
        </React.Fragment>;
      }) : null}
      {dust.map((d, i) => <DustField key={i} d={d} t={t} />)}
      {fog > 0 ? [0, 1, 2].map((i) => {
        const tx = fogTex(i); tx.offset.x = t * (0.012 + i * 0.008) + i * 0.3; return <mesh key={i} position={[0, -1.4 + i * 0.75, 0.4 + i * 0.45]} renderOrder={4}><planeGeometry args={[16, 2.6]} /><meshBasicMaterial map={tx} transparent opacity={fog * (0.55 - i * 0.12)} depthWrite={false} color={fogColor} /></mesh>;
      }) : null}
    </>
  );
};

// final look: vignette, film grain (CSS overlays, cheap) + optional overlay children (titles)
export const Scene3D: React.FC<{ env: string; K?: number; cam: Cam; actors?: Actor[]; glows?: Glow[]; fog?: number; fogColor?: string; dust?: Dust[]; dur?: number; blur?: number; light?: (t: number) => number; vignette?: number; children?: React.ReactNode }> =
  ({ env, K = 1.6, cam, actors = [], glows = [], fog = 0.6, fogColor = "#a8b8d0", dust = [], dur, blur = 0, light, vignette = 0.55, children }) => {
  const { width, height, durationInFrames, fps } = useVideoConfig(); const f = useCurrentFrame();
  const D = dur ?? durationInFrames / fps, t = f / fps;
  const wb = (cam.whipIn && t < cam.whipIn ? (1 - t / cam.whipIn) ** 2 : 0) + (cam.whipOut && t > D - cam.whipOut ? ((t - (D - cam.whipOut)) / cam.whipOut) ** 2 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ filter: wb > 0.02 ? `blur(${(wb * 26).toFixed(1)}px)` : undefined }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov ?? 30, near: 0.05, far: 100, position: cam.from }} gl={{ antialias: true }}>
        <Inner env={env} K={K} cam={cam} actors={actors} glows={glows} fog={fog} fogColor={fogColor} dust={dust} dur={D} blur={blur} light={light} />
      </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' seed='${f % 7}'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`, mixBlendMode: "overlay" }} />
      {children}
    </AbsoluteFill>
  );
};
