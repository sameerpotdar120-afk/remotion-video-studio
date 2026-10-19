import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import EGM from './egm96_2deg.json';
import { ramp } from './theme';

// c13_geoid ("इन सबको हज़ारों गुना बड़ा करके देखो, तो धरती एक ऊबड़-खाबड़ आलू जैसी लगती है"; the reference's 50.6–59.2 s):
// our own "potato": the EGM96 geoid (NGA, public domain; baked to a 2° grid in egm96_2deg.json) drawn as a sphere whose
// radius follows the geoid height, exaggerated `exag` times, coloured blue (low, −105 m south of India) through green
// to red (high, +85 m over New Guinea and the North Atlantic). It grows in from a plain sphere (`grow` frames), then
// tumbles slowly. 1080×1080, 60 fps, black background by default (transparent with `bg={null}`).
const G = EGM as { step: number; lat0: number; lon0: number; n: number[][] };
const sample = (lat: number, lon: number) => {
  const r = (G.lat0 - lat) / G.step, c = (((lon - G.lon0) % 360) + 360) % 360 / G.step;
  const r0 = Math.max(0, Math.min(G.n.length - 2, Math.floor(r))), c0 = Math.floor(c) % G.n[0].length, c1 = (c0 + 1) % G.n[0].length;
  const fr = r - r0, fc = c - Math.floor(c);
  const a = G.n[r0][c0] * (1 - fc) + G.n[r0][c1] * fc, b = G.n[r0 + 1][c0] * (1 - fc) + G.n[r0 + 1][c1] * fc;
  return a * (1 - fr) + b * fr;
};
const STOPS: [number, string][] = [[-105, '#1B2FD6'], [-60, '#1E90FF'], [-25, '#35D6E8'], [0, '#7BE36A'], [25, '#F2E33A'], [55, '#FF8A1E'], [85, '#E8141B']];
const ramped = (n: number) => {
  for (let i = 1; i < STOPS.length; i++) {
    if (n <= STOPS[i][0]) {
      const t = (n - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]);
      return new THREE.Color(STOPS[i - 1][1]).lerp(new THREE.Color(STOPS[i][1]), Math.max(0, t));
    }
  }
  return new THREE.Color(STOPS[STOPS.length - 1][1]);
};

const Potato: React.FC<{ k: number; rotY: number; rotX: number }> = ({ k, rotY, rotX }) => {
  const { geo, base, n } = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 360, 180);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const nn = new Float32Array(pos.count);
    const cols = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const lat = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
      let phi = Math.atan2(z, -x);
      if (phi < 0) phi += Math.PI * 2;
      const lon = (phi * 180) / Math.PI - 180;
      nn[i] = sample(lat, lon);
      const c = ramped(nn[i]);
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return { geo: g, base: Float32Array.from(pos.array as Float32Array), n: nn };
  }, []);
  // exaggeration: 100 m of geoid height → 0.11 of the radius at k = 1 (about 7,000×)
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const s = 1 + (n[i] / 100) * 0.11 * k;
    pos.setXYZ(i, base[i * 3] * s, base[i * 3 + 1] * s, base[i * 3 + 2] * s);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} rotation={[rotX, rotY, 0]}>
      <meshStandardMaterial vertexColors roughness={0.55} metalness={0.05} />
    </mesh>
  );
};

export const C13Geoid: React.FC<{ grow?: number; bg?: string | null }> = ({ grow = 50, bg = '#000' }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, grow);
  return (
    <AbsoluteFill style={{ background: bg ?? undefined }}>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: [0, 0, 4.6] }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[-3, 2, 4]} intensity={2.2} />
        <directionalLight position={[3, -1, -2]} intensity={0.5} color="#88aaff" />
        {/* start over the Indian Ocean low (lon 78E faces the camera), then tumble */}
        <Potato k={k} rotY={-((78 + 90) * Math.PI) / 180 + f * 0.012} rotX={0.25 + Math.sin(f / 90) * 0.25} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
