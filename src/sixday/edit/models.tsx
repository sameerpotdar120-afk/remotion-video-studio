import React, { useEffect, useMemo, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { groundXZ, PXZ, V3 } from './geo';

/**
 * The detailed 3D models (built from code in Blender: tools/blender/build_sixday_models.py) and how they move on the
 * map: tanks that drive with rolling tracks, aim and fire; jets that bank and leave contrails; squads of soldiers
 * running with rifles; ships with wakes. Sizes are scene km (the map is a miniature, so the models are scaled up the
 * way the reference's pieces are).
 */
export type Models = Record<'tank' | 'jet' | 'mig' | 'soldier' | 'ship' | 'tanker', { scene: THREE.Group; animations: THREE.AnimationClip[] }>;
let modelsP: Promise<Models> | null = null;
const loadModels = () => (modelsP ??= (async () => {
  const L = new GLTFLoader();
  const names = ['tank', 'jet', 'mig', 'soldier', 'ship', 'tanker'] as const;
  const gl = await Promise.all(names.map((n) => L.loadAsync(staticFile(`sixday/models/${n}.glb`))));
  const out = {} as Models;
  names.forEach((n, i) => { out[n] = { scene: gl[i].scene, animations: gl[i].animations }; });
  return out;
})());
export const useModels = () => {
  const [m, setM] = useState<Models | null>(null);
  const [h] = useState(() => delayRender('sd models'));
  useEffect(() => { loadModels().then((x) => { setM(x); continueRender(h); }); }, [h]);
  return m;
};

/** A soft studio environment for the PBR materials (reflections on metal and glass). */
export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

// ------------------------------------------------------------------ shared sprites
const spriteCache = new Map<string, THREE.CanvasTexture>();
const spriteTex = (key: string, draw: (c: CanvasRenderingContext2D, s: number) => void, s = 256) => {
  let t = spriteCache.get(key);
  if (!t) {
    const cv = document.createElement('canvas'); cv.width = cv.height = s;
    draw(cv.getContext('2d') as CanvasRenderingContext2D, s);
    t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; spriteCache.set(key, t);
  }
  return t;
};
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** A soft, lumpy smoke puff (several overlapping blurred blobs), white so it can be tinted. */
export const smokeTex = (v = 0) => spriteTex(`smoke${v}`, (c, s) => {
  c.clearRect(0, 0, s, s);
  for (let i = 0; i < 26; i++) {
    const a = hash(i + v * 31) * Math.PI * 2, r = Math.sqrt(hash(i * 3 + v)) * s * 0.22;
    const x = s / 2 + Math.cos(a) * r, y = s / 2 + Math.sin(a) * r, rr = s * (0.12 + 0.14 * hash(i * 7 + v));
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, 'rgba(255,255,255,0.42)'); g.addColorStop(0.6, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
  }
});
export const glowTex = () => spriteTex('glow', (c, s) => {
  const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,250,235,1)'); g.addColorStop(0.18, 'rgba(255,205,110,0.95)'); g.addColorStop(0.45, 'rgba(255,110,30,0.45)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, s, s);
});
const shadowTex = () => spriteTex('cshadow', (c, s) => {
  const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, s, s);
});

// ------------------------------------------------------------------ paths
export type Pt = string | [number, number];
/** A ground path (places / lon-lat) as a curve in scene km. */
const curves = new Map<string, THREE.CatmullRomCurve3>();
export const pathCurve = (path: Pt[]) => {
  const k = JSON.stringify(path);
  let c = curves.get(k);
  if (!c) { c = new THREE.CatmullRomCurve3(path.map((q) => { const [x, z] = PXZ(q); return new THREE.Vector3(x, 0, z); }), false, 'centripetal'); curves.set(k, c); }
  return c;
};

