# Super El Niño (Hindi): Asset Prompts and Asset Plan

Built on **your recorded voiceover** (`audio/voiceover.mp3`, 73.6 s) and its SRT. The quality target is the reference Short (`reference_breakdown.md`): one continuous camera over a real satellite world map, glowing warm/cold water masses, glossy 3D props, a new visual every 1–2 s. GPT makes the objects, scenes and textures; real data makes the maps and sea temperatures; Remotion does all motion, glow and text.

Everything below is new. Nothing is reused from earlier videos.

---

## 0. Beat map (your voiceover → what's on screen)

| Time | Voiceover | Visual | Assets |
|---|---|---|---|
| 0.0–2.9 | सोचो, पैसिफिक ओशन को ठंडा रखने वाला | Camera pulls back from the Peru coast. A giant AC sits on the coast blowing a frosty cyan plume west across the Pacific. | A1, A2, A4 |
| 2.9–5.0 | AC अचानक बंद हो गया है | The louver snaps shut, the LED flips red, a spark and a puff of smoke, and the cold plume drains away. Warm red water creeps in. | A1, A2, A3 |
| 5.2–9.7 | अगला साल… सबसे गर्म साल बन सकता है | Flash-forward: a burning Earth, embers and a big glowing "2027". | G3, G1 |
| 10.2–12.3 | नाम है सुपर एल नीनो | Real NOAA sea-temperature map wipes in. "Super El Niño" title slams in (red + blue glow). | (data) |
| 12.3–16.6 | इतिहास का सबसे खतरनाक… | NOAA time-lapse, June → October 2026: the hot tongue grows, the date ticks and a live temperature reading climbs from +1.3 to +3.3 °C. A red warning badge pulses. | G4 |
| 16.9–22.2 | ये AC हैं हवाएँ, ट्रेड विंड्स… पूरब से पश्चिम | The AC's cold air turns into white wind streaks. "Trade Winds" writes on along a curve, with big arrows pointing west and पूरब / पश्चिम labels. | (code) |
| 22.5–27.0 | गर्म पानी को इंडोनेशिया की तरफ… बारिश | The warm water flows west. Indonesia lights up, with rain clouds and lightning. | C1 |
| 27.2–31.0 | पेरू के तट पर पानी ठंडा, मौसम सूखा | Whip east to Peru: cold water offshore, a sun and a cracked-earth tile on the coast. | C2, C3 |
| 31.3–35.3 | हर दो से सात साल में… कमजोर | The wind streaks thin out and slow down. | (code) |
| 35.6–40.7 | गर्म पानी वापस पूरब… एक-दो डिग्री | The warm water sloshes back east. Thermometers pop up and count to +1.3 / +1.8 / +2.2. | C6 |
| 41.1–44.2 | बस दुनिया भर का मौसम बिगड़ जाता है | Whip into deep space: the calm Earth character turns into an overheated Earth with a shockwave. | D1, D2 |
| 44.4–46.8 | पेरू में बाढ़, ऑस्ट्रेलिया में सूखा | Map tour: a flooded house on the Peru coast, then sun and cracked earth on Australia. | C4, C2, C3 |
| 46.8–50.1 | भारत में हमारा मानसून कमजोर | Fly to India: dark monsoon clouds drift in, then thin out and the rain stops. | E2 |
| 50.3–53.2 | इस साल 13 प्रतिशत कम बारिश | A cinematic dry-field shot with a big "−13%" counter. | E1 |
| 53.6–61.1 | 1876… अकाल… 50 लाख | An old film strip rolls in on a 1870s engraving with "1876" burnt in. Back on India in sepia: red rings at the famine regions, withered-crop icons and a "50 लाख+" counter. | F1, C5 |
| 61.2–64.8 | अब समंदर 3 डिग्री से भी ज़्यादा गर्म | The eastern Pacific glows hot, and a big thermometer counts to the real NOAA reading (+3.3 °C). | C6 |
| 65.1–71.7 | पूरी धरती को तपाएगी… 2027 | Heat arrows shoot up out of the ocean. The world turns burnt orange, with embers, a sun flare and "2027". | G1, G2, G3 |
| 72.0–73.6 | क्या हम रेडी हैं? | The worried Earth character fans itself and looks straight at the viewer. | D3 |

---

## 1. Read this first

**1. GPT never draws a map, a coastline or a heat map.** The world map is NASA Blue Marble, and the sea temperatures are real NOAA data (already built).

