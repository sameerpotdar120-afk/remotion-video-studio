---
name: samulation
description: The complete Samulation production skill - how to study a reference short frame by frame (30 fps contact sheets, phase-correlation camera tracking, word-timed transcripts, loudness/SFX onsets, multi-agent topic analysis), the measured rule book from 25+ reference shorts and the train case study, the story-script formula ("You see," pivot, paradox hook, callback ending), the locked Flame Spikes + gold S chain mascot, the 2D-characters-in-a-lit-3D-world look, physics-correct mechanisms synced to the voice-over word by word, and BOTH engines - three.js inside Remotion and Blender (EEVEE, procedural worlds, hero cards with IK grips, frame-range rendering on helper sessions). Use for any new Samulation video, analysing a reference video, "make it like this short", "clone this style", building a Blender or three.js shot, physics/mechanism shots, render planning, or when the creator says "use the samulation skill".
---

# Samulation: the full production skill

You make finished, upload-ready vertical shorts for the channel **Samulation**: 45-90 s stories where flat 2D cartoon
characters act inside a lit 3D world, every action lands on the voice-over word, and the mechanism of the story
(why the bridge fell, why rails need gaps, how the rocket cart fires) is shown physically correct on screen.
Everything is made in code with free tools. No AI image/video generators, no stock footage, no paid APIs.

`SKILL` = this folder. Read the file for the step you are on before doing it. Numbers in these files were measured, not guessed.

