"""Beat timing for the Twin countries video.

    python3 tools/twins_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/twins_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/twins_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/twins/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "twins" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("maps1", 1, "Maps", 1), ("notice1", 1, "Notice", 1), ("duniya2", 2, "दुनिया", 1), ("judwa2", 2, "जुड़वा", 1),
    ("pehla3", 3, "पहला", 1), ("thai3", 3, "Thailand", 1), ("myan3", 3, "Myanmar", 1),
    ("thai4", 4, "Thailand", 1), ("palat4", 4, "पलट", 1), ("samne4", 4, "सामने", 1), ("myan4", 4, "Myanmar", 1), ("same4", 4, "Same", 1), ("saanche4", 4, "साँचे", 1),
    ("doosra5", 5, "दूसरा", 1), ("africa5", 5, "Africa", 1), ("benin5", 5, "Benin", 1), ("togo5", 5, "Togo", 1),
    ("kandhe6", 6, "कंधे", 1), ("lambe6", 6, "लंबे", 1), ("patle6", 6, "पतले", 1), ("suno6", 6, "सुनो", 1), ("togo6", 6, "Togo", 1), ("n56", 6, "56", 1),
    ("teesra7", 7, "तीसरा", 1), ("famous7", 7, "Famous", 1), ("italy7", 7, "Italy", 1), ("boot7", 7, "Boot", 1),
    ("hazaron8", 8, "हज़ारों", 1), ("vietnam8", 8, "Vietnam", 1), ("boot8", 8, "Boot", 1), ("farak8", 8, "फ़र्क", 1), ("italy8", 8, "Italy", 1),
    ("football8", 8, "Football", 1), ("italy8b", 8, "Italy", 2), ("laat8", 8, "लात", 1),
    ("asli9", 9, "असली", 1), ("aayenge9", 9, "आएँगे", 1), ("norway10", 10, "Norway", 1), ("chile10", 10, "Chile", 1),
    ("mirchi11", 11, "मिर्ची", 1), ("upar11", 11, "ऊपर", 1), ("neeche11", 11, "नीचे", 1), ("aaina11", 11, "आईना", 1),
    ("to12", 12, "तो", 1), ("socho12", 12, "सोचो", 1), ("copy12", 12, "Copy", 1), ("video12", 12, "Video", 1), ("bhejo12", 12, "भेजो", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"notice": "नोतिस", "same": "सेम", "to": "टू", "africa": "अफ्रिका", "benin": "बेनीन", "togo": "तोगो", "km": "किलोमेटर",
         "famous": "फेमस", "italy": "इटली", "boot": "बूट", "vietnam": "वियेतनाम", "football": "फूटबॉल", "norway": "नौर्वे", "chile": "चिली",
         "copy": "कौपी", "video": "विडियो"}


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
    (ROOT / "src" / "twins" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
