// Painted textures, drawn in code on a canvas. Every surface gets hand-made variation + dark ink lines,
// so the 3D world reads like a painted cartoon set (measured look: warm lit faces, ink joints, no flat colours).
import * as THREE from "three";

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hex = (h: string) => new THREE.Color(h);
export const shade = (h: string, k: number, hueShift = 0) => {
  const c = hex(h);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL((hsl.h + hueShift + 1) % 1, Math.min(1, hsl.s * (k < 1 ? 1.08 : 0.95)), Math.max(0, Math.min(1, hsl.l * k)));
  return "#" + c.getHexString();
};

const cache = new Map<string, THREE.Texture>();
const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat: [number, number] = [1, 1]) => {
  const k = key + repeat.join("x");
  if (cache.has(k)) return cache.get(k)!;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  draw(g, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(k, t);
  return t;
};

const ink = "#1b1414";

// Noise speckle that gives painted grain
const speckle = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, n: number, alpha: number) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${alpha * r()})` : `rgba(255,240,220,${alpha * r()})`;
    const s = 1 + r() * 3;
    g.fillRect(r() * w, r() * h, s, s);
  }
};

export const cobbles = (base = "#8a7f75", rep: [number, number] = [4, 4]) =>
  make("cobbles" + base, 1024, 1024, (g, r) => {
    g.fillStyle = ink; g.fillRect(0, 0, 1024, 1024);
    const rows = 16, cols = 12, cw = 1024 / cols, rh = 1024 / rows;
    for (let y = 0; y < rows; y++)
      for (let x = -1; x < cols + 1; x++) {
        const ox = (y % 2) * cw * 0.5, cx = x * cw + ox + cw / 2, cy = y * rh + rh / 2;
        const k = 0.75 + r() * 0.5;
        const grd = g.createRadialGradient(cx - cw * 0.15, cy - rh * 0.2, 2, cx, cy, cw * 0.6);
        grd.addColorStop(0, shade(base, k * 1.25)); grd.addColorStop(1, shade(base, k * 0.8, 0.01));
        g.fillStyle = grd;
        g.beginPath();
        g.ellipse(cx, cy, cw * 0.44 + r() * 3, rh * 0.4 + r() * 3, (r() - 0.5) * 0.2, 0, Math.PI * 2);
        g.fill();
      }
    speckle(g, r, 1024, 1024, 5000, 0.18);
  }, rep);

// Small irregular cobbles with snow packed in the gaps
export const snowCobbles = (base = "#8d93ad", rep: [number, number] = [4, 4], snowK = 0.55) =>
  make("snowcobbles" + base + snowK, 1024, 1024, (g, r) => {
    g.fillStyle = "#2a2733"; g.fillRect(0, 0, 1024, 1024);
    const rows = 26;
    for (let y = 0; y < rows; y++) {
      let x = -20 - r() * 30;
      const rh = 1024 / rows;
      while (x < 1044) {
        const w = 28 + r() * 26, cx = x + w / 2, cy = y * rh + rh / 2 + (r() - 0.5) * 3;
        const k = 0.7 + r() * 0.55;
        const grd = g.createRadialGradient(cx - w * 0.2, cy - rh * 0.25, 1, cx, cy, w * 0.6);
        grd.addColorStop(0, shade(base, k * 1.3)); grd.addColorStop(1, shade(base, k * 0.75, 0.02));
        g.fillStyle = grd;
        g.beginPath(); g.ellipse(cx, cy, w * 0.47, rh * 0.42, (r() - 0.5) * 0.25, 0, Math.PI * 2); g.fill();
        x += w + 3;
      }
    }
    g.fillStyle = `rgba(236,240,252,${Math.min(0.55, 0.3 * snowK)})`; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 260 * snowK; i++) {
      const cx = r() * 1024, cy = r() * 1024, rr = 30 + r() * 90;
      const sg = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
      sg.addColorStop(0, `rgba(236,240,252,${0.45 + r() * 0.3})`); sg.addColorStop(1, "rgba(236,240,252,0)");
      g.fillStyle = sg; g.beginPath(); g.ellipse(cx, cy, rr, rr * 0.7, 0, 0, Math.PI * 2); g.fill();
    }
    speckle(g, r, 1024, 1024, 2500, 0.1);
  }, rep);

export const bricks = (base = "#9b4a35", rep: [number, number] = [2, 2], mortar = "#3a2a26") =>
  make("bricks" + base + mortar, 1024, 1024, (g, r) => {
    g.fillStyle = mortar; g.fillRect(0, 0, 1024, 1024);
    const rows = 24, bw = 1024 / 8, bh = 1024 / rows;
    for (let y = 0; y < rows; y++)
      for (let x = -1; x < 9; x++) {
        const ox = (y % 2) * bw * 0.5;
        const k = 0.78 + r() * 0.42;
        g.fillStyle = shade(base, k, (r() - 0.5) * 0.02);
        g.fillRect(x * bw + ox + 3, y * bh + 3, bw - 6, bh - 6);
        g.fillStyle = `rgba(255,230,200,${0.12 * r()})`;
        g.fillRect(x * bw + ox + 3, y * bh + 3, bw - 6, 4);
      }
    speckle(g, r, 1024, 1024, 6000, 0.2);
  }, rep);

export const planks = (base = "#7a5233", rep: [number, number] = [1, 1], vertical = false) =>
  make("planks" + base + vertical, 1024, 1024, (g, r) => {
    if (vertical) { g.translate(1024, 0); g.rotate(Math.PI / 2); }
    const n = 8, ph = 1024 / n;
    for (let i = 0; i < n; i++) {
      const k = 0.8 + r() * 0.35;
      g.fillStyle = shade(base, k); g.fillRect(0, i * ph, 1024, ph);
      for (let j = 0; j < 14; j++) {
        g.strokeStyle = `rgba(30,15,5,${0.15 + r() * 0.2})`; g.lineWidth = 1 + r() * 2;
        g.beginPath(); const yy = i * ph + r() * ph;
        g.moveTo(0, yy); g.bezierCurveTo(300, yy + (r() - 0.5) * 10, 700, yy + (r() - 0.5) * 10, 1024, yy + (r() - 0.5) * 6); g.stroke();
      }
      g.fillStyle = ink; g.fillRect(0, i * ph, 1024, 4);
      const cut = r() * 1024; g.fillRect(cut, i * ph, 4, ph);
      g.fillStyle = "rgba(255,235,200,0.15)"; g.fillRect(0, i * ph + 4, 1024, 3);
    }
    speckle(g, r, 1024, 1024, 3000, 0.15);
  }, rep);

export const painted = (base: string, rep: [number, number] = [1, 1], strokes = 900) =>
  make("painted" + base, 512, 512, (g, r) => {
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < strokes; i++) {
      g.fillStyle = shade(base, 0.85 + r() * 0.3, (r() - 0.5) * 0.015);
      g.globalAlpha = 0.25;
      g.beginPath(); g.ellipse(r() * 512, r() * 512, 6 + r() * 26, 3 + r() * 8, r() * Math.PI, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    speckle(g, r, 512, 512, 2500, 0.12);
  }, rep);

export const snowGround = (rep: [number, number] = [3, 3]) =>
  make("snowground", 1024, 1024, (g, r) => {
    g.fillStyle = "#e9eef7"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = r() < 0.6 ? "rgba(150,170,215,0.18)" : "rgba(255,255,255,0.5)";
      g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 8 + r() * 40, 3 + r() * 10, 0, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 60; i++) { // wheel ruts
      g.strokeStyle = "rgba(110,120,160,0.12)"; g.lineWidth = 6 + r() * 8;
      g.beginPath(); const x = r() * 1024; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 40, 1024); g.stroke();
    }
  }, rep);

export const water = (base = "#2b5d7a", rep: [number, number] = [2, 2]) =>
  make("water" + base, 1024, 1024, (g, r) => {
    g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 700; i++) {
      g.strokeStyle = r() < 0.5 ? "rgba(255,255,255,0.25)" : "rgba(0,20,40,0.25)"; g.lineWidth = 2 + r() * 3;
      const x = r() * 1024, y = r() * 1024, w = 20 + r() * 60;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 6, x + w, y); g.stroke();
    }
  }, rep);

export const roofSlate = (base = "#4a4f5c", rep: [number, number] = [2, 2]) =>
  make("slate" + base, 1024, 1024, (g, r) => {
    g.fillStyle = ink; g.fillRect(0, 0, 1024, 1024);
    const rows = 14, w = 1024 / 10, h = 1024 / rows;
    for (let y = 0; y < rows; y++)
      for (let x = -1; x < 11; x++) {
        g.fillStyle = shade(base, 0.8 + r() * 0.4);
        const ox = (y % 2) * w / 2;
        g.beginPath(); g.roundRect(x * w + ox + 2, y * h + 2, w - 4, h - 3, [0, 0, 8, 8]); g.fill();
      }
    speckle(g, r, 1024, 1024, 3000, 0.15);
  }, rep);

export const wallpaper = (base = "#5d2c2a", stripe = "#6e3633", rep: [number, number] = [3, 1]) =>
  make("wallpaper" + base + stripe, 512, 512, (g, r) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? base : stripe; g.fillRect(i * 64, 0, 64, 512); }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = "rgba(240,190,120,0.18)";
      const x = (i % 8) * 64 + 32, y = Math.floor(i / 8) * 110 + 50;
      g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 9, y); g.lineTo(x, y + 14); g.lineTo(x - 9, y); g.fill();
    }
    speckle(g, r, 512, 512, 2000, 0.12);
  }, rep);

// Painted sky dome: gradient + soft cartoon clouds (night = deep blue with stars)
export const sky = (top: string, mid: string, bottom: string, clouds: string, night = false) =>
  make("sky" + top + mid + bottom + clouds + night, 2048, 1024, (g, r) => {
    const grd = g.createLinearGradient(0, 0, 0, 1024);
    grd.addColorStop(0, top); grd.addColorStop(0.55, mid); grd.addColorStop(1, bottom);
    g.fillStyle = grd; g.fillRect(0, 0, 2048, 1024);
    if (night) for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,240,${r() * 0.8})`; const s = r() * 2.4; g.fillRect(r() * 2048, r() * 520, s, s); }
    for (let c = 0; c < 22; c++) {
      const cx = r() * 2048, cy = 200 + r() * 330, sc = 0.5 + r() * 1.2;
      for (let i = 0; i < 9; i++) {
        g.fillStyle = clouds; g.globalAlpha = 0.5 + r() * 0.4;
        g.beginPath(); g.ellipse(cx + (r() - 0.5) * 180 * sc, cy + (r() - 0.5) * 30 * sc, (40 + r() * 70) * sc, (18 + r() * 26) * sc, 0, 0, Math.PI * 2); g.fill();
      }
    }
    g.globalAlpha = 1;
  });

export const signTex = (lines: string[], bg = "#163b2c", fg = "#f3e7c4", w = 1024, h = 512) =>
  make("sign" + lines.join("|") + bg + fg, w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
    g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
    const fs = Math.min(110, (h - 80) / lines.length * 0.75);
    g.font = `800 ${fs}px Georgia, serif`;
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.2));
  });
