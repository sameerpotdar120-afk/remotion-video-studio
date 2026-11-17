// Samulation #5 - THE lone oak (hero). Owned by helper 2. Contract: see world.ts.
// Procedural mature open-grown English oak: recursive gnarled limbs (parallel-transport tubes with taper, flare and root
// buttresses, bark PBR textures scaled to radius) + thousands of alpha-cut leaf-cluster cards painted procedurally on a canvas
// (lobed oak leaves), crown-depth self-occlusion baked into vertex colours, spherical "crown" normals for soft volume lighting,
// and a shared spatial wind field (vertex shader, WIND.value) so twigs, leaves and outer limbs sway together; trunk is static.
import * as THREE from "three";
import { TREE, WIND, groundY, loadTex, rng, Part } from "./world";

const V3 = THREE.Vector3;
type Vec = THREE.Vector3;

/* ------------------------------------------------------------------ skeleton ------------------------------------------------------------------ */
interface Branch { pts: Vec[]; rad: number[]; level: number; len: number }

const SEED = 51173;
const CROWN_C = new V3(-0.7, 9.2, 0.3);          // local (relative to trunk base), slight lean toward the road (-x)
const CROWN_R = new V3(9.0, 6.1, 8.6);
const BARK_TILE = 1.4;                            // metres of bark per texture tile

/** lumpy crown envelope: returns normalised "radius" (1 = on the surface) */
function crownM(p: Vec): number {
  const dx = (p.x - CROWN_C.x) / CROWN_R.x, dy = (p.y - CROWN_C.y) / CROWN_R.y, dz = (p.z - CROWN_C.z) / CROWN_R.z;
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
  const az = Math.atan2(dz, dx), el = Math.asin(Math.max(-1, Math.min(1, dy / r)));
  const lump = 1 + 0.08 * Math.sin(3 * az + 0.7) * Math.cos(2 * el) + 0.07 * Math.sin(5 * az - 1.3 + 3 * el) + 0.06 * Math.cos(8 * az + 5 * el + 1.1) + 0.04 * Math.sin(11 * az - 6 * el);
  // flatten the underside a little (open-grown oaks have a fairly level lower skirt)
  const under = dy < -0.45 ? 1 + (-0.45 - dy / r * 1) * 0.0 : 1;
  return r / (lump * under);
}
function crownOut(p: Vec): Vec {
  return new V3((p.x - CROWN_C.x) / (CROWN_R.x * CROWN_R.x), (p.y - CROWN_C.y) / (CROWN_R.y * CROWN_R.y), (p.z - CROWN_C.z) / (CROWN_R.z * CROWN_R.z)).normalize();
}
/** distance along d from p until the envelope is reached (marching) */
function distToEnv(p: Vec, d: Vec, max = 24): number {
  const q = new V3();
  for (let t = 0.25; t < max; t += 0.25) { q.copy(p).addScaledVector(d, t); if (crownM(q) > 1) return t; }
  return max;
}

