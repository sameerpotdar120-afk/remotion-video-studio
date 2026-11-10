# Hormuz: the creator's script, polished (Hindi)

The creator's draft (10 Nov) polished for grammar and rhythm; `script_elevenlabs.txt` has the VO text with numbers as
Hindi words. Changes: "iske chaaron taraf" → "iske badle" (an alternative, not "around it"); one unit system
(crore/lakh) instead of mixing million and crore; "jahaazon ka guzarna" → "aana-jaana"; India's 26 lakh made the
explicit figure; one added line (optional): the pipelines' 26 lakh spare equals what India alone took from Hormuz.
Runtime: 239 words ≈ 96 s at 150 wpm, ≈ 102 s at the last VO's pace. Cut the added line to save about 4 s.

New figures checked: EIA, flows fell from 21.6 million b/d (late 2025) to 4.9 million b/d (Q2 2026); EIA calls its tracking
data since late February 2026 "especially unreliable" and IEA/Kpler give higher levels (IEA about 10.9 million in
September). India: about 2.6 million b/d of Gulf crude in early 2026 (about half of imports, Kpler).

---

# (earlier draft below)

Files: `script_hindi.txt`, `script_roman.txt`, `hooks.txt`, `reference_analysis.md` (look, beats, fact check, 3D plan).

## The two best hooks (hookscore.py, scored in English)

**1. The Question: 72, STRONG** (used)
"You see this 33 km gap? It's almost shut, it costs you at the petrol pump, and there's never been a way around it. Why?"
```
SPECIFICITY 68 · ADDRESS 96 · STAKES 62 · CURIOSITY 76 · weakest: STAKES
```
**2. The Question: 71, WORKABLE**
"You see this 33 km gap? A fifth of the world's oil is at risk here, and nobody has ever dug around it. Why?"
```
SPECIFICITY 68 · ADDRESS 76 · STAKES 62 · CURIOSITY 76 · weakest: STAKES
```
Winner formula: **The Question**. The picture (a 33 km gap on a 3D map) does the work, the stake (your petrol) makes it
personal, and "why no way around it" is the question the whole video answers. In Hindi the hook says "समुद्री रास्ता"
(sea route) on purpose: pipelines do exist, and the payoff is that they're far too small.

## The script, beat by beat

| # | VO (Hindi) | ON SCREEN |
| --- | --- | --- |
| 1 | 33 किलोमीटर का ये रास्ता। आज ये लगभग बंद है, इसका असर तुम्हारे petrol तक पहुँचता है, और इसके चारों तरफ़ आज तक कोई समुद्री रास्ता नहीं बना। क्यों? | Frame 0: low tilted 3D camera right over the strait, Iran's mountains on one side, Musandam on the other, a glowing "33 KM" gauge across the gap. On "लगभग बंद": a red barrier line closes across the lane. |
| 2 | ये है Strait of Hormuz। रोज़ करीब 2 करोड़ बैरल तेल, यानी दुनिया की खपत का करीब पाँचवाँ हिस्सा, यहीं से निकलता है। | Camera rises and pulls back over the Gulf; red tanker lanes stream through the strait with 3D oil drums; "20%" and "2 करोड़ बैरल/दिन" tags; Gulf countries outlined. |
| 3 | 2026 की Iran जंग के बाद से, यहाँ से जहाज़ों का गुजरना बहुत कम हो गया है। | The stream of drums thins to a trickle; the lane dims; a "2026" tag. |
| 4 | और भारत? इस साल की शुरुआत में हमारा करीब आधा crude इसी रास्ते से आता था। | Pull out over the Arabian Sea to India (official boundary, saffron slab); a lane from Hormuz to India's west coast; "~50%" tag. |
| 5 | Map देखकर लगता है, बस यहाँ से एक canal काट दो। Persian Gulf से सीधे Gulf of Oman। | Back to Musandam (satellite grade); UAE slab pink-red, Oman green; a dark canal draws across the base of the peninsula; the lane reroutes into it. |
| 6 | पर रास्ते में खड़े हैं Hajar पहाड़। करीब 700 किलोमीटर लंबी range, और सबसे ऊँची चोटी करीब 3,000 मीटर। | The Hajar range lights up and rises (a blue band from the DEM); camera drops low and flies along it; "700 KM" and a height counter to "~3,000 M" (Jebel Shams). The canal line cracks against the mountains. |
| 7 | ऊपर से ये ज़मीन दो देशों की है: UAE और Oman। | **NULL A (split, ~3 s):** Null points left, then right. Top: UAE and Oman flags on their slabs. |
| 8 | Canal बना, तो दोनों देश बीच से कट जाएँगे। Security, customs, फ़ौज, सब दो हिस्सों में। | The canal splits both slabs apart (the two halves slide away); three icon badges pop: shield, customs stamp, helmet. |
| 9 | तो Gulf ने किया क्या? Canal नहीं, pipelines। | **NULL B (split, ~2.5 s):** Null's "here's the trick" gesture. Top: camera rises high over Arabia. |
| 10 | Saudi की East-West pipeline तेल को Red Sea तक ले जाती है। UAE की pipeline सीधे Fujairah, Hormuz के बाहर। | Two glowing pipelines draw across the land: Saudi east coast → Yanbu on the Red Sea; Abu Dhabi fields → Fujairah on the Gulf of Oman. |
| 11 | पर Hormuz बंद हो, तो इन pipelines में खाली जगह बस करीब 26 लाख बैरल रोज़ की है। 2 करोड़ के सामने, बहुत कम। | Two bars side by side: "26 लाख" (thin) next to "2 करोड़" (towering); camera tilts so the tall bar towers over the map. |
| 12 | बाकी सारे तेल के लिए आज भी बचता है, बस... | Camera dives back down to the frame-0 shot over the strait; ↻ "33 किलोमीटर का ये रास्ता।" |

**The loop:** "…बाकी सारे तेल के लिए आज भी बचता है, बस…" ↻ "33 किलोमीटर का ये रास्ता।" The last line finishes in the
first, so nothing is said twice. Record the last line and the first line in one take so the voice carries across.

**Runtime:** 211 Hindi words. At the skill's 150 wpm ≈ **84 s**; at your last VO's pace (2.34 words/s) ≈ **90 s**.
Null total ≈ 5.5 s, both in the middle.

**The close:** one ask, built into the loop. Pinned comment: "तुम्हारे शहर में petrol अभी कितने का है? 👇".

## What changed from the reference, and why

- "Hajar mountains about 1,800 m" → the range is about 700 km long with peaks near 3,000 m (Jebel Shams ~3,009 m).
- "$200 billion" dropped: no source.
- "No alternative has been built" → the real answer: pipelines exist (Saudi East-West, UAE to Fujairah), but in a
  shutdown they can take only about 2.6 million b/d extra against 20 million (EIA).
- Added the 2026 context (traffic collapsed since the Iran war) and the India angle (about half of India's crude came
  through Hormuz in early 2026).

## Before upload

The Hormuz situation is changing week to week. Re-check the line "2026 की Iran जंग के बाद से… बहुत कम हो गया है" against
the news on upload day.
