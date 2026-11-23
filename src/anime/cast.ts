// Our cast, built in code on CC0 VRoid bases (licence checked inside each file: CC0).
import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import {
  attach, bbox, bonePos, hide, clothTex, coatSkirt, cutAway, hairStrandTex, hat, paintTex, recolor, recolorTex, setTex, shell, surf, meshesBy, taperTube, toon, withInk, shapeBone, calmRim, faceLines, beard, paintBeard, cutBones, paintByRegion,
} from "./kit";

export type Built = { vrm: VRM; expression?: Record<string, number>; face?: Record<string, number> };
export type CharDef = { id: string; name: string; base: string; build: (vrm: VRM) => Built };

const ARMS = ["leftUpperArm", "rightUpperArm", "leftLowerArm", "rightLowerArm"] as const;
const TORSO = ["hips", "spine", "chest", "upperChest", "neck", "leftShoulder", "rightShoulder"] as const;

// ---------------- 1. SILAS CRANE: the gang leader ----------------
// tall, gaunt, silver hair in a low ponytail, cold grey eyes, scar down the left cheek,
// charcoal duster over an oxblood waistcoat + dark cravat, flat-crowned wide hat with silver conchos, gun belt, black boots
const silas = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true);
  const head = bonePos(vrm, "head"); const hair = bbox(vrm, "HAIR"); const bottoms = bbox(vrm, "Bottoms");
  const hips = bonePos(vrm, "hips"); const knee = bonePos(vrm, "leftLowerLeg");
  calmRim(vrm);

  // hair: silver, plus a low ponytail
  recolor(vrm, "HAIR", "#c9cfd6", {}, 0.8);
  const hr = (hair.max.x - hair.min.x) / 2;
  const back = hair.min.z + 0.02;
  const tail = new THREE.Mesh(taperTube([new THREE.Vector3(head.x, head.y - 0.02, back + 0.05), new THREE.Vector3(head.x, head.y - 0.07, back + 0.0), new THREE.Vector3(head.x + 0.01, head.y - 0.2, back + 0.0), new THREE.Vector3(head.x + 0.02, head.y - 0.34, back + 0.03)], hr * 0.28, hr * 0.05, 30, 14, 0.8),
    toon("#c9cfd6", { map: hairStrandTex("#d3d8de", "rgba(90,100,115,0.6)"), shade: 0.7 }));
  withInk(tail, 0.003); attach(vrm, "head", tail);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(hr * 0.24, hr * 0.06, 8, 20), toon("#2a1416")); tie.position.set(head.x, head.y - 0.085, back + 0.0); tie.rotation.x = Math.PI / 2; attach(vrm, "head", tie);

  // eyes: cold steel grey; brows: darker, heavier
  recolor(vrm, "EyeIris", "#7f8b97", { strength: 0.85 });
  for (const m of meshesBy(vrm, "FaceBrow")) { const s = surf(m); if (s.map) setTex(s, paintTex(s.map, (g, w, h) => { const im = s.map!.image as CanvasImageSource; g.globalCompositeOperation = "source-over"; for (const dy of [-2, 2, 4]) g.drawImage(im, 0, dy, w, h); g.globalCompositeOperation = "source-atop"; g.fillStyle = "#4b4f58"; g.fillRect(0, 0, w, h); }), 0.9); }
  // face: scar down the left cheek
  for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s = surf(m); if (s.map && (s.map.image as { width: number }).width >= 512) setTex(s, paintTex(s.map, (g, w, h) => {
    const x0 = w * 0.705, y0 = h * 0.615, x1 = w * 0.665, y1 = h * 0.735;
    g.lineCap = "round"; g.strokeStyle = "rgba(150,70,70,0.55)"; g.lineWidth = w * 0.012; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = "rgba(235,190,180,0.9)"; g.lineWidth = w * 0.005; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = "rgba(140,60,60,0.5)"; g.lineWidth = w * 0.003; for (let i = 1; i < 5; i++) { const t = i / 5, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; g.beginPath(); g.moveTo(x - w * 0.012, y - h * 0.003); g.lineTo(x + w * 0.012, y + h * 0.003); g.stroke(); }
    faceLines(g, w, h, { eyeBags: 0.45, smile: 0.3, cheek: 0.35 });
  }), 0.78); }

  // outfit: shirt (top part of the texture) bone white, waistcoat (lower part) oxblood, cravat near-black
  for (const m of meshesBy(vrm, "Tops")) { const s = surf(m); if (!s.map) continue;
    const t1 = recolorTex(s.map, "#e8e2d6", { keep: (_x, y) => y > 0.36 });
    const t2 = recolorTex(t1, "#6b1f24", { keep: (_x, y) => y <= 0.36 }); setTex(s, t2, 0.7); }
  recolor(vrm, "AccessoryNeck", "#24161a");
  recolor(vrm, "Bottoms", "#3a3840");
  recolor(vrm, "Shoes", "#1c1a1d", {}, 0.6);

  // duster coat: torso shell over the top (open at the front so the waistcoat shows), sleeves grown over the arms
  const coatTex = clothTex("#6a707c", "#4a4f5a", "weave");
  const coat = toon("#6a707c", { map: coatTex, shade: 0.62, rim: 0.12 });
  const cx = head.x;
  shell(vrm, "Tops", [...TORSO], 0.016, coat, (p, n) => !(n.z > 0.2 && Math.abs(p.x - cx) < 0.07 && p.y < head.y - 0.12));
  cutAway(vrm, "Tops", [...ARMS]); // the shirt's short sleeves go, the coat sleeves replace them
  shell(vrm, "Body_00_SKIN", [...ARMS], 0.02, coat);
  // high collar
  const neck = bonePos(vrm, "neck");
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.075, 32, 1, true, Math.PI * 0.18, Math.PI * 1.64), toon("#6a707c", { side: THREE.DoubleSide, map: coatTex, shade: 0.62 }));
  collar.position.set(neck.x, neck.y + 0.005, neck.z - 0.005); withInk(collar, 0.003); attach(vrm, "upperChest", collar);
  // coat tails from the waist to below the knee
  const w = (bottoms.max.x - bottoms.min.x) / 2, d = (bottoms.max.z - bottoms.min.z) / 2;
  const top = hips.y + 0.07, len = top - knee.y + 0.16;
  const skirt = coatSkirt(w * 1.12, d * 1.25, 0, len, 0.55, 0.42, "#6a707c", coatTex); skirt.position.set(hips.x, top, (bottoms.max.z + bottoms.min.z) / 2); attach(vrm, "hips", skirt);

  // boots over the trouser legs
  shell(vrm, "Bottoms", ["leftLowerLeg", "rightLowerLeg"], 0.011, toon("#1c1a1d", { shade: 0.5, rim: 0.25 }), (p) => p.y < knee.y - 0.12);
  // gun belt + holster + revolver grip on the right hip
  const beltY = hips.y - 0.02; const bw = w * 1.04, bd = d * 1.12; const ring: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push(new THREE.Vector3(hips.x + Math.sin(a) * bw, beltY - 0.03 * Math.max(0, Math.sin(a)), (bottoms.max.z + bottoms.min.z) / 2 + Math.cos(a) * bd)); }
  const belt = new THREE.Mesh(taperTube(ring, 0.03, 0.03, 48, 8, 0.25), toon("#5a3a24", { shade: 0.6 })); withInk(belt, 0.002); attach(vrm, "hips", belt);
  const hol = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.035), toon("#4a2e1c")); hol.position.set(hips.x - bw * 0.98, beltY - 0.11, (bottoms.max.z + bottoms.min.z) / 2 + 0.01); hol.rotation.z = -0.12; withInk(hol, 0.002); attach(vrm, "hips", hol);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.07, 0.03), toon("#e9e0cc", { rim: 0.3 })); grip.position.set(hips.x - bw * 0.98 + 0.012, beltY - 0.005, (bottoms.max.z + bottoms.min.z) / 2 + 0.012); grip.rotation.z = 0.5; withInk(grip, 0.002); attach(vrm, "hips", grip);

  // hat
  const r = hr * 0.95; const brimY = hair.max.y - r * 0.85;
  cutAway(vrm, "HAIR", null, (p) => p.y > brimY - 0.008);
  const ht = hat("flat", "#1f1e23", "#3a3a42", r); ht.position.set(head.x, brimY, (hair.max.z + hair.min.z) / 2 + 0.005); ht.rotation.x = -0.06; attach(vrm, "head", ht);

  // tall + gaunt
  vrm.scene.scale.setScalar(1.06);
  shapeBone(vrm, "neck", [0.95, 1.1, 0.95]);
  return { vrm, face: { Fcl_BRW_Angry: 0.85, Fcl_EYE_Angry: 0.45, Fcl_MTH_Down: 0.35 } };
};

