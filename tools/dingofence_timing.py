"""Cues and captions for the Dingo Fence video, from faster-whisper "small" word times on the creator's VO
(public/dingofence/vo_words.txt: "start:word" pairs).

    python3 -I tools/dingofence_timing.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "dingofence" / "edit" / "timing.json"
DURATION = 66.4
CUES = [  # name, word, nth occurrence (1-based)
    ("never", "never", 1), ("longest", "longest", 1), ("fence0", "fence", 1), ("but", "but", 1), ("n5614", "5", 1), ("km0", "kilometres", 1),
    ("cut", "cut", 1), ("two", "two.", 1), ("look", "Look", 1), ("closer", "closer.", 1), ("no", "No,", 1), ("notthere", "there.", 1),
    ("there", "There", 1), ("is", "is.", 1), ("runs", "runs", 1), ("three", "three", 1), ("sa", "South", 1), ("nsw", "New", 1),
    ("qld", "Queensland.", 1), ("longer", "longer", 1), ("london", "London", 1), ("ny", "New", 2), ("built", "built", 1),
    ("oneanimal", "one", 1), ("animal", "animal.", 1), ("thisone", "This", 1), ("dingo", "dingo.", 1), ("wild", "wild", 1),
    ("size", "size", 1), ("medium", "medium", 1), ("home", "home.", 1), ("sprint", "sprint", 1), ("n50", "50", 1), ("hour", "hour,", 1),
    ("thousands", "thousands", 1), ("hunted", "hunted", 1), ("kangaroos", "kangaroos", 1), ("small", "small", 1),
    ("then", "Then,", 1), ("y1788", "1788,", 1), ("europeans", "Europeans", 1), ("brought", "brought", 1), ("sheep1", "sheep.", 1),
    ("fora", "For", 1), ("easiest", "easiest", 1), ("meal", "meal", 1), ("farmers", "Farmers", 1), ("traps", "traps", 1),
    ("guns", "guns,", 1), ("losing", "losing", 1), ("so", "so", 1), ("building", "building", 1), ("fences", "fences.", 1),
    ("by", "By", 1), ("y1940", "1940s,", 1), ("joined", "joined", 1), ("giant", "giant", 1), ("barrier", "barrier.", 1),
    ("sheepside", "Sheep", 1), ("oneside", "side,", 1), ("most", "most", 1), ("dingoes", "dingoes", 1), ("other", "other.", 1),
    ("whos", "who's", 1), ("fenced", "fenced", 1), ("thedingoes", "dingoes", 2), ("or", "or", 1), ("sheepq", "sheep?", 1),
]


def main() -> None:
    raw = (ROOT / "public" / "dingofence" / "vo_words.txt").read_text().split()
    words = []
    for tok in raw:
        t, w = tok.split(":", 1)
        if w in ('–', '-'):
            continue
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
