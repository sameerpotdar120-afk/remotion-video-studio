"""Prepare the creator's photoreal 3D prop images for the Siliguri Corridor v2 video.

    python3 -I tools/cut_siliguri2_assets.py <raw_dir>

Trims the transparent margin and scales the longest side to 1600 px (props are at most about 900 px on the 4K frame),
softened very slightly (fine texture crawls at 4K under a moving camera). Writes public/siliguri2/img/<name>.png and
src/malacca/edit/assets.ts (name -> aspect).
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "siliguri2" / "img"


def main() -> None:
    raw = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for f in sorted(raw.glob("*.png")):
        im = Image.open(f).convert("RGBA")
        box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        if box:
            pad = 20
            im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
        im.thumbnail((1600, 1600), Image.LANCZOS)
        rgb, a = im.convert("RGB").filter(ImageFilter.GaussianBlur(0.4)), im.getchannel("A")
        rgb.putalpha(a)
        rgb.save(OUT / f.name, optimize=True)
        meta[f.stem] = round(im.width / im.height, 4)
        print(f.stem, im.size)
    (ROOT / "src" / "siliguri2" / "edit" / "assets.ts").write_text(
        "// The creator's photoreal prop images in public/siliguri2/img (tools/cut_siliguri2_assets.py): name -> aspect (w/h).\n"
        f"export const ASPECT: Record<string, number> = {json.dumps(meta, indent=1)};\n")


if __name__ == "__main__":
    main()
