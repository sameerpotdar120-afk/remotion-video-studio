// Episode 3 sets: neon-night look measured on the reference (purple / magenta / teal, warm lamps, saturated, deep violet shadows).
// Apartment (kitchen + living room), midnight-launch store front, hotel room, trailer theater, plus props (fridge + sticky notes,
// our own game-box design, phone, wall clock, DELAYED banners). All signs and boxes are our own designs.
import React, { useMemo } from "react";
import * as THREE from "three";
import type { Look, V3 } from "../engine/Stage";
import { sky } from "../engine/tex";
import { ctex, signCanvas, useT, clamp01, smooth } from "../ep2/world";

const M = (color: string, rough = 0.8, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

export const nightIn = (): Look => ({
  fog: "#1a1030", fogNear: 14, fogFar: 40,
  sun: { pos: [6, 9, 7], color: "#ffcf9a", intensity: 0.9, shadow: 10 },
  hemi: { sky: "#8a6cff", ground: "#2a1030", intensity: 0.75 },
  ambient: 0.14, exposure: 1.3, aperture: 0.45, ink: 0, warm: "#ffb070", cool: "#5a3fd8", vignette: 0.55, saturation: 1.22,
});
export const nightOut = (): Look => ({
  sky: sky("#0a0820", "#2a1650", "#7a3a8a", "#3a2a6a", true),
  fog: "#2a1650", fogNear: 25, fogFar: 90,
  sun: { pos: [-8, 14, 10], color: "#9fb0ff", intensity: 0.6, shadow: 20 },
  hemi: { sky: "#7a5cff", ground: "#2a1030", intensity: 0.7 },
  ambient: 0.12, exposure: 1.3, aperture: 0.4, ink: 0, warm: "#ffb070", cool: "#5a3fd8", vignette: 0.55, saturation: 1.25,
});
export const dark = (): Look => ({ ...nightIn(), fog: "#08060f", fogNear: 6, fogFar: 22, hemi: { sky: "#3a3a8a", ground: "#100818", intensity: 0.45 }, exposure: 1.35 });

/* ---------------- props ---------------- */
// our game box design: neon sunset, palm silhouettes, big number + small title (no real logo)
export const boxTex = (num: string, sub: string) => signCanvas("box" + num + sub, 384, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2a0a4a"); gr.addColorStop(0.45, "#c2185b"); gr.addColorStop(0.75, "#ff8a3a"); gr.addColorStop(1, "#ffd27a");
  g.fillStyle = gr; g.fillRect(0, 0, 384, 512);
  g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(192, 330, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#1a0820"; for (const [x, h] of [[50, 230], [320, 260], [270, 190]] as [number, number][]) { g.fillRect(x, 512 - h, 10, h); for (let k = 0; k < 6; k++) { g.save(); g.translate(x + 5, 512 - h); g.rotate(-1.2 + k * 0.48); g.beginPath(); g.ellipse(30, 0, 34, 8, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
  g.fillRect(0, 470, 384, 42);
  g.font = "900 220px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 14; g.strokeStyle = "#1a0820"; g.strokeText(num, 192, 150); g.fillStyle = "#ffffff"; g.fillText(num, 192, 150);
  g.font = "900 46px Arial Black, Arial"; g.lineWidth = 8; g.strokeText(sub, 192, 270); g.fillStyle = "#ffe0f0"; g.fillText(sub, 192, 270);
});
export const GameBox: React.FC<{ pos: V3; rot?: V3; num?: string; sub?: string; scale?: number; open?: number; ring?: boolean }> = ({ pos, rot = [0, 0, 0], num = "6", sub = "GTA", scale = 1, open = 0, ring }) => {
  const mats = useMemo(() => { const f = new THREE.MeshStandardMaterial({ map: boxTex(num, sub), roughness: 0.35, emissive: "#ffffff", emissiveIntensity: 0.12 }); f.emissiveMap = f.map; return { f, side: M("#1a0820", 0.4), inner: M("#101018", 0.6), gold: M("#f2c53d", 0.2, { metalness: 0.8, emissive: "#ffcc44", emissiveIntensity: 0.3 }), gem: M("#e8f6ff", 0.05, { emissive: "#bfe8ff", emissiveIntensity: 1.2 }) }; }, [num, sub]);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh position={[0, 0, -0.01]} material={mats.side} castShadow><boxGeometry args={[0.19, 0.24, 0.012]} /></mesh>
      <group position={[-0.095, 0, 0.006]} rotation={[0, -open * 2.2, 0]}>
        <mesh position={[0.095, 0, 0]} material={mats.f} castShadow><boxGeometry args={[0.19, 0.24, 0.006]} /></mesh>
      </group>
      {open > 0 ? <mesh position={[0, 0, -0.002]} material={mats.inner}><planeGeometry args={[0.17, 0.22]} /></mesh> : null}
      {ring && open > 0 ? <group position={[0, -0.02, 0.012]}><mesh material={mats.gold} rotation={[0, 0, 0]}><torusGeometry args={[0.03, 0.007, 10, 28]} /></mesh><mesh position={[0, 0.036, 0]} material={mats.gem}><octahedronGeometry args={[0.014, 0]} /></mesh>{open > 0.5 ? <pointLight position={[0, 0.02, 0.1]} intensity={0.6} distance={0.8} color="#cfefff" /> : null}</group> : null}
    </group>
  );
};

