# Baikonur: reference analysis and script draft (/yt-script)

## The reference (analysed at 30 fps)

"Why Does Kazakhstan Have a Giant Circle" (Reel, 720×1280, 30 fps, 67.6 s, 2,027 frames). I read it from 2 fps contact
sheets (all 136 positions), eight full-size frames and a faster-whisper transcript.

**Structure**
| Time | VO (their words, summarised) | On screen |
|---|---|---|
| 0–5 s | "Look at Kazakhstan's map: a perfect circle in the middle" | Satellite globe of Asia; Kazakhstan fills turquoise; a push in to a small red-ringed circle, a "Kazakhstan" leader label |
| 5–9 s | "Baikonur Cosmodrome, the world's first and biggest spaceport" | The circle grows to fill the frame; a hard cut to a close satellite view of the launch complex with a white "Baikonur Cosmodrome" callout |
| 9–14 s | "the Soviet Union built it in 1955; Kazakhstan was part of the USSR" | A Soviet emblem badge pops in; "1955"; pull out to a red USSR fill with a label |
| 14–21 s | "Yuri Gagarin launched from here in 1961, the first human in space" | A Gagarin cut-out standing on the map with a two-line caption |
| 21–25 s | "1991, the USSR collapsed; Kazakhstan became independent" | The red fill dissolves; Kazakhstan turquoise again |
| 25–37 s | "Russia didn't let go: it rents the complex, about $115 million a year, until 2050" | Russia fills yellow; two chibi leaders shaking hands over a rocket, "$115 Million" |
| 37–42 s | "and it's not small: about 6,700 km²" | Push in to the circle; an area counter 6,399 → 6,717 km² |
| 42–46 s | "why did Russia build it in Kazakhstan?" | Wide map with a "?" |
| 46–58 s | "it's further south, closer to the equator; Earth spins fastest there" | White arrows down to Kazakhstan, a yellow equator line, a spinning globe |
| 58–68 s | "the rocket gets a boost and needs less fuel" | A space-shuttle-style rocket (Buran-like) rising from Kazakhstan; pull back; the loop ends on the red circle |

**What works**
- A shape everyone can see on the map: a circle inside a country. It's a picture-first hook.
- One clean story: built, famous, the country breaks up, rented, why.
- The rent figure is shareable.

**What doesn't (for us)**
- The hook asks the viewer to "look at the map", with no known thing and no twist until 5 s.
- The rocket at the end is a shuttle (Buran launched from here only once). Soyuz is the right rocket.
- Nothing for an Indian viewer.
- No real loop.

Our version keeps the map story and opens on the Indian link nobody knows: Rakesh Sharma flew to space from this exact
place in 1984 (Soyuz T-11, Baikonur).

