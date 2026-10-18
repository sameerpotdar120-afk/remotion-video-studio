"""Cut out the time zones assets (white backgrounds, 4K); copy the full-screen scene.

    python3 -I tools/cut_timezones_assets.py <raw_dir>

Characters, parts and landmarks (aNN_name.png on white) → public/timezones/img/aNN_name.png: rembg isnet-general-use
plus a border-connected near-white trim, cropped to the alpha bbox, longest side at most 2000 (3000 for the bush row),
enough for the 4K render. The tea-garden background → JPEG at 2160×3840. Sizes go into public/timezones/img_sizes.json.
"""
import glob
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_siliguri_assets import cut, white_key  # noqa: E402
from rembg import new_session  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "timezones" / "img"
SIZES = ROOT / "public" / "timezones" / "img_sizes.json"
SCENES = {"a07_tea_garden_bg"}
WHITE: set[str] = set()
MAX_SIDE = 2000
WIDE = {"a08_tea_bushes_fg": 3000}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sess = new_session("isnet-general-use")
    sizes = {}
    for f in sorted(glob.glob(os.path.join(sys.argv[1], "a*.png"))):
        name = os.path.basename(f)[:-4]
        im = Image.open(f)
        if name in SCENES:
            im.convert("RGB").resize((2160, 3840), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=92)
            sizes[name] = [2160, 3840]
            continue
        im = white_key(im.convert("RGB")) if name in WHITE else cut(im, sess, name)
        im = im.crop(im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox())
        k = min(1.0, WIDE.get(name, MAX_SIDE) / max(im.size))
        if k < 1:
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        pad = Image.new("RGBA", (im.width + 16, im.height + 16), (0, 0, 0, 0))
        pad.paste(im, (8, 8))
        pad.save(OUT / f"{name}.png")
        sizes[name] = list(pad.size)
        print(name, pad.size)
    SIZES.write_text(json.dumps(sizes, indent=1))


if __name__ == "__main__":
    main()
