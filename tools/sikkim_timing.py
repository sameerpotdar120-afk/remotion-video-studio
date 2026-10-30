"""Beat timing for the Sikkim video.

    python3 tools/sikkim_timing.py        # reads public/sikkim/vo_words.json (faster-whisper, [s, e, word])

The creator's script (script_hindi.txt) is aligned to Whisper's words with difflib (the VO is the source of truth;
words Whisper missed are spread between their matched neighbours). Cues name a script word by its text and which
occurrence it is, so they follow the script, not Whisper's spelling. Captions use the script's spelling, 1–4 words a
chunk, split at punctuation. The video is a seamless loop: the duration ends right after "इसीलिए तो…".
Writes src/sikkim/edit/timing.json.
"""
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.load(open(ROOT / "public" / "sikkim" / "vo_words.json", encoding="utf-8"))
SCRIPT = (ROOT / "public" / "sikkim" / "script_hindi.txt").read_text(encoding="utf-8")

# cue name -> (script word, occurrence from 1)
CUES = {
    "bharat1": ("भारत", 1), "n7000": ("7,000", 1), "station1": ("स्टेशन", 1), "par1": ("पर", 1), "rajya1": ("राज्य", 1), "aaj1": ("आज", 1),
    "train1": ("ट्रेन", 1), "sikkim1": ("सिक्किम।", 1),
    "kyon2": ("क्यों?", 1), "koshish2": ("कोशिश", 1),
    "aaj3": ("आज", 2), "bangal3": ("बंगाल", 1), "siliguri3": ("सिलीगुड़ी", 1), "njp3": ("जलपाईगुड़ी", 1), "utarna3": ("उतरना", 1), "sadak3": ("सड़क", 1),
    "asli4": ("असली", 1), "himalaya4": ("हिमालय।", 1),
    "train5": ("ट्रेन", 3), "chadhai5": ("चढ़ाई", 1), "mod5": ("मोड़।", 1), "lekin5": ("लेकिन", 1), "zameen5": ("ज़मीन", 1), "ghati5": ("घाटियाँ", 1),
    "isliye6": ("इसलिए", 1), "upar6": ("ऊपर", 2), "andar6": ("अंदर", 1),
    "sevoke7": ("सेवोक", 1), "km45": ("45", 1), "p86": ("86", 1), "km38": ("38", 1), "surang7": ("सुरंगों", 1),
    "t14": ("14", 1), "b22": ("22", 1), "s5": ("5", 1), "longest8": ("लंबी", 1), "km53": ("5.3", 1),
    "mushkil9": ("मुश्किल", 1), "baarish9": ("बारिश", 1), "khisak9": ("खिसकते", 1), "pichhle9": ("पिछले", 1), "tunnel7": ("7", 1), "deewar9": ("दीवार", 1), "landslide9": ("landslide", 1),
    "upar10": ("ऊपर", 3), "bhukamp10": ("भूकंप", 1), "zone10": ("ज़ोन", 1), "risk10": ("high-risk", 1),
    "yani11": ("यानी", 2), "galti11": ("ग़लती", 1), "bhaari11": ("भारी", 1),
    "phir12": ("फिर", 1), "p85": ("85", 1), "plan12": ("प्लान", 1), "dec12": ("दिसंबर", 1), "rangpo12": ("रंगपो", 2), "pehla12": ("पहला", 1),
    "har13": ("हर", 1), "himalaya13": ("हिमालय", 1), "isiliye13": ("इसीलिए", 1),
}
# the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"7,000": "7", "क्यों?": "क्यू", "सिलीगुड़ी": "सिली", "जलपाईगुड़ी": "जल्पाई", "हिमालय।": "हिमाल", "सेवोक": "सेवोक", "रंगपो": "रंग्पो",
         "landslide": "लैंट्सलाइड", "high-risk": "हाई", "85": "पचासी", "2027": "दोहाजार", "इसीलिए": "इसी", "ज़ोन": "जोन"}

# words Whisper heard differently enough that the alignment interpolated them (checked against vo_words.json)
FIX: dict[str, float] = {"n7000": 0.76, "kyon2": 9.66, "km53": 56.34, "upar6": 37.18, "dec12": 89.62, "y2027": 90.28, "yani11": 76.3, "risk10": 74.92}


def norm(w: str) -> str:
    w = re.sub(r"[.…।!?,:\-]", "", w.lower())
    w = ALIAS.get(w, w)
    return re.sub(r"[़ँं.…।!?,:\-ा]", "", w)


def main() -> None:
    dur = round(W[-1][1] + 0.38, 2)
    sw = SCRIPT.split()
    a = [norm(x) for x in sw]
    b = [norm(x[2]) for x in W]
    t0s: list[float | None] = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t0s[blk.a + k] = W[blk.b + k][0]
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
    cues = {}
    for name, (word, occ) in CUES.items():
        hits = [i for i, w in enumerate(sw) if w == word]
        if len(hits) < occ:
            raise SystemExit(f"cue {name}: '{word}' #{occ} not in the script")
        cues[name] = round(t0s[hits[occ - 1]], 3)
    cues.update(FIX)
    caps, cur, start = [], [], 0.0
    for i, w in enumerate(sw):
        if not cur:
            start = t0s[i]
        cur.append(w)
        if len(cur) >= 4 or re.search(r"[,।?…!]$", w):
            caps.append([round(start, 3), " ".join(cur)])
            cur = []
    if cur:
        caps.append([round(start, 3), " ".join(cur)])
    out = {"duration": dur, "cues": cues, "caps": caps, "matched": f"{len(known)}/{len(sw)}"}
    p = ROOT / "src" / "sikkim" / "edit" / "timing.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["duration"], out["matched"], len(caps))
    order = sorted(cues.items(), key=lambda kv: kv[1])
    print(" ".join(f"{k}={v}" for k, v in order))


if __name__ == "__main__":
    main()
