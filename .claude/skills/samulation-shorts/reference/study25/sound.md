# SOUND: 25 reference shorts, measured

Scripts and data: `/root/proj/refs/work/sound/` (`analyze.py` loudness, voice, LTAS and stereo → `res/`; `analyze2.py` minimum-statistics bed, energy-VAD pauses and transition-locked averages → `res2/`; `events.py` SFX bursts, sub hits, clicks and tempo → `res3/`; `aggregate.py` → `agg.txt` holds every table; `spec.py` writes spectrograms with word, cut and event marks to `img/`).
Method: audio decoded at 44.1 kHz stereo. The ffmpeg `ebur128` filter (true peak) and `astats` give I, LRA and TP. My own BS.1770 K-weighting gives the momentary and short-term curves and matches ffmpeg I within 0.2 LU. Word times come from `tx/NN.json`.
**Caveat:** whisper word boundaries run into each other (89 % of the time is inside a word), so I took the voice and bed levels from the audio: an energy VAD plus a per-bin 10th-percentile bed estimate over 2 s windows, with the bias corrected.

## 1. Loudness (all 25)
| metric | median [p10..p90] | notes |
|---|---|---|
| Integrated | **-14.1 LUFS** [-15.1..-14.0] | 18 videos at -14.0/-14.2 and 7 at -15.0/-15.6 (06, 07, 09, 10, 11, 13, 20, the shorter ones) |
| True peak | **-2.1 dBTP** [-3.1..-1.9] | never above -1.7 |
| PLR (TP - I) | 12.0 dB [11.7..12.4] | the same master chain on every video |
| LRA | **2.2 LU** [1.7..2.8] | very flat |
| Short-term p10 / p50 / p95 | -15.3 / -14.3 / -13.1 | the whole video sits in a 2.2 dB band |
| Max momentary | -10.2 LUFS [-11.3..-9.2] | the loudest 400 ms is only about 4 LU above I |
| First 3 s | -14.3 LUFS | **the hook is not louder** than the rest |
| Stereo side - mid | -27.7 dB [-30.9..-23.6] | L/R correlation 0.99, so **effectively mono** (no panned SFX) |

## 2. Voice vs bed
| metric | median [p10..p90] |
|---|---|
| Voice (active 10 ms frames, K-weighted) | **-13.6 LUFS** [-14.6..-13.4] |
| Bed in real pauses (≥150 ms, edges trimmed) | **-32.2 LUFS** [-35.2..-30.4] |
| Bed under speech (minimum statistics) | -34.5 LUFS [-36.7..-32.5] |
| Voice above bed | **≈19-21 LU** (pause level: 18.6; minimum statistics: 20.8 [19.1..22.3]) |
| Bed level over the video (0.5 s steps) | std 2.5 dB, p10-p90 range about 6.5 dB |
| Ducking | **none detectable.** The bed level under speech equals the bed level in pauses within about 2 dB, and the 25-75 Hz band is +2 dB *higher* during speech (median). There is no release ramp after words. |

Bed spectrum (dB relative to the bed total, octave bands 30/60/120/250/500/1k/2k/4k/8-16k): -13 / -10 / **-4 / -6** / -10 / -15 / -16 / -19 / -21. The energy sits at 120-500 Hz; the bed is dark and warm.
Bed tonality (95th-percentile bin minus median bin, 100-2000 Hz): 16.8 dB. The bed is tonal (pads or sustained chords; steady horizontal partials are visible in the spectrograms), not noise or ambience.

## 3. Music
- **Present in all 25**: a continuous tonal bed from frame 0 to the end. No dropout ≥8 dB longer than 1 s in any video; the only one is 11 at 14.5 s.
- **Tempo: no strong beat.** Onset autocorrelation peaks are weak: sub-band ac 0.02-0.30, air band ac 0.02-0.06. The estimates scatter between 55 and 200 BPM with no agreement, so the beds are ambient or underscore and not drum-driven. The highest-confidence cases are 01 at 78 BPM (ac 0.26), 10 at 60, 05 at 107 and 20 at 100. In 01 there are faint hat-like ticks about every 0.7 s.
- **Beat changes** are small. Swells of ≥5 dB above the median for ≥1 s occur 0-3 times per video, for example 05 at 1.5 s on "cannonball," and 5.5 s on "Navy's"; 04 at 61.5 s on "earthquake"; 21 at 26.5 s on "tattoos,"; 23 at 64.5 s on "tight,"; 22 at 54.5 s on "runs.". Most of these land on the **payoff noun** of a sentence and are probably SFX or hits layered on the bed, not a music change.
- **End:** the bed level 0.5 s before the end ranges from -22.8 (12, 25: a sting or hit on the last word) to -43 (fade). The median is -38, so the music mostly does not ring out.

## 4. SFX
Detection is limited by voice that never stops. These are the robust numbers:
| type (detector) | per 10 s, median | notes |
|---|---|---|
| Broadband whoosh (5-16 kHz ≥ +9 dB over a 3 s median for ≥180 ms) | **1.1** (0-1.8) | visible as bright noise columns, e.g. 01 at 6.72 s before "deep" and 05 at 2.2 s on a cut |
| Risers (rise ≥450 ms) | ~0 | not used |
| Sub hits, 25-75 Hz jump ≥12 dB | about 8 | **mostly voice plosives**: alignment to word onsets (70 % within ±3 frames) equals chance (66 %) |
| Air-band clicks or pops inside pauses | 2.1 | ticks and pops |

