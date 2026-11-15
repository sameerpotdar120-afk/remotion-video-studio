# Script analysis: 25 reference shorts → Samulation script formula

Sources: `/root/proj/refs/tx/NN.json|txt` (faster-whisper small.en word times), `index.txt`. Scripts and raw numbers:
`/root/proj/refs/work/script/analyze.py`, `stats.json` (per-video stats + per-sentence start times).
Beat tags (dialogue, jokes, mystery, payoff) are hand-annotated from the transcripts; times are word onsets in seconds.
Caveat: whisper punctuation decides sentence splits, so sentence counts are ±10 %. Private study: snippets only.

---

## 1. Global numbers (all 25)

| Metric | Median | Min | Max | Notes |
|---|---|---|---|---|
| Duration (s) | 61.1 | 31.0 | 77.9 | 5 videos are 39-47 s (06, 07, 10, 11, 13) = our 40-50 s target |
| Words | 225 | 112 | 295 | |
| Words/s (first→last word) | **3.74** | 3.36 | 4.07 | flat across the video: quarters 3.72 / 3.69 / 3.66 / 3.70 |
| First word onset | **0.00 s** | 0.0 | 0.0 | 25/25: voice on frame 0 |
| Silence after last word | **0.28 s** | 0.08 | 0.55 | video ends on the last word |
| Sentences | 15 | 9 | 26 | 2.5 sentences per 10 s |
| Sentence length (all 377) | **13 words** | p10 5 | p90 24 | 12 % are ≤5 words (punch lines: "Then nobody moved.", "He's dead.") |
| Hook (sentence 1) words | **14** | 6 | 31 | |
| Hook duration | **3.4 s** | 1.5 | 9.3 | |
| Gaps >0.25 s per video | 9 | 5 | 17 | total 3.1 s (1.5-5.8) |
| Gaps >0.40 s per video | 1 | 0 | 4 | almost all sit before a dialogue line ("says, / goes,") or after "You see," / before "Wait" |
| Longest gap | 0.46 s | 0.32 | 0.98 | 0.98 s = a comic beat inside dialogue ("wow, … congratulations") |
| Questions (sentence-final ?) | 1 | 0 | 4 | plus questions inside dialogue |
| Number mentions | 5 | 1 | 15 | odd, concrete: 39 feet, 82 holes, 47→48 scratches, 300 pounds, 15 minutes, 3 am |
| Last sentence words | 18 | 6 | 35 | |

Sentence openers (377 sentences): So 40, The 38, **But 33**, He 29, **And 25**, You 22, **Then 15**, If 5, That's 5, Well 5.
→ ~30 % of sentences start with a connective (So/But/And/Then): the script is one causal chain, "but/so" every 1-2 sentences
("but" appears 46 times in 20/25 videos, "so" 50 times in 23/25).

Person: third-person story dominates 19/25 (median "he/his/they" 12 vs "you" 2 tokens). Second-person dominant: 02, 08, 09, 13, 16
("Imagine you're…", "You just watched…"). Even third-person stories drop in 1-3 "you" lines for the viewer ("…").
Tense: hook in past tense, body switches to **present** in 12/25 (01, 03, 12, 14, 17, 19-25) — "…".

---

## 2. Hooks

The 25 first lines are kept only in the private study copy (/root/proj/refs/reports/script.md); patterns and counts are in §1 and §9.

## 3. Structure beats

Two shapes:
- **Story-twist (19/25)**: hook act → setting → mockery/escalation → mystery → "You see" mechanism → ironic payoff.
- **Explainer (5/25: 05, 08, 09, 11, 13)**: hook question/if-you → setup → "But how?" → analogy ("Well, picture…") at 23-59 % → applied payoff.

