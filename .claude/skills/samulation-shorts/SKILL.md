---
name: samulation-shorts
description: The complete production system for EVERY Samulation YouTube Short - 40-50 s faceless explainers ("how is this legal / how does this really work") in the channel's house style - flat 2D stick-and-bean cartoon characters, led by the locked mascot (ginger Flame Spikes hair + gold "S" chain), acting inside a lit 3D world drawn to look hand-made (neon night streets, alleys, interiors), one-word captions, cross-dissolves on a camera that never stops. Covers GitHub setup, reference analysis, the YouTube agent skills (yt-script hooks and scripts, yt-package titles and thumbnails, yt-seo, retention, comments, audit, plan, viral research), the creator's own voiceover and voice profile, word timing, set building, animation, sound design, parallel rendering, frame-by-frame QA against the reference (target 95-100%), thumbnail, SEO kit and upload. Use for any new Samulation video, any request in this style, the mascot, channel art, or matching a reference short.
---

# Samulation Shorts: the house playbook (every future video)

You produce finished, upload-ready YouTube Shorts for the channel **Samulation**. Everything is made in code with free tools:
three.js 3D + Canvas2D ink drawing, captured frame-exact in headless Chrome, ffmpeg, faster-whisper, numpy sound.
No AI image/video generators, no paid APIs, no stock footage.

`SKILL` = this folder. **Read the file for the step you are on before doing it.**

| folder / file | what it is |
|---|---|
| `reference/01-setup-and-github.md` | environment, the GitHub repo, where everything lives, Antigravity install |
| `reference/02-reference-analysis.md` | how to break down a reference short to a measurable target (95-100% match) |
| `reference/03-script-and-voice.md` | topic choice, fact-checking, yt-script hooks, the creator's voice profile, word budget, loop endings |
| `reference/04-hero-character.md` | **the mascot**: how he is built, locked rules, every pose/mood/prop API, how to enhance him, avatars |
| `reference/05-style-bible.md` | every locked number: colours, lights, captions, edit grammar, camera |
| `reference/06-engine-and-sets.md` | the engine API, the set library, how to write a new set, props in hands, 2D overlays |
| `reference/07-shots-and-animation.md` | the shot list on word timings, shot recipes, worked example (the reference recreation) |
| `reference/08-sound.md` | sound effects, music bed, the mix |
| `reference/09-render-qa-deliver.md` | parallel render, frame-by-frame QA, delivery files |
| `reference/10-seo-thumbnail-upload.md` | titles + thumbnail (yt-package), description/tags (yt-seo), upload time, pinned comment, after-publish |
| `reference/11-quality-95.md` | the scoring rubric, honest current scores, and the exact upgrades that take a video to 95-100% |
| `reference/12-lessons-and-bugs.md` | every mistake already made, as rules |
| `engine/` | the production project (copy it per video). Its shots recreate the reference example |
| `hero/` | the mascot: sheet tool, hero sheet, pose sheet, avatar samples (smug / happy / shock) |
| `brand/` | channel profile photo 800x800 + banner 2560x1440 |
| `tools/` | setup check, word timing, SFX, music, mix, parallel render, thumbnail, reference-analysis tools |
| `youtube/` | 11 YouTube agent skills (yt-script, yt-package, yt-seo, …) + the creator's `voice.md` |
| `examples/reference-japan-gambling-loophole/` | **the worked example**: the reference video, its full analysis, our 13.75 s recreation + side-by-side + scores |
| `workflows/` | step-by-step runbooks (Antigravity workflows / slash commands) |

---

## 0. Non-negotiable rules
1. **Quality first.** The target is **95-100% match** with the chosen reference, scored per category (`reference/11`). Our approved
   baseline is the reference recreation in `examples/` (honest score ~65-70%). Never ship below it. Every new video must move
   at least one category up (`reference/11` lists how). Never claim a score you haven't measured side by side.
2. **The mascot is locked:** Flame Spikes hair + gold "S" chain + tube limbs + bean body (`reference/04`). Never redesign him
   unless the creator says so. Extras never get his hair.
3. **Original content.** Our own script, topic, voice (the creator records it), characters and sets. A reference video's
   audio, script and frames are for **private side-by-side tests only**, never published, never committed to a public repo.
   Signs use our own names (e.g. "STAR HALL"); product brands are only spoken, never drawn as logos.
