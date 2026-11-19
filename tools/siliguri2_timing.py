"""Cues and captions for the Siliguri Corridor v2 video, from the creator's VO (public/siliguri2/audio/vo.mp3).

    python3 -I tools/siliguri2_timing.py <whisper_words.json>

vo.mp3 = vo_raw.mp3 (80.04 s) sped up 1.15x as the creator asked (69.65 s). faster-whisper "medium" word times, aligned
onto the script's own spelling (dynamic programming on string similarity). Numbers are shown as digits in the
captions. The loop: the VO ends on "तो बस इतना कहना…"; the video runs into "तुम दार्जिलिंग जाओ…" at frame 0 (the hook
answers the last question).
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "siliguri2" / "edit" / "timing.json"
DURATION = 70.0
SCRIPT = (ROOT / "public" / "siliguri2" / "script_elevenlabs.txt").read_text()
NUM = {"बाईस": "22", "आठ": "8", "साढ़े चार करोड़": "4.5 करोड़", "दो हज़ार सत्रह": "2017", "तिहत्तर": "73",
       "दो हज़ार पच्चीस": "2025", "S-Four Hundred": "S-400", "तीन": "3"}
CUES = {  # name: (the script word, its occurrence)
    "darj": ("दार्जिलिंग", 0), "guw": ("गुवाहाटी", 0), "n22": ("22", 0), "patti": ("पट्टी", 0), "upar1": ("ऊपर", 0),
    "baithi": ("बैठी", 0), "china1": ("China", 0), "army1": ("Army", 0), "sili": ("सिलीगुड़ी", 0), "corr1": ("Corridor", 0),
    "neck": ("Neck", 0), "ne1": ("Northeast", 0), "n8": ("8", 0), "crore": ("करोड़", 0), "log": ("लोग", 0), "jude": ("जुड़े", 0),
    "upar2": ("ऊपर", 1), "sikkim": ("सिक्किम", 0), "bhutan": ("भूटान", 0), "chumbi": ("चुम्बी", 0), "n2017": ("2017", 0),
    "doklam": ("डोकलाम", 0), "sadak1": ("सड़क", 0), "pahadi": ("पहाड़ी", 0), "corr2": ("Corridor", 1), "army2": ("Army", 1),
    "n73": ("73", 0), "sadak2": ("सड़क", 1), "ruk": ("रुक", 0), "neeche": ("नीचे", 0), "border": ("Border", 0),
    "bang1": ("बांग्लादेश", 0), "lalmo": ("लालमनिरहाट", 0), "ww": ("World", 0), "airbase": ("Airbase", 0), "n2025": ("2025", 0),
    "jagane": ("जगाने", 0), "dhaka": ("ढाका", 0), "group": ("Group", 0), "greater": ("Greater", 0), "map1": ("Map", 0),
    "ne2": ("Northeast", 1), "map2": ("Map", 1), "parl": ("Parliament", 0), "gardan": ("गर्दन", 0), "kila": ("किला", 0),
    "hasimara": ("हासीमारा", 0), "rafale": ("Rafale", 0), "reports": ("Reports", 0), "s400": ("S-400", 0), "garrison": ("Garrison", 0),
    "bamuni": ("बामुनी", 0), "kishan": ("किशनगंज", 0), "chopra": ("चोपड़ा", 0), "pooche": ("पूछे", 0), "patli2": ("पतली", 1),
    "taiyari": ("तैयारी", 0), "kehna": ("कहना", 0),
}
FIX: dict = {"n2025": 40.52, "hasimara": 55.42}

LATIN = {"china": "चाइना", "army": "आर्मी", "corridor": "कौरिडोर", "chickens": "चिकन्सनेक", "neck": "नेक", "northeast": "नौर्थीस्ट",
         "valley": "वाली", "border": "बॉर्डर", "world": "वॉर्ड", "war": "वार", "airbase": "एरबेस", "group": "ग्रूप", "greater": "ग्रेटर",
         "bangladesh": "बांगलादेश", "map": "मैप", "parliament": "पार्लियामेंट", "rafale": "राफेल", "fighter": "फाइटर", "jets": "जेट्स",
         "reports": "रिपोर्ट्स", "s400": "एस", "air": "एर", "defence": "डिफेंस", "garrison": "गैरिसन"}


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
