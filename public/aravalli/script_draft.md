# Aravalli: script draft (/yt-viral → /yt-script)

Hyderabad was dropped (creator, Nov 17: India topics yes, but no Hindu-Muslim angle). This is the runner-up from the
same /yt-viral run.

## Why this topic (from /yt-viral, 17 November 2026)

454 recent Shorts across 10 map and geography channels, ranked by views ÷ the channel's own median. Geo Study's two
Aravalli Shorts both beat their channel by a wide margin:

| Multiple | Views | Channel | Title |
|---|---|---|---|
| 8.3× | 1.5M | Geo Study | Aravalli Range & Rajasthan Climate (अरावली ने बांट दिया राजस्थान को दो हिस्सों में?) |
| 7.2× | 1.3M | Geo Study | Save Aravalli · Aravalli Controversy 2025 |

Both are explainers (climate, the court case). Our angle is the Mumbai formula: **a place every Indian knows (Rashtrapati
Bhavan) + "you didn't know" (it stands on a 2-billion-year-old mountain) + stakes (the wall that holds back the Thar is
breaking) + a loop.** No religion, no politics of faith. It is also the best 3D shot we could make: the real terrain
from SRTM, open data.

## Hooks (written to docs/HOOK_PLAYBOOK.md; hookscore is only a rough check)

