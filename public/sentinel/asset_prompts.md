# North Sentinel Island (Hindi): Asset Prompts and Asset Plan

Target: a ~63-second 9:16 Short (1080×1920, 30 fps) for NullDynasty, rebuilt in the style of the reference Short (see `reference_breakdown.md`): one continuous camera over real satellite maps, the island isolated with a dark surround and a glowing coastline, map pins with icons, slanted labels, a new visual every 1.5–2.5 s. GPT makes the objects, scenes and textures; real data makes the maps; Remotion does all motion, glow and text.

Script: `public/sentinel/script_hindi.txt` (15 lines).

---

## 0. Read this first

**1. GPT never draws a map, an island or a coastline.** North Sentinel's square-ish shape, the Andaman islands and India all come from real satellite data (section 1).

**2. No text, numbers or flags inside any GPT image.** "दुनिया का सबसे ख़तरनाक टापू", "सेंटिनलीज़", "64 किमी", "9 किमी", "50–200?" and the Indian flag (with a correct 24-spoke Ashoka Chakra) are all drawn in Remotion.

**3. Respect the people in this story.** The Sentinelese are real, living people. We never use real photos or footage of them, and we never draw them as cartoon "savages". Every person in this video is either a solid silhouette or a backlit figure with no face or body detail. The prompts below already say this; keep it if you edit them. Image generators sometimes refuse to depict a named real tribe, so the prompts describe generic island figures and never name the tribe.

**4. Clean assets from GPT, glow and colour in Remotion.** Ask for clean subjects; Remotion adds the red/white glow and the colour tints, so everything matches.