**Style to carry over** (in our documentary map look unless you want the reference's colours):
- A satellite globe pushing in to Kazakhstan, the country filled, then the circle ringed and growing.
- The USSR red fill, which breaks apart in 1991.
- People standing on the map (Gagarin, Rakesh Sharma) with name boxes.
- The rent counter and the area counter.
- Latitude lines with the Earth's spin speed, and a Soyuz rising.

## Hooks (docs/HOOK_PLAYBOOK.md; hookscore is only a rough check, and all five score close)

| Score | Hook | Known thing first? | Twist by |
|---|---|---|---|
| **42** | Russia har saal 115 million dollar sirf ek gol ghere ka kiraya deta hai, aur wo ghera Russia mein hai hi nahi. | Russia | ~3 s |
| **42** | Tum Kazakhstan ka map dekho, beech mein ek gol ghera dikhega, jo Kazakhstan ka hokar bhi Kazakhstan ka nahi hai. | Kazakhstan's map (few know it) | ~4 s |
| **40** | **Rakesh Sharma jis jagah se antriksh gaye the, uska kiraya Russia aaj bhi har saal 115 million dollar bharta hai.** | Rakesh Sharma | ~2.5 s ("kiraya") |
| 36 | Duniya ka pehla insaan jis jagah se antriksh gaya, wo jagah aaj kiraye par chal rahi hai. | Gagarin, unnamed | ~3 s |
| 35 | Kazakhstan ke naqshe ke beech ek gol ghera hai, jahan Kazakhstan ka nahi, Russia ka kanoon chalta hai. | Kazakhstan's map | ~4 s |

**Pick: the Rakesh Sharma line (40).** It scores two points under the top line, but it's the stronger hook for us:
- Every Indian knows the name.
- The twist ("kiraya") lands by about 2.5 s.
- It's one claim, and it gives the viewer something to send on.

**Backup: the 115 million line (42)**, if you want the video without the India angle.

### Frame 0 and the first 3 seconds

- **Frame 0:** the satellite map of Kazakhstan's steppe, mid push-in. The Baikonur oval is ringed in red, and Rakesh
  Sharma (in a 1980s flight suit, AI illustration) rises out of the steppe beside it with a name box.
- **"Rakesh Sharma"** (≈0.3 s): the name box wipes in: राकेश शर्मा · 1984.
- **"jis jagah se antriksh"** (≈1.2 s): a Soyuz streaks up out of the circle.
- **"kiraya"** (≈2.3 s): a "किराया" stamp hits the circle.
- **"115 million dollar"** (≈3.5 s): a "$115M / साल" counter ticks.

## Script (181 words; about 72 s at 150 wpm, about 66 s at 1.15×)

`script_roman.txt`. The ElevenLabs text (numbers as Hindi words) comes after you polish it.

| Time | VO | On screen |
|---|---|---|
| 0:00 | Rakesh Sharma jis jagah se antriksh gaye the, uska kiraya Russia aaj bhi har saal 115 million dollar bharta hai. | Frame 0 and the first 3 s (above). |
| 0:06 | Wo jagah hai Kazakhstan ke registaan mein ye gol ghera: Baikonur Cosmodrome, duniya ka pehla Spaceport. | Pull out to the globe. Kazakhstan fills on "Kazakhstan", the oval rings red, then a fast push into the launch complex on satellite, with a "बैकोनूर कॉस्मोड्रोम" label. |
| 0:12 | 1955 mein Soviet Union ne ise yahan banaya, jab Kazakhstan khud USSR ka hissa tha. | "1955" flips. Pull out: the USSR fills red over Russia and Kazakhstan together, with its outline. |
| 0:17 | Yahin se 1957 mein pehla satellite Sputnik gaya, 1961 mein pehle insaan Yuri Gagarin, aur 1984 mein Bharat ke Rakesh Sharma. | Three quick beats from the circle: the Sputnik prop in an orbit ring with "1957"; Gagarin rising with a name box and "1961"; Rakesh Sharma rising with the tricolour drawn in code and "1984". |
| 0:27 | Phir 1991 mein Soviet Union toot gaya, aur ye Spaceport raaton-raat ek doosre desh mein aa gaya. | **Null** (split screen, about 3 s). The red USSR cracks into 15 pieces on "toot gaya"; Kazakhstan stays alone in its own colour with the circle inside it, and a "1991" stamp. |
| 0:34 | To Russia ne ise kiraye par le liya: har saal kareeb 115 million dollar, 2050 tak. | Russia fills its own colour; a dashed lease line runs from Moscow to the circle. A "$115M / साल" counter and a "2050 तक" tag. |
| 0:40 | Aur aaj is ghere ke andar zyadatar Russia ka kanoon aur Russia ka Rouble chalta hai. | Push into the oval: a "6,717 km²" area tag, then a ₽ coin and a Russian-law gavel prop inside the circle. |
| 0:46 | Par Russia itni door kyun aaya? Kyunki Baikonur Russia ke zyadatar launch sites se kaafi south mein hai, Equator ke zyada kareeb. | **Null** (about 3 s) on "kyun aaya". Then latitude lines: Plesetsk 63° N, Vostochny 52° N, Baikonur 46° N, and the equator far below. |
| 0:55 | Wahan Dharti zyada tez ghoomti hai, to rocket ko muft ka dhakka milta hai, aur orbit tak kam fuel lagta hai. | A 3D globe spinning; speed tags per latitude: equator about 1,670 km/h, Baikonur about 1,160, Plesetsk about 760. A Soyuz rises east out of the circle with a white trail. |
| 1:02 | Aur agar koi pooche ki registaan ka ye ghera itna khaas kyun hai, to bas itna kehna... | Back to frame 0 (the oval ringed red, mid push-in), so it loops into "Rakesh Sharma jis jagah se…". |

**The winning hook is "The Hidden Fact"** (a name you know with a fact under it nobody told you). Every Indian knows
Rakesh Sharma flew to space; almost nobody knows he took off from a place Russia now rents from Kazakhstan. In the 21
formulas it is closest to "The Insider". hookscore classifies none of the five, which is normal for Hinglish lines.

## Fact notes (checked 20 November 2026)

- **Rakesh Sharma:** flew on Soyuz T-11, launched 3 April 1984 from Baikonur (Site 31). He was the first Indian in space,
  under the Soviet Interkosmos programme. Some sources give 2 April (a time-zone difference).
- **"duniya ka pehla Spaceport":** Baikonur is the world's first and oldest spaceport. It was founded in 1955 and
  launched Sputnik 1 in 1957 and Gagarin's Vostok 1 on 12 April 1961. "Sabse bada" (the reference's line) is often
  claimed; we leave it out.
