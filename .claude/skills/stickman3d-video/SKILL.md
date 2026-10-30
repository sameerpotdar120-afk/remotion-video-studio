---
name: stickman3d-video
description: >-
  The studio's core editing style and end-to-end workflow: rebuild or create a vertical short in the Stickman3D look
  (flat drawn stickman characters in a soft-lit procedural 3D world, one-word captions, continuous camera moves),
  all visuals made in code with no AI images, rendered at 2160x3840 60 fps and delivered as one GitHub release link.
  Use whenever the user sends a reference video to re-edit "in this style", asks for a new story short, says "same
  style as the horse video", or asks to render or deliver a Stickman3D episode.
---

# Stickman3D video workflow

This is the default house style for story shorts.

- **Read first:** the style rules in `docs/styles/stickman3d/STYLE.md`.
- **Worked example:** `src/horse/Horse.tsx`, analysed in `docs/horse-ref/ANALYSIS.md`.
- **Code:** the kit in `src/styles/stickman3d`; the scripts in `scripts/stickman3d`.

**Ground rules for every episode:**
- Visuals come only from code: drawn characters and animals, procedural 3D sets. Use no ChatGPT or stock images
  unless the user asks.
- Use the reference's audio unchanged unless the user gives new voice-over, effects or music.
- Characters are identical in style to the core cast.
- The colour grade is our own, never the reference's.
- Deliver 2160×3840 at 60 fps through a private GitHub release link.
- Show stills and previews as you go, and say plainly what is done and what isn't.

## 1. Intake and analysis (don't rush; this sets the quality)

1. Probe the reference with `ffprobe`. Extract a lossless H.264 copy of the video (`ref.mp4`) and the audio as
   48 kHz WAV, then put the audio at `public/<slug>/audio.wav`.
2. Find cuts and transitions:
   `python3 -I scripts/stickman3d/analysis/shots.py ref.mp4`. Most shorts animate on twos, so read runs of changes.
3. Make contact sheets at 10 fps: `scripts/stickman3d/analysis/sheets.sh ref.mp4 <dir>`. Read every sheet. Log each
   shot's frames, framing, camera move, transition, acting beats and props. Pull full-size frames for close detail:
   faces, captions, set dressing.
4. Build the caption track:
   `OMP_THREAD_LIMIT=1 python3 -I scripts/stickman3d/analysis/captions_ocr.py ref.mp4 src/<slug>/captions.json`.
   Then check it by hand:
   - fix OCR slips;
   - add words the change detector merged (equal-width words);
   - crop a few words to check punctuation and case.
5. Write `docs/<slug>-ref/ANALYSIS.md`:
   - file specs;
   - the style seen in the reference;
   - a frame-exact shot table (frames, shot, camera, transition);
   - what is kept versus what is new.

## 2. Build

1. Scaffold the episode: `scripts/stickman3d/new_episode.sh <slug> <Name> <frames>`. This creates
   `src/<slug>/Episode.tsx`, registers `<Name>-4K` in Root, and creates `public/<slug>/`.
2. Write each shot as a component in global frames inside `<Seg a b fi fo>`:
   - a camera keyframe list (`CamKey[]`) and a set;
   - `Figure`s with poses keyed to caption frames (`ramp`, `kv`, `talk`, `walkTo`, `shrug`, `point`, `cheer`).
3. Reuse core sets and looks first. Anything new and reusable goes into the core kit, not the episode:
   - looks in `CAST`;
   - set pieces in `world.tsx` and `props.tsx`;
   - sets in `sets.tsx`;
   - animals in `animals.ts`.
4. For CJK text, use `python3 -I scripts/stickman3d/hanzi_strokes.py "<chars>" src/<slug>/hanzi.generated.json`
   and the `Hanzi` component.
5. Before composing shots, check new looks on the cast sheet (composition `Horse-CastSheet`).

## 3. QA against the reference (before any full render)

- Render stills at quarter resolution:
  `COMP=<Name>-4K node scripts/stickman3d/stills.mjs <dir> 0.25 <frames...>`. Pick about 30 frames spread across all
  shots.
- Tile ours and the reference side by side with ffmpeg and compare framing, scale and staging. Fix, then re-render.
- Checklist:
  - [ ] Each face sits in the same frame area as in the reference.
  - [ ] No post or wall crosses a face or hides the subject of the line.
  - [ ] Gestures land on their words.
  - [ ] The close-up crop holds the gesture arm.
  - [ ] The caption is readable on every background.
  - [ ] The grade differs from the reference.
- Commit and push before rendering. Workers render the pushed revision.

## 4. Render (never share a checkout or temp folder between workers)

- **Worker command:** `scripts/stickman3d/render_4k.sh <Name>-4K <slug> <first> <last> <worker>`. It renders in
  150-frame pieces in its own worktree and temp folder, and pushes each piece to `render/<slug>-<worker>`.
- **Fan-out:**
  - When the session can start separate cloud machines (`create_session` from claude-code-remote), give each helper
    a frame range in its *initial prompt*, for example 25 helpers × 150 frames.
  - Agents with `isolation: "remote"` ran on the same machine in this environment. Check `nproc` and `ps` before
    trusting them as parallel capacity.
  - Without separate machines, run one detached worker with all CPUs:
    `setsid nohup scripts/stickman3d/render_4k.sh … > log 2>&1 &`. Watch it with a Monitor loop on `SEGMENT`,
    `FAILED` and `DONE`.
- **Fixes during the render:**
  1. Commit the fix.
  2. Let the main pass continue.
  3. Re-render the affected pieces as `x1`, `x2`, and so on.
  4. Chain worker, then redos, then release in one detached script so nothing waits on you.
- **Spot-check:** pull frames from each pushed piece as it lands (`git show <branch>:renders/<slug>/seg_NNNNN.mp4`).

## 5. Deliver

1. Run `scripts/stickman3d/make_release.sh <slug> <frames> public/<slug>/audio.wav <File_Name_4K60.mp4> "<Title · 4K 60fps>"`.
   It joins the pieces, using `x*` redos first, adds AAC audio and checks the frame count. It then uploads the parts
   to `release/<slug>`, where a workflow publishes release `<slug>-v1`.
2. Confirm the release asset's sha256 digest matches `out/<slug>/release/sha.txt`.
3. Send the user the download link. Mention that it's private, so they must be signed in to GitHub.
4. Keep the branch clean: commit and push code, and never push to another branch without permission.