// ---------------- 2. THOMAS HALE: the father ----------------
// about 40, warm and honest; brown hair, short beard, cream linen shirt with sleeves rolled to mid-forearm,
// brown wool waistcoat, collar open (no tie), blue-grey work trousers, brown boots; broad farmer's shoulders
const thomas = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const knee = bonePos(vrm, "leftLowerLeg");
  recolor(vrm, "HAIR", "#4a3324", {}, 0.75);
  recolor(vrm, "EyeIris", "#7a6040", { strength: 0.85 });
  for (const m of meshesBy(vrm, "FaceBrow")) { const s2 = surf(m); if (s2.map) setTex(s2, paintTex(s2.map, (g, w, h) => { const im = s2.map!.image as CanvasImageSource; for (const dy of [-1, 2]) g.drawImage(im, 0, dy, w, h); g.globalCompositeOperation = "source-atop"; g.fillStyle = "#4a3222"; g.fillRect(0, 0, w, h); }), 0.9); }
  for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s2 = surf(m); if (s2.map && (s2.map.image as { width: number }).width >= 512) setTex(s2, paintTex(s2.map, (g, w, h) => {
    faceLines(g, w, h, { eyeBags: 0.25, smile: 0.25 });
    paintBeard(g, w, h, { color: "#5a3d28", dark: "rgba(35,22,14,0.9)", full: 0.6 });
    g.fillStyle = "rgba(190,110,80,0.10)"; for (const c of [0.33, 0.67]) { g.beginPath(); g.ellipse(c * w, 0.63 * h, 0.05 * w, 0.025 * h, 0, 0, Math.PI * 2); g.fill(); } // sun-warmed cheeks
  }), 0.78); }
  // outfit
  for (const m of meshesBy(vrm, "Tops")) { const s2 = surf(m); if (!s2.map) continue;
    const t1 = recolorTex(s2.map, "#ece2cc", { keep: (_x, y) => y > 0.36 });
    const t2 = recolorTex(t1, "#7d5a3c", { keep: (_x, y) => y <= 0.36 }); setTex(s2, t2, 0.72); }
  for (const m of meshesBy(vrm, "AccessoryNeck")) m.visible = false; // no tie: open collar
  recolor(vrm, "Bottoms", "#566273");
  recolor(vrm, "Shoes", "#5a3c26", {}, 0.6);
  // rolled linen sleeves from the short sleeve down to mid-forearm, with a thicker rolled cuff
  const linen = toon("#fffdf8", { map: clothTex("#fffdf8", "#e2d8c4", "weave"), shade: 0.86 });
  cutAway(vrm, "Tops", [...ARMS]);
  for (const side of ["left", "right"] as const) {
    const el = bonePos(vrm, `${side}LowerArm`), wr = bonePos(vrm, `${side}Hand`); const L = el.distanceTo(wr);
    shell(vrm, "Body_00_SKIN", [`${side}UpperArm`, `${side}Shoulder`, `${side}LowerArm`], 0.015, linen, (p) => p.distanceTo(wr) > L * 0.52, 0.0015);
    shell(vrm, "Body_00_SKIN", [`${side}LowerArm`], 0.023, linen, (p) => { const d = p.distanceTo(el); return d > L * 0.38 && d < L * 0.5; }, 0.0015);
  }
  // work boots
  shell(vrm, "Bottoms", ["leftLowerLeg", "rightLowerLeg"], 0.011, toon("#5a3c26", { shade: 0.55, rim: 0.2 }), (p) => p.y < knee.y - 0.2);
  // broad shoulders, a little shorter than Silas
  vrm.scene.scale.setScalar(0.99);
  shapeBone(vrm, "upperChest", [1.08, 1, 1.06]);
  return { vrm, face: { Fcl_MTH_Fun: 0.25, Fcl_BRW_Joy: 0.15 } };
};

