# Brands: Hindi Short (draft v1, 24 Nov 2026)

## The reference (analysed frame by frame at its native 30 fps, 1,940 frames, 64.8 s)

"Popular brands from different countries" (English VO). What it does:
- One continuous camera over a satellite map: no hard cuts in 64.8 s (ffmpeg scene detection finds none). Each country is
  reached by a fast push/whip from the last one.
- 15 countries, about 4.3 s each. On the country's name its shape floods with one saturated colour (purple USA, red UK,
  blue Italy, orange France, magenta Germany, green Spain...), and a huge ghost country name drifts across it.
- On every brand name a logo pops in (scale up with motion blur), so there is a change every 1.0–1.3 s.
- One-word white caption in the centre, synced to the word being said.
- Frame 0 is already mid-zoom on the USA, purple already filling. No title card, no intro.
- Weak spots we can beat: no hook at all ("The United States has Nike..."), no India, no twist, no ending (it just stops on
  Turkey), and the logos are other companies' artwork.

## Our angle

A plain list ("France has Chanel") gives nobody a reason to share. The Indian version that does: **the brands you think are
Indian are foreign, and the ones that sound foreign are ours.** Same format as the reference (country floods with colour,
brand name pops on its word, a change every second), plus a twist on every brand: the map floods the country the name
*sounds* like, then whips to where it really comes from.

