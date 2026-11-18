# Siliguri Corridor v2: reference analysis

Reference: "Tension Rising in India's Siliguri Corridor" (Reel, 720×1280, 30 fps, 65.85 s). I read it from 2 fps contact
sheets (all 132 positions), 10 full-size frames and a faster-whisper transcript, with two spans re-transcribed.

This is a new video on the Siliguri Corridor. Our earlier one (`public/siliguri/`, `exports/siliguri_2k60.mp4`) was about
ports and money: Chattogram and Mongla, China's economic zone, Teesta and Kaladan. This one is about the military
picture: China above, Bangladesh below, and what India has built in between.

## Structure (their beats, summarised)

| Time | VO (summary) | On screen |
|---|---|---|
| 0–4 s | "India has recently deployed 75 fighter jets around the Siliguri Corridor" | Clouds part over a tilted 3D terrain. China is filled red, India blue and Bangladesh green, with flag tags ("CHINA TERRITORY", "BANGLA TERRITORY"). A row of small jets flies in from the left. |
| 4–10 s | "this chicken's neck joins the Northeast to India; military presence is being raised here" | The jets sweep east with white contrail lines. Bhutan turns purple. An orange glowing "SILIGURI CORRIDOR" label lies on the map over a red glow zone (about 9.5 s). |
| 10–15 s | (cont.) | Push in to the corridor; a big "BANGLA TERRITORY" tag slides past. |
| 15–28 s | "during the drill, Bangladesh released a 'Greater Bangladesh' map with Assam, Meghalaya and part of the corridor" | A long, nearly static wide shot of green Bangladesh with a faint red corridor glow. About 13 s with almost no change: the weakest stretch. |
| 28–32 s | "the timing was so serious an emergency meeting began in Delhi" | Pull out, clouds back in; a small leader cut-out with a name box at Delhi. |
| 32–38 s | "the threat isn't one-sided: 80 km north, China's troops are active in the Chumbi Valley" | Push to a white "CHUMBI VALLEY" pin among snow peaks. |
| 38–44 s | "Ajit Doval: one wrong move and this 22 km corridor becomes 220 km wide" | A cut-out rises at the corridor with a name box; a counter on the label runs 3 → 10 → 18 → 22 → 38 → 188 → 220 KM while the glow zone stretches and rotates. A corner wipe at 43 s. |
| 44–55 s | "BrahMos batteries, S-400 systems and 75+ jets deployed; new air bases at Kishanganj and Purnia" | Circular white-ring badges with photo icons and italic labels pop in one by one: "BRAHMOS MISSILE", "S-400 AIR DEFENSE", "FIGHTER JETS". The camera drifts and the badges re-scale. A yellow patch lights (the Kishanganj/Purnia area). |
| 55–62 s | "it's not just 22 km, it is 45 million people's connection to India" | Myanmar purple; orange and yellow laser lines sweep across the corridor. |
| 62–66 s | "India won't back down; share this with every Indian" | Pull out, the clouds close over the map (the loop back to frame 0). |

## The animation style, to copy closely

The creator asked for this exact style, done properly and not as cheap AI. So this video does not use our black-and-white
documentary map. It uses the reference's coloured 3D terrain, built from real data and code. Everything below is
buildable without AI imagery except the props listed in the asset prompts.

1. **A real 3D tilted terrain.** A height mesh in three.js from AWS Terrain Tiles (SRTM), textured with EOX
   Sentinel-2 cloudless, with the camera pitched 45–60°. The Himalayas stand up as real relief, with snow on the
   peaks from an elevation and slope mask. It is the same technique as `src/aravalli/edit/Terrain3D.tsx`, over a larger
   area (about 84–95° E, 21–30° N) at a higher resolution near the corridor.
2. **Saturated country fills draped on the relief.** These are semi-transparent (about 55–65%) so the terrain shows
   through, and they lie on the ground, never floating: China red, India blue, Bangladesh green, Nepal and Bhutan
   purple, Myanmar purple. Borders come from Natural Earth, India point-of-view edition, so Arunachal and the whole of
   Sikkim are India-blue, and the boundary is India's official one.
3. **Glowing cyan rivers.** The Ganga, Brahmaputra, Teesta, Mahananda and Padma from Natural Earth 10 m rivers (public
   domain), drawn as additive glow lines on the terrain. In the reference the rivers glow through every fill.
4. **Procedural clouds.** A volumetric-looking cloud layer in a shader (noise, lit from above) that parts in the
   first 2 s and closes in the last 2 s for the loop. No stock or AI cloud footage.
5. **Flag territory tags.** A dark rounded box with the flag drawn in code, plus "CHINA" and "BANGLADESH" in bold
   condensed type (in Hindi for us). They are pinned to the terrain and scale with the camera.
