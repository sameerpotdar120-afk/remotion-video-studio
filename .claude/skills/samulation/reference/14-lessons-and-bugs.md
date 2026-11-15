# 14 · Lessons and bugs (rules learned the hard way, all videos)

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

## Video #3 (three.js, Nest of Bees)
| symptom | cause | fix |
|---|---|---|
| hero floats | card feet z ≠ 0 | feet at the origin of the card geometry |
| prop hidden behind hero | draw order | prop renderOrder above the card, rig depthTest off (not a depthTest-false card: breaks ink + DOF) |
| DOF dead | N8AO pass overwrote depth | removed N8AO |
| shot lands on the wrong word | `wordAt` prefix match ("a" matched "aerial") | exact word matching |
| soldiers underground | geometry translate sign | `hm*(feet−0.5)` |
| white trail wall in the volley | trails drawn up to the camera | fade trails near the camera |
| rockets look like they land in our wall | paths too low | `wallCheck` throws on any path touching the parapet |
| local renders killed | idle container restarts | render on helpers; resumable jobs |
| push rejected | 4K part > 100 MB | `split -b 90m`, `cat` back |

## Video #4 (Blender, the train)
| symptom | cause | fix |
|---|---|---|
| rails sunk into the ties | `bpy.ops.object.join` kept the first part's origin | apply transforms on all parts before joining |
| bright sky on the wrong side | Nishita sun rotation vs sun lamp convention | sky `sun_rotation = az + π` |
| grey, washed-out frame | AgX + heavy mist | Standard view, exposure −0.35, mist ×0.32 |
| zig-zag moiré on ties | distorted wave texture | stretched noise grain |
| faceted gravel | icosphere subdiv 1 | subdiv 2 + smooth |
| maul head invisible | struck the spike on the far side of the rail from the camera | strike the inside spike; check the contact point is visible |
| 4 min per frame "at low res" | exec'd world.py overwrote `arg()` → defaults (full res) | read args before exec; filter globals |
| glide shot rendered the hook scene | world.py's `SHOT` overwrote the caller's | filter `SHOT`, `OUT`, `SCALE`, `arg`, `argv` |
| 2-4× slower animation frames | vector pass + keyframes, motion blur, GN instances, gravel shadows | see `10` §4 |
| first QA monitor showed old frames | tailing the newest task log picked the wrong file | tail the exact task output path |

## Workflow
- The creator says "stop": kill renders (`pkill -f "blender -b"`, then `pkill -9 -x blender`), stop monitors, confirm, wait.
- "How much time?": answer with measured numbers and IST times, plus the condition the estimate depends on.
- Speed changes to the VO change every word time: re-transcribe after the change, never scale old times by hand.
