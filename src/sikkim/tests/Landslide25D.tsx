import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

/** Landslide test, the 2.5D way: one still plate (an image of the slope with the scar empty), animated in Remotion.
 *  - the plate moves with depth parallax (a depth map pushes near pixels further than far ones), not a flat zoom
 *  - three.js boulders and gravel run down the scar along a traced channel, sized by the plate's perspective, lit from
 *    the plate's sun side, tumbling at a rate set by their speed and size
 *  - dust: soft noise puffs shed by each moving rock, sorted in depth with the rocks, billowing up and drifting
 *  Everything is a pure function of the frame (seeded random), so any frame renders the same on any worker.
 *  `path` is the scar's centre line in plate pixels, top to bottom: [x, y, half-width px, px per metre]. */
export type SlidePath = { w: number; h: number; path: [number, number, number, number][]; sun: [number, number] };

/** Boulders drawn larger than true scale so they read on a phone (a 2 m rock is ~7 px from this far). */
const SCALE = 2.6;
const rnd = (i: number) => {
  const v = Math.sin(i * 127.13 + 41.2) * 43758.5453;
  return v - Math.floor(v);
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Point on the polyline at arc fraction s (0 top, 1 bottom), with its normal, half-width and scale. */
const sampler = (P: SlidePath['path']) => {
  const seg: number[] = [0];
  for (let i = 1; i < P.length; i++) seg.push(seg[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = seg[seg.length - 1];
  return (s: number) => {
    const d = clamp(s, 0, 1.25) * L;
    let i = 1;
    while (i < P.length - 1 && seg[i] < d) i++;
    const a = P[i - 1], b = P[i];
    const u = (d - seg[i - 1]) / Math.max(1e-6, seg[i] - seg[i - 1]);
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    return { x: a[0] + dx * u, y: a[1] + dy * u, hw: a[2] + (b[2] - a[2]) * u, k: a[3] + (b[3] - a[3]) * u, nx: -dy / n, ny: dx / n, tx: dx / n, ty: dy / n };
  };
};

/** Angular boulder: a hull-like lumpy icosahedron, flattened a little, seeded. */
const rockGeometry = (seed: number) => {
  const g = new THREE.IcosahedronGeometry(0.5, 2);
  const a = g.getAttribute('position');
  const ax = [0.75 + rnd(seed) * 0.25, 0.6 + rnd(seed + 1) * 0.3, 0.7 + rnd(seed + 2) * 0.3];
  // a few cutting planes give it facets, then fine chips
  const planes = Array.from({ length: 7 }, (_, k) => {
    const v = new THREE.Vector3(rnd(seed * 9 + k) - 0.5, rnd(seed * 9 + k + 50) - 0.5, rnd(seed * 9 + k + 90) - 0.5).normalize();
    return { n: v, d: 0.3 + rnd(seed * 3 + k) * 0.12 };
  });
  const p = new THREE.Vector3();
  for (let i = 0; i < a.count; i++) {
    p.set(a.getX(i) * ax[0], a.getY(i) * ax[1], a.getZ(i) * ax[2]);
    for (const pl of planes) {
      const t = p.dot(pl.n);
      if (t > pl.d) p.addScaledVector(pl.n, pl.d - t);
    }
    const c = 1 + 0.03 * Math.sin(p.x * 31 + seed) * Math.cos(p.y * 27) * Math.sin(p.z * 29 + seed);
    a.setXYZ(i, p.x * c, p.y * c, p.z * c);
  }
  g.computeVertexNormals();
  return g;
};

/** Soft billowing puff: fbm noise inside a circle, lit from the sun side. Generated once, seeded. */
const puffTexture = (seed: number, sun: [number, number]) => {
  const N = 192;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d')!;
  const img = x.createImageData(N, N);
  const lat = Array.from({ length: 64 * 64 }, (_, i) => rnd(i * 1.37 + seed * 101));
  const vn = (u: number, v: number) => {
    const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
    const g = (a: number, b: number) => lat[(((b % 64) + 64) % 64) * 64 + (((a % 64) + 64) % 64)];
    const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
    return (g(i, j) * (1 - su) + g(i + 1, j) * su) * (1 - sv) + (g(i, j + 1) * (1 - su) + g(i + 1, j + 1) * su) * sv;
  };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = i / N - 0.5, v = j / N - 0.5;
    let n = 0, amp = 0.5, fr = 4;
    for (let o = 0; o < 5; o++) { n += amp * vn(u * fr + seed * 7, v * fr + seed * 3); amp *= 0.5; fr *= 2.1; }
    const r = Math.hypot(u, v) * 2;
    const a = clamp((1 - r) * 1.6 + (n - 0.5) * 1.8 - 0.25);
    // light: brighter toward the sun, darker underneath
    const lit = clamp(0.62 + (u * sun[0] + v * sun[1]) * 0.9 + (n - 0.5) * 0.5, 0.25, 1);
    const k = (i + j * N) * 4;
    img.data[k] = 255 * lit;
    img.data[k + 1] = 255 * lit;
    img.data[k + 2] = 255 * lit;
    img.data[k + 3] = 255 * a * a;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Plate with depth parallax: near pixels (white in the depth map) slide further than far ones. */
const PlateMat = (plate: THREE.Texture, depth: THREE.Texture) =>
  new THREE.ShaderMaterial({
    uniforms: { plate: { value: plate }, depth: { value: depth }, shift: { value: new THREE.Vector2() }, zoom: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D plate; uniform sampler2D depth; uniform vec2 shift; uniform float zoom; varying vec2 vUv;
      void main(){
        vec2 uv = (vUv - 0.5) / zoom + 0.5;
        // a few steps of inverse displacement so near edges don't smear
        vec2 p = uv;
        for (int i = 0; i < 4; i++) { float d = texture2D(depth, p).r; p = uv - shift * d; }
        gl_FragColor = texture2D(plate, p);
        #include <colorspace_fragment>
      }`,
  });

type Rock = { rel: number; lane: number; size: number; spin: number; geo: number; big: boolean; acc: number };

const Scene: React.FC<{ t: number; data: SlidePath; tex: Record<string, THREE.Texture>; drift: [number, number]; zoom: number }> = ({ t, data, tex, drift, zoom }) => {
  const { w, h } = data;
  const at = useMemo(() => sampler(data.path), [data]);
  const geos = useMemo(() => Array.from({ length: 10 }, (_, i) => rockGeometry(i + 3)), []);
  const plateMat = useMemo(() => PlateMat(tex.plate, tex.depth), [tex]);
  const puffs = useMemo(() => Array.from({ length: 6 }, (_, i) => puffTexture(i + 1, data.sun)), [data]);
  const rocks: Rock[] = useMemo(() => {
    const out: Rock[] = [];
    for (let i = 0; i < 150; i++) {
      const big = i < 60;
      out.push({
        rel: -1.2 + rnd(i + 3) * 2.6 - (big ? 0.4 : 0),
        lane: (rnd(i + 24) - 0.5) * 1.6,
        size: big ? 0.9 + Math.pow(rnd(i + 11), 2) * 3.0 : 0.3 + rnd(i + 11) * 0.6,
        spin: 0.6 + rnd(i + 6) * 0.8,
        geo: i % 10,
        big,
        acc: 0.85 + rnd(i + 70) * 0.3,
      });
    }
    return out;
  }, []);
  plateMat.uniforms.shift.value.set(drift[0], drift[1]);
  plateMat.uniforms.zoom.value = zoom;
  // screen px -> three (ortho camera, origin at the centre, y up), with the same push the plate gets
  const S = (x: number, y: number): [number, number] => [((x / w - 0.5) * zoom) * w, -((y / h - 0.5) * zoom) * h];
  // progress along the channel: starts slow at the head scarp and accelerates downhill
  const prog = (r: Rock, u: number) => 0.012 + 0.05 * u * r.acc + 0.042 * u * u * r.acc;
  const items: React.ReactNode[] = [];
  const dust: { x: number; y: number; z: number; s: number; a: number; tex: number; rot: number }[] = [];
  rocks.forEach((r, i) => {
    const u = t - r.rel;
    if (u < 0) return;
    const s = prog(r, u);
    if (s > 1.2) return;
    const p = at(s);
    const v = (0.05 + 0.084 * u) * r.acc; // ds/dt
    const lane = r.lane * (0.55 + 0.45 * Math.min(1, s * 1.6));
    const bounce = Math.abs(Math.sin(u * (2.4 + rnd(i) * 2.2) + i)) * (0.35 + r.size * 0.25) * Math.min(1, v * 8);
    const px = p.x + p.nx * lane * p.hw;
    const py = p.y + p.ny * lane * p.hw - bounce * p.k;
    const sz = r.size * p.k * SCALE;
    const [X, Y] = S(px, py);
    const roll = (u * v * 260 * r.spin) / Math.max(0.4, r.size);
    // depth: further down the slope is nearer the camera
    const z = 10 + s * 40 + (r.big ? 1 : 0);
    items.push(
      <group key={'r' + i}>
        <mesh position={[X + sz * 0.35, Y - sz * 0.45, z - 0.5]} scale={[sz * 1.2, sz * 0.5, 1]}>
          <circleGeometry args={[0.5, 24]} />
          <meshBasicMaterial color="#1b130c" transparent opacity={0.45 * Math.max(0, 1 - bounce * 0.5)} depthWrite={false} />
        </mesh>
        <mesh geometry={geos[r.geo]} position={[X, Y, z]} scale={[sz, sz, sz]} rotation={[roll + i, roll * 0.6 + i * 0.3, roll * 0.25]}>
          <meshStandardMaterial map={tex.rock} roughness={0.92} metalness={0} color={['#b9b2a8', '#a39a8e', '#c2b8aa', '#8f877c'][i % 4]} />
        </mesh>
      </group>,
    );
    // dust shed while it moves fast: puffs born every 0.12 s along its path
    if (!r.big && i % 2) return;
    const step = 0.12;
    for (let e = Math.max(0, Math.floor((u - 3.2) / step)); e * step <= u; e++) {
      const ue = e * step, age = u - ue;
      const se = prog(r, ue);
      const ve = (0.05 + 0.084 * ue) * r.acc;
      if (ve < 0.12 || se > 1.15) continue;
      const pe = at(se);
      const le = r.lane * (0.55 + 0.45 * Math.min(1, se * 1.6));
      const grow = 1 - Math.exp(-age * 1.6);
      const size = (r.size * SCALE * 1.4 + 4 + grow * 12 + age * 4) * pe.k * (r.big ? 1 : 0.6);
      const a = Math.min(1, age * 5) * Math.max(0, 1 - age / 3.2) * Math.min(1, (ve - 0.12) * 6) * (r.big ? 0.5 : 0.32);
      const seed = i * 31 + e;
      dust.push({
        x: pe.x + pe.nx * le * pe.hw + age * (6 + rnd(seed) * 6) * pe.k + Math.sin(age * 1.3 + seed) * 2 * pe.k,
        y: pe.y + pe.ny * le * pe.hw - age * (5 + rnd(seed + 5) * 6) * pe.k - size * 0.25,
        z: 10 + se * 40 + 0.5 + age * 0.2,
        s: size,
        a,
        tex: seed % 6,
        rot: rnd(seed + 9) * 6.28 + age * 0.15,
      });
    }
  });
  return (
    <>
      <ambientLight intensity={0.55} color="#c9d6e6" />
      <directionalLight position={[data.sun[0] * 1000, -data.sun[1] * 1000, 600]} intensity={2.6} color="#fff1dc" />
      <mesh position={[0, 0, 0]} material={plateMat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {items}
      {dust.map((d, k) => {
        const [X, Y] = S(d.x, d.y);
        return (
          <mesh key={'d' + k} position={[X, Y, d.z]} rotation={[0, 0, d.rot]} scale={[d.s * zoom, d.s * zoom, 1]} renderOrder={Math.round(d.z * 10)}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={puffs[d.tex]} transparent opacity={d.a} depthWrite={false} color="#b39a7c" />
          </mesh>
        );
      })}
    </>
  );
};

const useTextures = (urls: Record<string, string>) => {
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('landslide textures'));
  useEffect(() => {
    const L = new THREE.TextureLoader();
    Promise.all(Object.entries(urls).map(([k, u]) => L.loadAsync(staticFile(u)).then((t) => [k, t] as const))).then((all) => {
      const o: Record<string, THREE.Texture> = {};
      for (const [k, t] of all) {
        if (k !== 'depth') t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        if (k === 'rock') t.wrapS = t.wrapT = THREE.RepeatWrapping;
        o[k] = t;
      }
      setTex(o);
      continueRender(handle);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
};

export const Landslide25D: React.FC<{ dataUrl: string; plate: string; depth: string }> = ({ dataUrl, plate, depth }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const [data, setData] = useState<SlidePath | null>(null);
  const [h1] = useState(() => delayRender('slide path'));
  useEffect(() => {
    fetch(staticFile(dataUrl)).then((r) => r.json()).then((d) => { setData(d); continueRender(h1); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tex = useTextures({ plate, depth, rock: 'sikkim/tests/rock_diff.jpg' });
  // a slow drone drift: push in, slide right a touch, a breath of handheld
  const zoom = 1.02 + t * 0.012;
  const drift: [number, number] = [-0.004 - t * 0.0035 + Math.sin(t * 1.7) * 0.0006, 0.002 + t * 0.001 + Math.cos(t * 2.3) * 0.0005];
  const shake = Math.max(0, Math.min(1, (t - 0.6) * 2)) * 1.2;
  return (
    <AbsoluteFill style={{ background: '#0b0d0e', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 23) * shake}px, ${Math.cos(t * 29) * shake * 0.7}px)` }}>
        {data && tex && (
          <ThreeCanvas
            width={width}
            height={height}
            orthographic
            camera={{ position: [0, 0, 1000], near: 0.1, far: 4000, zoom: 1 }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          >
            <Scene t={t} data={data} tex={tex} drift={drift} zoom={zoom} />
          </ThreeCanvas>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(5,8,10,0.35) 100%)' }} />
    </AbsoluteFill>
  );
};
