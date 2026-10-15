"""Cut out the Kolkata UE5 assets (white backgrounds) and file them by set and part.

    python3 -I tools/cut_kolkata_assets.py <dir with kN_part.png files> [more dirs...]

Each kN_part.png goes to public/kolkata/img/kN/part.png: background removed (rembg isnet-general-use, then any
remaining border-connected near-white trimmed), upscaled 2x with Lanczos and a light unsharp mask, cropped to the
object's alpha bbox with a small margin. Sizes go into public/kolkata/img_sizes.json as "kN/part": [w, h].
Prefer the original generations over pre-upscaled copies: the 2x step here is the same Lanczos, done once.
"""
import glob
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "kolkata" / "img"
SIZES = ROOT / "public" / "kolkata" / "img_sizes.json"
MAX_SIDE = 1800  # displayed at most ~1400 px tall in the 4K render


# Busy scenes with lots of thin detail and open space (a street with wires, a gothic facade, a banyan's canopy):
# rembg eats them, so these use a pure white key instead (only white that touches the border is removed).
WHITE_KEY = {"k1_street", "k16_court", "k4_banyan"}


def white_key(rgb: Image.Image) -> Image.Image:
    arr = np.asarray(rgb).astype(np.float32)
    dist = (255 - arr).max(axis=2)
    lab, _ = ndimage.label(dist < 22)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    # enclosed holes of pure backdrop white (between roots, under balconies) go too, if they are big enough
    lab2, n2 = ndimage.label((dist < 9) & ~bg)
    if n2:
        sizes = ndimage.sum(np.ones_like(dist), lab2, range(1, n2 + 1))
        bg |= np.isin(lab2, 1 + np.where(sizes > 900)[0])
    # soft edge: fade over the last few levels of near-white next to the background
    a = np.where(bg, 0.0, 255.0)
    near = ndimage.binary_dilation(bg, iterations=2) & ~bg
    a[near] = np.clip((dist[near] - 6) / 30, 0, 1) * 255
    out = rgb.copy()
    out.putalpha(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)))
    return out


def cut(im: Image.Image, sess, name: str = "") -> Image.Image:
    rgb = im.convert("RGB")
    if name in WHITE_KEY:
        return white_key(rgb)
    a = np.asarray(remove(rgb, session=sess, post_process_mask=True).split()[-1]).astype(np.float32)
    # also drop near-white regions that touch the border (rembg sometimes leaves a soft halo of the white backdrop)
    arr = np.asarray(rgb).astype(np.float32)
    white = (255 - arr).max(axis=2) < 14
    lab, _ = ndimage.label(white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    a[bg] = 0
    alpha = Image.fromarray(a.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    out = rgb.copy()
    out.putalpha(alpha)
    return out


def main() -> None:
    sess = new_session("isnet-general-use")
    sizes = json.loads(SIZES.read_text()) if SIZES.exists() else {}
    files = sorted(f for d in sys.argv[1:] for f in glob.glob(os.path.join(d, "k*_*.png")))
    for f in files:
        name = os.path.basename(f)[:-4]
        st, part = name.split("_", 1)
        im = cut(Image.open(f), sess, name)
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        rgb = im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        rgb.putalpha(im.split()[-1])
        im = rgb
        bb = im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox()
        if not bb:
            print("empty", name)
            continue
        m = 12
        im = im.crop((max(0, bb[0] - m), max(0, bb[1] - m), min(im.width, bb[2] + m), min(im.height, bb[3] + m)))
        if max(im.size) > MAX_SIDE:
            f2 = MAX_SIDE / max(im.size)
            im = im.resize((round(im.width * f2), round(im.height * f2)), Image.LANCZOS)
        (OUT / st).mkdir(parents=True, exist_ok=True)
        im.save(OUT / st / f"{part}.png", optimize=True)
        sizes[f"{st}/{part}"] = [im.width, im.height]
        print(name, im.size, flush=True)
    SIZES.write_text(json.dumps(dict(sorted(sizes.items())), indent=0))


if __name__ == "__main__":
    main()
