"""Cues and captions for the Junagadh video, from the creator's VO (public/junagadh/audio/vo.mp3, 110.8 s).

    python3 -I tools/junagadh_timing.py <whisper_words.json>

faster-whisper "medium" word times (Hindi), aligned word by word onto the script's own spelling (dynamic programming on
string similarity). Numbers are shown as digits in the captions. The loop: the VO ends on "आज भी कहता है…" at 110.8 s and
the video is 111.2 s, so it runs into "1947 में Gujarat का एक हिस्सा…" at frame 0.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "junagadh" / "edit" / "timing.json"
DURATION = 111.2
SCRIPT = (ROOT / "public" / "junagadh" / "script_elevenlabs.txt").read_text()
NUM = {"उन्नीस सौ सैंतालीस": "1947", "अस्सी प्रतिशत": "80%", "पंद्रह सितंबर": "15 सितंबर", "नौ नवंबर": "9 नवंबर",
       "तेरह नवंबर": "13 नवंबर", "उन्नीस सौ इक्यावन": "1951", "उन्नीस सौ अड़तालीस": "1948",
       "एक लाख नब्बे हज़ार आठ सौ सत्तर": "1,90,870", "इक्यानवे": "91", "दो हज़ार बीस": "2020"}
CUES = {  # name: (the script word, its occurrence)
    "gujarat1": ("Gujarat", 0), "pak1": ("Pakistan", 0), "somnath1": ("सोमनाथ", 0), "map1": ("Map", 0), "kaise": ("कैसे", 0),
    "yehai": ("जूनागढ़", 0), "zila": ("ज़िला", 0), "n1947b": ("1947", 1), "princely": ("Princely", 0), "n80": ("80%", 0),
    "hindu": ("हिंदू", 0), "nawab1": ("नवाब", 0), "azadi": ("आज़ादी", 0), "bharat1": ("भारत", 0), "pakc": ("Pakistan", 2),
    "n15": ("15", 0), "chose": ("Pakistan", 3), "zameen": ("ज़मीन", 0), "nahi": ("नहीं", 0), "teen": ("तीन", 0),
    "samundar": ("समुंदर", 0), "sardar": ("सरदार", 0), "naka": ("नाकाबंदी", 0), "mumbai": ("Mumbai", 0), "sarkar": ("सरकार", 0),
    "arzi": ("आरज़ी", 0), "gaon": ("गाँव-गाँव", 0), "control": ("control", 0), "october": ("October", 0), "karachi": ("Karachi", 0),
    "bhaag": ("भाग", 0), "n9": ("9", 0), "diwan1": ("दीवान", 0), "haath": ("हाथ", 0), "diwan2": ("दीवान", 1),
    "shahnawaz": ("शाहनवाज़", 0), "pm": ("Prime", 0), "zulfi": ("ज़ुल्फ़िक़ार", 0), "pita": ("पिता", 0), "n13": ("13", 0),
    "somnath2": ("सोमनाथ", 1), "khandhar": ("खंडहर", 0), "faisla": ("फ़ैसला", 0), "n1951": ("1951", 0), "khula": ("खुला", 0),
    "feb": ("फ़रवरी", 0), "poocha": ("पूछा", 0), "bharat_q": ("भारत", 4), "votes": ("1,90,870", 0), "vote": ("vote", 0),
    "sirf": ("सिर्फ़", 0), "n91": ("91", 0), "n2020": ("2020", 0), "newmap": ("Map", 1), "dikhaya": ("दिखाया", 0),
    "yaani2": ("यानी", 1), "somnath3": ("सोमनाथ", 3), "darshan": ("दर्शन", 0), "passport": ("Passport", 0),
    "signature": ("Signature", 0), "kagaz": ("काग़ज़", 0), "pak_last": ("Pakistan", 9), "map_last": ("Map", 2),
}


# compound words whisper split in two: the cue (and the caption word) starts on the first half
FIX = {"naka": 43.14, "gaon": 48.68, "shahnawaz": 61.94, "votes": 85.46}

LATIN = {"gujarat": "गुज्रात", "pakistan": "पाकिस्थान", "map": "मैप", "princely": "प्रिंस्ली", "state": "स्टेट",
         "mumbai": "मुम्बैय", "control": "खुंट्रोल", "october": "अक्टूबर", "karachi": "कराजी", "prime": "प्राइम",
         "minister": "मिनिस्टर", "vote": "वोट", "passport": "पास्पॉर्ट", "signature": "सिग्नेचर"}


def norm(s: str) -> str:
    s = re.sub(r"[^\w]", "", s.lower())
    return LATIN.get(s, s)


def main() -> None:
    text = SCRIPT
    for k, v in NUM.items():
        text = text.replace(k, v)
    words = text.split()
    ww = json.load(open(sys.argv[1]))
    a, b = [norm(w) for w in words], [norm(w[2]) for w in ww]
    n, m = len(a), len(b)
    INF = 1e9
    D = [[INF] * (m + 1) for _ in range(n + 1)]
    D[0] = [j * 1.0 for j in range(m + 1)]
    for i in range(1, n + 1):
        D[i][0] = i * 1.0
        for j in range(1, m + 1):
            s = difflib.SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            D[i][j] = min(D[i - 1][j - 1] + (1 - s) * 2, D[i - 1][j] + 1, D[i][j - 1] + 1)
    i, j, match = n, m, {}
    while i > 0 and j > 0:
        s = difflib.SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
        if abs(D[i][j] - (D[i - 1][j - 1] + (1 - s) * 2)) < 1e-9:
            match[i - 1] = ww[j - 1][0]; i -= 1; j -= 1
        elif abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9:
            i -= 1
        else:
            j -= 1
    times = [match.get(k) for k in range(n)]
    for k in range(n):  # fill gaps by interpolation
        if times[k] is None:
            p = next((times[q] for q in range(k - 1, -1, -1) if times[q] is not None), 0.0)
            nx = next((times[q] for q in range(k + 1, n) if times[q] is not None), p + 0.5)
            times[k] = round(p + (nx - p) * 0.5, 2)
    for k in range(1, n):
        times[k] = max(times[k], round(times[k - 1] + 0.06, 2))
    caps = [[t, w] for t, w in zip(times, words)]
    cues = {"hook": 0.0}
    for name, (w, occ) in CUES.items():
        idx = [k for k, x in enumerate(words) if x.strip('"“”।,?.!…:') == w]
        if len(idx) <= occ:
            sys.exit(f"cue {name}: {w!r} occurs {len(idx)} times")
        if name in FIX:
            times[idx[occ]] = caps[idx[occ]][0] = FIX[name]
        cues[name] = times[idx[occ]]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(len(caps), "words", json.dumps(cues, ensure_ascii=False))


if __name__ == "__main__":
    main()
