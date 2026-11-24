# Napoleon vs The Rabbits: LAYERED GPT prompt pack (v2)

Trial Short, 9:16, final **2160 x 3840 (4K), 30 fps**.
VO sped up 1.10x: **18.91 s = 567 frames**. Every timing below comes from word timings on that VO, so cuts land on words.

## How it works

We do **not** generate finished pictures. We generate the pieces separately, and I assemble them in Remotion like a game engine.

```
  [ FX on top: dust, grass, fur, smoke ]
  [ eyes + mouth overlays (code)       ]
  [ foreground props / rabbits         ]
  [ CHARACTER cut-out (pose image)     ]  <- poses swap at 8-12 per second = real movement
  [ midground (crowd plates, props)    ]
  [ BACKGROUND plate (empty set)       ]  <- moves slower than the character = parallax depth
```

That gives:
- characters that walk, run and leap across the sets;
- parallax between the layers;
- motion blur on every move;
- shadows I add under each character;
- camera shake;
- eyes and mouths tracked to the moving faces.

**Totals:**

| Group | Images |
|---|---|
| Backgrounds (BG) | 14 |
| Napoleon (N) | 26 |
| Rabbits (R) | 23 |
| Other cast (B, T, O, D) | 11 |
| Props (P) | 7 |
| FX | 6 |
| Character sheets | 3 |
| **Total** | **90** |

---

## Part 1: Rules (read before generating)

1. **File names:** name every file exactly as its code below (`BG01.png`, `N04.png`...). Send them as one zip.
2. **Size:**
   - backgrounds: **1024 x 1536 portrait**, except the ones marked LANDSCAPE, which are **1536 x 1024** so I can pan across them;
   - cut-outs: any size, but fill the frame with the figure.
   - I upscale everything to 4K.
3. **Cut-outs need a transparent background.**
   - Write "transparent background PNG" (already in the header below).
   - If GPT gives you a background anyway, a **plain flat light-grey background** is fine; I cut it out myself.
   - Never put a scene behind a cut-out.
4. **Same character every time:**
   - Make the character sheets (Part 3) first.
   - **Attach the sheet** to every request for that character and say "exactly this character from the attached sheet".
   - Keep one GPT chat per character if you can.
5. **Light must match the background.** Every prompt names one of three lighting setups (L1/L2/L3). Copy the lighting text as written, or the cut-out will look pasted on.
6. **Faces that get googly eyes:** eyes open, looking where the prompt says, mouth closed, face not hidden by a hat or hands.
7. **Pose cycles (run, hop):**
   - make frame 1 first;
   - make every next frame by **editing the previous image**: "same character, same camera angle, same lighting, same size in frame, change ONLY the pose to: …";
   - never start a cycle frame from scratch.

---

## Part 2: Copy blocks

### STYLE LOCK (paste once at the start of every GPT chat)
```
For every image in this chat use this exact style: hyper-detailed Unreal Engine 5 cinematic render, Lumen global
illumination, Nanite-level geometry detail, path-traced reflections, 8K textures, photoreal skin pores, fabric weave
and fur strands, physically based materials, subtle film grain, cinematic color grade (warm golden highlights, teal
shadows), AAA next-gen open-world video game cutscene look, set in France in July 1807.
NO text, NO letters, NO watermarks, NO logos, NO borders, NO cartoon eyes or drawn faces.
Faces clearly visible with eyes open and mouths closed unless I say otherwise.
```

### CUT-OUT HEADER (put at the start of every N / R / B / T / O / D / P / FX prompt)
```
Isolated cut-out on a fully transparent background (PNG with alpha channel). No scenery, no ground, no floor
shadow, no background color. The whole figure is inside the frame with a small margin, nothing cropped.
Clean sharp edges, every hair and fur strand visible. Use exactly the character from the attached sheet.
```

### LIGHTING (paste the one the prompt names)
- **L1 GOLDEN BACKLIGHT:** `low sunset sun behind the subject from the upper right, strong warm orange rim light on hair, hat and shoulders, soft cool blue fill light on the front`
- **L2 SUMMER SUN:** `bright afternoon sun from the upper left front, warm key light, soft crisp shadows on the right side of faces and bodies, blue-sky bounce fill`
- **L3 MORNING RIVER:** `soft hazy morning sun from the left side, gentle low contrast, light mist glow, pale gold`

