"""Cut the creator's Dingo Fence images out of their white backgrounds (flood fill from the border, so white fur and
paws survive), key the magnifier's green lens to transparent, trim, and save at most 2400 px on the long side.

    python3 -I tools/cut_dingofence_assets.py <src_dir>
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "dingofence" / "img"


def cut(src: Path) -> tuple:
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    white = (a.min(axis=2) > 236) & ((a.max(axis=2) - a.min(axis=2)) < 20)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    alpha = (~np.isin(lab, list(border))).astype(np.float32)
    lens = None
    g = a[..., 1] - np.maximum(a[..., 0], a[..., 2])
    green = g > 90
    if green.sum() > 10000:  # the magnifier: the green lens becomes a hole; remember where it is
        ys, xs = np.nonzero(green)
        lens = [float(xs.mean()), float(ys.mean()), float((xs.max() - xs.min() + ys.max() - ys.min()) / 4)]
        alpha[ndimage.binary_dilation(green, iterations=3)] = 0
    al = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(al)
    bb = out.getbbox()
    out = out.crop(bb)
    if lens:
        lens = [lens[0] - bb[0], lens[1] - bb[1], lens[2]]
    f = min(1.0, 2400 / max(out.size))
    if f < 1:
        out = out.resize((round(out.width * f), round(out.height * f)), Image.LANCZOS)
        lens = [v * f for v in lens] if lens else None
    out.save(OUT / src.name, optimize=True)
    return out.size, lens


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for p in sorted(Path(sys.argv[1]).glob("*.png")):
        size, lens = cut(p)
        meta[p.stem] = {"w": size[0], "h": size[1], **({"lens": [round(v, 1) for v in lens]} if lens else {})}
        print(p.name, meta[p.stem])
    (OUT / "img_sizes.json").write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
