"""Beat timing for the Madeira video.

    python3 tools/madeira_timing.py        # reads public/madeira/vo_words.json (faster-whisper, [s, e, word])

Cues are anchored to Whisper's words by index (the VO is the source of truth); captions use the script's own spelling
(script_hindi.txt), aligned to Whisper's words with difflib, 1–4 words per chunk, split at punctuation.
The video is a seamless loop: the duration ends right after the last word ("इसीलिए तो…").
Writes src/madeira/edit/timing.json.
"""
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.load(open(ROOT / "public" / "madeira" / "vo_words.json", encoding="utf-8"))
SCRIPT = (ROOT / "public" / "madeira" / "script_hindi.txt").read_text(encoding="utf-8")

# cue name -> Whisper word index (see the index dump in the commit that added this file)
CUES = {
    "ronaldo1": 0, "island1": 10, "saal1": 17, "jalta1": 19,
    "kyun2": 22, "portugal2": 25, "sailors2": 27, "kali2": 36, "jungle2": 42, "kadam2": 45, "naam2": 54, "madeira2": 58, "lakdi2": 60,
    "deewar3": 64, "andar3": 67, "aag3": 79,
    "kahani4": 82, "bhayanak4": 87, "samundar4": 96, "do4": 103, "boats4": 107, "legend4": 112, "saat4": 117, "bujhi4": 120,
    "raakh5": 125, "mitti5": 130, "europe5": 138, "cheeni5": 141, "safed5": 147,
    "duniya6": 150, "sugar6": 154, "ganna6": 167, "brazil6": 168, "dhandha6": 176, "doob6": 184,
    "haar7": 191, "pahad7": 195, "nahre7": 202, "levadas7": 204, "n2000_7": 207, "mumbai7": 216, "kolkata7": 218,
    "angoor8": 227, "wine8": 230, "mashhoor8": 237,
    "jala9": 241, "paradise9": 247, "laakhon9": 252, "nahron9": 255,
    "n1985_10": 262, "funchal10": 269, "mali10": 272, "ladka10": 276, "ronaldo10": 279, "airport10": 284,
    "socho11": 291, "lakdi11": 297, "chehra11": 307, "isiliye11": 310,
}
# the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"madeira": "ग्रीन्लांड", "iceland": "आइस्लांड", "vikings": "वाईकिंग्स", "viking": "वाईकिंग", "norway": "नौर्वे", "flóki": "फ्लोकी", "map": "मैप",
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
        if len(cur) >= 4 or re.search(r"[,।?…!]$", w) or (len(cur) >= 3 and i + 1 < len(sw) and sw[i + 1] in ("Cristiano",)):
            caps.append([round(start, 3), " ".join(cur)])
            cur = []
    if cur:
        caps.append([round(start, 3), " ".join(cur)])
    out = {"duration": dur, "cues": {k: round(W[i][0], 3) for k, i in CUES.items()}, "caps": caps,
           "matched": f"{len(known)}/{len(sw)}"}
    p = ROOT / "src" / "madeira" / "edit" / "timing.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["duration"], out["matched"], len(caps))
    for c in caps:
        print(c)


if __name__ == "__main__":
    main()
