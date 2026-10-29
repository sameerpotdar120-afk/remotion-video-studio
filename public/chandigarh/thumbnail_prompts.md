# Chandigarh: thumbnail prompts

The idea: the city seen from above at golden hour, with its sector grid shaped like a giant human body lying on the land. The brain glows at the top near the Shivalik hills (the Capitol), the heart glows red in the chest (Sector 17), and green lungs and red veins (the roads) show through. One look says "a city built like a body".

Pick one:

- **A. GPT makes the whole thumbnail**, title included. Fastest, but GPT sometimes misspells Hindi, so check the letters before you upload.
- **B. GPT makes the picture only, and I add the title in code.** The Hindi comes out exact, in the channel's font and style, and I can add a small India map with a pin. Send me the image and I'll build it.

Both give a 9:16 image. Keep the important part inside the middle (YouTube crops the sides and the top and bottom on some screens).

---

## A. Full thumbnail (with title)

```json
{
  "type": "YouTube Shorts thumbnail, tall 9:16, finished design with title text",
  "subject": "a breathtaking aerial view, straight down from very high, of a planned Indian city at golden hour whose rectangular sector grid of tree-lined blocks forms the shape of a giant human body lying on the land, head at the top near green foothills; inside the head a softly glowing pink brain made of the city's government buildings, in the chest a bright glowing red heart at the central plaza, two green leafy lungs made of parks either side of it, and glowing red-orange roads running through the body like veins and arteries; warm light rays, a little haze over the hills",
  "text": [
    "top of the frame, very large, bold Hindi Devanagari letters in bright yellow with a thick black outline and soft shadow: \"ज़िंदा शरीर जैसा शहर\"",
    "directly under it, large white serif capitals with a thick black outline: \"CHANDIGARH\""
  ],
  "camera": "top-down satellite-style view, the whole body shape in frame from head to feet, centred, filling the middle of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, rich warm colour grade, high contrast, crisp detail, clean and readable at small size",
  "lighting": "low golden-hour sun from the upper left, the heart and brain glowing from inside",
  "composition": "title in the top 25% over a slightly darker sky-and-hills area so the text reads; the body below it; nothing important in the outer edges",
  "avoid": [
    "maps of real countries",
    "logos",
    "watermarks",
    "any other text",
    "misspelled letters",
    "real brand names",
    "gore or realistic organs outside the city"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

## B. Picture only (I add the title)

Save it as **cg27_thumbnail_art.jpg** and send it to me.

```json
{
  "type": "full-frame scene, tall 9:16, no text",
  "subject": "a breathtaking aerial view, straight down from very high, of a planned Indian city at golden hour whose rectangular sector grid of tree-lined blocks forms the shape of a giant human body lying on the land, head at the top near green foothills; inside the head a softly glowing pink brain made of the city's government buildings, in the chest a bright glowing red heart at the central plaza, two green leafy lungs made of parks either side of it, and glowing red-orange roads running through the body like veins and arteries; warm light rays, a little haze over the hills",
  "camera": "top-down satellite-style view, the whole body shape in frame from head to feet, centred, filling the lower 75% of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, rich warm colour grade, high contrast, crisp detail",
  "lighting": "low golden-hour sun from the upper left, the heart and brain glowing from inside",
  "composition": "leave the top 25% calm (darker hills and sky haze, no busy detail) for a title to go on later; nothing important in the outer edges",
  "background": "none, the scene fills the whole frame",
  "avoid": [
    "text",
    "letters",
    "numbers",
    "logos",
    "watermarks",
    "maps of real countries",
    "gore or realistic organs outside the city"
  ],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

What I add on top: "ज़िंदा शरीर जैसा शहर" in yellow and "CHANDIGARH" in white (the channel's font, thick outline), a small India map (official boundary) in a corner with a pin on Chandigarh, and a light vignette so the title pops.
