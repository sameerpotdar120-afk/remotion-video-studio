# 12 · Join, mix, QA, deliver

## 1. Join
- Concatenate the parts in frame order with `ffmpeg -f concat -c copy`. Check every part's frame count first.
- Shots with tails: cross-dissolve with `xfade=transition=fade:duration=0.13:offset=…`, both cameras moving.

## 2. Captions
- Plain white bold one-word captions with a black outline, on the torso band (~60-74 % height).
- Short words ride with the next.
- Render them as PNGs from `words.json`, then overlay with `enable='between(t,s,e)'` chains (a filter_complex script file).

## 3. Sound
- **SFX:** synthesize them (`tools/sfx.py`). Sparse, on action words, not on cuts.
  - Recipes: whoosh, impact, spark crackle, hiss, creak, rail groan, brakes, explosion.
- **Music:** a continuous dark bed (`tools/music.py`), ~20 LU under the voice, no ducking.
- **Mix:** `tools/mix.sh`. Target I = −14 LUFS, true peak −2 dBTP, LRA ~2-3 LU. Verify with `ebur128`.

## 4. QA before sending
```bash
ffmpeg -nostdin -v error -i final.mp4 -vf "fps=2,scale=144:256,tile=14x7" qa.jpg   # every 0.5 s
```
- Look at every tile. Check:
  - camera inside geometry;
  - hidden mechanism;
  - ghosting in dissolves;
  - washed-out explosions;
  - empty backgrounds;
  - wrong shot rendered (it happened).
- Check loudness. Check the duration matches the VO.

## 5. Deliver
- `SendUserFile` the video, plus a short honest report:
  1. what's in it, as the word-synced action list;
  2. sound numbers;
  3. any delays and their causes;
  4. weak spots with timestamps;
  5. a % score against the reference;
  6. one offer for the next step.
- **File names:** `Samulation-0N-<Title>-4K<fps>.mp4`, `...-FirstFrame-4K.jpg`, `...-Preview-10s-4K<fps>.mp4`.

## 6. Git rules
- Work on the session branch. Helpers push to their own branches.
- Never commit reference media or `out/`; split big outputs only on helper branches.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: <session url>
  ```
- No model IDs in artifacts. No PRs unless asked.
- Commit and push after every meaningful step (the stop hook enforces it).
