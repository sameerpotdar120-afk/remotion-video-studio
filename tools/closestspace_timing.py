"""Beat timing for the closest-to-space video.

    python3 tools/closestspace_timing.py                # estimate
    python3 tools/closestspace_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Writes src/closestspace/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "closestspace" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("socho1", 1, "सोचो", 1), ("desh1", 1, "देश", 1), ("space1", 1, "space", 1), ("easy1", 1, "easy", 1), ("par1", 1, "पर", 1), ("nahi1", 1, "नहीं", 1),
    ("dhoond2", 2, "ढूँढते", 1), ("unchi2", 2, "ऊँची", 1), ("everest2", 2, "Everest", 1), ("n8849_2", 2, "8,849", 1), ("chhat2", 2, "छत", 1),
    ("choti3", 3, "चोटी", 1), ("border3", 3, "border", 1), ("dakshin3", 3, "दक्षिण", 1), ("nepal3", 3, "Nepal", 1), ("uttar3", 3, "उत्तर", 1), ("china3", 3, "China", 1),
    ("lagta3", 3, "लगता", 1), ("space3", 3, "space", 1), ("nepal3b", 3, "Nepal", 2),
    ("galat4", 4, "ग़लत", 1), ("dharti4", 4, "धरती", 1), ("gol4", 4, "गोल", 1), ("chapti4", 4, "चपटी", 1),
    ("mazak5", 5, "मज़ाक", 1), ("perfect5", 5, "perfect", 1), ("ball5", 5, "ball", 1),
    ("dhuri6", 6, "धुरी", 1), ("ghumav6", 6, "घुमाव", 1), ("equator6", 6, "equator", 1), ("phail6", 6, "फैल", 1), ("poles6", 6, "poles", 1), ("dab6", 6, "दब", 1),
    ("bilkul6", 6, "बिल्कुल", 1), ("rumali6", 6, "रूमाली", 1),
    ("pahad7", 7, "पहाड़", 1), ("samundar7", 7, "समुंदर", 1), ("wazan7", 7, "वज़न", 1), ("hazaron7", 7, "हज़ारों", 1), ("aalu7", 7, "आलू", 1),
    ("natija8", 8, "नतीजा", 1), ("center8", 8, "center", 1), ("equator8", 8, "equator", 1), ("poles8", 8, "poles", 1), ("n21_8", 8, "21", 1),
    ("dhoond9", 9, "ढूँढते", 1), ("equator9", 9, "equator", 1), ("ecuador9", 9, "Ecuador", 1), ("chimb9", 9, "Chimborazo", 1), ("n6263_9", 9, "6,263", 1),
    ("jwala9", 9, "ज्वालामुखी", 1),
    ("everest10", 10, "Everest", 1), ("n2600_10", 10, "2,600", 1), ("center10", 10, "center", 1), ("naapo10", 10, "नापो", 1), ("n2_10", 10, "2", 2), ("door10", 10, "दूर", 1),
    ("matlab11", 11, "मतलब", 1), ("nepal11", 11, "Nepal", 1), ("ecuador11", 11, "Ecuador", 1),
    ("video12", 12, "video", 1), ("dost12", 12, "दोस्त", 1), ("everest12", 12, "Everest", 1), ("kuch12", 12, "कुछ", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"space": "स्पेस", "easy": "इजी", "everest": "एवरेस्ट", "everest2": "एवरिस्ट", "border": "बौडर", "nepal": "नेपाल", "china": "चाइना", "perfect": "पर्फेक्ट", "ball": "बौल",
         "equator": "इक्वेटर", "poles": "पोल्स", "uneven": "अनीवन", "center": "सेंटर", "ecuador": "इक्वेटर", "chimborazo": "चिम्बो", "video": "वीडियो",
         "मीटर।": "मेटर", "मीटर": "मेटर", "छत।": "चठ", "धरती": "धर्ती", "ढूँढते": "दूनदते", "ऊँची": "उची", "जगह:": "जगा", "दक्षिण": "दक्षण", "चपटी": "चप्टी",
         "मज़ाक": "मजाग", "धुरी": "दुरी", "घूमती": "गुमती", "घुमाव": "गुमाव"}


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
    (ROOT / "src" / "closestspace" / "edit" / "timing.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(out["source"], "duration", out["duration"], "cues", len(cues), "caps", len(caps))
    print(cues)


if __name__ == "__main__":
    main()
