import React from 'react';
import { staticFile } from 'remotion';
import * as THREE from 'three';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, pop, ramp, window4 } from './anim';
import { C } from './cam';
import { NUM, HEAD } from './fonts';
import { has } from './Rig';
import { Cam3, Terrain3D, VEX, VEXAG, lonlatTo, lonlatToScene } from './Terrain3D';

const [EX, EZ] = lonlatToScene(86.925, 27.988);
const EY = 8.849 * VEXAG;
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';

/** The wide Himalaya shot comes in on "दुनिया का सबसे ऊँचा पठार" and sweeps down the range toward Everest;
 *  the detailed fly-over takes over just after "4,500 मीटर" and runs until "मौसम". */
export const RANGE0 = () => C.duniya2 - 0.25;
export const FLY0 = () => C.n4500 + 1.4;
export const FLY1 = () => C.mausam7 - 0.2;

const [RX, RZ] = lonlatTo('range', 86.925, 27.988);
const RY = 8.849 * VEX.range;
const rangeKeys = (): K[] => [
  // high over the Indian plains, looking north: the whole snow-capped arc with the plateau behind it
  { t: RANGE0(), pos: [RX - 300, 330, RZ + 245], look: [RX - 80, 0, RZ - 430], fov: 52 },
  { t: C.zameen3, pos: [RX - 380, 175, RZ + 235], look: [RX - 80, 30, RZ - 220], fov: 48 },
  // gliding along the range, lower, toward Everest
  { t: C.n4500 + 0.8, pos: [RX - 150, 95, RZ + 190], look: [RX, RY * 0.55, RZ - 40], fov: 46 },
  { t: FLY0() + 0.5, pos: [RX - 70, 62, RZ + 110], look: [RX, RY * 0.7, RZ], fov: 44 },
];
const rangeCamAt = (t: number): Cam3 => keyed(rangeKeys(), t);

type K = { t: number; pos: [number, number, number]; look: [number, number, number]; fov?: number };
const keys = (): K[] => [
  // handed over from the wide shot: low over the plateau north of Everest, gliding toward the wall
  { t: FLY0(), pos: [EX - 20, 17, EZ - 78], look: [EX, 6, EZ - 10], fov: 52 },
  { t: C.n4500 + 3.4, pos: [EX - 12, 11.5, EZ - 52], look: [EX + 4, 8, EZ], fov: 50 },
  // Everest on the plateau's edge
  { t: C.everest3 + 0.6, pos: [EX - 26, 14, EZ - 24], look: [EX, EY - 1, EZ], fov: 46 },
  // tilt up into the sky: the airliner cruises far above
  { t: C.n10000 + 0.3, pos: [EX - 34, 13, EZ + 6], look: [EX - 4, 22, EZ - 18], fov: 52 },
  { t: C.minute4 + 0.6, pos: [EX - 36, 13.5, EZ + 12], look: [EX - 6, 21, EZ - 18], fov: 52 },
  // the dive: down toward peaks higher than the safe altitude
  { t: C.n3000 + 0.4, pos: [EX - 30, 14, EZ + 22], look: [EX - 2, 8, EZ], fov: 50 },
  { t: C.jagah6 + 0.4, pos: [EX - 22, 11.5, EZ + 28], look: [EX, 7, EZ], fov: 48 },
  { t: FLY1() + 0.4, pos: [EX - 20, 13, EZ + 30], look: [EX, 8, EZ], fov: 50 },
];

const camAt = (t: number): Cam3 => keyed(keys(), t);
function keyed(K: K[], t: number): Cam3 {
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
}

const toScreen3 = (cam: Cam3, p: [number, number, number]): [number, number, boolean] => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 52, 1080 / 1920, 0.1, 2000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960, v.z < 1];
};

