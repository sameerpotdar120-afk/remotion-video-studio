# Kolkata: Veo prompts

**Style (inside every prompt):** Unreal Engine 5 cinematic render, photoreal, Lumen global illumination, warm golden-hour grade, no text, no logos, no people looking at camera, no audio needed.
**Props and effects:** 16:9, 1080p or 4K, 4 to 8 seconds. **Full-screen shots:** 9:16, 1080p or 4K, 4 to 8 seconds. **Save as:** the file name above each prompt.

---

**v01_city_today.mp4** (9:16, full screen)
```json
{
  "shot": "full-screen cinematic establishing shot",
  "subject": "a busy street in north Kolkata, India, today: a row of yellow Hindustan Ambassador taxis, an old blue-and-white Kolkata tram on rails, old colonial buildings with green wooden shutters and balconies, hand-pulled rickshaw at the side, overhead tram wires",
  "action": "the tram rolls slowly toward the camera, taxis pass left to right, pigeons lift off a balcony, warm dust in the air",
  "camera": "low angle at street level, slow push in, 35mm lens, shallow depth of field, steady gimbal move",
  "lighting": "late golden hour, sun low behind the buildings, warm rim light on the taxis, soft haze",
  "style": "Unreal Engine 5 cinematic render, photoreal, Lumen global illumination, filmic colour grade with warm highlights and teal shadows",
  "framing": "vertical 9:16, the tram and the first taxi in the centre third",
  "aspect_ratio": "9:16",
  "duration_seconds": 6,
  "avoid": "text, signboards with readable words, logos, watermarks, people looking at the camera, modern glass towers, cartoon look"
}
```

**v02_sutanuti_market.mp4** (9:16, full screen)
```json
{
  "shot": "full-screen cinematic period scene, year 1690",
  "subject": "a riverside cotton-yarn market on the bank of the Hooghly river in Bengal: Bengali traders in plain white dhotis and shawls, large bales of raw cotton yarn wrapped in jute cloth and tied with rope, wooden country boats with curved hulls moored at a muddy ghat, thatched bamboo huts, palm and banyan trees",
  "action": "two porters carry a cotton bale on a bamboo pole past the camera, traders inspect yarn, boats rock gently on the water, smoke from a cooking fire drifts",
  "camera": "eye level, slow sideways dolly from left to right, 35mm lens, gentle parallax between foreground bales and the river behind",
  "lighting": "soft morning sun through river haze, warm and golden, light mist over the water",
  "style": "Unreal Engine 5 cinematic render, photoreal historical recreation, Lumen global illumination, rich textures of jute, cotton and wet mud, warm filmic grade",
  "framing": "vertical 9:16, a cotton bale large in the foreground, the river in the upper half",
  "aspect_ratio": "9:16",
  "duration_seconds": 6,
  "avoid": "anything modern, brick or concrete buildings, metal, plastic, European ships, text, logos, watermarks, people looking at the camera, cartoon look"
}
```

**v03_temple_bell.mp4** (16:9, prop on green)
```json
{
  "shot": "isolated prop for compositing",
  "subject": "a single old brass Bengali temple bell with a curved brass hanger, a fresh marigold garland of orange and yellow flowers wrapped around the hanger, patina and fine scratches on the brass",
  "action": "the bell swings slowly from side to side three times and settles, the clapper strikes once, petals tremble",
  "camera": "locked-off static camera, straight-on, three-quarter view slightly from below",
  "lighting": "warm key light from the upper left, soft golden rim light from behind, gentle highlights moving across the brass",
  "style": "Unreal Engine 5 cinematic render, photoreal, physically based brass and flower materials, Lumen global illumination",
  "background": "flat, evenly lit pure chroma-key green (#00FF00) filling the whole frame, no shadows on the background, no green reflections on the brass",
  "framing": "16:9, the whole bell and hanger fully in frame with wide empty green space on every side, the bell takes about 40% of the frame height",
  "aspect_ratio": "16:9",
  "duration_seconds": 6,
  "avoid": "cropping any part of the bell, floor, table, wall, hands, deity images, text, logos, watermarks, motion blur trails on the background"
}
```

