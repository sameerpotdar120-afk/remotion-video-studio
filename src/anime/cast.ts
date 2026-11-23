// Our cast, built in code on CC0 VRoid bases (licence checked inside each file: CC0).
import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import {
  attach, bbox, bonePos, clothTex, coatSkirt, cutAway, hairStrandTex, hat, paintTex, recolor, recolorTex, setTex, shell, surf, meshesBy, taperTube, toon, withInk, shapeBone, calmRim, faceLines,
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

export const CAST: CharDef[] = [
  { id: "silas", name: "Silas Crane (gang leader)", base: "anime/Sakurada_Fumiriya.vrm", build: silas },
];