// sticky note on the fridge; age 0 = fresh, 1 = yellowed and curling
export const noteTex = (key: string, lines: string[], age = 0) => signCanvas("note" + key + Math.round(age * 4), 256, 256, (g) => {
  const c = new THREE.Color("#fff27a").lerp(new THREE.Color("#d9b85a"), age);
  g.fillStyle = "#" + c.getHexString(); g.fillRect(0, 0, 256, 256);
  if (age > 0.3) { g.fillStyle = `rgba(150,110,40,${age * 0.35})`; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(30 + i * 40, 30 + (i % 3) * 80, 30, 0, 7); g.fill(); } }
  g.fillStyle = "#c21a5a"; g.textAlign = "center"; g.textBaseline = "middle";
  const fs = lines.length > 2 ? 22 : 56; g.font = `700 ${fs}px "Comic Sans MS", "Marker Felt", cursive`;
  lines.forEach((l, i) => g.fillText(l, 128, 128 + (i - (lines.length - 1) / 2) * fs * 1.15));
});
export const Fridge: React.FC<{ pos: V3; rotY?: number; note?: { lines: string[]; age?: number; key: string; slap?: number } | null }> = ({ pos, rotY = 0, note }) => {
  const t = useT();
  const mats = useMemo(() => ({ body: M("#e8e6f0", 0.35, { metalness: 0.2 }), handle: M("#b8bcc8", 0.2, { metalness: 0.7 }), mag: M("#2fb8a8", 0.4) }), []);
  const nm = useMemo(() => note ? new THREE.MeshStandardMaterial({ map: noteTex(note.key, note.lines, note.age ?? 0), roughness: 0.9, side: THREE.DoubleSide }) : null, [note?.key, Math.round((note?.age ?? 0) * 4)]);
  const s = note?.slap !== undefined ? clamp01((t - note.slap) / 0.12) : 1;
  const curl = (note?.age ?? 0) * 0.5;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.95, 0]} material={mats.body} castShadow receiveShadow><boxGeometry args={[0.9, 1.9, 0.75]} /></mesh>
      <mesh position={[0, 1.42, 0.38]} material={mats.body}><boxGeometry args={[0.88, 0.02, 0.01]} /></mesh>
      <mesh position={[-0.36, 1.65, 0.4]} material={mats.handle}><boxGeometry args={[0.04, 0.35, 0.04]} /></mesh>
      <mesh position={[-0.36, 0.95, 0.4]} material={mats.handle}><boxGeometry args={[0.04, 0.55, 0.04]} /></mesh>
      {note && nm ? (
        <group position={[0.1, 1.15, 0.38 + 0.002 + (1 - s) * 0.3]} scale={[s, s, s]}>
          <mesh material={nm} rotation={[curl * 0.4, 0, 0.06]} position={[0, 0, curl * 0.03]}><planeGeometry args={[0.3, 0.3]} /></mesh>
          <mesh position={[0, 0.14, 0.01]} material={mats.mag}><sphereGeometry args={[0.02, 10, 8]} /></mesh>
        </group>
      ) : null}
    </group>
  );
};

