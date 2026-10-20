# Micro-frame analysis — "How Did America Become Independent" (reference)

Measured from the uploaded 720p file, frame by frame. **Nothing from this video is used as an asset** —
only measurements of technique. No frame, audio clip or image from it is committed to this repo.

**Source:** 1280×720, 30.000 fps exact, 5062 frames, 168.733 s, AAC 44.1 kHz stereo.

**Method:** all 5062 frames decoded; per-frame-pair camera transform by Shi-Tomasi features + pyramidal
Lucas-Kanade optical flow + RANSAC partial-affine fit (96.8% of frames got a reliable fit); residual local
motion measured after warping out the camera; true zoom magnitudes re-measured first-to-last frame with SIFT
so they don't accumulate error; audio analysed at one hop per video frame (1470 samples).

> **Known gap:** word-level ASR was not possible — the environment's network policy blocks huggingface.co, so
> no Whisper model could be fetched. The offline recogniser that did run produced unusable word identities
> ("why do these dirty little is united" for "Why did these 13 British colonies unite"). **VO alignment below is
> therefore phrase-level, from the frame-exact speech envelope — not word-level.** Everything else is measured.

---

## 1. What this video is, mechanically

| | |
|---|---|
| Runtime | 168.73 s |
| Hard cuts | **16** in 168.7 s — one per 10.5 s |
| Everything else | continuous camera moves on maps |
| Camera moving | **66.5%** of frames |
| Truly static | **33.5%** of frames |
| VO speaking | **81%** of runtime (79 phrases, median 1.17 s each) |
| Integrated loudness | **−14.1 LUFS**, LRA 2.6 LU, true peak **+1.0 dBFS** (it clips) |
| SFX transients | 135 detected |
| Camera rotation | **essentially zero** — p1/p99 = −0.25°/+0.34° per frame |

The last row matters most for us: **the map camera never rolls.** It only pans, pushes and pulls. Any rotation
in our build should be in the props and characters, never the map.

---

## 2. The map camera grammar — the core

### 2.1 Frame budget

| Phase | Frames | % | What it is |
|---|---|---|---|
| HOLD | 1836 | 36.3% | dead still |
| pan | 751 | 14.8% | 1.2–6 px/f |
| push-in | 639 | 12.6% | slow Ken-Burns in |
| drift | 591 | 11.7% | sub-pixel float, never truly frozen |
| pull-out | 477 | 9.4% | slow Ken-Burns out |
| pan-fast | 282 | 5.6% | 6–100 px/f |
| PUNCH-IN | 221 | 4.4% | 3–8.8 %/f |
| PUNCH-OUT | 208 | 4.1% | −3 to −10 %/f |
| WHIP | 57 | 1.1% | >100 px/f |

### 2.2 The punch sandwich — the single most repeated structure

A zoom punch is **never** a linear snap. It is always eased by wrapping it in slow zoom at ~1%/frame:

```
pull-out  ~ -1.0 to -1.3 %/f   for  5- 8 f     ease in
PUNCH-OUT ~ -3.0 to -6.3 %/f   for  7-14 f     the punch
pull-out  ~ -1.0 to -1.2 %/f   for 10-18 f     settle
```

and mirrored for push-in. Measured instances (true scale, SIFT, first-to-last, high inlier count only):

| Time | Kind | Frames | True zoom | %/frame | Inliers |
|---|---|---|---|---|---|
| 19.37 s | PUNCH-IN | 13 | +82.3% | +5.13 | 50 |
| 61.60 s | PUNCH-IN | 17 | +92.7% | +4.18 | 81 |
| 93.60 s | PUNCH-IN | 10 | +103.4% | +8.21 | 202 |
| 115.30 s | PUNCH-IN | 6 | +27.4% | +4.97 | 216 |
| 116.93 s | PUNCH-IN | 17 | +112.2% | +4.81 | 61 |
| 132.97 s | PUNCH-IN | 6 | +16.1% | +3.03 | 236 |
| 134.37 s | PUNCH-IN | 8 | +28.9% | +3.69 | **467** |
| 143.50 s | PUNCH-IN | 10 | +43.7% | +4.11 | 70 |
| 63.20 s | PUNCH-OUT | 10 | −26.6% | −3.38 | 160 |
| 66.80 s | PUNCH-OUT | 10 | −27.7% | −3.55 | 100 |
| 84.63 s | PUNCH-OUT | 6 | −33.6% | −7.87 | 175 |
| 102.27 s | PUNCH-OUT | 10 | −43.2% | −6.10 | **310** |
| 111.47 s | PUNCH-OUT | 14 | −48.2% | −4.93 | 106 |
| 140.30 s | PUNCH-OUT | 10 | −30.2% | −3.92 | 113 |
| 145.60 s | PUNCH-OUT | 9 | −22.6% | −3.15 | 112 |
| 160.77 s | PUNCH-OUT | 10 | −63.1% | −10.50 | 136 |