6. **Jets with contrails.** Photoreal top-down jet props (the creator's GPT images) flying in formation along splines
   over the terrain, each trailing a thin white contrail that fades. They cast a soft shadow on the ground far below,
   so the height reads.
7. **The corridor label.** Orange-to-yellow gradient "सिलीगुड़ी कॉरिडोर" text lying in perspective on the terrain, with
   a red pulsing glow zone under it and a white width counter ("22 KM") that animates.
8. **Ringed badges.** A white ring with a dark glass fill, a photoreal prop icon inside (Rafale, the S-400 launcher,
   a soldier) and an italic white label underneath. They pop in with an overshoot, a ring wipe and a hit SFX, and
   they are pinned to the ground position they belong to.
9. **Pins.** A white dot with a soft halo and a small caps label, for the Chumbi Valley, Doklam, Lalmonirhat,
   Hasimara, Bamuni, Kishanganj and Chopra.
10. **Laser and route lines.** Orange and yellow additive lines for the road and rail through the corridor and for
    the Doklam road.
11. **Camera.** One continuous move with no hard cuts: slow push-ins, drifts, a light shake on hits, and a few fast
    whip moves between north (China) and south (Bangladesh).
12. **Grade.** Rich and contrasty, with deep teal plains and shadows, a slight vignette and no grain.

## What works in the reference

- One continuous 3D map with every country in a strong colour, so a viewer knows who is where with the sound off.
- Military props (jets, badges) give the "tension" feel the title promises.
- The counter on the corridor label and the clouds open/close loop.

## What doesn't work, and what we change

- **Facts.** Several claims are unsupported or wrong. See the fact check below. We keep only what is verifiable.
- **The hook** opens on a number nobody can check ("75 jets") instead of a place people know.
- **15–28 s is a near-static shot.** We keep a change every 1–2 s throughout.
- **The map's borders** don't follow India's official boundary. Ours does.
- **The ending** is a share request, not a loop. Ours asks a question that the hook answers.

## Fact check of the reference's claims (18 Nov 2026)

| Their claim | Verdict | What we can say |
|---|---|---|
| "75 fighter jets recently deployed around the corridor" | Not found in any report | Drop. Rafale squadron 101 has been at Hasimara since 2021: verifiable. |
| "Bangladesh released a 'Greater Bangladesh' map" | Wrong as stated | A Dhaka group, Saltanat-e-Bangla, showed the map (reported at Dhaka University, 2025). It wasn't Bangladesh's government. Bangladesh's own fact-check unit (BanglaFact) dismissed it. Jaishankar replied about it in the Rajya Sabha (1 Aug 2025). |
| "Emergency meeting in Delhi" | No source | Drop. |
| "Chinese troops 80 km north in the Chumbi Valley" | Roughly right on distance | The Chumbi Valley's southern end (Doklam area) is about 80–100 km from Siliguri, and sources differ. We say "theek upar" and show the distance on the map; we don't say it in the VO. |
| Ajit Doval: "22 km becomes 220 km" | No source | Drop. The only "22 km" remark found is Himanta Sarma's, Dec 2025, about widening the corridor. We leave it out (it's political). |
| "BrahMos and S-400 near Siliguri" | Reported by defence outlets, not official | S-400 is said with "reports ke mutabiq". BrahMos is left out. |
| "New air bases at Kishanganj and Purnia" | Partly | The reports (Nov 2025) are of three new **Army garrisons**: Bamuni (Assam), Kishanganj (Bihar) and Chopra (West Bengal). They are not air bases, and Purnia isn't on the list. |
| "45 million people" | Close | The 8 Northeast states have about 4.5–5 crore people (estimates). We say "kareeb 4.5 crore". |

Sources: [The Week, three garrisons](https://www.theweek.in/news/defence/2025/11/06/exclusive-no-more-ambiguous-response-india-warns-dhaka-sets-up-3-military-garrisons-near-border.html),
[Raksha Anirveda, garrisons](https://raksha-anirveda.com/shielding-the-eastern-frontier-india-strengthens-siliguri-corridor-establishes-three-new-garrisons/),
[Scroll, Greater Bangladesh map and Jaishankar's reply](https://scroll.in/latest/1085115/scroll_in),
[Deccan Herald, the same](https://www.deccanherald.com/amp/story/india%2Fislamist-group-backed-by-turkish-ngo-behind-greater-bangladesh-map-jaishankar-says-india-has-taken-note-3661047),
[BanglaFact](https://banglafact.com/postDetails/101),
[The Week, Lalmonirhat airbase](https://www.theweek.in/news/defence/2025/05/20/china-creeping-closer-why-india-is-worried-about-bangladeshs-plans-to-revive-world-war-ii-era-airbase-near-siliguri-corridor.html),
[Business Today, Lalmonirhat](https://www.businesstoday.in/india/story/major-concern-for-india-brahma-chellaney-warns-of-chinese-assisted-bangladeshs-lalmonirhat-airbase-near-siliguri-477028-2025-05-20),
[Wikipedia, 2017 Doklam standoff](https://wikipedia.com/wiki/Doklam_standoff),
[ThePrint, Operation Juniper](https://theprint.in/defence/operation-juniper-indian-armys-human-wall-china-doklam/307332),
[Wikipedia, Siliguri Corridor](https://en.wikipedia.org/wiki/Siliguri_Corridor),
[Organiser, Himanta's 22 km remark](https://organiser.org/2025/12/23/331664/bharat/assam-cm-himanta-calls-for-widening-siliguri-corridor-by-22-km-cites-rising-threats-to-national-security/),
[News Arena, S-400 and Rafale](https://newsarenaindia.com/nation/s-400-rafale-jets-fortify-india-s-siliguri-corridor/40975).