## 0. Non-negotiable rules (the creator's standing orders)
- **Mascot locked:** ginger "Flame Spikes" hair (#e8742c) + gold rope chain with an "S" medallion. Clothes may change per
  video. Ask before naming him. Rig: `card/toon/char.js` (`HERO`).
- **Quality first, honestly scored.** Show frames as you go (first frame → 10 s preview → full). Never send unchecked frames;
  always list weak spots with timestamps and a % score against the reference.
- **Copyright-free everything:** original scripts and characters, our own code-made worlds, CC0/CC-BY only if a model is
  ever needed, synthesized SFX and music. Reference videos/audio are **private study only, never committed** (the repo is
  public): no frames, no transcripts, no quoted lines from them in any committed file.
- **Times in IST.** Quote finish times from measured render speed, not hope.
- **"Stop"/"wait" = stop immediately** (kill renders, helpers idle), then wait.
- Captions: plain white one-word captions (short words ride with the next), on the torso band.
- Output: 4K 2160x3840. Frame rate per creator (60 for #1-#3; **30 for #4**). Commit trailer and branch rules: see
  `reference/12-render-qa-deliver.md`.
- Helpers: when the creator asks for N helpers, use exactly N plus yourself, and watch them.

## 1. The pipeline (gates in bold: wait for the creator at each)
```
reference video(s) ──▶ 30 fps study (tools + agents) ──▶ rule book / case study      reference/01-04
topic + facts ──▶ yt-script (5 hooks scored) ──▶ **script approved** ──▶ ElevenLabs/own VO   reference/05
VO ──▶ speed fix (atempo) ──▶ word timings (faster-whisper) ──▶ shot list keyed to words        reference/05, 08
look-dev ──▶ **first rendered frame (4K)** ──▶ fixes                                          reference/06-07, 09-10
animate (camera, acting, physics) ──▶ **10-12 s preview** ──▶ fixes                           reference/08-10
measure render cost ──▶ split frame ranges across helpers ──▶ join + SFX + music + captions   reference/11-12
QA sheet (every 0.5 s) ──▶ **deliver** with honest weak spots ──▶ SEO kit + thumbnail          reference/12-13
```

## 2. File map
| file | what it gives you |
|---|---|
| `reference/01-method-from-the-tutorial.md` | the method from the long tutorial video: measure don't opine, 30 fps sheets, the gap analysis, agent teams that own files, still-frame QA, the corrections it found |
| `reference/02-measurement-toolkit.md` | exact commands: download, transcribe, 30 fps contact sheets, per-frame luma/sat/cut/camera fit, loudness, spectrogram, SFX onsets, cut↔word offsets |
| `reference/03-rulebook-25-refs.md` | **the measured rule book** (VO sync, camera, colour, world, characters, physics/FX, sound, script). Full numbers in `reference/study25/` |
| `reference/04-case-study-train-reference.md` | the long-form story reference (65 s, 3.36 w/s): structure, heat-map mechanism, timing, sound, what we took |
| `reference/05-script-voice-timing.md` | story formula, hook scoring (yt-script), fact-checking, ElevenLabs paste-ready rules and settings, speed-up without pitch change, word timing |
| `reference/06-look-and-characters.md` | colour/light presets, the toon look, the mascot and the cast system (hats, moods, IK grips), card rules |
| `reference/06b-mascot-full-spec.md` | **the mascot in full**: locked identity table (head, Flame Spikes hair, gold S chain, bean body, limbs, face), every pose/mood/prop API, sheet tool, avatars |
| `reference/07-engine-threejs-remotion.md` | the three.js-in-Remotion engine (video #3), post chain, what it is best at |
| `reference/08-shot-design-and-vo-sync.md` | turning words.json into shots/events, frame offsets, dissolves, camera glides, worked shot list |
| `reference/09-physics-and-mechanisms.md` | physics recipes: ballistic sparks, swing arcs, rockets with drag, rail thermal expansion + sun kink, rolling wheels and rods, smoke, impact geography |
| `reference/10-blender-pipeline.md` | **the Blender engine**: install headless, EEVEE on software GL, procedural world modules, hero cards, 3-pass animation driver, performance traps (measured) |
| `reference/11-render-economics-and-helpers.md` | cost per frame, how to estimate, scale+upscale, splitting across helper sessions, 100 MB push limit, recovery |
| `reference/12-render-qa-deliver.md` | join, captions, mix to -14 LUFS, QA contact sheet, delivery report, git rules |
| `reference/13-seo-thumbnail.md` | yt-package titles (scored), thumbnail from a clean frame, description/tags, upload time, pinned comment |
| `reference/14-lessons-and-bugs.md` | every mistake made so far, as rules (three.js + Blender + workflow) |
| `tools/` | measure_ref.py, transcribe_ref.py, contact sheets, cuts, words, sfx, music, mix, thumbnail, blender_render_part.sh |
| `blender/` | working Blender engine: world.py (track/terrain/mesas/sky), town.py, loco.py, anim.py (shots), scene.py (stills) |
| `card/` | hero/cast card renderer (headless Chromium → transparent PNG): card.html, extras.js (hats, mustache), toon/ rig |
| `youtube/` | yt-script, yt-package, yt-seo, yt-retention, yt-comment, yt-plan, yt-viral, yt-audit… + `voice.md` |
| `hero/` | **the mascot**: hero-sheet (body + 4 expressions), 8-pose sheet, avatars (smug/happy/shock), `sheet-tool/` to re-render sheets, Blender example frame |
| `brand/` | channel profile 800x800 + banner 2560x1440 |

## 3. Which engine?
| need | engine |
|---|---|
| painted toon world, inked props, fast iteration, 60 fps, many characters | **three.js in Remotion** (`reference/07`) |
| richer lighting, real terrain/canyons, metal, smoke, mechanisms built like the real thing, 30 fps | **Blender EEVEE** (`reference/10`) |
Both use the same hero card rig and the same rule book. Measure one frame's render time before promising anything.

## 4. The ten rules that matter most (from all studies)
1. Every visible change is an event keyed to a **word**, landing 0-4 frames after its onset (anticipation from -6 f).
2. The camera never stops: push-ins 0.25-0.5 %/frame, glides of 20-40 f with eased ends, dissolves on sentence starts.
3. Show the mechanism physically: whole machine first, then the moving part; colour the invisible quantity (heat, force).
4. Hook = a paradox/odd act in one sentence; "You see," pivots into the reason; the ending calls back the hook.
5. No pure black; shadows are colours; saturated sky; faces near white.
6. Characters: flat cards lit by the world, casting shadows, hands sitting on real 3D grip points.
7. One hero explosion/disaster per video, at the climax.
8. Sound: -14 LUFS, voice on top, continuous bed ~20 LU under, sparse SFX on action words.
9. Measure, never eyeball: contact sheets at 30 fps, numbers in tables, side-by-side with the reference.
10. Check still frames before rendering video; render cost is measured on a real frame, at real settings.
