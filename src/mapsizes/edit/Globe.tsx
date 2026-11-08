import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { clamp01, easeOut, inOut, linear, ramp } from '../../darien/anim';
import { C, CUT, LOOPF, WORLD_MPP } from './cam';

// The globe that is cut into six gores, laid flat and stretched into the Mercator map (line 12), drawn with three.js in
// screen pixels (an orthographic camera: 1 unit = 1 px, origin at the screen centre, y up). Texture: the EOX Sentinel-2
// cloudless equirectangular (CC BY 4.0). Every vertex knows its lon/lat and is placed by blending three projections:
// the globe, the interrupted sinusoidal (six flat gores) and Mercator, so the transitions are true morphs.
const D2R = Math.PI / 180;
const GORES = 6, NU = 16, NV = 68, LAT = 85;
const MERC_S = 6378137 / WORLD_MPP; // px per radian of the final Mercator map, so it lands exactly on the world plate
const SIN_S = 158;

export const GT = () => ({
  in: C.dikkat - 0.2, cut0: C.chhe - 0.6, cut1: C.kaato + 0.15, flat0: C.bichhao - 0.45, flat1: C.bichhao + 0.85,
  str0: C.khali - 0.7, str1: C.kheencho + 0.25, out: CUT(),
});
/** The globe's front meridian: a slow spin that settles on 0° as the cuts are made. */
const frontLon = (t: number) => -110 + 110 * easeOut(ramp(t, GT().in, GT().cut0 + 0.4, linear));
const goreCentre = (k: number) => -150 + 60 * k;

type Pose = { rg: number; lf: number; tiltX: number; flat: number[]; str: number };
const poseAt = (t: number): Pose => {
  const g = GT();
  const rg = 330 + 70 * ramp(t, g.in, g.cut1, inOut) + 6 * Math.sin(t * LOOPF(23));
  // the front gores peel first, the back ones last
  const order = [3, 2, 4, 1, 5, 0];
  const flat = Array.from({ length: GORES }, (_, k) => { const i = order.indexOf(k); return inOut(ramp(t, g.flat0 + i * 0.12, g.flat1 - (5 - i) * 0.05, linear)); });
  const str = inOut(ramp(t, g.str0, g.str1, linear));
  const tiltX = -0.55 * Math.sin(Math.PI * ramp(t, g.flat0, g.str1 - 0.2, linear));
  return { rg, lf: frontLon(t), tiltX, flat, str };
};

/** Screen-pixel position (y up) of lon/lat on gore k, and a shading factor. */
const place = (lon: number, lat: number, k: number, ps: Pose): [number, number, number, number] => {
  const la = lat * D2R;
  // the globe (tilted 18° towards the camera so the north shows)
  const dl = (lon - ps.lf) * D2R, b = 0.32;
  let gx = ps.rg * Math.cos(la) * Math.sin(dl), gy = ps.rg * Math.sin(la), gz = ps.rg * Math.cos(la) * Math.cos(dl);
  [gy, gz] = [gy * Math.cos(b) - gz * Math.sin(b), gy * Math.sin(b) + gz * Math.cos(b)];
  const L = [-0.45, 0.5, 0.74];
  const shade = 0.32 + 0.78 * Math.max(0, (gx * L[0] + gy * L[1] + gz * L[2]) / ps.rg);
  // the flat gore (sinusoidal about its own centre) and the Mercator map
  const lc = goreCentre(k);
  const sx = SIN_S * (lc * D2R + (lon - lc) * D2R * Math.cos(la)), sy = SIN_S * la;
  const mx = MERC_S * lon * D2R, my = MERC_S * Math.log(Math.tan(Math.PI / 4 + la / 2));
  const fx = sx + (mx - sx) * ps.str, fy = sy + (my - sy) * ps.str;
  const f = ps.flat[k];
  // a gore lifts towards the camera as it peels, so it never cuts through the globe
  const lift = Math.sin(Math.PI * f) * 260;
  return [gx + (fx - gx) * f, gy + (fy - gy) * f, gz + (0 - gz) * f + lift, shade + (1 - shade) * f];
};

