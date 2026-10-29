"""Beat timing for the Chandigarh video.

    python3 tools/chandigarh_timing.py        # reads public/chandigarh/vo_words.json (faster-whisper, [s, e, word])

The creator's script (script_hindi.txt) is aligned to Whisper's words with difflib (the VO is the source of truth;
words Whisper missed are spread between their matched neighbours). Cues name a script word by its text and which
occurrence it is, so they follow the script, not Whisper's spelling. Captions use the script's spelling, 1–4 words a
chunk, split at punctuation. The video is a seamless loop: the duration ends right after "इसीलिए तो…".
Writes src/chandigarh/edit/timing.json.
"""
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.load(open(ROOT / "public" / "chandigarh" / "vo_words.json", encoding="utf-8"))
SCRIPT = (ROOT / "public" / "chandigarh" / "script_hindi.txt").read_text(encoding="utf-8")

# cue name -> (script word, occurrence from 1)
CUES = {
    "bharat1": ("भारत", 1), "shahar1": ("शहर", 1), "computer1": ("computer", 1), "balki1": ("बल्कि", 1), "zinda1": ("ज़िंदा", 1), "design1": ("design", 1),
    "jee2": ("जी", 1), "sir2": ("सिर", 1), "dil2": ("दिल", 1), "saans2": ("साँस", 1), "phephde2": ("फेफड़े", 1), "nasen2": ("नसें", 1), "hum2": ("हम", 1), "chd2": ("Chandigarh", 1),
    "kahani3": ("कहानी", 1), "y1947": ("1947", 1), "bantwara3": ("बँटवारा", 1), "punjab3": ("Punjab", 1), "lahore3": ("Lahore,", 1), "pakistan3": ("Pakistan", 1),
    "azaad3": ("आज़ाद", 1), "chahiye3": ("चाहिए", 1), "nayi3": ("नई", 1),
    "zameen4": ("ज़मीन", 1), "shivalik4": ("Shivalik", 1), "neeche4": ("नीचे।", 1), "ittefaq4": ("इत्तेफ़ाक", 1), "dhalaan4": ("ढलान", 1), "baarish4": ("बारिश", 1),
    "mitti4": ("मिट्टी", 1), "paani4": ("पानी", 2), "paas4": ("पास", 1), "naam4": ("नाम", 1), "chd4": ("Chandigarh।", 1),
    "design5": ("Design", 1), "french5": ("French", 1), "corb5": ("Corbusier", 1), "unhone5": ("उन्होंने", 1), "lakeeren5": ("लकीरें", 1), "jism5": ("जिस्म", 1),
    "sabse6": ("सबसे", 1), "capitol6": ("Capitol", 1), "jahan6": ("जहाँ", 1), "vidhan6": ("विधानसभा,", 1), "secretariat6": ("Secretariat,", 1), "highcourt6": ("High", 1),
    "poora7": ("पूरा", 1), "sector7": ("sector", 1), "m800": ("800", 1), "m1200": ("1200", 1), "apne7": ("अपने", 1), "ghar7": ("घर,", 1), "school7": ("school,", 1),
    "hospital7": ("hospital,", 1), "sab7": ("सब", 1),
    "dil8": ("दिल", 2), "s17": ("17,", 1), "gaadiyan8": ("गाड़ियाँ", 1), "sirf8": ("सिर्फ़", 1), "paidal8": ("पैदल", 1), "ise8": ("इसे", 1), "paradise8": ("Paradise", 1),
    "nasen9": ("नसें", 2), "v1a": ("V1", 1), "saat9": ("सात", 1), "v1b": ("V1", 2), "duniya9": ("दुनिया", 1), "v7b": ("V7", 2), "paidal9": ("पैदल", 2),
    "phephde10": ("फेफड़े", 2), "leisure10": ("Leisure", 1), "saaf10": ("साफ़", 1),
    "imaraten11": ("इमारतें", 1), "mausam11": ("मौसम", 1), "secretariat11": ("Secretariat", 1), "jaali11": ("जालीदार", 1), "garmi11": ("गर्मी", 1), "thanda11": ("ठंडा", 1),
    "highcourt11": ("High", 2), "mudi11": ("मुड़ी", 1), "dhoop11": ("धूप", 1),
    "isi12": ("इसी", 1), "y2016": ("2016", 1), "unesco12": ("UNESCO", 1), "capitol12": ("Capitol", 2), "world12": ("World", 1), "ghoshit12": ("घोषित", 1),
    "corb13": ("Corbusier", 2), "nakshe13": ("नक्शे", 3), "zinda13": ("ज़िंदा", 2), "socha13": ("सोचा", 1), "isiliye13": ("इसीलिए", 1),
}
# the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"computer": "कम्प्यूटर", "design": "डिजाइन", "chandigarh": "चंडीगड़", "1947": "उन्निस्सो", "punjab": "पंजाब", "lahore": "लाहौर", "pakistan": "पाकिस्तान",
         "shivalik": "शिवालिक", "french": "फ्रेंज", "architect": "आखितेक्ट", "le": "ले", "corbusier": "कौर्बूजिये", "capitol": "कापिटल", "complex": "कौमप्लेक्स",
         "secretariat": "सच्यवाले", "high": "हाईकोट", "sectors": "सेक्टर्स", "sector": "सेक्टर", "school": "स्कूल", "hospital": "हौसपिटल", "17": "17",
         "pedestrians'": "पेड़ेस्ट्रियन्स", "paradise": "पाराडाइस", "v1": "वी", "v7": "वी", "leisure": "लीजर", "valley": "वैली", "unesco": "यूनेस्को",
         "world": "वौल्ड", "heritage": "हेरिटेज", "site": "साइड"}

# words Whisper heard differently enough that the alignment interpolated them (checked against vo_words.json)
FIX = {"design5": 49.74, "sabse6": 58.18, "m1200": 71.68}


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
    p = ROOT / "src" / "chandigarh" / "edit" / "timing.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["duration"], out["matched"], len(caps))
    order = sorted(cues.items(), key=lambda kv: kv[1])
    print(" ".join(f"{k}={v}" for k, v in order))


if __name__ == "__main__":
    main()
