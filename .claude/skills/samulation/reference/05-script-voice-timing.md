# 05 · Script, voice-over and word timing

## 1. Topic
- Pick a story whose answer is a *mechanism* that can be shown in 3D: how a weapon fires, why a structure fails, how a
  loophole works.
- Check that the reference channel hasn't told it already (search its titles/transcripts).
- **Fact-check before writing:** dates, counts, sizes, the physics.
  - Compute any number yourself and show the maths in the script notes (example: rail growth = α·L·ΔT).
  - Never invent a number or a source. Mark illustrative scenes as illustrative in the notes.

## 2. Two script shapes
**A. Explainer (40-50 s, the creator's own voice):**
1. Contrast hook ("You'd laugh at X, but … Here's why.").
2. Setup.
3. Mechanism beats, one concrete image each.
4. Payoff.
5. A loop line that calls back the hook.

Budget ≈ 2.61 w/s × seconds (110-130 words).

**B. Story (60-90 s, storyteller voice; see `04`):**
1. Cold-open paradox/odd act with an exact number.
2. "You see," + stakes.
3. Conflict (a doubter with power).
4. Rival/mockery.
5. Time skip ("Then summer comes").
6. Evidence with everyday props.
7. False victory (dramatic irony).
8. Climax disaster/near-miss.
9. One "because" line.
10. Callback/loop.

~3.3 w/s → 200-220 words for 65 s.

**Rules for both:**
- median sentence ~13 words, 12 % punches of ≤5 words;
- about 2 short dialogue lines, 1-2 jokes;
- no CTA;
- the ending calls back the hook object.

## 3. Hooks: always run yt-script
```bash
python3 youtube/yt-script/hookscore.py hooks.txt     # write FIVE, rank, keep the top two; show both panels
```
- **Scoring:** SPECIFICITY (numbers, names), ADDRESS ("you" early), STAKES (lose/cost/never/before…), CURIOSITY
  (why/how/but/until/nobody), BREVITY (9-24 words).
- **Thresholds:** 70+ is STRONG; story cold opens usually land at 60-71 because they match no formula, which is fine.
- **What wins:**
  - a "You'd fire/laugh at…, but…" contrast;
  - plus a concrete number;
  - plus "until it almost cost them…" (curiosity + stakes).

  Example from video #4: 71.
- Titles are scored separately with `youtube/yt-package/title.py` (see `13`).

## 4. Voice
- **The creator's own voice:** profile in `youtube/voice.md` (2.61 w/s, short sentences, "Here's why.", honest hedges).
- **ElevenLabs** (used for video #4): give a paste-ready block.
  - Numbers spelled out ("thirty-nine").
  - `...` for short pauses.
  - Blank lines between beats (breaths).
  - Quotes for dialogue.
  - No SSML, no stage directions.
  - **Settings:**
    - model Eleven Multilingual v2 (stable), or v3 for more acting on dialogue lines;
    - stability ~45 %, similarity ~75 %, style ~25 %, speaker boost on;
    - speed 1.05-1.1;
    - voice: a warm, lively American storyteller (Voice Library, narrative/audiobook).
  - Ask the creator to download MP3 44.1 kHz (or WAV).
- **Speed up without changing tone** (pitch-preserving time stretch):
  ```bash
  ffmpeg -nostdin -y -i VO.mp3 -af "atempo=1.10" -ar 48000 -c:a pcm_s16le vo_110.wav     # 89.2 s → 81.1 s
  ```
  "0.10%" from the creator meant **×1.10**: confirm the reading in the reply.

## 5. Word timing (the spine of the edit)
1. Transcribe the *final* VO (after speed change) with faster-whisper `small.en`, `word_timestamps=True`, giving
   `words.json [{w,s,e}]`.
2. Merge broken tokens ("U" ".S.", "non" "-food") and check numbers ("39" vs "thirty-nine").
3. Build a key-word table `T = {name: onset_s}` and frames `WF = round(onset·fps)`.
4. Every shot boundary and every action is computed from `WF`, never typed seconds (see `08`).
5. Commit `words_<vo>.json` with the project (our own VO: safe to commit). Never commit reference transcripts.
