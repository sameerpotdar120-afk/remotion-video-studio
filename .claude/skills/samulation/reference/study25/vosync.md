# Voice-over sync: how on-screen events are timed to narration words (25 reference shorts)

Work folder: `/root/proj/refs/work/vosync/` (scripts `lib.py`, `shots.py`, `an_shots.py`, `an_cam.py`, `trig.py`, `actverb.py`,
`capcal.py`, `strip.py`; frame strips in `strips/*.jpg`; per-frame features in `feat/`).
Frame offsets are **event frame minus word onset frame** at 30 fps (negative = before the word). Word onsets are `tx/NN.json` `s` × 30.

## 0. The clock is reliable (calibration)

| check | n | median | IQR | meaning |
|---|---|---|---|---|
| burned-in caption change − whisper word start (all 25 videos, caption white-mask IoU < 0.45) | 3 499 | **−0.6 f** | −2.0 … +0.8 f | the editors' captions follow the same word times to about 1 frame |
| audio 50 % energy rise − whisper start (words after a ≥0.15 s gap, 5 videos) | 127 | **0.0 f** | −1.5 … +0.6 f | whisper `s` sits on the acoustic onset |

So the whisper start times are good to about ±2 f, and every offset below is the real offset from the sound of the word.
In our pipeline, `words.json` from any ASR is good enough once the hand-fixed onsets are within about 2 f.

## 1. Shot changes are locked to sentence starts

Detector: a run of luma-histogram changes (`cut` > 0.08), checked with an 18×32 colour blend fit. A shot change counts only when every
in-between frame is α·before + (1−α)·after, with residual < 0.3 of the change (this rules out whip pans and FX). Result: 323 shot changes in 1 417 s.
**90 % are cross-dissolves and 10 % are hard cuts.**

| quantity | value |
|---|---|
| shots per video | median 14 (6-22); **one shot change every 4.1 s**, i.e. 0.92 per sentence (377 sentences, 348 shots) |
| shot length | p10 0.92 s, p25 1.8 s, **median 3.2 s**, p75 5.3 s, p90 7.9 s |
| dissolve length | p10 7 f, p25 8 f, **median 10 f**, p75 13 f, p90 15 f |
| dissolve START − first word of the sentence (the 169 changes within ±10 f of a sentence start) | **median +0.4 f, IQR −2.2 … +2.6 f** |
| dissolve END − first word of the sentence | median +10 f (IQR +6 … +13) |
| share of shot changes within ±8 f of a clause onset | **68 %**, against 29 % for randomly shifted times (null) |
| sentences that get a shot change at their first word (−8 … +12 f) | **45 %**; non-sentence clauses (comma, pause): 15 % |
| histogram of dissolve start vs sentence onset, lags −7 … +3 f | 3 1 1 0 2 1 **11** 1 4 9 10 13 14 21 20 19 13 (peak −2 … 0) |
| the 93 changes in the middle of a sentence: dissolve END − nearest key word | median +0.4 f (IQR −4.6 … +2.6): the new picture is complete on the noun or verb it shows |

**Rule:** a new staging starts *on* the first word of a sentence. The dissolve begins 0-2 f before that word and runs 10 f. A mid-sentence change
is timed so that it **ends** on the key word it illustrates (e.g. 04 "threw" ends at −1 f, 17 "pull" at −1 f, 02 "fired": hard cut at 0 f).

The remaining 55 % of sentences change staging inside the same shot instead: a crash zoom or whip to an insert, or a new action by the character.

## 2. The camera breathes with the sentences, not with single words

The camera never stops. Per-frame speed (pan + zoom + roll, px/f at 1080 wide, transitions excluded) is p25 2.3, **median 8.3**, p75 22, p90 40 px/f;
28 % of frames move faster than 20 px/f. Camera speed averaged around word onsets (z-score per video, 3-frame bins):

