# 03: Topic, facts, script (yt-script) and the creator's voice

## 1. Topic test (all must be yes)
1. A **rule** (law, policy, physics, biology) + a **thing everyone sees** + a **hidden trick/mechanism** that reconciles them.
2. It can be shown as pictures in 6-10 locations/props.
3. Two reliable sources agree on every fact; no number you can't verify.
4. Universal (global, US-heavy audience) and safe (no gore, no accusations).
Good patterns: "X is illegal, yet everywhere", "You pay for X, but nobody…", "Why every Y does Z", "The loophole that lets…".

## 2. Voice profile (`youtube/voice.md`, measured from the creator's own recording)
- Pace **2.61 words/s** → 40 s ≈ 105 words, 45 s ≈ 117, 50 s ≈ 130. Write for this, never for a reference's faster pace.
- Short plain sentences (~10 words), fragments for rhythm ("Same company. Same toy."), talks to "you".
- Opens with a contrast + "Here's why." Explains with one concrete image per idea and everyday comparisons. Hedges honestly.
- Ends by looping back to the first line. No intro, no channel name, no subscribe ask in the video.
Re-measure after every new VO the creator records (`words.py` prints the transcript; words ÷ duration).

## 3. Hooks: run yt-script (`youtube/yt-script/`)
```bash
python3 SKILL/youtube/yt-script/hookscore.py hooks.txt          # write FIVE hooks, keep the top two
```
- The scorer rewards: "you" in the first six words (ADDRESS), a stake word (lose, never, cost, risk, before, stop…) (STAKES),
  a number/name/date (SPECIFICITY), an unanswered half (CURIOSITY), brevity.
- Iterate until ≥ 59 (WORKABLE), then pick by **ear**: read both aloud; the clearer one wins over +2 points.
- Formulas that fit this channel: Impossible Claim, Comparison, Question, Reveal (see `youtube/yt-script/hooks.json`, 21 formulas).

## 4. Script shape (40-50 s)
| beat | share | content |
|---|---|---|
| Hook | 0-15% | the paradox + "Here's why." |
| Name it | 15-25% | what the thing is, in one line |
| The rule | 25-45% | the law/mechanism, with the date or number |
| Consequence | 45-55% | "So X is banned. Not for A. For B." |
| The trick | 55-85% | "you" walk through how it's done, step by step, each step a picture |
| Payoff + loop | 85-100% | the punchline line, then a last line that flows into the first |
Mark every line `[ON SCREEN: …]` and the word the key motion lands on. Hand back: two scored hooks, the script, runtime at
2.61 w/s, the formula used, sources, and "Ship it, or change it?".

## 5. Recording brief for the creator
One take per paragraph is fine; quiet room; phone 15-20 cm away; read at natural pace; send mp3/m4a/wav. We time everything to
their words. Typical cleanup needed after transcription: join split tokens ("U" + ".S." → "U.S.", "non" + "-food" → "non-food"),
capitalise brand names, keep the timing.
