import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { easeIn, easeOut, inOut, interpolateKeys, ramp } from './anim';
import { C, GEO, P, SC } from './cam';
import { bulge } from '../motion/C10SpinArrows';

/** A point on the unit globe (three.js SphereGeometry UVs: u = 0 at 180°W). */
export const onSphere = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const b = (lat * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(phi) * Math.cos(b) * r);
};

const FOV = 36;
export type GState = { lon: number; lat: number; dist: number; dx: number };

/** Where the globe camera is, keyed to the voiceover. dx shifts the globe sideways on screen (the flat-earth shove). */
export const globeAt = (t: number): GState => {
  const k = (pairs: [number, number][]) => interpolateKeys(pairs, t);
  const g1 = SC.globe1[0];
  if (t < SC.globe2[0]) {
    // in from the Nepal/China map, out to the whole globe, a spin through "गोल है ही नहीं", then Africa for the bulge,
    // the Indian Ocean side for the radius lines, and down onto the equator over East Africa for the dive
    const lon = k([[g1, 86], [C.space3, 84], [C.galat4, 80], [C.gol4, 40], [C.chapti4, -40], [C.ball5, 18], [C.dhuri6, 18], [C.equator6, 140], [C.dab6, 300],
      [C.pahad7, 380], [C.natija8, 460], [C.n21_8 + 1, 472], [C.dhoond9, 396], [SC.globe1[1], 396]]);
    const lat = k([[g1, 29], [C.space3, 26], [C.galat4, 22], [C.ball5, 8], [C.dhuri6, 0], [C.natija8, 0], [C.dhoond9, 0], [SC.globe1[1], 0]]);
    const dist = k([[g1, 1.7], [C.space3 + 0.5, 4.6], [C.galat4, 5.0], [C.gol4, 6.6], [C.chapti4, 7.2], [C.ball5, 6.8], [C.dhuri6, 7.4], [C.natija8, 7.4],
      [C.natija8 + 0.8, 6.6], [C.dhoond9, 6.4], [SC.globe1[1], 1.25]]);
    const dx = k([[C.chapti4 - 0.05, 0], [C.chapti4 + 0.35, -900], [C.mazak5 + 0.1, -900], [C.mazak5 + 0.6, 0]]);
    // a slow breathing push-in
    const br = dist * (1 - 0.03 * Math.sin((t - g1) * 0.9));
    const dive = ramp(t, C.dhoond9 + 0.1, SC.globe1[1], easeIn);
    return { lon, lat, dist: br + (1.12 - br) * dive, dx };
  }
  // the two summits on opposite limbs, then round to South America for the answer
  const g2 = SC.globe2[0];
  const lon = k([[g2, -110], [g2 + 0.6, 4], [C.matlab11 - 0.2, 4], [C.nepal11, -64], [C.ecuador11, -72]]);
  const lat = k([[g2, 0], [g2 + 0.6, 0], [C.matlab11, 0], [C.ecuador11, -4]]);
  const dist = k([[g2, 1.3], [g2 + 0.6, 6.4], [C.matlab11, 6.6], [C.ecuador11, 3.6], [C.video12, 3.4]]);
  return { lon, lat, dist: dist * (1 - 0.025 * Math.sin((t - g2) * 0.8)), dx: 0 };
};

const camFor = (g: GState) => {
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.01, 100);
  cam.position.copy(onSphere(g.lon, g.lat, g.dist));
  cam.up.set(0, 1, 0);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  return cam;
};
/** Screen position of a lon/lat on the globe, and whether it faces the camera. */
export const globePoint = (g: GState, lon: number, lat: number, r = 1): { x: number; y: number; front: number } => {
  const cam = camFor(g);
  const p = onSphere(lon, lat, r);
  const camPos = onSphere(g.lon, g.lat, g.dist);
  const front = p.clone().normalize().dot(camPos.clone().sub(p).normalize());
  const v = p.clone().project(cam);
  return { x: (v.x + 1) * 540 + g.dx, y: (1 - v.y) * 960, front };
};
/** The globe's radius on screen, in px. */
export const globeRadius = (g: GState) => (Math.tan(Math.asin(1 / g.dist)) / Math.tan((FOV / 2) * (Math.PI / 180))) * 960;

