# Malacca: reference analysis and script draft (/yt-script)

## The reference (analysed at 30 fps)

"Why China fears Indian Ocean and Indian Navy" (Unexplored Dimensions, 720×1280, 30 fps, 85.6 s). Read from all 2,564
frames (sheets at 2 fps) and its transcript (faster-whisper; three skipped spans re-transcribed).

**Structure**
| Time | VO (their words, summarised) | On screen |
|---|---|---|
| 0–3 s | "एक समंदर ऐसा है जहाँ चाइना की नेवी इंडिया की नेवी से काँपती है" | Clouds part over a grey satellite map; the seas around South-East Asia lit blue with "?" marks |
| 1–3 s | (cont.) | Xi's cut-out rises out of a red China; Modi's out of a blue India (the people-rising look we use) |
| 3–9 s | 370 warships vs 130 | A close push into Xi's suit; a fleet of warship icons "370 Warships" vs "130 Warships" |
| 9–18 s | "फिर भी… Strait of Malacca… 80% crude oil… choke point" | The strait lights blue on grey; a counter 38% → 80% with a China flag; a tanker; a dashed arrow from the strait to Andaman & Nicobar |
| 18–28 s | "India can block China's energy lifeline… South China Sea, six countries" | Presenter (talking head); then warships in the South China Sea, the claimant countries coloured |
| 28–34 s | "only three narrow routes: Malacca, Sunda, Lombok" | Wide India–China map (blue/red); the three straits labelled; white arrows through each |
| 34–45 s | "secret weapon: Andaman & Nicobar Command… only tri-service base" | Presenter; the islands outlined blue, "Andaman & Nicobar Command", Port Blair pin, Army/Navy/Air Force hex icons |
| 45–47 s | "China's base on Myanmar's Coco Islands" | Coco Islands in red, "China has a base here" |
| 47–61 s | String of Pearls: Gwadar, Hambantota, Chittagong, Kyaukpyu, Djibouti | Kinetic "String of Pearls · CHINA"; a dashed loop of pearls round India; each port lit |
| 61–69 s | Necklace of Diamonds: Chabahar, Duqm, Sabang | Modi's cut-out; Iran and Oman lit red; Sabang lit green |
| 69–79 s | 19 warships in 2026; 2035 target 200 / 3 carriers / 6 SSNs | Presenter; a "2035 Target" card with ship icons |
| 79–85 s | "China is ahead only in numbers; the real king of the Indian Ocean is the Indian Navy. Jai Hind." | Presenter, then an Instagram follow card |

**What works:** the same documentary look we use now (grey map, one colour per side, people rising out of the map,
kinetic labels), a number duel in the first 9 s, one strong concept (a choke point next to India), and national pride
at the end.
**What doesn't (for us):** the hook opens on an abstract "एक समंदर" (no known place), the twist only lands at 9–12 s,
the presenter cuts break the map's continuity, and several claims are stronger than the evidence (India "can block it
anytime", "India guards all three straits", "China has a base on the Coco Islands"). Our version keeps the idea and
fixes those.

## Hooks (docs/HOOK_PLAYBOOK.md; hookscore is only a rough check)

| Score | Hook | Known thing first? | Twist by |
|---|---|---|---|
| **43** | Tum Andaman ke beach par baithe ho, aur saamne se China ka zyadatar tel guzar raha hai. | Andaman | ~3 s (but "saamne se" overstates: the tankers pass south of Great Nicobar, not by the Andaman beaches) |
| **42** | China ka kareeb 80% tel ek patli si gali se guzarta hai, aur us gali ke darwaze par Bharat baitha hai. | China | ~3 s |
| 41 | **Tum jis Andaman-Nicobar mein chhuttiyan manate ho, uske theek neeche se China ka zyadatar tel guzarta hai.** | Andaman-Nicobar | ~3.5 s |
| 40 | Andaman, jahan tum chhuttiyan manane jaate ho, wahi China ki sabse badi kamzori ke theek saamne baitha hai. | Andaman | ~4 s |
| 37 | China ke paas duniya ki sabse badi Navy hai, phir bhi wo ek samundar mein India se darta hai. | China | ~4 s |

**Pick: the corrected Andaman-Nicobar line (41)**, the accurate version of the top scorer: the place every Indian
knows, "तुम", and the twist ("China का ज़्यादातर तेल") by about 3.5 s, with "यही China का सबसे बड़ा डर है" as the one
escalation. **Backup: the 80% line (42).**

### Frame 0 and the first 3 seconds

- **Frame 0:** the charcoal map, low over Great Nicobar; the islands lit Indian blue, a tanker crossing the Six Degree
  Channel just south of them, mid push-in.
- **"Andaman-Nicobar"** the islands' outline wipes in white; **"छुट्टियाँ"** a beach/palm prop on Havelock;
  **"ठीक नीचे से"** the camera tilts down to the channel; **"China का तेल"** a red dashed tanker line from Malacca,
  "80%" ticking on it.

## Script (184 words; about 74 s at 150 wpm, about 79 s at your VO pace, about 69 s at 1.15×)

`script_roman.txt`. The ElevenLabs text (numbers as Hindi words) comes after you polish it.

