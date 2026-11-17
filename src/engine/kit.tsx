// World kit: simple shapes with painted textures. Ink lines come for free from the edge pass, so keep shapes chunky.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bricks, painted, planks, roofSlate, signTex, rng, shade } from "./tex";
import { LAYER_FX, V3 } from "./Stage";

type M = { color?: string; map?: THREE.Texture; emissive?: string; emissiveIntensity?: number; rough?: number };
const Mat: React.FC<M> = ({ color = "#ffffff", map, emissive, emissiveIntensity = 1, rough = 0.92 }) => (
  <meshStandardMaterial color={map ? "#ffffff" : color} map={map} roughness={rough} metalness={0} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? emissiveIntensity : 0} />
);

export const Box: React.FC<M & { size: V3; pos?: V3; rot?: V3; shadow?: boolean }> = ({ size, pos = [0, 0, 0], rot = [0, 0, 0], shadow = true, ...m }) => (
  <mesh position={pos} rotation={rot} castShadow={shadow} receiveShadow>
    <boxGeometry args={size} />
    <Mat {...m} />
  </mesh>
);

export const Cyl: React.FC<M & { r: number; r2?: number; h: number; pos?: V3; rot?: V3; seg?: number }> = ({ r, r2, h, pos = [0, 0, 0], rot = [0, 0, 0], seg = 20, ...m }) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
    <Mat {...m} />
  </mesh>
);

export const Ground: React.FC<{ map: THREE.Texture; size?: number; y?: number; pos?: V3 }> = ({ map, size = 200, y = 0, pos = [0, 0, 0] }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], y, pos[2]]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial map={map} roughness={1} />
  </mesh>
);

// Pitched roof (triangular prism) along x
export const Roof: React.FC<M & { w: number; d: number; h: number; pos: V3; over?: number }> = ({ w, d, h, pos, over = 0.25, ...m }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2 - over, 0); s.lineTo(0, h); s.lineTo(d / 2 + over, 0); s.lineTo(-d / 2 - over, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w + over * 2, bevelEnabled: false });
    g.translate(0, 0, -(w + over * 2) / 2); g.rotateY(Math.PI / 2);
    return g;
  }, [w, d, h, over]);
  return (
    <mesh geometry={geo} position={pos} castShadow receiveShadow>
      <Mat {...m} />
    </mesh>
  );
};

// Glowing window with frame + mullions. lit = warm light behind it
export const Window: React.FC<{ w: number; h: number; pos: V3; rotY?: number; lit?: boolean; frame?: string; panes?: [number, number] }> = ({ w, h, pos, rotY = 0, lit = true, frame = "#efe6d2", panes = [2, 3] }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={lit ? "#ffc773" : "#4d6fa6"} emissive={lit ? "#ffae4a" : "#2a4a7a"} emissiveIntensity={lit ? 1.6 : 0.35} roughness={0.25} />
    </mesh>
    <Box size={[w + 0.16, 0.1, 0.12]} pos={[0, h / 2 + 0.04, 0.03]} color={frame} />
    <Box size={[w + 0.24, 0.1, 0.2]} pos={[0, -h / 2 - 0.04, 0.06]} color={frame} />
    <Box size={[0.08, h, 0.1]} pos={[-w / 2 - 0.04, 0, 0.03]} color={frame} />
    <Box size={[0.08, h, 0.1]} pos={[w / 2 + 0.04, 0, 0.03]} color={frame} />
    {Array.from({ length: panes[0] - 1 }).map((_, i) => <Box key={"v" + i} size={[0.05, h, 0.06]} pos={[-w / 2 + (w / panes[0]) * (i + 1), 0, 0.03]} color={frame} shadow={false} />)}
    {Array.from({ length: panes[1] - 1 }).map((_, i) => <Box key={"h" + i} size={[w, 0.05, 0.06]} pos={[0, -h / 2 + (h / panes[1]) * (i + 1), 0.03]} color={frame} shadow={false} />)}
  </group>
);

