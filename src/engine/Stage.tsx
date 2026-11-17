// One shot = one Stage: a three.js world rendered by Remotion, with the look that makes it premium:
//  - ink lines on every edge of the 3D world (normal + depth edge pass; characters keep their own drawn lines)
//  - a soft background (depth of field focused on the subject)
//  - warm light / cool purple shadows, filmic tone mapping, vignette, fine grain
//  - a camera that glides between two key poses (never snaps)
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export type V3 = [number, number, number];
export type CamKeys = { from: V3; to: V3; lookFrom: V3; lookTo?: V3; fov?: number; fovTo?: number; ease?: "inout" | "out" | "linear"; sway?: number };
export type Look = {
  sky?: THREE.Texture | string; fog?: string; fogNear?: number; fogFar?: number;
  sun?: { pos: V3; color: string; intensity: number; shadow?: number };
  hemi?: { sky: string; ground: string; intensity: number };
  ambient?: number; exposure?: number; focus?: number | "auto"; aperture?: number; ink?: number;
  warm?: string; cool?: string; vignette?: number; saturation?: number;
};

export const LAYER_CHAR = 1; // drawn characters: no edge pass
export const LAYER_FX = 2; // sky, snow, glows: no edge pass

const SS = 1.5; // supersampling for clean lines

const fsVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const inkFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor, tDepth, tNormal, tWDepth;
uniform vec2 texel; uniform float near, far, inkW, inkK;
float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
void main(){
  vec4 col = texture2D(tColor, vUv);
  float dm = lin(texture2D(tDepth, vUv).r);
  float dw = lin(texture2D(tWDepth, vUv).r);
  vec3 nc = texture2D(tNormal, vUv).rgb;
  float e = 0.0;
  vec2 o = texel * inkW * mix(1.0, 0.55, smoothstep(6.0, 40.0, dw));
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    vec2 uv2 = vUv + vec2(cos(a), sin(a)) * o;
    vec3 n2 = texture2D(tNormal, uv2).rgb;
    float d2 = lin(texture2D(tWDepth, uv2).r);
    e = max(e, smoothstep(0.12, 0.3, length(n2 - nc)));
    e = max(e, smoothstep(0.025, 0.07, abs(d2 - dw) / max(dw, 0.001)));
  }
  float visible = 1.0 - smoothstep(0.02, 0.06, (dw - dm) / max(dw, 0.001)); // a character is in front -> no world line
  float fade = 1.0 - smoothstep(25.0, 90.0, dw);
  vec3 inkc = vec3(0.07, 0.05, 0.07);
  gl_FragColor = vec4(mix(col.rgb, inkc, e * visible * fade * inkK), 1.0);
}`;

const finalFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tInk, tDepth;
uniform vec2 texel; uniform float near, far, focus, aperture, exposure, vignette, sat, time;
uniform vec3 warm, cool;
float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float coc(vec2 uv){ float d = lin(texture2D(tDepth, uv).r); return clamp(aperture * abs(d - focus) / max(d, 0.1), 0.0, 1.0); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }
void main(){
  float c0 = coc(vUv);
  vec3 acc = texture2D(tInk, vUv).rgb; float wsum = 1.0;
  float maxR = 14.0;
  for (int i = 1; i < 32; i++) {
    float fi = float(i);
    float r = sqrt(fi / 32.0) * maxR;
    float a = fi * 2.39996;
    vec2 uv2 = vUv + vec2(cos(a), sin(a)) * r * texel;
    float c2 = coc(uv2);
    float w = smoothstep(r - 1.5, r + 0.5, max(c2, c0 * 0.6) * maxR + 0.75);
    acc += texture2D(tInk, uv2).rgb * w; wsum += w;
  }
  vec3 col = acc / wsum;
  col = aces(col * exposure);
  col = pow(col, vec3(1.0 / 2.2));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, sat);
  col += cool * (1.0 - smoothstep(0.0, 0.5, l)) * 0.10 + warm * smoothstep(0.45, 1.0, l) * 0.07;
  vec2 q = vUv - 0.5; col *= 1.0 - vignette * dot(q, q) * 1.6;
  col += (hash(vUv * 1000.0) - 0.5) * 0.025;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function Pipeline({ look, focusOverride }: { look: Look; focusOverride?: number }) {
  const { gl, scene, camera, size } = useThree();
  const frame = useCurrentFrame();
  const P = useMemo(() => {
    const W = Math.round(size.width * SS), H = Math.round(size.height * SS);
    const mk = (type: THREE.TextureDataType) => {
      const rt = new THREE.WebGLRenderTarget(W, H, { type, samples: 0 });
      rt.depthTexture = new THREE.DepthTexture(W, H);
      rt.depthTexture.type = THREE.UnsignedIntType;
      return rt;
    };
    const main = mk(THREE.HalfFloatType), world = mk(THREE.UnsignedByteType);
    const inkRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
    const normalMat = new THREE.MeshNormalMaterial();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    const qScene = new THREE.Scene(); qScene.add(quad);
    const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const inkM = new THREE.ShaderMaterial({ vertexShader: fsVert, fragmentShader: inkFrag, depthTest: false, depthWrite: false,
      uniforms: { tColor: { value: main.texture }, tDepth: { value: main.depthTexture }, tNormal: { value: world.texture }, tWDepth: { value: world.depthTexture },
        texel: { value: new THREE.Vector2(1 / W, 1 / H) }, near: { value: 0.1 }, far: { value: 400 }, inkW: { value: 3.0 * SS * (Math.min(size.width, size.height) / 1080) }, inkK: { value: 1 } } });
    const finM = new THREE.ShaderMaterial({ vertexShader: fsVert, fragmentShader: finalFrag, depthTest: false, depthWrite: false,
      uniforms: { tInk: { value: inkRT.texture }, tDepth: { value: main.depthTexture }, texel: { value: new THREE.Vector2(1 / W, 1 / H) },
        near: { value: 0.1 }, far: { value: 400 }, focus: { value: 6 }, aperture: { value: 0.35 }, exposure: { value: 1 }, vignette: { value: 0.5 }, sat: { value: 1.12 }, time: { value: 0 },
        warm: { value: new THREE.Color("#ffb070") }, cool: { value: new THREE.Color("#5a4fd0") } } });
    return { main, world, inkRT, normalMat, quad, qScene, qCam, inkM, finM };
  }, [size.width, size.height]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const u = P.inkM.uniforms, f = P.finM.uniforms;
    u.near.value = f.near.value = cam.near; u.far.value = f.far.value = cam.far;
    u.inkK.value = look.ink ?? 1;
    f.focus.value = focusOverride ?? (typeof look.focus === "number" ? look.focus : 6);
    f.aperture.value = look.aperture ?? 0.35;
    f.exposure.value = look.exposure ?? 1;
    f.vignette.value = look.vignette ?? 0.5;
    f.sat.value = look.saturation ?? 1.12;
    f.time.value = frame * 0.37;
    (f.warm.value as THREE.Color).set(look.warm ?? "#ffb070");
    (f.cool.value as THREE.Color).set(look.cool ?? "#5a4fd0");
    // 1. full scene
    cam.layers.enableAll();
    gl.setRenderTarget(P.main); gl.clear(); gl.render(scene, cam);
    // 2. world only, normals (for ink)
    cam.layers.set(0);
    const bg = scene.background; scene.background = null;
    scene.overrideMaterial = P.normalMat;
    gl.setRenderTarget(P.world); gl.setClearColor(0x000000, 1); gl.clear(); gl.render(scene, cam);
    scene.overrideMaterial = null; scene.background = bg; cam.layers.enableAll();
    // 3. ink, 4. depth of field + grade to the screen
    P.quad.material = P.inkM; gl.setRenderTarget(P.inkRT); gl.render(P.qScene, P.qCam);
    P.quad.material = P.finM; gl.setRenderTarget(null); gl.render(P.qScene, P.qCam);
  }, 1);
  return null;
}

const ease = (k: CamKeys["ease"]) => (k === "linear" ? (x: number) => x : k === "out" ? Easing.out(Easing.cubic) : Easing.inOut(Easing.sin));

function Rig({ cam, dur }: { cam: CamKeys; dur: number }) {
  const { camera } = useThree();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useFrame(() => {
    const t = interpolate(frame, [0, Math.max(1, dur - 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease(cam.ease) });
    const L = (a: V3, b: V3) => new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    const s = (cam.sway ?? 1) * 0.04, ts = frame / fps;
    const p = L(cam.from, cam.to).add(new THREE.Vector3(Math.sin(ts * 0.9) * s, Math.sin(ts * 1.3 + 1) * s * 0.6, 0));
    camera.position.copy(p);
    camera.lookAt(L(cam.lookFrom, cam.lookTo ?? cam.lookFrom));
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = (cam.fov ?? 55) + ((cam.fovTo ?? cam.fov ?? 55) - (cam.fov ?? 55)) * t;
    pc.near = 0.1; pc.far = 400; pc.updateProjectionMatrix();
  }, -1);
  return null;
}

function Lights({ look }: { look: Look }) {
  const sun = look.sun ?? { pos: [12, 20, 8] as V3, color: "#ffd9a8", intensity: 2.6, shadow: 30 };
  const hemi = look.hemi ?? { sky: "#a9c4ff", ground: "#5a3f6e", intensity: 0.9 };
  const ref = useRef<THREE.DirectionalLight>(null);
  const S = sun.shadow ?? 30;
  return (
    <>
      <hemisphereLight args={[hemi.sky, hemi.ground, hemi.intensity]} />
      <ambientLight intensity={look.ambient ?? 0.15} />
      <directionalLight ref={ref} position={sun.pos} color={sun.color} intensity={sun.intensity} castShadow
        shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.03}
        shadow-camera-left={-S} shadow-camera-right={S} shadow-camera-top={S} shadow-camera-bottom={-S} shadow-camera-near={0.5} shadow-camera-far={200} />
    </>
  );
}

function Sky({ tex }: { tex: THREE.Texture }) {
  return (
    <mesh layers={LAYER_FX} scale={[-1, 1, 1]}>
      <sphereGeometry args={[300, 48, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

export const Stage: React.FC<{ look: Look; cam: CamKeys; dur: number; focus?: number; children: React.ReactNode }> = ({ look, cam, dur, focus, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} flat
      gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ fov: cam.fov ?? 55, near: 0.1, far: 400, position: cam.from }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; gl.outputColorSpace = THREE.LinearSRGBColorSpace; }}>
      {look.fog ? <fog attach="fog" args={[look.fog, look.fogNear ?? 20, look.fogFar ?? 120]} /> : null}
      <color attach="background" args={[look.fog ?? "#88a"]} />
      {look.sky && typeof look.sky !== "string" ? <Sky tex={look.sky} /> : null}
      <Lights look={look} />
      <Rig cam={cam} dur={dur} />
      {children}
      <Pipeline look={look} focusOverride={focus} />
    </ThreeCanvas>
  );
};