// ---------------- 3. ELI HALE: the boy, 8 (our hero) ----------------
// sandy messy hair, big hazel-green eyes, freckles + rosy cheeks, oversized cream shirt, brown trousers, worn shoes; child proportions
const eli = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const neck = bonePos(vrm, "neck"); const head = bonePos(vrm, "head");
  recolor(vrm, "HAIR", "#b58a52", {}, 0.78);
  recolor(vrm, "EyeIris", "#6f9a5a", { strength: 0.85 });
  for (const m of meshesBy(vrm, "FaceBrow")) { const s2 = surf(m); if (s2.map) setTex(s2, paintTex(s2.map, (g, w, h) => { g.globalCompositeOperation = "source-atop"; g.fillStyle = "#7a5634"; g.fillRect(0, 0, w, h); }), 0.9); }
  for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s2 = surf(m); if (s2.map && (s2.map.image as { width: number }).width >= 512) setTex(s2, paintTex(s2.map, (g, w, h) => {
    g.fillStyle = "rgba(235,120,110,0.22)"; for (const c of [0.31, 0.69]) { g.beginPath(); g.ellipse(c * w, 0.635 * h, 0.06 * w, 0.03 * h, 0, 0, Math.PI * 2); g.fill(); } // rosy cheeks
    g.fillStyle = "rgba(170,95,60,0.55)"; let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 60; i++) { const side = i % 2 ? 0.37 : 0.63; const u = side + (rnd() - 0.5) * 0.16, v = 0.605 + (rnd() - 0.5) * 0.06; if (Math.abs(u - 0.5) < 0.05) continue; g.beginPath(); g.arc(u * w, v * h, w * (0.002 + rnd() * 0.002), 0, Math.PI * 2); g.fill(); } // freckles over nose + cheeks
  }), 0.8); }
  // hoodie -> oversized shirt: drop the hood, recolour cream
  cutBones(vrm, "Tops", /Hood/, 0.02);
  recolor(vrm, "Tops", "#efe6d2", {}, 0.8);
  // suspenders painted onto the shirt along two straps: straight up the front, over the shoulders, crossing into an X on the back
  const hipsP = bonePos(vrm, "hips"); const cx = head.x;
  paintByRegion(vrm, "Tops", (p, n) => {
    if (p.y < hipsP.y + 0.02) return null;
    const front = n.z > 0.05 && p.z > neck.z - 0.02;
    for (const sx of [-1, 1]) {
      let x0: number;
      if (front) x0 = cx + sx * 0.068;
      else { const t = Math.min(1, Math.max(0, (neck.y - 0.04 - p.y) / (neck.y - 0.04 - hipsP.y - 0.02))); x0 = cx + sx * 0.068 * (1 - 2 * t); }
      if (Math.abs(p.x - x0) < 0.014 && p.y < neck.y + 0.02) return "#6b4429";
    }
    return null;
  }, 0.8);
  recolor(vrm, "Bottoms", "#7b5434");
  recolor(vrm, "Shoes", "#6a4a32", {}, 0.6);
  // child proportions: smaller overall, bigger head, narrower shoulders, shorter legs
  vrm.scene.scale.setScalar(0.72);
  shapeBone(vrm, "head", [1.22, 1.22, 1.22], false);
  shapeBone(vrm, "upperChest", [0.92, 0.95, 0.95]);
  shapeBone(vrm, "leftUpperLeg", [1, 0.92, 1], false); shapeBone(vrm, "rightUpperLeg", [1, 0.92, 1], false);
  return { vrm, face: { Fcl_BRW_Sorrow: 0.25, Fcl_EYE_Surprised: 0.2 } };
};

