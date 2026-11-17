// STUB - owned by a helper. Contract: see world.ts. Must export: async function buildGrass(): Promise<Part>
import * as THREE from "three";
import type { Part } from "./world";
export async function buildGrass(): Promise<Part> {
  const object = new THREE.Group();
  return { object, update: () => {} };
}