- **SFX vs visual transitions:** of 529 transitions (111 hard, 159 mid, 259 soft or dissolve), 33 % have an SFX event within ±6 frames, against 36 % for random times. **There is no systematic whoosh-on-cut.** The transition-locked average of the 2-16 kHz band shows a **dip of -2.3 dB from -300 to -50 ms** and no bump. Cuts fall in micro-gaps between words.
- **Transitions vs word onsets:** median offset -0.2 frames, p25/p75 -2.2/+1.8 frames (69 % within ±3 frames; chance is 66 % because words are dense).
- Where SFX occur, they are a hit or whoosh on the *noun being shown* ("hit", "cannonball", "fired"), at the same level as the voice peaks. The short-term level never rises: p95 is only +1.2 LU above the median.

## 5. Voice
| metric | median [p10..p90] |
|---|---|
| Speech rate | **3.7 words/s** [3.5..3.9] (≈222 wpm) |
| First word | **0.00 s**; audio onset 0.05 s, so the voice starts on frame 1-2 with **no pre-roll** |
| Pauses ≥150 ms | **4.6 per minute**, mean 172 ms, p90 188 ms, **longest ≈0.2 s** (03 and 08 have none). Breaths and silences are edited out. |
| After the last word | 0.28 s [0.2..0.4], then a hard stop. Level in that tail: median -27 LUFS (music only). |
| Dynamics (50 ms frames during speech) | p95 - p50 = **+3.8 dB**, p50 - p10 = -7.2 dB; word-peak std **1.8 dB**. Heavily compressed and levelled. |
| LTAS (speech; octaves 50…12.8k, dB re total) | -21 / **-5 / -5** / -7.5 / -13 / -16 / -15 / -14 / -25 |
| Spectral centroid | 940 Hz [775..1035]: a full, chesty low-mid voice with a gentle presence lift at 3-6 kHz, no harsh top |
| Bandwidth | about 15.8 kHz (AAC limit) |

## 6. Mix recipe (for `templates/audio/mix.py`)
1. **Master: -14.0 LUFS integrated, true peak ceiling -2.0 dBTP** (the bridge used -15 / -1.2). Target LRA ≤3 LU and max momentary ≤ -10 LUFS.
2. **Voice:** HPF at 70 Hz, then compression of about 4:1 with 3-5 dB gain reduction, 5 ms attack and 60 ms release, then a limiter, so 50 ms levels sit within -7/+4 dB of the median and word peaks within ±2 dB. Add a +2 dB shelf at 3.5 kHz only if the centroid is below 800 Hz. Mono, centred. Voice stem at about **-14.5 LUFS**.
3. **Edit the VO tight:** first word at frame 1 (≤0.05 s), word gaps ≤200 ms (cap every pause at 0.2 s; 3.7 words/s), end the video 0.25-0.35 s (8-10 frames) after the last word.
4. **Music:** one continuous tonal underscore (pads, soft keys or strings; main energy 120-500 Hz; little percussion; 60-110 BPM if there is a pulse) at **-32 to -34 LUFS = 18-20 LU under the voice**, constant. **No sidechain duck** (it would be inaudible at this level). Ride it ±3 dB at most. Optional last-word sting with the bed coming up to about -23 LUFS on the final word; otherwise fade it out over the last 0.3 s.
5. **SFX:** about **1 whoosh per 10 s** plus a hit or pop only on concrete action words, placed **on the word onset (0 to -2 frames)**, never as an automatic whoosh on every cut. Short-term peaks must stay ≤ +1.5 LU over the programme. Mono. Skip risers.
6. **Hook:** no extra level; the first 3 s match the rest (-14.3 LUFS).

## 7. Agreement or disagreement with the bridge study (`templates/audio/cues.md`)
- DISAGREE: master level (-15.0 LUFS / -1.2 dBTP there, against **-14.1 / -2.1** here).
- DISAGREE: music level. The bridge placed music 9.5-12 LU under the voice with a prominent 120 bpm march; the references sit **about 19-21 LU under** with a beatless tonal bed.
- DISAGREE: the bridge's -3 dB speech duck. The references show **no ducking**.
- DISAGREE: SFX density. The bridge had dense footstep and whoosh-per-cut layers; the references have about 1 whoosh per 10 s and do not tie SFX to cuts.
- DISAGREE: dead stops and silences such as the bridge's 33 s "music silent". The references never drop the bed or pause for more than 0.2 s.
- AGREE: the voice dominates, the mix is near-mono, LRA is about 2-3 LU, and the voice is unprocessed in tone (natural, low-mid weighted).

## 8. Top rules by impact
1. Continuous VO with no pauses over 0.2 s, 3.7 words/s, starting at frame 1 and ending 8-10 frames after the last word.
2. Master -14 LUFS / -2 dBTP / LRA ≤3; the voice is heavily levelled (word-peak std ≤2 dB).
3. Music is a quiet tonal bed 18-20 LU under the voice, never dropped and never ducked.
4. Sparse SFX (about 1 per 10 s) on the action word's onset, not on every cut.
5. Mono mix.
6. No loudness lift on the hook; at most one end sting.
