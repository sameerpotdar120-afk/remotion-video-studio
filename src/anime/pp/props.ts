// Small props + their physics for the shots: bottles/cans on a rail that burst into falling shards when hit,
// a hat that flies off, a wooden coffin, a poker table, a body lying in the yard, etc.
import * as THREE from "three";
import { toon, withInk } from "../kit";
import { v3, hash, type Fx } from "./engine";

export type Target = { pos: THREE.Vector3; hit: number; color: string; kind: "bottle" | "can" };
// a fence rail with targets; returns the scene updater and an fx function that throws the shards (gravity, spin, bounce on the ground)
export const targetRail = (scene: THREE.Scene, center: THREE.Vector3, yaw: number, targets: Omit<Target, "pos">[], spacing = 0.42) => {
  const g = new THREE.Group(); g.position.copy(center); g.rotation.y = yaw; scene.add(g);
  const wood = toon("#8a6446", { shade: 0.6 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(spacing * (targets.length + 1), 0.08, 0.14), wood); rail.position.y = 1.0; withInk(rail, 0.004); g.add(rail);
  for (const x of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), wood); post.position.set(x * spacing * (targets.length + 1) / 2, 0.55, 0); withInk(post, 0.004); g.add(post); }
  const objs: { mesh: THREE.Object3D; t: Target }[] = [];
  targets.forEach((tg, i) => {
    const m = new THREE.Group(); const x = (i - (targets.length - 1) / 2) * spacing;
    if (tg.kind === "bottle") { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 12), toon(tg.color, { rim: 0.5, shade: 0.7 })); b.position.y = 0.1; withInk(b, 0.002); m.add(b); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.03, 0.09, 10), toon(tg.color, { rim: 0.5 })); n.position.y = 0.24; m.add(n); }
    else { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.11, 14), toon(tg.color, { rim: 0.6, shade: 0.6 })); c.position.y = 0.055; withInk(c, 0.002); m.add(c); }
    m.position.set(x, 1.04, 0); g.add(m); g.updateMatrixWorld(true);
    objs.push({ mesh: m, t: { ...tg, pos: m.getWorldPosition(new THREE.Vector3()).add(v3(0, 0.1, 0)) } });
  });
  const update = (t: number) => { for (const o of objs) { o.mesh.visible = t < o.t.hit; if (o.t.kind === "can" && t >= o.t.hit) { /* cans fly instead of vanishing */ o.mesh.visible = true; const a = t - o.t.hit; const dir = v3(Math.sin(yaw), 0, Math.cos(yaw)); o.mesh.position.set(o.mesh.userData.x0 ?? (o.mesh.userData.x0 = o.mesh.position.x), 1.04 + a * 3.2 - 4.9 * a * a, a * 2.2); o.mesh.rotation.x = a * 14; if (o.mesh.position.y < -0.9) o.mesh.visible = false; void dir; } } };
  const fx = (t: number, f: Fx) => { for (const o of objs) { const a = t - o.t.hit; if (a < 0 || a > 1.2 || o.t.kind !== "bottle") continue;
    for (let i = 0; i < 16; i++) { const h1 = hash(i * 3.1 + o.t.hit), h2 = hash(i * 7.7 + 1), h3 = hash(i * 1.3 + 2); const vel = v3((h1 - 0.5) * 2.4, 1.2 + h2 * 2.6, (h3 - 0.5) * 2.4);
      const p = o.t.pos.clone().addScaledVector(vel, a); p.y -= 4.9 * a * a; if (p.y < 0.02) p.y = 0.02 + Math.abs(Math.sin(a * 9 + i)) * 0.03 * Math.max(0, 1 - a); f.shard(p, i % 3 ? o.t.color : "#ffffff", 0.035 + h2 * 0.04); }
    f.flash(o.t.pos, a < 0.05 ? 0.35 : 0); } };
  return { update, fx, targets: objs.map((o) => o.t) };
};

export const hatProp = (scene: THREE.Scene, color = "#17151a", r = 0.13) => { const g = new THREE.Group(); const m = toon(color, { rim: 0.2, side: THREE.DoubleSide });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, r * 1.0, 24), m); c.position.y = r * 0.5; withInk(c, 0.003); g.add(c);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, r * 0.06, 24), m); withInk(b, 0.003); g.add(b); scene.add(g); return g; };

