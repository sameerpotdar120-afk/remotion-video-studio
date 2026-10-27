"""Beat timing for the Garbage Patch video.

    python3 tools/garbagepatch_timing.py        # reads public/garbagepatch/vo_words.json (faster-whisper, [s, e, word])

The creator's script (script_hindi.txt) is aligned to Whisper's words with difflib (the VO is the source of truth;
words Whisper missed are spread between their matched neighbours). Cues name a script word by its text and which
occurrence it is, so they follow the script, not Whisper's spelling. Captions use the script's spelling, 1–4 words a
chunk, split at punctuation. The video is a seamless loop: the duration ends right after "इसीलिए तो…".
Writes src/garbagepatch/edit/timing.json.
"""
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.load(open(ROOT / "public" / "garbagepatch" / "vo_words.json", encoding="utf-8"))
SCRIPT = (ROOT / "public" / "garbagepatch" / "script_hindi.txt").read_text(encoding="utf-8")

# cue name -> (script word, occurrence from 1)
CUES = {
    "pacific1": ("Pacific", 1), "bharat1": ("भारत", 1), "island1": ("island", 1), "nakshe1": ("नक्शे", 1), "milega1": ("मिलेगा।", 1),
    "kyun2": ("क्यों?", 1), "koi2": ("कोई", 1), "poora2": ("पूरा", 1), "kachre2": ("कचरे", 1),
    "kehte3": ("कहते", 1), "great3": ("Great", 1), "california3": ("California", 1), "hawaii3": ("Hawaii", 1), "beech3": ("बीच", 1),
    "size4": ("size", 1), "lakh4": ("16", 1), "km4": ("square", 1), "matlab4": ("मतलब", 1), "aadha4": ("आधा।", 1),
    "akela5": ("अकेला", 1), "duniya5": ("दुनिया", 1), "paanch5": ("5", 1), "bhanwar5": ("भँवर", 1), "sabse5": ("सबसे", 1),
    "yahan6": ("यहाँ", 2), "ton6": ("टन", 1), "tair6": ("तैर", 1), "botal6": ("बोतलें,", 1), "dibbe6": ("डिब्बे,", 1), "zyada6": ("ज़्यादा,", 1),
    "machhli6": ("मछली", 1), "jaal6": ("जाल।", 1),
    "aata7": ("आता", 1), "nadiyon7": ("नदियों", 1), "jahazon7": ("जहाज़ों", 1), "kinare7": ("किनारे", 1), "shehron7": ("शहरों", 1),
    "dhoop8": ("धूप", 1), "lehrein8": ("लहरें", 1), "tod8": ("तोड़-तोड़कर", 1), "tukde8": ("टुकड़े", 1), "micro8": ("microplastic।", 1),
    "yahi9": ("यही", 1), "machhli9": ("मछलियों", 1), "thali9": ("थाली", 1), "pahunch9": ("पहुँच", 1),
    "chhote10": ("छोटे", 2), "satellite10": ("satellite", 1), "dekh10": ("देख", 1), "upar10": ("ऊपर", 1), "neela10": ("नीला", 1),
    "asal11": ("असल", 1), "zameen11": ("ज़मीन", 1), "paani11": ("पानी", 2), "soup11": ("soup", 1),
    "samundar12": ("समुंदर", 1), "bhanwar12": ("भँवर", 2), "kachra12": ("कचरा", 1), "patch12": ("patch", 1), "badhta12": ("बढ़ता", 1),
    "jo13": ("जो", 2), "thoda13": ("थोड़ा", 1), "baaki13": ("बाकी", 1), "tal13": ("तल", 1), "kinaron13": ("किनारों", 1),
    "mitti14": ("मिट्टी,", 1), "kinara14": ("किनारा,", 1), "pakki14": ("पक्की", 1), "isiliye14": ("इसीलिए", 1),
}
# the creator's spellings vs how Whisper may write them (alignment only)
ALIAS = {"pacific": "पैसिफिक", "ocean": "ओशन", "island": "आइलैंड", "great": "ग्रेट", "garbage": "गार्बेज", "patch": "पैच", "california": "कैलिफोर्निया",
         "hawaii": "हवाई", "size": "साइज", "16": "सोलह", "square": "स्क्वेयर", "kilometre": "किलोमीटर", "5": "पांच", "80000": "अस्सी", "plastic": "प्लास्टिक",
         "microplastic": "माइक्रोप्लास्टिक", "satellite": "सैटेलाइट", "soup": "सूप", "क्यों?": "क्यूं"}


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
    p = ROOT / "src" / "garbagepatch" / "edit" / "timing.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["duration"], out["matched"], len(caps))
    order = sorted(cues.items(), key=lambda kv: kv[1])
    print(" ".join(f"{k}={v}" for k, v in order))


if __name__ == "__main__":
    main()
