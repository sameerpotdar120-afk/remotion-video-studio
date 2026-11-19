import React, { useEffect, useMemo, useState } from 'react';
import { Img, continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { pop } from '../../darien/anim';
import { ASPECT } from './assets';
import { LABEL, TITLE, UI } from './font';
import { CamS, V3, groundXZ, project, xz } from './Terrain';

/** The overlay kit for the Siliguri v2 edit: pins, territory tags with code-drawn flags, ringed badges, props standing on
 * the terrain, flat ground labels (a homography onto the projected ground quad), and the three.js jets, contrails,
 * train and clouds. */
export const DARK = '#06121a';
export const COL = { gold: '#FFC21A', orange: '#FF7A1A', red: '#FF2A2A', blue: '#3D86FF', sky: '#8FD0FF', white: '#F4F4F4', green: '#35E06A', cyan: '#5FF3FF' };
export const FOCAL = 960 / Math.tan((34 / 2) * Math.PI / 180);
export const has = (k: string) => !!ASPECT[k];

// ------------------------------------------------------------------ flags (drawn in code)
const star = (cx: number, cy: number, r: number, rot = 0) => Array.from({ length: 10 }, (_, i) => {
  const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r;
  return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
}).join(' ');
export const Flag: React.FC<{ k: 'china' | 'bangladesh' | 'india' | 'nepal'; h: number }> = ({ k, h }) => {
  if (k === 'china') return (
    <svg width={h * 1.5} height={h} viewBox="0 0 30 20"><rect width={30} height={20} fill="#EE1C25" />
      <polygon points={star(5, 5, 3)} fill="#FFFF00" />
      {[[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y], i) => <polygon key={i} points={star(x, y, 1, Math.atan2(5 - y, 5 - x) + Math.PI / 2)} fill="#FFFF00" />)}
    </svg>);
  if (k === 'bangladesh') return (
    <svg width={h * 5 / 3} height={h} viewBox="0 0 10 6"><rect width={10} height={6} fill="#006A4E" /><circle cx={4.5} cy={3} r={2} fill="#F42A41" /></svg>);
  if (k === 'india') return (
    <svg width={h * 1.5} height={h} viewBox="0 0 30 20"><rect width={30} height={20} fill="#fff" /><rect width={30} height={6.67} fill="#FF9933" /><rect y={13.33} width={30} height={6.67} fill="#138808" />
      <circle cx={15} cy={10} r={2.9} fill="none" stroke="#000080" strokeWidth={0.45} />
      {Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; return <line key={i} x1={15} y1={10} x2={15 + Math.cos(a) * 2.9} y2={10 + Math.sin(a) * 2.9} stroke="#000080" strokeWidth={0.18} />; })}
    </svg>);
  return (
    <svg width={h * 0.82} height={h} viewBox="0 0 41 50"><path d="M2,2 L39,24 L16,24 L39,48 L2,48 Z" fill="#DC143C" stroke="#003893" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={12} cy={18} r={4} fill="#fff" /><circle cx={13} cy={37} r={5} fill="#fff" /></svg>);
};

// ------------------------------------------------------------------ 2D overlays
export const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; ox?: string; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, ox = '-50%,-50%', children }) =>
  p <= 0.001 || o <= 0.001 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${ox}) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, o) }}>{children}</div>;

/** A country tag pinned to the terrain: a dark box with the flag and the name. */
export const TerritoryTag: React.FC<{ x: number; y: number; flag: 'china' | 'bangladesh' | 'india' | 'nepal'; hi: string; en: string; s?: number; o?: number; p?: number }> = ({ x, y, flag, hi, en, s = 1, o = 1, p = 1 }) => (
  <At x={x} y={y} p={p * s} o={o}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 18px 8px 10px', background: 'rgba(8,10,14,0.92)', borderRadius: 10, boxShadow: '0 8px 22px rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.18)' }}>
      <div style={{ borderRadius: 4, overflow: 'hidden', display: 'flex', boxShadow: '0 0 0 2px rgba(255,255,255,0.25)' }}><Flag k={flag} h={44} /></div>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 44, color: '#fff', whiteSpace: 'nowrap', marginBottom: -2 }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 19, letterSpacing: 4, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{en}</div>
      </div>
    </div>
  </At>
);

