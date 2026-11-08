"""Cues and captions for the map-sizes (Mercator) video, from the creator's VO (public/mapsizes/audio/vo.mp3).

    python3 -I tools/mapsizes_timing.py

Phrase starts and ends come from ffmpeg silencedetect (-35 dB, 0.22 s) on the VO; faster-whisper word times ("small",
"medium" for 59-73 s where "small" skipped) pin the names and numbers. Caption words are spread over each phrase by
their length, then pinned.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "mapsizes" / "edit" / "timing.json"
DURATION = 98.0

PHRASES = [  # caption text (numbers as digits), start, end
    ("किसी ने ये कभी नहीं बताया:", 0.0, 1.52),
    ("India असल में Greenland से डेढ़ गुना बड़ा है।", 2.02, 5.03),
    ("फिर ये छोटा क्यों दिखता है?", 5.61, 6.98),
    ("Greenland को ऊपर से नीचे नापो:", 7.48, 9.46),
    ("2,670 किलोमीटर।", 9.88, 11.92),
    ("अब India को नापो:", 12.42, 13.49),
    ("3,214 किलोमीटर।", 13.91, 15.92),
    ("अब पूरब से पश्चिम।", 16.32, 17.69),
    ("Greenland:", 18.02, 18.64),
    ("1,050 किलोमीटर।", 19.09, 20.55),
    ("India: 2,933।", 21.05, 23.61),
    ("दोनों तरफ़ India आगे।", 23.94, 25.69),
    ("Area में भी:", 26.16, 26.78),
    ("Greenland करीब 22 लाख वर्ग किलोमीटर,", 27.13, 29.74),
    ("India करीब 33 लाख।", 30.14, 31.85),
    ("पर India को उठाकर Greenland पर रखो,", 32.29, 34.63),
    ("तो ये उसके सामने छोटा सा लगता है।", 34.97, 36.83),
    ("और Africa?", 37.29, 37.84),
    ("ये तो Greenland से 14 गुना बड़ा है।", 38.18, 40.61),
    ("फिर भी नक्शे पर दोनों लगभग बराबर।", 41.01, 43.69),
    ("तो गड़बड़ कहाँ है?", 44.13, 45.38),
    ("1569 में,", 45.89, 47.13),
    ("Gerardus Mercator नाम के एक नक्शा बनाने वाले ने ये map बनाया,", 47.38, 51.28),
    ("समुद्र के नाविकों के लिए।", 51.63, 53.07),
    ("इस पर दो बंदरगाहों के बीच एक सीधी लाइन खींचो,", 53.50, 56.68),
    ("compass उसी दिशा पर रखो,", 57.10, 58.67),
    ("और जहाज़ पहुँच जाएगा।", 58.97, 60.38),
    ("इसीलिए ये map हर जगह छा गया।", 60.78, 63.11),
    ("School की किताबों से लेकर", 63.57, 65.08),
    ("Google Maps के app तक।", 65.31, 66.79),
    ("पर दिक्कत ये है:", 67.20, 68.36),
    ("गोल धरती को बिना खींचे flat करना नामुमकिन है।", 68.76, 72.37),
    ("धरती को छह टुकड़ों में काटो।", 72.75, 74.40),
    ("उन्हें flat बिछाओ।", 74.77, 75.74),
    ("और बीच की खाली जगह भरने के लिए उन्हें खींचो।", 76.09, 79.10),
    ("जितना pole के पास,", 79.44, 80.88),
    ("उतना ज़्यादा खिंचाव।", 81.11, 82.30),
    ("Greenland के बीच में area करीब 10 गुना फूल जाता है।", 82.64, 86.16),
    ("India के पास बस करीब 15%।", 86.56, 89.06),
    ("अब Greenland को उसकी असली size में India के पास लाओ।", 89.42, 92.82),
    ("ये है असली Greenland।", 93.22, 94.97),
    ("India से छोटा।", 95.38, 96.49),
    ("और ये बात…", 96.88, 97.70),
]
# whisper word starts that land inside their phrase: (phrase index, word, time)
PINS = [
    (1, "India", 1.98), (1, "Greenland", 3.18), (1, "डेढ़", 3.96), (2, "छोटा", 5.88), (3, "नीचे", 8.82),
    (4, "2,670", 9.90), (6, "3,214", 13.86), (7, "पश्चिम।", 17.24), (9, "1,050", 19.10), (10, "2,933।", 21.70),
    (13, "22", 28.24), (14, "33", 31.10), (15, "उठाकर", 33.02), (15, "Greenland", 33.54), (16, "छोटा", 35.80),
    (18, "14", 39.42), (19, "बराबर।", 43.26), (20, "गड़बड़", 44.26), (22, "Mercator", 47.96), (22, "map", 50.68),
    (23, "नाविकों", 52.24), (24, "बंदरगाहों", 54.12), (24, "सीधी", 55.52), (24, "खींचो,", 56.34), (26, "जहाज़", 59.16),
    (28, "किताबों", 64.12), (29, "Google", 65.30), (31, "flat", 70.66), (31, "नामुमकिन", 71.72), (32, "छह", 73.36),
    (32, "काटो।", 74.14), (33, "बिछाओ।", 75.40), (34, "खाली", 76.78), (34, "खींचो।", 78.64), (35, "pole", 79.92),
    (36, "खिंचाव।", 81.92), (37, "बीच", 83.34), (37, "10", 84.66), (37, "फूल", 85.42), (38, "15%।", 88.02),
    (39, "असली", 90.86), (39, "India", 91.98), (40, "असली", 93.90), (40, "Greenland।", 94.42), (41, "छोटा।", 95.98),
]
# named cues: (name, phrase index, word or None for the phrase start)
CUES = [
    ("kisi", 0, None), ("india0", 1, "India"), ("dedh", 1, "डेढ़"), ("chhota0", 2, "छोटा"), ("gl1", 3, None), ("neeche1", 3, "नीचे"),
    ("n2670", 4, "2,670"), ("in1", 5, None), ("n3214", 6, "3,214"), ("ew", 7, None), ("gl2", 8, None), ("n1050", 9, "1,050"),
    ("in2", 10, None), ("n2933", 10, "2,933।"), ("dono", 11, None), ("area", 12, None), ("n22", 13, "22"), ("n33", 14, "33"),
    ("uthakar", 15, "उठाकर"), ("glpar", 15, "Greenland"), ("chhota3", 16, "छोटा"), ("africa", 17, None), ("n14", 18, "14"),
    ("barabar", 19, "बराबर।"), ("gadbad", 20, None), ("y1569", 21, None), ("mercator", 22, "Mercator"), ("mapb", 22, "map"),
    ("naavik", 23, "नाविकों"), ("ports", 24, "बंदरगाहों"), ("seedhi", 24, "सीधी"), ("compass", 25, None), ("jahaz", 26, "जहाज़"),
    ("chha", 27, None), ("school", 28, None), ("google", 29, "Google"), ("dikkat", 30, None), ("gol", 31, None),
    ("namumkin", 31, "नामुमकिन"), ("chhe", 32, "छह"), ("kaato", 32, "काटो।"), ("bichhao", 33, None), ("khali", 34, "खाली"),
    ("kheencho", 34, "खींचो।"), ("pole", 35, "pole"), ("utna", 36, None), ("glbeech", 37, None), ("n10", 37, "10"),
    ("in15", 38, None), ("n15", 38, "15%।"), ("ablao", 39, None), ("asli", 39, "असली"), ("inpaas", 39, "India"),
    ("yehai", 40, None), ("asligl", 40, "Greenland।"), ("chhota4", 41, None), ("aurye", 42, None),
]


def spread(text: str, t0: float, t1: float) -> list[list]:
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
