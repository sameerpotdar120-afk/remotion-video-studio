# Russia video — image prompts

**181 images** (172 needed, 9 optional), in **10 paste batches** ordered by chapter: `docs/russia/paste/BATCH_01.txt` … `BATCH_10.txt`. Paste one batch per ChatGPT conversation, attach the style sheet, and send the images back in the same way as for America (zips are fine, raw names are fine: renaming, trimming, transparency checks and rigging happen in the repo). Source of truth: `scripts/russia/asset_list.py` (rebuild this doc with `python3 scripts/russia/build_prompt_docs.py`).

## What is built in code (no prompt needed)

- **Host animation**: face (dot eyes, blinks, lip-flap every 4 frames), noodle arms with white gloves, stick legs that walk, pointer, reactions (shock "O", shrug, hands on head, pointer dropped flat at chapter breaks). Only his body image is generated.
- **Every character**: face, arms, gloves, walk/bob/squash, moods; riders mounted on 2-frame gallop horses.
- **Maps**: real terrain (AWS Terrain Tiles), satellite look, 3D globe, translucent territory fills per era, white brush routes with red arrowheads, siege circles, pincers, frost creep, city pins, extruded 3D countries that crack apart (1991).
- **Devices**: year tag + iris, chapter scroll with 10 medallions, loop wheel, 4 collapse X marks, recap timeline HUD, verdict stamps (LEGEND? / TRUE STORY / FAKE / COUP / SOLD / EXAGGERATED?), counters, person-icon grids, calendars, measuring tape, candles that snuff out, fire, smoke, snow, flash frames, flags.
- **3D in code**: the globe, Sputnik, the spinning beard token, extruded country pieces, camera moves on every shot.
- **Sound**: SFX + music bed made in code (copyright-free), mixed under your VO.

## Batches

- **BATCH_01** — Style + host + map tokens — 14 images
- **BATCH_02** — Ch1 Rus — 22 images
- **BATCH_03** — Ch1 Rus + Ch2 Mongols — 16 images
- **BATCH_04** — Ch3 Ivan — 16 images
- **BATCH_05** — Ch4 Troubles + Ch5 Peter — 22 images
- **BATCH_06** — Ch5 Peter + Ch6 Catherine — 22 images
- **BATCH_07** — Ch7 1812 & reforms — 14 images
- **BATCH_08** — Ch8 Last Tsar — 18 images
- **BATCH_09** — Ch9 Stalin — 15 images
- **BATCH_10** — Ch10 Today + Close — 22 images

## Full list

