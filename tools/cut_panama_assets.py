"""Cut the creator's Panama Canal props (on pure white) out to transparent PNGs.

    python3 -I tools/cut_panama_assets.py <folder with the PNGs>

Only the white that touches the border is
keyed, with a strict threshold, and the matte is hole-filled. Writes public/panama/img/ and img_sizes.json.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "panama" / "img"
PROPS = ["pc01_lpg_carrier_top", "pc02_container_ship_top", "pc03_container_ship_side", "pc06_gavel_hammer", "pc06b_gavel_block"]
# the full-frame backgrounds: copied as JPEG (no keying)
BGS = ["pc04_dry_lakebed_bg", "pc05_panama_city_bg"]


def key(im: Image.Image, cap: int = 2000, holes: bool = False) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (a.min(axis=2) > 247) & (a.max(axis=2) - a.min(axis=2) < 8)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ndimage.binary_fill_holes(~np.isin(lab, list(border)))
    if holes:
        # the page's punched ring holes: small pure-white islands in the top quarter, see-through
        h, w = white.shape
        sizes = ndimage.sum(white, lab, range(1, lab.max() + 1))
        for i, n in enumerate(sizes, 1):
            if i not in border and h * w * 2e-4 < n < h * w * 5e-3:
                ys, _ = np.nonzero(lab == i)
                if ys.mean() < h * 0.3:
                    fg &= lab != i
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.5))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    k = min(1.0, cap / max(out.size))
    if k < 1:
        out = out.resize((round(out.width * k), round(out.height * k)), Image.LANCZOS)
    return out


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sp = ROOT / "public" / "panama" / "img_sizes.json"
    sizes = json.loads(sp.read_text()) if sp.exists() else {}
    for name in PROPS:
        f = src / f"{name}.png"
        if f.exists():
            im = key(Image.open(f), holes=False)
            im.save(OUT / f"{name}.png", optimize=True)
            sizes[name] = {"w": im.width, "h": im.height}
    for name in BGS:
        f = src / f"{name}.png"
        if f.exists():
            im = Image.open(f).convert("RGB")
            im.save(OUT / f"{name}.jpg", quality=92)
            sizes[name] = {"w": im.width, "h": im.height, "ext": "jpg"}
    sp.write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
