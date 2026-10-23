# Panama Canal: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**pc01_lpg_carrier_top.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a large modern LPG gas carrier ship seen from directly above: a long dark red and black hull with a pointed bow, a clean white deck with a row of four long rounded cargo tank domes, a web of silver pipes and walkways between them, a white five-deck bridge superstructure near the stern with a small funnel, lifeboats on both sides",
  "camera": "orthographic top-down view from directly above, the ship lying horizontally with the bow pointing right, the whole ship fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted steel, deck grating, rust streaks at the waterline)",
  "lighting": "bright midday sun from the upper left",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": ["text", "ship names", "numbers", "logos", "flags", "water", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**pc02_container_ship_top.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a big container ship seen from directly above: a long red hull with a pointed bow, the deck packed with rows of shipping containers in mixed colours (rust red, blue, green, grey, orange), a white bridge superstructure near the stern",
  "camera": "orthographic top-down view from directly above, the ship lying horizontally with the bow pointing right, the whole ship fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (corrugated containers, painted steel)",
  "lighting": "bright midday sun from the upper left",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": ["text", "ship names", "numbers", "logos", "flags", "water", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**pc03_container_ship_side.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "the same big container ship seen exactly from the side: a long red and black hull, the deck stacked high with rows of shipping containers in mixed colours (rust red, blue, green, grey, orange), a white bridge superstructure near the stern, the full hull visible down to the keel",
  "camera": "straight side elevation, perfectly level, the bow pointing right, the whole ship fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": ["text", "ship names", "numbers", "logos", "flags", "water", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**pc04_dry_lakebed_bg.png** (9:16)
```json
{
  "type": "full-frame vertical background scene",
  "subject": "a tropical man-made lake during a severe drought: the foreground is a wide flat lakebed of deep cracked dry mud with dead grey tree stumps sticking out, the water pulled far back to a thin muddy channel in the middle distance, two or three large cargo ships sitting low in the narrow channel, green jungle hills on both sides under a pale hot hazy sky",
  "camera": "eye level, wide 24 mm lens, the horizon in the upper third, the lower half open flat cracked ground with empty space in the centre for a character to stand, the upper right sky empty",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (dried mud plates, dust, bark)",
  "lighting": "harsh bright afternoon sun from the upper right, heat haze over the ground",
  "avoid": ["people", "animals", "text", "ship names", "logos", "sun disc", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**pc05_panama_city_bg.png** (9:16)
```json
{
  "type": "full-frame vertical background scene",
  "subject": "a sunny seafront promenade in a tropical capital city: a wide clean paved walkway along a calm blue bay, tall modern glass skyscrapers across the water, a row of palm trees, and on the left in the middle distance a simple steel public drinking fountain on a short pillar",
  "camera": "eye level, 28 mm lens, the skyline across the upper half, the walkway open and empty in the centre and lower third for a character to stand",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "bright clear morning sun, soft blue sky with a few white clouds",
  "avoid": ["people", "text", "signs", "logos", "brand names", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**pc06_gavel_hammer.png** (1:1)
```json
{
  "type": "single part on a plain white background, for rigging",
  "subject": "a classic wooden auction gavel on its own: a polished dark walnut barrel-shaped head with two brass bands, and a long turned wooden handle",
  "camera": "three-quarter view from about 30 degrees above, the gavel lying diagonally with the head at the upper right, fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real wood grain and brushed brass",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "hands", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**pc06b_gavel_block.png** (1:1)
```json
{
  "type": "single part on a plain white background, for rigging",
  "subject": "a round wooden sound block for an auction gavel on its own: a low polished dark walnut disc with a thin brass ring around the top edge",
  "camera": "three-quarter view from about 30 degrees above, fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real wood grain and brushed brass",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "hands", "gavel", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```
