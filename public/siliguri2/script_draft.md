# Siliguri Corridor v2: script draft (/yt-script)

The reference is analysed in `reference_analysis.md`. The angle: China above, Bangladesh below, and how India turned its
thinnest point into a fortress. Our earlier Siliguri Short covered ports and money (Mongla, Teesta, Kaladan), so this one
doesn't repeat it. The look copies the reference's coloured 3D terrain (see the style list in the analysis), built from
real terrain and satellite data in code, with photoreal props from your GPT images only where they have to look real.

## Hooks (docs/HOOK_PLAYBOOK.md; hookscore is only a rough check)

| Score | Hook | Known thing first? | Twist by |
|---|---|---|---|
| **56** | Tumhara Northeast, Bharat se sirf 22 kilometer ki ek patti se juda hai. Aur is patti par ab do taraf se nazar hai. | Northeast | ~2.5 s, but "do taraf se nazar" is vague: no picture, no named threat |
| **55** | **Tum Darjeeling jao ya Guwahati, tumhe sirf isi 22 kilometer ki patti se guzarna padta hai. Aur iske theek upar China ki fauj baithi hai.** | Darjeeling, Guwahati | ~2.5 s ("sirf isi 22 km"), China at ~5 s |
| 47 | Tum Northeast jis bhi raaste se jao, isi 22 kilometer ki patti se guzarte ho. Aur iske upar China baitha hai. | Northeast | ~2.5 s |
| 43 | Doklam par China ki sadak, Siliguri ki isi patli patti ki taraf aa rahi thi. Isliye Bharat ki fauj 73 din tak saamne khadi rahi. | Doklam (less known) | ~3 s |
| 38 | Bharat ki sabse patli gardan, Chicken's Neck. Par ab yahi Bharat ka sabse bhaari kila ban chuka hai. | Chicken's Neck | ~3 s |

**Pick: the Darjeeling/Guwahati line (55).** It scores one point below the top line but is the stronger hook:
- It names two places every Indian knows and says "तुम".
- The twist ("sirf isi 22 km ki patti") lands inside 2.5 s.
- The one escalation, "China ki fauj", is a picture we can show on frame 0.

**Backup: the Northeast line (56)**, if you want it shorter.

### Frame 0 and the first 3 seconds

- **Frame 0:** the tilted 3D terrain, mid push-in, clouds just parting. The corridor glows orange between purple Nepal
  and green Bangladesh. China is a red mass on the Himalayas above, with its flag tag. Caption: "सिर्फ़ 22 KM".
- **"Darjeeling"** (≈0.3 s): a white pin pops on the hills above Siliguri, with a hit.
- **"Guwahati"** (≈1.0 s): the camera whips east and a pin pops on the Brahmaputra.
- **"sirf isi 22 kilometer"** (≈1.8 s): a yellow route line draws from Darjeeling through the corridor to Guwahati. A
  white measuring bar snaps across the corridor, and the counter runs to "22 KM".
- **"theek upar China ki fauj"** (≈4.5 s): the camera tilts up and China's red pulses. Soldier and armour props stand on
  the Chumbi Valley, with a red ring.

## Script (185 words: about 74 s at 150 wpm, about 79 s at your VO pace, about 69 s at 1.15×)

`script_roman.txt`. The ElevenLabs text (numbers as Hindi words) comes after you polish it.

