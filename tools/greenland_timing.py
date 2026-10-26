"""Beat timing for the Greenland and Iceland video.

    python3 tools/greenland_timing.py        # reads public/greenland/vo_words.json (faster-whisper, [s, e, word])

Cues are anchored to Whisper's words by index (the VO is the source of truth); captions use the script's own spelling
(script_hindi.txt), aligned to Whisper's words with difflib, 1–4 words per chunk, split at punctuation.
The video is a seamless loop: the duration ends right after the last word ("इसीलिए तो…").
Writes src/greenland/edit/timing.json.
"""
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.load(open(ROOT / "public" / "greenland" / "vo_words.json", encoding="utf-8"))
SCRIPT = (ROOT / "public" / "greenland" / "script_hindi.txt").read_text(encoding="utf-8")

# cue name -> Whisper word index (see the index dump in the commit that added this file)
CUES = {
    "zameen1": 1, "n80_1": 2, "barf1": 4, "naam1": 10, "green1": 12,
    "hari2": 15, "garam2": 17, "jharno2": 20, "naam2": 26, "ice2": 28,
    "ulta3": 29, "kyun3": 30, "galti3": 33, "vikings3": 35, "hazar3": 37, "chaal3": 40,
    "sadi4": 42, "norway4": 45, "floki4": 49, "map4": 51, "teen4": 53, "kauvon4": 54, "samundar4": 57, "kauva4": 60, "udta4": 62,
    "wapas4": 64, "jahaz4": 67, "aise4": 71, "zameen4": 76, "pahuncha4": 78,
    "sardi5": 82, "janwar5": 86, "mar5": 87, "vasant5": 89, "pahad5": 93, "neeche5": 96, "khadi5": 100, "barf5": 101, "bas5": 106, "ice5": 110,
    "ab6": 111, "green6": 114, "sau6": 116, "erik6": 119, "jaan6": 123, "saza6": 128, "teen6": 130, "ice6": 134, "nikal6": 136,
    "paschim7": 140, "mila7": 146, "duniya7": 147, "bada7": 150, "island7": 151, "poora7": 153, "barf7": 154,
    "socho8": 159, "safed8": 161, "kaun8": 166, "erik8": 168, "green8": 172, "hari8": 174, "achha8": 178, "log8": 181, "khinche8": 183,
    "chaal9": 187, "n25_9": 192, "jahaz9": 193, "green9": 197, "nikal9": 200,
    "matlab10": 202, "hazar10": 203, "click10": 206, "duniya10": 209, "naam10": 214, "isiliye10": 218, "to10": 220,
}
# the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"greenland": "ग्रीन्लांड", "iceland": "आइस्लांड", "vikings": "वाईकिंग्स", "viking": "वाईकिंग", "norway": "नौर्वे", "flóki": "फ्लोकी", "map": "मैप",
         "erik": "एरिक", "the": "दे", "red": "रेड", "island": "आइलंड", "clickbait": "क्लिक", "80": "अस्सी", "1000": "हजार", "100": "100", "25": "25",
         "3": "तीन", "9वीं": "नौवी", "क्यों?": "क्यूं", "हरी-भरी": "हरी", "झरनों": "ज़र्नो", "बुलाती": "बॉलाती", "पश्चिम": "पष्छिम"}


def norm(w: str) -> str:
    w = re.sub(r"[.…।!?,:\-]", "", w.lower())
    w = ALIAS.get(w, w)
    return re.sub(r"[़ँं.…।!?,:\-]", "", w)


def main() -> None:
    dur = round(W[-1][1] + 0.38, 2)
    sw = SCRIPT.split()
    a = [norm(x) for x in sw]
    b = [norm(x[2]) for x in W]
    t0s: list[float | None] = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t0s[blk.a + k] = W[blk.b + k][0]
    # unmatched script words: spread between their matched neighbours
    known = [i for i, v in enumerate(t0s) if v is not None]
    for i in range(len(sw)):
        if t0s[i] is None:
            lo = max([k for k in known if k < i], default=None)
            hi = min([k for k in known if k > i], default=None)
            tl = t0s[lo] if lo is not None else 0.0
            th = t0s[hi] if hi is not None else dur - 0.4
            n0 = lo if lo is not None else -1
            n1 = hi if hi is not None else len(sw)
            t0s[i] = tl + (th - tl) * (i - n0) / (n1 - n0)
    caps, cur, start = [], [], 0.0
    for i, w in enumerate(sw):
        if not cur:
            start = t0s[i]
        cur.append(w)
        if len(cur) >= 4 or re.search(r"[,।?…!]$", w) or (len(cur) >= 3 and i + 1 < len(sw) and sw[i + 1] in ("Erik",)):
            caps.append([round(start, 3), " ".join(cur)])
            cur = []
    if cur:
        caps.append([round(start, 3), " ".join(cur)])
    out = {"duration": dur, "cues": {k: round(W[i][0], 3) for k, i in CUES.items()}, "caps": caps,
           "matched": f"{len(known)}/{len(sw)}"}
    p = ROOT / "src" / "greenland" / "edit" / "timing.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["duration"], out["matched"], len(caps))
    for c in caps:
        print(c)


if __name__ == "__main__":
    main()
