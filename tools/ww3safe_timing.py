"""Beat timing for the World War 3 safe-countries video.

    python3 tools/ww3safe_timing.py words.json      # real word timings (faster-whisper output, keys w/s/e)

Writes src/ww3safe/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "ww3safe" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("america1", 1, "America", 1), ("europe1", 1, "Europe", 1),
    ("kyon2", 2, "क्यों", 1), ("nuke2", 2, "परमाणु", 1), ("india2", 2, "India", 1), ("uttari2", 2, "उत्तरी", 1), ("matlab2", 2, "मतलब", 1), ("khatra2", 2, "खतरा", 1),
    ("bachna3", 3, "बचना", 1), ("neeche3", 3, "नीचे", 1), ("dakshin3", 3, "दक्षिण", 1),
    ("fiji4", 4, "Fiji", 1), ("pacific4", 4, "Pacific", 1), ("n300", 4, "300", 1), ("dweep4", 4, "द्वीप", 1), ("aus4", 4, "Australia", 1),
    ("n2700", 4, "2,700", 1), ("door4", 4, "दूर", 1), ("akela4", 4, "अकेला", 1), ("nishane4", 4, "निशाने", 1), ("ilaka4", 4, "इलाका", 1),
    ("sandhi4", 4, "संधि", 1), ("zone4", 4, "Zone", 1),
    ("nz5", 5, "New", 1), ("y1987", 5, "1987", 1), ("kanoon5", 5, "कानून", 1), ("hathiyar5", 5, "हथियार", 1), ("y2023", 5, "2023", 1),
    ("sardi5", 5, "सर्दी", 1), ("fasle5", 5, "फ़सलें", 1), ("barbaad5", 5, "बर्बाद", 1), ("nz5b", 5, "New", 2), ("khana5", 5, "खाना", 1), ("uga5", 5, "उगा", 1),
    ("teesra6", 6, "तीसरा", 1), ("ajeeb6", 6, "अजीब", 1), ("iceland6", 6, "Iceland", 1), ("uttar6", 6, "उत्तर", 1), ("list6", 6, "लिस्ट", 1), ("kyon6", 6, "क्यों", 1),
    ("army7", 7, "army", 1), ("n19", 7, "19", 1), ("shaant7", 7, "शांत", 1), ("thand7", 7, "ठंड", 1), ("n90", 7, "90%", 1), ("garmi7", 7, "गर्मी", 1),
    ("chautha8", 8, "चौथा", 1), ("bunker8", 8, "bunker", 1), ("bani8", 8, "बनी", 1),
    ("pehchana9", 9, "पहचाना", 1), ("comment9", 9, "Comment", 1),
]
# English words and numbers in the script vs how Whisper spelled them (alignment only)
ALIAS = {"america": "america", "europe": "europe", "india": "इंडिया", "fiji।": "फिजी", "fiji": "फिजी", "pacific": "पशिफिक", "ocean": "ओशिन",
         "australia": "औस्ट्रिलिया", "2,700": "2700", "nuclear": "नूक्लियर", "free": "फ्री", "zone": "जोन", "new": "न्यूजिलन्ड",
         "zealand।": "", "zealand": "", "study": "study", "iceland।": "आइसलेंड", "iceland": "आइसलेंड", "army": "आर्मी",
         "टेंशन": "टेंचन", "90%": "प्रतिशत", "bunker": "बंकर", "comment": "कौमेंट", "क्यों?": "क्यूंकि", "क्यों": "क्यूंकि",
         "परमाणु": "नोपर्मानू", "दक्षिण": "दक्षन", "नीचे": "निचे", "संधि": "संधी", "हथियार": "हत्यार", "फ़सलें": "फसलें", "शांत": "शान्त",
         "ठंड": "तंड", "19": "उन्निस", "world": "world", "war": "war", "3": "iii"}


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
    (ROOT / "src" / "ww3safe" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
