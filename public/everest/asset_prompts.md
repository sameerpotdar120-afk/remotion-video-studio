# Everest: edit plan and image prompts

Script: `public/everest/elevenlabs_script.txt` (7 lines, about 60 s after the 1.15× speed-up).
Editing style: our two most viral videos, Karl Bushby (3.4M) and West Indies (2.8M). The map is the stage and the camera
never rests; every place the VO names lights up; props are real-looking renders that land on the map on the word; it
loops back into frame 0 with no end card.

---

## 1. How we edit it (studio grade)

**Map look (West Indies "Midnight")**
- Dark satellite plates from EOX Sentinel-2 (CC BY 4.0, credited): sea a deep navy-teal, land darkened and slightly
  desaturated, snow near-white. No labels or borders baked in.
- Every place the VO names gets a saturated fill (about 80 %, the satellite still shows through) in its own colour, with
  its name inside in the same colour, lighter. A thin white outline with a soft glow draws each region.
- India's official boundary (Natural Earth, India point of view) on every map.

**3D terrain (for Everest and Spiti)**
- Real relief from AWS Terrain Tiles / SRTM (credited) with the Sentinel-2 image draped on it, a low sun from the left,
  long shadows, a thin blue haze in the valleys. Same dark grade as the flat map, so the cuts between them don't jump.