**Punch-in median 1.88×, punch-out median 0.64×, both over ~10 frames.**

### 2.3 Rates to build against

| Move | @30 fps measured | **@60 fps (ours)** |
|---|---|---|
| slow push/pull (Ken-Burns) | ±0.7 to ±1.5 %/f | **±0.35 to ±0.75 %/f** |
| zoom punch | ±3 to ±8.8 %/f over 6–17 f | **±1.5 to ±4.4 %/f over 12–34 f** |
| drift (never-frozen float) | 0.25–1.2 px/f | **0.12–0.6 px/f** |
| pan | 1.2–6 px/f | **0.6–3 px/f** |
| pan-fast | 6–40 px/f | **3–20 px/f** |
| whip-pan | 120–260 px/f over 1–6 f | **60–130 px/f over 2–12 f** |
| rotation | **0** | **0** |

Pan figures are at 1280 px wide. Scale ×3 for our 3840 px: a 1 px/f drift becomes 3 px/f, a 200 px/f whip
becomes 600 px/f.

### 2.4 The whip-pans

17 frames exceed 120 px/f. They come in bursts of 1–6 frames, and the big ones **combine a pan with a zoom-out**
(e.g. 131.10–131.27 s: six consecutive frames at ~140 px/f with zoom 0.79 per frame). A whip is a pan *and* a
pull, not a pan alone.

---

## 3. Cuts and transitions

16 hard cuts, frame-exact:

```
39.40  50.17  51.70  56.43  59.70  70.67  72.90  74.47
84.90  94.73 104.50 117.87 126.43 127.47 158.50 162.83
```

Note the cluster 50.17–59.70 s (4 cuts in 9.5 s) — the Stamp Act list, the only rapid-cut passage in the film.
And the 1.03 s pair at 126.43/127.47 — that is the black hold, below.

**Black hold:** frames **3793–3823 = 31 frames = 1.033 s** of pure black at 126.43 s ("the war begins").
There is a second, 2-frame black at 68.23 s.

**The style switch is a push-wipe, not a white flash.** At 6.2–6.9 s the parchment map slides in from the right
behind a hard near-vertical seam over ~18 frames (f189→f207); the bright edge is the seam, not a flash. A 3D
eraser prop then rubs the flag off the colonies over f210–f230. *(This corrects `reference-breakdown.md` §2.7,
which recorded it as "white flash/wipe".)*

**Sustained bright passage** f4574–4735 (152.5–157.8 s) is the Declaration macro — a bright parchment plate,
not a transition.

---

## 4. Staging — where action is allowed to happen

Local-motion heat map (camera removed), 6 rows × 10 columns, % of peak:

```
         0%   10%   20%   30%   40%   50%   60%   70%   80%   90%
y  0%    36    24    27    33    34    37    34    28    24    23
y 16%    33    27    41    59    63    73    59    36    26    24
y 33%    27    31    45    67    92   100    81    36    25    25
y 50%    31    31    36    61    99    77    60    37    26    25
y 66%    28    28    33    51    58    40    33    33    27    25
y 83%    27    28    30    32    33    27    21    24    23    20
```

**Everything that moves lives in x 30–65%, y 15–60%.** The outer quarter of frame on every side is nearly dead.
Peak density sits at (50%, 33%) and (40%, 50%) — centre, slightly above middle. Titles and timeline rulers sit
in the dead top band; the live action never competes with them.

---

## 5. Character and prop motion

### 5.1 The pop-in curve (measured, static-camera events only)

Normalised extent, 1.00 = settled size. Representative measured curves:

