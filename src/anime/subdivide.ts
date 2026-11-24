// Loop subdivision for (skinned) meshes: smooth, rounded silhouettes from low-poly models while keeping the rig.
// New edge vertices blend the skin weights of their two ends (top 4 kept, renormalised). Material groups are preserved.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Skin = { idx: number[]; w: number[] };
const blendSkin = (a: Skin, b: Skin, wa = 0.5, wb = 0.5): Skin => {
  const m = new Map<number, number>(); a.idx.forEach((j, k) => m.set(j, (m.get(j) ?? 0) + a.w[k] * wa)); b.idx.forEach((j, k) => m.set(j, (m.get(j) ?? 0) + b.w[k] * wb));
  const top = [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4); const s = top.reduce((q, [, w]) => q + w, 0) || 1;
  while (top.length < 4) top.push([0, 0]); return { idx: top.map(([j]) => j), w: top.map(([, w]) => w / s) };
};

export const loopSubdivide = (src: THREE.BufferGeometry, iterations = 1): THREE.BufferGeometry => {
  // keep only what we need, weld by position so the surface is connected
  let g = new THREE.BufferGeometry(); g.setAttribute("position", src.getAttribute("position").clone());
  const hasSkin = !!src.getAttribute("skinIndex"); if (hasSkin) { g.setAttribute("skinIndex", src.getAttribute("skinIndex").clone()); g.setAttribute("skinWeight", src.getAttribute("skinWeight").clone()); }
  if (src.index) g.setIndex(src.index.clone());
  const groups0 = src.groups.length ? src.groups.map((q) => ({ ...q })) : [{ start: 0, count: (src.index ? src.index.count : src.getAttribute("position").count), materialIndex: 0 }];
  if (!g.index) { const n = g.getAttribute("position").count; g.setIndex([...Array(n).keys()]); }
  // face -> group
  let faceGroup: number[] = []; for (const q of groups0) for (let f = q.start / 3; f < (q.start + q.count) / 3; f++) faceGroup[f] = q.materialIndex ?? 0;
  g = mergeVertices(g, 1e-4);
  for (let it = 0; it < iterations; it++) {
    const P = g.getAttribute("position") as THREE.BufferAttribute; const I = g.index!.array; const nV = P.count, nF = I.length / 3;
    const SI = g.getAttribute("skinIndex") as THREE.BufferAttribute | undefined, SW = g.getAttribute("skinWeight") as THREE.BufferAttribute | undefined;
    const pos = (i: number) => new THREE.Vector3(P.getX(i), P.getY(i), P.getZ(i));
    const skin = (i: number): Skin => ({ idx: [SI!.getX(i), SI!.getY(i), SI!.getZ(i), SI!.getW(i)], w: [SW!.getX(i), SW!.getY(i), SW!.getZ(i), SW!.getW(i)] });
    // edges
    const edgeKey = (a: number, b: number) => (a < b ? a * nV + b : b * nV + a);
    const edges = new Map<number, { a: number; b: number; opp: number[]; id: number }>();
    const nbr: Set<number>[] = Array.from({ length: nV }, () => new Set());
    for (let f = 0; f < nF; f++) { const t = [I[f * 3], I[f * 3 + 1], I[f * 3 + 2]];
      for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], c = t[(k + 2) % 3]; const key = edgeKey(a, b); let e = edges.get(key); if (!e) { e = { a, b, opp: [], id: -1 }; edges.set(key, e); } e.opp.push(c); nbr[a].add(b); nbr[b].add(a); } }
    const boundary = new Set<number>(); for (const e of edges.values()) if (e.opp.length !== 2) { boundary.add(e.a); boundary.add(e.b); }
    const outP: number[] = [], outSI: number[] = [], outSW: number[] = [];
    // old vertices, repositioned
    for (let i = 0; i < nV; i++) { const v = pos(i); const ns = [...nbr[i]]; let np: THREE.Vector3;
      if (boundary.has(i)) { const bn = ns.filter((j) => { const e = edges.get(edgeKey(i, j)); return e && e.opp.length !== 2; }); np = bn.length === 2 ? v.clone().multiplyScalar(0.75).add(pos(bn[0]).add(pos(bn[1])).multiplyScalar(0.125)) : v; }
      else { const n = ns.length; const beta = n > 3 ? 3 / (8 * n) : 3 / 16; np = v.clone().multiplyScalar(1 - n * beta); for (const j of ns) np.addScaledVector(pos(j), beta); }
      outP.push(np.x, np.y, np.z); if (SI) { const s = skin(i); outSI.push(...s.idx); outSW.push(...s.w); } }
    // edge vertices
    let next = nV;
    for (const e of edges.values()) { const pa = pos(e.a), pb = pos(e.b); let np: THREE.Vector3;
      if (e.opp.length === 2) np = pa.add(pb).multiplyScalar(3 / 8).add(pos(e.opp[0]).add(pos(e.opp[1])).multiplyScalar(1 / 8)); else np = pa.add(pb).multiplyScalar(0.5);
      outP.push(np.x, np.y, np.z); if (SI) { const s = blendSkin(skin(e.a), skin(e.b)); outSI.push(...s.idx); outSW.push(...s.w); } e.id = next++; }
    // faces: 1 -> 4, keeping the group
    const faces: [number[], number][] = [];
    for (let f = 0; f < nF; f++) { const a = I[f * 3], b = I[f * 3 + 1], c = I[f * 3 + 2]; const ab = edges.get(edgeKey(a, b))!.id, bc = edges.get(edgeKey(b, c))!.id, ca = edges.get(edgeKey(c, a))!.id; const gi = faceGroup[f] ?? 0;
      faces.push([[a, ab, ca], gi], [[ab, b, bc], gi], [[ca, bc, c], gi], [[ab, bc, ca], gi]); }
    faces.sort((x, y) => x[1] - y[1]); faceGroup = faces.map(([, gi]) => gi);
    const ng = new THREE.BufferGeometry(); ng.setAttribute("position", new THREE.Float32BufferAttribute(outP, 3));
    if (SI) { ng.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(outSI, 4)); ng.setAttribute("skinWeight", new THREE.Float32BufferAttribute(outSW, 4)); }
    ng.setIndex(faces.flatMap(([t]) => t)); g = ng;
  }
  // groups back
  g.clearGroups(); let start = 0; for (let f = 0; f <= faceGroup.length; f++) { if (f === faceGroup.length || (f > 0 && faceGroup[f] !== faceGroup[f - 1])) { g.addGroup(start * 3, (f - start) * 3, faceGroup[f - 1]); start = f; } }
  g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
};
