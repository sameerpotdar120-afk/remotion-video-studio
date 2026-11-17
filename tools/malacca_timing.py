"""Cues and captions for the Malacca video, from the creator's VO (public/malacca/audio/vo.mp3, 69.96 s).

    python3 -I tools/malacca_timing.py <whisper_words.json>

vo.mp3 = vo_raw.mp3 (80.27 s) with "Malaysia Strait" (22.83-23.75 s, mispronounced) replaced by the creator's re-take
vo_patch_malacca.mp3 ("Malacca Strait"), then sped up 1.15x as the creator asked (vo_fixed.wav is the splice before the
speed-up). faster-whisper "medium" word times, aligned onto the script's own spelling (dynamic programming on string
similarity). Numbers are shown as digits in the captions. The loop: the VO ends on "तो बस इतना कहना…" at 69.9 s; the video
is 70.3 s, so it runs into "तुम जिस Andaman-Nicobar में…" at frame 0 (the hook answers the last question).
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "malacca" / "edit" / "timing.json"
DURATION = 70.3
SCRIPT = (ROOT / "public" / "malacca" / "script_elevenlabs.txt").read_text()
NUM = {"तीन सौ सत्तर": "370", "एक सौ चालीस": "140", "अस्सी प्रतिशत": "80%", "एक सौ पैंतालीस": "145", "निन्यानवे": "99",
       "दो हज़ार पैंतीस": "2035", "दो सौ": "200"}
CUES = {  # name: (the script word, its occurrence)
    "an1": ("Andaman-Nicobar", 0), "chhutti": ("छुट्टियाँ", 0), "neeche": ("नीचे", 0), "china1": ("China", 0), "tel1": ("तेल", 0),
    "darr1": ("डर", 0), "china3": ("China", 2), "navy1": ("Navy", 0), "n370": ("370", 0), "bharat1": ("भारत", 0), "n140": ("140", 0),
    "n80": ("80%", 0), "gali": ("गली", 0), "malacca1": ("Malacca", 0), "darwaze": ("दरवाज़े", 0), "an2": ("Andaman-Nicobar", 1),
    "indira": ("Indira", 0), "indonesia1": ("Indonesia", 0), "n145": ("145", 0), "tri": ("Tri-Service", 0), "army": ("Army", 0),
    "navy2": ("Navy", 1), "air": ("Air", 0), "naam": ("नाम", 0), "dilemma": ("Dilemma", 0), "isliye": ("इसलिए", 0), "ports": ("Ports", 0),
    "gwadar": ("Gwadar", 0), "hambantota": ("Hambantota", 0), "n99": ("99", 0), "kyaukpyu": ("Kyaukpyu", 0), "djibouti": ("Djibouti", 0),
    "base": ("Base", 0), "string": ("String", 0), "jawab": ("जवाब", 0), "necklace": ("Necklace", 0), "chabahar": ("Chabahar", 0),
    "duqm": ("Duqm", 0), "sabang": ("Sabang", 0), "muhaane": ("मुहाने", 0), "n2035": ("2035", 0), "target": ("Target", 0),
    "n200": ("200", 0), "agli": ("अगली", 0), "navy4": ("Navy", 3), "darr3": ("डर", 2), "kehna": ("कहना", 0),
}
FIX: dict = {}

LATIN = {"china": "चाइना", "navy": "नेवी", "malacca": "मलाका", "strait": "स्ट्रेट", "indira": "इंद्रा", "point": "पॉंट",
         "indonesia": "इंडोनेश्या", "triservice": "ट्राइ", "command": "कमांड", "army": "आमी", "air": "एर्फॉर्स", "force": "फॉर्स",
         "dilemma": "डिलेमा", "ports": "पॉर्ट्स", "pakistan": "पाकिस्तान", "gwadar": "गौडर", "sri": "श्रिलंका", "lanka": "लंका",
         "hambantota": "हम्बंतोटा", "lease": "लीज़", "myanmar": "मयन्मार", "kyaukpyu": "क्योक्प्यू", "africa": "अफ्रीका",
         "djibouti": "जिबूटी", "military": "मिलिट्री", "base": "बेस", "string": "स्ट्रिंग", "of": "औफ", "pearls": "परल्स",
         "necklace": "नेक्लिस", "diamonds": "डाइमंद्स", "iran": "इरान", "chabahar": "चाबहर", "oman": "ओमान", "duqm": "दुक्म",
         "sabang": "सबांग", "target": "टागेट", "andamannicobar": "अंडमान"}


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
