// Shared 3D helpers: hand-drawn canvas textures on simple geometry, 2D cut-out actors, glows, camera paths.
import * as THREE from 'three';
import { setCtx, F, Ln, sm, ellD, rectD, S, INK } from './kit.js';
import { char } from './char.js';

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6));
export const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
export const eout = (x) => 1 - Math.pow(1 - x, 3);
export const v3 = (a) => new THREE.Vector3(...a);
export const lerp3 = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
export const rnd = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** a canvas texture painted with the ink kit: draw(g, w, h) */
export function tex(w, h, draw, { repeat = null, nearest = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); setCtx(g); S.boil = 0;
  draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
/** ink frame around a face so every 3D edge reads as a drawn outline */
export function frame(g, w, h, lw = 6, col = INK) { g.strokeStyle = col; g.lineWidth = lw * 2; g.strokeRect(0, 0, w, h); }
export function fill(g, w, h, c0, c1 = null, dir = 'v') {
  if (c1) { const gr = dir === 'v' ? g.createLinearGradient(0, 0, 0, h) : g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; } else g.fillStyle = c0;
  g.fillRect(0, 0, w, h);
}
export function grain(g, w, h, a = 0.05, seed = 1) {
  for (let i = 0; i < w * h / 900; i++) { g.fillStyle = `rgba(${rnd(i + seed) > 0.5 ? '255,255,255' : '0,0,0'},${a * rnd(i * 3 + seed)})`; g.fillRect(rnd(i * 7 + seed) * w, rnd(i * 11 + seed) * h, 2 + rnd(i) * 3, 2 + rnd(i * 5) * 3); }
}
export const lit = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0, ...o });
export const glowMat = (map, k = 1.6, o = {}) => new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: 0xffffff, emissiveIntensity: k, roughness: 1, ...o });
export const flat = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.95, ...o });

export function plane(w, h, mat, pos, rot = [0, 0, 0]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.set(...rot); return m; }
export function box(w, h, d, mat, pos, rot = [0, 0, 0]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(...pos); m.rotation.set(...rot); return m; }
/** a box whose faces all carry the same outlined texture (colour + ink frame + optional detail) */
export function inkBox(w, h, d, col, pos, { detail = null, px = 256, lw = 7, col2 = null, emissive = 0 } = {}) {
  const mk = (fw, fh, shade) => { const t = tex(Math.max(64, Math.round(px * fw / Math.max(fw, fh))), Math.max(64, Math.round(px * fh / Math.max(fw, fh))), (g, W, H) => {
    fill(g, W, H, col, col2); if (shade) { g.fillStyle = `rgba(10,8,30,${shade})`; g.fillRect(0, 0, W, H); } if (detail) detail(g, W, H, fw, fh); grain(g, W, H, 0.04); frame(g, W, H, lw); });
    return emissive ? glowMat(t, emissive) : lit(t); };
  const mx = mk(d, h, 0.18), my = mk(w, d, 0.0), mz = mk(w, h, 0.06);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mx, mx, my, my, mz, mz]); m.position.set(...pos); return m;
}
/** soft additive glow sprite (light haze around lamps, windows, neon) */
const glowTexCache = {};
export function glow(col, size, pos, a = 0.6) {
  const key = col; if (!glowTexCache[key]) glowTexCache[key] = tex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, col); gr.addColorStop(0.35, col + 'aa'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexCache[key], blending: THREE.AdditiveBlending, depthWrite: false, opacity: a, transparent: true }));
  s.scale.set(size, size, 1); s.position.set(...pos); return s;
}
export function point(col, i, pos, dist = 12, decay = 1.6) { const l = new THREE.PointLight(col, i, dist, decay); l.position.set(...pos); return l; }

/** a 2D cut-out person in the 3D world: our rig drawn on a canvas, mapped on an upright plane that turns to the camera */
const AK = +(new URLSearchParams(typeof location !== 'undefined' ? location.search : '').get('scale') || 1);   // 2 = 4K-sharp cut-outs
export class Actor {
  constructor(look, { height = 1.72, self = 0.42 } = {}) {
    this.look = look; this.c = document.createElement('canvas'); this.c.width = 640 * AK; this.c.height = 1024 * AK; this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 8;
    this.h = height; const ph = height * 1024 / 690, pw = ph * 640 / 1024;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: this.t, emissiveMap: this.t, emissive: 0xffffff, emissiveIntensity: self, transparent: true, alphaTest: 0.35, roughness: 1, side: THREE.DoubleSide }));
    this.mesh.geometry.translate(0, ph / 2 - ph * (1024 - 1000) / 1024, 0);
    // soft blob shadow on the ground
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshBasicMaterial({ color: 0x05030f, transparent: true, opacity: 0.45, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.scale.set(1, 0.45, 1);
    this.group = new THREE.Group(); this.group.add(this.mesh, this.shadow); this.key = ''; this.set({});
  }
  set(st) {
    const key = JSON.stringify(st, (k, v) => (typeof v === 'function' ? 'fn' + (st.v || '') : typeof v === 'number' ? Math.round(v * 40) / 40 : v)); if (key === this.key) return this; this.key = key;
    const g = this.g; g.setTransform(AK, 0, 0, AK, 0, 0); g.clearRect(0, 0, 640, 1024); setCtx(g); S.boil = st.boil || 0;
    if (st.flip) { g.translate(640, 0); g.scale(-1, 1); }
    char(320, 1000, 1.02, { look: this.look, noShadow: true, ...st });
    this.t.needsUpdate = true; return this;
  }
  at(x, y, z) { this.group.position.set(x, y, z); this.shadow.position.set(0, 0.012 - 0, 0); return this; }
  face(cam) { this.mesh.rotation.y = Math.atan2(cam.position.x - this.group.position.x, cam.position.z - this.group.position.z); return this; }
  addTo(scene) { scene.add(this.group); return this; }
  /** world position of a hand, given the arm offset used in set() (side 'R' or 'L') */
  hand(arm, side = 'R') {
    const s = 1.02, k = this.h * 1024 / 690 / 1024, bodyW = 170 * s, top = 1000 - 210 * s - 245 * s * 0.9, sh = top + 245 * s * 0.3;
    const cx = 320 + (side === 'R' ? 1 : -1) * bodyW * 0.4 + arm[0] * s, cy = sh + arm[1] * s;
    const v = new THREE.Vector3((cx - 320) * k, (1000 - cy) * k, 0.02).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
    return v.add(this.group.position);
  }
}
export { THREE };
