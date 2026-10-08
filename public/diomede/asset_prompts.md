# Diomede Islands (Hindi): Asset Prompts and Asset Plan

Target: a ~60-second 9:16 Short (1080×1920, 30fps) for NullDynasty, in the same style as the Darién Gap video: one continuous camera over real satellite maps, a new visual every 1–2 seconds, glowing overlays, small white subtitles. GPT makes the objects and textures, real data makes the maps, and Remotion does all motion, glow and text.

Script: `public/diomede/script_hindi.txt` (10 lines, ~63 s at your speaking pace).

---

## 0. Read this first: the rules that decide the quality

**1. GPT never draws a map, an island or a coastline.** The Diomede Islands are tiny and have a very specific shape (two steep, flat-topped rocks). An AI version would be wrong, and a maps channel can't afford that. All maps and both islands come from real satellite imagery (section 1).

**2. Clean assets from GPT, glow and colour in Remotion.** Ask GPT for a clean subject on a transparent background. Remotion adds the same gold, cyan, red or white glow to everything, so the video looks like one consistent piece, like video 1.

**3. No text, numbers or flags inside any GPT image.** Hindi (आज, कल, सोमवार, मंगलवार), numbers (3.8 किमी, 1867) and the US and Russia flags are all drawn in Remotion. Image models misspell Devanagari and get flags wrong (wrong number of stars or stripes), and viewers notice.

**4. One look for the whole video: "Arctic cold".** Everything sits in a palette of icy white, pale cyan, steel blue and deep navy, with gold and red reserved for the highlights (the date line in gold, danger in red). Every prompt below already includes this.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** below once at the start of the chat, then send the prompts one by one.
- Size: **1024×1536 (portrait)** for full-screen images, **1024×1024** for icons and objects.
- Transparency: every prompt marked `PNG-T` must have a real transparent background. If ChatGPT returns a checkerboard or a white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- Generate 2–3 versions of each and keep the best. Zoom to 100% and check edges for halos, extra fingers and broken shapes.
- Name files exactly as listed and send them all together; they go in `public/diomede/img/`.
- Assets that come in pairs (calendar pages, the walking person, the emoji) must be made **in the same chat, one after the other**, so they match.

### Style Lock (paste once at the top of the ChatGPT chat)
```
You are generating production assets for a premium geography explainer video
(vertical 9:16, dark satellite-map look, cinematic, like a high-end After Effects
+ GeoLayers documentary). This video is set in the Arctic, so the overall
palette is icy white, pale cyan, steel blue and deep navy, with small gold and
red accents only where I ask. Every asset must look professionally made: clean
edges, consistent soft studio lighting from the top-left, realistic but
slightly stylized, no cartoon outlines unless asked, no text, no letters, no
numbers, no flags, no watermark, no logo, no signature, no frame or border.
When I say PNG-T, the background must be fully transparent (real alpha
channel). Keep the subject centered with generous empty padding around it so
it can be scaled and animated. Do not add glow, drop shadow or color grading
unless I ask; those are added later in the video editor.
```

---

## 1. Base maps and data (real, NOT GPT; I prepare these)

| File | What | Source |
|---|---|---|
| `map_world.jpg` | The globe for the opening dive and the date-line pull-back, wrapping across the 180° line | NASA Blue Marble Next Generation, July, topography + bathymetry (public domain), already downloaded for video 1 |
| `map_bering.jpg` | Bering Strait: Chukotka (Russia), Alaska and both islands in between | NASA plate for the wide shots; Sentinel-2 cloudless 2016 by EOX (CC BY 4.0) for the close-ups, with on-screen credit as in video 1 |
| `geo_islands.json` | Exact outlines of Big Diomede and Little Diomede | Natural Earth 1:10m land (public domain), checked against the satellite image |
| `geo_dateline.json` | The International Date Line, including its bend through the Bering Strait | Natural Earth 1:10m geographic lines (public domain) |
| `geo_border.json` | The US–Russia sea border between the islands | Natural Earth maritime boundary lines (public domain) |
| `geo_alaska.json` | Alaska's outline, to fill it in colour for the 1867 beat | Natural Earth 1:10m Admin 1 (public domain) |

