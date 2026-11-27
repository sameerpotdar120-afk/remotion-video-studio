// Episode 2 world kit: the prairie road, the lone oak, cars that crash, signs, particles, rain.
// Road runs along z (traffic toward -z), centre line x = 0. The oak stands on the right verge at TREE.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { rng } from "../engine/tex";
import { LAYER_FX, V3 } from "../engine/Stage";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const ROADW = 7;
export const TREE: V3 = [6.4, 0, 0];
export const FENCE_X = 11;

export const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------------- canvas textures (cached) ---------------- */
const cache = new Map<string, THREE.CanvasTexture>();
export function ctex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, rep: [number, number] = [1, 1], srgb = true) {
  const k = key + rep.join("x");
  if (cache.has(k)) return cache.get(k)!;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  let s = 7; for (const ch of key) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  draw(c.getContext("2d")!, rng(s));
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(k, t); return t;
}
const speck = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, n: number, cols: string[], s0 = 1, s1 = 4) => {
  for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; const s = s0 + r() * (s1 - s0); g.fillRect(r() * w, r() * h, s, s); }
};
export const grassTex = (rep: [number, number]) => ctex("grass", 512, 512, (g, r) => {
  g.fillStyle = "#5c9a2c"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) { const x = r() * 512, y = r() * 512, l = 6 + r() * 14; g.strokeStyle = ["#4f8a24", "#6fae36", "#7dbb3e", "#467c1f", "#8cc44a"][Math.floor(r() * 5)]; g.lineWidth = 1.5 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 5, y - l); g.stroke(); }
}, rep);
export const asphaltTex = (rep: [number, number]) => ctex("asphalt", 512, 512, (g, r) => {
  g.fillStyle = "#5b5e64"; g.fillRect(0, 0, 512, 512); speck(g, r, 512, 512, 9000, ["#4c4f55", "#6a6d73", "#55585e", "#73767c"], 1, 3);
  for (let i = 0; i < 6; i++) { g.strokeStyle = "rgba(40,40,44,0.35)"; g.lineWidth = 2; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
}, rep);
export const gravelTex = (rep: [number, number]) => ctex("gravel", 256, 256, (g, r) => { g.fillStyle = "#a59b88"; g.fillRect(0, 0, 256, 256); speck(g, r, 256, 256, 4000, ["#8d8473", "#bdb3a0", "#978d7b", "#c9c0ad"], 1, 4); }, rep);
export const fieldTex = (rep: [number, number], ploughed: boolean) => ctex("field" + ploughed, 512, 512, (g, r) => {
  g.fillStyle = ploughed ? "#9c7a52" : "#b9b45a"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 16) { g.fillStyle = ploughed ? (y % 32 ? "#8a6a45" : "#ad8a60") : (y % 32 ? "#a9a548" : "#c8c46a"); g.fillRect(0, y, 512, 8); }
  speck(g, r, 512, 512, 3000, ploughed ? ["#7a5c3a", "#b8966a"] : ["#9a9640", "#d8d47a", "#7f9a3a"], 1, 3);
}, rep);
export const barkTex = (rep: [number, number]) => ctex("bark", 256, 512, (g, r) => {
  g.fillStyle = "#5a4330"; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 70; i++) { const x = r() * 256; g.strokeStyle = r() < 0.5 ? "#3e2d20" : "#6e5440"; g.lineWidth = 2 + r() * 5; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y * 0.03 + i) * 6 + (r() - 0.5) * 6, y); g.stroke(); }
}, rep);
export const leafCardTex = () => ctex("leafcard", 256, 256, (g, r) => {
  g.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i++) {
    const x = 30 + r() * 196, y = 30 + r() * 196, s = 16 + r() * 18, a = r() * Math.PI * 2;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = ["#e9f2d8", "#d2e6b8", "#f6faee", "#bcd8a0"][Math.floor(r() * 4)];
    g.beginPath(); g.moveTo(0, -s); for (let k = 0; k <= 6; k++) { const yy = -s + (k / 6) * 2 * s, w = Math.sin((k / 6) * Math.PI) * s * 0.5 * (k % 2 ? 1.15 : 0.85); g.lineTo(w, yy); } for (let k = 6; k >= 0; k--) { const yy = -s + (k / 6) * 2 * s, w = Math.sin((k / 6) * Math.PI) * s * 0.5 * (k % 2 ? 1.15 : 0.85); g.lineTo(-w, yy); } g.fill();
    g.strokeStyle = "rgba(60,90,40,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); g.stroke(); g.restore();
  }
});
export const leafTex = () => ctex("leaf", 512, 512, (g, r) => {
  g.fillStyle = "#4a8a26"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) { const x = r() * 512, y = r() * 512, s = 6 + r() * 10; g.fillStyle = ["#3d7a1e", "#5c9e2e", "#6fb238", "#2f6618", "#86c44a", "#4a8a26"][Math.floor(r() * 6)]; g.beginPath(); g.ellipse(x, y, s, s * 0.6, r() * 3, 0, Math.PI * 2); g.fill(); }
});
const bladeTex = () => ctex("blades", 256, 256, (g, r) => {
  g.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const x = 10 + r() * 236, h = 120 + r() * 130, bend = (r() - 0.5) * 50;
    const gr = g.createLinearGradient(0, 256, 0, 256 - h); gr.addColorStop(0, "#2f5e16"); gr.addColorStop(0.5, ["#5a9a2a", "#4e8c24", "#6aa834"][i % 3]); gr.addColorStop(1, ["#9ccc58", "#86c04a", "#b0d468"][i % 3]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 4, 256); g.quadraticCurveTo(x + bend * 0.4, 256 - h * 0.5, x + bend, 256 - h); g.quadraticCurveTo(x + bend * 0.4 + 2, 256 - h * 0.5, x + 4, 256); g.fill();
  }
});
export function signCanvas(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) { return ctex("sign:" + key, w, h, (g) => draw(g)); }

/* ---------------- materials ---------------- */
const M = (color: string, rough = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });

