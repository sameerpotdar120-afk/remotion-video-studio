"""Cues and captions for the Ram Setu video, from the creator's VO (public/ramsetu/audio/vo.mp3, 148.3 s).

    python3 -I tools/ramsetu_timing.py <whisper_words.json>

faster-whisper "medium" word times (Hindi), aligned word by word onto the script's own spelling (dynamic programming on
string similarity); 122.5-136 s re-transcribed on its own (whisper skipped it in the full pass). Numbers are shown as
digits in the captions. The loop: the VO ends on "कहते हैं, कभी…" at 148.2 s and the video is 148.8 s, so it runs into
"तुम राम सेतु पर चलकर…" at frame 0.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "ramsetu" / "edit" / "timing.json"
DURATION = 148.8
SCRIPT = (ROOT / "public" / "ramsetu" / "script_elevenlabs.txt").read_text()
NUM = {"चौदह सौ अस्सी": "1480", "उन्नीस सौ चौंसठ": "1964", "दो हज़ार चौबीस": "2024", "अड़तालीस": "48", "उनतीस किलोमीटर": "29 km",
       "निन्यानवे दशमलव नौ आठ प्रतिशत": "99.98%", "आठ मीटर": "8 मीटर", "बाईस दिसंबर": "22 दिसंबर", "एक सौ पंद्रह": "115",
       "अठारह सौ": "1,800", "पाँच दिन": "5 दिन"}
CUES = {  # name: (the script word, its occurrence)
    "ram0": ("राम", 0), "n1480": ("1480", 0), "toofan": ("तूफ़ान", 0), "n1964": ("1964", 0), "kaise": ("कैसे?", 0),
    "ye": ("ये", 0), "dhanush1": ("धनुषकोडी।", 0), "matlab": ("मतलब,", 0), "nok": ("नोक", 0), "toda": ("तोड़ा", 0),
    "naam": ("नाम", 0), "yahin": ("यहीं", 1), "mannar": ("मन्नार", 0), "lakeer": ("लकीर", 0), "palk": ("पाक", 0),
    "mannar2": ("मन्नार", 1), "beech": ("बीच", 0), "ramsetu1": ("सेतु।", 2), "aastha": ("आस्था", 0), "vanar": ("वानर", 0),
    "valmiki": ("वाल्मीकि", 0), "nal": ("नल", 0), "vishwa": ("विश्वकर्मा", 0), "tairne": ("तैरने", 0), "ramnaam": ("नाम", 1),
    "n5din": ("5", 0), "sita": ("सीता", 0), "angrez": ("अंग्रेज़ों", 0), "adams": ("Adam's", 0), "hamare": ("हमारे", 0),
    "rahega": ("रहेगा।", 0), "n2024": ("2024", 0), "isro": ("ISRO", 0), "laser": ("laser", 0), "lambai": ("लंबाई?", 0),
    "n48": ("48", 0), "n29": ("29", 0), "n9998": ("99.98%", 0), "n8m": ("8", 0), "choona": ("चूना-पत्थर", 0),
    "isro2": ("ISRO", 1), "vigyan": ("विज्ञान", 0), "gehrai": ("गहराई", 0), "aastha2": ("आस्था", 1), "jo": ("जो", 0),
    "tika": ("टिका", 0), "par2": ("पर", 4), "n22": ("22", 0), "chakravat": ("चक्रवात", 0), "n115": ("115", 0),
    "train": ("train", 0), "pamban": ("पंबन", 0), "n1800": ("1,800", 0), "sarkar": ("सरकार", 0), "aaj": ("आज", 0),
    "church": ("church,", 0), "station": ("station,", 0), "machhuare": ("मछुआरे", 0), "mita": ("मिटा", 0),
    "setu_last": ("सेतु", 4), "usi": ("उसी", 0), "n29b": ("29", 1), "kabhi": ("कभी…", 0),
}


LATIN = {"isro": "इस्रो", "nasa": "नासा", "satellite": "साटिलाइप", "laser": "लेजर", "train": "ट्रेन", "church": "चर्च",
         "station": "स्टेशन", "adams": "आडम्स", "bridge": "ब्रिज", "km": "किलोमेटर"}


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
        idx = [k for k, x in enumerate(words) if x == w or x.rstrip("।,?.") == w.rstrip("।,?.")]
        cues[name] = times[idx[occ]]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(len(caps), "words", json.dumps(cues, ensure_ascii=False))


if __name__ == "__main__":
    main()