/** A white map pin with a pulsing halo and a two-line label (Hindi + small English). */
export const Pin: React.FC<{ x: number; y: number; t: number; t0: number; hi: string; en?: string; color?: string; o?: number; side?: 'r' | 'l' | 'u'; size?: number }> = ({ x, y, t, t0, hi, en, color = '#fff', o = 1, side = 'r', size = 40 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0.001 || o <= 0.001) return null;
  const ph = ((t - t0) * 1.2) % 1;
  const lab: React.CSSProperties = side === 'r' ? { left: x + 26, top: y, transform: `translate(0,-50%) scale(${p})`, transformOrigin: '0 50%', textAlign: 'left' }
    : side === 'l' ? { left: x - 26, top: y, transform: `translate(-100%,-50%) scale(${p})`, transformOrigin: '100% 50%', textAlign: 'right' }
      : { left: x, top: y - 30, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%', textAlign: 'center' };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, o) }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={10 + 34 * ph} fill="none" stroke={color} strokeWidth={4} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={11 * p} fill={color} stroke="rgba(0,0,0,0.6)" strokeWidth={3} />
      </svg>
      <div style={{ position: 'absolute', ...lab, whiteSpace: 'nowrap', textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.7)' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.0, color: '#fff' }}>{hi}</div>
        {en && <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: size * 0.42, letterSpacing: 3, color }}>{en}</div>}
      </div>
    </div>
  );
};

/** A circular white-ring badge with a prop inside and an italic label under it (the reference's equipment badges). */
export const Badge: React.FC<{ x: number; y: number; t: number; t0: number; k: string; label: string; sub?: string; size?: number; o?: number; color?: string }> = ({ x, y, t, t0, k, label, sub, size = 230, o = 1, color = '#fff' }) => {
  const p = pop(t, t0, 9, 190);
  if (p <= 0.001 || o <= 0.001) return null;
  const d = t - t0;
  const ring = Math.min(1, d / 0.35);
  const r = size / 2;
  return (
    <At x={x} y={y} p={p} o={o}>
      <div style={{ position: 'relative', width: size, height: size + 70 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, rgba(40,60,80,0.55), rgba(5,10,16,0.82))', boxShadow: `0 0 30px ${color}55, 0 10px 26px rgba(0,0,0,0.5)`, overflow: 'hidden' }}>
          {has(k) && <Img src={staticFile(`siliguri2/img/${k}.png`)} style={{ position: 'absolute', left: '50%', top: '52%', width: size * 0.86, transform: `translate(-50%,-50%) scale(${1 + 0.04 * Math.sin(d * 2)})` }} />}
        </div>
        <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <circle cx={r} cy={r} r={r - 4} fill="none" stroke={color} strokeWidth={7} strokeDasharray={`${2 * Math.PI * (r - 4) * ring} 9999`} transform={`rotate(-90 ${r} ${r})`} />
        </svg>
        <div style={{ position: 'absolute', left: '50%', top: size + 6, transform: 'translate(-50%,0)', textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 3px 8px rgba(0,0,0,0.9)' }}>
          <div style={{ fontFamily: LABEL, fontStyle: 'italic', fontWeight: 800, fontSize: size * 0.17, letterSpacing: 1, color: '#fff' }}>{label}</div>
          {sub && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: size * 0.12, color: 'rgba(255,255,255,0.85)', marginTop: -4 }}>{sub}</div>}
        </div>
      </div>
    </At>
  );
};

/** A photoreal prop standing on the terrain: (x, y) is its foot, w its width in px. */
export const Prop: React.FC<{ k: string; x: number; y: number; w: number; o?: number; p?: number; foot?: number; flip?: boolean; ring?: string }> = ({ k, x, y, w, o = 1, p = 1, foot = 0.86, flip = false, ring }) => {
  if (o <= 0.01 || p <= 0.01 || !has(k) || w < 4) return null;
  const h = w / ASPECT[k];
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h * foot, width: w, height: h, opacity: Math.min(1, o), transform: `scale(${p})`, transformOrigin: `50% ${foot * 100}%` }}>
      {ring && <div style={{ position: 'absolute', left: w * -0.05, right: w * -0.05, top: h * foot - w * 0.2, height: w * 0.4, borderRadius: '50%', border: `${Math.max(3, w / 60)}px solid ${ring}`, boxShadow: `0 0 ${w / 10}px ${ring}, inset 0 0 ${w / 12}px ${ring}` }} />}
      <div style={{ position: 'absolute', left: w * 0.08, right: w * 0.08, top: h * foot - h * 0.08, height: h * 0.16, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), rgba(0,0,0,0) 70%)' }} />
      <Img src={staticFile(`siliguri2/img/${k}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined }} />
    </div>
  );
};

export const Stamp: React.FC<{ t: number; t0: number; hi: string; en?: string; color?: string; rot?: number; size?: number }> = ({ t, t0, hi, en, color = COL.red, rot = -8, size = 84 }) => {
  const d = t - t0;
  if (d < 0) return null;
  const s = d < 0.18 ? 2.4 - 1.4 * (d / 0.18) : 1 + 0.04 * Math.exp(-8 * (d - 0.18)) * Math.cos((d - 0.18) * 30);
  return (
    <div style={{ transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, d * 8), padding: '6px 30px', border: `10px solid ${color}`, borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: size, color, background: 'rgba(255,245,235,0.9)', lineHeight: 1.1, textAlign: 'center', whiteSpace: 'nowrap' }}>
      {hi}{en && <div style={{ fontFamily: TITLE, fontSize: size * 0.4, letterSpacing: 8 }}>{en}</div>}
    </div>
  );
};

export const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; glow?: string }> = ({ text, size, color = '#fff', font = TITLE, glow }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 12)}px ${DARK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 3}px ${glow ?? color}88, 0 10px 24px rgba(0,0,0,0.55)`, whiteSpace: 'nowrap' }}>{text}</span>
);

