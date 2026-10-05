# FZ1073 documentary: asset list

## Specs for everything

- Video: 1920x1080, 16:9, MP4 (H.264), 24 or 30 fps, no burned-in text or watermarks. 5-8 s per clip is enough unless noted.
- Images: 1920x1080 or larger, JPG or PNG.
- Audio: WAV or MP3, 48 kHz.
- Name files exactly as below and put them in `public/fz1073/` (subfolders `audio/`, `video/`, `images/`, `music/`, `sfx/`).

Style line to paste at the end of every AI video or image prompt so the shots match:

> cinematic documentary look, 16:9, muted teal and amber color grade, low-key lighting, shallow depth of field, subtle 35mm film grain, no text, no logos, no airline branding, no identifiable faces

## Three rules

1. **Never AI-generate real people.** The captain, the co-pilot, the passengers, the Prosecutor General, Trump and Netanyahu all have to come from real published photos or footage, with credit. If you can't get one, skip it and I'll use a name card.
2. **No Flydubai logo or livery in AI shots.** Use a plain white 737. Real Flydubai images have to be real photos.
3. **AI scenes of the attack are reconstructions.** I'll add a small "RECONSTRUCTION" tag on screen. Keep them non-graphic: no blood, no visible axe strikes.

---

## 1. Audio

| File | What it is |
|---|---|
| `audio/vo_full.wav` | Your voiceover of the whole script. Leave about 1 second between paragraphs. One file is fine. If you record by chapter, name them `vo_01.wav` to `vo_11.wav`. |
| `music/music_tension.mp3` | Dark ambient drone, low strings, slow pulse, about 4 min. For the cold open and chapters 3 and 4. |
| `music/music_investigative.mp3` | Restrained, pulsing, documentary underscore, about 4 min. For chapters 1, 2 and 7. |
| `music/music_action.mp3` | Rising percussion, tense build, about 2 min. For chapter 5. |
| `music/music_resolve.mp3` | Calm, hopeful but restrained, piano or pads, about 2 min. For chapter 6 (landing) and the payoff. |

Royalty-free music sources: YouTube Audio Library, Pixabay Music, Uppbeat, Epidemic Sound.

**Sound effects (`sfx/`)**

| File | Use |
|---|---|
| `sfx_cabin_hum.wav` | Steady jet cabin ambience, 60 s loop |
| `sfx_alarm.wav` | Generic cockpit warning chime or tone |
| `sfx_wind_rush.wav` | Rushing air for the dive |
| `sfx_whoosh.wav` | Transitions between chapters |
| `sfx_low_hit.wav` | Deep cinematic impact for title cards |
| `sfx_door_latch.wav` | Heavy metal latch click and handle twist |
| `sfx_keypad_beep.wav` | Keypad button beeps, then a denied buzz |
| `sfx_radio_static.wav` | ATC radio static and squelch |
| `sfx_jet_flyby.wav` | Fighter jet passing overhead |
| `sfx_heartbeat.wav` | Slow heartbeat, for the captain on the floor |
| `sfx_touchdown.wav` | Tyres touching the runway, reverse thrust |
| `sfx_cabin_panic.wav` | Muffled cabin voices, no clear words |
| `sfx_typing.wav` | Keyboard or typewriter for the dossier scenes |

---

## 2. Video and images, by chapter

### Cold open (0:00)

**V01 `video/cockpit_door_closed.mp4`** (8 s). AI.
> Slow push-in on a closed airliner cockpit door seen from the cabin aisle, dim cabin light, small red light glowing on a keypad beside the door, the door is grey and reinforced, eerie stillness

**V02 `video/plane_dawn_cruise.mp4`** (6 s). AI or stock.
> Plain white Boeing 737 MAX cruising at high altitude at dawn over a vast desert, side tracking shot, sun low on the horizon

### The turn (0:15)

**V03 `video/dubai_airport_dawn.mp4`** (6 s). Stock or AI.
> Dubai International Airport terminal at early dawn, aircraft at gates, blue hour light, wide establishing shot

**V04 `video/takeoff_737.mp4`** (6 s). Stock or AI.
> Plain white Boeing 737 MAX taking off from a desert-city runway at sunrise, heat haze, telephoto shot

### Chapter 1: The flight (0:44)