```
48.53 s  0.17 0.66 0.88 0.88 0.85 1.00 1.08 1.10 1.07 1.04 1.01 1.00
74.90 s  0.05 0.07 0.72 0.85 0.47 0.91 1.00 1.06 1.04 1.02 1.00 1.00
79.17 s  0.00 0.74 0.86 0.88 0.75 0.96 1.07 1.15 1.14 1.13 1.12 1.12
123.03 s 0.00 0.33 0.91 1.03 1.07 1.07 1.04 1.03 1.03 1.04 1.05 1.01
```

**The rule:** 70–90% of final size within **1–2 frames**, peak **106–115%** at frame **+3/+4**, settled by
**+6 to +9**. Overshoot median **1.068×**. At 60 fps: reach 80% in 2–4 f, peak ~110% at f+7, settle by f+16.

That is a spring, not an ease. Remotion equivalent: `spring({ damping: 12, mass: 0.5, stiffness: 180 })` —
tune until the first peak lands ~10% over at frame 7 of 16.

### 5.2 The staggered musket volley (79.67–80.40 s)

Inspected frame by frame. Each soldier's musket rotates about a **shoulder pivot** from roughly −10° (held low)
to ~+35–40° (aimed), taking **8–10 frames** per soldier, with each soldier starting **4–6 frames** after the
previous one. Nothing is redrawn — it is rigid-part rotation. The eyes change expression **mid-action**:
neutral dots at f2390 → angry V-brows by f2398. At 60 fps: 16–20 f per raise, 8–12 f stagger.

### 5.3 The stamp (DEBT, 19.3–20.0 s)

The stamp block enters at the **top of frame, huge and foreshortened** (near camera), then travels down and
**shrinks into the map** over ~14 frames (f580→f594) while the camera simultaneously punches in +82%. The mark
("DEBT", red, slightly rotated) appears under the block on landing at ~f596–600. So a stamp is a depth move
toward the map plane, not a 2D scale-down — and the camera punch runs underneath it.

### 5.4 Secondary motion

Only **25%** of frames have essentially no local motion, and the camera drifts sub-pixel for another 11.7% of
frames. Nothing in this film is ever completely frozen except the 31-frame black.

---

## 6. The audio mix — measured

### 6.1 Clean levels

Frames were classified so VO and SFX never contaminate each other's measurement
(VO+SFX 1092 f · VO only 3010 f · SFX only 200 f · bed only 761 f):

| | Median, full band |
|---|---|
| **Music bed alone** (no VO, no SFX) | **−30.1 dBFS** |
| **VO alone** (no SFX) | **−19.0 dBFS** |
| **VO sits +11.1 dB above the bed** | |

> This corrects `reference-breakdown.md` §4.1, which put VO "20–25 dB above the music bed". That figure
> compared VO RMS against the bed floor *in pauses*, which includes the music dropouts. Measured cleanly,
> the gap is **+11 dB**.

Mix is near-mono: L/R correlation 0.933, side channel 14.6 dB below mid. VO is dead centre.

### 6.2 How SFX sits under VO — the actual technique

Measured as the **lift** a hit adds over the mix in the 8 frames before it, per band:

| Band | Lift under VO (median) | Lift in VO gaps (median) |
|---|---|---|
| Full band | **+6.2 dB** | −2.4 dB |
| Low < 160 Hz | +6.2 dB | −0.6 dB |
| **High > 6 kHz** | **+24.6 dB** | +23.9 dB |
| Side (stereo) | +3.3 dB | +3.2 dB |

**This is the whole trick.** SFX only lifts the overall mix by ~6 dB — it is genuinely quiet against the voice,
exactly as you said. But in the band above 6 kHz, where the voice has almost no energy, it lifts **+24.6 dB**.
The hits read as sharp and present *without ever fighting the VO*, because they live in the spectrum the voice
isn't using: **>6 kHz for pops, ticks, whooshes and paper; <160 Hz for impacts and stamps.**

Absolute levels at a hit: low band −19.4 dBFS, high band −28.0 dBFS under VO.

### 6.3 What happens when the VO stops

52 VO gaps ≥ 0.3 s. In them:

- **46%** contain an SFX hit
- gap peak vs the preceding VO level: median **−1.9 dB** — gaps are *not* louder
- but **18 of 52** gaps peak *above* the preceding VO
- gap floor: **−28.9 dBFS** (≈10 dB below VO)

So the refinement on your instinct: in the gaps SFX does carry the film, but **not by getting louder** — it
carries because it is the only thing there, and the mix drops ~10 dB into it. A few hits (18) are allowed to
punch above the VO level, and those are the dramatic ones.