function buildSkeleton() {
  const R = rng(SEED);
  const rnd = (a: number, b: number) => a + (b - a) * R();
  const randUnit = () => { const u = rnd(-1, 1), th = rnd(0, Math.PI * 2), s = Math.sqrt(1 - u * u); return new V3(s * Math.cos(th), u, s * Math.sin(th)); };
  const branches: Branch[] = [];
  const GNARL = [0.06, 0.2, 0.26, 0.3, 0.32];
  const SEG = [0.22, 0.4, 0.32, 0.22, 0.14];

  /** grow one gnarled polyline */
  function grow(start: Vec, dir: Vec, len: number, r0: number, r1: number, level: number, upK: number, droopK: number): Branch {
    const n = Math.max(2, Math.ceil(len / SEG[level]));
    const pts: Vec[] = [start.clone()], rad: number[] = [r0];
    const d = dir.clone().normalize(), p = start.clone();
    const bend = randUnit().multiplyScalar(GNARL[level] * 0.5);   // low-frequency sinuous bend
    for (let i = 1; i <= n; i++) {
      const s = i / n;
      d.addScaledVector(randUnit(), GNARL[level] * (0.6 + 0.4 * R()));
      d.addScaledVector(bend, Math.sin(s * Math.PI * 2 + level) * 0.6);
      d.y += upK * (1 - s) - droopK * s * s;
      if (level >= 1) {
        const m = crownM(p);
        if (m > 0.86) d.addScaledVector(crownOut(p), -(m - 0.86) * 2.2);
        if (p.y < 3.4) d.y += (3.4 - p.y) * 0.25;
      }
      d.normalize();
      p.addScaledVector(d, len / n);
      pts.push(p.clone());
      rad.push(r0 + (r1 - r0) * Math.pow(s, 0.85));
    }
    const b: Branch = { pts, rad, level, len };
    branches.push(b);
    return b;
  }
  const pointAt = (b: Branch, s: number) => {
    const f = s * (b.pts.length - 1), i = Math.min(b.pts.length - 2, Math.floor(f)), u = f - i;
    return { p: b.pts[i].clone().lerp(b.pts[i + 1], u), t: b.pts[i + 1].clone().sub(b.pts[i]).normalize(), r: b.rad[i] + (b.rad[i + 1] - b.rad[i]) * u };
  };
  /** direction at angle `ang` off `t`, around azimuth `az` */
  const offDir = (t: Vec, ang: number, az: number) => {
    const a = Math.abs(t.y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0);
    const u = new V3().crossVectors(t, a).normalize(), v = new V3().crossVectors(t, u);
    const side = u.multiplyScalar(Math.cos(az)).addScaledVector(v, Math.sin(az));
    return t.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).normalize();
  };

  /** children of one branch (recursive) */
  function spawn(b: Branch) {
    const L = b.level;
    if (L >= 4) return;
    const cfg = [
      null,
      { from: 0.2, step: 0.75, ang: [38, 62], lenA: 0.55, lenB: 1.6, rr: [0.42, 0.62], up: 0.05, droop: 0.06 },
      { from: 0.14, step: 0.42, ang: [35, 60], lenA: 0.45, lenB: 0.9, rr: [0.45, 0.7], up: 0.04, droop: 0.05 },
      { from: 0.1, step: 0.2, ang: [30, 58], lenA: 0.35, lenB: 0.45, rr: [0.5, 0.75], up: 0.05, droop: 0.02 },
    ][L]!;
    let az = rnd(0, Math.PI * 2);
    const total = b.len;
    for (let d = cfg.from * total + rnd(0, cfg.step); d < total * 0.97; d += cfg.step * rnd(0.7, 1.3)) {
      const s = d / total;
      const { p, t, r } = pointAt(b, s);
      az += 2.4 + rnd(-0.5, 0.5);
      let dir = offDir(t, THREE.MathUtils.degToRad(rnd(cfg.ang[0], cfg.ang[1])), az);
      if (dir.y < -0.35) { dir.y = -0.35 + (dir.y + 0.35) * 0.3; dir.normalize(); }
      const remaining = total - d;
      let len = (remaining * cfg.lenA + cfg.lenB) * rnd(0.75, 1.2);
      const env = distToEnv(p, dir);
      len = Math.min(len, env * rnd(0.85, 1.15));
      if (len < 0.25) continue;
      const r0 = Math.min(r * rnd(cfg.rr[0], cfg.rr[1]), 0.9 * r);
      const c = grow(p, dir, len, r0, Math.max(0.006, r0 * 0.25), L + 1, cfg.up, cfg.droop);
      spawn(c);
    }
  }

  /* trunk: base flare + buttresses are applied at mesh time. Leans ~4 deg toward the road. */
  const trunkDir = new V3(-0.07, 1, 0.025).normalize();
  const trunk: Branch = { pts: [], rad: [], level: 0, len: 0 };
  {
    const p = new V3(0, -0.6, 0);
    const d = trunkDir.clone();
    for (let h = -0.6; h <= 4.4001; h += h < 1.6 ? 0.12 : 0.25) {
      trunk.pts.push(p.clone());
      const hh = Math.max(0, h);
      trunk.rad.push(0.55 - 0.03 * hh);
      d.x += rnd(-0.012, 0.012); d.z += rnd(-0.012, 0.012); d.normalize();
      p.addScaledVector(d, h < 1.6 ? 0.12 : 0.25);
    }
    trunk.len = 5.0;
    branches.push(trunk);
  }
  const top = trunk.pts[trunk.pts.length - 1];

  /* leader continuing up through the crown */
  const leader = grow(top.clone().addScaledVector(trunkDir, -0.3), new V3(-0.1, 1, 0.05), 9.4, 0.36, 0.03, 1, 0.04, 0.0);
  spawn(leader);

  /* scaffold limbs: a few steep ones forming the upper dome + long spreading ones carrying the broad lower skirt */
  const nL = 7;
  const az0 = rnd(0, 6.28);
  for (let i = 0; i < nL; i++) {
    const az = az0 + (i / nL) * Math.PI * 2 + rnd(-0.3, 0.3);
    const spread = i % 2 === 0;
    const h = spread ? 2.6 + rnd(0, 0.9) : 3.4 + rnd(0, 0.8);
    const sTr = (h + 0.6) / 5.0;
    const base = pointAt(trunk, Math.min(0.98, sTr)).p;
    const tilt = THREE.MathUtils.degToRad(spread ? rnd(64, 78) : rnd(32, 50));
    const dir = new V3(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az));
    const len = Math.min(spread ? rnd(9.5, 11.5) : rnd(8, 10), distToEnv(base, dir) * 1.08);
    const r0 = spread ? rnd(0.2, 0.25) : rnd(0.23, 0.28);
    const limb = grow(base, dir, len, r0, 0.03, 1, spread ? 0.1 : 0.06, spread ? 0.16 : 0.08);
    spawn(limb);
  }
  return { branches, trunk, R, rnd, randUnit };
}

