# Tibet no-fly zone: asset prompts

Script confirmed: `public/tibet/script_hindi.txt` (149 words, about 53–57 s).
All-new assets for this video. Nothing is reused from earlier videos.
The edit follows the reference (GeoGlobeTales, "Why Planes Don't Fly Over Tibet") beat for beat. Most of it is built in code from map and elevation data, so this video needs only 10 images.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| तुम्हारा Plane, Tibet के ऊपर से क्यों नहीं उड़ता? | Frame 0: bold text; a 3D globe spins in and dives to Tibet; the plateau glows red with a pulsing edge; planes curve around it | A2 |
| Flight Radar देखो… एक खाली इलाका | Radar-style dark map full of yellow plane icons (code), an empty hole over Tibet, a red ring draws on, red tag "Tibet का पठार" | — |
| 25 लाख km²… भारत का तीन-चौथाई | Satellite map; India's official outline pops in beside the plateau; tag "25 लाख km²" | — |
| वजह तीन हैं | Badges 1 · 2 · 3 (code) | — |
| पहली, ऊँचाई… 14,800 Feet… Everest | 3D terrain fly-over low across snowy peaks (elevation data + satellite); cyan altitude ruler; Everest pin; clouds part as we dive in | D3 |
| Plane… 35,000 Feet… Pressure गिर जाए… Oxygen Masks… 15 मिनट | The airliner cruises high on the ruler; red ⚠ flash (code); oxygen masks drop; 15:00 timer (code) | A1, B1 |
| 10,000 Feet तक नीचे… ज़मीन ही 15,000 Feet पर | The airliner banks and dives; the "10,000 ft" line is under the terrain; red ✗ (code) | A3 |
| दूसरी, मौसम… हवाएँ, Turbulence | Back to the map: storm clouds, wind streaks, snow over the red plateau; the plane shakes | C2, D1, D2 |
| तीसरी… Airports गिने-चुने… पतली हवा | Airport tower with a red no-entry sign (code) over the empty plateau; only a few airport dots | C1 |
| Pilots घूमकर जाते हैं | Plane icons trace routes around the plateau | A2 |
| तुम Pilot होते… सीधा, या घूमकर? | Question card with two buttons (code) | — |

---

## 1. Read this first

**1. GPT never draws a map or mountains.** I build everything geographic myself:
- the globe and satellite views from Sentinel-2 (EOX, CC BY 4.0, credited)
- the 3D Himalaya from open elevation data (AWS Terrain Tiles / SRTM, credited)
- the borders from Natural Earth's India edition (India's official boundary)

**2. No text, numbers, letters, logos or airline liveries in any GPT image.** Every number (14,800 · 35,000 · 10,000 · 15:00 · 25 लाख km²), the warning signs, the no-entry sign, the radar screen and the buttons are drawn in code.

**3. No real people.** The only human detail is the oxygen masks.

**4. One look: "Glossy 3D miniature".** Every prop is a premium glossy 3D miniature, like a high-end diorama or tabletop model: soft studio light from the top-left, smooth materials, no outlines. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props, **1536×1024** for wide items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for weather and cloud effects.
- Make 2–3 versions of each and keep the best. Name files exactly as listed. They go in `public/tibet/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map and 3D-terrain look, like a high-end After
Effects + Google-Earth-style geography video). The story is why most
airliners avoid flying over the Tibetan Plateau: it is the highest plateau on
Earth, the weather is violent, and there are very few airports for an
emergency landing. Every prop is a premium glossy 3D miniature, like a
high-end diorama or tabletop model: soft studio light from the top-left,
smooth realistic materials, subtle reflections, no outlines, no cartoon line
work. No text, no letters, no numbers, no logos, no airline names or
liveries, no flags, no watermark, no signature, no frame or border. When I
say PNG-T, the background must be fully transparent (real alpha channel).
When I say BLACK, the background must be pure flat black #000000. Centre the
subject with generous empty padding. Do not add glow or drop shadows; those
are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. The airliner (same chat, keep it the same plane in all three)

#### A1 · `plane_side.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a modern twin-engine passenger airliner seen exactly
from the side, flying to the right, level flight: clean plain white fuselage
with a soft light-blue belly stripe, dark cockpit windows, a row of small
cabin windows, white wings, a light-blue tail with no logo, landing gear up.
No text, no logo, no airline livery. PNG-T, transparent background.
```

#### A2 · `plane_top.png` (1024×1024, PNG-T)
```
The same glossy 3D miniature airliner seen exactly from above (top-down view),
nose pointing straight up, wings spread symmetrically: plain white body and
wings, light-blue tail, small engines under the wings. Clean and readable
like a map icon but still a 3D miniature. No text, no logo. PNG-T,
transparent background.
```

#### A3 · `plane_dive.png` (1536×1024, PNG-T)
```
The same glossy 3D miniature airliner banking hard and diving down to the
right in an emergency descent, nose pointed steeply down, one wing raised,
seen from a three-quarter front-side angle, a faint white vapour trail
streaming off the wingtips. No text, no logo. PNG-T, transparent background.
```

### B. Inside the cabin (same chat)

#### B1 · `oxygen_masks.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an aircraft overhead panel opened from below, with
three bright yellow passenger oxygen masks dropping down on clear plastic
tubes, swinging slightly, each with a small green bag. Seen from slightly
below. No people. PNG-T, transparent background.
```

### C. Weather and airports (same chat)

#### C1 · `airport_tower.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small high-altitude mountain airport: a slim
air-traffic-control tower with a glass cab on top, a short grey runway with
white markings (no numbers) beside it, a little snow on the ground, a tiny
patch of rocky brown terrain under it like a tabletop model base. PNG-T,
transparent background.
```

#### C2 · `storm_cloud.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a heavy dark storm cloud: dark grey-blue billowing
cloud mass, a bright white lightning bolt striking down from its base, a few
streaks of rain and snow falling below. PNG-T, transparent background.
```

### D. Effects (same chat)

#### D1 · `overlay_snow.png` (1024×1536, BLACK)
```
A blizzard of small white snowflakes and ice crystals blowing diagonally from
upper left to lower right, some in sharp focus and some soft and blurred,
evenly spread over the whole frame. On a pure flat black #000000 background.
BLACK.
```

#### D2 · `overlay_wind.png` (1536×1024, BLACK)
```
Thin flowing white wind streaks and air-current lines sweeping horizontally
from left to right in long smooth curves, like visible jet-stream wind,
semi-transparent and soft, spread across the frame. On a pure flat black
#000000 background. BLACK.
```

#### D3 · `overlay_clouds.png` (1536×1024, BLACK)
```
A thick bank of soft white high-altitude clouds filling the frame, with a
clear opening in the centre as if flying down through a gap in the clouds,
fluffy and bright, edges wispy. On a pure flat black #000000 background.
BLACK.
```

#### D4 · `overlay_red_alarm.png` (1536×1024, BLACK)
```
A soft pulsing red emergency glow coming from the edges of the frame toward
the centre, like the red alarm light inside an aircraft cabin, the centre
fading to black. No icons, no text. On a pure flat black #000000 background.
BLACK.
```

---

**Total:** 10 images (3 planes, 1 cabin prop, 2 weather/airport props, 4 effects). Put them in one zip.

**Done in code:**
- the 3D globe and the 3D Himalaya fly-over
- the radar map with its yellow plane icons
- the red plateau glow, India's outline and the routes
- the altitude ruler, the Everest pin, the ⚠ and ✗ signs, the no-entry sign and the 15:00 timer
- the airport dots, the 1·2·3 badges, the question card and the subtitles