4. **Facts:** every claim checked against 2+ reliable sources; drop any number you can't verify (e.g. an unconfirmed fine).
5. **No gore, no hate symbols, no real-person defamation.**
6. **Show progress:** send key frames and contact sheets while working; never send a frame you haven't looked at.
7. **Honest time:** quote render times from measured speed (2.9 s/frame/process on a 4-core CPU without GPU). The creator's
   time zone is **IST**. Say delays the moment you see them.
8. **Gates:** (a) script approved ("ship it") → (b) key frame per scene approved → (c) full render → (d) QA → (e) SEO kit.
   Never skip a gate. Every copy-ready block ends with **"Ship it, or change it?"**

## 1. The pipeline (one video ≈ 2-3 hours of work + ~30 min render)
```
 1 Topic + facts ─▶ 2 Hooks (5, scored) + script in the creator's voice ─▶ GATE: "ship it"
 3 Creator records VO (mp3) ─▶ 4 word timings (faster-whisper) ─▶ 5 shot list on the words
 6 sets: reuse/adapt from the library, write new ones ─▶ 7 key frame per shot ─▶ fix ─▶ GATE: frames OK
 8 sound: SFX cues on the words + music bed + mix (-14 LUFS)
 9 parallel render (3 parts) ─▶ join + mux ─▶ 10 QA: contact sheet every 0.5 s, read every cell, fix, re-render parts
11 thumbnail (clean frame + ≤3 words) + SEO kit (title scored, description, tags, upload time, pinned comment) ─▶ deliver
```

### Step-by-step commands (from a fresh copy)
```bash
bash SKILL/tools/setup.sh                                   # once per machine: node 22+, chrome, ffmpeg, python packages -> "All set."
cp -r SKILL/engine ~/proj/<short-name> && cd ~/proj/<short-name>
ffmpeg -i "<creator VO>.mp3" -ac 1 -ar 48000 data/vo.wav
HF_HUB_DISABLE_XET=1 python3 SKILL/tools/words.py data/vo.wav data/words.json --model small.en   # then fix split tokens (U.S., non-food, brand caps)
# write src/<set>.js files + the shots in src/main.js build()  (reference/06, /07)
SOFTWARE_GL=1 node tools/capture.mjs frames review/k "1.5,5,10"              # key frames, look at every one
python3 SKILL/tools/sfx.py data/cues.json data/sfx.wav --dur <len>            # cues on word frames (reference/08)
python3 SKILL/tools/music.py data/music.wav --dur <len>
bash SKILL/tools/mix.sh data/vo.wav data/sfx.wav data/music.wav data/mix.wav <len>
bash SKILL/tools/render_parallel.sh renders/final.mp4 3                       # ~30 min for 40 s on 4 cores
bash SKILL/tools/contact_sheet.sh renders/final.mp4 review/qa.jpg 0.5 9        # read every cell
QS='&nocap' SOFTWARE_GL=1 node tools/capture.mjs frames review/thumb "<t>"    # clean frame for the thumbnail
python3 SKILL/tools/thumbnail.py review/thumb/t<t>.jpg thumb.jpg "THE" "LOOPHOLE"
```

## 2. What makes these shorts work (from the reference, ~1 crore views)
1. **Paradox in the first 3 s** ("X is illegal, yet it's everywhere"). 2. **Deepen the mystery before explaining** (police walk
past, nobody arrested). 3. **"You" journey**: the viewer lives the loophole step by step. 4. **Every line is a picture**:
one idea per shot, a new shot ~every 3-4 s, the camera never stops. 5. **The reveal is a clever system**, not a trivia fact.
6. **Punchline written on a prop** (clipboard "GAMBLING: NONE ✓"). 7. **Loop**: the last word flows into the first.
8. **Lean**: no intro, no channel name, no subscribe ask. Topic test: is there a rule + a thing everyone sees + a hidden trick?

## 3. Defaults
1080x1920 · 30 fps · 40-50 s · creator's VO at **2.61 words/s → 105-125 words** · captions one word at a time ·
cross-dissolve ~5 frames · -14 LUFS · H.264 CRF 17 · upload Fri 12:30 PM ET = 11:00 PM IST (until channel data exists).
