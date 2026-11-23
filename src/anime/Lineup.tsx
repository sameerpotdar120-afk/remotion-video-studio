// Scene line-up: several of our characters at true relative height, optionally with their horses behind them.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFresh, setMorphs } from "./kit";
import { relaxArms } from "./VrmView";
import { CAST } from "./cast";
import { buildHorse, HORSES } from "./horse";

const Scene: React.FC<{ ids: string[]; horses: boolean; gap: number }> = ({ ids, horses, gap }) => {
  const { scene, camera, advance } = useThree();
  const [h] = React.useState(() => delayRender("lineup", { timeoutInMilliseconds: 600000 }));
  React.useEffect(() => {
    (async () => {
      const n = ids.length;
      for (let i = 0; i < n; i++) {
        const def = CAST.find((c) => c.id === ids[i])!; const vrm = await loadFresh(staticFile(def.base)); const b = def.build(vrm); relaxArms(vrm);
        vrm.update(0); setMorphs(vrm, b.face ?? {}); const x = (i - (n - 1) / 2) * gap; vrm.scene.position.x += x; scene.add(vrm.scene);
        const hid = ids[i].replace("_armed", "");
        if (horses && HORSES[hid]) { const hz = await buildHorse(staticFile("anime/Horse.fbx"), HORSES[hid]); hz.root.position.set(x - 0.15, 0, -1.6); hz.root.rotation.y = -0.5; scene.add(hz.root); const a = hz.clips.idle; if (a) { hz.mixer.clipAction(a).play(); hz.mixer.setTime(i * 0.7); } }
      }
      const c = camera as THREE.PerspectiveCamera; const w = n * gap; const d = w / (2 * Math.tan((24 * Math.PI) / 360) * (16 / 9)) * 1.05 + 2;
      c.position.set(0, 1.25, d); c.lookAt(0, 1.05, 0); c.fov = 24; c.updateProjectionMatrix();
      setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 600);
    })().catch((e) => { console.error(e); continueRender(h); });
  }, []);
  return (<><ambientLight intensity={0.75} /><directionalLight position={[2, 4, 4]} intensity={2.2} /><directionalLight position={[-3, 2, -2]} intensity={0.7} color="#bcd0ff" />
    <mesh rotation-x={-Math.PI / 2} position-y={0}><planeGeometry args={[60, 60]} /><meshToonMaterial color="#cdbf9f" /></mesh></>);
};
export const Lineup: React.FC<{ ids?: string[]; horses?: boolean; gap?: number }> = ({ ids = ["silas"], horses = false, gap = 1.05 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#f0d9b8, #e7b98a 60%, #c99a6a)" }}>
    <ThreeCanvas width={1920} height={1080} camera={{ fov: 24, position: [0, 1.2, 8] }} gl={{ antialias: true }}><Scene ids={ids} horses={horses} gap={gap} /></ThreeCanvas>
  </AbsoluteFill>
);
