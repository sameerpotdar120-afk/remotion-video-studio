"""Cues and captions for the Baikonur video, from the creator's VO (public/baikonur/audio/vo.mp3).

    python3 -I tools/baikonur_timing.py <whisper_words.json>

vo.mp3 = vo_raw.mp3 (75.15 s) sped up 1.15x as the creator asked (65.40 s). faster-whisper "medium" word times, aligned
onto the script's own spelling (dynamic programming on string similarity). Numbers are shown as digits in the
captions. The loop: the VO ends on "तो बस इतना कहना…"; the video runs into "राकेश शर्मा जिस जगह से…" at frame 0 (the hook
answers the last question).
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "baikonur" / "edit" / "timing.json"
DURATION = 65.8
SCRIPT = (ROOT / "public" / "baikonur" / "script_elevenlabs.txt").read_text()
NUM = {"एक सौ पंद्रह": "115", "उन्नीस सौ पचपन": "1955", "उन्नीस सौ सत्तावन": "1957", "उन्नीस सौ इकसठ": "1961",
       "उन्नीस सौ चौरासी": "1984", "उन्नीस सौ इक्यानवे": "1991", "दो हज़ार पचास": "2050"}
CUES = {  # name: (the script word, its occurrence)
    "rakesh1": ("राकेश", 0), "antriksh": ("अंतरिक्ष", 0), "kiraya1": ("किराया", 0), "russia1": ("Russia", 0), "n115a": ("115", 0),
    "dollar1": ("डॉलर", 0), "kz1": ("कज़ाकिस्तान", 0), "registan": ("रेगिस्तान", 0), "ghera1": ("घेरा", 0), "bk1": ("बैकोनूर", 0),
    "pehla1": ("पहला", 0), "spaceport1": ("Spaceport", 0), "n1955": ("1955", 0), "soviet1": ("Soviet", 0), "kz2": ("कज़ाकिस्तान", 1),
    "ussr": ("USSR", 0), "yahin": ("यहीं", 0), "n1957": ("1957", 0), "sputnik": ("स्पुतनिक", 0), "n1961": ("1961", 0),
    "gagarin": ("गगारिन", 0), "n1984": ("1984", 0), "bharat1": ("भारत", 0), "rakesh2": ("राकेश", 1), "n1991": ("1991", 0),
    "toot": ("टूट", 0), "raaton": ("रातों-रात", 0), "desh": ("देश", 0), "russia2": ("Russia", 1), "kiraye": ("किराए", 0),
    "n115b": ("115", 1), "n2050": ("2050", 0), "ghere2": ("घेरे", 0), "kanoon": ("क़ानून", 0), "rouble": ("रूबल", 0),
    "russia5": ("Russia", 4), "kyun1": ("क्यों", 0), "kyunki": ("क्योंकि", 0), "south": ("South", 0), "equator": ("Equator", 0),
    "dharti": ("धरती", 0), "dhakka": ("धक्का", 0), "orbit": ("Orbit", 0), "fuel": ("Fuel", 0), "pooche": ("पूछे", 0), "kehna": ("कहना", 0),
}
FIX: dict = {}

LATIN = {"russia": "रशा", "cosmodrome": "कॉस्मोड्रोम", "spaceport": "स्पेसपोर्ट", "soviet": "सोवियत", "union": "यूनियन", "ussr": "यूएसएसआर",
         "satellite": "सैटेलाइट", "launch": "लॉंच", "sites": "साइट्स", "south": "साउथ", "equator": "इक्वेटर", "orbit": "ऑर्बिट", "fuel": "फ्यूल"}


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
