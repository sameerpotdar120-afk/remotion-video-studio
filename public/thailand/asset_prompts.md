# Thailand: image prompts

**Style (inside every prompt):** Unreal Engine 5 cinematic render with a light stylised cartoon touch, matching the reference's cartoon cutaways. All characters (the country characters, both diplomats, the King and the soldiers) are built in Remotion, so these are only backgrounds and one prop.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. **Save as:** the file name above each prompt.

---

**t01_palace_room_bg.png** (9:16)
```json
{
  "type": "full-frame background scene for a cartoon skit",
  "subject": "an elegant late-1800s European diplomatic room: cream panelled walls with gold trim, a polished wooden floor, two tall curtained windows at the sides, and one large EMPTY ornate gold picture frame hanging in the centre of the wall (the inside of the frame is plain flat grey, nothing painted in it)",
  "camera": "straight-on, eye level, the frame centred in the upper half; the lower third is open floor where two small characters will stand",
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
  "camera": "eye level, a wide view, the lower half is open ground where small soldiers will stand",
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
  "camera": "straight-on, eye level, the lower half open floor where a small character will stand",
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

**t04_french_gunboat.png** (16:9)
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