const buildGeometry = () => {
  const n = GORES * (NU + 1) * (NV + 1);
  const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3);
  const idx: number[] = [];
  const ll: [number, number, number][] = [];
  for (let k = 0; k < GORES; k++) {
    const base = k * (NU + 1) * (NV + 1);
    for (let j = 0; j <= NV; j++) {
      for (let i = 0; i <= NU; i++) {
        const lon = goreCentre(k) - 30 + (60 * i) / NU, lat = -LAT + (2 * LAT * j) / NV;
        const v = base + j * (NU + 1) + i;
        uv[v * 2] = (lon + 180) / 360;
        uv[v * 2 + 1] = (lat + 90) / 180;
        ll.push([lon, lat, k]);
        if (i < NU && j < NV) idx.push(v, v + 1, v + NU + 1, v + 1, v + NU + 2, v + NU + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  return { geo, ll };
};

const GoreMesh: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => {
  const { geo, ll } = useMemo(buildGeometry, []);
  const ps = poseAt(t);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute, col = geo.getAttribute('color') as THREE.BufferAttribute;
  ll.forEach(([lon, lat, k], v) => {
    const [x, y, z, s] = place(lon, lat, k, ps);
    pos.setXYZ(v, x, y, z);
    col.setXYZ(v, s, s, s);
  });
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeBoundingSphere();
  return (
    <group rotation={[ps.tiltX, 0.18 * Math.sin(Math.PI * ramp(t, GT().flat0, GT().str1, linear)), 0]}>
      <mesh geometry={geo}><meshBasicMaterial map={tex} vertexColors side={THREE.DoubleSide} toneMapped={false} /></mesh>
    </group>
  );
};

/** The six red cuts drawn down the globe, top to bottom (front side only), as an SVG over the canvas. */
const Cuts: React.FC<{ t: number }> = ({ t }) => {
  const g = GT();
  const p = ramp(t, g.cut0, g.cut1, linear);
  const o = 1 - ramp(t, g.flat0, g.flat0 + 0.35, linear);
  if (p <= 0 || o <= 0) return null;
  const ps = poseAt(t);
  const paths = [-180, -120, -60, 0, 60, 120].map((b, i) => {
    const pi = clamp01(p * 1.6 - i * 0.12);
    let d = '', pen = false;
    for (let s = 0; s <= 80 * pi; s++) {
      const lat = LAT - (2 * LAT * s) / 80;
      const [x, y, z] = place(b, lat, 0, { ...ps, flat: [0, 0, 0, 0, 0, 0] });
      if (z > -4) { d += `${pen ? 'L' : 'M'}${(540 + x).toFixed(1)},${(960 - y).toFixed(1)}`; pen = true; } else pen = false;
    }
    return d;
  });
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <defs><filter id="cutglow"><feGaussianBlur stdDeviation="7" /></filter></defs>
      {paths.map((d, i) => d && (
        <g key={i}>
          <path d={d} fill="none" stroke="#FF2E2E" strokeWidth={22} filter="url(#cutglow)" opacity={0.8} />
          <path d={d} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
          <path d={d} fill="none" stroke="#FF2E2E" strokeWidth={5} strokeLinecap="round" strokeDasharray="18 10" />
        </g>
      ))}
    </svg>
  );
};

/** Deep space behind the globe: a teal-to-navy glow and faint stars that twinkle a whole number of times per loop. */
export const SpaceBg: React.FC<{ t: number }> = ({ t }) => {
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => {
    const r = (s: number) => Math.abs((Math.sin(i * 127.1 + s * 311.7) * 43758.5453) % 1);
    return [r(1) * 1080, r(2) * 1920, 0.8 + r(3) * 2.2, r(4) * 6, 1 + Math.floor(r(5) * 5)];
  }), []);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, #0f4a52 0%, #0a2f3e 34%, #061a2e 64%, #030a16 100%)' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {stars.map(([x, y, r, ph, k], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.2 + 0.35 * (0.5 + 0.5 * Math.sin(t * LOOPF(10 * k) + ph))} />)}
      </svg>
    </div>
  );
};

export const GoreGlobe: React.FC<{ t: number }> = ({ t }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('ms globe texture'));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('mapsizes/maps/globe_eq.jpg'), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; setTex(x); }, undefined, () => continueRender(h));
  }, [h]);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
  }, [tex, h]);
  if (!tex) return null;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} orthographic camera={{ position: [0, 0, 2000], near: 1, far: 5000, zoom: 1 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <GoreMesh t={t} tex={tex} />
      </ThreeCanvas>
      <Cuts t={t} />
    </div>
  );
};
