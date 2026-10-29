# Chandigarh: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.
**Reuse (don't generate):** `gp10_sun.png` and `gp19_map_pin.png` from the Garbage Patch video.

---

**cg01_chandi_temple.jpg** (9:16)
```json
{
  "type": "full-frame scene, tall 9:16",
  "subject": "a Hindu hilltop temple dedicated to Mata Chandi in the Shivalik foothills near Chandigarh: a white and saffron shikhara temple with a red flag on top, stone steps leading up, bells at the entrance, green forested hills behind, morning mist in the valley",
  "camera": "low angle from the foot of the steps looking up at the temple, centred, the full temple and sky in frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (weathered white plaster, saffron paint, worn stone steps, brass bells, leaves)",
  "lighting": "soft warm morning sun with light haze",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signboards",
    "logos",
    "people",
    "crowds",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg02_le_corbusier.jpg** (9:16)
```json
{
  "type": "full-frame scene, tall 9:16",
  "subject": "the French-Swiss architect Le Corbusier in about 1951, standing in his drawing studio holding up a large paper master plan of Chandigarh (a grid of rectangular sectors with a capitol block at the top) with both hands toward the camera. First find a free reference photo of Le Corbusier (public domain or CC0, for example the 1964 Dutch Nationaal Archief portrait on Wikimedia Commons) and base his likeness on it: round black thick-rimmed glasses, bald head with short grey hair at the sides, dark suit, white pocket square, bow tie. Do not copy the photo, render him anew",
  "camera": "waist-up, eye level, he is centred and looking at the camera, the plan held at chest height and fully visible",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (wool suit, paper plan with pencil lines, drafting tables, rolled blueprints and T-squares in the background)",
  "lighting": "soft window light from the left, warm studio",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "readable words on the plan",
    "logos",
    "other people",
    "watermark of the reference",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg03_palace_of_assembly.jpg** (9:16)
```json
{
  "type": "full-frame scene, tall 9:16",
  "subject": "the Palace of Assembly (Vidhan Sabha) in Chandigarh's Capitol Complex by Le Corbusier: raw béton brut concrete, a huge upturned curved portico roof on thin blade columns, a tall hyperboloid tower rising from the roof, a long reflecting pool in front",
  "camera": "wide shot from across the reflecting pool, low and centred, the whole building and sky in frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (raw board-marked concrete, still water reflections, warm stone paving)",
  "lighting": "clear blue sky, warm late-morning sun",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signboards",
    "logos",
    "people",
    "cars",
    "flags",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg04_secretariat.jpg** (9:16)
```json
{
  "type": "full-frame scene, tall 9:16",
  "subject": "the Secretariat building in Chandigarh's Capitol Complex by Le Corbusier: a very long raw concrete slab block whose whole facade is a deep honeycomb grid of brise-soleil sun breakers, a sculptural ramp tower and a rooftop pavilion",
  "camera": "three-quarter view from street level so the facade grid runs into the distance, the top of the building and sky in frame, the facade filling most of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (raw concrete, deep shadowed cells of the brise-soleil grid, a few small windows inside the cells)",
  "lighting": "hard bright sun from the side so every cell casts a shadow",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signboards",
    "logos",
    "people",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg05_high_court.jpg** (9:16)
```json
{
  "type": "full-frame scene, tall 9:16",
  "subject": "the Palace of Justice (Punjab and Haryana High Court) in Chandigarh's Capitol Complex by Le Corbusier: a long raw concrete building with a giant separate curved umbrella roof floating above it on arches, three tall entrance pillars painted green, yellow and red, a reflecting pool in front",
  "camera": "wide shot from across the open concrete plaza, low and centred, the full curved roof and sky in frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (raw concrete, painted pillars, wide concrete plaza slabs)",
  "lighting": "clear sky, strong midday sun with sharp shadows under the roof",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signboards",
    "logos",
    "people",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg06_sector17_plaza.jpg** (1:1)
```json
{
  "type": "full-frame scene, square card",
  "subject": "Sector 17 plaza in Chandigarh: a wide car-free pedestrian square paved in grey stone, three- and four-storey concrete shopping blocks with colonnades on both sides, people walking and sitting, a few trees and a fountain",
  "camera": "elevated view from about first-floor height looking along the plaza",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (concrete colonnades, shop awnings, paving stones, tree leaves)",
  "lighting": "warm late-afternoon light",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "readable shop signs",
    "brand names",
    "logos",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg07_sector_homes.jpg** (4:3)
```json
{
  "type": "full-frame scene, 4:3 card",
  "subject": "a residential street inside a Chandigarh sector: rows of neat two-storey brick and white homes with small front gardens, trees lining a quiet road",
  "camera": "eye level from the street, the homes along one side",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (brick, white plaster, garden hedges, leaves)",
  "lighting": "soft morning light",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signs",
    "logos",
    "people",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "4:3",
  "output": "largest size available (4K if possible)"
}
```

---

**cg08_sector_school.jpg** (4:3)
```json
{
  "type": "full-frame scene, 4:3 card",
  "subject": "a school inside a Chandigarh sector: a low modernist brick and concrete school building with a playground in front, swings and a small football ground",
  "camera": "eye level from the playground",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (brick, concrete, painted railings, grass)",
  "lighting": "soft morning light",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "signs",
    "logos",
    "children faces close-up",
    "cars",
    "watermark"
  ],
  "aspect_ratio": "4:3",
  "output": "largest size available (4K if possible)"
}
```

---

**cg09_sector_hospital.jpg** (4:3)
```json
{
  "type": "full-frame scene, 4:3 card",
  "subject": "a neighbourhood hospital inside a Chandigarh sector: a clean three-storey modernist building with a red cross symbol on a plain white panel, an entrance canopy and trees around",
  "camera": "eye level from the front lawn",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (concrete, glass, white panels, leaves)",
  "lighting": "clear daylight",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "hospital names",
    "logos",
    "people",
    "ambulances",
    "watermark"
  ],
  "aspect_ratio": "4:3",
  "output": "largest size available (4K if possible)"
}
```

---

**cg10_lahore_badshahi.jpg** (1:1)
```json
{
  "type": "full-frame scene, square (it is shown inside a round bubble)",
  "subject": "the Badshahi Mosque in Lahore: red sandstone walls, three white marble domes and four tall minarets, a vast courtyard in front",
  "camera": "wide view from the courtyard, centred, the domes and minarets fully in frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (red sandstone, white marble inlay, courtyard paving)",
  "lighting": "warm golden-hour light",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "people",
    "crowds",
    "logos",
    "flags",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg11_retro_computer.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "an old 1980s beige desktop computer with a chunky CRT monitor and a keyboard, the screen glowing with a blue CAD blueprint of a city grid",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (beige plastic, glass screen glare, keyboard keys)",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "brand names",
    "logos",
    "desk",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg12_human_body_glow.png** (9:16)
```json
{
  "type": "single figure on a plain white background, for cutting out",
  "subject": "a stylised standing human figure, front view, made of soft glowing translucent light blue glass, with the brain, heart and lungs faintly visible inside glowing warm orange",
  "camera": "front view, arms slightly away from the body, the whole figure from head to feet fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (translucent glass, soft inner glow, subtle organ shapes)",
  "lighting": "soft glow from within",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "faces",
    "skin",
    "clothes",
    "nudity details",
    "background",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**cg13_icon_drainage.png** (1:1)
```json
{
  "type": "single round icon tile on a plain white background, for cutting out",
  "subject": "a round icon tile: a small diorama inside a circle, seen three-quarter from above, the whole circle fully in frame with empty space around it: rain falling on a gentle green slope, the water running downhill in small clear streams into a channel at the bottom",
  "camera": "front three-quarter view from above, the whole round tile fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (grass, wet soil, clear water, small rocks)",
  "lighting": "soft daylight",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg14_icon_fertile_soil.png** (1:1)
```json
{
  "type": "single round icon tile on a plain white background, for cutting out",
  "subject": "a round icon tile: a small diorama inside a circle, seen three-quarter from above, the whole circle fully in frame with empty space around it: a rich dark brown cross-section of fertile soil with earthworms and roots, and young green crop sprouts growing on top",
  "camera": "front three-quarter view from above, the whole round tile fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (moist crumbly soil, roots, fresh leaves)",
  "lighting": "soft daylight",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg15_icon_water.png** (1:1)
```json
{
  "type": "single round icon tile on a plain white background, for cutting out",
  "subject": "a round icon tile: a small diorama inside a circle, seen three-quarter from above, the whole circle fully in frame with empty space around it: a clear blue river winding through green fields with a small lake, fresh and full",
  "camera": "front three-quarter view from above, the whole round tile fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (clear rippling water, grass, pebbles)",
  "lighting": "soft daylight",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "people",
    "boats",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg16_brain.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a stylised human brain, glossy soft pink with gentle highlights, friendly and clean (not gory)",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (smooth glossy surface, soft folds)",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "blood",
    "labels",
    "gore",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg17_heart.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a stylised anatomical human heart, glossy deep red with soft highlights and blue and red vessels at the top, friendly and clean (not gory)",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (smooth glossy surface, soft vessels)",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "blood",
    "labels",
    "gore",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg18_lungs.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a stylised pair of human lungs made of fresh green leaves and branches, shaped like lungs with a windpipe as a tree trunk, glossy and alive",
  "camera": "front view, the whole pair fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (fresh leaves, small branches, dew drops)",
  "lighting": "soft daylight from above",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "gore",
    "flesh",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg19_jute_texture.jpg** (1:1)
```json
{
  "type": "seamless tileable texture, full frame",
  "subject": "natural woven jute burlap cloth in warm light tan, a coarse visible basket weave with a few loose fibres",
  "camera": "flat, straight-on, evenly lit so it tiles without visible seams or a vignette",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (coarse woven fibres, slight colour variation)",
  "lighting": "soft even daylight",
  "background": "none, the texture fills the whole frame edge to edge",
  "avoid": [
    "text",
    "logos",
    "objects",
    "shadows from objects",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg20_water_ribbon_texture.jpg** (1:1)
```json
{
  "type": "seamless tileable texture, full frame",
  "subject": "shallow clear turquoise water seen from straight above over pale sand, gentle caustic light patterns and soft ripples",
  "camera": "flat, straight-on, evenly lit so it tiles without visible seams or a vignette",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (caustic light, ripples, sand grain)",
  "lighting": "soft even daylight",
  "background": "none, the texture fills the whole frame edge to edge",
  "avoid": [
    "text",
    "logos",
    "objects",
    "shadows from objects",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg21_paper_texture.jpg** (1:1)
```json
{
  "type": "seamless tileable texture, full frame",
  "subject": "smooth off-white drawing paper with a very fine grain and faint fibres",
  "camera": "flat, straight-on, evenly lit so it tiles without visible seams or a vignette",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (paper fibre, fine grain)",
  "lighting": "soft even daylight",
  "background": "none, the texture fills the whole frame edge to edge",
  "avoid": [
    "text",
    "logos",
    "objects",
    "shadows from objects",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg22_red_glitter_texture.jpg** (1:1)
```json
{
  "type": "seamless tileable texture, full frame",
  "subject": "deep dark red velvet with fine sparkling glitter, soft bokeh highlights scattered evenly",
  "camera": "flat, straight-on, evenly lit so it tiles without visible seams or a vignette",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (velvet pile, tiny glitter sparkles)",
  "lighting": "soft even daylight",
  "background": "none, the texture fills the whole frame edge to edge",
  "avoid": [
    "text",
    "logos",
    "objects",
    "shadows from objects",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg23_gold_glitter_texture.jpg** (1:1)
```json
{
  "type": "seamless tileable texture, full frame",
  "subject": "bright gold glitter and gold leaf flakes packed together, sparkling, warm yellow-gold",
  "camera": "flat, straight-on, evenly lit so it tiles without visible seams or a vignette",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (metallic gold flakes, sparkle highlights)",
  "lighting": "soft even daylight",
  "background": "none, the texture fills the whole frame edge to edge",
  "avoid": [
    "text",
    "logos",
    "objects",
    "shadows from objects",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**cg24_car.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one small white city hatchback car, clean and modern, driving to the right",
  "camera": "side three-quarter view from slightly above, the whole car fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted metal, glass, tyres)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "number plates",
    "people",
    "road",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```
