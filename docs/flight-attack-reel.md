# Reel: Flydubai FZ1073 cockpit attack

Composition: `FlightAttackReel` (1080x1920, 24 fps, 50.5 s). Render with `npm run render:flight`.
The script lives in `src/flight-attack/script.ts`; edit the text or the per-beat seconds there and
the captions and timing follow.

## Hooks (scored with `.claude/skills/yt-script/hookscore.py`)

**A. Winner, 73 STRONG, formula: The Question**

> You'd never guess who almost crashed Flydubai flight 1073. It wasn't a passenger. So how did 182 people survive?

```
SPECIFICITY 91 | ADDRESS 76 | STAKES 62 | CURIOSITY 76 | BREVITY 100 | VERDICT 73
weakest: STAKES
```

**B. Runner-up, 70 WORKABLE, formula: The Statistic**

> You lose 17,000 feet in under a minute, and the only person who can stop it is bleeding on the floor. How?

```
SPECIFICITY 62 | ADDRESS 76 | STAKES 88 | CURIOSITY 59 | BREVITY 100 | VERDICT 70
weakest: CURIOSITY
```

Why A: the story's twist is that the attacker was the co-pilot, not a passenger, and the hook
withholds that while opening a second question (how did they survive) that the payoff answers by name.

## Script

| Time | Voiceover | On screen |
|---|---|---|
| 0:00-0:06 | You'd never guess who almost crashed Flydubai flight 1073. It wasn't a passenger. So how did 182 people survive? | Plane silhouette shaking and tilting, "FZ1073", flashing "COCKPIT ATTACK" tag |
| 0:06-0:11 | September 30th. Dubai to Tel Aviv. A Boeing 737 MAX, two and a half hours in. | Map, route drawing from Dubai toward Tel Aviv, date and aircraft tags |
| 0:11-0:17 | UAE prosecutors say the co-pilot grabbed the cockpit crash axe and attacked the captain. | Swinging crash axe, red hit flashes, "SOURCE: UAE PROSECUTOR GENERAL" |
| 0:17-0:22 | The plane dropped about 17,000 feet in under a minute. | Altimeter counting 34,000 down to 17,000, screen shake, "PULL UP" warning |
| 0:22-0:28 | The captain, badly wounded on the floor, reached the switch and unlocked the cockpit door. | Cockpit door, red padlock turns green and opens |
| 0:28-0:34 | Passengers and an off-duty pilot rushed in, dragged the co-pilot out and tied him up with headphone cables. | Cabin cutaway, dots rushing toward the cockpit |
| 0:34-0:42 | That's how 182 people survived. A bleeding captain who opened the door, and strangers who ran toward it. The crew landed safely in Tabuk, Saudi Arabia. | "182 PEOPLE ON BOARD", diversion line drawn to Tabuk |
| 0:42-0:47 | The captain is in stable condition. The accused co-pilot is with UAE investigators. | Two status cards |
| 0:47-0:50 | Follow for the investigation updates. | "FOLLOW" end card |

136 words. At 150 wpm that is about 54 s; the video runs 50.5 s, so the read is a little brisk
(about 160 wpm), which suits a reel. Captions are burned in, so the reel also works muted.

## Sources

- UAE Prosecutor General Hamad Saif Al Shamsi on the crash axe and attempted terrorist act:
  [CNBC](https://www.cnbc.com/2026/10/03/flydubai-co-pilot-attacked-pilot-with-axe-uae-says.html),
  [Al Jazeera](https://www.aljazeera.com/news/2026/10/3/flydubai-co-pilot-stabbed-pilot-with-crash-axe-in-terrorist-attack-uae),
  [CBC](https://www.cbc.ca/news/world/flydubai-captain-attacked-cockpit-crash-axe-9.7368120)
- Altitude drop (about 34,000 ft to 17,000 ft in under a minute), landing in Tabuk:
  [CNBC](https://www.cnbc.com/2026/10/03/flydubai-co-pilot-attacked-pilot-with-axe-uae-says.html)
- 174 passengers and 8 crew (182 people), 9:45am landing, captain stable then flown to Abu Dhabi:
  [Gulf News](https://gulfnews.com/business/aviation/flydubai-emergency-landing-saudi-arabia-issues-clarification-1.500695587)
- Captain opening the door, passengers and a deadheading pilot restraining the co-pilot, headphone wires:
  [US News explainer](https://www.usnews.com/news/world/articles/2026-10-02/explainer-what-do-we-know-about-flydubai-flight-1073),
  [Flydubai Flight 1073 on Wikipedia](https://en.wikipedia.org/wiki/Flydubai_Flight_1073)
- Suspect transferred to the UAE:
  [CNN live coverage, Oct 1](https://www.cnn.com/2026/10/01/world/live-news/flydubai-flight-israel-pilot-passengers-intl)

Reports differ on the exact drop (one gives about 16,600 ft in just over 30 seconds), so the
script says "about 17,000 feet in under a minute". The co-pilot is "accused" throughout; nothing
has been tried in court.
