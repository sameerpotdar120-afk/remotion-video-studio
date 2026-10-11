# NullDynasty video studio

Hindi geography and map-story Shorts (YouTube @null_dynasty, Instagram @nulldynasty), built in Remotion.

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
