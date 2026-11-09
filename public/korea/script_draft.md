# Korea: the creator's script, polished (Hindi)

Files: `script_roman.txt` (the creator's Roman Hinglish, polished), `script_hindi.txt` (Devanagari for captions),
`hooks.txt`, `reference_analysis.md` (look, beats, full fact check).

## The loop

The seam is where the last line runs into the first. The ending stops right before the first word, so line 1 completes
its sentence and nothing is said twice:

> …Aur shanti samjhauta? Aaj tak nahi. **To ye sab jaanne ke baad bhi…** ↻ **Tumhe lagta hai Korea ki jung 1953 me khatam ho gayi? Khatam hui hi nahi.**

On the first play, line 1 is a plain question. On every replay it reads as "even after all this, you still think it
ended?", and "Khatam hui hi nahi" answers it again. Picture: the last frame is the frame before frame 0 (the same
border close-up), and the music and room tone cross the seam.

VO tip: record the last line and the first line together in one take ("…to ye sab jaanne ke baad bhi, tumhe lagta hai
Korea ki jung…") so the voice rises into the question, then use that take's "tumhe lagta hai…" as the opening. That
removes the drop in tone that gives most loops away.

## The two best hooks (hookscore.py, scored in English)

**1. The Question: 74, STRONG** (option, adds an India tease)
"You think the Korean War ended in 1953? It never ended, and 627 Indians saw why. Why is it still on?"
```
SPECIFICITY 96 · STAKES 62 · CURIOSITY 76 · weakest: STAKES
```
In Hindi it would be line 2: "…Kyu? Aur 627 Hindustani wahan goliyon ke beech the." Use it only if you want India
teased up front.

**2. The Question: 71, WORKABLE** (yours, used)
"You think the Korean War ended in 1953? It never did. 73 years, no peace signed, and one line still splits families. Why?"
```
SPECIFICITY 96 · STAKES 62 · CURIOSITY 59 · weakest: CURIOSITY
```

Winner formula: **The Question** on a common belief. Almost everyone thinks the war ended in 1953, the answer lands
in 3 seconds, and "ek line" is a promise paid off out loud at "Bas. Yahi hai wo line."

## The script, beat by beat

| # | VO (Roman) | ON SCREEN |
| --- | --- | --- |
| 1 | Tumhe lagta hai Korea ki jung 1953 me khatam ho gayi? Khatam hui hi nahi. | Frame 0: Korea close, North red / South blue, the border glowing, "जंग खत्म?" big. On "Khatam hui hi nahi": a red ✗ stamps over "खत्म". |
| 2 | 73 saal ho gaye, shanti par aaj tak koi sign nahi, aur ek line aaj bhi parivaaron ko baante hue hai. Kyu? | "73 साल" counter; an empty peace-treaty paper drawn in code; on "ek line" the border flares white. |
| 3 | Beech me bas 4 kilometer ki patti hai. Kaantedar taar, baroodi surangein, aur dono taraf bandookein taani hui. | Push in: the DMZ band, "4 KM" tag, barbed wire and mine icons, gun icons facing each other across it. |
| 4 | Par 1945 tak ye ek hi desh tha. 35 saal se Japan ke kabze me. | Border fades, peninsula one colour; Japan orange washes over it; "1910 → 1945", "35 साल". |
| 5 | Fir usi saal Soviet sena uttar se ghus aayi, aur America ko darr tha ki poora Korea haath se nikal jayega. | Pull out: USSR red from the north, arrows into Korea; a US badge over the sea with a "?". |
| 6 | To do American officers ne map uthaya, aur kareeb aadhe ghante me ek line kheench di: 38th parallel. Bas. Yahi hai wo line. | Desk map, two officer silhouettes, stopwatch to "30 मिनट", a pencil draws the line; on "Yahi hai wo line" it jumps onto the satellite map and lines up with frame 0's border. |
| 7 | Batwara kuch samay ke liye tha. Par Cold War me upar communism aa gaya, neeche capitalism, aur 1948 me do desh ban gaye. | Soviet badge north, US badge south, rings pulse; "1948", the fills split into DPRK / ROK flags. |
| 8 | Aur dono ka daava ek hi tha: poora Korea humara hai. | **NULL A (split, ~3 s):** Null points both ways. Top: each flag's colour floods the whole peninsula in turn. |
| 9 | 1950 me North ne hamla kiya, aur lagbhag poora South jeet liya. Fir America aur UN ki fauj aayi, aur North ko China ki seema tak dhakel diya. | "1950"; red tide south to the Busan pocket; UN + US badges land at Incheon; blue tide north to the Yalu. |
| 10 | Tab China kooda, lakhon sainikon ke saath. | **NULL B (split, ~2.5 s):** alarmed reaction. Top: China dark red, arrows over the Yalu. |
| 11 | Aur yahin India aaya. Humne ladne ke liye fauj nahi bheji, bachane ke liye bheji. Hamari 60 Para Field Ambulance. 627 log, jinhone 2.2 lakh se zyada mareezon ka ilaaj kiya, aur 2,324 surgeries ki, goliyon ke beech me. | Zoom out to India (official boundary), arc to Korea; a red-cross ambulance tag with the Indian flag; counters "627", "2,22,324+", "2,324". |
| 12 | 3 saal, kam se kam 25 lakh mautein, aur ladai lagbhag wahin ruki jahan se shuru hui thi. Usi line ke paas. | The tide settles; the straight 38th parallel and the real front line glow together; "25 लाख+". |
| 13 | 1953 me yudhviram hua. South Korea ne us par sign tak nahi kiya. Aur shanti samjhauta? Aaj tak nahi. | Armistice paper: UN Command, North Korea, China sign; South Korea's line empty, red circle; then the beat-2 peace paper, still empty. |
| 14 | To ye sab jaanne ke baad bhi… | Camera eases back to the frame-0 shot; ↻ into line 1. |

**Runtime:** 270 words. At the skill's 150 wpm ≈ **108 s**; at the last VO's pace (2.34 words/s) ≈ **115 s**. That is
longer than the usual 60–90 s, mostly from the India beat (about 18 s). Still well inside the Shorts limit.

## What I changed in your script, and why

1. **"Kabhi hui hi nahi" → "Khatam hui hi nahi."** "Kabhi hui hi nahi" can be heard as "the war never happened";
   "Khatam hui hi nahi" can only mean "it never ended", with the same punch.
2. **The ending.** "To 73 saal baad bhi jung khatam nahi hui hai. Isiliye toh tumhe lagta hai Korea ki jung 1953 me…"
   would make the loop say "tumhe lagta hai Korea ki jung 1953 me" twice back to back, and "isiliye toh" doesn't follow
   (the war going on isn't why you think it ended). It also repeated "73 saal" and "khatam nahi hui" right before the
   hook says both again. Now: "To ye sab jaanne ke baad bhi…" ↻ "Tumhe lagta hai…".
3. **"2.2 lakh se zyada ghayalon" → "mareezon".** The unit's 2,22,324 cases include the sick and civilians, not only
   the wounded. "field surgeries" → "surgeries" (shorter for the VO; the number is the same).

Everything else is your wording.

## Fact check of the new lines

- **60 Para Field Ambulance:** India sent no combat troops to Korea; this medical unit (Lt Col A. G. Rangaraj) served
  with the UN forces, 1950–54, including the airborne drop at Munsan with the US 187th Airborne. Indian Army accounts
  give **627** personnel, **2,22,324** cases treated and **2,324** field surgeries. ✓ (These figures come from Indian
  Army and Ministry of Defence accounts; there is no independent count.)
- **"Goliyon ke beech me":** the unit worked at the front and in battle, and had men killed and wounded. ✓
- Everything else is as checked in `reference_analysis.md`.

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
