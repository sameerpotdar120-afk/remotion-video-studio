"""Word timing for the Brands Short: faster-whisper words on vo_115.wav, spellings corrected to the script.

    python3 -I tools/brands/timing.py <words.json>   # -> src/brands/timing.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIX = {2: "Bata", 6: "Indian", 8: "Czech", 9: "Republic", 15: "तुम्हारा", 17: "Monte", 18: "Carlo", 19: "sweater", 23: "लुधियाना",
       29: "Czech", 31: "Zlín", 36: "Bata", 40: "भारत आई", 49: "parent", 50: "कंपनी", 56: "Maggi", 57: "स्विट्ज़रलैंड", 60: "Colgate",
       61: "अमेरिका", 66: "ब्रिटेन", 74: "brands", 77: "बिल्कुल", 79: "लगते", 81: "असल", 83: "देसी", 86: "Louis", 87: "Philippe", 90: "फ़्रांस",
       102: "हुआ", 103: "Monte", 104: "Carlo", 106: "Monaco", 111: "लुधियाना", 113: "Oswal", 114: "Woollen", 115: "Mills",
       117: "brand", 119: "Red", 120: "Tape", 121: "सुनने", 123: "British", 124: "लगता", 128: "जड़ें", 129: "कानपुर", 133: "Lakmé",
       136: "French", 137: "opera", 149: "Tata ने", 150: "खड़ा", 154: "अगली", 156: "सिर्फ़", 158: "देख", 160: "मत", 161: "सोचना",
       162: "कि", 163: "चीज़", 171: "ज़रूर", 174: "Louis", 175: "Philippe", 180: "French", 181: "समझता"}
MERGE = {(11, 12): "आई", (26, 27): "1894", (37, 38): "1930s", (64, 65): "Lifebuoy", (144, 146): "1952"}
END = {13, 25, 53, 59, 67, 72, 85, 95, 102, 108, 118, 125, 131, 141, 152, 165, 182}  # sentence ends (by whisper index)


def main() -> None:
    W = json.loads(Path(sys.argv[1]).read_text())
    skip, words = set(), []
    for i, (s, e, w) in enumerate(W):
        if i in skip:
            continue
        m = next(((a, b) for (a, b) in MERGE if a == i), None)
        if m:
            words.append([s, W[m[1]][1], MERGE[m], m[1] in END or i in END])
            skip.update(range(m[0] + 1, m[1] + 1))
            continue
        words.append([s, e, FIX.get(i, w), i in END])
    caps, cur = [], []
    for k, w in enumerate(words):
        cur.append(k)
        nxt = words[k + 1] if k + 1 < len(words) else None
        if (len(cur) >= 3 and not (nxt is not None and nxt[3])) or len(cur) == 4 or w[3] or nxt is None or nxt[0] - w[1] > 0.3:
            caps.append(cur)
            cur = []
    out = {"words": [[round(s, 2), round(e, 2), w] for s, e, w, _ in words], "caps": caps}
    (ROOT / "src" / "brands" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(len(words), "words,", len(caps), "caption chunks")
    print(" | ".join(" ".join(words[k][2] for k in c) for c in caps))


if __name__ == "__main__":
    main()
