// Episode 1 sets: snowy London street (1875), the pub, inside the shelter, the map table.
import React from "react";
import { Box, Cab, Cyl, Ground, House, Lamp, Roof, Shelter, Snow, Window, Fire, Sign } from "../engine/kit";
import { Horse } from "../engine/Toon";
import { cobbles, snowCobbles, planks, sky, snowGround, painted, wallpaper, bricks } from "../engine/tex";
import type { Look, V3 } from "../engine/Stage";

export const nightLook = (): Look => ({
  sky: sky("#0d1640", "#2a3f8f", "#6a7fc9", "#3a4c96", true),
  fog: "#3b4f97", fogNear: 25, fogFar: 110,
  sun: { pos: [-14, 22, 18], color: "#a9bcff", intensity: 1.5, shadow: 26 },
  hemi: { sky: "#7f97ff", ground: "#4a2f6a", intensity: 0.75 },
  ambient: 0.12, exposure: 1.25, aperture: 0.45, warm: "#ffae5a", cool: "#4b46d8", vignette: 0.6, saturation: 1.18,
});

export const dayLook = (): Look => ({
  sky: sky("#2f6fd6", "#6fa6f0", "#cfe2ff", "#ffffff"),
  fog: "#b9cdf2", fogNear: 35, fogFar: 160,
  sun: { pos: [16, 14, 12], color: "#ffd2a0", intensity: 3.4, shadow: 28 },
  hemi: { sky: "#a8c8ff", ground: "#7a4a8a", intensity: 1.05 },
  ambient: 0.1, exposure: 1.05, aperture: 0.4, warm: "#ffb070", cool: "#5a3fc8", vignette: 0.45, saturation: 1.25,
});

export const pubLook = (): Look => ({
  fog: "#2a1408", fogNear: 16, fogFar: 45,
  sun: { pos: [3, 10, 8], color: "#ffcf9a", intensity: 1.1, shadow: 12 },
  hemi: { sky: "#ffc080", ground: "#4a2238", intensity: 0.85 },
  ambient: 0.12, exposure: 1.5, aperture: 0.5, warm: "#ffa040", cool: "#5a2a8a", vignette: 0.75, saturation: 1.2,
});

// Street runs along x. Shelter at the origin in the middle of the road; cabs on the stand at z = 3.2.
export type CabAt = { x: number; z?: number; snow?: boolean; horse?: boolean; walk?: number; rotY?: number };
export const Street: React.FC<{ cabs?: CabAt[]; shelter?: number | false; snowFall?: boolean; pub?: boolean; day?: boolean; children?: React.ReactNode }> = ({ cabs = [-9, -1.5, 6, 13.5, 21].map((x): CabAt => ({ x })), shelter = 1, snowFall = true, pub = true, day = false, children }) => {
  const houses: JSX.Element[] = [];
  const brick = ["#9b4a35", "#8a5a3c", "#a3533b", "#7d4636", "#94604a"];
  for (let i = -6; i <= 6; i++) {
    houses.push(<House key={"n" + i} pos={[i * 6.2, 0, -14]} seed={i + 20} brick={brick[(i + 6) % 5]} h={i % 3 === 0 ? 13.4 : 11} lit={day ? 0.08 : 0.55} />);
    houses.push(<House key={"s" + i} pos={[i * 6.2 + 3, 0, 16]} rotY={Math.PI} seed={i + 50} brick={brick[(i + 8) % 5]} h={i % 2 === 0 ? 13.4 : 11} lit={day ? 0.08 : 0.5} />);
  }
  return (
    <group>
      <Ground map={snowGround([10, 10])} size={240} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1]} receiveShadow>
        <planeGeometry args={[240, 17]} />
        <meshStandardMaterial map={snowCobbles("#8d93ad", [70, 5], 0.95)} roughness={1} />
      </mesh>
      {/* pavements */}
      <Box size={[240, 0.25, 3.2]} pos={[0, 0.12, -8.4]} map={painted("#c9cddc", [40, 1], 400)} />
      <Box size={[240, 0.25, 3.2]} pos={[0, 0.12, 10.4]} map={painted("#c9cddc", [40, 1], 400)} />
      {houses}
      {[-30, -18, -6, 6, 18, 30].map((x) => <Lamp key={"l" + x} pos={[x, 0.25, -7.6]} on={!day} />)}
      {[-24, -12, 0, 12, 24].map((x) => <Lamp key={"m" + x} pos={[x, 0.25, 9.6]} on={!day} />)}
      {shelter !== false ? <Shelter pos={[0, 0, -3]} build={shelter} snow lit={!day} /> : null}
      {cabs.map((c, i) => (
        <group key={"c" + i} position={[c.x, 0, c.z ?? 3.2]} rotation={[0, c.rotY ?? 0, 0]}>
          <Cab pos={[0, 0, 0]} snow={c.snow ?? true} color={["#1d2b22", "#2a1d1d", "#1d2433", "#22261a", "#2b2418"][i % 5]} />
          {c.horse ?? true ? <Horse pos={[2.8, 0, 0]} size={2.6} walk={c.walk ?? 0} color={["#7a4a2c", "#3b2a20", "#9a6a3c", "#5a3a2a", "#c8b49a"][i % 5]} blanket={(c.snow ?? true) ? "#6b2a2a" : undefined} /> : null}
        </group>
      ))}
      {pub ? <PubFront pos={[-12.4, 0, -10]} /> : null}
      {children}
      {snowFall ? <Snow count={day ? 900 : 2600} area={[70, 22, 46]} center={[0, 0, 2]} speed={day ? 0.8 : 1.1} size={0.1} /> : null}
    </group>
  );
};

