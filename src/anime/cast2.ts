// Cast for the rest of the film (same CC0 VRoid bases + kit as cast.ts):
// the old neighbor, Eli at 15 / grown / old, cavalry soldiers + colonel, two saloon gunmen, the college man, the mascot.
import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import {
  attach, bbox, bonePos, hide, clothTex, coatSkirt, cutAway, hat, paintTex, recolor, recolorTex, setTex, shell, surf, meshesBy, toon, withInk, shapeBone, calmRim, faceLines, paintBeard, cutBones, paintByRegion, revolver, inHand, fist,
} from "./kit";
import { CAST, type Built, type CharDef } from "./cast";

const ARMS = ["leftUpperArm", "rightUpperArm", "leftLowerArm", "rightLowerArm"] as const;
const TORSO = ["hips", "spine", "chest", "upperChest", "neck", "leftShoulder", "rightShoulder"] as const;
const FUMI = "anime/Sakurada_Fumiriya.vrm", KID = "anime/HairSample_Male.vrm";

// ---------- shared pieces ----------
const brows = (vrm: VRM, color: string, thick = [-1, 2]) => { for (const m of meshesBy(vrm, "FaceBrow")) { const s = surf(m); if (s.map) setTex(s, paintTex(s.map, (g, w, h) => { const im = s.map!.image as CanvasImageSource; for (const dy of thick) g.drawImage(im, 0, dy, w, h); g.globalCompositeOperation = "source-atop"; g.fillStyle = color; g.fillRect(0, 0, w, h); }), 0.9); } };
const face = (vrm: VRM, paint: (g: CanvasRenderingContext2D, w: number, h: number) => void) => { for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s = surf(m); if (s.map && (s.map.image as { width: number }).width >= 512) setTex(s, paintTex(s.map, paint), 0.78); } };
const freckles = (g: CanvasRenderingContext2D, w: number, h: number, n = 50, a = 0.5) => { g.fillStyle = `rgba(170,95,60,${a})`; let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { const side = i % 2 ? 0.37 : 0.63; const u = side + (rnd() - 0.5) * 0.16, v = 0.605 + (rnd() - 0.5) * 0.06; if (Math.abs(u - 0.5) < 0.05) continue; g.beginPath(); g.arc(u * w, v * h, w * (0.002 + rnd() * 0.002), 0, Math.PI * 2); g.fill(); } };
const twoTone = (vrm: VRM, top: string, low: string, shade = 0.72) => { for (const m of meshesBy(vrm, "Tops")) { const s = surf(m); if (!s.map) continue; const t1 = recolorTex(s.map, top, { keep: (_x, y) => y > 0.36 }); setTex(s, recolorTex(t1, low, { keep: (_x, y) => y <= 0.36 }), shade); } };
const sleeves = (vrm: VRM, mat: THREE.Material, toWrist = true) => { cutAway(vrm, "Tops", [...ARMS]);
  for (const side of ["left", "right"] as const) { const el = bonePos(vrm, `${side}LowerArm`), wr = bonePos(vrm, `${side}Hand`); const L = el.distanceTo(wr);
    shell(vrm, "Body_00_SKIN", [`${side}UpperArm`, `${side}Shoulder`, `${side}LowerArm`], 0.016, mat, toWrist ? (p) => p.distanceTo(wr) > L * 0.12 : (p) => p.distanceTo(wr) > L * 0.52, 0.0015); } };
const boots = (vrm: VRM, color: string, high = 0.15) => { const knee = bonePos(vrm, "leftLowerLeg"); recolor(vrm, "Shoes", color, {}, 0.6); shell(vrm, "Bottoms", ["leftLowerLeg", "rightLowerLeg"], 0.011, toon(color, { shade: 0.55, rim: 0.2 }), (p) => p.y < knee.y - high); };
const headHat = (vrm: VRM, style: Parameters<typeof hat>[0], color: string, band: string, scale = 0.95, tilt = -0.06, studs = false) => {
  const head = bonePos(vrm, "head"); const hair = bbox(vrm, "HAIR"); const hr = (hair.max.x - hair.min.x) / 2; const r = hr * scale; const brimY = hair.max.y - r * 0.85;
  cutAway(vrm, "HAIR", null, (p) => p.y > brimY - 0.008);
  const h = hat(style, color, band, r, studs); h.position.set(head.x, brimY, (hair.max.z + hair.min.z) / 2 + 0.005); h.rotation.x = tilt; attach(vrm, "head", h); return h; };
