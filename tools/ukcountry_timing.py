"""Cues and captions for the "UK: one country or four?" video, from the creator's VO (public/ukcountry/audio/vo.mp3,
112.8 s).

    python3 -I tools/ukcountry_timing.py <whisper_words.json>

faster-whisper "medium" word times (Hindi), aligned word by word onto the script's own spelling (dynamic programming on
string similarity); 17.6-30.8 s and 45.6-52.3 s re-transcribed on their own (whisper skipped or garbled them in the full
pass). Numbers are shown as digits in the captions. The loop: the VO ends on "याद रखना…" at 112.6 s and the video is
113.2 s, so it runs into "जिन अंग्रेज़ों ने…" at frame 0.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "ukcountry" / "edit" / "timing.json"
DURATION = 113.2
SCRIPT = (ROOT / "public" / "ukcountry" / "script_elevenlabs.txt").read_text()
NUM = {"दो सौ": "200", "अठारह सौ एक": "1801", "तेरहवीं": "13वीं", "सोलह सौ तीन": "1603", "सत्रह सौ सात": "1707",
       "उन्नीस सौ सोलह": "1916", "उन्नीस सौ बाईस": "1922", "उन्नीस सौ सैंतालीस": "1947"}
CUES = {  # name: (the script word, its occurrence)
    "n200": ("200", 0), "uk1": ("UK", 0), "char1": ("चार", 0), "parl1": ("Parliament", 0), "n1801a": ("1801", 0),
    "bribe": ("bribe", 0), "kaise": ("कैसे?", 0), "king": ("King,", 0), "passport": ("Passport,", 0), "army": ("Army।", 0),
    "andar": ("अंदर", 0), "eng_list": ("England,", 0), "scot_list": ("Scotland,", 0), "wales_list": ("Wales", 0),
    "ni_list": ("Northern", 0), "capital": ("Capital।", 0), "vishwas": ("विश्वास", 0), "cricket": ("Cricket", 0),
    "engwales": ("Wales", 1), "football": ("Football", 0), "olympics": ("Olympics", 0), "teamgb": ("Team", 0),
    "shuruat": ("शुरुआत", 0), "n13": ("13वीं", 0), "jeet": ("जीत", 0), "kilon": ("किलों", 0), "baari": ("बारी", 0),
    "scots": ("Scots", 0), "n1603": ("1603", 0), "raja": ("राजा", 0), "london1": ("London", 0), "panama": ("Panama", 0),
    "doob": ("डूब", 0), "n1707": ("1707", 0), "kanoon": ("क़ानून,", 0), "church": ("church", 0), "gb": ("Great", 0),
    "ireland1": ("Ireland", 1), "parl2": ("Parliament", 1), "n1801b": ("1801", 1), "khitab": ("ख़िताबों", 0),
    "vote": ("vote", 0), "ukd": ("United", 0), "irish": ("Irish", 0), "n1916": ("1916", 0), "jung": ("जंग।", 0),
    "n1922": ("1922", 0), "uttar": ("उत्तर", 0), "batwara": ("बँटवारा", 0), "london2": ("London", 1), "n1947": ("1947", 0),
    "bharat": ("भारत", 0), "naam": ("नाम", 0), "fullname": ("United", 1), "char3": ("चार", 2), "sovereign": ("sovereign", 0),
    "nation": ("Nation", 0), "agli": ("अगली", 0), "yaad": ("याद", 0),
}


LATIN = {"uk": "यूके", "parliament": "पार्लेमेंट", "bribe": "ब्राइब", "king": "किंग", "passport": "पास्पॉर्ट", "army": "आमी",
         "england": "इंग्लैंड", "scotland": "स्कॉटलैंड", "wales": "वेल्स", "northern": "नॉर्दर्न", "ireland": "आयरलैंड",
         "capital": "कापिटल", "team": "टीम", "olympics": "उलिम्पिक्स", "gb": "जीबी", "scots": "सकॉत्स", "london": "लंदन",
         "panama": "पैनमा", "colony": "कॉलिनी", "fail": "फेल", "church": "चर्च", "great": "ग्रेट", "britain": "ब्रिटन",
         "control": "कुंट्रोल", "vote": "वोट", "united": "यूनाइटिट", "kingdom": "किंडम", "irish": "आयरिश", "easter": "इस्तर",
         "rising": "राजिंग", "sovereign": "सोवरन", "nation": "नेशन", "of": "ऑफ", "and": "एंड"}


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
