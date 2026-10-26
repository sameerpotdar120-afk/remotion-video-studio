# Madeira: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**md01_caravel.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a 15th-century Portuguese caravel sailing: a small wooden hull with a high stern castle, two lateen sails and one square sail, all white canvas painted with large red crosses of the Order of Christ, ropes and rigging, a small flag on the mast",
  "camera": "side three-quarter view from slightly above, the ship sailing to the right, the whole ship from the waterline up fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (weathered oak planks, tarred rope, heavy canvas, painted crosses)",
  "lighting": "warm daylight from the left, soft rim light",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "water",
    "waves",
    "people",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md02_laurel_tree.png** (1:1)
```json
{
  "type": "single tree on a plain white background, for cutting out (used many times to grow a forest)",
  "subject": "one tall, dense laurel-forest tree of the kind that once covered Madeira: a thick crooked trunk with moss, a big rounded crown of dark glossy evergreen leaves, deep shadows inside the crown",
  "camera": "three-quarter view from about 30 degrees above, the whole tree from the base of the trunk to the top fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (bark, moss, glossy leaves)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "ground",
    "grass",
    "other trees",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md02b_laurel_tree_tall.png** (1:1)
```json
{
  "type": "single tree on a plain white background, for cutting out (used many times to grow a forest)",
  "subject": "one tall narrow laurel-forest tree: a straight mossy trunk and a taller, narrower crown of dark glossy evergreen leaves, a few hanging lichens",
  "camera": "three-quarter view from about 30 degrees above, the whole tree from the base of the trunk to the top fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (bark, moss, glossy leaves, lichen)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "ground",
    "grass",
    "other trees",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md03_tree_burning.png** (1:1)
```json
{
  "type": "single tree on a plain white background, for cutting out",
  "subject": "the same kind of dense laurel tree fully on fire: bright orange and yellow flames climbing through the crown, glowing embers, the leaves blackening, thick dark smoke rising from the top",
  "camera": "three-quarter view from about 30 degrees above, the whole tree from the base of the trunk to the top fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (burning leaves, glowing bark, embers, smoke)",
  "lighting": "the fire lighting the tree from inside, warm orange glow",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "ground",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md04_flame_a.png** (1:1)
```json
{
  "type": "single fire effect on a pure black background (it is screen-blended over the map)",
  "subject": "one big tall natural flame from a forest fire: a bright white-yellow core, orange tongues, red tips, a few sparks flying off the top",
  "camera": "straight-on view, the whole flame fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (fire, sparks)",
  "lighting": "the flame is the only light",
  "background": "pure black, nothing else in the frame",
  "avoid": [
    "text",
    "logos",
    "smoke",
    "wood",
    "ground",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md04b_flame_b.png** (1:1)
```json
{
  "type": "single fire effect on a pure black background (it is screen-blended over the map)",
  "subject": "one wide, low, flickering flame from a forest fire, leaning to the right as if in wind, a bright yellow core, orange edges, sparks",
  "camera": "straight-on view, the whole flame fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (fire, sparks)",
  "lighting": "the flame is the only light",
  "background": "pure black, nothing else in the frame",
  "avoid": [
    "text",
    "logos",
    "smoke",
    "wood",
    "ground",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md05_title_madeira_wood.png** (16:9)
```json
{
  "type": "3D lettering on a plain white background, for cutting out",
  "subject": "the single word MADEIRA (spelled M-A-D-E-I-R-A, all capitals) as thick, chunky bold 3D block letters carved from dark old laurel wood, visible wood grain and growth rings on the faces, a few glowing ember cracks along the edges as if the wood is starting to burn, the letters sitting in one straight line",
  "camera": "straight-on front view, very slightly from below, the whole word fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (carved wood grain, bark edges, glowing embers)",
  "lighting": "warm light from the upper left, an orange glow from the ember cracks",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "any other words or letters",
    "logos",
    "flames covering the letters",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md06_sugar_cane.png** (1:1)
```json
{
  "type": "single plant clump on a plain white background, for cutting out (used many times over the island)",
  "subject": "one clump of tall sugar cane: a bundle of thick jointed green-yellow stalks with long arching leaves, a little dark soil at the base",
  "camera": "three-quarter view from about 30 degrees above, the whole clump fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (jointed cane stalks, leaves, soil)",
  "lighting": "bright warm sunlight",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md07_sugar_loaf.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one tall cone-shaped loaf of refined white sugar, the way sugar was sold in the 1400s and 1500s, standing on a small square of rough paper, sparkling sugar crystals on its surface",
  "camera": "three-quarter view from about 30 degrees above, the whole loaf fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (sugar crystals, rough paper)",
  "lighting": "soft warm daylight, a bright highlight on the white sugar",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**md08_settlers_boat.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a small 15th-century wooden rowing boat carrying four settlers in simple wool clothes and caps, looking back toward the shore, one pulling an oar, faces lit orange as if by a big fire behind them",
  "camera": "three-quarter view from about 30 degrees above, the whole boat fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (wet wood, wool cloth, rope)",
  "lighting": "a strong warm orange glow from one side, cool shadows",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "water",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md09_levada_forest.png** (16:9)
```json
{
  "type": "landscape photo card",
  "subject": "a levada on Madeira: a narrow stone water channel full of clear running water beside a narrow walking path, winding through a green laurel forest covered in moss and ferns",
  "camera": "wide landscape view",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (stone channel, running water, moss, ferns)",
  "lighting": "soft daylight through the leaves",
  "background": "the scene itself fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md09b_levada_cliff.png** (16:9)
```json
{
  "type": "landscape photo card",
  "subject": "a levada on Madeira cut into the side of a steep green cliff: a narrow stone water channel and path carved straight into the rock, a deep green valley far below, a thin waterfall on the far side",
  "camera": "wide landscape view",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (carved rock, running water, moss)",
  "lighting": "bright soft daylight",
  "background": "the scene itself fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md10_vineyard_terraces.png** (16:9)
```json
{
  "type": "landscape photo card",
  "subject": "steep green vineyard terraces on a Madeira hillside above the Atlantic, rows of vines on stone walls, ripe grapes, the ocean below",
  "camera": "wide landscape view",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (vines, grapes, stone terrace walls)",
  "lighting": "warm golden evening light",
  "background": "the scene itself fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "people",
    "buildings",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md11_wine_bottle.png** (9:16)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one dark glass bottle of Madeira wine, rich amber-brown wine visible through the glass, a plain cream paper label with no writing, a wax-sealed cork",
  "camera": "straight-on front view, the whole bottle fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glass reflections, wine, paper label, wax)",
  "lighting": "soft studio light from the left, a bright vertical highlight on the glass",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "letters",
    "brand names",
    "logos",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**md12_madeira_paradise.png** (16:9)
```json
{
  "type": "landscape photo card",
  "subject": "Madeira today: steep green mountains rising out of the blue Atlantic, a sea of white clouds below the peaks, wildflowers in the foreground, sunrise light",
  "camera": "wide landscape view",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (rock, clouds, flowers, sea)",
  "lighting": "warm sunrise light",
  "background": "the scene itself fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**md13_footballer_back.png** (3:4)
```json
{
  "type": "single character on a plain white background, for cutting out",
  "subject": "a fictional professional footballer seen from behind, running and dribbling a ball, wearing a plain white football kit with a big number 7 on the back, white socks, dark boots, short dark hair; the face is not visible",
  "camera": "full body from behind and slightly to the side, the whole figure and the ball fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (kit fabric, grass stains, leather ball)",
  "lighting": "bright stadium-style light from above",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "any face",
    "a real person's likeness",
    "names",
    "logos",
    "sponsors",
    "club badges",
    "watermark"
  ],
  "aspect_ratio": "3:4",
  "output": "largest size available (4K if possible)"
}
```