// ---------------- 4. BRAM TOLLIVER: the brute ----------------
// huge, shaved head under a black bowler, thick black full beard, heavy brows + small mean eyes,
// mustard work shirt with rolled sleeves, dark leather waistcoat, gun belt, boots
const bram = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const head = bonePos(vrm, "head"); const hair = bbox(vrm, "HAIR"); const bottoms = bbox(vrm, "Bottoms"); const hips = bonePos(vrm, "hips"); const knee = bonePos(vrm, "leftLowerLeg");
  hide(vrm, "HAIR"); // shaved
  recolor(vrm, "EyeIris", "#4a3a30", { strength: 0.9 });
  for (const m of meshesBy(vrm, "FaceBrow")) { const s2 = surf(m); if (s2.map) setTex(s2, paintTex(s2.map, (g, w, h) => { const im = s2.map!.image as CanvasImageSource; for (const dy of [-4, -2, 2, 4]) g.drawImage(im, 0, dy, w, h); g.globalCompositeOperation = "source-atop"; g.fillStyle = "#1c1614"; g.fillRect(0, 0, w, h); }), 0.9); }
  for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s2 = surf(m); if (s2.map && (s2.map.image as { width: number }).width >= 512) setTex(s2, paintTex(s2.map, (g, w, h) => {
    // shaved scalp: fine stubble dots instead of a flat shadow
    { let sd = 3; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); g.fillStyle = "rgba(40,30,28,0.35)"; for (let i = 0; i < 9000; i++) { const u = rnd(), v = rnd() * 0.47; if (Math.hypot((u - 0.5) / 0.5, (v - 0.27) / 0.3) > 1.05) continue; g.fillRect(u * w, v * h, w * 0.0016, h * 0.0016); } }
    // heavy brows painted just above the brow line, slanting down to the nose
    g.fillStyle = "#1c1614"; for (const sx of [-1, 1]) { const c = 0.5 + sx * 0.155; g.beginPath(); g.moveTo((c - sx * 0.075) * w, 0.462 * h); g.lineTo((c + sx * 0.07) * w, 0.43 * h); g.lineTo((c + sx * 0.075) * w, 0.452 * h); g.lineTo((c - sx * 0.07) * w, 0.488 * h); g.closePath(); g.fill(); }
    // plaster across a broken nose
    g.save(); g.translate(0.5 * w, 0.615 * h); g.rotate(-0.25); g.fillStyle = "#efe3cf"; g.fillRect(-0.045 * w, -0.008 * h, 0.09 * w, 0.016 * h); g.strokeStyle = "rgba(120,90,60,0.6)"; g.lineWidth = w * 0.002; g.strokeRect(-0.045 * w, -0.008 * h, 0.09 * w, 0.016 * h); g.restore();
    g.fillStyle = "rgba(170,90,70,0.10)"; g.fillRect(0, 0, w, h);
    faceLines(g, w, h, { eyeBags: 0.5, smile: 0.45, cheek: 0.3 });
    paintBeard(g, w, h, { color: "#1d1715", dark: "rgba(0,0,0,0.9)", full: 1.4 });
  }), 0.74); }
  // clothes
  for (const m of meshesBy(vrm, "Tops")) { const s2 = surf(m); if (!s2.map) continue;
    const t1 = recolorTex(s2.map, "#dcbf62", { keep: (_x, y) => y > 0.36 });
    const t2 = recolorTex(t1, "#3b2a20", { keep: (_x, y) => y <= 0.36 }); setTex(s2, t2, 0.7); }
  for (const m of meshesBy(vrm, "AccessoryNeck")) m.visible = false;
  recolor(vrm, "Bottoms", "#5b4a3c"); recolor(vrm, "Shoes", "#2c2019", {}, 0.6);
  const mustard = toon("#dcbf62", { map: clothTex("#dcbf62", "#c0a24a", "weave"), shade: 0.78 });
  cutAway(vrm, "Tops", [...ARMS]);
  for (const side of ["left", "right"] as const) {
    const el = bonePos(vrm, `${side}LowerArm`), wr = bonePos(vrm, `${side}Hand`); const L = el.distanceTo(wr);
    shell(vrm, "Body_00_SKIN", [`${side}UpperArm`, `${side}Shoulder`, `${side}LowerArm`], 0.016, mustard, (p) => p.distanceTo(wr) > L * 0.55, 0.002);
    shell(vrm, "Body_00_SKIN", [`${side}LowerArm`], 0.024, mustard, (p) => { const d = p.distanceTo(el); return d > L * 0.36 && d < L * 0.47; }, 0.002);
  }
  shell(vrm, "Bottoms", ["leftLowerLeg", "rightLowerLeg"], 0.012, toon("#2c2019", { shade: 0.5, rim: 0.2 }), (p) => p.y < knee.y - 0.16);
  // gun belt with holster
  const w = (bottoms.max.x - bottoms.min.x) / 2, d = (bottoms.max.z - bottoms.min.z) / 2, cz = (bottoms.max.z + bottoms.min.z) / 2, beltY = hips.y - 0.01;
  const ring: THREE.Vector3[] = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push(new THREE.Vector3(hips.x + Math.sin(a) * w * 1.05, beltY - 0.025 * Math.max(0, Math.sin(a)), cz + Math.cos(a) * d * 1.12)); }
  const belt = new THREE.Mesh(taperTube(ring, 0.03, 0.03, 48, 8, 0.25), toon("#4a3020", { shade: 0.6 })); withInk(belt, 0.002); attach(vrm, "hips", belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.012), toon("#b99a55", { rim: 0.4 })); buckle.position.set(hips.x, beltY, cz + d * 1.12 + 0.004); withInk(buckle, 0.0015); attach(vrm, "hips", buckle);
  const hol = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.17, 0.04), toon("#3a2416")); hol.position.set(hips.x + w * 1.0, beltY - 0.1, cz); hol.rotation.z = 0.12; withInk(hol, 0.002); attach(vrm, "hips", hol);
  // bowler hat sitting on the shaved head (head top from the face/skull, the hair is gone)
  const skull = bbox(vrm, "Face_00_SKIN"); const r = (skull.max.x - skull.min.x) / 2 * 0.98;
  const bw = hat("bowler", "#17151a", "#2a2630", r); bw.position.set(head.x, skull.max.y - r * 0.72, (skull.max.z + skull.min.z) / 2 - 0.005); bw.rotation.x = -0.1; attach(vrm, "head", bw);
  void hair;
  // a wall of a man
  vrm.scene.scale.setScalar(1.04);
  shapeBone(vrm, "upperChest", [1.32, 1.05, 1.3]); shapeBone(vrm, "chest", [1.22, 1, 1.25]); shapeBone(vrm, "spine", [1.18, 1, 1.2]);
  shapeBone(vrm, "neck", [1.25, 0.8, 1.25]);
  for (const sd of ["left", "right"] as const) { shapeBone(vrm, `${sd}UpperArm`, [1.25, 1.25, 1.25], false); shapeBone(vrm, `${sd}UpperLeg`, [1.15, 1, 1.15]); }
  return { vrm, face: { Fcl_BRW_Angry: 1, Fcl_EYE_Angry: 0.6, Fcl_MTH_Angry: 0.35 } };
};

