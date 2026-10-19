"""Prepare the creator's closest-to-space images for the edit.

    python3 -I tools/cut_closestspace_assets.py <folder with the PNGs>

Each prop (on white) is keyed to a transparent PNG, cropped and capped at 2000 px wide. The magnifier's empty lens is
keyed out too (the biggest white area not touching the border), and its centre and radius are recorded so the code
lens lines up with the glass. Writes public/closestspace/img/ and public/closestspace/img_sizes.json.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "closestspace" / "img"


def key(im: Image.Image, lens: bool = False):
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (a.min(axis=2) > 230) & (a.max(axis=2) - a.min(axis=2) < 18)
    lab, n = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    info = None
    if lens:
        sizes = ndimage.sum(white, lab, range(1, n + 1))
        inner = [(s, i + 1) for i, s in enumerate(sizes) if (i + 1) not in border]
        _, li = max(inner)
        m = lab == li
        ys, xs = np.nonzero(m)
        info = {"cx": float(xs.mean()), "cy": float(ys.mean()), "r": float((xs.max() - xs.min() + ys.max() - ys.min()) / 4)}
        bg |= m
    alpha = Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    box = out.getbbox()
    out = out.crop(box)
    k = min(1.0, 2000 / out.width)
    if k < 1:
        out = out.resize((round(out.width * k), round(out.height * k)), Image.LANCZOS)
    if info:
        info = {"cx": round((info["cx"] - box[0]) * k, 1), "cy": round((info["cy"] - box[1]) * k, 1), "r": round(info["r"] * k, 1)}
    return out, info


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name in ["cs01_magnifier", "cs02_flat_earth", "cs03_tape_measure", "cs04_rumali_roti"]:
        im, info = key(Image.open(src / f"{name}.png"), lens=name == "cs01_magnifier")
        im.save(OUT / f"{name}.png", optimize=True)
        sizes[name] = {"w": im.width, "h": im.height, **(info or {})}
    (ROOT / "public" / "closestspace" / "img_sizes.json").write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
