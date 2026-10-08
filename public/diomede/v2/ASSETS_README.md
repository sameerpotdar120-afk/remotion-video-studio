# Diomede Islands v2 — 23 new video assets

Download both ZIPs and extract them into the same folder. All 23 PNGs are in `public/diomede_v2/img/` under the exact filenames in the supplied brief. No generated image from an earlier pack was reused. Two candidates were generated for every asset; selected files include targeted refinements where useful.

## Image quality

The production PNGs are byte-for-byte copies of their selected native image-generation outputs. They have not been downsampled, converted to JPEG, or recompressed with a lossy codec. Native square outputs are 1254×1254; landscape outputs are 1536×1024; portrait outputs are 1024×1536. In particular, the sea-ice texture is native 1254×1254 rather than the brief's 1536×1536. Actual dimensions, alpha information, file sizes, and SHA-256 checksums appear in `inventory.csv`.

## Use in the editor

- Transparent cutouts: use normal alpha compositing. Interpret as straight/unmatted alpha. Cloud wisps, frost, footprints, and cracks contain intentional partial transparency.
- `light_burst.png`, `light_leak_arctic.png`, `portal_swirl.png`: use Screen or Add blending. These have opaque black backgrounds as requested.
- `clock_glossy.png`: twelve hour marks and center cap; draw clock hands and any numbers in code.
- `stamp_frame_red.png`: transparent empty center; add the year in code.
- Hikers: both face right, with distinct stride/pole positions. Alternate the two sprites and keep their head/backpack and foot baseline aligned in the animation. Their silhouettes are deliberately plain black.
- `fabric_folds.png`: use as the grayscale cloth-lighting overlay on code-drawn flags.
- Texture tiling: the selected cloth and ice textures look better after refinement, but their opposite-edge pixels are not identical. Use **mirrored tiling** for a continuous fill, rather than ordinary repeat. In After Effects, enable Mirror Edges in Motion Tile/CC RepeTile; in WebGL use MIRRORED_REPEAT where supported, or the included `texture_tiling.glsl` coordinate helper. This preserves the original PNG detail and avoids hard boundary joins.

## Scope and supporting files

This pack supplies the brief's 23 generated PNG assets. Maps/coastlines, real village photography, flags, Hindi text, counters, labels and transitions are outside the generated checklist and should be sourced or drawn as directed in the brief. The original brief is included. The v2 script, beat plan, voiceover MP3, and SRT were not attached to this request, so those are not included.

`preview.jpg` is a reduced-size contact sheet for browsing only; always use the production PNGs in the video. `generation_prompts.json` records the selected prompts. `archive_contents.json` identifies the files in each download.

Each download is a complete standard ZIP archive under 25,000,000 bytes. No split-file restoration is needed.
