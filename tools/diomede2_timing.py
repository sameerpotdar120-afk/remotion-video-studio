"""Beat timing for Diomede v2.

    python3 tools/diomede2_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/diomede2_timing.py words.json      # real word timings (faster-whisper output)

Writes src/diomede2/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "diomede" / "v2" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("usa", 1, "अमेरिका", 1), ("rus", 1, "रशिया", 1), ("ekdusre", 1, "एक-दूसरे", 1), ("four", 1, "4", 1), ("km4", 1, "किलोमीटर", 1),
    ("kabhi", 2, "कभी-कभी", 1), ("jud", 2, "जुड़", 1), ("kaise", 2, "कैसे", 1), ("dekho", 2, "देखो", 1),
    ("dono", 3, "दोनों", 1), ("bering", 3, "Bering", 1), ("zoom", 3, "ज़ूम", 1),
    ("dikhte", 4, "दिखते", 1), ("diomede", 4, "Diomede", 1), ("d38", 4, "3.8", 1),
    ("little", 5, "Little", 1), ("usa2", 5, "अमेरिका", 1), ("basa", 5, "बसा", 1), ("gaon", 5, "गाँव", 1), ("eighty", 5, "80", 1),
    ("bada", 6, "बड़ा", 1), ("big", 6, "Big", 1), ("rus2", 6, "रशिया", 1), ("fauj", 6, "फ़ौज", 1),
    ("bantwara", 7, "बँटवारा", 1), ("y1867", 7, "1867", 1), ("usa3", 7, "अमेरिका", 1), ("alaska", 7, "Alaska", 1), ("kharida", 7, "ख़रीदा", 1),
    ("sardi", 8, "सर्दियों", 1), ("samandar", 8, "समंदर", 1), ("jamkar", 8, "जमकर", 1), ("pul", 8, "पुल", 1), ("paidal", 8, "पैदल", 1), ("dusre", 8, "दूसरे", 1),
    ("beech", 9, "बीच", 1), ("intl", 9, "International", 1), ("samay", 9, "समय", 1), ("h21", 9, "21", 1),
    ("yaani", 10, "यानी", 1), ("usa4", 10, "अमेरिका", 1), ("rus4", 10, "रशिया", 1), ("gaye", 10, "गए", 1), ("seedhe", 10, "सीधे", 1),
    ("kal", 10, "कल", 1), ("ektarah", 10, "एक", 1), ("time", 10, "टाइम", 1), ("travel", 10, "ट्रैवल", 1),
]

PUNCT = "…।!?,:"


def norm(w: str) -> str:
    w = re.sub(r"[़ँं.…।!?,:\-]", "", w.lower())  # drop nukta/bindu/punctuation for matching
    return w


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
    chunk, start = [], None
    for i, (li, w) in enumerate(words):
        if not chunk:
            start = times[i][0]
        chunk.append(w)
        nxt_line = words[i + 1][0] if i + 1 < len(words) else None
        if len(chunk) >= 4 or w[-1] in PUNCT or nxt_line != li:
            caps.append([round(start, 3), " ".join(chunk)])
            chunk = []
    out = {"source": "voiceover" if len(sys.argv) > 1 else "estimate", "duration": round(end + 0.7, 2), "cues": cues, "caps": caps}
    (ROOT / "src" / "diomede2" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print({k: cues[k] for k in ["rus", "four", "kaise", "bering", "diomede", "little", "gaon", "big", "y1867", "jamkar", "intl", "kal", "time"]})


if __name__ == "__main__":
    main()
