"""Cues and captions for the Pangea video, from the creator's VO (public/pangea/audio/vo.mp3, 88.7 s).

    python3 -I tools/pangea_timing.py <whisper_words.json>

faster-whisper "medium" word times (Hindi), aligned word by word onto the script's own spelling (dynamic programming on
string similarity). Whisper missed "टेथिस"; it sits in the gap at 34.9 s (silencedetect). The loop: the VO ends on
"क्योंकि…" at 88.6 s and the video is 89.2 s, so it runs into "तुम्हें महसूस नहीं होता" at frame 0.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "pangea" / "edit" / "timing.json"
DURATION = 89.2
SCRIPT = (ROOT / "public" / "pangea" / "script_elevenlabs_v2.txt").read_text()
NUM = {"पाँच": "5", "पच्चीस": "25", "तीस": "30", "पंद्रह": "15", "दो हज़ार तेईस": "2023", "चालीस": "40", "सत्तर": "70", "आठ": "8", "सोलह": "16"}
CUES = {  # name: (index of the script word, counted from 0) is resolved below by the word itself and its occurrence
    "par": ("पर", 0), "harsaal": ("हर", 0), "n5": ("5", 0), "khisak": ("खिसक", 0), "yahi": ("यही", 0), "mita1": ("मिटा", 0), "n25": ("25", 0), "mammals": ("mammals", 0), "kyu": ("क्यों?", 0), "karib30": ("करीब", 1), "n30": ("30", 0),
    "pangea": ("पैंजिया।", 0), "aur_bharat": ("भारत?", 1), "asia": ("Asia", 0), "africa": ("Africa,", 0), "antarc": ("Antarctica", 0),
    "austr": ("Australia", 0), "toota": ("टूटा,", 0), "bhagta": ("भागता", 0), "n15": ("15", 0), "beech": ("बीच", 0), "tethys": ("टेथिस।", 0),
    "karib5": ("करीब", 2), "n5cr": ("5", 1), "takraya": ("टकराया।", 0), "farsh": ("फ़र्श", 0), "bana": ("बना", 0), "himalaya": ("हिमालय।", 0),
    "everest": ("Everest", 0), "fossil": ("fossil", 0), "shaligram": ("शालिग्राम", 0), "ammonite": ("ammonite,", 0), "jaari": ("जारी", 0),
    "takkar2": ("टक्कर", 0), "model": ("model", 0), "atlantic": ("Atlantic", 0), "america": ("America", 0), "africa2": ("Africa", 1),
    "austr2": ("Australia", 1), "asia2": ("Asia", 2), "n25b": ("25", 1), "ultima": ("पैंजिया", 2), "n2023": ("2023", 0), "n40": ("40", 0),
    "n70": ("70", 0), "mammals2": ("mammals", 1), "n8": ("8", 0), "n16": ("16", 0), "yani": ("यानी", 0), "himalaya2": ("हिमालय", 1),
    "mita": ("मिटा", 1), "safar": ("सफ़र", 1), "kyunki": ("क्योंकि...", 0),
}


LATIN = {"asia": "एशिया", "africa": "अफ्रिका", "antarctica": "अंटार्कटिका", "australia": "ऑस्ट्रेलिया", "mammals": "मैमल्स",
         "everest": "एवरेस्ट", "fossil": "फॉसल", "ammonite": "एमॉनिट", "model": "मॉडल", "atlantic": "अटलान्टिक", "america": "अमेरिका",
         "supercontinent": "सुपरकॉंटिनेट", "study": "स्टडी"}


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
    for k, w in enumerate(words):
        if w.startswith("टेथिस"):
            times[k] = 34.9
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
        idx = [k for k, x in enumerate(words) if x == w or x.rstrip("।,?.") == w.rstrip("।,?.")]
        cues[name] = times[idx[occ]]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(len(caps), "words", json.dumps(cues, ensure_ascii=False))


if __name__ == "__main__":
    main()