| Time | VO | On screen |
|---|---|---|
| 0:00 | Tum Darjeeling jao ya Guwahati, tumhe sirf isi 22 kilometer ki patti se guzarna padta hai. Aur iske theek upar China ki fauj baithi hai. | Frame 0 and the first 3 s (above). Jets cross from the west with white contrails. |
| 0:06 | Ye hai Siliguri Corridor, Bharat ka Chicken's Neck. Northeast ke 8 rajya, kareeb 4.5 crore log, sab isi se jude hain. | The orange "सिलीगुड़ी कॉरिडोर" label lies down on the terrain, with a red glow zone under it. Pull east: the 8 states light blue one by one, then a "4.5 करोड़" counter. Road, rail and the oil pipeline draw through the corridor as orange laser lines. |
| 0:13 | Upar, Sikkim aur Bhutan ke beech ghusi hui hai China ki Chumbi Valley. | Whip north. Sikkim blue and Bhutan purple, with the Chumbi Valley wedge pushing down between them in red. A "चुम्बी घाटी" pin. Snow peaks in real 3D. |
| 0:17 | 2017 mein China yahin Doklam par sadak bana raha tha, us pahadi ki taraf jahan se poora Corridor dikhta hai. | Push in to Doklam. A red dashed road draws south toward the Jampheri ridge, and a sight-line cone runs from the ridge down to the corridor. A "2017" tag. |
| 0:24 | Bharat ki fauj 73 din tak saamne khadi rahi. | Indian soldier props stand across the road's tip, with a blue ring. A "73 दिन" counter flips 1 → 73. |
| 0:28 | Ab neeche dekho. 2025 mein Bangladesh ne Lalmonirhat ka World War wala purana airbase phir se jagane ki baat ki, Bharat ki seema ke bilkul paas. | Whip south across the corridor to green Bangladesh. A "लालमनिरहाट" pin, an old runway prop wiping in, a "1931" tag, and a short measuring line to India's border. |
| 0:36 | Aur Dhaka mein ek group ne "Greater Bangladesh" ka map dikhaya, jismein poora Northeast Bangladesh mein tha. Ye map Bharat ki Sansad tak pahuncha. | **Null** (split screen, about 4 s). Then a hatched green "claim" pattern creeps over the Northeast and stops dead at India's solid border line. India's blue stays solid, and a "ख़ारिज" stamp appears. A small "Rajya Sabha · 2025" card. |
| 0:45 | To Bharat ne is patli gardan ko kila bana diya. | Pull back over the whole corridor. It turns from a thin red glow into a solid blue "fortress" outline; with a deep hit, the label reads "किला". |
| 0:48 | Hasimara mein Rafale, reports ke mutabiq S-400 air defence, aur Army ke 3 naye thikaane: Bamuni, Kishanganj aur Chopra. | Rafale jets fly in formation to a Hasimara pin with contrails. Ringed badges pop on each word: "RAFALE", "S-400" (small "रिपोर्ट्स के मुताबिक़"), then three garrison pins with soldier badges at Bamuni, Kishanganj and Chopra. |
| 0:58 | Aur jab koi pooche ki ek patli si patti ke liye itni taiyari kyun, to bas itna kehna... | Pull out, the clouds close over the map, and the last frame matches frame 0 (the loop into "Tum Darjeeling jao ya Guwahati…"). |

**The winning hook is "The Direct Address".** It names the viewer in the first words ("तुम… Darjeeling jao ya Guwahati")
and hands them a fact about their own trip, which fits a place millions of Indians travel through without knowing what
sits above it. The loop's last line asks "itni taiyari kyun?", and the hook answers it.

## Fact notes (checked 18 November 2026)

- **"22 kilometer":** the corridor is about 20–22 km at its narrowest (most sources say 22).
- **"8 rajya, kareeb 4.5 crore log":** the eight Northeast states; estimates run about 4.5–5 crore, hence "kareeb".
- **Chumbi Valley:** a Chinese (Tibet) valley wedged between Sikkim and Bhutan. Its southern end near Doklam is roughly
  80–100 km from Siliguri, and sources differ, so we show it on the map rather than say a number.
- **Doklam 2017:** from 16 June to 28 August 2017, Chinese engineers extended a road south on the plateau toward the
  Jampheri ridge. Bhutan and India say the ridge is Bhutanese, and it overlooks the Siliguri Corridor. Indian troops
  blocked the work. Most sources say 73 days; one says 72.
- **Lalmonirhat:** a 1931 British-era airfield in northern Bangladesh, used in the Second World War. Bangladesh announced
  plans to revive it in 2025. It is about 10–20 km from the Indian border by different reports, so the VO says "bilkul
  paas". Chinese help is alleged by Indian commentators and denied by Bangladesh's army, so the VO doesn't claim it.
- **"Greater Bangladesh" map:** shown by a Dhaka group, Saltanat-e-Bangla, in 2025, not by Bangladesh's government.
  External Affairs Minister Jaishankar answered a question about it in the Rajya Sabha on 1 August 2025, hence "Sansad
  tak pahuncha".
- **Rafale at Hasimara:** No. 101 Squadron flies Rafales from Hasimara (West Bengal) since 2021.
- **S-400:** defence outlets report a squadron covering the corridor, but there is no official confirmation, hence
  "reports ke mutabiq".
- **3 new garrisons:** Bamuni (Assam), Kishanganj (Bihar) and Chopra (West Bengal), reported in November 2025.
- **Left out on purpose** (all from the reference): "75 jets", the "emergency meeting in Delhi", the Doval "22 → 220 km"
  quote, BrahMos, and "air bases at Kishanganj and Purnia". None of these could be verified.

Sources are listed at the end of `reference_analysis.md`.

## What I need from you after the polish

1. Your final wording; then I give the ElevenLabs text.
2. Then I write the asset prompts and the two Omni prompts for Null:
   - Asset props: Rafale top-down, a generic fighter formation, the S-400 launcher truck, Indian soldiers, PLA-style
     armour without markings, an old runway tile, and a fortress-wall prop.
   - Omni: one Null clip here, at the "Greater Bangladesh" beat.

Ship it, or change it?
