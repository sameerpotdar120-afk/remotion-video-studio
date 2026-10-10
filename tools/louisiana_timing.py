"""Beat timing for the Louisiana Purchase video.

    python3 tools/louisiana_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/louisiana_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/louisiana_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/louisiana/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "louisiana" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("socho", 1, "सोचो", 1), ("do", 1, "दो", 1), ("shahar", 1, "शहर", 1), ("bhejo", 1, "भेजो", 1), ("poora", 1, "पूरा", 1), ("louis", 1, "लुईज़ियाना", 1), ("daam", 1, "दाम", 1),
    ("kaise", 2, "कैसे", 1), ("shuru", 2, "शुरू", 1),
    ("y1802", 3, "1802", 1), ("jung", 3, "जंग", 1), ("france", 3, "फ्रांस", 1), ("britain", 3, "ब्रिटेन", 1), ("sulah", 3, "सुलह", 1), ("jaante", 3, "जानते", 1), ("brk", 3, "ब्रेक", 1),
    ("udhar", 4, "उधर", 1), ("napoleon", 4, "नेपोलियन", 1), ("ilaka", 4, "इलाका", 1), ("louis4", 4, "लुईज़ियाना", 1), ("plan", 4, "प्लान", 1), ("samrajya", 4, "साम्राज्य", 1),
    ("chaabi", 5, "चाबी", 1), ("ameer", 5, "अमीर", 1), ("saint", 5, "सेंट", 1), ("haiti", 5, "हैती", 1),
    ("paise", 6, "पैसे", 1), ("khet", 6, "खेतों", 1), ("cheeni", 6, "चीनी", 1), ("kaam", 6, "काम", 1), ("laakhon", 6, "लाखों", 1), ("bina", 6, "बिना", 1),
    ("haan", 7, "हाँ", 1), ("gulami", 7, "गुलामी", 1),
    ("sabr", 8, "सब्र", 1), ("toota", 8, "टूटा", 1), ("bagawat", 8, "बगावत", 1), ("control", 8, "कंट्रोल", 1),
    ("napo9", 9, "नेपोलियन", 1), ("fauj", 9, "फौज", 1), ("shuru9", 9, "शुरू", 1), ("jeeta", 9, "जीता", 1),
    ("peela", 10, "पीला", 1), ("bukhar", 10, "बुखार", 1), ("hissa", 10, "हिस्सा", 1), ("dweep", 10, "द्वीप", 1), ("haath", 10, "हाथ", 1),
    ("saint11", 11, "सेंट", 1), ("matlab", 11, "मतलब", 1),
    ("vyapar", 12, "व्यापार", 1), ("miss", 12, "मिसिसिपी", 1), ("neworl", 12, "न्यू", 1), ("samandar", 12, "समंदर", 1), ("neworl2", 12, "न्यू", 2), ("france12", 12, "फ्रांस", 1),
    ("jeff", 13, "जेफरसन", 1), ("dipl", 13, "डिप्लोमैट्स", 1), ("badle", 13, "बदले", 1), ("crore", 13, "करोड़", 1),
    ("britain14", 14, "ब्रिटेन", 1), ("jung14", 14, "जंग", 1), ("paisa", 14, "पैसा", 1), ("door", 14, "दूर", 1), ("namumkin", 14, "नामुमकिन", 1),
    ("chaunk", 15, "चौंकाते", 1), ("poora15", 15, "पूरा", 1), ("dedh", 15, "डेढ़", 1),
    ("maze", 16, "मज़े", 1), ("dipl16", 16, "डिप्लोमैट्स", 1), ("ijazat", 16, "इजाज़त", 1), ("mauka", 16, "मौका", 1), ("haan16", 16, "हाँ", 1),
    ("ekdin", 17, "दिन", 1), ("dugna", 17, "गुना", 1), ("bharat", 17, "भारत", 1), ("tihai", 17, "तिहाई", 1), ("cent", 17, "सेंट", 1), ("acre", 17, "एकड़", 1),
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
    (ROOT / "src" / "louisiana" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print({k: cues[k] for k in ["louis", "kaise", "y1802", "udhar", "saint", "gulami", "bagawat", "peela", "vyapar", "jeff", "chaunk", "maze", "ekdin", "bharat", "acre"]})


if __name__ == "__main__":
    main()
