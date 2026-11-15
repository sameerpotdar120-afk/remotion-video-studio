# 06 · Look, colour and the cast

## 1. Look families
- **A (default): painted toon world.**
  - Chunky low-mid-poly geometry, small bevels, painted grain/plank gaps/wear.
  - **Selective ink** on props, machines, signs and vehicles (not walls, ground or sky): 3-5 px at 1080, a dark tint of the surface.
- **B: game-engine look** (PBR-ish, haze, bloom, almost no world ink). Same grade and characters.
  - The train reference (and our Blender world) sits between A and B: soft painted 3D, saturated, no world ink.

## 2. Colour and light (measured presets; full tables in `study25/colour_lighting.md`)
| preset | luma mean | black point | shadow colour | notes |
|---|---|---|---|---|
| day | .52 | #201314 | violet #7c7388 | sky #3e79cd → horizon #83a7e4..#c8e0f6 |
| golden | .54 | warm | purple at sunset (never brown) | |
| interior | .39 (most common) | | rose #3b292e | vignette corners .60-.66 |
| night | .37 | #100e26 | indigo #273165 | faces ~.70, mauve |
- **Faces:** stay near white (.89-.96) except at night.
- **Bloom:** only on light sources. No film grain.
- **Haze:** far ground fades 50-65 % toward the horizon colour (Blender: mist pass × 0.32 toward sky blue).
- **Saturation:** the train reference is very saturated (sat .49). In Blender, use the Standard view transform with
  exposure −0.35, and Nishita sky ×1.6 saturation, hue shifted slightly toward blue (AgX desaturated our first tests).
- **Story lighting:** warm and bright for setup, cooler/night when the explanation lands, warm golden for flash-forwards.

## 3. The mascot (locked)
- `card/toon/char.js` `HERO`:
  - bean body, white round head;
  - ginger **Flame Spikes** hair #e8742c;
  - **gold rope chain + "S" medallion**;
  - ink #22161e.
- Clothes change per video via `look` (video #4: green work shirt `{body:'#2e7a5e', sh:'#0f3326'}`).
- **Moods:** `neutral`, `happy`, `smug`, `focus` (smug + o-mouth), `shock`, `worried`, `angry` (glare brows + frown, added for #4).
- **Pose API** (`char(x, gy, s, o)`):
  - `armL/armR` (hand offsets from the shoulder, design units), `ik`, `gripL/gripR` (fists), `armsFront`;
  - `bendL/bendR`, `lean` (radians, pivot at the feet), `turn` (−1..1), `lookAt`, `headDx`;
  - `legSwing`, `walk` (phase), `sit`;
  - `over(hx, hy, r)` callback for head extras.
- **Proportions** from the study: 3.2-3.5 heads tall, thin single-stroke limbs (~.045 W), dot hands, no fingers, eyes .25 W apart.

## 4. The cast system (extras)
- `card/extras.js` draws costume pieces over the head: `tophat`, `cowboy`, `straw`, `bonnet`, `cap`, `mustache`, `beard`.
- Cast are HERO looks with `hair:'none'`, `noChain:true`, their own body colours and extras. Video #4 cast:
  - mayor (white suit, top hat, mustache);
  - cowboy (beard);
  - lady (bonnet);
  - kid (cap);
  - farmer (straw hat);
  - clerk (mustache).
- Crowds: 5-10 unique figures reacting 0-6 f apart; tint for variety; faces must read down to ~35 px.

## 5. Card rules (both engines)
- **Placement and facing:**
  - a card is a vertical plane with the drawing as a transparent texture, feet at the origin;
  - it rotates about Z to face the camera every frame; keep the camera within ~60° of facing.
- **Lighting:**
  - lit by the world (diffuse) plus emission ≈ 0.42 of the texture so faces stay near white;
  - casts and receives shadows; takes DOF.
- **Grips:** the hand points are real 3D points (maul handle, crank, pad). Project each one from the camera onto the card
  plane, convert to design units, and feed `armL/armR` with `gripL/gripR`. The hands then stay on the prop whatever the
  camera does.
- **Draw order:**
  - props *behind* the card (maul handle slightly behind the hero) read as gripped;
  - props that must cross the body go in front.
- **Rendering:** cards render at AK=2-3 px per design unit (hero 690 units = 1.72 m). Dedupe identical poses by hashing the pose JSON.
