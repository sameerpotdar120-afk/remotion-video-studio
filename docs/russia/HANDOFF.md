# Russia video — handoff to a new chat

Read this whole file first. It tells you where everything is and what is left to do. The user's bar is
**studio level**: nothing cheap, sloppy or "AI-looking", no synthetic SFX, and real copyright-free audio
from free sites. Never share the GitHub repo link publicly. Commits carry no model IDs.

## Where things are

- **Main branch for this work:** `ccr-b793949a-9xc6cy`. Fetch it first. If your session has a different
  designated branch, merge `origin/ccr-b793949a-9xc6cy` into it and keep working there.
- **Composition:** `Russia-4K`, 3840×2160 @ 60 fps, 89 542 frames (24:52). The audio-only composition
  is `Russia-Audio`. Assembly is in `src/russia/RussiaFinal.tsx`.
- **Scenes:** `src/russia/scenes/S00Open.tsx`, `C01Rus` … `C10Today`, `C11Payoff`. Chapter frame ranges:

  | Scene file | Frames |
  |---|---|
  | S00 | 0–2607 |
  | C01 | 2608–13071 |
  | C02 | 13072–20978 |
  | C03 | 20979–28652 |
  | C04 | 28653–34619 |
  | C05 | 34620–42354 |
  | C06 | 42355–48993 |
  | C07 | 48994–56611 |
  | C08 | 56612–64562 |
  | C09 | 64563–72513 |
  | C10 | 72514–83402 |
  | C11 | 83403–89541 |

- **Kit:**
  - `src/russia/kit/` holds `core.tsx`, `Peg.tsx`, `cast.tsx`, `scene.tsx` and `devices.tsx`.
  - `src/russia/map/RMap.tsx` is the map component.
  - `src/russia/three/` holds the 3D globe and Sputnik.
- **Assets:**
  - The user's 181 images are in `public/russia/assets/` and listed in `src/russia/kit/assets.generated.json`.
  - Character rigs (face, shoulders, sleeve colour) are in `src/russia/kit/rigs.generated.json`.
  - `cards/card_alexander_ii` is still missing, so a placeholder is shown.
- **Voice-over:** `public/russia/vo/`, with timings in `src/russia/vo/video.json`. Use `at(p, phrase)` and
  `para(p)` from `src/russia/vo/timeline.ts`.
- **Docs:** `docs/russia/POLISH_GUIDE.md` is the quality checklist that every scene must pass.

## Done (on `ccr-b793949a-9xc6cy`)

- **Arms:** coat-coloured sleeves, with gloves anchored by the cuff and pointing along the sleeve.
- **Characters:** a soft ground contact shadow under each one.
- **Maps:**
  - A 3D tilted board with perspective, haze on the far edge and a vignette.
  - Territories are extruded, bevelled slabs with cast shadows.
  - The shatter breaks into lifted slab shards and is now fast.
- **Effects:**
  - Captions have a sticker-style outline, so they read on any background.
  - Fire is particle-based, with smoke and sparks.
  - Stamps have a paper backing and a Devanagari font.
- **Globe:**
  - The GL canvas renders at 2/3 resolution for speed.
  - A texture-load race that left the globe untextured is fixed.
- **Polish:** C11 polish is merged.

## Left to do, in this order

### 1. Merge the chapter polish branches

Branches: `polish/russia-s00`, `polish/russia-c01` … `polish/russia-c10`. `c11` is already merged.

Each branch only touches its own scene file. Merge each one into the main branch when its helper has
finished. Check with `list_sessions` (titles start with "Russia polish"); the helpers report a change list
when done. After merging, run `npx tsc --noEmit -p .` and render a few stills with
`node scripts/russia/stills.mjs <outdir> 0.5 <frames…>` to spot-check.

### 2. Replace ALL sound effects with real recorded copyright-free sounds

The current files in `public/assets/sfx/*.wav` are synthesised. The user rejected them.

Sources (all need network access, see the "Before you start" section below):

- Pixabay sound effects: free licence, no attribution needed.
- Freesound: **CC0 only**; filter on license "Creative Commons 0".
- Kenney.nl audio packs: CC0.
- BigSoundBank: free of rights.

Keep the **same file names** so no code changes. Normalise each file the same way the old ones were.
Trim silence, add short fades, 48 kHz stereo WAV. Keep peaks similar so the mix the user approved stays
the same. Uses per file, most used first:

