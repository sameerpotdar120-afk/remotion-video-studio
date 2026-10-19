"""Beat timing for the Hundred Years' War video.

    python3 tools/hundredyears_timing.py                # estimate
    python3 tools/hundredyears_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Without a words file it writes an estimate at the creator's pace, so the edit can be built before the VO arrives.

Writes src/hundredyears/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "hundredyears" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("n116_1", 1, "116", 1), ("desh1", 1, "देश", 1), ("rok1", 1, "रोक", 1),
    ("n17_2", 2, "17", 1), ("beti2", 2, "बेटी", 1), ("rukh2", 2, "रुख़", 1), ("par2", 2, "पर", 1), ("dard2", 2, "दर्द", 1),
    ("n1337_3", 3, "1337", 1), ("edward3", 3, "Edward", 1), ("khayal3", 3, "ख़याल", 1), ("maa3", 3, "माँ", 1), ("raja3", 3, "राजा", 2), ("kyon3", 3, "क्यों", 1),
    ("mana4", 4, "मना", 1), ("zid4", 4, "ज़िद", 1), ("hundred4", 4, "Hundred", 1),
    ("ghud5", 5, "घुड़सवार", 1), ("jaldi5", 5, "जल्दी", 1), ("longbow5", 5, "longbow", 1), ("kagaz5", 5, "काग़ज़", 1),
    ("saal6", 6, "साल", 1), ("toot6", 6, "टूट", 1), ("khel6", 6, "खेल", 1),
    ("domremy7", 7, "Domrémy", 1), ("joan7", 7, "Joan", 1), ("shahi7", 7, "शाही", 1), ("fauj7", 7, "फ़ौज", 1), ("yakeen7", 7, "यकीन", 1), ("upar7", 7, "ऊपर", 1),
    ("bachana7", 7, "बचाना", 1),
    ("jhande8", 8, "झंडे", 1), ("jaan8", 8, "जान", 1),
    ("n1429_9", 9, "1429", 1), ("orleans9", 9, "Orléans", 1), ("teer9", 9, "तीर", 1), ("ghera9", 9, "घेरा", 2), ("reims9", 9, "Reims", 1), ("charles9", 9, "Charles", 1),
    ("dushman10", 10, "दुश्मन", 1), ("ladki10", 10, "लड़की", 1),
    ("burgundy11", 11, "Burgundy", 1), ("bech11", 11, "बेच", 1), ("rouen11", 11, "Rouen", 1), ("ilzaam11", 11, "इल्ज़ाम", 1), ("kapde11", 11, "कपड़े", 1),
    ("bhatkaya11", 11, "भटकाया", 1), ("n19_11", 11, "19", 1), ("jala11", 11, "जला", 1),
    ("aag12", 12, "आग", 1), ("ummeed12", 12, "उम्मीद", 1), ("n1453_12", 12, "1453", 1), ("jeet12", 12, "जीत", 1),
    ("church13", 13, "Church", 1), ("churail13", 13, "चुड़ैल", 1), ("n500_13", 13, "500", 1), ("saint13", 13, "Saint", 1), ("insaaf13", 13, "इंसाफ़", 1),
    ("dhokha13", 13, "धोखा", 1), ("comment13", 13, "Comment", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"england": "इंगलेंड", "edward": "एडवर्ट", "iii": "तीसरे", "france": "फ्रान्स", "hundred": "100", "years'": "येर्स", "war": "वॉर्व", "longbow": "लॉंबो",
         "domrémy": "डोमरेमी", "joan": "जोन", "of": "औफ", "arc": "आक", "orléans": "औलियोंस", "reims": "रीमस", "charles": "चाल्ड", "vii": "सात्वा",
         "burgundy": "बर्गंडी", "rouen": "रूओं", "church": "चर्च", "saint": "सेंट", "comment": "कोमेंट", "19": "उन्नीस",
         "तक": "तड़", "पलट": "पलड़", "अंत": "अन्ध", "ज़िद": "जिट", "घुड़सवार": "गूर्सवार", "काग़ज़": "कागस", "टूट": "तूट", "हाथ": "हात", "झंडे": "जंडे",
         "फूँक": "पूक", "तोड़": "तोर", "अदालत": "अधालत", "जिस्म": "जिसम", "उम्मीद": "उमीत", "चुड़ैल": "चुढैल", "लगभग": "लगभक", "धोखा": "दोखा",
         "लिखो।": "लिख", "दुश्मन": "दुष्मन", "राजकुमारी": "राज्कुमारी", "पड़ा": "पढ़ा"}


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
    (ROOT / "src" / "thailand" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
