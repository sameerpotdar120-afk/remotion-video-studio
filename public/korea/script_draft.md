# Korea: script draft (Hindi, for the creator to rewrite)

Files: `script_hindi.txt` (Devanagari), `script_roman.txt` (Roman Hinglish), `hooks.txt`, `reference_analysis.md`
(look, beats, full fact check).

## The two best hooks (hookscore.py, scored in English, then put into Hindi)

**1. The Question: 71, WORKABLE** (used)
"You think the Korean War ended in 1953? It never did. Nobody ever signed the peace, so why are they still at war?"
→ "तुम्हें लगता है Korea की जंग 1953 में खत्म हो गई? कभी नहीं हुई। बंदूकें रुकीं, पर शांति पर आज तक किसी ने साइन नहीं किया।"
```
SPECIFICITY 69 · ADDRESS 76 · STAKES 62 · CURIOSITY 76 · BREVITY 100 · weakest: STAKES
```

**2. The Clock: 58, WORKABLE** (kept as beat 5 instead of the opening)
"You see this line? Two American officers drew it in 30 minutes, and 81 years later millions of families are still split by it. Why?"
→ "ये लाइन देख रहे हो? दो American अफ़सरों ने इसे आधे घंटे में खींचा था, और 81 साल बाद भी ये Korea को बाँटे हुए है।"
```
SPECIFICITY 96 · STAKES 36 · CURIOSITY 59 · verdict 58 · weakest: STAKES
```

Winner formula: **The Question** on a common belief ("the war ended in 1953"). It works here because almost everyone
believes it, and the answer ("it never ended") lands in the first 3 seconds, with the DMZ already on screen. That pays off
part of the hook by 8 s; the "why" carries the rest.

## The script, beat by beat

| # | VO (Hindi) | ON SCREEN |
| --- | --- | --- |
| 1 | तुम्हें लगता है Korea की जंग 1953 में खत्म हो गई? कभी नहीं हुई। बंदूकें रुकीं, पर शांति पर आज तक किसी ने साइन नहीं किया। | Frame 0: Korea close, North red / South blue, the DMZ glowing between them, "1953" and a big "जंग खत्म?" (3 words). On "कभी नहीं": a red ✗ stamps over "खत्म". On "साइन नहीं": a peace-treaty paper drawn in code with an empty signature line. |
| 2 | आज भी न कोई दूतावास, न कोई रिश्ता। बीच में बस 4 किलोमीटर की पट्टी: कांटेदार तार और बारूदी सुरंगें। | Push in on the DMZ: the 4 km strip widens into a band, "4 KM" tag; barbed-wire line and mine icons drawn in code along it. |
| 3 | पर 1945 तक ये एक ही देश था, 35 साल से Japan के कब्ज़े में। | Border fades, whole peninsula one colour; then Japan orange washes over it, "1910 → 1945" timeline ticks, "35 साल". |
| 4 | 1945 में Japan हार की कगार पर था, और Soviet सेना उत्तर से घुस आई। America को डर था कि पूरा Korea हाथ से निकल जाएगा। | Pull out: USSR fills red from the north, red arrows cross the Tumen into Korea; a US badge over the sea to the south with a "?" |
| 5 | तो दो American अफ़सरों ने करीब आधे घंटे में map पर एक लाइन खींच दी: 38th parallel। | Two officer silhouettes over a desk map (code-drawn or creator GPT image), a stopwatch to "30 मिनट", a pencil draws the 38th parallel across Korea; the line jumps onto the satellite map. |
| 6 | बँटवारा कुछ समय के लिए था। पर Cold War में ऊपर communism आया, नीचे capitalism, और 1948 में दो देश बन गए। | Soviet badge north, US badge south; red and blue rings pulse; "1948" pops, the fills split into DPRK / ROK flags. |
| 7 | दोनों का दावा एक ही: पूरा Korea हमारा। | **NULL A (split, ~3 s):** Null points both ways (or shrugs). Top half: each flag's colour floods the whole peninsula in turn. |
| 8 | 1950 में North ने हमला किया, और लगभग पूरा South जीत लिया। | "1950"; red tide sweeps south to a small blue pocket round Busan (the Pusan Perimeter). |
| 9 | फिर America और UN की फ़ौज आई, और North को China की सीमा तक धकेल दिया। | UN + US badges land at Incheon (arrow from the sea); blue tide sweeps north to the Yalu. |
| 10 | तब China कूदा, लाखों सैनिकों के साथ। | **NULL B (split, ~2.5 s):** Null's alarmed reaction. Top: China fills dark red, a wave of red arrows crosses the Yalu. |
| 11 | [OPTIONAL] और भारत? हमारी 60 Para Field Ambulance ने वहाँ हज़ारों घायलों का इलाज किया। | Zoom out to show India (official boundary) → arc to Korea; a red-cross field-ambulance tag with the Indian flag. |
| 12 | 3 साल और कम से कम 25 लाख मौतों के बाद, लड़ाई लगभग वहीं रुकी जहाँ से शुरू हुई थी। | The tide settles near the 38th parallel; the old straight line and the new front line glow together; "25 लाख+" counter. |
| 13 | 1953 में युद्धविराम हुआ। South Korea ने उस पर साइन तक नहीं किया। और शांति समझौता? आज तक नहीं। | The armistice paper: signatures for the UN Command, North Korea and China; the South Korea line stays empty, a red circle round it; then the peace-treaty paper from beat 1, still empty. |
| 14 | तो अब बताओ... | Camera eases back to the frame-0 shot; "तो अब बताओ…" runs into "तुम्हें लगता है…" (loop). |

**Runtime:** 221 Hindi words at the last VO's pace (2.34 words/s) ≈ **94 s** with the optional India beat, **≈ 88 s**
without it. (At the skill's 150 wpm it would be 88 s.) Null total ≈ 5.5 s, both in the middle.

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