// ------------------------------------------------------------------ tanks
const SIDE_COL: Record<string, string> = { il: '#8c8468', eg: '#a89466', jo: '#7d7a58', sy: '#76704f' };
const tankMats = new Map<string, Map<string, THREE.Material>>();
const tintedClone = (src: THREE.Object3D, side: string) => {
  const o = src.clone(true);
  let mm = tankMats.get(side);
  if (!mm) { mm = new Map(); tankMats.set(side, mm); }
  o.traverse((n) => {
    const me = n as THREE.Mesh;
    if (!me.isMesh) return;
    const m0 = me.material as THREE.MeshStandardMaterial;
    let m = mm!.get(m0.name);
    if (!m) {
      const c = m0.clone();
      if (m0.name === 'armour') c.color = new THREE.Color(SIDE_COL[side] ?? '#8c8468');
      if (m0.name === 'track' && c.map) { c.map = c.map.clone(); c.map.wrapS = c.map.wrapT = THREE.RepeatWrapping; c.map.needsUpdate = true; }
      c.envMapIntensity = 0.6;
      mm!.set(m0.name, c); m = c;
    }
    me.material = m;
  });
  return o;
};
/**
 * A tank driving along `path` (progress p 0..1, ease handled by the caller), length `len` km. Its tracks roll with the
 * distance travelled; the turret turns toward `aim` (a place) when given; `fire` lists times the gun fires (muzzle flash,
 * a puff of smoke, the gun recoils). A dust plume trails it while it moves.
 */