**2. No text, numbers, letters or flags inside any GPT image.** "Super El Niño", "Trade Winds", "2027", "−13%", "1876", "50 लाख+", the degrees and all labels are drawn in Remotion.

**3. Clean assets from GPT; glow, colour and motion in Remotion.** Ask for clean subjects. Remotion adds the glows and tints, moves the louver, drops the rain and builds the cold air, so everything matches.

**4. One look: "Glossy 3D weather kit".** Every prop is a soft, glossy, slightly rounded 3D object (premium iOS/Apple-style 3D render), lit from the top-left, with no outlines. Fixed colours: warm water red-orange `#FF5A36`, cold water cyan `#3FE0FF`, sun gold `#FFC21F`, clouds cool grey. Make each set in the same chat so the props match.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat, then send the prompts one by one.
- Size: **1024×1536 (portrait)** for full-screen scenes, **1024×1024** for props.
- `PNG-T` = real transparent background. If ChatGPT returns a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000). These are light/smoke effects; Remotion turns the black into transparency, so it must be truly black with no texture.
- Make 2–3 versions of each and keep the best. Zoom to 100% and check edges.
- Name files exactly as listed and send them all together. They go in `public/elnino/img/`.
- **Same chat, one after the other:** the AC parts (A1–A2), the weather icons (C1–C6), the three Earths (D1–D3).

