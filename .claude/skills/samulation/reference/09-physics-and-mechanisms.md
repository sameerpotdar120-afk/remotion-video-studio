# 09 · Physics and mechanisms (make it correct, then make it readable)

The creator's rule: physics and mechanism matter as much as the look. Model the real thing, simulate it with real
constants, then stage it so the viewer can read it.

## 1. Staging a mechanism
1. Whole machine next to a character first (scale); then CU of the moving part.
2. Explain by glowing the part, following the energy in one move, or opening the casing. No arrows or labels; numbers only on
   in-world signs and chalk marks.
3. Build the real parts (they read even when small):
   - track: rail head/web/foot, joint bars with 4 bolts per side, tie plates, spikes, ties, ballast;
   - locomotive: wheels, rods, cylinders.
4. Show cause → strain → failure → consequence, each on its word.

## 2. Recipes (all in `blender/anim.py` / `blender/loco.py`, and in three.js `volley.ts`)
**Ballistic sparks** (strikes, grinding):
- speed 2.6-5.8 m/s into the upper hemisphere, life 0.18-0.42 s;
- `p = p0 + v·t + ½g t²`, with g = −9.8;
- draw each as a thin emissive streak along the current velocity, length = |v|·(1/60)·2.2 (a 1/60 s shutter), shrinking with age;
- emission ~40 + glare.

**Overhead tool swing** (maul, axe):
- the swing angle runs 0° (head on target) → ~195° (cocked behind the shoulder);
- strike in 5-8 frames with `a = 195·(1−u²)` (accelerating); raise over ~30 f eased; small 4 f recoil bounce;
- hands interpolate low ↔ high grip points; the handle direction rotates in the swing plane;
- the head is perpendicular to the handle; the second hand slides along the handle (0.06-0.28 of the length);
- body lean follows the swing (−0.16 → +0.06 rad).

**Rockets / fire arrows** (three.js `volley.ts`):
- thrust 14, drag KD 0.0045, v0 12, dt 1/240;
- solve burn and yaw per rocket to hit an assigned target;
- `wallCheck` throws if any path touches your own parapet;
- trail fades near the camera; the flame jet points out the back.

**Thermal expansion and sun kink:**
- ΔL = α·L·ΔT with α(steel) = 11.7 µm/(m·°C); 39 ft rail, ΔT 55 °C → 7.6 mm;
- jointed rail: gaps close as the season warms (props: pencil/coin/paper + a calendar/thermometer);
- welded rail: a lateral S, `x(y) = A·e^(−0.55u²)·sin(1.35u)` with u = (y−yc)/4.2 m and A ≈ 0.5 m;
- animate as a **shape key** 0 → 1 over ~5 f with an 18 % overshoot settling over 8 f; ties shift by the same offset and
  rotate by the slope;
- heat colour: emission #ff7a22 at strength ~1.6-2.0 pulsing, and a warm grade for flash-forwards.

**Rolling stock:**
- wheel rotation = distance travelled / radius (drivers 0.86 m, leading/tender 0.42 m);
- side rods follow the crank pin: `y = y0 − r·sin(θ)`, `z = z0 + r·cos(θ)`;
- position along the track by PCHIP keys so the headlight peaks on the word;
- the headlight emission ramps ×36 for a bloom-out.

**Smoke plume:**
- puffs born every ~2.6 frames at the stack;
- they rise 1.9-2.6 m/s, drift sideways, and scale 0.4 → 2.5 over ~3 s;
- they stay in world space, so a moving train leaves a trail;
- no shadows from the puffs.

**Impacts/explosions:**
- one hero explosion per video;
- cel cumulus, colour ramp #ffca5f → #c16b29 → #33231f;
- 85-100 % of frame width within 3 f;
- 35 f of fire, ≥70 f of smoke.

## 3. Readability checks
- Is the moving part visible from this camera? The first Blender frame hid the maul head behind the near rail; we moved
  the strike to the inside spike.
- Is the exaggeration honest and small? The joint gap was drawn ~2× real (26 mm) so it reads on a phone.
- Does it land on its word (± frames)?