// ------------------------------------------------------------------ ground quads (a flat label lying on the terrain)
type Pt = [number, number];
const quadMatrix = (w: number, h: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
  const [x0, y0] = p0, [x1, y1] = p1, [x2, y2] = p2, [x3, y3] = p3;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${c},${f},0,1)`;
};
/** Lays `children` (an elW x elH box) flat on the ground: centred at lon/lat, wKm x hKm, rotated `ang` degrees (CCW). */
export const OnGround: React.FC<{ cs: CamS; hts: Float32Array; lon: number; lat: number; wKm: number; hKm: number; ang?: number; up?: number; elW: number; elH: number; o?: number; children: React.ReactNode }> = ({ cs, hts, lon, lat, wKm, hKm, ang = 0, up = 0.15, elW, elH, o = 1, children }) => {
  if (o <= 0.001) return null;
  const [cx, cz] = xz(lon, lat);
  const y = Math.max(0, groundXZ(hts, cx, cz)) + up;
  const a = (ang * Math.PI) / 180;
  const u: Pt = [Math.cos(a), -Math.sin(a)], v: Pt = [Math.sin(a), Math.cos(a)];
  const corner = (su: number, sv: number): V3 => [cx + u[0] * su * wKm / 2 + v[0] * sv * hKm / 2, y, cz + u[1] * su * wKm / 2 + v[1] * sv * hKm / 2];
  const pts = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].map((p) => project(cs, 1080, 1920, p));
  if (pts.some((p) => !p[2])) return null;
  const m = quadMatrix(elW, elH, [pts[0][0], pts[0][1]], [pts[1][0], pts[1][1]], [pts[2][0], pts[2][1]], [pts[3][0], pts[3][1]]);
  return <div style={{ position: 'absolute', left: 0, top: 0, width: elW, height: elH, transformOrigin: '0 0', transform: m, opacity: Math.min(1, o) }}>{children}</div>;
};

// ------------------------------------------------------------------ three.js pieces
const texCache: Record<string, Promise<THREE.Texture>> = {};
const loadT = (path: string) => (texCache[path] ??= new Promise<THREE.Texture>((res) => new THREE.TextureLoader().load(staticFile(path), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); })));
export const useTextures = (paths: string[]) => {
  const [tx, setTx] = useState<Record<string, THREE.Texture> | null>(null);
  const [h] = useState(() => delayRender('sg2 sprite textures'));
  useEffect(() => { Promise.all(paths.map(loadT)).then((a) => { setTx(Object.fromEntries(paths.map((p, i) => [p, a[i]]))); continueRender(h); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return tx;
};

/** A flat sprite lying horizontally (jets seen from above, the train on the ground): `head` in radians (0 = north). */
export const FlatSprite: React.FC<{ tex: THREE.Texture; pos: V3; head: number; len: number; aspect: number; shadow?: boolean; shadowY?: number; opacity?: number }> = ({ tex, pos, head, len, aspect, shadow, shadowY = 0, opacity = 1 }) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; }, []);
  const w = len * aspect;
  return (
    <>
      <mesh geometry={geo} position={pos} rotation={[0, -head, 0]} scale={[w, 1, len]} renderOrder={5}>
        <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
      </mesh>
      {shadow && <mesh geometry={geo} position={[pos[0] + 0.4 * len, shadowY + 0.05, pos[2] + 0.3 * len]} rotation={[0, -head, 0]} scale={[w, 1, len]} renderOrder={4}>
        <meshBasicMaterial map={tex} color="#000" transparent opacity={0.35 * opacity} depthWrite={false} />
      </mesh>}
    </>
  );
};

const RIB_V = `attribute float a; varying float va; void main(){ va = a; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIB_F = `uniform vec3 c; uniform float o; varying float va; void main(){ gl_FragColor = vec4(c, va * o); }`;
/** A ribbon through points (a contrail or a glowing route), fading toward its start. */
export const Ribbon: React.FC<{ pts: V3[]; width: number; color?: string; opacity?: number; flat?: boolean; fadeIn?: number }> = ({ pts, width, color = '#ffffff', opacity = 0.85, flat = true, fadeIn = 1 }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: RIB_V, fragmentShader: RIB_F, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { c: { value: new THREE.Color(color) }, o: { value: opacity } } }), [color]);
  mat.uniforms.o.value = opacity;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  if (pts.length < 2) return null;
  const n = pts.length;
  const pos = new Float32Array(n * 2 * 3), al = new Float32Array(n * 2), idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[2] - a[2];
    const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    const s = i / (n - 1);
    const wv = width * (flat ? 1 : 0.4 + 0.6 * s);
    const nx = -dz * wv / 2, nz = dx * wv / 2;
    pos.set([pts[i][0] + nx, pts[i][1], pts[i][2] + nz], i * 6);
    pos.set([pts[i][0] - nx, pts[i][1], pts[i][2] - nz], i * 6 + 3);
    const fade = Math.min(1, s / Math.max(1e-3, fadeIn));
    al[i * 2] = al[i * 2 + 1] = fade;
    if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('a', new THREE.BufferAttribute(al, 1));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return <mesh geometry={geo} material={mat} renderOrder={3} frustumCulled={false} />;
};

