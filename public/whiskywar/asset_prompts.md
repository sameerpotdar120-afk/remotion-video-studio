# Whisky War: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows. Props and people on plain white so I can cut them out; the flags, notes, labels, maps and the Hans Island satellite views are made in code from free data.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**wk01_arctic_beach_bg.png** (9:16)
```json
{
  "type": "full-frame background photo for a sticker-collage scene",
  "subject": "a bare High Arctic island shore in summer: a wide flat beach of grey-brown pebbles and small rocks in the lower half, a calm grey-blue strait with a few floating ice pieces in the middle, a distant line of snowy mountains across the water, a heavy overcast grey-green sky above",
  "camera": "eye level, wide, slightly low, the lower half is open flat ground where a few cut-out figures, a flagpole and props will stand",
  "lighting": "cool flat overcast Arctic daylight, soft haze over the water",
  "framing": "full frame, empty: no people, no flags, no buildings, no boats",
  "avoid": [
    "text",
    "logos",
    "people",
    "flags",
    "animals",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**wk02_newspaper_bg.png** (9:16)
```json
{
  "type": "full-frame background prop shot",
  "subject": "a messy pile of old yellowed broadsheet newspapers lying on a desk, the top one in focus with a large vintage masthead reading 'The Northern Courier' and a big bold headline 'ARCTIC WHISKY WAR' with a smaller second line 'Canada and Denmark' under it, columns of small blurred body text, a small clipping and a folded page peeking out at the edges",
  "camera": "close, from about 30 degrees above, the top paper tilted slightly, the headline in the upper middle third, shallow depth of field so the edges blur",
  "lighting": "warm soft desk-lamp light from the upper left",
  "framing": "full frame, papers fill the whole frame",
  "avoid": [
    "real newspaper names",
    "logos",
    "photos of real people",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**wk03_hans_island_model.png** (16:9)
```json
{
  "type": "single 3D model on a plain white background, for cutting out",
  "subject": "a detailed terrain model of one small barren Arctic rock island (Hans Island, Nares Strait): kidney-shaped, low and flat-topped with grey-brown layered limestone, steep low cliffs all round, a shallow natural ridge running across its middle from north to south, patches of pale lichen, a thin rim of white surf and dark water hugging the shore, like a museum terrain model or photogrammetry scan",
  "camera": "three-quarter view from about 30 degrees above, the whole island fully in frame with empty space around it",
  "lighting": "soft neutral studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "flags",
    "buildings",
    "people",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**wk04_tom_hoyem.png** (9:16)
```json
{
  "type": "full-body character cut-out on a plain white background",
  "subject": "first find a free reference photo of Tom Høyem, the Danish Minister for Greenland in 1984 (public domain, Wikimedia Commons or an official Danish government photo) and base his likeness on it: a man in his early forties with short hair and a friendly face, standing proudly on the ground with his left hand on his hip and his right arm down by his side, wearing a 1980s navy blue padded expedition parka, dark trousers and sturdy hiking boots",
  "camera": "eye level, full body, straight on, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "logos",
    "flags",
    "copying any photo as-is",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**wk04b_tom_hoyem_arm.png** (9:16)
```json
{
  "type": "single body part on a plain white background, for rigging",
  "subject": "only the right arm of the same character as wk04_tom_hoyem (navy blue padded expedition parka sleeve, bare hand in a gripping pose as if holding a flagpole), from the shoulder to the fingertips, straight and slightly bent at the elbow",
  "camera": "same camera, angle, scale and lighting as wk04_tom_hoyem, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "the rest of the body",
    "text",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**wk05_canadian_soldier.png** (9:16)
```json
{
  "type": "full-body character cut-out on a plain white background",
  "subject": "a generic 1980s Canadian Forces soldier on an Arctic patrol (not a real person): olive green cold-weather parka with a fur-trimmed hood down, olive trousers, white mukluk-style boots, a knitted toque, a small Canadian flag patch on the shoulder, standing with both hands holding a rolled-up flag in front of him",
  "camera": "eye level, full body, three-quarter turn to the right, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "weapons",
    "text",
    "logos except the small flag patch",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**wk06_helicopter.png** (16:9)
```json
{
  "type": "single vehicle cut-out on a plain white background",
  "subject": "a 1980s twin-engine military utility helicopter in olive drab (generic Huey-style, not a specific real aircraft), skids, a small round red-and-white maple leaf roundel on the tail, no tail number, sitting landed with the main rotor blades still",
  "camera": "side view from slightly above, facing left, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "numbers",
    "weapons",
    "people",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**wk06b_helicopter_rotor.png** (16:9)
```json
{
  "type": "single part on a plain white background, for rigging",
  "subject": "only the main rotor of the same helicopter as wk06_helicopter: the hub and two long blades, seen from the side as a thin horizontal shape, nothing else",
  "camera": "same camera, angle, scale and lighting as wk06_helicopter, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "the body of the helicopter",
    "text",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**wk07_schnapps_bottle.png** (1:1)
```json
{
  "type": "single prop cut-out on a plain white background",
  "subject": "a tall dark green glass bottle of Danish schnapps (akvavit) with a cream paper label printed only with a simple drawn crown and the word 'AKVAVIT', a red wax-sealed cap, a little frost on the glass",
  "camera": "straight on, standing upright, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "real brand names",
    "logos",
    "hands",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**wk08_whisky_bottle.png** (1:1)
```json
{
  "type": "single prop cut-out on a plain white background",
  "subject": "a squat amber glass bottle of Canadian rye whisky with a cream label showing only a small red maple leaf and the words 'CANADIAN RYE', a dark red cap",
  "camera": "straight on, standing upright, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "real brand names",
    "Canadian Club",
    "logos",
    "hands",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**wk09_letter.png** (4:3)
```json
{
  "type": "single prop cut-out on a plain white background",
  "subject": "one slightly crumpled cream letter sheet with faint ruled lines, a few lines of blurry unreadable handwriting in blue ink, a small red official stamp in the top left corner",
  "camera": "flat, straight from above, tilted about 10 degrees, the whole subject fully in frame with empty space around it",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "readable words",
    "logos",
    "hands",
    "watermark"
  ],
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "aspect_ratio": "4:3",
  "output": "largest size available (4K if possible)"
}
```