/* ------------------------------------------------------------------ bark mesh ------------------------------------------------------------------ */
type Lobe = { th: number; a: number; w: number };
function tubeGeometry(branches: Branch[], lobes: Lobe[], rnd: (a: number, b: number) => number) {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], col: number[] = [], idx: number[] = [];
  // buttress lobes for the trunk base
  const angDiff = (a: number, b: number) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  for (const b of branches) {
    if (b.level >= 4 && b.rad[0] < 0.004) continue;
    const r0 = b.rad[0];
    const seg = b.level === 0 ? 40 : Math.max(3, Math.min(22, Math.round(r0 * 70)));
    const nU = Math.max(1, Math.round((2 * Math.PI * r0) / BARK_TILE));
    const start = pos.length / 3;
    // parallel transport frame
    const n = b.pts.length;
    const tans: Vec[] = b.pts.map((_, i) => b.pts[Math.min(n - 1, i + 1)].clone().sub(b.pts[Math.max(0, i - 1)]).normalize());
    let normal = new V3().crossVectors(tans[0], Math.abs(tans[0].y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0)).normalize();
    let v = 0;
    const vOff = rnd(0, 10);
    for (let i = 0; i < n; i++) {
      const t = tans[i];
      if (i > 0) {
        const q = new THREE.Quaternion().setFromUnitVectors(tans[i - 1], t);
        normal.applyQuaternion(q);
        normal.addScaledVector(t, -normal.dot(t)).normalize();
        v += b.pts[i].distanceTo(b.pts[i - 1]);
      }
      const binormal = new V3().crossVectors(t, normal);
      const p = b.pts[i];
      const h = p.y;
      // crown depth AO for the bark
      const m = crownM(p);
      let ao = b.level === 0 ? 0.85 + 0.15 * Math.min(1, Math.max(0, h) / 3) : 0.5 + 0.5 * THREE.MathUtils.smoothstep(m, 0.25, 1.0);
      if (b.level === 0) ao *= 0.7 + 0.3 * THREE.MathUtils.smoothstep(h, -0.1, 0.9);
      // child-base flare (branches swell where they leave the parent)
      let rr = b.rad[i];
      if (b.level > 0) rr *= 1 + (b.level === 1 ? 0.18 : 0.35) * Math.exp(-v / (2.5 * r0));
      const last = i === n - 1;
      for (let j = 0; j <= seg; j++) {
        const th = (j / seg) * Math.PI * 2;
        const c = Math.cos(th), s = Math.sin(th);
        const dirv = normal.clone().multiplyScalar(c).addScaledVector(binormal, s);
        let k = 1;
        if (b.level === 0) {
          const thw = Math.atan2(dirv.z, dirv.x);
          const hb = Math.max(0, h + 0.1);
          let lob = 0;
          for (const L of lobes) lob += L.a * Math.exp(-((angDiff(thw, L.th) / L.w) ** 2));
          k = 1 + 0.32 * Math.exp(-hb / 0.5) + lob * Math.exp(-hb / 0.65) + 0.05 * Math.sin(2 * th + 0.4 + h * 0.3) + 0.03 * Math.sin(5 * th + h * 0.35) + 0.015 * Math.sin(9 * th - h * 0.5);
        } else {
          k = 1 + 0.06 * Math.sin(3 * th + v * 2.1) * Math.min(1, r0 * 6);
        }
        const R = last ? rr * 0.3 : rr * k;
        pos.push(p.x + dirv.x * R, p.y + dirv.y * R, p.z + dirv.z * R);
        nor.push(dirv.x, dirv.y, dirv.z);
        uv.push((j / seg) * nU, (v + vOff) / BARK_TILE);
        col.push(ao, ao, ao);
      }
    }
    const ring = seg + 1;
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) {
      const a = start + i * ring + j, b2 = a + ring;
      idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

/** surface roots radiating from the buttresses and diving into the (sloped) verge */
function rootBranches(baseY: number, lobes: Lobe[], rnd: (a: number, b: number) => number): Branch[] {
  const out: Branch[] = [];
  for (let i = 0; i < lobes.length; i++) {
    const az = lobes[i].th;
    const L = rnd(0.9, 1.7), n = 10;
    const pts: Vec[] = [], rad: number[] = [];
    const r0 = rnd(0.16, 0.24);
    for (let k = 0; k <= n; k++) {
      const s = k / n;
      const rr = 0.3 + s * L;
      const a = az + Math.sin(s * 3 + i) * 0.12;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      const gy = groundY(TREE.x + x, TREE.z + z) - baseY;
      const r = r0 * (1 - 0.6 * s);
      pts.push(new V3(x, gy + r * (0.35 - 1.3 * s) + 0.12 * (1 - s) ** 2, z));
      rad.push(r);
    }
    out.push({ pts, rad, level: 2, len: L });
  }
  return out;
}

/* ------------------------------------------------------------------ leaf atlas ------------------------------------------------------------------ */
/** canvas atlas, 2x2 cells, each a sprig of lobed oak leaves; mip chain built by hand with alpha-coverage preservation */
function leafAtlas(): THREE.Texture {
  const S = 1024, C = S / 2;
  const cv = document.createElement("canvas"); cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  const R = rng(SEED + 7);
  const rnd = (a: number, b: number) => a + (b - a) * R();
  g.clearRect(0, 0, S, S);

  const leafPath = (len: number, wid: number, lobes: number) => {
    // outline along the midrib (x = 0..len), obovate with rounded lobes and deep sinuses
    const N = 90, top: [number, number][] = [], bot: [number, number][] = [];
    const ph = rnd(0, 0.5);
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const base = Math.pow(s, 0.75) * Math.pow(1 - s, 0.42) * 1.55;     // widest ~60% toward the tip
      const lob = 0.5 + 0.5 * Math.pow(Math.abs(Math.sin(Math.PI * (lobes * s + ph))), 0.55);
      const w = wid * base * (s < 0.08 ? s / 0.08 * 0.6 + 0.4 : 1) * (s > 0.92 ? lob : lob);
      top.push([s * len, -w]);
      const lob2 = 0.5 + 0.5 * Math.pow(Math.abs(Math.sin(Math.PI * (lobes * s + ph + 0.35))), 0.55);
      bot.push([s * len, wid * base * lob2]);
    }
    g.beginPath(); g.moveTo(0, 0);
    for (const [x, y] of top) g.lineTo(x, y);
    for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]);
    g.closePath();
  };

  const drawLeaf = (x: number, y: number, ang: number, len: number, shade: number) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    const hue = rnd(82, 112), sat = rnd(38, 62), lig = rnd(22, 36) * shade;
    // tiny petiole
    g.strokeStyle = `hsl(${hue - 10},30%,${lig * 0.8}%)`; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-len * 0.08, 0); g.lineTo(0, 0); g.stroke();
    leafPath(len, len * rnd(0.26, 0.34), Math.round(rnd(4, 6)) + 0.5);
    const gr = g.createLinearGradient(0, -len * 0.3, 0, len * 0.3);
    gr.addColorStop(0, `hsl(${hue},${sat}%,${lig * 1.18}%)`);
    gr.addColorStop(0.5, `hsl(${hue + 4},${sat}%,${lig}%)`);
    gr.addColorStop(1, `hsl(${hue},${sat * 0.9}%,${lig * 0.78}%)`);
    g.fillStyle = gr; g.fill();
    // midrib + veins
    g.strokeStyle = `hsla(${hue - 20},40%,${Math.min(70, lig * 1.7)}%,0.55)`; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(len * 0.95, 0); g.stroke();
    g.lineWidth = 0.7;
    for (let k = 1; k <= 5; k++) {
      const sx = (k / 6.3) * len;
      g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx + len * 0.09, -len * 0.16); g.moveTo(sx, 0); g.lineTo(sx + len * 0.09, len * 0.16); g.stroke();
    }
    g.restore();
  };

  for (let cell = 0; cell < 4; cell++) {
    const ox = (cell % 2) * C, oy = Math.floor(cell / 2) * C;
    g.save(); g.beginPath(); g.rect(ox + 2, oy + 2, C - 4, C - 4); g.clip();
    // sprig: a few twiglets fanning up from the bottom centre, leaves rosetted at their ends and along them
    const nTw = 4 + (cell % 2);
    const tips: { x: number; y: number; a: number }[] = [];
    g.strokeStyle = "rgb(70,55,40)"; g.lineCap = "round";
    for (let k = 0; k < nTw; k++) {
      const a = -Math.PI / 2 + (k / (nTw - 1) - 0.5) * 2.1 + rnd(-0.2, 0.2);
      const L = C * rnd(0.32, 0.48);
      let x = ox + C / 2, y = oy + C - 6;
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(x, y);
      const steps = 8; let aa = a;
      for (let s2 = 0; s2 < steps; s2++) {
        aa += rnd(-0.15, 0.15);
        x += Math.cos(aa) * L / steps; y += Math.sin(aa) * L / steps;
        g.lineTo(x, y); g.lineWidth = 4 - s2 * 0.35;
      }
      g.stroke();
      tips.push({ x, y, a: aa });
    }
    // back layer (darker, self-shadowed) then front layer
    for (const layer of [0, 1]) {
      for (const tp of tips) {
        const n = layer === 0 ? 6 : 7;
        for (let q = 0; q < n; q++) {
          const a = tp.a + rnd(-1.5, 1.5);
          const back = rnd(0, 0.75);
          const bx = tp.x - Math.cos(tp.a) * back * C * 0.32, by = tp.y - Math.sin(tp.a) * back * C * 0.32;
          drawLeaf(bx + rnd(-10, 10), by + rnd(-10, 10), a, C * rnd(0.17, 0.25), layer === 0 ? rnd(0.62, 0.8) : rnd(0.9, 1.15));
        }
      }
    }
    g.restore();
  }

  // ---- mip chain: preserve alpha coverage, bleed colour into transparent texels (no dark fringes)
  const levels: HTMLCanvasElement[] = [];
  const thr = 0.45 * 255;
  const coverage = (d: Uint8ClampedArray, s = 1) => { let c = 0; for (let i = 3; i < d.length; i += 4) if (d[i] * s > thr) c++; return c / (d.length / 4); };
  const bleed = (d: Uint8ClampedArray) => { for (let i = 0; i < d.length; i += 4) if (d[i + 3] < 8) { d[i] = 52; d[i + 1] = 72; d[i + 2] = 34; } };
  let cov0 = 0;
  for (let size = S, lvl = 0; size >= 1; size >>= 1, lvl++) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const cg = c.getContext("2d")!;
    cg.imageSmoothingEnabled = true; cg.imageSmoothingQuality = "high";
    cg.drawImage(lvl === 0 ? cv : levels[lvl - 1], 0, 0, size, size);
    const id = cg.getImageData(0, 0, size, size); const d = id.data;
    if (lvl === 0) cov0 = coverage(d);
    else {
      let lo = 1, hi = 4;
      for (let it = 0; it < 12; it++) { const mid = (lo + hi) / 2; if (coverage(d, mid) < cov0) lo = mid; else hi = mid; }
      const k = (lo + hi) / 2;
      for (let i = 3; i < d.length; i += 4) d[i] = Math.min(255, d[i] * k);
    }
    bleed(d); cg.putImageData(id, 0, 0);
    levels.push(c);
  }
  const tex = new THREE.CanvasTexture(levels[0]);
  tex.mipmaps = levels as unknown as THREE.CanvasTexture["mipmaps"];
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ foliage cards ------------------------------------------------------------------ */
function foliageGeometry(branches: Branch[], R: () => number) {
  const rnd = (a: number, b: number) => a + (b - a) * R();
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], col: number[] = [], fl: number[] = [];
  const idx: number[] = [];
  const randUnit = () => { const u = rnd(-1, 1), th = rnd(0, Math.PI * 2), s = Math.sqrt(1 - u * u); return new V3(s * Math.cos(th), u, s * Math.sin(th)); };
  let cards = 0;
  const addCard = (P: Vec, tw: Vec, size: number) => {
    const out = crownOut(P);
    const m = crownM(P);
    // card normal: random, biased outward/upward so the crown surface reads as a leaf canopy
    const nrm = randUnit().multiplyScalar(0.9).addScaledVector(out, 0.55).add(new V3(0, 0.25, 0)).normalize();
    // up axis: along the twig, projected into the card plane
    const up = tw.clone().addScaledVector(out, 0.5).addScaledVector(randUnit(), 0.4);
    up.addScaledVector(nrm, -up.dot(nrm));
    if (up.lengthSq() < 1e-4) up.set(0, 1, 0).addScaledVector(nrm, -nrm.y);
    up.normalize();
    const side = new V3().crossVectors(up, nrm).normalize();
    const w = size * rnd(0.85, 1.1), h = size;
    const base = P.clone().addScaledVector(up, -h * 0.12);
    const cell = Math.floor(R() * 4); const u0 = (cell % 2) * 0.5, v0 = Math.floor(cell / 2) * 0.5;
    const flip = R() < 0.5;
    // AO by crown depth + lower-crown shade + per-cluster hue variation
    const depth = THREE.MathUtils.smoothstep(m, 0.3, 1.02);
    const hb = THREE.MathUtils.clamp((P.y - (CROWN_C.y - CROWN_R.y)) / (2 * CROWN_R.y), 0, 1);
    let ao = (0.28 + 0.72 * depth) * (0.62 + 0.38 * Math.sqrt(hb));
    ao *= rnd(0.88, 1.08);
    const tint = R();
    const cr = tint < 0.2 ? 1.1 : tint > 0.85 ? 0.88 : 1.0, cgc = tint < 0.2 ? 1.06 : 1.0, cb = tint < 0.2 ? 0.82 : tint > 0.85 ? 0.95 : 1.0;
    // vertex normal: blend of crown-outward (soft volume) and card normal (leaf-level variation)
    const nSign = nrm.dot(out) < 0 ? -1 : 1;
    const corners: [number, number][] = [[-0.5, 0], [0.5, 0], [0.5, 1], [-0.5, 1]];
    const s0 = pos.length / 3;
    const phase = rnd(0, 6.283);
    for (const [cx, cy] of corners) {
      const q = base.clone().addScaledVector(side, cx * w).addScaledVector(up, cy * h);
      pos.push(q.x, q.y, q.z);
      const vn = out.clone().multiplyScalar(0.75).addScaledVector(nrm, 0.45 * nSign).addScaledVector(side, cx * 0.35).addScaledVector(up, (cy - 0.4) * 0.3).normalize();
      nor.push(vn.x, vn.y, vn.z);
      const uu = flip ? 0.5 - (cx + 0.5) * 0.5 : (cx + 0.5) * 0.5;
      uv.push(u0 + uu * 0.998 + 0.001, 1 - (v0 + (1 - cy) * 0.5 * 0.998 + 0.001));
      const a2 = ao * (0.9 + 0.1 * cy);
      col.push(a2 * cr, a2 * cgc, a2 * cb);
      fl.push(phase, cy * (0.6 + 0.4 * depth));
    }
    idx.push(s0, s0 + 1, s0 + 2, s0, s0 + 2, s0 + 3);
    cards++;
  };

  for (const b of branches) {
    if (b.level < 3) continue;
    const n = b.pts.length;
    const step = b.level === 4 ? 0.2 : 0.32;
    let acc = 0;
    for (let i = 1; i < n; i++) {
      const seg = b.pts[i].distanceTo(b.pts[i - 1]);
      acc += seg;
      const s = i / (n - 1);
      if (s < (b.level === 4 ? 0.25 : 0.45)) continue;
      while (acc >= step) {
        acc -= step;
        const P = b.pts[i].clone().lerp(b.pts[i - 1], acc / seg);
        const m = crownM(P);
        if (m < 0.5 && R() < 0.75) continue;              // hollow-ish interior: leaves live in the outer shell
        const tw = b.pts[i].clone().sub(b.pts[i - 1]).normalize();
        const k = 1 + (R() < 0.35 ? 1 : 0);
        for (let c = 0; c < k; c++) addCard(P.clone().add(randUnit().multiplyScalar(0.15)), tw, rnd(0.75, 1.15));
      }
    }
    // tip rosette
    const tip = b.pts[n - 1], tw = tip.clone().sub(b.pts[n - 2]).normalize();
    for (let c = 0; c < 2; c++) addCard(tip.clone().add(randUnit().multiplyScalar(0.12)), tw, rnd(0.8, 1.2));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aFlutter", new THREE.Float32BufferAttribute(fl, 2));
  g.setIndex(idx);
  return { geo: g, cards };
}