| # | File | Style | Size | Need | Used in |
|---|---|---|---|---|---|
| 1 | `chars/_style_sheet_russia.png` | P | 1536x1024 | yes | style anchor for every Russia character |
| 2 | `chars/host_narrator.png` | P | 1024x1024 | yes | host on every grey-stage beat, bottom-right on maps (code adds face, lip-flap, blinks, noodle arms, gloves, stick legs, pointer) |
| 3 | `horses/horse_brown_gallop_a.png` | H | 1536x1024 | yes | Nevsky, Rus riders |
| 4 | `horses/horse_brown_gallop_b.png` | H | 1536x1024 | yes | Nevsky, Rus riders |
| 5 | `horses/horse_black_gallop_a.png` | H | 1536x1024 | yes | oprichniki |
| 6 | `horses/horse_black_gallop_b.png` | H | 1536x1024 | yes | oprichniki |
| 7 | `horses/horse_steppe_gallop_a.png` | H | 1536x1024 | yes | Mongol riders |
| 8 | `horses/horse_steppe_gallop_b.png` | H | 1536x1024 | yes | Mongol riders |
| 9 | `horses/horse_white_gallop_a.png` | H | 1536x1024 | yes | Napoleon, Peter, generals |
| 10 | `horses/horse_white_gallop_b.png` | H | 1536x1024 | yes | Napoleon, Peter, generals |
| 11 | `props/host_pointer_staff.png` | R | 512x1536 | yes | host's prop (the reference host's spear) — pointing, dropped flat at chapter breaks |
| 12 | `props/kremlin_tower.png` | M | 1024x1024 | yes | map city token for Moscow |
| 13 | `props/onion_church_small.png` | M | 1024x1024 | yes | map city tokens (Kyiv, Novgorod, Vladimir) |
| 14 | `props/napoleon_bicorne.png` | R | 1024x1024 | yes | map token for Napoleon's route |
| 15 | `chars/slav_elder.png` | P | 1024x1024 | yes | Ch1 — tribes argue, "come and rule us" |
| 16 | `chars/finn_elder.png` | P | 1024x1024 | yes | Ch1 — tribes argue |
| 17 | `chars/balt_elder.png` | P | 1024x1024 | yes | Ch1 — tribes argue |
| 18 | `chars/rurik_viking.png` | P | 1024x1024 | yes | Ch1 — steps off the longship |
| 19 | `chars/viking_warrior.png` | P | 1024x1024 | optional | Ch1 — crew of the longship, route to Kyiv |
| 20 | `chars/vladimir_prince.png` | P | 1024x1024 | yes | Ch1 — choosing a religion (988) |
| 21 | `chars/envoy_kievan.png` | P | 1024x1024 | yes | Ch1 — four envoys report |
| 22 | `chars/batu_khan.png` | P | 1024x1024 | yes | Ch1 end / Ch2 — the Khan, yarlyk, Ugra |
| 23 | `chars/mongol_warrior.png` | P | 1024x1024 | yes | Ch1 end — horde, Ch2 — Ugra standoff |
| 24 | `cards/card_anna_porphyrogenita.png` | C | 1024x1280 | yes | Ch1 — marriage deal |
| 25 | `bg/bg_forest_river_862.png` | B | 1536x1024 | yes | Ch1 — tribes, Rurik arrives |
| 26 | `bg/bg_kyiv_hall_988.png` | B | 1536x1024 | yes | Ch1 — Vladimir chooses a religion |
| 27 | `bg/bg_hagia_sophia_interior.png` | B | 1536x1024 | yes | Ch1 — "स्वर्ग या ज़मीन?" |
| 28 | `bg/bg_kyiv_burning_1240.png` | B | 1536x1024 | yes | Ch1 — collapse #1 |
| 29 | `props/viking_longship.png` | R | 1536x1024 | yes | Ch1 — elastic pop on the river; route to Kyiv |
| 30 | `props/oar_wooden.png` | R | 1024x1024 | yes | Ch1 — "Rus = rowers" |
| 31 | `props/icon_card_mosque.png` | M | 1024x1024 | yes | Ch1 — envoy card 1 |
| 32 | `props/icon_card_synagogue.png` | M | 1024x1024 | yes | Ch1 — envoy card 2 |
| 33 | `props/icon_card_latin_church.png` | M | 1024x1024 | yes | Ch1 — envoy card 3 |
| 34 | `props/hagia_sophia_model.png` | M | 1024x1024 | yes | Ch1 — envoy card 4 |
| 35 | `props/wine_jug.png` | R | 1024x1024 | yes | Ch1 — "पीना Rus की ख़ुशी है" |
| 36 | `props/throne_wooden.png` | R | 1024x1024 | yes | Ch1 — Vladimir |
| 37 | `docs/primary_chronicle_page.png` | R | 1536x1024 | yes | Ch1 — "सबसे पुरानी chronicle" |
| 38 | `chars/rus_prince.png` | P | 1024x1024 | yes | Ch2 — goes to the Khan for the yarlyk |
| 39 | `chars/alexander_nevsky.png` | P | 1024x1024 | yes | Ch2 — Battle on the Ice (rides horse_brown) |
| 40 | `chars/teutonic_knight.png` | P | 1024x1024 | yes | Ch2 — knights fall through the ice |
| 41 | `chars/moscow_soldier.png` | P | 1024x1024 | yes | Ch2 — Kulikovo, Ugra standoff |
| 42 | `chars/afanasy_nikitin.png` | P | 1024x1024 | yes | Ch2 — India detour |
| 43 | `chars/ivan_iii.png` | P | 1024x1024 | yes | Ch2 end — "Moscow अब बॉस" |
| 44 | `bg/bg_steppe_horde_camp.png` | B | 1536x1024 | yes | Ch2 — yarlyk |
| 45 | `bg/bg_frozen_lake_1242.png` | B | 1536x1024 | yes | Ch2 — Battle on the Ice |
| 46 | `bg/bg_kulikovo_field_1380.png` | B | 1536x1024 | yes | Ch2 — Kulikovo |
| 47 | `bg/bg_ugra_river_1480.png` | B | 1536x1024 | yes | Ch2 — the great standoff |
| 48 | `props/cap_of_monomakh.png` | R | 1024x1024 | yes | Ch2/Ch3 — crown pops; Ch4 |
| 49 | `props/double_headed_eagle.png` | R | 1024x1024 | yes | Ch2 end — Ivan III |
| 50 | `props/yarlyk_scroll.png` | R | 1024x1536 | yes | Ch2 — permission slip |
| 51 | `props/money_bag.png` | R | 1024x1024 | yes | Ch2 — Moscow collects the tax |
| 52 | `props/tribute_sack.png` | R | 1024x1024 | yes | Ch2 — tribute flies to the Horde |
| 53 | `chars/ivan_iv_young.png` | P | 1024x1024 | yes | Ch3 — coronation, Kazan, good early years |
| 54 | `chars/ivan_iv_child.png` | P | 1024x1024 | yes | Ch3 — boy prince ignored by the boyars |
| 55 | `chars/ivan_iv_terrible.png` | P | 1024x1024 | yes | Ch3 — Oprichnina, Novgorod, 1581 |
| 56 | `chars/boyar_a.png` | P | 1024x1024 | yes | Ch3 — boyars bully the boy; Ch5 — beard snip |
| 57 | `chars/boyar_b.png` | P | 1024x1024 | yes | Ch3 — boyars; Ch5 — beard line |
| 58 | `chars/oprichnik.png` | P | 1024x1024 | yes | Ch3 — black riders (rides horse_black) |
| 59 | `cards/card_anastasia.png` | C | 1024x1280 | yes | Ch3 — her death (black ribbon added in code) |
| 60 | `cards/card_tsarevich_ivan.png` | C | 1024x1280 | yes | Ch3 — 1581 |
| 61 | `bg/bg_cathedral_1547.png` | B | 1536x1024 | yes | Ch3 — coronation |
| 62 | `bg/bg_kremlin_hall_1530s.png` | B | 1536x1024 | yes | Ch3 — boyars and the boy; dark throne room (tinted in code) |
| 63 | `bg/bg_red_square_1561.png` | B | 1536x1024 | yes | Ch3 — St Basil's builds up |
| 64 | `bg/bg_snow_road_night.png` | B | 1536x1024 | yes | Ch3 — oprichniki ride |
| 65 | `props/throne_gold.png` | R | 1024x1024 | yes | Ch3/Ch4 — boy Ivan, empty throne, Michael |
| 66 | `props/st_basils_cathedral.png` | R | 1024x1280 | yes | Ch3 — builds up dome by dome |
| 67 | `props/pointed_staff.png` | R | 512x1536 | yes | Ch3 — 1581 |
| 68 | `docs/rurik_family_tree.png` | R | 1024x1280 | yes | Ch3 — the last leaf turns grey and falls |
| 69 | `chars/boris_godunov.png` | P | 1024x1024 | yes | Ch4 — crowned, then famine |
| 70 | `chars/polish_hussar.png` | P | 1024x1024 | yes | Ch4 — Polish garrison in the Kremlin |
| 71 | `chars/kuzma_minin.png` | P | 1024x1024 | yes | Ch4 — the comeback from below |
| 72 | `chars/dmitry_pozharsky.png` | P | 1024x1024 | yes | Ch4 — the comeback from below |
| 73 | `chars/militia_volunteer.png` | P | 1024x1024 | yes | Ch4 — volunteer army marches (crowd) |
| 74 | `chars/michael_romanov.png` | P | 1024x1024 | yes | Ch4 — new dynasty |
| 75 | `cards/card_false_dmitry.png` | C | 1024x1280 | yes | Ch4 — three identical cards, FAKE stamps |
| 76 | `bg/bg_village_1601.png` | B | 1536x1024 | yes | Ch4 — famine |
| 77 | `bg/bg_kremlin_exterior_1612.png` | B | 1536x1024 | yes | Ch4 — liberation; Ch8/9/10 — Kremlin establishing |
| 78 | `props/volcano_erupting.png` | R | 1024x1024 | yes | Ch4 — Huaynaputina (on a mini-globe) |
| 79 | `chars/boyar_a_beardless.png` | P | 1024x1024 | yes | Ch5 — after the SNIP |
| 80 | `chars/peter_great.png` | P | 1024x1024 | yes | Ch5 — throughout |
| 81 | `chars/peter_carpenter.png` | P | 1024x1024 | yes | Ch5 — "Pyotr Mikhailov" at Zaandam |
| 82 | `chars/swedish_soldier.png` | P | 1024x1024 | yes | Ch5 — Great Northern War, Poltava |
| 83 | `chars/serf_worker.png` | P | 1024x1024 | yes | Ch5 — building St Petersburg; Ch6 — serfs; Ch7 — freed serfs |
| 84 | `cards/card_tsarevich_alexei.png` | C | 1024x1280 | yes | Ch5 — 1718 |
| 85 | `bg/bg_shipyard_zaandam_1697.png` | B | 1536x1024 | yes | Ch5 — Peter the carpenter |
| 86 | `bg/bg_peter_court_1698.png` | B | 1536x1024 | yes | Ch5 — beard snip |
| 87 | `bg/bg_neva_swamp_1703.png` | B | 1536x1024 | yes | Ch5 — St Petersburg founded |
| 88 | `bg/bg_st_petersburg_1725.png` | B | 1536x1024 | yes | Ch5 — the new capital |
| 89 | `bg/bg_dark_study_1718.png` | B | 1536x1024 | yes | Ch5 — Alexei |
| 90 | `props/shears_giant.png` | R | 1024x1024 | yes | Ch5 — beard snip |
| 91 | `props/beard_token.png` | R | 1024x1024 | yes | Ch5 — beard tax (spins in 3D in code) |
| 92 | `props/carpenter_hammer.png` | R | 1024x1024 | yes | Ch5 — shipyard |
| 93 | `props/ship_russian_1700.png` | R | 1536x1024 | yes | Ch5 — Peter builds a navy |
| 94 | `props/palace_facade_baroque.png` | R | 1536x1024 | yes | Ch5 — St Petersburg builds up |
| 95 | `chars/serf_woman.png` | P | 1024x1024 | optional | Ch6/Ch7 — serfs, crowds |
| 96 | `chars/catherine_great.png` | P | 1024x1024 | yes | Ch6 — throughout |
| 97 | `chars/peter_iii.png` | P | 1024x1024 | yes | Ch6 — toy soldiers, coup |
| 98 | `chars/russian_guard.png` | P | 1024x1024 | yes | Ch6 — guards behind Catherine |
| 99 | `chars/potemkin.png` | P | 1024x1024 | yes | Ch6 — Potemkin villages |
| 100 | `chars/pugachev.png` | P | 1024x1024 | yes | Ch6 — rebellion |
| 101 | `cards/card_sophie_princess.png` | C | 1024x1280 | yes | Ch6 — "Sophie · Germany से" |
| 102 | `cards/card_voltaire.png` | C | 1024x1280 | optional | Ch6 — letters to philosophers |
| 103 | `bg/bg_palace_room_1762.png` | B | 1536x1024 | yes | Ch6 — Peter III and toy soldiers, the coup |
| 104 | `bg/bg_riverbank_1787.png` | B | 1536x1024 | yes | Ch6 — Potemkin villages |
| 105 | `bg/bg_volga_steppe_1773.png` | B | 1536x1024 | optional | Ch6 — Pugachev |
| 106 | `props/toy_soldiers.png` | R | 1024x1024 | yes | Ch6 — Peter III plays |
| 107 | `props/crown_catherine.png` | R | 1024x1024 | yes | Ch6 — the crown; Ch8 — slides off Nicholas |
| 108 | `props/potemkin_facade_front.png` | R | 1536x1024 | yes | Ch6 — Potemkin village front |
| 109 | `props/potemkin_facade_back.png` | R | 1536x1024 | yes | Ch6 — the reveal behind |
| 110 | `props/royal_barge.png` | R | 1536x1024 | yes | Ch6 — Catherine sails past |
| 111 | `props/books_quill.png` | R | 1024x1024 | yes | Ch6 — the "enlightened" empress |
| 112 | `props/letter_sealed.png` | R | 1024x1024 | yes | Ch6 — letters fly to Voltaire |
| 113 | `chars/napoleon.png` | P | 1024x1024 | yes | Ch7 — invasion, Moscow burns (rides horse_white) |
| 114 | `chars/french_soldier.png` | P | 1024x1024 | yes | Ch7 — Grande Armée, retreat in snow |
| 115 | `chars/russian_soldier_1812.png` | P | 1024x1024 | yes | Ch7 — Borodino |
| 116 | `chars/decembrist_officer.png` | P | 1024x1024 | yes | Ch7 — Paris dream, Decembrists |
| 117 | `chars/alexander_ii.png` | P | 1024x1024 | yes | Ch7 — frees the serfs, 1881 |
| 118 | `bg/bg_borodino_1812.png` | B | 1536x1024 | yes | Ch7 — Borodino |
| 119 | `bg/bg_moscow_skyline_1812.png` | B | 1536x1024 | yes | Ch7 — Moscow burns |
| 120 | `bg/bg_winter_retreat_1812.png` | B | 1536x1024 | yes | Ch7 — the retreat |
| 121 | `bg/bg_paris_1814.png` | B | 1536x1024 | optional | Ch7 — officers see Paris (thought bubble) |
| 122 | `bg/bg_senate_square_1825.png` | B | 1536x1024 | yes | Ch7 — Decembrists |
| 123 | `bg/bg_canal_street_1881.png` | B | 1536x1024 | yes | Ch7 — Alexander II assassinated |
| 124 | `props/cannon_1812.png` | R | 1024x1024 | yes | Ch7 — Borodino, Decembrists |
| 125 | `props/chains_broken.png` | R | 1024x1024 | optional | Ch7 — serfs freed |
| 126 | `props/carriage_1881.png` | R | 1024x1024 | yes | Ch7 — 1881 |
| 127 | `chars/nicholas_ii.png` | P | 1024x1024 | yes | Ch8 — throughout (crown is a separate prop) |
| 128 | `chars/alexandra.png` | P | 1024x1024 | yes | Ch8 — Rasputin whispers |
| 129 | `chars/rasputin.png` | P | 1024x1024 | yes | Ch8 — palace |
| 130 | `chars/worker_1905.png` | P | 1024x1024 | yes | Ch8 — Bloody Sunday, bread line, revolution (crowd) |
| 131 | `chars/worker_woman_1917.png` | P | 1024x1024 | yes | Ch8 — bread line becomes a crowd |
| 132 | `chars/tsarist_soldier_1914.png` | P | 1024x1024 | yes | Ch8 — WWI, soldiers refuse to fire |
| 133 | `chars/red_guard_1917.png` | P | 1024x1024 | yes | Ch8 — October, civil war (Reds) |
| 134 | `chars/white_officer_1919.png` | P | 1024x1024 | optional | Ch8 — civil war (Whites) |
| 135 | `cards/card_nicholas_ii.png` | C20 | 1024x1280 | yes | Ch8 — the last Tsar |
| 136 | `cards/card_romanov_family.png` | C20 | 1280x1024 | yes | Ch8 — family card; cellar (seven candles) |
| 137 | `cards/card_lenin.png` | C20 | 1024x1280 | yes | Ch8 — October 1917; Ch9 — death 1924 |
| 138 | `bg/bg_palace_square_1905.png` | B | 1536x1024 | yes | Ch8 — Bloody Sunday |
| 139 | `bg/bg_palace_interior_1916.png` | B | 1536x1024 | yes | Ch8 — Rasputin |
| 140 | `bg/bg_petrograd_street_1917.png` | B | 1536x1024 | yes | Ch8 — bread line → revolution |
| 141 | `bg/bg_cellar_1918.png` | B | 1536x1024 | yes | Ch8 — the family's end (shown only as candles) |
| 142 | `props/warship_1904.png` | R | 1024x1024 | yes | Ch8 — sunk by Japan (bubbles in code) |
| 143 | `props/church_banner.png` | R | 1024x1024 | yes | Ch8 — Bloody Sunday march |
| 144 | `props/bread_loaf.png` | R | 1024x1024 | yes | Ch8 — bread lines |
| 145 | `chars/stalin.png` | P | 1024x1024 | yes | Ch9 — throughout |
| 146 | `chars/kolkhoz_farmer.png` | P | 1024x1024 | yes | Ch9 — collectivisation, famine |
| 147 | `chars/soviet_soldier_ww2.png` | P | 1024x1024 | yes | Ch9 — Stalingrad, Berlin |
| 148 | `chars/german_soldier_ww2.png` | P | 1024x1024 | yes | Ch9 — invasion, Stalingrad |
| 149 | `chars/german_general_surrender.png` | P | 1024x1024 | yes | Ch9 — surrender at Stalingrad |
| 150 | `cards/card_stalin.png` | C20 | 1024x1280 | yes | Ch9 — cards: purge, pact |
| 151 | `cards/card_hitler.png` | C20 | 1024x1280 | yes | Ch9 — 1939 pact, the torn card (if the tool refuses, skip it: the code shows a silhouette card) |
| 152 | `bg/bg_industrial_1930s.png` | B | 1536x1024 | yes | Ch9 — industrialisation |
| 153 | `bg/bg_stalingrad_ruins_1942.png` | B | 1536x1024 | yes | Ch9 — street fighting |
| 154 | `props/factory_chimneys.png` | M | 1024x1024 | yes | Ch9 — chimneys pop across the USSR |
| 155 | `props/tractor_1930.png` | R | 1024x1024 | yes | Ch9 — collectivisation |
| 156 | `props/grain_sack.png` | R | 1024x1024 | yes | Ch9 — grain flows out of Ukraine/Kazakhstan |
| 157 | `props/tank_t34.png` | M | 1024x1024 | yes | Ch9 — map tokens |
| 158 | `props/tank_german.png` | M | 1024x1024 | yes | Ch9 — map tokens |
| 159 | `props/pact_document.png` | R | 1024x1280 | yes | Ch9 — torn in two / burns |
| 160 | `chars/gagarin_spacesuit.png` | P | 1024x1024 | yes | Ch10 — first man in space |
| 161 | `chars/soviet_navy_officer.png` | P | 1024x1024 | yes | Ch10 — the submarine (Arkhipov + 2 officers) |
| 162 | `chars/soviet_citizen_1980s.png` | P | 1024x1024 | yes | Ch10 — empty shelves, queues |
| 163 | `chars/russian_1990s.png` | P | 1024x1024 | optional | Ch10 — 1990s chaos |
| 164 | `cards/card_gagarin.png` | C20 | 1024x1280 | yes | Ch10 — 108 minutes |
| 165 | `cards/card_arkhipov.png` | C20 | 1024x1280 | yes | Ch10 — the man who said no |
| 166 | `cards/card_rakesh_sharma.png` | C20 | 1024x1280 | yes | Ch10 — "सारे जहाँ से अच्छा" |
| 167 | `cards/card_gorbachev.png` | C20 | 1024x1280 | yes | Ch10 — Glasnost |
| 168 | `cards/card_yeltsin.png` | C20 | 1024x1280 | yes | Ch10 — resigns on TV (shown inside a TV set) |
| 169 | `cards/card_putin.png` | C20 | 1024x1280 | yes | Ch10 — the strong man again |
| 170 | `bg/bg_submarine_1962.png` | B | 1536x1024 | yes | Ch10 — Arkhipov |
| 171 | `bg/bg_soviet_shop_1985.png` | B | 1536x1024 | yes | Ch10 — economy hollow |
| 172 | `bg/bg_apartment_1999.png` | B | 1536x1024 | yes | Ch10 — Yeltsin resigns on TV |
| 173 | `bg/bg_chernobyl_1986.png` | B | 1536x1024 | yes | Ch10 — Chernobyl |
| 174 | `bg/bg_berlin_wall_1989.png` | B | 1536x1024 | yes | Ch10 — the wall falls |
| 175 | `props/rocket_vostok.png` | R | 768x1536 | yes | Ch10 — Gagarin launch (flame + smoke in code) |
| 176 | `props/submarine_foxtrot.png` | R | 1536x1024 | yes | Ch10 — off Cuba |
| 177 | `props/reactor_building.png` | M | 1024x1024 | yes | Ch10 — map token |
| 178 | `props/tv_crt_1999.png` | R | 1024x1024 | yes | Ch10 — Yeltsin on TV (picture added in code) |
| 179 | `props/oil_barrel.png` | R | 1024x1024 | yes | Ch10 — oil money |
| 180 | `props/rouble_banknotes.png` | R | 1024x1024 | yes | Ch10 — 1998 default |
| 181 | `props/subscribe_bell.png` | R | 1024x1024 | optional | Close — subscribe |

