"""Cues and captions for the House vs Senate video, from faster-whisper "small" word times on the creator's VO
(public/uscongress/vo_words.txt: "start:word" pairs).

    python3 -I tools/uscongress_timing.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "uscongress" / "edit" / "timing.json"
DURATION = 75.8
CUES = [  # name, word, nth occurrence (1-based)
    ("flip", "flip", 1), ("but", "But", 1), ("wyoming0", "Wyoming's", 1), ("n588", "588", 1), ("senators0", "senators", 1),
    ("ny0", "New", 1), ("n20m", "20", 1), ("heres", "Here's", 1), ("this", "This", 1), ("whitehouse", "White", 1),
    ("president0", "president", 1), ("andjust", "And", 1), ("capitol", "Capitol,", 1), ("meets", "meets.", 1),
    ("chambers", "chambers,", 1), ("house1", "House", 2), ("n435", "435", 1), ("senate1", "Senate", 1), ("n100", "100.", 1),
    ("inhouse", "In", 1), ("population", "population.", 1), ("ny26", "26", 1), ("wyoming2", "Wyoming,", 1), ("one", "one.", 1),
    ("each", "Each", 1), ("elects", "elects", 1), ("everyseat", "every", 1), ("twoyears", "two", 2), ("so", "So", 1),
    ("dominate", "dominate", 1), ("exactly", "exactly", 1), ("senateexists", "Senate", 2), ("insenate", "In", 2),
    ("twosen", "two", 3), ("nomatter", "no", 1), ("n50", "50", 1), ("n100b", "100", 1), ("senserve", "Senators", 1),
    ("six", "six", 1), ("third", "third", 1), ("november", "November,", 1), ("n35", "35.", 1), ("topass", "To", 1),
    ("federal", "federal", 1), ("both", "both", 1), ("signs", "signs", 1), ("thatswhy", "That's", 1), ("mattered", "mattered.", 1),
    ("whoever", "Whoever", 1), ("bothch", "both", 2), ("reach", "reach", 1), ("should", "So", 2), ("half", "half", 1),
    ("samevote", "same", 1), ("ny20b", "20", 2), ("yorkers", "Yorkers?", 1),
]


def main() -> None:
    raw = (ROOT / "public" / "uscongress" / "vo_words.txt").read_text().split()
    words = []
    for tok in raw:
        t, w = tok.split(":", 1)
        if w.startswith(",") and words:  # "588 ,000" -> "588,000"
            words[-1][1] += w
            continue
        words.append([float(t), w])
    cues = {}
    for name, w, nth in CUES:
        hits = [t for t, x in words if x == w or x.split(",")[0] == w]
        if len(hits) < nth:
            raise SystemExit(f"cue {name}: {w} x{nth} found {len(hits)}")
        cues[name] = hits[nth - 1]
    cues["end"] = words[-1][0] + 0.9
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": DURATION, "cues": cues, "caps": [[round(t, 2), w] for t, w in words]}, indent=1))
    print(OUT, len(words), "words", len(cues), "cues")


if __name__ == "__main__":
    main()
