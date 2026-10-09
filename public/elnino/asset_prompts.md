# El Niño (Hindi): Asset Prompts and Asset Plan

Target: a ~75–78-second 9:16 Short (1080×1920, 30 fps) for NullDynasty, rebuilt in the style of the reference (see `reference_breakdown.md`): one continuous camera over a real satellite world map, glowing warm/cold water masses, glossy 3D weather icons, a new visual every 1–2 s. GPT makes the objects, scenes and textures; real data makes the maps and the sea temperatures; Remotion does all motion, glow and text.

Script: `public/elnino/script_hindi.txt` (11 lines). Everything below is new. Nothing is reused from earlier videos.

---

## 0. Read this first

**1. GPT never draws a map, a coastline or a heat map.** The world map is NASA Blue Marble, and the sea-temperature colours come from real NOAA data (section 1).

**2. No text, numbers, letters or flags inside any GPT image.** "El Niño", "Super", "Trade Winds", "13%", "1876", "50 लाख+", "2027", the degree numbers on the thermometers and all labels are drawn in Remotion.

**3. Clean assets from GPT; glow, colour and motion in Remotion.** Ask for clean subjects. Remotion adds the red/cyan glows and the tints, spins the fan blades and drops the rain, so everything matches.

**4. One look for the whole video: "Glossy 3D weather kit".** Every icon is a soft, glossy, slightly rounded 3D object (like premium iOS/Apple-style 3D icons), lit from the top-left, with no outlines. The colours are fixed: warm water red-orange `#FF5A36`, cold water cyan `#3FE0FF`, sun gold `#FFC21F`, cloud cool grey. All icons must look like they belong to one set, so make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat, then send the prompts one by one.
- Size: **1024×1536 (portrait)** for full-screen scenes, **1024×1024** for icons and objects.
- `PNG-T` = real transparent background. If ChatGPT returns a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000). These are light effects; Remotion turns the black into transparency, so the black must be truly black with no texture.
- Make 2–3 versions of each and keep the best. Zoom to 100% and check edges.
- Name files exactly as listed and send them all together. They go in `public/elnino/img/`.
- **Matching sets must be made in the same chat, one after the other:** the fan parts (A1–A3), the ships (B1–B2), the weather icons (C1–C6), the two Earths (D1–D2).

### Style Lock (paste once at the top of each ChatGPT chat)
```
You are generating production assets for a premium geography explainer video
(vertical 9:16, satellite world-map look, cinematic, like a high-end After
Effects + GeoLayers documentary). The story is about El Niño: ocean winds,
warm and cold sea water, rain, drought and heat. Icons and objects are glossy,
soft, slightly rounded 3D objects in one consistent premium style, with soft
studio light from the top-left, subtle reflections and smooth gradients. No
outlines, no flat clip-art, no cartoon line work unless I ask. No text, no
letters, no numbers, no flags, no logos, no watermark, no signature, no frame
or border. When I say PNG-T, the background must be fully transparent (real
alpha channel). When I say BLACK, the background must be pure flat black
#000000. Keep the subject centered with generous empty padding so it can be
scaled and animated. Do not add glow, drop shadow or color grading unless I
ask; those are added later in the video editor.
```

---

## 1. Maps and data (real, NOT GPT; I prepare these)

| What | Source |
|---|---|
| World map for the whole video (Pacific-centred strip from India to South America) | NASA Blue Marble Next Generation, July, topography + bathymetry (public domain) |
| Sea-temperature anomaly maps (the "heat map" shots and the June → October 2026 time-lapse) | NOAA OISST v2.1 daily anomalies (public domain), coloured in our own heat palette |
| Country shapes for highlights (Peru, Ecuador, Indonesia, Australia, India, southern US) | Natural Earth 1:10m (public domain), India with its official boundary |
| Wind streaks, curved arrows, lasso ellipse, warm/cold water glows, heat arrows, thermometer numbers, counters, film strip, all text | Drawn by Remotion |

---

## 2. GPT asset prompts

### A. The giant fan (three parts in the same chat, so the blades can really spin)
Remotion stacks them: body at the back, blades in the middle (spinning, then slowing to a stop), grill on top. All three must be the **exact same straight-on front view, same size, same centre**.

#### A1 · `fan_body.png` (1024×1024, PNG-T)
```
A premium glossy 3D desk fan seen perfectly straight from the front, eye
level, perfectly symmetrical. Show ONLY the body: a rounded white base, a
short white stand and the round white motor housing at the centre of an
empty circular frame ring. There are NO blades and NO front wire grill: the
inside of the ring is completely empty and transparent. Soft white and pale
grey plastic with a light blue accent stripe on the base. The circular ring
fills the upper two-thirds of the image. PNG-T, transparent background.
```

