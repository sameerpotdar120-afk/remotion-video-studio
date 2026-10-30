import * as THREE from 'three';

/**
 * Procedural, hand-painted-looking textures for the village (no image files): drawn once on canvases and cached.
 * Palette is our own grade: cleaner and a touch cooler/greener than the reference's dusty beige.
 */
export const PAL = {
  sand: '#ecd9ae', sandDark: '#d7bf8c', track: '#c9ad78', earth: '#e2c48e', earthLine: '#b8925c', earthDark: '#a77f4b',
  wood: '#9a5a32', woodDark: '#6e3a1e', woodLight: '#b8744a', post: '#7c3e22',
  roof: '#8e9aa4', roofDark: '#5f6b75', roofLight: '#b4bec6', ink: '#2a1c12',
  brick: '#d9b98a', brickLine: '#a98a5f', hill: '#e8cf98', hillFar: '#c8a77a', hillBand: '#5a3a2a',
  leaf: '#9cc463', leafDark: '#6f9a3d', sky0: '#bcd9ea', sky1: '#eef3ee',
};

const cache = new Map<string, THREE.CanvasTexture>();
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  cache.set(key, t);
  return t;
};

/** Sand ground: soft blotches, little bird-foot marks and grass tufts. Tiles. */
export const sandTex = (tint = PAL.sand) => make(`sand${tint}`, 1024, 1024, (g, w, h) => {
  g.fillStyle = tint; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = rnd(i) * w, y = rnd(i + 9) * h, r = 40 + rnd(i + 3) * 120;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rnd(i + 5) > 0.5 ? 'rgba(255,248,225,0.35)' : 'rgba(190,160,110,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.strokeStyle = 'rgba(120,90,55,0.45)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 90; i++) { // bird-foot marks
    const x = rnd(i + 100) * w, y = rnd(i + 200) * h, s = 7 + rnd(i + 300) * 5, a = rnd(i + 400) * 0.6 - 0.3;
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(-s, -s * 0.6); g.lineTo(0, 0); g.lineTo(s, -s * 0.6); g.moveTo(0, 0); g.lineTo(0, -s * 0.9); g.stroke();
    g.restore();
  }
  g.strokeStyle = 'rgba(110,130,60,0.55)'; g.lineWidth = 2.5;
  for (let i = 0; i < 40; i++) { // grass tufts
    const x = rnd(i + 500) * w, y = rnd(i + 600) * h;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * 3, y); g.lineTo(x + k * 6, y - 10 - rnd(i + k) * 6); g.stroke(); }
  }
}, [1, 1]);

/** Rammed-earth wall: horizontal strata with wobbly darker lines and a few cracks. */
export const earthTex = () => make('earth', 512, 512, (g, w, h) => {
  g.fillStyle = PAL.earth; g.fillRect(0, 0, w, h);
  for (let b = 0; b < 8; b++) {
    const y0 = (b / 8) * h;
    g.fillStyle = b % 2 ? 'rgba(255,240,205,0.25)' : 'rgba(170,125,70,0.12)'; g.fillRect(0, y0, w, h / 8);
    g.strokeStyle = PAL.earthLine; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.03 + b) * 2.5 + (rnd(b * 50 + x) - 0.5) * 2);
    g.stroke();
  }
  g.strokeStyle = 'rgba(110,75,40,0.5)'; g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    let x = rnd(i + 70) * w, y = rnd(i + 80) * h; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (rnd(i * 9 + k) - 0.5) * 30; y += 8 + rnd(i * 7 + k) * 12; g.lineTo(x, y); }
    g.stroke();
  }
}, [1, 1]);

/** Vertical wood planks with grain and dark seams. */
export const plankTex = (base = PAL.wood) => make(`plank${base}`, 512, 512, (g, w, h) => {
  const n = 6, pw = w / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = base; g.fillRect(i * pw, 0, pw, h);
    g.fillStyle = `rgba(255,220,180,${0.06 + rnd(i) * 0.1})`; g.fillRect(i * pw, 0, pw, h);
    g.strokeStyle = 'rgba(60,25,10,0.35)'; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const x = i * pw + 8 + rnd(i * 5 + k) * (pw - 16); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.7, x + 3, h); g.stroke(); }
    g.fillStyle = PAL.ink; g.fillRect(i * pw, 0, 4, h);
  }
}, [1, 1]);

/** Grey clay roof tiles: rows of overlapping scallops. */
export const roofTex = () => make('roof', 512, 512, (g, w, h) => {
  g.fillStyle = PAL.roof; g.fillRect(0, 0, w, h);
  const rows = 10, cols = 8, rh = h / rows, cw = w / cols;
  for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) {
    const x = c * cw + (r % 2 ? cw / 2 : 0), y = r * rh;
    const gr = g.createLinearGradient(x, y, x, y + rh);
    gr.addColorStop(0, PAL.roofLight); gr.addColorStop(1, PAL.roofDark);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - cw / 2, y); g.lineTo(x - cw / 2, y + rh * 0.6);
    g.quadraticCurveTo(x, y + rh * 1.15, x + cw / 2, y + rh * 0.6); g.lineTo(x + cw / 2, y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,45,52,0.8)'; g.lineWidth = 2.5; g.stroke();
  }
}, [1, 1]);

/** Brick (watchtower). */
export const brickTex = () => make('brick', 512, 512, (g, w, h) => {
  g.fillStyle = PAL.brick; g.fillRect(0, 0, w, h);
  const rows = 16, rh = h / rows, bw = w / 4;
  g.strokeStyle = PAL.brickLine; g.lineWidth = 3;
  for (let r = 0; r < rows; r++) {
    g.beginPath(); g.moveTo(0, r * rh); g.lineTo(w, r * rh); g.stroke();
    for (let c = 0; c <= 4; c++) { const x = c * bw + (r % 2 ? bw / 2 : 0); g.beginPath(); g.moveTo(x, r * rh); g.lineTo(x, r * rh + rh); g.stroke(); }
  }
}, [1, 1]);

/** Vertical sky gradient (used as scene background). */
export const skyTex = (top: string, bottom: string) => make(`sky${top}${bottom}`, 4, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

/** Clone with a different repeat (textures are shared; repeat is per use). */
export const rep = (t: THREE.Texture, x: number, y: number) => {
  const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); c.needsUpdate = true; return c;
};