export const Phone: React.FC<{ pos: V3; rot?: V3; screen: "ring" | "trailer" | "off"; scale?: number }> = ({ pos, rot = [0, 0, 0], screen, scale = 1 }) => {
  const tex = useMemo(() => signCanvas("phone" + screen, 256, 512, (g) => {
    g.fillStyle = "#101018"; g.fillRect(0, 0, 256, 512);
    if (screen === "off") return;
    g.fillStyle = "#f4f0f8"; g.fillRect(8, 40, 240, 440);
    g.fillStyle = "#1a1a24"; g.font = "700 22px Arial"; g.textAlign = "left"; g.fillText("Babe ♥", 24, 74);
    if (screen === "trailer") { g.fillStyle = "#c2185b"; g.fillRect(24, 110, 208, 120); g.fillStyle = "#fff"; g.font = "900 60px Arial Black"; g.textAlign = "center"; g.fillText("6", 128, 192); }
    // message bubble with a drawn ring (no emoji font needed)
    g.fillStyle = "#3a7bff"; g.beginPath(); g.roundRect(70, 290, 160, 130, 26); g.fill();
    g.strokeStyle = "#ffd24a"; g.lineWidth = 12; g.beginPath(); g.arc(150, 370, 30, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#cfefff"; g.beginPath(); g.moveTo(150, 312); g.lineTo(166, 330); g.lineTo(150, 346); g.lineTo(134, 330); g.closePath(); g.fill();
  }), [screen]);
  const m = useMemo(() => { const x = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.2 }); return x; }, [tex]);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh material={M("#1a1a20", 0.3)} castShadow><boxGeometry args={[0.08, 0.16, 0.01]} /></mesh>
      <mesh position={[0, 0, 0.0055]} material={m}><planeGeometry args={[0.072, 0.15]} /></mesh>
    </group>
  );
};

