#!/usr/bin/env python3
"""Nauru Short (from the GTA 6 tool): prepare the creator's illustrations and the textures.
Posters -> prep/photos/<name>.jpg (1620x2880). Grey-background images -> cut-outs (alpha PNG): the flat grey is
flood-filled from the border only, so grey inside the figure is kept; the edge is feathered by a pixel.

  python3 -I tools/gta6/prep_images.py <dir with the 12 PNGs> <prep dir>
"""
import pathlib, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, prep = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
(prep / "photos").mkdir(parents=True, exist_ok=True)
CUT = {"r2_minister_grey", "r6_seabird_grey", "r9b_villager_grey", "r11_banknote_stack_grey"}
for f in sorted(src.rglob("*.png")):
    im = Image.open(f).convert("RGB")
    if f.stem in CUT:
        small = im.resize((1080, 1920), Image.LANCZOS)
        a = np.asarray(small).astype(np.int16)
        bg = np.median(np.r_[a[0], a[-1], a[:, 0], a[:, -1]], axis=0)
        diff = np.abs(a - bg).max(axis=2)
        near = (diff < 22).astype(np.uint8) * 255
        m = Image.fromarray(near).copy()
        for seed in [(0, 0), (1079, 0), (0, 1919), (1079, 1919), (540, 0), (0, 960), (1079, 960)]:
            if m.getpixel(seed) == 255:
                ImageDraw.floodfill(m, seed, 128)
        bgmask = (np.asarray(m) == 128)
        # enclosed holes (between an arm and a bicycle frame): big patches of the exact background grey
        from scipy import ndimage
        lab, n = ndimage.label(diff < 9)
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        for i, s in enumerate(sizes, 1):
            if s > 1500:
                bgmask |= lab == i
        alpha = Image.fromarray((~bgmask).astype(np.uint8) * 255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
        out = small.convert("RGBA"); out.putalpha(alpha)
        out = out.crop(alpha.getbbox())
        out.save(prep / "photos" / f"{f.stem}.png")
        print("cut", f.stem, out.size)
    else:
        im.resize((1620, 2880), Image.LANCZOS).save(prep / "photos" / f"{f.stem}.jpg", quality=92)
        print("poster", f.stem)

print("done")
