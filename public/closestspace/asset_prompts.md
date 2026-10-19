# Closest to space: image prompts

**Style (inside every prompt):** Unreal Engine 5 cinematic render with a light stylised touch, plain white background, every part fully in frame, no floor shadow. The maps, the 3D Everest, the globes, the geoid, the climbers, the cook and every label are built in Remotion from free data and code, so only four props are needed.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**cs01_magnifier.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a classic magnifying glass: a thick polished chrome ring rim, a short chrome collar, and a long glossy black handle with a subtle grip groove, the lens area completely empty and filled with the plain white background (no glass, no reflections inside the ring)",
  "camera": "straight-on front view, the ring at the upper left, the handle pointing down to the lower right at about 45 degrees, the whole prop fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render with a light stylised touch, Lumen global illumination, physically based chrome with soft studio reflections, glossy black plastic handle, crisp edges",
  "lighting": "soft studio key light from the upper left, gentle rim light",
  "background": "plain pure white, no floor, no shadow",
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "logos", "glass inside the ring", "hands", "shadow on the floor", "watermark"]
}
```

---

**cs02_flat_earth.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a playful cartoon 'flat earth' model: a thick round disc seen from slightly above, a blue ocean top with simple green and sandy continents arranged around a white North Pole at the centre, a tall white ice wall running all the way round the rim, small fluffy clouds floating just above the surface, and a rough brown rocky underside tapering into a shallow bowl beneath",
  "camera": "three-quarter view from about 30 degrees above, the whole disc and its underside fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render with a light stylised touch (clean, bright, like a premium animated film), Lumen global illumination, physically based materials, glossy water, crisp ice, rough rock",
  "lighting": "bright soft daylight from the upper left, gentle rim light",
  "background": "plain pure white, no floor, no shadow",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "labels", "logos", "people", "dome", "watermark"]
}
```

---

**cs03_tape_measure.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a chunky yellow retractable tape measure case with a black rubber grip panel, a red lock button on top and a round metal centre screw; the steel tape is fully retracted with only the small metal hook tip showing at the front",
  "camera": "three-quarter view from about 30 degrees above, the whole case fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render with a light stylised touch, Lumen global illumination, physically based glossy plastic, rubber and brushed metal, crisp edges",
  "lighting": "soft studio key light from the upper left, gentle rim light",
  "background": "plain pure white, no floor, no shadow",
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "numbers", "brand names", "logos", "hands", "watermark"]
}
```

---

**cs04_rumali_roti.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one huge, paper-thin Indian rumali roti stretched out flat and slightly translucent, a soft cream colour with scattered light brown toasted spots and a few delicate folds and ripples near its edge, a light dusting of flour",
  "camera": "three-quarter view from about 30 degrees above, the roti seen as a wide oval, fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render with a light stylised touch, Lumen global illumination, physically based thin dough with subsurface light showing through, soft toasted spots",
  "lighting": "warm soft light from the upper left, light glowing through the thin dough",
  "background": "plain pure white, no floor, no shadow",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "logos", "hands", "plate", "tawa", "watermark"]
}
```
