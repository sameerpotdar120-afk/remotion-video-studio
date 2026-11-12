# 02: Reference analysis (defines what "95-100%" means)

Worked example: `examples/reference-japan-gambling-loophole/` (the video, `REFERENCE_ANALYSIS.md`, every sheet and crop, the
word timings, our recreation and the side-by-side). Repeat this for any new reference the creator sends.

## 1. Commands
```bash
bash SKILL/tools/analyze_ref.sh ref.mp4 ana 4            # probe, 4 fps timestamped sheets, 1 fps stills, audio, cut curve (cuts.tsv)
ffmpeg -i ref.mp4 -vf "fps=2,scale=180:-1,drawtext=text='%{pts\:hms}':x=3:y=3:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=9x5" ana/s2_%02d.jpg
HF_HUB_DISABLE_XET=1 python3 SKILL/tools/words.py ana/ref_audio.wav ana/words.json     # transcript + pace (private use only)
python3 SKILL/tools/cuts.py ref.mp4 | grep '^#'          # hard cuts vs camera moves vs static frames
```
Read **every** sheet. Then: full-res grids of 4 stills per scene; crops of characters' limbs/faces/hands; caption crops at swap
frames; first vs last frame (loop?); frames around every transition (strip of 4 frames 2 apart).

## 2. The target sheet (fill all of it)
- **Specs**: resolution, fps, duration, loudness (`ffmpeg -af ebur128`), words/s, pause lengths, music/ambience presence (pause RMS
  only 5-7 dB under speech = constant bed).
- **Story beats** with times (hook paradox → mystery → "you" journey → reveal → payoff on a prop → loop).
- **Edit grammar**: hard cuts count (target 0), transition type and length (the reference: 4-6 frame cross-dissolves on moving
  camera), shot length (reference ~3.7 s), static-frame % (reference 2.7%).
- **Shot list**: per shot: time, location, framing, camera move, who acts and how, the word each change lands on.
- **Look**: world (3D geometry drawn like 2D: ink edges, hand-drawn textures, dense props with readable text), lighting (night
  blue/violet + warm practicals + neon; warm interiors), DOF, bloom, wet reflections.
- **Characters**: build (bean body, round head, tube limbs), outline weight, how they act (mood changes per beat).
- **Captions**: words per caption, font feel, size (text height ≈ 55 px at 1080 wide), y position (glyph tops ≈ 1323, 69%), outline,
  shadow, case.
- **Colour boxes**: sample 3-6 regions per scene type with `tools/colormatch.py` for the match loop.

## 3. What the example reference measured
1080x1920 · 30 fps · 45.1 s · -14.3 LUFS · 161 words = 3.58 w/s · 0 hard cuts · 4-6 frame dissolves at 2.1, 4.7, 10.5, 13.9, 16.4,
24.0, 27.0, 30.5, 37.2, 40.8, 43.6 s · 12 shots · 2.7% static frames · captions one word, white heavy rounded sans, black outline
+ soft shadow, glyph top y ≈ 1323 · loop: last frame same alley as first, last word "gambled." → first word "Gambling".
Why it worked (views ≈ 1 crore, per the creator): see SKILL.md section 2.

## 4. Turning it into OUR video
Copy the **grammar** (structure, pacing, transitions, look, caption style), never the script, story, characters or sign names.
Write the shot list for our script with the same rhythm, then score our key frames against the matching reference frames
(`reference/11`).
