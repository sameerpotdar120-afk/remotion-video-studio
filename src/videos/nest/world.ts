// Samulation #3 world: a Ming fort courtyard (toon family A: painted textures, two-tone light, selective ink) with the
// hexagonal rocket box on trestles, the brace drill and the hero. Pure function of the frame (update()).
// Coordinates: metres, y up, courtyard ground y = 0, the curtain wall runs along x at z = -7 (behind the action).
import * as THREE from "three";
import { Batch, V, boxGeo, lam } from "../bridge/build";
import { stoneHD, grassHD, cobbleHD, beam, planksHD, ctex, rep, cloudHD, rng } from "../bridge/paint";
import { twoTone, TONE, CHAR, untone } from "../bridge/shade";
import { LIGHTS, LOOK as WLOOK } from "../bridge/lights";
import { NOINK } from "../bridge/ink";
import { HeroCard } from "./hero";
import { buildEnv, grassField, stoneBlocks } from "./env";
import { FPS, BRACE_RPS, camHook } from "./story";

// ---------------- the launcher box (Ming "nest of bees": hexagonal tube of 32 fire-arrows) ----------------
export const BOX = { c: V(0.62, 0.8, 8), R: 0.34, L: 1.0 }; // axis along x, mouth (front plate) at x = c.x - L/2
const HOLE_R = 0.3;
export const HOLES: [number, number][] = (() => {
  const out: [number, number][] = [], s = HOLE_R / 3.6;
  for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) {
    const x = (i + (((j % 2) + 2) % 2) * 0.5) * s * 1.05, y = j * s * 0.91;
    if (Math.hypot(x, y) < HOLE_R * 0.88) out.push([x, y]);
  }
  return out.sort((a, b) => Math.hypot(...a) - Math.hypot(...b)).slice(0, 32);
})();
/** the hole being drilled in the hook: outer ring, upper, on the camera side */
export const TARGET = (() => { let best = 24; for (let i = 24; i < 32; i++) if (HOLES[i][0] * 1.0 + HOLES[i][1] * 0.6 > HOLES[best][0] + HOLES[best][1] * 0.6) best = i; return best; })();

/** painted honeycomb plate: oak boards, drilled holes with a dark bore + chipped rim, the target hole only pencil-marked */
const plateTex = (drilled: number[]) => ctex("plate_" + drilled.length, 1024, 1024, (g, r) => {
  const S = 1024, k = S / (2 * BOX.R), cx = S / 2, cy = S / 2;
  // boards (vertical), warm oak with painted grain + near-black seams (refs: painted plank lines every 40-120 px)
  const cols = ["#c9934f", "#bf8a48", "#d29d5a", "#c48e4c"];
  for (let i = 0; i < 6; i++) { g.fillStyle = cols[i % 4]; g.fillRect(i * S / 6, 0, S / 6, S); }
  g.globalAlpha = 0.18; g.strokeStyle = "#7a4a22"; g.lineWidth = 3;
  for (let i = 0; i < 70; i++) { const x = r() * S, y0 = r() * S; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 8, y0 + 120, x - 8, y0 + 240, x + 4, y0 + 360); g.stroke(); }
  g.globalAlpha = 1; g.strokeStyle = "#3a2414"; g.lineWidth = 5;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * S / 6, 0); g.lineTo(i * S / 6, S); g.stroke(); }
  HOLES.forEach(([hx, hy], i) => {
    const x = cx + hx * k, y = cy - hy * k, rr = 0.019 * k;
    if (!drilled.includes(i)) { // pencil cross: this one is next
      g.strokeStyle = "rgba(40,30,30,0.85)"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - rr, y - rr); g.lineTo(x + rr, y + rr); g.moveTo(x + rr, y - rr); g.lineTo(x - rr, y + rr); g.stroke();
      g.beginPath(); g.arc(x, y, rr * 1.15, 0, 7); g.stroke(); return;
    }
    g.fillStyle = "#e8c48a"; g.beginPath(); g.arc(x, y, rr * 1.32, 0, 7); g.fill();                      // fresh-cut rim
    const gr = g.createRadialGradient(x - rr * 0.3, y - rr * 0.35, rr * 0.1, x, y, rr);
    gr.addColorStop(0, "#0a0503"); gr.addColorStop(0.7, "#1c0e08"); gr.addColorStop(1, "#4a2812"); g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    g.strokeStyle = "#3a2414"; g.lineWidth = 3; g.stroke();
  });
});