/* ---------------- ground, road, fields ---------------- */
export const Plains: React.FC<{ z0?: number; z1?: number; night?: boolean; grass?: { center: V3; radius: number; count: number }[]; skid?: boolean }> = ({ z0 = 320, z1 = -330, night, grass = [], skid }) => {
  const L = z0 - z1, zc = (z0 + z1) / 2;
  const mats = useMemo(() => ({
    road: new THREE.MeshStandardMaterial({ map: asphaltTex([2, L / 6]), roughness: night ? 0.35 : 0.9, color: night ? "#9aa0ae" : "#ffffff" }),
    gravel: new THREE.MeshStandardMaterial({ map: gravelTex([1, L / 3]), roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ map: grassTex([L / 5, 4]), roughness: 1 }),
    plough: new THREE.MeshStandardMaterial({ map: fieldTex([60, L / 20], true), roughness: 1 }),
    crop: new THREE.MeshStandardMaterial({ map: fieldTex([60, L / 20], false), roughness: 1 }),
    white: M("#f2f0e8", 0.6), yellow: M("#e8b630", 0.6),
  }), [L, night]);
  const strip = (x0: number, x1: number, y: number, m: THREE.Material, key: string) => (
    <mesh key={key} rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, y, zc]} receiveShadow material={m}><planeGeometry args={[x1 - x0, L]} /></mesh>
  );
  const dashes = useMemo(() => { const n = Math.floor(L / 9); const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 3).rotateX(-Math.PI / 2), mats.yellow, n); const m = new THREE.Matrix4(); for (let i = 0; i < n; i++) { m.makeTranslation(-0.13, 0.031, z0 - i * 9); im.setMatrixAt(i, m); } return im; }, [L, mats, z0]);
  const dashes2 = useMemo(() => { const n = Math.floor(L / 9); const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 3).rotateX(-Math.PI / 2), mats.yellow, n); const m = new THREE.Matrix4(); for (let i = 0; i < n; i++) { m.makeTranslation(0.13, 0.031, z0 - i * 9); im.setMatrixAt(i, m); } return im; }, [L, mats, z0]);
  return (
    <group>
      {strip(-ROADW / 2, ROADW / 2, 0.02, mats.road, "road")}
      {strip(-ROADW / 2 - 1.2, -ROADW / 2, 0.012, mats.gravel, "gl")}{strip(ROADW / 2, ROADW / 2 + 1.2, 0.012, mats.gravel, "gr")}
      {strip(-FENCE_X, -ROADW / 2 - 1.2, 0.0, mats.grass, "vl")}{strip(ROADW / 2 + 1.2, FENCE_X, 0.0, mats.grass, "vr")}
      {strip(-420, -FENCE_X, -0.01, mats.plough, "fl")}{strip(FENCE_X, 420, -0.01, mats.crop, "fr")}
      {[-1, 1].map((s) => <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROADW / 2 - 0.25), 0.03, zc]} material={mats.white}><planeGeometry args={[0.16, L]} /></mesh>)}
      <primitive object={dashes} /><primitive object={dashes2} />
      {skid ? <Skids /> : null}
      <Fence x={-FENCE_X} z0={z0} z1={z1} /><Fence x={FENCE_X} z0={z0} z1={z1} />
      <Poles x={-14} z0={z0} z1={z1} />
      {grass.map((gp, i) => <GrassTufts key={i} {...gp} seed={i + 1} />)}
    </group>
  );
};

// dark tyre marks curving off the road toward the oak
const Skids: React.FC = () => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({ color: "#1d1c1e", transparent: true, opacity: 0.55, depthWrite: false }), []);
  return (
    <group>
      {[0, 1].map((k) => {
        const pts = [new THREE.Vector3(1.0 + k * 1.6, 0.035, 34), new THREE.Vector3(2.0 + k * 1.6, 0.035, 18), new THREE.Vector3(3.8 + k * 1.4, 0.035, 7), new THREE.Vector3(5.2 + k * 0.8, 0.035, 1.8)];
        const curve = new THREE.CatmullRomCurve3(pts); const geo = new THREE.TubeGeometry(curve, 40, 0.11, 3, false); geo.scale(1, 0.05, 1);
        return <mesh key={k} geometry={geo} material={m} />;
      })}
    </group>
  );
};

export const Fence: React.FC<{ x: number; z0: number; z1: number; every?: number }> = ({ x, z0, z1, every = 4 }) => {
  const obj = useMemo(() => {
    const n = Math.floor((z0 - z1) / every), r = rng(Math.round(x * 13 + 5));
    const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.07, 1.35, 6), M("#6b5236", 0.95), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { e.set((r() - 0.5) * 0.06, 0, (r() - 0.5) * 0.08); q.setFromEuler(e); m.compose(new THREE.Vector3(x, 0.62, z0 - i * every), q, new THREE.Vector3(1, 0.9 + r() * 0.2, 1)); posts.setMatrixAt(i, m); }
    posts.castShadow = true; posts.receiveShadow = true;
    const g = new THREE.Group(); g.add(posts);
    const wm = new THREE.LineBasicMaterial({ color: "#5d5f66" });
    for (const y of [0.45, 0.8, 1.15]) {
      const p: number[] = [];
      for (let i = 0; i < n - 1; i++) { const za = z0 - i * every, zb = za - every; for (let k = 0; k <= 4; k++) { const kk = k / 4; p.push(x, y - Math.sin(Math.PI * kk) * 0.04, za + (zb - za) * kk); if (k > 0 && k < 4) p.push(x, y - Math.sin(Math.PI * kk) * 0.04, za + (zb - za) * kk); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.add(new THREE.LineSegments(geo, wm));
    }
    return g;
  }, [x, z0, z1, every]);
  return <primitive object={obj} />;
};

export const Poles: React.FC<{ x: number; z0: number; z1: number; every?: number }> = ({ x, z0, z1, every = 45 }) => {
  const obj = useMemo(() => {
    const g = new THREE.Group(), n = Math.floor((z0 - z1) / every), wood = M("#5e4a36", 0.95), dark = M("#3a3a40", 0.6);
    for (let i = 0; i < n; i++) {
      const z = z0 - i * every;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 9, 8), wood); pole.position.set(x, 4.5, z); pole.castShadow = true; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.14), wood); arm.position.set(x, 8.4, z); arm.castShadow = true; g.add(arm);
      for (const dx of [-0.9, 0, 0.9]) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 6), dark); ins.position.set(x + dx, 8.58, z); g.add(ins); }
    }
    const wm = new THREE.LineBasicMaterial({ color: "#2e2e34" });
    for (const dx of [-0.9, 0.9]) { const p: number[] = []; for (let i = 0; i < n - 1; i++) { const za = z0 - i * every; for (let k = 0; k < 10; k++) { const a = k / 10, b = (k + 1) / 10; p.push(x + dx, 8.66 - Math.sin(Math.PI * a) * 0.7, za - a * every, x + dx, 8.66 - Math.sin(Math.PI * b) * 0.7, za - b * every); } } const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.add(new THREE.LineSegments(geo, wm)); }
    return g;
  }, [x, z0, z1, every]);
  return <primitive object={obj} />;
};