| Score | Hook | Known thing first? | Twist by |
|---|---|---|---|
| 38 | **Rashtrapati Bhavan ek pahaad par khada hai. Aur wahi pahaad Delhi ko registan banne se rokta hai.** | Rashtrapati Bhavan | ~2 s |
| 45 | Rajasthan mein 31 pahaadiyan 50 saal mein gaayab ho gayi. Kahan gayi? | Rajasthan | ~3 s |
| 41 | Tum Delhi ki jis dhool mein saans lete ho, wo Thar se aati hai, ek tooti hui deewar ke raaste. | Delhi | ~4 s (and it overstates: most of Delhi's dust is local) |
| 40 | Delhi aur registan ke beech sirf ek deewar hai, aur wo deewar toot rahi hai. | Delhi | ~3 s |
| 39 | Himalaya ke paida hone se 2 arab saal pehle se ek pahaad Delhi ki raksha kar raha hai. | no | ~5 s |

**Pick: hook 1.** It scores lowest here because the scorer looks for English-style "you" and stakes words, but it is
the one that follows our rules: the most recognisable building in India first, the twist at about 2 s ("पहाड़ पर"), one
escalation ("रेगिस्तान बनने से रोकता है"), and the ending "तो अगली बार राष्ट्रपति भवन देखो…" runs straight back into it.
Backup: hook 2 (the vanished hills), whose fact is the story's turn anyway.

### Frame 0 and the first 3 seconds

- **Frame 0:** a 3D shot of Rashtrapati Bhavan's dome on Raisina Hill (your image), standing on a ridge of rock, the
  camera already sliding down the slope; black-and-white, the ridge outlined white.
- **0.0 "राष्ट्रपति भवन"**: the building, hit.
- **0.9 "एक पहाड़ पर"**: pull back fast: the ridge is a mountain line; it wipes in saffron-gold under the building.
- **1.9 "और वही पहाड़"**: keep pulling up to the 3D terrain of north-west India: the gold line runs south-west, 700 km.
- **2.6 "रेगिस्तान"**: the Thar to the west fills sand-yellow and pushes east; it stops at the gold wall.

## Script (193 words, about 83 s at our VO pace)

`script_hindi.txt` (Devanagari) and `script_roman.txt` (Roman, for your edit). The ElevenLabs text comes after you polish.

| Time | VO | On screen |
|---|---|---|
| 0:00 | राष्ट्रपति भवन एक पहाड़ पर खड़ा है। और वही पहाड़, दिल्ली को रेगिस्तान बनने से रोकता है। | Frame 0 and the first 3 s (above). |
| 0:05 | ये है अरावली। गुजरात से दिल्ली तक, करीब 700 किलोमीटर लंबी, और करीब 2 अरब साल पुरानी। हिमालय तो सिर्फ़ करीब 5 करोड़ साल पुराना है। | **3D:** the camera flies along the ridge from Delhi to Gujarat; a km counter to 700; an age bar: Aravalli 2 अरब vs a thin Himalaya sliver 5 करोड़. |
| 0:15 | राष्ट्रपति भवन जिस रायसीना पहाड़ी पर है, वो इसी अरावली का आख़िरी सिरा है। | Back to Delhi on the B/W satellite; Raisina Hill pin; the Delhi Ridge lit as the last tip of the gold line. |
| 0:20 | इसके पश्चिम में थार का रेगिस्तान। पूरब में हरे-भरे मैदान। और बीच में खड़ी है अरावली, एक दीवार की तरह। | Wide: the Thar fills sand-yellow (west), the plains green (east), the Aravalli a gold wall between them; place names light up: अजमेर, जयपुर, गुरुग्राम, दिल्ली. |
| 0:28 | पर ये दीवार टूट रही है। 2018 में Supreme Court के सामने रिपोर्ट आई: राजस्थान में अरावली की 128 में से 31 पहाड़ियाँ, 50 साल में ग़ायब हो चुकी थीं। वजह, खनन। | A 128-hill grid; 31 of them blink out one by one; a mining crater and a truck (your image); "2018". |
| 0:40 | जहाँ पहाड़ गए, वहाँ दीवार में करीब 12 बड़ी दरारें बन गईं। और इन्हीं रास्तों से थार की धूल आगे बढ़ती है। | **3D:** gaps open in the gold wall; sand streams through them eastward. **Null** split screen (~4 s, disbelief). |
| 0:50 | फिर 2025 में Supreme Court ने एक नई परिभाषा मानी: 100 मीटर से ऊँची पहाड़ी ही अरावली मानी जाएगी। | A 100 m measuring line slides across a hill profile; everything below it greys out. |
| 0:58 | रिपोर्ट्स के मुताबिक, 20 मीटर से ऊँची करीब 12,000 पहाड़ियों में से, सिर्फ़ करीब 1,000 ही 100 मीटर से ऊँची हैं। | A counter 12,000 → 1,000; a field of hill icons where 11 of every 12 fade. |
| 1:06 | विरोध हुआ, और दिसंबर 2025 में कोर्ट ने अपना ही फ़ैसला रोक दिया। | "दिसंबर 2025" stamp: "रोक"; the grey hills come back to gold. |
| 1:12 | तो अगली बार राष्ट्रपति भवन देखो, तो याद रखना… | Back to the frame-0 building on the ridge (loop into "राष्ट्रपति भवन एक पहाड़ पर…"). |

Close: the loop, no end card, no CTA. Pinned comment: "तुम्हारे शहर के पास अरावली है? 👇"

**The winning hook is "The Hidden Fact"** (a familiar landmark with a fact underneath it), because every Indian knows
Rashtrapati Bhavan and almost nobody knows it sits on the oldest mountain range in the country.

## 3D B-roll (your question about 3D)

This topic is made for it, and it uses only open data: a three.js height-field of north-west India from the AWS/SRTM
terrain tiles (the same free source we already credit), with the black-and-white satellite draped on it, the Aravalli
ridge lit gold, the Thar sand in yellow, and sand particles flowing through the gaps. It runs inside Remotion
(@remotion/three is already installed), so it renders in 4K with the rest. Blender would render on the CPU only here;
three.js is the right tool for this one. Three shots: 0:00–0:05 (the ridge under Rashtrapati Bhavan), 0:05–0:15 (the
fly-along), 0:40–0:50 (the gaps).

## Assets I'll need from you (realistic)

Rashtrapati Bhavan on Raisina Hill (PNG-T, the dome and the front, no people), a stone-mining crater with a truck
(PNG-T), a dust storm wall (PNG-T on black), a measuring staff / survey pole (PNG-T). Everything else is drawn in code or
built in 3D. I'll write the full prompts once you lock the script.

## Fact notes (checked 17 November 2026)

- **"राष्ट्रपति भवन एक पहाड़ पर… रायसीना पहाड़ी… आख़िरी सिरा":** Rashtrapati Bhavan stands on Raisina Hill, part of the
  Delhi Ridge, the northern end of the Aravalli range.
- **"दिल्ली को रेगिस्तान बनने से रोकता है… एक दीवार की तरह":** the range is widely described as a barrier between the
  Thar to its west and the plains to its east, slowing the desert's spread. The VO frames it as a wall, not a guarantee.
- **"करीब 700 किलोमीटर":** usually given as about 692 km (some sources 670–800 km), from Gujarat to Delhi.
- **"करीब 2 अरब साल पुरानी":** Paleoproterozoic; estimates range from about 1.7 to 2.5 billion years.
- **"हिमालय… करीब 5 करोड़ साल":** the Himalaya began rising when India met Asia, about 50 million years ago.
- **"2018… 128 में से 31 पहाड़ियाँ, 50 साल में ग़ायब… खनन":** the Supreme Court in October 2018, on a Central Empowered
  Committee report: 31 of 128 sampled Aravalli hills in Rajasthan had disappeared, mostly to illegal mining. (Other
  reports give 28; the VO uses the court-reported 31.)
- **"करीब 12 बड़ी दरारें… थार की धूल":** the same reports describe 10–12 large gaps through which Thar dust moves east.
- **"2025… 100 मीटर":** in November 2025 the Supreme Court accepted a definition: landforms at least 100 m above local
  relief count as Aravalli hills.
- **"करीब 12,000… सिर्फ़ करीब 1,000":** FSI data as reported: 1,048 of 12,081 documented hills of 20 m or more exceed
  100 m. FSI said it did not itself publish a "90% unprotected" study, so the VO says "रिपोर्ट्स के मुताबिक" and gives
  only the counts.
- **"दिसंबर 2025 में कोर्ट ने अपना ही फ़ैसला रोक दिया":** on 29 December 2025 the Court kept its November judgment in
  abeyance and ordered a fresh expert review. I couldn't confirm what has happened since, so the VO stops there. Check
  for a newer order before upload; if there is one, we change the last line.

Sources: [Mongabay India](https://india.mongabay.com/2025/12/with-a-new-identity-the-aravalli-hills-stare-at-an-uncertain-future/),
[LawBeat](https://lawbeat.in/top-stories/supreme-court-to-constitute-expert-committee-on-aravalli-definition-mining-halt-to-remain-1568288),
[News on AIR](https://www.newsonair.gov.in/supreme-court-takes-suo-motu-cognisance-on-issue-of-definition-of-aravalli-hills),
[The Wire](https://thewire.in/environment/after-govts-clarification-fsi-says-it-hasnt-carried-out-study-stating-90-of-aravallis-left-unprotected),
[WION](https://www.wionews.com/india-news/31-hills-vanish-in-aravalli-supreme-court-expresses-shock-173131),
[Down to Earth](https://www.downtoearth.org.in/environment/aravallis-the-mountain-range-that-defines-itself),
[WorldAtlas](https://www.worldatlas.com/articles/where-is-the-aravalli-range.html).

Ship it, or change it?
