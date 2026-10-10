"""Beat timing for the Mumbai seven-islands video.

    python3 tools/mumbai_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/mumbai_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/mumbai_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/mumbai/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "mumbai" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("mumbai1", 1, "मुंबई", 1), ("aaj", 1, "आज", 1), ("crore", 1, "करोड़", 1), ("log", 1, "लोग", 1),
    ("dosau", 2, "दो", 1), ("pehle", 2, "पहले", 1), ("samandar2", 2, "समंदर", 1),
    ("mumbai3", 3, "मुंबई", 1), ("shahar3", 3, "शहर", 1), ("nahi3", 3, "नहीं", 1),
    ("saat", 4, "सात", 1), ("dweep4", 4, "द्वीप", 1),
    ("colaba", 5, "कोलाबा", 1), ("bombay", 5, "बॉम्बे", 1),
    ("mazgaon", 6, "मज़गाँव", 1), ("parel", 6, "परेल", 1),
    ("worli", 7, "वर्ली", 1), ("mahim", 7, "माहिम", 1), ("oldw", 7, "ओल्ड", 1), ("island7", 7, "आइलैंड", 1),
    ("yahan", 8, "यहाँ", 1), ("koli8", 8, "कोली", 1), ("bhai8", 8, "भाई", 1),
    ("samandar9", 9, "समंदर", 1), ("malik", 9, "मालिक", 1),
    ("devi10", 10, "देवी", 1), ("mumba", 10, "मुंबा", 1), ("naam10", 10, "नाम", 1), ("mumbai10", 10, "मुंबई", 1),
    ("y1534", 11, "1534", 1), ("portu", 11, "पुर्तगालियों", 1), ("kabja", 11, "कब्जा", 1),
    ("y1661", 12, "1661", 1), ("dahej", 12, "दहेज", 1), ("england", 12, "इंग्लैंड", 1), ("chale", 12, "चले", 1),
    ("raja", 13, "राजा", 1), ("das", 13, "10", 1), ("pound", 13, "पाउंड", 1), ("salana", 13, "सालाना", 1),
    ("company14", 14, "कंपनी", 1), ("kiraye", 14, "किराये", 1), ("diya", 14, "दिया", 1),
    ("zameen15", 15, "ज़मीन", 1), ("kam", 15, "कम", 1),
    ("monsoon", 16, "मानसून", 1), ("samandar16", 16, "समंदर", 1), ("ghus", 16, "घुस", 1),
    ("y1782", 17, "1782", 1), ("hornby17", 17, "हॉर्नबी", 1), ("worli17", 17, "वर्ली", 1),
    ("deewar", 18, "दीवार", 1), ("thani", 18, "ठानी", 1),
    ("company19", 19, "कंपनी", 1), ("suspend", 19, "सस्पेंड", 1), ("order", 19, "ऑर्डर", 1), ("bheja", 19, "भेजा", 1),
    ("par20", 20, "पर", 1), ("ruka", 20, "रुका", 1),
    ("y1784", 21, "1784", 1), ("vellard", 21, "वेलार्ड", 1), ("bana21", 21, "बना", 1),
    ("saaton", 22, "सातों", 1), ("ek22", 22, "एक", 1), ("gaye22", 22, "गए", 1),
    ("aajbhi", 23, "आज", 1), ("samandar23", 23, "समंदर", 1), ("zameen23", 23, "ज़मीन", 1), ("li", 23, "ली", 1),
    ("y2024", 24, "2024", 1), ("coastal", 24, "कोस्टल", 1), ("road", 24, "रोड", 1),
    ("ek25", 25, "एक", 1), ("hectare", 25, "हेक्टेयर", 1),
    ("kisne", 26, "किसने", 1), ("khoya", 26, "खोया", 1),
    ("wahi", 27, "वही", 1), ("koli27", 27, "कोली", 1),
    ("devi28", 28, "देवी", 1), ("naam28", 28, "नाम", 1), ("shahar28", 28, "शहर", 1),
]

PUNCT = "…।!?,:"


def norm(w: str) -> str:
    w = re.sub(r"[़ँं.…।!?,:\-]", "", w.lower())  # drop nukta/bindu/punctuation for matching
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
    (ROOT / "src" / "mumbai" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