| trigger (n) | −12 f | −6 f | −3 f | 0 | +3 f | +6 f | +9 f |
|---|---|---|---|---|---|---|---|
| sentence onset (352) | −0.23 | −0.22 | −0.18 | −0.06 | +0.01 | **+0.10** | +0.07 |
| key word mid-sentence (2 565) | +0.04 | +0.05 | +0.03 | +0.02 | +0.01 | −0.01 | −0.02 |
| function word (1 723) | +0.04 | +0.04 | +0.05 | +0.06 | +0.07 | +0.08 | +0.07 |

- The camera **eases off over the last ~12 f of each sentence** and **picks up 3-9 f after the next sentence starts**.
- Speed is not tied to individual key words on average. Fast moves (peaks > 20 px/f, 507 found, about 21 per minute, median 28 f long) fall near words no more often than chance (null 0.41 vs observed 0.44 within ±3 f of key words).
- The *word-locked* camera beats are the **crash zooms / whips to an insert**, checked frame by frame: 23 "holes" (starts −2 f against the caption, lands on the drill close-up in 8 f), 01 "Rail" (−3 f), 05 "smash" (+2 f), 21 "in" (+2 f), 16 "gun" (−2 f, lands on the holster).
  These start −3 … +2 f from the word and land 6-10 f later.

## 3. Local actions: measured examples (40 events, 21 videos)

A global per-frame residual (shift-compensated, caption band masked), averaged around 231 action-verb onsets, is flat (±0.1σ). Actions are small,
local and drowned by the camera and the textured backgrounds. So the action timing below was **measured by hand, frame by frame,
from the contact sheets** (strips in `work/vosync/strips/`). "Onset" is the first changed frame, "contact" the impact or peak frame.