**v04_incense_smoke.mp4** (16:9, effect on black)
```json
{
  "shot": "isolated visual effect for compositing",
  "subject": "thin wisps of white incense smoke",
  "action": "the smoke rises slowly from the bottom centre of the frame, curls and twists, spreads gently toward the top and fades out",
  "camera": "locked-off static camera, straight-on",
  "lighting": "soft warm side light from the left so the smoke glows faintly gold on one edge",
  "style": "photoreal volumetric smoke simulation, Unreal Engine 5 cinematic render",
  "background": "solid pure black (#000000) filling the whole frame, nothing else in the frame",
  "framing": "16:9, the smoke source just below the bottom edge, the smoke never touches the left or right edge",
  "aspect_ratio": "16:9",
  "duration_seconds": 8,
  "avoid": "incense stick, holder, hands, any object, coloured smoke, flames, text, logos, watermarks"
}
```

**v05_river_mist.mp4** (16:9, effect on black)
```json
{
  "shot": "isolated visual effect for compositing",
  "subject": "a low layer of soft white river mist",
  "action": "the mist drifts slowly from left to right in a thin band across the lower half of the frame, thickening and thinning in gentle waves",
  "camera": "locked-off static camera, straight-on",
  "lighting": "cool morning light from above with a faint warm glow on the top edge of the mist",
  "style": "photoreal volumetric fog simulation, Unreal Engine 5 cinematic render",
  "background": "solid pure black (#000000) filling the whole frame, nothing else in the frame",
  "framing": "16:9, the mist band across the middle and lower third, black above and below it",
  "aspect_ratio": "16:9",
  "duration_seconds": 8,
  "avoid": "water, ground, trees, horizon line, sky, coloured fog, text, logos, watermarks"
}
```

**v06_seal_stamp.mp4** (16:9, prop on green)
```json
{
  "shot": "isolated prop action for compositing, year 1698",
  "subject": "a hand in a dark blue 17th-century English coat sleeve with a white lace cuff pressing a heavy brass seal with a wooden handle into a pool of red sealing wax on a sheet of aged cream parchment with faint handwritten lines",
  "action": "the seal comes down, presses firmly into the soft red wax, holds for a beat, then lifts away and reveals a round crest impression in the wax; a thin wisp of wax smoke rises",
  "camera": "locked-off static camera, three-quarter view from about 30 degrees above",
  "lighting": "warm candle-like key light from the right, soft shadows, glossy highlights on the wax",
  "style": "Unreal Engine 5 cinematic render, photoreal, physically based wax, brass, cloth and paper materials, Lumen global illumination",
  "background": "flat, evenly lit pure chroma-key green (#00FF00) around the parchment, the parchment lies flat and fully in frame",
  "framing": "16:9, the whole parchment sheet and the seal fully in frame with empty green space on every side",
  "aspect_ratio": "16:9",
  "duration_seconds": 6,
  "avoid": "cropping the parchment or the hand, readable text, modern pens, table edges, logos, watermarks"
}
```

**v07_gobindapur_leaving.mp4** (9:16, full screen)
```json
{
  "shot": "full-screen cinematic period scene, Bengal in the 1750s",
  "subject": "Bengali village families of Gobindapur leaving their thatched mud-and-bamboo village beside the Hooghly with their belongings: a father carrying a bundle on his head, a mother holding a child's hand, an old grandmother with a brass water pot, a cow walking beside them; in the far distance, the earthen walls of a large star-shaped fort under construction",
  "action": "the families walk slowly away from the camera along a dusty path, dust rises behind their feet, the child looks back once toward the village",
  "camera": "low angle behind the family, slow push forward following them, 35mm lens",
  "lighting": "dusk, low orange sun ahead of them, long shadows toward the camera, warm dust in the air",
  "style": "Unreal Engine 5 cinematic render, photoreal historical recreation, dignified and quietly sad, warm filmic grade",
  "framing": "vertical 9:16, the family in the lower half, the distant fort and sky in the upper half",
  "aspect_ratio": "9:16",
  "duration_seconds": 6,
  "avoid": "violence, weapons pointed at people, anything modern, brick or concrete houses, text, logos, watermarks, faces looking at the camera, cartoon look"
}
```

**v08_dust_drift.mp4** (16:9, effect on black)
```json
{
  "shot": "isolated visual effect for compositing",
  "subject": "warm brown dust and fine smoke",
  "action": "a cloud of dust rolls in slowly from the left edge, swirls across the lower half of the frame and thins out toward the right",
  "camera": "locked-off static camera, straight-on",
  "lighting": "warm low sunlight from the right, so the dust glows amber on its lit side",
  "style": "photoreal volumetric dust simulation, Unreal Engine 5 cinematic render",
  "background": "solid pure black (#000000) filling the whole frame, nothing else in the frame",
  "framing": "16:9, the dust mostly in the lower two thirds",
  "aspect_ratio": "16:9",
  "duration_seconds": 8,
  "avoid": "ground, objects, people, flames, text, logos, watermarks"
}
```

