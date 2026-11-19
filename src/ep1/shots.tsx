// Episode 1 shot list: one entry per voice line (episodes/ep1/shots.json). Each shot = a set, a camera glide, the cast.
import React from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CamKeys, Look } from "../engine/Stage";
import { Toon } from "../engine/Toon";
import { Box, Shelter, Snow } from "../engine/kit";
import { Street, Pub, ShelterInside, MapTable, Stamp, Cart, nightLook, pubLook, dayLook, Spot } from "./sets";
import { Horse } from "../engine/Toon";
import { C } from "./cast";

export type Shot = { look: Look; cam: CamKeys; focus: number; Body: React.FC<{ dur: number }> };

const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };

const night = nightLook();
const day = dayLook();
const pub = pubLook();
const inside: Look = { ...pubLook(), fog: "#20140c", fogNear: 8, fogFar: 30, exposure: 1.05, aperture: 0.4, saturation: 1.05, hemi: { sky: "#ffd2a0", ground: "#3a2a3a", intensity: 0.6 } };
const desk: Look = { ...pubLook(), fog: "#1a0f08", fogNear: 12, fogFar: 40, exposure: 1.5, aperture: 0.55, sun: { pos: [4, 12, 6], color: "#ffd9a8", intensity: 2.2, shadow: 8 } };

// the keeper's hand passing a sandwich out of the hatch
const HatchHand: React.FC = () => {
  const t = useT();
  const k = interpolate(t, [0.4, 1.0, 1.6, 2.0], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <group position={[2.75 + k * 0.3, 1.72, Spot.hatch[2] - 3 + 0.05 - k * 0.4]} rotation={[0, 0.93, 0]}>
      <HandCard sandwich={t < 1.25} />
    </group>
  );
};