---

## Part 3: Character sheets (make these first, attach them to every later prompt)

**C01 Napoleon**
```
Character turnaround sheet on a plain light grey background, same man shown 4 times full body: front, three-quarter,
side, back. NAPOLEON: short stocky man age 38, clean-shaven, pale skin, dark brown hair combed forward with a short
fringe, strong jaw, serious eyebrows. Black bicorne hat worn sideways, dark navy coat with red collar and gold buttons,
white waistcoat, white breeches, tall shiny black riding boots, one small gold medal on the chest. Lighting L2.
Eyes open, mouth closed.
```
**C02 Rabbit**
```
Character turnaround sheet on a plain light grey background, the same rabbit shown 4 times: front sitting, side
sitting, back, side mid-hop. THE RABBIT: fat fluffy domestic rabbit, brown back, white belly and white blaze on the
nose, round cheeks, long upright ears with pink insides, soft thick fur. Lighting L2. Eyes open.
```
**C03 Supporting cast**
```
Character sheet on a plain light grey background, full body front view, side by side:
1) BERTHIER: tall thin man age 54, curly grey-brown hair, big nose, eager smile, dark blue marshal uniform heavy with
gold embroidery, white sash, holding a rolled paper.
2) THE TSAR: tall elegant man age 30, receding fair hair, sideburns, white uniform with gold epaulettes and a blue sash.
3) OFFICER: young French officer, thin moustache, blue coat with white crossbelts, tall shako hat, holding a long
hunting musket.
4) HUNTING DOG: a white-and-tan hunting dog sitting.
Lighting L2. Eyes open, mouths closed.
```

---

## Part 4: Backgrounds: empty sets, NO people, NO rabbits (14)

| Code | Prompt (add the STYLE LOCK; never a cut-out header here) |
|---|---|
| **BG01** | `Empty hilltop at sunset seen from a low angle, grass and rocks in the foreground, a huge valley below with a distant army of tiny soldiers, cannon smoke and waving flags, golden sky with god rays. No characters in the foreground. Lighting L1.` |
| **BG02** | `Empty grand marble palace terrace seen from a low angle, giant bronze eagle statues, columns, sky with god rays and drifting clouds behind. Lighting L1.` |
| **BG03** | `Empty sunny green meadow at eye level, a worn grass path running straight toward the camera, trees and a palace far behind, summer haze, wildflowers. Lighting L2.` |
| **BG04** LANDSCAPE | `Wide aerial view of a grand French country estate in July 1807: palace, formal gardens, a big green meadow with white tents and blue-white-red flags, horses, tiny officers, summer haze, birds. Lighting L2.` |
| **BG05** | `Ground-level macro view of a sunny meadow at rabbit eye height, grass blades and clover sharp in front, soft bokeh meadow and blue sky behind, dew sparkles. Lighting L2.` |
| **BG06** | `A calm wide river at morning, a decorated wooden raft in the middle with a white pavilion and flags, crowds of tiny soldiers cheering on both distant banks, mist on the water. Nobody on the raft. Lighting L3.` |
| **BG07** | `Empty formal palace garden at eye level, gravel path, clipped hedges, fountains, palace facade behind, summer afternoon. Lighting L2.` |
| **BG08** LANDSCAPE | `Empty hunting meadow at eye level: colorful hunting tents, banners on poles, a long wooden table with food, trees around, open grass in the middle. No people, no animals, no cages. Lighting L2.` |
| **BG09** | `Worm's-eye view looking straight up from the grass: tall grass blades at the frame edges, tree tops, bright blue summer sky with white clouds. Lighting L2.` |
| **BG10** | `Low view across a sunny meadow toward the far distance, grass sharp at the bottom of the frame, open field going far back, trees and tents on the horizon. Lighting L2.` |
| **BG11** LANDSCAPE | `Very low ground-level view of a wide open meadow, grass sharp in front, the field stretching far, dust in the air, dramatic afternoon sky. Lighting L2.` |
| **BG12** | `Close-up of a patch of trampled meadow grass and soil, shallow depth of field, blurred meadow behind. Lighting L2.` |
| **BG13** LANDSCAPE | `Empty dirt country road beside the hunting meadow, the road leading away to the right, trees, tents in the distance, warm late afternoon. Lighting L2.` |
| **BG14** | `Dirt country road at sunset going away into the distance, a mossy flat rock in the near foreground at the bottom center, golden dust in the air. Nothing on the rock. Lighting L1.` |

