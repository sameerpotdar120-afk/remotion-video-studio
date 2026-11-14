// Our mascot (locked: Flame Spikes hair, gold S chain, bean body, tube limbs) as a lit camera-facing card in the 3D world.
// The drawing is our own Canvas2D rig (toon/char.js); the arms are solved by IK onto 3D grip points projected into the
// card plane, so the hands sit exactly on the brace pad / crank grip whatever the camera does.
import * as THREE from "three";
// @ts-ignore  our own JS drawing rig
import { char, HERO } from "./toon/char.js";
// @ts-ignore
import { setCtx, S, F, tube, rectD } from "./toon/kit.js";
import { cardShade, blobMaterial } from "../bridge/cardshade";
import { NOINK } from "../bridge/ink";

export const PX = 300, AK = 2.4;            // design canvas = (640 + 2 PX) x 1100 units, drawn at AK px/unit
const CW = 640 + 2 * PX, CH = 1100;
export const UNIT = 1.72 / 690;             // metres per design unit (hero is 690 units = 1.72 m)
export const LOOK = { ...HERO, body: "#2f6f73", sh: "#0f3134", trim: "quilt", trimCol: "#e0a43c", belt: "#5a3720", quiltCol: "rgba(8,30,32,0.35)", shoe: "#3b2b22" };

export type HeroPose = {
  gripL?: THREE.Vector3; gripR?: THREE.Vector3;   // world points the hands hold (IK)
  armL?: [number, number]; armR?: [number, number];
  mood?: string; turn?: number; lookAt?: [number, number]; lean?: number; legSwing?: number; headDx?: number;
  bendL?: [number, number]; bendR?: [number, number]; blink?: boolean; torch?: boolean;
};

/** a burning torch in the right hand (drawn on the card, design units) */
const torch = (c: CanvasRenderingContext2D, shR: number[], aR: number[], s: number) => {
  const x = shR[0] + aR[0] * s, y = shR[1] + aR[1] * s;
  F(tube([[x - 6, y + 46], [x, y], [x + 8, y - 70]], [14, 14, 12]), "#6b4426", { line: 4, seed: 501, shadow: 0.3, soft: 0.2, hi: 0.3 }); F(rectD(x - 4, y - 92, 26, 26, 6), "#3a2a20", { line: 4, seed: 502, shadow: 0.3, soft: 0.2, hi: 0.2 });
  for (const [r, col] of [[34, "rgba(255,140,30,0.85)"], [22, "rgba(255,210,90,0.95)"], [11, "rgba(255,250,220,1)"]] as [number, string][]) { c.fillStyle = col; c.beginPath(); c.moveTo(x + 9 - r, y - 90); c.quadraticCurveTo(x + 9 - r * 0.8, y - 100 - r * 1.6, x + 9 + r * 0.1, y - 100 - r * 2.4); c.quadraticCurveTo(x + 9 + r * 0.9, y - 100 - r * 1.2, x + 9 + r, y - 90); c.closePath(); c.fill(); }
};
export class HeroCard {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; tex: THREE.CanvasTexture; cv: HTMLCanvasElement; blob: THREE.Mesh;
  private plane = new THREE.Plane(); private ray = new THREE.Ray(); private hit = new THREE.Vector3();
  constructor(parent: THREE.Object3D) {
    this.cv = document.createElement("canvas"); this.cv.width = Math.round(CW * AK); this.cv.height = Math.round(CH * AK);
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    const g = new THREE.PlaneGeometry(CW * UNIT, CH * UNIT); g.translate(0, (CH / 2 - 1050) * -UNIT, 0); // feet (design y 1050) at the origin
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh.castShadow = true; this.mesh.receiveShadow = true; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    // tight contact shadow under the soles (refs: cards sit on the ground with a soft dark contact)
    const bc = document.createElement("canvas"); bc.width = bc.height = 128; const bg = bc.getContext("2d")!;
    const gr = bg.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(60,52,70,1)"); gr.addColorStop(0.55, "rgba(150,140,160,1)"); gr.addColorStop(1, "rgba(255,255,255,1)");
    bg.fillStyle = gr; bg.fillRect(0, 0, 128, 128); const bt = new THREE.CanvasTexture(bc);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.26), blobMaterial(bt)); this.blob.rotation.x = -Math.PI / 2; this.blob.layers.set(NOINK); this.blob.renderOrder = 0.5;
    parent.add(this.blob);
  }
  /** place the card (feet at `feet`, facing the camera, upright) and draw the pose */
  update(feet: THREE.Vector3, cam: THREE.Camera, p: HeroPose) {
    const m = this.mesh; m.position.copy(feet);
    m.rotation.set(0, Math.atan2(cam.position.x - feet.x, cam.position.z - feet.z), 0); m.updateMatrixWorld();
    this.blob.position.set(feet.x, feet.y + 0.004, feet.z);
    // world point -> design coordinates (ray from the camera through the point, hit on the card plane)
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
    this.plane.setFromNormalAndCoplanarPoint(n, feet);
    const toDesign = (w: THREE.Vector3): [number, number] => {
      this.ray.origin.copy(cam.position); this.ray.direction.copy(w).sub(cam.position).normalize();
      this.ray.intersectPlane(this.plane, this.hit);
      const loc = m.worldToLocal(this.hit.clone());
      return [320 + loc.x / UNIT, 1000 - loc.y / UNIT];
    };
    const s = 1.02, shR = [320 + 69.4, 635.9], shL = [320 - 69.4, 635.9];
    let armL = p.armL, armR = p.armR;
    if (p.gripL) { const q = toDesign(p.gripL); armL = [(q[0] - shL[0]) / s, (q[1] - shL[1]) / s]; }
    if (p.gripR) { const q = toDesign(p.gripR); armR = [(q[0] - shR[0]) / s, (q[1] - shR[1]) / s]; }
    const g = this.cv.getContext("2d")!;
    setCtx(g); S.boil = 0; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height);
    g.setTransform(AK, 0, 0, AK, 0, 0); g.translate(PX, 50);
    const lean = p.lean || 0; g.translate(320, 1000); g.rotate(lean); g.translate(-320, -1000);
    char(320, 1000, s, { look: LOOK, mood: p.blink ? "smug" : p.mood || "focus", turn: p.turn ?? 0, lookAt: p.lookAt || [0, 0], armL, armR, legSwing: p.legSwing ?? 0.3,
      headDx: p.headDx || 0, noShadow: true, ik: true, over: p.torch ? () => torch(g, shR, armR || [70, -60], s) : null, armsFront: !!(p.gripL || p.gripR), gripL: !!p.gripL, gripR: !!p.gripR, bendL: p.bendL || [-0.3, 1], bendR: p.bendR || [0.3, 1] });
    this.tex.needsUpdate = true;
  }
}