// Victorian terrace house: brick front, 3 floors of windows, door, cornice, chimneys, slate roof.
export const House: React.FC<{ pos: V3; w?: number; h?: number; d?: number; rotY?: number; brick?: string; seed?: number; lit?: number; door?: string }> = ({ pos, w = 6, h = 11, d = 8, rotY = 0, brick = "#9b4a35", seed = 1, lit = 0.6, door = "#203a5c" }) => {
  const r = rng(seed);
  const wins: JSX.Element[] = [];
  const floors = Math.floor(h / 3.4);
  for (let f = 0; f < floors; f++)
    for (let i = 0; i < 2; i++) {
      if (f === 0 && i === 0) continue;
      wins.push(<Window key={f + "-" + i} w={1.25} h={1.9} pos={[-w / 4 + (i * w) / 2, 2.2 + f * 3.3, d / 2 + 0.01]} lit={r() < lit} />);
    }
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[w, h, d]} pos={[0, h / 2, 0]} map={bricks(brick, [w / 6, h / 6])} />
      <Box size={[w + 0.3, 0.5, d + 0.3]} pos={[0, h + 0.1, 0]} color="#e3d8c2" />
      <Box size={[w + 0.1, 0.35, d + 0.1]} pos={[0, 3.4, 0]} color="#d8ccb4" />
      <Roof w={w} d={d} h={2.6} pos={[0, h + 0.35, 0]} over={0.15} map={roofSlate("#4a4f5c", [w / 4, 1.5])} />
      <Box size={[0.9, 2.2, 0.9]} pos={[w / 2 - 0.8, h + 2.2, -d / 6]} map={bricks(shade(brick, 0.85), [0.3, 0.4])} />
      <Cyl r={0.16} h={0.5} pos={[w / 2 - 0.95, h + 3.5, -d / 6]} color="#8a4b2e" />
      <Cyl r={0.16} h={0.5} pos={[w / 2 - 0.62, h + 3.5, -d / 6]} color="#8a4b2e" />
      <Box size={[1.2, 2.4, 0.2]} pos={[-w / 4, 1.2, d / 2 + 0.02]} color={door} />
      <Box size={[1.6, 0.2, 0.5]} pos={[-w / 4, 2.55, d / 2 + 0.2]} color="#e3d8c2" />
      <Box size={[1.8, 0.3, 1.0]} pos={[-w / 4, 0.15, d / 2 + 0.5]} color="#a59c8f" />
      {wins}
    </group>
  );
};

// Gas lamp post with a real warm light
export const Lamp: React.FC<{ pos: V3; light?: number; dist?: number; on?: boolean }> = ({ pos, light = 45, dist = 16, on = true }) => (
  <group position={pos}>
    <Cyl r={0.09} r2={0.07} h={3.6} pos={[0, 1.8, 0]} color="#1f2a24" />
    <Cyl r={0.22} h={0.3} pos={[0, 0.15, 0]} color="#1f2a24" />
    <mesh position={[0, 3.85, 0]}>
      <cylinderGeometry args={[0.28, 0.18, 0.55, 4]} />
      <meshStandardMaterial color={on ? "#ffd27a" : "#e8e2c8"} emissive="#ffb347" emissiveIntensity={on ? 3 : 0} />
    </mesh>
    <Cyl r={0.06} r2={0.32} h={0.2} pos={[0, 4.2, 0]} seg={4} color="#1f2a24" />
    {on ? <pointLight position={[0, 3.7, 0]} intensity={light} distance={dist} decay={2} color="#ffb35c" castShadow={false} /> : null}
    {on ? (
      <mesh position={[0, 3.85, 0]} layers={LAYER_FX}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshBasicMaterial color="#ffb85c" transparent opacity={0.16} depthWrite={false} fog={false} />
      </mesh>
    ) : null}
  </group>
);

const Wheel: React.FC<{ pos: V3; r?: number; rotY?: number; spin?: number }> = ({ pos, r = 0.85, rotY = 0, spin = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <group rotation={[0, 0, spin]}>
      <mesh castShadow>
        <torusGeometry args={[r, 0.06, 8, 32]} />
        <meshStandardMaterial color="#2a1c14" roughness={0.8} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 6]} castShadow>
          <boxGeometry args={[r * 2, 0.05, 0.05]} />
          <meshStandardMaterial color="#c9a227" roughness={0.7} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
        <meshStandardMaterial color="#2a1c14" />
      </mesh>
    </group>
  </group>
);

// Hansom cab (two big wheels, driver's seat high at the back, shafts forward along +x)
export const Cab: React.FC<{ pos: V3; rotY?: number; color?: string; snow?: boolean; spin?: number }> = ({ pos, rotY = 0, color = "#1d2b22", snow, spin = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[1.5, 1.5, 1.5]} pos={[0.1, 1.55, 0]} map={painted(color, [1, 1], 300)} />
    <Box size={[1.6, 0.12, 1.6]} pos={[0.1, 2.36, 0]} color="#151a17" />
    <Box size={[0.6, 0.9, 1.3]} pos={[0.95, 1.2, 0]} color={shade(color, 1.2)} />
    <Window w={0.55} h={0.5} pos={[0.1, 1.85, 0.76]} lit={false} panes={[1, 1]} frame="#c9a227" />
    <Window w={0.55} h={0.5} pos={[0.1, 1.85, -0.76]} rotY={Math.PI} lit={false} panes={[1, 1]} frame="#c9a227" />
    {/* driver's seat, high at the back */}
    <Box size={[0.25, 1.2, 0.12]} pos={[-0.7, 2.5, 0]} color="#151a17" />
    <Box size={[0.55, 0.12, 0.7]} pos={[-0.85, 3.05, 0]} color="#3a2416" />
    {snow ? <Box size={[0.58, 0.1, 0.72]} pos={[-0.85, 3.14, 0]} color="#f2f5fb" /> : null}
    {snow ? <Box size={[1.62, 0.12, 1.62]} pos={[0.1, 2.46, 0]} color="#f2f5fb" /> : null}
    <Wheel pos={[0.1, 0.9, 0.95]} spin={spin} />
    <Wheel pos={[0.1, 0.9, -0.95]} spin={spin} />
    <Box size={[3.2, 0.08, 0.08]} pos={[2.4, 1.05, 0.55]} rot={[0, 0, 0.12]} color="#3a2416" />
    <Box size={[3.2, 0.08, 0.08]} pos={[2.4, 1.05, -0.55]} rot={[0, 0, 0.12]} color="#3a2416" />
  </group>
);

