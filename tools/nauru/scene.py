"""Nauru Short: the scene (reference style: satellite map, white labels, yellow numbers, red stamps, chibi scenes).
Times are the VO's word starts (faster-whisper, after the 1.15x speed-up). The last 0.5 s crossfades into frame 0."""
import nrkit as N
from nrkit import G, GOLD, RED, WHITE, YEL

DUR = 102.73

CAPTIONS = [
    (0.00, "हमारे दिल्ली Airport जितना एक देश,"), (2.26, "सिर्फ़ 8,000 लोगों के लिए"), (4.00, "7 Jet ख़रीद रहा था।"),
    (5.58, "पर फिर, सब खो दिया।"), (7.52, "ये है नाउरू।"), (8.98, "Pacific महासागर के बीच,"),
    (10.54, "दुनिया का तीसरा सबसे छोटा देश।"), (12.86, "1968 में आज़ादी मिली,"), (14.70, "और साथ में ज़मीन के नीचे का ख़ज़ाना।"),
    (17.28, "70 के दशक में, प्रति व्यक्ति कमाई में,"), (19.88, "नाउरू दुनिया के सबसे अमीर देशों में था।"),
    (22.26, "एक अंदाज़े के हिसाब से,"), (23.76, "सऊदी अरब के ठीक बाद।"), (25.32, "सोचो, एक छोटा सा द्वीप,"),
    (27.24, "और हर आदमी की कमाई अमेरिका से भी ज़्यादा।"), (29.94, "Income Tax नहीं।"), (31.04, "Hospital, School, बिजली,"),
    (32.82, "सब लगभग मुफ़्त।"), (34.14, "फिर सरकार ने अपनी Airline खोली।"), (36.40, "1983 तक,"),
    (37.60, "क़रीब 8,000 लोगों के इस देश के पास"), (39.88, "7 Jet थे।"), (41.16, "यानी हर 1,100 लोगों पर एक Jet।"),
    (43.50, "मतलब दिल्ली से पटना की"), (45.00, "क़रीब 6 भरी flights जितने लोग,"), (47.00, "और उनके लिए पूरा एक Jet।"),
    (49.32, "पर ये पैसा आ कहाँ से रहा था?"), (51.46, "पक्षियों की बीट से।"), (52.96, "माना जाता है, लाखों सालों में"),
    (55.10, "ये बीट बन गई Phosphate,"), (56.48, "खेतों की सबसे क़ीमती खाद।"), (58.52, "नाउरू ने इसे खोद-खोद कर बेचा।"),
    (60.94, "एक जाँच के हिसाब से,"), (62.40, "द्वीप का 80% से ज़्यादा हिस्सा"), (64.32, "उजड़ चुका था।"),
    (65.54, "फिर Phosphate ख़त्म होने लगा,"), (67.18, "और पैसा भी।"), (68.12, "2000 तक, नाउरू लगभग दिवालिया था।"),
    (70.78, "ये वही ग़लती है"), (71.82, "जो हम में से कई लोग करते हैं।"), (73.60, "पैसा आया, तो उसे बचाने के बजाय"),
    (75.72, "उड़ाना शुरू कर दिया।"), (76.90, "जैसे किसी की ज़मीन बिक जाए,"), (78.48, "और वो पहले ही दिन नई गाड़ी ले ले।"),
    (80.50, "और आज?"), (81.22, "ऑस्ट्रेलिया उसे पैसे देता है,"), (82.98, "उन लोगों को वहीं रखने के लिए"),
    (84.80, "जिन्हें वो अपने यहाँ नहीं रखना चाहता।"), (86.72, "एक नई deal में तो, 30 साल में"), (88.86, "क़रीब $1.6 billion।"),
    (91.12, "और नाउरू अपनी नागरिकता बेच रहा है।"), (93.52, "1,05,000 dollar से ज़्यादा में।"), (96.40, "एक शब्द में बताओ,"),
    (97.58, "नाउरू की ग़लती क्या थी?"), (98.96, "और याद रखना,"), (100.10, "ये सब हुआ उस देश में,"), (101.94, "जो है बस..."),
]