| Uses | File | What it should be |
|---|---|---|
| 27 | stamp_slam.wav | rubber stamp hitting paper/desk |
| 16 | impact_boom.wav | cinematic boom/impact |
| 12 | sting_crown.wav | short regal brass/bell sting |
| 12 | pop.wav | cartoon pop / bubble pop |
| 11 | sub_drop.wav | cinematic sub drop |
| 10 | whoosh_soft.wav | soft air whoosh |
| 10 | sting_hit.wav | orchestral hit |
| 10 | pop_low.wav | deep pop |
| 9 | tick.wav | clock tick |
| 8 | whoosh_big.wav | big whoosh |
| 8 | sting_shimmer.wav | magical shimmer |
| 8 | bell_toll.wav | church bell toll |
| 6 | whoosh_fast.wav | fast swish |
| 6 | paper_tear.wav | paper tearing |
| 6 | coin.wav | coin drop/clink |
| 6 | bell_ding.wav | small bell ding |
| 5 | timpani_roll.wav | timpani roll |
| 5 | riser.wav | tension riser |
| 4 | thud_soft.wav | soft thud |
| 4 | pop_high.wav | high pop |
| 4 | pluck_up.wav | rising pluck |
| 4 | pluck_down.wav | falling pluck |
| 4 | paper_swish.wav | paper swish |
| 4 | musket_volley.wav | musket volley |
| 4 | heartbeat_low.wav | low heartbeat |
| 3 | timpani_hit.wav | timpani hit |
| 3 | paper_slide.wav | paper slide |
| 3 | glass_break.wav | glass break |
| 2 | snare_roll.wav | military snare roll |
| 2 | pen_draw.wav | pen/marker scribble |
| 1 | whoosh_down.wav | descending whoosh |
| 1 | sputnik_beep.wav | Sputnik radio beep (the real 1957 recording is public domain) |
| 1 | rocket.wav | rocket launch |
| 1 | crumble.wav | rubble crumble |
| 1 | click_soft.wav | soft click |

Also replace these in the same folder: `musket_shot.wav`, `musket_cock.wav`, `firework.wav`,
`rewind_tape.wav`.

Write `docs/russia/AUDIO_CREDITS.md` listing every file with its source URL and licence.

### 3. Replace the background music with real copyright-free tracks

Sources: FreePD (CC0) or Pixabay Music.

- `public/russia/music/bgm.mp3` must cover the whole timeline, 24:52.
- Pick one track per chapter mood:

  | Mood | Chapters | Feel |
  |---|---|---|
  | dark | intro | tense |
  | folk | C1, C2, C5, C6 | Russian folk |
  | dark | C3, C4, C9 | grim |
  | march | C7 (1812) | military march |
  | sad | C8 (last Tsar) | |
  | modern | C10 | |
  | epic | payoff | |

- Chapter card frames (60 fps) are in `video.json` → `chapters[].card`.
- Join the tracks with ffmpeg crossfades at the chapter cards. Loop or trim each one to fill its section.
- Run `loudnorm` to I=-36 LUFS, the same level as now, which the user approved. Ducking is already in
  `RussiaFinal.tsx`.
- `scripts/russia/make_bgm.py` holds the section plan. Its synth part is obsolete.

### 4. Rebuild the soundtrack

Run each half in the background and wait for the "RENDERED part_…" line:

```bash
bash scripts/russia/render_audio.sh 0 44999
bash scripts/russia/render_audio.sh 45000 89541
cd renders/russia-audio && printf "file part_0.wav\nfile part_45000.wav\n" > list.txt
ffmpeg -y -f concat -safe 0 -i list.txt -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k soundtrack.m4a
```

The result must last 1492.4 s.

### 5. Final 4K render with helpers

Benchmarks:

- About 0.6–0.85 s/frame at 4K on a 4-core helper.
- About 2 s/frame for globe frames: S00 0–480, and parts of C04, C10 and C11.

Start 15 or more helpers with `create_session`. **Put the job in each helper's initial prompt.**
Helpers refuse jobs that a peer session sends later, because they treat them as outside their scope.

Example prompt: "You are a render worker. In the repo (branch ccr-b793949a-9xc6cy), run in the
background `bash scripts/russia/render_4k.sh <A> <B> k<N>`. It renders final 4K segments (600 frames)
and pushes each to branch render/russia-4k-k<N>. It is resumable, so re-run it until it prints
WORKER k<N> DONE. Don't edit source files."

Ranges: steps of 6000 frames (0–5999, 6000–11999, … 84000–89541).

**The user wants to watch progress.** At least every few minutes:

1. Fetch new segments (`git ls-remote origin 'refs/heads/render/russia-4k-*'`).
2. Extract a few frames from each new segment with ffmpeg.
3. Build a labelled contact sheet and send it with `SendUserFile`.

### 6. Assemble and deliver

1. Concat all `renders/russia-4k/seg_*.mp4` from every `render/russia-4k-k*` branch, in order, by stream
   copy.
2. Mux `soundtrack.m4a` and check the duration is 1492.4 s.
3. Deliver the file privately, as a GitHub release asset or with `SendUserFile` for small previews.
   Never post the repo link publicly.

## Lessons learned (avoid repeating)

