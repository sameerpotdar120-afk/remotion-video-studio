"""Cues and captions for the Hormuz video, from the creator's VO (public/hormuz/audio/vo.mp3, 95.63 s).

    python3 -I tools/hormuz_timing.py

Phrase ends from ffmpeg silencedetect (-38 dB, 0.18 s); faster-whisper "medium" word times pin names and numbers.
The loop: the VO ends on "बस…" at 95.46 s and the video is 95.8 s, so the last line runs into "33 किलोमीटर का ये रास्ता"
at frame 0.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "hormuz" / "edit" / "timing.json"
DURATION = 95.8

PHRASES = [
    ("33 किलोमीटर का ये रास्ता।", 0.0, 1.85),
    ("आज ये लगभग बंद है,", 2.24, 3.78),
    ("इसका असर तुम्हारे petrol तक पहुँचता है,", 4.18, 6.6),
    ("और इसके बदले आज तक कोई दूसरा समुद्री रास्ता नहीं बना।", 6.98, 10.79),
    ("क्यों?", 11.16, 11.55),
    ("ये है Strait of Hormuz।", 12.18, 14.1),
    ("रोज़ करीब 2 करोड़ बैरल तेल,", 14.44, 16.86),
    ("यानी दुनिया की खपत का करीब पाँचवाँ हिस्सा, यहीं से निकलता था।", 17.12, 21.02),
    ("2026 की Iran जंग के बाद से,", 21.42, 23.9),
    ("यहाँ जहाज़ों का आना-जाना बहुत कम हो गया है।", 24.16, 26.54),
    ("रोज़ 2 करोड़ 16 लाख बैरल से गिरकर,", 26.88, 29.82),
    ("सिर्फ़ 49 लाख।", 30.1, 31.47),
    ("और भारत?", 31.94, 32.55),
    ("इस साल की शुरुआत में हमारा करीब आधा crude,", 32.86, 35.84),
    ("यानी रोज़ करीब 26 लाख बैरल,", 36.0, 38.44),
    ("इसी रास्ते से आता था।", 38.66, 39.84),
    ("Map देखकर लगता है,", 40.16, 41.5),
    ("बस यहाँ से एक canal काट दो।", 41.66, 43.54),
    ("Persian Gulf से सीधे Gulf of Oman।", 43.86, 46.08),
    ("पर रास्ते में खड़े हैं Hajar पहाड़।", 46.54, 48.92),
    ("करीब 700 किलोमीटर लंबी range,", 49.28, 51.64),
    ("और सबसे ऊँची चोटी करीब 3,000 मीटर।", 51.84, 55.12),
    ("ऊपर से ये ज़मीन दो देशों की है:", 55.52, 57.46),
    ("UAE और Oman।", 57.68, 59.44),
    ("Canal बना, तो दोनों देश बीच से कट जाएँगे।", 59.82, 62.74),
    ("Security, customs, फ़ौज,", 63.06, 65.31),
    ("सब दो हिस्सों में।", 65.48, 66.45),
    ("तो Gulf ने किया क्या?", 66.92, 68.16),
    ("Canal नहीं, pipelines।", 68.66, 70.35),
    ("Saudi की East-West pipeline", 70.64, 72.5),
    ("तेल को Red Sea तक ले जाती है,", 72.76, 74.47),
    ("और UAE की pipeline", 74.76, 76.25),
    ("सीधे Fujairah तक, Hormuz के बाहर।", 76.62, 78.79),
    ("पर Hormuz बंद हो,", 79.18, 80.48),
    ("तो इन pipelines में खाली जगह", 80.64, 82.44),
    ("बस करीब 26 लाख बैरल रोज़ की है।", 82.66, 85.17),
    ("यानी उतना ही,", 85.26, 86.48),
    ("जितना अकेला भारत यहाँ से लेता था।", 86.7, 88.88),
    ("2 करोड़ के सामने,", 89.14, 90.56),
    ("बहुत कम।", 90.82, 91.38),
    ("बाकी सारे तेल के लिए आज भी बचता है,", 91.74, 94.53),
    ("बस…", 94.84, 95.5),
]
PINS = [
    (0, "किलोमीटर", 0.54), (0, "रास्ता।", 1.4), (1, "बंद", 3.46), (2, "petrol", 5.5), (3, "दूसरा", 9.04), (3, "समुद्री", 9.52),
    (5, "Hormuz।", 13.52), (6, "2", 15.4), (6, "बैरल", 16.2), (7, "पाँचवाँ", 18.78), (8, "2026", 21.42), (8, "Iran", 22.68),
    (9, "बहुत", 25.66), (10, "2", 27.46), (10, "16", 28.2), (10, "गिरकर,", 29.42), (11, "49", 30.54), (12, "भारत?", 32.18),
    (13, "आधा", 35.06), (14, "26", 37.12), (16, "Map", 40.16), (17, "canal", 43.0), (18, "Persian", 43.86), (18, "Oman।", 45.76),
    (19, "Hajar", 48.12), (20, "700", 49.78), (21, "चोटी", 53.02), (21, "3,000", 54.02), (22, "दो", 56.62), (23, "UAE", 57.68),
    (23, "Oman।", 59.02), (24, "Canal", 59.82), (24, "कट", 62.18), (25, "Security,", 63.06), (25, "customs,", 64.08), (25, "फ़ौज,", 64.94),
    (27, "Gulf", 67.1), (28, "Canal", 68.66), (28, "pipelines।", 69.56), (29, "Saudi", 70.64), (30, "Red", 73.32), (31, "UAE", 75.1),
    (32, "Fujairah", 76.96), (32, "Hormuz", 77.9), (33, "बंद", 79.98), (34, "खाली", 81.84), (35, "26", 83.22), (37, "भारत", 87.76),
    (38, "2", 89.14), (39, "कम।", 91.3), (40, "सारे", 92.34), (41, "बस…", 94.84),
]
CUES = [
    ("hook", 0, None), ("km", 0, "किलोमीटर"), ("band", 1, "बंद"), ("asar", 2, None), ("petrol", 2, "petrol"), ("aur0", 3, None),
    ("doosra", 3, "दूसरा"), ("kyu", 4, None), ("yehai", 5, None), ("hormuz", 5, "Hormuz।"), ("roz", 6, None), ("n2cr", 6, "2"),
    ("yani", 7, None), ("panch", 7, "पाँचवाँ"), ("y2026", 8, "2026"), ("iran", 8, "Iran"), ("jahaz", 9, None), ("bahut", 9, "बहुत"),
    ("n216", 10, "2"), ("girkar", 10, "गिरकर,"), ("n49", 11, "49"), ("bharat", 12, None), ("aadha", 13, "आधा"), ("n26a", 14, "26"),
    ("isi", 15, None), ("map", 16, "Map"), ("canal", 17, "canal"), ("persian", 18, "Persian"), ("oman1", 18, "Oman।"), ("par", 19, None),
    ("hajar", 19, "Hajar"), ("n700", 20, "700"), ("choti", 21, "चोटी"), ("n3000", 21, "3,000"), ("upar", 22, None), ("do", 22, "दो"),
    ("uae", 23, "UAE"), ("oman2", 23, "Oman।"), ("canal2", 24, "Canal"), ("kat", 24, "कट"), ("sec", 25, "Security,"), ("cus", 25, "customs,"),
    ("fauj", 25, "फ़ौज,"), ("sab", 26, None), ("to3", 27, None), ("canal3", 28, "Canal"), ("pipes", 28, "pipelines।"), ("saudi", 29, "Saudi"),
    ("redsea", 30, "Red"), ("aur4", 31, None), ("uaep", 31, "UAE"), ("fuj", 32, "Fujairah"), ("bahar", 32, "Hormuz"), ("parh", 33, None),
    ("bandh", 33, "बंद"), ("khali", 34, "खाली"), ("n26b", 35, "26"), ("yani2", 36, None), ("bharat2", 37, "भारत"), ("n2cr2", 38, "2"),
    ("kam", 39, "कम।"), ("baaki", 40, None), ("saare", 40, "सारे"), ("bas", 41, None),
]


def spread(text: str, t0: float, t1: float) -> list:
    words = text.split()
    w = [len(x) + 2 for x in words]
    tot = sum(w)
    out, acc = [], 0
    for x, k in zip(words, w):
        out.append([round(t0 + (t1 - t0) * acc / tot, 2), x])
        acc += k
    return out


def main() -> None:
    lines = [spread(*p) for p in PHRASES]
    for i, word, t in PINS:
        ws = lines[i]
        j = next(k for k, x in enumerate(ws) if x[1] == word)
        ws[j][0] = t
        for k in range(j + 1, len(ws)):
            ws[k][0] = max(ws[k][0], round(ws[k - 1][0] + 0.12, 2))
        for k in range(j - 1, -1, -1):
            ws[k][0] = min(ws[k][0], round(ws[k + 1][0] - 0.12, 2))
    cues = {}
    for name, i, word in CUES:
        cues[name] = PHRASES[i][1] if word is None else next(x[0] for x in lines[i] if x[1] == word)
    for i, (_, _, t1) in enumerate(PHRASES):
        cues[f"end{i}"] = t1
    caps = [x for ws in lines for x in ws]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(OUT, len(caps), "words,", len(cues), "cues")


if __name__ == "__main__":
    main()