---

## Part 5: Napoleon pose library (26). CUT-OUT HEADER + attach C01

| Code | Pose (add the lighting named) |
|---|---|
| **N01** | `NAPOLEON riding a rearing white horse, heroic, low-angle camera, horse's front hooves in the air, his face toward camera. Lighting L1.` |
| **N02** | `NAPOLEON chest-up, front view, right hand tucked inside his waistcoat, chin raised, smug. Lighting L1.` |
| **N03** | `NAPOLEON full body, low-angle camera, three-quarter view, arms crossed, cape blowing to the left, legendary pose. Lighting L1.` |
| **N04** | Run toward camera 1/6: `NAPOLEON full body running straight toward the camera, CONTACT pose: left heel striking the ground in front, right leg behind, right arm swung forward, left arm back, coat tails flying, hat tilting, panicked face looking at camera, mouth closed. Lighting L2.` |
| **N05** | Edit N04 → `DOWN pose: left knee bent taking the weight, body at its lowest, right foot lifting off behind.` |
| **N06** | Edit N05 → `PASSING/UP pose: left leg straight pushing off, right knee lifted high in front, body at its highest, arms crossing the middle.` |
| **N07** | Edit N06 → `CONTACT pose mirrored: right heel striking in front, left leg behind, left arm forward, right arm back.` |
| **N08** | Edit N07 → `DOWN pose mirrored: right knee bent taking weight, body lowest, left foot lifting behind.` |
| **N09** | Edit N08 → `PASSING/UP pose mirrored: right leg pushing off, left knee high in front, body highest.` |
| **N10** | `Head and shoulders only of NAPOLEON mid-run, front view, sweat drops on his face, hair messed up, hat almost falling off, eyes open, mouth closed. Lighting L2.` |
| **N11** | `NAPOLEON full body standing frozen, three-quarter view, shoulders raised, looking down at the ground in front of his feet, nervous. Lighting L2.` |
| **N12** | `NAPOLEON full body side view facing RIGHT, reaching his right hand out for a handshake, smiling, mouth closed. Lighting L3.` |
| **N13** | `NAPOLEON full body front view holding a gold-engraved long hunting musket across his chest, excited, eyes open, mouth closed. Lighting L2.` |
| **N14** | `NAPOLEON chest-up, three-quarter view, proudly loading the gold hunting musket with a ramrod, grinning with mouth closed. Lighting L2.` |
| **N15** | `NAPOLEON full body from a very low worm's-eye camera looking up at him (he looks giant), empty hands raised, palms up, confused face looking down at camera. Lighting L2.` |
| **N16** | `Only NAPOLEON's legs from the knees down: tall shiny black riding boots standing slightly apart, front view. Lighting L2.` |
| **N17** | Swat 1/3: `NAPOLEON full body front view, holding his bicorne hat high in his right hand ready to swat, left arm up defending, panicking, face visible. Lighting L2.` |
| **N18** | Edit N17 → `the hat swung down across his body to the left, body twisting.` |
| **N19** | Edit N18 → `the hat swung back up to the right, other arm flailing, one knee raised.` |
| **N20** | Retreat 1/6 (camera behind-right, he runs AWAY toward the right of frame): `NAPOLEON full body running away from camera toward the right, three-quarter back view, looking back over his left shoulder with a terrified face (eyes visible), holding his hat on with one hand, CONTACT pose left foot forward. Lighting L2.` |
| **N21** | Edit N20 → `DOWN pose, left knee bent, body lowest.` |
| **N22** | Edit N21 → `PASSING/UP pose, right knee high, body highest.` |
| **N23** | Edit N22 → `CONTACT pose mirrored, right foot forward.` |
| **N24** | Edit N23 → `DOWN pose mirrored, right knee bent.` |
| **N25** | Edit N24 → `PASSING/UP pose mirrored, left knee high.` |
| **N26** | `NAPOLEON diving head-first horizontally to the right, body stretched flat in mid-air, arms forward, boots kicking up behind, coat flying. Side view. Lighting L2.` |

---

## Part 6: Rabbit library (23). CUT-OUT HEADER + attach C02

