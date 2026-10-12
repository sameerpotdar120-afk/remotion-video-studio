"""Beat timing for the Cooch Behar enclaves video.

    python3 tools/coochbehar_timing.py                 # estimate from the script (no voiceover yet)
    python3 tools/coochbehar_timing.py words.json      # real word timings (faster-whisper output)
    python3 tools/coochbehar_timing.py words.json voiceover.srt   # + captions in the SRT's own spelling

Writes src/coochbehar/timing.json: named cue times, caption chunks, duration.
Cues are anchored to words of the script, so the animation follows the voice.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "coochbehar" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("kya1", 1, "क्या", 1), ("y2015", 1, "2015", 1), ("bharat1", 1, "भारत", 1), ("n111", 1, "111", 1), ("bd1", 1, "Bangladesh", 1), ("band1", 1, "बंद", 1),
    ("raat2", 2, "रात", 1), ("hazaron2", 2, "हज़ारों", 1), ("soye2", 2, "सोए", 1), ("jaage2", 2, "जागे", 1), ("kyon2", 2, "क्यों", 1),
    ("kahani3", 3, "कहानी", 1), ("cooch3", 3, "Cooch", 1), ("border3", 3, "बॉर्डर", 1), ("lakeer3", 3, "लकीर", 1), ("n162", 3, "162", 1),
    ("anokha4", 4, "अनोखा", 1), ("dahala4", 4, "Dahala", 1),
    ("sochiye5", 5, "सोचिए", 1), ("khet5", 5, "खेत", 1), ("bharat5", 5, "भारत", 1), ("charon5", 5, "चारों", 1), ("bd5", 5, "Bangladesh", 1),
    ("bdi6", 6, "Bangladeshi", 1), ("bharat6", 6, "भारत", 1), ("ghira6", 6, "घिरा", 1), ("poore6", 6, "पूरे", 1), ("bd6", 6, "Bangladesh", 2),
    ("yaani7", 7, "यानी", 1), ("doosra7", 7, "दूसरा", 1), ("pehla7", 7, "पहला", 1), ("duniya7", 7, "दुनिया", 1), ("chakra7", 7, "चक्रव्यूह", 1),
    ("kehte8", 8, "कहते", 1), ("raja8", 8, "राजा", 1), ("shatranj8", 8, "शतरंज", 1), ("daanv8", 8, "दाँव", 1),
    ("y1947", 9, "1947", 1), ("batware9", 9, "बँटवारे", 1), ("phans9", 9, "फँस", 1),
    ("sochiye10", 10, "सोचिए", 1), ("n68", 10, "68", 1), ("n51k", 10, "51,000", 1), ("pehchan10", 10, "पहचान", 1),
    ("bharat11", 11, "भारत", 1), ("sarkar11", 11, "सरकार", 1), ("bd11", 11, "Bangladesh", 1),
    ("bachche12", 12, "बच्चे", 1), ("school12", 12, "School", 1), ("bukhar12", 12, "बुखार", 1), ("dawa12", 12, "दवा", 1), ("sarhad12", 12, "सरहद", 1), ("jaan12", 12, "जान", 1),
    ("phir13", 13, "फिर", 1), ("n31", 13, "31", 1), ("aadhi13", 13, "आधी", 1), ("itihas13", 13, "इतिहास", 1), ("donon13", 13, "दोनों", 1), ("nakshe13", 13, "नक्शे", 1),
    ("parivar14", 14, "परिवारों", 1), ("mushkil14", 14, "मुश्किल", 1), ("sawal14", 14, "सवाल", 1),
    ("zameen15", 15, "ज़मीन", 1), ("desh15", 15, "देश", 1),
    ("n1000", 16, "1,000", 1), ("tirange16", 16, "तिरंगे", 1), ("mitti16", 16, "मिट्टी", 1), ("chhod16", 16, "छोड़कर", 1),
    ("sach17", 17, "सच", 1), ("ghar17", 17, "घर", 1), ("desh17", 17, "देश", 1), ("kise17", 17, "किसे", 1),
]
# English words in the script vs how Whisper spelled them in Devanagari (alignment only)
ALIAS = {"bangladesh": "बांगलादेश", "bangladeshi": "बांगलाडेशी", "cooch": "कूच", "behar": "बहर", "dahala": "डहाला", "khagrabari": "खागरभरी",
         "school": "स्कूल", "july": "जॉलाई"}


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
    (ROOT / "src" / "coochbehar" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