Copyright: no brand logos (they are the companies' artwork). Brand names are set as type in our own OFL fonts, maps from
EOX Sentinel-2 + Natural Earth (India's official boundary), fills and flags drawn in code.

## Hooks (hookscore.py, Hinglish)

| # | Line | Score |
|---|---|---|
| A | Tum jo Bata pehente ho, woh asal mein Indian nahi, Czech company hai. Par tumhara Monte Carlo sweater videshi nahi, hamare Ludhiana ka hai. | **48 WEAK**: specificity 52, address 96, stakes 22, curiosity 58, brevity 100 |
| B | Tumhari Louis Philippe shirt sirf naam se French hai, asal mein woh hamari apni Indian brand hai. | 46 WEAK: specificity 52, address 76, stakes 22, curiosity 58, brevity 100 |
| C | Tum jo Bata pehente ho, woh asal mein Indian nahi, Czech company hai. | 44 |
| D | Tumhara Monte Carlo sweater asal mein Monaco ka nahi, hamare Ludhiana ka hai. | 44 |
| E | Tumhare Red Tape ke joote London ke nahi, asal mein hamare Kanpur ke hain. | 44 |

All five sit at "WEAK" for the same reason the Everest hook did: stakes counts loss words, and this is a surprise story, not
a loss story. A forced loss line would be fake. Hook A wins on address and curiosity: the known thing first (Bata, which
every Indian has worn), the twist by about 2.5 s, then one flip that sets up the second half.

## Script (hook A). VO in Devanagari; numbers as words for the voice, digits on screen.

**1. Hook (0:00–0:06)**
VO: तुम जो Bata पहनते हो, वो असल में Indian नहीं, Czech से आई है। पर तुम्हारा Monte Carlo sweater विदेशी नहीं, हमारे लुधियाना का है।
[ON SCREEN: frame 0 = India (official boundary) already pushing in, flooded saffron, "BATA" in big type sitting on it. On
"Czech" the saffron drains and the camera whips north-west to Czechia, which floods red with the name riding along. On
"Monte Carlo" a whip to Monaco (tiny, ringed), "MONTE CARLO" pops; on "लुधियाना" a whip back, Punjab glows, pin "LUDHIANA".
About 5 changes before 0:03.]

**2. Bata's story (0:06–0:15)**
VO: अठारह सौ चौरानवे में Czech के Zlín शहर में Tomáš Baťa ने ये कंपनी शुरू की, और उन्नीस सौ इकतीस में ये कोलकाता के पास आई। आज भी Bata India का क़रीब आधा हिस्सा विदेशी parent कंपनी के पास है।
[ON SCREEN: Czechia red, pin "ZLÍN · 1894"; a dotted route arcs to India, pin near Kolkata "1931"; Tomáš Baťa rises out of
Zlín (MapPerson, AI illustration); a pie flips to "≈ 50% विदेशी parent".]

**3. The quick-fire list (0:15–0:22)**
VO: और ये अकेली नहीं। Maggi, स्विट्ज़रलैंड की। Colgate, अमेरिका की। Lifebuoy, इंग्लैंड की।
[ON SCREEN: the reference rhythm: Switzerland floods (red, white cross drawn in code) + "MAGGI"; whip to the USA + "COLGATE";
whip to England + "LIFEBUOY". One country per 1.5 s, ghost country names drifting.]

**4. The flip (0:22–0:27)**
VO: अब उल्टा। जिन brands के नाम विदेशी लगते हैं, उनमें से कई हमारे अपने हैं।
[ON SCREEN: the camera pulls back to the world; Europe flickers with names, then all of it drains to grey and India floods
saffron. Caption "अब उल्टा".]

**5. Louis Philippe (0:27–0:33)**
VO: Louis Philippe, नाम France के एक राजा का, पर brand भारत में ही, उन्नीस सौ नवासी में शुरू हुआ।
[ON SCREEN: France floods blue, a crown drawn in code over "LOUIS PHILIPPE"; on "भारत" the name falls off France and lands on
India, "1989". Null split screen (3–4 s) here: a puzzled "French?" look, then a thumbs-up.]

**6. Monte Carlo (0:33–0:40)**
VO: Monte Carlo, नाम Monaco के मशहूर इलाके का, पर इसे लुधियाना की Oswal Woollen Mills ने उन्नीस सौ चौरासी में शुरू किया।
[ON SCREEN: the hook's Monaco ring again, then Punjab → Ludhiana pin "OSWAL WOOLLEN MILLS · 1984"; a sweater drawn in code.]

**7. Red Tape (0:40–0:44)**
VO: Red Tape, सुनने में British, पर है कानपुर की कंपनी का।
[ON SCREEN: a London pin starts to drop, then whips to Kanpur (Uttar Pradesh glows), "RED TAPE · KANPUR".]

**8. Woodland (0:44–0:51)**
VO: Woodland की शुरुआत Canada में हुई, पर एक भारतीय ने की, और उन्नीस सौ बानवे में ये भारत आया।
[ON SCREEN: Quebec floods green, "WOODLAND"; a route arcs across to India, "1992".]

**9. Lakmé (0:51–0:57)**
VO: और Lakmé का नाम एक French opera से आया, पर इसे उन्नीस सौ बावन में Tata ने शुरू किया था।
[ON SCREEN: France blue again, an opera curtain drawn in code; whip to Mumbai, "LAKMÉ · 1952 · TATA".]

**10. Send line, hard end (0:57–1:04)**
VO: तो अगली बार label पर नाम नहीं, देश देखना। और उस दोस्त को भेजो, जो Louis Philippe को French समझता है।
[ON SCREEN: India saffron with all five Indian names on it, then a hard cut to frame 0 (India + "BATA"), so "…French समझता
है" runs straight into "तुम जो Bata पहनते हो".]

Pinned comment (not in the VO): "तुम्हारे घर में कौन सा brand है जो तुम Indian समझते थे? 👇"

**Runtime:** 205 words. At 150 wpm that is 1:22; at our measured pace (Everest: 185 words in 60.6 s after the 1.15× speed-up)
it is about **1:07**.

## Fact notes (checked 24 Nov 2026)

- **Bata:** founded in Zlín (then Austria-Hungary, now Czech Republic) in 1894 by Tomáš, Antonín and Anna Baťa (the day
  varies by source: 21 Sep or 24 Aug). Today's group HQ is Lausanne, Switzerland, so the VO says "Czech से आई", not "Czech
  company". India: incorporated 1931, first unit at Konnagar near Kolkata (1931–32), Batanagar from 1934. Promoter Bata (BN)
  B.V. (Netherlands) held 52.96% until 2022 and about 50% since (aggregator data; check the latest filing before upload).
- **Maggi:** Swiss origin, owned by Nestlé (Switzerland). **Colgate:** Colgate-Palmolive, New York. **Lifebuoy:** Unilever
  (UK); in India sold by Hindustan Unilever.
- **Louis Philippe:** launched 1989 by Madura Garments (Madura Coats) in India; named after Louis Philippe I, King of France
  1830–48; now Aditya Birla. (One source gives 1988 for Madura Garments itself.)
- **Monte Carlo:** launched 1984 by Oswal Woollen Mills (Nahar group), Ludhiana. Monte Carlo is a district of Monaco.
- **Red Tape:** brand from 1996, owned by Mirza International, founded in Kanpur (1979). The listed entity is now in Noida,
  so the VO says "कानपुर की कंपनी", which is about where it was founded.
- **Woodland:** parent Aero Group/Aero Club founded by Avtar Singh in Quebec, Canada; Woodland launched in India in 1992.
- **Lakmé:** started 1952 as a Tata Oil Mills subsidiary, named after Delibes' opera "Lakmé" (French for Lakshmi); sold to
  Hindustan Unilever in the late 1990s (1996/1998 by source). Not mentioned in the VO, to keep one twist per brand.
- **Dropped:** Van Heusen (US) and Allen Solly (UK) are foreign in origin but Aditya Birla holds their Indian rights (Allen
  Solly's world rights), so "foreign" needs a caveat. Peter England's origin (1889 Dublin) rests on one weak source.
