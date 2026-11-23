// Anime character kit: turns a CC0 VRoid base (VRM) into one of OUR characters, entirely in code.
// - recolour / pattern any outfit texture while keeping the original folds and shading
// - grow new skinned clothing (sleeves, coats, boots) as "shells" over the body, so it bends with every pose
// - add our own procedural pieces (hats, ponytails, gun belts, coat tails) with anime toon shading + ink outline
// - paint the face (scars, brows), recolour eyes, reshape the body, set a default expression
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MToonMaterial, VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

export type HB = Parameters<VRM["humanoid"]["getRawBoneNode"]>[0];

// a fresh copy every time: several characters can share one base model
export const loadFresh = (url: string) => new Promise<VRM>((res, rej) => {
  const l = new GLTFLoader(); l.register((p) => new VRMLoaderPlugin(p));
  l.load(url, (g) => { const v = g.userData.vrm as VRM; VRMUtils.rotateVRM0(v); v.scene.updateMatrixWorld(true); res(v); }, undefined, rej);
});

// ---------- finding parts ----------
export const meshesBy = (vrm: VRM, matName: string) => {
  const out: THREE.SkinnedMesh[] = [];
  vrm.scene.traverse((o) => { const m = o as THREE.SkinnedMesh; if (m.isMesh) { const mat = Array.isArray(m.material) ? m.material[0] : m.material; if (mat.name.includes(matName)) out.push(m); } });
  return out;
};
export const surf = (m: THREE.Mesh) => (Array.isArray(m.material) ? m.material[0] : m.material) as MToonMaterial;
export const hide = (vrm: VRM, matName: string) => meshesBy(vrm, matName).forEach((m) => (m.visible = false));

// ---------- texture painting ----------
const imgOf = (t: THREE.Texture | null) => (t ? (t.image as CanvasImageSource & { width: number; height: number }) : null);
export type Paint = (g: CanvasRenderingContext2D, w: number, h: number) => void;
// Recolour keeping the original light/shadow: out = colour * (luma / lumaMid)
export const recolorTex = (src: THREE.Texture, color: string, opts: { strength?: number; paint?: Paint; keep?: (x: number, y: number) => boolean } = {}) => {
  const im = imgOf(src)!; const w = im.width, h = im.height;
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(im, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h), p = d.data; const col = new THREE.Color(color).convertLinearToSRGB();
  const k = opts.strength ?? 1;
  let sum = 0, n = 0; for (let i = 0; i < p.length; i += 64) if (p[i + 3] > 10) { sum += p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11; n++; }
  const mid = Math.max(40, sum / Math.max(1, n));
  for (let i = 0; i < p.length; i += 4) {
    if (opts.keep) { const px = (i / 4) % w, py = Math.floor(i / 4 / w); if (opts.keep(px / w, py / h)) continue; }
    const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / mid; const f = Math.min(1.35, 0.25 + 0.75 * l);
    p[i] = p[i] * (1 - k) + Math.min(255, col.r * 255 * f) * k; p[i + 1] = p[i + 1] * (1 - k) + Math.min(255, col.g * 255 * f) * k; p[i + 2] = p[i + 2] * (1 - k) + Math.min(255, col.b * 255 * f) * k;
  }
  g.putImageData(d, 0, 0);
  if (opts.paint) { g.save(); opts.paint(g, w, h); g.restore(); }
  const t = new THREE.CanvasTexture(c); t.flipY = src.flipY; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = src.wrapS; t.wrapT = src.wrapT; t.anisotropy = 8;
  return t;
};
// paint on top of a texture without recolouring (scars, brows, freckles)
export const paintTex = (src: THREE.Texture, paint: Paint, clear = false) => {
  const im = imgOf(src)!; const w = im.width, h = im.height;
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!;
  if (!clear) g.drawImage(im, 0, 0, w, h);
  paint(g, w, h);
  const t = new THREE.CanvasTexture(c); t.flipY = src.flipY; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
export const setTex = (mat: MToonMaterial, t: THREE.Texture, shadeDarken = 0.72) => {
  mat.map = t; mat.shadeMultiplyTexture = t; mat.color.set(1, 1, 1); mat.shadeColorFactor.setScalar(shadeDarken); mat.needsUpdate = true;
};
export const recolor = (vrm: VRM, matName: string, color: string, opts: Parameters<typeof recolorTex>[2] = {}, shade = 0.72) => {
  for (const m of meshesBy(vrm, matName)) { const s = surf(m); if (s.map) setTex(s, recolorTex(s.map, color, opts), shade); }
};

// ---------- bones ----------
const HUMANOID: HB[] = ["hips","spine","chest","upperChest","neck","head","leftEye","rightEye","jaw","leftShoulder","leftUpperArm","leftLowerArm","leftHand","rightShoulder","rightUpperArm","rightLowerArm","rightHand","leftUpperLeg","leftLowerLeg","leftFoot","leftToes","rightUpperLeg","rightLowerLeg","rightFoot","rightToes","leftThumbMetacarpal","leftThumbProximal","leftThumbDistal","leftIndexProximal","leftIndexIntermediate","leftIndexDistal","leftMiddleProximal","leftMiddleIntermediate","leftMiddleDistal","leftRingProximal","leftRingIntermediate","leftRingDistal","leftLittleProximal","leftLittleIntermediate","leftLittleDistal","rightThumbMetacarpal","rightThumbProximal","rightThumbDistal","rightIndexProximal","rightIndexIntermediate","rightIndexDistal","rightMiddleProximal","rightMiddleIntermediate","rightMiddleDistal","rightRingProximal","rightRingIntermediate","rightRingDistal","rightLittleProximal","rightLittleIntermediate","rightLittleDistal"] as HB[];
// a vertex belongs to a body part if its main bone is that part, or a non-body helper bone (twist, cloth) hanging under it
const boneIdSet = (vrm: VRM, mesh: THREE.SkinnedMesh, bones: HB[]) => {
  const want = new Set<THREE.Object3D>(bones.map((b) => vrm.humanoid.getRawBoneNode(b)).filter((x): x is THREE.Object3D => !!x));
  const human = new Set<THREE.Object3D>(HUMANOID.map((b) => { try { return vrm.humanoid.getRawBoneNode(b); } catch { return null; } }).filter((x): x is THREE.Object3D => !!x));
  const ids = new Set<number>();
  mesh.skeleton.bones.forEach((b, i) => { let o: THREE.Object3D | null = b; while (o) { if (human.has(o)) { if (want.has(o)) ids.add(i); return; } o = o.parent; } });
  return ids;
};
const domBone = (sk: THREE.BufferAttribute, sw: THREE.BufferAttribute, v: number) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(v, k); if (w > bw) { bw = w; best = sk.getComponent(v, k); } } return best; };

