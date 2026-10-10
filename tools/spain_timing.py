"""Beat timing for the Spain hidden-neighbours video.

    python3 tools/spain_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/spain_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/spain_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/spain/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "spain" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("padha", 1, "पढ़ा", 1), ("spain1", 1, "स्पेन", 1), ("do1", 1, "दो", 1), ("france1", 1, "फ्रांस", 1), ("portugal", 1, "पुर्तगाल", 1), ("quiz", 1, "क्विज़", 1), ("haar", 1, "हार", 1),
    ("paanch", 2, "पाँच", 1), ("baaki", 2, "बाकी", 1), ("naksha", 2, "नक्शे", 1), ("chupa", 2, "छुपा", 1),
    ("pehle", 3, "पहले", 1), ("border3", 3, "बॉर्डर", 1), ("ajeeb", 3, "अजीब", 1), ("yakeen", 3, "यकीन", 1),
    ("france4", 4, "फ्रांस", 1), ("dedh", 4, "डेढ़", 1), ("shahar4", 4, "शहर", 1), ("llivia", 4, "लिविया", 1), ("chaaron", 4, "चारों", 1), ("spain4", 4, "स्पेन", 1),
    ("y1659", 5, "1659", 1), ("gaon", 5, "गाँव", 1), ("france5", 5, "फ्रांस", 1), ("llivia5", 5, "लिविया", 1), ("gaon5", 5, "गाँव", 2), ("shahar5", 5, "शहर", 1), ("shabd", 5, "शब्द", 1), ("bacha", 5, "बचा", 1),
    ("pashchim", 6, "पश्चिम", 1), ("nadi", 6, "नदी", 1), ("tapu", 6, "टापू", 1), ("pheasant", 6, "फेज़ेंट", 1), ("chhah", 6, "छह", 1), ("badalta", 6, "बदलता", 1),
    ("farvari", 7, "फरवरी", 1), ("spain7", 7, "स्पेन", 1), ("agast", 7, "अगस्त", 1), ("france7", 7, "फ्रांस", 1), ("waqt", 7, "वक्त", 1), ("france7b", 7, "फ्रांस", 2),
    ("teesra", 8, "तीसरा", 1), ("pahad", 8, "पहाड़ों", 1), ("desh8", 8, "देश", 1), ("andorra", 8, "अंडोरा", 1), ("prince", 8, "प्रिंस", 1), ("rashtrapati", 8, "राष्ट्रपति", 1), ("bishop", 8, "बिशप", 1),
    ("chautha", 9, "चौथा", 1), ("hazaron", 9, "हजारों", 1), ("britain", 9, "ब्रिटेन", 1), ("dakshin", 9, "दक्षिणी", 1), ("gib", 9, "जिब्राल्टर", 1), ("y1713", 9, "1713", 1), ("bhumadhya", 9, "भूमध्य", 1), ("darwaza", 9, "दरवाजा", 1), ("khulta", 9, "खुलता", 1),
    ("paanchva", 10, "पाँचवाँ", 1), ("africa10", 10, "अफ्रीका", 1), ("morocco", 10, "मोरक्को", 1), ("europe", 10, "यूरोप", 1), ("akela", 10, "अकेला", 1), ("zameeni", 10, "ज़मीनी", 1), ("africa10b", 10, "अफ्रीका", 2),
    ("do11", 11, "दो", 1), ("ceuta", 11, "सेउटा", 1), ("melilla", 11, "मेलिया", 1), ("chattan", 11, "चट्टान", 1), ("tapu11", 11, "टापू", 1), ("ret", 11, "रेत", 1), ("jod", 11, "जोड़", 1), ("duniya", 11, "दुनिया", 1), ("chhota", 11, "छोटा", 1), ("m85", 11, "85", 1),
    ("sach", 12, "सच", 1), ("paanch12", 12, "पाँच", 1), ("pata", 12, "पता", 1),
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
    (ROOT / "src" / "spain" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