All lines (date line, border, the 3.8 km arrow, the Alaska fill) are drawn by Remotion as SVG, so they stay razor sharp at any zoom.

**Map colour grade (Remotion):** slightly desaturated, colder than video 1: steel-blue ocean, white-grey land, a soft dark vignette. The Arctic should look cold before anyone says a word.

---

## 2. GPT asset prompts

### A. Today vs tomorrow (hook and Monday/Tuesday beat)

#### A1 · `calendar_today.png` (1024×1024, PNG-T)
#### A2 · `calendar_tomorrow.png` (1024×1024, PNG-T)
The two calendar pages that sit above the two islands. Remotion writes "आज/कल" and "सोमवार/मंगलवार" on them and flips the Russian one forward. Generate A1 first, then A2 in the same chat.
```
A1: A single premium tear-off desk calendar page, front view, tilted about 5
degrees to the left. Thick off-white paper with a bold steel-blue header band
across the top 25% of the page and two small silver metal binder rings at the
top edge. Very subtle paper grain, a soft realistic shadow under the page, a
slight upward curl at the bottom-right corner. The page is completely BLANK:
no numbers, no letters, no words, no logos anywhere, because text will be
added later. Clean product-render look, soft studio light from the top-left.
Centered with padding. PNG-T, transparent background.

A2: Exactly the same calendar page, same paper, same rings, same lighting and
same angle as the previous image, but the header band is deep red instead of
steel blue, and the page is tilted about 5 degrees to the right. Still
completely blank. PNG-T, transparent background.
```

#### A3 · `clock_face.png` (1024×1024, PNG-T)
The clocks above both islands. Remotion animates the hands spinning 21 hours ahead on the Russian side.
```
A single round analog wall clock seen straight on: a thin brushed-steel rim
with a slight bevel, a clean white face, and simple dark-navy hour tick marks
(12 ticks, the ones at 12, 3, 6 and 9 slightly longer and thicker), plus fine
minute ticks around the edge. NO clock hands, NO numbers, NO brand name, NO
text, because the hands will be animated separately. A subtle glass
reflection across the top-left, soft studio lighting, crisp edges. Centered
with padding. PNG-T, transparent background.
```

#### A4 · `icon_sunrise.png` (1024×1024, PNG-T)
"सोमवार की सुबह" (Monday morning): a small sunrise that pops up on the American island.
```
A single glossy 3D icon of a sun rising over a low horizon: a warm golden
sun half-visible above a soft white cloud bank, with a few short rounded
sun rays. Smooth premium 3D render style, soft gradients from bright yellow
to warm orange, gentle highlight at the top-left, clean silhouette that
reads clearly even when small. No text, no glow, no shadow. Centered with
padding. PNG-T, transparent background.
```

### B. History: why two different countries (1867)

#### B1 · `treaty_parchment.png` (1024×1536, PNG-T)
The 1867 treaty that flies in over Alaska. Remotion adds "1867" in code.
```
An aged 19th-century treaty document on yellowed parchment paper, seen from
slightly above at a gentle angle, with softly curled edges, light fold
creases and brown age stains near the corners. Faint brown ink lines
suggesting handwritten paragraphs and two signature-like flourishes at the
bottom, but NO readable letters or words anywhere. A deep red wax seal with
a short red silk ribbon at the bottom right. Realistic paper fibre texture,
warm soft light, a soft shadow under the paper. Only the document, nothing
else. PNG-T, transparent background.
```

