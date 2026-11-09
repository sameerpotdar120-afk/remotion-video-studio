"""Cues and captions for the Korea video, from the creator's VO (public/korea/audio/vo.mp3, 110.99 s).

    python3 -I tools/korea_timing.py

Phrase ends come from ffmpeg silencedetect (-38 dB, 0.18 s); faster-whisper "medium" word times (re-run on 91-108 s,
which the first pass skipped) pin the names and numbers. Caption words are spread over each phrase by length, then pinned.
The loop: the VO ends on "तो ये सब जानने के बाद भी," at 110.75 s and the video is 111.2 s, so the last line runs straight
into "तुम्हें लगता है…" at frame 0.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "korea" / "edit" / "timing.json"
DURATION = 111.2

PHRASES = [  # caption text (numbers as digits), start, end
    ("तुम्हें लगता है Korea की जंग 1953 में खत्म हो गई?", 0.0, 3.4),
    ("खत्म हुई ही नहीं।", 3.84, 5.2),
    ("73 साल हो गए,", 5.56, 7.0),
    ("शांति पर आज तक कोई sign नहीं,", 7.32, 9.6),
    ("और एक लाइन आज भी परिवारों को बाँटे हुए है।", 9.92, 13.2),
    ("क्यों?", 13.44, 13.8),
    ("बीच में बस 4 किलोमीटर की पट्टी है।", 13.86, 16.7),
    ("कांटेदार तार, बारूदी सुरंगें,", 17.1, 19.5),
    ("और दोनों तरफ़ बंदूकें तनी हुई।", 19.68, 21.9),
    ("पर 1945 तक ये एक ही देश था।", 22.26, 25.3),
    ("35 साल से Japan के कब्ज़े में।", 25.66, 28.0),
    ("फिर उसी साल Soviet सेना उत्तर से घुस आई,", 28.08, 31.0),
    ("और America को डर था कि पूरा Korea हाथ से निकल जाएगा।", 31.4, 35.2),
    ("तो दो American officers ने map उठाया,", 35.38, 37.7),
    ("और करीब आधे घंटे में एक लाइन खींच दी:", 37.96, 41.0),
    ("38th parallel।", 41.26, 42.4),
    ("बस। यही है वो लाइन।", 42.94, 44.8),
    ("बँटवारा कुछ समय के लिए था।", 44.86, 47.0),
    ("पर Cold War में ऊपर communism आ गया,", 47.22, 49.8),
    ("नीचे capitalism,", 50.0, 51.0),
    ("और 1948 में दो देश बन गए।", 51.1, 54.0),
    ("और दोनों का दावा एक ही था:", 54.4, 56.4),
    ("पूरा Korea हमारा है।", 56.68, 58.5),
    ("1950 में North ने हमला किया,", 58.6, 61.3),
    ("और लगभग पूरा South जीत लिया।", 61.5, 63.7),
    ("फिर America और UN की फ़ौज आई,", 63.98, 66.2),
    ("और North को China की सीमा तक धकेल दिया।", 66.34, 69.2),
    ("तब China कूदा,", 69.48, 70.6),
    ("लाखों सैनिकों के साथ।", 70.9, 72.4),
    ("और यहीं India आया।", 72.68, 74.1),
    ("हमने लड़ने के लिए फ़ौज नहीं भेजी,", 74.18, 76.7),
    ("बचाने के लिए भेजी।", 76.88, 78.2),
    ("हमारी 60 Para Field Ambulance।", 78.58, 81.0),
    ("627 लोग,", 81.2, 82.6),
    ("जिन्होंने 2.2 लाख से ज़्यादा मरीज़ों का इलाज किया,", 82.72, 86.9),
    ("और 2,324 surgeries कीं,", 87.0, 90.0),
    ("गोलियों के बीच में।", 90.16, 91.16),
    ("3 साल,", 91.7, 92.6),
    ("कम से कम 25 लाख मौतें,", 92.76, 94.66),
    ("और लड़ाई लगभग वहीं रुकी जहाँ से शुरू हुई थी।", 95.13, 98.32),
    ("उसी लाइन के पास।", 98.64, 99.9),
    ("1953 में युद्धविराम हुआ।", 100.22, 102.39),
    ("South Korea ने उस पर sign तक नहीं किया।", 102.78, 105.29),
    ("और शांति समझौता?", 105.8, 106.83),
    ("आज तक नहीं।", 107.0, 108.18),
    ("तो ये सब जानने के बाद भी…", 108.68, 110.75),
]
PINS = [
    (0, "Korea", 0.74), (0, "1953", 1.74), (0, "खत्म", 2.78), (1, "नहीं।", 4.72), (2, "73", 5.56), (3, "sign", 8.94),
    (4, "लाइन", 10.52), (4, "परिवारों", 11.66), (6, "4", 15.02), (6, "पट्टी", 16.0), (7, "तार,", 17.74), (7, "बारूदी", 18.38),
    (8, "बंदूकें", 20.6), (9, "1945", 22.42), (9, "देश", 24.7), (10, "35", 25.66), (10, "Japan", 26.58), (11, "Soviet", 29.12),
    (11, "उत्तर", 30.06), (12, "America", 31.54), (12, "Korea", 33.46), (13, "American", 35.82), (13, "map", 36.88),
    (14, "आधे", 38.46), (14, "लाइन", 40.0), (14, "खींच", 40.3), (15, "38th", 41.26), (16, "यही", 43.74),
    (17, "बँटवारा", 44.86), (18, "Cold", 47.36), (18, "communism", 48.78), (19, "capitalism,", 50.3), (20, "1948", 51.48),
    (20, "दो", 53.02), (21, "दावा", 55.14), (22, "Korea", 57.12), (23, "1950", 58.6), (23, "हमला", 60.44),
    (24, "South", 62.58), (25, "America", 64.16), (25, "UN", 65.0), (26, "China", 67.12), (26, "धकेल", 68.36),
    (27, "China", 69.7), (28, "लाखों", 70.9), (29, "India", 73.46), (30, "लड़ने", 74.9), (31, "बचाने", 76.88),
    (32, "60", 78.96), (32, "Ambulance।", 80.48), (33, "627", 81.2), (34, "2.2", 83.3), (34, "मरीज़ों", 85.5),
    (35, "2,324", 87.3), (35, "surgeries", 88.94), (36, "गोलियों", 90.16), (37, "3", 91.7), (38, "25", 93.28),
    (38, "मौतें,", 94.32), (39, "लड़ाई", 95.3), (39, "रुकी", 96.76), (40, "लाइन", 99.12), (41, "1953", 100.22),
    (41, "युद्धविराम", 101.62), (42, "South", 102.78), (42, "sign", 104.32), (43, "शांति", 106.02), (44, "नहीं।", 107.98),
    (45, "जानने", 109.66),
]
CUES = [
    ("hook", 0, None), ("k1953", 0, "1953"), ("khatam", 1, None), ("n73", 2, "73"), ("sign", 3, "sign"), ("line1", 4, "लाइन"),
    ("parivar", 4, "परिवारों"), ("kyu", 5, None), ("dmz", 6, None), ("n4", 6, "4"), ("patti", 6, "पट्टी"), ("taar", 7, "तार,"),
    ("surang", 7, "बारूदी"), ("bandook", 8, "बंदूकें"), ("ek", 9, None), ("y1945", 9, "1945"), ("desh", 9, "देश"),
    ("n35", 10, "35"), ("japan", 10, "Japan"), ("phir", 11, None), ("soviet", 11, "Soviet"), ("uttar", 11, "उत्तर"),
    ("america1", 12, "America"), ("poora1", 12, "Korea"), ("to2", 13, None), ("officers", 13, "American"), ("map", 13, "map"),
    ("aadhe", 14, "आधे"), ("line2", 14, "लाइन"), ("khinch", 14, "खींच"), ("p38", 15, "38th"), ("bas", 16, None),
    ("yahi", 16, "यही"), ("batwara", 17, None), ("cold", 18, "Cold"), ("comm", 18, "communism"), ("cap", 19, "capitalism,"),
    ("y1948", 20, "1948"), ("do", 20, "दो"), ("dono", 21, None), ("dava", 21, "दावा"), ("poora2", 22, None),
    ("y1950", 23, None), ("hamla", 23, "हमला"), ("south", 24, "South"), ("phir2", 25, None), ("un", 25, "UN"),
    ("china1", 26, "China"), ("dhakel", 26, "धकेल"), ("tab", 27, None), ("china2", 27, "China"), ("lakhon", 28, "लाखों"),
    ("aur3", 29, None), ("india", 29, "India"), ("hamne", 30, None), ("ladne", 30, "लड़ने"), ("bachane", 31, "बचाने"),
    ("hamari", 32, None), ("n60", 32, "60"), ("n627", 33, "627"), ("n22l", 34, "2.2"), ("marij", 34, "मरीज़ों"),
    ("n2324", 35, "2,324"), ("goli", 36, "गोलियों"), ("n3", 37, "3"), ("n25", 38, "25"), ("ladai", 39, "लड़ाई"),
    ("ruki", 39, "रुकी"), ("usi", 40, None), ("usiline", 40, "लाइन"), ("y1953", 41, "1953"), ("vir", 41, "युद्धविराम"),
    ("sk", 42, "South"), ("signtak", 42, "sign"), ("shanti", 43, None), ("aaj", 44, None), ("toye", 45, None),
]


def spread(text: str, t0: float, t1: float) -> list:
    words = text.split()
    w = [len(x) + 2 for x in words]
    tot = sum(w)
    out, acc = [], 0
    for x, k in zip(words, w):
        out.append([round(t0 + (t1 - t0) * acc / tot, 2), x])
        acc += k
    return out


def main() -> None:
    lines = [spread(*p) for p in PHRASES]
    for i, word, t in PINS:
        ws = lines[i]
        j = next(k for k, x in enumerate(ws) if x[1] == word)
        ws[j][0] = t
        for k in range(j + 1, len(ws)):
            ws[k][0] = max(ws[k][0], round(ws[k - 1][0] + 0.12, 2))
        for k in range(j - 1, -1, -1):
            ws[k][0] = min(ws[k][0], round(ws[k + 1][0] - 0.12, 2))
    cues = {}
    for name, i, word in CUES:
        cues[name] = PHRASES[i][1] if word is None else next(x[0] for x in lines[i] if x[1] == word)
    for i, (_, _, t1) in enumerate(PHRASES):
        cues[f"end{i}"] = t1
    caps = [x for ws in lines for x in ws]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": caps}, ensure_ascii=False, indent=1))
    print(OUT, len(caps), "words,", len(cues), "cues")


if __name__ == "__main__":
    main()