| # | vid | word (onset f) | what happens | offset (f) |
|---|---|---|---|---|
| 1 | 01 | "gaps" (caption f14) | saw sparks start at the rail | 0 … +2 |
| 2 | 01 | "railroad" | the train's steam puff rises | ≈ 0 |
| 3 | 01 | "kicks" (f1848) | rail starts to bend +3, sparks +7, full S-bend on "sideways" | **+3 / +10** |
| 4 | 01 | "Rail" (sentence, f1737) | whip from rail close-up past the hero to a wide shot | −3 start, lands +7 |
| 5 | 02 | "fired" (f36) | hand presses FIRE button at −6 (on "to get"), **hard cut on "fired"**, chair ejects | cut 0, launch +2 … +10 |
| 6 | 02 | "feet (up)" (f1228) | both characters swing their feet onto the desk | 0 … +4 |
| 7 | 03 | "wakes" (f1174) | eyes open, sits up holding the bat | +1 … +5 |
| 8 | 04 | "called" (f738) | emperor's laugh changes to a scowl | +1 |
| 9 | 04 | "falls" (f118) | gesture and expression +2, ball drops +4 … +8 | +2 |
| 10 | 04 | "run!" (caption f136) | eyes widen, sweat drop; speed-line burst +8 | 0 / +8 |
| 11 | 04 | "threw" (f809) | dissolve to the city gate finishes; inventor thrown out through the arch | −1 / +3 … +17 |
| 12 | 05 | "smash" (f195) | ball in flight, whip to the deck +2, **splinter burst +6**, splinters spread over "through" | +2 / +6 |
| 13 | 05 | "punched" (f1291) | orange punch flash on the barrel; flashes repeat on the next stressed syllables | −1 |
| 14 | 05 | "they fired" (f418) | camera push from the pirates onto the cannon | 0 start |
| 15 | 06 | "stamped" (f688) | priest's arm comes down with the stamp | +2 … +6 |
| 16 | 08 | "…" (in f795) | push-in on the house, then the **door bursts on "in"** | +2 on the particle |
| 17 | 08 | "and (rips)" (f801) | whip into the corridor | −4 … 0 |
| 18 | 09 | "spin" (f803) | prize wheel starts rotating, spins through f818 | 0 |
| 19 | 10 | "dropped" (f18) | scientist tips off the tower, camera tilts down with him | 0 / cam +4 |
| 20 | 10 | "landed" (f725) | body lands with a dust puff | +2 |
| 21 | 10 | "crashes" (f349) | NOT literal: a "CRASH SURVIVORS" banner on the support-group set | n/a |
| 22 | 12 | "grabs" (f180) | dissolve starts on "captain" (−4), the grab itself lands on "him by" | −4 / +12 |
| 23 | 12 | "clangs" (f597) | hook flies in (camera swings with it from −6), catches the rail | +2 |
| 24 | 13 | "smash" (f483) | balls hit the plates, ripple rings | +2 … +12 |
| 25 | 13 | "hits" (f762) | brain-wave graph spikes | 0 … +6 |
| 26 | 16 | "grab" (f416) | hand to gun +1, gold speed-line burst +5, crash zoom to the holster lands on "gun" | +1 / +5 |
| 27 | 17 | "pull" (f205) | dissolve into the slot-machine room ends | −1 |
| 28 | 18 | "jumps" (f927) | face changes to surprise, glasses pop; number "10" pops in on "out" | +2 |
| 29 | 19 | "shovel" (f1317) | she lifts the shovel; digs on "dig him" | 0 … +12 |
| 30 | 21 | "in (is)" (f699) | whip into the cell, pink cell revealed | +2 … +8 |
| 31 | 22 | "smashes" (f784) | pick raised at −4 (on "He"), strike +3, chunk flies on "a chunk" | −4 / **+3** |
| 32 | 22 | "lights" (f1548) | torch approaches −8, sparks at the fuse +2 … +6, dissolve away +6 | +2 |
| 33 | 23 | "reaches" (f741) | soldier already leaning on "soldier" (−10); hand toward the rope | −10 … 0 |
| 34 | 23 | "(for) it" (f750) | commander's red anger burst | +4 |
| 35 | 23 | "slaps" (f772) | **slap impact ring, helmet flies** | **+5** |
| 36 | 23 | "rips **off**" (rips f1459, off f1467) | cloth lifts +5 from "rips", peak flip on "off" | 0 on "off" |
| 37 | 23 | "The spark" (f1518) / "races" (f1533) | dissolve to the fuse close-up +3 … +9; spark runs along the rope from "races" | +3 / 0 |
| 38 | 23 | "blast **off**" (blast f1811) | dissolve starts on "blast" (0), launch burst on "off" | 0 / +2 on "off" |
| 39 | 24 | "smashes" (f84) | red car hits the white car +4 … +12, **hard cut to a close-up on "right"** | +4 / cut +2 |
| 40 | 24 | "…" (f1412) | brake lights flare | +2 … +6 |
| 41 | 24 | "hits" (f236) | pedestrian knocked back by the car | +3 |
| 42 | 25 | "snap" (f817) | expression change, then the hand gesture | +1 / +2 … +12 |
| 43 | 25 | "flips" (f1361) | car tips on "it" (−7), airborne and rotating on "flips" | −7 / +1 |

Summary of those 43 events:

| event class | n | offset vs the word that names it | range |
|---|---|---|---|
| expression / face swap (instant, 1 f) | 7 | **median +1 f** | 0 … +2 |
| contact / impact / ignition (the frame of the hit) | 16 | **median +2 f** | −1 … +6 |
| FX burst (impact ring, splinters, speed lines, flash) | 8 | median +5 f | +2 … +8, lasts 6-12 f |
| anticipation / wind-up (raise, lean, approach) | 6 | median −6 f | −10 … −4 |
| continuous action start (spin, fall, race, rotate) | 5 | 0 f | −1 … +1 |
| dissolve finished on the noun or verb it shows | 5 | −1 f | −4 … 0 |
| hard cut on a key word | 3 | 0 … +2 f | |
| crash zoom / whip start | 7 | −2 … +2 f | lands +6 … +10 |

Phrasal verbs: the contact lands on the word that **completes** the action ("…", "rips **off**", "blast **off**"),
not on the verb. Repeated actions (punches, drill turns) hit on each stressed syllable after the verb.