// keep only triangles whose vertices are all weighted (mostly) to the given bones; optional extra test in bind-pose world space
export const filterTris = (vrm: VRM, mesh: THREE.SkinnedMesh, bones: HB[] | null, test?: (p: THREE.Vector3, n: THREE.Vector3) => boolean, invert = false) => {
  const g = mesh.geometry; const ids = bones ? boneIdSet(vrm, mesh, bones) : null;
  const sk = g.getAttribute("skinIndex") as THREE.BufferAttribute, sw = g.getAttribute("skinWeight") as THREE.BufferAttribute;
  const pos = g.getAttribute("position") as THREE.BufferAttribute, nor = g.getAttribute("normal") as THREE.BufferAttribute;
  const ok = new Uint8Array(pos.count); const P = new THREE.Vector3(), N = new THREE.Vector3();
  const mw = mesh.matrixWorld, nm = new THREE.Matrix3().getNormalMatrix(mw);
  for (let v = 0; v < pos.count; v++) {
    let s = ids ? ids.has(domBone(sk, sw, v)) : true;
    if (s && test) { P.fromBufferAttribute(pos, v).applyMatrix4(mw); N.fromBufferAttribute(nor, v).applyMatrix3(nm).normalize(); s = test(P, N); }
    ok[v] = (invert ? !s : s) ? 1 : 0;
  }
  const idx = g.index!; const out: number[] = [];
  for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2); if (ok[a] && ok[b] && ok[c]) out.push(a, b, c); }
  return out;
};
// remove triangles from an existing mesh (e.g. the shirt's own sleeves under a new coat)
export const cutAway = (vrm: VRM, matName: string, bones: HB[] | null, test?: (p: THREE.Vector3, n: THREE.Vector3) => boolean) => {
  for (const m of meshesBy(vrm, matName)) {
    const keep = filterTris(vrm, m, bones, test, true); const g = m.geometry.clone(); g.setIndex(keep); g.clearGroups();
    const nm = Array.isArray(m.material) ? m.material.length : 1; for (let k = 0; k < nm; k++) g.addGroup(0, keep.length, k); m.geometry = g;
  }
};

