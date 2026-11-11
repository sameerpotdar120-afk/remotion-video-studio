# Reference analysis: "This Happens Every Second on Earth" (71.4 s)

Measured from the file: 720×1280, 30 fps, 71.4 s, English VO (`reference_transcript.txt`). Only two hard cuts (2.1 s
into the clock close-up, 18.7 s back to the map); everything else is camera moves on one flat satellite world map, plus a
tilted 3D globe for the space facts (34.9-44 s).

## The look

- A flat Sentinel-style world map (Robinson-like), slow pushes and pans to the continent each fact is about; for some
  facts the whole map tilts back in 3D with a blue grid floor behind it.
- **Props rain onto the map**: swaddled babies (4, then 2 in Asia, 1 Africa, 1 South America), gravestones, envelopes,
  chat bubbles, X logos and tweet cards, a Google "G" and a search bar, coffee cups, Coke cans, beer mugs, pizza slices,
  lightning bolts, cars crashing, oil-barrel flames and red CO2 balls, a hot dog, Elon Musk's face, Amazon/Walmart
  buildings, like-thumbs.
- **Big white or coloured counters** ("4,000,000", "100,000 searches/sec", "1,200 BBL", "$15,000") and a highlighted
  continent fill (Asia red, Africa green, South America olive).
- A 3D Earth in space for "light circles the Earth ×7" (a glowing ring) and "Earth travels 30 km around the Sun".
- One-line white captions. Ends on "so don't mess up the stats and hit the like button" (no loop).

## Fact check of the reference

| Claim | Verdict |
| --- | --- |
| ~4 births per second | **True.** UN WPP 2024: about 132.5 million births in 2026, about 4.2 a second. |
| 2 in Asia, 1 in Africa, 1 in South America | **Wrong.** About half are in Asia and about a third in Africa; South America is only about 5%. |
| ~2 deaths per second | **True.** About 63.6 million deaths in 2026, about 2.0 a second. |
| 4 million emails per second | **Roughly true** (about 350-380 billion emails a day, spam included). |
| 3 million text messages per second | **Doubtful.** No solid source; dropped. |
| 10,000 tweets per second | **Old/unsourced** (X no longer publishes this); dropped. |
| Google 100,000+ searches per second | **True** (estimates of 8.5-14 billion a day, 100,000-160,000 a second). |
| 23,000 cups of coffee per second | **About right** (about 2 billion cups a day); not used, to keep it short. |
| 25,000 cans of Coke | **Misleading:** Coca-Cola's ~2.2 billion daily servings cover all its drinks, not cans of Coke. Dropped. |
| 400 slices of pizza | **US figure** (about 350 slices a second in the US), not the world. Dropped. |
| ~100 lightning strikes per second | **Outdated.** The 100/s estimate dates from 1925; NASA's satellites (OTD/LIS) measure about 44 ± 5 flashes a second. Used as a twist. |
| Light circles the Earth ~7 times | **True** (about 7.5 times). |
| Earth travels ~30 km around the Sun | **True** (about 29.8 km/s). |
| One earthquake every second | **Wrong.** USGS locates about 14,500-20,000 a year (magnitude 4+); counting tiny unfelt ones, estimates reach about 500,000 a year (about one a minute). Dropped. |
| ~2 car crashes per second | **No global source;** dropped. |
| 1,200 barrels of oil burned | **True** (about 103-104 million barrels a day). |
| 1,100 tons of CO2 | **About right** (about 37-38 billion tonnes of fossil CO2 a year, about 1,200 a second). |
| Costco ~6 hot dogs per second | **About right** (about 200 million combos a year); not used (US-centric). |
| Elon Musk gains $3,000/s; Amazon and Walmart ~$15,000/s | **Unsourced/outdated** (Amazon's and Walmart's revenue is about $20,000/s each); dropped. |
| 5 million likes per second | **Wrong by ~60×:** the old figure is about 4 million Facebook likes a minute. Dropped. |

## India facts added

- India: about 23 million births a year (UN WPP 2024), about one every 1.4 seconds, about 1 in 6 of the world's births.
- UPI: 25.47 billion transactions in October 2026 (NPCI), about 822 million a day, about 9,500 a second.

## How we match it (and beat it)

- Same idea (props raining onto a satellite map with counters), our house map (EOX Sentinel-2 + relief, India's official
  boundary from Natural Earth's India edition), props drawn in code, big counters rolling in sync with the VO.
- A 3D globe for the space beats (light ×7.5 ring, the 30 km orbit step).
- A twist the reference lacks: the "100 lightning strikes" myth corrected to NASA's 44.
- India beats: births and UPI.
- A loop ending instead of a "like" ask.

Sources: UN World Population Prospects 2024 (via statisticstimes/measuredworld); NPCI via Entrepreneur/Free Press
Journal (Nov 2026); NASA (Christian et al.; Earthdata) and NOAA on lightning; USGS on earthquake counts.
