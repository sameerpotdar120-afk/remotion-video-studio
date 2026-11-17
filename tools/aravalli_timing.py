"""Cues and captions for the Aravalli video, from the creator's VO at 1.15x (public/aravalli/audio/vo.mp3, 69.3 s;
vo_raw.mp3 is the original, 79.6 s; the creator asked for the speed-up).

    python3 -I tools/aravalli_timing.py <whisper_words.json>

faster-whisper "medium" word times (Hindi), aligned word by word onto the script's own spelling (dynamic programming on
string similarity); 43.3-47.8 s and 62.9-69.3 s re-transcribed on their own (whisper skipped them in the full pass).
Numbers are shown as digits in the captions. The loop: the VO ends on "तो याद रखना…" at 69.1 s and the video is 69.6 s,
so it runs into "राष्ट्रपति भवन एक पहाड़ पर खड़ा है…" at frame 0.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "aravalli" / "edit" / "timing.json"
DURATION = 69.6
SCRIPT = (ROOT / "public" / "aravalli" / "script_elevenlabs.txt").read_text()
NUM = {"दो हज़ार अठारह": "2018", "दो हज़ार पच्चीस": "2025", "बारह हज़ार": "12,000", "एक हज़ार": "1,000", "सात सौ": "700",
       "दो अरब": "2 अरब", "पाँच करोड़": "5 करोड़", "एक सौ अट्ठाईस": "128", "इकतीस": "31", "पचास": "50", "बारह": "12",
       "सौ मीटर": "100 मीटर", "बीस": "20"}
CUES = {  # name: (the script word, its occurrence)
    "rb1": ("राष्ट्रपति", 0), "pahad1": ("पहाड़", 0), "wahi": ("वही", 0), "delhi1": ("दिल्ली", 0), "desert1": ("Desert", 0),
    "rokta": ("रोकता", 0), "aravalli1": ("अरावली", 0), "gujarat": ("गुजरात", 0), "delhi2": ("दिल्ली", 1), "n700": ("700", 0),
    "arab": ("अरब", 0), "himalaya": ("हिमालय", 0), "karod": ("करोड़", 0), "rb2": ("राष्ट्रपति", 1), "raisina": ("रायसीना", 0),
    "aakhri": ("आख़िरी", 0), "west": ("West", 0), "thar1": ("थार", 0), "east": ("East", 0), "maidan": ("मैदान", 0),
    "beech": ("बीच", 0), "deewar1": ("दीवार", 0), "toot": ("टूट", 0), "n2018": ("2018", 0), "sc1": ("Supreme", 0),
    "report": ("Report", 0), "rajasthan": ("राजस्थान", 0), "n128": ("128", 0), "n31": ("31", 0), "n50": ("50", 0),
    "gayab": ("ग़ायब", 0), "mining": ("Mining", 0), "jahan": ("जहाँ", 0), "n12": ("12", 0), "darar": ("दरारें", 0),
    "dhool": ("धूल", 0), "n2025a": ("2025", 0), "sc2": ("Supreme", 1), "definition": ("Definition", 0), "n100a": ("100", 0),
    "reports": ("Reports", 0), "n20": ("20", 0), "n12000": ("12,000", 0), "n1000": ("1,000", 0), "n100b": ("100", 1),
    "virodh": ("विरोध", 0), "december": ("December", 0), "n2025b": ("2025", 1), "decision": ("Decision", 0),
    "agli": ("अगली", 0), "rb3": ("राष्ट्रपति", 2), "yaad": ("याद", 0),
}
FIX = {"n12000": 56.78}

LATIN = {"desert": "डेजर्ट", "west": "वेस्ट", "east": "इस्ट", "supreme": "सूप्रीम", "court": "कोट", "report": "रिपोट",
         "check": "चेक", "mining": "माइनिंग", "definition": "डिफिनिशन", "reports": "रिपोट्स", "december": "दिसम्बर",
         "decision": "देशिजन"}


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