/* ------------------------------------------------------------------ wind ------------------------------------------------------------------ */
// spatial sway field (local tree space): zero on the trunk, growing with distance from the fork; branches and the leaves on
// them sample the same field, so they move together.
const WIND_GLSL = /* glsl */ `
uniform float uWind;
vec3 oakSway(vec3 p) {
  float r = length(p.xz - vec2(-0.3, 0.0));
  float w = clamp((r + max(p.y - 4.0, 0.0) * 0.55 - 1.6) / 9.0, 0.0, 1.0); w = w * w;
  float t = uWind;
  vec3 d = vec3(sin(t * 1.05 + p.y * 0.13 + p.x * 0.07) * 0.6 + sin(t * 2.3 + p.z * 0.31) * 0.22,
                sin(t * 1.7 + p.x * 0.2) * 0.12,
                cos(t * 0.83 + p.x * 0.11 + p.y * 0.05) * 0.45 + sin(t * 1.9 + p.y * 0.21) * 0.18);
  return d * w * 0.16 + vec3(-0.05, 0.0, 0.0) * w;
}`;

function patchWind(mat: THREE.Material, leaves: boolean) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = WIND;
    sh.vertexShader = (leaves ? "attribute vec2 aFlutter;\n" : "") + WIND_GLSL + "\n" + sh.vertexShader.replace("#include <begin_vertex>", `
      #include <begin_vertex>
      vec3 oakP = transformed;
      transformed += oakSway(oakP);
      ${leaves ? `
      float fph = aFlutter.x, famp = aFlutter.y;
      transformed += vec3(sin(uWind * 7.3 + fph) * 0.035, sin(uWind * 9.1 + fph * 1.7) * 0.03, cos(uWind * 6.7 + fph * 0.6) * 0.035) * famp;` : ""}
    `);
    if (leaves && sh.fragmentShader.includes("normal *= faceDirection;")) {
      // foliage keeps its crown-outward normal on both faces (no black backsides); add a little sun translucency
      sh.fragmentShader = sh.fragmentShader.replace("normal *= faceDirection;", "");
    }
  };
  mat.customProgramCacheKey = () => (leaves ? "oak-leaf-v1" : "oak-bark-v1");
}

