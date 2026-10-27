"""Size the creator's Garbage Patch images for the edit (cut-outs to transparent PNG, scenes and textures to JPG).

    python3 -I tools/cut_garbagepatch_assets.py <folder with the images>

Props are keyed like West Indies (only the background touching the border, hole-filled); the creator's images came on
black, so the background colour is read from the corners and black or white is keyed to match. The bottle shards (gp13)
are split into one PNG per piece, left to right. For the magnifying glass (gp14) the enclosed white of the lens is
measured, so the edit can draw the microplastic inside it. Scenes and the texture stay JPG. Sizes are capped near how
big each one gets on screen at 4K. Writes public/garbagepatch/img/ and img_sizes.json; skips images that haven't
arrived.
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image, ImageFilter  # noqa: E402
from cut_westindies_assets import key  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "garbagepatch" / "img"
KEY = {"gp01_trash_island": 2400, "gp03_plastic_bottle": 1400, "gp04_plastic_crate": 900, "gp05_ghost_net": 1000, "gp06_plastic_bag": 900,
       "gp07_fishing_boat": 900, "gp08_cargo_ship": 1100, "gp09_airplane": 400, "gp10_sun": 1200, "gp11_water_drop": 300, "gp12_wave": 900,
       "gp14_magnifying_glass": 1100, "gp15_small_fish": 700, "gp16_big_fish": 700, "gp17_fish_thali": 900, "gp18_satellite": 1000,
       "gp19_map_pin": 500, "gp20_city_skyline": 700, "gp23_soup_bowl": 1500, "gp23b_ladle": 900, "gp25_shore_slope": 2000}
JPG = {"gp02_microplastic_texture": 2048, "gp21_soup_underwater": 2400, "gp22_soup_surface": 2400, "gp24_ocean_cutaway": 2880}


def key_black(im: Image.Image, cap: int = 2000, holes: bool = False) -> Image.Image:
    """Like `key`, for props on black: the near-black touching the border becomes transparent, with a soft 1–2 px edge.
    `holes` also clears big enclosed black gaps (the bag's handle)."""
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    dark = a.max(axis=2) < 12
    lab, _ = ndimage.label(dark)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ndimage.binary_fill_holes(~np.isin(lab, list(border)))
    if holes:
        sizes = ndimage.sum(dark, lab, range(1, lab.max() + 1))
        for i, n in enumerate(sizes, 1):
            if i not in border and n > dark.size * 2e-3:
                fg &= lab != i
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    return fit(out, cap)


def cut(im: Image.Image, cap: int, holes: bool = False) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    corners = [rgb.getpixel(p) for p in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
    return key_black(im, cap, holes) if np.mean([max(c) for c in corners]) < 40 else key(im, cap=cap)


def fit(im: Image.Image, cap: int) -> Image.Image:
    k = min(1.0, cap / max(im.size))
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1 else im


def find(src: Path, name: str) -> Path | None:
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        if (src / f"{name}{ext}").exists():
            return src / f"{name}{ext}"
    return None


def shards(im: Image.Image, cap: int = 600) -> list[Image.Image]:
    """The pieces of gp13, one image each (every separate shape bigger than 1% of the pieces' area), left to right."""
    a = np.asarray(im)[..., 3] > 128
    lab, k = ndimage.label(a)
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    keep = sorted([i + 1 for i in range(k) if sizes[i] > a.sum() * 0.01], key=lambda i: ndimage.find_objects(lab)[i - 1][1].start)
    out = []
    for i in keep:
        ys, xs = ndimage.find_objects(lab)[i - 1]
        piece = np.asarray(im).copy()
        piece[..., 3] = np.where(lab == i, piece[..., 3], 0)
        out.append(fit(Image.fromarray(piece).crop((xs.start, ys.start, xs.stop, ys.stop)), cap))
    return out


def lens(im: Image.Image) -> list[float]:
    """The magnifier's lens: the biggest empty (near-black or near-white) region inside the prop, as [cx, cy, r]
    fractions of the width."""
    a = np.asarray(im).astype(np.int16)
    white = ((a[..., :3].min(axis=2) > 225) | (a[..., :3].max(axis=2) < 14)) & (a[..., 3] > 200)
    lab, k = ndimage.label(white)
    if not k:
        return [0.36, 0.36, 0.3]
    i = int(np.argmax(ndimage.sum(white, lab, range(1, k + 1)))) + 1
    ys, xs = np.nonzero(lab == i)
    r = (np.sqrt(len(xs) / np.pi)) / im.width
    return [round(float(xs.mean()) / im.width, 4), round(float(ys.mean()) / im.width, 4), round(float(r), 4)]


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sp = ROOT / "public" / "garbagepatch" / "img_sizes.json"
    sizes = json.loads(sp.read_text()) if sp.exists() else {}
    for name, cap in KEY.items():
        f = find(src, name)
        if f:
            im = cut(Image.open(f), cap, holes=name == "gp06_plastic_bag")
            im.save(OUT / f"{name}.png", optimize=True)
            sizes[name] = {"w": im.width, "h": im.height}
            if name == "gp14_magnifying_glass":
                sizes[name]["lens"] = lens(im)
    f = find(src, "gp13_bottle_shards")
    if f:
        for i, p in enumerate(shards(cut(Image.open(f), 3000)), 1):
            p.save(OUT / f"gp13_shard_{i}.png", optimize=True)
            sizes[f"gp13_shard_{i}"] = {"w": p.width, "h": p.height}
    for name, cap in JPG.items():
        f = find(src, name)
        if f:
            im = fit(Image.open(f).convert("RGB"), cap)
            im.save(OUT / f"{name}.jpg", quality=90)
            sizes[name] = {"w": im.width, "h": im.height, "ext": "jpg"}
    sp.write_text(json.dumps(sizes, indent=0))
    print(sorted(sizes))


if __name__ == "__main__":
    main()
