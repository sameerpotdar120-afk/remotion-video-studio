# Ira Sleep Shaming — 50-second Remotion reel

This folder contains the tested Remotion source for the 1080×1920, 24 fps, 1200-frame reel.

## Media setup

The public GitHub branch intentionally omits presenter video and narration binaries. They remain in the completed production pack supplied with the project. Copy these folders from that pack into this project before previewing or rendering:

- `public/keyed/`
- `public/audio/`
- `public/sfx/`

The original SVG illustrations are included under `public/illustrations/`.

## Commands

```bash
npm install
npm run validate
npm run typecheck
npm run studio
npm run render
```

The composition ID is `IraSleepShaming50`. Editorial labels are semantic graphics, not timed subtitles. Exact spoken-word matching and acceptance of the supplied key edge remain human release gates; see `QA_STATUS.md`.
