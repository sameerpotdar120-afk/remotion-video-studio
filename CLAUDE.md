# NullDynasty video studio

Hindi geography and map-story Shorts (YouTube @null_dynasty, Instagram @nulldynasty), built in Remotion.

## Topics: India yes, Hindu-Muslim no (creator, Nov 17)

India topics are preferred, but never pick or angle a video on Hindu-Muslim lines (communal conflict, a ruler of one
faith over a majority of another, riots, partition violence). Hyderabad/Operation Polo was dropped for this reason.
Prefer geography, science, engineering, borders, money, people and places.

## Copyright-free sources only

Never use anything copyrighted by someone else: no Google Earth or Google Maps imagery, no Flightradar24 (or any app's)
screenshots, data or logos, no clips, music or images from reference videos. Only free sources:
EOX Sentinel-2 cloudless (CC BY 4.0, credit on screen), AWS Terrain Tiles / SRTM (open data, credit), Natural Earth
(public domain; India point-of-view edition for borders), Mixkit music (free licence), Sonniss GDC SFX (royalty-free),
Google Fonts (OFL), the creator's own GPT images, and graphics drawn in code. Credit every source that asks for it.

## House style (approved on the UK weather video)

The creator wants every future NullDynasty video made the way the UK weather Short was: same workflow, GeoLayers-style
map, Lumetri-style grade (no grain), highlight fills for every place the VO names, India's official boundary, living
motion on every frame (not only the camera), and the same sound design. The full spec is `docs/HOUSE_STYLE.md`;
start from `src/ukweather/` and the `tools/*ukweather*` scripts.

## Documentary map style (approved on Junagadh, Nov 17: use it for the next videos)

The creator approved the Junagadh v2 edit and wants the next videos edited the same way. Start from `src/junagadh/edit/`
(`Doc.tsx` holds the two pieces below) and the `tools/*junagadh*` scripts:
- Black-and-white satellite map (`grayscale(1) contrast(1.38) brightness(0.8)` on the plates), dark neutral grade with a
  strong vignette; only the highlights carry colour.
- Highlights lie FLAT on the map (`FlatHL`): colour laid onto the terrain in a hard-light layer so the relief shows
  through, a crisp white outline, a keyframed wipe-in from the centre. Never lift, extrude, float, bob or drop-shadow a
  highlight (the creator: "highlighted things can't float"). Flags may fill countries, drawn in code.
- People (anyone the VO names) rise out of their place on the map (`MapPerson`): head-and-shoulders cut-out, bottom
  fading into the map, dark halo, a white name box (Hindi name, small English line), "AI illustration".
- Render 4K 30 fps unless the creator asks otherwise.

Hooks (creator, Nov 17: "still messed up in the visual and narration hook"): every script and edit follows
`docs/HOOK_PLAYBOOK.md`: the known thing first, the twist inside 2.5 s, one claim, no habitual "कैसे?", frame 0 = the
payoff picture (not a title word), a change every 0.5–0.8 s to 0:03, say-show sync, and 3 hook packages with frame-0
mocks for the creator to pick before the VO is recorded.

## Sound: no music (creator, Nov 26)

No background music in any video from now on. SFX only, and no generic stock packs: every sound is the literal thing the
VO or the picture shows (paper, chisel on stone, construction, a flip clock), sourced from open-source/royalty-free
libraries (Sonniss GDC, Freesound CC0, Kenney CC0) and credited. Every verbal hook gets a visual hook that lands word
for word with it.

## HyperFrames (from the next video, creator's request, Nov 1)

The creator wants the next video made with HyperFrames (HeyGen, Apache-2.0: HTML/CSS/GSAP rendered to MP4) used at full
capacity, alongside this house style. `.claude/settings.json` adds the `hyperframes` marketplace, enables
`hyperframes@hyperframes` and points it at the pre-installed headless shell (`PRODUCER_HEADLESS_SHELL_PATH`), so a cloud
session picks it up. If the plugin is not loaded, run `claude plugin marketplace add heygen-com/hyperframes` and
`claude plugin install hyperframes@hyperframes`.

- Read `/hyperframes:hyperframes` first (the render contract and the work loop), then `hyperframes-cli`,
  `hyperframes-registry` (about 450 ready blocks: transitions, kinetic type, captions, charts, maps, 3D, camera moves;
  check the catalog before hand-building any named visual), `media-use`, and `remotion-to-hyperframes` to bring the
  house style and existing Remotion parts across.
- Run the CLI through the plugin launcher, never bare `npx hyperframes`:
  `node <PLUGIN_ROOT>/skills/hyperframes/scripts/plugin-cli.mjs <command>` from the project dir. The loop: `lint`,
  `check --json` (fix every error), `snapshot` and look at the PNGs, `preview`, then `render --quality draft|looks|delivery`.
- `render` refuses to start with less than 1 GB free disk. Start the video in a fresh session, keep `/tmp` clean, and use
  render helpers for the final, as with Remotion.
- The house rules still apply: copyright-free credited sources only, India's official boundary on every map block,
  Mixkit music and Sonniss SFX (no HeyGen or AI-generated music unless the creator asks), the creator's own VO, no grain,
  loop ending.
- No paid HeyGen generation (creator, Nov 1): media-use image, image-to-video, voice and music generation need a HeyGen
  sign-in and its credits, so don't use them. Use HyperFrames for the free parts: HTML/GSAP motion, registry blocks,
  captions, grading, cutouts, local checks and render.
- Optional local tools it can use: whisper-cpp for word timing (build from source), Kokoro TTS and MusicGen (not
  needed: the VO is the creator's and the music is Mixkit).

## Upload queue

The current topic queue is `exports/week_plan_oct12-18.md`. When the creator asks "what's next?" (usually after a render),
answer with the row marked **NEXT**: the topic plus its reference video's title and YouTube link. Then mark that row done,
move **NEXT** to the following row, and commit.

## Cartoon Animation: a separate project (on hold)

Cartoon Animation is NOT NullDynasty. The two share this repo and `node_modules` only, nothing else: no code, assets,
fonts, music, SFX or compositions. Keep it that way. Never import between them, never copy assets across, and never
register one inside the other's Root.

- Code: `src/cartoon_animation/` with its own entry point `src/cartoon_animation/index.ts` (composition `CartoonKingsGuard`).
  NullDynasty's entry point stays `src/index.ts`.
- Assets: `public/cartoon_animation/` (images, fonts, audio, SFX). Mixer: `tools/cartoon_animation/mix.py` (self-contained).
- Exports: `exports/cartoon_animation/`.
- Render: `npx remotion render src/cartoon_animation/index.ts CartoonKingsGuard out/cartoon_kingsguard.mp4 ...`

Status: on hold. Don't touch it until the creator asks. The King's Guard cut is a test only. Its script and VO belong to
the reference creator, so it must never be uploaded.
