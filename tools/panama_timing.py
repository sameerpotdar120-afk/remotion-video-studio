"""Beat timing for the Panama Canal video.

    python3 tools/panama_timing.py                # estimate
    python3 tools/panama_timing.py words.json     # real word timings (faster-whisper output, [s, e, w] lists or keys w/s/e)

The video is a seamless loop, so the duration ends right after the last word ("इसीलिए तो…").
Writes src/panama/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "panama" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("ship1", 1, "ship", 1), ("n53_1", 1, "5.3", 1), ("line1", 1, "line", 1), ("kyun1", 1, "क्यों", 1), ("kyunki1", 1, "क्योंकि", 1), ("paani1", 1, "पानी", 1), ("khatam1", 1, "खत्म", 1),
    ("ajeeb2", 2, "अजीब", 1), ("samundar2", 2, "समुंदर", 1), ("gatun2", 2, "Gatun", 1), ("insaan2", 2, "इंसानों", 1), ("meethe2", 2, "मीठे", 1),
    ("locks2", 2, "Locks", 1), ("n26_2", 2, "26", 1), ("utha2", 2, "उठाकर", 1), ("doosri2", 2, "दूसरी", 1), ("neeche2", 2, "नीचे", 1),
    ("khel3", 3, "खेल", 1), ("n20_3", 3, "20", 1), ("samundar3", 3, "समुंदर", 1), ("olympic3", 3, "Olympic", 1), ("khatam3", 3, "खत्म", 1),
    ("hisaab4", 4, "हिसाब", 1), ("n36_4", 4, "36", 1), ("baarish4", 4, "बारिश", 1),
    ("n2023_5", 5, "2023", 1), ("n22_5", 5, "22", 1), ("jaise5", 5, "जैसे", 1), ("line5", 5, "line", 1), ("auction5", 5, "auction", 1), ("auction5b", 5, "auction", 2),
    ("sept5", 5, "September", 1), ("n53_5", 5, "5.3", 1), ("record5", 5, "record", 1),
    ("ships6", 6, "ships", 1), ("gatun6", 6, "Gatun", 1), ("aadhe6", 6, "आधे", 1), ("peete6", 6, "पीते", 1), ("business6", 6, "business", 1), ("peene6", 6, "पीने", 1),
    ("rio7", 7, "Río", 1), ("dam7", 7, "dam", 1), ("zinda7", 7, "ज़िंदा", 1),
    ("socho8", 8, "सोचो", 1), ("khatam8", 8, "खत्म", 1), ("samerica8", 8, "South", 1), ("n13k_8", 8, "13,000", 1), ("isiliye8", 8, "इसीलिए", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"ship": "शिप", "ships": "शिपस", "million": "मिल्यन", "dollar": "डौलर", "panama": "पैनमा", "canal": "कनाल", "line": "लाइन", "gatun": "गैटन",
         "lake": "लेक", "locks": "लॉक्स", "olympic": "उलिमपिक", "pools,": "पूल्स", "september": "स्प्टेमबर", "slot": "स्लॉट", "auction": "औक्षन",
         "record": "रेकॉड", "business": "बिसनेस", "río": "रियो", "indio": "इंडियो", "dam": "डाम", "south": "साउथ", "america": "अमेरिका",
         "क्यों?": "क्यूं", "क्योंकि": "क्यूकि", "खत्म": "खतम", "झील": "जील", "बड़ी,": "बढ़ी", "मीठे": "मीथे", "ऊपर": "उपर", "मीटर": "मेटर",
         "करोड़": "करोड", "लीटर": "लिटर", "मीठा": "मीथा", "भरती": "बरती", "बारिश": "बारश", "किलोमीटर": "किलोमीतर", "आधे": "आदे", "ज़िंदा": "जिन्दा",
         "लगभग": "लगभक", "तरफ़": "तरफ", "सिर्फ़": "सिर्फ"}


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
    (ROOT / "src" / "panama" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
