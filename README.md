# Remotion Video Studio

Animated map-history videos in Remotion — 4K (3840×2160) @ 60 fps, long-form 16:9.

## Docs
- `docs/ASSET_PROMPTS.md` — every image asset with exact file name + ChatGPT prompt, 4K upscale workflow, map/terrain/SFX/music sources.
- `docs/REMOTION_ANIMATION_CODE.md` — the motion system (verbatim source), motion grammar, scene recipes, grading, render commands.
- `analysis/` — frame-by-frame breakdown of the reference video.
- `scripts/` — VO scripts (Hindi / Hinglish) and data builders.

## Quick start
```bash
npm install
npx remotion studio          # preview Demo-MapHook, Demo-Britain, Demo-Volley
npx remotion render src/index.ts Demo-MapHook out/maphook.mp4
```
Files in `public/assets/` created by the test script are placeholders — replace them with the generated assets of the same name.
Rebuild the code doc after editing source: `python3 scripts/build_code_doc.py`.
