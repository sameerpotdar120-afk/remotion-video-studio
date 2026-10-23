# NullDynasty video studio

Hindi geography and map-story Shorts (YouTube @null_dynasty, Instagram @nulldynasty), built in Remotion.

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
