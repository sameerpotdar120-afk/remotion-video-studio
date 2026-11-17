# Animated Shorts (made with code)

This folder makes animated Shorts entirely on this computer: three.js worlds + drawn characters (Remotion), a free Kokoro voice, music made in code.
The workflow is the skill in `.claude/skills/animated-shorts/SKILL.md`. Read it before doing anything.

- Example episode: `episodes/ep1` + `src/ep1` (London's green taxi huts). Copy it for new episodes.
- Short (9:16): `npx remotion render src/index.ts Short episodes/ep1/out/episode_1.mp4 --codec=h264 --crf=18`
- Long version (16:9): composition `Long`.
- Always check stills before rendering: `node scripts/stills.mjs <shot ids>`.
- New video, new chat.

## Cloud container notes (Claude Code on the web)
- `remotion.config.ts` switches to software WebGL (`swangle`) and the pre-installed Chromium when it finds `/opt/pw-browsers`; on a normal computer it keeps `angle`. Software rendering is ~4 s per 1080x1920 frame, so split long renders into frame ranges.
- Captions use the bundled `public/fonts/Montserrat-latin-var.woff2` (SIL OFL), so renders need no network.
- The Kokoro voice downloads its model through the proxy: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/voice.mjs epN am_michael 1.15`.

## Our character (locked)
`characters/samulation-hero/` holds the channel's main character (ginger Flame Spikes hair + gold "S" chain). Never delete it, even when asked to delete other work: confirm with the creator first. Use it as the hero in every video (clothes may change).