export const WallClock: React.FC<{ pos: V3; rotY?: number; text: string; sub?: string; scale?: number }> = ({ pos, rotY = 0, text, sub = "", scale = 1 }) => {
  const m = useMemo(() => { const tx = signCanvas("clock" + text + sub, 512, 256, (g) => { g.fillStyle = "#0a0a12"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#ff3a6a"; g.shadowColor = "#ff3a6a"; g.shadowBlur = 20; g.font = "700 120px 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 110); g.font = "700 40px Arial"; g.fillStyle = "#ff9ab8"; g.fillText(sub, 256, 210); }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 1.2 }); }, [text, sub]);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <mesh position={[0, 0, -0.03]} material={M("#202028", 0.4)}><boxGeometry args={[1.0, 0.52, 0.05]} /></mesh>
      <mesh material={m}><planeGeometry args={[0.94, 0.47]} /></mesh>
    </group>
  );
};

export const Banner: React.FC<{ pos: V3; rotY?: number; text: string; sub?: string; drop?: number; w?: number; h?: number; color?: string }> = ({ pos, rotY = 0, text, sub = "", drop = 1, w = 3.4, h = 1.5, color = "#d81b3a" }) => {
  const m = useMemo(() => { const tx = signCanvas("ban" + text + sub + color, 768, 340, (g) => { g.fillStyle = color; g.fillRect(0, 0, 768, 340); g.strokeStyle = "#ffd9e0"; g.lineWidth = 14; g.strokeRect(14, 14, 740, 312); g.fillStyle = "#ffffff"; g.font = "900 130px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 384, sub ? 140 : 170); if (sub) { g.font = "700 50px Arial"; g.fillStyle = "#ffe0e6"; g.fillText(sub, 384, 265); } }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 0.55 }); }, [text, sub, color]);
  const y = pos[1] + (1 - smooth(drop)) * 4 - (drop > 0.9 ? Math.sin((drop - 0.9) * 30) * 0.05 : 0);
  return <mesh position={[pos[0], y, pos[2]]} rotation={[0, rotY, (1 - drop) * 0.2]} material={m}><planeGeometry args={[w, h]} /></mesh>;
};

/* ---------------- apartment: kitchen left, living room right; back wall z = -4, window wall x = +5, front door x = -5 ---------------- */
export const APT = { fridge: [-3.3, 0, -3.5] as V3, couch: [2.2, 0, 0.6] as V3, tv: [2.2, 1.45, -3.92] as V3, table: [2.2, 0, -1.1] as V3, door: [-4.95, 0, 1.4] as V3 };
export const Apartment: React.FC<{ lights?: "on" | "dim" | "off"; tvGlow?: number; stack?: number; doorOpen?: number; children?: React.ReactNode }> = ({ lights = "on", tvGlow = 0.6, stack = 0, doorOpen = 0, children }) => {
  const t = useT();
  const mats = useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({ map: ctex("woodfloor", 512, 512, (g, r) => { for (let i = 0; i < 16; i++) { g.fillStyle = ["#5a3a2a", "#6a4430", "#4e3224", "#62402c"][i % 4]; g.fillRect(0, i * 32, 512, 32); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, i * 32, 512, 2); for (let k = 0; k < 3; k++) g.fillRect(r() * 512, i * 32, 2, 32); } }, [5, 5]), roughness: 0.55 }),
    wall: M("#3a2a5a", 0.9), wall2: M("#2a3a5a", 0.9), trim: M("#e8e0f0", 0.6), counter: M("#e8e2d8", 0.4), cab: M("#2f6a8a", 0.6),
    couch: M("#7a3a8a", 0.9), cushion: M("#8a4a9a", 0.9), table: M("#3a2418", 0.6), tvb: M("#0a0a10", 0.3), rug: M("#2fb8a8", 0.95),
    neon: M("#ff3aa0", 0.3, { emissive: "#ff3aa0", emissiveIntensity: 2.2 }), neon2: M("#3af0ff", 0.3, { emissive: "#3af0ff", emissiveIntensity: 2 }),
    lampshade: M("#ffd9a0", 0.6, { emissive: "#ffb060", emissiveIntensity: lights === "off" ? 0 : 1.2 }),
    city: new THREE.MeshStandardMaterial({ map: ctex("cityview", 512, 256, (g, r) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#0a0620"); gr.addColorStop(1, "#5a1a6a"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); for (let i = 0; i < 26; i++) { const x = r() * 512, w = 20 + r() * 40, h = 60 + r() * 160; g.fillStyle = "#120a24"; g.fillRect(x, 256 - h, w, h); for (let k = 0; k < 14; k++) { g.fillStyle = r() < 0.5 ? "#ffcf7a" : "#ff6ad0"; g.fillRect(x + 4 + r() * (w - 8), 256 - h + 6 + r() * (h - 12), 3, 4); } } }), emissive: "#ffffff", roughness: 1 }),
    tv: new THREE.MeshStandardMaterial({ color: "#3a7bff", emissive: "#4a8bff", emissiveIntensity: tvGlow }),
  }), [lights, tvGlow]);
  mats.city.emissiveMap = mats.city.map; mats.city.emissiveIntensity = 0.9;
  const lamp = lights === "on" ? 1 : lights === "dim" ? 0.4 : 0;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.floor} receiveShadow><planeGeometry args={[10, 9]} /></mesh>
      <mesh position={[0, 3, -4]} material={mats.wall} receiveShadow><boxGeometry args={[10, 6, 0.2]} /></mesh>
      <mesh position={[-5, 3, 0.5]} material={mats.wall2} receiveShadow><boxGeometry args={[0.2, 6, 9]} /></mesh>
      <mesh position={[5, 3, 0.5]} material={mats.wall2} receiveShadow><boxGeometry args={[0.2, 6, 9]} /></mesh>
      <mesh position={[0, 3.2, 0]} material={mats.wall}><boxGeometry args={[10, 0.1, 9]} /></mesh>
      {/* window with city lights on the right wall */}
      <mesh position={[4.88, 2.0, -1.3]} rotation={[0, -Math.PI / 2, 0]} material={mats.city}><planeGeometry args={[3.2, 1.7]} /></mesh>
      <mesh position={[4.86, 2.0, -1.3]} rotation={[0, -Math.PI / 2, 0]} material={mats.trim}><boxGeometry args={[3.4, 1.9, 0.02]} /></mesh>
      {/* neon strips */}
      <mesh position={[1.5, 2.85, -3.88]} material={mats.neon}><boxGeometry args={[6, 0.04, 0.04]} /></mesh>
      <mesh position={[-4.88, 2.85, -1]} rotation={[0, Math.PI / 2, 0]} material={mats.neon2}><boxGeometry args={[5, 0.04, 0.04]} /></mesh>
      {/* kitchen */}
      <mesh position={[-1.6, 0.45, -3.55]} material={mats.cab} castShadow><boxGeometry args={[2.6, 0.9, 0.7]} /></mesh>
      <mesh position={[-1.6, 0.93, -3.55]} material={mats.counter}><boxGeometry args={[2.7, 0.06, 0.76]} /></mesh>
      <mesh position={[-1.6, 2.2, -3.75]} material={mats.cab}><boxGeometry args={[2.6, 0.7, 0.35]} /></mesh>
      {/* living room: TV, couch, table, rug, lamp */}
      <mesh position={APT.tv} material={mats.tvb}><boxGeometry args={[2.2, 1.25, 0.08]} /></mesh>
      <mesh position={[APT.tv[0], APT.tv[1], APT.tv[2] + 0.045]} material={mats.tv}><planeGeometry args={[2.05, 1.12]} /></mesh>
      <mesh position={[APT.tv[0], 0.3, -3.6]} material={mats.table} castShadow><boxGeometry args={[2.4, 0.6, 0.5]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.01, -0.6]} material={mats.rug}><circleGeometry args={[1.8, 32]} /></mesh>
      <group position={APT.couch}>
        <mesh position={[0, 0.3, 0.2]} material={mats.couch} castShadow receiveShadow><boxGeometry args={[2.6, 0.6, 1.0]} /></mesh>
        <mesh position={[0, 0.75, 0.62]} material={mats.couch} castShadow><boxGeometry args={[2.6, 0.9, 0.25]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 1.25, 0.55, 0.2]} material={mats.couch} castShadow><boxGeometry args={[0.22, 0.5, 1.0]} /></mesh>)}
        {[-0.6, 0.6].map((x) => <mesh key={x} position={[x, 0.66, 0.15]} material={mats.cushion}><boxGeometry args={[1.0, 0.14, 0.8]} /></mesh>)}
      </group>
      <group position={APT.table}>
        <mesh position={[0, 0.38, 0]} material={mats.table} castShadow receiveShadow><boxGeometry args={[1.4, 0.06, 0.7]} /></mesh>
        {[[-0.62, -0.28], [0.62, -0.28], [-0.62, 0.28], [0.62, 0.28]].map(([x, z], i) => <mesh key={i} position={[x, 0.18, z]} material={mats.table}><boxGeometry args={[0.05, 0.36, 0.05]} /></mesh>)}
        {Array.from({ length: Math.round(stack) }, (_, i) => <GameBox key={i} pos={[-0.3 + (i % 3) * 0.02, 0.42 + i * 0.015, 0.05 - (i % 2) * 0.02]} rot={[-Math.PI / 2, 0, 0.2 * (i % 3 - 1)]} num="V" sub="GTA" scale={1.6} />)}
      </group>
      <group position={[4.2, 0, -3.3]}>
        <mesh position={[0, 0.8, 0]} material={mats.table}><cylinderGeometry args={[0.03, 0.03, 1.6, 6]} /></mesh>
        <mesh position={[0, 1.7, 0]} material={mats.lampshade}><cylinderGeometry args={[0.22, 0.32, 0.36, 16, 1, true]} /></mesh>
        {lamp > 0 ? <pointLight position={[0, 1.6, 0.2]} intensity={14 * lamp} distance={9} decay={1.6} color="#ffb060" /> : null}
      </group>
      {/* front door (left wall) */}
      <group position={[APT.door[0] + 0.12, 0, APT.door[2]]}>
        <mesh position={[0, 1.05, 0]} material={mats.trim}><boxGeometry args={[0.06, 2.2, 1.2]} /></mesh>
        <group position={[0.03, 0, -0.5]} rotation={[0, doorOpen * 1.4, 0]}><mesh position={[0.02, 1.0, 0.5]} material={M("#5a2a3a", 0.6)} castShadow><boxGeometry args={[0.06, 2.0, 1.0]} /></mesh></group>
        {doorOpen > 0 ? <pointLight position={[-0.6, 1.5, 0]} intensity={8 * doorOpen} distance={6} color="#ffd9a0" /> : null}
      </group>
      <pointLight position={[-2, 2.6, -2]} intensity={10 * lamp + 2} distance={9} decay={1.6} color="#ffcf9a" />
      <pointLight position={[2.2, 1.4, -3.2]} intensity={6 * tvGlow} distance={6} color="#4a8bff" />
      <pointLight position={[1.5, 2.6, -3.5]} intensity={5 + Math.sin(t * 2) * 0.3} distance={6} color="#ff3aa0" />
      {children}
    </group>
  );
};