// Warm pub interior: bar along the back wall, fireplace on the left, tables.
export const Pub: React.FC = () => (
  <group>
    <Ground map={planks("#6b4326", [6, 6])} size={40} />
    <Box size={[24, 7, 0.4]} pos={[0, 3.5, -6]} map={wallpaper("#5d2c2a", "#6e3633", [6, 2])} />
    <Box size={[0.4, 7, 20]} pos={[-10, 3.5, 2]} map={wallpaper("#5d2c2a", "#6e3633", [5, 2])} />
    <Box size={[0.4, 7, 20]} pos={[10, 3.5, 2]} map={wallpaper("#5d2c2a", "#6e3633", [5, 2])} />
    <Box size={[24, 1.2, 0.3]} pos={[0, 0.6, -5.75]} map={planks("#4a2a16", [4, 1])} />
    <Box size={[24, 0.4, 20]} pos={[0, 7.1, 2]} map={planks("#3a2212", [6, 4])} />
    {[-6, -2, 2, 6].map((x) => <Box key={"beam" + x} size={[0.4, 0.5, 20]} pos={[x, 6.7, 2]} color="#2a170b" />)}
    {/* bar */}
    <Box size={[12, 1.3, 1.2]} pos={[2, 0.65, -3.6]} map={planks("#5a3018", [3, 1])} />
    <Box size={[12.4, 0.12, 1.5]} pos={[2, 1.36, -3.6]} color="#2a170b" />
    {/* shelves + bottles */}
    {[2.4, 3.4].map((y) => <Box key={"sh" + y} size={[10, 0.1, 0.5]} pos={[2, y, -5.5]} color="#2a170b" />)}
    {Array.from({ length: 26 }).map((_, i) => (
      <Cyl key={"b" + i} r={0.09} h={0.5} pos={[-2.6 + (i % 13) * 0.72, (i < 13 ? 2.4 : 3.4) + 0.3, -5.45]} color={["#2f6b3a", "#7a3a1a", "#c9a227", "#3a3a7a"][i % 4]} rough={0.3} />
    ))}
    {/* barrels */}
    {[-1, 0.6].map((x, i) => <Cyl key={"barrel" + i} r={0.5} r2={0.45} h={1.1} pos={[x - 4.5, 0.55, -4.8]} map={planks("#7a4a26", [1, 1], true)} />)}
    {/* fireplace */}
    <Box size={[3, 3.2, 1.2]} pos={[-9.3, 1.6, -2]} map={bricks("#7d4636", [0.6, 0.6])} />
    <Box size={[1.6, 1.4, 1.0]} pos={[-8.9, 0.8, -2]} color="#140a06" />
    <Box size={[3.4, 0.3, 1.5]} pos={[-9.2, 3.25, -2]} color="#2a170b" />
    <Fire pos={[-8.7, 0.15, -2]} scale={1.1} light={10} />
    {/* tables */}
    {[[-3, 1.2], [3.5, 2.5], [-5.5, 4.2]].map(([x, z], i) => (
      <group key={"t" + i} position={[x, 0, z]}>
        <Cyl r={0.9} h={0.12} pos={[0, 1.0, 0]} map={planks("#5a3018", [1, 1])} />
        <Cyl r={0.12} h={1.0} pos={[0, 0.5, 0]} color="#2a170b" />
      </group>
    ))}
    {/* hanging lamps */}
    {[-4, 0, 4].map((x) => (
      <group key={"hl" + x} position={[x, 5.6, 0]}>
        <Cyl r={0.02} h={1.6} pos={[0, 0.8, 0]} color="#111" />
        <mesh><sphereGeometry args={[0.32, 16, 12]} /><meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={3} /></mesh>
        <pointLight intensity={30} distance={14} decay={2} color="#ffb35c" />
      </group>
    ))}
    {/* frosted front windows showing the blue night */}
    <Window w={2.4} h={2.6} pos={[10 - 0.21, 2.8, 0]} rotY={-Math.PI / 2} lit={false} panes={[3, 3]} frame="#3a2212" />
    <Window w={2.4} h={2.6} pos={[10 - 0.21, 2.8, 5]} rotY={-Math.PI / 2} lit={false} panes={[3, 3]} frame="#3a2212" />
  </group>
);