## 4. Beat density, holds, staging, literalness

- **Visual beats** (a shot change, a crash zoom, a pose or action change, an FX burst), counted on fully annotated 2-s sheets (01 s01, 23 s01/s13/s25/s26):
  3-4 beats per 2 s = **1.5-2 beats/s, one every 15-20 f, about one per 2 words** (speech runs at 3.70 words/s across the 25 videos). In practice every key noun or verb gets something.
- **Holds:** between beats a pose or expression is held for **15-30 f**, while idle sway, blinks and the camera drift keep running. After an impact the
  result (bent rail, flown helmet, open door) holds until the next sentence's dissolve, usually 0.5-1.5 s.
- **Staging per sentence:** 45 % of sentences open on a new shot (dissolve). Another ~25-30 % get a crash zoom or whip to an insert. The rest continue the shot with a new action.
  Mid-sentence shot changes (0.40 per sentence; 29 % of sentences have one) almost always cut or dissolve **to the object of the sentence** (drill holes, holster, fuse, cell).
- **Literalness:** in 41 of the 43 checked action phrases the exact verb happens on screen (about 95 %). The two exceptions were a banner standing in for "crashes" and a corridor dolly for "…".
  Similes are staged literally too ("…": the rail itself snakes). Numbers and nouns get inserts: 82 holes drilled, a wheel, a graph spike.

## 5. Agreement with the bridge skill's reports

| bridge report says | 25 references show | verdict |
|---|---|---|
| motion.md: reactions land **0-3 f before** the word; `LEAD = 2/FPS` | face swaps **+1 f** (0 … +2), contacts **+2 f**, wind-ups −4 … −10 f | **DISAGREE on sign**: hold the wind-up early, put the swap or contact 0-2 f *after* the onset |
| motion.md: hammer: held wind-up, 1-frame strike on the word, 5-frame burst | wind-up −6 f, contact +2 f, burst +5 f lasting 6-12 f | agree in shape; burst a little later and longer |
| motion.md: "…" | camera eases off over the last 12 f of a sentence, re-accelerates +3 … +9 f into the next; crash zooms start −3 … +2 f on key nouns | new data |
| SKILL.md: XFADE crossfades at place/time changes only | dissolves (10 f) on **every second sentence**, starting at the first word | **DISAGREE**: about 4× more dissolves, every 3.2 s (median shot length) |
| SKILL.md: every visual reaction lands 0-3 f before its word | see the first row | change to "…" |

## 6. Rules for our pipeline: an event table keyed to word indices

Add `src/videos/<name>/events.ts`. Every visual change is authored against **word indices** of `voice/words.json`, never against hand-typed seconds:

```ts
// f(word) = Math.round(words[i].s * 30) + off
type Ev =
 | { w: number; kind: "dissolve"; off?: -1; dur?: 10; to: ShotId }          // sentence start: off -1..0, dur 8-13
 | { w: number; kind: "cut"; off?: 0; to: ShotId }                           // a key-word punch, about 10 % of changes
 | { w: number; kind: "crash"; off?: -2; dur?: 8; to: CamKey }               // whip or crash zoom to an insert; lands +6..+8
 | { w: number; kind: "expr"; who: string; expr: Expr; off?: 1 }             // instant swap, 1 frame
 | { w: number; kind: "act"; who: string; act: ActId; wind?: 6; off?: 2; hold?: 20 }  // wind-up starts off-wind, contact at off
 | { w: number; kind: "fx"; fx: FxId; at: V3; off?: 4; dur?: 9 }             // burst after contact: +2..+8, 6-12 f
 | { w: number; kind: "loop"; act: ActId; off?: 0; until?: number };         // spin, race, fall: starts on the onset
export const EVENTS: Ev[] = [
  { w: 0,  kind: "dissolve", to: 1 },
  { w: 3,  kind: "act", who: "hero", act: "drill", wind: 4, off: 2 },
  { w: 3,  kind: "crash", to: "drillCU" },
  ...
];
```

