# Korea: script draft, polished (Hindi, for the creator to rewrite)

Files: `script_hindi.txt` (Devanagari), `script_roman.txt` (Roman Hinglish), `hooks.txt`, `reference_analysis.md`
(look, beats, full fact check).

## The two best hooks (hookscore.py, scored in English, then put into Hindi)

**1. The Question: 71, WORKABLE** (used)
"You think the Korean War ended in 1953? It never did. 73 years, no peace signed, and families still split by one line. Why?"
→ "तुम्हें लगता है Korea की जंग 1953 में खत्म हो गई? कभी नहीं हुई। 73 साल, शांति पर कोई साइन नहीं, और एक लाइन आज भी परिवारों को बाँटे हुए है। क्यों?"
```
SPECIFICITY 96 · ADDRESS 76 · STAKES 62 · CURIOSITY 59 · BREVITY 100 · weakest: CURIOSITY
```

**2. The Question: 71, WORKABLE** (the runner-up; stronger curiosity, vaguer)
"You think the Korean War ended in 1953? It never did. Nobody signed the peace, and it still splits families today. Why?"
```
SPECIFICITY 74 · ADDRESS 76 · STAKES 62 · CURIOSITY 76 · BREVITY 100 · weakest: STAKES
```

What changed from the first draft: the old hook (also 71) was weakest on STAKES; adding "73 years" and "families
still split by one line" lifted specificity from 69 to 96 and gave the hook a concrete cost. "One line" is a promise the
script now pays off out loud in beat 5 ("यही है वो लाइन।").

Winner formula: **The Question** on a common belief ("the war ended in 1953"). Almost everyone believes it, the
answer ("कभी नहीं हुई") lands in the first 3 seconds, and "एक लाइन" gives the viewer something to wait for.

## The script, beat by beat

| # | VO (Hindi) | ON SCREEN |
| --- | --- | --- |
| 1 | तुम्हें लगता है Korea की जंग 1953 में खत्म हो गई? कभी नहीं हुई। 73 साल, शांति पर कोई साइन नहीं, और एक लाइन आज भी परिवारों को बाँटे हुए है। क्यों? | Frame 0: Korea close, North red / South blue, the border glowing, "जंग खत्म?" (2 words, big). On "कभी नहीं": a red ✗ over "खत्म". "73 साल" counter; an empty peace-treaty paper drawn in code; on "एक लाइन": the border flares white. |
| 2 | बीच में बस 4 किलोमीटर की पट्टी: कांटेदार तार और बारूदी सुरंगें। | Push in: the border widens into the DMZ band, "4 KM" tag, barbed-wire line and mine icons drawn in code. |
| 3 | पर 1945 तक ये एक ही देश था, 35 साल से Japan के कब्ज़े में। | Border fades, the peninsula one colour; Japan orange washes over it; "1910 → 1945", "35 साल". |
| 4 | फिर उसी साल Soviet सेना उत्तर से घुस आई, और America को डर था कि पूरा Korea हाथ से निकल जाएगा। | Pull out: USSR red from the north, red arrows into Korea; a US badge over the sea to the south with a "?". |
| 5 | तो दो American अफ़सरों ने map उठाया, और करीब आधे घंटे में एक लाइन खींच दी: 38th parallel। यही है वो लाइन। | Two officer silhouettes over a desk map, a stopwatch to "30 मिनट", a pencil draws the 38th parallel; on "यही है वो लाइन" it jumps onto the satellite map and lines up with frame 0's border (payoff of the hook). |
| 6 | बँटवारा कुछ समय के लिए था। पर Cold War में ऊपर communism आया, नीचे capitalism, और 1948 में दो देश बन गए। | Soviet badge north, US badge south, red and blue rings pulse; "1948" pops, the fills split into DPRK / ROK flags. |
| 7 | और दोनों का दावा एक: पूरा Korea हमारा। | **NULL A (split, ~3 s):** Null points both ways / shrugs. Top half: each flag's colour floods the whole peninsula in turn. |
| 8 | 1950 में North ने हमला किया, और लगभग पूरा South जीत लिया। फिर America और UN की फ़ौज आई, और North को China की सीमा तक धकेल दिया। | "1950"; red tide sweeps south to a pocket round Busan; UN + US badges land at Incheon; blue tide sweeps north to the Yalu. |
| 9 | तब China कूदा, लाखों सैनिकों के साथ। | **NULL B (split, ~2.5 s):** Null's alarmed reaction. Top: China fills dark red, a wave of arrows crosses the Yalu. |
| 10 | [OPTIONAL] और भारत? हमारी 60 Para Field Ambulance ने वहाँ हज़ारों घायलों का इलाज किया। | Zoom out to show India (official boundary) → arc to Korea; red-cross ambulance tag with the Indian flag. |
| 11 | 3 साल, कम से कम 25 लाख मौतें, और लड़ाई लगभग वहीं रुकी जहाँ से शुरू हुई थी: उसी लाइन के पास। | The tide settles; the straight 38th parallel and the real front line glow together; "25 लाख+" counter. |
| 12 | 1953 में युद्धविराम हुआ। South Korea ने उस पर साइन तक नहीं किया। और शांति समझौता? आज तक नहीं। | The armistice paper: signatures for the UN Command, North Korea and China; South Korea's line empty, red circle; then the beat-1 peace-treaty paper, still empty. |
| 13 | तो अब बताओ... | Camera eases back to the frame-0 shot; "तो अब बताओ…" runs into "तुम्हें लगता है…" (loop). |