export const Tank: React.FC<{ h: Float32Array; m: Models; side: string; path: Pt[]; p: number; len: number; t: number; aim?: Pt; fire?: number[]; op?: number; speed?: number }> = ({ h, m, side, path, p, len, t, aim, fire = [], op = 1, speed = 1 }) => {
  const obj = useMemo(() => tintedClone(m.tank.scene, side), [m, side]);
  if (op <= 0.001) return null;
  const c = pathCurve(path);
  const pp = Math.min(0.999, Math.max(0, p));
  const pos = c.getPointAt(pp), tan = c.getTangentAt(Math.min(0.999, pp + 0.001));
  const yaw = Math.atan2(-tan.z, tan.x);
  const s = len / 6.6;
  const y = groundXZ(h, pos.x, pos.z);
  obj.position.set(pos.x, y, pos.z); obj.rotation.set(0, yaw, 0); obj.scale.setScalar(s * Math.min(1, op * 1.3));
  const dist = c.getLength() * pp;
  const trk = (obj.getObjectByName('track_L') as THREE.Mesh)?.material as THREE.MeshStandardMaterial;
  if (trk?.map) trk.map.offset.y = -(dist / len) * 1.4 * speed;
  const tur = obj.getObjectByName('turret'), gun = obj.getObjectByName('gun');
  let fx = 0;
  if (tur && aim) {
    const [ax, az] = PXZ(aim);
    const want = Math.atan2(-(az - pos.z), ax - pos.x) - yaw;
    tur.rotation.y = Math.atan2(Math.sin(want), Math.cos(want));
  }
  const last = fire.filter((f) => t >= f && t < f + 1.2).pop();
  if (last !== undefined) fx = t - last;
  if (gun) gun.position.x = 1.4 - (last !== undefined ? 0.35 * Math.exp(-fx * 8) : 0) - (tur ? 0 : 0);
  const moving = Math.abs(speed) > 0 && p > 0.001 && p < 0.999;
  const dust: React.ReactNode[] = [];
  if (moving) {
    for (let i = 0; i < 9; i++) {
      const k = (i + (t * 2.2) % 1) / 9;
      const q = c.getPointAt(Math.max(0, pp - k * (len * 2.2) / c.getLength()));
      dust.push(<sprite key={`d${i}`} position={[q.x, groundXZ(h, q.x, q.z) + len * (0.15 + k * 0.45), q.z]} scale={[len * (0.5 + k * 1.6), len * (0.5 + k * 1.6), 1]}>
        <spriteMaterial map={smokeTex(i % 3)} color="#c9b58e" transparent opacity={0.42 * (1 - k) * op} depthWrite={false} />
      </sprite>);
    }
  }
  const muzzle: React.ReactNode[] = [];
  if (last !== undefined && fx < 0.9) {
    const dir = new THREE.Vector3(Math.cos(yaw + (tur?.rotation.y ?? 0)), 0, -Math.sin(yaw + (tur?.rotation.y ?? 0)));
    const tip = new THREE.Vector3(pos.x, y + 1.75 * s, pos.z).add(dir.clone().multiplyScalar(6.6 * s));
    muzzle.push(<sprite key="mf" position={tip.toArray()} scale={[len * 1.4 * Math.exp(-fx * 10), len * 1.4 * Math.exp(-fx * 10), 1]} renderOrder={25}>
      <spriteMaterial map={glowTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>);
    for (let i = 0; i < 4; i++) {
      const q = tip.clone().add(dir.clone().multiplyScalar(len * (0.2 + fx * 0.8 + i * 0.12)));
      muzzle.push(<sprite key={`ms${i}`} position={[q.x, q.y + fx * len * 0.3, q.z]} scale={[len * (0.4 + fx * 1.2), len * (0.4 + fx * 1.2), 1]}>
        <spriteMaterial map={smokeTex(i)} color="#d8d2c4" transparent opacity={0.6 * (1 - fx / 0.9)} depthWrite={false} />
      </sprite>);
    }
  }
  return (
    <group>
      <mesh position={[pos.x, y + 0.05, pos.z]} rotation={[-Math.PI / 2, 0, yaw]} renderOrder={8}>
        <planeGeometry args={[len * 1.5, len * 0.8]} />
        <meshBasicMaterial map={shadowTex()} transparent opacity={0.75 * op} depthWrite={false} />
      </mesh>
      <primitive object={obj} />
      {dust}{muzzle}
    </group>
  );
};

// ------------------------------------------------------------------ jets
/**
 * A jet flying along `path` at `alt` km (p 0..1). It banks into turns, its afterburner glows, and it leaves two fading
 * contrails. `len` is its length in km.
 */
export const Jet3D: React.FC<{ h: Float32Array; m: Models; kind?: 'jet' | 'mig'; path: Pt[]; p: number; len: number; alt: number; op?: number; trail?: number }> = ({ h, m, kind = 'jet', path, p, len, alt, op = 1, trail = 1 }) => {
  const obj = useMemo(() => {
    const o = m[kind].scene.clone(true);
    o.traverse((n) => { const me = n as THREE.Mesh; if (me.isMesh) { const mt = (me.material as THREE.MeshStandardMaterial).clone(); mt.envMapIntensity = 1.0; me.material = mt; } });
    return o;
  }, [m, kind]);
  if (p <= 0 || p >= 1 || op <= 0.001) return null;
  const c = pathCurve(path);
  const pos = c.getPointAt(p), t0 = c.getTangentAt(p), t1 = c.getTangentAt(Math.min(0.999, p + 0.02));
  const yaw = Math.atan2(-t0.z, t0.x);
  const turn = Math.atan2(t0.x * t1.z - t0.z * t1.x, t0.x * t1.x + t0.z * t1.z);
  const bank = Math.max(-1.0, Math.min(1.0, turn * 40));
  const gy = groundXZ(h, pos.x, pos.z);
  const s = len / 15;
  obj.position.set(pos.x, gy + alt, pos.z);
  obj.rotation.set(0, 0, 0); obj.rotateY(yaw); obj.rotateX(bank); obj.scale.setScalar(s);
  const back = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));
  const burner = obj.position.clone().add(back.clone().multiplyScalar(len * 0.53));
  const trails: React.ReactNode[] = [];
  if (trail > 0) {
    const L = c.getLength();
    for (let i = 1; i < 26; i++) {
      const q = c.getPointAt(Math.max(0, p - (i * len * 0.45) / L));
      const k = i / 26;
      trails.push(<sprite key={`c${i}`} position={[q.x, gy + alt + k * len * 0.05, q.z]} scale={[len * (0.12 + k * 0.5), len * (0.12 + k * 0.5), 1]}>
        <spriteMaterial map={smokeTex(i % 3)} color="#ffffff" transparent opacity={0.5 * (1 - k) * op * trail} depthWrite={false} />
      </sprite>);
    }
  }
  return (
    <group>
      <mesh position={[pos.x, gy + 0.08, pos.z]} rotation={[-Math.PI / 2, 0, yaw]} renderOrder={8}>
        <planeGeometry args={[len * 1.2, len * 0.75]} />
        <meshBasicMaterial map={shadowTex()} transparent opacity={0.45 * op * Math.max(0.2, 1 - alt / (len * 6))} depthWrite={false} />
      </mesh>
      <primitive object={obj} />
      <sprite position={burner.toArray()} scale={[len * 0.35, len * 0.35, 1]} renderOrder={26}>
        <spriteMaterial map={glowTex()} transparent opacity={0.85 * op} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {trails}
    </group>
  );
};