| Code | Pose |
|---|---|
| **R01** | `THE RABBIT sitting, front view, looking straight into the camera, ears up, cute but slightly menacing. Lighting L2.` |
| **R02** | `THE RABBIT sitting upright proudly, front view, chest puffed, looking at camera like it just won a war. Lighting L1.` |
| **R03** | `THE RABBIT sitting, front view, head tilted to the left, innocent. Lighting L2.` |
| **R04** | `THE RABBIT sitting, side view facing left. Lighting L2.` |
| **R05** | `THE RABBIT sitting, front view, ears straight up, nose twitching, alert. Lighting L2.` |
| **R06** | `THE RABBIT sitting seen from directly behind, looking away into the distance. Lighting L2.` |
| **R07** | `THE RABBIT seen from behind-three-quarter, turning its head to look back over its shoulder to the right. Lighting L2.` |
| **R08** | Charge toward camera 1/6: `THE RABBIT running straight toward the camera, CROUCH pose: body compressed, all four paws on the ground, ears back. Lighting L2.` |
| **R09** | Edit R08 → `PUSH pose: hind legs extending behind, body lifting, front paws reaching forward.` |
| **R10** | Edit R09 → `STRETCH pose: fully airborne, body long, front paws stretched toward camera, hind legs straight back.` |
| **R11** | Edit R10 → `LAND pose: front paws touching down, hind legs still in the air.` |
| **R12** | Edit R11 → `GATHER pose: hind legs swinging forward past the front paws, back arched.` |
| **R13** | Edit R12 → `back to CROUCH, slightly different ear angle.` |
| **R14** | `THE RABBIT leaping at the camera, very close, front paws spread wide, mouth closed, eyes open, fur blowing. Lighting L2.` |
| **R15** | `THE RABBIT clinging vertically, climbing upward, front claws gripping, hind legs pushing, seen from the front (as if climbing a boot). Lighting L2.` |
| **R16** | `THE RABBIT clinging sideways, hanging on with front paws, body dangling (as if hanging off a shoulder). Lighting L2.` |
| **R17** | `THE RABBIT lying flat on its belly, paws spread, relaxed (as if sitting on top of a hat). Lighting L2.` |
| **R18** | Side hop 1/4 (moving RIGHT): `THE RABBIT side view facing right, CROUCH pose, ready to hop. Lighting L2.` |
| **R19** | Edit R18 → `PUSH pose, hind legs extending.` |
| **R20** | Edit R19 → `AIRBORNE stretched pose.` |
| **R21** | Edit R20 → `LAND pose, front paws down.` |
| **R22** | `A dense crowd of about 100 rabbits sitting packed together, all facing the camera, front view, cut-out as one group. Lighting L2.` |
| **R23** | `A dense wave of about 100 rabbits sprinting straight toward the camera, dust between them, ears back, cut-out as one group. Lighting L2.` |

---

## Part 7: Other cast (11). CUT-OUT HEADER + attach C03

| Code | Pose |
|---|---|
| **B01** | `BERTHIER full body three-quarter view, bowing proudly, one open hand presenting to the left, rolled paper in the other hand, eager smile, mouth closed. Lighting L2.` |
| **B02** | `BERTHIER full body laughing, pointing, the other hand on his belly, mouth closed. Lighting L2.` |
| **B03** | `BERTHIER full body running to the right, three-quarter back view, CONTACT pose. Lighting L2.` |
| **B04** | Edit B03 → `PASSING pose, other leg forward.` |
| **T01** | `THE TSAR full body side view facing LEFT, reaching his right hand out for a handshake, smiling, mouth closed. Lighting L3.` |
| **O01** | `OFFICER full body front view, raising his musket in the air, cheering, mouth closed. Lighting L2.` |
| **O02** | `OFFICER full body holding his musket, bent over laughing. Lighting L2.` |
| **O03** | `OFFICER full body running to the right in panic, holding his shako on, CONTACT pose. Lighting L2.` |
| **O04** | Edit O03 → `PASSING pose, other leg forward.` |
| **O05** | `A soldier's gloved hand and forearm only, reaching from the left to grab a cage door latch. Lighting L2.` |
| **D01** | `HUNTING DOG sitting, side three-quarter view, tongue in, alert. Lighting L2.` |

## Part 8: Props (7). CUT-OUT HEADER