#### B2 · `quill_pen.png` (1024×1024, PNG-T)
Signs the treaty: it sweeps across the parchment before the border line draws on the map.
```
A single elegant white feather quill pen with a dark metal nib, lying at a
45-degree diagonal, nib pointing to the bottom-left. Realistic soft feather
barbs, a few fine translucent edges, a tiny wet ink shine on the nib. Soft
studio lighting from the top-left. Only the quill, nothing else, no ink
bottle, no paper. Centered with padding. PNG-T, transparent background.
```

### C. Cold War: the Ice Curtain

#### C1 · `sea_ice_topdown.png` (1024×1536)
The strait freezing over (Cold War beat) and the ice bridge at the end. Remotion spreads it across the water between the islands with a growing mask.
```
Photorealistic top-down satellite-style view of frozen Arctic sea ice
filling the whole frame: large white and pale-blue ice floes pressed
together, dark jagged cracks and narrow black-water leads between them,
pressure ridges with soft blue shadows, light snow texture, cold overcast
light, very high detail. Seen straight down from high above. No land, no
ships, no animals, no people, no text, no watermark. Vertical portrait
composition.
```

#### C2 · `frost_overlay.png` (1024×1536)
The transition into the Cold War beat: frost creeps in from the edges of the frame (Screen blend).
```
Realistic white and pale-cyan frost and ice crystals growing inward from all
four edges and corners of the frame, like frost on a frozen window at night:
delicate feathery fern-like ice patterns, denser at the corners, thinning
toward the middle, with the center of the frame left completely empty and
black. Only frost on a pure black (#000000) background, so it can be blended
with Screen mode. No objects, no text, no watermark. Vertical portrait
composition.
```

#### C3 · `ice_curtain_wall.png` (1536×1024, PNG-T)
"Ice Curtain": a translucent wall of ice rises out of the sea along the border line, between the two islands (3D-tilted in Remotion).
```
A long, tall, translucent wall of glacier ice seen from a 3/4 angle, rising
from nothing at the bottom edge: jagged icy top edge, vertical cracks, deep
blue inner layers fading to pale cyan and white at the surface, a few
trapped air bubbles, light passing through it. Cold, dramatic, cinematic,
photorealistic. Only the wall of ice, no ground, no water, no sky, no snow
around it. The wall spans almost the full width of the image. PNG-T,
transparent background.
```

### D. Today: only soldiers

#### D1 · `pin_military.png` (1024×1024, PNG-T)
Pops onto Big Diomede. Same pin family as the snake, jaguar and mosquito pins from video 1, so the channel's icons match.
```
A single map-pin location marker icon: a glossy pure white teardrop map pin
(round head, pointed tip at the bottom), seen straight on, with soft subtle
3D shading. Inside the round head, a bold red (#E0242F) flat icon of a
military helmet with a small star on the front, drawn in a clean modern
minimal line-and-fill style with rounded strokes, centered and filling about
65% of the circle. Consistent icon-set style, crisp edges, no outline around
the pin, no shadow, no glow, no text. Centered with padding. PNG-T,
transparent background.
```

#### D2 · `arctic_outpost.png` (1024×1024, PNG-T)
A small military outpost that grows up out of the island in 3D (like the trees in video 1).
```
A small remote Arctic military outpost rendered as a high-quality realistic
3D model, viewed from a slightly elevated 3/4 angle (about 35 degrees above),
like an asset from a premium 3D asset pack: two low grey-green prefab
buildings with snow on their flat roofs, a white radar dome, a thin radio
mast with an antenna, and a short metal fence. Snow-covered base that fades
out softly at the edges (no ground beyond it, no shadow). Cold overcast
light from the top-left, crisp detail, slightly stylized but realistic. No
flags, no text, no people, no vehicles. Centered with padding. PNG-T,
transparent background.
```

### E. Winter: the ice bridge

