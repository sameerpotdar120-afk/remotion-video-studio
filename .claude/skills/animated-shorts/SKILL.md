---
name: animated-shorts
description: Make viral animated Shorts (2D cartoon characters in a 3D world) entirely in code with three.js + Remotion, a free Kokoro voice and code-made music. Clone the style of ANY animated channel by measuring it, write the story, voice it, build it, check stills, render a 9:16 Short and a 16:9 version, and package it. Use when the user says "download their shorts", "measure the style", "turn this into a skill", "give me ideas", "write the script", "make the voice", "build the video", "make it yours", "make the long version", "package it", or "something looks off in shot N".
---

# Animated Shorts (free skill)

Everything is made on this computer: no AI video generator, no paid voice, no stock music.
- **Pictures:** three.js worlds + drawn 2D characters, rendered by Remotion (`src/engine/`).
- **Voice:** Kokoro (`scripts/voice.mjs`), free, runs locally, Apache-2.0 licence (fine on a monetized channel).
- **Music + sound:** made in code (`scripts/sound.mjs`).
- **Captions:** one or two words at a time, timed to the voice by `voice.mjs` (each word is also spoken alone and matched to the line, so no paid transcription is needed).
- **Measuring:** `scripts/measure.py` uses ffmpeg if you have it, otherwise the copy that comes with Remotion.

Always work inside this project folder. One episode = `episodes/epN/` + `src/epN/`. Start a **new chat for every new video** (one video fills a lot of memory).

## The commands

### 1. "Download their 20 most popular Shorts from <channel link>"
`yt-dlp --flat-playlist -I 1:60 --print "%(view_count)s %(id)s" "<link>/shorts"`, sort by views, take the top 20, then
`yt-dlp -f "bv*[height<=1280][ext=mp4]" --write-auto-subs --sub-format json3 --sub-langs en -o "ref/<channel>/%(id)s.%(ext)s" <ids>` (picture only is enough to measure; the subtitles give the words per second).
These are **only for studying**. Never post them, never use their frames in a video.

### 2. "Measure the style"
Run `python scripts/measure.py ref/<channel>`. Then **look at every contact sheet** in `ref/<channel>/measure/` (30 fps, 60 frames per sheet) and read `numbers.json`. Don't describe the video, measure it:
- **Pacing:** average shot length, cuts per minute, how many seconds before the first cut.
- **Camera:** does it glide (how many frames does a move take), push in, orbit, go low? Count it on the 30 fps sheets.
- **Light + colour:** shadow colour (hue + RGB from numbers.json, never "dark"), highlight colour, saturation, how much pure black (usually almost none).
- **Ink:** are there black outlines on the 3D world, or only on the characters? How thick, relative to the frame width?
- **Characters:** head height as a share of the whole body, limb thickness relative to the head, hats, faces, how they move.
- **Depth:** is the background soft? How soft?
- **Captions:** words at a time, font weight, outline, position (% from the top).
- **Voice + script:** words per second, first line (a paradox, no intro), where the pivot comes ("You see…"), the twist on the last line, tense (present or past).
Write it all into `styles/<channel>.md` with the numbers. Every rule must be a number or a yes/no a picture can be checked against.

### 3. "Turn this into a skill"
Create `.claude/skills/<channel>-style/SKILL.md` that says: use the animated-shorts workflow, with the look in `styles/<channel>.md`, and lists the exact engine settings that produce it (the `Look` values: sun, hemi, fog, exposure, aperture, ink, warm/cool, saturation; caption size and position; voice speed; shot length). Test it by building one still of a sample shot and comparing it with a frame from the channel side by side. Fix the numbers until they match.

### 4. "Give me 10 ideas" (or use the master prompt in claude.ai)
Ten true, strange, visual stories that fit the channel. For each one, **search YouTube** for the topic and write down the biggest Short and long video on it. If a Short already has millions of views on the same story, drop it (someone told it already). Pick one with a clear twist.