const kepi = (vrm: VRM, color: string) => { // soldier's forage cap: slanted crown + small leather visor
  const head = bonePos(vrm, "head"); const hair = bbox(vrm, "HAIR"); const hr = (hair.max.x - hair.min.x) / 2; const y0 = hair.max.y - hr * 0.75;
  cutAway(vrm, "HAIR", null, (p) => p.y > y0 - 0.006);
  const g = new THREE.Group(); const m = toon(color, { shade: 0.6, rim: 0.15 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(hr * 0.82, hr * 0.98, hr * 0.85, 32), m); crown.position.y = hr * 0.42; crown.rotation.x = 0.18; withInk(crown, 0.003); g.add(crown);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(hr * 0.84, hr * 0.84, hr * 0.06, 32), m); top.position.set(0, hr * 0.86, -hr * 0.12); top.rotation.x = 0.18; g.add(top);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.75, 20, 8, 0, Math.PI, 0, Math.PI / 2), toon("#1b1716", { side: THREE.DoubleSide, rim: 0.3 })); visor.scale.set(1, 0.08, 0.7); visor.rotation.set(-0.25, -Math.PI / 2 + Math.PI / 2, 0); visor.position.set(0, hr * 0.02, hr * 0.72); withInk(visor, 0.002); g.add(visor);
  const band = new THREE.Mesh(new THREE.TorusGeometry(hr * 0.98, hr * 0.04, 6, 32), toon("#d4b04a", { rim: 0.4 })); band.rotation.x = Math.PI / 2; band.position.y = hr * 0.05; g.add(band);
  g.position.set(head.x, y0, (hair.max.z + hair.min.z) / 2 + 0.01); attach(vrm, "head", g); };
const topHat = (vrm: VRM, color: string) => { const head = bonePos(vrm, "head"); const hair = bbox(vrm, "HAIR"); const hr = (hair.max.x - hair.min.x) / 2; const y0 = hair.max.y - hr * 0.8;
  cutAway(vrm, "HAIR", null, (p) => p.y > y0 - 0.006); const g = new THREE.Group(); const m = toon(color, { shade: 0.55, rim: 0.3 });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(hr * 0.98, hr * 0.92, hr * 1.9, 32), m); c.position.y = hr * 0.95; withInk(c, 0.003); g.add(c);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(hr * 1.55, hr * 1.55, hr * 0.06, 32), m); withInk(b, 0.003); g.add(b);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(hr * 0.99, hr * 0.99, hr * 0.3, 32, 1, true), toon("#8a2f2a")); band.position.y = hr * 0.2; g.add(band);
  g.position.set(head.x, y0, (hair.max.z + hair.min.z) / 2); attach(vrm, "head", g); };
// gun belt with a holstered revolver (grip named "holsterGrip" so scenes can hide it on the draw)
const gunBelt = (vrm: VRM, leather = "#5a3a24", grip = "#e9e0cc") => {
  const hips = bonePos(vrm, "hips"); const bottoms = bbox(vrm, "Bottoms"); const w = (bottoms.max.x - bottoms.min.x) / 2, d = (bottoms.max.z - bottoms.min.z) / 2; const cz = (bottoms.max.z + bottoms.min.z) / 2;
  const beltY = hips.y - 0.02, bw = w * 1.04, bd = d * 1.12; const ring: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push(new THREE.Vector3(Math.sin(a) * bw, -0.03 * Math.max(0, Math.sin(a)), Math.cos(a) * bd)); }
  const belt = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring, true), 48, 0.012, 6, true), toon(leather, { shade: 0.6 })); belt.scale.set(1, 1.6, 1); belt.position.set(hips.x, beltY, cz); withInk(belt, 0.002); attach(vrm, "hips", belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.01), toon("#cfc6a8", { rim: 0.5 })); buckle.position.set(hips.x, beltY, cz + bd + 0.004); attach(vrm, "hips", buckle);
  const hol = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.035), toon(leather)); hol.position.set(hips.x - bw * 0.98, beltY - 0.11, cz + 0.01); hol.rotation.z = -0.12; withInk(hol, 0.002); attach(vrm, "hips", hol);
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.07, 0.03), toon(grip, { rim: 0.3 })); g.position.set(hips.x - bw * 0.98 + 0.012, beltY - 0.005, cz + 0.012); g.rotation.z = 0.5; g.name = "holsterGrip"; withInk(g, 0.002); attach(vrm, "hips", g);
};
const armed = (vrm: VRM, side: "left" | "right" = "right") => { const r = revolver(); inHand(vrm, side, r).name = side === "right" ? "gun" : "gunL"; fist(vrm, side, 0.85); };
const duster = (vrm: VRM, color: string, line: string, len = 0.16) => {
  const head = bonePos(vrm, "head"); const hips = bonePos(vrm, "hips"); const knee = bonePos(vrm, "leftLowerLeg"); const bottoms = bbox(vrm, "Bottoms");
  const tex = clothTex(color, line, "weave"); const coat = toon(color, { map: tex, shade: 0.62, rim: 0.12 }); const cx = head.x;
  shell(vrm, "Tops", [...TORSO], 0.016, coat, (p, n) => !(n.z > 0.2 && Math.abs(p.x - cx) < 0.07 && p.y < head.y - 0.12));
  cutAway(vrm, "Tops", [...ARMS]); shell(vrm, "Body_00_SKIN", [...ARMS], 0.02, coat);
  const w = (bottoms.max.x - bottoms.min.x) / 2, d = (bottoms.max.z - bottoms.min.z) / 2; const top = hips.y + 0.07, l = top - knee.y + len;
  const skirt = coatSkirt(w * 1.12, d * 1.25, 0, l, 0.55, 0.42, color, tex); skirt.position.set(hips.x, top, (bottoms.max.z + bottoms.min.z) / 2); skirt.name = "coatTail"; attach(vrm, "hips", skirt); };

