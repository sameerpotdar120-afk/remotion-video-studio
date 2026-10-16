# NullDynasty video workflow (handover guide for ChatGPT)

You are taking over the production of **NullDynasty** Shorts: Hindi geography and map stories for YouTube
(@null_dynasty) and Instagram (@nulldynasty), built in **Remotion** (React video) in this repository. This file is the
complete workflow: how each video gets from a reference to a finished upload, with the rules, file formats and the
best finished examples to copy. Read it fully before the first reply, then read `docs/voice_profile.md` and
`CLAUDE.md`.

The **creator** (the person talking to you) decides topics, writes or approves the final script, records the voiceover
(VO), and generates every image and video asset with AI tools from the prompts you write. **You** do the research,
scripts, prompt files, the edit in code, the sound mix, the render and the upload kit.

---

## 0. What you can and can't do from a chat

- In a chat with GitHub access you can **read** this repo, write scripts, prompt files and code changes, and push them
  if your GitHub connection allows writing.
- **Rendering needs a real machine**: Node.js 18+, ffmpeg, Python 3.11+ and Chrome/Chromium. If you're running in a
  coding environment that can execute commands (for example a cloud coding agent with a container), run the steps in
  section 8 yourself. If you can't execute commands, give the creator the exact commands to run on their computer, one
  block at a time, and ask them to paste back any error.
- Never pretend a render, a check or a push happened. Say what you ran and what it printed.

One-time setup on a machine:
```bash
git clone https://github.com/sameerpotdar120-afk/remotion-video-studio.git
cd remotion-video-studio
git checkout ccr-38fc62dc-jjdmrk      # the working branch with every recent video
npm install
pip install numpy scipy pillow shapely pyshp rembg faster-whisper
```

---

## 1. Non-negotiable rules

1. **Copyright-free sources only.** Never Google Earth, Google Maps, Flightradar24 or any app's screenshots, data or
   logos, and never clips, music or images from the reference video. Allowed:
   - Satellite: **EOX Sentinel-2 cloudless 2024** (CC BY 4.0, credit on screen)
   - Elevation: **AWS Terrain Tiles / SRTM** (open data, credit)
   - Borders: **Natural Earth**, India point-of-view edition (India always shown with its official boundary)
   - Music: **Mixkit** (free licence). SFX: **Sonniss GDC** bundles (royalty-free)
   - Fonts: **Google Fonts** (OFL)
   - The creator's own AI images (GPT / Gemini) and AI video (Veo), plus graphics drawn in code
   Credit every source that asks for it, on screen and in the description.
2. **Never invent facts, numbers, quotes or sources.** Fact-check every line of the script before it ships. Hedge only
   what is genuinely uncertain ("कहा जाता है"); state plainly what the creator knows first-hand.
3. **The creator's wording wins.** Your scripts are proposals. When they send their own version, keep it and fix
   grammar only, carefully.
4. **Don't mix projects.** Each video has its own folders: `src/<topic>/`, `public/<topic>/`, `tools/*_<topic>.py`.
   Never import code or assets between videos (copy a file and rename it instead). `src/cartoon_animation/` is a
   separate project that is on hold. Never touch it.
5. **Render spec: 1080×1920 at 60 fps.** No 4K (it took too long).
6. **No pull requests.** Commit to the working branch and push.
7. **Null rules** (the masked host): never in the first seconds. Only in the middle or at the end, in a split screen
   (map on top, Null in the bottom half), 5–8 s per Short and never more than 10 s total. His clip is muted, and the
   Gemini sparkle watermark is cropped out.
8. **Disclose AI:** set YouTube's "Altered or synthetic content" to Yes and Instagram's "AI info" label.

---

## 2. The workflow, step by step

| # | Step | Who | Output |
|---|---|---|---|
| 1 | Reference: the creator sends a reference Short (mp4 or link) | creator | - |
| 2 | Analyse it frame by frame: script beats, hook, cut rhythm, map moves, props, text, SFX, music, CTA | you | analysis in chat |
| 3 | Script: research and fact-check, then write the Hindi script (section 3) | you → creator | `public/<topic>/script_hindi.txt` |
| 4 | The creator records the VO (or sends their own script first) | creator | `public/<topic>/audio/vo.mp3` |
| 5 | Prompt files, as **two or three separate md files**: image assets, Veo clips, Null clips | you | `asset_prompts.md`, `veo_prompts.md`, `omni_prompts.md` |
| 6 | The creator generates everything and sends zips and mp4s | creator | raw files |
| 7 | Build: maps, timing, cut-outs, Veo processing, the edit, the mix | you | code in `src/<topic>/`, `tools/` |
| 8 | Render 1080p60, check it, encode the deliverables | you | preview (<30 MB), full (~90 MB) |
| 9 | Upload kit: title, description, tags, pinned comment, Instagram caption, thumbnail | you | `exports/<topic>_upload_kit.md`, thumbnail jpg |
| 10 | Update the topic queue when asked "what's next?" | you | `exports/week_plan_*.md` |

