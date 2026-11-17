// Samulation #5 "The Tree Nobody Can Miss" - roadside props (helper 3): barbed-wire fences, utility poles + wires,
// "NEXT TREE 20 MI" guide sign, speed-limit sign, delineators, mailbox, skid marks + ruts at the oak, distant farmstead.
// Contract: see world.ts (metres, Y up, road along Z). Deterministic: rng() only.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ROADW, SHOULDER, FENCE_X, SIGN, TREE, Z_NEAR, Z_FAR, groundY, rng, Part } from "./world";

/** set false to drop the farm's shelter-belt trees (story: the oak is the only tree for 20 miles) */
const FARM_TREES = true;

const POST_STEP = 4.0;           // fence post spacing (m)
const POLE_X = -13, POLE_STEP = 50;
const NEAR_Z0 = -60, NEAR_Z1 = 190; // high-detail zone around the camera path (z 150 -> 72) and the oak

/* ------------------------------------------------------------------ helpers */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const roadY = (x: number) => 0.02 + 0.06 * (1 - (x / (ROADW / 2)) ** 2);
/** height of whatever surface is at (x,z): asphalt crown, gravel shoulder or terrain */
function surfaceY(x: number, z: number) {
  const ax = Math.abs(x);
  if (ax < ROADW / 2) return roadY(x);
  if (ax < ROADW / 2 + SHOULDER) return Math.min(0.02, groundY(x, 0) + 0.04);
  return groundY(x, z);
}
function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D];
}
function canvasTex(c: HTMLCanvasElement, srgb: boolean, repeat: [number, number] = [1, 1]) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t;
}
function shadows<T extends THREE.Object3D>(o: T, cast = true, receive = true): T {
  o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = cast; m.receiveShadow = receive; } }); return o;
}
/** append a thin tube following pts (tangent ~ along Z, so the ring basis is just X/Y) */
function tubeInto(pos: number[], idx: number[], pts: THREE.Vector3[], r: number, sides: number) {
  const base = pos.length / 3;
  for (const p of pts) for (let s = 0; s < sides; s++) {
    const a = (s / sides) * Math.PI * 2 + 0.3; pos.push(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, p.z);
  }
  for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < sides; s++) {
    const a = base + i * sides + s, b = base + i * sides + ((s + 1) % sides), c = a + sides, d = b + sides;
    idx.push(a, c, b, b, c, d);
  }
}
function tubeGeom(pos: number[], idx: number[]) {
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeVertexNormals(); g.computeBoundingSphere(); return g;
}
function tris(o: THREE.Object3D) {
  let n = 0;
  o.traverse((m) => {
    const mesh = m as THREE.Mesh; if (!mesh.isMesh) return;
    const g = mesh.geometry; const c = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    n += c * ((mesh as THREE.InstancedMesh).isInstancedMesh ? (mesh as THREE.InstancedMesh).count : 1);
  });
  return n;
}

/* ------------------------------------------------------------------ textures */
/** weathered split-wood grain (silver-grey cedar). Returns [colour, bump] */
function woodTextures(seed: number, tone: [number, number, number], w = 128, h = 512) {
  const r = rng(seed);
  const [c, x] = canvas(w, h); const [bc, bx] = canvas(w, h);
  x.fillStyle = `rgb(${tone[0]},${tone[1]},${tone[2]})`; x.fillRect(0, 0, w, h);
  bx.fillStyle = "rgb(150,150,150)"; bx.fillRect(0, 0, w, h);
  // long grain streaks
  for (let i = 0; i < 260; i++) {
    const gx = r() * w, lw = 0.6 + r() * 2.2, k = r() < 0.5 ? -1 : 1, a = 0.05 + r() * 0.16;
    const sh = k < 0 ? `rgba(30,24,18,${a})` : `rgba(235,228,215,${a * 0.8})`;
    x.strokeStyle = sh; x.lineWidth = lw; x.beginPath();
    let px = gx; x.moveTo(px, 0);
    for (let y = 0; y <= h; y += 16) { px += (r() - 0.5) * 1.3; x.lineTo(px, y); }
    x.stroke();
    bx.strokeStyle = k < 0 ? `rgba(60,60,60,${a * 1.6})` : `rgba(210,210,210,${a})`; bx.lineWidth = lw;
    bx.beginPath(); px = gx; bx.moveTo(px, 0); for (let y = 0; y <= h; y += 16) { px += (r() - 0.5) * 1.3; bx.lineTo(px, y); } bx.stroke();
  }
  // checks / cracks (dark, deep)
  for (let i = 0; i < 9; i++) {
    let px = r() * w, y0 = r() * h * 0.8, len = 40 + r() * 220;
    x.strokeStyle = "rgba(18,14,10,0.75)"; bx.strokeStyle = "rgba(0,0,0,0.95)"; x.lineWidth = bx.lineWidth = 0.8 + r() * 1.6;
    x.beginPath(); bx.beginPath(); x.moveTo(px, y0); bx.moveTo(px, y0);
    for (let y = y0; y < y0 + len; y += 8) { px += (r() - 0.5) * 1.5; x.lineTo(px, y); bx.lineTo(px, y); }
    x.stroke(); bx.stroke();
  }
  // lichen / dirt blotches, darker near the ground (bottom of texture = v 0 = post foot)
  for (let i = 0; i < 70; i++) {
    const px = r() * w, py = r() * h, rad = 2 + r() * 9;
    x.fillStyle = r() < 0.3 ? `rgba(120,128,90,${0.1 + r() * 0.15})` : `rgba(40,32,24,${0.06 + r() * 0.12})`;
    x.beginPath(); x.arc(px, py, rad, 0, Math.PI * 2); x.fill();
  }
  const gr = x.createLinearGradient(0, h, 0, h * 0.72); gr.addColorStop(0, "rgba(38,30,20,0.55)"); gr.addColorStop(1, "rgba(38,30,20,0)");
  x.fillStyle = gr; x.fillRect(0, 0, w, h);
  return [canvasTex(c, true), canvasTex(bc, false)] as const;
}