| Time | VO | On screen |
|---|---|---|
| 0:00 | Tum jis Andaman-Nicobar mein chhuttiyan manate ho, uske theek neeche se China ka zyadatar tel guzarta hai. Aur yahi China ka sabse bada darr hai. | Frame 0 and the first 3 s (above); "डर" stamp in red over China. |
| 0:07 | China ke paas duniya ki sabse badi Navy hai, 370 se zyada jahaaz. Bharat ke paas kareeb 140. | Pull out: China red, India blue (flat highlights); a ship-icon duel "370+" vs "~140" counting up. |
| 0:13 | Par China ka kareeb 80% videshi tel, ek patli si gali se hokar aata hai: Malacca Strait. | A tanker route from the Gulf across the Indian Ocean into the strait; the strait lights up; "80%" counter. |
| 0:20 | Aur is gali ke darwaze par baitha hai Bharat ka Andaman-Nicobar. Indira Point se Indonesia sirf kareeb 145 kilometer. | The islands lit blue at the strait's mouth; a 145 km measuring line from Indira Point to Rondo Island. |
| 0:28 | Yahin hai Bharat ka ikloota Tri-Service Command. Army, Navy aur Air Force, ek saath. | Port Blair pin; three hex badges (Army, Navy, Air Force) pop in a row; "ANDAMAN & NICOBAR COMMAND · 2001". |
| 0:34 | China mein is darr ka naam hi pad gaya: "Malacca Dilemma". | **Null** (split screen, ~4 s); a kinetic "Malacca Dilemma" stamp over the strait. |
| 0:39 | Isliye China ne Bharat ke chaaron taraf Ports pakde: Pakistan ka Gwadar, Sri Lanka ka Hambantota, 99 saal ki lease par, Myanmar ka Kyaukpyu, aur Africa ke Djibouti mein uska pehla videshi military base. Ise kehte hain String of Pearls. | Wide Indian Ocean; a red dashed loop draws round India; each port pin lights red on its word; "99 YEARS" tag on Hambantota; "String of Pearls" kinetic title. |
| 0:55 | Bharat ka jawab: Iran ka Chabahar, Oman ka Duqm, aur Indonesia ka Sabang, jo Malacca ke bilkul muhaane par hai. | The same loop answered in blue/gold: Chabahar, Duqm, Sabang light blue; zoom to Sabang at the strait's mouth. |
| 1:03 | Aur 2035 tak Bharat ki Navy ka target hai, kareeb 200 jahaaz. | A "2035 TARGET" card; the ship-icon row grows from ~140 to ~200. |
| 1:08 | To agli baar Andaman-Nicobar jao, to yaad rakhna... | Back to frame 0 over Great Nicobar (loop into "Tum jis Andaman-Nicobar mein…"). |

**The winning hook is "The Hidden Fact"** (a place you know with a fact under it nobody told you), because millions
of Indians holiday in the Andamans and almost none know China's oil passes just south of them.

## Fact notes (checked 17 November 2026)

- **"370 se zyada jahaaz":** the US DoD's China report counts over 370 ships and submarines in the PLA Navy, the world's
  largest by number.
- **"Bharat ke paas kareeb 140":** reports in 2026 put India's fleet at about 130–145 warships, depending on what is
  counted.
- **"kareeb 80% videshi tel… Malacca Strait":** the usual estimate (about 80% of China's crude imports); some sources say
  about three-quarters. The VO says "करीब". The "Malacca Dilemma" is the name China's own leadership is reported to have
  used (2003).
- **"Indira Point se Indonesia sirf kareeb 145 km":** Indira Point to Rondo Island (Indonesia's northernmost island) is
  about 145 km (80 nautical miles).
- **"Bharat ka ikloota Tri-Service Command":** the Andaman and Nicobar Command (Port Blair, 2001), India's first and only
  tri-service theatre command.
- **String of Pearls:** Gwadar (Pakistan, Chinese-operated), Hambantota (Sri Lanka, leased to a Chinese company for 99
  years in 2017), Kyaukpyu (Myanmar, China-backed deep-sea port), Djibouti (China's first overseas military base, 2017).
  The term is a Western analysts' label, not China's.
- **India's answer:** Chabahar (Iran, India runs a terminal there), Duqm (Oman, Indian Navy access since 2018), Sabang
  (Indonesia, India agreed in 2018 to help develop the port at the northern mouth of the Malacca Strait).
- **"2035… kareeb 200 jahaaz":** the Navy's stated aim is about 175–200 ships by 2035 (the 200 often includes
  submarines), so the VO says "करीब 200".
- **Left out on purpose:** "India can block China's oil anytime" (the reference's line: an overstatement), "India guards
  all three straits" (Sunda and Lombok are Indonesian), and "China has a base on the Coco Islands" (reported, denied by
  Myanmar, not confirmed).

Sources: [Swarajya, 200 warships by 2035](https://swarajyamag.com/amp/story/defence/indian-navy-eyes-around-200-warships-by-2035-as-indigenous-shipbuilding-programme-gains-pace),
[Marine Insight](https://www.marineinsight.com/india-200-ship-navy-fleet-2035/),
[Foreign Policy, China's Malacca Dilemma after Hormuz](https://foreignpolicy.com/2026/05/11/china-oil-economy-insurance-hormuz-strait-malacca-dilemma/),
[Wikipedia, Malacca dilemma](https://en.wikipedia.org/wiki/Malacca_dilemma),
[Wikipedia, Indira Point](https://en.wikipedia.org/wiki/Indira_Point),
[Drishti IAS, Andaman and Nicobar Command](https://www.drishtiias.com/printpdf/andaman-and-nicobar-command-anc).

Ship it, or change it?
