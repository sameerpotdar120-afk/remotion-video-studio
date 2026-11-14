---
description: Make a new Samulation short end to end (script -> VO -> sets -> render -> QA -> SEO kit)
---
Follow the samulation-shorts skill (SKILL.md) exactly. Stop at every gate and wait for the creator.
1. Read SKILL.md, then reference/03-script-and-voice.md. Ask for the topic (or propose 3 using the topic test).
2. Check every fact against 2 sources. Write 5 hooks, score them with youtube/yt-script/hookscore.py, keep the top 2.
3. Write the script at 2.61 words/s (105-125 words, loop ending, [ON SCREEN] per line). Show it. Wait for "ship it".
4. Ask the creator to record the VO. Convert it to data/vo.wav, run tools/words.py, fix split tokens.
5. Read reference/04-hero-character.md, 05-style-bible.md, 06-engine-and-sets.md, 07-shots-and-animation.md. Copy engine/ to a new project.
6. Write the shot list on the word times, then the sets and shots. Render one key frame per shot, fix, send a frame sheet. Wait for OK.
7. Read reference/08-sound.md: cues.json, sfx.py, music.py, mix.sh (-14 LUFS).
8. Read reference/09-render-qa-deliver.md: render_parallel.sh (tell the finish time in IST), contact sheet QA, fix, deliver.
9. Run /seo-kit. Score the video with reference/11-quality-95.md and report the table honestly.