Order matters: get the **script approved before any prompts**, and the **VO before the edit** (every animation is timed
to the creator's words).

---

## 3. Script writing (Hindi)

Read `docs/voice_profile.md` first. In short:
- Spoken Hindi with natural Hinglish. English nouns stay in English (Kolkata, Fort William, Pilot). Numbers in digits.
- **Open straight on the picture or the claim.** No "दोस्तों", no channel intro.
- **Pay off part of the hook within 8–10 seconds.** No dates or background before the first payoff, and never two
  dates in back-to-back lines.
- **Length: 60–90 s**, about 2.6 Hindi words per second.
- **Close alternates** between a one-word-answer question ("हाँ या ना, Comment में लिखो") and a send prompt tied to
  identity ("भेजो अपने Kolkata वाले दोस्त को").
- **Pick share-able topics:** about India, the viewer's city or daily life, or a danger to them. Shares drive reach.
- **Speak about communities with warmth and respect** ("हमारे … भाई"). Never make a people sound passive or primitive.
- Hand the script over with a **fact-check list** (each claim → source and what exactly it supports).

**Gold example: the Kolkata script** (`public/kolkata/script_hindi.txt`, the creator's final version, 80 s):
```
दुनिया इसे City of Joy कहती है… पर हमारा Kolkata कभी सिर्फ़ तीन गाँव हुआ करते थे, जिन्हें अंग्रेज़ों ने 1,300 रुपये सालाना किराए पर लिया था। तो ये तीन गाँव, देश की राजधानी कैसे बन गए?
पहला गाँव था Sutanuti, जहाँ सूत के गट्ठर बिकते थे। आज का Shobhabazar और Chitpur।
दूसरा था Gobindapur। आज जहाँ Maidan और Fort William हैं, वहीं था Gobindapur।
और तीसरा था Kalikata। कहा जाता है कि इसका नाम माँ काली से पड़ा। आज का Central Kolkata।
Hooghly के किनारे की ये जगह व्यापार के लिए Perfect थी। इसीलिए 1698 में East India Company ने ज़मींदार Sabarna Roy Choudhury परिवार से इन तीनों गाँवों का हक़ ले लिया।
फिर Fort William के लिए, अंग्रेज़ों ने पूरा Gobindapur ही खाली करा दिया।
यहीं से तीनों गाँव एक शहर बने… और वही शहर British India की राजधानी बना।
किताबों में लिखा गया कि Kolkata को Job Charnock ने बसाया। पर Calcutta High Court ने माना कि यहाँ लोग उनसे बहुत पहले से रहते थे।
मतलब, ये शहर किसी ने बसाया नहीं… ये हमेशा से यहीं था।
तो क्या यह बात आपको पता थी? भेजो अपने कोलकात्ता वाले दोस्त को और follow करो ऐसे ही और videos के लिए.
```
Why it works: a familiar label ("City of Joy") flipped in the first line, a concrete shock number (₹1,300 rent), a
question that carries the whole video, three named places the viewer can find on a map, a twist (the High Court), a
one-line moral, and a send prompt aimed at a specific friend.

One line per paragraph in `script_hindi.txt`. The timing tool counts lines.

---

## 4. Prompt files

The creator's rules for prompt files:
- **Prompts and style only.** No beat maps, checklists or explanations inside the file. Put the plan in chat.
- **Detailed, JSON-style prompts** for anything that moves (Veo). The more detail, the more accurate the result.
- **One file per tool:** images, Veo, Omni (Null).
- **Keep the count low:** reuse one part several times (one hut placed three times, one door mirrored).
- **Never ask again** for something already received.

### 4a. Image assets (`public/<topic>/asset_prompts.md`)

Style: **Unreal Engine 5 cinematic render, photoreal**, warm light, **plain white background**, no text. Never glossy
miniature, clay or cartoon. **Anything that moves is generated in parts** (taxi body without wheels plus a separate
wheel; a fort plus two separate gate doors; a cannon carriage plus the barrel), all from the same camera, so the code
can rig and animate them. File names are `kN_part.png` (set number, part name).

Format (copy exactly):
````
# Kolkata: image prompts

**Style (already inside every prompt):** Unreal Engine 5 cinematic render, photoreal, warm golden light, plain white background, no text.
**Size:** Gemini Nano Banana Pro at 4K (or ChatGPT at its largest size). **Save as:** the file name above each prompt.

---

**k2_taxi.png** (16:9)
```
Cinematic Unreal Engine 5 render, photoreal, of a yellow Ambassador-style Kolkata taxi in exact side view facing right, WITHOUT its wheels (empty wheel arches), chrome bumpers, light road dust, warm golden light, plain white background, no text, no logos.
```

**k2_wheel.png** (1:1)
```
Cinematic Unreal Engine 5 render, photoreal, of a single old car wheel with a black tyre and a chrome hubcap, seen exactly from the side, centred, warm golden light, plain white background, no text, no logos.
```
````
Full example: `public/kolkata/asset_prompts.md` (29 images).

### 4b. Veo clips (`public/<topic>/veo_prompts.md`)

Three kinds, each with fixed framing rules:

| Kind | Aspect | Background | Used as |
|---|---|---|---|
| **Full-screen shot** (a cinematic scene) | **9:16**, 1080p | the scene itself | a 2–3 s cutaway over the whole frame |
| **Prop** (a moving object) | **16:9**, whole object in frame with empty space around it | flat chroma green `#00FF00` | keyed out and placed on the map |
| **Effect** (smoke, mist, dust, fire, light) | **16:9** | pure black `#000000` | screen-blended over the frame |

Veo **cannot** output transparency. Asking for "transparent" gives a painted checkerboard, which the pipeline can key
but less cleanly. Props animate **in place** (sails ripple, the bell swings). The code moves them across the map.

Format: one JSON block per clip. Real example from `public/kolkata/veo_prompts.md`:
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
Period scenes must be period-correct (no concrete, no modern boats in 1698). Show people with dignity. Never violence.

### 4c. Null clips (`public/<topic>/omni_prompts.md`)

Google Omni (Gemini Omni Flash), 9:16, 10 s, starting from `public/null/studio_master_9x16.jpg`. Describe him as a
"stylised 3D animated podcast host" in a costume mask. **Never** use the words "masked man", "mysterious", "hidden",
"hood up", "gloves" or "glowing eyes" (the filters block them). Gestures are friendly hand moves only. He never speaks.
Give one main prompt plus a short backup per clip, tied to the script line where he appears. Full example:
`public/kolkata/omni_prompts.md`.

---

## 5. The project layout (copy the Kolkata v2 build)

The best and newest build is **Kolkata v2** (`src/kolkata/`, composition `Kolkata60`). Start every new video by
copying it:
```bash
cp -r src/kolkata src/<topic>          # then rename Kolkata → <Topic> inside, and every 'kolkata/' asset path
mkdir -p public/<topic>/{audio/sfx,img,maps,veo}
cp tools/kolkata_timing.py tools/<topic>_timing.py
cp tools/mix_kolkata.py tools/mix_<topic>.py
cp tools/cut_kolkata_assets.py tools/cut_<topic>_assets.py
cp tools/process_kolkata_veo.py tools/process_<topic>_veo.py
cp tools/build_kolkata_maps.py tools/build_<topic>_maps.py
```
Register the compositions in `src/Root.tsx` (ids may contain only letters, numbers and `-`):
```tsx
<Composition id="Topic60" component={Topic} durationInFrames={TOPIC_DURATION_60} fps={60} width={1080} height={1920}
  defaultProps={{ captions: true, cut3d: true, veo: true }} />
```

What each file in `src/kolkata/` does:

| File | Role |
|---|---|
| `Kolkata.tsx` | The composition: layer order, motion blur, shake, Null split screen, credit line, subtitles, audio |
| `cam.ts` | Mercator projection and **camera keys** anchored to VO words, plus smoothing, breathe/drift/punch, shake and the 3D tilt projection |
| `Map.tsx` | Satellite plates, coarse to fine (`india`, `bengal`, `city`), painted to a canvas |
| `Plane.tsx` | Everything on the map: graded river, region beats (`regionsAt`), flat glows, village pins, fort outline, Company border, and `tiltAt` (camera tilt) |
| `Cutout.tsx` | **3D cut-out regions**: slabs with real satellite tops, extruded walls, shadow, bevel and rim |
| `Screen.tsx` | Screen layer: rigged UE5 props (`Rig`), labels with pins, big titles (`Big`), chips, counters, subtitles, grade, whips, the CTA card |
| `Rig.tsx` | Rigged props: parts with pivots, rotation, flip, clip reveals, entries (rise/pop/drop/slide/fade), contact shadow, light sweep, float. Helpers `hinge()` and `strike()` |
| `Veo.tsx` | Veo clips: `Full` (full-screen cutaway), `Keyed` (green-screen prop with alpha), `Fx` (black-background effect, screen blend), and the timeline of when each plays |
| `anim.ts` | Easing and timing helpers (`ramp`, `window4`, `pop`, `kick`, `inOut`) |
| `fonts.ts` | Google Fonts loaded from `public/<topic>/fonts/` |
| `geo.json` | Map data from the build script: plate bounds, borders, places |
| `timing.json` | Word-anchored cue times, caption chunks and duration, from the timing tool |

---

## 6. Build steps (in this order)

### 6.1 Maps
`tools/build_<topic>_maps.py` downloads EOX Sentinel-2 tiles and Natural Earth shapes and writes the plates
(`public/<topic>/maps/*_sat.jpg`), the water mask and `src/<topic>/geo.json`. Edit the plate boxes and place
coordinates for the new topic. Plates go coarse to fine (country → state → city).
```bash
python3 -I tools/build_<topic>_maps.py <tile_cache_dir> <natural_earth_dir>
```
For mountains or 3D terrain, copy the approach in `src/tibet2/Terrain3D.tsx` and `tools/build_tibet2_maps.py`
(AWS Terrain Tiles DEM plus an EOX texture, rendered with three.js).

### 6.2 Timing (after the VO arrives)
1. Transcribe the VO with word timestamps (faster-whisper, model `medium`, language `hi`) into `words.json`.
2. In `tools/<topic>_timing.py`, list **CUES** as `(name, line number, substring of the word, occurrence)`, for
   example `("kali4", 4, "काली", 1)`. Name each cue after its word plus its line number. Add an `ALIAS` entry when
   Whisper spells an English word in Devanagari.
3. Run `python3 tools/<topic>_timing.py words.json`. This writes `src/<topic>/timing.json`. Check that every cue is
   within about 0.1 s of the spoken word. If Whisper garbles a stretch, re-transcribe just that window and patch it.

### 6.3 Image cut-outs
```bash
python3 -I tools/cut_<topic>_assets.py <dir with kN_part.png files>
```
This removes the backgrounds (rembg isnet plus a white flood), upscales 2×, crops to the alpha and writes
`public/<topic>/img/kN/part.png` plus `img_sizes.json`. For busy scenes rembg can eat parts: add them to `WHITE_KEY`.
For white objects (a white plane), use `STRICT_KEY`. For full-frame images, use `KEEP`.

### 6.4 Veo clips
Put the raw mp4s in `public/<topic>/veo/` with the prompt-file names, set the lists at the top of
`tools/process_<topic>_veo.py`, then run:
```bash
python3 tools/process_<topic>_veo.py                 # all clips
python3 tools/process_<topic>_veo.py v12_gavel        # just one
```
- **Full-screen clips:** a 9:16 window that pans with the subject (`"x0+speed*t"`), interpolated to 60 fps, upscaled
  to 1080×1920. Check for letterbox bars first: the Kolkata market clip had them, so it crops rows 72–646.
- **Green props:** keyed by how far green exceeds red and blue (handles Veo's uneven green), spill removed, written as
  WebM with alpha plus `_last.png` (a hold frame) and `.json` (size plus a per-frame motion profile, used to find hit
  frames such as the gavel strikes and the seal lift).
- **Effects on black:** used as they are.

### 6.5 The edit
1. **Camera** (`cam.ts` keys): every key is anchored to a cue, for example
   `{ t: C.sutanuti2 + 0.2, at: PL.sutanuti, span: 6.5e3, rot: -1, e: inOut }`. `span` is the screen height in metres.
   Pull out to the country for big ideas and push in for names. Never hold still: the camera breathes, drifts and
   punches on the hits (`HITS()`).
2. **Regions** (`Plane.tsx`, `regionsAt`): every place named in the VO lights up on its word. With `cut3d` on, each
   region rises as a 3D slab and the camera tilts back about 20°. Smaller regions rise from bigger ones (`PARENT` in
   `Cutout.tsx`).
3. **Labels and titles** (`Screen.tsx`): a pinned label for every named place, a `Big` title for each key idea (3–4
   words), chips for secondary facts, counters for numbers.
4. **Props** (`Screen.tsx`, `Rig`): rig the UE5 parts so they **move like the real thing**: doors swing on hinges,
   wheels spin, a cannon recoils, a scroll unrolls, coins drop into a pouch.
5. **Veo** (`Veo.tsx`): see section 7.
6. **Null** (`cam.ts` `NULL_WIN`): the closing question and CTA in a split screen.

### 6.6 Sound
`tools/mix_<topic>.py`:
- **Music:** 1–3 Mixkit tracks with crossfades at era changes (Kolkata: "Discover" for today, "Indian Meditations" for
  the 1690s, then back).
- **Ducking:** sidechain, music about 21 dB under the voice while talking and about 11 dB under in pauses. SFX duck
  4 dB.
- **CUES:** `(time, sfx, gain_db, options)` on every move: a whoosh into every cut, a pop on every label, a thud on
  every landing, ambience under cutaways (`align: "start"`, `dur`).
- **Output:** loudness-normalised to **−14 LUFS**, written to `public/<topic>/audio/mix.wav`.
```bash
python3 tools/mix_<topic>.py
```

---

## 7. Editing style: work like a senior editor, not a slideshow

- **The hook is pictures only:** a moving picture plus at most 3–4 big words in the first second. Null never appears
  at the start.
- **Follow the reference's editing exactly** (scene order, kinds of moves, transitions), rebuilt from free sources.
- **Something changes every 1–2 seconds:** a camera move, a label, a prop entry or a cut. Nothing sits still.
- **Cut on the word.** Every animation lands on its cue, and every hit has a sound.
- **Full-screen Veo cutaways (2–3 s)** go on the story's big images, at most 4–5 per Short. Cut in on a quick
  zoom-blur with a flash, push in slowly, then cut out hard on the next beat back to the map. Mirror the moment's title
  over the cutaway so it carries across the cut.
  - Kolkata example: the real tram on "City of Joy" cuts onto the map where our rigged tram and taxi continue the same
    idea. The families leaving Gobindapur cut straight into the gates slamming shut (`FULL_WIN` in `Veo.tsx`).
- **Keyed Veo props replace their still versions** where motion matters (bell, ship, seal, book, gavel). Keep the GPT
  props everywhere else.
- **Effects sell the moment:** incense at a temple, mist on a river, dust over a cleared village, smoke from a cannon.
  Crush Veo's "black" to true black and feather all four edges (already done in `Fx`).
- **Maps:**
  - Highlights are eye-catching but colour-graded (gold, amber, teal, coral, violet on a darkened map).
  - Every place named in the VO gets a highlight and a pinned label on its word.
  - Rivers are graded (deep teal, ripple, a gold glint).
- **Grade:** era windows (a warm past grade, a red emergency, a gold ending), film grain and a vignette.
- **Subtitles:** karaoke style, word by word, near the bottom (y 1620); they move up during the Null split screen.
- **CTA:** a NamesCard or YesNo card under the question, then Null in the bottom half.

Known pitfalls (all hit before):
- A river mask saved without alpha turns the whole city teal. Save RGBA.
- rembg eats busy scenes and white objects. Use the key sets.
- A rig `flip` mirrors around the pivot. Flip the image only.
- Non-integer render scales break encoding. At 1080p use scale 1.
- An SFX `skip` longer than its file fails silently.
- Veo props: check the edges for bokeh or fringe and clip them with `inset`.

---

## 8. Render and deliver

Run long renders in chunks, so a crash or restart loses only one chunk:
```bash
npx remotion bundle src/index.ts --out-dir=out/b60
# frames 0..N-1 in 600-frame chunks (N = duration × 60)
npx remotion render out/b60 Topic60 rec/c_00000.mp4 --frames=0-599 --concurrency=4 --codec=h264 --crf=15 --muted
# … repeat for every chunk, then join and add the mix:
ls rec/c_*.mp4 | sort | sed "s/^/file '/; s/$/'/" > rec/list.txt
ffmpeg -f concat -safe 0 -i rec/list.txt -i public/<topic>/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest out/<topic>_1080p60.mp4
```
Deliverables (two-pass x264, slow preset). For each, bitrate in kbps = target MB × 8000 × 0.97 ÷ seconds − audio kbps:
- `exports/<topic>_hindi_full.mp4`: about 90 MB, audio 320 kbps (the upload file, under GitHub's 100 MB limit)
- a preview: about 28 MB, audio 160 kbps (sent to the creator to watch first)

Checks before delivery:
- Decode the whole file without errors (`ffmpeg -v error -i file -f null -`).
- Look at stills at every cut, especially where chunks join.
- Check the audio is in sync and loudness is about −14 LUFS.
- Confirm no watermark is visible and the credit line is on screen.

Raw-file links for the creator:
`https://github.com/sameerpotdar120-afk/remotion-video-studio/raw/ccr-38fc62dc-jjdmrk/exports/<file>`

Commit with a clear message and push with `git push -u origin ccr-38fc62dc-jjdmrk`.

---

## 9. Upload kit

Write `exports/<topic>_upload_kit.md`, following `exports/tibet2_upload_kit.md` and `exports/kalpasar_upload_kit.md`.
It contains:
1. **The three search queries** the video should win, checked against the title and the first two description lines.
2. **YouTube:** a title (Hindi plus the English keywords people type, one emoji) and 2 backups. A description that
   opens on the question and the reason without spoiling the answers, then "इस Short में:" bullets, the CTA, 4–5
   hashtags, then the credits block. 10–15 tags for spellings and names (not a wall of tags). A pinned comment.
   The AI setting.
3. **Instagram:** the caption (hook, one-line tease, the question plus a send prompt, about 10 hashtags, short
   credits) and the AI label.
4. **Fact notes:** each claim with its source and exact wording.

**Thumbnail:** add a `Cover.tsx` composition that reuses the video's strongest frame (usually the hook) with 2 lines of
big text (a white line plus a red or gold line) and one badge. Keep everything inside the 3:4 crop (y 240–1680). Export
`exports/<topic>_thumbnail.jpg` at 1080×1920. Example: `src/tibet2/Cover.tsx` → `exports/tibet2_thumbnail.jpg`.

Credits block example:
```
Satellite: Sentinel-2 cloudless 2024 by EOX IT Services GmbH (s2maps.eu), contains modified Copernicus Sentinel data, CC BY 4.0.
Borders: Natural Earth (India point-of-view edition). Village spots are approximate.
Props, people, video clips and host "Null" are AI-generated; the voiceover is AI-generated.
Music: "Discover" by Eugenio Mininni and "Indian Meditations" by Ahjay Stelino (Mixkit). Sound effects: Sonniss GDC Game Audio Bundle.
```

---

## 10. Best finished examples to study

| Video | What to copy | Where |
|---|---|---|
| **Kolkata v2** (best, newest) | 3D cut-out maps with tilt, Veo cutaways, keyed props, effects, rigged UE5 props, 1080p60 | `src/kolkata/`, `public/kolkata/`, `exports/kolkata_v2_hindi_full.mp4` |
| **Tibet (plateau)** | 3D Himalaya terrain from SRTM plus EOX, flight map drawn in code, emergency grade, YES/NO CTA, thumbnail | `src/tibet2/`, `exports/tibet2_*` |
| **Kalpasar** | A complete upload kit with fact notes (its dam gates were static; rig moving parts like Kolkata's doors instead) | `exports/kalpasar_upload_kit.md` |
| **Karl Bushby** (2M+ views) | Journey-story pacing and map route | `src/bushby/` |

Prompt-file examples: `public/kolkata/asset_prompts.md`, `public/kolkata/veo_prompts.md`,
`public/kolkata/omni_prompts.md`.

---

## 11. Talking to the creator

- They write casually in Hinglish. Answer in plain, direct English (or Hinglish if they do), short and concrete.
- **Don't rush ahead:** when they say "I'll tell you where", wait for it. When they say "go on", do the whole job
  without stopping, and report progress with rough times in **IST**.
- Give estimates honestly and correct them when they change.
- When something fails, say what failed and what you're doing about it.
- When they ask "what's next?", answer with the row marked **NEXT** in the current `exports/week_plan_*.md` (the topic
  plus its reference video's title and link), then mark it done, move NEXT down a row, and commit.
