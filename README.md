# Remotion Video Studio

A vertical 9:16 Remotion project for documentary-style video editing.

## Compositions

- `DarienGap`: 72.8 s Hindi map-animation Short about the Darién Gap (1080 × 1920, 30 fps)
- `MainComposition`: starter composition (24 fps)

## Darién Gap Short

The video is built the way GeoLayers edits are: one continuous virtual camera over a real satellite map, with every visual change keyed to a word in the voiceover. There are almost no cuts.

```bash
npm install
npm run dev                                   # Remotion Studio, pick "DarienGap"
python3 tools/mix_audio.py                    # rebuild public/darien/audio/mix.wav
npx remotion render src/index.ts DarienGap out/darien_gap_hindi.mp4
```

Where things live:

| File | What it controls |
|---|---|
| `src/darien/camera.ts` | Camera keyframes (lon, lat, zoom span, roll, tilt) |
| `src/darien/Overlays.tsx` | Map-anchored graphics: highway, X, region, skull, arrow, borders, clouds, routes, dots, pins, radar, trees |
| `src/darien/Screen.tsx` | Screen-space titles and effects: counter, title slam, police icon, fog, embers, rain, light leak, iris |
| `src/darien/Scenes.tsx` | B-roll montage and the vintage paper-map "नाकाम" stamp scene |
| `src/darien/Subtitles.tsx` | Caption chunks and their start times |
| `tools/mix_audio.py` | Sound-effect cue sheet, music level and the final loudness pass (−14 LUFS) |
| `tools/build_maps.py`, `tools/build_geo.py` | How the map plates and `geo.json` were built from the source pack |

All timings are in seconds and come from word-level timestamps of `public/darien/audio/voiceover.mp3`.

Credits and licenses: `public/darien/CREDITS.md`. The EOX imagery credit must also go in the video description.
