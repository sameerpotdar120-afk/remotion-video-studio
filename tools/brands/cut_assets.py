"""Cut the creator's Brands props (rendered on pure white) out to transparent PNGs.

    python3 -I tools/everest/cut_assets.py <folder with the PNGs>

Keys the white that touches the border (strict threshold), fills holes, and for the props with see-through gaps
(the crinoid's fronds, the gap between the arm and the ice axe) also keys enclosed pure-white islands.
Writes public/brands/img/<name>.png and public/brands/img_sizes.json.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "brands" / "img"
PROPS = {  # name: key enclosed white islands too
    "br01_canvas_shoes": False, "br02_wool_sweater": False, "br03_tomas_bata": False, "br04_noodles": False,
    "br05_toothpaste": False, "br06_soap": True, "br07_king_louis_philippe": False, "br08_formal_shirt": False,
    "br09_leather_shoes": False, "br10_opera_stage": False, "br11_lipstick": False,
}


def key(im: Image.Image, holes: bool, cap: int = 2400) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (a.min(axis=2) > 244) & (a.max(axis=2) - a.min(axis=2) < 9)
    lab, n = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ndimage.binary_fill_holes(~np.isin(lab, list(border)))
    if holes:
        h, w = white.shape
        sizes = ndimage.sum(white, lab, range(1, n + 1))
        drop = [i for i, s in enumerate(sizes, 1) if i not in border and s > h * w * 4e-5]
        fg &= ~np.isin(lab, drop)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.4))
    out = im.convert("RGBA")
    # de-fringe: pull the white halo at the edge toward the neighbouring colour
    rgb = np.asarray(out).astype(np.float32)
    al = np.asarray(alpha).astype(np.float32)[..., None] / 255
    edge = (al > 0.02) & (al < 0.98)
    rgb[..., :3] = np.where(edge, np.clip((rgb[..., :3] - 255 * (1 - al)) / np.maximum(al, 0.05), 0, 255), rgb[..., :3])
    out = Image.fromarray(rgb.astype(np.uint8), "RGBA")
    out.putalpha(alpha)
    out = out.crop(alpha.getbbox())
    k = min(1.0, cap / max(out.size))
    if k < 1:
        out = out.resize((round(out.width * k), round(out.height * k)), Image.LANCZOS)
    return out


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name, holes in PROPS.items():
        im = key(Image.open(src / f"{name}.png"), holes)
        im.save(OUT / f"{name}.png", optimize=True)
        sizes[name] = {"w": im.width, "h": im.height}
        print(name, im.size)
    (ROOT / "public" / "brands" / "img_sizes.json").write_text(json.dumps(sizes, indent=1))


if __name__ == "__main__":
    main()
