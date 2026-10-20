"""Beat timing for the Whisky War video.

    python3 tools/whiskywar_timing.py                # estimate
    python3 tools/whiskywar_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Writes src/whiskywar/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "whiskywar" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("socho1", 1, "सोचो", 1), ("desh1", 1, "देश", 1), ("n49_1", 1, "49", 1), ("jang1", 1, "जंग", 1), ("hathiyar1", 1, "हथियार", 1), ("botal1", 1, "बोतलें", 1),
    ("canada2", 2, "Canada", 1), ("denmark2", 2, "Denmark", 1), ("whisky2", 2, "Whisky", 1), ("ladai2", 2, "लड़ाई", 1), ("patthar2", 2, "पत्थर", 1), ("hans2", 2, "Hans", 1),
    ("door3", 3, "हज़ारों", 1), ("jhagda3", 3, "झगड़ा", 1),
    ("greenland4", 4, "Greenland", 1), ("n1953_4", 4, "1953", 1), ("hissa4", 4, "हिस्सा", 1), ("sarhad4", 4, "सरहद", 1), ("canada4", 4, "Canada", 1),
    ("samundar5", 5, "समुंदर", 1), ("hans5", 5, "Hans", 1), ("n18_5", 5, "18", 1),
    ("n1984_6", 6, "1984", 1), ("sainik6", 6, "सैनिक", 1), ("jhanda6", 6, "झंडा", 1), ("whisky6", 6, "whisky", 1),
    ("usi7", 7, "उसी", 1), ("tom7", 7, "Tom", 1), ("jhanda7", 7, "झंडा", 1), ("schnapps7", 7, "schnapps", 1), ("note7", 7, "note", 1), ("danish7", 7, "Danish", 1),
    ("ab8", 8, "अब", 1), ("jang8", 8, "जंग", 1),
    ("nahi9", 9, "नहीं", 1), ("sainik9", 9, "सैनिक", 1), ("jhanda9", 9, "झंडा", 1), ("botal9", 9, "बोतल", 1), ("canada9", 9, "Canada", 1),
    ("silsila10", 10, "सिलसिला", 1), ("n2022_10", 10, "2022", 1), ("baant10", 10, "बाँट", 1), ("n60_10", 10, "60", 1), ("n40_10", 10, "40", 1),
    ("yun11", 11, "यूँ", 1), ("sarhad11", 11, "सरहद", 1),
    ("tumhare12", 12, "तुम्हारे", 1), ("canada12", 12, "Canada", 1), ("comment12", 12, "Comment", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"canada": "कनड़ा", "denmark": "डेन्माक", "whisky": "विस्की", "war,": "वार", "hans": "हैन्स", "island.": "आयलेंट", "island,": "आयलेंड", "greenland.": "ग्रिन्लांड",
         "greenland": "ग्रिन्लांड", "tom": "टोम", "høyem": "होयम", "schnapps": "सनाप्स", "note:": "नोट", "danish": "डनिश", "island": "आयलेंड", "comment": "कोमेंट",
         "49": "उन्चास", "1953": "तिर्पन", "1984": "चौरासी", "18": "अथारा", "हथियार": "हत्यार", "झंडा": "ज़ंड़ा", "झगड़ा": "जग्ड़ा", "हज़ारों": "हजारो", "बाँट": "बाट",
         "60": "60%", "40": "40%", "प्रतिशत": "", "उतरे,": "उत्रे"}


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
    (ROOT / "src" / "whiskywar" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
