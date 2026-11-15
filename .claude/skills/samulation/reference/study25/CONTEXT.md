# Reference study for Samulation shorts: shared brief (read fully before starting)

## Goal
Our channel Samulation makes 40-60 s vertical explainers ("…") with 2D flat
cartoon characters inside a 3D world. Our mascot: bean/stick character with ginger "Flame Spikes" hair and a gold "S"
chain. We are moving production to **three.js rendered inside Remotion** (per-frame 3D, real camera moves), using the
`cartoon-3d-short` skill (~/.claude/skills/cartoon-3d-short: SKILL.md, references/reports/*.md from another study, templates/bridge/*).
The user wants our videos to match these references in EVERYTHING: look, lighting, camera, character acting,
mechanics/physics of props, how every action lands on the voice-over words, effects, sound and script.
Our last attempt failed on: actions not timed to the VO words, physics/mechanism readability (half a cannon, rockets
looking like they land inside our wall), weak enemy crowd quality, static camera.

## Reference material (PRIVATE study only: never upload, publish, commit or send any of it)
- 25 shorts, 1080x1920, 30 fps, 31-78 s: `/root/proj/refs/vids/NN.mp4` (NN = 01..25). Index: `/root/proj/refs/index.txt`.
- Word transcripts with timestamps (faster-whisper small.en): `/root/proj/refs/tx/NN.json` ([{w, s, e}]) and `tx/NN.txt`.
- Contact sheets at 30 fps: `/root/proj/refs/sheets/NN/sKK.jpg`, each sheet = 2 s = 60 frames (10 cols x 6 rows, 180x320 tiles,
  row-major; sheet sKK starts at t = (KK-1)*2 s).
- Per-frame measurements `/root/proj/refs/measure/NN.json` (list, one entry per frame at 30 fps), computed at 360x640:
  lm/ls = luma mean/std (caption band 56-80 % masked), p2/p98 luma percentiles, sat = HSV saturation mean,
  cut = 32-bin luma histogram L1 change vs previous frame (hard cuts ~>0.5), cam = [dx, dy, zoom, roll_deg] similarity fit vs
  previous frame from 9-tile phase correlation (dx/dy in px at 360 wide: multiply by 3 for 1080; zoom is a per-frame scale
  delta; null when the fit failed, e.g. cuts/flat frames). Measure script: `/root/proj/refs/measure.py`.
- Extract any frame yourself: `ffmpeg -v error -ss 12.4 -i /root/proj/refs/vids/01.mp4 -frames:v 1 out.png` (PNG for numbers).
- Burned-in captions: white bold word(s), black outline, around 60-74 % of frame height. Mask them before statistics.
- Tools: python3 (numpy, PIL, scipy available; run python with `-I` when it reads these files), ffmpeg/ffprobe. No OpenCV. Do not
  pip-install, do not download anything. CPU is shared (4 cores): keep heavy jobs modest (process at 360x640, sample frames).

## Deliverable (each agent)
1. Work only in `/root/proj/refs/work/<your-topic>/` (scripts, crops, side-by-sides).
2. Write `/root/proj/refs/reports/<your-topic>.md`:
   - measured NUMBERS (tables) from many frames across all 25 videos (frame-by-frame where it matters), not adjectives;
   - concrete, implementable rules for our three.js + Remotion + Canvas2D stack (exact values: frames, px at 1080x1920,
     %/frame, hex colours, durations, offsets vs word onsets), and which part of the bridge template they map to;
   - where the bridge skill's existing reports (~/.claude/skills/cartoon-3d-short/references/reports/) agree or DISAGREE with these 25 videos;
   - top 5-8 rules ranked by visual/retention impact.
3. Final message: at most 200 words summary + the report path.
