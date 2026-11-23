// Character turnaround stills for look-dev: one character, one view (front / 3-4 / side / back / face close-up).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFresh, bonePos, setMorphs } from "./kit";
import { relaxArms } from "./VrmView";
import { CAST } from "./cast";

const Scene: React.FC<{ id: string; yaw: number; face: boolean; onDbg: (s: string) => void; morphs?: Record<string, number> }> = ({ id, yaw, face, onDbg, morphs }) => {
  const { scene, camera, advance } = useThree();
  const [h] = React.useState(() => delayRender("char " + id, { timeoutInMilliseconds: 180000 }));
  React.useEffect(() => {
    const def = CAST.find((c) => c.id === id)!;
    loadFresh(staticFile(def.base)).then((vrm) => {
      const b = def.build(vrm);
      relaxArms(vrm);
      for (const [k, v] of Object.entries(b.expression ?? {})) vrm.expressionManager?.setValue(k, v);
      vrm.update(0); setMorphs(vrm, morphs ?? b.face ?? {}); scene.add(vrm.scene); vrm.scene.updateMatrixWorld(true);
      const c = camera as THREE.PerspectiveCamera; const hd = bonePos(vrm, "head"); const hp = bonePos(vrm, "hips");
      const ty = face ? hd.y + 0.05 : hp.y * 0.98, dist = face ? 0.95 : 3.9;
      c.position.set(Math.sin(yaw) * dist, ty + (face ? 0.02 : 0.05), Math.cos(yaw) * dist); c.lookAt(hd.x, ty, 0); c.fov = 25; c.updateProjectionMatrix();
      const rb = (n: string) => { const b = vrm.humanoid.getRawBoneNode(n as never); return b ? b.scale.toArray().map((x) => x.toFixed(2)).join(",") : "-"; };
      const sh = (n: string) => { const b = vrm.humanoid.getRawBoneNode(n as never)!; return b.getWorldPosition(new THREE.Vector3()).toArray().map((x) => x.toFixed(3)).join(","); };
      const mt = (() => { let o = ""; vrm.scene.traverse((x) => { const m = x as THREE.Mesh & { material: { name: string; shadingShiftFactor?: number; shadingToonyFactor?: number } }; if (m.isMesh && !o && m.material && m.material.name?.includes("Tops")) o = `${m.material.shadingShiftFactor} ${m.material.shadingToonyFactor}`; }); return o; })();
      onDbg(["upperChest " + rb("upperChest"), "head " + rb("head"), "LUpperArm " + rb("leftUpperArm"), "Lshoulder pos " + sh("leftUpperArm"), "Rshoulder pos " + sh("rightUpperArm"), "tops shift/toony " + mt].join("\n"));
      setTimeout(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); }, 500);
    }).catch((e) => { console.error(e); continueRender(h); });
  }, []);
  return (<>
    <ambientLight intensity={0.7} />
    <directionalLight position={[1.6, 3, 2.2]} intensity={2.3} />
    <directionalLight position={[-2, 1.5, -2]} intensity={0.8} color="#bcd0ff" />
  </>);
};

export const CharTurn: React.FC<{ id?: string; yaw?: number; face?: boolean; debug?: boolean; morphs?: Record<string, number> }> = ({ id = "silas", yaw = 0, face = false, debug = false, morphs }) => {
  const [dbg, setDbg] = React.useState("");
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#e9e4da, #b9b2a6)" }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 25, position: [0, 1, 3] }} gl={{ antialias: true }}>
        <Scene id={id} yaw={yaw} face={face} onDbg={setDbg} morphs={morphs} />
      </ThreeCanvas>
      {debug ? <pre style={{ position: "absolute", top: 10, left: 10, fontSize: 20, color: "#000", background: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap", width: 700 }}>{dbg}</pre> : null}
    </AbsoluteFill>
  );
};