const CLOUD_V = `varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const CLOUD_F = `
uniform float cover, seed, o; uniform vec2 drift; varying vec2 vW;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 7; i++){ v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
void main(){
  vec2 p = vW / 90.0 + drift;
  float n = fbm(p), n2 = fbm(p + vec2(0.06, 0.09));
  float a = smoothstep(cover, cover + 0.22, n);
  float lit = clamp(0.62 + (n - n2) * 5.0 + (n - cover) * 1.2, 0.0, 1.0);
  vec3 col = mix(vec3(0.50, 0.56, 0.64), vec3(1.0, 0.99, 0.97), lit);
  gl_FragColor = vec4(col, a * o);
}`;
/** Procedural cloud layers (fbm noise); `cover` 0.25 = overcast, 1.0 = clear. */
export const Clouds: React.FC<{ at: [number, number]; cover: number; t: number; o?: number; base: number }> = ({ at, cover, t, o = 1, base }) => {
  const layers = useMemo(() => [0, 1, 2, 3, 4].map((i) => new THREE.ShaderMaterial({
    vertexShader: CLOUD_V, fragmentShader: CLOUD_F, transparent: true, depthWrite: false, depthTest: false,
    uniforms: { cover: { value: 0.5 }, seed: { value: i * 3.7 }, o: { value: 1 }, drift: { value: new THREE.Vector2() } },
  })), []);
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(2400, 2400); g.rotateX(-Math.PI / 2); return g; }, []);
  if (o <= 0.001 || cover >= 1.2) return null;
  return (
    <>
      {layers.map((m, i) => {
        m.uniforms.cover.value = cover + i * 0.035; m.uniforms.o.value = o * (0.55 + 0.1 * i);
        (m.uniforms.drift.value as THREE.Vector2).set(t * 0.012 * (1 + i * 0.3), t * 0.006);
        return <mesh key={i} geometry={geo} material={m} position={[at[0], base + i * 6, at[1]]} renderOrder={20 + i} frustumCulled={false} />;
      })}
    </>
  );
};