| Code | Prop |
|---|---|
| **P01** | `A wooden rabbit cage, front view, door CLOSED, many fluffy rabbits visible packed inside through the slats. Lighting L2.` |
| **P02** | `The same wooden rabbit cage, front view, empty, door opening missing (just the open hole). Lighting L2.` |
| **P03** | `Only the cage's wooden slatted door panel, front view, flat, with a metal hinge on its left edge. Lighting L2.` |
| **P04** | `A black and gold 1800s horse-drawn carriage with two black horses and a coachman holding a whip, three-quarter view facing right, carriage door wide open. Lighting L2.` |
| **P05** | `Only the carriage door panel, black and gold with an emblem, side view, flat. Lighting L2.` |
| **P06** | `The same black and gold carriage with horses, seen from behind-three-quarter, racing away, wheels blurred, dust kicked up. Lighting L1.` |
| **P07** | `Three tall blue-white-red banners on wooden poles, fabric waving. Lighting L2.` |

## Part 9: FX elements (6). CUT-OUT HEADER

| Code | Element |
|---|---|
| **FX01** | `A cloud of warm sunlit dust, soft edges, semi-transparent.` |
| **FX02** | `Dozens of flying torn grass blades and clover leaves scattered, frozen mid-air.` |
| **FX03** | `Puffs of loose rabbit fur, brown and white, floating.` |
| **FX04** | `Rolling cannon smoke, white-grey, soft, semi-transparent.` |
| **FX05** | `A few clear sweat drops, glossy.` |
| **FX06** | `A long dust trail streaming from left to right, golden sunset light.` |

---

## Part 10: Shot assembly (my edit plan, so you can see where every piece goes)

Layers are listed back to front. **Swap** = pose swaps per second. Overlay = eyes/mouth.

| Shot | Time | VO | Layers | Motion | Overlay |
|---|---|---|---|---|---|
| 1 | 0.00–0.70 | You would never | BG01, FX04, N01 | push-in; smoke drifts left (parallax); horse bobs, hooves rise | smug squint |
| 2 | 0.70–1.44 | guess what | BG01 (blurred), N02 | slow orbit; rim light flicker | eyes look L then R, brow up |
| 3 | 1.44–2.04 | made Napoleon | BG02, N03 | crane up from his boots; cape sways | proud wide eyes |
| 4 | 2.04–2.44 | run | BG03, N04–N09 (12/s), FX02 | he runs at camera and grows; ground scrolls; shake | tiny panic pupils, "AAA" |
| 5 | 2.44–3.36 | for his life | BG03 (speed-blurred), N10, FX05 | head bounces at stride rhythm; zoom-in | shaking eyes, lip-sync "for his life" |
| 6 | 3.36–4.54 | in 1807 | BG04, P07 | slow pan across the landscape plate; banners sway | none ("1807" caption) |
| 7 | 4.54–4.98 | but it was | BG07, N11 | slow push to his face | eyes roll down |
| 8 | 4.98–5.86 | hungry rabbits | BG05, R01 | push-in to macro; grass sways in front | googly stare, blink, chew |
| 9 | 5.86–6.56 | (beat) | BG05, R22 behind, R01 + R05 swap | crowd rises up behind (slides up); ears pop | 20 pairs of eyes blink together |
| 10 | 6.56–7.40 | To celebrate peace | BG06, N12 + T01 | they slide in from both sides and meet; handshake shake | happy arc eyes, grins |
| 11 | 7.40–8.20 | his staff | BG07, B01 | bows down then up (squash/stretch) | eager eyes, lip-sync |
| 12 | 8.20–9.36 | threw him a rabbit hunt | BG08, P07, O01, D01, N13, P01 ×4 (front) | pan right along the cages; officers cheer bob; cages rattle | excited eyes; rabbit eyes in cages |
| 13 | 9.36–9.84 | (beat) | BG08 (blurred), N14 | ramrod push; quick zoom | evil squint grin |
| 14 | 9.84–10.32 | But the rabbits | BG08, P02, P03 (door swings on hinge), O05, R08–R13 | door flips open; rabbits hop out at camera | rabbit eyes |
| 15 | 10.32–11.36 | were tame | BG05, R22, R03 (front) | gentle float; FX butterflies made in code | head-tilt, innocent blink, smile |
| 16 | 11.36–12.10 | They thought he'd brought | BG10, N13 (small, far), R06/R07 ×many (front) | rabbit heads turn (R06 → R07 swap) in a wave | Napoleon nervous |
| 17 | 12.10–13.14 | food | BG09, N15 | slight sway; ears (R06) frame the bottom | confused eyes, "huh?" |
| 18 | 13.14–14.28 | Hundreds charged him | BG11, R23 (mid), R08–R13 ×6 (front, 12/s), R14 last, FX01, FX02 | pan + rush; rabbits scale up toward lens; heavy shake; R14 hits the lens | angry rabbit brows |
| 19 | 14.28–15.20 | climbed his boots | BG12, N16, R15 ×5 climbing up, then ×15 | rabbits crawl up the boots step by step | happy rabbit eyes |
| 20 | 15.20–15.60 | (beat) | BG08, B02, O02, N17–N19 (10/s), R16 on him, FX03 | hat swats, fur bursts | screaming mouth, darting eyes |
| 21 | 15.60–16.56 | the greatest general | BG01, FX04, N01, R15/R16/R17 ×12 layered onto him and the horse | same push-in as shot 1 (callback) | dead flat eyes |
| 22 | 16.56–17.74 | alive retreated | BG13, P04 (far right), N20–N25 (12/s), B03/B04, O03/O04, R18–R21 ×10, FX01 | everyone runs right; camera tracks; rabbits stream behind | terrified look-back |
| 23 | 17.74–18.44 | to his carriage | BG13, P04, N26, P05, R14 | dive arc into the door; door slams on 18.40; shake | none |
| 24 | 18.44–18.91 | (end) | BG14, P06 + FX06 (far), R02 on the rock | carriage shrinks into the distance; slow push | smug eyes, smirk, slow blink |