// ---------- 1. OLD AMOS: the neighbor ----------
// 70s, stooped, white stubble + wispy white hair, deep lines, kind wet eyes, frayed straw hat, faded denim bib overalls over a grey work shirt
const amos = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const neck = bonePos(vrm, "neck"); const hips = bonePos(vrm, "hips"); const head = bonePos(vrm, "head");
  recolor(vrm, "HAIR", "#d8d4cc", {}, 0.82); recolor(vrm, "EyeIris", "#7d8fa0", { strength: 0.8 }); brows(vrm, "#e4e0d8", [-2, 2, 3]);
  face(vrm, (g, w, h) => { faceLines(g, w, h, { eyeBags: 0.95, smile: 0.7, cheek: 0.8, color: "rgba(120,70,60,0.6)" });
    g.strokeStyle = "rgba(120,70,60,0.45)"; g.lineWidth = w * 0.003; for (const y of [0.36, 0.385, 0.41]) { g.beginPath(); g.moveTo(w * 0.4, h * y); g.quadraticCurveTo(w * 0.5, h * (y - 0.006), w * 0.6, h * y); g.stroke(); } // forehead lines
    paintBeard(g, w, h, { color: "#ece8e0", dark: "rgba(150,140,130,0.6)", full: 0.55 }); });
  twoTone(vrm, "#9aa3ab", "#9aa3ab", 0.75); hide(vrm, "AccessoryNeck");
  cutBones(vrm, "Tops", /Hood/, 0.02);
  // bib overalls: denim front panel + two straps painted on the shirt, trousers denim
  paintByRegion(vrm, "Tops", (p, n) => { if (n.z > 0.1 && p.y < neck.y - 0.1 && p.y > hips.y - 0.05 && Math.abs(p.x - head.x) < 0.1) return "#5f7896"; for (const sx of [-1, 1]) if (Math.abs(p.x - (head.x + sx * 0.075)) < 0.016 && p.y > neck.y - 0.12) return "#5f7896"; return null; }, 0.78);
  recolor(vrm, "Bottoms", "#5f7896"); boots(vrm, "#4a3526", 0.22); sleeves(vrm, toon("#9aa3ab", { map: clothTex("#9aa3ab", "#868e96", "weave"), shade: 0.8 }), false);
  headHat(vrm, "straw", "#d9bd80", "#6a4a2a", 0.98, -0.12);
  vrm.scene.scale.setScalar(0.94); shapeBone(vrm, "upperChest", [0.96, 1, 1.02]);
  return { vrm, face: { Fcl_BRW_Sorrow: 0.7, Fcl_EYE_Close: 0.1 } };
};

