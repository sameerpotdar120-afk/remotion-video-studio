# 10: Title, thumbnail, SEO kit, upload (YouTube agent skills)

## 1. Title + thumbnail are one unit (`youtube/yt-package/`)
```bash
python3 SKILL/youtube/yt-package/title.py titles.txt                       # write 10, keep the top 2-3
python3 SKILL/youtube/yt-package/title.py --title "…" --thumb "THE LOOPHOLE"  # pairing check: the thumb must not repeat title words
```
Rules: ≤ 40 chars ideal (mobile), ≤ 60 max; a number/name/date; the searched name in the title; ≤ 2 all-caps words.
Thumbnail: ≤ 3 words that complete the title's promise ("banned" title + "THE LOOPHOLE" cover).

## 2. Thumbnail / cover
```bash
QS='&nocap' SOFTWARE_GL=1 node tools/capture.mjs frames review/thumb "<payoff moment>"   # clean frame: hero + the proof prop
python3 SKILL/tools/thumbnail.py review/thumb/t<…>.jpg thumb.jpg "THE" "LOOPHOLE"        # + thumb_feed.png at 180x320
```
Pick the frame with the hero big (smug) and the key prop visible. Check the 180x320 version: words, face, chain, prop must read.
If the YouTube app offers no Shorts thumbnail upload, tell the creator which frame to pick (timestamp).

## 3. Description and tags (`youtube/yt-seo/`)
- Lines 1-2 = the search snippet: answer the exact query in the words people type ("Why is X illegal in the US, while Y…").
- Then 2-4 sentences of the explanation (no new unverified claims), the channel line ("Samulation: how the world really works,
  in under a minute."), `#shorts` + 2 topical hashtags.
- 10-15 tags: the names and their variants, the "why is …" query, the law/date, the topic words, `samulation`.
- **Query test**: write the 3 searches it should win; their words must be in the title or description lines 1-2.

## 4. Upload
- Time (until channel data exists): **Fri 12:30 PM ET = 11:00 PM IST** (schedule in YouTube Studio); 2nd choice Thu/Sat 6-8 PM ET.
  After ~5 uploads use Studio > Analytics > Audience > "When your viewers are on YouTube".
- Pinned comment: a debate question about the loophole (gets replies). Reply to the first 10-20 comments in the first hour
  (`youtube/yt-comment/`): triage (questions, corrections, praise, bait), < 30 words each.
- 48 h later: retention (`youtube/yt-retention/`). Leak in the first 3 s → fix the hook next time; fine retention but low views →
  change title/thumbnail to the backup.
- Weekly: `yt-plan` (3 uploads/week max, one anchor), `yt-viral` (what beats its channel median in the niche), monthly `yt-audit`.
Every kit ends with "Ship it, or change it?".