/** our own banner: red cloth, gold border, black hexagon emblem */
const bannerTex = () => ctex("n_banner", 256, 512, (g) => {
  g.fillStyle = "#b8322c"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#e0a43c"; g.fillRect(0, 0, 256, 26); g.fillRect(0, 486, 256, 26); g.fillRect(0, 0, 20, 512); g.fillRect(236, 0, 20, 512);
  g.fillStyle = "#8f2420"; for (let i = 0; i < 6; i++) g.fillRect(40 + i * 32, 30, 4, 452);
  g.fillStyle = "#1d1416"; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(128 + Math.cos(a) * 70, 250 + Math.sin(a) * 70); } g.closePath(); g.fill();
  g.fillStyle = "#e0a43c"; for (const [x, y] of [[0, 0], [-26, -16], [26, -16], [-26, 16], [26, 16], [0, -32], [0, 32]]) { g.beginPath(); g.arc(128 + x, 250 + y, 8, 0, 7); g.fill(); }
});
/** trodden earth: warm brown with painted pebbles and grass edge flecks */
const dirtTex = () => { const t = ctex("n_dirt", 512, 512, (g, r) => {
  g.fillStyle = "#b08a5e"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? "rgba(120,86,52,0.35)" : "rgba(214,180,130,0.4)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 14, 3 + r() * 8, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = "#8a6a48"; g.strokeStyle = "rgba(50,35,25,0.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 5, 3 + r() * 3, r() * 3, 0, 7); g.fill(); g.stroke(); }
}); return t; };

export class World {
  root = new THREE.Group();
  hero: HeroCard;
  private sun = new THREE.DirectionalLight("#fff3e0", 2.8);
  private hemi = new THREE.HemisphereLight("#dcecff", "#b49a78", 0.55);
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial; private fog = new THREE.Fog("#b8d0ec", 25, 300);
  private clouds: THREE.Mesh[] = [];
  private rig = new THREE.Group();            // the brace drill, rotated about the hole axis
  private drillAxis = V(-1, 0, 0);
  private target = new THREE.Vector3();
  private padL = new THREE.Vector3(); private gripL = new THREE.Vector3();
  private DS = 0.72;                          // brace length scale (sized for the hero's short bean arms)