/* ------------------------------------------------------------------ 1. barbed-wire fences */
function buildFences(root: THREE.Group, wood: readonly [THREE.Texture, THREE.Texture]) {
  const r = rng(301);
  const nPerSide = Math.floor((Z_NEAR - Z_FAR) / POST_STEP) + 1;
  // wooden post: slightly irregular 7-sided log, base at y=0, 1.0 unit tall (scaled per instance)
  const pg = new THREE.CylinderGeometry(0.062, 0.07, 1, 7, 3).translate(0, 0.5, 0);
  { const pr = rng(7); const p = pg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 1 + (pr() - 0.5) * 0.12; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); if (y > 0.99) p.setY(i, y + (p.getX(i) * 0.25)); }
    pg.computeVertexNormals(); }
  const pm = new THREE.MeshStandardMaterial({ map: wood[0], bumpMap: wood[1], bumpScale: 2.5, roughness: 0.92, color: 0xffffff });
  // steel T-post: green painted, white tip (vertex colour)
  const tShape = new THREE.Shape([V(-0.022, 0, 0), V(0.022, 0, 0), V(0.022, 0.006, 0), V(0.004, 0.006, 0), V(0.004, 0.034, 0), V(-0.004, 0.034, 0), V(-0.004, 0.006, 0), V(-0.022, 0.006, 0)].map((v) => new THREE.Vector2(v.x, v.y)));
  const tg = new THREE.ExtrudeGeometry(tShape, { depth: 1.62, bevelEnabled: false, steps: 1 }).rotateX(-Math.PI / 2).translate(0, -0.25, 0);
  { const p = tg.attributes.position as THREE.BufferAttribute; const col: number[] = [];
    for (let i = 0; i < p.count; i++) { const tip = p.getY(i) > 1.27; col.push(tip ? 0.82 : 0.1, tip ? 0.82 : 0.2, tip ? 0.8 : 0.12); }
    tg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); tg.computeVertexNormals(); }
  const tm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.35 });

  type Post = { m: THREE.Matrix4; h: number; side: number; z: number };
  const woodM: Post[] = [], steelM: Post[] = [];
  const all: Post[][] = [[], []];
  const q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  [-1, 1].forEach((side, si) => {
    let sinceSteel = 0;
    for (let i = 0; i < nPerSide; i++) {
      const z = Z_NEAR - i * POST_STEP + (r() - 0.5) * 0.5;
      const x = side * FENCE_X + (r() - 0.5) * 0.12;
      const steel = sinceSteel > 3 && r() < 0.28; sinceSteel = steel ? 0 : sinceSteel + 1;
      const h = steel ? 1.32 : 1.22 + r() * 0.2;
      e.set((r() - 0.5) * 0.07, r() * Math.PI * 2, (r() - 0.5) * 0.07); q.setFromEuler(e);
      if (steel) { e.set((r() - 0.5) * 0.05, side > 0 ? 0 : Math.PI, (r() - 0.5) * 0.05); q.setFromEuler(e); }
      sc.set(1, steel ? 1 : h + 0.08, 1); ps.set(x, groundY(x, z) - (steel ? 0 : 0.08), z);
      const m = new THREE.Matrix4().compose(ps, q, sc);
      const post: Post = { m, h: steel ? 1.32 : h, side, z };
      (steel ? steelM : woodM).push(post); all[si].push(post);
    }
  });
  const wim = new THREE.InstancedMesh(pg, pm, woodM.length);
  const cr = rng(17); const col = new THREE.Color();
  woodM.forEach((p, i) => { wim.setMatrixAt(i, p.m); const k = 0.72 + cr() * 0.4; col.setRGB(k, k * (0.96 + cr() * 0.05), k * (0.9 + cr() * 0.08)); wim.setColorAt(i, col); });
  const tim = new THREE.InstancedMesh(tg, tm, steelM.length); steelM.forEach((p, i) => tim.setMatrixAt(i, p.m));
  root.add(shadows(wim), shadows(tim));

  // wires: 4 strands (galvanised, 2-strand twisted ~5 mm), field side of the posts, sagging between posts
  const STRANDS = [0.42, 0.72, 1.0, 1.24];
  const wpos: number[] = [], widx: number[] = [];
  const barbPts: THREE.Vector3[] = [];
  const wr = rng(55);
  all.forEach((posts) => {
    for (let s = 0; s < STRANDS.length; s++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < posts.length; i++) {
        const P = posts[i];
        // attach point in world space: field side of the post (local x offset), at strand height above ground
        const groundAt = groundY(P.side * FENCE_X, P.z);
        const wy = groundAt + STRANDS[s] * (P.h / 1.3) + (wr() - 0.5) * 0.03;
        const a = V(P.side * (FENCE_X + 0.075), wy, P.z);
        // follow the post's lean: shift by lean * height
        const top = V(0, 1, 0).applyMatrix4(P.m).sub(V(0, 0, 0).applyMatrix4(P.m)).normalize();
        a.x += top.x * STRANDS[s]; a.z += top.z * STRANDS[s];
        if (i > 0) {
          const b = pts[pts.length - 1];
          const near = P.z > NEAR_Z0 && P.z < NEAR_Z1;
          const segs = near ? 6 : 1; const sag = 0.025 + 0.02 * wr();
          for (let k = 1; k <= segs; k++) {
            const t = k / segs; const p = b.clone().lerp(a, t); p.y -= sag * 4 * t * (1 - t);
            if (k < segs || segs === 1) pts.push(p); else pts.push(a);
          }
          if (near && P.side > 0) {
            // barbs every ~13 cm on the near right fence
            for (let t = 0.04; t < 0.98; t += 0.13 / b.distanceTo(a)) { const p = b.clone().lerp(a, t); p.y -= sag * 4 * t * (1 - t); barbPts.push(p); }
          }
        } else pts.push(a);
      }
      tubeInto(wpos, widx, pts, 0.0024, 3);
    }
  });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xb4b8bc, metalness: 0.9, roughness: 0.32 });
  const wires = new THREE.Mesh(tubeGeom(wpos, widx), wireMat); wires.castShadow = true; wires.receiveShadow = false; root.add(wires);
  // barbs: two crossed 2.5 cm prongs (4 thin quads)
  const bq: THREE.BufferGeometry[] = [];
  for (const [ry, rz] of [[0.6, 0.9], [-0.7, -0.8]]) bq.push(new THREE.BoxGeometry(0.004, 0.028, 0.004, 1, 1, 1).rotateZ(rz).rotateY(ry).deleteAttribute("uv") as THREE.BufferGeometry);
  const bg = mergeGeometries(bq.map((g) => { g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); return g; }), false);
  const bim = new THREE.InstancedMesh(bg, wireMat, barbPts.length); const bm = new THREE.Matrix4(); const br = rng(99);
  barbPts.forEach((p, i) => { bm.makeRotationZ(br() * Math.PI); bm.setPosition(p); bim.setMatrixAt(i, bm); });
  root.add(bim);
}

