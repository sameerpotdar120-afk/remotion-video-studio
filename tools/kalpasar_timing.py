"""Beat timing for the Kalpasar video.

    python3 tools/kalpasar_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/kalpasar_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/kalpasar_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/kalpasar/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "kalpasar" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("suna1", 1, "सुना", 1), ("bharat1", 1, "भारत", 1), ("samandar1", 1, "समंदर", 1), ("n60", 1, "60", 1), ("deewar1", 1, "दीवार", 1), ("kyu1", 1, "क्यों", 1),
    ("socho2", 2, "सोचो", 1), ("kisan2", 2, "किसान", 1), ("saurashtra2", 2, "Saurashtra", 1),
    ("baarish3", 3, "बारिश", 1), ("kuen3", 3, "कुएँ", 1), ("khaara3", 3, "खारा", 1), ("khet3", 3, "खेत", 1), ("pyaase3", 3, "प्यासे", 1),
    ("badi4", 4, "बड़ी", 1), ("door4", 4, "दूर", 1),
    ("saamne5", 5, "सामने", 1), ("gulf5", 5, "Gulf", 1), ("mahi5", 5, "Mahi", 1), ("sabarmati5", 5, "Sabarmati", 1), ("dhadhar5", 5, "Dhadhar", 1),
    ("hazaron5", 5, "हज़ारों", 1), ("meetha5", 5, "मीठा", 1), ("khaare5", 5, "खारे", 1), ("baha5", 5, "बहा", 1),
    ("tabhi6", 6, "तभी", 1), ("n50a", 6, "50", 1), ("idea6", 6, "Idea", 1), ("nadiyon6", 6, "नदियों", 1), ("rok6", 6, "रोक", 2),
    ("kalpasar7", 7, "Kalpasar", 1),
    ("bhavnagar8", 8, "Bhavnagar", 1), ("bharuch8", 8, "Bharuch", 1), ("aarpaar8", 8, "आर-पार", 1), ("km8", 8, "60", 1),
    ("bharti9", 9, "भरती", 1), ("band9", 9, "बंद", 1), ("utregi9", 9, "उतरेगी", 1), ("khulenge9", 9, "खुलेंगे", 1), ("bahar9", 9, "बाहर", 1), ("andar9", 9, "अंदर", 1),
    ("aaj10", 10, "आज", 1), ("n1600", 10, "1,600", 1), ("jheel10", 10, "झील।", 1), ("bharat10", 10, "भारत", 1), ("kisan10", 10, "किसान", 1), ("n9", 10, "9", 1),
    ("bonus11", 11, "Bonus", 1), ("lane11", 11, "Lane", 1), ("railway11", 11, "Railway", 1), ("surat11", 11, "Surat", 1), ("aadha11", 11, "आधा", 1), ("n356", 11, "356", 1), ("n177", 11, "177", 1),
    ("perfect12", 12, "Perfect", 1), ("par12", 12, "पर", 1), ("haar12", 12, "हार", 1),
    ("jwaar13", 13, "ज्वार", 1), ("n10m", 13, "10", 1), ("zameen13", 13, "ज़मीन", 1), ("daldal13", 13, "दलदल", 1),
    ("n50b", 14, "50", 1), ("file14", 14, "File", 1), ("eent14", 14, "ईंट", 1), ("cost14", 14, "Cost", 1), ("lakh14", 14, "लाख", 1),
    ("naam15", 15, "नाम", 1), ("kalpasar15", 15, "Kalpasar,", 1), ("iccha15", 15, "इच्छा", 1),
    ("kisan16", 16, "किसान", 1), ("intezar16", 16, "इंतज़ार", 1), ("banega16", 16, "बनेगा", 1), ("kalpana16", 16, "कल्पना", 1),
    ("aapko17", 17, "आपको", 1), ("haan17", 17, "हाँ", 1), ("naa17", 17, "ना?", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"km": "किलोमेटर", "saurashtra": "सौराश्ट्र", "gulf": "गल्फ", "of": "आफ", "khambhat": "खम्भाट", "mahi": "माही", "sabarmati": "साबर्मती",
         "dhadhar": "धाधर", "idea": "idea", "kalpasar": "कल्पसार", "bhavnagar": "भावनगर", "bharuch": "भरुच", "gates": "गेट्स", "bonus": "बोनस",
         "lane": "लेन", "highway": "हाईवे", "railway": "रेल्वे", "surat": "सूरत", "perfect": "perfect", "file": "फायल", "cost": "कौस्ट"}


PUNCT = "…।!?,:"


def norm(w: str) -> str:
    w = re.sub(r"[़ँं.…।!?,:\-]", "", w.lower())  # drop nukta/bindu/punctuation for matching
    if w in ALIAS:
        w = re.sub(r"[़ँं]", "", ALIAS[w])
    return w


def srt_caps(path: Path, rec: list) -> list:
    """Caption chunks (<= 4 words, split at punctuation and SRT cues) in the SRT's spelling, timed by the word alignment."""
    entries = []
    for block in path.read_text(encoding="utf-8").strip().split("\n\n"):
        ls = block.strip().splitlines()
        if len(ls) >= 3:
            entries.append(" ".join(ls[2:]).split())
    flat = [(ei, w) for ei, ws in enumerate(entries) for w in ws]
    a = [norm(w) for _, w in flat]
    b = [norm(x["w"]) for x in rec]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    st = [None] * len(flat)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            st[blk.a + k] = rec[blk.b + k]["s"]
    ends = [None] * len(flat)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            ends[blk.a + k] = rec[blk.b + k]["e"]
    i = 0
    while i < len(st):  # unmatched runs: spread them between the previous word's end and the next word's start
        if st[i] is None:
            j = i
            while j < len(st) and st[j] is None:
                j += 1
            t0 = ends[i - 1] if i and ends[i - 1] is not None else (st[i - 1] if i else 0.0)
            t1 = st[j] if j < len(st) else rec[-1]["e"]
            for q in range(i, j):
                st[q] = t0 + (t1 - t0) * (q - i) / (j - i)
            i = j
        else:
            i += 1
    caps = []
    i = 0
    for ei, ws in enumerate(entries):
        # split each SRT entry at punctuation, then into even chunks of at most 4 words
        groups, g = [], []
        for w in ws:
            g.append(w)
            if w[-1] in PUNCT:
                groups.append(g)
                g = []
        if g:
            groups.append(g)
        for g in groups:
            n = -(-len(g) // 4)
            size = -(-len(g) // n)
            for c0 in range(0, len(g), size):
                caps.append([round(st[i + c0], 3), " ".join(g[c0:c0 + size])])
            i += len(g)
    caps[0][0] = 0.0
    return caps


def main() -> None:
    lines = [l.strip() for l in SCRIPT.read_text(encoding="utf-8").splitlines() if l.strip()]
    words = []  # (line, text)
    for li, line in enumerate(lines, 1):
        for w in line.split():
            words.append((li, w))

    if len(sys.argv) > 1:
        rec = json.load(open(sys.argv[1], encoding="utf-8"))
        a = [norm(w) for _, w in words]
        b = [norm(x["w"]) for x in rec]
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        times = [None] * len(words)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                times[blk.a + k] = (rec[blk.b + k]["s"], rec[blk.b + k]["e"])
        # fill unmatched words by interpolation
        for i in range(len(times)):
            if times[i] is None:
                j = i
                while j < len(times) and times[j] is None:
                    j += 1
                t0 = times[i - 1][1] if i else 0.0
                t1 = times[j][0] if j < len(times) else rec[-1]["e"]
                n = j - i
                for k in range(n):
                    times[i + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
        end = rec[-1]["e"]
    else:
        # estimate: time proportional to letters, plus pauses at punctuation (≈ the creator's pace)
        rate = 0.0598  # seconds per letter, calibrated on the North Sentinel voiceover
        t = 0.0
        times = []
        for li, w in words:
            d = 0.12 + rate * len(norm(w))
            times.append((t, t + d))
            t += d
            if w[-1] in "…।!?":
                t += 0.38
            elif w[-1] in ",:":
                t += 0.16
        end = t

    cues = {}
    for name, line, sub, occ in CUES:
        n = 0
        for i, (li, w) in enumerate(words):
            if li == line and sub in w:
                n += 1
                if n == occ:
                    cues[name] = round(times[i][0], 3)
                    break
        if name not in cues:
            raise SystemExit(f"cue {name} not found")

    caps = []
    if len(sys.argv) > 2:
        caps = srt_caps(Path(sys.argv[2]), rec)
    chunk, start = [], None
    for i, (li, w) in enumerate(words if not caps else []):
        if not chunk:
            start = times[i][0]
        chunk.append(w)
        nxt_line = words[i + 1][0] if i + 1 < len(words) else None
        if len(chunk) >= 4 or w[-1] in PUNCT or nxt_line != li:
            caps.append([round(start, 3), " ".join(chunk)])
            chunk = []
    out = {"source": "voiceover" if len(sys.argv) > 1 else "estimate", "duration": round(end + 0.7, 2), "cues": cues, "caps": caps}
    (ROOT / "src" / "kalpasar" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
