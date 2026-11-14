// The enemy army on the plain: our own soldier cards (toon/foes.js, drawn in code) on camera-facing planes, packed ranks,
// one gold colour for the side, a banner every ~10 figures. Each soldier reacts to the volley physics: flinch (shock pose)
// after the nearest blast reaches him, and the few right next to a blast are thrown on ballistic arcs and land lying down.
import * as THREE from "three";
// @ts-ignore our own JS drawing rig
import { makeFoes } from "./toon/foes.js";
import { cardShade } from "../bridge/cardshade";
import { NOINK } from "../bridge/ink";
import { gY } from "./outside";
import { rng } from "../bridge/paint";

export type Soldier = { id: number; x: number; z: number; y: number; v: number; kind: "spear" | "shield" | "banner"; flip: boolean; tShock: number; fling: null | { t: number; vx: number; vz: number; vy: number; w: number } };
type Card = { mat: THREE.MeshLambertMaterial; geo: THREE.PlaneGeometry };

export const armyLayout = (): Soldier[] => {
  const out: Soldier[] = [], r = rng(31);
  let row = 0;
  for (let z = -50; z >= -64; z -= 0.95, row++) for (let x = -8.5 + (row % 2) * 0.45; x <= 8.5; x += 0.9) {
    const id = out.length, X = x + (r() - 0.5) * 0.3, Z = z + (r() - 0.5) * 0.3;
    out.push({ id, x: X, z: Z, y: gY(X, Z), v: Math.floor(r() * 6), kind: r() < 0.08 ? "banner" : r() < 0.3 ? "shield" : "spear", flip: r() < 0.5, tShock: 99, fling: null });
  }
  return out;
};

export class Army {
  soldiers: Soldier[];
  private cards = new Map<string, Card>();
  private meshes: THREE.Mesh[] = [];
  constructor(parent: THREE.Object3D) {
    this.soldiers = armyLayout();
    const foes = makeFoes() as Record<string, { canvas: HTMLCanvasElement; wm: number; hm: number; feet: number }>;
    for (const [k, c] of Object.entries(foes)) {
      const t = new THREE.CanvasTexture(c.canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      const geo = new THREE.PlaneGeometry(c.wm, c.hm); geo.translate(0, c.hm * (c.feet - 0.5), 0);   // feet at the origin (canvas y runs down)
      this.cards.set(k, { mat: cardShade(new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide })), geo });
    }
    for (const s of this.soldiers) {
      const c = this.card(s, "march"), m = new THREE.Mesh(c.geo, c.mat); m.rotation.order = "YXZ"; m.layers.set(NOINK); m.receiveShadow = true; m.renderOrder = 1;
      this.meshes.push(m); parent.add(m);
    }
  }
  private card(s: Soldier, pose: string) {
    const key = pose === "fly" ? `f2_fly_${s.v}` : pose === "down" ? `f2_down_${s.v}` : `f2_${pose}_${s.kind}_${s.v}`;
    return this.cards.get(key)!;
  }
  /** pose every soldier at time t (seconds) for the given camera */
  update(t: number, cam: THREE.Camera, visible: boolean, dz = 0, marching = false, laugh = false) {
    this.soldiers.forEach((s, i) => {
      const m = this.meshes[i]; m.visible = visible; if (!visible) return;
      let x = s.x, z = s.z + dz, y = dz ? gY(s.x, s.z + dz) : s.y, roll = 0, pose = t >= s.tShock ? "shock" : laugh && s.z > -55 && s.id % 3 !== 1 ? "laugh" : "march";
      if (s.fling && t >= s.fling.t) {
        const f = s.fling, tt = t - f.t, T = (2 * f.vy) / 9.81;
        if (tt < T) { x += f.vx * tt; z += f.vz * tt; y = Math.max(gY(x, z), s.y + f.vy * tt - 4.9 * tt * tt); roll = f.w * tt; pose = "fly"; }
        else { x += f.vx * T; z += f.vz * T; y = gY(x, z); roll = Math.sign(f.w) * Math.PI / 2; pose = "down"; }
      } else if (pose === "shock") { y += Math.abs(Math.sin((t - s.tShock) * 14 + s.id)) * 0.06; roll = Math.sin((t - s.tShock) * 9 + s.id) * 0.08; }
      else if (marching) { const ph = t * 3.6 + (s.id % 2) * Math.PI; y += Math.abs(Math.sin(ph)) * 0.07; roll = Math.sin(ph) * 0.05; }
      else if (pose === "laugh") { y += Math.abs(Math.sin(t * 16 + s.id)) * 0.05; roll = Math.sin(t * 8 + s.id) * 0.1; }
      else { y += Math.abs(Math.sin(t * 6 + s.id)) * 0.02; }
      const c = this.card(s, pose); if (m.material !== c.mat) { m.material = c.mat; m.geometry = c.geo; }
      m.position.set(x, y, z); m.rotation.set(0, Math.atan2(cam.position.x - x, cam.position.z - z), roll); m.scale.x = s.flip ? -1 : 1;
    });
  }
  /** reactions from the impacts: shock wave timing, and ballistic throws for the ones beside a blast */
  react(hits: { t: number; x: number; z: number; r?: number }[]) {
    for (const s of this.soldiers) {
      s.tShock = 99; s.fling = null;
      for (const h of hits) {
        const d = Math.hypot(s.x - h.x, s.z - h.z);
        s.tShock = Math.min(s.tShock, h.t + 0.1 + d / 45 + (s.id % 7) * 0.02);
        const R = h.r ?? 1.9;
        if (d < R && (!s.fling || h.t < s.fling.t)) { const k = Math.min(1, (R - d) / 1.9), a = Math.atan2(s.z - h.z, s.x - h.x);
          s.fling = { t: h.t, vx: Math.cos(a) * (2 + 2.5 * k), vz: Math.sin(a) * (2 + 2.5 * k), vy: 2.5 + 2.5 * k, w: (s.id % 2 ? 1 : -1) * (4 + 4 * k) }; }
      }
    }
  }
}