export const coffinProp = (scene: THREE.Scene, pos: THREE.Vector3, yaw = 0) => { const g = new THREE.Group(); const w = toon("#7a5638", { shade: 0.6 }); const inner = toon("#d8cbb0", { shade: 0.7 });
  const shape = new THREE.Shape(); shape.moveTo(-0.28, -1.0); shape.lineTo(0.28, -1.0); shape.lineTo(0.36, 0.55); shape.lineTo(0.2, 1.0); shape.lineTo(-0.2, 1.0); shape.lineTo(-0.36, 0.55); shape.closePath();
  const floor = new THREE.Mesh(new THREE.ShapeGeometry(shape), inner); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.05; g.add(floor);
  const pts = shape.getPoints(); for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const L = a.distanceTo(b); const wall = new THREE.Mesh(new THREE.BoxGeometry(L, 0.42, 0.04), w); wall.position.set((a.x + b.x) / 2, 0.21, -(a.y + b.y) / 2); wall.rotation.y = -Math.atan2(-(b.y - a.y), b.x - a.x); withInk(wall, 0.003); g.add(wall); }
  const lid = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }), w); lid.rotation.x = -Math.PI / 2; lid.position.set(0.85, 0.06, 0); lid.rotation.z = 0.15; withInk(lid, 0.003); g.add(lid);
  g.position.copy(pos); g.rotation.y = yaw; scene.add(g); return g; };

export const pokerTable = (scene: THREE.Scene, pos: THREE.Vector3) => { const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 40), toon("#2f6a44", { shade: 0.6 })); top.position.y = 0.78; withInk(top, 0.004); g.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.04, 8, 40), toon("#5a3a24")); rim.rotation.x = Math.PI / 2; rim.position.y = 0.8; g.add(rim);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.75, 16), toon("#4a2e1c")); leg.position.y = 0.38; withInk(leg, 0.003); g.add(leg);
  for (let i = 0; i < 9; i++) { const card = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.09), toon(i % 4 ? "#f4efe4" : "#c23a32", { side: THREE.DoubleSide })); card.rotation.x = -Math.PI / 2; card.rotation.z = hash(i) * 3; card.position.set((hash(i + 3) - 0.5) * 0.8, 0.815, (hash(i + 7) - 0.5) * 0.8); g.add(card); }
  for (let i = 0; i < 14; i++) { const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 12), toon(["#c23a32", "#2a4a9a", "#eeeeee"][i % 3])); chip.position.set(0.2 + (i % 3) * 0.05, 0.82 + Math.floor(i / 3) * 0.012, -0.15 + (i % 2) * 0.05); g.add(chip); }
  g.position.copy(pos); scene.add(g); return g; };
export const chair = (scene: THREE.Scene, pos: THREE.Vector3, yaw: number) => { const g = new THREE.Group(); const w = toon("#6a4a30", { shade: 0.6 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), w); seat.position.y = 0.46; withInk(seat, 0.003); g.add(seat);
  for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.46, 0.04), w); l.position.set(x, 0.23, z); g.add(l); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.04), w); back.position.set(0, 0.73, -0.21); withInk(back, 0.003); g.add(back);
  g.position.copy(pos); g.rotation.y = yaw; scene.add(g); return g; };

// townsfolk seen from behind (flashback crowd): simple painted figures with hats that sway; cheap and readable
export const crowd = (scene: THREE.Scene, spots: [number, number, number][], yaw: number) => {
  const figs: THREE.Group[] = []; const cols = ["#5a4a3e", "#3e4a5a", "#6a5a48", "#4a3e48", "#5e5a4a", "#3a3a40"];
  spots.forEach((p, i) => { const g = new THREE.Group(); const c = cols[i % cols.length]; const s = 0.92 + hash(i * 5.1) * 0.16;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.75, 4, 12), toon(c, { shade: 0.6 })); body.position.y = 0.72; body.scale.set(1, 1, 0.75); withInk(body, 0.006); g.add(body);
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 10), toon("#2e2a2a")); legs.position.y = 0.3; g.add(legs);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), toon(hash(i) > 0.5 ? "#e9c8a8" : "#c89a78")); head.position.y = 1.42; withInk(head, 0.004); g.add(head);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.12, 16), toon(hash(i * 3) > 0.5 ? "#3a2e24" : "#d8c49a")); hat.position.y = 1.56; g.add(hat);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.015, 20), hat.material as THREE.Material); brim.position.y = 1.5; withInk(brim, 0.003); g.add(brim);
    g.scale.setScalar(s); g.position.set(...p); g.rotation.y = yaw + (hash(i * 9) - 0.5) * 0.5; scene.add(g); figs.push(g); });
  return (t: number) => figs.forEach((g, i) => { g.rotation.z = Math.sin(t * 2.2 + i) * 0.03; g.position.y = Math.abs(Math.sin(t * 3 + i * 1.7)) * 0.02; });
};