**Runtime:** 224 Hindi words. At the skill's 150 wpm: **≈ 84 s** without the India beat. At the last VO's pace (2.34 words/s):
**≈ 90 s** without it, **≈ 96 s** with it. Null total ≈ 5.5 s, both in the middle.

**The close:** one ask, built into the loop ("तो अब बताओ…" → "तुम्हें लगता है…?"). The pinned comment asks the
question.

## Packaging (yt-package, title.py)

Top three of ten:
```
1953 के बाद भी North-South Korea जंग में क्यों हैं?        51 chars · 98/100 (100 with the thumbnail) · figure + open question
North vs South Korea: 73 साल से जंग क्यों? 🇰🇵🇰🇷           47 chars · 94/100 · figure
2 American अफ़सर, 30 मिनट, 1 लाइन: Korea कैसे बँटा         50 chars · 94/100 · figures
```
Every option trips the 40-char mobile warning; the subject ("North-South Korea" / "Korea") survives in the first 40
on all three.

**Thumbnail brief (pairs with title 1):** text "30 मिनट की लाइन". Different words, same promise. Korea close on
the satellite map, North red and South blue, the 38th parallel as a thick glowing pencil line with a pencil tip at its
end, a small stopwatch at "30". Dark sea and the grade hold contrast at feed size; the words go in the top third, inside
the 3:4 crop.

## SEO (yt-seo)

Queries this should win:
1. `north korea vs south korea` / `north korea south korea war`
2. `why are north and south korea still at war` / `korean war explained in hindi`
3. `38th parallel`

The title and the first two description lines below carry those words.

**Description, first two lines:**
```
North Korea और South Korea आज भी जंग में क्यों हैं? 1953 में बंदूकें रुकीं, पर peace treaty पर आज तक किसी ने साइन नहीं किया।
38th parallel की पूरी कहानी: 1945 में दो American अफ़सरों ने आधे घंटे में खींची एक लाइन, जिसने एक देश को दो दुश्मनों में बाँट दिया।
```

**Tags (15):**
```
north korea vs south korea, korean war, korean war explained in hindi, 38th parallel, why are north and south korea still at war, dmz korea, korean armistice 1953, north korea, south korea, cold war, korea divided, india korean war, hindi geography, map facts, null dynasty
```

The full upload kit (description body, credits, Instagram caption) gets written after the render, as usual.