// The green cabmen's shelter (about the size of a horse and cart): green planks, small-pane windows, pitched roof + vent turret.
export const Shelter: React.FC<{ pos: V3; rotY?: number; build?: number; hatch?: boolean; lit?: boolean; snow?: boolean; hollow?: boolean; children?: React.ReactNode }> = ({ pos, rotY = 0, build = 1, hatch = true, lit = true, snow, hollow, children }) => {
  const L = 5.2, D = 2.3, H = 2.7;
  const green = "#1f5a3a";
  const show = (k: number) => build >= k;
  const wall = planks(green, [1, 1], true);
  const W = (x: number, y: number, w: number, h: number, z: number) => <Box key={x + "-" + y + "-" + z} size={[w, h, 0.12]} pos={[x, y, z]} map={wall} />;
  // front wall with real holes for the 3 windows (so you can see inside)
  const front = (z: number) => [
    W(0, 0.3 + 0.6, L, 1.2, z), W(0, 2.4 + 0.3, L, 0.6, z),
    W(-2.35, 1.95, 0.5, 0.9, z), W(-0.8, 1.95, 0.6, 0.9, z), W(0.8, 1.95, 0.6, 0.9, z), W(2.35, 1.95, 0.5, 0.9, z), W(0, 1.5 + 0.0, L, 0.06, z),
  ];
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[L + 0.2, 0.3, D + 0.2]} pos={[0, 0.15, 0]} color="#3b3a37" />
      {show(0.25) && !hollow ? <Box size={[L, H, D]} pos={[0, 0.3 + H / 2, 0]} map={wall} /> : null}
      {show(0.25) && hollow ? (
        <group>
          {front(D / 2 - 0.06)}
          <Box size={[L, H, 0.12]} pos={[0, 0.3 + H / 2, -D / 2 + 0.06]} map={wall} />
          <Box size={[0.12, H, D]} pos={[-L / 2 + 0.06, 0.3 + H / 2, 0]} map={wall} />
          <Box size={[0.12, H, D]} pos={[L / 2 - 0.06, 0.3 + H / 2, 0]} map={wall} />
          <Box size={[L, 0.1, D]} pos={[0, 0.3 + H - 0.05, 0]} map={planks("#c9b48a", [1, 1])} />
          {[-1.6, 0, 1.6].map((x, i) => (
            <group key={"g" + i} position={[x, 1.95, D / 2 - 0.02]}>
              <mesh><planeGeometry args={[1.0, 0.9]} /><meshStandardMaterial color="#ffd9a0" transparent opacity={0.22} emissive="#ffae4a" emissiveIntensity={0.25} roughness={0.2} /></mesh>
              <Box size={[1.16, 0.1, 0.12]} pos={[0, 0.49, 0.03]} color="#e8dcc0" />
              <Box size={[1.24, 0.1, 0.2]} pos={[0, -0.49, 0.06]} color="#e8dcc0" />
              <Box size={[0.05, 0.9, 0.06]} pos={[-0.17, 0, 0.03]} color="#e8dcc0" shadow={false} />
              <Box size={[0.05, 0.9, 0.06]} pos={[0.17, 0, 0.03]} color="#e8dcc0" shadow={false} />
              <Box size={[1.0, 0.05, 0.06]} pos={[0, 0, 0.03]} color="#e8dcc0" shadow={false} />
            </group>
          ))}
          {children}
        </group>
      ) : null}
      {show(0.25) && !hollow ? [-1.6, 0, 1.6].map((x, i) => <Window key={"wf" + i} w={1.0} h={0.9} pos={[x, 1.95, D / 2 + 0.01]} lit={lit} panes={[3, 2]} frame="#e8dcc0" />) : null}
      {show(0.25) ? [-1.6, 0, 1.6].map((x, i) => <Window key={"wb" + i} w={1.0} h={0.9} pos={[x, 1.95, -D / 2 - 0.01]} rotY={Math.PI} lit={lit} panes={[3, 2]} frame="#e8dcc0" />) : null}
      {show(0.25) ? <Box size={[0.14, 2.2, 1.0]} pos={[L / 2 + 0.02, 1.4, 0.4]} color="#173f29" /> : null}
      {show(0.25) && hatch ? <Window w={0.8} h={0.6} pos={[L / 2 + 0.02, 1.85, -0.55]} rotY={Math.PI / 2} lit={lit} panes={[1, 1]} frame="#e8dcc0" /> : null}
      {show(0.25) ? <Box size={[L + 0.1, 0.18, D + 0.1]} pos={[0, 0.3 + H, 0]} color="#e8dcc0" /> : null}
      {show(0.6) ? <Roof w={L} d={D} h={1.1} pos={[0, 0.39 + H, 0]} over={0.28} map={painted("#22603f", [2, 1], 500)} /> : null}
      {show(0.6) && snow ? <Roof w={L} d={D} h={1.12} pos={[0, 0.44 + H, 0]} over={0.3} color="#f2f5fb" /> : null}
      {show(0.85) ? (
        <group position={[0, 0.39 + H + 1.1, 0]}>
          <Box size={[0.9, 0.55, 0.7]} pos={[0, 0.2, 0]} color="#1f5a3a" />
          <Roof w={0.9} d={0.7} h={0.4} pos={[0, 0.47, 0]} over={0.12} color="#173f29" />
        </group>
      ) : null}
      {lit && show(0.25) ? <pointLight position={[0, 1.6, 2.2]} intensity={14} distance={7} decay={2} color="#ffb35c" /> : null}
      {lit && hollow ? <pointLight position={[0, 2.3, 0]} intensity={8} distance={5} decay={2} color="#ffc070" /> : null}
    </group>
  );
};

