# Hundred Years' War: image prompts

**Style (inside every prompt):** Unreal Engine 5 cinematic render with a light stylised cartoon touch, matching the reference's soft storybook cutaways. All characters (both knights, Edward III, the French king, Joan in every look, Charles VII, the cavalry, the longbowmen, the judge) and every moving prop are built in Remotion, as in the Thailand video. That leaves three backgrounds and one prop.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**h01_village_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon story",
  "subject": "a small farming village in eastern France in the early 1400s (Domrémy): a muddy dirt lane running straight away from the camera between thatched timber-and-stone cottages, wooden fences, a few autumn trees with orange leaves, a small stone church tower far in the distance, puddles on the lane",
  "camera": "eye level, straight down the lane, the lower half is open lane where one standing character will fill about half the frame height",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and warm like a premium animated film, not gritty), Lumen global illumination, physically based materials, wet mud, wood grain, thatch detail, soft ray-traced shadows",
  "lighting": "soft overcast autumn daylight, gentle mist in the distance",
  "framing": "full frame, no people, no animals, nothing in the centre of the lane",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "logos", "flags", "people", "animals", "watermark"]
}
```

---

**h02_battlefield_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon battle",
  "subject": "an open grassy battlefield in northern France in the 1300s: a wide flat meadow of golden-green grass in the lower half, a dark pine and oak forest line across the middle, low misty hills behind, a grey cloudy sky with drifting fog",
  "camera": "eye level, a wide view, the lower half is open grass where two small groups of soldiers will stand far apart",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft, cinematic like a premium animated film, not gritty), Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "cool overcast daylight with soft fog in the trees",
  "framing": "full frame, no people, no horses, no weapons",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "logos", "flags", "people", "horses", "weapons", "blood", "watermark"]
}
```

---

**h03_town_square_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon trial",
  "subject": "the old market square of a medieval French town in 1431 (Rouen): a wide cobblestone square, tall half-timbered houses with steep roofs around it, a gothic cathedral spire far in the background, and on the right side a raised wooden platform with steps and a simple wooden railing (an empty judge's stand)",
  "camera": "eye level, a wide view, the centre-left of the square open where a tall wooden post will stand, the platform on the right where one small character will stand",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and warm like a premium animated film, not gritty), Lumen global illumination, physically based materials, cobblestone, timber and plaster detail, soft ray-traced shadows",
  "lighting": "warm late-afternoon light with a soft hazy sky",
  "framing": "full frame, no people, nothing standing in the centre of the square",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "logos", "flags", "people", "fire", "smoke", "watermark"]
}
```

---

**h04_stake_pyre.png** (1:1, a prop on white)
```json
{
  "type": "single prop cut-out for animation",
  "subject": "a medieval wooden execution stake: one tall rough wooden post standing upright in the middle of a neat cone-shaped pile of bundled firewood sticks and straw, with a short coil of rope hanging loose on the post; nobody tied to it, no fire",
  "view": "straight-on front view at eye level, the whole post and pile fully in frame",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft, like a premium animated film, not gritty), physically based materials, wood grain, bark and straw detail",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white background, no ground, no shadow",
  "framing": "centred, empty white space around it",
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "people", "fire", "smoke", "flames", "watermark", "cropped edges"]
}
```
