"""Beat timing for the Kolkata three-villages video.

    python3 tools/kolkata_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/kolkata_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/kolkata_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/kolkata/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "kolkata" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("duniya1", 1, "दुनिया", 1), ("joy1", 1, "Joy", 1), ("kolkata1", 1, "Kolkata", 1), ("teen1", 1, "तीन", 1), ("angrez1", 1, "अंग्रेज़ों", 1),
    ("n1300", 1, "1,300", 1), ("kiraye1", 1, "किराए", 1), ("to1", 1, "तो", 1), ("raj1", 1, "राजधानी", 1),
    ("pehla2", 2, "पहला", 1), ("sutanuti2", 2, "Sutanuti", 1), ("soot2", 2, "सूत", 1), ("aaj2", 2, "आज", 1), ("shobha2", 2, "Shobhabazar", 1), ("chitpur2", 2, "Chitpur", 1),
    ("doosra3", 3, "दूसरा", 1), ("gobind3", 3, "Gobindapur", 1), ("maidan3", 3, "Maidan", 1), ("fort3", 3, "Fort", 1), ("vahin3", 3, "वहीं", 1),
    ("teesra4", 4, "तीसरा", 1), ("kalikata4", 4, "Kalikata", 1), ("kali4", 4, "काली", 1), ("central4", 4, "Central", 1),
    ("hooghly5", 5, "Hooghly", 1), ("perfect5", 5, "Perfect", 1), ("y1698", 5, "1698", 1), ("company5", 5, "Company", 1), ("sabarna5", 5, "Sabarna", 1), ("haq5", 5, "हक़", 1),
    ("fort6", 6, "Fort", 1), ("gobind6", 6, "Gobindapur", 1), ("khali6", 6, "खाली", 1),
    ("yahin7", 7, "यहीं", 1), ("shehar7", 7, "शहर", 1), ("british7", 7, "British", 1), ("raj7", 7, "राजधानी", 1),
    ("kitab8", 8, "किताबों", 1), ("charnock8", 8, "Charnock", 1), ("basaya8", 8, "बसाया", 1), ("court8", 8, "Court", 1), ("pehle8", 8, "पहले", 1),
    ("matlab9", 9, "मतलब", 1), ("basaya9", 9, "बसाया", 1), ("hamesha9", 9, "हमेशा", 1),
    ("to10", 10, "तो", 1), ("pata10", 10, "पता", 1), ("bhejo10", 10, "भेजो", 1), ("follow10", 10, "follow", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"kolkata": "कोलकता", "sutanuti": "सूतानूटी", "gobindapur": "गोबिंदापूर", "maidan": "मैदान", "fort": "फोट", "william": "विल्यम",
         "kalikata": "कलिकाता", "central": "सेंट्रल", "hooghly": "हुगली", "perfect": "परफेक्ट", "east": "ईस्ट", "india": "इंडिया",
         "company": "कंपनी", "british": "ब्रिटिश", "job": "जौप", "charnock": "चार्नॉक", "calcutta": "कलकता", "follow": "फॉलो",
         "videos": "वीडियों", "chitpur": "चित्पुर"}


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
    (ROOT / "src" / "kolkata" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