/* ------------------------------------------------------------------ build ------------------------------------------------------------------ */
export async function buildOak(): Promise<Part> {
  const root = new THREE.Group();
  const baseY = groundY(TREE.x, TREE.z);
  root.position.set(TREE.x, baseY, TREE.z);

  const [bd, bn, br] = await Promise.all([
    loadTex("bark_brown_02_diff_1k.jpg", true), loadTex("bark_brown_02_nor_gl_1k.jpg"), loadTex("bark_brown_02_rough_1k.jpg"),
  ]);
  const { branches, R, rnd } = buildSkeleton();
  const lobes: Lobe[] = Array.from({ length: 6 }, (_, i) => ({ th: (i / 6) * Math.PI * 2 + rnd(-0.35, 0.35), a: rnd(0.3, 0.6), w: rnd(0.24, 0.36) }));
  const roots = rootBranches(baseY, lobes, rnd);

  // bark: trunk + limbs + branches (twigs below ~4 mm skipped)
  const barkGeo = tubeGeometry([...branches, ...roots], lobes, rnd);
  const barkMat = new THREE.MeshStandardMaterial({
    map: bd, normalMap: bn, roughnessMap: br, vertexColors: true, color: new THREE.Color(0.82, 0.8, 0.76),
    normalScale: new THREE.Vector2(1.4, 1.4), roughness: 1, metalness: 0,
  });
  patchWind(barkMat, false);
  const bark = new THREE.Mesh(barkGeo, barkMat);
  bark.castShadow = true; bark.receiveShadow = true;
  root.add(bark);

  // foliage
  const atlas = leafAtlas();
  const { geo: leafGeo } = foliageGeometry(branches, R);
  const leafMat = new THREE.MeshStandardMaterial({
    map: atlas, alphaTest: 0.45, side: THREE.DoubleSide, vertexColors: true, roughness: 0.62, metalness: 0,
    color: new THREE.Color(1, 1, 1),
  });
  patchWind(leafMat, true);
  const leaves = new THREE.Mesh(leafGeo, leafMat);
  leaves.castShadow = true; leaves.receiveShadow = true;
  const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: atlas, alphaTest: 0.45, side: THREE.DoubleSide });
  patchWind(depthMat, true);
  depthMat.customProgramCacheKey = () => "oak-leaf-depth-v1";
  leaves.customDepthMaterial = depthMat;
  root.add(leaves);

  const tris = (g: THREE.BufferGeometry) => (g.index ? g.index.count / 3 : 0);
  root.userData.triangles = { bark: tris(barkGeo), leaves: tris(leafGeo) };
  console.log(`[oak] branches=${branches.length} barkTris=${tris(barkGeo)} leafTris=${tris(leafGeo)}`);

  return { object: root, update: () => { /* wind is driven by WIND.value inside the shaders */ } };
}