**V05 `video/boarding_cabin.mp4`** (6 s). AI.
> Passengers settling into seats on a narrow-body airliner, stowing bags in overhead bins, families with children, faces soft and out of focus, morning light through windows

**V06 `video/cockpit_two_pilots_rear.mp4`** (6 s). AI.
> View from behind two airline pilots in a 737 cockpit at cruise, captain on the left and first officer on the right, faces not visible, instrument glow, sky ahead

**I01 `images/captain_smit_machchhar.jpg`**. Real photo only, from CNN, Gulf News, WION or Newsweek coverage. Note the outlet for the credit.

**I02 `images/a6-fkf.jpg`** (optional). Real photo of the aircraft. Search "A6-FKF" on JetPhotos or Planespotters and check the licence.

### Chapter 2: The man in the right seat (1:36)

**V07 `video/dossier_desk.mp4`** (8 s). AI.
> Overhead shot of an investigator's desk at night, scattered documents, a closed file folder, a desk lamp, a pen moving across paper, faces not shown

**V08 `video/dubai_skyline.mp4`** (6 s). Stock.
> Dubai skyline at dusk, slow aerial drift

**I03 `images/oman_air_aircraft.jpg`**. Real photo of an Oman Air aircraft (Wikimedia Commons has licensed ones).

**I04 `images/flydubai_aircraft.jpg`**. Real photo of a Flydubai 737 (Wikimedia Commons).

**I05 `images/bucks_new_uni.jpg`**. Real photo of the Buckinghamshire New University campus (Wikimedia Commons).

**V09 `video/security_checklist.mp4`** (5 s). AI.
> Close-up of a printed security checklist on a clipboard, a pen ticking boxes, one box left empty, shallow focus

### Chapter 3: 05:21 (2:59)

**V10 `video/window_desert_cruise.mp4`** (6 s). AI.
> View through an airliner window at cruise altitude over the Saudi desert, wing visible, calm and bright

**V11 `video/cockpit_instruments.mp4`** (6 s). AI.
> Close-up of a modern airliner primary flight display and altimeter at night, numbers glowing, then the altitude tape starts scrolling down fast

**I06 `images/crash_axe.jpg`**. AI or stock.
> Aircraft crash axe mounted in a bracket on a cockpit side wall, red handle, metal blade, insulated grip, product-style close-up, dark background

**V12 `video/cabin_dive_reconstruction.mp4`** (6 s). AI, reconstruction.
> Airliner cabin violently pitching downward, overhead bins rattling, loose items sliding forward, passengers gripping armrests, motion blur, faces not identifiable, no oxygen masks

**V13 `video/window_horizon_tilt.mp4`** (5 s). AI.
> View through an airliner window as the horizon tilts sharply and the ground rushes closer, desert below

### Chapter 4: The door (4:28)

**V14 `video/door_keypad_denied.mp4`** (6 s). AI.
> Close-up of a finger pressing a keypad next to an airliner cockpit door, cabin side, a red light stays on, access denied, tense lighting

**V15 `video/cockpit_floor_lowangle.mp4`** (6 s). AI, reconstruction.
> Low-angle shot from the floor of a dark airliner cockpit, warning lights flashing red and amber, the inside of the cockpit door very close to the camera, no person visible

**V16 `video/hand_twists_knob.mp4`** (5 s). AI, reconstruction.
> A hand reaching up from the floor and twisting the inner handle of a reinforced cockpit door, slow motion, low light, no blood

**V17 `video/reinforced_door_explainer.mp4`** (6 s). Stock or AI.
> Cutaway of a reinforced aircraft cockpit door, thick bolts sliding shut, technical, cold light

**A01 `audio/captain_modi_call.mp4`** (optional). The real clip of the captain speaking with PM Modi, if it's public from an official or news source. I'll subtitle it.

### Chapter 5: The people who ran in (5:52)

**V18 `video/aisle_rush_pov.mp4`** (6 s). AI, reconstruction.
> Handheld point-of-view shot rushing up a narrow airliner aisle toward the cockpit door, people standing in silhouette, shaky, urgent

**V19 `video/headphone_cable_hands.mp4`** (5 s). AI.
> Close-up of hands pulling a pair of airline headphone cables tight, dark background, no faces

**V20 `video/zip_ties.mp4`** (4 s). AI or stock.
> Close-up of black plastic zip ties being pulled tight, dramatic lighting

