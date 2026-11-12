# 08: Sound (SFX on the words, music bed, mix)

The reference has a **constant bed** under the voice (pauses only 5-7 dB quieter than speech) and small effects on every visual
event. Silence between lines is never allowed.

## 1. Sound effects: `tools/sfx.py` (synthesised, copyright-free)
`data/cues.json` = `{"fps": 30, "cues": [[name, {params}], ...]}`, frame `f = round(seconds*30)+1`.
| name | use | key params |
|---|---|---|
| `whoosh` | every shot change (on the dissolve), camera whips | `f, dur 0.35-0.45, gain 0.3-0.4, up true/false` (peaks ON the frame) |
| `thump` | stamps landing, impacts, drops | `f, gain 0.4-0.75, freq 65-95` |
| `ping` | reveals, glows, list items, "there it is" | `f, gain 0.2-0.3, base 880-1700` (raise the pitch through a list) |
| `slice` | cracks, cuts, swipes | `f, gain 0.25-0.5` |
| `squelch` | soft/liquid moments | `f, dur, f0 → f1` |
| `rise` | build-up before a reveal | `f0, f1, a → b Hz` |
| `clink` | metal, glass, coins | `f, base` |
| `bonk` | comedic drop/bounce | `f` |
| `tick` | footsteps (`every: 5` frames over a walk), small contacts | `f` or `every, f0, f1` |
| `buzz`, `whine`, `bubbles`, `rasp` | engines/insects, hums, liquids, sawing | see the tool |
Rule of thumb for a 40 s short: ~30 cues: one whoosh per shot change, one hit per key word, footsteps on walks.

## 2. Music bed: `tools/music.py`
`python3 tools/music.py data/music.wav --dur <len> [--bpm 92] [--prog Am,F,C,G] [--mood light|tense]`: soft detuned pads, eighth-note
plucks, a gentle kick, 1 s fade-in, 1.2 s fade-out. `light` for curious/funny topics, `tense` for warnings. The creator's own
royalty-free track can replace it (same file name).

## 3. The mix: `tools/mix.sh`
`bash tools/mix.sh data/vo.wav data/sfx.wav data/music.wav data/mix.wav <video seconds>`: SFX ×0.55, music ×0.10, both side-chain
ducked under the voice (threshold 0.03, ratio 6, attack 15 ms, release 350 ms), loudnorm to **-14 LUFS, -1 dBTP**, padded to the video
length. Check the printed integrated loudness; if it lands under -14.5, re-encode the final audio with `volume=+1.2dB,alimiter`.
Listen to the 3 busiest moments: the voice must stay clear.
