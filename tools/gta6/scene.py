"""GTA 6 Short: the scene. Times are the VO's word starts (faster-whisper, after the 1.15x speed-up).
World items ride the camera; screen items are in 2160x3840 design px. The last 0.5 s crossfades into frame 0."""
import math

import gtakit as G
from gtakit import CYAN, MAG, ORG, VIO, WHITE, YEL

DUR = 113.75
K = 100000.0
C30 = math.cos(math.radians(30))


def proj(lat, lon):
    return (math.radians(lon) * C30 * K, -math.radians(lat - 30) * K)


# captions: (start, text). Digits for numbers (house style); Devanagari with English names in Latin.
CAPTIONS = [
    (0.00, "GTA 6 में तुम जो"), (1.50, "Vice Beach देख रहे हो,"), (2.98, "Rockstar ने उसे बनाने का काम"),
    (4.50, "बेंगलुरु क्यों भेजा?"), (5.90, "क्योंकि बेंगलुरु में"), (6.98, "Rockstar का अपना studio है:"),
    (8.68, "Rockstar India"), (10.14, "रिपोर्ट्स के हिसाब से,"), (11.30, "Vice Beach का बड़ा हिस्सा"), (12.84, "यहीं बना।"),
    (13.52, "पर ये समझने के लिए"), (14.72, "GTA का map देखो।"), (16.16, "इसका हर शहर,"), (17.34, "America का एक असली शहर है।"),
    (19.46, "2002, Vice City:"), (21.52, "असल में Miami,"), (22.92, "अस्सी के दशक वाला।"), (24.16, "वही game, जो हम में से"),
    (25.56, "कितनों ने पहली बार"), (26.78, "cyber cafe में खेला था,"), (28.08, "₹20 घंटा देकर।"),
    (29.62, "क़रीब पौने दो करोड़"), (31.06, "copies बिकीं।"),
    (32.14, "2004, San Andreas:"), (34.18, "पूरा एक राज्य,"), (35.52, "California और Nevada से बना।"),
    (37.28, "Los Santos यानी Los Angeles,"), (39.28, "San Fierro यानी San Francisco,"), (41.50, "Las Venturas यानी Las Vegas।"),
    (43.90, "CJ की cycle चलाते-चलाते,"), (45.80, "हम सब बड़े हो गए।"), (47.00, "क़रीब पौने तीन करोड़ copies।"),
    (49.24, "2008, GTA 4:"), (51.62, "Liberty City, यानी New York।"), (53.40, "ढाई करोड़ से ज़्यादा copies।"),
    (55.50, "2013, GTA 5:"), (57.86, "फिर Los Santos, यानी Los Angeles।"), (59.98, "और ये बिका,"), (60.90, "23 करोड़ से ज़्यादा।"),
    (62.54, "क़रीब-क़रीब उतना,"), (63.72, "जितनी पूरे उत्तर प्रदेश की आबादी।"), (65.94, "वही GTA 5,"), (67.30, "जिसने India में"),
    (68.16, "RP servers और YouTube gaming की"), (70.18, "एक अलग ही दुनिया बना दी।"),
    (71.90, "फिर 13 साल का इंतज़ार।"), (73.94, "School से job तक"), (75.22, "पहुँच गई एक पूरी generation।"),
    (76.94, "और 19 November को,"), (78.36, "आख़िर GTA 6 आया।"), (80.22, "फिर Vice City,"), (81.36, "पर इस बार पूरा राज्य:"),
    (82.96, "Leonida, यानी Florida।"), (84.70, "और उसका Vice Beach"), (85.72, "बना बेंगलुरु में।"),
    (87.16, "ये studio पहले"), (88.18, "Dhruva Interactive था,"), (89.42, "भारत का सबसे पुराना game studio"), (91.38, "माना जाता है।"),
    (92.20, "90 के दशक में,"), (93.26, "एक computer से शुरू हुआ था।"), (94.82, "2019 में Rockstar ने"), (96.74, "इसे ख़रीद लिया,"),
    (97.44, "और रिपोर्ट्स के हिसाब से"), (98.76, "आज यहाँ क़रीब 1,600 लोग"), (100.46, "काम करते हैं।"),
    (101.40, "मतलब तुम्हारे जैसे ही gamers,"), (103.16, "जिन्होंने दुनिया के सबसे बड़े game में"), (105.32, "हाथ बँटाया।"),
    (106.16, "अब बताओ:"), (107.02, "अगला GTA भारत में बने,"), (108.56, "तो शहर कौन सा हो?"), (110.08, "मुंबई या बेंगलुरु?"),
    (111.44, "और अगली बार कोई"), (112.36, "तुमसे पूछे कि..."),
]


