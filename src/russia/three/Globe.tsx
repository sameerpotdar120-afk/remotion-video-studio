import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import type { Geometry, MultiPolygon, Polygon } from 'geojson';
import { H, W } from '../../lib/constants';
import { ease, ramp } from '../../lib/easing';
import { terr } from '../map/RMap';

/**
 * Real 3D globe (Three.js): the baked world satellite texture (public/russia/maps/world_eq_sat.jpg) on a sphere,
 * a fresnel atmosphere, stars, and highlight layers — any territory painted onto a transparent overlay sphere
 * whose opacity / colour animate per frame (Russia "fills red in one elastic pop").
 * Camera keys: lon/lat the globe turns to face, distance (radii), all eased.
 */
export type GlobeKey = { at: number; lon: number; lat: number; dist: number; dur?: number };

const useTexture = (src: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(`globe ${src}`));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile(src), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
      continueRender(handle);
    });
  }, [src, handle]);
  return tex;
};

/** Paint territories into an equirectangular RGBA canvas texture (lon/lat → x/y is linear). */
const useOverlay = (ids: string[], color: string) =>
  useMemo(() => {
    const cw = 4096, ch = 2048;
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const g = c.getContext('2d')!;
    g.fillStyle = color;
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 3;
    for (const id of ids) {
      const geo = terr(id).geometry as Geometry;
      const polys = geo.type === 'Polygon' ? [(geo as Polygon).coordinates] : (geo as MultiPolygon).coordinates;
      // rings may run past 180° E (Chukotka): draw each polygon at its own longitudes and again one world-width left
      for (const shift of [0, -cw]) {
        for (const poly of polys) {
          g.beginPath();
          for (const ring of poly) {
            ring.forEach(([lon, lat], i) => {
              const x = ((lon + 180) / 360) * cw + shift, y = ((90 - lat) / 180) * ch;
              if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
            });
            g.closePath();
          }
          g.fill('evenodd');
          g.stroke();
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [ids.join(','), color]);

const ATMO_VS = `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 p = modelViewMatrix*vec4(position,1.0); vP = p.xyz; gl_Position = projectionMatrix*p; }`;
const ATMO_FS = `varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(normalize(-vP), vN)), 3.0); gl_FragColor = vec4(0.45,0.72,1.0,1.0)*f*1.3; }`;

const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 1800, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.sin(i * 12.9898) * 43758.5453, v = Math.sin(i * 78.233) * 12543.123;
      const th = (u - Math.floor(u)) * Math.PI * 2, ph = Math.acos(2 * (v - Math.floor(v)) - 1);
      p.set([60 * Math.sin(ph) * Math.cos(th), 60 * Math.sin(ph) * Math.sin(th), 60 * Math.cos(ph)], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={0.09} sizeAttenuation transparent opacity={0.8} /></points>;
};

export const Globe: React.FC<{
  keys: GlobeKey[];
  highlight?: { ids: string[]; color: string; start: number; exit?: number; pulse?: number[] };
  spinBias?: number; // extra slow rotation deg/s
}> = ({ keys, highlight, spinBias = 1.5 }) => {
  const frame = useCurrentFrame();
  const tex = useTexture('russia/maps/world_eq_sat.jpg');
  const over = useOverlay(highlight?.ids ?? [], highlight?.color ?? '#C8352B');
  // camera key interpolation
  let cur = { lon: keys[0].lon, lat: keys[0].lat, dist: keys[0].dist };
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (frame < k.at) break;
    const t = ramp(frame, k.at, k.dur ?? 90, ease.inOut);
    cur = { lon: cur.lon + (k.lon - cur.lon) * t, lat: cur.lat + (k.lat - cur.lat) * t, dist: cur.dist + (k.dist - cur.dist) * t };
    if (t < 1) break;
  }
  const lon = cur.lon + (frame / 60) * spinBias;
  // three's SphereGeometry: u=0 at lon −180 on −x; rotate so (lon, lat) faces +z (camera)
  const ry = -((lon + 90) * Math.PI) / 180;
  const rx = (cur.lat * Math.PI) / 180;
  let hOp = 0;
  if (highlight && frame >= highlight.start) {
    const t = frame - highlight.start;
    hOp = Math.min(0.72, t < 6 ? (t / 6) * 0.9 : 0.72 + 0.18 * Math.exp(-(t - 6) / 6));
    for (const p of highlight.pulse ?? []) { const u = frame - p; if (u >= 0 && u < 20) hOp = Math.min(0.95, hOp + 0.2 * Math.sin((u / 20) * Math.PI)); }
    if (highlight.exit !== undefined) hOp *= 1 - ramp(frame, highlight.exit, 12, ease.in);
  }
  const popS = highlight && frame >= highlight.start ? 1 + 0.012 * Math.sin(Math.min(1, (frame - highlight.start) / 12) * Math.PI) : 1;
  return (
    <ThreeCanvas width={W} height={H} camera={{ fov: 30, position: [0, 0, cur.dist], near: 0.05, far: 200 }} style={{ background: '#02040A' }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-4, 3, 5]} intensity={2.1} />
      <Stars />
      <group rotation={[rx, 0, 0]}>
        <group rotation={[0, ry, 0]}>
          {tex && (
            <mesh>
              <sphereGeometry args={[1, 192, 128]} />
              <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
            </mesh>
          )}
          {highlight && hOp > 0 && (
            <mesh scale={popS * 1.0025}>
              <sphereGeometry args={[1, 192, 128]} />
              <meshBasicMaterial map={over} transparent opacity={hOp} depthWrite={false} />
            </mesh>
          )}
        </group>
      </group>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 96, 64]} />
        <shaderMaterial vertexShader={ATMO_VS} fragmentShader={ATMO_FS} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent depthWrite={false} />
      </mesh>
    </ThreeCanvas>
  );
};
