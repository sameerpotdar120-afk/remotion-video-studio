"""Word timing for the Tamil Nadu letters Short: faster-whisper words on vo_115.wav, spellings corrected to the script.

    python3 -I tools/tamilnadu/timing.py <words.json>   # -> src/tamilnadu/timing.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIX = {0: "Google", 1: "Map", 6: "University", 8: "ऊपर", 15: "पाँच", 16: "Buildings", 21: "राज्य", 22: "का नाम", 24: "हुआ",
       26: "ये", 28: "तंजावुर", 30: "Tamil", 31: "University", 33: "campus", 34: "क़रीब", 35: "900", 36: "एकड़ का", 37: "तमिलनाडु",
       41: "University", 42: "campus", 46: "मुख्यमंत्री", 47: "एम. जी.", 48: "रामचंद्रन", 49: "यानी", 52: "ने", 53: "इसे",
       54: "शुरू किया", 65: "पाँच", 161: "अक्षर", 158: "इनमें", 58: "कि", 59: "यहाँ", 61: "पाँच", 66: "अक्षरों", 68: "आकार", 70: "बनें", 81: "Library", 83: "MGR",
       88: "चले", 89: "गए", 90: "उन्होंने", 93: "काग़ज़", 96: "था", 97: "ज़मीन", 101: "अक्षर", 102: "बनता", 108: "दो", 111: "पहली",
       112: "building", 114: "ऴ वाली", 116: "मि", 118: "डु", 120: "आख़िरी", 126: "हुईं", 127: "यानी", 128: "क़रीब", 134: "सिर्फ़",
       135: "दिखावे", 142: "भाषा", 143: "विभाग", 148: "विज्ञान", 155: "बढ़ाने", 156: "वाला विभाग", 162: "ऐसा", 165: "आवाज़",
       173: "ऴ", 174: "जीभ", 177: "मोड़कर", 181: "न", 182: "र", 183: "जैसा", 185: "ल", 186: "जैसा", 188: "ऴ", 189: "से",
       195: "असली", 197: "तमिऴ", 202: "Satellite", 203: "Map", 206: "तंजावुर", 207: "ज़रूर"}
MERGE = {(12, 14): "तुम्हें", (43, 45): "1981 में", (50, 51): "MGR", (73, 74): "लिखें", (75, 76): "तमिलनाडु", (84, 86): "1987"}
END = {25, 33, 36, 42, 54, 70, 76, 81, 89, 96, 104, 118, 126, 131, 139, 145, 148, 156, 170, 173, 180, 186, 197, 208}  # sentence ends


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
    (ROOT / "src" / "tamilnadu" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(len(words), "words,", len(caps), "caption chunks")
    print(" | ".join(" ".join(words[k][2] for k in c) for c in caps))


if __name__ == "__main__":
    main()
