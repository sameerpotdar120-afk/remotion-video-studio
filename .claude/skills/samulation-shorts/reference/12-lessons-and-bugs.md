# 12: Lessons and bugs (rules learned the hard way)

## Working with the creator
1. Quality over speed, always; but say timings honestly and early. Quote finish times in IST from measured speed.
2. Show progress (key frames, sheets) without being asked; never send unchecked frames.
3. Go step by step when the creator says so ("don't rush"): one decision at a time, wait for their call.
4. Never present a mixed-quality film as finished; list weak spots with timestamps.
5. Ask before naming the hero or changing anything locked.
6. Clean up helper processes and parallel jobs when done.

## Engine bugs and fixes
| symptom | cause | fix |
|---|---|---|
| frame washed out / glowing blob | point lights too strong + bloom | point ≤ 16, emissive ≤ 1.25 on detailed textures, bloom 0.3-0.4 |
| character invisible | hidden behind a prop (suitcase lid, counter) | move the prop or the actor; raise officials on a platform behind counters |
| character dark in night scenes | cut-out only lit by scene lights | Actor emissive 0.42 (built in) |
| cut-out looks like a sliver | camera too far to the side | keep within ~60° of facing; `.face(cam)` every frame |
| huge stray character in an art render | an `else` branch drew another mode's art | branch explicitly on each mode |
| texture text mirrored | plane seen from behind | rotate the plane, not the camera; DoubleSide only for actors |
| caption tokens split ("U" ".S.", "non" "-food") | whisper tokenisation | merge tokens in words.json after transcription |
| `check` mode times out | it draws every 0.25 s of the film | run in the background or test with `frames` |
| progress stuck at 0/N | progress prints every 150 frames | wait; use measured speed for ETA |
| joined render has ±1 frame | rounding per part | acceptable; audio is muxed to the full mix |
| PIL can't open .jpg from capture | the file is PNG data named .jpg | `Image.open(...).convert('RGB').save(new)` |
| ffmpeg in a shell loop only does the first item | ffmpeg reads stdin | always `ffmpeg -nostdin` |
| `rm -rf` blocked by the agent's safety check | relative glob after `cd` | use absolute, explicit paths |
| whisper download fails behind a proxy | xet CAS host | `HF_HUB_DISABLE_XET=1` |