/* ---------------- grass tufts (crossed alpha cards, wind) ---------------- */
export const GrassTufts: React.FC<{ center: V3; radius: number; count: number; seed?: number; h?: number; avoidRoad?: boolean }> = ({ center, radius, count, seed = 1, h = 0.55, avoidRoad = true }) => {
  const t = useT();
  const { mesh, mat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const a = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), b = a.clone().rotateY(Math.PI / 2), c = a.clone().rotateY(Math.PI / 4);
    const merge = [a, b, c]; const pos: number[] = [], uv: number[] = [], idx: number[] = []; let o = 0;
    for (const m of merge) { const P = m.attributes.position.array, U = m.attributes.uv.array, I = m.index!.array; for (let i = 0; i < P.length; i++) pos.push(P[i]); for (let i = 0; i < U.length; i++) uv.push(U[i]); for (let i = 0; i < I.length; i++) idx.push(I[i] + o); o += P.length / 3; }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    // normals straight up so the cards shade like the ground (no dark backsides)
    const nn = geo.attributes.normal as THREE.BufferAttribute; for (let i = 0; i < nn.count; i++) nn.setXYZ(i, 0, 1, 0);
    const mat = new THREE.MeshStandardMaterial({ map: bladeTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9 });
    const uT = { value: 0 };
    mat.onBeforeCompile = (sh) => { sh.uniforms.uT = uT; sh.vertexShader = "uniform float uT;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
      float sway = (sin(uT * 1.7 + wp.x * 0.35 + wp.z * 0.21) * 0.6 + sin(uT * 3.1 + wp.z * 0.9) * 0.25) * position.y * position.y;
      transformed.x += sway * 0.22; transformed.z += sway * 0.08;`); };
    (mat as unknown as { uT: { value: number } }).uT = uT;
    const r = rng(seed * 101), mesh = new THREE.InstancedMesh(geo, mat, count); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); let k = 0;
    for (let i = 0; i < count * 3 && k < count; i++) {
      const ang = r() * Math.PI * 2, rr = Math.pow(r(), 0.75) * radius, x = center[0] + Math.cos(ang) * rr, z = center[2] + Math.sin(ang) * rr;
      if (avoidRoad && Math.abs(x) < ROADW / 2 + 1.3) continue;
      const edge = 1 - Math.pow(rr / radius, 3) * 0.75; const s = h * (0.6 + r() * 0.8) * edge; q.setFromEuler(new THREE.Euler(0, r() * Math.PI, 0)); m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(s * 1.1, s, s * 1.1)); mesh.setMatrixAt(k++, m4);
    }
    mesh.count = k; mesh.receiveShadow = true;
    return { mesh, mat };
  }, [center[0], center[1], center[2], radius, count, seed, h, avoidRoad]);
  (mat as unknown as { uT: { value: number } }).uT.value = t;
  return <primitive object={mesh} />;
};

/* ---------------- the oak ---------------- */
type OakProps = { pos?: V3; grow?: number; fall?: number; fallDir?: number; stump?: boolean; scale?: number; wind?: number; shake?: number; stripes?: boolean };
export const Oak: React.FC<OakProps> = ({ pos = TREE, grow = 1, fall = 0, fallDir = -Math.PI / 2, stump = false, scale = 1, wind = 1, shake = 0, stripes }) => {
  const t = useT();
  const parts = useMemo(() => {
    const r = rng(42), bark = new THREE.MeshStandardMaterial({ map: barkTex([2, 3]), roughness: 1 });
    const leaves = new THREE.MeshStandardMaterial({ map: leafTex(), roughness: 0.95 });
    const trunk = new THREE.Group(), crown = new THREE.Group();
    const tg = new THREE.CylinderGeometry(0.55, 0.85, 5.2, 18, 6); tg.translate(0, 2.6, 0);
    const p = tg.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 1 + 0.35 * Math.exp(-y * 2.2) + 0.04 * Math.sin(Math.atan2(p.getZ(i), p.getX(i)) * 5 + y); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
    tg.computeVertexNormals();
    const tm = new THREE.Mesh(tg, bark); tm.castShadow = tm.receiveShadow = true; trunk.add(tm);
    // limbs: tapered cylinders from the top of the trunk outward and up
    const limbs: [number, number, number, number][] = [];
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + r() * 0.5, up = 0.55 + r() * 0.35, len = 3.2 + r() * 1.6; limbs.push([a, up, len, 0.32 - i * 0.012]); }
    const clumps: [number, number, number, number][] = [];
    for (const [a, up, len, rad] of limbs) {
      const dir = new THREE.Vector3(Math.cos(a) * Math.cos(up), Math.sin(up), Math.sin(a) * Math.cos(up));
      const g = new THREE.CylinderGeometry(rad * 0.45, rad, len, 8); g.translate(0, len / 2, 0);
      const m = new THREE.Mesh(g, bark); m.position.set(0, 4.6 + r() * 0.6, 0); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); m.castShadow = true; trunk.add(m);
      const tip = m.position.clone().addScaledVector(dir, len);
      clumps.push([tip.x, tip.y + 0.4, tip.z, 2.0 + r() * 0.6]);
      const mid = m.position.clone().addScaledVector(dir, len * 0.55); clumps.push([mid.x, mid.y + 0.9, mid.z, 1.7 + r() * 0.5]);
    }
    clumps.push([0, 9.0, 0, 2.8], [0.5, 7.6, 0.4, 2.4], [-0.6, 8.2, -0.5, 2.3]);
    for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, rr = 2.2 + r() * 2.6; clumps.push([Math.cos(a) * rr, 6.4 + r() * 3.2, Math.sin(a) * rr, 1.3 + r() * 0.9]); }
    const inner = new THREE.MeshStandardMaterial({ color: "#2f5e1a", roughness: 1 });
    const cardM = new THREE.MeshStandardMaterial({ map: leafCardTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 });
    const NC = 5200, cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.15, 1.15), cardM, NC);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    const tot = clumps.reduce((a, c) => a + c[3] * c[3], 0); let ci = 0;
    for (const [x, y, z, s0] of clumps) {
      const g = new THREE.IcosahedronGeometry(1, 2); const m = new THREE.Mesh(g, inner); m.position.set(x, y, z); m.scale.set(s0 * 0.9, s0 * 0.75, s0 * 0.9); m.castShadow = true; crown.add(m);
      const n = Math.round(NC * (s0 * s0) / tot);
      for (let i = 0; i < n && ci < NC; i++, ci++) {
        const u = r() * 2 - 1, a = r() * Math.PI * 2, rr = s0 * (0.82 + r() * 0.3);
        const d = new THREE.Vector3(Math.sqrt(1 - u * u) * Math.cos(a), u * 0.82, Math.sqrt(1 - u * u) * Math.sin(a));
        q.setFromEuler(new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI));
        m4.compose(new THREE.Vector3(x + d.x * rr, y + d.y * rr, z + d.z * rr), q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + r() * 0.6)); cards.setMatrixAt(ci, m4);
        const up = (d.y + 1) / 2; col.setHSL(0.24 + r() * 0.04, 0.55 + r() * 0.15, 0.32 + up * 0.18 + r() * 0.06); cards.setColorAt(ci, col);
      }
    }
    cards.count = ci; cards.castShadow = true; cards.receiveShadow = true; crown.add(cards);
    const stumpG = new THREE.CylinderGeometry(0.95, 1.12, 0.55, 20); stumpG.translate(0, 0.27, 0);
    const stumpM = new THREE.Mesh(stumpG, bark); stumpM.castShadow = stumpM.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.CircleGeometry(0.93, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: ctex("rings", 256, 256, (g) => { g.fillStyle = "#d8b47a"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 14; i++) { g.strokeStyle = i % 2 ? "#b88a50" : "#c99a60"; g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 8 + i * 8.5, 0, 7); g.stroke(); } }), roughness: 1 }));
    ring.position.y = 0.56; const stump = new THREE.Group(); stump.add(stumpM, ring);
    return { trunk, crown, stump, bark };
  }, []);
  const k = grow < 1 ? Math.max(0.001, grow) : 1;
  const sw = wind * (Math.sin(t * 1.3) * 0.012 + Math.sin(t * 2.7) * 0.006) + shake * Math.sin(t * 60) * 0.02;
  if (stump) return <group position={pos}><primitive object={parts.stump} /></group>;
  return (
    <group position={pos} rotation={[0, fallDir, 0]}>
      <group rotation={[0, 0, -fall * (Math.PI / 2) * 0.97]} scale={[k * scale, k * scale, k * scale]}>
        <group rotation={[0, -fallDir, 0]}>
          <primitive object={parts.trunk} />
          <group rotation={[sw, 0, sw * 0.7]}><primitive object={parts.crown} /></group>
          {stripes ? <Stripes /> : null}
        </group>
      </group>
    </group>
  );
};
const Stripes: React.FC = () => {
  const m = useMemo(() => [M("#f2f0e8", 0.4, { emissive: "#ffffff", emissiveIntensity: 0.25 }), M("#e8b630", 0.4, { emissive: "#e8b630", emissiveIntensity: 0.3 })], []);
  return <group>{[0, 1, 2, 3].map((i) => <mesh key={i} position={[0, 0.9 + i * 0.45, 0]} material={m[i % 2]}><cylinderGeometry args={[0.92 - i * 0.05, 0.95 - i * 0.05, 0.24, 20, 1, true]} /></mesh>)}</group>;
};

/* ---------------- the glowing arrow sign ("DON'T HIT THIS TREE") ---------------- */
export const ArrowSign: React.FC<{ pos: V3; rotY?: number; lit?: number; scale?: number; night?: boolean }> = ({ pos, rotY = 0, lit = 1, scale = 1, night }) => {
  const t = useT();
  const parts = useMemo(() => {
    const red = M("#d8322a", 0.5, { emissive: "#ff3020", emissiveIntensity: 0 });
    const face = new THREE.MeshStandardMaterial({ map: signCanvas("arrowtext", 512, 640, (g) => {
      g.fillStyle = "#f6ead2"; g.fillRect(0, 0, 512, 640); g.strokeStyle = "#c62b22"; g.lineWidth = 26; g.strokeRect(13, 13, 486, 614);
      g.fillStyle = "#c62b22"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 120px Arial Black, Arial, sans-serif";
      ["DON'T", "HIT", "THIS", "TREE"].forEach((w, i) => g.fillText(w, 256, 110 + i * 140));
    }), roughness: 0.6, emissive: "#ffffff", emissiveIntensity: 0 });
    face.emissiveMap = face.map;
    const arc = new THREE.TorusGeometry(1.7, 0.36, 12, 48, Math.PI * 1.35); arc.rotateZ(Math.PI * 0.32);
    const head = new THREE.ConeGeometry(0.75, 1.0, 3); head.rotateZ(Math.PI); head.translate(1.45, -1.25, 0);
    const bulbs: THREE.Vector3[] = []; for (let i = 0; i <= 26; i++) { const a = Math.PI * 0.32 + (i / 26) * Math.PI * 1.35; bulbs.push(new THREE.Vector3(Math.cos(a) * 1.7, Math.sin(a) * 1.7, 0.36)); }
    const bulbM = new THREE.MeshStandardMaterial({ color: "#fff2c0", emissive: "#ffd860", emissiveIntensity: 0 });
    const bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), bulbM, bulbs.length); const m4 = new THREE.Matrix4(); bulbs.forEach((b, i) => { m4.makeTranslation(b.x, b.y, b.z); bulb.setMatrixAt(i, m4); });
    return { red, face, arc, head, bulb, bulbM };
  }, []);
  const chase = 0.65 + 0.35 * Math.sin(t * 9);
  parts.red.emissiveIntensity = lit * (night ? 1.6 : 0.55);
  parts.bulbM.emissiveIntensity = lit * (night ? 4 : 2.2) * chase;
  parts.face.emissiveIntensity = lit * (night ? 0.75 : 0.18);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={parts.arc} material={parts.red} castShadow />
      <primitive object={parts.bulb} />
      <mesh position={[-0.15, 0.1, 0.05]} material={parts.face} castShadow><boxGeometry args={[1.6, 2.0, 0.12]} /></mesh>
      <mesh position={[-0.15, 0.1, -0.12]} material={parts.red}><boxGeometry args={[1.75, 2.15, 0.1]} /></mesh>
      {lit > 0 ? <pointLight position={[0, 0, 1.6]} color="#ff7a3a" intensity={lit * (night ? 120 : 10)} distance={night ? 40 : 10} decay={1.6} /> : null}
    </group>
  );
};

/* ---------------- vehicles ---------------- */
export type CarKind = "sedan" | "van" | "cruiser" | "tow" | "pickup";
type CarP = { kind?: CarKind; pos: V3; rotY?: number; pitch?: number; roll?: number; color?: string; crumple?: number; dist?: number; lights?: boolean; glass?: number; children?: React.ReactNode; bob?: number; flash?: boolean };
export const Car: React.FC<CarP> = ({ kind = "sedan", pos, rotY = 0, pitch = 0, roll = 0, color = "#3a6ea8", crumple = 0, dist = 0, lights, glass = 0.55, children, bob = 0, flash }) => {
  const t = useT();
  const mats = useMemo(() => ({
    body: M(color, 0.35, { metalness: 0.15 }), white: M("#f2f2ee", 0.35, { metalness: 0.1 }), green: M("#1f6b3e", 0.4), dark: M("#24252a", 0.8), tyre: M("#1b1b1e", 0.95), rim: M("#c9ccd2", 0.3, { metalness: 0.4 }),
    glass: new THREE.MeshStandardMaterial({ color: "#2a3a4e", roughness: 0.05, transparent: true, opacity: glass, metalness: 0.2, side: THREE.DoubleSide }),
    head: M("#fff6d8", 0.2, { emissive: "#fff2c0", emissiveIntensity: lights ? 3 : 0.3 }), tail: M("#a01818", 0.3, { emissive: "#ff2010", emissiveIntensity: lights ? 2.5 : 0.3 }),
    red: M("#e02020", 0.3, { emissive: "#ff1010", emissiveIntensity: 1.5 }), blue: M("#2050e0", 0.3, { emissive: "#2060ff", emissiveIntensity: 1.5 }),
    star: new THREE.MeshStandardMaterial({ map: signCanvas("star", 128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.fillStyle = "#e8b630"; g.strokeStyle = "#5a3a0a"; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 24 : 58; g.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); }), transparent: true, alphaTest: 0.5 }),
  }), [color, glass, lights]);
  if (flash) { mats.red.emissiveIntensity = Math.sin(t * 14) > 0 ? 3 : 0.2; mats.blue.emissiveIntensity = Math.sin(t * 14) > 0 ? 0.2 : 3; }
  const big = kind === "van" || kind === "tow";
  const len = kind === "van" ? 4.8 : kind === "tow" ? 6.2 : 4.5, wid = big ? 2.0 : 1.86;
  const c = clamp01(crumple), front = len * 0.28 * (1 - 0.5 * c);
  const wheelR = big ? 0.42 : 0.36, spin = dist / wheelR;
  const lower = kind === "cruiser" ? mats.white : mats.body;
  const Wheel = ({ x, z }: { x: number; z: number }) => (
    <group position={[x, wheelR, z]} rotation={[spin, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mats.tyre} castShadow><cylinderGeometry args={[wheelR, wheelR, 0.28, 18]} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.145 : -0.145, 0, 0]} material={mats.rim}><cylinderGeometry args={[wheelR * 0.55, wheelR * 0.55, 0.02, 12]} /></mesh>
    </group>
  );
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, rotY, 0]}>
      <group position={[0, 0, -len / 2]} rotation={[-pitch, 0, roll]}><group position={[0, 0, len / 2]}>
        {kind === "sedan" || kind === "cruiser" ? (
          <group position={[0, 0, -len / 2]} scale={[1, 1 - c * 0.04, 1 - c * 0.16]}><group position={[0, 0, len / 2]} rotation={[c * 0.04, 0, c * 0.02]}>
            <mesh geometry={sedanBody(wid)} material={lower} castShadow receiveShadow />
            {[-1, 1].map((sd) => <mesh key={"w" + sd} geometry={sedanSideGlass()} position={[sd * (wid / 2 + 0.004), 0, 0]} material={mats.glass} />)}
            <mesh position={[0, 1.245, 0.76]} rotation={[0.62, 0, 0]} material={mats.glass}><boxGeometry args={[wid * 0.84, 0.02, 0.72]} /></mesh>
            <mesh position={[0, 1.22, -1.16]} rotation={[-0.81, 0, 0]} material={mats.glass}><boxGeometry args={[wid * 0.84, 0.02, 0.56]} /></mesh>
            <mesh position={[0, 1.46, -0.27]} material={lower} castShadow geometry={rbox(wid * 0.86, 0.07, 1.42)} />
            {[-1, 1].map((sd) => <group key={"pil" + sd}>
              <mesh position={[sd * wid * 0.42, 1.245, 0.74]} rotation={[0.62, 0, 0]} material={lower}><boxGeometry args={[0.07, 0.06, 0.74]} /></mesh>
              <mesh position={[sd * wid * 0.42, 1.22, -1.17]} rotation={[-0.81, 0, 0]} material={lower}><boxGeometry args={[0.07, 0.06, 0.6]} /></mesh>
              <mesh position={[sd * wid * 0.43, 1.22, -0.2]} material={lower}><boxGeometry args={[0.06, 0.44, 0.08]} /></mesh>
            </group>)}
            <mesh position={[0, 0.98, -0.3]} material={mats.dark}><boxGeometry args={[wid * 0.8, 0.14, 2.1]} /></mesh>
            {kind === "cruiser" ? [-1, 1].map((sd) => <mesh key={"g" + sd} position={[sd * (wid / 2 + 0.006), 0.62, -0.15]} rotation={[0, sd * Math.PI / 2, 0]} material={mats.green}><planeGeometry args={[2.5, 0.36]} /></mesh>) : null}
            {[-1, 1].flatMap((sd) => [1.42, -1.38].map((wz) => <mesh key={"a" + sd + wz} position={[sd * (wid / 2 + 0.008), 0.42, wz]} rotation={[0, sd * Math.PI / 2, 0]} material={mats.dark}><circleGeometry args={[0.46, 20, 0, Math.PI]} /></mesh>))}
          </group></group>
        ) : (
          <group>
            <mesh position={[0, 0.72, -front / 2]} material={lower} castShadow receiveShadow geometry={rbox(wid, 0.62, len - front)} />
            <mesh position={[0, 0.7 - c * 0.08, len / 2 - front / 2]} rotation={[c * 0.18, 0, c * 0.05]} material={lower} castShadow geometry={rbox(wid * (1 - c * 0.08), 0.56, front)} />
          </group>
        )}
        {/* cabin */}
        {kind === "tow" ? (
          <group>
            <mesh position={[0, 1.55, len / 2 - front - 0.9]} material={mats.body} castShadow><boxGeometry args={[wid, 1.1, 1.7]} /></mesh>
            <mesh position={[0, 1.6, len / 2 - front - 0.04]} material={mats.glass}><boxGeometry args={[wid * 0.9, 0.62, 0.04]} /></mesh>
            <mesh position={[0, 1.15, -1.2]} material={mats.dark} castShadow><boxGeometry args={[wid * 0.96, 0.18, 2.8]} /></mesh>
            <mesh position={[0, 1.9, -1.5]} rotation={[0.55, 0, 0]} material={M("#d8d8dc", 0.4, { metalness: 0.5 })} castShadow><boxGeometry args={[0.24, 0.24, 2.6]} /></mesh>
            <mesh position={[0, 1.35, -2.75]} material={mats.dark}><boxGeometry args={[0.1, 0.5, 0.1]} /></mesh>
          </group>
        ) : kind === "van" ? (
          <group>
            <mesh position={[0, 1.55, -0.35]} material={mats.body} castShadow><boxGeometry args={[wid, 1.1, len - front - 0.3]} /></mesh>
            <mesh position={[0, 1.65, len / 2 - front - 0.48]} rotation={[-0.25, 0, 0]} material={mats.glass}><boxGeometry args={[wid * 0.92, 0.75, 0.05]} /></mesh>
            {[-1, 1].map((s) => <mesh key={s} position={[s * (wid / 2 + 0.005), 1.7, 0.6]} material={mats.glass}><boxGeometry args={[0.02, 0.5, 1.0]} /></mesh>)}
          </group>
        ) : kind === "cruiser" ? (
          <group position={[0, 1.5, -0.3]}>
            <mesh position={[-0.35, 0, 0]} material={mats.red}><boxGeometry args={[0.6, 0.13, 0.3]} /></mesh>
            <mesh position={[0.35, 0, 0]} material={mats.blue}><boxGeometry args={[0.6, 0.13, 0.3]} /></mesh>
          </group>
        ) : null}
        {kind === "cruiser" ? [-1, 1].map((s) => <mesh key={"st" + s} position={[s * (wid / 2 + 0.012), 0.95, 0.2]} rotation={[0, s * Math.PI / 2, 0]} material={mats.star}><planeGeometry args={[0.42, 0.42]} /></mesh>) : null}
        {/* lights */}
        {[-1, 1].map((s) => <mesh key={"h" + s} position={[s * wid * 0.34, big ? 0.78 : 0.74, len / 2 + 0.06 - c * len * 0.16]} material={mats.head}><boxGeometry args={[0.36, 0.16, 0.04]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={"t" + s} position={[s * wid * 0.36, big ? 0.85 : 0.78, -len / 2 - 0.08]} material={mats.tail}><boxGeometry args={[0.3, 0.16, 0.04]} /></mesh>)}
        <mesh position={[0, 0.42, len / 2 + 0.05 - c * len * 0.16]} material={mats.dark}><boxGeometry args={[wid * 0.98, 0.18, 0.12]} /></mesh>
        {(big ? [len / 2 - 1.0, -len / 2 + 1.1] : [1.42, -1.38]).flatMap((wz) => [-1, 1].map((sd) => <Wheel key={sd + "_" + wz} x={sd * (wid / 2 - 0.12)} z={wz} />))}
        {lights ? [-1, 1].map((s) => <spotLight key={"sl" + s} position={[s * 0.6, 0.8, len / 2]} target-position={[s * 0.6, 0, len / 2 + 20]} angle={0.45} penumbra={0.6} intensity={180} distance={60} decay={1.4} color="#fff1d0" />) : null}
        {children}
      </group></group>
    </group>
  );
};

/* car body: side profile (z, y) extruded across the width, softly bevelled */
const geoCache = new Map<string, THREE.BufferGeometry>();
function sedanBody(wid: number) {
  const k = "sedan" + wid; if (geoCache.has(k)) return geoCache.get(k)!;
  const P: [number, number][] = [[-2.25, 0.32], [-2.32, 0.62], [-2.28, 0.9], [-2.05, 0.98], [-1.38, 1.0], [1.06, 1.02], [1.9, 0.95], [2.22, 0.86], [2.3, 0.6], [2.25, 0.32]];
  const sh = new THREE.Shape(); sh.moveTo(-P[0][0], P[0][1]); for (const [z, y] of P.slice(1)) sh.lineTo(-z, y); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: wid - 0.16, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 3, curveSegments: 4 });
  g.rotateY(Math.PI / 2); g.translate(-(wid - 0.16) / 2, 0, 0); g.computeVertexNormals(); geoCache.set(k, g); return g;
}
function sedanSideGlass() {
  const k = "sideglass"; if (geoCache.has(k)) return geoCache.get(k)!;
  const P: [number, number][] = [[-1.28, 1.03], [-0.93, 1.38], [0.38, 1.4], [0.95, 1.05]];
  const sh = new THREE.Shape(); sh.moveTo(-P[0][0], P[0][1]); for (const [z, y] of P.slice(1)) sh.lineTo(-z, y); sh.closePath();
  const g = new THREE.ShapeGeometry(sh); g.rotateY(Math.PI / 2); geoCache.set(k, g); return g;
}
function rbox(w: number, h: number, d: number) {
  const k = "rb" + [w, h, d].map((v) => v.toFixed(2)).join("_"); if (geoCache.has(k)) return geoCache.get(k)!;
  const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.18); geoCache.set(k, g); return g;
}

/* simple 1D driving motion: cruise at v, brake to stop at the impact point, bounce back a little */
export function crashZ(t: number, zStart: number, zHit: number, tHit: number) {
  const v = (zStart - zHit) / tHit;
  if (t < tHit) return { z: zStart - v * t, crumple: 0, shake: 0, after: -1 };
  const a = t - tHit;
  const back = 0.35 * (1 - Math.exp(-a * 9)) ;
  return { z: zHit + back, crumple: clamp01(a / 0.08), shake: Math.exp(-a * 6), after: a };
}

/* ---------------- particles ---------------- */
export const Debris: React.FC<{ origin: V3; t0: number; n?: number; colors?: string[]; speed?: number; size?: number; seed?: number; dir?: V3 }> = ({ origin, t0, n = 40, colors = ["#cfd6de", "#3a3a40", "#5a4330", "#4a8a26"], speed = 6, size = 0.1, seed = 3, dir = [0, 0.6, 1] }) => {
  const t = useT();
  const obj = useMemo(() => {
    const r = rng(seed), mats = colors.map((c) => M(c, 0.6));
    const items = Array.from({ length: n }, () => ({ v: new THREE.Vector3(dir[0] + (r() - 0.5) * 2, dir[1] + r() * 1.2, dir[2] + (r() - 0.5) * 2).normalize().multiplyScalar(speed * (0.4 + r() * 0.8)), s: size * (0.5 + r()), m: Math.floor(r() * mats.length), spin: new THREE.Vector3(r() * 9, r() * 9, r() * 9) }));
    const g = new THREE.Group(); const meshes = items.map((it) => { const m = new THREE.Mesh(new THREE.BoxGeometry(it.s, it.s * 0.4, it.s * 1.3), mats[it.m]); m.castShadow = true; g.add(m); return m; });
    return { g, items, meshes };
  }, [n, seed]);
  const a = t - t0;
  obj.meshes.forEach((m, i) => {
    const it = obj.items[i]; if (a < 0) { m.visible = false; return; } m.visible = true;
    let y = origin[1] + it.v.y * a - 4.9 * a * a; const tl = a;
    if (y < 0.03) y = 0.03;
    const drag = Math.min(a, 1.4);
    m.position.set(origin[0] + it.v.x * drag, y, origin[2] + it.v.z * drag);
    m.rotation.set(it.spin.x * Math.min(tl, 1.2), it.spin.y * Math.min(tl, 1.2), it.spin.z * Math.min(tl, 1.2));
  });
  return <primitive object={obj.g} />;
};

const puffTex = () => ctex("puff", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.6, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
export const Dust: React.FC<{ origin: V3; t0: number; n?: number; color?: string; spread?: number; size?: number; life?: number; seed?: number }> = ({ origin, t0, n = 14, color = "#c9b48e", spread = 2.5, size = 1.4, life = 1.6, seed = 5 }) => {
  const t = useT();
  const items = useMemo(() => { const r = rng(seed); return Array.from({ length: n }, () => ({ dx: (r() - 0.5) * 2, dz: (r() - 0.5) * 2, up: 0.3 + r() * 0.8, s: 0.6 + r() * 0.8 })); }, [n, seed]);
  const a = t - t0; if (a < 0 || a > life) return null;
  const k = a / life;
  return (
    <group position={origin}>
      {items.map((it, i) => (
        <sprite key={i} position={[it.dx * spread * (0.3 + k), it.up * (0.3 + k * 1.2), it.dz * spread * (0.3 + k)]} scale={size * it.s * (0.5 + k * 1.5)}>
          <spriteMaterial map={puffTex()} color={color} transparent opacity={(1 - k) * 0.8} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
};

const billTex = () => ctex("bill", 256, 128, (g) => { g.fillStyle = "#9fcf8a"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#3f7a3a"; g.lineWidth = 8; g.strokeRect(8, 8, 240, 112); g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(128, 64, 30, 0, 7); g.fill(); g.fillStyle = "#cfe8c0"; g.font = "900 44px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 128, 66); });
export const Money: React.FC<{ origin: V3; t0: number; n?: number; mode?: "rain" | "blow"; seed?: number; area?: number }> = ({ origin, t0, n = 30, mode = "rain", seed = 9, area = 2.5 }) => {
  const t = useT();
  const items = useMemo(() => { const r = rng(seed); return Array.from({ length: n }, () => ({ x: (r() - 0.5) * area, z: (r() - 0.5) * area, y: 1.5 + r() * 2.5, ph: r() * 6, sp: 0.6 + r() * 0.6, d: r() })); }, [n, seed, area]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: billTex(), side: THREE.DoubleSide, roughness: 0.8 }), []);
  const a = t - t0; if (a < 0) return null;
  return (
    <group position={origin}>
      {items.map((it, i) => {
        const fall = mode === "rain" ? Math.max(0.05, it.y - a * it.sp * 1.1) : Math.max(0.05, 0.4 + Math.sin(a * 2 + it.ph) * 0.6 + a * 0.8);
        const drift = mode === "blow" ? a * (3 + it.d * 4) : Math.sin(a * 2 + it.ph) * 0.3;
        return <mesh key={i} material={mat} position={[it.x + drift, fall, it.z + (mode === "blow" ? -a * it.d * 2 : 0)]} rotation={[Math.sin(a * 3 + it.ph) * 1.2, a * 2 + it.ph, Math.cos(a * 2.5 + it.ph) * 0.8]} castShadow><planeGeometry args={[0.32, 0.16]} /></mesh>;
      })}
    </group>
  );
};

export const Rain: React.FC<{ center: V3; area?: [number, number, number]; count?: number; speed?: number }> = ({ center, area = [30, 16, 40], count = 3000, speed = 22 }) => {
  const t = useT();
  const { geo, base } = useMemo(() => {
    const r = rng(17), base = new Float32Array(count * 3); for (let i = 0; i < count * 3; i++) base[i] = r();
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3)); return { geo, base };
  }, [count]);
  const p = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const x = center[0] + (base[i * 3] - 0.5) * area[0], z = center[2] + (base[i * 3 + 2] - 0.5) * area[2];
    const y = center[1] + ((((base[i * 3 + 1] - (t * speed) / area[1]) % 1) + 1) % 1) * area[1];
    p.setXYZ(i * 2, x, y, z); p.setXYZ(i * 2 + 1, x - 0.05, y - 0.55, z + 0.08);
  }
  p.needsUpdate = true;
  return <lineSegments geometry={geo} layers={LAYER_FX}><lineBasicMaterial color="#b9c8e8" transparent opacity={0.55} /></lineSegments>;
};

/* ---------------- boards and signs ---------------- */
export const Board: React.FC<{ pos: V3; rotY?: number; w: number; h: number; draw: (g: CanvasRenderingContext2D) => void; k: string; post?: number; glow?: number; posts?: 1 | 2 }> = ({ pos, rotY = 0, w, h, draw, k, post = 0, glow = 0, posts = 2 }) => {
  const mat = useMemo(() => { const tx = signCanvas(k, Math.round(256 * w), Math.round(256 * h), draw); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, roughness: 0.6, emissive: "#ffffff", emissiveIntensity: glow }); }, [k, glow]);
  const steel = useMemo(() => M("#9a9ea6", 0.4, { metalness: 0.5 }), []);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, post + h / 2, 0.03]} material={mat} castShadow><planeGeometry args={[w, h]} /></mesh>
      <mesh position={[0, post + h / 2, -0.01]} material={steel} castShadow><boxGeometry args={[w + 0.06, h + 0.06, 0.06]} /></mesh>
      {post > 0 ? (posts === 2 ? [-1, 1].map((s) => <mesh key={s} position={[s * w * 0.32, post / 2, -0.06]} material={steel} castShadow><cylinderGeometry args={[0.05, 0.05, post, 8]} /></mesh>) : <mesh position={[0, post / 2, -0.06]} material={steel} castShadow><cylinderGeometry args={[0.06, 0.06, post, 8]} /></mesh>) : null}
    </group>
  );
};

/* lawn chair (folding, webbed) */
export const LawnChair: React.FC<{ pos: V3; rotY?: number; open?: number }> = ({ pos, rotY = 0, open = 1 }) => {
  const al = useMemo(() => M("#c9ccd2", 0.35, { metalness: 0.5 }), []);
  const web = useMemo(() => new THREE.MeshStandardMaterial({ map: ctex("web", 128, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#2f7a6a" : "#e8e2d0"; g.fillRect(i * 16, 0, 16, 128); } }), side: THREE.DoubleSide, roughness: 0.8 }), []);
  const k = clamp01(open);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={[1, 0.2 + 0.8 * k, 1]}>
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2 + 0.08, 0, 0]} material={web} castShadow><planeGeometry args={[0.6, 0.55]} /></mesh>
      <mesh position={[0, 0.72, -0.32]} rotation={[-0.35, 0, 0]} material={web} castShadow><planeGeometry args={[0.6, 0.62]} /></mesh>
      {[-1, 1].map((s) => <group key={s}>
        <mesh position={[s * 0.31, 0.22, 0.12]} rotation={[0.5, 0, 0]} material={al}><cylinderGeometry args={[0.02, 0.02, 0.55, 6]} /></mesh>
        <mesh position={[s * 0.31, 0.22, -0.12]} rotation={[-0.5, 0, 0]} material={al}><cylinderGeometry args={[0.02, 0.02, 0.55, 6]} /></mesh>
        <mesh position={[s * 0.31, 0.62, 0.0]} rotation={[Math.PI / 2, 0, 0]} material={al}><cylinderGeometry args={[0.02, 0.02, 0.55, 6]} /></mesh>
      </group>)}
    </group>
  );
};

/* chainsaw held in the scene (simple) */
export const Chainsaw: React.FC<{ pos: V3; rotY?: number; rotZ?: number; run?: boolean }> = ({ pos, rotY = 0, rotZ = 0, run }) => {
  const t = useT();
  return (
    <group position={pos} rotation={[0, rotY, rotZ]}>
      <mesh material={M("#e8762a", 0.5)} castShadow><boxGeometry args={[0.3, 0.26, 0.5]} /></mesh>
      <mesh position={[0, 0, 0.55]} material={M("#c9ccd2", 0.3, { metalness: 0.6 })} castShadow><boxGeometry args={[0.05, 0.14 + (run ? Math.sin(t * 80) * 0.004 : 0), 0.75]} /></mesh>
    </group>
  );
};
