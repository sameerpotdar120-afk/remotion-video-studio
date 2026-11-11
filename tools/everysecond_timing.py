"""Cues and captions for the "every second" video, from the creator's VO (public/everysecond/audio/vo.mp3, 62.2 s).

    python3 -I tools/everysecond_timing.py

Phrase ends from ffmpeg silencedetect (-38 dB, 0.18 s); faster-whisper "medium" word times pin the numbers (whisper
garbled 6.3-9.1 s, "और धरती 30 किलोमीटर आगे निकल जाती है", so that phrase is placed from the silences).
The loop: the VO ends on "और फिर भी…" at 61.97 s and the video is 62.4 s, so it runs into "एक सेकंड पर…" at frame 0.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "everysecond" / "edit" / "timing.json"
DURATION = 62.4

PHRASES = [
    ("एक सेकंड पर तुम कभी ध्यान नहीं देते।", 0.0, 2.33),
    ("पर इसी एक सेकंड में 4 बच्चे पैदा होते हैं,", 2.44, 5.81),
    ("और धरती", 6.17, 6.78),
    ("30 किलोमीटर आगे निकल जाती है।", 7.17, 9.13),
    ("और क्या होता है?", 9.56, 10.36),
    ("हर सेकंड, दुनिया में करीब 4 बच्चे पैदा होते हैं,", 10.9, 13.99),
    ("और करीब 2 लोग दुनिया छोड़ जाते हैं।", 14.41, 16.84),
    ("भारत में?", 17.24, 17.81),
    ("करीब हर डेढ़ सेकंड में एक बच्चा।", 18.2, 20.52),
    ("इसी सेकंड, दुनिया करीब 40 लाख emails भेजती है,", 21.02, 24.53),
    ("और Google पर 1 लाख से ज़्यादा searches होती हैं।", 24.9, 28.0),
    ("और भारत अकेले करीब 9,500 UPI payments कर देता है।", 28.42, 32.97),
    ("धरती पर करीब 44 बार बिजली गिरती है।", 33.4, 36.13),
    ("पुरानी किताबें 100 कहती थीं,", 36.54, 38.31),
    ("पर satellites ने गिना: करीब 44।", 38.64, 41.21),
    ("दुनिया करीब 1,200 बैरल तेल जला देती है,", 41.6, 44.92),
    ("और करीब 1,200 टन CO2 हवा में छोड़ देती है।", 45.29, 49.2),
    ("रोशनी धरती के साढ़े 7 चक्कर लगा लेती है।", 49.62, 52.76),
    ("और तुम?", 53.21, 53.58),
    ("तुम भी धरती के साथ, सूरज के चारों ओर,", 54.0, 56.96),
    ("करीब 30 किलोमीटर आगे बढ़ चुके हो।", 57.25, 59.44),
    ("ये सब हुआ।", 59.88, 60.8),
    ("और फिर भी…", 61.16, 61.97),
]
PINS = [
    (0, "सेकंड", 0.38), (1, "4", 4.26), (1, "बच्चे", 4.92), (5, "4", 12.64), (6, "2", 15.04), (8, "डेढ़", 19.02), (8, "बच्चा।", 20.2),
    (9, "40", 22.66), (9, "emails", 23.74), (10, "Google", 25.06), (10, "1", 25.9), (11, "भारत", 28.58), (11, "9,500", 30.26),
    (11, "UPI", 31.46), (12, "44", 34.44), (12, "बिजली", 35.34), (13, "100", 37.48), (14, "satellites", 38.78), (14, "44।", 40.48),
    (15, "1,200", 42.6), (15, "तेल", 44.02), (16, "1,200", 46.0), (16, "CO2", 47.44), (17, "7", 51.04), (17, "चक्कर", 51.68),
    (19, "सूरज", 55.7), (20, "30", 57.68), (22, "भी…", 61.58),
]
CUES = [
    ("hook", 0, None), ("sec", 0, "सेकंड"), ("par", 1, None), ("n4a", 1, "4"), ("bachche", 1, "बच्चे"), ("dharti", 2, None), ("km30a", 3, None),
    ("kya", 4, None), ("har", 5, None), ("n4b", 5, "4"), ("n2", 6, "2"), ("bharat", 7, None), ("dedh", 8, "डेढ़"), ("ek", 8, "बच्चा।"),
    ("isi", 9, None), ("n40", 9, "40"), ("emails", 9, "emails"), ("google", 10, "Google"), ("lakh1", 10, "1"), ("bharat2", 11, "भारत"),
    ("n9500", 11, "9,500"), ("upi", 11, "UPI"), ("dharti2", 12, None), ("n44", 12, "44"), ("bijli", 12, "बिजली"), ("purani", 13, None),
    ("n100", 13, "100"), ("sat", 14, "satellites"), ("n44b", 14, "44।"), ("oil", 15, None), ("n1200a", 15, "1,200"), ("tel", 15, "तेल"),
    ("co2a", 16, None), ("n1200b", 16, "1,200"), ("co2", 16, "CO2"), ("roshni", 17, None), ("n7", 17, "7"), ("chakkar", 17, "चक्कर"),
    ("tum", 18, None), ("tumbhi", 19, None), ("suraj", 19, "सूरज"), ("km30", 20, "30"), ("yesab", 21, None), ("phirbhi", 22, None),
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