// Inside the shelter: one long table, benches, a stove with a kettle, small windows onto the snow.
export const ShelterInside: React.FC<{ signLines?: string[]; open?: boolean }> = ({ signLines = ["NO DRINKING", "NO GAMBLING", "NO SWEARING"], open = true }) => (
  <group>
    <Ground map={planks("#6e4a2a", [3, 3])} size={20} />
    <Box size={[5.2, 3, 0.2]} pos={[0, 1.5, -1.15]} map={planks("#8f6e4a", [1, 1], true)} />
    {open ? null : <Box size={[5.2, 3, 0.2]} pos={[0, 1.5, 1.15]} map={planks("#8f6e4a", [1, 1], true)} />}
    <Box size={[0.2, 3, 2.3]} pos={[-2.6, 1.5, 0]} map={planks("#8f6e4a", [1, 1], true)} />
    <Box size={[0.2, 3, 2.3]} pos={[2.6, 1.5, 0]} map={planks("#7f6040", [1, 1], true)} />
    <Box size={[5.4, 0.15, 2.5]} pos={[0, 3.05, 0]} map={planks("#8a6a44", [1, 1])} />
    {[-1.75, -0.45].map((x, i) => <Window key={"w" + i} w={0.95} h={0.85} pos={[x, 1.95, -1.04]} lit={false} panes={[3, 2]} frame="#f0e6cc" />)}
    {/* table + benches */}
    <Box size={[3.6, 0.1, 0.8]} pos={[-0.2, 0.95, 0]} map={planks("#7a4a26", [1, 1])} />
    <Box size={[0.1, 0.9, 0.6]} pos={[-1.8, 0.45, 0]} color="#3a2416" />
    <Box size={[0.1, 0.9, 0.6]} pos={[1.4, 0.45, 0]} color="#3a2416" />
    <Box size={[3.6, 0.1, 0.35]} pos={[-0.2, 0.55, -0.72]} color="#5a3018" />
    <Box size={[3.6, 0.1, 0.35]} pos={[-0.2, 0.55, 0.72]} color="#5a3018" />
    {/* cups and plates on the table */}
    {Array.from({ length: 6 }).map((_, i) => (
      <group key={"cup" + i} position={[-1.6 + i * 0.58, 1.0, i % 2 ? 0.22 : -0.22]}>
        <Cyl r={0.07} r2={0.09} h={0.13} pos={[0, 0.07, 0]} color="#f4f1ea" rough={0.4} />
        <Cyl r={0.17} h={0.02} pos={[0.16, 0.01, 0]} color="#f4f1ea" rough={0.4} />
      </group>
    ))}
    {/* stove + kettle at the far end */}
    <Box size={[0.7, 1.0, 0.7]} pos={[2.15, 0.5, 0.6]} color="#1a1a1e" rough={0.5} />
    <Cyl r={0.08} h={2.2} pos={[2.35, 2.0, 0.75]} color="#1a1a1e" />
    <Cyl r={0.2} r2={0.12} h={0.3} pos={[2.15, 1.15, 0.6]} color="#b88a3a" rough={0.35} />
    <Fire pos={[2.15, 0.25, 0.95]} scale={0.35} light={6} />
    <Sign lines={signLines} pos={[1.25, 1.95, -1.02]} w={1.5} h={0.95} />
    <pointLight position={[0, 2.6, 0]} intensity={6} distance={7} decay={1.4} color="#ffc070" />
  </group>
);