// ---------- toon material + ink outline for our own pieces ----------
export const toon = (color: string, o: { shade?: number; map?: THREE.Texture; rim?: number; side?: THREE.Side; alphaTest?: number } = {}) => {
  const m = new MToonMaterial();
  m.color.set(color); m.shadeColorFactor.copy(new THREE.Color(color).multiplyScalar(o.shade ?? 0.6));
  m.shadingToonyFactor = 0.92; m.shadingShiftFactor = -0.05;
  if (o.map) { m.map = o.map; m.shadeMultiplyTexture = o.map; }
  m.parametricRimColorFactor.setScalar(o.rim ?? 0.08); m.parametricRimFresnelPowerFactor = 3; m.parametricRimLiftFactor = 0.05;
  m.side = o.side ?? THREE.FrontSide; if (o.alphaTest) { m.alphaTest = o.alphaTest; m.transparent = false; }
  m.needsUpdate = true; return m;
};
export const inkMat = (width = 0.004, color = "#1b1416") => {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = vec3(position) + normalize(objectNormal) * ${width.toFixed(5)};`); };
  return m;
};
export const withInk = (mesh: THREE.Mesh, width = 0.004) => { const o = new THREE.Mesh(mesh.geometry, inkMat(width)); mesh.add(o); return o; };

// ---------- shells: new clothing grown over existing skinned surfaces ----------
// takes triangles of `matName` meshes weighted to `bones` (+ optional test), pushes them out by `off` metres
export const shell = (vrm: VRM, matName: string, bones: HB[] | null, off: number, mat: THREE.Material, test?: (p: THREE.Vector3, n: THREE.Vector3) => boolean, ink = 0.0035) => {
  const out: THREE.SkinnedMesh[] = [];
  for (const src of meshesBy(vrm, matName)) {
    const tri = filterTris(vrm, src, bones, test); if (!tri.length) continue;
    const g0 = src.geometry; const g = new THREE.BufferGeometry();
    for (const k of ["position", "normal", "uv", "skinIndex", "skinWeight"]) { const a = g0.getAttribute(k); if (a) g.setAttribute(k, (a as THREE.BufferAttribute).clone()); }
    const pos = g.getAttribute("position") as THREE.BufferAttribute, nor = g.getAttribute("normal") as THREE.BufferAttribute;
    for (let v = 0; v < pos.count; v++) pos.setXYZ(v, pos.getX(v) + nor.getX(v) * off, pos.getY(v) + nor.getY(v) * off, pos.getZ(v) + nor.getZ(v) * off);
    g.setIndex(tri); g.computeBoundingSphere();
    const m = new THREE.SkinnedMesh(g, mat); m.bind(src.skeleton, src.bindMatrix); m.frustumCulled = false;
    m.position.copy(src.position); m.quaternion.copy(src.quaternion); m.scale.copy(src.scale);
    src.parent!.add(m);
    if (ink > 0) { const o = new THREE.SkinnedMesh(g, inkMat(ink)); o.bind(src.skeleton, src.bindMatrix); o.frustumCulled = false; o.position.copy(m.position); o.quaternion.copy(m.quaternion); o.scale.copy(m.scale); src.parent!.add(o); }
    out.push(m);
  }
  return out;
};

// ---------- measuring the head / body in the rest pose ----------
// bounding box of the vertices a part actually uses (VRoid parts share one vertex buffer, so geometry.boundingBox is the whole body)
export const bbox = (vrm: VRM, matName: string) => {
  const b = new THREE.Box3(), P = new THREE.Vector3();
  for (const m of meshesBy(vrm, matName)) { const pos = m.geometry.getAttribute("position"), idx = m.geometry.index; const seen = new Uint8Array(pos.count);
    const n = idx ? idx.count : pos.count; for (let i = 0; i < n; i++) { const v = idx ? idx.getX(i) : i; if (seen[v]) continue; seen[v] = 1; b.expandByPoint(P.fromBufferAttribute(pos, v).applyMatrix4(m.matrixWorld)); } }
  return b;
};
export const bonePos = (vrm: VRM, b: HB) => vrm.humanoid.getRawBoneNode(b)!.getWorldPosition(new THREE.Vector3());
// attach a world-space object to a bone, keeping where it is now
export const attach = (vrm: VRM, b: HB, o: THREE.Object3D) => { vrm.scene.updateMatrixWorld(true); vrm.humanoid.getRawBoneNode(b)!.attach(o); return o; };
// facing: VRM 0.x is turned 180° by rotateVRM0, so the face looks towards +Z either way after rotation
export const FWD = 1;

// ---------- our procedural pieces ----------
const lathe = (pts: [number, number][], seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const hat = (style: "flat" | "bowler" | "straw" | "cowboy", color: string, band: string, r: number) => {
  const grp = new THREE.Group();
  let crown: [number, number][]; let brimR: number; let brimCurl = 0;
  if (style === "flat") { crown = [[0, r * 0.95], [r * 0.95, r * 0.95], [r * 1.0, r * 0.6], [r * 1.02, 0]]; brimR = r * 2.0; }
  else if (style === "bowler") { crown = [[0, r * 1.05], [r * 0.55, r * 1.02], [r * 0.9, r * 0.85], [r * 1.03, r * 0.45], [r * 1.02, 0]]; brimR = r * 1.32; brimCurl = 0.25; }
  else if (style === "straw") { crown = [[0, r * 0.8], [r * 0.85, r * 0.85], [r * 1.0, r * 0.5], [r * 1.02, 0]]; brimR = r * 2.05; brimCurl = -0.05; }
  else { crown = [[0, r * 0.85], [r * 0.5, r * 0.75], [r * 0.8, r * 0.95], [r * 1.0, r * 0.6], [r * 1.02, 0]]; brimR = r * 1.85; brimCurl = 0.35; }
  const cm = toon(color, { side: THREE.DoubleSide });
  const c = new THREE.Mesh(lathe(crown), cm); grp.add(c); withInk(c, 0.004);
  const bp: [number, number][] = []; for (let i = 0; i <= 8; i++) { const t = i / 8; const rr = r * 0.98 + (brimR - r * 0.98) * t; bp.push([rr, brimCurl * r * t * t * 1.4]); }
  const brim = new THREE.Mesh(lathe(bp.concat(bp.slice().reverse().map(([rr, y]) => [rr, y - r * 0.05] as [number, number]))), cm); brim.scale.set(1, 1, 0.9); grp.add(brim); withInk(brim, 0.004);
  const bandM = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.035, r * 1.04, r * 0.22, 48, 1, true), toon(band, { side: THREE.DoubleSide })); bandM.position.y = r * 0.12; grp.add(bandM);
  if (style === "flat") { // silver conchos on the band
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const s = new THREE.Mesh(new THREE.SphereGeometry(r * 0.06, 12, 8), toon("#d9dde3", { rim: 0.4 })); s.scale.z = 0.4; s.position.set(Math.sin(a) * r * 1.05, r * 0.12, Math.cos(a) * r * 1.05); s.lookAt(0, r * 0.12, 0); grp.add(s); }
  }
  if (style === "straw") { cm.map = strawTex(color); cm.shadeMultiplyTexture = cm.map; cm.needsUpdate = true; }
  return grp;
};
const strawTex = (color: string) => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!; g.fillStyle = color; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(90,60,20,0.35)"; for (let y = 0; y < 256; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y + 3); g.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.colorSpace = THREE.SRGBColorSpace; return t; };

// tapered tube along a curve (ponytails, braids, scarves, belts)
export const taperTube = (pts: THREE.Vector3[], r0: number, r1: number, seg = 40, rad = 14, flat = 1) => {
  const curve = new THREE.CatmullRomCurve3(pts); const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [], idx: number[] = [], uv: number[] = [];
  for (let i = 0; i <= seg; i++) { const t = i / seg, p = curve.getPointAt(t), r = r0 + (r1 - r0) * Math.pow(t, 0.8);
    for (let j = 0; j <= rad; j++) { const a = (j / rad) * Math.PI * 2; const n = frames.normals[i].clone().multiplyScalar(Math.cos(a) * r).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a) * r * flat)); pos.push(p.x + n.x, p.y + n.y, p.z + n.z); uv.push(j / rad, t); } }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
export const hairStrandTex = (base: string, dark: string) => { const c = document.createElement("canvas"); c.width = 128; c.height = 256; const g = c.getContext("2d")!; g.fillStyle = base; g.fillRect(0, 0, 128, 256); for (let i = 0; i < 40; i++) { g.strokeStyle = i % 3 ? dark : "rgba(255,255,255,0.35)"; g.globalAlpha = 0.5; g.lineWidth = 1 + Math.random() * 2; const x = Math.random() * 128; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 10, 256); g.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; };

// open-front coat skirt (tails) hanging from the hips: elliptical cone with a front slit
export const coatSkirt = (w: number, d: number, top: number, len: number, flare: number, slit: number, color: string, tex?: THREE.Texture) => {
  const seg = 48, rows = 10; const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const a0 = slit, a1 = Math.PI * 2 - slit; // angle 0 = front (+Z)
  for (let i = 0; i <= rows; i++) { const t = i / rows, y = top - len * t, s = 1 + flare * t * t;
    for (let j = 0; j <= seg; j++) { const a = a0 + (a1 - a0) * (j / seg); pos.push(Math.sin(a) * w * s, y, Math.cos(a) * d * s + (t * t * -0.02)); uv.push(j / seg, t); } }
  for (let i = 0; i < rows; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon(color, { side: THREE.DoubleSide, map: tex })); withInk(m, 0.004); return m;
};
export const clothTex = (base: string, line: string, kind: "plain" | "plaid" | "stripe" | "weave", scale = 1) => {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d")!; g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = line; g.fillStyle = line;
  if (kind === "plaid") { const s = 64 * scale; g.globalAlpha = 0.35; for (let x = 0; x < 512; x += s) { g.fillRect(x, 0, s * 0.35, 512); g.fillRect(0, x, 512, s * 0.35); } g.globalAlpha = 0.6; g.lineWidth = 2; for (let x = s * 0.7; x < 512; x += s) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.moveTo(0, x); g.lineTo(512, x); g.stroke(); } }
  if (kind === "stripe") { g.globalAlpha = 0.4; g.lineWidth = 2; for (let x = 0; x < 512; x += 18 * scale) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } }
  if (kind === "weave") { g.globalAlpha = 0.12; for (let i = 0; i < 3000; i++) { g.fillRect(Math.random() * 512, Math.random() * 512, 2, 1); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
};

// body proportions: scale a bone, undoing the scale on its children so only that part changes shape
export const shapeBone = (vrm: VRM, b: HB, s: [number, number, number], keepChildren = true) => {
  const n = vrm.humanoid.getRawBoneNode(b); if (!n) return; n.scale.set(s[0], s[1], s[2]);
  if (keepChildren) for (const c of n.children) if ((c as THREE.Bone).isBone) c.scale.set(1 / s[0], 1 / s[1], 1 / s[2]);
};

// the bases carry a strong matcap/rim highlight that draws thin gold lines along cloth edges; our style is flatter
export const calmRim = (vrm: VRM) => vrm.scene.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; for (const mt of (Array.isArray(m.material) ? m.material : [m.material]) as MToonMaterial[]) { if ((mt as unknown as { isMToonMaterial?: boolean }).isMToonMaterial) { mt.matcapFactor?.setScalar(0); mt.parametricRimColorFactor?.setScalar(0); mt.rimLightingMixFactor = 1; } } });
// anime "older / meaner" face lines painted on the face texture (u,v in 0..1 of the standard VRoid face sheet)
export const faceLines = (g: CanvasRenderingContext2D, w: number, h: number, o: { eyeBags?: number; smile?: number; cheek?: number; color?: string } = {}) => {
  const L = (pts: [number, number][], a: number, lw: number) => { g.strokeStyle = (o.color ?? "rgba(110,60,55,A)").replace("A", String(a)); g.lineWidth = lw * w; g.lineCap = "round"; g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(u * w, v * h) : g.moveTo(u * w, v * h))); g.stroke(); };
  if (o.eyeBags) for (const s of [1, -1]) { const c = s > 0 ? 0.343 : 0.653; L([[c - 0.045, 0.583], [c, 0.592], [c + 0.045, 0.583]], o.eyeBags, 0.0035); }
  if (o.smile) { L([[0.468, 0.676], [0.452, 0.71], [0.44, 0.742]], o.smile, 0.0032); L([[0.532, 0.676], [0.548, 0.71], [0.56, 0.742]], o.smile, 0.0032); }
  if (o.cheek) for (const c of [0.3, 0.7]) for (let i = 0; i < 3; i++) L([[c - 0.012 + i * 0.012, 0.615], [c - 0.02 + i * 0.012, 0.638]], o.cheek, 0.0025);
};

// fine face control: drive the individual VRoid face morphs (brows / eyes / mouth separately), e.g. { Fcl_BRW_Angry: 0.8 }
export const setMorphs = (vrm: VRM, w: Record<string, number>) => vrm.scene.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !m.morphTargetDictionary || !m.morphTargetInfluences) return;
  for (const [k, v] of Object.entries(w)) for (const [name, i] of Object.entries(m.morphTargetDictionary)) if (name.endsWith(k)) m.morphTargetInfluences[i] = v; });