### Style Lock (paste once at the top of each ChatGPT chat)
```
You are generating production assets for a premium geography explainer video
(vertical 9:16, satellite world-map look, cinematic, like a high-end After
Effects + GeoLayers documentary). The story is about El Niño: ocean winds,
warm and cold sea water, rain, drought and heat. Props are glossy, soft,
slightly rounded 3D objects in one consistent premium style, with soft studio
light from the top-left, subtle reflections and smooth gradients. No outlines,
no flat clip-art, no cartoon line work unless I ask. No text, no letters, no
numbers, no flags, no logos, no brand names, no watermark, no signature, no
frame or border. When I say PNG-T, the background must be fully transparent
(real alpha channel). When I say BLACK, the background must be pure flat black
#000000. Keep the subject centered with generous empty padding so it can be
scaled and animated. Do not add glow, drop shadow or color grading unless I
ask; those are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. The Pacific's AC (two parts in the same chat, plus two effects)
Remotion stacks A2 on A1: the louver swings open while the AC runs and snaps shut when it "turns off". The LED light, the cold-air glow and the spark are added in code. Both images must be the **exact same view, size and position**.

#### A1 · `ac_body.png` (1024×1024, PNG-T)
```
A premium glossy 3D wall-mounted split air conditioner indoor unit, seen from
the front and slightly from below (about 15 degrees), perfectly level,
centered. Smooth white rounded body with soft reflections, a thin silver
accent line, and a small round status light on the right of the front panel
(light switched off, neutral grey). The long air outlet slot along the bottom
is OPEN and EMPTY: a dark recessed slot with no flap in it. No brand name, no
logo, no text, no display numbers. The unit fills the middle of the image
horizontally with padding on all sides. PNG-T, transparent background.
```

#### A2 · `ac_louver.png` (1024×1024, PNG-T)
```
Same chat, matching the previous air conditioner exactly. Only the long
curved white louver flap that sits in that unit's bottom air outlet slot,
nothing else: same size, same perspective, placed in exactly the position it
would occupy in the previous image (the canvas is the same, so the flap lines
up when layered on top). The flap is shown fully closed. Glossy white
plastic matching the body. PNG-T, transparent background.
```

#### A3 · `smoke_puff.png` (1024×1024, BLACK)
For "अचानक बंद": the AC sputters out.
```
A small soft puff of light grey smoke with a few tiny bright orange sparks
flying out of it, photographed against pure flat black #000000, realistic,
soft edges, centered with padding. BLACK background.
```

#### A4 · `overlay_frost_air.png` (1536×1024, BLACK)
The AC's cold breath. Remotion tints it cyan, stretches it across the ocean and turns it into the trade-wind streaks.
```
A realistic plume of cold, frosty white mist and vapour blowing from the
right edge toward the left, like cold air rushing out of an air conditioner
in slow motion: dense and bright on the right, spreading, swirling and fading
into thin wisps toward the left. Fine ice crystals sparkle in it. Photographed
against pure flat black #000000. BLACK background.
```

### C. Weather icon set (six icons, same chat, one family)

#### C1 · `icon_raincloud.png` (1024×1024, PNG-T)
Remotion adds the rain and the lightning flicker.
```
A glossy 3D storm cloud icon: a fluffy, rounded, dark-to-mid grey rain cloud
with soft highlights on top and a darker flat underside, slightly wider than
tall. No rain drops, no lightning, no sun. PNG-T, transparent background.
```

#### C2 · `icon_sun.png` (1024×1024, PNG-T)
```
A glossy 3D sun icon in the same style: a smooth golden-yellow (#FFC21F)
sphere with a soft orange edge and a ring of short, rounded, puffy triangular
rays. No face. PNG-T, transparent background.
```

#### C3 · `tile_cracked_earth.png` (1024×1024, PNG-T)
```
A small square tile of dry, cracked, sun-baked brown earth shown as a 3D
isometric block, like a premium game asset: deep cracks across the top
surface, a few dry pebbles, the sides showing layered soil. Same glossy
render style as the previous icons. PNG-T, transparent background.
```

#### C4 · `icon_flood_house.png` (1024×1024, PNG-T)
```
A glossy 3D icon in the same style: a small simple house with a red-orange
roof sunk halfway into rising blue flood water, gentle waves around the
walls. PNG-T, transparent background.
```

#### C5 · `icon_dry_crop.png` (1024×1024, PNG-T)
For the 1876 famine regions.
```
A glossy 3D icon in the same style: a small bundle of withered, drooping
wheat or rice stalks, faded straw-brown and dry, growing from a little patch
of cracked soil. PNG-T, transparent background.
```

#### C6 · `thermometer.png` (1024×1024, PNG-T)
Remotion fills the tube and shifts it from blue to red as the number rises, so keep it empty.
```
A glossy 3D glass thermometer icon in the same style, standing upright: a
clear glass tube with a few small white tick marks (no numbers) and a round
bulb at the bottom. The tube and bulb are EMPTY clear glass, with no liquid
inside. Silver cap on top. PNG-T, transparent background.
```

### D. Earth character (three states, same chat; our own design, not an emoji)

#### D1 · `earth_calm.png` (1024×1024, PNG-T)
```
A cute glossy 3D cartoon planet Earth character: a round globe with blue
oceans and green continents (the Pacific facing us), with a calm, content
face: eyes peacefully half closed and a small relaxed smile. Premium 3D
character render, soft studio light. No text. PNG-T, transparent background.
```

#### D2 · `earth_overheat.png` (1024×1024, PNG-T)
For "बस दुनिया भर का मौसम बिगड़ जाता है".
```
The exact same Earth character as the previous image, same angle, same size,
same lighting, but now overheated and shocked: eyes wide open, mouth open in
an "O", big sweat drops flying off, the globe flushed red-orange as if
burning up, and two little puffs of steam rising from the top. No text.
PNG-T, transparent background.
```

#### D3 · `earth_worried.png` (1024×1024, PNG-T)
The last shot, "क्या हम रेडी हैं?". It looks straight into the camera.
```
The exact same Earth character again, same style and lighting, now hot and
worried: flushed orange, sweating, eyebrows raised, looking straight at the
viewer with a nervous, uneasy half-smile, fanning itself with a small paper
hand fan held in one little cartoon hand. No text. PNG-T, transparent
background.
```

### E. India

#### E1 · `scene_dry_field.png` (1024×1536)
Behind the "−13%" counter.
```
Cinematic photograph, low angle: a vast Indian farm field of dry, cracked
brown earth stretching to the horizon, rows of small wilted crop seedlings,
under a hazy pale-blue sky with only a few thin white clouds. In the
mid-distance, an Indian farmer seen from behind, in a white kurta and a
turban, standing still and looking up at the sky. Harsh late-afternoon sun,
heat haze, warm tones. Portrait 9:16 composition, horizon in the upper third,
open sky in the upper middle (a big number goes there). Realistic, dignified,
documentary style. No text.
```

#### E2 · `cloud_monsoon_dark.png` (1536×1024, PNG-T)
Several copies float over India and then thin out as the monsoon fails.
```
A large, heavy, realistic monsoon rain cloud seen from slightly above and to
the side, dark blue-grey, wide and flat-bottomed with towering soft tops,
photographic, not cartoon. Wide horizontal shape. PNG-T, transparent
background.
```

### F. The 1876 insert

#### F1 · `scene_1876_drought.png` (1024×1536)
Shown inside an old film strip with flicker, grain and a sepia/purple tint.
```
A 19th-century engraving / etching illustration, like a page from an 1870s
illustrated newspaper: a drought-struck village on the Deccan plateau in
India, a completely dried-up riverbed with cracked mud, a dead leafless tree,
an empty bullock cart, mud houses with thatched roofs in the distance, a
harsh white sun. No people. Fine black ink cross-hatching on aged
cream-coloured paper. Portrait 9:16 composition. No text, no captions, no
signature.
```

### G. Heat (hook flash-forward and finale)

#### G1 · `overlay_embers.png` (1024×1536, BLACK)
```
Glowing orange and yellow embers and tiny sparks floating upward, a few soft
out-of-focus bokeh embers in the foreground, scattered across the whole
frame, photographed against pure flat black #000000. Realistic, cinematic.
BLACK background.
```

#### G2 · `overlay_sun_flare.png` (1536×1024, BLACK)
```
A realistic warm cinematic lens flare: a bright white-gold sun core with a
soft orange halo, a gentle anamorphic horizontal streak and a few faint
hexagonal ghosts, against pure flat black #000000. BLACK background.
```

#### G3 · `scene_earth_burning.png` (1024×1536)
The hook's flash-forward to "the hottest year", reused for one beat in the finale. Remotion adds "2027", the embers and a slow push-in.
```
Cinematic photoreal image of planet Earth seen from space, filling the lower
two-thirds of a portrait frame, the Pacific Ocean facing us. The whole planet
is overheating: continents scorched orange-brown, oceans tinted hot
red-orange near the equator, a thick glowing orange haze in the atmosphere,
heat shimmer, and the Sun blazing just above the top edge of the frame.
Black starry space around it. Dramatic, high-end documentary look. Portrait
9:16 composition, empty dark space in the upper third. No text.
```

#### G4 · `icon_warning.png` (1024×1024, PNG-T), optional
For "इतिहास का सबसे खतरनाक", pulsing next to the live reading.
```
A glossy 3D warning badge in the same premium icon style: a rounded red
(#FF2B3D) triangle with a bold white exclamation mark, slightly bevelled,
soft reflections. Nothing else. PNG-T, transparent background.
```

---

## 3. Drawn in code (no GPT needed)

AC status light (green → red), louver motion, the cold-air glow · warm/cold water glows · wind streaks and the two big curved arrows · "Trade Winds" curved text · "Super El Niño" / "2027" titles · country highlights and Hindi labels · rain and lightning · thermometer liquid and numbers · NOAA time-lapse with date and live reading · "−13%" and "50 लाख+" counters · film strip, grain and flicker · heat arrows · whip-blur, flash and shake transitions · starfield · burnt-orange world grade · Hindi subtitles · the moving @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `ac_body.png` | 1024² PNG-T | yes |
| A2 | `ac_louver.png` | 1024² PNG-T | yes |
| A3 | `smoke_puff.png` | 1024² BLACK | yes |
| A4 | `overlay_frost_air.png` | 1536×1024 BLACK | yes |
| C1 | `icon_raincloud.png` | 1024² PNG-T | yes |
| C2 | `icon_sun.png` | 1024² PNG-T | yes |
| C3 | `tile_cracked_earth.png` | 1024² PNG-T | yes |
| C4 | `icon_flood_house.png` | 1024² PNG-T | yes |
| C5 | `icon_dry_crop.png` | 1024² PNG-T | yes |
| C6 | `thermometer.png` | 1024² PNG-T | yes |
| D1 | `earth_calm.png` | 1024² PNG-T | yes |
| D2 | `earth_overheat.png` | 1024² PNG-T | yes |
| D3 | `earth_worried.png` | 1024² PNG-T | yes |
| E1 | `scene_dry_field.png` | 1024×1536 | yes |
| E2 | `cloud_monsoon_dark.png` | 1536×1024 PNG-T | yes |
| F1 | `scene_1876_drought.png` | 1024×1536 | yes |
| G1 | `overlay_embers.png` | 1024×1536 BLACK | yes |
| G2 | `overlay_sun_flare.png` | 1536×1024 BLACK | yes |
| G3 | `scene_earth_burning.png` | 1024×1536 | yes |
| G4 | `icon_warning.png` | 1024² PNG-T | optional |

19 required and 1 optional. The voiceover and SRT are already in.
