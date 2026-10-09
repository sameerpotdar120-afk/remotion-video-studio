# NullDynasty: project notes

Read this first in any new session. It holds the decisions made so far, so work can continue without the old chat.

## Channel

- **Name:** NullDynasty · YouTube `@null_dynasty` · Instagram `@nulldynasty`
- **Language:** Hindi (Hinglish where natural), audience in India
- **Niche / tagline:** "दुनिया का नक्शा ऐसा क्यों है?": satellite map-animation explainers about borders, countries, map history and unusual/dangerous places
- **Format:** YouTube Shorts + Instagram Reels, 60–75 s, 1080×1920, 30 fps, one continuous camera over real satellite maps, a new visual every 1–2 s, small white subtitles. The creator records their own voiceover.
- **Competitor / benchmark:** GeoGlobeTales (English, 2.04M subs since Nov 2023, Shorts only, "Why/How…" titles). Their branding is a flat cartoon globe; ours deliberately matches our cinematic videos.

## Content types (rotate, then lean into the winner)

1. "ऐसा क्यों है?" map mysteries: strange borders, odd country shapes, why a country owns a far-away place (main type)
2. Unusual and dangerous places (e.g. Darién Gap)
3. India and South Asia map stories (our edge)

## October 2026 schedule

Daily from Oct 9 (changed on Oct 8 from every other day), posted around 11:15 IST.
- Video 1: Darién Gap, posted Oct 8.
- Video 2: Diomede Islands v2 (`src/diomede2/`, `exports/diomede_v2_*`), posted Oct 9. First video with the moving watermark.
- Video 3: North Sentinel Island (`src/sentinel/`, `exports/sentinel_*`), Oct 10 (finished; no watermark, by choice).
- Video 4 onward: one per day, built from a competitor reference.
- The first Diomede version (`src/diomede/`, `exports/diomede_hindi_full.mp4`) is retired.

Keep 1-2 finished videos in the buffer. Never post a rushed video; skip a day instead.
Check-ins on Oct 18 and Oct 31: "viewed vs swiped away", average percentage viewed, subscribers gained per video. If daily posting drags the numbers down, go back to every other day.

## Workflow per video (from Oct 8: reference-first, like the Darién video)

1. The creator picks a competitor Short (e.g. GeoGlobeTales) and sends the file.
2. Claude analyses it frame by frame: shot list, camera moves, how often the visual changes, text/label style, where each SFX lands and how loud it sits under the voice, music level.
3. Claude writes our own Hindi script on the topic (never a line-by-line translation of theirs) and the GPT asset prompts for anything new.
4. Claude rebuilds the edit in that proven style with real maps, our own assets, our own SFX/music, plus ONE extra element their video doesn't have. Don't change much else: the style is already proven.
5. Creator records the voiceover; Claude transcribes, edits, mixes (`tools/mix_diomede.py` is the current mixer: voice on top, SFX/music ducked, −14 LUFS), renders.
6. Claude writes title/thumbnail (`/yt-package`) and description/tags (`/yt-seo`).
7. Creator uploads natively to YouTube first, Instagram 1–2 h later; AI-content label on both; pinned comment.

Adopting a style (pacing, camera language, SFX placement) is fine. Copying their narration, footage, graphics or music is not.

## Rules learned so far

- Real maps only (NASA Blue Marble July topo+bathy, EOX Sentinel-2 2016 CC BY, Natural Earth). Credit EOX on screen and in the description.
- Check every number before publishing (the Darién video's 30,000 km and 160 km still need a source check).
- Script risk: don't translate another creator's narration line by line; write our own.

## Brand assets (in `exports/`)

- `profile_800.png`: India-centred Earth (creator's GPT image) in a gold compass bezel with "ND" (N white, D gold). Composition `ProfilePic`.
- `banner_2560x1440.png`: NASA world map, glow-lines overlay, globe right, "NullDynasty" + "दुनिया का नक्शा ऐसा क्यों है?". Composition `Banner`.
- Fonts: Montserrat (Latin), Noto Sans Devanagari (Hindi). Colours: gold `#FFD21F`, navy `#02050b`, region green `#34DE52`, danger red `#FF2B3D`.
- Channel description, keywords and Instagram bio were written in chat on Oct 8; the Hindi description starts "दुनिया का नक्शा ऐसा क्यों है? NullDynasty पर हर सवाल का जवाब…".

## Where things are

- Darién video project: `src/darien/`, `public/darien/`, `tools/` (see README.md)
- Final video + upload kit: `exports/`