---

## Part 11: Eyes + mouth animation (prompt for GPT to write the Remotion code)

```
Write React components for Remotion 4 (TypeScript, SVG only, no images, transparent background),
in the style of quirky funny YouTube Shorts where big cartoon googly eyes and a drawn mouth are pasted
onto photoreal characters.

1) <GooglyEyes /> props:
   - size: number (px width of ONE eye), gap: number (px between eyes), rotate: degrees (to match a tilted head)
   - lookX, lookY: -1..1 (pupil direction)
   - pupil: 0.2..1 (pupil scale; 0.3 = panic, 1 = cute)
   - lid: 0..1 (0 = open, 1 = closed; 0.5 = bored or smug)
   - browAngle: degrees (+ angry, - worried), browUp: px
   - mood: "neutral" | "panic" | "smug" | "happy" | "angry" | "dead" | "confused"
     ("happy" = upside-down U arcs; "dead" = flat lids at 0.6 and tiny pupils; "confused" = one eye 20% bigger)
   - shake: 0..1 (fast jitter for terror)
   - seed: number (so every character blinks at different times)
   Look: pure white eyeballs with a thick black outline (6% of size), glossy black pupils with two white highlights,
   a soft drop shadow so they sit on the photo. Pupils move with spring physics (overshoot, then settle).
   Auto blink every 2-4 s (3 frames: half, closed, half).

2) <CartoonMouth /> props:
   - width: number, rotate: degrees
   - viseme: "rest" | "A" | "E" | "O" | "U" | "MBP" | "FV" | "L" | "smile" | "smirk" | "scream" | "frown" | "chew" | "huh"
   - Look: thick black outline, dark red inside, pink tongue, white top teeth on A/E/scream, soft shadow.
   - Morph smoothly between shapes over 2 frames (every shape uses the same number of SVG path points).
   - Export visemeFromWord(word: string): Viseme[] that turns an English word into a rough viseme sequence,
     and <LipSync words={[{w, s, e}]} fps={30} width={...} /> that drives CartoonMouth from word timings in seconds.

3) A demo composition, 1080x1920, 30 fps, 8 seconds, grey background, showing every mood and every viseme
   with labels so I can check them.

Return complete files: GooglyEyes.tsx, CartoonMouth.tsx, LipSync.tsx, Demo.tsx. No external libraries except remotion.
```

---

## What to send me
1. One zip with **C01–C03, BG01–BG14, N01–N26, R01–R23, B01–B04, T01, O01–O05, D01, P01–P07, FX01–FX06** (90 images).
2. The 4 `.tsx` files from Part 11.

Send what you have as you go. I can start building shots 1–9 as soon as C01, C02, BG01–BG07, N01–N11 and R01–R05 + R22 arrive.