// ---------- 2. ELI at 15 / grown / old ("the kid") ----------
const peteBase = (vrm: VRM, o: { hair: string; shirt: string; pants: string; hat: string; band: string; scale: number; head: number; stubble?: number; grey?: boolean }) => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  recolor(vrm, "HAIR", o.hair, {}, 0.78); recolor(vrm, "EyeIris", "#6f9a5a", { strength: 0.85 }); brows(vrm, o.grey ? "#bdb8b0" : "#7a5634", [-1, 1]);
  face(vrm, (g, w, h) => { freckles(g, w, h, o.grey ? 20 : 50, o.grey ? 0.25 : 0.45); if (o.stubble) paintBeard(g, w, h, { color: o.grey ? "#e6e2da" : "#8a6440", dark: o.grey ? "rgba(140,130,120,0.6)" : "rgba(60,40,25,0.7)", full: o.stubble }); if (o.grey) faceLines(g, w, h, { eyeBags: 0.7, smile: 0.6, cheek: 0.5 }); });
  cutBones(vrm, "Tops", /Hood/, 0.02);
  recolor(vrm, "Tops", o.shirt, {}, 0.78); recolor(vrm, "Bottoms", o.pants); boots(vrm, "#5a3c26");
  sleeves(vrm, toon(o.shirt, { map: clothTex(o.shirt, "rgba(0,0,0,0.12)", "weave"), shade: 0.78 }));
  gunBelt(vrm); headHat(vrm, "cowboy", o.hat, o.band, 1.02, -0.08);
  vrm.scene.scale.setScalar(o.scale); shapeBone(vrm, "head", [o.head, o.head, o.head], false);
};
const pete15 = (vrm: VRM): Built => { peteBase(vrm, { hair: "#c9a066", shirt: "#7a9cc8", pants: "#a07c52", hat: "#c99a5a", band: "#6a4a2a", scale: 0.92, head: 1.06 }); return { vrm, face: { Fcl_BRW_Angry: 0.35, Fcl_EYE_Angry: 0.2 } }; };
const pete15Armed = (vrm: VRM): Built => { const b = pete15(vrm); armed(vrm); return b; };
const peteMan = (vrm: VRM): Built => { peteBase(vrm, { hair: "#b8925a", shirt: "#5f7fa8", pants: "#7a6046", hat: "#8a6a48", band: "#3a2a1c", scale: 1.0, head: 1.0, stubble: 0.35 }); duster(vrm, "#8a6a4c", "#6a4e36"); return { vrm, face: { Fcl_BRW_Angry: 0.55, Fcl_EYE_Angry: 0.3 } }; };
const peteManArmed = (vrm: VRM): Built => { const b = peteMan(vrm); armed(vrm); return b; };
const peteOld = (vrm: VRM): Built => { peteBase(vrm, { hair: "#dcd8d0", shirt: "#e8e2d4", pants: "#5a5048", hat: "#d8cbb0", band: "#3a2a1c", scale: 0.97, head: 1.0, stubble: 0.85, grey: true }); duster(vrm, "#6e6a60", "#55524a", 0.1); return { vrm, face: { Fcl_MTH_Fun: 0.35, Fcl_EYE_Joy: 0.2 } }; };

