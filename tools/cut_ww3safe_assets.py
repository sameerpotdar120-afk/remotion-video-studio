"""Cut out the World War 3 safe-countries UE5 assets (white backgrounds); copy the full-screen scenes.

    python3 -I tools/cut_ww3safe_assets.py public/ww3safe/img_raw

Props (wNN_name.png on white) → public/ww3safe/img/wNN_name.png: rembg isnet-general-use plus a border-connected
near-white trim (or a pure white key for thin, busy shapes), cropped to the alpha bbox, longest side at most 1600.
Scenes (w09–w11) → JPEG at 1440×2560. Sizes go into public/ww3safe/img_sizes.json.
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
OUT = ROOT / "public" / "ww3safe" / "img"
SIZES = ROOT / "public" / "ww3safe" / "img_sizes.json"
SCENES = {"w09_fiji_aerial", "w10_iceland_geothermal", "w11_nz_farm"}
WHITE = {"w02_palm_crown", "w04_wheat_bundle"}
MAX_SIDE = 1600


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sess = new_session("isnet-general-use")
    sizes = {}
    for f in sorted(glob.glob(os.path.join(sys.argv[1], "w*.png"))):
        name = os.path.basename(f)[:-4]
        im = Image.open(f)
        if name in SCENES:
            im.convert("RGB").resize((1440, 2560), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=92)
            sizes[name] = [1440, 2560]
            continue
        im = white_key(im.convert("RGB")) if name in WHITE else cut(im, sess, name)
        im = im.crop(im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox())
        k = min(1.0, MAX_SIDE / max(im.size))
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
