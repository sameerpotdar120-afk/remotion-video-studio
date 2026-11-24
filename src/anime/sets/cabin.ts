// STUB: replaced by the helper building this set.
import * as THREE from "three";
import type { BuiltSet } from "./types";
export const buildCabin = (): BuiltSet => { const g = new THREE.Group(); g.add(new THREE.AmbientLight("#ffffff", 1)); const m = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: "#cc4444" })); m.position.y = 1; g.add(m); return { group: g, update: () => {}, cams: { main: { pos: [0, 2, 8], look: [0, 1, 0], fov: 34 } }, marks: { center: [0, 0, 0] } }; };
