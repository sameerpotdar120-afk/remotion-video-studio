// Samulation #5 "The Tree Nobody Can Miss" - photoreal three.js world (game-engine look), shot 1A.
// Me: road + ground + HDRI sky/IBL + sun + camera + post. Helpers: grass.ts (grass/wheat), oak.ts (the tree), props.ts (fence/poles/sign/farm).
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, Effect, ToneMappingEffect, ToneMappingMode, VignetteEffect, ChromaticAberrationEffect } from "postprocessing";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { ROADW, SHOULDER, TREE, SUN_DIR, WIND, CAM_Z0, CAM_Z1, Z_NEAR, Z_FAR, groundY, loadTex, Part } from "./world";
import { buildGrass } from "./grass";
import { buildOak } from "./oak";
import { buildProps } from "./props";

export const TREE3_FRAMES = 66;
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const vfov = (lens: number) => (2 * Math.atan(18 / lens) * 180) / Math.PI;   // 36 mm sensor fitted to the frame height (portrait)

/** shot 1A: low glide on the right verge toward the lone oak, slow push from 28 mm to 42 mm */
function shot1A(f: number, cam: THREE.PerspectiveCamera) {
  const t = ease(Math.min(1, f / (TREE3_FRAMES - 1)));
  const z = lerp(CAM_Z0, CAM_Z1, t);
  cam.position.set(lerp(9.4, 9.2, t), groundY(9.3, z) + lerp(1.2, 1.35, t) + 0.015 * Math.sin(f * 0.37), z);
  const tgt = new THREE.Vector3(lerp(5.5, TREE.x - 0.5, t), lerp(2.6, 5.0, t), lerp(0, TREE.z, t));
  cam.lookAt(tgt);
  cam.fov = vfov(lerp(28, 42, t)); cam.near = 0.1; cam.far = 4000; cam.updateProjectionMatrix();
}

/* ---------------- grade: lifted shadows, airy highlights, measured on reference #5 frame 1 ---------------- */
const GRADE_FS = /* glsl */ `
uniform float lift, gain, sat, warm;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = pow(max(inputColor.rgb, 0.0), vec3(1.0 / 2.2));          // to display-ish space
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, sat);
  c = c + (warm * vec3(0.012, 0.004, -0.014)) * smoothstep(0.4, 0.9, l) + (warm * vec3(-0.006, 0.0, 0.012)) * (1.0 - smoothstep(0.1, 0.5, l));
  c = lift + (gain - lift) * c;                                      // black point up (~0.11), white point ~0.92
  outputColor = vec4(pow(max(c, 0.0), vec3(2.2)), inputColor.a);
}`;
class GradeFx extends Effect {
  constructor() {
    super("Grade", GRADE_FS, { uniforms: new Map<string, THREE.Uniform>([["lift", new THREE.Uniform(0.1)], ["gain", new THREE.Uniform(0.93)], ["sat", new THREE.Uniform(1.05)], ["warm", new THREE.Uniform(1.0)]]) });
  }
}