### 6.4 Music dropouts — silence as an impact

Eight places where the bed falls >14 dB under its own median:

| Time | Frames | Floor |
|---|---|---|
| 23.27–23.43 s | 6 | −52.7 dBFS |
| 33.67–34.07 s | 13 | −78.1 dBFS |
| 94.40–94.60 s | 7 | −46.0 dBFS |
| 101.67–101.90 s | 8 | −60.3 dBFS |
| 116.03–116.30 s | 9 | −85.1 dBFS |
| **125.57–125.93 s** | **12** | **−86.6 dBFS** |
| 161.77–162.17 s | 13 | −53.3 dBFS |
| 168.40–168.73 s | 11 | −46.1 dBFS |

The important one: **125.57–125.93 s is near-total silence, and the 31-frame black hold starts 15 frames later
at 126.43 s.** Silence first, then black. The audio drops out *before* the picture does.

---

## 7. The sync law

- Visual events with an SFX within **±4 frames (133 ms)**: 19/48 = **40%**
- within ±10 frames: 30/48 = **62%**
- When they do sync, offset median **+1 frame** — the **SFX lands one frame after the picture moves**.

> This tempers `reference-breakdown.md` §4.3's "every visual pop-in or stamp gets its own SFX". Measured, only
> about 40% of detected visual events have a tight-synced hit. (Part of that is my detector catching character
> motion as well as pop-ins.) The usable rule is the offset, not the coverage: **when you sync, sync at +1 frame,
> not 0.** At 60 fps that is +2 frames.

Only **22%** of SFX hits land within ±6 f of a VO phrase onset, and hits split 61 before / 72 after. So SFX is
locked to **the picture**, not to the sentence.

---

## 8. Density — the retention engine

Per 10 s: 3–17 SFX hits, 0–5 visual events, VO 65–100%. The rapid passage is **50–60 s** (17 SFX, 4 cuts) — the
Stamp Act list. The calmest are **60–70 s** and **140–150 s** (3–7 SFX, 0 cuts). It breathes; it is not uniformly
busy.

---

## 9. Build constants for our 4K60 project

```ts
// camera (60 fps, 3840 px wide)
kenBurns:      0.35..0.75   // % scale per frame
punchIn:       1.5..4.4     // % per frame, 12..34 frames, median total 1.88x
punchOut:     -1.5..-4.4    // median total 0.64x
punchEaseIn:   10..16       // frames of ~0.5%/f before the punch
punchSettle:   20..36       // frames of ~0.5%/f after
drift:         0.4..1.8     // px per frame, never zero
pan:           2..9         // px per frame
panFast:       9..60
whip:          360..780     // px per frame, 2..12 frames, ALWAYS with a zoom-out
rotation:      0            // the map never rolls

// props / characters
popIn:         16           // frames to settle
popOvershoot:  1.10         // peak at frame ~7 of 16
musketRaise:   16..20       // frames, rotation about shoulder pivot, -10deg -> +38deg
musketStagger: 8..12        // frames between soldiers
blackHold:     62           // frames (1.03 s)
styleWipe:     36           // frames, hard-edged push from the right

// audio
voAboveBed:    11           // dB
sfxLiftFull:   6            // dB over the mix
sfxLiftHigh:   25           // dB above 6 kHz  <-- where SFX actually lives
gapDrop:       10           // dB the mix falls into a VO gap
sfxOffset:     +2           // frames after the picture
target:        -14          // LUFS integrated (but do NOT clip like the reference: it hits +1.0 dBTP)
```

---

## 10. Corrections to `analysis/reference-breakdown.md`

| Claim there | Measured here |
|---|---|
| 15 hard cuts | **16**, frame-exact list in §3 |
| "White flash/wipe" style switch | **Hard-edged push-wipe from the right**, ~18 f, plus eraser prop |
| VO "20–25 dB above the music bed" | **+11.1 dB** measured cleanly |
| "Every visual pop-in gets its own SFX" | **~40%** tight-synced; the reliable rule is the **+1 frame** offset |
| 29% of frames are holds | **33.5%** truly static, 36.3% labelled HOLD |
| Zoom punch "3–6 f @30" | **6–17 f**, and always sandwiched in ~1%/f ease |

The reference clips: true peak **+1.0 dBFS**, 330 samples at or over full scale. We should hit −14 LUFS with
a −1 dBTP ceiling instead.