// ---------------------------------------------------------------- the altitude ruler, in metres (the reference's cyan altimeter strip)
export const M_Y = (m: number) => 1560 - (m / 12000) * 1220;
/** The ground line climbs to 4,500 M on "ज़मीन"; on "पर Tibet में?" it is shown above the 3,000 M safe line. */
const groundM = (t: number) => 4500 * ramp(t, C.n4500 - 0.2, C.n4500 + 0.6, easeOut);
const Ruler: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.n4500 - 0.4, C.n4500 - 0.1, FLY1() - 0.3, FLY1());
  if (a <= 0) return null;
  const mark = (m: number, t0: number, t1: number, color: string, label: string, sub?: string) => {
    if (t < t0 || t > t1 + 0.3) return null;
    const s = clamp01(pop(t, t0, 11, 230)) * (1 - ramp(t, t1, t1 + 0.3));
    return (
      <div style={{ position: 'absolute', left: 0, top: M_Y(m), transform: `translateY(-50%) scale(${s})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 120, height: 5, background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ marginLeft: 10, padding: '6px 16px', borderRadius: 10, background: color, color: '#06202a', fontFamily: NUM, fontSize: 44, lineHeight: 1, whiteSpace: 'nowrap', boxShadow: '0 6px 14px rgba(0,0,0,0.45)' }}>
          {label}{sub && <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 24, marginTop: 4 }}>{sub}</div>}
        </div>
      </div>
    );
  };
  const g = groundM(t);
  return (
    <div style={{ position: 'absolute', left: 40, top: 0, width: 1000, height: 1920, opacity: a }}>
      <div style={{ position: 'absolute', left: 0, top: M_Y(12000), width: 6, height: M_Y(0) - M_Y(12000), background: 'rgba(255,255,255,0.75)', borderRadius: 3 }} />
      {Array.from({ length: 13 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: M_Y(i * 1000), width: i % 2 ? 18 : 30, height: 3, background: 'rgba(255,255,255,0.75)' }} />
      ))}
      {/* the rock under the plateau */}
      <div style={{ position: 'absolute', left: 6, top: M_Y(g), width: 26, height: M_Y(0) - M_Y(g), background: 'linear-gradient(180deg,#b88a5a,#6b4a2c)', opacity: 0.92 }} />
      {mark(4500, C.n4500, FLY1(), '#ffd27a', '4,500 M', 'पठार की ज़मीन')}
      {mark(10000, C.n10000, C.par6, '#5FE3FF', '10,000 M', 'Plane')}
      {mark(3000, C.n3000, FLY1(), '#4DFF88', '3,000 M', 'सुरक्षित ऊँचाई')}
    </div>
  );
};

const EverestPin: React.FC<{ t: number; cam: Cam3 }> = ({ t, cam }) => {
  const a = window4(t, C.everest3 - 0.1, C.everest3 + 0.15, C.socho4 + 0.6, C.socho4 + 1.0);
  if (a <= 0) return null;
  const [x, y, vis] = toScreen3(cam, [EX, EY + 0.15, EZ]);
  if (!vis) return null;
  const s = clamp01(pop(t, C.everest3 - 0.1, 10, 220));
  const stem = 150;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#ff7a1a', border: '4px solid #fff', boxShadow: '0 0 16px #ff7a1a' }} />
      <div style={{ position: 'absolute', left: -2, top: -stem * s, width: 4, height: stem * s, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, top: -stem * s, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: '50% 100%', padding: '8px 22px 10px', borderRadius: 14,
        background: '#ff7a1a', textAlign: 'center', boxShadow: '0 8px 18px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: NUM, fontSize: 52, color: '#fff', letterSpacing: 1 }}>EVEREST</div>
        <div style={{ fontFamily: NUM, fontSize: 34, color: '#fff' }}>8,849 M</div>
      </div>
    </div>
  );
};

/** The airliner (UE5 side view): cruises at 10,000 M, the alarm hits, then it dives toward 3,000 M — below the plateau's ground. */
const Airliner: React.FC<{ t: number }> = ({ t }) => {
  if (!has('t2/plane_side')) return null;
  const a = window4(t, C.socho4 - 0.1, C.socho4 + 0.3, FLY1() - 0.3, FLY1());
  if (a <= 0) return null;
  const inX = lerp(-500, 560, ramp(t, C.socho4 - 0.1, C.n10000 + 0.4, easeOut));
  const dive = ramp(t, C.pilot5 - 0.1, C.n3000 + 0.6, inOut);
  const y = lerp(M_Y(10000), M_Y(3000), dive);
  const x = inX + lerp(0, 120, dive);
  const rot = Math.sin(dive * Math.PI) * 16 + dive * 4;
  const alarm = window4(t, C.achanak4 - 0.05, C.achanak4 + 0.1, C.pilot5 + 0.4, C.pilot5 + 0.8);
  const shake = t > C.achanak4 && t < C.pilot5 + 0.6 ? kick(t, C.achanak4, 14, 30, 1.6) + Math.sin(t * 60) * 3 * alarm : 0;
  const w = 560, h = (w * 562) / 1800;
  return (
    <div style={{ position: 'absolute', left: x - w / 2 + shake, top: y - h / 2 + Math.sin(t * 1.7) * 6, width: w, height: h, opacity: a, transform: `rotate(${rot}deg)`,
      filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.4))' }}>
      <img src={staticFile('tibet2/img/t2/plane_side.png')} style={{ width: w, height: h }} />
      {alarm > 0 && (
        <div style={{ position: 'absolute', left: w * 0.5 - 70, top: -40, width: 140, height: 140, opacity: alarm * (0.6 + 0.4 * Math.abs(Math.sin(t * 9))),
          filter: 'drop-shadow(0 0 22px #ff2b2b)' }}>
          <svg viewBox="0 0 100 90" width={140} height={126}><path d="M50 4 L96 86 H4 Z" fill="#ff2b2b" stroke="#fff" strokeWidth={6} strokeLinejoin="round" /><rect x={45} y={30} width={10} height={30} rx={3} fill="#fff" /><circle cx={50} cy={72} r={6} fill="#fff" /></svg>
        </div>
      )}
    </div>
  );
};

/** "पर Tibet में?": the 4,500 M ground line slams above the 3,000 M safe line, and a red ✗ lands on the safe line. */
const NoRoom: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.par6 - 0.1, C.par6 + 0.1, FLY1() - 0.3, FLY1());
  if (a <= 0) return null;
  const xA = ramp(t, C.jagah6 - 0.1, C.jagah6 + 0.2, easeOut);
  const band = ramp(t, C.n4500b - 0.2, C.n4500b + 0.4, easeOut);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a, pointerEvents: 'none' }}>
      {/* everything below the plateau's ground is rock: shade it, so the 3,000 M line is visibly underground */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: M_Y(4500), bottom: 0, background: 'linear-gradient(180deg, rgba(120,70,35,0.55), rgba(60,35,18,0.75))', opacity: band,
        borderTop: '6px solid #ffd27a', boxShadow: '0 -6px 24px rgba(255,210,122,0.6)' }} />
      {xA > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={`M440 ${M_Y(3000) - 90} L640 ${M_Y(3000) + 90} M640 ${M_Y(3000) - 90} L440 ${M_Y(3000) + 90}`} stroke="#ff2b2b" strokeWidth={34} strokeLinecap="round" pathLength={1}
            strokeDasharray={`${xA} 1`} style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 18px #ff2b2b)' }} />
        </svg>
      )}
    </div>
  );
};

/** Inside the cabin: the masks drop and swing, the red emergency light pulses, and a short countdown runs. */
export const cabinAt = (t: number) => window4(t, C.oxygen4 - 0.25, C.oxygen4, C.pilot5 - 0.25, C.pilot5);
export const Cabin: React.FC<{ t: number }> = ({ t }) => {
  const a = cabinAt(t);
  if (a <= 0) return null;
  const push = 1.04 + 0.06 * ramp(t, C.oxygen4 - 0.25, C.pilot5, inOut);
  const red = 0.25 + 0.2 * Math.abs(Math.sin(t * 5));
  const masks = [[300, 0], [560, 0.12], [800, 0.24]] as const;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a, overflow: 'hidden', background: '#000' }}>
      <img src={staticFile('tibet2/img/t2/cabin.jpg')} style={{ position: 'absolute', left: '50%', top: '50%', height: 1920, transform: `translate(-50%,-50%) scale(${push})`, filter: 'saturate(1.05) contrast(1.08)' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#ff1a1a', opacity: red, mixBlendMode: 'soft-light' }} />
      {has('t2/mask') && masks.map(([x, d], i) => {
        const t0 = C.oxygen4 + 0.15 + d;
        const drop = ramp(t, t0, t0 + 0.35, easeIn);
        const swing = t > t0 + 0.35 ? Math.sin((t - t0) * 6 + i) * 14 * Math.exp(-(t - t0 - 0.35) * 0.7) : 0;
        const h = 520;
        return (
          <div key={i} style={{ position: 'absolute', left: x - (h * 626) / 1800 / 2, top: lerp(-h, 300 + i * 30, drop), width: (h * 626) / 1800, height: h, transformOrigin: '50% 0%',
            transform: `rotate(${swing}deg)`, filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.55))' }}>
            <img src={staticFile('tibet2/img/t2/mask.png')} style={{ width: '100%', height: '100%' }} />
          </div>
        );
      })}
    </div>
  );
};

/** The 3D section: terrain, camera, ruler, pin, the airliner and the "no room" beat. */
export const Fly: React.FC<{ t: number; w?: number; h?: number }> = ({ t }) => {
  if (t < RANGE0() - 0.05 || t > FLY1() + 0.4) return null;
  const cam = camAt(t);
  const sh = t > C.achanak4 && t < C.pilot5 ? kick(t, C.achanak4, 7, 28, 2.5) : 0;
  const rangeA = 1 - ramp(t, FLY0(), FLY0() + 0.5, inOut);
  const himaOn = t > FLY0() - 0.05;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sh}px, ${sh * 0.6}px)` }}>
      {himaOn && <Terrain3D cam={cam} width={1080} height={1920} haze={1} />}
      {rangeA > 0.001 && <div style={{ position: 'absolute', inset: 0, opacity: rangeA }}><Terrain3D set="range" cam={rangeCamAt(t)} width={1080} height={1920} haze={1} /></div>}
      <NoRoom t={t} />
      <Ruler t={t} />
      <EverestPin t={t} cam={cam} />
      <Airliner t={t} />
      {/* cool high-altitude air: a slight blue lift and soft top haze */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(140,190,255,0.18), rgba(0,0,0,0) 45%)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
    </div>
  );
};

export const flyFade = (t: number) => window4(t, RANGE0() - 0.05, RANGE0() + 0.35, FLY1() - 0.3, FLY1() + 0.3);
export { easeIn, SHADOW };