### 5. "Write the script"
Write `episodes/epN/story.md` in the measured style:
- First line: a paradox or surprising fact, no intro, no "today we'll…".
- Escalate, then pivot with "You see…" to the real reason, then the payoff, then a twist on the last line that loops back to the first.
- Match the channel's measured pace (Ricks Clips: about 3.7 words per second, roughly 200–250 words for a 60-second Short). Set the voice speed so `timing.json` lands on it.
- **Fact check every claim** and put the sources in a table at the bottom of story.md. If a fact is "allegedly", say so or leave it out.
Split it into `episodes/epN/shots.json`: one line of voice per shot (`{"id", "text", "say"?}`; `say` = how numbers are spoken, e.g. "eighteen_seventy-five" for "1875").

### 6. "Make the voice"
`node scripts/voice.mjs epN <voice> <speed>`. Default `am_michael` at speed 1.05. Writes `public/epN/voice.wav` and `episodes/epN/timing.json` (every shot and every word). Listen to it. If a word is wrong, change its `say` and run it again.

### 7. "Build the video"
1. Write `src/epN/sets.tsx` (the places), `src/epN/cast.ts` (the characters) and `src/epN/shots.tsx` (one entry per shot: look, camera from/to, focus distance, who stands where). Copy `src/ep1/` as the example. Use the kit in `src/engine/kit.tsx` (Box, Cyl, Roof, House, Window, Lamp, Cab, Cart, Fire, Sign, Snow…) and add new pieces there when a story needs them.
2. **Check stills before rendering:** `node scripts/stills.mjs <ids>` and look at every still. Check: is the subject in frame, is a face covered, is the camera inside a wall, is anyone hidden behind someone else, does the shot show what the line says, is it too dark or too yellow. Fix and check again.
3. Make the sound: write `episodes/epN/sound.json` (ambience per shot + sound effects at the moments things happen), then `node scripts/sound.mjs epN`.
4. Render: `npx remotion render src/index.ts Short episodes/epN/out/episode_N.mp4 --codec=h264 --crf=18`.

### 8. "Make it yours"
Copying a channel exactly makes you the 50th copy. Add your own main character to `cast.ts` (describe hat, coat, colours, hair, moustache…). Characters are drawn in code, so they look exactly the same in every shot and every video. Change the palette or the light a little in your style file.

### 9. "Make the long version"
Same characters and sets, 16:9 (`Long` composition). A long video needs a longer story: write a 6–10 minute script with the same formula (several mini-stories or one deeper story), more shots, then render `Long`. Shorts bring people in, long videos earn more per view.

### 10. "Package it"
Write `episodes/epN/upload.md`: a curiosity title under 60 characters (no clickbait the video doesn't pay off), a two-line description with the sources, 5 tags, and the first frame to use as the cover.

## Six things that make it look premium (check every shot)
1. **Signs and labels live in the world** (signs, posters, maps, stamps in the 3D scene), never flat on top. Ink outlines only where the channel has them: measure it (Ricks Clips: lines on the characters, none on the world, so `ink: 0`).
2. **Shadows are never black.** Tinted to the measured colour (Ricks Clips: blue-violet), from the hemisphere light's ground colour and the grade (`cool`).
3. **The camera never jumps.** Every shot glides from one pose to another (`cam.from` → `cam.to`), with a little sway.
4. **Big round heads, thin limbs:** the head is about a third of the height, arms and legs are thin black lines, hands are small round mittens.
5. **A soft background**, so you only look at the character (`focus` = distance to the subject, `aperture` 0.35–0.6).
6. **Check stills before you render** (step 7.2). It catches a camera stuck in a wall before you waste a render on it.

## If something breaks
- Out of usage: wait for the reset, then type "continue".
- The skill isn't found: you opened Claude Code in the wrong folder.
- A shot looks wrong: say exactly what's wrong ("the tree covers his face in shot 7") and fix only that shot, check its still, render again.
- Red text in the terminal: read it, fix the cause, don't just retry.
