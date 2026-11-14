# 06: Engine API and the set library

## 1. Files (`engine/src/`)
- `engine.js`: `makeEngine(canvas)` → `E.render(scene, cam, { bloom, bloomThreshold, focus, aperture, maxblur, vignette, grain, sat, warm, exposure, t })`;
  `camera(fov)`; neutral tone mapping, soft shadows, room environment, DOF (Bokeh), bloom, grade pass.
- `core.js`: `tex(w, h, draw, {repeat})` canvas texture painted with the ink kit; `fill`, `grain`, `frame` (ink border); materials
  `lit(map, {roughness})`, `glowMat(map, k)` (emissive), `flat(col)`; meshes `plane(w,h,mat,pos,rot)`, `box(...)`,
  `inkBox(w,h,d,col,pos,{detail, col2, px})` (every face textured + inked); `glow(col, size, pos, opacity)` (additive haze sprite);
  `point(col, intensity, pos, dist)`; `Actor(look)` → `.at(x,y,z).set(state).face(cam)`, `.hand(arm, 'R'|'L')` → world position;
  easing `ease`, `eout`, `lerp`, `lerp3`, `seg(t, a, b)`, `clamp`, `rnd(n)`.
- `kit.js`: ink drawing for textures and characters (`F`, `Ln`, `sm`, `poly`, `tube`, `ellD`, `rectD`, `blur`, `grad`, `text`).
- `char.js`: the character rig (`reference/04`).
- `main.js`: shots, captions, dissolves, per-shot 2D overlays (`OV[shotId] = (ctx, localT) => …`), `?nocap` for clean frames.
- `brand.js` + `brand.html`: profile photo, banner, pose sheet (`?what=avatar|banner|poses`).

## 2. Set library (reuse and adapt)
| file | location | key pieces |
|---|---|---|
| `alley.js` | night back alley | lit hatch window with no sign, vending machine, beer crates, cat, plant, cables, AC units, red lantern, karaoke sign |
| `city.js` | neon shopping street + city grid | vertical neon boards with arrows, lit shop doors, wet road reflections, van, P sign, 13x13 block grid for crane-ups |
| `hall.js` | long interior aisle | machine walls with flickering screens, LED counters, red stools, gold-diamond carpet, light strip, seated extras, a carrier |
| `front.js` | shopfront at night | gold sign (our own name), "NEW MACHINES" board, glowing glass doors showing the interior, posters, kerb |
Each `buildX()` returns `{ scene, ...actors and props }`. Build every set once at startup; shots only move things.

## 3. Writing a new set (pattern)
```js
export function buildOffice() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#...'); scene.fog = new THREE.Fog('#...', near, far);
  const g = new THREE.Group(); scene.add(g);
  g.add(plane(W, D, lit(floorTex, { roughness: 0.3 }), [0, 0, z], [-Math.PI / 2, 0, 0]));   // floor
  g.add(plane(W, H, lit(wallTex), [0, H / 2, -backZ]));                                        // walls: painted with tex()
  g.add(inkBox(w, h, d, '#colour', [x, h / 2, z], { detail: (c, W, H) => {/* drawn details */} }));  // furniture
  g.add(point('#ffd27a', 12, [x, y, z], 10)); g.add(glow('#ffd27a', 2, [x, y, z], 0.15));      // a practical light + haze
  scene.add(new THREE.HemisphereLight(sky, ground, 1.5));
  const hero = new Actor({ ...HERO, body: '#outfit', sh: '#shadow' }).addTo(scene);
  return { scene, hero };
}
```
Density checklist per wall (the #1 gap vs the reference): seams, 2+ drawn objects (AC units, posters, signs, pipes, cables),
one readable sign, one light source, one clutter prop on the floor. Ink frame on every face.

## 4. Props in hands, 3D eggs/objects, overlays
- Put a 3D prop in a hand: `const p = actor.hand(armR, 'R'); prop.position.set(p.x, p.y + 0.06, p.z + 0.03);` after `.face(cam)`.
- Objects that change state (e.g. x-ray, opening, lighting up) get a method on their group (`obj.reveal(k)`), driven by `seg()` on word times.
- Stamps and labels: `OV.shotId = (c, t) => stamp(c, 'BANNED', 540, 860, -0.16, seg(t, 1.0, 1.35));`.