**Globe (Karl Bushby)**
- For India's drift north: the dark globe turns, India glides north leaving a glowing trail with a soft sparkle at its
  head (Bushby's route line), and meets Asia.

**Camera**
- Continuous: it drifts, tracks and breathes on every frame, never a locked still. Every move eases in and out with a
  slight overshoot; nothing moves at a constant speed.
- Big moves are whip pans with real motion blur (several sub-frames per frame), not a crossfade.
- A short punch-in on the key word of each line ("समंदर", "भारत", "टकराया", "लांगज़ा", "आज भी").

**Props and reveals (what makes it look expensive)**
- Props are the renders below, cut out cleanly, with a contact shadow and a light wrap from the map's colour, so they sit
  in the scene instead of floating on top of it.
- Reveals use masks, wipes and light: a fill wipes in from one edge in 4–6 frames with a soft leading edge; a fossil
  "forms" from the living animal in a light sweep; a label is a glass pill with a glowing rim that types on.
- No cheap moves: no rubber-band bounce on everything, no wiggle, no spin-ins, no stock "pop" presets, no lens flares,
  no glow on every edge. One accent colour per beat.
- Text: big numbers count up and land with a short ring and light sweep (West Indies' counter). Hindi in Baloo 2,
  English in Montserrat (both OFL).

**Sound (as both videos)**
- One Mixkit bed under the voice, ducked, music running through the loop point. Sonniss SFX: whooshes on whips, low hits
  on fills, a deep rumble under the collision, water on the sea line, a soft chime on each fossil. −14 LUFS.

**Rules that stay**
- Frame 0 is the payoff picture, three words at most. The last frame is the frame before frame 0, picture and sound.
- Null split screen once, in the middle (beat 4).
- "AI illustration" tag whenever a creature, fossil or person render is on screen; the time maps say "चित्रण".
- Don't label the 47-crore-year-old sea "Tethys" on screen: the Tethys is named only in beat 4, when it closes.
- 4K at 30 fps (as our recent videos). West Indies was 4K60; say if you want 60.

---

## 2. Beat map (script → screen)

| Time | VO | On screen | Assets |
|---|---|---|---|
| 0:00–0:05 | तुम एवरेस्ट की चोटी पर खड़े हो… पुराने समंदर के तल पर खड़े हो। | Frame 0: Everest's summit in 3D, the climber on top, a glowing sea surface hanging above the peak, "8,849 m". The camera pushes in. On "समंदर के तल" the water drops over the summit and through it: for a beat the climber is under water, light caustics on the rock, then the water drains away | ev01, ev01b |
| 0:05–0:12 | चोटी का ये पत्थर चूना पत्थर है… भारत के उत्तरी किनारे पर। | Whip down into the rock: the limestone block, its layers lit one by one, a pill "LIMESTONE · समुद्र की तली"; counter "47 करोड़ साल" rolls up. Then a time map (चित्रण): India's outline (official boundary) with a blue sea glowing along its north edge, "भारत का किनारा" | ev06 |
| 0:12–0:18 | इसमें आज भी समुद्री जीवों के fossil… समुद्री लिली कहते हैं। | A living brachiopod and a crinoid sway in blue water, a light sweep passes over each and they turn to stone in the summit rock; glass pills "BRACHIOPOD", "CRINOID · समुद्री लिली" | ev02, ev03, ev04, ev05 |
| 0:18–0:31 | फिर भारत उत्तर की ओर खिसकता गया… ऊपर उठता गया। | Pull out to the globe: India glides north with a glowing trail, the Tethys between India and Asia glows blue and squeezes shut. Null split screen on "जा टकराया" (deep rumble). Then the sea-floor layers fold and rise into the 3D Himalaya, the summit climbing to the camera | Null clip |
| 0:31–0:42 | ये सिर्फ़ एवरेस्ट की बात नहीं… ammonite fossil मिलते हैं। | Whip west along the Himalaya on the Midnight map: Himachal fills, then Spiti, pin "LANGZA · 4,400 m" with an altitude ruler. Dive into 3D Spiti, the village house on the slope; a living ammonite swims through the frame and settles into the slope as a fossil; small line "fossil बेचना मना है" | ev07, ev08, ev09 |
| 0:42–0:49 | और ये कहानी अभी ख़त्म नहीं हुई… ऊपर उठ रहा है। | India's fill pushes north with a slow arrow; the 3D Himalaya lifts under the camera, "आज भी ↑" pill | — |
| 0:49–0:56 | तो अगली बार कोई दोस्त… समंदर के तल पर खड़ा है। | The traveller looks up at the peaks, then the camera rises up the mountain to the summit; the sea surface comes back above the peak; the last frame is the frame before frame 0 | ev10 |

---

## 3. Image prompts (West Indies format)

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global
illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. Make 2–3 of each and keep the best.
**Save as:** the file name above each prompt, into `public/everest/img/`.
All on plain white so I can cut them out. No text, logos or real people. The climber and the traveller are fictional.

---

**ev01_climber_body.png** (9:16)
```json
{
  "type": "single character on a plain white background, for cutting out",
  "subject": "a fictional high-altitude mountaineer standing on a summit, seen from behind in three-quarter back view, looking out to the left; a bright orange-red down summit suit with a hood, black climbing harness, a small dark backpack, crampons on heavy yellow-and-black mountaineering boots, mittens, goggles pushed up on the hood; the left arm hangs relaxed at his side, the right arm is not in this image (the right shoulder ends cleanly at the sleeve seam)",
  "camera": "full body at eye level, the whole figure fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (quilted down fabric, frost on the fabric, metal crampons)",
  "lighting": "low golden sun from the upper left, cool blue fill from the right, a crisp rim light on the hood",
  "background": "plain pure white, no snow, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "flags", "patches", "a visible face", "a real person's likeness", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**ev01b_climber_arm_axe.png** (1:1)
```json
{
  "type": "single body part on a plain white background, for cutting out and rigging",
  "subject": "the right arm of the same fictional mountaineer on its own, from the shoulder to the hand, in the same bright orange-red quilted down sleeve and a black mitten, the hand gripping an ice axe raised high above as if celebrating reaching the summit; the shoulder end is cut cleanly so it can be attached to a body",
  "camera": "three-quarter back view at eye level, matching a figure seen from behind, the arm and the whole ice axe fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (quilted down, brushed steel axe head, rubber grip)",
  "lighting": "low golden sun from the upper left, cool blue fill from the right",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "a full body", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev02_brachiopod_fossil.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a fist-sized chip of pale grey marine limestone with a fossil brachiopod shell set in its face: a ribbed, fan-shaped shell with two unequal halves and fine radiating ribs, slightly darker than the rock, its outline crisp, tiny fragments of other shells in the stone around it",
  "camera": "front view from slightly above, the whole rock fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (granular limestone, weathered edges, mineral sparkle)",
  "lighting": "soft cool studio light from the upper left with a raking angle that shows the ribs",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "labels", "scale bars", "a hand", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev03_crinoid_fossil.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a fist-sized chip of pale grey marine limestone with fossil crinoid stems in its face: several stacked chains of small round disc-shaped segments, each disc with a tiny hole in the centre, a few loose round segments scattered like little coins, slightly darker and creamier than the rock",
  "camera": "front view from slightly above, the whole rock fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (granular limestone, weathered edges, mineral sparkle)",
  "lighting": "soft cool studio light from the upper left with a raking angle that shows the segments",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "labels", "scale bars", "a hand", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev04_living_crinoid.png** (9:16)
```json
{
  "type": "single creature on a plain white background, for cutting out",
  "subject": "a living crinoid (sea lily) from an ancient sea: a long slender jointed stalk standing upright from a small root at the bottom, topped by a cup with ten long feathery arms opened wide like a flower, the arms lined with fine fronds; soft reddish-purple and cream colours",
  "camera": "side view at eye level, the whole animal from root to arm tips fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, subsurface scattering in the fronds",
  "lighting": "soft blue-green light from above as if under water, a gentle rim light",
  "background": "plain pure white, no water, no floor, no shadow",
  "avoid": ["text", "fish", "coral reef", "other animals", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**ev05_living_brachiopod.png** (1:1)
```json
{
  "type": "single creature on a plain white background, for cutting out",
  "subject": "a living brachiopod from an ancient sea: a ribbed, fan-shaped shell with two unequal halves, slightly open at the front, a short fleshy stalk at the hinge end anchoring it, a hint of the feathery feeding organ inside the gap; pale cream and soft orange shell",
  "camera": "three-quarter view from slightly above, the whole animal fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, wet shell sheen",
  "lighting": "soft blue-green light from above as if under water, a gentle rim light",
  "background": "plain pure white, no water, no sand, no shadow",
  "avoid": ["text", "a clam or mussel look", "pearls", "other animals", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev06_limestone_block.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a cut-away block of mountain rock like a geology museum model: a thick block of layered grey limestone with clear horizontal bands in slightly different greys, a few small fossil shells and round disc-shaped segments visible in the cut face, the top surface rough and dusted with snow and ice",
  "camera": "three-quarter view from slightly above, so the top and two cut faces show, the whole block fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (granular limestone, crisp saw-cut faces, powder snow)",
  "lighting": "low golden sun from the upper left, cool fill from the right",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "labels", "arrows", "people", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**ev07_ammonite_fossil.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a round black shale nodule split in half like an opened stone, with a coiled ammonite fossil inside one half: a tight spiral shell with fine curved ribs, dark grey to black with a faint silvery sheen, the other half of the nodule lying open beside it showing the matching imprint",
  "camera": "front view from slightly above, both halves fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (smooth black shale, crisp ribs)",
  "lighting": "soft studio light from the upper left with a raking angle that shows the ribs",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "labels", "price tags", "a hand", "a shop", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev08_living_ammonite.png** (1:1)
```json
{
  "type": "single creature on a plain white background, for cutting out",
  "subject": "a living ammonite from an ancient sea swimming to the left: a coiled spiral shell with fine ribs in cream with soft brown bands, a large eye, and a bunch of short tentacles trailing from the shell opening",
  "camera": "side view at eye level, the whole animal fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, wet sheen on the shell",
  "lighting": "soft blue-green light from above as if under water, a gentle rim light",
  "background": "plain pure white, no water, no shadow",
  "avoid": ["text", "a snail look", "other animals", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**ev09_spiti_house.png** (16:9)
```json
{
  "type": "single building on a plain white background, for cutting out",
  "subject": "a traditional two-storey house from a high Himalayan desert village in Spiti: thick whitewashed mud-brick walls, a flat roof edged with stacked firewood and dry brush, small windows with wooden frames painted deep red and black, a short wooden door, a small patch of bare brown earth at its base",
  "camera": "three-quarter view from slightly above, the whole house fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (rough lime wash, dry timber, packed earth)",
  "lighting": "bright high-altitude sun from the upper left, deep crisp shadows",
  "background": "plain pure white, no mountains, no sky, no floor, no shadow",
  "avoid": ["text", "signs", "flags", "prayer flags", "religious symbols", "people", "vehicles", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**ev10_traveller.png** (9:16)
```json
{
  "type": "single character on a plain white background, for cutting out",
  "subject": "a fictional young Indian traveller on a mountain trip, seen in three-quarter back view looking up and to the left in wonder; a mustard puffer jacket, a dark grey beanie, a large trekking backpack, cargo trousers, trekking shoes, a phone held loosely in the right hand",
  "camera": "full body at eye level, the whole figure fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (nylon jacket sheen, knit beanie, worn backpack straps)",
  "lighting": "bright high-altitude sun from the upper left, soft cool fill from the right",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "a real person's likeness", "a selfie pose", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

## 4. Drawn in code (no image needed)

Everest and Spiti in 3D terrain, the Midnight satellite maps, the globe with India's trail, the Tethys squeeze and the
layers folding up, the sea surface and caustics, fills, outlines, pins, the altitude ruler, the counters, the glass pills,
"आज भी ↑", the "AI illustration" and "चित्रण" tags, the credits.

Credits on screen and in the description: Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · AWS Terrain Tiles / SRTM ·
Natural Earth (India's official boundary) · AI illustrations · Mixkit music · Sonniss SFX.