**v09_cannon_smoke.mp4** (16:9, effect on black)
```json
{
  "shot": "isolated visual effect for compositing",
  "subject": "the blast of an 18th-century cannon: a bright orange muzzle flash and a thick burst of grey-white gunpowder smoke",
  "action": "the flash bursts from a point at the left edge, middle height, the smoke punches out to the right, billows and slowly expands and drifts upward, glowing embers fall",
  "camera": "locked-off static camera, side view",
  "lighting": "the flash lights the smoke from inside for a moment, then soft warm side light",
  "style": "photoreal volumetric smoke and fire simulation, Unreal Engine 5 cinematic render",
  "background": "solid pure black (#000000) filling the whole frame, no cannon, nothing else in the frame",
  "framing": "16:9, the smoke spreads over the left two thirds of the frame and never fills the whole frame",
  "aspect_ratio": "16:9",
  "duration_seconds": 6,
  "avoid": "cannon, people, ground, text, logos, watermarks"
}
```

**v10_city_of_palaces.mp4** (9:16, full screen)
```json
{
  "shot": "full-screen cinematic period scene, Calcutta around 1800, capital of British India",
  "subject": "a grand wide avenue in old Calcutta lined with white neoclassical colonial mansions with tall columns and green shutters, horse-drawn carriages, palanquins carried by bearers, people in period Indian and British dress, palm trees, the masts of sailing ships visible at the end of the avenue on the Hooghly",
  "action": "a horse carriage rolls toward the camera, a palanquin crosses in the background, flags move gently in the breeze",
  "camera": "slow rising crane shot from street level to rooftop height, 24mm lens",
  "lighting": "warm late afternoon sun, long shadows, soft haze over the river",
  "style": "Unreal Engine 5 cinematic render, photoreal historical recreation, Lumen global illumination, warm filmic grade",
  "framing": "vertical 9:16, the avenue leading the eye to the river and ship masts in the upper third",
  "aspect_ratio": "9:16",
  "duration_seconds": 6,
  "avoid": "anything modern, cars, electric poles, readable text, logos, watermarks, people looking at the camera, cartoon look"
}
```

**v11_old_book.mp4** (16:9, prop on green)
```json
{
  "shot": "isolated prop for compositing",
  "subject": "a thick old history book bound in worn brown leather with gold-tooled spine bands, aged cream pages with faint, unreadable printed lines",
  "action": "the closed book opens by itself, the cover swings open, the pages flutter and flip quickly, then settle open in the middle; a little dust lifts from the pages",
  "camera": "locked-off static camera, three-quarter view from about 30 degrees above",
  "lighting": "warm library light from the upper left, soft shadows, a gentle glow on the pages",
  "style": "Unreal Engine 5 cinematic render, photoreal, physically based leather and paper materials, Lumen global illumination",
  "background": "flat, evenly lit pure chroma-key green (#00FF00) filling the whole frame, the book floating with no table",
  "framing": "16:9, the whole book fully in frame, open and closed, with empty green space on every side",
  "aspect_ratio": "16:9",
  "duration_seconds": 6,
  "avoid": "readable text, titles, hands, table, cropping the book, logos, watermarks"
}
```

**v12_gavel.mp4** (16:9, prop on green)
```json
{
  "shot": "isolated prop action for compositing",
  "subject": "a polished dark mahogany judge's gavel with a brass band, and its round mahogany sound block",
  "action": "the gavel rises, strikes the sound block firmly twice, bounces slightly on the second strike and rests; a small puff of dust on impact",
  "camera": "locked-off static camera, three-quarter view from about 30 degrees above",
  "lighting": "warm courtroom key light from the upper right, soft shadows, sharp highlights on the wood varnish and the brass band",
  "style": "Unreal Engine 5 cinematic render, photoreal, physically based wood and brass materials, Lumen global illumination",
  "background": "flat, evenly lit pure chroma-key green (#00FF00) filling the whole frame, no table surface",
  "framing": "16:9, the gavel and the block fully in frame through the whole swing, with empty green space on every side",
  "aspect_ratio": "16:9",
  "duration_seconds": 5,
  "avoid": "hands, people, table, cropping the gavel at the top of its swing, text, logos, watermarks"
}
```