Default offsets (frames from the word onset):

| kind | off | duration | notes |
|---|---|---|---|
| sentence dissolve | −1 (−2 … 0) | 10 (8-13) | linear crossfade; both shots keep moving |
| mid-sentence dissolve or cut to an insert | **ends** on the key word: start = −dur | | |
| hard cut | 0 | | use on the hook and on punch nouns |
| crash zoom / whip | −2 (−3 … +2) | 8 (6-10) | ease-in-out, ends framed on the object |
| expression swap | +1 | 1-frame switch, hold ≥ 15 f | |
| action wind-up | −6 (−4 … −10) | held to the contact | anticipation can start on the previous word |
| action contact / impact | +2 (0 … +4) | 1-3 f strike | put the contact on the particle of phrasal verbs ("in", "off", "down") |
| FX burst | +4 (+2 … +8) | 6-12 f, debris to +20 | |
| continuous action | 0 | covers the word, often into the next one | |
| camera ease | slow to about ½ speed over the last 12 f of a sentence, new move from +3 f | | per-shot `CAMS` keys |

**How to author it:**
1. Split `words.json` into sentences (punctuation, or a gap > 0.25 s). Give each sentence a `dissolve` (or keep the shot and add a `crash`), so about 50 % new shots, 25 % crash zooms and 25 % same-shot actions.
2. Tag every content verb and noun in the script (a column in `SCRIPT.md`). Each action verb gets one `act` (wind-up + contact), and impacts get an `fx`. Each concrete noun the viewer has not seen yet gets a `crash` or a mid-sentence dissolve that **ends** on it.
3. Fill the gaps: wherever 20 f pass with no event, add an `expr` swap or a small `act` (look, point, flinch). Target 1.5-2 events/s.
4. Illustrate literally: the verb in the VO is the action on screen, and similes are staged as the thing itself.
5. **Lint** (`scripts/lint_events.ts`, run before every render):
   - every sentence has a staging event within −8 … +12 f of its first word;
   - every tagged verb has a contact within −1 … +6 f;
   - no gap longer than 30 f without an event;
   - no contact earlier than −2 f (the old `LEAD` habit);
   - no dissolve shorter than 6 f or longer than 15 f.
   Print a table: word, frame, event, offset.
6. **QA:** render a contact-sheet strip (as in `work/vosync/strip.py`, word under each tile) around every tagged verb, and check the contact frame by eye.

Mapping to the bridge template: `story.ts` `SHOTS`/`XFADE` are generated from the `dissolve`/`cut` events; `CAMS` keys come from `crash` events plus a sentence-end ease;
`KICKS` and the FX come from `act`/`fx`; `cast.ts` `exprMarch` reads the `expr` events, with `LEAD` replaced by `+1 f`.

## 7. Top rules ranked by impact

1. **Every key verb happens on screen, on its word:** contact +2 f (0 … +4) after the onset, a held wind-up from −6 f, the FX burst +4 f for 6-12 f. About 95 % literal.
2. **New staging on sentence starts:** a 10-f dissolve starting at −1 f on the first word of about half the sentences; median shot 3.2 s, never longer than about 8 s.
3. **Beat density of 1.5-2 per second** (about every second word); never 30 f without a visible change.
4. **Mid-sentence changes end on the noun:** a crash zoom (−2 f, 8 f long) or dissolve that lands on the object as it is named.
5. **Phrasal verbs hit on the particle** ("…", "blast **off**").
6. **Expression swaps are instant, +1 f, and held ≥ 15 f.**
7. **The camera eases off in the last 12 f of a sentence and restarts 3-9 f into the next.** It never stops.
8. **Author everything as word-index events with a lint pass.** Never hand-typed seconds: this is the direct fix for "…".

Caveat: the automatic local-action detector (shift-compensated residual) showed no word locking (±0.1σ). Section 3 therefore rests on 43 hand-measured events.
Treat the action offsets as ±2 f.
