"""Beat timing for the Märket video.

    python3 tools/market_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/market_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/market_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/market/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "market" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("border1", 1, "बॉर्डर", 1), ("tapu1", 1, "टापू", 1), ("zigzag1", 1, "ज़िग-ज़ैग", 1), ("wajah", 1, "वजह", 1), ("lighthouse1", 1, "लाइटहाउस", 1),
    ("sweden2", 2, "स्वीडन", 1), ("finland2", 2, "फ़िनलैंड", 1), ("samandar2", 2, "समंदर", 1),
    ("zoom3", 3, "ज़ूम", 1), ("zoom3b", 3, "ज़ूम", 2), ("paanch3", 3, "पाँच", 1), ("maidan3", 3, "मैदान", 1), ("market3", 3, "मार्केट", 1), ("tedhi3", 3, "टेढ़ी", 1),
    ("y1809", 4, "1809", 1), ("sweden4", 4, "स्वीडन", 1), ("jung4", 4, "जंग", 1), ("finland4", 4, "फ़िनलैंड", 1), ("russi4", 4, "रूसी", 1),
    ("naya5", 5, "नया", 1), ("seedha5", 5, "सीधा", 1), ("beech5", 5, "बीच", 1),
    ("y1885", 6, "1885", 1), ("finland6", 6, "फ़िनलैंड", 1), ("lighthouse6", 6, "लाइटहाउस", 1), ("oonchi6", 6, "ऊँची", 1),
    ("dikkat7", 7, "दिक्कत", 1), ("sweden7", 7, "स्वीडन", 1),
    ("jung8", 8, "जंग", 1), ("par8", 8, "पर", 2), ("fayda8", 8, "फ़ायदा", 1),
    ("sau9", 9, "सौ", 1), ("y1985", 9, "1985", 1), ("hal9", 9, "हल", 1),
    ("nahi10", 10, "हटाया", 1), ("moda10", 10, "मोड़", 1), ("zigzag10", 10, "ज़िग-ज़ैग", 1), ("finland10", 10, "फ़िनलैंड", 1), ("barabar10", 10, "बराबर", 1),
    ("jung11", 11, "जंग", 1), ("nuksan11", 11, "नुकसान", 1), ("shareef11", 11, "शरीफ़", 1),
    ("hatate12", 12, "हटाते", 1), ("lighthouse12", 12, "लाइटहाउस", 1), ("border12", 12, "बॉर्डर", 1),
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
    (ROOT / "src" / "market" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