**V21 `video/hands_on_yoke.mp4`** (5 s). AI.
> Two hands pulling back on a Boeing 737 control yoke, instrument lights in the background, the horizon levelling through the windshield

**V22 `video/offduty_pilot_uniform.mp4`** (5 s). AI.
> Airline pilot in uniform jacket seated as a passenger in an economy seat, shot from behind or shoulder level, face not visible, pilot cap on knee

**I07 `images/hayun.jpg`, `images/rajuan.jpg`, `images/musayev.jpg`** (optional). Real news stills only, from Israeli TV or i24NEWS interviews. Note the source.

### Chapter 6: 7500 (7:22)

**V23 `video/atc_radar_room.mp4`** (6 s). Stock or AI.
> Air traffic control radar room, controllers at dark screens with green radar returns, one aircraft tag flashing, faces not identifiable

**V24 `video/fighter_jets_takeoff.mp4`** (6 s). Stock.
> Two fighter jets taking off in afterburner at dusk. Generic, not labelled as Israeli aircraft.

**V25 `video/desert_approach.mp4`** (6 s). AI.
> Cockpit view on final approach to a desert airport runway in morning light, runway lights ahead, mountains in the distance

**V26 `video/touchdown.mp4`** (5 s). Stock or AI.
> Plain white 737 touching down on a desert runway, tyre smoke, wide shot

**V27 `video/ambulance_tarmac.mp4`** (5 s). Stock.
> Ambulance with lights flashing parked beside an airliner on the tarmac, morning

**I08 `images/tabuk_airport.jpg`**. Real photo of Prince Sultan bin Abdulaziz Airport, Tabuk (Wikimedia Commons).

**V28 `video/passengers_arrival_israel.mp4`** (optional). Real news footage only.

### Chapter 7: The questions (8:35)

**V29 `video/press_podium.mp4`** (5 s). AI or stock.
> Empty press conference podium with a cluster of microphones, camera flashes, shallow focus

**I09 `images/uae_prosecutor.jpg`**, **`images/trump.jpg`**, **`images/netanyahu.jpg`**. Real press photos only. Wikimedia Commons has public-domain or licensed portraits of Trump and Netanyahu. For the UAE Prosecutor General, use a WAM (Emirates News Agency) photo or skip it.

**I10 `images/flydubai_statement.png`**. Screenshot of Flydubai's official statement (its website or X account) about the incident and the suspended Israel flights.

**V30 `video/departure_board_cancelled.mp4`** (5 s). AI.
> Airport departure board flipping, flights to Tel Aviv change to CANCELLED, close-up, cool light

**I11 `images/headlines/` folder** (optional). 3-6 screenshots of real headlines about FZ1073 (CNN, Al Jazeera, CNBC, Gulf News). I'll use them briefly in a montage.

### Payoff (9:46)

**V31 `video/cockpit_door_opening.mp4`** (8 s). AI. Make it in the same session as V01 so it matches.
> The same closed airliner cockpit door from the cabin aisle slowly swings open, warm light spilling into the dark cabin, hopeful, slow push-in

### Close (10:38)

**V32 `video/sunrise_plane_silhouette.mp4`** (6 s). AI or stock.
> Silhouette of a plain airliner parked on an apron at sunrise, calm, wide shot

---

## 3. What I'll build myself (skip these)

- Flight track maps: Dubai → Saudi Arabia → Jordan airspace → U-turn → Tabuk
- Altitude graph (34,000 ft, the 05:22 drop, holding at 15,000 ft)
- Transponder readout flipping 7700 → 7500 → 7700
- Cockpit door top-down diagram (keypad side vs knob side)
- Cabin cutaway with people moving to the cockpit
- Co-pilot background timeline (2023 → 2024 → 2026) with sources
- Dot grid for 174 passengers + 8 crew
- Quote cards, name lower thirds, chapter title cards
- The four-box "what had to go right" tracker
- "RECONSTRUCTION" tags, source credits, end card

## 4. Priority if you're short on time

1. Voiceover (nothing gets timed without it)
2. V01 and V31 (cockpit door closed and opening): they open and close the film
3. I01 (photo of the captain)
4. Music: tension and resolve tracks
5. Chapter 3-5 clips: V11, V12, V14, V15, V16, V18, V21
6. Everything else. I can cover gaps with graphics.