// ---------- 3. cavalry soldiers + the colonel ----------
const soldierBase = (vrm: VRM, v: number) => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const hips = bonePos(vrm, "hips"); const hairCol = ["#3a2a20", "#8a5a2c", "#1e1a18", "#6a6058"][v];
  recolor(vrm, "HAIR", hairCol, {}, 0.78); brows(vrm, hairCol, [-1, 2]);
  cutBones(vrm, "Tops", /Hood/, 0.02); hide(vrm, "AccessoryNeck");
  const navy = "#2d3d6e"; recolor(vrm, "Tops", navy, {}, 0.72); sleeves(vrm, toon(navy, { map: clothTex(navy, "#24325c", "weave"), shade: 0.72 }));
  // brass buttons down the front
  paintByRegion(vrm, "Tops", (p, n) => { if (n.z < 0.3) return null; const dx = Math.abs(p.x - hips.x); if (dx > 0.012) return null; const k = ((p.y - hips.y) / 0.055) % 1; return k > 0.35 && k < 0.65 ? "#e0c060" : null; }, 0.9);
  // sky-blue trousers with the yellow cavalry stripe down the outer leg
  const bt = bbox(vrm, "Bottoms"); const w = (bt.max.x - bt.min.x) / 2;
  recolor(vrm, "Bottoms", "#8fb0d6"); paintByRegion(vrm, "Bottoms", (p) => (Math.abs(Math.abs(p.x - hips.x) - w * 0.92) < 0.016 && p.y < hips.y ? "#e8c040" : null), 0.85);
  boots(vrm, "#1e1a1a", 0.12);
};
const soldier = (v: number) => (vrm: VRM): Built => {
  soldierBase(vrm, v); kepi(vrm, "#2a3866");
  face(vrm, (g, w, h) => { if (v === 1) paintBeard(g, w, h, { color: "#8a5a2c", dark: "rgba(60,35,20,0.8)", full: 0.35, must: true }); if (v === 2) faceLines(g, w, h, { smile: 0.6, cheek: 0.4 }); });
  vrm.scene.scale.setScalar([1.0, 1.04, 0.97][v] ?? 1); if (v === 1) { shapeBone(vrm, "upperChest", [1.15, 1, 1.12]); shapeBone(vrm, "chest", [1.12, 1, 1.12]); }
  return { vrm, face: { Fcl_MTH_Joy: 0.6, Fcl_EYE_Joy: 0.4 } };
};
const colonel = (vrm: VRM): Built => {
  soldierBase(vrm, 3); headHat(vrm, "cowboy", "#25304f", "#d4b04a", 1.02, -0.06);
  const sh = bonePos(vrm, "leftUpperArm"); const sh2 = bonePos(vrm, "rightUpperArm");
  for (const p of [sh, sh2]) { const ep = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.014, 0.05), toon("#e0c060", { rim: 0.5 })); ep.position.set(p.x, p.y + 0.045, p.z); withInk(ep, 0.002); attach(vrm, "upperChest", ep); }
  face(vrm, (g, w, h) => { faceLines(g, w, h, { eyeBags: 0.5, smile: 0.5, cheek: 0.4 }); paintBeard(g, w, h, { color: "#c8c0b4", dark: "rgba(90,80,70,0.8)", full: 0.2, must: true }); });
  vrm.scene.scale.setScalar(1.02); shapeBone(vrm, "chest", [1.1, 1, 1.15]);
  return { vrm, face: { Fcl_MTH_Fun: 0.5, Fcl_BRW_Surprised: 0.4 } };
};

// ---------- 4. the two gunmen at Silas's side ----------
const gunman = (v: number) => (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm); cutBones(vrm, "Tops", /Hood/, 0.02); hide(vrm, "AccessoryNeck");
  if (v === 0) { recolor(vrm, "HAIR", "#2a2422", {}, 0.75); brows(vrm, "#1a1614", [-3, 2]); twoTone(vrm, "#d8cfc0", "#2a2a30"); recolor(vrm, "Bottoms", "#3a342e"); boots(vrm, "#2a2420"); duster(vrm, "#b0905c", "#8a6e44");
    headHat(vrm, "bowler", "#2a2420", "#121010", 1.0, -0.05); face(vrm, (g, w, h) => { paintBeard(g, w, h, { color: "#2a2422", dark: "rgba(15,10,10,0.9)", full: 0.45, must: true }); faceLines(g, w, h, { eyeBags: 0.5 }); }); }
  else { recolor(vrm, "HAIR", "#6a3a24", {}, 0.75); brows(vrm, "#4a2618", [-2, 2]); twoTone(vrm, "#c8b8a0", "#20242c"); recolor(vrm, "Bottoms", "#4a4038"); boots(vrm, "#3a2a1e"); sleeves(vrm, toon("#c8b8a0", { shade: 0.78 }), false);
    headHat(vrm, "flat", "#3a3028", "#1a1612", 1.0, -0.04, false); face(vrm, (g, w, h) => { paintBeard(g, w, h, { color: "#6a3a24", dark: "rgba(40,20,10,0.9)", full: 0.7 }); }); vrm.scene.scale.setScalar(1.05); shapeBone(vrm, "upperChest", [1.2, 1, 1.15]); }
  gunBelt(vrm, "#3a2a1c"); armed(vrm);
  return { vrm, face: { Fcl_MTH_Fun: 0.6, Fcl_BRW_Angry: 0.6, Fcl_EYE_Angry: 0.3 } };
};

