import React from 'react';
import * as THREE from 'three';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, pop, ramp, window4 } from '../darien/anim';
import { C } from './cam';
import { Cam3, Terrain3D, VEXAG, lonlatToScene } from './Terrain3D';

const [EX, EZ] = lonlatToScene(86.925, 27.988);
const EY = 8.849 * VEXAG;
const MONT = "'Montserrat', sans-serif";
const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";

/** When the 3D fly-over is on screen (it cuts in through clouds at "पहली" and back out at "दूसरी"). */
export const FLY0 = () => C.pehli5 - 0.35;
export const FLY1 = () => C.doosri8 - 0.15;

type K = { t: number; pos: [number, number, number]; look: [number, number, number]; fov?: number };
const keys = (): K[] => [
  // dropping through the clouds onto the plateau, north of Everest
  { t: FLY0(), pos: [EX - 8, 70, EZ - 95], look: [EX, 4, EZ - 20], fov: 58 },
  { t: C.sabse5, pos: [EX - 20, 17, EZ - 78], look: [EX, 6, EZ - 10], fov: 52 },
  // gliding low over the plateau toward the Himalaya wall
  { t: C.ft14800 + 0.4, pos: [EX - 12, 11.5, EZ - 52], look: [EX + 4, 8, EZ], fov: 50 },
  // the wall, and Everest on its edge
  { t: C.everest5 + 0.6, pos: [EX - 26, 14, EZ - 24], look: [EX, EY - 1, EZ], fov: 46 },
  // tilt up into the sky: the airliner cruises far above
  { t: C.ft35000 + 0.3, pos: [EX - 34, 13, EZ + 6], look: [EX - 4, 22, EZ - 18], fov: 52 },
  { t: C.min15 + 0.6, pos: [EX - 36, 13.5, EZ + 12], look: [EX - 6, 21, EZ - 18], fov: 52 },
  // the dive: down toward the peaks, which are higher than the safe altitude
  { t: C.ft10000 + 0.4, pos: [EX - 30, 14, EZ + 22], look: [EX - 2, 8, EZ], fov: 50 },
  { t: FLY1(), pos: [EX - 22, 12.5, EZ + 28], look: [EX, 7.5, EZ], fov: 48 },
];

const camAt = (t: number): Cam3 => {
  const K = keys();
  if (t <= K[0].t) return K[0];
  for (let i = 1; i < K.length; i++) {
    if (t <= K[i].t) {
      const a = K[i - 1], b = K[i];
      const q = inOut(clamp01((t - a.t) / (b.t - a.t)));
      const l = (u: number[], v: number[]) => u.map((x, k) => lerp(x, v[k], q)) as [number, number, number];
      return { pos: l(a.pos, b.pos), look: l(a.look, b.look), fov: lerp(a.fov ?? 52, b.fov ?? 52, q) };
    }
  }
  return K[K.length - 1];
};

/** Screen position of a 3D point for this camera (for pins drawn in HTML). */
const toScreen3 = (cam: Cam3, p: [number, number, number]): [number, number, boolean] => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 52, 1080 / 1920, 0.1, 2000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960, v.z < 1];
};

// ---------------------------------------------------------------- the altitude ruler (cyan, like an altimeter strip)
export const FT_Y = (ft: number) => 1560 - (ft / 40000) * 1220;
const Ruler: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.ft14800 - 0.3, C.ft14800, FLY1() - 0.3, FLY1());
  if (a <= 0) return null;
  const mark = (ft: number, t0: number, color: string, label: string, sub?: string) => {
    const s = clamp01(pop(t, t0, 11, 230));
    if (t < t0) return null;
    return (
      <div style={{ position: 'absolute', left: 0, top: FT_Y(ft), transform: `translateY(-50%) scale(${s})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 120, height: 5, background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ marginLeft: 10, padding: '6px 16px', borderRadius: 10, background: color, color: '#06202a', fontFamily: MONT, fontWeight: 900, fontSize: 40, lineHeight: 1, whiteSpace: 'nowrap',
          boxShadow: '0 6px 14px rgba(0,0,0,0.45)' }}>{label}{sub && <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{sub}</div>}</div>
      </div>
    );
  };
  const ground = ramp(t, C.ft14800, C.ft14800 + 0.6, easeOut);
  return (
    <div style={{ position: 'absolute', left: 40, top: 0, width: 1000, height: 1920, opacity: a }}>
      {/* the scale */}
      <div style={{ position: 'absolute', left: 0, top: FT_Y(40000), width: 6, height: FT_Y(0) - FT_Y(40000), background: 'rgba(255,255,255,0.75)', borderRadius: 3 }} />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: FT_Y(i * 5000), width: i % 2 ? 18 : 30, height: 3, background: 'rgba(255,255,255,0.75)' }} />
      ))}
      {/* the ground under the plateau: everything below 14,800 ft is rock */}
      <div style={{ position: 'absolute', left: 6, top: FT_Y(14800 * ground), width: 26, height: FT_Y(0) - FT_Y(14800 * ground), background: 'linear-gradient(180deg,#b88a5a,#6b4a2c)', opacity: 0.9 }} />
      {mark(14800, C.ft14800, '#ffd27a', '14,800 ft', 'पठार की ज़मीन')}
      {mark(35000, C.ft35000, '#5FE3FF', '35,000 ft', 'Plane')}
      {mark(10000, C.ft10000, '#ff6b6b', '10,000 ft', 'सुरक्षित ऊँचाई')}
    </div>
  );
};

const EverestPin: React.FC<{ t: number; cam: Cam3 }> = ({ t, cam }) => {
  const a = window4(t, C.everest5 - 0.1, C.everest5 + 0.15, C.plane6 + 0.6, C.plane6 + 1.0);
  if (a <= 0) return null;
  const [x, y, vis] = toScreen3(cam, [EX, EY + 0.15, EZ]);
  if (!vis) return null;
  const s = clamp01(pop(t, C.everest5 - 0.1, 10, 220));
  const stem = 150;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#ff7a1a', border: '4px solid #fff', boxShadow: '0 0 16px #ff7a1a' }} />
      <div style={{ position: 'absolute', left: -2, top: -stem * s, width: 4, height: stem * s, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, top: -stem * s, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: '50% 100%', padding: '8px 22px 10px', borderRadius: 14,
        background: '#ff7a1a', textAlign: 'center', boxShadow: '0 8px 18px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 46, color: '#fff' }}>Everest</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 30, color: '#fff' }}>29,032 ft</div>
      </div>
    </div>
  );
};

/** The 3D section: terrain, camera, ruler and pin. Props (planes, masks) and alarms are drawn by the screen layer on top. */
export const Fly: React.FC<{ t: number }> = ({ t }) => {
  if (t < FLY0() - 0.05 || t > FLY1() + 0.4) return null;
  const cam = camAt(t);
  const shake = t > C.gir6 && t < C.min15 ? kick(t, C.gir6, 6, 28, 2.5) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Terrain3D cam={cam} width={1080} height={1920} haze={1} />
      <Ruler t={t} />
      <EverestPin t={t} cam={cam} />
    </div>
  );
};

export const flyFade = (t: number) => window4(t, FLY0() - 0.05, FLY0() + 0.35, FLY1() - 0.3, FLY1() + 0.3);
export { easeIn, SERIF };