  constructor() {
    const R = this.root;
    // ---- sky (5 stops by elevation, tone-map inverted) + clouds ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0)); vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el)); c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), this.skyMat); this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32, d = 520 + (i % 3) * 50, w = 120 + (i % 4) * 26;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, WLOOK.day.cloud), color: new THREE.Color(1.08, 1.08, 1.08), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 110 + (i % 3) * 45, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sun, this.sun.target, this.hemi);

    // ---- static set (one batch per material) ----
    const b = new Batch();
    const M = {
      grass: lam("n_grass", () => ({ map: rep(grassHD(), 1, 1), color: "#7d9a5a" })),
      cobble: lam("n_cobble", () => ({ map: cobbleHD() })),
      wall: lam("n_wall", () => ({ map: stoneHD("n_wallHD", ["#cbbda6", "#c1b39b", "#d3c6b0", "#b9ab93"], "#8f816d") })),
      cope: lam("n_cope", () => ({ map: stoneHD("n_copeHD", ["#e2d6c3", "#d8ccb8", "#e9dfcf", "#d1c4b0"], "#a89b88") })),
      wood: lam("n_wood", () => ({ map: beam() })),
      plank: lam("n_plank", () => ({ map: planksHD() })),
      dark: lam("n_dark", () => ({ color: "#5b3a24" })),
    };
    // ground: grass courtyard, cobbled walk along the wall
    const ground = new THREE.PlaneGeometry(80, 60); ground.rotateX(-Math.PI / 2); ground.translate(0, 0, 18);
    const gu = ground.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < gu.count; i++) gu.setXY(i, gu.getX(i) * 20, gu.getY(i) * 15);
    b.add(ground, M.grass);
    const walk = new THREE.PlaneGeometry(80, 3.2); walk.rotateX(-Math.PI / 2); walk.translate(0, 0.006, -5.2);
    const wu = walk.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < wu.count; i++) wu.setXY(i, wu.getX(i) * 26, wu.getY(i) * 1.05);
    b.add(walk, M.cobble);
    // curtain wall (inner face toward +z), wall-walk cope, merlons; a square tower at the left
    b.add(boxGeo(V(-40, 0, -11), V(40, 7, -6.8), 2), M.wall);
    b.add(boxGeo(V(-40, 7, -11.2), V(40, 7.35, -6.6), 2), M.cope);
    for (let x = -39; x < 40; x += 1.7) b.add(boxGeo(V(x, 7.35, -7.35), V(x + 0.95, 8.25, -6.65), 2), M.cope);
    b.add(boxGeo(V(-9.5, 0, -12), V(-4.5, 11.5, -6.2), 2), M.wall);
    b.add(boxGeo(V(-9.8, 11.5, -12.3), V(-4.2, 11.85, -5.9), 2), M.cope);
    for (let i = 0; i < 4; i++) b.add(boxGeo(V(-9.8 + i * 1.5, 11.85, -6.5), V(-9.0 + i * 1.5, 12.7, -5.9), 2), M.cope);
    // gate arch shadow (dark recess) in the tower base + wall steps
    b.add(boxGeo(V(-8.1, 0, -6.25), V(-5.9, 2.8, -6.15)), M.dark);
    // props along the wall: barrels, crates, a rack of spears (refs: walls never bare, 8-15 props in a wide interior/courtyard)
    const barrel = (x: number, z: number, h = 0.9) => { const c = new THREE.CylinderGeometry(0.34, 0.3, h, 20); c.translate(x, h / 2, z); b.add(c, M.plank);
      for (const y of [0.18, h - 0.18]) { const t = new THREE.TorusGeometry(0.335, 0.025, 6, 24); t.rotateX(Math.PI / 2); t.translate(x, y, z); b.add(t, M.dark); } };
    barrel(4.6, -5.2); barrel(5.35, -5.5); barrel(4.95, -6.0, 0.8);
    const crate = (x: number, z: number, s: number, h = 0) => b.add(boxGeo(V(x - s / 2, h, z - s / 2), V(x + s / 2, h + s, z + s / 2), 1), M.plank);
    crate(-2.6, -5.1, 0.8); crate(-1.85, -5.2, 0.7); crate(-2.3, -5.1, 0.6, 0.8);
    for (let i = 0; i < 6; i++) { const sp = new THREE.CylinderGeometry(0.02, 0.02, 2.6, 6); sp.rotateZ(0.12); sp.translate(-3.6 + i * 0.22, 1.3, -6.55); b.add(sp, M.wood); }
    b.add(boxGeo(V(-3.9, 0.9, -6.7), V(-2.4, 1.0, -6.45)), M.wood);
    // ---- set dressing near the action (refs: 8-15 props in a wide shot, walls never bare) ----
    const red = lam("n_red", () => ({ map: bannerTex() })), leafM = lam("n_leaf", () => ({ color: "#4f8f3c" })), leafM2 = lam("n_leaf2", () => ({ color: "#3f7a33" }));
    const dirt = lam("n_dirt", () => ({ map: dirtTex() })), sack = lam("n_sack", () => ({ color: "#d9c39a" })), iron = lam("n_iron", () => ({ color: "#4a4f5a" }));
    const paper = lam("n_paper", () => ({ color: "#b8322c" })), shaft = lam("n_shaft", () => ({ color: "#c9a46a" })), shav = lam("n_shav", () => ({ color: "#f0d6a2" }));
    // worn dirt patch under the work area
    const dp = new THREE.CircleGeometry(1.0, 40); dp.rotateX(-Math.PI / 2); dp.scale(1.4, 1, 0.8); dp.translate(0.15, 0.004, 8.0);
    { const u = dp.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 4, u.getY(i) * 4); } b.add(dp, dirt);
    // banners hanging on the wall (our own design: red cloth, gold border, black hex emblem)
    for (const x of [-4.2, 2.4, 9.0]) { const g = new THREE.PlaneGeometry(1.5, 3.4, 1, 8); const pos = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getY(i) * 2.2 + x) * 0.04); g.computeVertexNormals(); g.translate(x, 5.0, -6.5); b.add(g, red);
      b.add(boxGeo(V(x - 0.85, 6.7, -6.6), V(x + 0.85, 6.78, -6.45)), M.wood); }
    // workbench behind the hero with a mallet, a saw and a bowl of nails
    b.add(boxGeo(V(-2.5, 0.86, 4.75), V(-0.9, 0.94, 5.45)), M.plank);
    for (const [x, z] of [[-2.4, 4.82], [-1.0, 4.82], [-2.4, 5.38], [-1.0, 5.38]]) b.add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.86, z + 0.04)), M.wood);
    b.add(boxGeo(V(-2.35, 0.25, 4.82), V(-1.05, 0.29, 5.38)), M.wood);
    { const h = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12); h.rotateZ(Math.PI / 2); h.translate(-2.1, 1.01, 5.05); b.add(h, M.wood);
      const hd = new THREE.CylinderGeometry(0.015, 0.015, 0.34, 8); hd.rotateX(Math.PI / 2); hd.rotateY(0.6); hd.translate(-1.98, 0.96, 5.2); b.add(hd, M.wood);
      b.add(boxGeo(V(-1.65, 0.94, 4.9), V(-1.2, 0.945, 5.04)), iron); b.add(boxGeo(V(-1.25, 0.94, 4.9), V(-1.1, 0.98, 5.04)), M.wood);
      const bowl = new THREE.CylinderGeometry(0.09, 0.06, 0.06, 14); bowl.translate(-1.4, 0.97, 5.25); b.add(bowl, iron); }
    // crate of finished fire-arrows beside the box (bamboo shafts, red paper powder tubes)
    b.add(boxGeo(V(1.55, 0, 6.85), V(2.25, 0.55, 7.45), 1), M.plank);
    for (let i = 0; i < 26; i++) { const r = rng(i + 7), x = 1.62 + r() * 0.56, z = 6.92 + r() * 0.46, tilt = (r() - 0.5) * 0.3, tz = (r() - 0.5) * 0.3;
      const a = new THREE.CylinderGeometry(0.006, 0.006, 1.05, 5); a.rotateX(tilt); a.rotateZ(tz); a.translate(x, 0.75, z); b.add(a, shaft);
      const tb = new THREE.CylinderGeometry(0.02, 0.02, 0.17, 10); tb.rotateX(tilt); tb.rotateZ(tz); tb.translate(x - Math.sin(tz) * 0.38, 0.75 + 0.38, z + Math.sin(tilt) * 0.38); b.add(tb, paper); }
    // sacks and a lantern post by the wall, barrels nearer the action
    for (const [x, z, s2] of [[3.3, 5.1, 1], [3.75, 5.35, 0.85], [3.45, 5.7, 0.9]]) { const g = new THREE.SphereGeometry(0.32 * s2, 14, 10); g.scale(1, 1.25, 0.85); g.translate(x, 0.36 * s2, z); b.add(g, sack); }
    const barrel2 = (x: number, z: number, h = 0.9) => { const c2 = new THREE.CylinderGeometry(0.34, 0.3, h, 20); c2.translate(x, h / 2, z); b.add(c2, M.plank);
      for (const y of [0.18, h - 0.18]) { const t = new THREE.TorusGeometry(0.335, 0.025, 6, 24); t.rotateX(Math.PI / 2); t.translate(x, y, z); b.add(t, M.dark); } };
    barrel2(-4.4, 3.6); barrel2(-3.75, 3.2, 0.8);
    // wood shavings under the drill + foreground bushes framing the bottom corners
    for (let i = 0; i < 40; i++) { const r = rng(i + 99), g = new THREE.CircleGeometry(0.02 + r() * 0.025, 6); g.rotateX(-Math.PI / 2); g.rotateY(r() * 6); g.scale(1, 1, 0.45);
      g.translate(-0.15 - r() * 0.5, 0.008, 7.75 + (r() - 0.5) * 0.7); b.add(g, shav); }
    const bush = (x: number, z: number, s2: number) => { for (let k = 0; k < 6; k++) { const r = rng(k + x * 10), g = new THREE.IcosahedronGeometry(0.35 * s2 * (0.7 + r() * 0.5), 2);
      g.translate(x + (r() - 0.5) * 0.7 * s2, 0.25 * s2 + r() * 0.3 * s2, z + (r() - 0.5) * 0.5 * s2); b.add(g, k % 2 ? leafM : leafM2); } };
    bush(-4.6, 9.4, 1.1); bush(2.9, 10.6, 0.9); bush(-6.5, 1.5, 1.3); bush(6.2, 2.0, 1.4);
    // ---- the launcher box on two trestles ----
    const { c, R: BR, L: BL } = BOX;
    const hexTube = new THREE.CylinderGeometry(BR, BR, BL, 6, 1, true); hexTube.rotateZ(Math.PI / 2); hexTube.rotateX(Math.PI / 6); hexTube.translate(c.x, c.y, c.z);
    b.add(hexTube, M.plank);
    const back = new THREE.CylinderGeometry(BR * 0.98, BR * 0.98, 0.04, 6); back.rotateZ(Math.PI / 2); back.rotateX(Math.PI / 6); back.translate(c.x + BL / 2 + 0.01, c.y, c.z); b.add(back, M.plank);
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + Math.PI / 6 + k * Math.PI / 3, y = Math.cos(a) * BR, z = Math.sin(a) * BR;
      b.add(boxGeo(V(c.x - BL / 2, c.y + y - 0.02, c.z + z - 0.02), V(c.x + BL / 2, c.y + y + 0.02, c.z + z + 0.02)), M.dark); }
    for (const dx of [-0.32, 0.32]) {
      for (const dz of [-0.3, 0.3]) { const leg = new THREE.CylinderGeometry(0.035, 0.04, 0.62, 8); leg.rotateX(dz > 0 ? -0.35 : 0.35); leg.translate(c.x + dx, 0.29, c.z + dz * 0.8); b.add(leg, M.wood); }
      b.add(boxGeo(V(c.x + dx - 0.05, 0.52, c.z - 0.36), V(c.x + dx + 0.05, 0.6, c.z + 0.36)), M.wood);
    }
    buildEnv(b, R);
    // dense grass around the action (clear where the work area is trodden), 3D blocks on the inner wall face
    grassField(R, V(-0.6, 0, 8.6), (x, z) => { const d = Math.hypot((x - 0.15) / 1.4, (z - 8.0) / 0.8); return d < 0.85 ? 0 : d < 1.25 ? (d - 0.85) / 0.4 : z < -6.5 ? 0 : 1; });
    stoneBlocks(R, -30, 30, 0, 7, -6.8);
    b.build(R);
    // brass rings at both ends (Phong, small highlight)
    const brass = twoTone(new THREE.MeshPhongMaterial({ color: "#c8952e", specular: "#ffe2a0", shininess: 50 }), 0.15);
    for (const x of [c.x - BL / 2, c.x + BL / 2]) { const t = new THREE.TorusGeometry(BR * 1.01, 0.026, 8, 6); t.rotateY(Math.PI / 2); t.rotateX(Math.PI / 6); const m = new THREE.Mesh(t, brass); m.position.set(x, c.y, c.z); m.castShadow = true; R.add(m); }
    // front plate with the painted honeycomb (31 drilled, the target pencil-marked)
    const hex = new THREE.Shape(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; const p = [Math.cos(a) * BR * 0.985, Math.sin(a) * BR * 0.985]; if (k) hex.lineTo(p[0], p[1]); else hex.moveTo(p[0], p[1]); }
    const pg = new THREE.ExtrudeGeometry(hex, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 });
    const ptex = plateTex(HOLES.map((_, i) => i).filter((i) => i !== TARGET)); ptex.wrapS = ptex.wrapT = THREE.ClampToEdgeWrapping; ptex.repeat.set(1 / (2 * BR), 1 / (2 * BR)); ptex.offset.set(0.5, 0.5);
    const plateFace = lam("n_plate", () => ({ map: ptex })), plateSide = lam("n_plateSide", () => ({ color: "#b98647" }));
    const plate = new THREE.Mesh(pg, [plateFace, plateSide]); plate.rotation.y = -Math.PI / 2; plate.position.set(c.x - BL / 2 - 0.045, c.y, c.z); plate.castShadow = plate.receiveShadow = true; R.add(plate);
    // ---- brace drill (steel crank, cherry pad + grip, brass ferrules, auger bit) built along +z of the rig, rig z = out of the plate ----
    const steel = twoTone(new THREE.MeshPhongMaterial({ color: "#4a5868", specular: "#c8d0da", shininess: 70 }), 0.15);
    const cherry = twoTone(new THREE.MeshPhongMaterial({ color: "#8a3b22", specular: "#e0a080", shininess: 35 }), 0.15);
    const brassR = twoTone(new THREE.MeshPhongMaterial({ color: "#c8952e", specular: "#ffe2a0", shininess: 50 }), 0.15);   // own material: the rig draws without depth test
    const DS = this.DS, P = (d: number, off = V(0, 0, 0)) => V(0, 0, d * DS).add(off), crank = V(0, 0.13, 0); // crank throw (rig y)
    const tubeAlong = (pts: THREE.Vector3[], r: number, mat: THREE.Material) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05), 64, r, 10), mat); m.castShadow = true; this.rig.add(m); return m; };
    const cylAlong = (a: THREE.Vector3, z: THREE.Vector3, r: number, mat: THREE.Material) => { const d = z.clone().sub(a); const g = new THREE.CylinderGeometry(r, r, d.length(), 20); const m = new THREE.Mesh(g, mat);
      m.position.copy(a).add(z).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.castShadow = true; this.rig.add(m); return m; };
    tubeAlong([P(0.2), P(0.27), P(0.33, crank), P(0.5, crank), P(0.56), P(0.66), P(0.78)], 0.011, steel);
    cylAlong(P(0.35, crank), P(0.48, crank), 0.03, cherry);                 // crank grip (right hand)
    cylAlong(P(0.78), P(0.86), 0.05, cherry); cylAlong(P(0.775), P(0.792), 0.056, brassR);  // head pad (left hand)
    cylAlong(P(0.13), P(0.22), 0.034, steel); cylAlong(P(0.2), P(0.22), 0.038, brassR);       // chuck
    cylAlong(P(-0.03), P(0.135), 0.004, steel);                                                // auger core
    const hel: THREE.Vector3[] = []; for (let k = 0; k < 120; k++) { const u = k / 119, a = u * 7 * Math.PI * 2; hel.push(V(Math.cos(a) * 0.0085, Math.sin(a) * 0.0085, (-0.03 + u * 0.16) * DS)); }
    tubeAlong(hel, 0.0026, steel);
    this.gripL.copy(P(0.415, crank)); this.padL.copy(P(0.84));
    // draw order for readability (refs: the gripped prop is drawn over the hand that holds it): world -> hero card -> drill
    this.rig.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.renderOrder = 3; const mat = m.material as THREE.Material; mat.depthTest = false; } });
    R.add(this.rig);
    // ---- hero ----
    this.hero = new HeroCard(R);
    this.hero.mesh.renderOrder = 2;
  }

  /** pose everything for frame f (60 fps) */
  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, L = LIGHTS.day, K = WLOOK.day;
    const cv = camHook(t);
    cam.position.set(...cv.pos); cam.up.set(0, 1, 0); cam.lookAt(...cv.look); cam.rotateZ(cv.roll);
    cam.fov = cv.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    // light: day preset, sun camera-relative (az from the camera's forward axis, el), frozen for the shot
    const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    const az = THREE.MathUtils.degToRad(-40), el = THREE.MathUtils.degToRad(L.el), right = V(-fwd.z, 0, fwd.x);
    const sunDir = fwd.clone().multiplyScalar(-Math.cos(az)).addScaledVector(right, Math.sin(az)).multiplyScalar(Math.cos(el)).add(V(0, Math.sin(el), 0)).normalize();
    const focus = V(...cv.look);
    this.sun.position.copy(focus).addScaledVector(sunDir, 60); this.sun.target.position.copy(focus); this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const sc = this.sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 5; sc.far = 140; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * 0.6;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(0.42, 0.38, 0.6); TONE.uShadeLift.value.set(...L.lift);   // violet day shadow (refs #7c7388 on sand)
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(0, 0, 0); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms; ["#c8e0f6", "#a9c8ee", "#83a7e4", "#5d8fdb", "#3e79cd"].forEach((h, i) => untone(h, su["c" + i].value));
    su.e.value.set(...[3, 9, 18, 40].map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number, number]);
    this.sky.position.copy(cam.position);
    untone("#c8e0f6", this.fog.color); this.fog.near = 30; this.fog.far = 320; scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    // ---- brace drill on the target hole: axis = out of the plate (-x), turning at BRACE_RPS ----
    const [hx, hy] = HOLES[TARGET];
    this.target.set(BOX.c.x - BOX.L / 2 - 0.05, BOX.c.y + hy, BOX.c.z - hx);   // plate local x -> world -z (plate faces -x)
    const ang = t * BRACE_RPS * Math.PI * 2, adv = 0.012 + 0.004 * Math.sin(ang * 2);
    this.rig.position.copy(this.target).addScaledVector(this.drillAxis, adv * this.DS);
    this.rig.quaternion.setFromUnitVectors(V(0, 0, 1), this.drillAxis).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), ang));
    this.rig.updateMatrixWorld(true);
    const pad = this.padL.clone().applyMatrix4(this.rig.matrixWorld), grip = this.gripL.clone().applyMatrix4(this.rig.matrixWorld);
    // hero stands behind the pad, chest on it, leaning into each turn
    const bob = Math.sin(ang);
    const feet = pad.clone().addScaledVector(this.drillAxis, 0.24); feet.y = 0;
    this.hero.update(feet, cam, { gripL: pad, gripR: grip, mood: "focus", turn: 0.55, lookAt: [0.75, 0.25], headDx: 8, lean: 0.1 + 0.025 * bob, bendL: [0.2, 1], bendR: [-0.3, 1], legSwing: 0.35 });
    return focus;
  }
}