| Beat | Present in | Typical time | Typical wording / form |
|---|---|---|---|
| Hook act | 25/25 | 0-3.4 s | see §2 |
| Setting / rule line | 25/25 | 3.2-9 s | "…" in 8 videos at 2.6-9.1 s (median 3.4 s, 0.18-0.34 s after hook) |
| Stakes clause | 22/25 | 3-12 s | "…", "…" |
| Mockery / doubt (others laugh, in-character line) | 15/25 | first at 5-14 s, repeated 1-3× | "…", "you're making soup?", "Sir, that's impossible." |
| Escalation beats | 25/25 | 3-6 beats, ~1 per 5-7 s | time ladders: "…", "…", "Then… Then another…" |
| Mystery beat | 17/25 | median ~55 % (10-60 %) | "Wait, what?", "Wait, practiced?", "But how?", "…", "something weird happens", "…" |
| Answer-leading "Well," | 5/25 | right after the question (0.4-1.0 s) | "…" |
| **Pivot "You see,"** (mechanism) | 11/25 (+8 early-setting uses; 17/25 use it at all, 19 uses) | median **76 %** (65-91 %) | "…", "…" |
| Other pivots | 6/25 | 23-75 % | "…" (13), "That's because" (13), "…" (09), "…" (04), "That's when he…" (23) |
| Everyday analogy | 6/25 (08, 11, 12, 16, 25 + coin flip in 11) | right after pivot | "…", "…", "…", "…" |
| Similes as visual jokes | 12/25 | anywhere | "like a snake", "…", "…", "…" |
| Twist / payoff | 25/25 | median 75 % start, last 2-4 sentences | antagonist/mockers get it (01, 12, 14, 22-25), hidden motive (03, 06, 19), real-world sting (20), cost-irony (17) |
| "…" origin close | 2/25 (07, 24) | last line | "…" |
| Ending line | 25/25 | ends 0.28 s before video end | median 18 words; generalized truth (10/25), ironic reversal (8/25), dark irony (4/25), superlative fact (2/25). No CTA, no "subscribe", no question to viewer |

Per-video beat map (s): Y = early "You see", M = mystery, P = mechanism pivot, T = twist/payoff start.

| # | Y | M | P | T | Dialogue lines | Jokes/exagg. | Mode |
|---|---|---|---|---|---|---|---|
| 01 | 3.4 | 36.0 | (shown, not told) 38.8 | 57.9 | 2 | 2 | story |
| 02 | – | 16.1 | 49.2 YS | 42.4 | 2 | 2 | you |
| 03 | – | 30.5 | 51.0 YS | 47.9 | 1 | 2 | story |
| 04 | 7.3 | 17.8 | 48.6 | 45.9 | 3 | 2 | story |
| 05 | – | – | (chain) | 53.4 | 0 | 1 | explainer list |
| 06 | 3.5 | – | – | 29.9 | 0 | 0 | story |
| 07 | – | 17.2 / 27.8 | 33.0 YS | 33.0 | 2 | 1 | story |
| 08 | – | 0-11 (4 Qs) | 14.8 "Well, picture" | 25.6 | 0 | 1 | you explainer |
| 09 | – | 13.1 | 16.5 "crack it open" | 18.4 | 1 | 1 | you explainer |
| 10 | – | 28.3 | 32.0 YS | 28.3 | 0 | 0 | story |
| 11 | – | 10.0 "But how?" | 10.7 "Well, picture" | 35.4 | 0 | 0 | explainer |
| 12 | – | 24.2 | 42.9 YS + 47.3 "Ever" | 56.0 | 4 | 2 | story |
| 13 | 3.9 | 11.8 | 23.1 "That's because" | 33.8 | 0 | 1 | you explainer |
| 14 | – | 10.8 "Wait" | 45.4 YS | 52.4 | 2 | 3 | story |
| 15 | – | 20.6 | – | 48.4 | 1 | 0 | fiction |
| 16 | – | 19.8 | 36.5 YS + analogy | 50.9 | 1 | 1 | you |
| 17 | 3.4 | – | – | 70.7 | 2 | 1 | fiction |
| 18 | – | 17.3 / 48.2 | 31.9 | 39.3 | 1 | 2 | story |
| 19 | 3.2 | 36.0 "Wait, practiced?" | 37.0 "Well," | 46.0 (+54.0 YS) | 3 | 1 | story |
| 20 | – | 31.6 | 43.7 YS | 37.6 | 3 | 2 | story |
| 21 | – | 36.1 "Wait, what?" | 52.7 YS | 49.2 | 1 | 2 | story |
| 22 | 9.1 | 37.3 | 9.1 (named early) | 51.2 | 3 | 2 | story |
| 23 | – | 12.8 "gets weirder" | 48.1 | 48.1 | 2 | 2 | story |
| 24 | – | – | 52.6 (shown) | 52.6 | 2 | 2 | story |
| 25 | 2.6 | 19.2 | 41.1 YS + analogy | 57.5 | 0 | 2 | story |

