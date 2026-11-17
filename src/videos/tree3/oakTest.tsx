// TEMPORARY private test entry for oak.ts look-dev (helper 2). Delete when done.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { TREE, SUN_DIR, WIND, groundY, Part } from "./world";
import { buildOak } from "./oak";

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const P = getInputProps() as { cx?: number; cy?: number; cz?: number; tx?: number; ty?: number; tz?: number; fov?: number };
  const { camera, scene, gl, advance } = useThree();
  const [parts, setParts] = useState<Part[] | null>(null);
  const [handle] = useState(() => delayRender("oak", { timeoutInMilliseconds: 240000 }));
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight(0xfff1dc, 3.2);
    l.castShadow = true; l.shadow.mapSize.set(4096, 4096); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
    const c = l.shadow.camera as THREE.OrthographicCamera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 400;
    return l;
  }, []);
  useEffect(() => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pmrem = new THREE.PMREMGenerator(gl);
    Promise.all([new RGBELoader().loadAsync(staticFile("tree3/sky.hdr")), buildOak()]).then(([hdr, oak]) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = hdr; scene.environment = pmrem.fromEquirectangular(hdr).texture; scene.environmentIntensity = 0.9;
      const g = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 100, 100).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x5d6b3a, roughness: 1 }));
      const p = g.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setY(i, groundY(p.getX(i), p.getZ(i)) - 0.02);
      g.geometry.computeVertexNormals(); g.receiveShadow = true; scene.add(g);
      scene.add(sun, sun.target, oak.object);
      setParts([oak]);
    });
  }, []);
  useEffect(() => { if (parts) { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); }); } }, [parts]);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(P.cx ?? 9.3, P.cy ?? 1.3, P.cz ?? 40);
  cam.lookAt(P.tx ?? TREE.x, P.ty ?? 7, P.tz ?? 0);
  cam.fov = P.fov ?? 50; cam.near = 0.1; cam.far = 2000; cam.updateProjectionMatrix();
  WIND.value = f / 30;
  sun.target.position.copy(TREE); sun.position.copy(TREE).addScaledVector(SUN_DIR, 200);
  const tone = useMemo(() => new ToneMappingEffect({ mode: ToneMappingMode.AGX }), []);
  return <EffectComposer multisampling={4}><primitive object={tone} dispose={null} /></EffectComposer>;
};
const Comp: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#c4d2e3" }}>
    <ThreeCanvas width={360} height={640} shadows gl={{ antialias: false, stencil: false }} camera={{ fov: 50 }}><Inner /></ThreeCanvas>
  </AbsoluteFill>
);
registerRoot(() => <Composition id="OakTest" component={Comp} durationInFrames={66} fps={30} width={360} height={640} />);