/* ------------------------------------------------------------------ 2. utility poles */
function buildPoles(root: THREE.Group, wood: readonly [THREE.Texture, THREE.Texture]) {
  const r = rng(402);
  const H = 9.4;
  const pole = new THREE.CylinderGeometry(0.115, 0.16, H + 0.4, 10, 1).translate(0, (H + 0.4) / 2 - 0.4, 0);
  const arm = new THREE.BoxGeometry(2.45, 0.095, 0.115).translate(0, H - 0.75, 0.16);
  const brace1 = new THREE.BoxGeometry(0.04, 0.85, 0.012).rotateZ(0.95).translate(0.33, H - 1.05, 0.21);
  const brace2 = new THREE.BoxGeometry(0.04, 0.85, 0.012).rotateZ(-0.95).translate(-0.33, H - 1.05, 0.21);
  const bracket = new THREE.BoxGeometry(0.06, 0.06, 0.32).translate(0, H - 2.9, 0.16 + 0.06);
  const woodG = mergeGeometries([pole, arm, brace1, brace2, bracket], false);
  const ARM_X = [-1.08, -0.4, 1.08];
  const insG = mergeGeometries(ARM_X.map((ax) => new THREE.CylinderGeometry(0.045, 0.06, 0.16, 8, 1).translate(ax, H - 0.62, 0.16)), false);
  const woodMat = new THREE.MeshStandardMaterial({ map: wood[0], bumpMap: wood[1], bumpScale: 2, roughness: 0.88, color: 0x8a7764 });
  const insMat = new THREE.MeshPhysicalMaterial({ color: 0x5f7f6c, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const zs: number[] = []; for (let z = Z_NEAR - 18; z > Z_FAR; z -= POLE_STEP) zs.push(z);
  const pim = new THREE.InstancedMesh(woodG, woodMat, zs.length), iim = new THREE.InstancedMesh(insG, insMat, zs.length);
  const mats: THREE.Matrix4[] = [];
  zs.forEach((z, i) => {
    const x = POLE_X + (r() - 0.5) * 0.3;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.03, Math.PI / 2 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.03));
    const m = new THREE.Matrix4().compose(V(x, groundY(x, z), z), q, V(1, 0.97 + r() * 0.06, 1));
    mats.push(m); pim.setMatrixAt(i, m); iim.setMatrixAt(i, m);
  });
  root.add(shadows(pim), shadows(iim));
  // wires: 3 conductors on the arm + one black telephone cable on the bracket, catenary sag
  const pos: number[] = [], idx: number[] = []; const cpos: number[] = [], cidx: number[] = [];
  const attach: [number, number, number, boolean][] = [...ARM_X.map((ax) => [ax, H - 0.54, 0.16, false] as [number, number, number, boolean]), [0, H - 2.95, 0.36, true]];
  for (const [ax, ay, az, cable] of attach) {
    for (let i = 0; i < mats.length - 1; i++) {
      const a = V(ax, ay, az).applyMatrix4(mats[i]), b = V(ax, ay, az).applyMatrix4(mats[i + 1]);
      const sag = cable ? 0.75 : 0.95 + r() * 0.1; const segs = 14; const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= segs; k++) {
        const t = k / segs; const p = a.clone().lerp(b, t);
        p.y -= sag * (Math.cosh((t - 0.5) * 2.4) - Math.cosh(1.2)) / (1 - Math.cosh(1.2));   // catenary, 0 at the ends
        pts.push(p);
      }
      if (cable) tubeInto(cpos, cidx, pts, 0.018, 4); else tubeInto(pos, idx, pts, 0.0075, 3);
    }
  }
  const wm = new THREE.Mesh(tubeGeom(pos, idx), new THREE.MeshStandardMaterial({ color: 0x8c8a86, metalness: 0.8, roughness: 0.45 }));
  const cm = new THREE.Mesh(tubeGeom(cpos, cidx), new THREE.MeshStandardMaterial({ color: 0x1b1b1c, metalness: 0.0, roughness: 0.6 }));
  wm.castShadow = cm.castShadow = true; root.add(wm, cm);
}

