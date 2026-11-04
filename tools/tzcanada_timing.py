"""Cues and captions for the Canada vs USA time zones video, from the creator's VO (public/tzcanada/audio/vo.mp3).

    python3 -I tools/tzcanada_timing.py

Phrase starts and ends come from ffmpeg silencedetect (-35 dB, 0.25 s) on the VO; faster-whisper "small" word times
(where it did not skip) pin the names and numbers. Caption words are spread over each phrase by their length.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "tzcanada" / "edit" / "timing.json"
DURATION = 83.6

PHRASES = [  # caption text (numbers as digits), start, end
    ("अगर तुम Vancouver से Seattle की ट्रेन लो,", 0.0, 2.48),
    ("तो schedule के हिसाब से जाने में 3 घंटे लगेंगे,", 2.80, 5.45),
    ("और वापसी में पूरे 5।", 5.87, 7.47),
    ("क्यों?", 7.98, 8.18),
    ("पहले America और Canada का time zone map देखो।", 8.87, 11.63),
    ("देखने में बिल्कुल normal है।", 12.11, 13.44),
    ("पूरब या पश्चिम जाओ, तो घड़ी एक घंटा आगे या पीछे।", 13.93, 17.37),
    ("पर 1 नवंबर की रात 2 बजे,", 17.91, 20.06),
    ("सब उल्टा-पुल्टा हो गया।", 20.36, 21.70),
    ("Alberta के Calgary और Florida के Destin को देखो।", 22.21, 25.18),
    ("दोनों के बीच 3,000 किलोमीटर से ज़्यादा की दूरी है,", 25.61, 29.01),
    ("और करीब 28 डिग्री longitude का फ़र्क़।", 29.37, 32.09),
    ("फिर भी अब दोनों का time एक ही है।", 32.52, 34.90),
    ("और यहाँ उल्टा हुआ।", 35.45, 36.57),
    ("Vancouver और Seattle लगभग एक ही longitude पर हैं,", 37.06, 40.21),
    ("फ़र्क़ एक डिग्री से भी कम।", 40.58, 42.12),
    ("पर दोनों की घड़ियों में पूरा एक घंटे का फ़र्क़।", 42.54, 45.50),
    ("इसीलिए ट्रेन का सफ़र दोनों तरफ़ लगभग 4 घंटे का ही है,", 45.93, 49.52),
    ("पर घड़ी देखो,", 49.97, 50.81),
    ("तो जाना 3 घंटे का लगता है, और आना 5 घंटे का।", 51.09, 54.47),
    ("ऐसे और भी कई अजीब मामले अब पूरे नक्शे पर हैं।", 54.93, 58.16),
    ("पर ये हुआ कैसे?", 58.69, 59.75),
    ("British Columbia,", 60.28, 61.25),
    ("Alberta, Manitoba और Northwest Territories ने", 61.51, 64.65),
    ("इस साल घड़ियाँ पीछे करना ही छोड़ दिया।", 64.94, 67.05),
    ("Saskatchewan और Yukon तो पहले से ऐसा करते आ रहे हैं।", 67.45, 70.62),
    ("तो जब बाकी सब ने अपनी घड़ियाँ एक घंटा पीछे कीं,", 71.06, 74.25),
    ("ये वहीं रुके रहे,", 74.58, 75.52),
    ("और पूरा नक्शा खिसक गया।", 75.93, 77.57),
    ("March में बाकी घड़ियाँ फिर आगे होंगी,", 78.02, 80.29),
    ("तो नक्शा फिर सीधा दिखेगा।", 80.62, 82.05),
    ("पर तब तक…", 82.55, 83.40),
]
# whisper word starts that land inside their phrase: (phrase index, word, time)
PINS = [
    (0, "Vancouver", 0.52), (0, "Seattle", 1.28), (0, "ट्रेन", 1.98), (1, "3", 4.48), (2, "5।", 7.02),
    (7, "1", 18.06), (7, "2", 19.38), (9, "Calgary", 22.80), (9, "Florida", 23.66), (9, "Destin", 24.30),
    (10, "3,000", 26.62), (11, "28", 30.13), (12, "time", 33.32), (14, "Seattle", 37.90), (14, "longitude", 39.42),
    (16, "घड़ियों", 43.22), (16, "घंटे", 44.70), (17, "ट्रेन", 46.42), (17, "4", 48.38), (19, "3", 51.56), (19, "5", 53.56),
    (23, "Manitoba", 62.10), (23, "Northwest", 62.94), (25, "Saskatchewan", 67.58), (25, "Yukon", 68.44),
    (30, "नक्शा", 80.70), (31, "तब", 82.70),
]
# named cues: (name, phrase index, word or None for the phrase start)
CUES = [
    ("vancouver1", 0, "Vancouver"), ("seattle1", 0, "Seattle"), ("three1", 1, "3"), ("five1", 2, "5।"), ("kyu2", 3, None),
    ("map2", 4, "map"), ("normal2", 5, None), ("east2", 6, None), ("ghadi2", 6, "घड़ी"), ("nov3", 7, None),
    ("raat3", 7, "रात"), ("ulta3", 8, None), ("alberta4", 9, None), ("calgary4", 9, "Calgary"), ("destin4", 9, "Destin"),
    ("doori4", 10, None), ("km4", 10, "3,000"), ("deg4", 11, "28"), ("same4", 12, None), ("ulta5", 13, None),
    ("vancouver5", 14, None), ("seattle5", 14, "Seattle"), ("lon5", 14, "longitude"), ("kam5", 15, None),
    ("clocks5", 16, None), ("ghante5", 16, "घंटे"), ("train6", 17, None), ("four6", 17, "4"), ("ghadi6", 18, None),
    ("go6", 19, "जाना"), ("back6", 19, "आना"), ("aise7", 20, None), ("kaise7", 21, None), ("bc8", 22, None),
    ("alberta8", 23, None), ("manitoba8", 23, "Manitoba"), ("nwt8", 23, "Northwest"), ("chhod8", 24, None),
    ("sask8", 25, None), ("yukon8", 25, "Yukon"), ("baaki9", 26, None), ("peeche9", 26, "पीछे"), ("ruke9", 27, None),
    ("khisak9", 28, None), ("march10", 29, None), ("seedha10", 30, None), ("tabtak10", 31, None),
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
        j = next(k for k, x in enumerate(ws) if x[1].strip(",।?") == word.strip(",।?"))
        ws[j][0] = t
        # keep the phrase monotonic: squeeze neighbours that the pin overtook
        for k in range(j + 1, len(ws)):
            ws[k][0] = max(ws[k][0], round(ws[k - 1][0] + 0.12, 2))
        for k in range(j - 1, -1, -1):
            ws[k][0] = min(ws[k][0], round(ws[k + 1][0] - 0.12, 2))
    cues = {}
    for name, i, word in CUES:
        if word is None:
            cues[name] = PHRASES[i][1]
        else:
            cues[name] = next(x[0] for x in lines[i] if x[1].strip(",।?") == word.strip(",।?"))
    for i, (_, _, t1) in enumerate(PHRASES):
        cues[f"end{i}"] = t1
    caps = [x for ws in lines for x in ws]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(OUT, len(caps), "words,", len(cues), "cues")


if __name__ == "__main__":
    main()
