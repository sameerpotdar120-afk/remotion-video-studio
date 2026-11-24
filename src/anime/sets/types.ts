// Contract every set follows (farm.ts is the style reference).
import * as THREE from "three";
export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };
export type BuiltSet = {
  group: THREE.Group;                 // everything, including the set's own lights (shadow-casting key light + fills)
  update: (t: number) => void;        // seconds; pure function of t (any frame can render on its own)
  fog?: THREE.Fog;
  cams: Record<string, Cam>;          // look-dev / shot cameras
  marks: Record<string, [number, number, number]>; // where characters stand / walk (metres, y = floor)
};