**5. One look for the whole video: "Forbidden island".** Deep teal-navy ocean, dark jungle green, white sand, with danger red (#FF2B3D) as the only strong accent. Every prompt below already includes this.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of the chat, then send the prompts one by one.
- Size: **1024×1536 (portrait)** for full-screen scenes, **1024×1024** for icons and objects.
- `PNG-T` = real transparent background. If ChatGPT returns a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- Make 2–3 versions of each and keep the best. Zoom to 100% and check edges, hands and weapons (bows must have one string, arrows one shaft).
- Name files exactly as listed and send them all together. They go in `public/sentinel/img/`.
- **Matching sets must be made in the same chat, one after the other:** the two pins (B1–B2), the two emoji (E1–E2), the three scenes (C1–C3), the helicopter parts (F1–F2).
- **For the emoji (E1, E2) and pins (B1, B2): upload the old file as a reference image** (`emoji_worried.png` / `pin_snake.png` from the Darién pack) and say "match this exact style". That keeps all our videos consistent.

### Style Lock (paste once at the top of the ChatGPT chat)
```
You are generating production assets for a premium geography explainer video
(vertical 9:16, dark satellite-map look, cinematic, like a high-end After Effects
+ GeoLayers documentary). The story is about a remote, forbidden tropical island
in the Indian Ocean. The palette is deep teal-navy ocean, dark jungle green,
warm white sand, with a strong danger red (#FF2B3D) used only where I ask.
Every asset must look professionally made: clean edges, consistent soft light
from the top-left, realistic but slightly stylized, no cartoon outlines unless
asked, no text, no letters, no numbers, no flags, no insignia, no watermark, no
logo, no signature, no frame or border. People are always shown with dignity:
as solid silhouettes or backlit figures with no visible faces or body detail,
never as caricatures. When I say PNG-T, the background must be fully
transparent (real alpha channel). Keep the subject centered with generous empty
padding so it can be scaled and animated. Do not add glow, drop shadow or
color grading unless I ask; those are added later in the video editor.
```

---

## 1. Base maps and data (real, NOT GPT; I prepare these)

| What | Source |
|---|---|
| World globe for the opening and the "Indian Ocean / India" pull-back | NASA Blue Marble Next Generation, July, topography + bathymetry (public domain), already downloaded |
| Andaman Sea, North Sentinel, South Andaman and Port Blair | Sentinel-2 cloudless 2016 by EOX (CC BY 4.0), credited on screen and in the description, as in videos 1 and 2 |
| North Sentinel coastline, Andaman coastlines | OpenStreetMap (ODbL), for the neon outline and the isolated-island mask |
| India outline for the flag fill | Natural Earth 1:10m (public domain), with India's official boundary |
| Manhattan outline for the size comparison | OpenStreetMap (ODbL), drawn at true scale next to the island |
| 9 km (5 nautical mile) zone, distance arrow, arrow trails, person icons, boats' wakes | Drawn by Remotion as SVG |

---

## 2. Reused from earlier videos (no need to generate)

| File | From | Used for |
|---|---|---|
| `icon_skull.png` | Darién | Glowing skull on the island (beat 1) |
| `pin_snake.png` | Darién | "जंगली जानवरों" (the Andamans have venomous snakes) |
| `overlay_lightleak.png` | Darién | Flash transitions in the silhouette-scene insert |
| `overlay_fog.png` | Darién | Edge darkening on the scenes |
| `cloud_01–04.png` | Darién | Clouds sliding past during the opening dive |
| `emoji_worried.png` | Darién | Style reference for the new emoji only |

The jaguar pin doesn't fit: there are no jaguars in the Andamans, and viewers would catch it.

---

## 3. GPT asset prompts

### A. The danger opening

#### A1 · `glow_skull_neon.png` (1024×1024, PNG-T), optional upgrade
The reference's skull is a flat neon sign. Our old 3D skull works, but this matches the reference more closely. Remotion adds the red glow.
```
A skull and crossbones symbol drawn as a clean flat neon-sign style icon:
smooth thick white rounded strokes only, like bent glass neon tubes switched
off, front view, perfectly symmetrical, no shading, no background, no text.
Centered with padding. PNG-T, transparent background.
```

### B. "Not the animals, not the air" (two pins, same chat; upload `pin_snake.png` as the style reference)

#### B1 · `pin_crocodile.png` (1024×1024, PNG-T)
```
Match the exact style of the attached map pin: a glossy white 3D map pin
(teardrop marker) with a round white face and a bold red (#FF2B3D) icon
embossed on it. The icon is a saltwater crocodile head seen from the side,
jaws slightly open showing a few teeth, drawn in the same bold, simple red
illustration style as the attached snake. Same angle, same lighting, same
proportions, same soft shadow as the attached pin. No text. Centered with
padding. PNG-T, transparent background.
```

#### B2 · `pin_toxic_gas.png` (1024×1024, PNG-T)
```
Exactly the same white 3D map pin as the previous image, same angle, lighting
and proportions. This time the red (#FF2B3D) icon is a cloud of poisonous gas:
three billowing round puffs with two small droplets falling from it
and a few curling wisps, bold and simple in the same red illustration style.
No text, no skull. Centered with padding. PNG-T, transparent background.
```

#### B3 · `pin_bow_arrow.png` (1024×1024, PNG-T)
For the moment the pins are replaced by "बल्कि यहाँ रहने वाले लोगों से".
```
Exactly the same white 3D map pin as the previous images, same angle, lighting
and proportions. The red (#FF2B3D) icon is a simple hunting bow with an arrow
nocked, drawn diagonally, bold and simple in the same red illustration style.
No text. Centered with padding. PNG-T, transparent background.
```

### C. The silhouette insert (replaces the reference's real footage; three scenes, same chat)
Remotion gives each scene a different tint (orange, purple, red), a heavy vignette, film grain and white flash transitions with a shutter sound, exactly like the reference's footage insert. Make the images realistic and neutral in colour; the tints come later.

#### C1 · `scene_beach_figures.png` (1024×1536)
```
Cinematic documentary-style photograph, telephoto lens from a boat out at sea,
slightly grainy like an old 1990s film photo. A white sand beach in front of a
dense wall of dark tropical jungle. Three distant human figures stand on the
sand at the water's edge holding long hunting bows, one with a bow raised. The
figures are strongly backlit and almost completely dark silhouettes, small in
the frame, no faces or body details visible. Soft haze, overcast tropical
light. Portrait 9:16 composition, figures in the lower middle third, jungle
filling the top half. No text, no people in the foreground.
```

#### C2 · `scene_jungle_edge.png` (1024×1536)
```
Same photographic style, grain and lens as the previous image. Close to the
treeline at the edge of a dense tropical jungle: huge leaves, tangled
branches, deep shadows. One human figure stands half hidden between the trees,
completely in shadow, a dark silhouette holding a long spear upright, no face
or body detail visible. Shafts of light through the canopy. Tense, watchful
mood. Portrait 9:16, the figure slightly right of center. No text.
```

#### C3 · `scene_archer_aiming.png` (1024×1536)
```
Same photographic style, grain and lens as the previous images. A low-angle
view from the shallow water toward the beach: one human figure in full
silhouette against a bright hazy sky, drawing a long hunting bow and aiming
straight at the camera. Pure dark silhouette, no face or body detail visible,
a single bowstring, a single arrow. Small splashes of shallow water in the
foreground. Portrait 9:16, the figure large and centered. No text.
```

#### C4 · `silhouette_group_cutout.png` (1536×1024, PNG-T)
The flat black figures that rise on top of the island map before the "सेंटिनलीज़" label appears (the reference's 12–15 s beat).
```
A group of four standing human figures as solid flat black silhouettes, side
by side, slightly overlapping: two holding long hunting bows, one holding a
spear upright, one with a bow raised and aiming. Natural, dignified poses, no
faces or details, just clean solid black shapes with crisp edges, like a
stencil. Full bodies visible, feet on one baseline. PNG-T, transparent
background.
```

### D. "Port Blair is only 64 km away"

#### D1 · `pin_city.png` (1024×1024, PNG-T)
Upload `pin_snake.png` as the style reference again.
```
Match the exact style of the attached white 3D map pin. The bold red (#FF2B3D)
icon is a small city skyline: four simple buildings of different heights and
a lighthouse, bold and simple in the same red illustration style. No text.
Centered with padding. PNG-T, transparent background.
```

### E. "Contact attempts turned deadly" (two emoji, same chat; upload `emoji_worried.png` as the reference)

#### E1 · `emoji_wave_smile.png` (1024×1024, PNG-T)
```
Match the exact 3D style, colours, lighting and gloss of the attached emoji. A
happy, friendly smiling emoji face with closed happy eyes and a big open
smile, with one yellow cartoon hand raised beside it, waving hello. Same
round yellow face size and shading as the attached emoji. No text. Centered
with padding. PNG-T, transparent background.
```

#### E2 · `emoji_dead.png` (1024×1024, PNG-T)
```
Exactly the same emoji face as the previous image, same size, colour and
lighting, but now dead: both eyes are X marks, the mouth is a flat wavy line
with the tongue slightly out, and there is no hand. Cartoon style, not gory.
No text. Centered with padding. PNG-T, transparent background.
```

### F. The extra beat: the 2004 tsunami helicopter (not in the reference)

#### F1 · `heli_body_topdown.png` (1024×1024, PNG-T)
Seen from directly above as it flies over the island. The rotor is a separate file so Remotion can spin it.
```
A white and orange search-and-rescue helicopter seen from directly above
(top-down, orthographic, like a map icon but realistic), nose pointing up.
Body only, with NO main rotor blades (the rotor mast hub is visible on top),
tail rotor included. No text, no numbers, no flags, no insignia. Clean
realistic render, soft light from the top-left. Centered with padding. PNG-T,
transparent background.
```

#### F2 · `heli_rotor_blur.png` (1024×1024, PNG-T)
```
Only the main rotor of a helicopter seen from directly above: four long thin
dark-grey blades from a small central hub, with a soft circular motion-blur
disc showing they are spinning fast. Semi-transparent blur, the blades still
faintly visible. Nothing else. Centered. PNG-T, transparent background.
```

#### F3 · `scene_heli_beach.png` (1024×1536)
The hero shot of the extra beat, about 1.5 s on screen with the same tint and flash treatment as C1–C3.
```
Same grainy documentary photo style as the earlier scenes. Low angle from the
white sand beach looking up past the edge of a tropical jungle. In the sky, a
white and orange rescue helicopter hovers low over the trees, slightly hazy.
In the foreground on the beach, one human figure in full dark silhouette,
seen from behind, draws a long hunting bow and aims an arrow up at the
helicopter. No face or body detail. Storm-washed light after a big storm,
broken palm fronds and debris scattered on the sand. Portrait 9:16. No text,
no markings on the helicopter.
```

#### F4 · `tsunami_wave.png` (1536×1024, PNG-T), optional
For a half-second wave sweep across the map on "2004 की सुनामी".
```
A single huge breaking ocean wave seen from the side, deep teal water curling
over with bright white foam and spray, isolated on its own, nothing else.
Realistic, dramatic. PNG-T, transparent background.
```

### G. The 9 km zone and the boat that sneaks in

#### G1 · `boat_patrol_topdown.png` (1024×1024, PNG-T)
Circles the red 9 km zone (the reference uses flat white boat icons; ours are realistic, small on screen).
```
A grey coast-guard patrol boat seen from directly above (top-down,
orthographic), bow pointing up, realistic render. No text, no numbers, no
flags, no insignia. A short white wake at the stern. Centered with padding.
PNG-T, transparent background.
```

#### G2 · `boat_fishing_topdown.png` (1024×1024, PNG-T)
The small boat that tries to sneak close to the shore (beat 12).
```
A small wooden fishing boat with a little outboard motor, seen from directly
above (top-down, orthographic), bow pointing up, weathered blue and white
paint, a coiled rope and a few nets inside, no people. No text. A short white
wake at the stern. Centered with padding. PNG-T, transparent background.
```

#### G3 · `arrow_single.png` (1536×512, PNG-T)
Flies at the boat and the helicopter; Remotion adds the dashed trail and motion blur.
```
A single primitive wooden hunting arrow seen from the side, horizontal,
pointing right: a straight thin wooden shaft, a sharp dark iron arrowhead,
simple feather fletching at the back. Realistic. One arrow only. PNG-T,
transparent background.
```

#### G4 · `spear_single.png` (1536×512, PNG-T)
```
A single primitive wooden spear seen from the side, horizontal, pointing
right: a long straight wooden shaft with a sharp dark iron spearhead.
Realistic. One spear only. PNG-T, transparent background.
```

### H. The ending: their bodies can't fight our diseases

#### H1 · `virus_particle.png` (1024×1024, PNG-T)
Small particles drift from the red "outsider" figure toward the others as they turn red.
```
A single stylized 3D virus particle: a round body covered in short club-shaped
spikes, glossy, in danger red (#FF2B3D) with a slightly lighter red rim light,
clean and simple, scientific-illustration style, not scary or gory. Centered
with padding. PNG-T, transparent background.
```

#### H2 · `texture_jungle_glow.png` (1024×1024), optional
Overlaid inside the island outline when "घने जंगल" lights up, so it glows like dense canopy, not a flat colour.
```
A seamless top-down texture of dense tropical rainforest canopy seen from high
above: thousands of tightly packed tree crowns in many shades of green, soft
natural light, no gaps, no rivers, no clearings, no buildings. Square, edge to
edge, tileable.
```

---

## 4. Drawn in code (no GPT needed)

Indian flag (correct 24-spoke Ashoka Chakra) and its waving fill over India · person icons (black and red) · the slanted danger label and the "सेंटिनलीज़" box · the red map ring · distance arrow with "64 किमी" counting up · the red 9 km zone disc · dashed arrow trails · the "50–200?" label · the island's neon outline, dark surround and jungle glow · film grain, tints, vignette and flash frames · all Hindi text and subtitles.

---

## 5. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `glow_skull_neon.png` | 1024² PNG-T | optional |
| B1 | `pin_crocodile.png` | 1024² PNG-T | yes |
| B2 | `pin_toxic_gas.png` | 1024² PNG-T | yes |
| B3 | `pin_bow_arrow.png` | 1024² PNG-T | yes |
| C1 | `scene_beach_figures.png` | 1024×1536 | yes |
| C2 | `scene_jungle_edge.png` | 1024×1536 | yes |
| C3 | `scene_archer_aiming.png` | 1024×1536 | yes |
| C4 | `silhouette_group_cutout.png` | 1536×1024 PNG-T | yes |
| D1 | `pin_city.png` | 1024² PNG-T | yes |
| E1 | `emoji_wave_smile.png` | 1024² PNG-T | yes |
| E2 | `emoji_dead.png` | 1024² PNG-T | yes |
| F1 | `heli_body_topdown.png` | 1024² PNG-T | yes |
| F2 | `heli_rotor_blur.png` | 1024² PNG-T | yes |
| F3 | `scene_heli_beach.png` | 1024×1536 | yes |
| F4 | `tsunami_wave.png` | 1536×1024 PNG-T | optional |
| G1 | `boat_patrol_topdown.png` | 1024² PNG-T | yes |
| G2 | `boat_fishing_topdown.png` | 1024² PNG-T | yes |
| G3 | `arrow_single.png` | 1536×512 PNG-T | yes |
| G4 | `spear_single.png` | 1536×512 PNG-T | yes |
| H1 | `virus_particle.png` | 1024² PNG-T | yes |
| H2 | `texture_jungle_glow.png` | 1024² | optional |

17 required and 4 optional. Send them together with your voiceover (MP3) and, if you have it, the SRT.

**Voiceover tips:** read at the same pace as the Darién video. Pause a beat after "मारे जा सकते हो", after "Sentinelese लोगों से है", and before "हमसे एक मुलाक़ात भी…". Put a little extra weight on "2004 की सुनामी": it's our new beat.
