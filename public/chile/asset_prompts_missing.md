# Chile: missing image prompts (c07, c08)

**Style (inside every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, ray-traced soft shadows. Characters: Unreal Engine 5 cinematic render of a stylised 3D animated character (chunky, friendly proportions like a premium animated film), realistic materials (worn steel, wool, leather, cloth weave), Lumen global illumination, ray-traced soft shadows. Props on a plain white background; backgrounds full frame.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**c07_mapuche_group.png** (16:9)
```json
{
  "type": "single prop cut-out for animation",
  "subject": "a group of five Mapuche people (Indigenous people of Chile) standing together, arms folded, calm and unimpressed",
  "view": "full bodies, three-quarter view facing right",
  "details": "first look up free reference photos of traditional Mapuche dress (Wikimedia Commons, public domain, museum or official cultural photos) and base the clothing on them: woven ponchos with geometric patterns, trarilonko headbands, women with traditional silver jewellery (trapelakucha); dignified, confident and respectful, never a caricature",
  "style": "Unreal Engine 5 cinematic render of a stylised 3D animated character (chunky, friendly proportions like a premium animated film), realistic materials (worn steel, wool, leather, cloth weave), Lumen global illumination, ray-traced soft shadows",
  "lighting": "soft warm key light from the upper left with a cool rim light",
  "background": "plain pure white background, no floor, no ground shadow",
  "framing": "the whole subject fully in frame, centred, with empty white space around it",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "letters", "numbers", "logos", "flags", "watermark", "clay", "glossy toy look", "cropped edges"]
}
```

---

**c08_village_bg.png** (9:16)
```json
{
  "type": "full-screen background still",
  "subject": "a Mapuche village of the 1500s near the coast of southern Chile",
  "details": "several ruka houses with thatched roofs, araucaria (monkey-puzzle) trees, smoke from a cooking fire, fields and forest, the sea in the distance, the lower middle left open for characters",
  "camera": "eye-level wide shot, a 35 mm lens, the same late-morning light as the beach",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, ray-traced soft shadows, real-world scale and detail, cinematic colour grade",
  "lighting": "bright late-morning sun, soft clouds",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": ["text", "letters", "logos", "flags", "watermark", "people", "cartoon"]
}
```
