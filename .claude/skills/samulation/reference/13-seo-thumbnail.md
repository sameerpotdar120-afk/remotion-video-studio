# 13 · Title, thumbnail, SEO kit

## Title and thumbnail are one unit (`youtube/yt-package/title.py`)
```bash
python3 youtube/yt-package/title.py titles.txt                              # write 10, keep the top 2-3
python3 youtube/yt-package/title.py --title "…" --thumb "NOT A BEEHIVE"     # pairing check: no shared words
```
- **Title rules:**
  - ≤40 characters ideal (mobile), ≤60 max;
  - carries a number, date or name; the searched name is in the title;
  - ≤2 all-caps words.
- **Thumbnail text:** ≤3 words that complete the title's promise. Examples: "China Had a Rocket Launcher in 1380" with
  "NOT A BEEHIVE" (100/100); "How Japan Gambles Without Gambling" with "THE SECRET WINDOW".

## Thumbnail from a clean frame
1. Extract caption-free candidates from the joined video *before* captions, at the payoff moment: hero big, smug, with the key prop.
2. Put the text where it doesn't cover the face, above the bottom title strip YouTube adds.
3. Check it at feed size (180x320): words, face, Flame Spikes hair, chain and prop must all read.
4. Script: `tools/thumbnail.py` (top band). For lower-middle text, use a variant with a soft dark band at 58-86 % height:
   white line 1 at ~160 px and gold line 2 (#ffcd32) at ~230 px on 1080x1920, black outline 14 px, blurred drop shadow.

## Description, tags, upload (`youtube/yt-seo`)
- **Description:**
  1. Lines 1-2 answer the exact search query.
  2. Then 2-4 sentences of the story/mechanism (no unverified claims).
  3. Then the channel line ("Samulation: how the world really works, in under a minute.").
  4. Then `#shorts` + 2 topical hashtags.
- **Tags:** 10-15 (the names and their variants, the "how did/why" query, the date, topic words, `samulation`).
- **Query test:** name the 3 searches it should win; their words must appear in the title or description lines 1-2.
- **Upload time:** Fri/Sat 12:30 PM ET = 11:00 PM IST. Keep ≥48 h between shorts. After ~5 uploads, use Studio's audience data instead.
- **Pinned comment:** a debate question. Reply to the first 10-20 comments within an hour.
- **Facts block:** every number with its source, plus what's illustrative.
- End every kit with "Ship it, or change it?".
