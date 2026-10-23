# NullDynasty house style (set by the UK weather video, October 2026)

The creator approved the UK weather Short ("Britain का मौसम इतना अजीब क्यों है?") as the standard for every future
NullDynasty video: the same workflow, map style, colour grade, animation and motion feel, and sound design. Start each
new video from these pieces instead of from scratch. Reference code: `src/ukweather/`, `tools/*ukweather*`.

## Workflow

1. Reference video in: analyse it frame by frame (micro-frames, keyframes, rhythm, sync, positions) and write
   `public/<topic>/reference_analysis.md`.
2. Script with /yt-script. The creator's wording wins; wait for "ship it".
3. Deliver all three together: GPT image prompts, Omni prompts for Null, and tested Remotion motion components
   (`src/<topic>/motion/`, `public/<topic>/motion_assets.md`, `exports/<topic>_remotion_code.zip`).
4. Creator sends VO, Omni clips and images. Transcribe the VO (faster-whisper), cut out the images
   (`tools/cut_ukweather_assets.py`: flood-fill from the border, so white objects on white survive), build the edit,
   render stills across the whole timeline and fix what they show, mix, then render 4K60.
5. Deliver: master via the LFS raw link, thumbnail (Cover composition, 1080 and native 4K) and the upload kit.

## Map style (GeoLayers look, free data only)

- `tools/build_ukweather_maps.py`: EOX Sentinel-2 cloudless 2024 satellite + AWS terrarium DEM. Multi-directional
  hillshade soft-lit onto the land, the sea replaced by a depth tint (turquoise shelf → navy abyss) with seabed relief,
  then a teal/warm grade, vibrance and an unsharp mask. Plates coarse → fine (world z4 … city z9), one per place the
  story visits.
- India in its official boundary whenever it appears (Natural Earth India point-of-view edition, the outline matched to
  the official map the creator sent), with a glowing edge.
- Every country, region or city the VO names gets its own highlight fill as it is said (admin-0 countries, admin-1 for
  regions like Scotland or Greater London), plus a pin with a bobbing label for cities.

## Colour grade (Lumetri-style, no grain)

- Map filter `MAP_GRADE`: contrast S-curve, vibrance, slight lift.
- `Grade`: teal split-tone into the shadows, warm highlights, a slowly drifting warm light leak, vignette, darker top
  and bottom. Studio-clean: never add film grain.

## Motion: no frame is ever still

- The camera always breathes, drifts and rolls slightly; zoom punches on the big words; motion blur from camera speed.
- Living textures under everything: two parallax cloud layers with ground shadows drifting over the map; every fill
  breathes, has a light shimmer sweep and a pulsing glow edge; the light leak moves.
- Every element has secondary motion: pop with overshoot and settle, idle float, bob, wobble, typewriter text by
  grapheme cluster (`Intl.Segmenter`, so Devanagari matras never split).
- Null: split screen only, never at the start, about 7–10 s in total.

## Sound

- Creator's VO on top; Mixkit music bed (playful bed with a drum section for the tense part), sidechain-ducked
  (about 21 dB under while talking, 11 dB in pauses); Sonniss SFX on every visual hit, ducked 4 dB under the voice.
  Template: `tools/mix_ukweather.py`.

## Render and delivery

- 1080×1920 compositions at 60 fps, rendered `--scale=2` for 2160×3840, in 300-frame chunks at concurrency 1.
- Re-encode each chunk to x264 CRF 20 and join with the mix (keeps the master around 450–700 MB).
- For long renders, split the chunks across parallel cloud sessions (with the creator's OK) using a render-only entry
  like `src/ukweather/edit/render.tsx`.
- Credit every source on screen and in the description; set the AI labels on YouTube and Instagram.