/* ---------------- 2013 midnight launch: store front along x at z = -3 (facing +z), line of fans on the sidewalk ---------------- */
export const StoreFront: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const t = useT();
  const mats = useMemo(() => ({
    street: M("#1a1626", 0.6), walk: M("#3a3448", 0.8), facade: M("#2a2040", 0.85), glass: M("#ffcf9a", 0.2, { emissive: "#ffb070", emissiveIntensity: 0.9 }),
  }), []);
  const sign = useMemo(() => { const tx = signCanvas("gamevault", 1024, 256, (g) => { g.fillStyle = "#0a0614"; g.fillRect(0, 0, 1024, 256); g.shadowColor = "#3af0ff"; g.shadowBlur = 30; g.fillStyle = "#3af0ff"; g.font = "900 150px Arial Black"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("GAME VAULT", 512, 135); }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 1.6 }); }, []);
  const ban = useMemo(() => { const tx = signCanvas("midnight", 1024, 256, (g) => { g.fillStyle = "#c2185b"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#fff"; g.font = "900 110px Arial Black"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("MIDNIGHT LAUNCH", 512, 110); g.font = "700 60px Arial"; g.fillText("SEPT 2013", 512, 205); }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 0.8 }); }, []);
  const flick = 1.4 + Math.sin(t * 17) * 0.1;
  sign.emissiveIntensity = flick;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} material={mats.street} receiveShadow><planeGeometry args={[80, 14]} /></mesh>
      <mesh position={[0, 0.06, -1.5]} material={mats.walk} receiveShadow><boxGeometry args={[80, 0.12, 3]} /></mesh>
      <mesh position={[0, 3, -3.2]} material={mats.facade} receiveShadow><boxGeometry args={[40, 6, 0.4]} /></mesh>
      <mesh position={[0, 1.4, -2.98]} material={mats.glass}><planeGeometry args={[6, 2.2]} /></mesh>
      <mesh position={[0, 3.6, -2.95]} material={sign}><planeGeometry args={[5, 1.25]} /></mesh>
      <mesh position={[0, 2.75, -2.94]} material={ban}><planeGeometry args={[3.2, 0.8]} /></mesh>
      {[-9, 9].map((x) => <mesh key={x} position={[x, 2.5, -2.97]} material={M("#ff3aa0", 0.3, { emissive: "#ff3aa0", emissiveIntensity: 1.5 })}><boxGeometry args={[3, 1.6, 0.05]} /></mesh>)}
      <pointLight position={[0, 3.2, -1.5]} intensity={30} distance={14} decay={1.5} color="#3af0ff" />
      <pointLight position={[0, 1.6, -1.8]} intensity={18} distance={10} decay={1.5} color="#ffb070" />
      <pointLight position={[-9, 2.5, -2]} intensity={10} distance={8} color="#ff3aa0" />
      <pointLight position={[9, 2.5, -2]} intensity={10} distance={8} color="#ff3aa0" />
      {children}
    </group>
  );
};

/* ---------------- hotel room (the leak) ---------------- */
export const HotelRoom: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const t = useT();
  const tvm = useMemo(() => { const tx = signCanvas("hoteltv", 512, 288, (g) => { g.fillStyle = "#06121a"; g.fillRect(0, 0, 512, 288); g.fillStyle = "#3aff8a"; g.font = "700 26px 'Courier New', monospace"; ["> connecting...", "> ACCESS GRANTED", "> downloading clips", "  [##########----] 72%", "> 90+ files"].forEach((l, i) => g.fillText(l, 24, 50 + i * 44)); }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 1.3 }); }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M("#3a2a3a", 0.95)} receiveShadow><planeGeometry args={[8, 8]} /></mesh>
      <mesh position={[0, 2.5, -3]} material={M("#4a3a2a", 0.9)}><boxGeometry args={[8, 5, 0.2]} /></mesh>
      <mesh position={[-3.5, 2.5, 0]} material={M("#4a3a2a", 0.9)}><boxGeometry args={[0.2, 5, 8]} /></mesh>
      <mesh position={[0.8, 0.3, 0.3]} material={M("#e8e0d8", 0.9)} castShadow receiveShadow><boxGeometry args={[2.2, 0.6, 2.4]} /></mesh>
      <mesh position={[0.8, 0.62, 0.6]} material={M("#8a2a3a", 0.9)} castShadow><boxGeometry args={[2.25, 0.06, 1.8]} /></mesh>
      <mesh position={[0.8, 0.7, -0.75]} material={M("#f2f0ea", 0.9)}><boxGeometry args={[1.6, 0.18, 0.4]} /></mesh>
      <mesh position={[-1.6, 0.5, -2.6]} material={M("#3a2418", 0.6)} castShadow><boxGeometry args={[2.2, 1.0, 0.6]} /></mesh>
      <mesh position={[-1.6, 1.55, -2.75]} material={M("#0a0a10", 0.3)}><boxGeometry args={[1.6, 0.95, 0.06]} /></mesh>
      <mesh position={[-1.6, 1.55, -2.71]} material={tvm}><planeGeometry args={[1.5, 0.85]} /></mesh>
      <mesh position={[-1.05, 1.15, -2.68]} material={M("#202028", 0.4)}><boxGeometry args={[0.18, 0.04, 0.04]} /></mesh>
      <mesh position={[-0.96, 1.15, -2.68]} material={M("#ff9a2a", 0.4, { emissive: "#ff9a2a", emissiveIntensity: 2 })}><boxGeometry args={[0.012, 0.012, 0.012]} /></mesh>
      <pointLight position={[-1.6, 1.5, -2.0]} intensity={8 + Math.sin(t * 9) * 1} distance={7} color="#3affaa" />
      <pointLight position={[2.5, 2.4, 1.5]} intensity={5} distance={8} color="#ff9a5a" />
      {children}
    </group>
  );
};