#### A2 · `fan_blades.png` (1024×1024, PNG-T)
```
Same chat, matching the previous fan exactly. Only the fan blades of that
same fan, seen perfectly straight from the front: three wide, smooth,
slightly translucent pale-blue plastic blades around a small white round hub,
the hub exactly in the centre of the image. Blades evenly spaced at 120
degrees, no motion blur. Sized so the blade tips would sit just inside the
previous fan's ring when centred at the same point. Nothing else. PNG-T,
transparent background.
```

#### A3 · `fan_grill.png` (1024×1024, PNG-T)
```
Same chat, matching the previous fan exactly. Only the round front wire
guard (grill) of that same fan, seen perfectly straight from the front:
thin glossy white wires radiating from a small round white centre badge with
no logo, plus two concentric wire rings, exactly the size of the previous
fan's ring and centred at the same point. Everything between the wires is
fully transparent. PNG-T, transparent background.
```

#### A4 · `smoke_puff.png` (1024×1024, BLACK)
For the moment the fan "stops": a little puff and a spark as it breaks down.
```
A small soft puff of light grey smoke with a few tiny bright orange sparks
flying out of it, photographed against pure flat black #000000, realistic,
soft edges, centered with padding. BLACK background.
```

### B. Sailing ships (same chat)
Remotion moves them west along the wind lines, with a small bob and a white wake.

#### B1 · `ship_galleon_a.png` (1024×1024, PNG-T)
```
A detailed miniature 3D model of an old wooden sailing galleon (16th–17th
century style), three masts with full billowing cream-white sails filled by
wind, warm brown wooden hull, seen from a high three-quarter angle from the
front-left, sailing toward the left of the image. Glossy, premium, slightly
stylized like a high-end 3D render. No flags, no emblems on the sails, no
water. PNG-T, transparent background.
```

#### B2 · `ship_galleon_b.png` (1024×1024, PNG-T)
```
Same galleon style and render as the previous image, but a smaller
two-masted ship, also sailing toward the left, seen from a slightly different
high three-quarter angle. Full cream-white sails, no flags, no emblems, no
water. PNG-T, transparent background.
```

### C. Weather icon set (six icons, same chat, one family)