Totals: dialogue lines 36 (median 2, 19/25 ≥1); jokes/exaggerations 35 (median 2, 21/25 ≥1).
Dialogue lines are short (2-12 words), introduced by "goes," / "says," / "asks," with a 0.4-0.6 s gap before the quote
(the only regular pause in the voice). Jokes are claim-vs-reality exaggerations: "He'd lose a race to the saloon against a guy
carrying two beers", "that horse lost a race to the milk cart, and it was pulling the milk cart", "are we fighting them or grating cheese?".

---

## 4. Pacing rules (measured)

- 3.7 words/s constant; no slow-down for the explanation (Q4 = 3.70).
- Rhythm = long sentence (19-30 words, a run of clauses with commas) followed by a ≤5-word punch ("Then nobody moved." "…").
  12 % of sentences ≤5 words; they land the beat changes.
- Pauses: ≈1 gap >0.4 s per video, placed before a quoted line, after "You see," or around "Wait, …?". Everything else is gapless.
- Questions: 1 per video narration-level (mystery), + 1-2 inside dialogue. Rhetorical "…" before a reveal (18).
- Numbers: ~5 per video, small and specific, often repeated as a ladder (15 min → 20 min; 47 → 48 scratches; May → July).
- Time-skip connectors carry escalation: "The next morning" (7/25), "Then," (7/25), "One night" (3/25), "…".
- Every sentence is a filmable picture; abstract words only inside the "You see" sentence and explained in the next clause.

## 5. Titles

Kept in the private study copy only. Rule: the title states why it matters, hides the answer, never repeats the hook.

## 6. Agreement / disagreement with the bridge skill STYLE_BIBLE

| Bible claim | These 25 | Verdict |
|---|---|---|
| Hook paradox, sentence 1, ~10-16 words | median 14, IQR ~11-17, range 6-31 | AGREE (allow 6-9-word punch hooks: 01, 12, 25, 18) |
| 3.5-4.1 words/s, median 3.7 | 3.36-4.07, median 3.74 | AGREE |
| Pauses >0.25 s total <1 s | median 9 gaps, 3.1 s total (whisper boundary gaps inflate this) | DISAGREE in number; agree in feel: only ~1 gap >0.4 s |
| "You see," pivot 14/20 | 17/25 use it, but **two jobs**: early setting (8 videos, ~3.4 s) and late mechanism (11 videos, ~76 %) | PARTIAL: add the early "You see, [rule]" use |
| Mystery "Wait…?" ~1 per video | 17/25 have a mystery beat; literal "Wait" in 7/25 | AGREE |
| 1-2 exaggeration jokes | median 2, 21/25 | AGREE |
| Analogy often | 6/25 explicit everyday analogy | WEAKER than bible says; most mechanisms are told directly |
| Two modes (story he / imagine you) | 19 story, 5 you, + explainer mode (5) and pure fiction (15, 17) | AGREE + add explainer mode |
| Ends on last word, no CTA | tail 0.28 s, 0/25 CTA | AGREE |
| Sentence median 13.5 | 13 | AGREE |

---

## 7. Samulation template ("how did this really work / how is this legal")

Target 45 s ≈ **165 words, 12-13 sentences** at 3.7 w/s (models: 06, 07, 10, 11, 13). For 55-60 s: 205-220 words, 15 sentences.
Timings are word onsets for a 45 s cut (scale linearly).

