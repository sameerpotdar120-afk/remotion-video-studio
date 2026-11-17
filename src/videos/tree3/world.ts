// Samulation #5 "The Tree Nobody Can Miss" - three.js world contract shared by every module (photoreal, game-engine look).
// Units: metres. three.js Y is up. The road runs along Z; the camera travels toward -Z; +X is screen-right when looking down -Z.
import * as THREE from "three";
import { staticFile } from "remotion";

export const ROADW = 7.4;                                   // two-lane asphalt, centre line at x = 0
export const SHOULDER = 1.3;                               // gravel shoulder each side: |x| in [ROADW/2, ROADW/2 + SHOULDER]
export const VERGE: [number, number] = [ROADW / 2 + SHOULDER, 10.4];   // grass verge |x| range, fence at |x| = 10.4
export const FENCE_X = 10.4;                                // barbed-wire fence lines at x = +-10.4
export const TREE = new THREE.Vector3(7.2, 0, 0);          // the lone oak, right of the road
export const SIGN = new THREE.Vector3(ROADW / 2 + 2.4, 0, 60);   // NEXT TREE 20 MI sign, faces +Z (toward the camera)
export const Z_NEAR = 400, Z_FAR = -2600;                  // extent of road / fences / fields
export const CAM_Z0 = 150, CAM_Z1 = 72;                    // shot 1A camera travels z = 150 -> 72 (x ~ 9.3, y ~ 1.2-1.35)
export const SUN_DIR = new THREE.Vector3(-0.62, 0.74, 0.26).normalize();   // direction TOWARD the sun (front-left, ~48 deg up)

/** global wind clock (seconds) - set every frame by Tree3.tsx; shaders read WIND.value */
export const WIND = { value: 0 };

/** deterministic RNG (mulberry32) - never use Math.random (frames must be identical on every machine) */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** ground height: flat road, a shallow ditch dip beside each shoulder, gentle undulation far out in the fields */
export function groundY(x: number, z: number) {
  const ax = Math.abs(x); const dip = -0.35 * Math.exp(-(((ax - 6.2) / 1.2) ** 2));
  const far = Math.min(1, Math.max(0, (ax - 10) / 40));
  return (ax < ROADW / 2 ? 0.02 : 0) + dip + far * 0.6 * (Math.sin(x * 0.013 + 1.7) * Math.cos(z * 0.011) + 0.5 * Math.sin(x * 0.031 - z * 0.027));
}

/** CC0 textures in public/tree3/tex (Poly Haven 1k): asphalt_02_*, bark_brown_02_*, forrest_ground_01_* with _diff_1k.jpg/_nor_gl_1k.jpg/_rough_1k.jpg */
const loader = new THREE.TextureLoader();
export function loadTex(file: string, srgb = false, repeat: [number, number] = [1, 1]): Promise<THREE.Texture> {
  return new Promise((res, rej) => loader.load(staticFile(`tree3/tex/${file}`), (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; res(t);
  }, undefined, rej));
}

/** every module returns a Part: one root object (add children to it) + a per-frame update (wind etc). */
export type Part = { object: THREE.Object3D; update: (t: number, camera: THREE.Camera) => void };

/* PERFORMANCE BUDGET (rendering is software WebGL, 4 CPU cores, 360x640 for look-dev; final 1080x1920):
   grass <= 2.0 M triangles, wheat <= 2.0 M, oak <= 1.2 M, props <= 0.3 M. Use InstancedMesh; one draw call per instanced set.
   Materials: MeshStandardMaterial / MeshPhysicalMaterial (+ onBeforeCompile for wind). All objects castShadow/receiveShadow where it matters
   (grass: receive only; wheat: receive only; oak, props: cast + receive). Shadow map is one 4096 directional light from SUN_DIR set up by Tree3.tsx. */