/* ------------------------------------------------------------------ 3. signs */
function signFace(lines: { text: string; size: number; y: number }[], w: number, h: number, bg: string, fg: string, seed: number, border: number, radius: number) {
  const [c, x] = canvas(w, h); const r = rng(seed);
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  // sheeting texture: faint diamond / prismatic noise
  for (let i = 0; i < 3500; i++) { x.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)"; x.fillRect(r() * w, r() * h, 2, 2); }
  // white border (inset, rounded)
  const ins = border * 0.55; x.strokeStyle = fg; x.lineWidth = border;
  x.beginPath(); x.roundRect(ins + border / 2, ins + border / 2, w - 2 * ins - border, h - 2 * ins - border, radius); x.stroke();
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "alphabetic";
  for (const L of lines) {
    x.save(); x.translate(w / 2, L.y); x.scale(0.84, 1);
    x.font = `bold ${L.size}px "Liberation Sans", "Arial", sans-serif`; x.fillText(L.text, 0, 0); x.restore();
  }
  // wear: dust gradient toward the bottom, a few scratches, sun-fade blotches
  const g = x.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, "rgba(120,105,80,0)"); g.addColorStop(1, "rgba(120,105,80,0.22)");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const px = r() * w, py = r() * h, rad = 20 + r() * 70; const rg = x.createRadialGradient(px, py, 0, px, py, rad);
    rg.addColorStop(0, `rgba(255,255,255,${0.03 + r() * 0.04})`); rg.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = rg; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
  for (let i = 0; i < 22; i++) { x.strokeStyle = `rgba(${r() < 0.5 ? "230,230,225" : "40,40,35"},${0.12 + r() * 0.2})`; x.lineWidth = 0.7 + r();
    const px = r() * w, py = r() * h, a = r() * Math.PI, l = 6 + r() * 40; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(60,50,35,${0.1 + r() * 0.2})`; x.beginPath(); x.arc(r() * w, h * (0.6 + r() * 0.4), 0.8 + r() * 2.2, 0, Math.PI * 2); x.fill(); }
  return c;
}

function buildSigns(root: THREE.Group) {
  const galv = new THREE.MeshStandardMaterial({ color: 0xa9adb0, metalness: 0.85, roughness: 0.42 });
  const alu = new THREE.MeshStandardMaterial({ color: 0xb9bcbe, metalness: 0.75, roughness: 0.5 });
  const bolt = new THREE.MeshStandardMaterial({ color: 0x9a9da0, metalness: 0.9, roughness: 0.35 });
  // perforated square steel post (telespar), base at 0, 1 unit tall
  const postG = new THREE.BoxGeometry(0.064, 1, 0.064).translate(0, 0.5, 0);

  /* --- NEXT TREE 20 MI guide sign: 2.4 x 1.2 m panel, bottom ~2.0 m above ground --- */
  {
    const W = 2.4, Hh = 1.2;
    const face = signFace([{ text: "NEXT TREE", size: 190, y: 250 }, { text: "20 MI", size: 190, y: 452 }], 1024, 512, "#0b6a3c", "#f2f3ee", 501, 20, 36);
    const fx = face.getContext("2d") as CanvasRenderingContext2D;
    for (const bx of [-0.62, 0.62]) for (const by of [0.4, -0.4]) { // bolt heads where the panel meets the posts
      const px = (bx / W + 0.5) * 1024, py = (0.5 - by / Hh) * 512; fx.fillStyle = "#c9ccc9"; fx.beginPath(); fx.arc(px, py, 7, 0, Math.PI * 2); fx.fill();
      fx.fillStyle = "rgba(0,0,0,0.35)"; fx.beginPath(); fx.arc(px + 1.5, py + 1.5, 4, 0, Math.PI * 2); fx.fill(); }
    const faceMat = new THREE.MeshStandardMaterial({ map: canvasTex(face, true), roughness: 0.38, metalness: 0.05, envMapIntensity: 1.1 });
    const g = new THREE.Group(); g.position.set(SIGN.x, groundY(SIGN.x, SIGN.z), SIGN.z); g.rotation.y = -0.04;
    const panelBottom = 2.05 - g.position.y * 0;  // above local ground (posts start in the ditch)
    const panel = new THREE.Mesh(new THREE.BoxGeometry(W, Hh, 0.004), [alu, alu, alu, alu, faceMat, alu]);
    panel.position.set(0, panelBottom + Hh / 2, 0); g.add(panel);
    // two horizontal back rails (Z-bars) bolted to the posts
    for (const ry of [0.4, -0.4]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.05, 0.025), alu); rail.position.set(0, panelBottom + Hh / 2 + ry, -0.016); g.add(rail); }
    for (const px of [-0.62, 0.62]) {
      const p = new THREE.Mesh(postG, galv); p.scale.y = panelBottom + Hh - 0.08 + 0.3; p.position.set(px, -0.3, -0.06); g.add(p);
      for (const by of [0.4, -0.4]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6).rotateX(Math.PI / 2), bolt); b.position.set(px, panelBottom + Hh / 2 + by, 0.006); g.add(b); }
    }
    root.add(shadows(g));
  }
  /* --- SPEED LIMIT 55 (R2-1, 24" x 30") on one post, right shoulder near z = 250 --- */
  {
    const W = 0.61, Hh = 0.76;
    const face = signFace([{ text: "SPEED", size: 118, y: 165 }, { text: "LIMIT", size: 118, y: 295 }, { text: "55", size: 290, y: 575 }], 512, 640, "#f1f1ec", "#151515", 502, 12, 26);
    const faceMat = new THREE.MeshStandardMaterial({ map: canvasTex(face, true), roughness: 0.4, metalness: 0.05 });
    const x = ROADW / 2 + SHOULDER + 0.5, z = 250; const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = -0.05;
    const bottom = 1.75;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(W, Hh, 0.004), [alu, alu, alu, alu, faceMat, alu]); panel.position.set(0, bottom + Hh / 2, 0); g.add(panel);
    const p = new THREE.Mesh(postG, galv); p.scale.y = bottom + Hh - 0.06 + 0.3; p.position.set(0, -0.3, -0.04); g.add(p);
    root.add(shadows(g));
  }
}

/* ------------------------------------------------------------------ 5. delineators, mailbox, skid marks, ruts */
function buildDetails(root: THREE.Group, wood: readonly [THREE.Texture, THREE.Texture]) {
  // flexible delineator posts (white, 1.2 m) with a white reflector, every 100 m on both shoulders
  const dpos: THREE.Matrix4[] = [];
  for (let z = Z_NEAR - 40; z > Z_FAR; z -= 100) for (const s of [-1, 1]) {
    const x = s * (ROADW / 2 + SHOULDER - 0.25);
    if (s > 0 && Math.abs(z - 60) < 8) continue; // not right at the guide sign
    dpos.push(new THREE.Matrix4().compose(V(x, surfaceY(x, z) - 0.05, z), new THREE.Quaternion(), V(1, 1, 1)));
  }
  const dg = new THREE.BoxGeometry(0.085, 1.25, 0.022).translate(0, 0.625, 0);
  const rg = new THREE.BoxGeometry(0.07, 0.2, 0.004).translate(0, 1.04, 0.0125);
  const dm = new THREE.InstancedMesh(dg, new THREE.MeshStandardMaterial({ color: 0xe8e8e2, roughness: 0.45 }), dpos.length);
  const rm = new THREE.InstancedMesh(rg, new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.15, metalness: 0.4, emissive: 0x2a2a2a }), dpos.length);
  dpos.forEach((m, i) => { dm.setMatrixAt(i, m); rm.setMatrixAt(i, m); });
  root.add(shadows(dm), shadows(rm));

  // rural mailbox on a 4x4 post, left side (driveway to the farm)
  {
    const x = -(ROADW / 2 + SHOULDER + 0.35), z = 112; const g = new THREE.Group(); g.position.set(x, groundY(x, z), z);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.3, 0.09).translate(0, 0.55, 0), new THREE.MeshStandardMaterial({ map: wood[0], bumpMap: wood[1], bumpScale: 2, roughness: 0.9 }));
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.5).translate(0, 1.15, 0), post.material);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x23262a, roughness: 0.55, metalness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.48).translate(0, 1.255, 0), boxMat);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.48, 12, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(0, 1.32, 0), boxMat);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.14, 0.06).translate(0.09, 1.38, -0.12), new THREE.MeshStandardMaterial({ color: 0xb4241c, roughness: 0.5 }));
    g.add(post, arm, body, top, flag); root.add(shadows(g));
  }

  // skid marks (rubber on asphalt) + ruts (torn verge) where a car left the road toward the oak
  const curve = new THREE.CubicBezierCurve(new THREE.Vector2(1.7, 74), new THREE.Vector2(2.1, 38), new THREE.Vector2(4.3, 16), new THREE.Vector2(TREE.x - 0.9, 1.6));
  const N = 90;
  const mk = (off: number, width: number, t0: number, t1: number, surf: "road" | "dirt") => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = t0 + (t1 - t0) * (i / N); const p = curve.getPoint(t); const d = curve.getTangent(t); const n = new THREE.Vector2(-d.y, d.x);
      const c = p.clone().addScaledVector(n, off);
      for (const s of [-1, 1]) {
        const q = c.clone().addScaledVector(n, (s * width) / 2);
        const y = (surf === "road" ? surfaceY(q.x, q.y) + 0.012 : groundY(q.x, q.y) + 0.012);
        pos.push(q.x, y, q.y); uv.push((s + 1) / 2, i / N);
      }
      if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  // alpha: tyre-tread streaks, faint at the start (braking begins), solid later
  const [ac, ax] = canvas(64, 512); const sr = rng(808);
  ax.fillStyle = "#000"; ax.fillRect(0, 0, 64, 512);
  const fade = ax.createLinearGradient(0, 0, 0, 512); fade.addColorStop(0, "rgba(255,255,255,0.0)"); fade.addColorStop(0.18, "rgba(255,255,255,0.55)"); fade.addColorStop(1, "rgba(255,255,255,0.85)");
  ax.fillStyle = fade; ax.fillRect(6, 0, 52, 512);
  for (let i = 0; i < 26; i++) { const px = 6 + sr() * 52; ax.fillStyle = `rgba(0,0,0,${0.15 + sr() * 0.35})`; ax.fillRect(px, 0, 0.8 + sr() * 2.5, 512); }
  for (let i = 0; i < 60; i++) { ax.fillStyle = `rgba(0,0,0,${0.2 + sr() * 0.4})`; ax.fillRect(0, sr() * 512, 64, 1 + sr() * 5); }
  const skidAlpha = canvasTex(ac, false);
  const skidMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.75, transparent: true, alphaMap: skidAlpha, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  // split the curve where it crosses the asphalt edge
  let tEdge = 1; for (let i = 0; i <= 400; i++) { const t = i / 400; const p = curve.getPoint(t); if (p.x - 0.8 > ROADW / 2) { tEdge = t; break; } }
  const skids = new THREE.Group();
  for (const off of [-0.78, 0.78]) {
    const m = new THREE.Mesh(mk(off, 0.22, 0.0, Math.min(1, tEdge + 0.05), "road"), skidMat); m.receiveShadow = true; m.renderOrder = 2; skids.add(m);
  }
  // ruts: churned soil strips from the shoulder edge to the tree, plus gravel spray patch
  const [rc, rx] = canvas(128, 512); const rr = rng(909);
  rx.fillStyle = "rgb(88,70,52)"; rx.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 900; i++) { const v = 40 + rr() * 90; rx.fillStyle = `rgba(${v},${v * 0.8},${v * 0.6},${0.4 + rr() * 0.5})`; rx.fillRect(rr() * 128, rr() * 512, 1 + rr() * 6, 1 + rr() * 4); }
  for (let y = 0; y < 512; y += 9 + rr() * 6) { rx.fillStyle = "rgba(30,22,15,0.45)"; rx.fillRect(10, y, 108, 2.5); }  // tread imprints
  const [rac, rax] = canvas(64, 256); rax.fillStyle = "#000"; rax.fillRect(0, 0, 64, 256);
  const rgd = rax.createLinearGradient(0, 0, 64, 0); rgd.addColorStop(0, "rgba(255,255,255,0)"); rgd.addColorStop(0.25, "rgba(255,255,255,0.95)"); rgd.addColorStop(0.75, "rgba(255,255,255,0.95)"); rgd.addColorStop(1, "rgba(255,255,255,0)");
  rax.fillStyle = rgd; rax.fillRect(0, 0, 64, 256);
  const rutMat = new THREE.MeshStandardMaterial({ map: canvasTex(rc, true, [1, 6]), alphaMap: canvasTex(rac, false), transparent: true, roughness: 0.97, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  for (const off of [-0.78, 0.78]) {
    const m = new THREE.Mesh(mk(off, 0.34, Math.max(0, tEdge - 0.04), 1, "dirt"), rutMat); m.receiveShadow = true; m.renderOrder = 2;
    // press the rut down a few cm into the verge
    const p = m.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) > ROADW / 2 + 0.2) p.setY(i, p.getY(i) - 0.0);
    skids.add(m);
  }
  root.add(skids);
}

/* ------------------------------------------------------------------ 4. distant farmstead */
function buildFarm(root: THREE.Group) {
  const farm = new THREE.Group();
  const r = rng(604);
  const FX = -195, FZ = -560;
  const put = (o: THREE.Object3D, x: number, z: number, ry = 0) => { o.position.set(x, groundY(x, z) - 0.2, z); o.rotation.y = ry; farm.add(o); return o; };
  const lam = (c: number, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal });

  // red gambrel barn (14 x 22 m), grey standing-seam metal roof
  {
    const W = 14, D = 22, wall = 5.2;
    const prof = [[-W / 2, 0], [W / 2, 0], [W / 2, wall], [W / 2 - 2.2, wall + 3.4], [0, wall + 5.0], [-W / 2 + 2.2, wall + 3.4], [-W / 2, wall]];
    const sh = new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y)));
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false }).translate(0, 0, -D / 2), lam(0x8e2a1f, 0.8));
    const g = new THREE.Group(); g.add(body);
    const roofM = lam(0x8d9296, 0.45, 0.7);
    for (let i = 2; i < prof.length + 1; i++) {
      const a = prof[i % prof.length], b = prof[(i + 1) % prof.length]; if (i >= prof.length - 0) break;
      if (!(i >= 2 && i <= 5)) continue;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.25; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, D + 0.6), roofM);
      const nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny);
      slab.position.set((a[0] + b[0]) / 2 - nx / nl * 0.07, (a[1] + b[1]) / 2 - ny / nl * 0.07, 0); slab.rotation.z = ang; g.add(slab);
    }
    // white trim around the big door on the gable end
    const door = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.2, 0.1), lam(0x5a1a14, 0.9)); door.position.set(0, 2.1, D / 2 + 0.02); g.add(door);
    for (const [w, h, x, y] of [[4.8, 0.22, 0, 4.3], [0.22, 4.3, -2.3, 2.15], [0.22, 4.3, 2.3, 2.15], [6.4, 0.22, 0, 2.1]] as [number, number, number, number][]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), lam(0xe9e6de, 0.7)); t.position.set(x, y, D / 2 + 0.05); if (w > 6) t.rotation.z = 0.6; g.add(t);
    }
    put(g, FX, FZ, 0.35);
  }
  // white farmhouse with dark shingle roof + chimney
  {
    const g = new THREE.Group(); const W = 10, D = 8, H = 5.8;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D).translate(0, H / 2, 0), lam(0xe8e6df, 0.8)); g.add(body);
    const rs = new THREE.Shape([new THREE.Vector2(-D / 2 - 0.4, 0), new THREE.Vector2(D / 2 + 0.4, 0), new THREE.Vector2(0, 3.2)]);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: W + 0.8, bevelEnabled: false }).translate(0, 0, -(W + 0.8) / 2).rotateY(Math.PI / 2).translate(0, H, 0), lam(0x3b3d40, 0.85)); g.add(roof);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.8).translate(W / 2 - 1.6, H + 2.2, 0.8), lam(0x6e3b2f, 0.9)); g.add(ch);
    // windows (dark glass) on the long face toward the road (+X side after rotation)
    for (let i = 0; i < 4; i++) for (const y of [1.6, 4.2]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.06), lam(0x23282e, 0.15, 0.3)); w.position.set(-W / 2 + 1.6 + i * 2.25, y, D / 2 + 0.03); g.add(w); }
    const porch = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.25, 2.4).translate(0, 2.9, D / 2 + 1.2), lam(0x55575a, 0.8)); g.add(porch);
    put(g, FX + 34, FZ + 44, -Math.PI / 2 + 0.3);
  }
  // concrete stave silo + domed cap, and two corrugated grain bins
  {
    const g = new THREE.Group();
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.9, 17, 16, 1).translate(0, 8.5, 0), lam(0xb9b5ab, 0.9)); g.add(silo);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.85, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 17, 0), lam(0x9aa0a4, 0.4, 0.75)); g.add(dome);
    put(g, FX - 12, FZ - 9);
    for (const [bx, bz, br] of [[FX - 2, FZ - 22, 4.2], [FX + 9, FZ - 24, 3.6]] as [number, number, number][]) {
      const b = new THREE.Group();
      b.add(new THREE.Mesh(new THREE.CylinderGeometry(br, br, 6.5, 18, 1).translate(0, 3.25, 0), lam(0xaeb3b6, 0.4, 0.8)));
      b.add(new THREE.Mesh(new THREE.ConeGeometry(br + 0.15, 2.4, 18, 1).translate(0, 6.5 + 1.2, 0), lam(0xa3a8ab, 0.38, 0.8)));
      put(b, bx, bz);
    }
  }
  // shelter belt / tree groups (low-poly lumpy crowns on short trunks)
  if (FARM_TREES) {
    const crownG = new THREE.IcosahedronGeometry(1, 1); { const p = crownG.attributes.position as THREE.BufferAttribute; const cr = rng(5);
      for (let i = 0; i < p.count; i++) { const k = 0.85 + cr() * 0.3; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.9, p.getZ(i) * k); } crownG.computeVertexNormals(); }
    const trunkG = new THREE.CylinderGeometry(0.18, 0.28, 1, 5).translate(0, 0.5, 0);
    const spots: [number, number, number][] = [];
    // windbreak row north-west of the yard
    for (let i = 0; i < 16; i++) spots.push([FX - 30 + i * 6.5 + (r() - 0.5) * 2.5, FZ - 46 + (r() - 0.5) * 3, 3.4 + r() * 1.6]);
    // a few yard trees by the house
    for (let i = 0; i < 4; i++) spots.push([FX + 40 + (r() - 0.5) * 18, FZ + 58 + (r() - 0.5) * 14, 3 + r() * 1.8]);
    const crowns = new THREE.InstancedMesh(crownG, lam(0x3c4a26, 0.95), spots.length * 2);
    const trunks = new THREE.InstancedMesh(trunkG, lam(0x3a3128, 0.95), spots.length);
    const m = new THREE.Matrix4(); const col = new THREE.Color();
    spots.forEach(([x, z, s], i) => {
      const y = groundY(x, z) - 0.2;
      trunks.setMatrixAt(i, m.compose(V(x, y, z), new THREE.Quaternion(), V(s * 0.25, s * 0.9, s * 0.25)));
      for (let k = 0; k < 2; k++) {
        crowns.setMatrixAt(i * 2 + k, m.compose(V(x + (r() - 0.5) * s * 0.6, y + s * (1.5 + k * 0.6), z + (r() - 0.5) * s * 0.6), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), V(s * (1 - k * 0.25), s * (0.9 - k * 0.2), s * (1 - k * 0.25))));
        const v = 0.8 + r() * 0.35; crowns.setColorAt(i * 2 + k, col.setRGB(v, v, v * 0.95));
      }
    });
    farm.add(crowns, trunks);
  }
  // gravel driveway from the road to the yard (thin strip on the terrain)
  {
    const pts: number[] = [], idx: number[] = []; const N = 40;
    const a = new THREE.Vector2(-(ROADW / 2 + SHOULDER), 108), b = new THREE.Vector2(FX + 30, FZ + 60);
    for (let i = 0; i <= N; i++) {
      const t = i / N; const p = a.clone().lerp(b, t); const d = b.clone().sub(a).normalize(); const n = new THREE.Vector2(-d.y, d.x);
      for (const s of [-1, 1]) { const q = p.clone().addScaledVector(n, s * 1.6); pts.push(q.x, groundY(q.x, q.y) + 0.05, q.y); }
      if (i < N) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals();
    const dw = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x9c8f78, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 })); dw.receiveShadow = true; root.add(dw);
  }
  farm.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(farm);
}

/* ------------------------------------------------------------------ entry */
export async function buildProps(): Promise<Part> {
  const object = new THREE.Group(); object.name = "props";
  const fenceWood = woodTextures(11, [142, 136, 124]);
  const poleWood = woodTextures(12, [104, 86, 66], 128, 1024);
  poleWood[0].repeat.set(1, 4); poleWood[1].repeat.set(1, 4);
  buildFences(object, fenceWood);
  buildPoles(object, poleWood);
  buildSigns(object);
  buildDetails(object, fenceWood);
  buildFarm(object);
  // eslint-disable-next-line no-console
  console.log(`[props] triangles: ${Math.round(tris(object))}`);
  return { object, update: () => {} };
}
