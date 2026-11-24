# Napoleon vs The Rabbits: GPT prompt pack

Trial Short, 9:16, final 2160 x 3840 (4K), 30 fps.
VO sped up 1.10x: 20.77 s became **18.91 s** (567 frames). Pitch is kept.
All timings below come from word timings on the sped-up VO, so every image cut lands on a word.

## How to use this file

1. Paste the **STYLE LOCK** block into GPT once at the start of the chat, then the **CHARACTER LOCK** sheets.
2. Generate the shots in order and name the files exactly as listed (`S01.png`, `S04a.png`...).
   - A shot with a/b/c letters is a **pose cycle**. Generate `a` first. Then make `b` and `c` by **editing `a`**:
     "same image, same camera, same lighting, change only: …". This keeps the swap invisible apart from the motion.
3. Ask for **1024 x 1536 portrait** (GPT's largest 9:16-ish size).
   - I upscale every image to 2160 x 3840 and crop to 9:16 in the edit.
   - Keep the subject in the **middle 80%** of the frame, because the top and bottom get cropped a little.
4. Faces: the googly eyes and cartoon mouth get pasted on top of the real face.
   - Every face that gets an overlay must be **clearly visible, front or three-quarter view, eyes open, mouth closed, not covered by a hat brim or hands**.
   - Every prompt below already asks for this.
5. Send me the PNGs (zip is fine) plus the eye/mouth code from Part 3. I do the rest:
   - drift on each still
   - 2-frame motion-blur swaps
   - tracking the eyes and mouth to each face, with blinks and lip sync
   - one-word captions
   - sound effects
   - the 4K render

---

## Part 1: STYLE LOCK (paste first)

```
For every image in this chat use this exact style:
Hyper-detailed Unreal Engine 5 cinematic render, Lumen global illumination, Nanite-level detail,
path-traced reflections, 8K textures, photoreal skin pores and fabric weave, physically based materials,
subtle film grain, shallow depth of field with creamy bokeh, cinematic color grade (warm golden sunlight,
teal shadows), AAA open-world video game look, like a next-gen Rockstar-quality cutscene but set in
1807 France. Vertical 9:16 composition, subject centered, safe margins top and bottom.
NO text, NO letters, NO watermarks, NO logos, NO borders, NO cartoon eyes (eyes get added later).
Faces always clearly visible, eyes open, mouths closed unless I say otherwise.
Keep every character identical across images (same face, outfit, colors).
```

## Part 2: CHARACTER LOCK (paste second, then generate this sheet first as `C00.png`)

```
Character sheet, 3 characters standing side by side on a plain light grey background, full body, front view,
same UE5 photoreal style:
1) NAPOLEON: short stocky man, age 38, clean-shaven, pale skin, dark brown hair combed forward with a short fringe,
   strong jaw, serious eyebrows. Black bicorne hat worn sideways, dark navy blue coat with red collar and gold buttons,
   white waistcoat, white breeches, tall shiny black riding boots, small gold medal on chest.
2) MARSHAL BERTHIER (his chief of staff): tall thin man, age 54, curly grey-brown hair, big nose, eager smile,
   gold-embroidered dark blue marshal uniform, white sash, holding a rolled paper.
3) THE RABBIT: a fat fluffy brown-and-white domestic rabbit, round cheeks, big ears, soft fur, sitting upright.
All three eyes open, looking at the camera, mouths closed.
```

---

## Part 2b: SHOT LIST (24 shots, 31 images)

Time = seconds in the sped-up VO. **Overlay** = what the eyes and mouth do in that shot (I animate this, it is just for you to see).

### HOOK: "You would never guess what made Napoleon run for his life in 1807, but it was hungry rabbits."

**S01** · 0.00–0.70 · *"You would never"*
```
Low-angle heroic shot of NAPOLEON on a rearing white horse on a hilltop, cannon smoke and a huge army below
in the valley, golden sunset backlight, flags waving, epic scale. His face toward camera, eyes open, mouth closed.
```
Overlay: confident half-closed eyes, smug closed mouth.

**S02** · 0.70–1.44 · *"guess what"*
```
Close-up portrait of NAPOLEON, chest up, right hand tucked inside his waistcoat, chin raised, smug,
blurred battlefield smoke behind, rim light on his hat. Front view, eyes open, mouth closed.
```
Overlay: eyes look left then right, one eyebrow up.

**S03** · 1.44–2.04 · *"made Napoleon"*
```
Dramatic low-angle full-body shot of NAPOLEON standing with arms crossed on a marble terrace,
cape blowing, god rays behind him, statues of eagles, looks like a legend. Three-quarter view, face visible, mouth closed.
```
Overlay: proud wide eyes.

**S04a / S04b** · 2.04–2.44 · *"run"* (swap every 6 frames)
```
S04a: NAPOLEON sprinting toward the camera across a sunny grass field, coat tails flying, left leg forward,
arms pumping, hat tilting, motion in his clothes, panicked body language. Face toward camera, eyes open, mouth closed.
S04b (edit S04a): same image, same camera, change only: right leg forward, arms swapped, hat tilted the other way.
```
Overlay: pupils tiny (panic), mouth "AAA" open.

**S05** · 2.44–3.36 · *"for his life"*
```
Extreme close-up of NAPOLEON's face mid-run, sweat drops, hair messed up, hat almost falling off,
blurred speed streaks of grass and sky behind him. Front view, eyes open, mouth closed.
```
Overlay: huge terrified eyes shaking, scream mouth lip-synced to "for his life".

**S06** · 3.36–4.54 · *"in 1807"*
```
Wide establishing aerial shot of a grand French country estate in July 1807: palace, formal gardens, a big
green meadow with white tents and blue-white-red flags, horses, hundreds of tiny officers, summer haze, birds.
```
Overlay: none (slow push-in, the "1807" caption carries it).

**S07** · 4.54–4.98 · *"but it was"*
```
Medium shot of NAPOLEON standing frozen in the meadow, looking down at something at his feet off-frame,
nervous posture, shoulders up. Three-quarter view, face visible, eyes open, mouth closed.
```
Overlay: eyes slowly look down.

**S08** · 4.98–5.86 · *"hungry rabbits"*
```
Macro close-up of THE RABBIT sitting in the grass looking straight into the camera, whiskers sharp,
dew on its fur, sunlight in its ears, very cute but slightly menacing, shallow depth of field. Eyes open, mouth closed.
```
Overlay: big googly eyes staring, slow blink, tiny mouth chewing.

**S09a / S09b** · 5.86–6.56 · *(pause, beat)*
```
S09a: The same rabbit, but now 20 more identical rabbits rise out of the grass behind it, all staring at the camera.
S09b (edit S09a): same image, change only: all rabbits' ears now up straight and noses twitching.
```
Overlay: all eyes blink at once (this is the comedy beat).

### "To celebrate peace, his staff threw him a rabbit hunt."

**S10** · 6.56–7.40 · *"To celebrate peace"*
```
NAPOLEON shaking hands with a tall Russian emperor in a white uniform with gold epaulettes, standing on a
decorated wooden raft with a white pavilion in the middle of a calm river, soldiers cheering on both banks,
golden morning light. Both faces visible, smiling, mouths closed.
```
Overlay: both grinning mouths, eyes happy (curved).

**S11** · 7.40–8.20 · *"his staff"*
```
MARSHAL BERTHIER bowing deeply and proudly toward camera, presenting with one open hand, rolled paper in the other,
standing in front of a line of officers, palace gardens behind. Face visible, eyes open, mouth closed.
```
Overlay: eager eyes, big smile, lip-sync "his staff".

**S12** · 8.20–9.36 · *"threw him a rabbit hunt"*
```
Grand hunting party in a sunny meadow: officers in uniforms holding long hunting muskets, hunting dogs,
banners, and a long row of wooden cages in the foreground stuffed with hundreds of fluffy rabbits.
NAPOLEON in the center holding a musket, excited. His face visible, eyes open, mouth closed.
```
Overlay: Napoleon excited eyes; the cage rabbits get tiny blinking eyes.

**S13** · 9.36–9.84 · *(beat)*
```
Close-up of NAPOLEON proudly loading a fancy gold-engraved hunting musket, grinning, sunlight on the metal.
Face visible, eyes open, mouth closed.
```
Overlay: evil-confident squint, grin.

### "But the rabbits were tame."

**S14a / S14b** · 9.84–10.32 · *"But the rabbits"*
```
S14a: Close-up of a soldier's hand pulling open a wooden cage door, rabbits about to come out.
S14b (edit S14a): same image, change only: door fully open, a flood of rabbits hopping out toward the camera.
```
Overlay: rabbits' eyes.

**S15** · 10.32–11.36 · *"were tame"*
```
Hundreds of rabbits sitting calmly in the sunny grass like happy pets, one big rabbit in front tilting its head,
butterflies, flowers, adorable and peaceful.
```
Overlay: front rabbit head-tilt, eyes blinking innocently, little smile.

### "They thought he'd brought food."

**S16** · 11.36–12.10 · *"They thought he'd brought"*
```
Shot from behind and low, over the backs of hundreds of rabbits, all turning their heads toward NAPOLEON who
stands far away in the middle of the meadow holding his musket. The rabbits' heads all point at him.
```
Overlay: Napoleon eyes nervous.

**S17** · 12.10–13.14 · *"food"*
```
Worm's-eye view from the rabbits' level looking up at NAPOLEON, who looks giant, his empty hands raised
confused, palms up. A rabbit's ears in the foreground. Face visible, eyes open, mouth closed.
```
Overlay: confused eyes (one bigger than the other), mouth "huh?".

### "Hundreds charged him, climbed his boots,"

**S18a / S18b / S18c** · 13.14–14.28 · *"Hundreds charged him"* (swap every 10 frames, then loop)
```
S18a: Low ground-level shot of a giant wave of hundreds of rabbits sprinting straight at the camera across the meadow,
dust and grass flying, ears back, epic like a cavalry charge, NAPOLEON tiny in the background.
S18b (edit S18a): same scene, change only: the rabbits are 3 times closer and mid-leap, front paws stretched.
S18c (edit S18a): same scene, change only: one rabbit fills the frame mid-air, jumping at the lens.
```
Overlay: angry determined rabbit eyebrows.

**S19a / S19b** · 14.28–15.20 · *"climbed his boots"*
```
S19a: Close-up on NAPOLEON's tall black shiny riding boots in the grass with five rabbits climbing up them,
claws gripping the leather.
S19b (edit S19a): same image, change only: now 15 rabbits, piled up to his knees, one rabbit on top.
```
Overlay: rabbits' eyes, happy.

**S20** · 15.20–15.60 · *(beat)*
```
NAPOLEON swatting rabbits away with his bicorne hat, rabbits clinging to his coat and shoulders,
chaos, fur flying, officers behind him laughing. Face visible, eyes open, mouth closed.
```
Overlay: screaming mouth, eyes darting.

### "and the greatest general alive retreated to his carriage."

**S21** · 15.60–16.56 · *"the greatest general"*
```
Same heroic pose as S01 (on a rearing white horse on a hill at sunset) BUT the horse and NAPOLEON are completely
covered in rabbits: on his hat, shoulders, arms, the horse's back. Epic and absurd. Face visible, eyes open, mouth closed.
```
Overlay: dead-inside flat eyes (the irony beat).

**S22a / S22b** · 16.56–17.74 · *"alive retreated"* (swap every 6 frames)
```
S22a: NAPOLEON running away from camera toward a black and gold horse carriage, holding his hat on his head, generals
running beside him, a river of rabbits chasing them. Side-three-quarter view, his face looking back over his shoulder, eyes open.
S22b (edit S22a): same image, change only: legs in the opposite stride, the rabbits closer.
```
Overlay: terrified looking-back eyes.

**S23** · 17.74–18.44 · *"to his carriage"*
```
NAPOLEON diving head-first through the open door of the black and gold carriage, boots in the air, rabbits leaping
toward the door, the coachman whipping the horses. Dynamic action, motion in the clothes.
```
Overlay: none, plus a door-slam sound effect at 18.4 s.

**S24** · 18.44–18.91 (end) · *(twist freeze)*
```
The carriage racing away in a cloud of dust in the background; in the foreground THE RABBIT sits on a rock,
looking straight at the camera like it just won a war, tiny and proud, golden sunset. Eyes open, mouth closed.
```
Overlay: smug half-closed eyes, a one-sided smirk, slow blink.

---

## Part 3: Eyes + mouth animation (prompt for GPT to write the Remotion code)

```
Write two React components for Remotion 4 (TypeScript, SVG only, no images, transparent background),
in the style of quirky funny YouTube Shorts where big cartoon googly eyes and a drawn mouth are pasted
onto photoreal faces.

1) <GooglyEyes /> props:
   - size: number (px width of ONE eye), gap: number (px between eyes)
   - lookX, lookY: -1..1 (pupil direction)
   - pupil: 0.2..1 (pupil scale; 0.3 = panic, 1 = cute)
   - lid: 0..1 (0 = open, 1 = closed; 0.5 = bored/smug)
   - browAngle: degrees (+ angry, - worried), browUp: px
   - mood: "neutral" | "panic" | "smug" | "happy" | "angry" | "dead" | "confused"
     ("happy" = upside-down U arcs; "dead" = flat lids at 0.6 and tiny pupils; "confused" = one eye 20% bigger)
   - shake: 0..1 (fast jitter for terror)
   Look: pure white eyeballs with a thick 6% black outline, glossy black pupil with two white highlights,
   soft drop shadow so it sits on the photo, slight wobble on the pupils (spring physics, they overshoot then settle).
   Auto blink every 2-4 s (3-frame blink: close on frame 1, closed frame 2, open frame 3), seeded by a `seed` prop.

2) <CartoonMouth /> props:
   - width: number
   - viseme: "rest" | "A" | "E" | "O" | "U" | "MBP" | "FV" | "L" | "smile" | "smirk" | "scream" | "frown" | "chew"
   - Look: thick black outline, dark red inside, pink tongue, white top teeth on A/E/scream, soft shadow.
   - Morph smoothly between visemes over 2 frames (interpolate the SVG path points, same point count for every shape).
   - Also export visemeFromWord(word: string): Viseme[] that turns an English word into a rough viseme sequence,
     and <LipSync words={[{w,s,e}]} fps={30} /> that drives CartoonMouth from word timings (seconds).

3) A demo composition 1080x1920 30fps 6 seconds on a grey background showing every mood and every viseme
   with labels, so I can check them.

Return complete files: GooglyEyes.tsx, CartoonMouth.tsx, LipSync.tsx, Demo.tsx. No external libraries except remotion.
```

Optional, if you prefer drawn PNG eyes from GPT instead of code:
```
Sprite sheet on a fully transparent background, 4 x 4 grid, each cell one pair of big cartoon googly eyes
(white eyeballs, thick black outline, glossy black pupils with white highlights, soft shadow), moods in order:
neutral, look left, look right, look up, look down, half-closed smug, closed blink, panic tiny pupils,
happy arcs, angry with eyebrows, worried with eyebrows, dead flat, confused one big one small, crying, hearts, stars.
Flat vector cartoon look, NO face, NO skin, only the eyes.
```
```
Sprite sheet on a fully transparent background, 4 x 4 grid, each cell one cartoon mouth (thick black outline,
dark red inside, pink tongue, white teeth where open), shapes in order: closed rest, A, E, O, U, M/B/P, F/V, L,
smile, big grin, smirk, scream, frown, chew 1, chew 2, tongue out. Flat vector cartoon look, NO face, only the mouth.
```

---

## What I need back
- `C00.png` + `S01.png` … `S24.png` (31 shot images including the a/b/c frames, 32 with C00)
- The 4 `.tsx` files from Part 3 (or the 2 sprite sheets)
