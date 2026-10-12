"""Beat timing for the sugar-journey video.

    python3 tools/sugar_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/sugar_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/sugar_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/market/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "sugar" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("chini1", 1, "चीनी", 1), ("cheen1", 1, "चीन", 2), ("mishri1", 1, "मिश्री", 1), ("misr1", 1, "मिस्र", 1),
    ("jawab2", 2, "जवाब", 1), ("safar2", 2, "सफ़र", 1), ("bharat2", 2, "भारत", 1),
    ("y1500", 3, "1500", 1), ("ganne3", 3, "गन्ने", 1), ("jama3", 3, "जमाकर", 1), ("daane3", 3, "दाने", 1),
    ("sanskrit4", 4, "संस्कृत", 1), ("sharkara4", 4, "शर्करा", 1), ("matlab4", 4, "मतलब", 1), ("kankad4", 4, "कंकड़", 1),
    ("persia5", 5, "Persia", 1), ("shakar5", 5, "शकर", 1), ("arab5", 5, "Arab", 1), ("sukkar5", 5, "सुक्कर", 1),
    ("europe6", 6, "Europe", 1), ("italy6", 6, "Italy", 1), ("zucchero", 6, "Zucchero", 1), ("france6", 6, "France", 1),
    ("sucre", 6, "Sucre", 1), ("england6", 6, "England", 1), ("sugar6", 6, "Sugar", 1),
    ("yani7", 7, "यानी", 1), ("hamara7", 7, "हमारा", 1),
    ("tukde8", 8, "टुकड़ों", 1), ("khand8", 8, "खण्ड", 1),
    ("persia9", 9, "Persia", 1), ("kand9", 9, "कंद", 1), ("kalakand", 9, "कलाकंद", 1), ("gulkand", 9, "गुलकंद", 1),
    ("angrez10", 10, "अंग्रेज़ों", 1), ("candy", 10, "Candy", 1),
    ("egypt11", 11, "Egypt", 1), ("crystals", 11, "Crystals", 1), ("arab11", 11, "Arab", 1), ("bharat11", 11, "भारत", 1),
    ("misr11", 11, "मिस्र", 1), ("mishri11", 11, "मिश्री", 1),
    ("china12", 12, "China", 1), ("safed12", 12, "सफ़ेद", 1), ("cheeni12", 12, "चीनी", 1),
    ("nikli13", 13, "निकली", 1), ("ghar13", 13, "घर", 1),
    ("ghar14", 14, "घर", 1), ("kya14", 14, "क्या", 1), ("shakkar14", 14, "शक्कर", 1), ("cheeni14", 14, "चीनी", 1), ("aur14", 14, "और", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"persia": "परषिया", "arab": "अरब", "europe": "यौरूप", "italy": "इटली", "zucchero": "जुक्छरो", "france": "फ्रान्स",
         "sucre": "सुक्र", "england": "इंगलिन्ड", "sugar": "शुगर", "candy": "कैंडी", "egypt": "इजिप्ट", "crystals": "क्रिस्टल्स", "china": "चाइना"}

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
    (ROOT / "src" / "sugar" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
