"""Size the creator's Madeira images for the edit (cut-outs to transparent PNG, scenes and flames to JPG).

    python3 -I tools/cut_madeira_assets.py <folder with the PNGs>

Props on white are keyed like West Indies (only the white touching the border, hole-filled). The flames stay on black
(the edit screen-blends them). Photo cards are stored as JPG. Sizes are capped near how big each one gets on screen
at 4K. Writes public/madeira/img/ and img_sizes.json; skips images that haven't arrived.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image  # noqa: E402
from cut_westindies_assets import key  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "madeira" / "img"
KEY = {"md01_caravel": 1200, "md02_laurel_tree": 500, "md02b_laurel_tree_tall": 500, "md03_tree_burning": 500, "md05_title_madeira_wood": 1800,
       "md06_sugar_cane": 450, "md07_sugar_loaf": 300, "md08_settlers_boat": 800, "md11_wine_bottle": 1600, "md13_ronaldo_dribble": 1500,
       "md14_ronaldo_celebration": 1500, "md15_ronaldo_portrait": 1200, "md16_boy_funchal": 1300}
BLACK = {"md04_flame_a": 400, "md04b_flame_b": 400}
CARDS = {"md09_levada_forest": 1400, "md09b_levada_cliff": 1400, "md10_vineyard_terraces": 1400, "md12_madeira_paradise": 1400}


def fit(im: Image.Image, cap: int) -> Image.Image:
    k = min(1.0, cap / max(im.size))
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1 else im


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sp = ROOT / "public" / "madeira" / "img_sizes.json"
    sizes = json.loads(sp.read_text()) if sp.exists() else {}
    for name, cap in KEY.items():
        f = src / f"{name}.png"
        if f.exists():
            im = key(Image.open(f), cap=cap)
            im.save(OUT / f"{name}.png", optimize=True)
            sizes[name] = {"w": im.width, "h": im.height}
    for group in (BLACK, CARDS):
        for name, cap in group.items():
            f = src / f"{name}.png"
            if f.exists():
                im = Image.open(f).convert("RGB")
                if group is BLACK:
                    im = im.crop(Image.eval(im.convert("L"), lambda v: 255 if v > 14 else 0).getbbox())
                im = fit(im, cap)
                im.save(OUT / f"{name}.jpg", quality=92)
                sizes[name] = {"w": im.width, "h": im.height, "ext": "jpg"}
    sp.write_text(json.dumps(sizes))
    print(sorted(sizes))


if __name__ == "__main__":
    main()
