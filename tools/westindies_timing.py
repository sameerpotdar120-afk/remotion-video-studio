"""Beat timing for the West Indies video.

    python3 tools/westindies_timing.py                # estimate
    python3 tools/westindies_timing.py words.json     # real word timings (faster-whisper output, [s, e, w] lists or keys w/s/e)

The video is a seamless loop, so the duration ends right after the last word ("इसीलिए तो…").
Writes src/westindies/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "westindies" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("cricket1", 1, "cricket", 1), ("map1", 1, "map", 1), ("nahi1", 1, "मिलेगा", 1),
    ("kyun2", 2, "क्यों", 1), ("desh2", 2, "देश", 1),
    ("caribbean3", 3, "Caribbean", 1), ("cuba3", 3, "Cuba", 1), ("jamaica3", 3, "Jamaica", 1), ("haiti3", 3, "Haiti", 1), ("dr3", 3, "Dominican", 1),
    ("bahamas3", 3, "Bahamas", 1), ("barbados3", 3, "Barbados", 1), ("trinidad3", 3, "Trinidad", 1), ("n13_3", 3, "13", 1),
    ("britain3", 3, "Britain", 1), ("france3", 3, "France", 1), ("neth3", 3, "Netherlands", 1), ("america3", 3, "America", 1),
    ("twist4", 4, "twist", 1), ("cricket4", 4, "Cricket", 1), ("xcuba4", 4, "Cuba", 1), ("xhaiti4", 4, "Haiti", 1), ("xdr4", 4, "Dominican", 1), ("xbah4", 4, "Bahamas", 1),
    ("kyun5", 5, "क्यों", 1), ("britain5", 5, "Britain", 1), ("hamari5", 5, "हमारी", 1), ("jamaica5", 5, "Jamaica", 1), ("barbados5", 5, "Barbados", 1),
    ("trinidad5", 5, "Trinidad", 1), ("chhote5", 5, "छोटे", 1),
    ("ajeeb6", 6, "अजीब", 1), ("island6", 6, "island", 1), ("guyana6", 6, "Guyana", 1), ("samerica6", 6, "South", 1),
    ("naam7", 7, "नाम", 1), ("n500_7", 7, "500", 1), ("columbus7", 7, "Columbus", 1), ("pahunch7", 7, "पहुँच", 1), ("yahi7", 7, "यही", 1),
    ("galti7", 7, "गलती", 1), ("east7", 7, "East", 1), ("west7", 7, "West", 2),
    ("desh8", 8, "देश", 1), ("n1958_8", 8, "1958", 1), ("federation8", 8, "Federation", 1), ("jhanda8", 8, "झंडा", 1), ("sansad8", 8, "संसद", 1),
    ("n4_8", 8, "4", 1), ("jamaica8", 8, "Jamaica", 1), ("vote8", 8, "वोट", 1), ("toot8", 8, "टूट", 1),
    ("toot9", 9, "टूट", 1), ("cricket9", 9, "cricket", 1), ("naam9", 9, "नाम", 1), ("isiliye9", 9, "इसीलिए", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"cricket": "क्रिकेट", "west": "वेस्ट", "indies": "इंडीस", "map": "मैब", "caribbean": "कारिबियन", "islands": "आइलेंड्स", "island": "आइलेंड",
         "cuba": "क्यूबा", "jamaica": "जमेका", "haiti": "हैती", "dominican": "डोमनिकन", "republic": "रिपब्लिक", "bahamas": "बहामास", "barbados": "बार्बाडोस",
         "trinidad": "त्रिनिदाद", "and": "औं", "tobago": "टॉबआगो", "britain": "ब्रिटन", "france": "फ्रान्स", "netherlands": "नेदरलन्स", "america": "अमेरिका",
         "twist": "ट्विस्ट", "team": "टीम", "guyana": "गुयाना", "south": "साउथ", "columbus": "कॉलमबस", "india": "इंडिया", "east": "east",
         "क्यों?": "क्यूं", "क्योंकि": "क्यूकि", "आज़ाद": "आजात", "बचपन": "बच्पन", "ज़मीन": "जमीन", "पड़ा?": "पढ़ा", "झंडा,": "जंड़ा", "संसद।": "संसध",
         "सिर्फ़": "सिर्फ", "टूट": "तूट", "पुराने": "पूराने", "1958": "उन्निस्टो"}


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
        if rec and isinstance(rec[0], list):
            rec = [{"s": s_, "e": e_, "w": w_} for s_, e_, w_ in rec]
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
    out = {"source": "voiceover" if len(sys.argv) > 1 else "estimate", "duration": round(end + 0.06, 2), "cues": cues, "caps": caps}
    (ROOT / "src" / "westindies" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