/* ---------------- road + ground ---------------- */
async function buildGround(): Promise<Part> {
  const root = new THREE.Group();
  const [ad, an, ar, gd, gn, gr] = await Promise.all([
    loadTex("asphalt_02_diff_1k.jpg", true, [ROADW / 3.5, 3000 / 3.5]), loadTex("asphalt_02_nor_gl_1k.jpg", false, [ROADW / 3.5, 3000 / 3.5]), loadTex("asphalt_02_rough_1k.jpg", false, [ROADW / 3.5, 3000 / 3.5]),
    loadTex("forrest_ground_01_diff_1k.jpg", true, [1500, 1500]), loadTex("forrest_ground_01_nor_gl_1k.jpg", false, [1500, 1500]), loadTex("forrest_ground_01_rough_1k.jpg", false, [1500, 1500]),
  ]);
  const L = Z_NEAR - Z_FAR, zc = (Z_NEAR + Z_FAR) / 2;
  // terrain (dirt/soil under the vegetation), displaced by groundY
  const tg = new THREE.PlaneGeometry(6000, 6000, 300, 300); tg.rotateX(-Math.PI / 2);
  const p = tg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + zc; p.setY(i, groundY(x, z) - 0.03); }
  tg.translate(0, 0, zc); tg.computeVertexNormals();
  const terr = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ map: gd, normalMap: gn, roughnessMap: gr, color: new THREE.Color(0.78, 0.74, 0.62) }));
  terr.receiveShadow = true; root.add(terr);
  // asphalt (slightly crowned), fine segments along z so it follows groundY exactly
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROADW, L, 8, 600).rotateX(-Math.PI / 2).translate(0, 0, zc),
    new THREE.MeshStandardMaterial({ map: ad, normalMap: an, roughnessMap: ar, color: new THREE.Color(0.62, 0.62, 0.64), normalScale: new THREE.Vector2(0.8, 0.8) }));
  const rp = road.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rp.count; i++) rp.setY(i, 0.02 + 0.06 * (1 - (rp.getX(i) / (ROADW / 2)) ** 2));
  road.geometry.computeVertexNormals(); road.receiveShadow = true; root.add(road);
  // gravel shoulders
  const gm = new THREE.MeshStandardMaterial({ map: gd, normalMap: gn, roughness: 1, color: new THREE.Color(0.95, 0.9, 0.8) });
  for (const s of [-1, 1]) {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(SHOULDER, L, 4, 300).rotateX(-Math.PI / 2).translate(s * (ROADW / 2 + SHOULDER / 2), 0.0, zc), gm);
    const sp = sh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i); sp.setY(i, Math.min(0.02, groundY(x, 0) + 0.04)); }
    sh.geometry.computeVertexNormals(); sh.receiveShadow = true; root.add(sh);
  }
  // paint: white edge lines + dashed double-yellow-free centre (rural single dashed yellow)
  const paint = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const s of [-1, 1]) root.add(new THREE.Mesh(new THREE.PlaneGeometry(0.15, L).rotateX(-Math.PI / 2).translate(s * (ROADW / 2 - 0.25), 0.085, zc), paint(0xe9e6dc)));
  const dash = new THREE.PlaneGeometry(0.12, 3).rotateX(-Math.PI / 2);
  const nd = Math.floor(L / 12); const dm = new THREE.InstancedMesh(dash, paint(0xd9a520), nd); const m4 = new THREE.Matrix4();
  for (let i = 0; i < nd; i++) { m4.makeTranslation(0, 0.081, Z_NEAR - i * 12); dm.setMatrixAt(i, m4); }
  root.add(dm);
  return { object: root, update: () => {} };
}

/* ---------------- scene ---------------- */
const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera, scene, gl, advance } = useThree();
  const [parts, setParts] = useState<Part[] | null>(null);
  const [handle] = useState(() => delayRender("tree3 assets", { timeoutInMilliseconds: 240000 }));
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight(0xfff1dc, 3.2);
    l.castShadow = true; l.shadow.mapSize.set(4096, 4096); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
    const c = l.shadow.camera as THREE.OrthographicCamera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 400;
    return l;
  }, []);
  useEffect(() => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.fog = new THREE.FogExp2(0xc4d2e3, 0.0011);
    const pmrem = new THREE.PMREMGenerator(gl);
    Promise.all([
      new RGBELoader().loadAsync(staticFile("tree3/sky.hdr")),
      buildGround(), buildGrass(), buildOak(), buildProps(),
    ]).then(([hdr, ...ps]) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = hdr; scene.backgroundIntensity = 1.0;
      scene.environment = pmrem.fromEquirectangular(hdr).texture; scene.environmentIntensity = 0.9;
      scene.add(sun, sun.target);
      for (const p of ps) scene.add(p.object);
      setParts(ps);
    }).catch((e) => { console.error(e); throw e; });
  }, []);
  useEffect(() => { if (parts) { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); }); } }, [parts]);
  const cam = camera as THREE.PerspectiveCamera;
  shot1A(f, cam);
  WIND.value = f / fps;
  // sun shadow frustum follows the region between camera and tree
  const mid = new THREE.Vector3((cam.position.x + TREE.x) / 2, 0, (cam.position.z + TREE.z) / 2 + 10);
  sun.target.position.copy(mid); sun.position.copy(mid).addScaledVector(SUN_DIR, 200);
  if (parts) for (const p of parts) p.update(f / fps, cam);
  const fx = useMemo(() => ({
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.35, luminanceThreshold: 0.9, luminanceSmoothing: 0.3, mipmapBlur: true, radius: 0.7 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.AGX }),
    grade: new GradeFx(),
    ca: new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.0006, 0.0004), radialModulation: true, modulationOffset: 0.3 }),
    vig: new VignetteEffect({ offset: 0.35, darkness: 0.28 }),
  }), []);
  return (
    <EffectComposer multisampling={4}>
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
      <primitive object={fx.ca} dispose={null} />
      <primitive object={fx.vig} dispose={null} />
    </EffectComposer>
  );
};

export const Tree3Short: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#c4d2e3" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, stencil: false, toneMappingExposure: 1.0 }} camera={{ fov: 60, near: 0.1, far: 4000 }}>
        <Inner />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
