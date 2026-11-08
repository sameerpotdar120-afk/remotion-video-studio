"""Cut the creator's map-sizes images out of their white backgrounds (flood fill from the border, so white fur and
skin survives), key the green phone screen and atlas pages to transparent (saved as *_screen.png masks), trim, and save at most 2400 px on the long side.

    python3 -I tools/cut_mapsizes_assets.py <src_dir>
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "mapsizes" / "img"


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
    if green.sum() > 10000:  # a phone screen or atlas pages: the green becomes a hole, saved as a mask with its box
        green = ndimage.binary_dilation(green, iterations=3)
        alpha[green] = 0
        mask = Image.fromarray((green * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    al = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(al)
    bb = out.getbbox()
    out = out.crop(bb)
    f = min(1.0, 2400 / max(out.size))
    if f < 1:
        out = out.resize((round(out.width * f), round(out.height * f)), Image.LANCZOS)
    out.save(OUT / src.name, optimize=True)
    if green.sum() > 10000:
        m = mask.crop(bb).resize(out.size, Image.LANCZOS)
        m.save(OUT / (src.stem + "_screen.png"), optimize=True)
        sb = m.point(lambda v: 255 if v > 128 else 0).getbbox()
        lens = [float(v) for v in sb]
    return out.size, lens


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for p in sorted(Path(sys.argv[1]).glob("*.png")):
        size, lens = cut(p)
        meta[p.stem] = {"w": size[0], "h": size[1], **({"screen": [round(v, 1) for v in lens]} if lens else {})}
        print(p.name, meta[p.stem])
    (OUT / "img_sizes.json").write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
