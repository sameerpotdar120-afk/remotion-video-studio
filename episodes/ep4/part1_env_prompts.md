# Mountain Cabin, Part 1: environment image prompts (GTA 6 / Unreal Engine 5 look)

Rules for every image:
- **Size:** vertical 9:16 Shorts at 4K, 2160×3840. In Midjourney add `--ar 9:16 --style raw --v 7`; elsewhere set 2160×3840 (or the largest 9:16 size, which I'll upscale).
- **NO PEOPLE.** Characters are added by us in code. Leave the spaces marked "empty space for characters" clear.
- **Keep the same cabin** in every shot: generate **E1 first**, then use it as the style/image reference (Midjourney `--sref` + image prompt, or "reference image") for E2–E9.
- **Depth:** each image needs a clear near, middle and far layer. That's what makes the 3D camera moves work.

Style block (already included in every prompt below):
`photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K`

Negative prompt (paste where supported): `people, person, character, face, text, watermark, logo, cartoon, anime, lowres, blurry, distorted perspective`

## E1: Cabin exterior at night (beat 1, hook) ★ generate first, use as reference
```
Vertical shot of an isolated two-story dark timber log cabin in a dense pine forest in the mountains at night, summer 1991, stone chimney, wraparound wooden porch with a single warm amber porch light glowing, warm light in two windows, green metal roof, gravel driveway curving toward the front steps in the foreground, tall black pine silhouettes, thin volumetric fog between the trees, deep blue moonlit sky with a few stars, empty porch with space at the front door for characters, low camera at driveway level, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E2: Living/dining room, warm party night (beats 2 & 4)
```
Vertical interior of a cozy 1991 mountain cabin living room and dining area at night, exposed log walls, stone fireplace with a soft fire, warm amber table lamps, wooden dining table in the middle ground set with plates of roast chicken, bread, two open wine bottles and wine glasses, plaid couch, antlers above the fireplace, a dark window showing pine trees outside, empty floor space in front of the table for characters to stand, eye-level camera, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, soft volumetric haze, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E3: Long gravel driveway through the pines, arriving car (beat 3)
```
Vertical high angle looking down a long winding gravel driveway through a dense pine forest at dusk turning to night, a dark 1990s American sedan with headlights on driving up the driveway in the middle ground, headlight beams cutting through light fog, the warm lit cabin small at the top of the driveway in the distance, nothing but pine trees for miles, deep blue hour sky, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E4: Front door from inside (beat 5, the knock)
```
Vertical interior shot facing the cabin's heavy wooden front door from inside, 1991, brass doorknob, small four-pane window in the door showing pitch black night, coat hooks with jackets beside the door, warm amber lamp light from the left falling across the door, cool blue moonlight leaking through the door window, wooden floorboards, empty space in front of the door for characters, slightly low eye-level camera, tense quiet mood, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, light dust in the air, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E5: Open doorway looking out into the dark porch (beat 6, the stranger)
```
Vertical shot from inside the cabin looking through the wide-open front door onto the dark wooden porch at night, 1991, the single amber porch light above the doorway lighting an empty patch of porch boards where a person will stand, beyond the porch the black pine forest and thin fog, warm interior light spilling out across the threshold, cold blue night outside, eerie silent mood, empty doorway for a character, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E6: From the porch down the driveway: broken-down pickup (beat 7)
```
Vertical view from the cabin porch looking down a long dark gravel driveway at night, at the very bottom an old rusty 1980s American pickup truck parked with its hood open and headlights on, headlight beams in the fog, dense black pine forest on both sides, the porch railing in the near foreground, empty space beside the truck for a man to stand, ominous quiet, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E7: Dark driveway mid-way (beat 8, Ryan walks down with his toolbox)
```
Vertical low shot on a dark gravel driveway halfway between the cabin and the road at night, 1991, towering pine trees on both sides closing in, thick ground fog, faint red glow of truck taillights far away at the bottom, the cabin's warm windows tiny behind, empty driveway path in the middle ground for a character walking away with a flashlight, isolated and uneasy, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, volumetric fog, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E8: Dining table, other angle, half-eaten food (beat 9, "Do you have any food?")
```
Vertical close medium shot across the same cabin wooden dining table at night, 1991, a single plate of leftover roast chicken bones and scraps in the foreground, a half-full wine glass, crumpled napkin, a hanging pendant lamp casting a warm pool of light on the table while the room behind falls into dark shadow, the dark window behind with pine silhouettes, an empty wooden chair at the table for a character, unsettling stillness, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, soft haze, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## E9: Dim corner background for close-ups (beats 10-11)
```
Vertical out-of-focus background of a dim 1991 cabin interior corner at night, log wall, a wall clock reading 10:20, a lamp turned low, deep shadows, cool blue moonlight from a window on one side and warm amber from the other, shallow depth of field, empty center for a close-up character, tense mood, photorealistic, Unreal Engine 5 cinematic render, Lumen global illumination, ray-traced reflections, soft haze, GTA 6 trailer aesthetic, teal-and-amber color grade, 1991 era, 35mm film grain, ultra detailed, 4K --ar 9:16 --style raw
```

## Shot use
| Image | Beats | 3D move I'll do |
|---|---|---|
| E1 | 1 | slow push toward the porch, fog drifting |
| E2 | 2, 4 | gentle drift; then a push to the table |
| E3 | 3 | crane down following the car's headlights |
| E4 | 5 | snap push on the knock |
| E5 | 6 | slow push to the woman in the doorway |
| E6 | 7 | push down the driveway toward the truck |
| E7 | 8 | follow Ryan from behind |
| E8 | 9 | slow push past the plate |
| E9 | 10-11 | slow push on the close-ups, then cut to black |