## Styles

**P**

```
STYLE P (character): 2D illustrated character for an animated history YouTube channel, in a "peg doll" cartoon style. The whole figure is ONE soft rounded capsule like a wooden peg doll or a bowling pin: a very large, perfectly round head (45% of the total height) sitting directly on the collar with NO neck; below it a smooth rounded body that widens slightly toward a flat, gently rounded bottom edge. NO LEGS, NO FEET, NO SHOES: the clothing simply ends at the rounded bottom of the body. Body width at the bottom about 1.1 times the head width. Historically accurate clothing of the era named in the CHARACTER line, drawn ONTO the body shape with fine detail (embroidery, fur trims, buttons, belts, sashes follow the body's curve). Soft painterly shading with gentle gradients, light from the top left, subtle paper grain inside the colours, a thin-to-medium dark-brown outline (#3A2A20) around the silhouette and main shapes. Warm pale skin (#F3DCC4) unless stated. Hair, beards and fur drawn with fine strands. Hats are large and overhang the head. BLANK FACE: the face is completely smooth skin with NO eyes, NO eyebrows, NO nose, NO mouth, NO blush. Beards and moustaches are allowed: they frame the LOWER edge of the face, and the skin from the forehead down to just above the moustache stays completely blank. NO ARMS and NO HANDS anywhere (arms are added in animation). Front view, body very slightly turned to the right. Centred, the bottom of the body touching the bottom edge of the canvas, 6% empty margin left, right and top. Transparent background, PNG, no ground shadow, no text, no border, square 1024x1024.
```

