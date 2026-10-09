"""Beat timing for the El Niño video.

    python3 tools/elnino_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/elnino_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/elnino_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/elnino/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "elnino" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("socho", 1, "सोचो", 1), ("pacific", 1, "पैसिफिक", 1), ("thanda", 1, "ठंडा", 1), ("ac", 1, "AC", 1), ("achanak", 1, "अचानक", 1), ("band", 1, "बंद", 1),
    ("isi", 1, "इसी", 1), ("agla", 1, "अगला", 1), ("duniya1", 1, "दुनिया", 1), ("garmsaal", 1, "गर्म", 1),
    ("naam", 2, "नाम", 1), ("super", 2, "सुपर", 1), ("elnino", 2, "एल", 1), ("isbaar", 2, "इस", 1), ("itihas", 2, "इतिहास", 1), ("khatarnak", 2, "खतरनाक", 1),
    ("ac2", 3, "AC", 1), ("hawayen", 3, "हवाएँ", 1), ("trade", 3, "ट्रेड", 1), ("roz", 3, "रोज", 1), ("purab", 3, "पूरब", 1), ("paschim", 3, "पश्चिम", 1), ("chalti", 3, "चलती", 1),
    ("garm", 4, "गर्म", 1), ("indo", 4, "इंडोनेशिया", 1), ("dhakel", 4, "धकेलती", 1), ("barish", 4, "बारिश", 1), ("peru", 4, "पेरू", 1), ("thanda4", 4, "ठंडा", 1), ("sukha", 4, "सूखा", 1),
    ("lekin", 5, "लेकिन", 1), ("y27", 5, "दो", 1), ("kamzor", 5, "कमजोर", 1), ("garm5", 5, "गर्म", 1), ("laut", 5, "लौट", 1), ("samandar", 5, "समंदर", 1), ("ekdo", 5, "एक-दो", 1), ("degree", 5, "डिग्री", 1),
    ("bas", 6, "बस", 1), ("duniya", 6, "दुनिया", 1), ("bigad", 6, "बिगड़", 1),
    ("peru7", 7, "पेरू", 1), ("baadh", 7, "बाढ़", 1), ("aus7", 7, "ऑस्ट्रेलिया", 1), ("sukha7", 7, "सूखा", 1), ("bharat", 7, "भारत", 1), ("monsoon", 7, "मानसून", 1),
    ("kamzor8", 7, "कमजोर", 1), ("issaal", 7, "साल", 1), ("p13", 7, "13", 1), ("kam", 7, "कम", 2),
    ("y1876", 8, "1876", 1), ("akaal", 8, "अकाल", 1), ("akele", 8, "अकेले", 1), ("lakh50", 8, "50", 1), ("mare", 8, "मारे", 1),
    ("ab", 9, "अब", 1), ("samandar9", 9, "समंदर", 1), ("d3", 9, "3", 1), ("garm10", 9, "गर्म", 1),
    ("garmi", 10, "गर्मी", 1), ("dharti", 10, "धरती", 1), ("tapayegi", 10, "तपाएगी", 1), ("y2027", 10, "2027", 1), ("sabsegarm", 10, "गर्म", 2),
    ("kya", 11, "क्या", 1), ("ready", 11, "रेडी", 1),
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
    (ROOT / "src" / "elnino" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print({k: cues[k] for k in ["ac", "band", "agla", "super", "itihas", "trade", "indo", "peru", "lekin", "bas", "peru7", "bharat", "p13", "y1876", "ab", "garmi", "y2027", "kya"]})


if __name__ == "__main__":
    main()