#### E1 · `footprints_snow.png` (1024×1024, PNG-T)
Footsteps that walk across the ice bridge, one pair after another.
```
A single pair of human boot footprints pressed into fresh snow, seen straight
from above, the left and right print slightly offset like one walking step,
both pointing up. Realistic deep tread pattern, soft blue shadows inside the
prints, a few loose snow crumbs around the edges. Only the two footprints and
a small soft patch of snow around them that fades smoothly to transparent at
the edges. No text. PNG-T, transparent background.
```

#### E2 · `person_parka_a.png` (1024×1024, PNG-T)
#### E3 · `person_parka_b.png` (1024×1024, PNG-T)
A tiny figure walking across the ice (two poses swapped to make a walk). Generate E2 first, then E3 in the same chat.
```
E2: A single small person in a thick orange Arctic parka with a fur-lined
hood up, dark snow trousers and dark boots, walking to the left, seen from
the side at a slight 3/4 angle, mid-stride with the right leg forward. Face
hidden by the hood. High-quality realistic 3D character render, like a
premium 3D asset, soft cold light from the top-left. Full body visible, feet
at the bottom of the frame. No ground, no snow, no shadow. Centered with
padding. PNG-T, transparent background.

E3: Exactly the same person, same parka, same colours, same lighting and
same angle as the previous image, but mid-stride with the LEFT leg forward.
PNG-T, transparent background.
```

### F. Ending: the question

#### F1 · `emoji_thinking.png` (1024×1024, PNG-T)
The channel's emoji character (same family as video 1's worried emoji) asks the closing question: "आज वाले या कल वाले?" ("the today island or the tomorrow island?")
```
An original glossy 3D emoji-style face character (not any existing brand's
emoji): a smooth round yellow-orange sphere with a soft gradient (bright
yellow top, warm orange bottom) and a subtle glossy highlight at the
top-left. Expression: curious and thinking, one eyebrow raised, eyes looking
up to the side, a small sideways smirk, and a small rounded yellow hand
touching its chin. Clean 3D render, soft studio lighting. Front view,
centered with padding. No text, no shadow. PNG-T, transparent background.
```
If you still have the chat where you made video 1's emoji, make this one there so the character matches.

### G. Optional

#### G1 · `broll_strait.png` (1024×1536)
A 1.5-second atmosphere flash between the hook and the map. It's an illustration, not the real islands, so it only flashes briefly. Skip it if you're short on time.
```
Cinematic photograph of two steep, dark, flat-topped rocky islands rising
from a cold grey Arctic sea, the nearer one smaller, with low fog drifting
between them and floating chunks of sea ice in the foreground. Overcast,
moody, cold blue-grey colour grade, high detail, shot from a low
boat-level angle, slight long-lens compression. No buildings, no people, no
ships, no birds, no text, no watermark. Vertical portrait composition.
```

---

## 3. Built in Remotion (no GPT needed)

- The camera: a dive from space into the Bering Strait, a pull-back to the globe for the date line, then back down
- The **International Date Line**: a glowing gold dashed line drawn from pole to pole, bending through the strait
- The **US–Russia border** between the islands, drawn on as a white line
- The **"3.8 किमी" arrow** between the islands, with the number counting up
- The island highlights: Little Diomede glowing cyan, Big Diomede glowing red
- The **US and Russia flags**, drawn exactly in code and popping in on each island
- The clock hands spinning 21 hours ahead, the calendar flip, and all text written on the calendars
- The Alaska fill (1867), the treaty flying in, the quill stroke, then the border line drawing
- The red/blue Cold War split tint, frost transition, and the ice spreading across the strait with a mask
- The outpost growing out of Big Diomede, soldier pin pop, slow push-in
- Footsteps animating across the ice bridge, the walking figure, and a big "?" pop
- Reused from video 1: fog, clouds, light leak, the vignette, motion blur, camera shake and the SFX library
- All Hindi text and subtitles