const HandCard: React.FC<{ sandwich: boolean }> = ({ sandwich }) => {
  const tex = React.useMemo(() => { const c = document.createElement("canvas"); c.width = 512; c.height = 256; return { c, t: new THREE.CanvasTexture(c) }; }, []);
  const g = tex.c.getContext("2d")!; g.clearRect(0, 0, 512, 256);
  g.lineCap = "round"; g.strokeStyle = "#161212"; g.lineWidth = 64; g.beginPath(); g.moveTo(0, 140); g.lineTo(300, 140); g.stroke();
  g.strokeStyle = "#e9e4d8"; g.lineWidth = 48; g.stroke();
  g.fillStyle = "#fbfaf6"; g.lineWidth = 10; g.strokeStyle = "#161212"; g.beginPath(); g.arc(330, 140, 40, 0, 7); g.fill(); g.stroke();
  if (sandwich) { g.fillStyle = "#e9c27a"; g.beginPath(); g.moveTo(330, 120); g.lineTo(470, 120); g.lineTo(400, 30); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#7cb24a"; g.fillRect(345, 104, 110, 12); }
  tex.t.colorSpace = THREE.SRGBColorSpace; tex.t.needsUpdate = true;
  return (
    <mesh position={[0.2, 0, 0]} layers={1}><planeGeometry args={[1.1, 0.55]} /><meshStandardMaterial map={tex.t} alphaTest={0.5} side={THREE.DoubleSide} emissive="#ffffff" emissiveMap={tex.t} emissiveIntensity={0.3} /></mesh>
  );
};

const B = (fn: (t: number, dur: number) => React.ReactNode): React.FC<{ dur: number }> => ({ dur }) => { const t = useT(); return <>{fn(t, dur)}</>; };

export const SHOTS: Record<number, Shot> = {
  1: { look: day, focus: 9, cam: { from: [7, 6.5, 11.3], to: [4.2, 2.3, 7.2], lookFrom: [0, 1.0, -3], lookTo: [0.3, 1.8, -3], fov: 58 },
    Body: B(() => <Street day cabs={[{ x: -16 }, { x: 9 }, { x: 16.5 }]} />) },
  2: { look: day, focus: 3.6, cam: { from: [7.3, 1.4, -0.6], to: [6.7, 1.5, -1.1], lookFrom: [3.5, 1.55, -2.2], fov: 50 },
    Body: B(() => (
      <Street day cabs={[{ x: 9 }, { x: 16.5 }]}>
        <Toon spec={C.gent} pose={{ armR: "hold", prop: "plate", eyes: "sad", mouth: "frown", look: -1 }} pos={[4.55, 0, -1.25]} />
        <Toon spec={C.keeper} pose={{ armL: "cross", armR: "cross", eyes: "angry", mouth: "flat" }} pos={[3.0, 0, -2.75]} seed={3} />
      </Street>
    )) },
  3: { look: day, focus: 3.6, cam: { from: [6.7, 1.5, -1.1], to: [6.3, 1.55, -1.5], lookFrom: [3.5, 1.55, -2.2], fov: 50 },
    Body: B(() => (
      <Street day cabs={[{ x: 9 }, { x: 16.5 }]}>
        <Toon spec={C.gent} pose={{ armR: "hold", prop: "plate", eyes: "wide", mouth: "o", look: -1 }} pos={[4.55, 0, -1.25]} />
        <Toon spec={C.keeper} pose={{ armL: "wave", eyes: "happy", mouth: "grin" }} pos={[3.0, 0, -2.75]} seed={3} />
        <Toon spec={C.cabbie6} pose={{ armR: "hold", prop: "whip", eyes: "happy", mouth: "smile" }} pos={[0, 0, 0]} path={{ from: [6.0, 0, -2.9], to: [3.75, 0, -2.45], start: 0, end: 1.2 }} seed={5} />
      </Street>
    )) },
  4: { look: night, focus: 13, cam: { from: [-15, 9.5, 9.5], to: [-6.5, 3.4, 8.4], lookFrom: [-2, 1.5, -2], lookTo: [2, 2, 0], fov: 60 },
    Body: B(() => <Street shelter={false} />) },
  5: { look: night, focus: 3.3, cam: { from: [-3.0, 1.05, 10.3], to: [-3.5, 1.25, 9.5], lookFrom: [-4.4, 1.85, 6.6], fov: 50 },
    Body: B(() => (
      <Street shelter={false}>
        <Toon spec={C.armstrong} pose={{ armL: "hold", prop: "newspaper", propHand: "L", armR: "up", eyes: "dot", mouth: "open" }} pos={[-4.4, 0, 6.6]} />
      </Street>
    )) },
  6: { look: night, focus: 5.2, cam: { from: [-13, 2.3, 8.4], to: [3.5, 2.3, 8.4], lookFrom: [-7, 1.6, 3.2], lookTo: [9, 1.6, 3.2], fov: 55, ease: "linear" },
    Body: B(() => <Street shelter={false} />) },
  7: { look: night, focus: 3.2, cam: { from: [-5.7, 1.55, 7.9], to: [-5.3, 1.7, 7.2], lookFrom: [-2.7, 2.2, 3.4], fov: 54 },
    Body: B(() => (
      <Street shelter={false}>
        <Toon spec={C.armstrong} pose={{ armL: "hold", prop: "newspaper", propHand: "L", eyes: "wide", mouth: "o", look: 1 }} pos={[-3.3, 0, 4.9]} />
      </Street>
    )) },
  8: { look: pub, focus: 4.2, cam: { from: [0.4, 1.75, 5.6], to: [-0.6, 1.65, 4.7], lookFrom: [-3.0, 1.45, 1.3], lookTo: [-3.2, 1.4, 1.2], fov: 52 },
    Body: B(() => (
      <group>
        <Pub />
        <Toon spec={C.cabbie1} pose={{ armR: "drink", prop: "mug", eyes: "closed", mouth: "smile" }} pos={[-4.3, 0, 1.7]} seed={1} />
        <Toon spec={C.cabbie2} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "grin" }} pos={[-2.0, 0, 2.0]} seed={2} />
        <Toon spec={C.cabbie3} pose={{ armL: "hips", armR: "hold", prop: "mug", eyes: "happy", mouth: "grin" }} pos={[-3.2, 0, 0.3]} seed={3} />
        <Toon spec={C.cabbie4} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "open" }} pos={[-1.4, 0, 0.5]} seed={4} />
        <Toon spec={C.cabbie5} pose={{ armR: "hold", prop: "mug", eyes: "half", mouth: "smile" }} pos={[2.8, 0, -2.6]} seed={6} />
      </group>
    )) },
  9: { look: night, focus: 4, cam: { from: [5.8, 1.45, 9.4], to: [5.8, 1.6, 8.6], lookFrom: [5.8, 1.75, 5.0], fov: 50 },
    Body: B(() => (
      <Street>
        <Toon spec={C.cabbie3} pose={{ eyes: "sad", mouth: "wavy", look: 1 }} pos={[4.9, 0, 5.1]} seed={3} />
        <Toon spec={C.bobby} pose={{ armL: "point", armR: "hips", eyes: "angry", mouth: "flat", look: -1 }} pos={[6.7, 0, 5.3]} h={1.85} seed={8} />
      </Street>
    )) },
  10: { look: night, focus: 4.6, cam: { from: [2.8, 2.5, 8.2], to: [3.5, 2.9, 7.1], lookFrom: [5.1, 3.3, 3.3], fov: 50 },
    Body: B(() => (
      <Street>
        <Toon spec={C.cabbie3} pose={{ sit: true, eyes: "half", mouth: "flat", look: 1, armL: "warm", armR: "warm" }} pos={[5.15, 2.78, 3.45]} seed={3} />
      </Street>
    )) },
  11: { look: { ...night, aperture: 0.6 }, focus: 1.9, cam: { from: [4.55, 3.35, 5.7], to: [4.85, 3.45, 5.1], lookFrom: [5.15, 3.65, 3.45], fov: 44 },
    Body: B(() => (
      <Street>
        <Toon spec={C.cabbie3} pose={{ sit: true, eyes: "sad", mouth: "wavy", shiver: true, armL: "warm", armR: "warm" }} pos={[5.15, 2.78, 3.45]} seed={3} />
        <Snow count={900} area={[6, 6, 6]} center={[5, 1.5, 4.5]} speed={1.4} size={0.05} />
      </Street>
    )) },
  12: { look: night, focus: 5, cam: { from: [-3.4, 2.2, 9.6], to: [-5.4, 2.5, 8.7], lookFrom: [-6.4, 1.5, 4.8], lookTo: [-9.6, 1.6, -3.5], fov: 54 },
    Body: B((t) => (
      <Street>
        <Toon spec={C.boy} pose={{ armR: "up", eyes: "dot", mouth: "smile", prop: t > 0.9 ? "coin" : "none", propHand: "L", armL: t > 0.9 ? "hold" : "down" }} pos={[-5.6, 0, 4.7]} h={1.75} seed={9} />
        <Toon spec={C.cabbie2} pose={{ armR: t < 0.9 ? "point" : "down", prop: t < 0.9 ? "coin" : "none", eyes: "happy", mouth: "grin" }} pos={[0, 0, 0]} path={{ from: [-6.9, 0, 5.0], to: [-12.4, 0, -8.9], start: 1.0, end: 3.4 }} seed={2} />
      </Street>
    )) },
  13: { look: pub, focus: 4.2, cam: { from: [-6.6, 2.3, 5.6], to: [-5.4, 2.0, 4.6], lookFrom: [-2.4, 1.5, 1.2], fov: 56 },
    Body: B(() => (
      <group>
        <Pub />
        <Toon spec={C.cabbie1} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "grin" }} pos={[-4.3, 0, 1.7]} seed={1} />
        <Toon spec={C.cabbie2} pose={{ armR: "up", prop: "mug", eyes: "closed", mouth: "open" }} pos={[-2.0, 0, 2.0]} seed={2} />
        <Toon spec={C.cabbie3} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "grin" }} pos={[-3.2, 0, 0.3]} seed={3} />
        <Toon spec={C.cabbie4} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "open" }} pos={[-1.4, 0, 0.5]} seed={4} />
        <Toon spec={C.cabbie5} pose={{ armR: "up", prop: "mug", eyes: "happy", mouth: "grin" }} pos={[0.2, 0, 1.4]} seed={6} />
        <Toon spec={C.cabbie6} pose={{ armR: "drink", prop: "mug", eyes: "closed", mouth: "smile" }} pos={[3.2, 0, 2.6]} seed={7} />
      </group>
    )) },
  14: { look: day, focus: 5.5, cam: { from: [-3.6, 2.2, 6.2], to: [2.6, 2.1, 6.4], lookFrom: [0, 1.6, -1.8], fov: 56 },
    Body: B((t, dur) => (
      <Street day cabs={[{ x: -14 }, { x: 9 }, { x: 16.5 }]} shelter={interpolate(t, [0, (dur / 30) * 0.7], [0.25, 1], { extrapolateRight: "clamp" })}>
        <Toon spec={C.armstrong} pose={{ armL: "hips", armR: "point", eyes: "happy", mouth: "grin", look: -1 }} pos={[0.85, 0, 0.7]} />
        <Toon spec={C.earl} pose={{ armL: "hips", armR: "hips", eyes: "happy", mouth: "smile" }} pos={[-0.85, 0, 0.7]} seed={4} />
      </Street>
    )) },
  15: { look: inside, focus: 3.8, cam: { from: [-1.5, 1.75, 3.7], to: [0.3, 1.65, 3.5], lookFrom: [-0.4, 1.25, -0.3], lookTo: [0.2, 1.25, -0.3], fov: 56 },
    Body: B(() => (
      <group>
        <ShelterInside />
        <Toon spec={C.cabbie1} pose={{ sit: true, eyes: "happy", mouth: "smile", armR: "hold", prop: "teacup" }} pos={[-1.6, 0.25, -0.78]} seed={1} />
        <Toon spec={C.cabbie4} pose={{ sit: true, eyes: "closed", mouth: "smile", armR: "drink", prop: "teacup" }} pos={[-0.85, 0.25, -0.78]} seed={4} />
        <Toon spec={C.cabbie5} pose={{ sit: true, eyes: "dot", mouth: "open", armR: "hold", prop: "plate" }} pos={[-0.1, 0.25, -0.78]} seed={6} />
        <Toon spec={C.keeper} pose={{ armL: "hold", prop: "teacup", propHand: "L", eyes: "happy", mouth: "grin" }} pos={[1.3, 0, 0.55]} seed={3} />
      </group>
    )) },
  16: { look: inside, focus: 3.4, cam: { from: [1.15, 1.95, 2.9], to: [1.25, 1.97, 2.35], lookFrom: [1.25, 1.95, -1.0], fov: 44 },
    Body: B(() => (
      <group>
        <ShelterInside />
        <Toon spec={C.cabbie2} pose={{ sit: true, eyes: "sad", mouth: "frown", armR: "hold", prop: "mug", look: 1 }} pos={[0.35, 0.25, -0.5]} seed={2} />
      </group>
    )) },
  17: { look: day, focus: 10, cam: { from: [8.5, 7.6, 10.5], to: [6.2, 6.0, 8.4], lookFrom: [0, 0.8, -2.6], fov: 54 },
    Body: B((t) => (
      <Street day cabs={[{ x: -6 + t * 2.4, z: 0.4, walk: 1, snow: false }, { x: -14 }, { x: 12 }]} />
    )) },
  18: { look: day, focus: 9, cam: { from: [0.3, 2.3, 10.4], to: [0.3, 2.1, 8.8], lookFrom: [0.3, 1.4, -1.4], fov: 52 },
    Body: B(() => (
      <Street day cabs={[{ x: -14 }, { x: 13 }]}>
        <Cart pos={[-1.2, 0, 0.3]} />
        <Horse pos={[1.75, 0, 0.3]} size={2.5} color="#9a6a3c" />
        <Toon spec={C.bobby} pose={{ armR: "point", armL: "hips", eyes: "half", mouth: "flat" }} pos={[-1.3, 0, 3.2]} h={1.85} seed={8} flip />
      </Street>
    )) },
  19: { look: day, focus: 10, cam: { from: [0.3, 4.6, 8.5], to: [0.3, 8.8, 6.2], lookFrom: [0.3, 0.6, -1.0], lookTo: [0.3, 0, -0.9], fov: 52 },
    Body: B((t) => {
      const k = interpolate(t, [0.3, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <Street day cabs={[{ x: -14 }, { x: 13 }]}>
          <Cart pos={[-1.2, 0, 0.3]} />
          <Horse pos={[1.75, 0, 0.3]} size={2.5} color="#9a6a3c" />
          {/* two yellow measuring tapes of the same length */}
          <Box size={[5.4 * k + 0.001, 0.04, 0.16]} pos={[-2.7 + 2.7 * k, 0.05, -1.55]} color="#ffd23a" emissive="#ffb000" emissiveIntensity={0.6} />
          <Box size={[5.4 * k + 0.001, 0.04, 0.16]} pos={[-2.7 + 2.7 * k, 0.05, 1.55]} color="#ffd23a" emissive="#ffb000" emissiveIntensity={0.6} />
          {[-2.7, 2.7].map((x) => [-1.55, 1.55].map((z) => <Box key={x + "" + z} size={[0.06, 0.5, 0.06]} pos={[x, 0.25, z]} color="#ffd23a" emissive="#ffb000" emissiveIntensity={k} />))}
        </Street>
      );
    }) },
  20: { look: inside, focus: 3.4, cam: { from: [-3.3, 1.9, 2.9], to: [-2.5, 1.8, 2.3], lookFrom: [0.3, 1.1, -0.2], fov: 54 },
    Body: B(() => (
      <group>
        <ShelterInside />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Toon key={"b" + i} spec={C[["cabbie1", "cabbie2", "cabbie3", "cabbie4", "cabbie5", "cabbie6"][i]]} pose={{ sit: true, eyes: i % 2 ? "happy" : "dot", mouth: i % 3 ? "smile" : "grin", armR: i % 2 ? "drink" : "hold", prop: "teacup" }} pos={[-1.75 + i * 0.6, 0.25, -0.8]} h={1.6} seed={i} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Toon key={"f" + i} spec={C[["cabbie6", "cabbie4", "cabbie2", "cabbie5", "cabbie1", "cabbie3"][i]]} pose={{ sit: true, eyes: i % 2 ? "dot" : "happy", mouth: i % 2 ? "grin" : "smile", armR: "hold", prop: i % 2 ? "plate" : "mug" }} pos={[-1.6 + i * 0.6, 0.2, 0.75]} h={1.6} seed={i + 6} />
        ))}
      </group>
    )) },
  21: { look: desk, focus: 8.6, cam: { from: [0, 7.6, 6.6], to: [0, 6.6, 5.0], lookFrom: [0, 0, 0.3], fov: 50 },
    Body: B(() => <MapTable phase="build" />) },
  22: { look: desk, focus: 6.5, cam: { from: [0, 6.6, 5.0], to: [2.0, 4.0, 5.2], lookFrom: [0, 0, 0.3], lookTo: [2.4, 0, 2.6], fov: 50 },
    Body: B(() => (
      <group>
        <MapTable phase="survive" />
        <Stamp pos={[2.7, 0.03, 3.0]} at={1.7} />
      </group>
    )) },
  23: { look: day, focus: 3.6, cam: { from: [6.9, 1.65, -0.2], to: [6.5, 1.7, -0.8], lookFrom: [3.2, 1.7, -3.4], fov: 50 },
    Body: B((t) => (
      <Street day cabs={[{ x: 9.5 }, { x: 17 }]}>
        <HatchHand />
        <Toon spec={C.gent} pose={{ armR: t > 1.25 ? "hold" : "point", prop: t > 1.25 ? "sandwich" : "coin", eyes: t > 1.25 ? "happy" : "dot", mouth: t > 1.25 ? "grin" : "smile", look: -1 }} pos={[3.75, 0, -3.3]} seed={2} />
      </Street>
    )) },
  24: { look: day, focus: 3.2, cam: { from: [1.45, 1.55, 2.2], to: [1.3, 1.62, 1.55], lookFrom: [1.15, 1.7, -1.85], fov: 50 },
    Body: B(() => (
      <Street day cabs={[{ x: 9.5 }, { x: 17 }]} shelter={false}>
        <Shelter pos={[0, 0, -3]} snow hollow>
          <Toon spec={C.cabbie1} pose={{ sit: true, eyes: "happy", mouth: "grin", armR: "drink", prop: "teacup" }} pos={[1.35, 0.72, -0.4]} seed={1} h={1.7} />
          <Toon spec={C.cabbie4} pose={{ sit: true, eyes: "closed", mouth: "open", armR: "up", prop: "teacup" }} pos={[1.95, 0.72, -0.5]} seed={4} h={1.7} />
          <Toon spec={C.cabbie6} pose={{ sit: true, eyes: "happy", mouth: "grin", armR: "hold", prop: "plate" }} pos={[-0.15, 0.72, -0.4]} seed={7} h={1.7} />
        </Shelter>
        <Toon spec={C.gent} pose={{ armR: "drink", prop: "sandwich", eyes: "half", mouth: "wavy", shiver: true, armL: "warm" }} pos={[0.55, 0, -1.4]} seed={2} />
        <Snow count={700} area={[5, 5, 5]} center={[1.2, 0, 0]} speed={1.3} size={0.05} />
      </Street>
    )) },
};
