"""Beat timing for the Chile video.

    python3 tools/chile_timing.py words.json      # real word timings (faster-whisper output, keys w/s/e)

Writes src/chile/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "chile" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("chalo1", 1, "चलो", 1), ("arey1", 1, "अरे", 1), ("mirchi1", 1, "मिर्ची", 1), ("chile1", 1, "Chile!", 1),
    ("lamba2", 2, "लंबा", 1), ("india2", 2, "India", 1), ("kashmir2", 2, "Kashmir", 1), ("kanya2", 2, "Kanyakumari", 1), ("n1000", 2, "1,000", 1), ("bach2", 2, "बच", 1),
    ("par3", 3, "पर", 1), ("n180", 3, "180", 1), ("delhi3", 3, "Delhi", 1), ("agra3", 3, "Agra", 1),
    ("shakal4", 4, "शक्ल", 1), ("kaise4", 4, "कैसे", 1),
    ("y1500", 5, "1500", 1), ("adivasi5", 5, "आदिवासी", 1), ("inca5", 5, "Inca", 1), ("mapuche5", 5, "Mapuche", 1),
    ("spain6", 6, "Spain", 1), ("baat6", 6, "बातचीत", 1),
    ("wah7", 7, "वाह", 1), ("khali7", 7, "खाली", 1), ("bhai8", 8, "भाई", 1), ("rehte8", 8, "रहते", 1), ("aham9", 9, "अहम", 1), ("khali9", 9, "खाली", 1),
    ("mapuche10", 10, "Mapuche", 1), ("jeet10", 10, "जीत", 1),
    ("y1818", 11, "1818", 1), ("shuru11", 11, "शुरुआत", 1), ("itna11", 11, "इतना", 1),
    ("chalo12", 12, "चलो", 1), ("poorab12", 12, "पूरब", 1), ("accha13", 13, "अच्छा", 1), ("dakshin13", 13, "दक्षिण", 1),
    ("kyunki14", 14, "क्योंकि", 1), ("fansa14", 14, "फँसा", 1), ("pacific14", 14, "Pacific", 1), ("andes14", 14, "Andes,", 1), ("parvat14", 14, "पर्वतमाला", 1),
    ("chaude15", 15, "चौड़े", 1), ("lambe15", 15, "लंबे", 1), ("chile15", 15, "Chile", 1), ("neeche15", 15, "नीचे", 1), ("chor15", 15, "छोर", 1),
    ("uttar16", 16, "उत्तर", 1), ("y1879", 16, "1879", 1), ("bolivia16", 16, "Bolivia", 1), ("peru16", 16, "Peru", 1),
    ("jung17", 17, "जंग", 1), ("bolivia17", 17, "Bolivia", 1), ("kinara17", 17, "किनारा", 1), ("peru17", 17, "Peru", 1), ("hissa17", 17, "हिस्सा", 1),
    ("bhai18", 18, "भाई", 1), ("samandar18", 18, "समंदर", 1),
    ("bolivia19", 19, "Bolivia", 1), ("navy19", 19, "Navy", 1), ("jheel19", 19, "झील", 1),
    ("bhejo20", 20, "भेजो", 1), ("mirchi20", 20, "मिर्ची", 1),
]
# English words, numbers and the creator's spellings vs how Whisper wrote them (alignment only)
ALIAS = {"chile": "चिली", "chile!": "चिली", "india": "इंडिया", "kashmir": "कशमीर", "kanyakumari": "कन्या", "1,000": "एक", "delhi": "डेल्ली", "agra": "आग्रा",
         "inca": "इंका", "mapuche": "मापूचे", "spain": "स्पेन", "pacific": "पासिफिक", "ocean": "ओशन", "andes": "अंडीज", "andes,": "अंडीज",
         "bolivia": "बोलीविया", "peru": "पेरू", "navy": "नेवी", "1879": "1889", "पूरब": "पूरभ", "चौड़ाई": "चौलाई", "शक्ल": "शकल", "फँसा": "पसा",
         "दक्षिण": "डक्षन", "बातचीत": "बाच्छीत", "खूबसूरत": "खुपसूरत", "साहब": "साब", "यहीं": "यही", "झील": "जील", "शुरुआत": "स्टुर्वात", "ज़मीन": "जमीन"}


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
    (ROOT / "src" / "chile" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
