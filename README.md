# Jio: How Data Became a Default Utility

A 90-second, 1080×1920 Remotion documentary edit built from a green-screen presenter take, muted archival footage, cited primary documents, generated 3D Unreal-style illustrations, and one consistent studio background.

## Editorial decisions

- Presenter narration stays continuous and is retimed from 100.04 seconds to 90 seconds.
- The supplied stock/reference video is always muted.
- Segment 9 keeps the recorded narration, while the visual uses the exact attached TRAI series: ₹268.97/GB (2014) to ₹11.78/GB (2018), with a note that the attached report ends in 2018.
- Airtel, Vodafone, and Idea are presented as editorial typography; no recreated company logos are used.

## Required prepared assets

Place these files in `public/assets/`:

- `ira-keyed.webm` — transparent VP9 presenter video, muted in the composition
- `ira-narration.m4a` — original presenter narration, retimed to 90 seconds
- `studio-bg.png`
- `ai-2014-data.png`
- `ai-daily-habit.png`
- `jio-agm-free-voice.mp4` — archival excerpt with its audio removed
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

The composition ID is `Jio90s` (2700 frames at 30 fps).
