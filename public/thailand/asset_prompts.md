# Thailand: image prompts

**Style (inside every prompt):** Unreal Engine 5 cinematic render with a light stylised cartoon touch, matching the reference's cartoon cutaways. All characters (the country characters, both diplomats, the King and the soldiers) and every moving prop are built in Remotion (see `motion_assets.md`), so you only need the three backgrounds. **t04 is optional:** the gunboat is now drawn in code as well (t10); make t04 only if you want a richer close-up of the ship.

Re-checked against the final script (18 Oct): t01 for lines 8–14, t02 for line 4, t03 for line 18.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**t01_palace_room_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon skit",
  "subject": "an elegant late-1800s European diplomatic room: cream panelled walls with gold trim, a polished wooden floor, two tall curtained windows at the sides, and one large EMPTY ornate gold picture frame hanging in the centre of the wall (the inside of the frame is plain flat grey, nothing painted in it)",
  "camera": "straight-on, eye level, the frame centred in the upper half; the lower 45% is open floor where two characters will stand side by side",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and cheerful like a premium animated film, not gritty), Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "warm afternoon light from the windows, soft bounce",
  "framing": "full frame, no people, no furniture in the centre of the floor",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": [
    "text",
    "logos",
    "flags",
    "maps inside the frame",
    "people",
    "watermark"
  ]
}
```

---

**t02_battlefield_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon battle",
  "subject": "an open dusty plain in 1880s Burma: dry grass and sandy ground in the foreground, a few palm trees and a golden pagoda far in the distance, blue-grey hills on the horizon, a hazy warm sky",
  "camera": "eye level, a wide view, the lower third is open ground where two small lines of soldiers will stand, facing each other",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and cheerful like a premium animated film, not gritty), Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "warm hazy daylight",
  "framing": "full frame, no soldiers, no people",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": [
    "text",
    "logos",
    "flags",
    "people",
    "weapons",
    "blood",
    "watermark"
  ]
}
```

---

**t03_throne_room_bg.png** (9:16)
```json
{
  "type": "full-frame background scene",
  "subject": "a grand Thai royal hall in Bangkok, late 1800s: tall red and gold pillars, intricate gilded Thai patterns on the walls, a polished floor, a raised golden throne platform in the background (empty)",
  "camera": "straight-on, eye level, the throne platform small in the far background, the centre of the floor open where one standing character will fill most of the frame height",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and cheerful like a premium animated film, not gritty), Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "warm golden interior light with soft glow on the gilding",
  "framing": "full frame, no people",
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)",
  "avoid": [
    "text",
    "logos",
    "people",
    "watermark"
  ]
}
```

---

**t04_french_gunboat.png** (16:9, optional)
```json
{
  "type": "single prop cut-out for animation",
  "subject": "a small 1890s French naval gunboat: dark hull with a white upper deck, one tall black funnel, two short masts, a small deck gun at the bow, a French tricolour flag at the stern",
  "view": "exact side view, the bow pointing right",
  "style": "Unreal Engine 5 cinematic render with a light stylised cartoon touch (clean, soft and cheerful like a premium animated film, not gritty), Lumen global illumination, physically based materials, soft ray-traced shadows",
  "lighting": "soft daylight from the upper left",
  "background": "plain pure white background, no water, no ground shadow",
  "framing": "the whole ship fully in frame, centred, with empty white space around",
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)",
  "avoid": [
    "text",
    "numbers",
    "logos",
    "water",
    "smoke",
    "watermark",
    "cropped edges"
  ]
}
```
