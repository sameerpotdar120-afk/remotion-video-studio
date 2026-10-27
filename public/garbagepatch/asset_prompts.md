# Garbage Patch: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**gp01_trash_island.png** (1:1)
```json
{
  "type": "a floating island of trash seen from straight above, on a plain white background, for cutting out",
  "subject": "a big, roughly oval raft of floating ocean plastic seen from directly above, like an island on a satellite map: thousands of pieces packed together (faded bottles, caps, crates, buckets, tangled green and blue fishing nets, rope, foam, plastic bags, a few yellow and red pieces), piled higher in the middle, loose pieces thinning out at the ragged edges, small patches of murky water between them",
  "camera": "top-down, camera pointing straight down, the whole raft fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (sun-bleached plastic, wet glossy highlights, frayed net fibres, algae stains)",
  "lighting": "bright midday sun from the upper left, soft shadows between the pieces",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "people",
    "animals",
    "ships",
    "open ocean around it",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp02_microplastic_texture.jpg** (1:1)
```json
{
  "type": "full-frame texture seen from straight above",
  "subject": "the ocean surface thick with microplastic: millions of tiny pale plastic fragments, flakes, beads and fibres (white, pale blue, faded pink, cream) floating in murky blue-green water, spread evenly across the whole frame",
  "camera": "top-down, camera pointing straight down, the texture filling the frame edge to edge with even density (it gets tiled and masked)",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (tiny wet fragments, a few slightly bigger flakes, faint ripples)",
  "lighting": "soft daylight, gentle glints on the water",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "big objects",
    "bottles",
    "fish",
    "boats",
    "horizon",
    "vignette",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp03_plastic_bottle.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one old, crumpled clear plastic water bottle with a blue cap and no label, faded and scratched from floating at sea, a few drops of water on it",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (crinkled thin plastic, scratches, water droplets, a little algae on the base)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "brand names",
    "logos",
    "water",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp04_plastic_crate.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one weathered plastic fish crate (a shallow open box with slotted sides), faded blue-grey, chipped corners, a strand of seaweed caught on it",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (faded scratched plastic, chipped edges, salt stains, wet seaweed)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "brand names",
    "logos",
    "water",
    "fish",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp05_ghost_net.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one bundle of abandoned fishing net (a ghost net): tangled green and blue nylon mesh rolled into a loose clump, with a few orange floats and a frayed rope end",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (nylon mesh knots, frayed fibres, faded plastic floats, wet sheen)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "fish",
    "animals",
    "water",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp06_plastic_bag.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one thin white plastic carrier bag floating as if underwater, half open and gently billowing, slightly see-through, the handles drifting",
  "camera": "side view, the whole bag fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (thin translucent film, soft creases, light passing through it)",
  "lighting": "soft light from above, as if through water",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "fish",
    "water",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp07_fishing_boat.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one small modern fishing trawler: a white and dark-blue steel hull, a small wheelhouse, a crane arm and net drum at the stern, orange buoys on the side, a little rust",
  "camera": "side three-quarter view from slightly above, the boat facing right, the whole boat from the waterline up fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted steel, rust streaks, wet deck, coiled ropes)",
  "lighting": "warm daylight from the left, soft rim light",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "flags",
    "names on the hull",
    "people",
    "water",
    "waves",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp08_cargo_ship.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one container cargo ship: a long dark-red hull, a white bridge tower at the stern, stacks of colourful shipping containers on deck",
  "camera": "side three-quarter view from about 30 degrees above, the ship facing right, the whole ship from the waterline up fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted steel hull, rust streaks, corrugated containers)",
  "lighting": "warm daylight from the left, soft rim light",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "flags",
    "names on the hull",
    "water",
    "waves",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp09_airplane.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one white passenger jet airliner seen from directly above, wings spread, plain white body with grey engines",
  "camera": "top-down, camera pointing straight down, the plane flying toward the top of the frame, the whole plane fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted aluminium panels, engine nacelles, small window rows)",
  "lighting": "bright sun from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "airline livery",
    "clouds",
    "ground",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp10_sun.png** (1:1)
```json
{
  "type": "single stylised object on a plain white background, for cutting out",
  "subject": "a stylised 3D sun: a glowing golden-yellow sphere with a hot bright core and twelve chunky triangular rays around it, like a polished collectible emblem, warm and friendly",
  "camera": "front view, the whole sun and its rays fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (smooth glossy gold, soft inner glow, bevelled rays)",
  "lighting": "self-lit, warm glow",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "faces",
    "eyes",
    "clouds",
    "sky",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp11_water_drop.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one single clear water droplet falling, teardrop shape, with a cyan-blue tint, a bright highlight and tiny reflections inside",
  "camera": "side view, the whole drop fully in frame with lots of empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (clear water, refraction, crisp highlight)",
  "lighting": "bright soft light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "splash",
    "puddle",
    "other drops",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp12_wave.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one curling ocean wave crest breaking to the right: deep blue-green water rising into a white foamy lip, spray flying off the top, a few bits of plastic tumbling in the foam",
  "camera": "side view, the whole wave crest fully in frame with empty space around it (no sea surface extending to the edges)",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (translucent water, foam, spray droplets)",
  "lighting": "bright daylight from the upper left, light shining through the wave",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "surfers",
    "people",
    "beach",
    "sky",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp13_bottle_shards.png** (16:9)
```json
{
  "type": "a set of separate pieces on a plain white background, for cutting out",
  "subject": "the same crumpled clear plastic bottle with a blue cap broken into 7 separate jagged pieces (cap, neck, 4 body pieces, base), laid out side by side with clear space between every piece so each can be cut out alone",
  "camera": "front view, all 7 pieces fully in frame in one row, evenly spaced, nothing touching",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (torn and cracked thin plastic edges, scratches, a few water drops)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "labels",
    "brand names",
    "logos",
    "water",
    "hands",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp14_magnifying_glass.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one classic round magnifying glass with a brass rim and a dark wooden handle, the lens perfectly clear and empty (pure white seen through it)",
  "camera": "front view, tilted slightly, the whole magnifying glass fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (polished brass, varnished wood grain, glass edge reflections)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "hands",
    "anything visible through the lens",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp15_small_fish.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one small silver sardine, side view, mouth slightly open, a few tiny pale plastic specks near its mouth",
  "camera": "side view, facing right, the whole fish fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (shiny silver scales, wet sheen, translucent fins)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "water",
    "plate",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp16_big_fish.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one big king fish (surmai), side view, long streamlined body, blue-grey back and silver belly with faint wavy lines",
  "camera": "side view, facing right, the whole fish fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (metallic scales, wet sheen, fin detail)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "water",
    "plate",
    "hook",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp17_fish_thali.png** (1:1)
```json
{
  "type": "single dish on a plain white background, for cutting out",
  "subject": "an Indian fish thali on a round steel plate: a bowl of red fish curry with pieces of fish, a fried fish slice, rice, two small bowls (dal and sabzi), a lemon wedge and onion rings",
  "camera": "top-down, camera pointing straight down, the whole plate fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (brushed steel plate, glossy curry, grains of rice, crisp fried coating)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "hands",
    "table",
    "cutlery",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp18_satellite.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "an Earth observation satellite: a gold-foil-wrapped box body with a camera lens pointing down, two long blue solar panel wings, small antennas",
  "camera": "three-quarter view from slightly below, the whole satellite including both panels fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (crinkled gold foil, solar cell grid, brushed metal)",
  "lighting": "hard sunlight from the left, strong contrast",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "flags",
    "Earth",
    "stars",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp19_map_pin.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one glossy red 3D map location pin (the classic teardrop marker with a white circle in its head)",
  "camera": "three-quarter view from slightly above, standing upright, the whole pin fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glossy lacquered plastic, soft reflections, a slight bevel)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "map",
    "ground",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp20_city_skyline.png** (16:9)
```json
{
  "type": "single miniature city piece on a plain white background, for cutting out",
  "subject": "one small cluster of a coastal American city: a few glass skyscrapers and mid-rise buildings tightly grouped on a small block of land with a tiny pier, like a miniature diorama piece",
  "camera": "three-quarter view from about 30 degrees above, the whole cluster fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glass facades, concrete, tiny windows, rooftop details)",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "signs",
    "famous landmarks",
    "water",
    "cars",
    "people",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp21_soup_underwater.jpg** (16:9)
```json
{
  "type": "full-frame scene, wide 16:9",
  "subject": "underwater in the open ocean just below the surface, murky blue-green water full of floating plastic: a big white plastic bag drifting like a jellyfish in front, a small fish swimming past it, bottle caps, wrappers, flakes and tiny fragments suspended everywhere, light rays coming down from the surface",
  "camera": "eye-level underwater camera, the bag in the left third, depth fading into blue haze behind",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (translucent film, suspended particles, caustic light)",
  "lighting": "sun rays and caustics from above, blue-green falloff",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "divers",
    "people",
    "boats",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp22_soup_surface.jpg** (16:9)
```json
{
  "type": "full-frame scene, wide 16:9",
  "subject": "close-up of the ocean surface covered in a thick slick of floating plastic: countless small coloured fragments (white, blue, red, green, yellow), foam bits, straws and wrappers packed together, small waves lifting them, dark blue water showing in the gaps",
  "camera": "low angle just above the water, looking slightly down across the surface, shallow depth of field, the foreground sharp",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (wet glossy fragments, foam, ripples)",
  "lighting": "overcast daylight with soft glints",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "brand names",
    "people",
    "boats",
    "horizon line",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**gp23_soup_bowl.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one deep white ceramic soup bowl filled to the brim with blue-green seawater, with tiny plastic fragments, a bottle cap, a bit of net and plastic flakes floating in it like soup ingredients, no spoon",
  "camera": "three-quarter view from about 30 degrees above, the whole object fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glazed ceramic, liquid surface with small ripples, wet plastic bits)",
  "lighting": "warm soft light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "spoon",
    "ladle",
    "hands",
    "table",
    "steam",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp23b_ladle.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "one stainless steel soup ladle on its own, with a long handle and a deep round cup, a few drops of water on it",
  "camera": "side three-quarter view, the ladle diagonal with the cup at the bottom left, the whole ladle fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (brushed steel, reflections, water drops)",
  "lighting": "warm soft light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "hands",
    "bowl",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**gp24_ocean_cutaway.jpg** (9:16)
```json
{
  "type": "full-frame cross-section scene, tall 9:16",
  "subject": "a cutaway view of the ocean, like a diorama cut open: at the top a thin band of pale blue sky, then the wavy water surface seen from the side, then a deep teal water column getting darker with depth, with a few plastic bottles, bags and nets drifting at different depths, and at the bottom a dark sea floor of sand and rocks with plastic waste half-buried in it",
  "camera": "straight side view, a flat cross-section, the surface line about a third of the way down, the sea floor along the bottom edge, no beach (that piece is separate)",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (water volume with god rays, suspended particles, sand, rocks, faded plastic)",
  "lighting": "sun from above, light rays fading with depth",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "logos",
    "fish",
    "divers",
    "boats",
    "beach",
    "watermark"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**gp25_shore_slope.png** (1:1)
```json
{
  "type": "single landform piece on a plain white background, for cutting out",
  "subject": "a cross-section piece of a sandy beach sloping down into the sea: a diagonal wedge of golden sand rising from the lower left to the upper right, littered with washed-up plastic (bottles, caps, flip-flops, net scraps), two red starfish and a few shells, the cut side showing layers of sand",
  "camera": "straight side view, the slope rising to the right, the whole piece fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (grains of sand, darker wet sand at the bottom edge, faded plastic litter)",
  "lighting": "warm daylight from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "water",
    "sky",
    "people",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```