// ---------------- 5. JORY "THE WILD DOG" ----------------
// lean and wiry, long wild black hair past the shoulders, a mean grin, thin moustache, dusty teal shirt,
// fringed buckskin waistcoat, purple neckerchief, gold earring, knife on the belt, boots
const jory = (vrm: VRM): Built => {
  vrm.scene.updateMatrixWorld(true); calmRim(vrm);
  const head = bonePos(vrm, "head"); const neck = bonePos(vrm, "neck"); const hips = bonePos(vrm, "hips"); const knee = bonePos(vrm, "leftLowerLeg");
  const hair = bbox(vrm, "HAIR"); const bottoms = bbox(vrm, "Bottoms");
  recolor(vrm, "HAIR", "#1d1b22", {}, 0.8);
  // long wild strands falling from under the hair at the back and sides
  const hairMat = toon("#24212a", { map: hairStrandTex("#2a2630", "rgba(90,90,120,0.5)"), shade: 0.7 });
  const hc = new THREE.Vector3((hair.max.x + hair.min.x) / 2, head.y + 0.06, (hair.max.z + hair.min.z) / 2); const hr = (hair.max.x - hair.min.x) / 2;
  let sd = 11; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (0.32 + (i / 12) * 1.36) + (rnd() - 0.5) * 0.12; // around the back, side to side
    const sx = Math.sin(a), sz = Math.cos(a);
    const p0 = new THREE.Vector3(hc.x + sx * hr * 0.8, hc.y + 0.02, hc.z + sz * hr * 0.8);
    const len = 0.26 + rnd() * 0.12, out = 0.05 + rnd() * 0.05;
    const pts = [p0, p0.clone().add(new THREE.Vector3(sx * 0.03, -0.08, sz * 0.03)), p0.clone().add(new THREE.Vector3(sx * out, -len * 0.6, sz * out)), p0.clone().add(new THREE.Vector3(sx * (out + 0.02) + (rnd() - 0.5) * 0.06, -len, sz * (out + 0.02)))];
    const st = new THREE.Mesh(taperTube(pts, hr * 0.17, hr * 0.015, 24, 8, 0.55), hairMat); withInk(st, 0.0025); attach(vrm, "head", st);
  }
  recolor(vrm, "EyeIris", "#8a7a3a", { strength: 0.85 });
  for (const m of meshesBy(vrm, "FaceBrow")) { const s2 = surf(m); if (s2.map) setTex(s2, paintTex(s2.map, (g, w, h) => { g.globalCompositeOperation = "source-atop"; g.fillStyle = "#1d1b22"; g.fillRect(0, 0, w, h); }), 0.9); }
  for (const m of meshesBy(vrm, "Face_00_SKIN")) { const s2 = surf(m); if (s2.map && (s2.map.image as { width: number }).width >= 512) setTex(s2, paintTex(s2.map, (g, w, h) => {
    g.fillStyle = "rgba(150,110,80,0.12)"; g.fillRect(0, 0, w, h); // sun-darkened
    faceLines(g, w, h, { eyeBags: 0.55, smile: 0.35, cheek: 0.4 });
    // thin drooping moustache
    g.strokeStyle = "#1d1b22"; g.lineWidth = w * 0.006; g.lineCap = "round";
    g.beginPath(); g.moveTo(0.44 * w, 0.738 * h); g.quadraticCurveTo(0.5 * w, 0.728 * h, 0.56 * w, 0.738 * h); g.stroke();
    // a thin old scar through the right eyebrow
    g.strokeStyle = "rgba(230,190,180,0.9)"; g.lineWidth = w * 0.004; g.beginPath(); g.moveTo(0.33 * w, 0.43 * h); g.lineTo(0.355 * w, 0.5 * h); g.stroke();
  }), 0.78); }
  // hoodie -> teal work shirt; buckskin waistcoat painted over the torso by region (front open)
  cutBones(vrm, "Tops", /Hood/, 0.02);
  recolor(vrm, "Tops", "#3d6866", {}, 0.75);
  // slim shirt sleeves instead of the puffy hoodie ones
  cutAway(vrm, "Tops", [...ARMS]);
  const teal = toon("#69a8a3", { map: clothTex("#69a8a3", "#558e89", "weave"), shade: 0.9 });
  shell(vrm, "Body_00_SKIN", ["upperChest", "chest"], 0.012, teal, (p) => Math.abs(p.x - head.x) > 0.085 && p.y > neck.y - 0.2, 0);
  for (const side of ["left", "right"] as const) { const wr = bonePos(vrm, `${side}Hand`);
    shell(vrm, "Body_00_SKIN", [`${side}UpperArm`, `${side}Shoulder`, `${side}LowerArm`], 0.014, teal, (p) => p.distanceTo(wr) > 0.035, 0.002);
    shell(vrm, "Body_00_SKIN", [`${side}LowerArm`], 0.02, teal, (p) => { const d = p.distanceTo(wr); return d > 0.035 && d < 0.075; }, 0.002); }
  const tops = bbox(vrm, "Tops");
  paintByRegion(vrm, "Tops", (p, n) => {
    if (p.y > neck.y - 0.03 || p.y < hips.y - 0.02) return null;
    const armDist = Math.abs(p.x - head.x); if (armDist > 0.2) return null; // torso only
    if (n.z > 0.3 && Math.abs(p.x - head.x) < 0.028 + (neck.y - p.y) * 0.03) return null; // open V at the front
    return "#b08a5c";
  }, 0.78);
  recolor(vrm, "Bottoms", "#4a4038"); recolor(vrm, "Shoes", "#2f241c", {}, 0.6);
  shell(vrm, "Bottoms", ["leftLowerLeg", "rightLowerLeg"], 0.011, toon("#3a2a1e", { shade: 0.5, rim: 0.2 }), (p) => p.y < knee.y - 0.12);
  // fringe along the bottom of the waistcoat
  const fr = toon("#a07c50", { shade: 0.65 });
  for (let i = 0; i < 26; i++) { const a = Math.PI * 0.15 + (i / 25) * Math.PI * 1.7; const x = head.x + Math.sin(a) * (tops.max.x - tops.min.x) * 0.19, z = (tops.max.z + tops.min.z) / 2 + Math.cos(a) * (tops.max.z - tops.min.z) * 0.42;
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.06, 0.004), fr); f.position.set(x, hips.y - 0.04, z); f.rotation.y = a; attach(vrm, "hips", f); }
  // purple neckerchief: knotted triangle under the chin
  const nk = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.016, 8, 24), toon("#6b3a8a")); nk.position.set(neck.x, neck.y - 0.005, neck.z); nk.rotation.x = Math.PI / 2 - 0.15; nk.scale.set(1, 0.9, 1); withInk(nk, 0.002); attach(vrm, "neck", nk);
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 3), toon("#6b3a8a")); tri.position.set(neck.x, neck.y - 0.05, neck.z + 0.065); tri.rotation.set(Math.PI, 0, 0); tri.scale.z = 0.25; withInk(tri, 0.002); attach(vrm, "upperChest", tri);
  // gold earring (left ear)
  const face = bbox(vrm, "Face_00_SKIN");
  const ear = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0025, 8, 16), toon("#e0b84a", { rim: 0.5 })); ear.position.set(face.max.x - 0.005, head.y + 0.01, head.z + 0.005); ear.rotation.y = Math.PI / 2; attach(vrm, "head", ear);
  // belt + knife
  const w = (bottoms.max.x - bottoms.min.x) / 2, d = (bottoms.max.z - bottoms.min.z) / 2, cz = (bottoms.max.z + bottoms.min.z) / 2, beltY = hips.y - 0.01;
  const ring: THREE.Vector3[] = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push(new THREE.Vector3(hips.x + Math.sin(a) * w * 1.05, beltY, cz + Math.cos(a) * d * 1.12)); }
  const belt = new THREE.Mesh(taperTube(ring, 0.024, 0.024, 48, 8, 0.25), toon("#3a2618", { shade: 0.6 })); withInk(belt, 0.002); attach(vrm, "hips", belt);
  const sheath = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.02), toon("#2a1c12")); sheath.position.set(hips.x - w * 1.0, beltY - 0.08, cz + 0.02); sheath.rotation.z = -0.25; withInk(sheath, 0.0018); attach(vrm, "hips", sheath);
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 10), toon("#c8b89a")); hilt.position.set(hips.x - w * 1.0 + 0.016, beltY + 0.02, cz + 0.02); hilt.rotation.z = -0.25; withInk(hilt, 0.0015); attach(vrm, "hips", hilt);
  // lean, a touch taller than the base
  vrm.scene.scale.setScalar(1.03);
  shapeBone(vrm, "upperChest", [0.95, 1, 0.92]);
  return { vrm, face: { Fcl_MTH_Fun: 0.85, Fcl_MTH_Joy: 0.15, Fcl_EYE_Angry: 0.45, Fcl_BRW_Angry: 0.75 } };
};

export const CAST: CharDef[] = [
  { id: "silas", name: "Silas Crane (gang leader)", base: "anime/Sakurada_Fumiriya.vrm", build: silas },
  { id: "thomas", name: "Thomas Hale (the father)", base: "anime/Sakurada_Fumiriya.vrm", build: thomas },
  { id: "eli", name: "Eli Hale (the boy, 8)", base: "anime/HairSample_Male.vrm", build: eli },
  { id: "bram", name: "Bram Tolliver (the brute)", base: "anime/Sakurada_Fumiriya.vrm", build: bram },
  { id: "jory", name: "Jory \"the Wild Dog\"", base: "anime/HairSample_Male.vrm", build: jory },
];
