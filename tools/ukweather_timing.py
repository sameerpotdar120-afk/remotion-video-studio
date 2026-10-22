"""Beat timing for the UK weather video.

    python3 tools/ukweather_timing.py                # estimate
    python3 tools/ukweather_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Writes src/ukweather/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "ukweather" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("india1", 1, "India", 1), ("bharosa1", 1, "भरोसा", 1), ("par1", 1, "पर", 1), ("britain1", 1, "Britain", 1), ("hisaab1", 1, "हिसाब", 1),
    ("socho2", 2, "सोचो", 1), ("mumbai2", 2, "Mumbai", 1), ("london2", 2, "London", 1), ("subah2", 2, "सुबह", 1), ("baarish2", 2, "बारिश", 1),
    ("kohra2", 2, "कोहरा", 1), ("dhoop2", 2, "धूप", 1), ("n10_2", 2, "10", 1), ("ole2", 2, "ओले", 1), ("hawa2", 2, "हवा", 1), ("free2", 2, "free", 1),
    ("scotland3", 3, "Scotland", 1), ("n250_3", 3, "250", 1), ("din3", 3, "दिन", 1), ("dekh3", 3, "देखकर", 1), ("geeli3", 3, "गीली", 1),
    ("nahi4", 4, "नहीं", 1),
    ("duniya5", 5, "दुनिया", 1), ("n70_5", 5, "70", 1), ("britain5", 5, "Britain", 1), ("pehle5", 5, "पहले", 1), ("colombia5", 5, "Colombia", 1),
    ("n3240_5", 5, "3,240", 1), ("wajah5", 5, "वजह", 1), ("garm5", 5, "गर्म", 1), ("pacific5", 5, "Pacific", 1), ("pahaad5", 5, "पहाड़", 1),
    ("toh6", 6, "तो", 1), ("ajeeb6", 6, "अजीब", 1),
    ("kyunki7", 7, "क्योंकि", 1), ("jang7", 7, "जंग", 1), ("chaar7", 7, "चार", 1), ("takrati7", 7, "टकराती", 1),
    ("pashchim8", 8, "पश्चिम", 1), ("sponsor8", 8, "sponsor", 1), ("gulf8", 8, "Gulf", 1), ("garm8", 8, "गर्म", 1), ("nami8", 8, "नमी", 1), ("barsa8", 8, "बरसा", 1),
    ("uttar9", 9, "उत्तर", 1), ("arctic9", 9, "Arctic", 1), ("dakshin9", 9, "दक्षिण", 1), ("poorab9", 9, "पूरब", 1), ("europe9", 9, "Europe", 1),
    ("jeet10", 10, "जीतती", 1), ("mausam10", 10, "मौसम", 1),
    ("video11", 11, "video", 1), ("dost11", 11, "दोस्त", 1), ("london11", 11, "London", 1), ("chhata11", 11, "छाता", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"india": "इंडिया", "britain": "ब्रिटन", "mumbai": "मुम्बाई", "london": "लंड़न", "free": "फ्री", "scotland": "सकौटलेंट", "250": "थाई",
         "70": "सत्तर", "colombia,": "कॉलंबिया", "colombia": "कॉलंबिया", "pacific": "पासिफिक", "ocean,": "ओशन", "sponsor,": "स्पूंसर", "gulf": "गल्फ",
         "stream.": "स्ट्रीम", "arctic": "आक्टिक", "europe": "योरोप", "video": "विडियो", "10": "दस", "भरोसा": "भरूसा", "कोहरा,": "कोह्रा",
         "मिलीमीटर": "मिलिमेटर", "वजह": "वजा", "ऊँचे": "उचे", "पहाड़।": "पहाड", "जीतती": "जीती", "छाता": "चाता", "पश्चिम": "पश्छिन", "दक्षिण": "दक्षण",
         "टकराती": "तकराती", "ठंडी": "थंडी", "भरकर": "बरकर", "सपना": "सप्ना", "जगह": "जगा"}


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
    (ROOT / "src" / "ukweather" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
