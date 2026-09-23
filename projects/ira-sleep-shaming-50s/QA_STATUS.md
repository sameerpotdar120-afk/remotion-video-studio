# Ira Sleep Shaming Reel — QA status

- Composition: `IraSleepShaming50`
- Canvas: 1080 × 1920
- Frame rate: 24 fps
- Duration: 1200 frames / 50.000 seconds
- Visual plan: 21 contiguous, mutually exclusive shots
- Narration: five untouched 10-second WAV windows, one per approved segment
- Presenter media: pre-keyed `keyed/*_on_user_background.mp4` only; raw green-screen files are not used by the composition
- Illustration status: bundled original SVG educational illustrations; no claim of documentary evidence or AI generation
- Editorial labels: semantic headlines, not word-for-word subtitles
- Remotion version: 4.0.527
- Final render: `out/ira_sleep_shaming_50s_exact.mp4`
- QA contact sheet: `out/ira_sleep_shaming_QA_contact_sheet.jpg`

## Final ffprobe proof

- Video codec: H.264
- Audio codec: AAC, stereo, 48 kHz
- Resolution: 1080 × 1920
- Frame rate: 24/1
- Video frames: 1200 read / 1200 declared
- Video duration: 50.000000 s
- Audio duration: 50.000000 s
- Container duration: 50.000000 s

## Signal checks

FFmpeg silence detection found quiet tails before every 10-second join:

- S01: 0.497 s
- S02: 0.438 s
- S03: 0.698 s
- S04: 0.463 s
- S05: 0.397 s

This supports clean audio joins without cutting active speech. It does **not** prove the exact Hindi/English wording or filename-to-script mapping.

## Release limitation

Exact spoken-word matching still requires a person to listen to S01–S05 against the approved script. No human listening approval is claimed by this build. The render keeps the supplied WAV files unchanged and does not present the semantic labels as subtitles.