// ---------- 5. the college man (decades later) ----------
const dean = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm); cutBones(vrm, "Tops", /Hood/, 0.02);
  recolor(vrm, "HAIR", "#b8b2a8", {}, 0.8); brows(vrm, "#9a948a", [-1, 2]);
  const check = clothTex("#c8ccd6", "#6a7488", "plaid", 1.4); for (const m of meshesBy(vrm, "Tops")) { const s = surf(m); s.map = check; s.shadeMultiplyTexture = check; s.color.set("#ffffff"); s.needsUpdate = true; }
  sleeves(vrm, toon("#c8ccd6", { map: check, shade: 0.75 })); recolor(vrm, "Bottoms", "#a8aebc"); recolor(vrm, "AccessoryNeck", "#8a2f2a"); boots(vrm, "#1a1818", 0.3);
  topHat(vrm, "#1c1a20"); face(vrm, (g, w, h) => { faceLines(g, w, h, { smile: 0.8, cheek: 0.9, eyeBags: 0.4 }); paintBeard(g, w, h, { color: "#d0cac0", dark: "rgba(110,100,90,0.8)", full: 0.25, must: true }); });
  shapeBone(vrm, "chest", [1.35, 1, 1.45]); shapeBone(vrm, "spine", [1.35, 1, 1.5]); shapeBone(vrm, "upperChest", [1.2, 1, 1.25]);
  return { vrm, face: { Fcl_MTH_Joy: 0.7, Fcl_EYE_Joy: 0.5 } };
};

// ---------- 6. the mascot: a big-headed, cheerful costume version of the kid (our own design) ----------
const mascot = (vrm: VRM): Built => {
  peteBase(vrm, { hair: "#e0b45a", shirt: "#e8eef6", pants: "#3c5aa8", hat: "#e0a650", band: "#8a4a20", scale: 0.95, head: 1.75 });
  const hips = bonePos(vrm, "hips"); const neck = bonePos(vrm, "neck");
  paintByRegion(vrm, "Tops", (p) => (p.y < neck.y - 0.05 && p.y > hips.y ? "#c23a32" : null), 0.75); // red vest
  face(vrm, (g, w, h) => { g.fillStyle = "rgba(240,110,110,0.45)"; for (const c of [0.3, 0.7]) { g.beginPath(); g.ellipse(c * w, 0.64 * h, 0.07 * w, 0.04 * h, 0, 0, Math.PI * 2); g.fill(); } });
  armed(vrm, "right"); armed(vrm, "left");
  shapeBone(vrm, "upperChest", [1.12, 1, 1.15]); shapeBone(vrm, "spine", [1.2, 0.9, 1.25]);
  return { vrm, face: { Fcl_MTH_Joy: 0.95, Fcl_EYE_Joy: 0.3, Fcl_BRW_Joy: 0.6 } };
};

const withGun = (id: string) => (vrm: VRM): Built => { const b = CAST.find((c) => c.id === id)!.build(vrm); armed(vrm); return b; };
const amosArmed = (vrm: VRM): Built => { const b = amos(vrm); armed(vrm); return b; };

export const CAST2: CharDef[] = [
  { id: "eli_armed", name: "Eli (8) holding the revolver", base: KID, build: withGun("eli") },
  { id: "amos_armed", name: "Old Amos with the revolver", base: FUMI, build: amosArmed },
  { id: "bram_armed", name: "Bram, gun drawn", base: FUMI, build: withGun("bram") },
  { id: "jory_armed", name: "Jory, gun drawn", base: KID, build: withGun("jory") },
  { id: "abel_armed", name: "Abel, gun drawn", base: FUMI, build: withGun("abel") },
  { id: "cain_armed", name: "Cain, gun drawn", base: FUMI, build: withGun("cain") },
  { id: "lucien_armed", name: "Lucien, gun drawn", base: KID, build: withGun("lucien") },
  { id: "amos", name: "Old Amos (the neighbor)", base: FUMI, build: amos },
  { id: "pete15", name: "Eli at 15", base: KID, build: pete15 },
  { id: "pete15_armed", name: "Eli at 15, gun drawn", base: KID, build: pete15Armed },
  { id: "pete", name: "Eli grown", base: KID, build: peteMan },
  { id: "pete_armed", name: "Eli grown, gun drawn", base: KID, build: peteManArmed },
  { id: "pete_old", name: "Eli old", base: KID, build: peteOld },
  { id: "soldier0", name: "Soldier (lean)", base: FUMI, build: soldier(0) },
  { id: "soldier1", name: "Soldier (big, mustache)", base: FUMI, build: soldier(1) },
  { id: "soldier2", name: "Soldier (grinner)", base: KID, build: soldier(2) },
  { id: "colonel", name: "The Colonel", base: FUMI, build: colonel },
  { id: "gunman0", name: "Gunman in the tan duster", base: FUMI, build: gunman(0) },
  { id: "gunman1", name: "Gunman, red beard", base: FUMI, build: gunman(1) },
  { id: "dean", name: "The college man", base: FUMI, build: dean },
  { id: "mascot", name: "The mascot", base: KID, build: mascot },
];
export const findChar = (id: string) => [...CAST, ...CAST2].find((c) => c.id === id)!;