#### C1 · `icon_raincloud.png` (1024×1024, PNG-T)
Remotion adds the falling rain and a lightning flicker.
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
isometric block, like a game asset: deep cracks across the top surface, a
few dry pebbles, the sides showing layered soil. Same glossy premium render
style as the previous icons. PNG-T, transparent background.
```

#### C4 · `icon_flood_house.png` (1024×1024, PNG-T)
```
A glossy 3D icon in the same style: a small simple house with a red-orange
roof sunk halfway into rising blue flood water, gentle waves around the
walls. PNG-T, transparent background.
```

#### C5 · `icon_dry_crop.png` (1024×1024, PNG-T)
For the 1876 famine and the 2026 monsoon beat.
```
A glossy 3D icon in the same style: a small bundle of withered, drooping
wheat or rice stalks, faded straw-brown and dry, growing from a little patch
of cracked soil. PNG-T, transparent background.
```

#### C6 · `thermometer.png` (1024×1024, PNG-T)
Remotion fills the tube and changes the colour from blue to red as the number rises, so keep the tube empty.
```
A glossy 3D glass thermometer icon in the same style, standing upright: a
clear glass tube with a few small white tick marks (no numbers) and a round
bulb at the bottom. The tube and bulb are EMPTY, clear glass, with no liquid
inside. Silver cap on top. PNG-T, transparent background.
```

### D. Earth character (two states, same chat; our own design, not an emoji)
For "बस, दुनिया भर का मौसम बिगड़ जाता है": calm Earth → overheated, shocked Earth.

#### D1 · `earth_calm.png` (1024×1024, PNG-T)
```
A cute glossy 3D cartoon planet Earth character: a round globe with blue
oceans and green continents (the Pacific facing us), with a calm, content
face: eyes peacefully half closed and a small relaxed smile. Premium 3D
character render, soft studio light. No text. PNG-T, transparent background.
```

#### D2 · `earth_overheat.png` (1024×1024, PNG-T)
```
The exact same Earth character as the previous image, same angle, same size,
same lighting, but now overheated and shocked: eyes wide open, mouth open in
an "O", big sweat drops flying off, the globe flushed red-orange as if
burning up, and two little puffs of steam rising from the top. No text.
PNG-T, transparent background.
```

### E. India, our extra beat ("और भारत?")

#### E1 · `scene_dry_field.png` (1024×1536)
```
Cinematic photograph, low angle: a vast Indian farm field of dry, cracked
brown earth stretching to the horizon, rows of small wilted crop seedlings,
under a hazy pale-blue sky with only a few thin, useless white clouds. In
the mid-distance, an Indian farmer seen from behind, in a white kurta and
a turban, standing still and looking up at the sky. Harsh late-afternoon
sun, heat haze, warm tones. Portrait 9:16 composition, horizon in the upper
third. Realistic, dignified, documentary style. No text.
```

#### E2 · `cloud_monsoon_dark.png` (1536×1024, PNG-T)
Remotion floats several copies over India, then thins them out as the monsoon fails.
```
A large, heavy, realistic monsoon rain cloud seen from slightly above and to
the side, dark blue-grey, wide and flat-bottomed with towering soft tops,
photographic, not cartoon. Wide horizontal shape. PNG-T, transparent
background.
```

### F. The 1876 insert

#### F1 · `scene_1876_drought.png` (1024×1536)
Remotion shows it inside an old film strip with flicker, grain and a sepia/purple tint.
```
A 19th-century engraving / etching illustration, like a page from an 1870s
illustrated newspaper: a drought-struck village on the Deccan plateau in
India, a completely dried-up riverbed with cracked mud, a dead leafless tree,
an empty bullock cart, mud houses with thatched roofs in the distance, a
harsh white sun. No people. Fine black ink cross-hatching on aged
cream-coloured paper. Portrait 9:16 composition. No text, no captions, no
signature.
```

### G. The heat finale

#### G1 · `overlay_embers.png` (1024×1536, BLACK)
Floating over the burnt-orange world for "2027". Remotion turns black into transparency and drifts it upward.
```
Glowing orange and yellow embers and tiny sparks floating upward, a few soft
out-of-focus bokeh embers in the foreground, scattered across the whole
frame, photographed against pure flat black #000000. Realistic, cinematic.
BLACK background.
```

#### G2 · `overlay_sun_flare.png` (1536×1024, BLACK)
The sun flare from the top of the frame at the end.
```
A realistic warm cinematic lens flare: a bright white-gold sun core with a
soft orange halo, gentle anamorphic horizontal streak and a few faint
hexagonal ghosts, against pure flat black #000000. BLACK background.
```

---

## 3. Drawn in code (no GPT needed)

Warm/cold water glows (red-orange and cyan) · white wind streaks and the two big curved arrows · lasso ellipse · curved "Trade Winds" text · "El Niño" / "Super" titles with glow · country highlights and labels · rain, lightning flicker and the fan's cool airflow · thermometer liquid and numbers · heat arrows rising from the ocean · the June → October 2026 sea-temperature time-lapse · "13%" and "50 लाख+" counters · old film strip, grain and flicker · whip-blur and flash transitions · starfield behind the Earth character · burnt-orange world grade · Hindi subtitles · the moving @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `fan_body.png` | 1024² PNG-T | yes |
| A2 | `fan_blades.png` | 1024² PNG-T | yes |
| A3 | `fan_grill.png` | 1024² PNG-T | yes |
| A4 | `smoke_puff.png` | 1024² BLACK | yes |
| B1 | `ship_galleon_a.png` | 1024² PNG-T | yes |
| B2 | `ship_galleon_b.png` | 1024² PNG-T | yes |
| C1 | `icon_raincloud.png` | 1024² PNG-T | yes |
| C2 | `icon_sun.png` | 1024² PNG-T | yes |
| C3 | `tile_cracked_earth.png` | 1024² PNG-T | yes |
| C4 | `icon_flood_house.png` | 1024² PNG-T | yes |
| C5 | `icon_dry_crop.png` | 1024² PNG-T | yes |
| C6 | `thermometer.png` | 1024² PNG-T | yes |
| D1 | `earth_calm.png` | 1024² PNG-T | yes |
| D2 | `earth_overheat.png` | 1024² PNG-T | yes |
| E1 | `scene_dry_field.png` | 1024×1536 | yes |
| E2 | `cloud_monsoon_dark.png` | 1536×1024 PNG-T | yes |
| F1 | `scene_1876_drought.png` | 1024×1536 | yes |
| G1 | `overlay_embers.png` | 1024×1536 BLACK | yes |
| G2 | `overlay_sun_flare.png` | 1536×1024 BLACK | optional |

18 required and 1 optional. Send them together with your voiceover (MP3) and the SRT.

**Voiceover tips:** about 75–78 seconds at your Sentinel pace. Say "El Niño" as "एल नीन्यो". Pause a beat after "अचानक बंद हो जाए?", after "Super El Niño", and after "और भारत?" (that's our new beat, so give it weight). Read "13%" as "तेरह प्रतिशत" and "2027" as "दो हज़ार सत्ताईस".
