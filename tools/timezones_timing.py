"""Beat timing for the time zones video.

    python3 tools/timezones_timing.py                # estimate
    python3 tools/timezones_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Without a words file it writes an estimate at the creator's pace, so the edit can be built before the VO arrives.

Writes src/timezones/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "timezones" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("naksha1", 1, "नक़्शा", 1), ("n24_1", 1, "24", 1), ("seedhi1", 1, "सीधी", 1), ("kyon1", 1, "क्यों", 1), ("ghadi1", 1, "घड़ी", 1), ("subah1", 1, "सुबह", 1), ("chheen1", 1, "छीन", 1),
    ("london2", 2, "London", 1), ("greenwich2", 2, "Greenwich", 1), ("yahin2", 2, "यहीं", 1), ("zero2", 2, "0", 1), ("utc2", 2, "UTC", 1),
    ("poorab3", 3, "पूरब", 1), ("p1_3", 3, "+1", 1), ("p2_3", 3, "+2", 1), ("p3_3", 3, "+3", 1), ("paschim3", 3, "पश्चिम", 1), ("m1_3", 3, "-1", 1), ("m2_3", 3, "-2", 1),
    ("india3", 3, "India", 1), ("ist3", 3, "+5:30", 1), ("saadhe3", 3, "साढ़े", 1),
    ("socho4", 4, "सोचो", 1), ("seedhi4", 4, "सीधी", 1), ("kya4", 4, "क्या", 1),
    ("ist5", 5, "IST", 1), ("mirzapur5", 5, "Mirzapur", 1), ("seedhi5", 5, "सीधी", 1), ("mirzapur5b", 5, "Mirzapur", 2), ("beech5", 5, "बीच", 1), ("kat5", 5, "कट", 1),
    ("gali6", 6, "गली", 1), ("five6", 6, "5", 1), ("bagal6", 6, "बगल", 1), ("six6", 6, "6", 1),
    ("jhamela7", 7, "झमेले", 1), ("seema7", 7, "सीमाओं", 1), ("mod7", 7, "मोड़", 1),
    ("sabse8", 8, "सबसे", 1), ("russia8", 8, "Russia", 1), ("america8", 8, "America", 1), ("france8", 8, "France", 1), ("dweep8", 8, "द्वीपों", 1), ("n12_8", 8, "12", 1),
    ("ulta9", 9, "उल्टा", 1), ("china9", 9, "China", 1), ("n5_9", 9, "5", 1), ("ghadi9", 9, "घड़ी", 1), ("beijing9", 9, "Beijing", 1), ("natija9", 9, "नतीजा", 1),
    ("kashgar9", 9, "Kashgar", 1), ("sardi9", 9, "सर्दियों", 1), ("n10_9", 9, "10", 1),
    ("india10", 10, "India", 1), ("n3000_10", 10, "3,000", 1), ("ghadi10", 10, "घड़ी", 1), ("garmi10", 10, "गर्मियों", 1), ("arunachal10", 10, "Arunachal", 1), ("n4_10", 10, "4", 1),
    ("gujarat10", 10, "Gujarat", 1), ("n6_10", 10, "6", 1),
    ("assam11", 11, "Assam", 1), ("bagan11", 11, "बागानों", 1), ("angrez11", 11, "अंग्रेज़ों", 1), ("alag11", 11, "अलग", 1), ("bagaan11", 11, "बागान", 2), ("n1_11", 11, "1", 1),
    ("nepal12", 12, "Nepal", 1), ("mazedar12", 12, "मज़ेदार", 1), ("n15_12", 12, "15", 1),
    ("batao13", 13, "बताओ", 1), ("india13", 13, "India", 1), ("n2_13", 13, "2", 1), ("haan13", 13, "हाँ", 1), ("comment13", 13, "comment", 1),
]
# English words, numbers and the creator's spellings vs how Whisper writes them (alignment only; extend once the VO is in)
ALIAS = {"time": "टाइम", "zones": "जोन्स", "zones,": "जोन्स", "london": "लंड़न", "greenwich": "greenwich", "utc": "utc", "india": "इंडिया", "ist": "ist",
         "mirzapur": "मिर्जापूर", "russia": "रश्या", "america": "अमेरिका", "france": "फ्रान्स", "china": "चाइना", "beijing": "बीजिंग",
         "kashgar": "काशगर", "arunachal": "अरुनाचल", "gujarat": "गुज्रात", "assam": "असम", "nepal": "नेपाल", "comment": "कमेंट",
         # digits as the creator says them, and Whisper's spellings
         "+1": "एक", "+2": "दो", "+3": "तीन", "1": "एक", "2": "दो", "+530": "पाज", "0": "शून्ने", "5": "पाच", "12": "बारा", "3000": "3000", "3,000": "3000",
         "नक़्शा": "नक्षा", "क्यों": "क्यू", "सुबह": "सूबह", "छीन": "चीन", "गुज़रती": "गुजरती", "पीछे": "पीचे", "जिस": "जस", "फिर": "पिर", "झमेले": "जमेले",
         "सीमाओं": "सीमाों", "मोड़": "मोढ़", "फैले": "पहले", "द्वीपों": "दुीपों", "चौड़ाई": "चौडाई", "घड़ी": "घडी", "सूरज": "सूरच", "लगभग": "लगभक",
         "किलोमीटर": "किलोमेटर", "घंटा": "घण्टा", "हाँ": "हां", "ज़्यादा": "ज़ाइदा", "चौड़ा": "चौडा", "निकल": "निकलाता", "ज़माने": "जमाने", "टाइम\"।": "टाइंग"}


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
    (ROOT / "src" / "timezones" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
