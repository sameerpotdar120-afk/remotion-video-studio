"""Beat timing for the Karl Bushby walk video.

    python3 tools/bushby_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/bushby_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/bushby_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/bushby/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "bushby" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("aap1", 1, "आप", 1), ("thak1", 1, "थक", 1),
    ("aadmi2", 2, "आदमी", 1), ("kasam2", 2, "कसम", 1), ("duniya2", 2, "दुनिया", 1), ("paidal2", 2, "पैदल", 1),
    ("plan3", 3, "Plan", 1), ("n12", 3, "12", 1), ("n28", 3, "28", 1), ("kyon3", 3, "क्यों", 1),
    ("karl4", 4, "Karl", 1), ("y1998", 4, "1998", 1), ("chile4", 4, "Chile", 1), ("chhor4", 4, "छोर", 1), ("gaadi4", 4, "गाड़ी", 1), ("jahaz4", 4, "जहाज़", 1), ("plane4", 4, "Plane", 1),
    ("imtihan5", 5, "इम्तिहान", 1), ("darien5", 5, "Darién", 1), ("jungle5", 5, "जंगल", 1), ("taskar5", 5, "तस्कर", 1), ("hathiyar5", 5, "हथियारबंद", 1),
    ("maut6", 6, "मौत", 1), ("panama6", 6, "Panama", 1), ("visa6", 6, "Visa", 1), ("n18", 6, "18", 1), ("jail6", 6, "जेल", 1),
    ("bering7", 7, "Bering", 1), ("jamne7", 7, "जमने", 1), ("n14", 7, "14", 1), ("barf7", 7, "बर्फ़", 1), ("russia7", 7, "Russia", 1), ("giraftar7", 7, "गिरफ़्तार", 1),
    ("russia8", 8, "Russia", 1), ("n90", 8, "90", 1), ("exit8", 8, "Exit", 1), ("jagah8", 8, "जगह", 1), ("entry8", 8, "Entry", 1),
    ("ban9", 9, "Ban", 1), ("siberia9", 9, "Siberia", 1), ("n11", 9, "11", 1),
    ("pandemic10", 10, "Pandemic", 1), ("sarhad10", 10, "सरहदें", 1),
    ("caspian11", 11, "Caspian", 1), ("russia11", 11, "Russia", 1), ("iran11", 11, "Iran", 1), ("band11", 11, "बंद", 1),
    ("karl12", 12, "Karl", 1), ("kood12", 12, "कूद", 1), ("n31", 12, "31", 1), ("n288", 12, "288", 1), ("naav12", 12, "नाव", 1),
    ("turkey13", 13, "Turkey", 1), ("europe13", 13, "Europe", 1), ("october13", 13, "October", 1), ("channel13", 13, "Channel", 1), ("england13", 13, "England", 1),
    ("n28b", 14, "28", 1), ("n50k", 14, "50,000", 1), ("ghar14", 14, "घर", 1), ("sau14", 14, "सौ", 1),
    ("junoon15", 15, "जुनून", 1), ("pagal15", 15, "पागलपन", 1), ("comment15", 15, "Comment", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"plan": "प्लैन", "karl": "काल", "bushby": "बुशभी", "chile": "चिली", "plane": "प्लेन", "darién": "डारियन", "gap": "गाब", "panama": "पनामा",
         "visa": "वीजा", "bering": "बेरिंग", "strait": "स्ट्रेट", "russia": "रश्या", "exit": "एग्सिट", "entry": "एंट्री", "ban": "बैन", "siberia": "साइबीर्या",
         "pandemic": "पंडमिक", "caspian": "कैसपियंसी", "iran": "इरान", "km": "किलोमेटर", "turkey": "तौकी", "europe": "यौरप", "october": "अक्टोबर",
         "english": "इंगलिज", "channel": "चानल", "england": "इंगलन", "comment": "कोमेंट"}


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
    (ROOT / "src" / "bushby" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
