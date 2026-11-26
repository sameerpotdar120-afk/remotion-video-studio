# Tamil Nadu letters: Hindi Short (draft v1, 26 Nov 2026)

## The reference (analysed frame by frame at its native 30 fps, 691 frames, 23.0 s)

"Weird Building in Tamil Nadu" (Simply Kavi, Tamil VO). What it does:
- 0.0–1.0 s: Tamil Nadu's coast on satellite, Thanjavur district already highlighted green; 0.2–1.3 s the name
  "THANJAVUR" types on in green 3D letters while a Thanjavur dancing-doll cut-out stands in the district.
- 1.3–7.5 s: slow push into the district, then a cut to the doll close-up and a dive into the campus (Esri imagery,
  "Tamil University" label from the map app).
- 8–20 s: the camera drifts over the campus; each letter-shaped building gets its Tamil letter typed beside it (த, மி,
  ழ், நா, டு), one every ~2 s, with a description ("looks like a temple / a fish / a snake").
- 20–23 s: pull back; a white circle joins the five letters around the library: "தமிழ்நாடு". It ends there.
- Weak spots we can beat: the payoff (the word) comes only at 20 s; no story (MGR, 35 years); no India-wide angle for a
  Hindi audience; it uses map-app imagery and labels (not allowed for us).

## Our angle and our pictures

The payoff picture goes to frame 0 (the five buildings already reading "தமிழ்நாடு"), then the story nobody tells:
MGR dreamt it in 1981 and never saw one letter built; it took about 35 years. Plus a Hindi hook of its own: one of the
letters, ழ, is a sound Hindi does not have.

Pictures, copyright-free only: no Google Maps, Esri or app screenshots. The campus buildings are drawn in code from
OpenStreetMap's building footprints (the five letter buildings are mapped there: ODbL, credit "© OpenStreetMap
contributors"), over EOX Sentinel-2 (CC BY 4.0) for the zooms from India to Thanjavur. India's official boundary from
Natural Earth. MGR as a MapPerson AI illustration.

## Hooks (hookscore.py, Hinglish)

| # | Line | Score |
|---|---|---|
| A | Tum upar se Thanjavur dekho, to 5 imaaratein asal mein ek shabd hain: Tamil Nadu. Par jisne ye socha, wo ek bhi akshar ban'te nahi dekh paaye. | **53 WEAK**: specificity 74, address 76, stakes 36, curiosity 58, brevity 79 |
| B | Tum Thanjavur ke upar se guzro, to paanch imaaratein asal mein zameen par Tamil mein likhti hain: Tamil Nadu. | 46: specificity 52, address 76, stakes 22, curiosity 58, brevity 100 |
| C | Tum Thanjavur ke upar se guzro, to zameen par Tamil mein likha dikhega: Tamil Nadu. | 44 |
| D | Tamil Nadu ka naam zameen par likhne mein 35 saal lag gaye, aur ye aaj bhi satellite se padha ja sakta hai. | 42 |
| E | Ek CM ne aisi university ka sapna dekha jiski imaaratein upar se Tamil Nadu likhti hain, par wo ek bhi akshar ban'te nahi dekh paaye. | 37 |

Stakes stays low on all of them (the scorer counts loss words; this is a wonder story). A wins: the known thing first
(Thanjavur / Tamil Nadu), the twist inside 2.5 s, and an open loop ("never saw one letter") that beat 4 closes.

## Script (hook A). VO in Devanagari; numbers as words for the voice, digits on screen.

**1. Hook (0:00–0:07)**
VO: तुम ऊपर से तंजावुर देखो, तो ये पाँच इमारतें असल में एक शब्द हैं: तमिलनाडु। पर जिसने ये सोचा, वो एक भी अक्षर बनते नहीं देख पाए।
[ON SCREEN: frame 0 = the campus from above, already pushing in: the five buildings (OSM footprints) glowing gold on the
dark map, each with its letter beside it, and the white ring joining them; "தமிழ்நாடு" across the top, "तमिलनाडु" under
it. On "पाँच इमारतें" the five pulse one by one; on "जिसने ये सोचा" the lights dim to one empty outline.]

