# UK weather: image prompts

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows. Only three props are needed: the satellite maps (EOX), every weather effect, the tourist, his umbrella, the arrows, tags and titles are made in code.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**uk01_calendar_pad.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a small desk tear-off calendar pad: a thick block of crisp white pages with a bright red header band across the top, two silver metal binding rings at the top, the top page blank except a faint grid of small day squares, a soft paper edge texture on the side of the block",
  "camera": "straight on, slightly from above, tilted about 6 degrees, the whole pad fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "numbers",
    "logos",
    "hands",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**uk01b_calendar_page.png** (1:1)
```json
{
  "type": "single part on a plain white background, for rigging",
  "subject": "one single loose page torn from the same tear-off calendar as uk01_calendar_pad: thin white paper with the red header band and the faint grid of small day squares, two small punched holes at the top, the bottom edge curling up slightly as if being flipped",
  "camera": "same camera, angle, scale and lighting as uk01_calendar_pad, the whole page fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "soft studio light from the upper left",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "numbers",
    "logos",
    "hands",
    "the rest of the pad",
    "watermark"
  ],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**uk02_airplane.png** (16:9)
```json
{
  "type": "single vehicle on a plain white background, for cutting out",
  "subject": "a modern white twin-engine passenger jet (generic, not a real airline, no livery, no logos), seen from directly above, wings spread, a soft blue stripe along the fuselage",
  "camera": "straight top-down view, nose pointing to the right, the whole aircraft fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "bright soft daylight from above",
  "background": "plain pure white, no floor, no shadow",
  "avoid": [
    "text",
    "airline names",
    "logos",
    "flags",
    "registration numbers",
    "watermark"
  ],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```
