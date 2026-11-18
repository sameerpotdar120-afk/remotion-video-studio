# Notes (what's on the back of your rupee notes): script draft (/yt-viral → /yt-script)

## Why this topic (from /yt-viral, 18 November 2026)

468 recent Shorts across 10 map and geography channels, ranked by views ÷ the channel's own median. The India rows
without a religion angle:

| Multiple | Views | Channel | Title |
|---|---|---|---|
| 31.5× | 7.8M | Geo Study | Bihar All Districts Through Map Animation |
| **22.6×** | **5.6M** | **Geo Study** | **Indian Currency: The ₹ Symbol and UNESCO Heritage Sites on 10, 20, 50, 100, 200, 500 Notes** |
| 10.9× | 4.6M | Yash Rajput Map | "Andaman Could Have Been Pakistan or Indonesia" |
| 10.4× | 4.4M | Yash Rajput Map | "Why Did Nagaland Almost Become an Independent Country?" |
| 9.7× | 2.4M | Geo Study | Operation Meghdoot: How India Captured Siachen |

(The formula labels from swipe.py are judgements about the titles, not proof of why they worked.)

**Pick: the notes.** It is the strongest India outlier we haven't made, and it fits the Mumbai formula best: something
every Indian holds every day (a ₹100 note) + "you never noticed this" (a 1,000-year-old stepwell on the back) + pride
(six World Heritage sites, and India's Mars mission) + an easy loop. It is also very visual on our map: each note lights
its state and its monument rises out of the map. Geo Study's version is a list explainer; ours is a story with a twist
and a loop. Runner-up: Siachen (9.7×).

## Hooks (docs/HOOK_PLAYBOOK.md; hookscore is only a rough check)

| Score | Hook |
|---|---|
| **54** | **Tumne 100 ka note hazaar baar dekha hai, par uske peeche Gujarat ki jo baoli hai, kabhi dekhi?** |
| **49** | Tumhare 10 ke note ke peeche kareeb 800 saal purana ek Surya Mandir hai. |
| 46 | 500 ka note palto, peeche Lal Qila hai. Par 2000 ke note wali jagah Bharat mein hai hi nahi. |
| 43 | Agar tum har note ke peeche wali jagah ghoom lo, to tum aadha Bharat ghoom loge. |
| 41 | Tumhari jeb mein Bharat ka ek naksha chhupa hai. Bas note palat ke dekho. |

**Pick: the ₹100 hook (54).** The known thing first (the ₹100 note), "तुम", and the twist by about 3 s ("Gujarat की
बावड़ी"). It is also the loop: the last line asks "agar koi 100 ka note maange…" and the hook answers it.
**Backup: the ₹10 / Sun Temple hook (49).**

### Frame 0 and the first 3 seconds
- **Frame 0:** a ₹100-coloured note card (drawn in code, lavender, "100") flipping over on the black-and-white map of
  India; behind it, your Rani ki Vav already rising out of Gujarat.
- **"100 का नोट"** the card flips; **"हज़ार बार"** quick flicks of the card; **"पीछे Gujarat"** Gujarat lights up and
  the camera pushes in; **"बावड़ी"** the stepwell rises out of Patan with its name box.

## Script (173 words; about 69 s at 150 wpm, about 74 s at your VO pace, about 65 s at 1.15×)

`script_roman.txt`. The ElevenLabs text comes after you polish it.

| Time | VO | On screen |
|---|---|---|
| 0:00 | Tumne 100 ka note hazaar baar dekha hai, par uske peeche Gujarat ki jo baoli hai, kabhi dekhi? | Frame 0 and the first 3 s (above). |
| 0:05 | Ye hai Rani ki Vav, Patan mein. Kareeb 1000 saal purani, 7 manzil gehri seedhiyon wali baoli. | Push into Patan; the stepwell prop rises with a name box; "~1000 साल" and "7 मंज़िल" counters; a slow tilt down its steps. |
| 0:12 | Aur sirf 100 nahi. Har note ke peeche Bharat ki ek jagah hai. | Pull out to all of India; a fan of six note cards (10, 20, 50, 100, 200, 500) spreads across the top. |
| 0:16 | 10 ke note par Odisha ka Konark Surya Mandir. 20 par Maharashtra ki Ellora ki Gufaayein. 50 par Karnataka ke Hampi ka Patthar ka Rath. 200 par Madhya Pradesh ka Sanchi Stupa. Aur 500 par Delhi ka Lal Qila. | One per beat: the note card flies to its state; the state lights up in the note's own colour; the monument rises out of the map with a name box. The camera hops Odisha → Maharashtra → Karnataka → MP → Delhi. |
| 0:31 | Ab twist: ye chhah ki chhah jagah UNESCO World Heritage Sites hain. Yaani tumhari jeb mein, Odisha se Gujarat tak, Bharat ka ek poora naksha ghoom raha hai. | **Null** (split screen); six gold "World Heritage" stamps hit the six pins; a gold line joins them into a map across India. |
| 0:41 | Aur 2000 ka note? Uske peeche koi imaarat nahi thi. Uske peeche tha Mangalyaan, jo 2014 mein pehli hi koshish mein Mangal tak pahuncha. Aisa karne wala duniya ka pehla desh: Bharat. | The ₹2000 card (magenta) flips; no pin on the map; the camera lifts off India into space; your Mangalyaan prop flies to a red Mars; "2014 · पहली ही कोशिश में". |
| 0:54 | Wo note RBI wapas le chuka hai, par aaj bhi legal tender hai. | The ₹2000 card slides into an RBI-style vault (drawn in code); "LEGAL TENDER" stamp. |
| 0:58 | To agli baar koi tumse 100 ka note maange, to bas itna poochna... | Back to the ₹100 card over Gujarat: the frame-0 picture (loop into "Tumne 100 ka note…"). |

**The winning hook is "The Hidden Fact"** (an everyday object with a fact on it nobody notices), because everyone has
held a ₹100 note and almost no one knows the stepwell on its back.

**A note on the notes themselves:** I won't put photos or scans of real banknotes on screen. I'll draw stylised note
cards in code (each denomination's colour and number, no portrait or RBI text), and the monuments come from your GPT
props. That keeps us clear of currency-reproduction rules and anyone's copyright.

## Fact notes (checked 18 November 2026)

- **The motifs (Mahatma Gandhi New Series, RBI):** ₹10 Sun Temple, Konark · ₹20 Ellora Caves · ₹50 Hampi with Chariot ·
  ₹100 Rani ki Vav · ₹200 Sanchi Stupa · ₹500 Red Fort · ₹2000 Mangalyaan.
- **"छह की छह UNESCO World Heritage":** Ellora (1983), Konark (1984), Hampi (1986), Sanchi (1989), Red Fort Complex
  (2007), Rani ki Vav (2014).
- **"Rani ki Vav… करीब 1000 साल पुरानी, 7 मंज़िल":** built in the 11th century (around 1063) at Patan, Gujarat; seven
  levels of stairs.
- **"Mangalyaan… 2014… पहली ही कोशिश में… दुनिया का पहला देश":** the Mars Orbiter Mission reached Mars orbit on
  24 September 2014; India was the first country to do it on its first attempt (and the first in Asia).
- **"₹2000… RBI वापस ले चुका है, पर आज भी legal tender":** withdrawal announced May 2023; RBI says the notes remain legal
  tender; 98.47% had been returned by 30 April 2026.

Sources: [RBI ₹10](https://www.rbi.org.in/cw/rupees-ten.aspx), [RBI ₹20](https://www.rbi.org.in/cw/rupees-twenty.aspx),
[RBI ₹50](https://www.rbi.org.in/cw/rupees-fifty.aspx), [RBI ₹100](https://www.rbi.org.in/cw/rupees-one-hundred.aspx),
[RBI ₹200](https://paisaboltahai.rbi.org.in/rupees-two-hundred.aspx), [RBI ₹2000](https://www.rbi.org.in/cw/rupees-two-thousand.aspx),
[Wikipedia, Mahatma Gandhi New Series](https://EN.wikipedia.com/wiki/Mahatma_Gandhi_New_Series),
[Angel One, ₹2000 status April 2026](https://www.angelone.in/news/economy/rs-2000-notes-withdrawal-update-over-98-percent-returned-by-april-2026),
[GKToday, UNESCO sites in India](https://www.gktoday.in/unesco-world-heritage-sites-in-india/),
[ClearIAS, UNESCO sites](https://www.clearias.com/unesco-world-heritage-sites/).

Ship it, or change it?