// Pub front on the north side: big warm windows, a hanging sign
export const PubFront: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Box size={[6.4, 3.6, 0.5]} pos={[0, 1.8, 0]} map={painted("#3a1a12", [2, 1], 400)} />
    <Window w={2.0} h={2.0} pos={[-1.9, 1.7, 0.26]} lit panes={[3, 3]} frame="#c9a227" />
    <Window w={2.0} h={2.0} pos={[1.9, 1.7, 0.26]} lit panes={[3, 3]} frame="#c9a227" />
    <Box size={[1.1, 2.6, 0.2]} pos={[0, 1.3, 0.3]} color="#5a1a12" />
    <mesh position={[0, 1.3, 0.41]}><planeGeometry args={[0.6, 1.2]} /><meshStandardMaterial color="#ffc773" emissive="#ffae4a" emissiveIntensity={1.4} /></mesh>
    <Sign lines={["THE RED LION"]} pos={[0, 3.25, 0.32]} w={5.4} h={0.55} bg="#1d1d1d" fg="#e8c45a" />
    <pointLight position={[0, 1.6, 1.6]} intensity={20} distance={8} decay={2} color="#ffa64d" />
  </group>
);

// A simple horse-drawn cart (open bed, two wheels) along +x
export const Cart: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[3.0, 0.2, 1.7]} pos={[0, 1.05, 0]} map={planks("#8a5a30", [1, 1])} />
    <Box size={[3.0, 0.5, 0.1]} pos={[0, 1.4, 0.85]} map={planks("#7a4a26", [1, 1])} />
    <Box size={[3.0, 0.5, 0.1]} pos={[0, 1.4, -0.85]} map={planks("#7a4a26", [1, 1])} />
    <Box size={[0.1, 0.5, 1.7]} pos={[-1.5, 1.4, 0]} map={planks("#7a4a26", [1, 1])} />
    {[0.95, -0.95].map((z) => (
      <mesh key={z} position={[-0.2, 0.75, z]} castShadow><torusGeometry args={[0.72, 0.07, 8, 28]} /><meshStandardMaterial color="#3a2416" /></mesh>
    ))}
    <Box size={[2.6, 0.08, 0.08]} pos={[2.6, 0.95, 0.5]} color="#3a2416" />
    <Box size={[2.6, 0.08, 0.08]} pos={[2.6, 0.95, -0.5]} color="#3a2416" />
    <Cyl r={0.35} h={0.6} pos={[-0.6, 1.45, 0.2]} map={planks("#7a4a26", [1, 1], true)} />
    <Box size={[0.7, 0.5, 0.6]} pos={[0.5, 1.4, -0.2]} color="#c9a46a" />
  </group>
);

export const Spot = { shelterDoor: [2.75, 0.3, 0.4] as V3, hatch: [3.4, 0, -0.55] as V3 };
export { Cyl, Box, Roof };

// ---- the map table (61 huts pop up, 48 disappear, 13 stay) ----
import * as THREE from "three";
import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { rng } from "../engine/tex";