// Falling snow (screen-friendly round flakes), deterministic per frame
export const Snow: React.FC<{ count?: number; area?: [number, number, number]; center?: V3; speed?: number; size?: number }> = ({ count = 1500, area = [40, 20, 40], center = [0, 0, 0], speed = 1.2, size = 0.09 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { geo, base, tex } = useMemo(() => {
    const r = rng(77);
    const base = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) { base[i * 4] = r(); base[i * 4 + 1] = r(); base[i * 4 + 2] = r(); base[i * 4 + 3] = 0.5 + r(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d")!; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return { geo, base, tex };
  }, [count]);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const s = base[i * 4 + 3];
    const y = (((base[i * 4 + 1] - (t * speed * s) / area[1]) % 1) + 1) % 1;
    pos.setXYZ(i, center[0] + (base[i * 4] - 0.5) * area[0] + Math.sin(t * 0.8 + i) * 0.3, center[1] + y * area[1], center[2] + (base[i * 4 + 2] - 0.5) * area[2]);
  }
  pos.needsUpdate = true;
  return (
    <points geometry={geo} layers={LAYER_FX}>
      <pointsMaterial map={tex} size={size} sizeAttenuation transparent depthWrite={false} color="#ffffff" opacity={0.9} />
    </points>
  );
};

// Flat sign with painted lettering
export const Sign: React.FC<{ lines: string[]; pos: V3; w?: number; h?: number; rotY?: number; bg?: string; fg?: string }> = ({ lines, pos, w = 2, h = 1, rotY = 0, bg, fg }) => (
  <mesh position={pos} rotation={[0, rotY, 0]} castShadow>
    <boxGeometry args={[w, h, 0.06]} />
    <meshStandardMaterial attach="material-4" map={signTex(lines, bg, fg)} roughness={0.8} />
    <meshStandardMaterial attach="material-0" color="#3a2416" />
    <meshStandardMaterial attach="material-1" color="#3a2416" />
    <meshStandardMaterial attach="material-2" color="#3a2416" />
    <meshStandardMaterial attach="material-3" color="#3a2416" />
    <meshStandardMaterial attach="material-5" color="#3a2416" />
  </mesh>
);

// Flickering fire (fireplace / stove)
export const Fire: React.FC<{ pos: V3; scale?: number; light?: number }> = ({ pos, scale = 1, light = 8 }) => {
  const frame = useCurrentFrame();
  const f = 0.85 + Math.sin(frame * 0.9) * 0.08 + Math.sin(frame * 2.3) * 0.06;
  return (
    <group position={pos} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.22, 0.25 * f, 0]} scale={[1, f * (1 - i * 0.12 + (i === 1 ? 0.3 : 0)), 1]}>
          <coneGeometry args={[0.18, 0.7, 8]} />
          <meshBasicMaterial color={i === 1 ? "#ffd36a" : "#ff8a2a"} fog={false} />
        </mesh>
      ))}
      <pointLight position={[0, 0.6, 0.4]} intensity={light * f} distance={10} decay={1.5} color="#ff9a40" />
    </group>
  );
};
