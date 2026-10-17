import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { easeIn, inOut, interpolateKeys, ramp, window4 } from './anim';
import { C, GEO, P, SC } from './cam';
import { COL } from './regions';

/** A point on the unit globe (three.js SphereGeometry UVs: u = 0 at 180°W). */
export const onSphere = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const b = (lat * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(phi) * Math.cos(b) * r);
};

const FOV = 40;
type GState = { lon: number; lat: number; dist: number };

/** Where the globe camera is: Europe → Asia for the nuclear powers, down to the South Pacific, then the dive into Fiji. */
export const globeAt = (t: number): GState => {
  const k = (pairs: [number, number][]) => interpolateKeys(pairs, t);
  const spin = 1.6 * Math.max(0, Math.min(t, SC.dive) - SC.globeIn);
  const lon = k([[SC.globeIn, 4], [C.nuke2, 22], [C.india2 + 0.3, 66], [C.uttari2 + 0.4, 58], [C.matlab2, 52], [C.bachna3, 62], [C.dakshin3 + 0.5, 158], [SC.dive, 160]]);
  const lat = k([[SC.globeIn, 44], [C.nuke2, 40], [C.india2 + 0.3, 30], [C.uttari2 + 0.4, 16], [C.matlab2, 30], [C.bachna3, 26], [C.dakshin3 + 0.5, -24], [SC.dive, -20]]);
  const dist = k([[SC.globeIn, 5.6], [C.nuke2, 6.6], [C.uttari2 + 0.4, 7.2], [C.matlab2, 6.8], [C.bachna3, 7.0], [C.dakshin3 + 0.5, 6.4], [SC.dive, 6.2]]);
  // the dive: accelerate into Fiji
  const d = ramp(t, SC.dive, SC.flat, easeIn);
  const fl = GEO.places_deg.fiji;
  const spinD = spin * (1 - d);
  return { lon: lon + spinD + (fl[0] - (lon + spinD)) * d, lat: lat + (fl[1] - lat) * d, dist: dist + (1.08 - dist) * d };
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
  return { x: (v.x + 1) * 540, y: (1 - v.y) * 960, front };
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
const paint = (names: string[], color: string, w = 2048, glow = 0) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = w / 2;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = w / 1024;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
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
/** The northern half, tinted red and fading toward the equator. */
const northTint = () => {
  const cv = document.createElement('canvas');
  cv.width = 8;
  cv.height = 512;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, 'rgba(255,40,50,0.55)');
  g.addColorStop(0.47, 'rgba(255,40,50,0.32)');
  g.addColorStop(0.5, 'rgba(255,40,50,0)');
  g.addColorStop(1, 'rgba(255,40,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const NUKES = ['United States of America', 'Russia', 'China', 'France', 'United Kingdom', 'India', 'Pakistan', 'Israel', 'North Korea'];
/** When each nuclear power lights up (India gets its own beat on "हमारा India भी"). */
export const nukeStart = (n: string, i: number) => (n === 'India' ? C.india2 - 0.05 : C.nuke2 - 0.1 + i * 0.11);

export const Globe: React.FC<{ t: number }> = ({ t }) => {
  const g = globeAt(t);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('ww3 globe texture'));
  const over = useMemo(() => ({
    nukes: NUKES.map((n) => paint([n], COL.war, 2048, 0)),
    aus: paint(['Australia'], COL.aus),
    north: northTint(),
  }), []);
  const equator = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 256; k++) pts.push(onSphere(-180 + (k / 256) * 360 + 60, 0, 1.004));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 512, 0.006, 6, false);
  }, []);
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile('ww3safe/maps/globe_eq.jpg'), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; setTex(x); }, undefined, () => continueRender(h));
  }, [h]);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
  }, [tex, h]);
  if (!tex) return null;
  const out = 1 - ramp(t, C.bachna3, C.bachna3 + 0.8, inOut);
  const eq = ramp(t, C.uttari2 - 0.1, C.uttari2 + 0.9, inOut);
  equator.setDrawRange(0, Math.floor((equator.index ? equator.index.count : 0) * eq));
  const north = window4(t, C.uttari2, C.uttari2 + 0.5, C.bachna3, C.bachna3 + 0.7);
  const aus = window4(t, C.dakshin3 - 0.2, C.dakshin3 + 0.4, SC.flat, SC.flat + 0.1);
  const light = onSphere(g.lon + 55, g.lat + 25, 6);
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, near: 0.01, far: 100, position: onSphere(g.lon, g.lat, g.dist).toArray() as [number, number, number] }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <Rig g={g} />
      <ambientLight intensity={0.42} />
      <directionalLight position={light.toArray() as [number, number, number]} intensity={2.3} />
      <mesh>
        <sphereGeometry args={[1, 160, 120]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} />
      </mesh>
      {over.nukes.map((x, i) => {
        const s = nukeStart(NUKES[i], i);
        const a = ramp(t, s, s + 0.25) * out;
        const pulse = 0.78 + 0.22 * Math.sin((t - s) * 7);
        return a > 0.01 ? (
          <mesh key={i}>
            <sphereGeometry args={[1.0025, 128, 96]} />
            <meshBasicMaterial map={x} transparent opacity={a * pulse} depthWrite={false} />
          </mesh>
        ) : null;
      })}
      {north > 0.01 && (
        <mesh>
          <sphereGeometry args={[1.004, 96, 72]} />
          <meshBasicMaterial map={over.north} transparent opacity={north} depthWrite={false} />
        </mesh>
      )}
      {aus > 0.01 && (
        <mesh>
          <sphereGeometry args={[1.0025, 128, 96]} />
          <meshBasicMaterial map={over.aus} transparent opacity={aus * 0.75} depthWrite={false} />
        </mesh>
      )}
      {eq > 0 && (
        <mesh geometry={equator}>
          <meshBasicMaterial color={COL.gold} transparent opacity={0.95 * (1 - ramp(t, C.bachna3 + 0.5, C.dakshin3, inOut))} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[1.035, 96, 64]} />
        <meshBasicMaterial color="#6fe0ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </ThreeCanvas>
  );
};