const Rig: React.FC<{ g: GState }> = ({ g }) => {
  const { camera } = useThree();
  camera.position.copy(onSphere(g.lon, g.lat, g.dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  return null;
};

/** An equirectangular overlay texture with some countries painted in. */
const paint = (names: string[], color: string, w = 4096) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = w / 2;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = w / 1400;
  for (const n of names) {
    for (const ring of GEO.deg[n] ?? []) {
      ctx.beginPath();
      ring.forEach(([lo, la]: P, i: number) => {
        const x = ((lo + 180) / 360) * w, y = ((90 - la) / 180) * (w / 2);
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const GCOL = { nepal: '#2F6BFF', china: '#E1261C', ecuador: '#F59E0B' };

export const Globe: React.FC<{ t: number }> = ({ t }) => {
  const g = globeAt(t);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('cs globe texture'));
  const over = useMemo(() => ({ nepal: paint(['Nepal'], GCOL.nepal), china: paint(['China'], GCOL.china), ecuador: paint(['Ecuador'], GCOL.ecuador) }), []);
  // the dashed equator ring
  const equator = useMemo(() => {
    const segs: THREE.TubeGeometry[] = [];
    for (let k = 0; k < 90; k++) {
      const a = (k / 90) * 360 - 180, b = a + 2.4;
      segs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([onSphere(a, 0, 1.003), onSphere((a + b) / 2, 0, 1.003), onSphere(b, 0, 1.003)]), 6, 0.0045, 5, false));
    }
    return segs;
  }, []);
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('closestspace/maps/globe_eq.jpg'), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; setTex(x); }, undefined, () => continueRender(h));
  }, [h]);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
  }, [tex, h]);
  if (!tex) return null;
  // Nepal and China stay painted until the red X has done its work; Ecuador glows for the answer
  const nc = t < SC.globe2[0] ? 1 - ramp(t, C.galat4 + 1.0, C.gol4 + 0.4, inOut) : 0;
  const ec = t >= SC.globe2[0] ? ramp(t, C.nepal11, C.ecuador11 + 0.3, easeOut) : 0;
  const eq = t < SC.globe2[0] ? ramp(t, C.natija8 + 3.4, C.dhoond9, inOut) : 0;
  // the spin bulge (exaggerated, as in the reference): the arrows push from line 6, it stays squashed through line 7
  const bz = t < SC.globe1[1] ? bulge(Math.round((t - (C.dhuri6 - 0.2)) * 60), Math.round((C.equator6 - C.dhuri6 + 0.2) * 60), Math.round((C.poles6 - C.dhuri6 + 0.2) * 60)) : { sx: 1, sy: 1 };
  const relax = ramp(t, C.natija8 - 0.15, C.natija8 + 0.6, inOut);
  const sx = 1 + (bz.sx - 1) * (1 - relax), sy = 1 + (bz.sy - 1) * (1 - relax);
  const light = onSphere(g.lon + 50, g.lat + 25, 6);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${g.dx}px)` }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, near: 0.01, far: 100, position: onSphere(g.lon, g.lat, g.dist).toArray() as [number, number, number] }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <Rig g={g} />
        <ambientLight intensity={0.38} />
        <directionalLight position={light.toArray() as [number, number, number]} intensity={2.4} />
        <group scale={[sx, sy, sx]}>
          <mesh>
            <sphereGeometry args={[1, 192, 128]} />
            <meshStandardMaterial map={tex} roughness={1} metalness={0} />
          </mesh>
          {nc > 0.01 && (
            <>
              <mesh><sphereGeometry args={[1.0022, 160, 120]} /><meshBasicMaterial map={over.china} transparent opacity={0.85 * nc} depthWrite={false} /></mesh>
              <mesh><sphereGeometry args={[1.0026, 160, 120]} /><meshBasicMaterial map={over.nepal} transparent opacity={0.92 * nc} depthWrite={false} /></mesh>
            </>
          )}
          {ec > 0.01 && <mesh><sphereGeometry args={[1.0026, 160, 120]} /><meshBasicMaterial map={over.ecuador} transparent opacity={(0.8 + 0.15 * Math.sin(t * 5)) * ec} depthWrite={false} /></mesh>}
          {eq > 0.01 && equator.map((geo, i) => (
            <mesh key={i} geometry={geo}><meshBasicMaterial color="#ffffff" transparent opacity={0.95 * eq} /></mesh>
          ))}
          <mesh>
            <sphereGeometry args={[1.04, 96, 64]} />
            <meshBasicMaterial color="#6fe0ff" transparent opacity={0.13} side={THREE.BackSide} />
          </mesh>
        </group>
      </ThreeCanvas>
    </div>
  );
};

/** The space backdrop behind the globe: a teal-to-navy nebula with faint, twinkling stars (drawn in code). */
export const SpaceBg: React.FC<{ t: number }> = ({ t }) => {
  const stars = useMemo(() => Array.from({ length: 140 }, (_, i) => {
    const r = (s: number) => (Math.sin(i * 127.1 + s * 311.7) * 43758.5453) % 1;
    return [Math.abs(r(1)) * 1080, Math.abs(r(2)) * 1920, 0.8 + Math.abs(r(3)) * 2.2, Math.abs(r(4)) * 6];
  }), []);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 18%, #0f5a4a 0%, #0a3a3e 30%, #071d33 62%, #040b18 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 80%, rgba(40,90,160,0.35), rgba(0,0,0,0) 55%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {stars.map(([x, y, r, ph], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + ph))} />)}
      </svg>
    </div>
  );
};
