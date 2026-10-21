# YouTube upload pack — America Azaad Kaise Hua (Part 1)

Video file: https://github.com/sameerpotdar120-afk/remotion-video-studio/releases/download/v1.0/America_Azaad_Kaise_Hua_4K60.mp4
Thumbnail: `docs/upload/thumbnail_1280x720.jpg` (1280×720, 277 KB — under YouTube's 2 MB limit)

---

## 1. Title (copy)

```
America आज़ाद कैसे हुआ? 13 साल में राजा से बग़ावत तक
```

52 characters (inside the 60-character desktop cut). On mobile it shows "America आज़ाद कैसे हुआ? 13 साल में राजा…", so the subject survives.

Backups:
- `America Azaad Kaise Hua? | 1763 से 1776 की पूरी कहानी Map पर` (60 chars)
- `1763 में राजा के दीवाने, 1776 में बाग़ी | America की आज़ादी` (59 chars)

## 2. Thumbnail

Main: `docs/upload/thumbnail_1280x720.jpg` — **1763 → 1776** + banner **"प्यार से जंग तक"**
Test version: `docs/upload/thumbnail_B_1280x720.jpg` — same picture, banner **"राजा से नफ़रत?"**

Left half, warm gold: a grinning colonist with the royal crown and hearts. Right half, red: a furious militiaman with a musket.
The banner never repeats the title's words, so title + thumbnail together say more.
Upload both with YouTube Studio's **Test & compare** (Thumbnail → Test & compare) and let YouTube pick the winner by watch time.
Source: `src/thumb/Thumbnail.tsx` (composition `Thumb-4K`, prop `banner`).

## 3. Description (copy everything in the box)

```
America आज़ाद कैसे हुआ? (America Azad Kaise Hua) 1763 में जो लोग अपने राजा से प्यार करते थे, वो सिर्फ़ 13 साल में उसी राजा के ख़िलाफ़ बंदूक क्यों उठा बैठे?
American Revolution की पूरी कहानी, Hindi में, animated map पर: Jumonville Glen की एक गोली से 4 July 1776 तक।

▶ Part 2 (जंग 1776–1783): जल्द आ रहा है, channel subscribe कर लो।

⏱ CHAPTERS
0:00 1763 में राजा से प्यार, 1776 में बग़ावत?
0:32 13 colonies: एक देश थे ही नहीं
1:29 Jumonville Glen 1754: Washington की पहली गोली
2:07 Britain जीता, पर क़र्ज़ दोगुना
2:28 1763 की Proclamation Line
2:48 Sugar Act 1764: tax घटा, फिर भी ग़ुस्सा
3:15 Stamp Act 1765: No taxation without representation
3:45 Repeal और Declaratory Act
4:05 Townshend Acts और Boston में फ़ौज
4:16 Boston Massacre 1770 और John Adams
5:00 Tea Act → Boston Tea Party
5:30 Intolerable Acts और First Continental Congress
5:44 Lexington और Concord 1775
6:16 Washington सेनापति, Bunker Hill, Olive Branch
6:44 Common Sense 1776
6:57 2 July का vote, 4 July का Declaration
7:23 "All men are created equal" का सच
7:34 तो America आज़ाद कैसे हुआ? + Part 2

इस video में: 13 colonies कैसी थीं, Seven Years' War के बाद Britain का क़र्ज़, Sugar Act, Stamp Act, Townshend Acts, Boston Massacre, Boston Tea Party (East India Company की वही चाय, जिस company का उस वक़्त Bengal पर राज था), Lexington, Bunker Hill, Thomas Paine की Common Sense, और Declaration of Independence. आख़िर में एक twist: "सभी इंसान बराबर" लिखने वाले Jefferson के पास उस वक़्त क़रीब 200 ग़ुलाम थे।

📚 SOURCES
Primary documents (public domain): Proclamation of 1763, Sugar Act 1764, Stamp Act 1765, Declaratory Act 1766, Townshend Acts 1767 (Avalon Project, Yale Law School) · "Join, or Die", 1754 and Revere's "Bloody Massacre", 1770 (Library of Congress) · Paine, Common Sense, 1776 · John Adams to Abigail Adams, 3 July 1776 (Founders Online) · Declaration of Independence (National Archives)
Books: Middlekauff, The Glorious Cause · Anderson, Crucible of War · Fischer, Paul Revere's Ride · Zobel, The Boston Massacre · Maier, American Scripture · Wood, The American Revolution
Reference: Monticello · Mount Vernon · National Park Service · American Battlefield Trust · Journal of the American Revolution
Note: Emerson's "shot heard round the world" refers to Concord's North Bridge; Paine's 100,000-copy figure is his own estimate.
📌 Har fact ka source (timestamp ke saath): pinned comment mein.

🗺️ MAPS & DATA
Boundaries: U.S. Census Bureau (public domain) · Made with Natural Earth (public domain)
Terrain: AWS Terrain Tiles (Mapzen/Tilezen) — United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey; Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration; Canada terrain data contains information licensed under the Open Government Licence – Canada; Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers; United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved.

🎨 Illustrations generated with ChatGPT (OpenAI), animated in Remotion · Historical documents recreated from public-domain originals
🎙️ Voice: ElevenLabs · 🎵 Music & sound effects: original, made for this video
🔤 Fonts: Playfair Display, Anton, Kalam, Tiro Devanagari Hindi, Rozha One, Hind (SIL Open Font License)

#AmericanRevolution #HistoryInHindi #AmericaKiAzadi
```

## 4. Tags (copy, comma-separated, 15 tags)

```
america azad kaise hua, america ki azadi, american revolution in hindi, american independence in hindi, अमेरिका की आज़ादी, अमेरिकी क्रांति, 13 colonies in hindi, boston tea party in hindi, declaration of independence hindi, 4 july 1776, george washington hindi, east india company tea, seven years war hindi, history in hindi, map explainer hindi
```

## 4b. Pinned comment (post it yourself after upload, then Pin it)

```
📌 SOURCES — video के हर fact का source (timestamp के साथ)

0:45 1775 तक ~25 लाख लोग, ~5 लाख अश्वेत (ज़्यादातर ग़ुलाम) — Facing South; Thirteen Colonies population estimates
1:05 "Join, or Die" cartoon, Pennsylvania Gazette, 9 May 1754 — Library of Congress
1:29 Jumonville Glen, 28 May 1754, ~15 minute की लड़ाई, Washington 22 साल के — National Park Service; Mount Vernon; American Battlefield Trust
2:07 Treaty of Paris, 10 Feb 1763: France ने Canada सौंपा — Avalon Project (Yale)
2:12 Britain का क़र्ज़ ~£75m से ~£133m (लगभग दोगुना) — Our American Revolution
2:28 Royal Proclamation, 7 Oct 1763 — Avalon Project (Yale)
2:48 Sugar Act 1764: molasses duty 6d → 3d; बिना jury वाली अदालतें — Macmillan, The American Promise
3:15 Stamp Act 1765; Andrew Oliver का पुतला, Liberty Tree (14 Aug 1765); Stamp Act Congress, 9 colonies — Avalon Project; Constitution Center; History.com
3:45 Stamp Act repeal + Declaratory Act, 18 March 1766, "in all cases whatsoever" — Avalon Project (Yale)
4:05 Townshend Acts 1767 (glass, lead, paint, paper, tea); Boston में फ़ौज, 1 Oct 1768 — American Battlefield Trust; ushistory.org
4:16 Boston Massacre, 5 March 1770, 5 मारे गए, Crispus Attucks; Revere की engraving — PBS American Experience; Library of Congress
4:51 John Adams ने बचाव किया: Captain Preston (अलग trial) और 8 में से 6 soldiers बरी — PBS; Zobel, The Boston Massacre
5:15 Boston Tea Party, 16 Dec 1773: Dartmouth, Eleanor, Beaver; 342 पेटियाँ — Nantucket Historical Association; Labaree, The Boston Tea Party
5:30 First Continental Congress, 5 Sep 1774: 12 colonies, 56 delegates — National Archives
5:44 Revere ने "The British are coming" नहीं चिल्लाया — Fischer, Paul Revere's Ride; PolitiFact
6:00 Lexington, 19 April 1775: militia के 8 लोग मारे गए, पहली गोली किसने चलाई, पता नहीं — American Battlefield Trust
6:08 Correction: Emerson की line "The shot heard round the world" (Concord Hymn, 1837) असल में Concord के North Bridge के बारे में है, Lexington के नहीं।
6:16 Second Continental Congress 10 May 1775; Washington सेनापति 15 June 1775 — National Park Service
6:25 Bunker Hill: British के 226 मारे गए, 828 घायल — Battle of Bunker Hill records
6:35 राजा ने Olive Branch Petition (5 July 1775) पढ़ी तक नहीं — American Battlefield Trust
6:44 Common Sense, 10 Jan 1776. Note: "1,00,000+ copies" Paine का अपना दावा है; historians इस पर सहमत नहीं — Journal of the American Revolution
6:57 2 July 1776 vote: 12 हाँ, New York ने vote नहीं दिया — Lee Resolution records
7:05 John Adams का Abigail को letter, 3 July 1776 — Founders Online (National Archives)
7:12 Declaration of Independence, 4 July 1776; Jefferson 33 साल के — National Archives
7:23 Jefferson के पास 1774 में 187 ग़ुलाम (Farm Book), ज़िंदगी भर में 600+ — Monticello (Thomas Jefferson Foundation)

Books: Middlekauff, The Glorious Cause · Anderson, Crucible of War · Fischer, Paul Revere's Ride · Zobel, The Boston Massacre · Labaree, The Boston Tea Party · Maier, American Scripture · Wood, The American Revolution · Taylor, American Revolutions · Raphael, Founding Myths
```

## 5. Query test

| Query someone types | In the title? | In the first two lines? |
| --- | --- | --- |
| america azad kaise hua | yes (Devanagari) | yes (both scripts) |
| american revolution in hindi | no | yes |
| america ki azadi ki kahani | close ("आज़ाद") | yes ("4 July 1776", "American Revolution") |

## 6. Upload settings

- Category: Education · Language: Hindi · Captions: upload Hindi subtitles if you have them (the VO script is in `scripts/america-independence-final-vo.txt`)
- Altered or synthetic content: **Yes** — the voice is AI-generated (ElevenLabs) and the illustrations are AI-generated. YouTube asks creators to disclose this.
- Made for kids: No
- End screen: subscribe + link to Part 2 once it is live
