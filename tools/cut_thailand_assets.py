"""Prepare the creator's Thailand images for the edit.

    python3 -I tools/cut_thailand_assets.py <folder with the PNGs>

The three 9:16 backgrounds become 2160×3840 JPEGs; the gunboat (on white) is keyed to a transparent PNG, cropped to the
ship. Writes public/thailand/img/ and public/thailand/img_sizes.json.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "thailand" / "img"


def key_white(im: Image.Image) -> Image.Image:
    """Alpha from the white background: near-white pixels connected to the border become transparent, soft edge."""
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (a.min(axis=2) > 232) & (a.max(axis=2) - a.min(axis=2) < 18)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    alpha = Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    return out.resize((2000, round(out.height * 2000 / out.width)), Image.LANCZOS) if out.width > 2000 else out


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name in ["t01_palace_room_bg", "t02_battlefield_bg", "t03_throne_room_bg"]:
        im = Image.open(src / f"{name}.png").convert("RGB").resize((2160, 3840), Image.LANCZOS)
        im.save(OUT / f"{name}.jpg", quality=92)
        sizes[name] = list(im.size)
    g = key_white(Image.open(src / "t04_french_gunboat.png"))
    g.save(OUT / "t04_french_gunboat.png", optimize=True)
    sizes["t04_french_gunboat"] = list(g.size)
    (ROOT / "public" / "thailand" / "img_sizes.json").write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
