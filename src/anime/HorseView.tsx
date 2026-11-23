// Horse look-dev: the six anime horses side by side, galloping (or another clip) at a given frame.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { buildHorse, BuiltHorse, HORSES } from "./horse";

const Scene: React.FC<{ yaw: number; clip: string; ids: string[]; onInfo: (s: string) => void }> = ({ yaw, clip, ids, onInfo }) => {
  const { scene, camera, advance } = useThree(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const [h] = React.useState(() => delayRender("horses", { timeoutInMilliseconds: 120000 }));
  const hs = React.useRef<BuiltHorse[]>([]);
  React.useEffect(() => {
    Promise.all(ids.map((id) => buildHorse(staticFile("anime/Horse.fbx"), HORSES[id]))).then((list) => {
      list.forEach((hz, i) => { hz.root.position.x = (i - (list.length - 1) / 2) * 1.9; scene.add(hz.root); const a = hz.clips[clip] ?? Object.values(hz.clips)[0]; hz.mixer.clipAction(a).play(); hz.mixer.setTime(i * 0.13); });
      hs.current = list; const hz0 = list[0]; hz0.mixer.stopAllAction(); hz0.mixer.update(0); hz0.root.updateMatrixWorld(true);
      const P: string[] = []; hz0.root.traverse((b) => { if ((b as THREE.Bone).isBone && ["Body", "Back", "Torso", "Shoulders", "Neck", "Head", "Head_end", "Hips", "Tail1"].includes(b.name)) P.push(b.name + " " + b.getWorldPosition(new THREE.Vector3()).toArray().map((x) => x.toFixed(2)).join(",")); });
      onInfo(P.join("\n") + "\n" + (globalThis as unknown as { __hdbg?: string }).__hdbg); hz0.mixer.clipAction(hz0.clips[clip] ?? Object.values(hz0.clips)[0]).play();
      setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 300);
    }).catch((e) => { onInfo("ERR " + String(e)); continueRender(h); });
  }, []);
  hs.current.forEach((hz, i) => hz.mixer.setTime(f / fps + i * 0.13));
  const c = camera as THREE.PerspectiveCamera; const d = 4 + ids.length * 1.4; c.position.set(Math.sin(yaw) * d, 1.6, Math.cos(yaw) * d); c.lookAt(0, 0.9, 0); c.fov = 30; c.updateProjectionMatrix();
  return (<><ambientLight intensity={0.8} /><directionalLight position={[2, 4, 3]} intensity={2.2} /></>);
};
export const HorseView: React.FC<{ yaw?: number; clip?: string; ids?: string[]; info?: boolean }> = ({ yaw = 1.2, clip = "run", ids = ["silas"], info = false }) => {
  const [txt, setTxt] = React.useState("");
  return (<AbsoluteFill style={{ background: "linear-gradient(#e9e4da, #b9b2a6)" }}>
    <ThreeCanvas width={1280} height={720} camera={{ fov: 30, position: [0, 1, 5] }} gl={{ antialias: true }}><Scene yaw={yaw} clip={clip} ids={ids} onInfo={setTxt} /></ThreeCanvas>
    {info ? <pre style={{ position: "absolute", top: 8, left: 8, fontSize: 15, color: "#000", whiteSpace: "pre-wrap", width: 1260 }}>{txt}</pre> : null}
  </AbsoluteFill>);
};
