# Jio: How Data Became a Default Utility

A 90-second, 1080×1920 Remotion documentary edit built from a green-screen presenter take, muted archival footage, cited primary documents, generated 3D Unreal-style illustrations, and one consistent studio background.

## Editorial decisions

- Presenter audio and picture always play at exactly 1.0×. No time-stretching or pitch-changing playback is used.
- Twenty-six detected silent gaps are tightened while retaining a short natural breath at every edit, producing an 89.97-second timeline.
- The supplied warm red/orange studio image is used as the consistent green-screen replacement; the keyed presenter has a restrained warm/cool grade to match it.
- Presenter transparency is rebuilt from the raw green-screen color, without a hard body mask. The entire source rectangle stays centered inside the canvas.
- The supplied stock/reference video is always muted.
- Segment 9 keeps the recorded narration, while the visual uses the exact attached TRAI series: ₹268.97/GB (2014) to ₹11.78/GB (2018), with a note that the attached report ends in 2018.
- Airtel, Vodafone, and Idea are presented as editorial typography; no recreated company logos are used.

## Required prepared assets

Place these files in `public/assets/`:

- `ira-keyed-full-outline.webm` — transparent VP9 presenter with full recorded sleeve/hand outlines and no embedded audio
- `ira-narration.m4a` — original presenter narration at natural speed
- `studio-bg-warm.jpg` — supplied studio background
- `ai-2014-data.png`
- `ai-daily-habit.png`
- `jio-agm-free-voice-v2.mp4` — selected launch archive excerpt with its audio removed
- `trai-usage-page.png`
- `trai-cost-page.png`
- `vi-merger-page.png`

## Preview and render

```bash
npm install
npm run dev
npm run still
npm run render
```

The composition ID is `Jio90s` (2699 frames at 30 fps, 89.97 seconds).
`JioNarration` exports the identical cut map as one continuous audio track without decoding pictures, for frame-range video renders that are joined losslessly.

## Presenter outline and audio checks

`scripts/restore-presenter-outline.sh` rebuilds alpha from the original green-screen footage while retaining the full graded RGB image. It accepts the raw take, the previous graded VP9 source, and a new output WebM path. It refuses to overwrite existing media. The composition removes only the empty camera strip above the presenter's head before applying the rim light; no sleeve, hand, or body-shaped crop is used.

After rendering, verify all 27 retained narration sections against the original recording:

```bash
python3 scripts/verify-narration.py public/assets/ira-narration.m4a out/Jio_Data_Revolution_Final_Corrected.mp4 src/JioVideo.tsx
```

The check requires FFmpeg, NumPy, and SciPy. It compares the original waveform at the authored 1× source positions, allowing only a small constant audio-encoding offset.
