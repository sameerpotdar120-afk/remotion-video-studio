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

One video every other day: posted Oct 8 (Darién Gap); next Oct 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30.
Check-ins on Oct 18 and Oct 31: review "viewed vs swiped away", average percentage viewed, subscribers gained per video. Consider daily in November only if quality and numbers hold. If a week gets heavy, skip one slot; never post a rushed video.

## Workflow per video

1. Claude drafts the Hindi script (hook scored with `/yt-script`), the creator approves.
2. Creator records the voiceover; Claude transcribes it for word timings.
3. Claude writes GPT image prompts only for new assets; reuse `public/darien/img/` and the maps where possible. GPT never draws maps or Hindi text.
4. Claude builds in Remotion, renders, mixes audio (`tools/mix_audio.py`, Mixkit SFX, −14 LUFS).
5. Claude writes title/thumbnail (`/yt-package`) and description/tags (`/yt-seo`).
6. Creator uploads natively to YouTube first, Instagram 1–2 h later; AI-content label on both; pinned comment.

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