// ------------------------------------------------------------------ soldiers
const UNIFORM: Record<string, string> = { il: '#6f6a48', eg: '#8f7c52', jo: '#6b6a45', sy: '#6a6646', un: '#7a7556' };
/**
 * A squad of `n` soldiers running (or walking) along `path`, spread in a loose formation `spread` km wide, each `tall`
 * km tall (the map is a miniature). UN soldiers get blue helmets. Rifles flash now and then when `firing`.
 */
export const Squad: React.FC<{ h: Float32Array; m: Models; side: string; path: Pt[]; p: number; n: number; tall: number; spread: number; t: number; run?: boolean; op?: number; firing?: boolean; seed?: number }> = ({ h, m, side, path, p, n, tall, spread, t, run = true, op = 1, firing, seed = 1 }) => {
  const rig = useMemo(() => {
    const clip = m.soldier.animations.find((a) => a.name === (run ? 'run' : 'walk')) ?? m.soldier.animations[0];
    const out: { o: THREE.Object3D; mx: THREE.AnimationMixer }[] = [];
    for (let i = 0; i < n; i++) {
      const o = SkeletonUtils.clone(m.soldier.scene);
      o.traverse((q) => {
        const me = q as THREE.Mesh;
        if (!me.isMesh) return;
        const arr = Array.isArray(me.material) ? me.material : [me.material];
        const re = arr.map((mt) => {
          const c = (mt as THREE.MeshStandardMaterial).clone();
          if (c.name === 'uniform' || c.name === 'trousers') c.color = new THREE.Color(UNIFORM[side] ?? '#6f6a48').multiplyScalar(c.name === 'trousers' ? 0.85 : 1);
          if (c.name === 'helmet') c.color = new THREE.Color(side === 'un' ? '#4f86c6' : UNIFORM[side] ?? '#5f5a3c').multiplyScalar(0.85);
          return c;
        });
        me.material = Array.isArray(me.material) ? re : re[0];
        (me as THREE.SkinnedMesh).frustumCulled = false;
      });
      const mx = new THREE.AnimationMixer(o);
      if (clip) mx.clipAction(clip).play();
      out.push({ o, mx });
    }
    return out;
  }, [m, n, side, run]);
  if (op <= 0.001) return null;
  const c = pathCurve(path);
  const L = c.getLength();
  const flashes: React.ReactNode[] = [];
  rig.forEach(({ o, mx }, i) => {
    const r1 = hash(i * 13 + seed), r2 = hash(i * 7 + seed * 3);
    const pp = Math.min(0.999, Math.max(0, p - (r1 * spread * 0.8) / L));
    const pos = c.getPointAt(pp), tan = c.getTangentAt(Math.min(0.999, pp + 0.001));
    const side3 = new THREE.Vector3(-tan.z, 0, tan.x).multiplyScalar((r2 - 0.5) * spread);
    const x = pos.x + side3.x, z = pos.z + side3.z;
    const yaw = Math.atan2(-tan.z, tan.x);
    o.position.set(x, groundXZ(h, x, z), z);
    o.rotation.set(0, yaw, 0);
    o.scale.setScalar((tall / 1.85) * Math.min(1, op * 1.4));
    mx.setTime((t * (run ? 1.45 : 0.9) + r1) % 1);
    if (firing && hash(Math.floor(t * 9) + i * 17 + seed) > 0.82) {
      const tip = new THREE.Vector3(x, groundXZ(h, x, z) + tall * 0.62, z).add(new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(tall * 0.55));
      flashes.push(<sprite key={`f${i}`} position={tip.toArray()} scale={[tall * 0.6, tall * 0.6, 1]} renderOrder={25}>
        <spriteMaterial map={glowTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>);
    }
  });
  return <group>{rig.map(({ o }, i) => <primitive key={i} object={o} />)}{flashes}</group>;
};

/** Tracer fire: glowing streaks flying from a to b, a few at a time. */
export const Tracers: React.FC<{ h: Float32Array; a: Pt; b: Pt; t: number; n?: number; up: number; op?: number; color?: string; seed?: number }> = ({ h, a, b, t, n = 6, up, op = 1, color = '#ffcf6b', seed = 1 }) => {
  if (op <= 0.001) return null;
  const [ax, az] = PXZ(a), [bx, bz] = PXZ(b);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const f = (t * 1.6 + hash(i + seed)) % 1;
    const jx = (hash(i * 3 + seed) - 0.5) * up * 6, jz = (hash(i * 5 + seed) - 0.5) * up * 6;
    const x = ax + (bx + jx - ax) * f, z = az + (bz + jz - az) * f;
    const y = Math.max(groundXZ(h, ax, az), groundXZ(h, bx, bz)) + up * (1 + Math.sin(f * Math.PI) * 0.6);
    out.push(<sprite key={i} position={[x, y, z]} scale={[up * 0.9, up * 0.9, 1]} renderOrder={24}>
      <spriteMaterial map={glowTex()} color={color} transparent opacity={op * Math.sin(f * Math.PI)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>);
  }
  return <group>{out}</group>;
};

// ------------------------------------------------------------------ ships
/** A ship model on the water at `at` heading `head` degrees (0 = north), `len` km long; `yellow` 0..1 dusts it with sand. */
export const Ship3D: React.FC<{ h: Float32Array; m: Models; kind?: 'ship' | 'tanker'; at: Pt | [number, number, number]; head: number; len: number; yellow?: number; op?: number; sink?: number; t: number }> = ({ m, kind = 'ship', at, head, len, yellow = 0, op = 1, sink = 0, t }) => {
  const obj = useMemo(() => {
    const o = m[kind].scene.clone(true);
    o.traverse((n) => { const me = n as THREE.Mesh; if (me.isMesh) { const arr = Array.isArray(me.material) ? me.material : [me.material]; me.material = arr.length > 1 ? arr.map((x) => (x as THREE.Material).clone()) : (arr[0] as THREE.Material).clone(); } });
    return o;
  }, [m, kind]);
  if (op <= 0.001) return null;
  const sand = new THREE.Color('#c9a95c');
  obj.traverse((n) => {
    const me = n as THREE.Mesh;
    if (!me.isMesh) return;
    const arr = (Array.isArray(me.material) ? me.material : [me.material]) as THREE.MeshStandardMaterial[];
    for (const mt of arr) {
      if (!mt.userData.c0) mt.userData.c0 = mt.color.clone();
      mt.color.copy(mt.userData.c0 as THREE.Color).lerp(sand, yellow * 0.75);
      mt.roughness = 0.6 + 0.35 * yellow;
    }
  });
  const [x, z] = Array.isArray(at) && at.length === 3 ? [at[0], at[2]] : PXZ(at as Pt);
  const yaw = Math.PI / 2 - (head * Math.PI) / 180;
  obj.position.set(x, -len * 0.012 - sink * len * 0.09, z);
  obj.rotation.set(Math.sin(t * 0.9 + x) * 0.015 + sink * 0.35, yaw, Math.sin(t * 0.7 + z) * 0.02 + sink * 0.12);
  obj.scale.setScalar((len / 140) * Math.min(1, op * 1.3));
  return <primitive object={obj} />;
};