def build(film):
    geo = N.load_geo()
    P = geo["places"]
    W, SC = [], []
    pz = 0.5625

    def shot(t, xy, z, sx=1080, sy=1920, rot=0.0):
        film.cam(t, xy[0] - (sx - 1080) / (z * pz), xy[1] - (sy - 1920) / (z * pz), z, rot)

    ap, nr, dl = P["delhi_airport"], P["nauru"], P["delhi"]
    mid = ((ap[0] + nr[0]) / 2, (ap[1] + nr[1]) / 2 - 600000)
    bris = P["brisbane"]

    W.append(N.Sea())
    for name in ("world", "asiapac", "auspac", "delhi_region", "delhi"):
        W.append(N.SatPlate(geo, name))
    W.append(N.IslandHalo(nr, 9000))
    W.append(N.SatPlate(geo, "nauru_island", z=-50))

    # ---------------- the loop picture: Nauru's real outline over Delhi airport, at true size
    def hook(t0, t1):
        W.append(N.Outline(geo["nauru_on_delhi"], t0, t1, fill=GOLD, fill_a=0.33, glow=GOLD, px=6, wipe=0.01,
                           to_fill=(120, 120, 128), t_change=6.42 if t0 < 0 else None))
        W.append(G.MapLabel(ap, (("NAURU", YEL, "montb"), ("= DELHI AIRPORT", WHITE, "montb")), t0, t1, px=70, dy=-380))
    hook(-1, 7.3)
    hook(101.6, None)

    # ---------------- 1. hook (0 - 7.5)
    shot(0.0, ap, 0.42, sy=2000); shot(5.6, ap, 0.5, sy=1950, rot=-0.8)
    W.append(N.Jets((ap[0], ap[1] + 900), 7, 4.0, t_out=7.2, px=170))
    SC.append(G.Chip((("8,000 लोग · 7 JETS", YEL, "baloob"),), 2.3, 7.2, 1080, 2900, px=70))

    # ---------------- 2. where (7.5 - 12.9): pull back over India (official boundary), across to Nauru
    shot(6.9, ap, 0.3, sy=1950); shot(8.0, dl, 0.0009, sy=2000)
    W.append(N.Outline(geo["india"], 7.6, 10.2, fill=None, glow=(255, 255, 255), px=4, wipe=0.5, z=6))
    W.append(G.MapLabel(dl, (("भारत", WHITE, "baloob"),), 7.7, 9.6, px=90, dy=-120))
    W.append(G.GPSRoute(dl, nr, 8.3, dur=1.6, bend=-0.22, t_out=12.0, px=9, rgb=WHITE))
    shot(9.4, mid, 0.00032); shot(10.6, nr, 0.004); shot(11.8, nr, 0.36, sy=2000)
    W.append(G.MapLabel(nr, (("NAURU", WHITE, "montb"),), 10.4, 22.2, px=110, dy=-560))
    SC.append(G.Chip((("21 km²", YEL, "montb"), ("· दुनिया का #3 सबसे छोटा देश", WHITE, "baloob")), 11.1, 12.85, 1080, 2700, px=62))

    # ---------------- 3. rich (12.9 - 29.9)
    SC.append(G.YearCard("1968", 12.86, 14.6, y=700, size=380, rgb=WHITE, glow=GOLD))
    shot(13.0, nr, 0.36, sy=2300); shot(16.6, nr, 0.40, sy=2450)
    W.append(G.CityGlow(nr, 15.72, 67.2, r_px=520, rgb=GOLD))
    SC.append(G.Poster("r11_banknote_stack_grey.png", 15.72, 17.25, (1300, 1950, 650, 1100), frm="up", cutout=True, tag=False))
    SC.append(G.Poster("r1_boom_office.jpg", 17.28, 22.2, (120, 170, 1920, 1720), frm="right", crop=(0, 0.06, 1, 0.66)))
    SC.append(G.Chip((("≈ $50,000", YEL, "montb"), ("/ व्यक्ति (1975, अनुमान)", WHITE, "baloob")), 19.88, 25.2, 1080, 2050, px=66))
    SC.append(G.Poster("r2_minister_grey.png", 22.26, 25.25, (180, 300, 900, 1500), frm="left", cutout=True))
    SC.append(G.Chip((("#1 सऊदी अरब", WHITE, "baloob"),), 23.6, 25.25, 1560, 820, px=70))
    SC.append(G.Chip((("#2 नाउरू", YEL, "baloob"),), 23.9, 25.25, 1560, 1060, px=82))
    shot(25.4, nr, 0.30, sy=2650); shot(29.8, nr, 0.32, sy=2700)
    SC.append(N.IncomeBars(27.24, 29.85, base_y=1950, h=1100))

    # ---------------- 4. easy life (29.9 - 34.1)
    SC.append(G.Poster("r3_easy_life.jpg", 29.94, 34.1, (90, 150, 1980, 3000), frm="up", crop=(0, 0.02, 1, 0.92)))
    SC.append(N.Stamp((("NO TAX", N.RED, "montb"),), 30.38, 34.1, x=1080, y=1350, px=190, rot=-9))
    SC.append(N.Stamp((("मुफ़्त", N.RED, "baloob"),), 33.6, 34.1, x=1250, y=2350, px=210, rot=7))

    # ---------------- 5. seven jets (34.1 - 49.3)
    SC.append(G.Poster("r4_own_airline.jpg", 34.14, 37.5, (120, 170, 1920, 1720), frm="right", crop=(0, 0.1, 1, 0.66)))
    shot(34.6, nr, 0.30, sy=2700); shot(37.6, nr, 0.30, sy=2200)
    W.append(N.Pictos((nr[0], nr[1] - 200), 24, 37.6, 39.8, px=150, cols=8))
    SC.append(G.Chip((("8,000 लोग", YEL, "baloob"),), 38.0, 41.1, 1080, 1420, px=84))
    W.append(N.Jets((nr[0], nr[1] + 300), 7, 39.88, t_out=49.3, px=260))
    SC.append(G.Chip((("1 JET = 1,100 लोग", YEL, "baloob"),), 41.16, 43.4, 1080, 1420, px=84))
    SC.append(G.Poster("r5_empty_flight.jpg", 43.4, 49.25, (120, 150, 1920, 1660), frm="up", crop=(0, 0.12, 1, 0.62)))
    SC.append(G.NullPanel(N.FILM / "assets/null_a", 43.6, 47.6, 3.6))
    SC.append(G.Chip((("दिल्ली → पटना × 6 ≈ 1,100 लोग", WHITE, "baloob"),), 45.0, 49.2, 1080, 330, px=64))
    shot(47.6, nr, 0.30, sy=2550); shot(49.2, nr, 0.32, sy=2500)

    # ---------------- 6. bird droppings -> phosphate (49.3 - 58.5)
    SC.append(G.Chip((("पैसा कहाँ से?", YEL, "baloob"),), 49.4, 51.4, 1080, 1420, px=90))
    SC.append(G.Poster("r6_seabird_scene.jpg", 51.46, 55.05, (120, 170, 1920, 1720), frm="left", crop=(0, 0.15, 1, 0.65)))
    SC.append(G.Chip((("PHOSPHATE", YEL, "montb"), ("= खाद", WHITE, "baloob")), 55.1, 58.45, 1080, 1420, px=96))
    shot(55.0, nr, 0.30, sy=2500); shot(56.5, nr, 0.0016, sy=2100)
    for k in ("brisbane", "nz", "japan"):
        W.append(G.GPSRoute(nr, P[k], 56.6 + 0.25 * ("brisbane", "nz", "japan").index(k), dur=1.2, bend=0.18, t_out=58.6, px=7, rgb=WHITE))
    shot(58.4, nr, 0.0018, sy=2100)

    # ---------------- 7. the fall (58.5 - 70.8)
    SC.append(G.Poster("r7_phosphate_mining.jpg", 58.52, 62.3, (90, 150, 1980, 3000), frm="up", crop=(0, 0.04, 1, 0.92)))
    shot(59.0, nr, 0.3, sy=2400); shot(62.3, nr, 0.36, sy=2300)
    W.append(N.Outline(geo["nauru"], 62.4, None, fill=(150, 150, 156), fill_a=0.78, stroke=None, px=4, wipe=1.4, scale=0.8, z=8))
    SC.append(G.Chip((("80%+", YEL, "montb"), ("उजड़ा", WHITE, "baloob")), 62.94, 68.0, 1080, 1300, px=96))
    shot(66.0, nr, 0.36, sy=2300)
    SC.append(G.Poster("r8_broke_minister.jpg", 68.0, 70.75, (120, 170, 1920, 1720), frm="right", crop=(0, 0.1, 1, 0.66)))
    SC.append(G.YearCard("2000", 68.12, 70.0, y=2150, size=330, rgb=WHITE, glow=(20, 20, 20)))
    SC.append(N.Stamp((("दिवालिया", N.RED, "baloob"),), 69.88, 70.75, x=1080, y=2550, px=200, rot=-6))

    # ---------------- 8. the lesson (70.8 - 80.5)
    SC.append(G.Poster("r9a_village_land_sale.jpg", 70.78, 76.85, (120, 150, 1920, 1660), frm="right", crop=(0, 0.12, 1, 0.64)))
    SC.append(G.NullPanel(N.FILM / "assets/null_b", 73.8, 77.6, 2.0))
    SC.append(G.Poster("r9b_villager_car_scene.jpg", 76.9, 80.45, (90, 150, 1980, 3000), frm="left", crop=(0, 0.04, 1, 0.92)))
    SC.append(N.Stamp((("नई गाड़ी!", N.RED, "baloob"),), 79.7, 80.45, x=1080, y=1100, px=170, rot=-8))

    # ---------------- 9. today (80.5 - 96.4)
    am = ((bris[0] + nr[0]) / 2, (bris[1] + nr[1]) / 2)
    shot(80.6, nr, 0.3, sy=2200); shot(81.6, am, 0.0013, sy=1920); shot(88.8, am, 0.00145, sy=1920)
    W.append(G.MapLabel(bris, (("ऑस्ट्रेलिया", WHITE, "baloob"),), 81.22, 91.0, px=90, dy=140))
    W.append(G.MapLabel(nr, (("NAURU", WHITE, "montb"),), 81.4, 91.0, px=84, dy=-120))
    W.append(G.GPSRoute(bris, nr, 81.9, dur=1.5, bend=0.25, t_out=91.0, px=10, rgb=YEL))
    W.append(G.MapLabel(am, (("$", YEL, "montb"),), 82.4, 91.0, px=200, dx=260))
    SC.append(G.Chip((("$1.6 BILLION", YEL, "montb"), ("/ 30 साल", WHITE, "baloob")), 88.86, 91.0, 1080, 1250, px=90))
    SC.append(G.Poster("r10_passport_sale.jpg", 91.12, 96.3, (120, 170, 1920, 1720), frm="up", crop=(0, 0.1, 1, 0.66)))
    SC.append(G.Chip((("$1,05,000+", YEL, "montb"), ("= नागरिकता", WHITE, "baloob")), 93.52, 96.3, 1080, 2060, px=90))
    shot(91.5, nr, 0.3, sy=2700); shot(96.3, nr, 0.32, sy=2600)

    # ---------------- 10. close + loop (96.4 - end)
    SC.append(G.Chip((("एक शब्द में?", YEL, "baloob"),), 96.4, 98.9, 1080, 1300, px=110))
    shot(98.6, nr, 0.3, sy=2200); shot(99.7, nr, 0.004); shot(100.6, mid, 0.00032); shot(101.15, dl, 0.0016); shot(101.75, ap, 0.3, sy=2000)
    shot(DUR + 0.2, ap, 0.42, sy=2000)

    film.items.extend(W)
    return SC