- **The lease:** the 1994 agreement set US$115 million a year. In 2004 it was extended to 2050, ratified by Russia in
  2005, with the fee unchanged.
- **Inside the circle:** the leased area is about 6,717 km². The city of Baikonur is administered by Russia and Russian
  law applies there. Both currencies are used, but the rouble is generally preferred, so the VO says "zyadatar". The
  city's head is appointed jointly by both presidents, and since 2018 some eastern facilities have been returned to
  Kazakhstan.
- **Why so far south:** Baikonur is at about 45.6° N. Plesetsk is at 62.9° N, Vostochny at 51.9° N and Kapustin Yar at
  48.6° N, so "zyadatar launch sites se south". The Earth's surface speed is about 1,670 km/h at the equator, about
  1,170 km/h at Baikonur and about 760 km/h at Plesetsk (1,670 × cos latitude). A rocket launched east starts with that
  speed, so it needs less fuel. The flat, empty steppe and the railway were other reasons for the site; the VO doesn't
  claim latitude was the only one.
- **Left out on purpose:**
  - The reference's shuttle-style rocket: Buran flew from here only once, in 1988, so we show a Soyuz.
  - The "Baikonur name was a deception" story: sources disagree, and NASA's history says it wasn't.
  - The "plywood decoy" legend.

**Sources**
- [The Moscow Times, lease extended to 2050](https://www.themoscowtimes.com/archive/cosmodrome-lease-extended-until-2050)
- [NBC News, Russia extends lease](https://www.nbcnews.com/id/wbna3917623)
- [The Moscow Times, 2025: Kazakhstan denies early exit](https://www.themoscowtimes.com/2025/05/15/kazakhstan-denies-russia-plans-early-exit-from-baikonur-spaceport-a89091)
- [RFE/RL, Baikonur contract dispute](https://www.rferl.org/a/russia-baikonur-kazakhstan-dispute/32352815.html)
- [Wikipedia, Baikonur (city)](https://en.wikipedia.org/wiki/Baikonur)
- [Wikipedia, Baikonur Cosmodrome](https://en.wikipedia.org/wiki/Baikonur_Cosmodrome)
- [Space.com, Baikonur backstory](https://www.space.com/40785-history-baikonur-kazakhstan-launch.html)
- [Wikipedia, Soyuz T-11](https://en.wikipedia.org/wiki/Soyuz_T-11)
- [Spacefacts, Soyuz T-11](https://spacefacts.de/mission/english/soyuz-t11.htm)
- [Wikipedia, Rakesh Sharma](https://en.wikipedia.org/wiki/Rakesh_Sharma)

Ship it, or change it?