### Hindi text list (Noto Sans Devanagari, same as video 1)
| Where | Text | Look |
|---|---|---|
| Arrow 0:01 | 3.8 किमी | Bold white, counts up along the arrow |
| Calendars 0:02 | आज · कल | On the calendar pages, blue page = आज, red page = कल |
| Labels 0:06 | Little Diomede · Big Diomede | Small white labels with a soft glow, next to each flag |
| Date line 0:10 | International Date Line | Gold, written along the line in perspective |
| Calendars 0:13 | सोमवार · मंगलवार | On the calendar pages, the red one flips from सोमवार to मंगलवार |
| Clocks 0:15 | +21 घंटे | Gold counter next to the Russian clock |
| History 0:25 | 1867 | Big, white with a gold glow, slams in then settles |
| Cold War 0:32 | Ice Curtain | Big, icy white with a cyan glow and a frost texture mask |
| End 0:51 | आज वाले या कल वाले? | Two lines next to the emoji, the two words in blue and red |
| Subtitles | Script lines, 2–3 words at a time | Small white bold, at about 70% of the screen height, fade in, no box |

---

## 4. Beat-by-beat asset map

Timings are estimates from the script length; I re-time everything to your real voiceover.

| Time | Line | Assets |
|---|---|---|
| 0:00–0:06 | ये दो टापू सिर्फ 3.8 किलोमीटर दूर… एक पर आज, दूसरे पर कल | `map_world` dive (already moving in frame 1), `map_bering`, 3.8 km arrow, `calendar_today`, `calendar_tomorrow` |
| 0:06–0:10 | ये हैं Diomede Islands… America का, Russia का | `map_bering` close-up, island highlights, flags (code), optional `broll_strait` flash |
| 0:10–0:13 | बीच से गुज़रती है International Date Line | pull-back to `map_world` globe, date line drawn pole to pole |
| 0:13–0:21 | सोमवार की सुबह… मंगलवार लग चुका होता है | back to the strait, `clock_face` ×2, `icon_sunrise`, calendars flip सोमवार → मंगलवार, +21 घंटे |
| 0:21–0:25 | पर इतने पास होकर भी, दो अलग देश क्यों? | slow orbit around both islands, big "?" (code) |
| 0:25–0:32 | 1867 में America ने Russia से Alaska ख़रीदा… सरहद बीच में | zoom out, Alaska fills, `treaty_parchment` flies in, `quill_pen` stroke, border line draws |
| 0:32–0:37 | Cold War में… Ice Curtain | `frost_overlay` transition, red/blue split, `ice_curtain_wall` rises, "Ice Curtain" title |
| 0:37–0:43 | Soviet Union ने military base बनाया… सिर्फ फ़ौज | `pin_military` pop, `arctic_outpost` grows out of Big Diomede |
| 0:43–0:51 | सर्दियों में बर्फ़ का पुल… एक तरफ़ आज, दूसरी तरफ़ कल | `sea_ice_topdown` spreads across the strait, `footprints_snow`, `person_parka_a/b` walking, calendars return |
| 0:51–0:56 | आप किस टापू पर जाओगे? Comment करो | `emoji_thinking`, the two calendars side by side, comment icon pulse |

**Total GPT generations:** 15 images (2 calendars, 1 clock, 1 sunrise, 1 treaty, 1 quill, 1 sea ice, 1 frost, 1 ice wall, 1 military pin, 1 outpost, 1 footprints, 2 walking poses, 1 emoji), plus 1 optional B-roll. Make 2–3 tries each and pick the best.

---

## 5. Checklist before sending the assets

- [ ] Every `PNG-T` file has real transparency (open it on a dark background and check for white fringes)
- [ ] No letters, numbers, flags or logos in any image, especially the calendars, clock and treaty
- [ ] The two calendar pages match (same paper, rings and angle), one blue header and one red
- [ ] The two walking poses are the same person and parka, with different legs forward
- [ ] `pin_military` matches the video 1 pins (same white pin, same red)
- [ ] `emoji_thinking` looks like the same character as video 1's emoji
- [ ] Your voiceover file is included, recorded from the final script
