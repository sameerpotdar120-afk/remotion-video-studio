// Episode 2 sets + looks: bright prairie day (measured on the reference: airy, lifted shadows, warm cream highlights,
// neutral-green shadows, no pure black), dusk, stormy night, the town, the garage, the driver's cockpit.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Look, V3 } from "../engine/Stage";
import { sky, rng } from "../engine/tex";
import { Board, Car, ctex, signCanvas, useT } from "./world";

// prairie sky: deep blue overhead fading to a pale hazy horizon, a few soft cumulus low over the horizon (reference look)
const prairieSky = (top: string, mid: string, hor: string, cloud: string, shade: string, key: string) => ctex("psky" + key, 2048, 1024, (g) => {
  const r = rng(91);
  const grd = g.createLinearGradient(0, 0, 0, 1024); grd.addColorStop(0, top); grd.addColorStop(0.3, mid); grd.addColorStop(0.44, mid); grd.addColorStop(0.5, hor); grd.addColorStop(1, hor);
  g.fillStyle = grd; g.fillRect(0, 0, 2048, 1024);
  for (let c = 0; c < 16; c++) {
    const cx = r() * 2048, cy = 405 + r() * 80, sc = 0.35 + r() * 0.6;
    for (let i = 0; i < 14; i++) {
      const x = cx + (r() - 0.5) * 220 * sc, y = cy - r() * 40 * sc, rx = (30 + r() * 55) * sc, ry = (20 + r() * 30) * sc;
      const gr = g.createRadialGradient(x - rx * 0.3, y - ry * 0.5, 2, x, y, Math.max(rx, ry));
      gr.addColorStop(0, cloud); gr.addColorStop(0.75, cloud); gr.addColorStop(1, shade);
      g.globalAlpha = 0.9; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 0.5; g.fillStyle = shade; g.beginPath(); g.ellipse(cx, cy + 8 * sc, 150 * sc, 12 * sc, 0, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
});
export const dayLook = (): Look => ({
  sky: prairieSky("#2f6fc8", "#6fa2de", "#dce6ee", "#ffffff", "#c9d4e2", "day"),
  fog: "#d6e0ea", fogNear: 90, fogFar: 380,
  sun: { pos: [-22, 30, 16], color: "#fff0d6", intensity: 3.1, shadow: 34 },
  hemi: { sky: "#cfe0f5", ground: "#6f7a52", intensity: 1.25 },
  ambient: 0.2, exposure: 1.0, aperture: 0.22, ink: 0, warm: "#ffd6a0", cool: "#7a8aa8", vignette: 0.3, saturation: 1.05,
});
export const duskLook = (): Look => ({
  sky: prairieSky("#3a4a8a", "#c87a6a", "#ffc890", "#ffd2a8", "#c87a6a", "dusk"),
  fog: "#e8a878", fogNear: 50, fogFar: 260,
  sun: { pos: [-30, 9, -30], color: "#ff9a50", intensity: 2.6, shadow: 34 },
  hemi: { sky: "#f0b890", ground: "#5a4a6a", intensity: 0.95 },
  ambient: 0.16, exposure: 1.15, aperture: 0.25, ink: 0, warm: "#ffb070", cool: "#6a5aa8", vignette: 0.4, saturation: 1.08,
});
export const stormLook = (): Look => ({
  sky: sky("#0c1222", "#1c2840", "#33425e", "#2a3550", true),
  fog: "#1c2740", fogNear: 12, fogFar: 120,
  sun: { pos: [-10, 25, 10], color: "#8fa4d8", intensity: 0.55, shadow: 30 },
  hemi: { sky: "#4a5a88", ground: "#1a1a28", intensity: 0.5 },
  ambient: 0.1, exposure: 1.35, aperture: 0.3, ink: 0, warm: "#ffa060", cool: "#3a4a9a", vignette: 0.6, saturation: 1.0,
});
export const garageLook = (): Look => ({
  fog: "#c8c2b6", fogNear: 20, fogFar: 60,
  sun: { pos: [8, 14, 18], color: "#fff0d6", intensity: 2.2, shadow: 14 },
  hemi: { sky: "#e8e0d0", ground: "#6a6058", intensity: 1.2 },
  ambient: 0.25, exposure: 1.15, aperture: 0.35, ink: 0, warm: "#ffd6a0", cool: "#7a8aa8", vignette: 0.4, saturation: 1.0,
});

const M = (color: string, rough = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

/* ---------------- town (main street along x, buildings on z < 0, the sheriff's office) ---------------- */
const Store: React.FC<{ x: number; w: number; h: number; color: string; sign: string; signBg?: string; rotY?: number; z?: number }> = ({ x, w, h, color, sign, signBg = "#2a3a5a", z = -7.4, rotY = 0 }) => {
  const wall = useMemo(() => M(color, 0.9), [color]);
  const glass = useMemo(() => M("#3d5a7a", 0.15, { metalness: 0.3 }), []);
  const trim = useMemo(() => M("#efe6d2", 0.7), []);
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, h / 2, -3]} material={wall} castShadow receiveShadow><boxGeometry args={[w, h, 6]} /></mesh>
      <mesh position={[0, h + 0.6, 0.02]} material={wall} castShadow><boxGeometry args={[w, 1.2, 0.3]} /></mesh>
      <mesh position={[0, 1.4, 0.02]} material={glass}><boxGeometry args={[w * 0.7, 1.8, 0.05]} /></mesh>
      <mesh position={[0, 2.5, 0.06]} material={trim}><boxGeometry args={[w * 0.74, 0.1, 0.1]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * w * 0.25, h * 0.72, 0.03]} material={glass}><boxGeometry args={[w * 0.18, 1.1, 0.05]} /></mesh>)}
      <mesh position={[0, 3.1, 0.9]} rotation={[0.25, 0, 0]} material={M("#b8423a", 0.8)} castShadow><boxGeometry args={[w * 0.9, 0.06, 1.8]} /></mesh>
      <Board pos={[0, h - 0.4, 0.2]} w={w * 0.7} h={0.8} k={"store" + sign} draw={(g) => { const W = g.canvas.width, H = g.canvas.height; g.fillStyle = signBg; g.fillRect(0, 0, W, H); g.fillStyle = "#f6ead2"; g.font = `900 ${H * 0.55}px Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sign, W / 2, H / 2 + 4); }} />
    </group>
  );
};
export const Town: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const road = useMemo(() => new THREE.MeshStandardMaterial({ map: ctex("townroad", 256, 256, (g, r) => { g.fillStyle = "#6a6a6e"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? "#5e5e62" : "#77777b"; g.fillRect(r() * 256, r() * 256, 2, 2); } }, [40, 4]), roughness: 0.95 }), []);
  const walk = useMemo(() => M("#c9c2b2", 0.95), []);
  const dirt = useMemo(() => M("#b9a888", 1), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} material={dirt} receiveShadow><planeGeometry args={[800, 800]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={road} receiveShadow><planeGeometry args={[400, 10]} /></mesh>
      <mesh position={[0, 0.08, -6.2]} material={walk} receiveShadow><boxGeometry args={[400, 0.16, 2.4]} /></mesh>
      <mesh position={[0, 0.08, 6.2]} material={walk} receiveShadow><boxGeometry args={[400, 0.16, 2.4]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, s * 0.15]} material={M("#e8b630", 0.6)}><planeGeometry args={[400, 0.12]} /></mesh>)}
      <Store x={-16} w={7} h={5.5} color="#c9b48a" sign="GENERAL STORE" signBg="#6a2a22" />
      <Store x={-8} w={7} h={4.8} color="#8a5a3a" sign="DINER" signBg="#2a5a4a" />
      <Store x={0.5} w={8.5} h={5.2} color="#e8e0cc" sign="SHERIFF" signBg="#1f4a2e" />
      <Store x={9.5} w={7} h={6} color="#a83a2e" sign="HARDWARE" signBg="#22324a" />
      <Store x={17} w={6.5} h={4.6} color="#7a8a6a" sign="BARBER" signBg="#5a2a4a" />
      <Store x={-6} w={7} h={5} color="#b9a07a" sign="FEED & SEED" signBg="#3a2a1a" z={7.4} rotY={Math.PI} />
      <Store x={6} w={8} h={5.4} color="#9a6a4a" sign="GAS" signBg="#a8322c" z={7.4} rotY={Math.PI} />
      {/* water tower */}
      <group position={[24, 0, -30]}>
        {[[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].map(([x, z], i) => <mesh key={i} position={[x, 6, z]} material={M("#7a7a80", 0.6)}><cylinderGeometry args={[0.15, 0.15, 12, 6]} /></mesh>)}
        <mesh position={[0, 14, 0]} material={M("#d8d8dc", 0.5)} castShadow><cylinderGeometry args={[3.2, 3.2, 4, 20]} /></mesh>
        <mesh position={[0, 17, 0]} material={M("#b8b8bc", 0.5)}><coneGeometry args={[3.4, 2, 20]} /></mesh>
      </group>
      {children}
    </group>
  );
};

/* ---------------- garage (repair shop) ---------------- */
export const Garage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ map: ctex("concrete", 256, 256, (g, r) => { g.fillStyle = "#9a9690"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 2000; i++) { g.fillStyle = r() < 0.5 ? "#8a8680" : "#aaa6a0"; g.fillRect(r() * 256, r() * 256, 3, 3); } g.fillStyle = "rgba(40,40,40,0.25)"; g.beginPath(); g.ellipse(128, 140, 60, 30, 0, 0, 7); g.fill(); }, [4, 4]), roughness: 0.9 }), []);
  const wall = useMemo(() => M("#d9d2c2", 0.95), []);
  const red = useMemo(() => M("#b8322a", 0.6), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor} receiveShadow><planeGeometry args={[20, 20]} /></mesh>
      <mesh position={[0, 3.5, -7]} material={wall} receiveShadow><boxGeometry args={[20, 7, 0.3]} /></mesh>
      <mesh position={[-8, 3.5, 0]} material={wall} receiveShadow><boxGeometry args={[0.3, 7, 20]} /></mesh>
      <mesh position={[8, 3.5, 0]} material={wall} receiveShadow><boxGeometry args={[0.3, 7, 20]} /></mesh>
      <mesh position={[0, 7, 0]} material={wall}><boxGeometry args={[20, 0.3, 20]} /></mesh>
      {/* tool board + red tool chests */}
      <mesh position={[-3.5, 2.6, -6.8]} material={M("#7a5a3a", 0.9)}><boxGeometry args={[4, 1.8, 0.1]} /></mesh>
      {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-5.1 + i * 0.36, 2.6 + (i % 2) * 0.3, -6.7]} material={M("#3a3a40", 0.4, { metalness: 0.5 })}><boxGeometry args={[0.06, 0.6, 0.06]} /></mesh>)}
      <mesh position={[3.5, 0.6, -6.3]} material={red} castShadow><boxGeometry args={[2.4, 1.2, 0.8]} /></mesh>
      <mesh position={[6.6, 0.9, -4]} material={red} castShadow><boxGeometry args={[0.9, 1.8, 1.6]} /></mesh>
      {/* tyres stacked */}
      {[0, 1, 2].map((i) => <mesh key={i} position={[-6.6, 0.18 + i * 0.3, -4.8]} rotation={[Math.PI / 2, 0, 0]} material={M("#1b1b1e", 0.95)} castShadow><torusGeometry args={[0.4, 0.15, 10, 20]} /></mesh>)}
      {/* ceiling lights */}
      {[-3, 3].map((x) => <group key={x}><mesh position={[x, 6.8, -1]} material={M("#fff8e8", 0.3, { emissive: "#fff2d8", emissiveIntensity: 2 })}><boxGeometry args={[2, 0.08, 0.3]} /></mesh><pointLight position={[x, 6.2, -1]} intensity={30} distance={14} decay={1.6} color="#fff0d8" /></group>)}
      {children}
    </group>
  );
};

/* ---------------- the driver's cockpit, fixed to the camera (night POV shots) ---------------- */
const handsTex = () => ctex("hands", 512, 256, (g) => {
  g.clearRect(0, 0, 512, 256);
  for (const s of [-1, 1]) {
    const x = 256 + s * 150;
    g.strokeStyle = "#161212"; g.lineWidth = 30; g.lineCap = "round"; g.beginPath(); g.moveTo(x + s * 60, 256); g.lineTo(x, 150); g.stroke();
    g.strokeStyle = "#b59a62"; g.lineWidth = 18; g.beginPath(); g.moveTo(x + s * 60, 256); g.lineTo(x, 150); g.stroke();
    g.fillStyle = "#fbfaf6"; g.strokeStyle = "#161212"; g.lineWidth = 9; g.beginPath(); g.arc(x, 128, 34, 0, 7); g.fill(); g.stroke();
  }
});
export const Cockpit: React.FC<{ steer?: number; wipers?: boolean; offset?: V3; tilt?: number; arrowGlow?: number; fixed?: boolean }> = ({ steer = 0, wipers = true, offset = [0, 0, 0], tilt = 0, arrowGlow = 0, fixed = false }) => {
  const t = useT();
  const { camera } = useThree();
  const ref = React.useRef<THREE.Group>(null);
  const mats = useMemo(() => ({ dash: M("#2a2a30", 0.7), hood: M("#3a4660", 0.35, { metalness: 0.2 }), wheel: M("#1e1e22", 0.5), gauge: new THREE.MeshStandardMaterial({ map: signCanvas("gauges", 512, 128, (g) => { g.fillStyle = "#101014"; g.fillRect(0, 0, 512, 128); for (const x of [128, 384]) { g.strokeStyle = "#e8e0c8"; g.lineWidth = 6; g.beginPath(); g.arc(x, 72, 48, Math.PI * 0.8, Math.PI * 2.2); g.stroke(); g.strokeStyle = "#ff6a2a"; g.beginPath(); g.moveTo(x, 72); g.lineTo(x - 30, 44); g.stroke(); } }), emissive: "#ffffff", emissiveIntensity: 0.6 }), hands: new THREE.MeshStandardMaterial({ map: handsTex(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: "#ff9a50", emissiveIntensity: 0.12 + arrowGlow * 0.25 }), wiper: M("#111114", 0.5), mitt: M("#fbfaf6", 0.7, { emissive: "#ff9a50", emissiveIntensity: 0.08 + arrowGlow * 0.15 }), sleeve: M("#b59a62", 0.8) }), [arrowGlow]);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position); if (fixed) ref.current.quaternion.identity(); else ref.current.quaternion.copy(camera.quaternion);
  });
  const wipe = wipers ? Math.sin(t * 3.2) * 0.9 : 0;
  return (
    <group ref={ref}>
      <group position={offset} rotation={[tilt, 0, 0]}>
        <mesh position={[0, -0.66, -1.3]} material={mats.dash}><boxGeometry args={[2.6, 0.5, 0.8]} /></mesh>
        <mesh position={[0, -0.4, -0.92]} rotation={[-0.3, 0, 0]} material={mats.gauge}><planeGeometry args={[0.7, 0.18]} /></mesh>
        <mesh position={[0, -0.78, -2.6]} rotation={[-0.08, 0, 0]} material={mats.hood}><boxGeometry args={[2.0, 0.08, 2.2]} /></mesh>
        <group position={[0, -0.42, -0.6]} rotation={[-0.45, 0, 0]}>
          <group rotation={[0, 0, steer]}>
            <mesh material={mats.wheel}><torusGeometry args={[0.24, 0.028, 10, 36]} /></mesh>
            <mesh material={mats.wheel}><boxGeometry args={[0.46, 0.04, 0.03]} /></mesh>
            <mesh material={mats.wheel}><cylinderGeometry args={[0.06, 0.06, 0.05, 16]} /></mesh>
            {[-1, 1].map((sd) => <group key={sd} position={[sd * 0.22, 0.05, 0.03]}>
              <mesh material={mats.mitt}><sphereGeometry args={[0.055, 16, 12]} /></mesh>
              <mesh position={[sd * 0.09, -0.1, 0.06]} rotation={[0.5, 0, sd * 0.7]} material={mats.sleeve}><cylinderGeometry args={[0.03, 0.035, 0.26, 10]} /></mesh>
            </group>)}
          </group>
        </group>
        {[-0.5, 0.25].map((x, i) => <group key={i} position={[x, -0.55, -1.55]} rotation={[0, 0, 0.2 + wipe]}><mesh position={[0, 0.45, 0]} material={mats.wiper}><boxGeometry args={[0.03, 0.9, 0.02]} /></mesh></group>)}
        {/* A-pillars and roof edge */}
        {[-1, 1].map((s) => <mesh key={s} position={[s * 1.05, 0.05, -1.25]} rotation={[0.45, 0, s * -0.15]} material={mats.dash}><boxGeometry args={[0.14, 1.6, 0.12]} /></mesh>)}
        <mesh position={[0, 0.62, -0.95]} material={mats.dash}><boxGeometry args={[2.6, 0.12, 0.7]} /></mesh>
        <pointLight position={[0, -0.3, -0.6]} intensity={0.6} distance={2} color="#ff9a60" />
      </group>
    </group>
  );
};

/* green overhead highway gantry: TARGET FIXATION */
export const Gantry: React.FC<{ z: number; glow?: number }> = ({ z, glow = 0.25 }) => {
  const steel = useMemo(() => M("#8a8e96", 0.5, { metalness: 0.4 }), []);
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 5.2, 3.6, 0]} material={steel} castShadow><cylinderGeometry args={[0.16, 0.18, 7.2, 10]} /></mesh>)}
      <mesh position={[0, 6.9, 0]} material={steel}><boxGeometry args={[10.6, 0.3, 0.3]} /></mesh>
      <Board pos={[0, 5.15, 0.2]} w={5.6} h={2.6} k="targetfix" glow={glow} draw={(g) => {
        const W = g.canvas.width, H = g.canvas.height; g.fillStyle = "#0f6b3a"; g.fillRect(0, 0, W, H); g.strokeStyle = "#f2f2ee"; g.lineWidth = 18; g.beginPath(); g.roundRect(22, 22, W - 44, H - 44, 30); g.stroke();
        g.fillStyle = "#f2f2ee"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `800 ${H * 0.3}px Arial, Helvetica, sans-serif`; g.fillText("TARGET", W / 2, H * 0.36); g.fillText("FIXATION", W / 2, H * 0.68);
      }} />
    </group>
  );
};

export { Car };
