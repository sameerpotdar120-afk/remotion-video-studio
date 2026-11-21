import React, { useEffect, useMemo, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { drawFlag, drawIcon, Kind, Side } from './flags';
import { MAPF } from './font';
import { groundXZ, PXZ, V3 } from './geo';

/** three.js pieces that live on the map: labels, cities, unit tiles, arrows, target brackets, image props, jets,
 * ships and blasts. Sizes are scene km; every piece takes the heights `h` so it sits on the relief. */

// ---------------------------------------------------------------- textures
const canvasCache = new Map<string, THREE.CanvasTexture>();
const canvasTex = (key: string, w: number, hgt: number, draw: (c: CanvasRenderingContext2D) => void) => {
  let t = canvasCache.get(key);
  if (!t) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
    draw(cv.getContext('2d') as CanvasRenderingContext2D);
    t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    canvasCache.set(key, t);
  }
  return t;
};
const imgCache: Record<string, Promise<THREE.Texture>> = {};
const loadImg = (n: string) => (imgCache[n] ??= new Promise((res) => new THREE.TextureLoader().load(staticFile(`sixday/img/${n}.webp`), (t) => {
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t);
})));
/** Preload image textures (holds the render until they are in). */
export const useImgs = (names: string[]) => {
  const key = names.join(',');
  const [map, setMap] = useState<Record<string, THREE.Texture> | null>(null);
  const [h] = useState(() => delayRender(`sd imgs ${key.slice(0, 40)}`));
  useEffect(() => { Promise.all(names.map(loadImg)).then((ts) => { setMap(Object.fromEntries(names.map((n, i) => [n, ts[i]]))); continueRender(h); }); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return map;
};

const at3 = (h: Float32Array, p: string | [number, number], up = 0): V3 => { const [x, z] = PXZ(p); return [x, groundXZ(h, x, z) + up, z]; };
const rad = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------- labels
/** A gold serif label lying flat on the map (rotated to the camera heading), like the reference's place names. */
export const Label: React.FC<{ h: Float32Array; at: string | [number, number]; text: string; size: number; op?: number; head?: number; dx?: number; dz?: number; color?: string; sub?: string }> = ({ h, at, text, size, op = 1, head = 0, dx = 0, dz = 0, color = 'gold', sub }) => {
  // the canvas is cut to the text's own width, so `size` is the height of the letters in km
  const meas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  meas.font = `200px ${MAPF}`;
  let tw = meas.measureText(text).width;
  if (sub) { meas.font = `600 74px 'SDCinzel', serif`; tw = Math.max(tw, meas.measureText(sub).width); }
  const CW = Math.ceil(tw + 80), CH = sub ? 420 : 300;
  const tex = canvasTex(`lb|${text}|${color}|${sub ?? ''}`, CW, CH, (c) => {
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const fill = color === 'gold' ? (() => { const g = c.createLinearGradient(0, 60, 0, 240); g.addColorStop(0, '#ffe9a6'); g.addColorStop(0.5, '#f2c14e'); g.addColorStop(1, '#b8801f'); return g; })() : color;
    c.font = `200px ${MAPF}`;
    c.lineJoin = 'round'; c.lineWidth = 26; c.strokeStyle = 'rgba(20,14,6,0.85)'; c.strokeText(text, CW / 2, 150);
    c.fillStyle = fill; c.fillText(text, CW / 2, 150);
    if (sub) { c.font = `600 74px 'SDCinzel', serif`; c.lineWidth = 12; c.strokeText(sub, CW / 2, 345); c.fillStyle = '#f3e3b5'; c.fillText(sub, CW / 2, 345); }
  });
  if (op <= 0.001) return null;
  const [x, y, z] = at3(h, at, 0.15);
  const hh = size * (CH / 150), w = hh * (CW / CH);
  return (
    <mesh position={[x + dx, y + size * 0.04, z + dz]} rotation={[-Math.PI / 2, 0, -rad(head)]} renderOrder={20}>
      <planeGeometry args={[w, hh]} />
      <meshBasicMaterial map={tex} transparent opacity={op} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- cities
const cityGeo = new THREE.BoxGeometry(1, 1, 1);
cityGeo.translate(0, 0.5, 0);
/** A cluster of small sandstone blocks, the reference's way of marking a city. */
export const City: React.FC<{ h: Float32Array; at: string | [number, number]; size: number; grow?: number; seed?: number; n?: number }> = ({ h, at, size, grow = 1, seed = 1, n = 22 }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(cityGeo, new THREE.MeshLambertMaterial({ color: '#ffffff' }), n);
    return m;
  }, [n]);
  const [x, y, z] = at3(h, at);
  let s = seed * 9301;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const o = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * size * 0.5;
    const bw = size * (0.12 + rnd() * 0.14), bh = size * (0.08 + rnd() * 0.32) * (1 - r / size) * Math.max(0, Math.min(1, grow * 1.6 - (i / n) * 0.6));
    o.position.set(x + Math.cos(a) * r, y, z + Math.sin(a) * r); o.scale.set(bw, Math.max(0.0001, bh), bw * (0.7 + rnd() * 0.6)); o.rotation.set(0, rnd() * 0.6, 0);
    o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
    col.setHSL(0.07 + rnd() * 0.04, 0.38, 0.26 + rnd() * 0.12); mesh.setColorAt(i, col);
  }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ---------------------------------------------------------------- unit tiles
const TILE: Record<string, string> = { il: '#1d3f78', eg: '#2b4a26', jo: '#2b4a26', sy: '#2b4a26', lb: '#2b4a26', un: '#3d6fa8', in: '#3d6fa8', su: '#5a1d1d', br: '#2b4a26' };
const tileTex = (side: Side, kind: Kind) => canvasTex(`unit|${side}|${kind}`, 640, 400, (c) => {
  c.fillStyle = '#10141a'; c.fillRect(0, 0, 640, 400);
  const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, TILE[side]); g.addColorStop(1, '#0d1118');
  c.fillStyle = g; c.beginPath(); c.roundRect(18, 18, 604, 364, 26); c.fill();
  c.strokeStyle = 'rgba(220,230,255,0.55)'; c.lineWidth = 8; c.beginPath(); c.roundRect(30, 30, 580, 340, 20); c.stroke();
  drawFlag(c, side, 58, 120, 230, 155);
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 4; c.strokeRect(58, 120, 230, 155);
  drawIcon(c, kind, 455, 205, 190);
});
const tileGeo = new THREE.BoxGeometry(1, 0.14, 0.625);
const sideMat = new THREE.MeshLambertMaterial({ color: '#141920' });
export type UnitT = { side: Side; kind: Kind; at: [number, number]; s: number; head?: number; pop?: number; key?: string };
/** A unit tile: a dark slab with the side's flag and a white icon on top, slid around the map by the story. */
export const Unit: React.FC<{ h: Float32Array; u: UnitT }> = ({ h, u }) => {
  const mats = useMemo(() => {
    const top = new THREE.MeshLambertMaterial({ map: tileTex(u.side, u.kind) });
    return [sideMat, sideMat, top, sideMat, sideMat, sideMat];
  }, [u.side, u.kind]);
  const p = u.pop ?? 1;
  if (p <= 0.001) return null;
  const y = groundXZ(h, u.at[0], u.at[1]);
  const drop = (1 - Math.min(1, p)) * u.s * 1.5;
  return <mesh geometry={tileGeo} material={mats} position={[u.at[0], y + u.s * 0.07 + drop, u.at[1]]} rotation={[0, -rad(u.head ?? 0), 0]} scale={[u.s * p, u.s * p, u.s * p]} />;
};

// ---------------------------------------------------------------- arrows
/** A thick yellow attack arrow on the ground along a path of places, drawn up to `p` (0..1). */
export const Arrow: React.FC<{ h: Float32Array; path: (string | [number, number])[]; w: number; p: number; color?: string; op?: number }> = ({ h, path, w, p, color = '#f5c21b', op = 1 }) => {
  const geo = useMemo(() => {
    if (p <= 0.001) return null;
    const pts = path.map((q) => { const [x, z] = PXZ(q); return new THREE.Vector3(x, 0, z); });
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const total = curve.getLength();
    const L = total * p, head = Math.min(w * 2.6, L * 0.6), N = 60;
    const body = Math.max(0.0001, L - head);
    const pos: number[] = [], idx: number[] = [];
    const at = (d: number) => curve.getPointAt(Math.min(1, d / total));
    const tan = (d: number) => curve.getTangentAt(Math.min(1, Math.max(0, d / total)));
    for (let i = 0; i <= N; i++) {
      const d = (body * i) / N, c = at(d), t = tan(d), n = new THREE.Vector3(-t.z, 0, t.x);
      const ww = w * (0.55 + 0.45 * (i / N));
      for (const s of [-1, 1]) { const x = c.x + n.x * ww * 0.5 * s, z = c.z + n.z * ww * 0.5 * s; pos.push(x, groundXZ(h, x, z) + 0.25, z); }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const c0 = at(body), t0 = tan(body), n0 = new THREE.Vector3(-t0.z, 0, t0.x), tip = at(L);
    const base = pos.length / 3;
    for (const [x, z] of [[c0.x + n0.x * w * 1.15, c0.z + n0.z * w * 1.15], [c0.x - n0.x * w * 1.15, c0.z - n0.z * w * 1.15], [tip.x, tip.z]]) pos.push(x, groundXZ(h, x, z) + 0.25, z);
    idx.push(base, base + 1, base + 2);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    return g;
  }, [h, path, w, p]);
  if (!geo) return null;
  return (
    <group renderOrder={15}>
      <mesh geometry={geo} position={[w * 0.12, -0.05, w * 0.18]} renderOrder={14}><meshBasicMaterial color="#000" transparent opacity={0.4 * op} depthTest={false} depthWrite={false} /></mesh>
      <mesh geometry={geo} renderOrder={15}><meshBasicMaterial color={color} transparent opacity={op} depthTest={false} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- target brackets
const bracketTex = (col: string) => canvasTex(`br|${col}`, 256, 256, (c) => {
  c.strokeStyle = col; c.lineWidth = 18; c.lineCap = 'square'; c.shadowColor = col; c.shadowBlur = 16;
  for (const [x, y, dx, dy] of [[24, 24, 1, 1], [232, 24, -1, 1], [24, 232, 1, -1], [232, 232, -1, -1]]) {
    c.beginPath(); c.moveTo(x, y + dy * 62); c.lineTo(x, y); c.lineTo(x + dx * 62, y); c.stroke();
  }
  c.lineWidth = 8; c.beginPath(); c.moveTo(128, 96); c.lineTo(128, 160); c.moveTo(96, 128); c.lineTo(160, 128); c.stroke();
});
/** Green target brackets lying on an airfield; `lock` 0..1 snaps them in from twice the size. */
export const Bracket: React.FC<{ h: Float32Array; at: string | [number, number]; size: number; lock: number; t: number; col?: string; op?: number }> = ({ h, at, size, lock, t, col = '#45ff6a', op = 1 }) => {
  if (lock <= 0.001 || op <= 0.001) return null;
  const [x, y, z] = at3(h, at, 0.3);
  const s = size * (1 + (1 - lock) * 1.2) * (1 + 0.05 * Math.sin(t * 7));
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, (1 - lock) * 0.8]} renderOrder={18}>
      <planeGeometry args={[s, s]} />
      <meshBasicMaterial map={bracketTex(col)} transparent opacity={Math.min(1, lock * 1.5) * op} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- image props
/** An image prop standing on the map (billboarded to the camera's heading) or lying flat (`flat`). */
export const Prop: React.FC<{ tex: THREE.Texture; h: Float32Array; at: string | [number, number] | V3; w: number; op?: number; head?: number; flat?: boolean; up?: number; tint?: string; yaw?: number; shadow?: number; order?: number }> = ({ tex, h, at, w, op = 1, head = 0, flat, up = 0, tint = '#ffffff', yaw = 0, shadow = 0, order = 12 }) => {
  if (op <= 0.001) return null;
  const img = tex.image as { width: number; height: number };
  const hh = (w * img.height) / img.width;
  const p: V3 = Array.isArray(at) && at.length === 3 ? (at as V3) : at3(h, at as string | [number, number]);
  const gy = groundXZ(h, p[0], p[2]);
  return (
    <group>
      {shadow > 0 && (
        <mesh position={[p[0] + up * 0.5, gy + 0.2, p[2] + up * 0.35]} rotation={[-Math.PI / 2, 0, -rad(head) + yaw]} renderOrder={order - 1}>
          <planeGeometry args={[w, hh]} />
          <meshBasicMaterial map={tex} color="#000" transparent opacity={shadow * op} depthTest={false} depthWrite={false} />
        </mesh>
      )}
      {flat ? (
        <mesh position={[p[0], p[1] + up + 0.3, p[2]]} rotation={[-Math.PI / 2, 0, -rad(head) + yaw]} renderOrder={order}>
          <planeGeometry args={[w, hh]} />
          <meshBasicMaterial map={tex} color={tint} transparent opacity={op} depthWrite={false} alphaTest={0.02} />
        </mesh>
      ) : (
        <mesh position={[p[0], p[1] + up + hh * 0.5, p[2]]} rotation={[0, -rad(head), 0]} renderOrder={order}>
          <planeGeometry args={[w, hh]} />
          <meshBasicMaterial map={tex} color={tint} transparent opacity={op} depthWrite={false} alphaTest={0.02} />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- blasts
const ballGeo = new THREE.IcosahedronGeometry(1, 1);
const flashTex = () => canvasTex('flash', 256, 256, (c) => {
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.2, 'rgba(255,214,120,0.95)'); g.addColorStop(0.5, 'rgba(255,120,30,0.45)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
});
const ringTex = () => canvasTex('ring', 256, 256, (c) => {
  const g = c.createRadialGradient(128, 128, 70, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,230,190,0)'); g.addColorStop(0.75, 'rgba(255,220,170,0.9)'); g.addColorStop(1, 'rgba(255,200,150,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
});
const scorchTex = () => canvasTex('scorch', 256, 256, (c) => {
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(10,8,6,0.85)'); g.addColorStop(0.55, 'rgba(25,18,12,0.55)'); g.addColorStop(1, 'rgba(30,20,10,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
});
/**
 * A blast at `at`, `age` seconds after it went off: a white-hot flash, a fireball that cools into a rolling smoke
 * column of chunky puffs (the reference's look), a shockwave ring racing over the ground, sparks thrown out in arcs and
 * a scorch mark left behind. `size` is the fireball radius in km.
 */
export const Blast: React.FC<{ h: Float32Array; at: string | [number, number]; size: number; age: number; seed?: number; n?: number; scorch?: number }> = ({ h, at, size, age, seed = 1, n = 40, scorch = 1 }) => {
  const smoke = useMemo(() => new THREE.InstancedMesh(ballGeo, new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#000000' }), n), [n]);
  const fire = useMemo(() => new THREE.InstancedMesh(ballGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), n), [n]);
  const sparks = useMemo(() => new THREE.InstancedMesh(ballGeo, new THREE.MeshBasicMaterial({ color: '#ffd27a', toneMapped: false }), 18), []);
  if (age < 0 || age > 4.2) return null;
  const [x, y, z] = at3(h, at);
  let s = seed * 7919 + 13;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const o = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), up = rnd(), sz = 0.45 + rnd() * 0.55, delay = rnd() * 0.25;
    const t = Math.max(0, age - delay);
    const grow = 1 - Math.exp(-t * 5);
    const rise = up * size * 1.6 * (1 - Math.exp(-t * 1.1)) + t * size * 0.15;
    const spread = r * size * (0.5 + 0.8 * grow) * (1 + t * 0.05);
    const px = x + Math.cos(a) * spread + t * size * 0.12, pz = z + Math.sin(a) * spread * 0.8;
    const py = y + size * 0.35 * sz + rise;
    const fade = Math.max(0, 1 - Math.max(0, t - 1.6) / 2.2);
    const rr = size * sz * (0.3 + 0.65 * grow + t * 0.05) * fade;
    o.position.set(px, py, pz); o.scale.setScalar(Math.max(0.0001, rr)); o.rotation.set(a, up * 3, r); o.updateMatrix();
    smoke.setMatrixAt(i, o.matrix);
    const heat = Math.max(0, 1 - t / 0.9);
    const dk = 0.16 + 0.22 * up * up + 0.1 * sz; // charcoal at the core, dusty brown at the top
    col.setRGB((dk * 1.2 + heat * 0.6) * 0.5, (dk * 1.0 + heat * 0.22) * 0.5, (dk * 0.82 + heat * 0.03) * 0.5); smoke.setColorAt(i, col);
    const fr = Math.max(0.0001, rr * 0.82 * Math.max(0, 1 - t / 1.1));
    o.scale.setScalar(fr); o.updateMatrix(); fire.setMatrixAt(i, o.matrix);
    col.setRGB(1.0 * heat + 0.25, 0.42 * heat + 0.06, 0.08 * heat * heat); fire.setColorAt(i, col);
  }
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2, v = size * (2.5 + rnd() * 3), vy = size * (2 + rnd() * 4), t = Math.min(age, 1.4);
    const k = Math.max(0, 1 - age / 1.4);
    o.position.set(x + Math.cos(a) * v * t, y + Math.max(0, vy * t - size * 4.5 * t * t), z + Math.sin(a) * v * t);
    o.scale.setScalar(Math.max(0.0001, size * 0.07 * k)); o.updateMatrix(); sparks.setMatrixAt(i, o.matrix);
  }
  for (const m of [smoke, fire, sparks]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  const flash = Math.max(0, 1 - age / 0.35), ringR = size * (0.5 + age * 7), ringO = Math.max(0, 1 - age / 0.9);
  return (
    <group>
      {scorch > 0 && <mesh position={[x, y + 0.12, z]} rotation={[-Math.PI / 2, 0, seed]} renderOrder={9}><planeGeometry args={[size * 3.2, size * 3.2]} /><meshBasicMaterial map={scorchTex()} transparent opacity={Math.min(1, age * 3) * scorch} depthWrite={false} /></mesh>}
      {ringO > 0 && <mesh position={[x, y + 0.2, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={19}><planeGeometry args={[ringR * 2, ringR * 2]} /><meshBasicMaterial map={ringTex()} transparent opacity={ringO * 0.8} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>}
      <primitive object={smoke} />
      {age < 1.2 && <primitive object={fire} />}
      {age < 1.4 && <primitive object={sparks} />}
      {flash > 0 && <sprite position={[x, y + size * 0.8, z]} scale={[size * 7 * (0.6 + age * 2), size * 7 * (0.6 + age * 2), 1]} renderOrder={21}><spriteMaterial map={flashTex()} transparent opacity={flash} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>}
    </group>
  );
};

/** Camera shake (km offsets) from blasts that went off at the given times. */
export const shake = (t: number, hits: number[], amp: number): V3 => {
  let x = 0, y = 0;
  for (const t0 of hits) {
    const d = t - t0;
    if (d < 0 || d > 0.8) continue;
    const k = amp * Math.exp(-d * 6);
    x += k * Math.sin(d * 63 + t0); y += k * Math.cos(d * 51 + t0 * 2);
  }
  return [x, y, 0];
};

/** A jet (top-view image) flying along a path at `alt` km, with its shadow racing over the ground below it. */
export const Jet: React.FC<{ h: Float32Array; tex: THREE.Texture; path: (string | [number, number])[]; p: number; w: number; alt: number; op?: number }> = ({ h, tex, path, p, w, alt, op = 1 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path.map((q) => { const [x, z] = PXZ(q); return new THREE.Vector3(x, 0, z); }), false, 'centripetal'), [path]);
  if (p <= 0 || p >= 1 || op <= 0) return null;
  const c = curve.getPointAt(p), tg = curve.getTangentAt(p);
  const yaw = Math.atan2(tg.x, -tg.z);
  const gy = groundXZ(h, c.x, c.z);
  return <Prop tex={tex} h={h} at={[c.x, gy + alt, c.z]} w={w} flat yaw={-yaw} op={op} shadow={0.35} up={alt} order={22} />;
};