- Don't `pkill -f` with a pattern that matches your own shell command.
- Don't delete `/tmp/remotion-webpack-bundle-*` while any render is running. It kills that render.
- Heavy SVG paths re-rasterise every frame and are slow. Draw big territories once into a canvas
  (`drawSlab` / `FillRaster` in `RMap.tsx`).
- `set -e` + `pipefail` + `ls` with a glob that matches nothing will silently abort a script. Use
  `|| true`.
- The Chrome headless shell lives at either
  `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell` or
  `.../chrome-headless-shell-linux64/chrome-headless-shell`.

## Kit improvements requested by the polish helpers (do these before the 4K render)

- **`BigNumber`** (`core.tsx`): add a `subSize` prop. The sub-caption is tiny at 4K, so the default should
  be about 2× larger.
- **`LoopWheel`** (`devices.tsx`): give labels a max width and wrap them, because long labels run
  off-screen at a larger radius. The pointer hub also covers the centre "डर" text.
- **`PeopleGrid`** (`devices.tsx`): add a `greyCount` / `greyRows` prop. `perRow=0` currently greys every
  row at once.
- **C08:** in February 1917, the shrug pose puts a glove partly over a soldier's own face.
- **C11:** the globe drew without its texture in two still renders. This was fixed by waiting for the
  textured mesh before continuing. Verify it in the 4K output.
- **Emoji:** some emoji (e.g. 🤷) render wrongly in the headless renderer. Grep the scenes for emoji in
  captions and swap any that break for an icon image or plain text. Check every one in a still.
- **Done here:** `Camera` drift now eases out and is capped at +8 % zoom, which fixes edge crops on long shots.
- **Merged so far:** polish for c02, c03, c04, c06, c08 and c11. Still to merge: s00, c01, c05, c07, c09, c10.

## Status 2026-10-28 05:30 UTC (final 4K render in progress)

- **All polish merged:** s00 and c01–c11 are all in, including C09 at 58c57cf.
- **Main 4K pass:** 19 helpers (r01–r20, minus r16) cover frames 0–64199 and 72600–89541. Each pushes to
  `render/russia-4k-rNN`.
- **Second wave:**
  - c9a–c9g render 64200–72599 (C09) to `render/russia-4k-c9*`.
  - Redo branches **override** the main pass when assembling:

    | Branch | Frames | Re-rendered because |
    |---|---|---|
    | `render/russia-4k-x1` | 72600–73799 | 1953 beat |
    | `render/russia-4k-x2` | 81000–82199 | C10 "order returns" panels |
    | `render/russia-4k-x3` | 19800–20399 | C02 host entrance |

- **Assembly rule:** for each `seg_NNNNN.mp4`, take it from an x* branch if it exists, else from c9*/r*.
  Then check that there are 150 segments (seg_00000 … seg_89400) and 89 542 frames.
- **Before delivery:** scan every segment for the Chromium "full-width black band" raster glitch, which C09
  hit once. Sample frames every 0.5 s and flag rows that are pure black across the full width on
  non-black shots.
- **BGM:**
  - archive.org storage hosts (`*.us.archive.org`, `*.ca.archive.org`) are blocked by the network policy.
  - Wikimedia Commons hosts the same Musopen recordings, and `upload.wikimedia.org` is reachable, but it
    rate-limits this network (429, retry-after 600).
  - Exact Commons titles are in the scratchpad `bgmtools/info.py`; also see `scripts/russia/build_bgm.py`.
  - Using CI to download them was refused (network-policy workaround). Ask the user to allow
    `*.archive.org` instead.

## Delivered 2026-10-28 06:42 UTC

- **Release:** private GitHub release `russia-v1` (repo Releases page), asset `Russia_Ki_Kahani_4K60.mp4`.
  - 1 891 736 578 bytes; 3840×2160 @ 60 fps HEVC (hvc1) + AAC.
  - 89 542 frames, 1492.4 s.
  - SHA-256 `16696fd7…12388007`.
- **Black-band scan:** 0 bands.
- **Pipeline:**
  1. `scripts/russia/encode_delivery.sh` (HEVC pieces on `delivery/russia-hevc-eNN`)
  2. `scripts/russia/make_release.sh` (joins the pieces with the soundtrack, scans and checks, then splits into
     parts on `release/russia-4k`)
  3. The workflow on that branch attaches the file to the release.
- **Music:** Kevin MacLeod, CC BY 4.0. The credit line for the video description is in `AUDIO_CREDITS.md`.
- **To re-deliver after a change:**
  1. Re-render the affected 600-frame segments to a new `render/russia-4k-xN` branch (it overrides).
  2. Delete those pieces from their `delivery/russia-hevc-eNN` branch and re-run `encode_delivery.sh`.
  3. Delete `out/russia/release` and the `release/russia-4k` branch, then re-run `make_release.sh`.