**2. Where (0:07–0:16)**
VO: ये तमिलनाडु के तंजावुर में तमिल यूनिवर्सिटी का कैंपस है, क़रीब नौ सौ एकड़ का। उन्नीस सौ इक्यासी में मुख्यमंत्री एम. जी. रामचंद्रन, यानी MGR, ने ये यूनिवर्सिटी शुरू की।
[ON SCREEN: whip out to India (official boundary) → Tamil Nadu floods → pin "THANJAVUR" → back down to the campus
outline, pill "≈ 900 एकड़"; MGR rises out of Thanjavur (AI illustration), pill "1981".]

**3. The plan (0:16–0:25)**
VO: उनका सपना था कि यहाँ की पाँच इमारतें तमिल के पाँच अक्षरों के आकार में बनें, जो मिलकर लिखें तमिलनाडु, और बीच में हो लाइब्रेरी।
[ON SCREEN: the camera circles the campus; the letters type on beside their buildings in order த → மி → ழ் → நா → டு
(the reference's beat, but on the beat of the VO); the library in the centre lights up; the ring draws round, "≈ 278 m".]

**4. The twist (0:25–0:35)**
VO: पर MGR उन्नीस सौ सत्तासी में चल बसे। पहला अक्षर उनके जाने के दो साल बाद बना। और आख़िरी इमारतें बनते-बनते क़रीब पैंतीस साल लग गए।
[ON SCREEN: a timeline under the campus: "1981" → "1987" (MGR fades out) → "1989" (ழ lights) → "2016" (the last two
light); each building rises out of the ground on its year. Null split screen here (4 s): counting years on his fingers.]

**5. Inside (0:35–0:43)**
VO: और ये सिर्फ़ दिखावे के अक्षर नहीं हैं। एक में भाषा विभाग चलता है, एक में विज्ञान, और एक में तमिल को आगे बढ़ाने वाला विभाग।
[ON SCREEN: dive to ழ, label "भाषा"; whip to மி "विज्ञान"; whip to டு "तमिल विकास".]

**6. The Hindi hook (0:43–0:49)**
VO: और इनमें एक अक्षर ऐसा है, जिसकी आवाज़ हिंदी में है ही नहीं: तमिऴ वाला ऴ।
[ON SCREEN: ழ fills the frame, "zha" under it, a small sound wave; "तमिऴ" with ऴ glowing.]

**7. Send line, hard end (0:49–0:56)**
VO: तो अगली बार कोई सैटेलाइट मैप खोले, तो तंजावुर ज़रूर देखना। और ये उस दोस्त को भेजो जो तमिलनाडु से है।
[ON SCREEN: pull up and out to the whole ring reading "தமிழ்நாடு"; the last frame is frame 0, so "…तमिलनाडु से है"
runs straight into "तुम ऊपर से तंजावुर देखो".]

Pinned comment (not in the VO): "तुम्हारा कोई तमिल दोस्त है? उसे tag करो 👇"

**Runtime:** 171 words. At 150 wpm that is 1:08; at our measured pace (after the 1.15× speed-up) about **0:56**.

## Fact notes (checked 26 Nov 2026)

- Tamil University, Thanjavur: established and inaugurated by CM M. G. Ramachandran on 15 Sep 1981 (Covai Post,
  21 Nov 2016; Wikipedia). Campus "900 acres" (Covai Post, Wikipedia); the university's own page says about 850, a
  central compendium 824.91, so the VO says "क़रीब नौ सौ".
- The five buildings, shaped த மி ழ் நா டு, spell தமிழ்நாடு; MGR wanted them when the university was set up and
  approved the master plan; built in a 278 m radius with the library at the centre; visible from the air (Covai Post).
  They are mapped in OpenStreetMap, which is what we draw.
- MGR died on 24 Dec 1987. ழ was completed in 1989, "two years after MGR's demise"; மி under the XI Plan (2007–12);
  டு about 2015; த and நா by 2016 ("ends a wait of 35 years", Covai Post). So "पहला अक्षर उनके जाने के दो साल बाद" and
  "क़रीब पैंतीस साल".
- Uses (2016): ழ the Language faculty, மி Science, டு Developing Tamil (Covai Post, quoting the VC).
- ழ (zha) is a retroflex approximant: there is no such sound in standard Hindi (Devanagari has ऴ only for transliteration).
- Single main source (Covai Post 2016) for the building years and uses: the VO keeps those lines general.