def build(film, geo):
    P = geo.places
    S = lambda name: ("states", name)
    W = []          # world items
    SC = []         # screen items
    pz = 0.5625     # screen px per world unit at zoom 1 (2160 / 3840)

    def shot(t, xy, z, sx=1080, sy=1920, rot=0.0):
        film.cam(t, xy[0] - (sx - 1080) / (z * pz), xy[1] - (sy - 1920) / (z * pz), z, rot)

    mia, vb, la, sf, lv, ny = P["Miami"], P["Vice Beach"], P["Los Angeles"], P["San Francisco"], P["Las Vegas"], P["New York"]
    blr, bom = P["Bengaluru"], P["Mumbai"]
    vbx = (vb[0] + 180, vb[1] - 900)
    us_c = proj(38.5, -97.5)
    india_c = proj(21.5, 79.0)
    nv = geo.centre(S("Nevada")); ca = geo.centre(S("California"))

    # ---------------- the loop picture (frame 0 and the last frames): Vice Beach glowing, GPS line toward Bengaluru
    def hook_picture(t0, t1):
        W.append(G.CityGlow(vbx, t0, t1, r_px=260))
        W.append(G.Waypoint(vbx, t0, t1, px=40))
        W.append(G.MapLabel(vbx, (("VICE BEACH", WHITE, "anton"),), t0, t1, px=150, dx=0, dy=-170, glow=MAG))
        W.append(G.SunsetFill(geo, [S("Florida")], t0, t1, alpha=0.32, wipe=0.01))
    hook_picture(-1, 5.0)
    hook_picture(112.2, None)

    # ---------------- 1. hook (0 - 5.9): Vice Beach -> Bengaluru
    shot(0.0, vbx, 0.36, sy=2150); shot(2.6, vbx, 0.52, sy=2050, rot=-1.0)
    W.append(G.GPSRoute(vbx, blr, 2.98, dur=2.8, bend=-0.18, t_out=12.6, px=12))
    SC.append(G.Chip((("→ बेंगलुरु", WHITE, "baloob"),), 3.3, 4.6, 1560, 760, px=97))
    shot(3.9, vbx, 0.40, sy=1900); shot(4.9, proj(30, -10), 0.018); shot(5.9, blr, 0.10, sy=2200)
    shot(6.6, blr, 0.16, sy=2350, rot=0.8)

    # ---------------- 2. Rockstar India, Bengaluru (5.9 - 13.5)
    W.append(G.SunsetFill(geo, [("in_states", "Karnataka")], 6.18, 13.4, alpha=0.8))
    W.append(G.Waypoint(blr, 6.18, 13.4, px=40))
    W.append(G.MapLabel(blr, (("बेंगलुरु", WHITE, "baloob"),), 6.18, 13.4, px=120, dy=-110, glow=MAG))
    SC.append(G.Chip((("ROCKSTAR INDIA", YEL, "anton"), ("· बेंगलुरु", WHITE, "baloob")), 8.68, 13.3, 1080, 3250, px=105))
    SC.append(G.Poster("p6_bengaluru_studio.jpg", 7.9, 13.3, (150, 260, 1860, 1700), frm="right", crop=(0, 0.05, 1, 0.62)))
    SC.append(G.Chip((("रिपोर्ट्स के मुताबिक़", WHITE, "baloob"),), 10.14, 13.3, 1080, 2060, px=75))
    shot(9.0, blr, 0.20, sy=2500); shot(12.8, blr, 0.24, sy=2520, rot=-0.5)

    # ---------------- 3. turn: every city is a real one (13.5 - 19.4)
    shot(13.6, blr, 0.10, sy=2200); shot(14.6, proj(30, -20), 0.016); shot(16.0, us_c, 0.042, sy=2050)
    shot(19.0, us_c, 0.048, sy=2050, rot=0.6)
    for i, xy in enumerate((ny, mia, la, lv)):
        W.append(G.Waypoint(xy, 17.34 + i * 0.32, 19.4, px=34))
        W.append(G.MapLabel(xy, (("?", YEL, "anton"),), 17.5 + i * 0.32, 19.4, px=110, dy=-80))

    # ---------------- 4. Vice City = Miami, 2002 (19.46 - 32.1)
    SC.append(G.YearCard("2002", 19.46, 21.3, y=760))
    shot(20.2, mia, 0.20, sy=2650); shot(24.0, mia, 0.24, sy=2700)
    W.append(G.CityGlow(mia, 20.18, 32.0, r_px=230))
    W.append(G.MapLabel(mia, (("VICE CITY", MAG, "anton"),), 20.18, 32.0, px=110, dx=-260, dy=-330, glow=MAG))
    W.append(G.MapLabel(mia, (("= MIAMI", WHITE, "anton"),), 22.14, 32.0, px=84, dx=-260, dy=-240))
    SC.append(G.Poster("p7_vice_beach_mood.jpg", 21.5, 24.0, (150, 220, 1860, 1640), frm="right", crop=(0, 0.12, 1, 0.6)))
    SC.append(G.Chip((("1980s", YEL, "anton"),), 22.92, 24.0, 1080, 1980, px=100))
    SC.append(G.Poster("p1_cyber_cafe.jpg", 24.16, 29.5, (150, 160, 1860, 1640), frm="left", crop=(0, 0.1, 1, 0.62)))
    SC.append(G.NullPanel(G.FILM / "assets/null_a", 25.9, 29.4, 0.2))
    SC.append(G.Chip((("₹20 / घंटा", YEL, "baloob"),), 28.08, 29.4, 1080, 1700, px=100))
    shot(29.3, mia, 0.21, sy=2300); shot(31.9, mia, 0.23, sy=2350)
    W.append(G.CaseStack((mia[0] - 3000, mia[1] + 5200), 29.62, 32.0, 0, 17.5, 10, "2002", cols=5, case_w=1900, roll=1.6))

    # ---------------- 5. San Andreas, 2004 (32.1 - 49.2)
    SC.append(G.YearCard("2004", 32.14, 34.0, y=760))
    shot(32.9, proj(30, -105), 0.03); shot(34.2, ((ca[0] + nv[0]) / 2, (ca[1] + nv[1]) / 2), 0.13, sy=2150)
    W.append(G.MapLabel(((ca[0] + nv[0]) / 2, ca[1] - 9000), (("SAN ANDREAS", MAG, "anton"),), 32.96, 37.0, px=150, glow=MAG))
    W.append(G.SunsetFill(geo, [S("California"), S("Nevada")], 35.52, 49.2, alpha=0.85, t_violet=43.6))
    W.append(G.MapLabel(ca, (("CALIFORNIA", WHITE, "anton"),), 35.6, 37.2, px=112))
    W.append(G.MapLabel(nv, (("NEVADA", WHITE, "anton"),), 36.32, 37.2, px=112))
    for (xy, fic, real, t0) in ((la, "LOS SANTOS", "= LOS ANGELES", 37.28), (sf, "SAN FIERRO", "= SAN FRANCISCO", 39.28),
                                (lv, "LAS VENTURAS", "= LAS VEGAS", 41.50)):
        W.append(G.CityGlow(xy, t0, 49.2, r_px=160))
        W.append(G.Waypoint(xy, t0, 49.2, px=30))
        W.append(G.MapLabel(xy, ((fic, MAG, "anton"),), t0, t0 + 1.85, px=120, dy=-200, glow=MAG))
        W.append(G.MapLabel(xy, ((real, WHITE, "anton"),), t0 + 0.9, t0 + 1.85, px=90, dy=-90))
    shot(37.3, la, 0.17, sy=2300); shot(39.3, sf, 0.17, sy=2300); shot(41.5, lv, 0.17, sy=2300)
    shot(43.6, ((la[0] + sf[0]) / 2, (la[1] + sf[1]) / 2), 0.12, sy=2600)
    W.append(G.GPSRoute(la, sf, 43.9, dur=1.3, bend=0.25, t_out=46.8, px=9, rgb=YEL))
    W.append(G.GPSRoute(sf, lv, 45.2, dur=1.3, bend=0.25, t_out=46.8, px=9, rgb=YEL))
    SC.append(G.Poster("p2_bicycle_kid_grey.png", 43.9, 46.9, (300, 300, 1100, 1975), frm="left", cutout=True, tag=True))
    shot(46.9, nv, 0.13, sy=2150)
    W.append(G.CaseStack((nv[0] - 1500, nv[1] + 4500), 47.0, 49.2, 0, 27.5, 15, "2004", cols=5, case_w=3200, roll=1.6))

    # ---------------- 6. GTA IV, Liberty City = New York, 2008 (49.2 - 55.5)
    SC.append(G.YearCard("2008", 49.24, 51.2, y=760))
    shot(50.0, proj(36, -92), 0.04); shot(51.4, ny, 0.20, sy=2450)
    W.append(G.SunsetFill(geo, [S("New York")], 51.62, 55.5, alpha=0.85))
    W.append(G.CityGlow(ny, 51.62, 55.5, r_px=200))
    W.append(G.MapLabel(ny, (("LIBERTY CITY", MAG, "anton"),), 51.62, 55.5, px=110, dx=-150, dy=-520, glow=MAG))
    W.append(G.MapLabel(ny, (("= NEW YORK", WHITE, "anton"),), 52.66, 55.5, px=84, dx=-150, dy=-430))
    shot(53.3, ny, 0.20, sy=2300)
    W.append(G.CaseStack((ny[0] - 1800, ny[1] + 8200), 53.40, 55.5, 0, 25, 14, "2008", label="M+", cols=5, case_w=2000, roll=1.4))

    # ---------------- 7. GTA V, 2013: 230M, Uttar Pradesh, India's RP world (55.5 - 71.9)
    SC.append(G.YearCard("2013", 55.50, 57.5, y=760))
    shot(56.4, proj(36, -105), 0.04); shot(57.9, la, 0.20, sy=2350)
    W.append(G.CityGlow(la, 58.0, 60.3, r_px=220))
    W.append(G.MapLabel(la, (("LOS SANTOS", MAG, "anton"),), 58.0, 60.3, px=110, dy=-220, glow=MAG))
    W.append(G.MapLabel(la, (("= LOS ANGELES", WHITE, "anton"),), 59.08, 60.3, px=84, dy=-110))
    shot(59.6, la, 0.21, sy=2350); shot(60.6, us_c, 0.045, sy=2200); shot(62.4, us_c, 0.05, sy=2200)
    W.append(G.CaseStack((us_c[0], us_c[1] + 12000), 60.40, 62.5, 0, 230, 60, "2013", cols=10, case_w=8200, roll=1.9, band=ORG))
    shot(63.2, proj(30, 10), 0.016)
    up = geo.centre(("in_states", "Uttar Pradesh"))
    shot(64.3, up, 0.10, sy=2250); shot(65.8, up, 0.11, sy=2250)
    W.append(G.SunsetFill(geo, [("in_states", "Uttar Pradesh")], 64.46, 66.2, alpha=0.9))
    W.append(G.MapLabel(up, (("उत्तर प्रदेश", WHITE, "baloob"),), 64.46, 66.2, px=110, dy=-60, glow=MAG))
    SC.append(G.Chip((("230M COPIES", YEL, "anton"), ("≈ UP की आबादी", WHITE, "baloob")), 64.9, 66.2, 1080, 1250, px=100))
    shot(67.2, india_c, 0.075, sy=2600); shot(71.6, india_c, 0.082, sy=2600, rot=0.6)
    SC.append(G.Poster("p3_rp_streamer_grey.png", 67.3, 71.7, (200, 240, 1760, 1520), frm="up", cutout=True))
    for i, (lat, lon) in enumerate(((28.61, 77.21), (19.08, 72.88), (12.97, 77.59), (22.57, 88.36), (17.39, 78.49), (26.91, 75.79), (23.02, 72.57))):
        W.append(G.MapLabel(proj(lat, lon), (("LIVE", WHITE, "anton"),), 68.3 + i * 0.28, 71.6, px=70, glow=(255, 30, 60)))

    # ---------------- 8. the wait, then GTA VI and Leonida (71.9 - 84.7)
    SC.append(G.NullPanel(G.FILM / "assets/null_b", 72.0, 76.7, 0.0))
    SC.append(G.Poster("p4a_schoolboy.png", 73.94, 76.8, (160, 360, 760, 1500), frm="left", cutout=True, tag=False))
    SC.append(G.Poster("p4b_office_worker.png", 74.68, 76.8, (1240, 360, 760, 1500), frm="right", cutout=True))
    SC.append(G.Chip((("SCHOOL", WHITE, "anton"),), 74.0, 76.8, 540, 1840, px=75))
    SC.append(G.Chip((("JOB", WHITE, "anton"),), 74.7, 76.8, 1620, 1840, px=75))
    SC.append(YearRoll(72.36, 76.8))
    shot(73.0, india_c, 0.06, sy=1300)
    SC.append(G.YearCard("19 NOV 2026", 77.24, 79.9, y=1050, size=300, rgb=YEL, glow=MAG))
    shot(77.6, proj(30, 0), 0.016); shot(79.4, mia, 0.10, sy=2300)
    W.append(G.CityGlow(mia, 80.54, 84.6, r_px=220))
    W.append(G.MapLabel(mia, (("VICE CITY", MAG, "anton"),), 80.54, 84.6, px=110, dy=-200, glow=MAG))
    W.append(G.SunsetFill(geo, [S("Florida")], 82.06, 85.6, alpha=0.9))
    W.append(G.MapLabel(geo.centre(S("Florida")), (("LEONIDA", MAG, "anton"),), 82.96, 85.6, px=140, dx=0, dy=-200, glow=MAG))
    W.append(G.MapLabel(geo.centre(S("Florida")), (("= FLORIDA", WHITE, "anton"),), 84.04, 85.6, px=100, dx=0, dy=-110))
    SC.append(G.Poster("p7_vice_beach_mood.jpg", 80.2, 84.6, (150, 220, 1860, 1500), frm="up", crop=(0, 0.15, 1, 0.55)))
    shot(81.8, geo.centre(S("Florida")), 0.17, sy=2500); shot(84.2, geo.centre(S("Florida")), 0.18, sy=2500); shot(85.0, vbx, 0.30, sy=2500)

    # ---------------- 9. Bengaluru built Vice Beach (84.7 - 106.1)
    W.append(G.CityGlow(vbx, 84.94, 87.0, r_px=240))
    W.append(G.MapLabel(vbx, (("VICE BEACH", WHITE, "anton"),), 85.28, 87.0, px=150, dx=0, dy=-170, glow=MAG))
    W.append(G.GPSRoute(vbx, blr, 85.5, dur=1.7, bend=-0.18, t_out=91.0, px=12))
    shot(85.6, vbx, 0.30, sy=2400); shot(86.5, proj(30, -10), 0.017); shot(87.6, blr, 0.15, sy=2550)
    W.append(G.Waypoint(blr, 86.18, None, px=40))
    W.append(G.MapLabel(blr, (("बेंगलुरु", WHITE, "baloob"),), 86.18, 106.0, px=120, dy=-110, glow=MAG))
    SC.append(G.Chip((("DHRUVA INTERACTIVE", YEL, "anton"),), 88.18, 96.6, 1080, 1840, px=97))
    SC.append(G.Chip((("भारत का सबसे पुराना game studio*", WHITE, "baloob"),), 89.42, 92.1, 1080, 2020, px=72))
    SC.append(G.Poster("p5_bengaluru_1990s.jpg", 92.2, 96.6, (150, 160, 1860, 1560), frm="left", crop=(0, 0.1, 1, 0.6)))
    SC.append(G.Chip((("1990s", YEL, "anton"), ("· 1 COMPUTER", WHITE, "anton")), 92.4, 96.6, 1080, 2020, px=87))
    SC.append(G.Chip((("2019 → ROCKSTAR INDIA", YEL, "anton"),), 94.82, 99.5, 1080, 1840, px=97))
    shot(92.0, blr, 0.17, sy=2700); shot(96.6, blr, 0.19, sy=2700)
    W.append(G.DotCloud(blr, 1600, 9000, 97.6, 100.5, t_out=106.0, px=2.6))
    SC.append(G.Chip((("≈ 1,600", YEL, "anton"), ("लोग · रिपोर्ट्स", WHITE, "baloob")), 99.78, 106.0, 1080, 1960, px=105))
    shot(99.6, blr, 0.13, sy=2300); shot(101.3, blr, 0.14, sy=2600)
    SC.append(G.Poster("p6_bengaluru_studio.jpg", 101.4, 106.0, (150, 160, 1860, 1640), frm="right", crop=(0, 0.25, 1, 0.6)))
    shot(105.9, blr, 0.15, sy=2650)

    # ---------------- 10. close + loop (106.1 - end)
    shot(107.0, proj(17, 76), 0.09, sy=2500)
    W.append(G.Waypoint(bom, 107.0, 111.4, px=40))
    W.append(G.MapLabel(bom, (("मुंबई", WHITE, "baloob"),), 107.2, 111.4, px=110, dx=-90, dy=-60, anchor="right", glow=MAG))
    SC.append(G.Chip((("अगला GTA = ?", YEL, "baloob"),), 107.02, 111.3, 1080, 1180, px=112))
    SC.append(G.Poster("p8a_mumbai_night.jpg", 110.08, 112.0, (90, 240, 960, 1500), frm="left", crop=(0, 0.1, 1, 0.75), rot=-2))
    SC.append(G.Poster("p8b_bengaluru_night.jpg", 110.74, 112.0, (1110, 240, 960, 1500), frm="right", crop=(0, 0.1, 1, 0.75), rot=2))
    shot(110.6, proj(17, 76), 0.10, sy=2600)
    shot(111.7, proj(30, -10), 0.017); shot(112.9, vbx, 0.32, sy=2150); shot(DUR + 0.2, vbx, 0.36, sy=2150)

    film.items.extend(W)
    return SC


class YearRoll(G.ScreenItem):
    """2013 -> 2026 rolling, in the top band (the 13-year wait)."""
    z = 25

    def draw(self, c, t, U):
        a = G.ramp(t, self.t_in, 0.3) * self.fade(t)
        if a <= 0:
            return
        y = 2013 + int(13 * G.eio(G.ramp(t, self.t_in + 0.2, 3.6)))
        G.draw_text_img(c, ((str(y), YEL, "anton"),), 230 * U, 1080 * U, 290 * U, a, glow=MAG)
