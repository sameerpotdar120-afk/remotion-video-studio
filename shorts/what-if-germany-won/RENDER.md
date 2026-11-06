# What if Germany won WW2 — Ink Toon film (89.5 s)

Source for the full short in the Ink Toon style (see `.claude/skills/ink-toon`).
- `intro.js` — shots 1–3 (the approved 10 s test) + shared drawing helpers
- `lib2.js` — character rig `person()`, Europe map `europe()`, globe `globe()`
- `shots.js` — shots 4–24; `main.js` — shot table, captions, `window.OP`
- `captions.json` / `data/words.json` — word-synced captions from the voiceover

The voiceover (`data/mix.wav`) is not committed: it is the reference video's audio, used for testing only.
Render (4 parallel parts, then join and add audio):
```bash
for r in "0 22.5 1" "22.5 45 2" "45 67.5 3" "67.5 89.5 4"; do set -- $r; FPS=60 node tools/capture.mjs video renders/p$3.mp4 $1 $2 & done; wait
```