/* ---------------- theater with a giant view counter ---------------- */
export const Theater: React.FC<{ views: number; children?: React.ReactNode }> = ({ views, children }) => {
  const txt = Math.round(views).toLocaleString("en-US");
  const scr = useMemo(() => { const tx = signCanvas("views" + txt, 1024, 512, (g) => { g.fillStyle = "#14061e"; g.fillRect(0, 0, 1024, 512); g.fillStyle = "#ff2a5a"; g.beginPath(); g.roundRect(60, 50, 150, 100, 20); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(115, 75); g.lineTo(165, 100); g.lineTo(115, 125); g.closePath(); g.fill(); g.font = "900 70px Arial Black"; g.textAlign = "left"; g.fillText("TRAILER 1", 240, 125); g.textAlign = "center"; g.font = "900 120px Arial Black"; g.fillText(txt, 512, 300); g.font = "700 60px Arial"; g.fillStyle = "#ff9ac0"; g.fillText(views >= 9e7 ? "VIEWS IN 24 HOURS" : "VIEWS", 512, 420); }); return new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: "#ffffff", emissiveIntensity: 1.4 }); }, [txt]);
  const seat = useMemo(() => M("#6a1a3a", 0.8), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M("#1a0a1a", 0.9)}><planeGeometry args={[30, 30]} /></mesh>
      <mesh position={[0, 4.5, -8]} material={scr}><planeGeometry args={[12, 6]} /></mesh>
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 9 }, (_, c) => <mesh key={r + "_" + c} position={[(c - 4) * 1.1, 0.5 + r * 0.25, 2 + r * 1.3]} material={seat} castShadow><boxGeometry args={[0.9, 1.0, 0.8]} /></mesh>))}
      <pointLight position={[0, 4, -5]} intensity={40} distance={20} color="#ff3a8a" />
      {children}
    </group>
  );
};
