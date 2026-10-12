"""Beat timing for the Tibet no-fly-zone video.

    python3 tools/tibet_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/tibet_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/tibet_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/market/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "tibet" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("plane1", 1, "Plane", 1), ("tibet1", 1, "Tibet", 1), ("udta1", 1, "उड़ता", 1),
    ("radar2", 2, "Radar", 1), ("chaaron2", 2, "चारों", 1), ("beech2", 2, "बीच", 1), ("khaali2", 2, "खाली", 1),
    ("pathar3", 3, "पठार", 1), ("lakh3", 3, "लाख", 1), ("bharat3", 3, "भारत", 1), ("chauthai3", 3, "तीन-चौथाई", 1),
    ("airlines4", 4, "Airlines", 1), ("wajah4", 4, "वजह", 1), ("teen4", 4, "तीन", 1),
    ("pehli5", 5, "पहली", 1), ("sabse5", 5, "सबसे", 1), ("ft14800", 5, "14,800", 1), ("kinare5", 5, "किनारे", 1), ("everest5", 5, "Everest", 1),
    ("plane6", 6, "Plane", 1), ("ft35000", 6, "35,000", 1), ("cabin6", 6, "Cabin", 1), ("gir6", 6, "गिर", 1), ("oxygen6", 6, "Oxygen", 1), ("min15", 6, "15", 1),
    ("pilot7", 7, "Pilot", 1), ("ft10000", 7, "10,000", 1), ("par7", 7, "पर", 1), ("zameen7", 7, "ज़मीन", 1), ("ft15000", 7, "15,000", 1),
    ("doosri8", 8, "दूसरी", 1), ("hawayen8", 8, "हवाएँ", 1), ("turb8", 8, "Turbulence", 1), ("badalta8", 8, "बदलता", 1),
    ("teesri9", 9, "तीसरी", 1), ("emergency9", 9, "Emergency", 1), ("airports9", 9, "Airports", 1), ("patli9", 9, "पतली", 1),
    ("gadbad10", 10, "गड़बड़", 1), ("rasta10", 10, "रास्ता", 1), ("ghoom10", 10, "घूमकर", 1),
    ("tum11", 11, "तुम", 1), ("seedha11", 11, "सीधा", 1), ("ghoom11", 11, "घूमकर", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"plane": "प्लेन", "planes": "प्लेन", "tibet": "तिबद", "flight": "फ्लाइट", "radar": "रडार", "airlines": "एर्लाइन्स", "feet": "फीट",
         "everest": "एवरेस्ट", "cabin": "क्याबिन", "pressure": "प्रेशर", "oxygen": "अक्सिजन", "masks": "मास्क", "pilot": "पािलेट",
         "turbulence": "तर्बिलन्स", "emergency": "एमर्जन्सी", "landing": "लैंडिंग", "airports": "एर्पॉर्ट्स", "pilots": "पािलेट्स", "लाख": "lakh"}


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
    (ROOT / "src" / "tibet" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
