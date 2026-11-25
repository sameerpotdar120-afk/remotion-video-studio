---
name: cutout-shorts
description: The creator's locked workflow for history/story Shorts in the reference-#10 style - GPT makes layered 4K UE5-style images (backgrounds, pose cut-outs, props, FX) plus googly-eye/mouth Remotion code; we edit them in Remotion into a layered, parallax, pose-swapping animation with face-tracked eyes and mouths, synced to the creator's VO. Use when the user sends a VO, asks for image prompts, sends a Drive folder of images, or says "edit it like the Napoleon video".
---

# Cut-out Shorts (the Napoleon workflow)

## LOCKED RULE (creator, 2026-11-25)
Every video is made the NAPOLEON way: EMPTY background sets + character POSE cut-outs (cycles made by editing the
previous frame) + separate props + FX, assembled in layers so characters move, appear, react and swap poses.
NEVER switch to whole-scene pictures (one finished image per shot), even if a reference analysis suggests it.
Quality upgrades (film look, matched lighting per set, no upscaling, effects cued to words) go INSIDE this layered method.
Pack size scales with length: ~190 pieces for ~2 min (Caesar v4 = `episodes/caesar/PROMPTS.md`, the template for long videos).

Reference build: `episodes/nap/` + `src/nap/` (Napoleon vs the Rabbits, 19.5 s, 4K, 24 shots).
Copy it for every new video. Wait for the creator's instruction before each stage.

## Stages

1. **Script**: `/yt-script`, short (15-20 s ≈ 50 words at ~3.4 w/s). Two scored hooks, beat-by-beat with ON SCREEN.
2. **VO**: the creator records it. Speed it up with `ffmpeg -filter:a atempo=1.10` (they say "0.10%" but mean 10%).
   Get word timings with faster-whisper `small` (CPU int8, `HF_HUB_DISABLE_XET=1`, pass the audio as a float32 numpy array).
3. **Prompt pack** (`episodes/<ep>/PROMPTS.md`, copy `episodes/nap/PROMPTS.md`): LAYERED, never whole pictures.
   - style lock, cut-out header, three lighting setups L1/L2/L3, character sheets C01-C03;
   - about 14 empty backgrounds, pose libraries per character (6-frame run and hop cycles made by *editing* the previous frame), props that move separately, FX;
   - a shot assembly table timed to the sped-up VO's word timings;
   - the eyes/mouth Remotion prompt.
   Roughly 90 images for 20 s.
4. **Download** the creator's Drive folder:
   - list it with `gdown.download_folder(..., skip_download=True)`;
   - download each file from `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t` (gdown's own download host is blocked).
   - Cut-outs arrive as RGBA (the index CSV may wrongly say not transparent).
   - Look at contact sheets of everything first.
5. **Prep**:
   - convert to webp q93 in `public/<ep>/`, which is gitignored (the creator's images, VO and mix never go in the repo);
   - faces: `scripts/cutout/face_detect.py` then `face_detect_crops.py` (mediapipe FaceLandmarker; needs `libgles2 libegl1` and the model from storage.googleapis.com);
   - animals by hand with `scripts/cutout/grid.py`;
   - check every face with `scripts/cutout/face_qa.py`;
   - write `src/<ep>/data.ts` holding ASPECT, FACES, BBOX (alpha bbox for feet anchoring) and WORDS.
6. **Build** `src/<ep>/shots.tsx` with the engine in `src/nap/lib.tsx`:
   - `Scene` sets the camera, zoom and shake;
   - `Depth` gives each layer a z for parallax;
   - `Bg` handles cover and pan;
   - `Actor` covers the pose cycle, 2-frame blur crossfade on swaps, trails, contact shadow, and googly eyes and mouth placed from FACES (moods, lip-sync from words);
   - `Sprite`, `Finish` (vignette, warm light, grain) and `Flash`.
   - Composition: 1080x1920 at 30 fps, rendered with `--scale=2` for 4K.
7. **Check stills**: `node scripts/nap_stills.mjs [seconds...]`, plus a ¼-scale full preview (about 7 min). Fix before the final render.
8. **Sound**:
   - write `episodes/<ep>/timing.json` and `sound.json`, then run `node scripts/sound.mjs <ep>`, which writes `public/<ep>/mix.wav` (voice plus bed);
   - SFX names come from the sound.mjs library: boom, whoosh, thump, hoof, crowd, crack, crash, thud, riser, swell, pop, ding, tape and more.
9. **Render 4K**:
   - command: `npx remotion render src/index.ts <Comp> out/<ep>/x_noaudio.mp4 --scale=2 --concurrency=4 --codec=h264 --crf=16 --muted` (about 40 min for 585 frames);
   - mux: `-af loudnorm=I=-14:TP=-1:LRA=7`, AAC 256k;
   - make a 1080p copy for the phone;
   - show progress and frames while rendering.
10. **Upload kit**: a thumbnail composition (`src/nap/Thumb.tsx`), plus `episodes/<ep>/SEO.md` with titles, description, hashtags, tags, pinned comment and settings.

## Planned upgrades (from the next video on; the creator asked not to change the Napoleon video)
- **Effects that follow the script:**
  - impact frames, speed lines, zoom punches and whip-pans on key words;
  - light flashes, smoke and dust bursts, emoji or icon pops;
  - colour shifts per beat;
  - text or number callouts (dates, counts), all cued from the word timings.
- **Higher image quality, matching the reference:**
  - sharper and more photoreal stills, less of GPT's glossy upscale look;
  - better prompts (texture and skin detail, a lens and film look) and native higher-res sources;
  - possibly a detail or sharpen pass and matched colour grading between cut-outs and backgrounds.
- Wait for the creator's instructions on these before building them.