**H**

```
STYLE H (horse): the same painterly peg-doll toy style as the characters (soft painterly shading, light from the top left, subtle paper grain, thin dark-brown outline #3A2A20). A cartoon horse in exact SIDE VIEW facing RIGHT, chunky toy proportions (big head, short round barrel body, fairly short legs, flowing mane and tail), saddle and saddle blanket on its back, NO RIDER. The top of the saddle sits exactly 42% down from the top of the canvas and the horse is centred horizontally. Transparent background, no ground shadow, no text, wide 1536x1024.
```

**C**

```
STYLE C (portrait card): a painted head-and-shoulders portrait used as a card in a history explainer. The subject looks slightly to the right. Rich classical oil-painting brushwork, warm museum lighting, plain dark warm background with a soft vignette. A NORMAL painted face with full features (eyes, nose, mouth): this is a painting, NOT a peg doll. ORIGINAL artwork: do not copy any existing painting or photograph. No frame, no text, no signature, no border. Fills the whole canvas, portrait 1024x1280.
```

**C20**

```
STYLE C20 (20th-century portrait card): a painted head-and-shoulders portrait used as a card in a history explainer. The subject looks slightly to the right. Painted in a muted sepia, warm-grey and faded-ink palette that suggests an old photograph, but clearly a PAINTING with visible brushwork (not a photo). A NORMAL painted face with full features. ORIGINAL artwork: do not copy any existing photograph. Plain soft grey-brown background. No frame, no text, no signature, no border. Fills the whole canvas, portrait 1024x1280.
```

**B**

```
STYLE B (background): photorealistic cinematic matte painting, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly desaturated colours, film-still quality. Keep important elements inside the middle band (15% to 85% of the height) and leave the lower third open floor/ground where cartoon characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters, no modern objects unless the era is modern. Wide 1536x1024, full scene (not transparent).
```

**R**

```
STYLE R (3D-rendered prop): a stylised 3D-rendered object for an animated history video: semi-realistic, slightly toy-like proportions, rendered like a high-end Blender Cycles / Pixar product shot, soft studio lighting from the top left, gentle ambient occlusion, softly bevelled edges, believable materials (wood, iron, gold, cloth, parchment) with a light hand-painted texture. 3/4 view from slightly above unless stated. Centred, filling 80% of the frame, transparent background PNG, NO ground shadow, NO text, NO letters or numbers, square 1024x1024.
```

**M**

```
STYLE M (3D map token): a tiny 3D-rendered isometric miniature like a premium board-game piece, viewed from 3/4 above, soft studio light from the top left, gentle ambient occlusion, bright clean colours, centred, filling 75% of the frame, transparent background, NO ground shadow, NO text, square 1024x1024.
```