const mapTex = () => {
  const c = document.createElement("canvas"); c.width = c.height = 2048;
  const g = c.getContext("2d")!; const r = rng(9);
  g.fillStyle = "#e9d9b0"; g.fillRect(0, 0, 2048, 2048);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,80,30,${r() * 0.08})`; g.beginPath(); g.arc(r() * 2048, r() * 2048, 2 + r() * 20, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(90,60,30,0.55)"; g.lineWidth = 5;
  for (let i = 0; i < 70; i++) { g.beginPath(); const x = r() * 2048, y = r() * 2048; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 900, y + (r() - 0.5) * 900); g.stroke(); }
  g.strokeStyle = "#5f8fb0"; g.lineWidth = 90; g.lineCap = "round";
  g.beginPath(); g.moveTo(-50, 1300); g.bezierCurveTo(500, 1500, 700, 900, 1100, 1150); g.bezierCurveTo(1450, 1350, 1600, 1000, 2100, 1200); g.stroke();
  g.strokeStyle = "rgba(30,40,60,0.6)"; g.lineWidth = 6; g.stroke();
  g.fillStyle = "rgba(60,40,20,0.85)"; g.font = "italic 900 110px Georgia"; g.textAlign = "center"; g.fillText("LONDON", 1024, 300);
  g.font = "italic 700 50px Georgia"; g.fillText("Cabmen's Shelters", 1024, 380);
  g.strokeStyle = "rgba(60,40,20,0.8)"; g.lineWidth = 14; g.strokeRect(40, 40, 1968, 1968);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

export const MapTable: React.FC<{ phase: "build" | "survive"; t0?: number }> = ({ phase }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const tex = useMemo(mapTex, []);
  const huts = useMemo(() => { const r = rng(61); const a: { x: number; z: number; keep: boolean; d: number }[] = [];
    const keep = new Set([3, 8, 12, 17, 22, 27, 31, 36, 40, 45, 50, 54, 59]);
    for (let i = 0; i < 61; i++) { let x = 0, z = 0; do { x = (r() - 0.5) * 7.2; z = (r() - 0.5) * 7.2; } while (Math.abs(z - 0.9 - Math.sin(x * 0.6) * 0.6) < 0.45 || z < -2.6); a.push({ x, z, keep: keep.has(i), d: r() }); }
    return a; }, []);
  return (
    <group>
      <Ground map={planks("#5a3420", [6, 6])} size={60} y={-0.9} />
      <Box size={[9, 0.3, 9]} pos={[0, -0.15, 0]} map={planks("#6b4022", [2, 2])} />
      <mesh rotation={[-Math.PI / 2, 0, 0.03]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      {huts.map((h, i) => {
        const appear = phase === "build" ? spring({ frame: frame - Math.round(h.d * 1.6 * fps), fps, config: { damping: 12, stiffness: 180 } }) : 1;
        const gone = phase === "survive" && !h.keep ? 1 - spring({ frame: frame - Math.round((0.1 + h.d * 0.9) * fps), fps, config: { damping: 20 } }) : 1;
        const s = Math.max(0.001, appear * gone);
        const glow = phase === "survive" && h.keep ? Math.min(1, frame / (1.2 * fps)) : 0;
        return (
          <group key={i} position={[h.x, 0, h.z]} scale={[s, s, s]}>
            <Box size={[0.36, 0.2, 0.18]} pos={[0, 0.1, 0]} color="#1f6a40" emissive={glow ? "#3aff8a" : undefined} emissiveIntensity={glow * 0.8} />
            <Roof w={0.36} d={0.18} h={0.1} pos={[0, 0.2, 0]} over={0.03} color="#174d30" />
          </group>
        );
      })}
    </group>
  );
};

// Rubber stamp that lands on a paper: "GRADE II LISTED"
export const Stamp: React.FC<{ pos: V3; at: number }> = ({ pos, at }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 14, stiffness: 220 } });
  const y = 2.2 - 2.0 * Math.min(1, k) + (frame > (at + 0.5) * fps ? Math.min(1.6, (frame - (at + 0.5) * fps) / 10) : 0);
  const inked = frame > (at + 0.18) * fps;
  const paper = useMemo(() => { const c = document.createElement("canvas"); c.width = 1024; c.height = 700; const g = c.getContext("2d")!;
    g.fillStyle = "#f3ecd8"; g.fillRect(0, 0, 1024, 700); g.fillStyle = "rgba(40,30,20,0.8)"; g.font = "700 54px Georgia"; g.textAlign = "center"; g.fillText("CABMEN'S SHELTER", 512, 120);
    for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(40,30,20,0.35)"; g.fillRect(140, 190 + i * 50, i % 3 === 2 ? 480 : 740, 14); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }, []);
  const ink = useMemo(() => { const c = document.createElement("canvas"); c.width = 1024; c.height = 700; const g = c.getContext("2d")!;
    g.translate(512, 380); g.rotate(-0.12); g.strokeStyle = "#c0262c"; g.lineWidth = 22; g.strokeRect(-330, -110, 660, 220);
    g.fillStyle = "#c0262c"; g.font = "900 120px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LISTED", 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }, []);
  return (
    <group position={pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0.08]} position={[0, 0.02, 0]} receiveShadow><planeGeometry args={[2.2, 1.5]} /><meshStandardMaterial map={paper} roughness={1} /></mesh>
      {inked ? <mesh rotation={[-Math.PI / 2, 0, 0.08]} position={[0, 0.025, 0]}><planeGeometry args={[2.2, 1.5]} /><meshStandardMaterial map={ink} transparent roughness={1} /></mesh> : null}
      <group position={[0, y, 0]}>
        <Box size={[1.5, 0.18, 0.55]} pos={[0, 0.09, 0]} color="#2a1a12" />
        <Box size={[1.4, 0.08, 0.5]} pos={[0, 0.0, 0]} color="#c0262c" />
        <Cyl r={0.12} h={0.7} pos={[0, 0.5, 0]} color="#6b3a1e" />
        <mesh position={[0, 0.95, 0]} castShadow><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#6b3a1e" roughness={0.6} /></mesh>
      </group>
    </group>
  );
};
