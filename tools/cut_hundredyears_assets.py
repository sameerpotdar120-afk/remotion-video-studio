"""Prepare the creator's Hundred Years' War images for the edit.

    python3 -I tools/cut_hundredyears_assets.py <folder with the PNGs>

The three 9:16 backgrounds become 2160×3840 JPEGs; the stake and pyre (on white) is keyed to a transparent PNG,
cropped and capped at 2000 px wide. Writes public/hundredyears/img/ and public/hundredyears/img_sizes.json.
"""
import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_thailand_assets import key_white  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hundredyears" / "img"


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name in ["h01_village_bg", "h02_battlefield_bg", "h03_town_square_bg"]:
        im = Image.open(src / f"{name}.png").convert("RGB").resize((2160, 3840), Image.LANCZOS)
        im.save(OUT / f"{name}.jpg", quality=92)
        sizes[name] = list(im.size)
    s = key_white(Image.open(src / "h04_stake_pyre.png"))
    s.save(OUT / "h04_stake_pyre.png", optimize=True)
    sizes["h04_stake_pyre"] = list(s.size)
    (ROOT / "public" / "hundredyears" / "img_sizes.json").write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
