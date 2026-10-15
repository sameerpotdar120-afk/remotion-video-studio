"""Beat timing for the new Tibet video (tibet2).

    python3 tools/tibet2_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/tibet2_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/tibet2_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/tibet2/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "tibet2" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("flight1", 1, "Flight", 1), ("khaali1", 1, "खाली", 1), ("india1", 1, "India", 1), ("plane1", 1, "Plane", 1), ("gadbad1", 1, "गड़बड़", 1), ("jagah1", 1, "जगह", 1), ("kyu1", 1, "क्यों", 1),
    ("ye2", 2, "ये", 1), ("tibet2", 2, "Tibet", 1), ("france2", 2, "France", 1), ("chaar2", 2, "चार", 1), ("duniya2", 2, "दुनिया", 1), ("unchaa2", 2, "ऊँचा", 1),
    ("zameen3", 3, "ज़मीन", 1), ("n4500", 3, "4,500", 1), ("everest3", 3, "Everest", 1),
    ("socho4", 4, "सोचो", 1), ("n10000", 4, "10,000", 1), ("achanak4", 4, "अचानक", 1), ("pressure4", 4, "Pressure", 1), ("oxygen4", 4, "Oxygen", 1), ("masks4b", 4, "Masks", 2), ("minute4", 4, "मिनट", 1),
    ("pilot5", 5, "Pilot", 1), ("n3000", 5, "3,000", 1), ("saans5", 5, "साँस", 1),
    ("par6", 6, "पर", 1), ("tibet6", 6, "Tibet", 1), ("n4500b", 6, "4,500", 1), ("jagah6", 6, "जगह", 1),
    ("mausam7", 7, "मौसम", 1), ("hawayen7", 7, "हवाएँ", 1), ("jhatke7", 7, "झटके", 1), ("aasmaan7", 7, "आसमान", 1),
    ("utarna8", 8, "उतरना", 1), ("airports8", 8, "Airports", 1), ("pahadon8", 8, "पहाड़ों", 1),
    ("par9", 9, "पर", 1), ("band9", 9, "बंद", 1), ("raasta9", 9, "रास्ता", 2), ("l888", 9, "L888", 1), ("planes9", 9, "Planes", 1),
    ("aap10", 10, "आप", 1), ("pilot10", 10, "Pilot", 1), ("haan10", 10, "हाँ", 1), ("comment10", 10, "Comment", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"india": "इंडिया", "plane": "प्लेन", "tibet": "तिबेट", "france": "फ्रान्स", "mount": "मांट", "everest": "एवरेस्ट", "cabin": "क्याबिन",
         "pressure": "प्रेशर", "oxygen": "अक्सिजन", "masks": "मास्क्स", "pilot": "पाइलेट", "airports": "आर्पॉर्ट्स", "planes": "प्लेन्स",
         "comment": "कमेंट", "4,500": "चार", "10,000": "दस"}


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
    (ROOT / "src" / "tibet2" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