```
[0.0 s]  HOOK (8-15 words, past tense, one picture, no context, no answer)
         "He [did SELF-SABOTAGING / FORBIDDEN ACT] [concrete object] [odd number]."
         or legal mode: "[ACT] is illegal, yet [WHO] did it [every day / in front of police]."
[3.3 s]  "You see, [WORLD RULE / LAW in ≤20 words: who, where, what's at stake]."
[7 s]    STAKES: "And [whoever/if] ___, [big reward/loss]."
[9 s]    MOCKER LINE: "[Boss/cop/rival] goes, '[≤10-word doubt with a joke]'."  (0.4-0.6 s gap before the quote)
[12 s]   "But he won't [stop/explain]."   ← ≤6-word punch
[14-28 s] ESCALATION x3 (one per ~5 s, time-skip connectors):
         "So, ___."  "Then, [the next morning / by Friday], ___."  "[Number ladder: at 15… at 20…]."
         include 1 exaggeration joke: "[X] so [Y] that [absurd image]."
[25 s]   MYSTERY (≈55 %): "Wait, [repeat the odd detail]?"  →  "Well, ___."
[33 s]   PIVOT (≈73-76 %): "You see, [the real law / mechanism / loophole] ___."
         optional analogy: "Ever ___? [everyday thing behaves the same way]."
[38 s]   "So [how he exploits it, concrete, 1 sentence]."
[42 s]   PAYOFF (last 1-2 sentences, call back the hook object, ironic):
         "[The mocker/system] ___ — and [hook object] [final reversal]."
         or "And that's how [everyday thing] was invented."
[45 s]   END on the last word (≤0.3 s tail). No CTA, no question.
```

Blanks for "how is this legal": WHO (an everyman role: clerk, driver, landlord, miner), THE ACT (looks like a crime/mistake),
THE RULE that makes it legal (state it in one plain sentence after "You see,"), THE ENFORCER who doubts (cop, judge, inspector, boss),
THE SPECIFIC NUMBERS (2-5, odd: 39 ft, 82 holes, 15 min), THE CALLBACK OBJECT for the last line.

## 8. Checklist (score each script before VO)

1. [ ] Sentence 1 is a picture of an odd/self-defeating act, 8-15 words, ≤3.5 s, no topic name, no answer, no "Did you know".
2. [ ] Something rewards the hook by 5.5 s (rule, stake or a doubter's line).
3. [ ] 2 in-character lines (≤10 words each), at least one mocking/doubting; introduced with "goes,"/"says,".
4. [ ] 2 exaggeration jokes (claim vs absurd image) and ≥1 visual simile ("like a ___").
5. [ ] 3-5 escalation beats, each a new concrete picture, joined by So/But/Then (≈30 % of sentence starts).
6. [ ] One mystery question ("Wait, ___?" / "But how?") around 50-60 %.
7. [ ] Answer withheld until ~70-80 %; pivot word "You see," (or "Here's the thing") opens it; mechanism ≤2 sentences, plain words.
8. [ ] Last sentence calls back the hook object and flips it; ≤20 words; video ends ≤0.3 s after.
9. [ ] 3.6-3.9 words/s; median sentence ~13 words, with ≥2 punch sentences ≤5 words; only pause = before quotes.
10. [ ] ~4-6 specific numbers, at least one repeated as a ladder.
11. [ ] Every sentence is drawable as one shot (for word-timed actions: the verb of each sentence = the action keyframe).
12. [ ] Title ≠ hook: 3-7 words, "…" / "…" / "…", answer hidden.

## 9. Top rules ranked by retention impact

1. **Hook = strangest visible act, ≤15 words, no context** (25/25; median 14 words, 3.4 s).
2. **Withhold the answer to ~75 %** (median payoff 48 s / 75 %), but reward curiosity every ~5 s (first mini-payoff 5.4 s).
3. **"You see," as the hinge** — early for the rule (3.4 s) and/or late for the mechanism (76 %) — 17/25.
4. **Doubters on screen**: short mocking dialogue lines (19/25 have dialogue, 15/25 mockery) make the payoff a revenge beat.
5. **End on an ironic callback to the hook object, no CTA, 0.28 s tail** (25/25).
6. **Constant 3.7 w/s, long-clause + short-punch rhythm**, pauses only before quotes.
7. **2 exaggeration jokes + similes** that become props on screen (21/25).
8. **Specific odd numbers as ladders** (median 5 per video) to show escalation over time.
