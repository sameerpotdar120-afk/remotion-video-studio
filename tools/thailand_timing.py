"""Beat timing for the Thailand video.

    python3 tools/thailand_timing.py                # estimate
    python3 tools/thailand_timing.py words.json     # real word timings (faster-whisper output, keys w/s/e)

Without a words file it writes an estimate at the creator's pace, so the edit can be built before the VO arrives.

Writes src/thailand/edit/timing.json: named cue times, caption chunks, duration. Cues are anchored to words of the script.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "public" / "thailand" / "script_hindi.txt"

# (cue, line number from 1, a substring of the word it lands on, occurrence in that line)
CUES = [
    ("britain1", 1, "Britain", 1), ("india1", 1, "India", 1), ("n200_1", 1, "200", 1), ("raj1", 1, "राज", 1), ("bagal1", 1, "बगल", 1), ("desh1", 1, "देश", 1),
    ("ghulam1", 1, "ग़ुलाम", 1), ("kaise1", 1, "कैसे", 1),
    ("thailand2", 2, "Thailand", 1), ("siam2", 2, "Siam", 1),
    ("jawab3", 3, "जवाब", 1), ("simple3", 3, "simple", 1), ("britain3", 3, "Britain", 1), ("france3", 3, "France", 1), ("fayda3", 3, "फ़ायदा", 1),
    ("paschim4", 4, "पश्चिम", 1), ("india4", 4, "India", 1), ("teen4", 4, "तीन", 1), ("burma4", 4, "Burma", 1), ("british4", 4, "British", 1), ("hissa4", 4, "हिस्सा", 1),
    ("poorab5", 5, "पूरब", 1), ("vietnam5", 5, "Vietnam", 1), ("cambodia5", 5, "Cambodia", 1),
    ("beech6", 6, "बीच", 1), ("siam6", 6, "Siam", 1),
    ("dono7", 7, "दोनों", 1), ("nigal7", 7, "निगल", 1), ("dikkat7", 7, "दिक्कत", 1), ("leta7", 7, "लेता", 1), ("sarhad7", 7, "सरहद", 1), ("mil7", 7, "मिलती", 1), ("jang7", 7, "जंग", 1),
    ("hua8", 8, "हुआ", 1),
    ("l9", 9, "ये", 1), ("l10", 10, "कहीं", 1), ("l11", 11, "मैं", 1), ("par11", 11, "पर", 1), ("l12", 12, "तो", 1), ("l13", 13, "तो", 1), ("l14", 14, "Deal", 1),
    ("bas15", 15, "बस", 1), ("gaddi15", 15, "गद्दी", 1), ("n1896_15", 15, "1896", 1), ("chao15", 15, "Chao", 1), ("koi15", 15, "कोई", 1),
    ("matlab16", 16, "मतलब", 1), ("safe16", 16, "safe", 1), ("kinare16", 16, "किनारे", 1), ("gaye16", 16, "गए", 1),
    ("french17", 17, "French", 1), ("bangkok17", 17, "Bangkok", 1), ("laos17", 17, "Laos", 1), ("baad17", 17, "बाद", 1), ("cambodia17", 17, "Cambodia", 1),
    ("malaya17", 17, "Malaya", 1), ("britain17", 17, "Britain", 1),
    ("rajaon18", 18, "राजाओं", 1), ("modern18", 18, "modern", 1), ("army18", 18, "army", 1), ("railway18", 18, "railway", 1), ("kanoon18", 18, "कानून", 1),
    ("hamla18", 18, "हमला", 1), ("bahana18", 18, "बहाना", 1),
    ("kinare19", 19, "किनारे", 1), ("dil19", 19, "दिल", 1),
    ("isiliye20", 20, "इसीलिए", 1), ("colony20", 20, "colony", 1),
    ("video21", 21, "video", 1), ("dost21", 21, "दोस्त", 1), ("ladai21", 21, "लड़ाई", 1), ("bachkar21", 21, "बचकर", 1),
]
# English words and the creator's spellings vs how Whisper writes them (alignment only)
ALIAS = {"britain": "ब्रिटन", "india": "इंडिया", "thailand": "थाइलेंड", "thailand,": "थाइलेंड", "siam": "सियाम", "simple": "सिमपल", "france": "फ्रान्स",
         "british": "ब्रिटिश", "burma": "बर्मा", "vietnam": "वियतनाम", "cambodia": "कम्बोडिया", "deal": "दील", "chao": "चाउफ्राया", "french": "फ्रेंच",
         "bangkok": "बैंकॉक", "laos": "लाउस", "malaya": "मलाया", "modern": "मौडन", "army": "आर्मी", "railway": "रेल्वे", "colony": "कौलनी", "video": "विडियो",
         "safe": "सेफ", "दुश्मनी": "दुष्मनी", "पश्चिम": "पश्चम", "पूरब": "पूरभ", "कब्ज़ा": "कभ्जा", "फँसा": "फसा", "झटके": "जटके", "सरहद": "सरहथ", "तय": "तै",
         "छोड़ो": "चोड़ो", "गद्दी": "गद्धी", "छुएगा": "चुएगा", "जहाज़": "जहाज", "चढ़": "चड़ाए", "राजाओं": "राजाओ", "उन्होंने": "उनहोने", "लड़ना": "लडना",
         "लड़ाई": "लडाई", "छोड़ा": "चोडा", "दिए": "दिये", "इसीलिए": "इसी", "सिमपल": "सिमपल", "1896": "1896", "200": "200"}


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
