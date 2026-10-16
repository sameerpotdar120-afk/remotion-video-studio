"""Beat timing for the Siliguri Corridor (Chicken's Neck) video.

    python3 tools/siliguri_timing.py words.json      # real word timings (faster-whisper output, keys w/s/e)

Writes src/siliguri/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "siliguri" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("socho1", 1, "सोचो", 1), ("n22", 1, "22", 1), ("patti1", 1, "पट्टी", 1), ("kati1", 1, "कटी", 1), ("crore1", 1, "करोड़", 1),
    ("india1", 1, "India", 1), ("khatam1", 1, "ख़त्म", 1), ("kahan1", 1, "कहाँ", 1),
    ("siliguri2", 2, "Siliguri", 1), ("chicken2", 2, "Chicken", 1), ("northeast2", 2, "Northeast", 1), ("n8a2", 2, "8", 1),
    ("rajya2", 2, "राज्य", 1), ("n8b2", 2, "8", 2), ("zameen2", 2, "ज़मीन", 1),
    ("sadak3", 3, "सड़क", 1), ("rail3", 3, "रेल", 1), ("tel3", 3, "तेल", 1), ("sab3", 3, "सब", 1),
    ("nepal4", 4, "Nepal", 1), ("bangla4", 4, "Bangladesh", 1), ("bhutan4", 4, "Bhutan", 1), ("china4", 4, "China", 1), ("chumbi4", 4, "Chumbi", 1),
    ("isiliye5", 5, "इसीलिए", 1), ("rasta5", 5, "रास्ता", 1), ("y2018", 5, "2018", 1), ("ctg5", 5, "Chattogram", 1), ("mongla5", 5, "Mongla", 1),
    ("par6", 6, "पर", 1), ("y2015", 6, "2015", 1), ("zone6", 6, "Zone", 1), ("china6", 6, "China", 1), ("port6", 6, "port", 1), ("paisa6", 6, "पैसा", 1),
    ("teesta7", 7, "Teesta", 1), ("project7", 7, "project", 1), ("karib7", 7, "करीब", 1),
    ("par8", 8, "पर", 1), ("taiyar8", 8, "तैयार", 1), ("army8", 8, "Army", 1), ("n3_8", 8, "3", 1), ("kaladan8", 8, "Kaladan", 1),
    ("myanmar8", 8, "Myanmar", 1), ("mizoram8", 8, "Mizoram", 1),
    ("aur9", 9, "और", 1), ("gardan9", 9, "गर्दन", 1), ("china9", 9, "China", 1), ("tel9", 9, "तेल", 1), ("malacca9", 9, "Malacca", 1),
    ("n28", 9, "2.8", 1), ("darwaze9", 9, "दरवाज़े", 1), ("andaman9", 9, "Andaman", 1),
    ("to10", 10, "तो", 1), ("kamzori10", 10, "कमज़ोरी", 1), ("taqat10", 10, "ताकत", 1), ("comment10", 10, "Comment", 1),
]
# English words in the script vs how Whisper spells them in Devanagari (alignment only; filled from the transcript)
ALIAS = {"india": "इंडिया", "corridor": "कौरिटोर", "northeast": "नौर्थीस्ट", "nepal": "नेपाल", "bangladesh": "बांगलादेश",
         "bhutan": "भूटान", "china": "चाइना", "chumbi": "चुम्बी", "valley": "वाली", "mongla": "मोंगला", "port": "पोट",
         "teesta": "तीस्ता", "army": "आर्मी", "kaladan": "कल्डान", "myanmar": "म्यान्मार", "mizoram": "मिजोरम",
         "malacca": "मलाक्का", "strait": "स्ट्रेट", "comment": "कोमेंट", "project": "प्रोजेक्ट", "neck": "नैक"}


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
    (ROOT / "src" / "siliguri" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
